import { useState } from "react";
import { Calendar, Copy, Check } from "lucide-react";
import { getWeekMonday, hasCheckedInThisWeek } from "../lib/streaks";
import AnimatedNumber from "./AnimatedNumber";

/**
 * Compute the Monday and Sunday of the current ISO week.
 */
function getCurrentWeekRange() {
  const monday = getWeekMonday();
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { monday, sunday };
}

/**
 * Format a date as "Feb 10" style.
 */
function formatShort(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Compute weekly stats from events that fall within the current Mon-Sun window.
 */
function computeWeekStats(events, checkins) {
  const { monday, sunday } = getCurrentWeekRange();
  const mondayTime = monday.getTime();
  const sundayEnd = new Date(sunday);
  sundayEnd.setHours(23, 59, 59, 999);
  const sundayTime = sundayEnd.getTime();

  let distance = 0;
  let elevation = 0;
  let eventCount = 0;

  (events || []).forEach((e) => {
    if (e.status !== "completed" || !e.date) return;
    const t = new Date(e.date).getTime();
    if (t >= mondayTime && t <= sundayTime) {
      eventCount++;
      distance += e.distance || 0;
      elevation += e.elevation || 0;
    }
  });

  const checkedIn = hasCheckedInThisWeek(checkins);

  return { distance, elevation, eventCount, checkedIn };
}

export default function WeeklySummary({ events, checkins }) {
  const [copied, setCopied] = useState(false);
  const { monday, sunday } = getCurrentWeekRange();
  const { distance, elevation, eventCount, checkedIn } = computeWeekStats(events, checkins);

  const dateRange = `${formatShort(monday)} - ${formatShort(sunday)}`;
  const hasActivity = distance > 0 || elevation > 0 || eventCount > 0;

  const handleShare = async () => {
    const lines = [
      `This Week (${dateRange})`,
      `Distance: ${distance}km`,
      `Elevation: ${elevation.toLocaleString()}m`,
      `Events: ${eventCount}`,
      checkedIn ? "Training check-in: Done" : "",
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may not be available in all contexts
    }
  };

  return (
    <div className="bg-gray-800/60 rounded-2xl p-5 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">This Week</h3>
          <span className="text-gray-500 text-xs">{dateRange}</span>
        </div>
        <button
          onClick={handleShare}
          className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Copy summary"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>

      {hasActivity ? (
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: distance, suffix: "km", label: "Distance", color: "#10b981" },
            { value: elevation, suffix: "m", label: "Elevation", color: "#8b5cf6" },
            { value: eventCount, suffix: "", label: "Events", color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-black text-white">
                <AnimatedNumber value={s.value} suffix={s.suffix} />
              </div>
              <div
                className="text-[10px] uppercase tracking-wider font-medium mt-0.5"
                style={{ color: s.color }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-gray-400 text-sm italic">
            Fresh week — what will you conquer?
          </p>
        </div>
      )}
    </div>
  );
}
