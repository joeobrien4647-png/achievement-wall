import { useState, useEffect, useRef } from "react";

/**
 * Animates a number from 0 to `value` over ~1.5s using easeOutExpo.
 * Displays with toLocaleString() formatting.
 * Only animates once on first render.
 */
export default function AnimatedNumber({ value, suffix = "", decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    if (hasAnimated.current) return;
    if (typeof value !== "number" || value === 0) {
      setDisplay(value || 0);
      return;
    }

    hasAnimated.current = true;
    const duration = 1500;
    const start = performance.now();

    function easeOutExpo(t) {
      return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplay(eased * value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return (
    <span>
      {formatted}{suffix}
    </span>
  );
}
