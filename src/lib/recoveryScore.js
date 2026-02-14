/**
 * Recovery score calculator.
 *
 * Analyzes gaps between events and training load to assess recovery status.
 * Returns a traffic-light score: green (fresh), amber (moderate), red (fatigued).
 */

/**
 * Compute recovery metrics from completed events.
 * @param {Array} events — all events (we filter to completed with dates)
 * @returns {{ score: 'fresh'|'moderate'|'fatigued', daysSinceLast: number, avgGap: number, recentLoad: number, message: string }}
 */
export function computeRecovery(events) {
  const completed = events
    .filter((e) => e.status === "completed" && e.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (completed.length === 0) {
    return { score: "fresh", daysSinceLast: null, avgGap: null, recentLoad: 0, message: "No events logged yet" };
  }

  const now = new Date();
  const lastEvent = completed[completed.length - 1];
  const lastDate = new Date(lastEvent.date);
  const daysSinceLast = Math.floor((now - lastDate) / 86400000);

  // Average gap between events
  const gaps = [];
  for (let i = 1; i < completed.length; i++) {
    const gap = (new Date(completed[i].date) - new Date(completed[i - 1].date)) / 86400000;
    if (gap > 0) gaps.push(gap);
  }
  const avgGap = gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;

  // Recent training load (last 30 days) — weighted by difficulty and distance
  const thirtyDaysAgo = new Date(now - 30 * 86400000);
  const recentEvents = completed.filter((e) => new Date(e.date) >= thirtyDaysAgo);
  const recentLoad = recentEvents.reduce((sum, e) => {
    const distLoad = (e.distance || 10) / 10; // normalize: 10km = 1.0
    const diffLoad = (e.difficulty || 3) / 3; // normalize: 3/5 = 1.0
    return sum + distLoad * diffLoad;
  }, 0);

  // Score logic
  let score, message;
  if (daysSinceLast <= 3) {
    score = "fatigued";
    message = `Only ${daysSinceLast} day${daysSinceLast !== 1 ? "s" : ""} since your last event — allow recovery`;
  } else if (daysSinceLast <= 7 && recentLoad > 3) {
    score = "fatigued";
    message = "High recent load with short recovery — ease off";
  } else if (daysSinceLast <= 14 || recentLoad > 2) {
    score = "moderate";
    message = `${daysSinceLast} days since last event — building back up`;
  } else {
    score = "fresh";
    message = `${daysSinceLast} days recovered — you're ready to go`;
  }

  return { score, daysSinceLast, avgGap, recentLoad: Math.round(recentLoad * 10) / 10, message };
}
