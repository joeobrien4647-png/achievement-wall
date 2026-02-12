import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Lightweight confetti burst rendered on a <canvas>.
 * 30-40 falling coloured particles for ~2 seconds. Zero dependencies.
 */
function Confetti({ onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const colors = [
      "#f59e0b", "#10b981", "#8b5cf6", "#ef4444",
      "#ec4899", "#06b6d4", "#f97316", "#84cc16",
    ];

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * w,
      y: -10 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 3,
      vy: 1.5 + Math.random() * 3,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
    }));

    const start = performance.now();
    const duration = 2000;
    let raf;

    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.06; // gravity
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, 1 - progress * 1.2);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (progress < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        onDone?.();
      }
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

/**
 * AchievementToast — slides down from the top when new achievements unlock.
 *
 * Props:
 *   achievements: array of { id, name, icon, description }
 *   onDismiss: called after the last toast auto-dismisses
 */
export default function AchievementToast({ achievements, onDismiss }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [confettiDone, setConfettiDone] = useState(false);
  const timerRef = useRef(null);

  // Populate the queue when achievements change
  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setQueue([...achievements]);
    }
  }, [achievements]);

  // Process the queue one at a time
  useEffect(() => {
    if (current || queue.length === 0) return;

    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
    setConfettiDone(false);

    // Slide in
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss after 4 seconds
    timerRef.current = setTimeout(() => {
      setVisible(false);
      // Wait for slide-out animation before clearing
      setTimeout(() => {
        setCurrent(null);
        if (rest.length === 0) onDismiss?.();
      }, 350);
    }, 4000);

    return () => clearTimeout(timerRef.current);
  }, [queue, current, onDismiss]);

  const handleConfettiDone = useCallback(() => setConfettiDone(true), []);

  if (!current) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] flex justify-center pointer-events-none px-4 pt-4">
      <div
        className={`relative overflow-hidden bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl shadow-black/40 max-w-sm w-full pointer-events-auto transition-all duration-350 ${
          visible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        {/* Confetti canvas overlay */}
        {!confettiDone && <Confetti onDone={handleConfettiDone} />}

        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-indigo-500" />

        <div className="relative flex items-center gap-3 px-5 py-4">
          <div className="text-4xl flex-shrink-0 animate-bounce">
            {current.icon}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-0.5">
              Achievement Unlocked
            </div>
            <div className="text-white font-bold text-sm truncate">
              {current.name}
            </div>
            <div className="text-gray-400 text-xs mt-0.5 leading-snug">
              {current.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
