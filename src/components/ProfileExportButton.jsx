import { FileDown } from "lucide-react";
import { useStats } from "../hooks/useStats";
import { useEvents } from "../hooks/useEvents";
import { useData } from "../context/DataContext";
import { downloadProfileHTML } from "../lib/profileExport";

export default function ProfileExportButton() {
  const stats = useStats();
  const { events } = useEvents();
  const { state } = useData();

  const handleExport = () => {
    downloadProfileHTML(stats, events, state.preferences);
  };

  return (
    <button
      onClick={handleExport}
      className="w-full flex items-center gap-3 bg-gray-900/60 rounded-xl p-3 border border-gray-700/30 hover:border-gray-600 transition-colors text-left"
    >
      <FileDown size={18} className="text-sky-400" />
      <div>
        <div className="text-white text-sm font-medium">Export Profile HTML</div>
        <div className="text-gray-500 text-xs">Shareable standalone page</div>
      </div>
    </button>
  );
}
