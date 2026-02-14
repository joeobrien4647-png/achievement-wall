/**
 * Achievement definitions and auto-unlock logic.
 *
 * Each achievement has a pure `check` function that receives
 * (stats, events, preferences) and returns a boolean.
 * `checkAchievements` compares results against the stored
 * `unlockedAchievements` array and returns only newly earned ones.
 */

import { computeStreaks } from "./streaks";

const achievements = [
  {
    id: "ach-first-blood",
    name: "First Blood",
    icon: "🩸",
    description: "Complete your first event",
    check: (stats) => stats.totalEvents >= 1,
  },
  {
    id: "ach-half-century",
    name: "Half Century",
    icon: "5️⃣",
    description: "Complete a 50km+ event in a single push",
    check: (_stats, events) =>
      events.some((e) => e.status === "completed" && e.distance >= 50),
  },
  {
    id: "ach-century-club",
    name: "Century Club",
    icon: "💯",
    description: "Complete a 100km+ event — welcome to the club",
    check: (_stats, events) =>
      events.some((e) => e.status === "completed" && e.distance >= 100),
  },
  {
    id: "ach-peak-bagger",
    name: "Peak Bagger",
    icon: "⛰️",
    description: "Summit 5+ different peaks across all events",
    check: (_stats, events) => {
      const allPeaks = new Set();
      for (const e of events) {
        if (e.status === "completed" && e.peaks) {
          for (const p of e.peaks) allPeaks.add(p);
        }
      }
      return allPeaks.size >= 5;
    },
  },
  {
    id: "ach-type-collector",
    name: "Type Collector",
    icon: "🎨",
    description: "Complete events in all 3 types: Mountain, Ultra, Urban",
    check: (_stats, events) => {
      const types = new Set(
        events.filter((e) => e.status === "completed").map((e) => e.type)
      );
      return types.has("Mountain") && types.has("Ultra") && types.has("Urban");
    },
  },
  {
    id: "ach-streak-machine",
    name: "Streak Machine",
    icon: "🔥",
    description: "Build a 4+ week training streak",
    check: (_stats, _events, prefs) => {
      const checkins = prefs?.weeklyCheckins ?? [];
      const { longest } = computeStreaks(checkins);
      return longest >= 4;
    },
  },
  {
    id: "ach-repeat-offender",
    name: "Repeat Offender",
    icon: "🔁",
    description: "Complete the same event 3 or more times",
    check: (_stats, events) =>
      events.some((e) => e.status === "completed" && (e.completions || 1) >= 3),
  },
  {
    id: "ach-high-roller",
    name: "High Roller",
    icon: "🎲",
    description: "Complete a difficulty 5 event",
    check: (_stats, events) =>
      events.some((e) => e.status === "completed" && e.difficulty === 5),
  },
  {
    id: "ach-distance-king",
    name: "Distance King",
    icon: "👑",
    description: "Accumulate 500km total distance",
    check: (stats) => stats.totalDistance >= 500,
  },
  {
    id: "ach-elevation-master",
    name: "Elevation Master",
    icon: "🏔️",
    description: "Accumulate 5,000m total elevation gain",
    check: (stats) => stats.totalElevation >= 5000,
  },
  {
    id: "ach-night-owl",
    name: "Night Owl",
    icon: "🌙",
    description: "Complete a 100km+ event (implies walking through the night)",
    check: (_stats, events) =>
      events.some((e) => e.status === "completed" && e.distance >= 100),
  },
  {
    id: "ach-bucket-lister",
    name: "Bucket Lister",
    icon: "📋",
    description: "Promote 3+ wishlist challenges to upcoming or completed",
    check: (_stats, events) => {
      const promoted = events.filter(
        (e) =>
          e.id.startsWith("wish-") &&
          (e.status === "upcoming" || e.status === "completed")
      );
      return promoted.length >= 3;
    },
  },

  // ─── Challenge Chains ─────────────────────────────────
  {
    id: "chain-3-peaks",
    name: "Three Peaks Master",
    icon: "🏔️",
    description: "Complete the Yorkshire, National, and Welsh 3 Peaks",
    check: (_stats, events) => {
      const done = new Set(
        events.filter((e) => e.status === "completed").map((e) => e.id)
      );
      return done.has("y3p-001") && done.has("n3p-004") && done.has("wish-w3pk0");
    },
  },
  {
    id: "chain-bg-trilogy",
    name: "Bob Graham Trilogy",
    icon: "👑",
    description: "Complete the Bob Graham, Paddy Buckley, and Ramsay Rounds",
    check: (_stats, events) => {
      const done = new Set(
        events.filter((e) => e.status === "completed").map((e) => e.id)
      );
      return (
        done.has("wish-bgr00") && done.has("wish-paddy") && done.has("wish-ramsy")
      );
    },
  },
  {
    id: "chain-london-underground",
    name: "London Underground",
    icon: "🚇",
    description: "Complete 3 or more tube line walks",
    check: (_stats, events) => {
      const tubePrefixes = [
        "wish-piccl", "wish-centl", "wish-bakrl", "wish-jubll",
        "wish-nrthl", "wish-victo", "wish-distr", "wish-metrl",
        "wish-circl", "wish-hammr",
      ];
      const completed = events.filter(
        (e) => e.status === "completed" && tubePrefixes.some((p) => e.id.startsWith(p))
      );
      return completed.length >= 3;
    },
  },
  {
    id: "chain-coast-to-coast",
    name: "Coast to Coast",
    icon: "🌊",
    description: "Complete Hadrian's Wall and the Coast to Coast Walk",
    check: (_stats, events) => {
      const done = new Set(
        events.filter((e) => e.status === "completed").map((e) => e.id)
      );
      return done.has("wish-hadri") && done.has("wish-c2c00");
    },
  },
  {
    id: "chain-lake-district",
    name: "Lake District Legend",
    icon: "⛰️",
    description: "Summit Helvellyn, Great Gable, Skiddaw, and Blencathra",
    check: (_stats, events) => {
      const done = new Set(
        events.filter((e) => e.status === "completed").map((e) => e.id)
      );
      return (
        done.has("wish-helve") &&
        done.has("wish-grgab") &&
        done.has("wish-skidd") &&
        done.has("wish-shrpe")
      );
    },
  },
  {
    id: "chain-scottish-explorer",
    name: "Scottish Explorer",
    icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    description: "Complete the West Highland Way, Rob Roy Way, and Speyside Way",
    check: (_stats, events) => {
      const done = new Set(
        events.filter((e) => e.status === "completed").map((e) => e.id)
      );
      return (
        done.has("wish-whw00") && done.has("wish-rroyw") && done.has("wish-speyw")
      );
    },
  },
];

/**
 * Check all achievements against current state.
 * Returns an array of newly unlocked achievement objects
 * (achievements that pass their check but aren't yet in
 * the stored `unlockedAchievements` list).
 */
export function checkAchievements(stats, events, preferences) {
  const alreadyUnlocked = new Set(
    (preferences?.unlockedAchievements ?? []).map((a) => a.id)
  );

  const newlyUnlocked = [];

  for (const ach of achievements) {
    if (alreadyUnlocked.has(ach.id)) continue;

    try {
      if (ach.check(stats, events, preferences)) {
        newlyUnlocked.push({
          id: ach.id,
          name: ach.name,
          icon: ach.icon,
          description: ach.description,
          unlockedAt: new Date().toISOString(),
        });
      }
    } catch {
      // Swallow check errors — don't block the app
    }
  }

  return newlyUnlocked;
}

/** All achievement definitions (for display on badge pages, etc.) */
export { achievements };
