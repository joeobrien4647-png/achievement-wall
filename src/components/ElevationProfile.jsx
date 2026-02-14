import { useMemo } from "react";
import { TYPE_COLORS } from "../data/schema";

/**
 * Generates a stylized elevation profile SVG.
 * Uses sine-wave composition scaled to actual distance/elevation values.
 * Profile shape varies by event type:
 *   - Mountain: dramatic, sharp peaks
 *   - Ultra: rolling hills
 *   - Urban: mostly flat with gentle undulation
 */
export default function ElevationProfile({ distance, elevation, type = "Mountain" }) {
  const color = TYPE_COLORS[type] || "#8b5cf6";

  const { pathD, areaD, xMarkers, yMarkers, viewBox } = useMemo(() => {
    const W = 400;
    const H = 140;
    const padX = 40;
    const padTop = 16;
    const padBottom = 28;
    const plotW = W - padX * 2;
    const plotH = H - padTop - padBottom;

    const dist = distance || 50;
    const elev = elevation || 500;
    const points = 120;

    // Build elevation profile from layered sine waves based on type
    const waves = buildWaves(type, dist);
    const raw = [];
    for (let i = 0; i <= points; i++) {
      const t = i / points; // 0..1 across the distance
      let y = 0;
      for (const w of waves) {
        y += Math.sin(t * Math.PI * w.freq + w.phase) * w.amp;
      }
      raw.push(y);
    }

    // Normalize raw values so peak = elev and min ~= 0
    const rawMin = Math.min(...raw);
    const rawMax = Math.max(...raw);
    const rawRange = rawMax - rawMin || 1;
    const normalized = raw.map((v) => ((v - rawMin) / rawRange) * elev);

    // Map to SVG coordinates (y inverted)
    const svgPoints = normalized.map((elVal, i) => {
      const x = padX + (i / points) * plotW;
      const y = padTop + plotH - (elVal / elev) * plotH;
      return { x, y };
    });

    // Build path string
    const pathParts = svgPoints.map((p, i) =>
      i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    );
    const pathD = pathParts.join(" ");

    // Closed area for gradient fill
    const lastPt = svgPoints[svgPoints.length - 1];
    const firstPt = svgPoints[0];
    const baseY = padTop + plotH;
    const areaD = `${pathD} L ${lastPt.x.toFixed(1)} ${baseY} L ${firstPt.x.toFixed(1)} ${baseY} Z`;

    // X-axis distance markers (every ~25% of distance)
    const xCount = dist <= 20 ? 4 : dist <= 60 ? 5 : 4;
    const xMarkers = [];
    for (let i = 0; i <= xCount; i++) {
      const frac = i / xCount;
      const km = Math.round(frac * dist);
      xMarkers.push({
        x: padX + frac * plotW,
        label: `${km}`,
      });
    }

    // Y-axis elevation markers (3 ticks: 0, mid, peak)
    const yMarkers = [
      { y: baseY, label: "0" },
      { y: padTop + plotH / 2, label: `${Math.round(elev / 2)}` },
      { y: padTop, label: `${elev}` },
    ];

    return { pathD, areaD, xMarkers, yMarkers, viewBox: `0 0 ${W} ${H}` };
  }, [distance, elevation, type]);

  if (!distance && !elevation) return null;

  return (
    <div className="w-full">
      <svg viewBox={viewBox} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`elev-fill-${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yMarkers.map((m, i) => (
          <line
            key={i}
            x1="40"
            y1={m.y}
            x2="360"
            y2={m.y}
            stroke="#374151"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
        ))}

        {/* Filled area */}
        <path d={areaD} fill={`url(#elev-fill-${type})`} />

        {/* Profile line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis labels */}
        {xMarkers.map((m, i) => (
          <text
            key={i}
            x={m.x}
            y="136"
            textAnchor="middle"
            fill="#6b7280"
            fontSize="9"
            fontFamily="system-ui, sans-serif"
          >
            {m.label}km
          </text>
        ))}

        {/* Y-axis labels */}
        {yMarkers.map((m, i) => (
          <text
            key={i}
            x="36"
            y={m.y + 3}
            textAnchor="end"
            fill="#6b7280"
            fontSize="8"
            fontFamily="system-ui, sans-serif"
          >
            {m.label}m
          </text>
        ))}
      </svg>
    </div>
  );
}

/**
 * Builds an array of sine wave parameters that compose into a plausible
 * elevation profile for the given event type.
 */
function buildWaves(type, distance) {
  // Seed some variety based on distance so different events look different
  const seed = (distance * 7.3) % 17;

  switch (type) {
    case "Mountain":
      // Dramatic peaks with sharp ridgelines
      return [
        { freq: 1.2 + seed * 0.05, amp: 1.0, phase: 0.3 },
        { freq: 2.8 + seed * 0.03, amp: 0.6, phase: 1.2 },
        { freq: 5.5, amp: 0.25, phase: seed * 0.4 },
        { freq: 8.0, amp: 0.12, phase: 2.1 },
      ];

    case "Ultra":
      // Rolling hills -- more gentle, more frequent undulations
      return [
        { freq: 2.0 + seed * 0.04, amp: 0.7, phase: 0.5 },
        { freq: 4.5, amp: 0.4, phase: seed * 0.3 },
        { freq: 7.0, amp: 0.2, phase: 1.8 },
        { freq: 1.0, amp: 0.3, phase: 0.1 },
      ];

    case "Urban":
    default:
      // Mostly flat with gentle undulation
      return [
        { freq: 1.5, amp: 0.15, phase: seed * 0.2 },
        { freq: 3.0, amp: 0.08, phase: 1.0 },
        { freq: 6.0, amp: 0.04, phase: 2.5 },
        { freq: 0.5, amp: 0.3, phase: 0.0 }, // gentle base curve
      ];
  }
}
