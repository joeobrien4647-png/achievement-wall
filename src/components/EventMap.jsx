import { useState } from "react";
import { UK_OUTLINE, matchLocation } from "../data/ukMap";
import { TYPE_COLORS } from "../data/schema";

export default function EventMap({ events, upcoming }) {
  const [tooltip, setTooltip] = useState(null);

  const plotted = events
    .map((e) => ({ ...e, coords: matchLocation(e.location) }))
    .filter((e) => e.coords);

  const upcomingCoords = upcoming ? matchLocation(upcoming.location) : null;

  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: 360 }}>
        {/* UK outline */}
        <path
          d={UK_OUTLINE}
          fill="none"
          stroke="#374151"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Event dots */}
        {plotted.map((e) => (
          <circle
            key={e.id}
            cx={e.coords.x}
            cy={e.coords.y}
            r={Math.min(1.5 + (e.difficulty || 1) * 0.5, 4)}
            fill={TYPE_COLORS[e.type] || "#6366f1"}
            opacity={0.85}
            className="cursor-pointer transition-all hover:opacity-100"
            onMouseEnter={() => setTooltip({ x: e.coords.x, y: e.coords.y, name: e.name, type: e.type, distance: e.distance })}
            onMouseLeave={() => setTooltip(null)}
            onClick={() => setTooltip((t) => t?.name === e.name ? null : { x: e.coords.x, y: e.coords.y, name: e.name, type: e.type, distance: e.distance })}
          />
        ))}

        {/* Upcoming event — pulsing dot */}
        {upcomingCoords && (
          <>
            <circle cx={upcomingCoords.x} cy={upcomingCoords.y} r="3" fill="#ef4444" opacity="0.3">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle
              cx={upcomingCoords.x}
              cy={upcomingCoords.y}
              r="2"
              fill="#ef4444"
              className="cursor-pointer"
              onMouseEnter={() => setTooltip({ x: upcomingCoords.x, y: upcomingCoords.y, name: upcoming.name, type: "Upcoming", distance: upcoming.distance })}
              onMouseLeave={() => setTooltip(null)}
            />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-lg z-10"
          style={{
            left: `${tooltip.x}%`,
            top: `${tooltip.y}%`,
            transform: "translate(-50%, -130%)",
          }}
        >
          <div className="text-white font-bold">{tooltip.name}</div>
          <div className="text-gray-400">
            {tooltip.type}{tooltip.distance ? ` · ${tooltip.distance}km` : ""}
          </div>
        </div>
      )}
    </div>
  );
}
