/**
 * Theme utilities for accent color and light/dark mode.
 *
 * Accent color is stored as a hex string in preferences.accentColor.
 * We derive shades using opacity for consistency.
 */

export const ACCENT_PRESETS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Orange", hex: "#f97316" },
];

/**
 * Apply accent color as CSS custom properties on documentElement.
 */
export function applyAccentColor(hex) {
  const root = document.documentElement;
  root.style.setProperty("--accent", hex);
  root.style.setProperty("--accent-10", hex + "1a"); // 10% opacity
  root.style.setProperty("--accent-20", hex + "33"); // 20% opacity
  root.style.setProperty("--accent-30", hex + "4d"); // 30% opacity
}

/**
 * Apply light mode class to documentElement.
 */
export function applyLightMode(enabled) {
  document.documentElement.classList.toggle("light-mode", enabled);
}
