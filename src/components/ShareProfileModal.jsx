import { useState } from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";

const PROFILE_URL = "https://joeobrien4647-png.github.io/achievement-wall/";

/**
 * A modal that displays the shareable profile URL with a copy-to-clipboard button.
 * Clean, simple, and effective -- no heavy QR library needed.
 */
export default function ShareProfileModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = PROFILE_URL;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Joe's Endurance CV",
          text: "Check out my endurance challenge wall!",
          url: PROFILE_URL,
        });
      } catch {
        // User cancelled or share failed silently
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-white font-bold text-lg">Share Profile</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-gray-400 text-sm mb-4">
            Share your endurance wall with anyone using this link.
          </p>

          {/* URL display + copy */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-3 border border-gray-700/50">
            <div className="flex-1 text-sm text-gray-300 truncate font-mono">
              {PROFILE_URL}
            </div>
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600"
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          {copied && (
            <p className="text-emerald-400 text-xs mt-2 text-center font-medium">
              Copied to clipboard!
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex gap-3">
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors border border-gray-700/50"
            >
              <ExternalLink size={14} />
              Open
            </a>
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
