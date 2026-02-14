import { useState, useEffect, useRef } from "react";

export default function ParallaxHero({ children, className = "" }) {
  const [offset, setOffset] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    // Respect reduced motion
    const reduced = document.documentElement.classList.contains("reduce-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const onScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        // Only parallax while the hero is visible
        if (rect.bottom > 0) {
          setOffset(Math.max(0, -rect.top * 0.3));
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        style={{ transform: `translateY(${offset}px)` }}
        className="will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
