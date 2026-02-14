import { TYPE_COLORS } from "../data/schema";

/**
 * Generates a self-contained static HTML file that serves as a shareable
 * public profile page. No server, no external dependencies -- just open
 * the HTML file in any browser.
 */
export function generateProfileHTML(stats, events, preferences) {
  const completed = events.filter((e) => e.status === "completed");
  const highestDifficulty = Math.max(...completed.map((e) => e.difficulty || 0), 0);
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const eventsHTML = completed
    .sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0))
    .map((e) => {
      const typeColor = TYPE_COLORS[e.type] || "#6b7280";
      const dots = Array.from({ length: 5 })
        .map((_, i) =>
          `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:2px;background:${i < (e.difficulty || 0) ? "#fbbf24" : "#374151"}"></span>`
        )
        .join("");

      const distLabel = e.distance ? `${e.distance}km` : "";
      const elevLabel = e.elevation ? `${e.elevation.toLocaleString()}m` : "";
      const separator = distLabel && elevLabel ? " &middot; " : "";

      return `
        <div class="event-card">
          <div class="event-header">
            <span class="event-name">${escapeHTML(e.name)}</span>
            <span class="type-badge" style="background:${typeColor}20;color:${typeColor}">${escapeHTML(e.type)}</span>
          </div>
          <div class="event-meta">
            ${distLabel || elevLabel ? `<span class="event-metrics">${distLabel}${separator}${elevLabel}</span>` : ""}
            <span class="event-dots">${dots}</span>
          </div>
        </div>`;
    })
    .join("\n");

  const funFactsHTML = (stats.funFacts || [])
    .map(
      (f) => `
        <div class="fun-fact">
          <span class="fun-fact-icon">${f.icon}</span>
          <span>${escapeHTML(f.text)}</span>
        </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Joe's Endurance CV - A shareable profile of endurance achievements">
  <meta name="theme-color" content="#030712">
  <title>Joe's Endurance CV</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #030712;
      color: #e5e7eb;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 640px;
      margin: 0 auto;
      padding: 2rem 1.25rem 3rem;
    }

    /* ---- Header ---- */
    .header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .header h1 {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #ffffff;
    }
    .header .trophy { font-size: 1.75rem; }

    /* ---- Stat Grid ---- */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    @media (min-width: 480px) {
      .stat-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .stat-card {
      background: #1f2937;
      border-radius: 0.75rem;
      padding: 1rem;
      text-align: center;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
    }
    .stat-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #9ca3af;
      margin-top: 0.25rem;
    }

    /* ---- Section headings ---- */
    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #9ca3af;
      margin-bottom: 0.75rem;
    }

    /* ---- Event Cards ---- */
    .events-list { margin-bottom: 2rem; }
    .event-card {
      background: #1f2937;
      border-radius: 0.75rem;
      padding: 0.875rem 1rem;
      margin-bottom: 0.5rem;
    }
    .event-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.375rem;
    }
    .event-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: #ffffff;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .type-badge {
      flex-shrink: 0;
      font-size: 0.625rem;
      font-weight: 700;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
    }
    .event-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .event-metrics {
      font-size: 0.75rem;
      color: #9ca3af;
    }
    .event-dots {
      display: flex;
      align-items: center;
    }

    /* ---- Fun Facts ---- */
    .fun-facts { margin-bottom: 2rem; }
    .fun-fact {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #d1d5db;
      line-height: 1.5;
      margin-bottom: 0.375rem;
    }
    .fun-fact-icon { flex-shrink: 0; }

    /* ---- Footer ---- */
    .footer {
      text-align: center;
      font-size: 0.6875rem;
      color: #6b7280;
      border-top: 1px solid #1f2937;
      padding-top: 1.5rem;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><span class="trophy">\u{1F3C6}</span> JOE'S ENDURANCE CV</h1>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.totalEvents}</div>
        <div class="stat-label">Total Events</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalDistance}</div>
        <div class="stat-label">Total Km</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalElevation.toLocaleString()}</div>
        <div class="stat-label">Total Elevation (m)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${highestDifficulty}/5</div>
        <div class="stat-label">Highest Difficulty</div>
      </div>
    </div>

    <div class="events-list">
      <div class="section-title">Completed Events</div>
      ${eventsHTML}
    </div>

    ${funFactsHTML ? `
    <div class="fun-facts">
      <div class="section-title">Fun Facts</div>
      ${funFactsHTML}
    </div>` : ""}

    <div class="footer">
      Generated from Achievement Wall &bull; ${escapeHTML(dateStr)}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers a browser download of the generated HTML profile.
 */
export function downloadProfileHTML(stats, events, preferences) {
  const html = generateProfileHTML(stats, events, preferences);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `endurance-cv-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---- helpers ---- */

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
