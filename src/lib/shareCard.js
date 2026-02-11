export function renderShareCard({ totalEvents, totalDistance, totalElevation, topEvents, badgesCount }) {
  const W = 900, H = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f172a");
  bg.addColorStop(0.5, "#1e1b4b");
  bg.addColorStop(1, "#0f172a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial accents
  ctx.globalAlpha = 0.08;
  const r1 = ctx.createRadialGradient(180, 600, 0, 180, 600, 400);
  r1.addColorStop(0, "#8b5cf6");
  r1.addColorStop(1, "transparent");
  ctx.fillStyle = r1;
  ctx.fillRect(0, 0, W, H);
  const r2 = ctx.createRadialGradient(720, 600, 0, 720, 600, 400);
  r2.addColorStop(0, "#ef4444");
  r2.addColorStop(1, "transparent");
  ctx.fillStyle = r2;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // Title
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px system-ui, -apple-system, sans-serif";
  ctx.fillText("JOE'S ENDURANCE CV", W / 2, 120);

  // Subtitle line
  ctx.fillStyle = "#6b7280";
  ctx.font = "16px system-ui, -apple-system, sans-serif";
  ctx.fillText("Every kilometre earned. Every peak conquered.", W / 2, 160);

  // Divider
  const divGrad = ctx.createLinearGradient(200, 0, 700, 0);
  divGrad.addColorStop(0, "transparent");
  divGrad.addColorStop(0.5, "#374151");
  divGrad.addColorStop(1, "transparent");
  ctx.fillStyle = divGrad;
  ctx.fillRect(200, 190, 500, 1);

  // Stat boxes
  const stats = [
    { val: `${totalEvents}`, label: "EVENTS", color: "#f59e0b" },
    { val: `${totalDistance}km`, label: "DISTANCE", color: "#10b981" },
    { val: `${(totalElevation / 1000).toFixed(1)}k m`, label: "ELEVATION", color: "#8b5cf6" },
    { val: `${badgesCount}`, label: "BADGES", color: "#ef4444" },
  ];

  const boxW = 170, boxH = 120, gap = 25;
  const startX = (W - (boxW * 4 + gap * 3)) / 2;
  const statY = 230;

  stats.forEach((s, i) => {
    const x = startX + i * (boxW + gap);
    // Box background
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, x, statY, boxW, boxH, 16);
    ctx.fill();
    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    roundRect(ctx, x, statY, boxW, boxH, 16);
    ctx.stroke();
    // Value
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(s.val, x + boxW / 2, statY + 55);
    // Label
    ctx.fillStyle = s.color;
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText(s.label, x + boxW / 2, statY + 85);
    ctx.letterSpacing = "0px";
  });

  // Top events section
  ctx.fillStyle = "#6b7280";
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("TOP CHALLENGES", 80, 420);

  topEvents.slice(0, 5).forEach((ev, i) => {
    const y = 450 + i * 100;

    // Card bg
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    roundRect(ctx, 60, y, W - 120, 80, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    roundRect(ctx, 60, y, W - 120, 80, 16);
    ctx.stroke();

    // Badge emoji
    ctx.font = "32px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(ev.badge || "🏆", 110, y + 52);

    // Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(ev.name, 155, y + 38);

    // Details
    ctx.fillStyle = "#9ca3af";
    ctx.font = "14px system-ui, -apple-system, sans-serif";
    const details = [ev.type, ev.distance ? `${ev.distance}km` : null, ev.location].filter(Boolean).join(" · ");
    ctx.fillText(details, 155, y + 62);
  });

  // Footer
  const footY = H - 60;
  ctx.fillStyle = "#374151";
  ctx.fillRect(200, footY - 30, 500, 1);
  ctx.fillStyle = "#4b5563";
  ctx.font = "14px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Built with grit, tracked with code", W / 2, footY);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function downloadCard(canvas) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "endurance-cv.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export async function copyCardToClipboard(canvas) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
