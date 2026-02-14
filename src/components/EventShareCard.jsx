import { useRef, useEffect, useState } from "react";
import { Download, Copy, X } from "lucide-react";
import { TYPE_COLORS } from "../data/schema";
import { parseTime, formatDuration } from "../lib/pace";

/**
 * Generates and displays a branded share image for a single event.
 * Uses HTML Canvas for pixel-perfect rendering, matching the
 * existing ShareCard pattern but focused on one event.
 */
export default function EventShareCard({ event, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = renderEventCard(event);
    canvasRef.current = canvas;
  }, [event]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event.name.replace(/\s+/g, "-").toLowerCase()}-card.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise((resolve) =>
        canvasRef.current.toBlob(resolve, "image/png")
      );
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      handleDownload();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white"
        >
          <X size={24} />
        </button>

        <canvas
          ref={(el) => {
            if (el && canvasRef.current) {
              el.width = 450;
              el.height = 600;
              el.getContext("2d").drawImage(
                canvasRef.current,
                0,
                0,
                el.width,
                el.height
              );
            }
          }}
          width={450}
          height={600}
          className="w-full rounded-xl shadow-2xl"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors"
          >
            <Download size={18} /> Download
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl border border-gray-700 transition-colors"
          >
            <Copy size={18} /> {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Renders a branded card image for a single event on an offscreen canvas. */
function renderEventCard(event) {
  const W = 900;
  const H = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const typeColor = TYPE_COLORS[event.type] || "#8b5cf6";

  // -- Background --
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f172a");
  bg.addColorStop(0.5, "#1e1b4b");
  bg.addColorStop(1, "#0f172a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial accent glow using the type color
  ctx.globalAlpha = 0.1;
  const glow = ctx.createRadialGradient(W / 2, 350, 0, W / 2, 350, 500);
  glow.addColorStop(0, typeColor);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // -- Badge emoji (large) --
  ctx.textAlign = "center";
  ctx.font = "96px system-ui, -apple-system, sans-serif";
  ctx.fillText(event.badge || "🏆", W / 2, 180);

  // -- Type badge --
  const typeText = (event.type || "").toUpperCase();
  ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
  const typeW = ctx.measureText(typeText).width + 32;
  roundRect(ctx, (W - typeW) / 2, 210, typeW, 30, 15);
  ctx.fillStyle = typeColor + "30";
  ctx.fill();
  ctx.fillStyle = typeColor;
  ctx.textAlign = "center";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText(typeText, W / 2, 231);

  // -- Event name --
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  // Truncate if too long
  const name = event.name.length > 24 ? event.name.slice(0, 22) + "..." : event.name;
  ctx.fillText(name, W / 2, 310);

  // -- Location --
  if (event.location) {
    ctx.fillStyle = "#9ca3af";
    ctx.font = "18px system-ui, -apple-system, sans-serif";
    ctx.fillText(event.location, W / 2, 348);
  }

  // -- Divider --
  const divGrad = ctx.createLinearGradient(200, 0, 700, 0);
  divGrad.addColorStop(0, "transparent");
  divGrad.addColorStop(0.5, "#374151");
  divGrad.addColorStop(1, "transparent");
  ctx.fillStyle = divGrad;
  ctx.fillRect(200, 380, 500, 1);

  // -- Stats grid --
  const stats = [];
  if (event.distance)
    stats.push({ val: `${event.distance}km`, label: "DISTANCE", color: "#10b981" });
  if (event.elevation)
    stats.push({ val: `${event.elevation.toLocaleString()}m`, label: "ELEVATION", color: "#f59e0b" });
  if (event.difficulty)
    stats.push({ val: `${event.difficulty}/5`, label: "DIFFICULTY", color: "#ef4444" });

  const timeSec = parseTime(event.time);
  if (timeSec)
    stats.push({ val: formatDuration(timeSec), label: "TIME", color: "#06b6d4" });

  if (stats.length > 0) {
    const cols = Math.min(stats.length, 4);
    const boxW = 160;
    const boxH = 110;
    const gap = 20;
    const totalW = boxW * cols + gap * (cols - 1);
    const startX = (W - totalW) / 2;
    const startY = 420;

    stats.forEach((s, i) => {
      const x = startX + i * (boxW + gap);
      // Box
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      roundRect(ctx, x, startY, boxW, boxH, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      roundRect(ctx, x, startY, boxW, boxH, 16);
      ctx.stroke();
      // Value
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.val, x + boxW / 2, startY + 50);
      // Label
      ctx.fillStyle = s.color;
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.fillText(s.label, x + boxW / 2, startY + 80);
    });
  }

  // -- Difficulty dots --
  if (event.difficulty) {
    const dotsY = 590;
    const dotR = 8;
    const dotGap = 24;
    const dotsStartX = W / 2 - (4 * dotGap) / 2;
    ctx.fillStyle = "#6b7280";
    ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DIFFICULTY", W / 2, dotsY - 18);

    for (let i = 0; i < 5; i++) {
      const cx = dotsStartX + i * dotGap;
      ctx.beginPath();
      ctx.arc(cx, dotsY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = i < event.difficulty ? "#f59e0b" : "rgba(255,255,255,0.1)";
      ctx.fill();
    }
  }

  // -- Date --
  if (event.date) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "18px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(event.date, W / 2, 660);
  }

  // -- Stylized elevation silhouette at bottom --
  drawMiniProfile(ctx, W, H, event, typeColor);

  // -- Branding footer --
  ctx.fillStyle = "#4b5563";
  ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Joe's Endurance CV", W / 2, H - 40);

  ctx.fillStyle = "#374151";
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.fillText("Built with grit, tracked with code", W / 2, H - 20);

  return canvas;
}

/** Draws a small decorative elevation silhouette near the bottom of the card. */
function drawMiniProfile(ctx, W, H, event, color) {
  const baseY = H - 80;
  const profileH = 180;
  const startY = baseY - profileH;
  const points = 80;

  const waves = getMiniWaves(event.type, event.distance || 50);

  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const x = t * W;
    let y = 0;
    for (const w of waves) {
      y += Math.sin(t * Math.PI * w.freq + w.phase) * w.amp;
    }
    // Normalize to 0..1
    const plotY = startY + profileH * (1 - (y + 1.5) / 3);
    if (i === 0) ctx.moveTo(x, plotY);
    else ctx.lineTo(x, plotY);
  }
  ctx.lineTo(W, baseY);
  ctx.lineTo(0, baseY);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, startY, 0, baseY);
  grad.addColorStop(0, color + "25");
  grad.addColorStop(1, color + "05");
  ctx.fillStyle = grad;
  ctx.fill();
}

function getMiniWaves(type, distance) {
  const seed = (distance * 7.3) % 17;
  if (type === "Mountain") {
    return [
      { freq: 1.2 + seed * 0.05, amp: 1.0, phase: 0.3 },
      { freq: 2.8, amp: 0.5, phase: 1.2 },
    ];
  }
  if (type === "Ultra") {
    return [
      { freq: 2.0 + seed * 0.04, amp: 0.6, phase: 0.5 },
      { freq: 4.0, amp: 0.3, phase: 1.8 },
    ];
  }
  // Urban
  return [
    { freq: 1.5, amp: 0.15, phase: seed * 0.2 },
    { freq: 3.0, amp: 0.08, phase: 1.0 },
    { freq: 0.5, amp: 0.3, phase: 0.0 },
  ];
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
