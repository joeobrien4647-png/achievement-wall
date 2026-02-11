// Simplified UK outline as SVG path (viewBox 0 0 100 100)
export const UK_OUTLINE = "M 48 5 C 44 8, 40 10, 38 14 C 36 18, 34 20, 36 24 C 32 22, 28 24, 30 28 C 28 30, 30 32, 32 34 C 30 36, 32 38, 34 36 C 36 38, 34 40, 36 42 C 38 44, 40 42, 42 44 C 44 46, 42 48, 44 50 C 42 52, 40 54, 42 56 C 40 58, 42 60, 44 58 C 46 60, 44 62, 46 64 C 48 66, 50 64, 52 66 C 54 68, 52 70, 54 72 C 56 74, 58 72, 58 76 C 60 78, 56 80, 58 82 C 56 84, 54 82, 52 84 C 50 82, 48 84, 50 86 C 52 88, 54 86, 56 84 C 58 82, 60 80, 62 78 C 64 76, 62 74, 64 72 C 66 70, 64 68, 62 66 C 64 64, 62 62, 60 60 C 62 58, 60 56, 58 54 C 60 52, 58 50, 56 48 C 58 46, 56 44, 54 42 C 56 40, 54 38, 52 36 C 54 34, 52 32, 50 30 C 52 28, 54 26, 52 24 C 54 22, 52 20, 50 18 C 52 16, 54 14, 52 12 C 50 10, 48 8, 48 5 Z";

// Known location coordinates (x, y in viewBox 0-100)
export const LOCATIONS = {
  "yorkshire dales":     { x: 50, y: 42 },
  "yorkshire":           { x: 50, y: 42 },
  "fort william":        { x: 38, y: 22 },
  "scotland":            { x: 40, y: 20 },
  "south downs":         { x: 56, y: 72 },
  "south downs way":     { x: 56, y: 72 },
  "london":              { x: 58, y: 68 },
  "lake district":       { x: 44, y: 38 },
  "brighton":            { x: 56, y: 76 },
  "peak district":       { x: 50, y: 48 },
  "snowdonia":           { x: 38, y: 50 },
  "brecon beacons":      { x: 40, y: 58 },
  "pennines":            { x: 48, y: 40 },
  "dartmoor":            { x: 38, y: 74 },
  "edinburgh":           { x: 46, y: 26 },
  "manchester":          { x: 46, y: 48 },
  "birmingham":          { x: 50, y: 56 },
  "bristol":             { x: 44, y: 64 },
  "cardiff":             { x: 40, y: 64 },
  "norfolk":             { x: 66, y: 54 },
  "suffolk":             { x: 66, y: 58 },
};

export function matchLocation(locationStr) {
  if (!locationStr) return null;
  const lower = locationStr.toLowerCase();

  // Direct match
  if (LOCATIONS[lower]) return LOCATIONS[lower];

  // Substring match — find longest matching key
  let best = null;
  let bestLen = 0;
  for (const [key, coords] of Object.entries(LOCATIONS)) {
    if (lower.includes(key) && key.length > bestLen) {
      best = coords;
      bestLen = key.length;
    }
  }
  return best;
}
