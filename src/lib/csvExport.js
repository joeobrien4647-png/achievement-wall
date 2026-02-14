/**
 * Export events array as a CSV file download.
 * Columns: Name, Type, Status, Distance(km), Elevation(m), Location, Date, Time, Difficulty, Completions, Rating
 */
export function exportToCSV(events) {
  const headers = ["Name", "Type", "Status", "Distance (km)", "Elevation (m)", "Location", "Date", "Time", "Difficulty", "Completions", "Rating"];

  const escape = (val) => {
    if (val == null) return "";
    const s = String(val);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = events.map((e) => [
    escape(e.name),
    escape(e.type),
    escape(e.status),
    e.distance ?? "",
    e.elevation ?? "",
    escape(e.location),
    e.date ?? "",
    e.time ?? "",
    e.difficulty ?? "",
    e.completions ?? 1,
    e.review?.rating ?? "",
  ].join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `endurance-cv-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export in a simplified Strava-compatible format (activities CSV).
 */
export function exportToStravaCSV(events) {
  const headers = ["Activity Name", "Activity Type", "Activity Date", "Distance", "Elapsed Time", "Elevation Gain"];

  const completed = events.filter((e) => e.status === "completed");
  const rows = completed.map((e) => [
    `"${(e.name || "").replace(/"/g, '""')}"`,
    e.type === "Urban" ? "Run" : "Hike",
    e.date ?? "",
    e.distance ? (e.distance * 1000).toFixed(0) : "", // meters
    e.time ?? "",
    e.elevation ?? "",
  ].join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `strava-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
