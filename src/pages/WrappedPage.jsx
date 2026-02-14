import { useMemo, useState, useEffect, useRef } from "react";
import { useEvents } from "../hooks/useEvents";
import { useData } from "../context/DataContext";
import { computeStreaks } from "../lib/streaks";
import { calcPace, formatPace, parseTime } from "../lib/pace";

// ─── Distance comparisons for the motivational close ─────────────────────────
const DISTANCE_COMPARISONS = [
  { threshold: 0, text: "a journey just beginning" },
  { threshold: 50, text: "London to Brighton" },
  { threshold: 100, text: "across the Lake District" },
  { threshold: 200, text: "London to Birmingham" },
  { threshold: 300, text: "London to Bristol and back" },
  { threshold: 400, text: "the length of Wales" },
  { threshold: 500, text: "London to Edinburgh" },
  { threshold: 750, text: "Land's End to John o' Groats (halfway)" },
  { threshold: 1000, text: "London to Barcelona" },
  { threshold: 1500, text: "London to Rome" },
];

function getDistanceComparison(km) {
  let best = DISTANCE_COMPARISONS[0];
  for (const c of DISTANCE_COMPARISONS) {
    if (km >= c.threshold) best = c;
  }
  return best.text;
}

// ─── Month names ─────────────────────────────────────────────────────────────
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─── Intersection Observer hook for scroll animations ────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

