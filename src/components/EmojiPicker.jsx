import { BADGE_EMOJIS } from "../data/schema";

export default function EmojiPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {BADGE_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={`text-2xl h-11 rounded-xl border-2 transition-all flex items-center justify-center ${
            value === emoji
              ? "border-white bg-gray-700 scale-105"
              : "border-gray-700 bg-gray-800 hover:border-gray-500"
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
