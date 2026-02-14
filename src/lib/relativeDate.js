const UNITS = [
  { max: 60, divisor: 1, unit: "second" },
  { max: 3600, divisor: 60, unit: "minute" },
  { max: 86400, divisor: 3600, unit: "hour" },
  { max: 604800, divisor: 86400, unit: "day" },
  { max: 2592000, divisor: 604800, unit: "week" },
  { max: 31536000, divisor: 2592000, unit: "month" },
  { divisor: 31536000, unit: "year" },
];

export function relativeDate(dateStr) {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";

  const diffSec = Math.abs(Math.round((now - then) / 1000));
  const isFuture = then > now;

  if (diffSec < 10) return "just now";

  for (const { max, divisor, unit } of UNITS) {
    if (max && diffSec >= max) continue;
    const value = Math.round(diffSec / divisor);
    const plural = value !== 1 ? "s" : "";
    return isFuture
      ? `in ${value} ${unit}${plural}`
      : `${value} ${unit}${plural} ago`;
  }
  return "";
}

// Format as "3 Mar 2024" with optional relative suffix
export function formatDateWithRelative(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const formatted = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const rel = relativeDate(dateStr);
  return rel ? `${formatted} (${rel})` : formatted;
}
