import { useRef, useCallback } from "react";

export function useSwipe(onSwipeLeft, onSwipeRight, { threshold = 80, maxVertical = 100 } = {}) {
  const startRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!startRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startRef.current.x;
    const dy = touch.clientY - startRef.current.y;
    const dt = Date.now() - startRef.current.time;
    startRef.current = null;

    // Must be a quick, mostly-horizontal gesture
    if (dt > 500 || Math.abs(dy) > maxVertical) return;

    if (dx < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (dx > threshold && onSwipeRight) {
      onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight, threshold, maxVertical]);

  return { onTouchStart, onTouchEnd };
}
