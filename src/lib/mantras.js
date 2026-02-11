/**
 * Daily mantra rotation and context-aware motivation.
 */

/**
 * Get today's mantra using a date-seeded index.
 * Changes once per calendar day, cycles through the array.
 */
export function getDailyMantra(mantras) {
  if (!mantras || mantras.length === 0) return null;
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const seed = today.getFullYear() * 366 + dayOfYear;
  return mantras[seed % mantras.length];
}

/**
 * Get context-aware motivational message.
 * Priority: event countdown (<=7 days) > streak acknowledgment (>4 weeks) > null.
 */
export function getContextMessage(daysToEvent, eventName, streakWeeks) {
  if (daysToEvent !== null && daysToEvent >= 0 && daysToEvent <= 7) {
    if (daysToEvent === 0) return `Today is the day. Go crush ${eventName}.`;
    if (daysToEvent === 1) return `Tomorrow you face ${eventName}. You're ready.`;
    return `${daysToEvent} days until ${eventName}. Trust your training.`;
  }

  if (streakWeeks > 4) {
    return `${streakWeeks} weeks consistent. You're building something unbreakable.`;
  }

  return null;
}
