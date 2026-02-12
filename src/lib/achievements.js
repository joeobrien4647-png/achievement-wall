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
