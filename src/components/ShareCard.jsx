import { useRef, useEffect, useState } from "react";
import { Download, Copy, X } from "lucide-react";
import { renderShareCard, downloadCard, copyCardToClipboard } from "../lib/shareCard";

export default function ShareCard({ stats, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = renderShareCard(stats);
    canvasRef.current = canvas;
  }, [stats]);

  const handleCopy = async () => {
    try {
      await copyCardToClipboard(canvasRef.current);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not supported — fall back to download
      downloadCard(canvasRef.current);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white">
          <X size={24} />
        </button>

        <canvas
          ref={(el) => {
            if (el && canvasRef.current) {
              el.getContext("2d").drawImage(canvasRef.current, 0, 0, el.width, el.height);
            }
          }}
          width={450}
          height={600}
          className="w-full rounded-xl shadow-2xl"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => downloadCard(canvasRef.current)}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors"
          >
            <Download size={18} /> Download PNG
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
