export function daysUntil(dateString) {
  if (!dateString) return null;
  const target = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export function countdownLabel(days) {
  if (days === null) return null;
  if (days < 0) return "Awaiting results";
  if (days === 0) return "Event day!";
  if (days === 1) return "Tomorrow!";
  return `${days} days to go`;
}
