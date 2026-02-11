import { useState } from "react";
import { Sparkles, Plus, Trash2, X } from "lucide-react";
import { useData } from "../context/DataContext";
import { useEvents } from "../hooks/useEvents";
import { getDailyMantra, getContextMessage } from "../lib/mantras";
import { computeStreaks } from "../lib/streaks";
import { daysUntil } from "../lib/countdown";

export default function MotivationCard() {
  const { state, dispatch } = useData();
  const { upcoming } = useEvents();
  const [showAll, setShowAll] = useState(false);
  const [newMantra, setNewMantra] = useState("");

  const mantras = state.preferences?.mantras ?? [];
  const dailyMantra = getDailyMantra(mantras);
  const checkins = state.preferences?.weeklyCheckins ?? [];
  const { current: streakWeeks } = computeStreaks(checkins);

  const eventDays = upcoming?.date ? daysUntil(upcoming.date) : null;
  const contextMsg = getContextMessage(eventDays, upcoming?.name, streakWeeks);

  const handleAdd = () => {
    const text = newMantra.trim();
    if (!text) return;
    dispatch({
      type: "UPDATE_PREFERENCES",
      payload: { mantras: [...mantras, text] },
    });
    setNewMantra("");
  };

  const handleDelete = (index) => {
    dispatch({
      type: "UPDATE_PREFERENCES",
      payload: { mantras: mantras.filter((_, i) => i !== index) },
    });
  };

  if (!dailyMantra && !contextMsg) return null;

  return (
    <>
      <button
        onClick={() => setShowAll(true)}
        className="w-full bg-gray-800/60 rounded-2xl p-5 border border-gray-700/50 text-center hover:border-gray-600 transition-all active:scale-[0.99]"
      >
        {contextMsg && (
          <div className="text-amber-400 text-xs font-bold mb-2">
            {contextMsg}
          </div>
        )}
        {dailyMantra && (
          <p className="text-gray-200 text-sm italic leading-relaxed">
            &ldquo;{dailyMantra}&rdquo;
          </p>
        )}
        <div className="text-gray-600 text-[10px] mt-2 flex items-center justify-center gap-1">
          <Sparkles size={10} /> Tap for all mantras
        </div>
      </button>

      {showAll && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={() => setShowAll(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between z-10">
              <h3 className="text-white font-bold">Your Mantras</h3>
              <button
                onClick={() => setShowAll(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {mantras.map((m, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-gray-800/60 rounded-xl p-3 border border-gray-700/30 group"
                >
                  <Sparkles size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm flex-1 italic">
                    &ldquo;{m}&rdquo;
                  </span>
                  <button
                    onClick={() => handleDelete(i)}
                    className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {mantras.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No mantras yet. Add one below.
                </p>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-4 z-10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMantra}
                  onChange={(e) => setNewMantra(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Add a mantra..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAdd}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-3 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
