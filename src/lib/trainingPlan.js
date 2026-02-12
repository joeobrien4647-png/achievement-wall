/**
 * Auto-generates a periodised training plan based on event characteristics.
 *
 * The plan scales across three dimensions:
 *   - distance  → total weeks & weekly km targets
 *   - difficulty → build phase length (harder = longer adaptation)
 *   - type       → phase-specific notes (mountain: elevation work, urban: pavement conditioning)
 */

// ── Helpers ────────────────────────────────────────────────────────────

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function weeksFromDistance(distance) {
  if (!distance || distance <= 20) return 8;
  if (distance <= 50) return 10;
  if (distance <= 100) return 12;
  if (distance <= 200) return 14;
  return 16;
}

function weeksFromDifficulty(difficulty) {
  // difficulty is 1–5; harder events earn extra weeks
  const d = clamp(difficulty ?? 3, 1, 5);
  if (d <= 2) return -1; // shave a week for easy events
  if (d >= 5) return 2;  // add two weeks for brutal events
  if (d >= 4) return 1;
  return 0;
}

function peakWeeklyKm(distance) {
  if (!distance || distance <= 20) return 25;
  if (distance <= 50) return 40;
  if (distance <= 100) return 60;
  if (distance <= 200) return 80;
  return 100;
}

// ── Phase allocation ───────────────────────────────────────────────────

function allocatePhases(totalWeeks, difficulty) {
  // Taper is always 1–2 weeks
  const taper = totalWeeks >= 12 ? 2 : 1;
  // Peak is 1–2 weeks
  const peak = totalWeeks >= 10 ? 2 : 1;
  // Remaining split between base & build, skewed by difficulty
  const remaining = totalWeeks - taper - peak;
  const buildRatio = difficulty >= 4 ? 0.55 : 0.45;
  const build = Math.round(remaining * buildRatio);
  const base = remaining - build;

  return { base, build, peak, taper };
}

// ── Type-specific notes ────────────────────────────────────────────────

function typeNotes(type, phase) {
  const isMount = type === "Mountain";
  const isUrban = type === "Urban";

  const notes = {
    base: isMount
      ? "Include hill repeats 1x per week to build ascending strength"
      : isUrban
        ? "Alternate between park trails and pavement to condition joints"
        : "Focus on time-on-feet over speed; mix terrain types",
    build: isMount
      ? "Add sustained climbs; practice descent technique on tired legs"
      : isUrban
        ? "Long pavement sessions — train your feet for concrete impact"
        : "Back-to-back long days to simulate event fatigue",
    peak: isMount
      ? "Full-elevation dress rehearsal on similar terrain"
      : isUrban
        ? "Full-distance city walk at target pace with race-day kit"
        : "Event-simulation day: full kit, nutrition plan, target pace",
    taper: "Reduce volume 40-60%. Keep intensity with short sharp sessions. Rest is training.",
  };

  return notes[phase] || "";
}

// ── Phase descriptions ─────────────────────────────────────────────────

const PHASE_META = {
  base: {
    name: "Base Phase",
    description: "Build your aerobic engine and movement habit. Consistent easy volume, no heroics.",
  },
  build: {
    name: "Build Phase",
    description: "Increase distance and specificity. Train the demands your event will throw at you.",
  },
  peak: {
    name: "Peak Phase",
    description: "Hit your highest training volume. Dress rehearsals and confidence-building sessions.",
  },
  taper: {
    name: "Taper",
    description: "Reduce volume, maintain sharpness. Trust the work you've done. Arrive fresh.",
  },
};

// ── Weekly plan builder ────────────────────────────────────────────────

function buildWeeklyPlan(phases, peakKm, type, elevation) {
  const plan = [];
  let weekNum = 0;

  const phaseEntries = [
    { key: "base", weeks: phases.base },
    { key: "build", weeks: phases.build },
    { key: "peak", weeks: phases.peak },
    { key: "taper", weeks: phases.taper },
  ];

  for (const { key, weeks } of phaseEntries) {
    for (let i = 0; i < weeks; i++) {
      weekNum++;
      const progress = i / weeks; // 0 → ~1 within the phase

      let targetKm;
      switch (key) {
        case "base":
          // Ramp from 30% to 55% of peak km
          targetKm = Math.round(peakKm * (0.3 + 0.25 * progress));
          break;
        case "build":
          // Ramp from 55% to 90% of peak km with a deload every 3rd week
          targetKm = Math.round(peakKm * (0.55 + 0.35 * progress));
          if ((i + 1) % 3 === 0) targetKm = Math.round(targetKm * 0.7); // deload
          break;
        case "peak":
          // 90–100% of peak km
          targetKm = Math.round(peakKm * (0.9 + 0.1 * progress));
          break;
        case "taper":
          // Drop from 60% down to 30%
          targetKm = Math.round(peakKm * (0.6 - 0.3 * progress));
          break;
        default:
          targetKm = Math.round(peakKm * 0.5);
      }

      const focusMap = {
        base: i === 0 ? "Easy walks 3x, establish rhythm" : `Easy volume — ${3 + Math.min(i, 2)}x sessions`,
        build: (i + 1) % 3 === 0 ? "Deload week — recover and absorb" : `Long day + ${2 + Math.min(i, 2)} shorter sessions`,
        peak: i === 0 ? "Highest volume week — dress rehearsal" : "Maintain peak load, fine-tune pacing",
        taper: i === 0 ? "Reduce to 60% volume, keep legs ticking" : "Light movement only — trust the training",
      };

      const elevationNote = elevation && key !== "taper"
        ? ` Include ${Math.round(elevation * (0.2 + 0.2 * progress))}m elevation gain.`
        : "";

      plan.push({
        week: weekNum,
        phase: PHASE_META[key].name,
        focus: focusMap[key],
        targetKm,
        notes: typeNotes(type, key) + elevationNote,
      });
    }
  }

  return plan;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Generate a periodised training plan from an event object.
 *
 * @param {Object} event - must have: distance, difficulty, type; optionally: elevation
 * @returns {{ totalWeeks, phases, weeklyPlan }}
 */
export function generateTrainingPlan(event) {
  const distance = event.distance ?? 0;
  const difficulty = clamp(event.difficulty ?? 3, 1, 5);
  const type = event.type || "Ultra";
  const elevation = event.elevation ?? null;

  // Determine total weeks (8–16)
  const rawWeeks = weeksFromDistance(distance) + weeksFromDifficulty(difficulty);
  const totalWeeks = clamp(rawWeeks, 8, 16);

  // Allocate weeks to phases
  const allocation = allocatePhases(totalWeeks, difficulty);

  // Build structured phases array
  const phases = [
    { ...PHASE_META.base, weeks: allocation.base },
    { ...PHASE_META.build, weeks: allocation.build },
    { ...PHASE_META.peak, weeks: allocation.peak },
    { ...PHASE_META.taper, weeks: allocation.taper },
  ];

  // Build week-by-week plan
  const peakKm = peakWeeklyKm(distance);
  const weeklyPlan = buildWeeklyPlan(allocation, peakKm, type, elevation);

  return { totalWeeks, phases, weeklyPlan };
}
