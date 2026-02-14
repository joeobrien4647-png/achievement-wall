import { useState, useEffect } from "react";
import { getStorageSize } from "../lib/storage";

const QUOTA = 5 * 1024 * 1024; // 5MB

function formatMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export default function StorageQuotaMeter() {
  const [used, setUsed] = useState(0);

  useEffect(() => {
    setUsed(getStorageSize());
  }, []);

  const pct = Math.min((used / QUOTA) * 100, 100);
  const color =
    pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-1.5">
      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        {formatMB(used)}MB of 5MB used
      </p>
    </div>
  );
}
