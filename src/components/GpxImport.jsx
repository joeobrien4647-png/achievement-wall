import { useState, useRef, useCallback } from "react";
import { Upload, FileText, MapPin, TrendingUp, X } from "lucide-react";
import { parseGPX } from "../lib/gpxParser";

/**
 * Drop-zone component for importing GPX files.
 * Parses the file, shows a summary card with distance/elevation/points,
 * and lets the user apply or clear the result.
 */
export default function GpxImport({ onImport }) {
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setError(null);
    setParsed(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = parseGPX(e.target.result);
        setParsed(result);
      } catch (err) {
        setError(err.message || "Failed to parse GPX file");
      }
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file && file.name.toLowerCase().endsWith(".gpx")) {
        handleFile(file);
      } else {
        setError("Please drop a .gpx file");
      }
    },
    [handleFile],
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const onInputChange = useCallback(
    (e) => {
      handleFile(e.target.files?.[0]);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile],
  );

  const handleApply = useCallback(() => {
    if (!parsed || !onImport) return;
    onImport({
      distance: parsed.distance,
      elevationGain: parsed.elevationGain,
      trackPoints: parsed.trackPoints,
      elevationProfile: parsed.elevationProfile,
    });
  }, [parsed, onImport]);

  const handleClear = useCallback(() => {
    setParsed(null);
    setError(null);
  }, []);

  // Summary card shown after successful parse
  if (parsed) {
    return (
      <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <FileText size={16} />
            <span className="text-sm font-medium">GPX Imported</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-white">
              {parsed.distance.toFixed(1)}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
              km
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp size={14} className="text-orange-400" />
              <span className="text-lg font-bold text-white">
                {parsed.elevationGain.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
              m gain
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <MapPin size={14} className="text-blue-400" />
              <span className="text-lg font-bold text-white">
                {parsed.trackPoints.length.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
              points
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
        >
          Apply to Event
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-colors cursor-pointer ${
          dragging
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-gray-700/50 bg-gray-800/60 hover:border-gray-600"
        }`}
      >
        <Upload
          size={24}
          className={dragging ? "text-emerald-400" : "text-gray-500"}
        />
        <span className="text-sm text-gray-400">
          Drop a <span className="text-gray-300 font-medium">.gpx</span> file
          or click to browse
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".gpx"
        onChange={onInputChange}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
