import { X, Route, TrendingUp, Star, Clock, Calendar, MapPin } from "lucide-react";
import { TYPE_COLORS } from "../data/schema";
import { parseTime, formatDuration } from "../lib/pace";

/**
 * Side-by-side comparison modal for two events.
 * Shows visual bars for numeric metrics, color-coded by event type.
 */
export default function EventCompare({ eventA, eventB, onClose }) {
  const colorA = TYPE_COLORS[eventA.type] || "#6b7280";
  const colorB = TYPE_COLORS[eventB.type] || "#6b7280";

  const timeA = parseTime(eventA.time);
  const timeB = parseTime(eventB.time);

  const metrics = [
    {
      label: "Distance",
      icon: Route,
      a: eventA.distance || 0,
      b: eventB.distance || 0,
      unit: "km",
    },
    {
      label: "Elevation",
      icon: TrendingUp,
      a: eventA.elevation || 0,
      b: eventB.elevation || 0,
      unit: "m",
      formatVal: (v) => v.toLocaleString(),
    },
    {
      label: "Difficulty",
      icon: Star,
      a: eventA.difficulty || 0,
      b: eventB.difficulty || 0,
      unit: "/5",
    },
    {
      label: "Time",
      icon: Clock,
      a: timeA || 0,
      b: timeB || 0,
      unit: "",
      formatVal: (v) => (v ? formatDuration(v) : "--"),
      // For time, lower is better -- invert the "winner" highlight
      invertWinner: true,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl border border-gray-800 max-w-md w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: two event badges side by side */}
        <div className="flex border-b border-gray-800">
          <EventHeader event={eventA} color={colorA} />
          <div className="w-px bg-gray-800" />
          <EventHeader event={eventB} color={colorB} />
        </div>

        {/* Info rows: type and date */}
        <div className="flex border-b border-gray-800 text-xs">
          <InfoCell
            icon={MapPin}
            value={eventA.type}
            color={colorA}
          />
          <div className="w-px bg-gray-800" />
          <InfoCell
            icon={MapPin}
            value={eventB.type}
            color={colorB}
          />
        </div>
        <div className="flex border-b border-gray-800 text-xs">
          <InfoCell
            icon={Calendar}
            value={eventA.date || "No date"}
            color="#9ca3af"
          />
          <div className="w-px bg-gray-800" />
          <InfoCell
            icon={Calendar}
            value={eventB.date || "No date"}
            color="#9ca3af"
          />
        </div>

        {/* Bar comparison metrics */}
        <div className="p-4 space-y-4">
          {metrics.map((m) => {
            const max = Math.max(m.a, m.b, 1);
            const aWins = m.invertWinner
              ? m.a > 0 && (m.b === 0 || m.a < m.b)
              : m.a >= m.b;
            const bWins = m.invertWinner
              ? m.b > 0 && (m.a === 0 || m.b < m.a)
              : m.b >= m.a;
            const fmt = m.formatVal || ((v) => `${v}`);

            return (
              <div key={m.label}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <m.icon size={12} className="text-gray-500" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    {m.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Value A */}
                  <span
                    className={`text-sm font-bold w-20 text-right tabular-nums ${
                      aWins ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {fmt(m.a)}{m.unit}
                  </span>

                  {/* Bars */}
                  <div className="flex-1 flex gap-1 h-5">
                    <div className="flex-1 flex justify-end">
                      <div
                        className="h-full rounded-l-sm transition-all duration-500"
                        style={{
                          width: `${(m.a / max) * 100}%`,
                          backgroundColor: colorA,
                          opacity: aWins ? 1 : 0.3,
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div
                        className="h-full rounded-r-sm transition-all duration-500"
                        style={{
                          width: `${(m.b / max) * 100}%`,
                          backgroundColor: colorB,
                          opacity: bWins ? 1 : 0.3,
                        }}
                      />
                    </div>
                  </div>

                  {/* Value B */}
                  <span
                    className={`text-sm font-bold w-20 tabular-nums ${
                      bWins ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {fmt(m.b)}{m.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close */}
        <div className="border-t border-gray-800 p-4">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <X size={16} />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EventHeader({ event, color }) {
  return (
    <div className="flex-1 p-4 text-center">
      <div className="text-3xl mb-1.5">{event.badge}</div>
      <div className="text-white font-bold text-sm truncate px-2">{event.name}</div>
      <div
        className="text-[10px] font-bold uppercase tracking-widest mt-1"
        style={{ color }}
      >
        {event.type}
      </div>
    </div>
  );
}

function InfoCell({ icon: Icon, value, color }) {
  return (
    <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3">
      <Icon size={11} style={{ color }} />
      <span className="truncate" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
