// Simplified UK outline as SVG path (viewBox 0 0 100 100)
export const UK_OUTLINE = "M 48 5 C 44 8, 40 10, 38 14 C 36 18, 34 20, 36 24 C 32 22, 28 24, 30 28 C 28 30, 30 32, 32 34 C 30 36, 32 38, 34 36 C 36 38, 34 40, 36 42 C 38 44, 40 42, 42 44 C 44 46, 42 48, 44 50 C 42 52, 40 54, 42 56 C 40 58, 42 60, 44 58 C 46 60, 44 62, 46 64 C 48 66, 50 64, 52 66 C 54 68, 52 70, 54 72 C 56 74, 58 72, 58 76 C 60 78, 56 80, 58 82 C 56 84, 54 82, 52 84 C 50 82, 48 84, 50 86 C 52 88, 54 86, 56 84 C 58 82, 60 80, 62 78 C 64 76, 62 74, 64 72 C 66 70, 64 68, 62 66 C 64 64, 62 62, 60 60 C 62 58, 60 56, 58 54 C 60 52, 58 50, 56 48 C 58 46, 56 44, 54 42 C 56 40, 54 38, 52 36 C 54 34, 52 32, 50 30 C 52 28, 54 26, 52 24 C 54 22, 52 20, 50 18 C 52 16, 54 14, 52 12 C 50 10, 48 8, 48 5 Z";

// Known locations: x/y for SVG, lat/lon for Leaflet
export const LOCATIONS = {
  "yorkshire dales":     { x: 50, y: 42, lat: 54.23, lon: -2.16 },
  "yorkshire":           { x: 50, y: 42, lat: 54.0, lon: -1.5 },
  "fort william":        { x: 38, y: 22, lat: 56.82, lon: -5.11 },
  "scotland":            { x: 40, y: 20, lat: 56.49, lon: -4.20 },
  "south downs":         { x: 56, y: 72, lat: 50.92, lon: -0.78 },
  "south downs way":     { x: 56, y: 72, lat: 50.92, lon: -0.78 },
  "london":              { x: 58, y: 68, lat: 51.51, lon: -0.13 },
  "lake district":       { x: 44, y: 38, lat: 54.46, lon: -3.09 },
  "brighton":            { x: 56, y: 76, lat: 50.82, lon: -0.14 },
  "peak district":       { x: 50, y: 48, lat: 53.35, lon: -1.80 },
  "snowdonia":           { x: 38, y: 50, lat: 53.07, lon: -3.93 },
  "brecon beacons":      { x: 40, y: 58, lat: 51.88, lon: -3.44 },
  "pennines":            { x: 48, y: 40, lat: 54.50, lon: -2.30 },
  "dartmoor":            { x: 38, y: 74, lat: 50.57, lon: -3.92 },
  "edinburgh":           { x: 46, y: 26, lat: 55.95, lon: -3.19 },
  "manchester":          { x: 46, y: 48, lat: 53.48, lon: -2.24 },
  "birmingham":          { x: 50, y: 56, lat: 52.49, lon: -1.89 },
  "bristol":             { x: 44, y: 64, lat: 51.45, lon: -2.59 },
  "cardiff":             { x: 40, y: 64, lat: 51.48, lon: -3.18 },
  "norfolk":             { x: 66, y: 54, lat: 52.77, lon: 1.22 },
  "suffolk":             { x: 66, y: 58, lat: 52.19, lon: 1.01 },
  // Additional UK
  "north york moors":    { x: 54, y: 40, lat: 54.38, lon: -0.97 },
  "isle of wight":       { x: 54, y: 76, lat: 50.69, lon: -1.30 },
  "dorset":              { x: 46, y: 76, lat: 50.74, lon: -2.34 },
  "winchester":          { x: 52, y: 72, lat: 51.06, lon: -1.31 },
  "eastbourne":          { x: 58, y: 76, lat: 50.77, lon: 0.28 },
  "chipping campden":    { x: 48, y: 60, lat: 52.05, lon: -1.78 },
  "bath":                { x: 44, y: 66, lat: 51.38, lon: -2.36 },
  "henley":              { x: 56, y: 66, lat: 51.53, lon: -0.90 },
  "ridgeway":            { x: 52, y: 66, lat: 51.57, lon: -1.57 },
  "cornwall":            { x: 34, y: 78, lat: 50.27, lon: -5.05 },
  "milngavie":           { x: 42, y: 24, lat: 55.94, lon: -4.31 },
  "wallsend":            { x: 50, y: 34, lat: 54.99, lon: -1.53 },
  "carlisle":            { x: 44, y: 34, lat: 54.89, lon: -2.94 },
  "st bees":             { x: 40, y: 38, lat: 54.49, lon: -3.59 },
  "edale":               { x: 48, y: 48, lat: 53.37, lon: -1.82 },
  "ilkley":              { x: 48, y: 44, lat: 53.92, lon: -1.82 },
  "ulverston":           { x: 42, y: 40, lat: 54.19, lon: -3.10 },
  "inverness":           { x: 40, y: 18, lat: 57.48, lon: -4.22 },
  "cairngorms":          { x: 42, y: 20, lat: 57.07, lon: -3.64 },
  "minehead":            { x: 38, y: 68, lat: 51.20, lon: -3.47 },
  "poole":               { x: 46, y: 78, lat: 50.72, lon: -1.98 },
  "liverpool":           { x: 42, y: 48, lat: 53.41, lon: -2.98 },
  // International
  "chamonix":            { lat: 45.92, lon: 6.87 },
  "france":              { lat: 46.60, lon: 2.35 },
  "spain":               { lat: 42.88, lon: -8.54 },
  "santiago":            { lat: 42.88, lon: -8.54 },
  "nepal":               { lat: 27.99, lon: 86.83 },
  "lukla":               { lat: 27.69, lon: 86.73 },
  "tanzania":            { lat: -3.07, lon: 37.35 },
  "kilimanjaro":         { lat: -3.07, lon: 37.35 },
  "corsica":             { lat: 42.15, lon: 9.10 },
  "iceland":             { lat: 64.14, lon: -21.90 },
  "peru":                { lat: -13.16, lon: -72.55 },
  "machu picchu":        { lat: -13.16, lon: -72.55 },
  "patagonia":           { lat: -51.00, lon: -73.00 },
  "chile":               { lat: -51.00, lon: -73.00 },
  "switzerland":         { lat: 46.02, lon: 7.75 },
  "zermatt":             { lat: 46.02, lon: 7.75 },
  "sweden":              { lat: 67.86, lon: 20.22 },
  "lapland":             { lat: 67.86, lon: 20.22 },
  "new zealand":         { lat: -43.59, lon: 170.14 },
  "tasmania":            { lat: -42.00, lon: 146.00 },
  "australia":           { lat: -42.00, lon: 146.00 },
  "turkey":              { lat: 36.63, lon: 29.13 },
  "jordan":              { lat: 30.33, lon: 35.44 },
  "norway":              { lat: 61.40, lon: 6.84 },
  "japan":               { lat: 36.25, lon: 137.90 },
  "morocco":             { lat: 31.06, lon: -7.86 },
  "atlas mountains":     { lat: 31.06, lon: -7.86 },
  "sahara":              { lat: 31.50, lon: -4.00 },
  "california":          { lat: 37.74, lon: -119.57 },
  "yosemite":            { lat: 37.74, lon: -119.57 },
  "italy":               { lat: 45.83, lon: 6.86 },
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
