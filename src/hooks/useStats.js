import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { calcPace, formatPace } from "../lib/pace";

export function useStats() {
  const { state } = useData();
  const events = state.events.filter((e) => e.status === "completed");
  const bodyWeight = state.preferences?.bodyWeight ?? 102;

  return useMemo(() => {
    const totalDistance = events.reduce((s, e) => s + (e.distance || 0) * (e.completions || 1), 0);
    const totalEvents = events.reduce((s, e) => s + (e.completions || 1), 0);
    const totalElevation = events.reduce((s, e) => s + (e.elevation || 0) * (e.completions || 1), 0);
    const highestPeak = Math.max(...events.map((e) => e.elevation || 0), 0);
    const highestPeakEvent = events.find((e) => e.elevation === highestPeak);

    // Bar chart: distance by event
    const distanceData = events
      .filter((e) => e.distance)
      .sort((a, b) => a.distance - b.distance)
      .map((e) => ({
        name: e.name.length > 16 ? e.name.slice(0, 14) + "\u2026" : e.name,
        distance: e.distance,
        fill: e.color,
      }));

    // Cumulative area chart
    const cumulativeData = events
      .filter((e) => e.distance)
      .sort((a, b) => a.distance - b.distance)
      .reduce((acc, e) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].total : 0;
        acc.push({
          name: e.name.length > 14 ? e.name.slice(0, 12) + "\u2026" : e.name,
          total: prev + (e.distance || 0) * (e.completions || 1),
        });
        return acc;
      }, []);

    // Pie chart: type breakdown
    const typeBreakdown = Object.entries(
      events.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + (e.completions || 1);
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    // Personal Records
    const withDistance = events.filter((e) => e.distance);
    const withElevation = events.filter((e) => e.elevation);

    const longestEvent = withDistance.sort((a, b) => b.distance - a.distance)[0];
    const mostElevationEvent = withElevation.sort((a, b) => b.elevation - a.elevation)[0];
    const hardestEvent = [...events].sort((a, b) => b.difficulty - a.difficulty)[0];
    const mostCompletionsEvent = [...events].sort((a, b) => b.completions - a.completions)[0];

    // Fastest pace
    const withPace = events
      .map((e) => ({ ...e, pace: calcPace(e.time, e.distance) }))
      .filter((e) => e.pace != null)
      .sort((a, b) => a.pace - b.pace);
    const fastestPaceEvent = withPace[0] || null;

    const personalRecords = {
      longestDistance: longestEvent ? { value: longestEvent.distance, name: longestEvent.name, date: longestEvent.date } : null,
      mostElevation: mostElevationEvent ? { value: mostElevationEvent.elevation, name: mostElevationEvent.name, date: mostElevationEvent.date } : null,
      hardestEvent: hardestEvent ? { value: hardestEvent.difficulty, name: hardestEvent.name, date: hardestEvent.date } : null,
      mostCompletions: mostCompletionsEvent ? { value: mostCompletionsEvent.completions, name: mostCompletionsEvent.name, date: mostCompletionsEvent.date } : null,
      fastestPace: fastestPaceEvent ? { value: formatPace(fastestPaceEvent.pace), name: fastestPaceEvent.name, date: fastestPaceEvent.date } : null,
    };

    // PR Timeline — chronological list of when each record category was first set/broken
    const prTimeline = [];
    const datedEvents = events.filter((e) => e.date).sort((a, b) => a.date.localeCompare(b.date));
    let maxDist = 0, maxElev = 0, maxDiff = 0;
    for (const e of datedEvents) {
      if (e.distance && e.distance > maxDist) {
        maxDist = e.distance;
        prTimeline.push({ date: e.date, category: "Distance", value: `${e.distance}km`, name: e.name, icon: "🏅", color: "#10b981" });
      }
      if (e.elevation && e.elevation > maxElev) {
        maxElev = e.elevation;
        prTimeline.push({ date: e.date, category: "Elevation", value: `${e.elevation}m`, name: e.name, icon: "⛰️", color: "#f59e0b" });
      }
      if (e.difficulty && e.difficulty > maxDiff) {
        maxDiff = e.difficulty;
        prTimeline.push({ date: e.date, category: "Difficulty", value: `${e.difficulty}/5`, name: e.name, icon: "🔥", color: "#ef4444" });
      }
    }

    // Fun facts
    const cityComparison = totalDistance > 400 ? "Edinburgh" : totalDistance > 300 ? "Manchester" : "Bristol";
    const funFacts = [
      { icon: "\u{1F5FA}\uFE0F", text: `${totalDistance}km is roughly London to ${cityComparison}` },
      { icon: "\u{1F3D4}\uFE0F", text: `${totalElevation.toLocaleString()}m of climbing \u2014 ${(totalElevation / 8849 * 100).toFixed(1)}% of Everest from sea level` },
      { icon: "\u23F1\uFE0F", text: `At average walking pace, that's ~${Math.round(totalDistance / 5)} hours on your feet` },
      { icon: "\u{1F45F}", text: `At ~${bodyWeight}kg, your legs have moved approximately ${Math.round(totalDistance * bodyWeight).toLocaleString()}kg\u00B7km of bodyweight` },
    ];

    // Year stats (for annual goals)
    const currentYear = new Date().getFullYear();
    const yearEvents = events.filter((e) => e.date && new Date(e.date).getFullYear() === currentYear);
    const hasYearDates = yearEvents.length > 0;
    const yearSource = hasYearDates ? yearEvents : events;
    const yearDistance = yearSource.reduce((s, e) => s + (e.distance || 0) * (e.completions || 1), 0);
    const yearElevation = yearSource.reduce((s, e) => s + (e.elevation || 0) * (e.completions || 1), 0);
    const yearEventCount = yearSource.reduce((s, e) => s + (e.completions || 1), 0);

    // Year-over-year comparison
    const prevYear = currentYear - 1;
    const prevYearEvents = events.filter((e) => e.date && new Date(e.date).getFullYear() === prevYear);
    const prevDist = prevYearEvents.reduce((s, e) => s + (e.distance || 0) * (e.completions || 1), 0);
    const prevElev = prevYearEvents.reduce((s, e) => s + (e.elevation || 0) * (e.completions || 1), 0);
    const prevCount = prevYearEvents.reduce((s, e) => s + (e.completions || 1), 0);
    const yoyComparison = {
      current: { year: currentYear, distance: yearDistance, elevation: yearElevation, events: yearEventCount },
      previous: { year: prevYear, distance: prevDist, elevation: prevElev, events: prevCount },
      hasData: hasYearDates || prevYearEvents.length > 0,
    };

    // Difficulty progression (events with dates, sorted chronologically)
    const difficultyProgression = events
      .filter((e) => e.date && e.difficulty)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({
        name: e.name.length > 14 ? e.name.slice(0, 12) + "…" : e.name,
        difficulty: e.difficulty,
        date: e.date,
      }));

    return {
      totalDistance,
      totalEvents,
      totalElevation,
      highestPeak,
      highestPeakEvent,
      distanceData,
      cumulativeData,
      typeBreakdown,
      personalRecords,
      funFacts,
      yearStats: { yearDistance, yearElevation, yearEvents: yearEventCount, hasYearDates },
      yoyComparison,
      difficultyProgression,
      prTimeline,
    };
  }, [events, bodyWeight]);
}
