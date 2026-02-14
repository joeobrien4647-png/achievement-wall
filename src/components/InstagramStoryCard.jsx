import { useState, useRef, useEffect } from "react";
import { X, Download, Instagram } from "lucide-react";

export default function InstagramStoryCard({ stats, onClose }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1920;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#1e1b4b");
    bg.addColorStop(0.5, "#312e81");
    bg.addColorStop(1, "#000000");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(200, 400, 300, 0, Math.PI * 2);
    ctx.fillStyle = "#8b5cf6";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(880, 1400, 250, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.globalAlpha = 1;

    // Trophy emoji placeholder (text)
    ctx.font = "120px serif";
    ctx.textAlign = "center";
    ctx.fillText("\u{1F3C6}", W/2, 280);

    // Title
    ctx.font = "bold 64px -apple-system, system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("JOE'S ENDURANCE CV", W/2, 400);

    // Subtitle
    ctx.font = "28px -apple-system, system-ui, sans-serif";
    ctx.fillStyle = "#a5b4fc";
    ctx.fillText("Every kilometre earned. Every peak conquered.", W/2, 460);

    // Stats row
    const statItems = [
      { value: String(stats.totalEvents), label: "EVENTS" },
      { value: `${stats.totalDistance}km`, label: "DISTANCE" },
      { value: `${Math.round(stats.totalElevation/1000)}k m`, label: "ELEVATION" },
    ];

    const statY = 580;
    const statSpacing = W / (statItems.length + 1);
    statItems.forEach((s, i) => {
      const x = statSpacing * (i + 1);
      // Card bg
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.roundRect(x - 130, statY - 60, 260, 140, 20);
      ctx.fill();
      // Value
      ctx.font = "bold 56px -apple-system, system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(s.value, x, statY + 10);
      // Label
      ctx.font = "bold 20px -apple-system, system-ui, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(s.label, x, statY + 55);
    });

    // Top events
    ctx.textAlign = "left";
    ctx.font = "bold 36px -apple-system, system-ui, sans-serif";
    ctx.fillStyle = "#a5b4fc";
    ctx.fillText("TOP CHALLENGES", 100, 850);

    const topEvts = (stats.topEvents || []).slice(0, 5);
    topEvts.forEach((evt, i) => {
      const y = 920 + i * 100;
      // Row bg
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.beginPath();
      ctx.roundRect(80, y - 30, W - 160, 80, 16);
      ctx.fill();
      // Badge
      ctx.font = "40px serif";
      ctx.textAlign = "left";
      ctx.fillText(evt.badge || "\u{1F3D4}\u{FE0F}", 110, y + 25);
      // Name
      ctx.font = "bold 32px -apple-system, system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(evt.name?.slice(0, 28) || "", 180, y + 10);
      // Distance
      ctx.font = "24px -apple-system, system-ui, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(evt.distance ? `${evt.distance}km` : "", 180, y + 45);
      // Right side distance bold
      if (evt.distance) {
        ctx.textAlign = "right";
        ctx.font = "bold 36px -apple-system, system-ui, sans-serif";
        ctx.fillStyle = "#10b981";
        ctx.fillText(`${evt.distance}km`, W - 110, y + 20);
        ctx.textAlign = "left";
      }
    });

    // Badges count
    const badgeY = 920 + topEvts.length * 100 + 60;
    ctx.textAlign = "center";
    ctx.font = "bold 28px -apple-system, system-ui, sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`\u{1F3C5} ${stats.badgesCount || 0} badges unlocked`, W/2, badgeY);

    // Watermark
    ctx.font = "24px -apple-system, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText("achievement-wall", W/2, H - 60);

    setReady(true);
  }, [stats]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "endurance-cv-story.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 max-w-sm w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Instagram size={18} className="text-pink-400" />
            <span className="text-white font-bold text-sm">Story Card</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="aspect-[9/16] rounded-xl overflow-hidden bg-gray-800 mb-3">
          <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "auto" }} />
        </div>
        {ready && (
          <button onClick={handleDownload}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2">
            <Download size={16} /> Download for Instagram
          </button>
        )}
      </div>
    </div>
  );
}
