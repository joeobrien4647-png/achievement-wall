/**
 * Parse a time string like "12:34:56" or "12:34" into total seconds.
 */
export function parseTime(str) {
  if (!str) return null;
  const parts = str.split(":").map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60;
  return null;
}

/**
 * Format total seconds into "Xh Ym" or "Xh Ym Zs".
 */
export function formatDuration(seconds) {
  if (seconds == null) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}min`;
  return `${h}h ${m}m`;
}

/**
 * Calculate pace in min/km. Returns seconds per km.
 */
export function calcPace(timeStr, distanceKm) {
  const totalSec = parseTime(timeStr);
  if (!totalSec || !distanceKm || distanceKm <= 0) return null;
  return totalSec / distanceKm;
}

/**
 * Format pace (seconds per km) into "X:XX /km".
 */
export function formatPace(secPerKm) {
  if (secPerKm == null) return null;
  const mins = Math.floor(secPerKm / 60);
  const secs = Math.round(secPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, "0")} /km`;
}
