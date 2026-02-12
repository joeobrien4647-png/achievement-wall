import { useState, useRef, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

function Lightbox({ photos, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const touchStart = useRef(null);
  const touchDelta = useRef(0);
  const [offsetX, setOffsetX] = useState(0);

  const go = useCallback(
    (dir) => {
      setIndex((i) => {
        const next = i + dir;
        if (next < 0 || next >= photos.length) return i;
        return next;
      });
      setOffsetX(0);
    },
    [photos.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };

  const onTouchMove = (e) => {
    if (touchStart.current === null) return;
    touchDelta.current = e.touches[0].clientX - touchStart.current;
    setOffsetX(touchDelta.current);
  };

  const onTouchEnd = () => {
    const threshold = 60;
    if (touchDelta.current < -threshold) go(1);
    else if (touchDelta.current > threshold) go(-1);
    touchStart.current = null;
    touchDelta.current = 0;
    setOffsetX(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur rounded-full p-2 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
      >
        <X size={22} />
      </button>

      {/* Navigation arrows (desktop) */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); go(-1); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur rounded-full p-2 text-white/70 hover:text-white hover:bg-white/20 transition-colors hidden sm:flex"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); go(1); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur rounded-full p-2 text-white/70 hover:text-white hover:bg-white/20 transition-colors hidden sm:flex"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center p-4 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photos[index]}
          alt=""
          className="max-w-full max-h-full object-contain rounded-xl select-none transition-transform duration-150"
          style={{ transform: `translateX(${offsetX}px)` }}
          draggable={false}
        />
      </div>

      {/* Counter */}
      {photos.length > 1 && (
        <div className="pb-6 text-center">
          <span className="text-white/60 text-sm font-medium bg-white/10 backdrop-blur px-4 py-1.5 rounded-full">
            {index + 1} of {photos.length}
          </span>
        </div>
      )}
    </div>
  );
}

export default function PhotoGallery({ photos }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!photos || photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
