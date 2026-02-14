import { useState, useEffect, useRef } from "react";

/**
 * Animates a number from its previous value to `value` using a spring-like
 * easeOutExpo curve over ~1s. Re-animates whenever `value` changes.
 * Respects reduced-motion by skipping animation entirely.
 */
export default function AnimatedNumber({ value, suffix = "", decimals = 0 }) {
  const [display, setDisplay] = useState(value || 0);
  const prevValue = useRef(value || 0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (typeof value !== "number") {
      setDisplay(value || 0);
      return;
    }

    // Respect reduced motion — snap immediately
    const reduced =
      document.documentElement.classList.contains("reduce-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      prevValue.current = value;
      return;
    }

    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    // No animation needed when values match
    if (from === to) {
      setDisplay(to);
      return;
    }

    // Cancel any in-flight animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const duration = 1000;
    const start = performance.now();

    function easeOutExpo(t) {
      return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplay(from + (to - from) * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

  return (
    <span>
      {formatted}{suffix}
    </span>
  );
}
