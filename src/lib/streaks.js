/**
 * Weekly training check-in and streak computation.
 * All dates are Monday-anchored (ISO 8601 weeks).
 */

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const DST_TOLERANCE = 1000 * 60 * 60; // 1 hour for DST shifts

/** Get the Monday of the ISO week containing the given date. */
export function getWeekMonday(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

/** Format a Date as "YYYY-MM-DD". */
export function toISODate(date) {
  return date.toISOString().split("T")[0];
}

/** Check if the user has already checked in for the current calendar week. */
export function hasCheckedInThisWeek(checkins) {
  if (!checkins || checkins.length === 0) return false;
  return checkins.includes(toISODate(getWeekMonday()));
}

/** Add a check-in for the current week. Returns new array (idempotent). */
export function addCheckin(checkins) {
  const thisMonday = toISODate(getWeekMonday());
  if (checkins.includes(thisMonday)) return checkins;
  return [...checkins, thisMonday].sort();
}

/**
 * Compute current streak and longest streak from check-in dates.
 * A streak is consecutive calendar weeks with check-ins.
 */
export function computeStreaks(checkins) {
  if (!checkins || checkins.length === 0) return { current: 0, longest: 0 };

  const sorted = [...new Set(checkins)].sort();
  const mondayTimes = sorted.map((s) => new Date(s).getTime());

  // Compute longest streak
  let longest = 1;
  let streak = 1;
  for (let i = 1; i < mondayTimes.length; i++) {
    const gap = mondayTimes[i] - mondayTimes[i - 1];
    if (Math.abs(gap - ONE_WEEK) < DST_TOLERANCE) {
      streak++;
    } else {
      streak = 1;
    }
    longest = Math.max(longest, streak);
  }

  // Compute current streak (walk backwards from most recent check-in)
  const nowTime = getWeekMonday().getTime();
  const lastCheckin = mondayTimes[mondayTimes.length - 1];
  const gapFromNow = nowTime - lastCheckin;

  if (gapFromNow > ONE_WEEK + DST_TOLERANCE) {
    return { current: 0, longest };
  }

  let current = 1;
  for (let i = mondayTimes.length - 2; i >= 0; i--) {
    const gap = mondayTimes[i + 1] - mondayTimes[i];
    if (Math.abs(gap - ONE_WEEK) < DST_TOLERANCE) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest };
}

/**
 * Generate heatmap data for the last 52 weeks.
 * Returns array of 52 objects ordered oldest-to-newest.
 */
export function generateHeatmapData(checkins, events) {
  const now = getWeekMonday();
  const checkinSet = new Set(checkins || []);

  // Build set of weeks containing a completed event
  const eventWeeks = new Set();
  if (events) {
    events
      .filter((e) => e.status === "completed" && e.date)
      .forEach((e) => eventWeeks.add(toISODate(getWeekMonday(new Date(e.date)))));
  }

  const weeks = [];
  for (let i = 51; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = toISODate(d);
    weeks.push({
      weekMonday: key,
      checkedIn: checkinSet.has(key),
      hasEvent: eventWeeks.has(key),
    });
  }

  return weeks;
}
