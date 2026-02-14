import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { useData } from "../context/DataContext";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LEGEND = [
  { color: "#10b981", label: "Completed" },
  { color: "#ef4444", label: "Upcoming" },
  { color: "#f59e0b", label: "Check-in Week" },
];

/** Convert a Date to "YYYY-MM-DD" without timezone drift. */
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Get the Monday of the ISO week containing a given date. */
function getWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return toISO(d);
}

/** Build grid of dates for a calendar month (Mon-start weeks). */
function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Day of week for the 1st (shift to Mon=0, Sun=6)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days = [];

  // Leading blanks
  for (let i = 0; i < startDow; i++) {
    days.push(null);
  }

  // Actual days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Trailing blanks to fill the last row
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export default function CalendarPage() {
  const { events } = useEvents();
  const { state } = useData();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISO(today);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = useCallback(() => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    setSelectedDay(null);
  }, []);

  const nextMonth = useCallback(() => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    setSelectedDay(null);
  }, []);

  // Pre-compute lookup maps
  const { completedMap, upcomingMap, checkinMondays } = useMemo(() => {
    const cMap = new Map();
    const uMap = new Map();

    for (const ev of events) {
      if (!ev.date) continue;
      const dateKey = ev.date.slice(0, 10); // "YYYY-MM-DD"
      if (ev.status === "completed") {
        const existing = cMap.get(dateKey);
        cMap.set(dateKey, existing ? [...existing, ev] : [ev]);
      } else if (ev.status === "upcoming") {
        const existing = uMap.get(dateKey);
        uMap.set(dateKey, existing ? [...existing, ev] : [ev]);
      }
    }

    const checkins = new Set(state.preferences?.weeklyCheckins ?? []);
    return { completedMap: cMap, upcomingMap: uMap, checkinMondays: checkins };
  }, [events, state.preferences?.weeklyCheckins]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  // Get data for a given date
  const getDayData = useCallback(
    (date) => {
      if (!date) return null;
      const iso = toISO(date);
      const monday = getWeekMonday(date);
      return {
        iso,
        completed: completedMap.get(iso) ?? [],
        upcoming: upcomingMap.get(iso) ?? [],
        isCheckinWeek: checkinMondays.has(monday),
        isToday: iso === todayISO,
      };
    },
    [completedMap, upcomingMap, checkinMondays, todayISO]
  );

  // Events for the selected day
  const selectedDayData = useMemo(() => {
    if (!selectedDay) return null;
    return getDayData(selectedDay);
  }, [selectedDay, getDayData]);

  const monthLabel = viewDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-4 pb-24 sm:pb-8 pt-4 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Calendar</h2>
        <p className="text-gray-500 text-sm">Your training and event schedule</p>
      </div>

      {/* Month Navigation */}
      <div className="bg-gray-800/60 rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-white font-bold text-base">{monthLabel}</h3>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 px-3 pb-1">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider py-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 px-3 pb-3 gap-y-1">
          {grid.map((date, i) => {
            if (!date) {
              return <div key={`blank-${i}`} className="aspect-square" />;
            }

            const data = getDayData(date);
            const isSelected =
              selectedDay && toISO(selectedDay) === data.iso;
            const hasCompleted = data.completed.length > 0;
            const hasUpcoming = data.upcoming.length > 0;
            const hasCheckin = data.isCheckinWeek;
            const hasAny = hasCompleted || hasUpcoming || hasCheckin;

            return (
              <button
                key={data.iso}
                onClick={() =>
                  hasAny
                    ? setSelectedDay(isSelected ? null : date)
                    : setSelectedDay(null)
                }
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                  transition-all text-sm relative
                  ${data.isToday ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-gray-800" : ""}
                  ${isSelected ? "bg-gray-700/80" : hasAny ? "hover:bg-gray-700/40 cursor-pointer" : "cursor-default"}
                `}
              >
                <span
                  className={`font-medium ${
                    data.isToday
                      ? "text-indigo-400"
                      : isSelected
                        ? "text-white"
                        : "text-gray-300"
                  }`}
                >
                  {date.getDate()}
                </span>

                {/* Dots row */}
                {hasAny && (
                  <div className="flex gap-0.5">
                    {hasCompleted && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                    {hasUpcoming && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                    {hasCheckin && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5">
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>

      {/* Selected Day Bottom Sheet */}
      {selectedDayData && (
        <div className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-4 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-bold text-sm">
              {selectedDay.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-gray-500 hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          {selectedDayData.completed.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#10b981" }}
              />
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {ev.badge} {ev.name}
                </div>
                {ev.distance && (
                  <div className="text-gray-500 text-xs">{ev.distance}km</div>
                )}
              </div>
            </div>
          ))}

          {selectedDayData.upcoming.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#ef4444" }}
              />
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {ev.badge} {ev.name}
                </div>
                {ev.distance && (
                  <div className="text-gray-500 text-xs">{ev.distance}km</div>
                )}
              </div>
            </div>
          ))}

          {selectedDayData.isCheckinWeek &&
            selectedDayData.completed.length === 0 &&
            selectedDayData.upcoming.length === 0 && (
              <div className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#f59e0b" }}
                />
                <div className="text-gray-400 text-sm">
                  Training check-in week
                </div>
              </div>
            )}

          {selectedDayData.isCheckinWeek &&
            (selectedDayData.completed.length > 0 ||
              selectedDayData.upcoming.length > 0) && (
              <div className="text-amber-500/80 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Training check-in week
              </div>
            )}
        </div>
      )}
    </div>
  );
}