// ─── Animated counter component ──────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1200, suffix = "", decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const [ref, isVisible] = useScrollReveal();

  useEffect(() => {
    if (!isVisible || value === 0) return;
    const start = performance.now();
    const numValue = typeof value === "number" ? value : parseFloat(value) || 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(numValue * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isVisible, value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return <span ref={ref}>{formatted}{suffix}</span>;
}

// ─── Reveal wrapper ──────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, isVisible] = useScrollReveal();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section wrapper for consistent spacing ──────────────────────────────────
function Section({ children, className = "" }) {
  return (
    <section className={`px-5 py-10 max-w-lg mx-auto ${className}`}>
      {children}
    </section>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function WrappedPage() {
  const { state } = useData();
  const { completed } = useEvents();

  // Determine available years from completed events with dates
  const availableYears = useMemo(() => {
    const years = new Set();
    for (const e of completed) {
      if (e.date) years.add(new Date(e.date).getFullYear());
    }
    // Always include current year
    years.add(new Date().getFullYear());
    return [...years].sort((a, b) => b - a);
  }, [completed]);

  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const hasMultipleYears = availableYears.length > 1;

  // ─── Year-filtered data ──────────────────────────────────────────────────
  const yearData = useMemo(() => {
    const yearEvents = completed.filter(
      (e) => e.date && new Date(e.date).getFullYear() === selectedYear
    );
    // If no events have dates for this year, fall back to all completed events
    // (the seed data has no dates, so this is a sensible default)
    const events = yearEvents.length > 0 ? yearEvents : completed;
    const hasDateFiltering = yearEvents.length > 0;

    // Big numbers
    const totalDistance = events.reduce(
      (s, e) => s + (e.distance || 0) * (e.completions || 1), 0
    );
    const totalEvents = events.reduce(
      (s, e) => s + (e.completions || 1), 0
    );
    const totalElevation = events.reduce(
      (s, e) => s + (e.elevation || 0) * (e.completions || 1), 0
    );

    // Total hours on feet
    const totalSeconds = events.reduce((s, e) => {
      const sec = parseTime(e.time);
      return sec ? s + sec * (e.completions || 1) : s;
    }, 0);
    const totalHours = totalSeconds > 0 ? totalSeconds / 3600 : null;

    // Highlights
    const withDistance = events.filter((e) => e.distance);
    const longestEvent = [...withDistance].sort((a, b) => b.distance - a.distance)[0] || null;
    const hardestEvent = [...events].sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0))[0] || null;
    const withElevation = events.filter((e) => e.elevation);
    const mostElevationEvent = [...withElevation].sort((a, b) => b.elevation - a.elevation)[0] || null;

    // Fastest pace
    const withPace = events
      .map((e) => ({ ...e, pace: calcPace(e.time, e.distance) }))
      .filter((e) => e.pace != null)
      .sort((a, b) => a.pace - b.pace);
    const fastestPaceEvent = withPace[0] || null;

    // Monthly breakdown (only meaningful with dates)
    const monthlyDistance = Array(12).fill(0);
    if (hasDateFiltering) {
      for (const e of yearEvents) {
        const month = new Date(e.date).getMonth();
        monthlyDistance[month] += (e.distance || 0) * (e.completions || 1);
      }
    }
    const maxMonthly = Math.max(...monthlyDistance, 1);

    // Year-on-year comparison
    const prevYear = selectedYear - 1;
    const prevYearEvents = completed.filter(
      (e) => e.date && new Date(e.date).getFullYear() === prevYear
    );
    const prevDistance = prevYearEvents.reduce(
      (s, e) => s + (e.distance || 0) * (e.completions || 1), 0
    );
    const prevEventCount = prevYearEvents.reduce(
      (s, e) => s + (e.completions || 1), 0
    );
    const hasPrevYear = prevYearEvents.length > 0;

    const distanceDelta = prevDistance > 0
      ? Math.round(((totalDistance - prevDistance) / prevDistance) * 100)
      : null;
    const eventsDelta = hasPrevYear ? totalEvents - prevEventCount : null;

    return {
      events,
      hasDateFiltering,
      totalDistance,
      totalEvents,
      totalElevation,
      totalHours,
      longestEvent,
      hardestEvent,
      mostElevationEvent,
      fastestPaceEvent,
      monthlyDistance,
      maxMonthly,
      hasPrevYear,
      prevYear,
      prevDistance,
      prevEventCount,
      distanceDelta,
      eventsDelta,
    };
  }, [completed, selectedYear]);

  // ─── Achievements unlocked this year ─────────────────────────────────────
  const yearAchievements = useMemo(() => {
    const unlocked = state.preferences?.unlockedAchievements ?? [];
    return unlocked.filter((a) => {
      if (!a.unlockedAt) return false;
      return new Date(a.unlockedAt).getFullYear() === selectedYear;
    });
  }, [state.preferences, selectedYear]);

  // Show all achievements if none are year-specific (seed data fallback)
  const displayAchievements = yearAchievements.length > 0
    ? yearAchievements
    : (state.preferences?.unlockedAchievements ?? []);

  // ─── Streak stats ────────────────────────────────────────────────────────
  const streakData = useMemo(() => {
    const checkins = state.preferences?.weeklyCheckins ?? [];
    const { current, longest } = computeStreaks(checkins);
    return { current, longest, totalWeeks: checkins.length };
  }, [state.preferences]);

  // ─── Motivational close ──────────────────────────────────────────────────
  const comparison = getDistanceComparison(yearData.totalDistance);

  return (
    <div className="min-h-screen bg-gray-950 pb-24 sm:pb-8">
      {/* ═══ 1. HERO ═══ */}
      <Section className="pt-16 pb-6 text-center">
        <Reveal>
          <p className="text-gray-500 text-sm uppercase tracking-widest font-medium mb-4">
            Year in Review
          </p>
          <h1
            className="text-5xl sm:text-6xl font-black leading-tight"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Your {selectedYear}
          </h1>
          {hasMultipleYears && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {availableYears.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                    y === selectedYear
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </Reveal>
      </Section>

      {/* ═══ 2. BIG NUMBERS ═══ */}
      <Section>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              value: yearData.totalDistance,
              suffix: "km",
              label: "Distance Covered",
              gradient: "from-emerald-400 to-cyan-400",
            },
            {
              value: yearData.totalEvents,
              suffix: "",
              label: "Events Completed",
              gradient: "from-violet-400 to-purple-400",
            },
            {
              value: yearData.totalElevation,
              suffix: "m",
              label: "Elevation Gained",
              gradient: "from-amber-400 to-orange-400",
            },
            ...(yearData.totalHours
              ? [{
                  value: yearData.totalHours,
                  suffix: "h",
                  label: "Hours on Feet",
                  gradient: "from-rose-400 to-pink-400",
                  decimals: 1,
                }]
              : []),
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100}>
              <div className="bg-gray-800/40 rounded-2xl p-5 border border-gray-700/30 text-center">
                <div
                  className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                >
                  <AnimatedNumber
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals || 0}
                  />
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-2 font-bold">
                  {stat.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══ 3. HIGHLIGHTS ═══ */}
      <Section>
        <Reveal>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-5">
            Highlights
          </h2>
        </Reveal>
        <div className="space-y-3">
          {[
            yearData.longestEvent && {
              icon: "🏅",
              label: "Longest Event",
              value: `${yearData.longestEvent.distance}km`,
              name: yearData.longestEvent.name,
              color: "#10b981",
            },
            yearData.hardestEvent && {
              icon: "🔥",
              label: "Hardest Event",
              value: `${yearData.hardestEvent.difficulty}/5`,
              name: yearData.hardestEvent.name,
              color: "#ef4444",
            },
            yearData.mostElevationEvent && {
              icon: "⛰️",
              label: "Most Elevation",
              value: `${yearData.mostElevationEvent.elevation.toLocaleString()}m`,
              name: yearData.mostElevationEvent.name,
              color: "#f59e0b",
            },
            yearData.fastestPaceEvent && {
              icon: "⚡",
              label: "Fastest Pace",
              value: formatPace(calcPace(yearData.fastestPaceEvent.time, yearData.fastestPaceEvent.distance)),
              name: yearData.fastestPaceEvent.name,
              color: "#06b6d4",
            },
          ]
            .filter(Boolean)
            .map((h, i) => (
              <Reveal key={h.label} delay={i * 80}>
                <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/30 flex items-center gap-4">
                  <span className="text-2xl">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      {h.label}
                    </div>
                    <div className="text-white font-black text-lg truncate" style={{ color: h.color }}>
                      {h.value}
                    </div>
                    <div className="text-gray-400 text-xs truncate">{h.name}</div>
                  </div>
                </div>
              </Reveal>
            ))}
        </div>
      </Section>

      {/* ═══ 4. MONTHLY BREAKDOWN ═══ */}
      {yearData.hasDateFiltering && (
        <Section>
          <Reveal>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-5">
              Monthly Distance
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="bg-gray-800/40 rounded-2xl p-5 border border-gray-700/30">
              <div className="flex items-end gap-1.5 h-40">
                {yearData.monthlyDistance.map((km, i) => {
                  const height = yearData.maxMonthly > 0
                    ? Math.max((km / yearData.maxMonthly) * 100, km > 0 ? 4 : 0)
                    : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center justify-end flex-1">
                        {km > 0 && (
                          <span className="text-[9px] text-gray-400 font-bold mb-1">
                            {Math.round(km)}
                          </span>
                        )}
                        <div
                          className="w-full rounded-t-md transition-all duration-700"
                          style={{
                            height: `${height}%`,
                            background: km > 0
                              ? "linear-gradient(180deg, #667eea 0%, #764ba2 100%)"
                              : "transparent",
                            minHeight: km > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-gray-600 font-medium">
                        {MONTHS[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </Section>
      )}

      {/* ═══ 5. ACHIEVEMENTS UNLOCKED ═══ */}
      {displayAchievements.length > 0 && (
        <Section>
          <Reveal>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-5">
              Achievements Unlocked
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3">
            {displayAchievements.map((ach, i) => (
              <Reveal key={ach.id} delay={i * 60}>
                <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/30 text-center">
                  <div className="text-3xl mb-2">{ach.icon}</div>
                  <div className="text-white font-bold text-sm">{ach.name}</div>
                  <div className="text-gray-500 text-[10px] mt-1 leading-snug">
                    {ach.description}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ 6. STREAK STATS ═══ */}
      {streakData.totalWeeks > 0 && (
        <Section>
          <Reveal>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-5">
              Training Streaks
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            <Reveal delay={0}>
              <div className="bg-gray-800/40 rounded-2xl p-5 border border-gray-700/30 text-center">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  <AnimatedNumber value={streakData.longest} suffix="w" />
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-2 font-bold">
                  Longest Streak
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="bg-gray-800/40 rounded-2xl p-5 border border-gray-700/30 text-center">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  <AnimatedNumber value={streakData.totalWeeks} suffix="" />
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-2 font-bold">
                  Total Check-in Weeks
                </div>
              </div>
            </Reveal>
          </div>
          {streakData.current > 0 && (
            <Reveal delay={200}>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold">
                  {streakData.current}w current streak — keep it going
                </span>
              </div>
            </Reveal>
          )}
        </Section>
      )}

      {/* ═══ 7. YEAR-ON-YEAR COMPARISON ═══ */}
      {yearData.hasPrevYear && (
        <Section>
          <Reveal>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-5">
              {selectedYear} vs {yearData.prevYear}
            </h2>
          </Reveal>
          <div className="space-y-3">
            {[
              {
                label: "Distance",
                delta: yearData.distanceDelta,
                suffix: "%",
              },
              {
                label: "Events",
                delta: yearData.eventsDelta,
                suffix: "",
                isAbsolute: true,
              },
            ].map((row, i) => (
              <Reveal key={row.label} delay={i * 100}>
                <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/30 flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-medium">{row.label}</span>
                  {row.delta != null ? (
                    <span
                      className={`text-lg font-black ${
                        row.delta >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {row.delta >= 0 ? "+" : ""}
                      {row.delta}{row.isAbsolute ? "" : row.suffix}
                      {!row.isAbsolute && " vs last year"}
                      {row.isAbsolute && " vs last year"}
                    </span>
                  ) : (
                    <span className="text-gray-600 text-sm">No prior data</span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ 8. MOTIVATIONAL CLOSE ═══ */}
      <Section className="text-center pb-20">
        <Reveal>
          <div className="py-10">
            <p className="text-gray-500 text-sm mb-4">This year you covered</p>
            <div
              className="text-5xl sm:text-6xl font-black mb-4"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {yearData.totalDistance.toLocaleString()}km
            </div>
            <p className="text-gray-400 text-lg mb-8">
              That's{" "}
              <span className="text-white font-bold">{comparison}</span>.
            </p>
            <div
              className="inline-block px-6 py-3 rounded-2xl border border-gray-700/30"
              style={{
                background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(240,147,251,0.1) 100%)",
              }}
            >
              <p className="text-white font-bold text-lg">Keep going.</p>
            </div>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
