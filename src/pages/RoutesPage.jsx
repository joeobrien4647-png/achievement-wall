import { useState, useRef } from "react";
import { Map, Upload, Trash2, Link2, FileText, TrendingUp } from "lucide-react";
import { useData } from "../context/DataContext";
import { parseGPX } from "../lib/gpxParser";

export default function RoutesPage() {
  const { state, dispatch } = useData();
  const routes = state.preferences?.routes ?? [];
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const setRoutes = (newRoutes) => dispatch({ type: "UPDATE_PREFERENCES", payload: { routes: newRoutes } });

  const handleFile = (file) => {
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = parseGPX(e.target.result);
        const route = {
          id: Date.now().toString(36),
          name: file.name.replace(/\.gpx$/i, ""),
          distance: Math.round(result.distance * 10) / 10,
          elevationGain: Math.round(result.elevationGain),
          pointCount: result.trackPoints.length,
          addedAt: new Date().toISOString(),
          // Store minimal data to save space — just summary, not full track
        };
        setRoutes([...routes, route]);
      } catch (err) {
        setError(err.message || "Failed to parse GPX");
      }
    };
    reader.readAsText(file);
  };

  const removeRoute = (id) => {
    setRoutes(routes.filter((r) => r.id !== id));
  };

  const eventsUsingRoute = (routeId) => {
    // Future: match events by distance/name similarity
    return [];
  };

  return (
    <div className="px-4 pb-24 sm:pb-8 pt-4 space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Route Library</h2>
        <p className="text-gray-500 text-sm">Save and reuse GPX routes across events</p>
      </div>

      {/* Upload zone */}
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-2xl border-2 border-dashed border-gray-700/50 p-6 flex flex-col items-center gap-2 bg-gray-800/30 hover:border-gray-500 transition-colors cursor-pointer"
      >
        <Upload size={24} className="text-gray-500" />
        <span className="text-sm text-gray-400">
          Upload a <span className="text-gray-300 font-medium">.gpx</span> file to your library
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".gpx"
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
        className="hidden"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Route list */}
      {routes.length === 0 ? (
        <div className="text-center py-12">
          <Map size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No routes saved yet</p>
          <p className="text-gray-600 text-xs mt-1">Upload GPX files to build your library</p>
        </div>
      ) : (
        <div className="space-y-3">
          {routes.map((route) => (
            <div key={route.id} className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-indigo-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm truncate">{route.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-emerald-400 text-xs font-bold">{route.distance}km</span>
                    <span className="flex items-center gap-1 text-orange-400 text-xs">
                      <TrendingUp size={12} /> {route.elevationGain}m
                    </span>
                    <span className="text-gray-600 text-xs">{route.pointCount} pts</span>
                  </div>
                </div>
                <button
                  onClick={() => removeRoute(route.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
