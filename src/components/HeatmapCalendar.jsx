import { useMemo, useState } from "react";

const CELL = 12;
const GAP = 2;
const TOTAL = CELL + GAP;
const WEEKS = 52;
const DAYS = 7;

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const DAY_LABELS = [
  { index: 1, label: "M" },
  { index: 3, label: "W" },
  { index: 5, label: "F" },
];

const COLORS = {
  empty: "#1f2937",
  checkin: "#059669",
  checkinLight: "#065f46",
  event: "#6366f1",
};

/**
 * GitHub-style contribution heatmap for the last 52 weeks.
 * Shows weekly check-ins and completed event dates.
 */
export default function HeatmapCalendar({ checkins = [], events = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const { grid, monthMarkers } = useMemo(() => {
    // Build sets for fast lookup
    const checkinSet = new Set(checkins);
    const eventDateSet = new Set();
    const eventNameMap = new Map();

    events
      .filter((e) => e.status === "completed" && e.date)
      .forEach((e) => {
        eventDateSet.add(e.date);
        const existing = eventNameMap.get(e.date);
        eventNameMap.set(e.date, existing ? `${existing}, ${e.name}` : e.name);
      });

    // Find the start: go back 52 weeks from today, align to Sunday (start of week column)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0=Sun
    const endDate = new Date(today);

    // Start date: 52 weeks back from the start of the current week
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (WEEKS * 7) - dayOfWeek);

    const cells = [];
    const months = [];
    let lastMonth = -1;

    const cursor = new Date(startDate);
    for (let week = 0; week < WEEKS + 1; week++) {
      for (let day = 0; day < DAYS; day++) {
        const dateStr = toISO(cursor);
        const isPast = cursor <= today;

        // Track month boundaries (first day of the week that's in a new month)
        if (day === 0 && cursor.getMonth() !== lastMonth) {
          lastMonth = cursor.getMonth();
          months.push({ week, month: lastMonth });
        }

        if (isPast) {
          const isCheckinWeek = isCheckinForDate(dateStr, checkinSet);
          const isEvent = eventDateSet.has(dateStr);
          const eventName = eventNameMap.get(dateStr);

          cells.push({
            week,
            day,
            date: dateStr,
            isCheckinWeek,
            isEvent,
            eventName,
          });
        }

        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return { grid: cells, monthMarkers: months };
  }, [checkins, events]);

  const labelWidth = 16;
  const headerHeight = 14;
  const svgWidth = labelWidth + (WEEKS + 1) * TOTAL;
  const svgHeight = headerHeight + DAYS * TOTAL;

  return (
    <div className="relative overflow-x-auto no-scrollbar">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="block"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Month labels */}
        {monthMarkers.map((m, i) => (
          <text
            key={i}
            x={labelWidth + m.week * TOTAL + CELL / 2}
            y={10}
            fill="#6b7280"
            fontSize="9"
            textAnchor="middle"
          >
            {MONTH_LABELS[m.month]}
          </text>
        ))}

        {/* Day labels */}
        {DAY_LABELS.map((d) => (
          <text
            key={d.index}
            x={8}
            y={headerHeight + d.index * TOTAL + CELL - 2}
            fill="#6b7280"
            fontSize="9"
            textAnchor="middle"
          >
            {d.label}
          </text>
        ))}

        {/* Grid cells */}
        {grid.map((cell, i) => {
          const x = labelWidth + cell.week * TOTAL;
          const y = headerHeight + cell.day * TOTAL;

          let fill = COLORS.empty;
          if (cell.isEvent) fill = COLORS.event;
          else if (cell.isCheckinWeek) fill = COLORS.checkin;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx={2}
              fill={fill}
              className="transition-colors hover:brightness-125 cursor-pointer"
              onMouseEnter={(e) => {
                const rect = e.target.getBoundingClientRect();
                let label = formatDate(cell.date);
                if (cell.isEvent) label += ` -- ${cell.eventName}`;
                else if (cell.isCheckinWeek) label += " -- Trained";
                setTooltip({ x: rect.left + rect.width / 2, y: rect.top, label });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg border border-gray-700 pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y - 32,
            transform: "translateX(-50%)",
          }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}

/** Format YYYY-MM-DD to a human-friendly string */
function formatDate(isoStr) {
  const d = new Date(isoStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Convert a Date to YYYY-MM-DD */
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Check if a given date falls in a week that has a check-in.
 * Check-ins are stored as Monday ISO dates; we check if the date's
 * ISO week Monday matches any check-in entry.
 */
function isCheckinForDate(dateStr, checkinSet) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(d);
  monday.setDate(monday.getDate() - diff);
  return checkinSet.has(toISO(monday));
}
