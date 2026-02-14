/**
 * GPX file parser.
 * Extracts track points from GPX XML and computes distance,
 * elevation gain, elevation profile, and geographic bounds.
 *
 * Pure functions, no dependencies -- uses the browser's DOMParser.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians.
 */
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine distance between two lat/lon points, in kilometres.
 */
function haversine(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Extract track points from a parsed GPX document.
 * Handles both <trk><trkseg><trkpt> and <rte><rtept> formats.
 * Returns an array of { lat, lon, ele } objects.
 */
function extractPoints(doc) {
  // Try track points first (most common GPX format)
  let pointEls = doc.querySelectorAll("trk > trkseg > trkpt");

  // Fall back to route points
  if (pointEls.length === 0) {
    pointEls = doc.querySelectorAll("rte > rtept");
  }

  const points = [];
  for (const el of pointEls) {
    const lat = parseFloat(el.getAttribute("lat"));
    const lon = parseFloat(el.getAttribute("lon"));
    if (isNaN(lat) || isNaN(lon)) continue;

    const eleEl = el.querySelector("ele");
    const ele = eleEl ? parseFloat(eleEl.textContent) : null;

    points.push({ lat, lon, ele: isNaN(ele) ? null : ele });
  }

  return points;
}

/**
 * Compute geographic bounding box from an array of { lat, lon } points.
 */
function computeBounds(points) {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const { lat, lon } of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }

  return { minLat, maxLat, minLon, maxLon };
}

/**
 * Parse GPX XML text and extract route data.
 *
 * @param {string} fileText  Raw GPX XML string
 * @returns {{
 *   distance: number,
 *   elevationGain: number,
 *   elevationProfile: Array<{dist: number, ele: number}>,
 *   bounds: {minLat: number, maxLat: number, minLon: number, maxLon: number},
 *   trackPoints: Array<{lat: number, lon: number}>
 * }}
 */
export function parseGPX(fileText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fileText, "application/xml");

  // Check for XML parse errors
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Invalid GPX: XML parsing failed");
  }

  const points = extractPoints(doc);
  if (points.length === 0) {
    throw new Error("Invalid GPX: no track or route points found");
  }

  // Accumulate distance and elevation gain in a single pass
  let totalDistance = 0;
  let elevationGain = 0;
  const elevationProfile = [];

  // First point always starts the profile
  if (points[0].ele != null) {
    elevationProfile.push({ dist: 0, ele: points[0].ele });
  }

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    totalDistance += haversine(prev.lat, prev.lon, curr.lat, curr.lon);

    // Elevation gain: only count uphill segments
    if (prev.ele != null && curr.ele != null && curr.ele > prev.ele) {
      elevationGain += curr.ele - prev.ele;
    }

    // Build elevation profile for points that have elevation data
    if (curr.ele != null) {
      elevationProfile.push({ dist: totalDistance, ele: curr.ele });
    }
  }

  // Round to sensible precision
  const distance = Math.round(totalDistance * 100) / 100;
  const gain = Math.round(elevationGain);

  return {
    distance,
    elevationGain: gain,
    elevationProfile,
    bounds: computeBounds(points),
    trackPoints: points.map(({ lat, lon }) => ({ lat, lon })),
  };
}
