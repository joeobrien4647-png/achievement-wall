import { useState, useMemo } from "react";
import { Calculator, Clock, Route } from "lucide-react";

const SPLIT_DISTANCES = [
  { label: "1 km", km: 1 },
  { label: "5 km", km: 5 },
  { label: "10 km", km: 10 },
  { label: "Half Marathon", km: 21.1 },
  { label: "Marathon", km: 42.2 },
  { label: "50 km", km: 50 },
  { label: "100 km", km: 100 },
];

const PREDICT_DISTANCES = [
  { label: "5 km", km: 5 },
  { label: "10 km", km: 10 },
  { label: "Half Marathon", km: 21.1 },
  { label: "Marathon", km: 42.2 },
  { label: "50 km", km: 50 },
  { label: "100 km", km: 100 },
];

/** Format total seconds into "Xh Ym Zs" or "Xm Zs". */
function formatTime(totalSec) {
  if (!totalSec || !isFinite(totalSec) || totalSec <= 0) return "--";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

/** Format pace in seconds/km into "M:SS". */
function formatPace(secPerUnit) {
  if (!secPerUnit || !isFinite(secPerUnit) || secPerUnit <= 0) return "--";
  const m = Math.floor(secPerUnit / 60);
  const s = Math.round(secPerUnit % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Riegel's formula: T2 = T1 * (D2 / D1) ^ 1.06 */
function riegelPredict(t1Seconds, d1Km, d2Km) {
  if (!t1Seconds || !d1Km || !d2Km || d1Km <= 0) return null;
  return t1Seconds * Math.pow(d2Km / d1Km, 1.06);
}

function InputField({ label, value, onChange, placeholder, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
        {Icon && <Icon size={12} />}
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl text-white px-3 py-2.5 text-sm
                   placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                   transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}

function StatDisplay({ label, value, color }) {
  return (
    <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
      <div className="text-2xl font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

export default function PaceCalculatorPage() {
  // Pace calculator inputs
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [distance, setDistance] = useState("");

  // Race predictor inputs
  const [knownHours, setKnownHours] = useState("");
  const [knownMinutes, setKnownMinutes] = useState("");
  const [knownDistance, setKnownDistance] = useState("");

  // Computed pace values
  const paceResults = useMemo(() => {
    const h = parseFloat(hours) || 0;
    const m = parseFloat(minutes) || 0;
    const d = parseFloat(distance) || 0;

    const totalSeconds = h * 3600 + m * 60;
    if (totalSeconds <= 0 || d <= 0) return null;

    const secPerKm = totalSeconds / d;
    const secPerMile = secPerKm * 1.60934;
    const speedKmh = d / (totalSeconds / 3600);

    return { secPerKm, secPerMile, speedKmh, totalSeconds, distanceKm: d };
  }, [hours, minutes, distance]);

  // Split predictions
  const splits = useMemo(() => {
    if (!paceResults) return [];
    return SPLIT_DISTANCES.map(({ label, km }) => ({
      label,
      km,
      time: formatTime(paceResults.secPerKm * km),
    }));
  }, [paceResults]);

  // Riegel race predictions
  const predictions = useMemo(() => {
    const h = parseFloat(knownHours) || 0;
    const m = parseFloat(knownMinutes) || 0;
    const d = parseFloat(knownDistance) || 0;

    const totalSec = h * 3600 + m * 60;
    if (totalSec <= 0 || d <= 0) return [];

    return PREDICT_DISTANCES.map(({ label, km }) => {
      const predicted = riegelPredict(totalSec, d, km);
      return {
        label,
        km,
        time: formatTime(predicted),
        pace: formatPace(predicted / km),
      };
    });
  }, [knownHours, knownMinutes, knownDistance]);

  return (
    <div className="px-4 pb-24 sm:pb-8 pt-4 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Pace Calculator</h2>
        <p className="text-gray-500 text-sm">Splits, pace, and race predictions</p>
      </div>

      {/* Pace Calculator Section */}
      <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Calculator size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Calculate Pace</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <InputField
            label="Hours"
            value={hours}
            onChange={setHours}
            placeholder="0"
            icon={Clock}
          />
          <InputField
            label="Minutes"
            value={minutes}
            onChange={setMinutes}
            placeholder="0"
            icon={Clock}
          />
          <InputField
            label="Distance (km)"
            value={distance}
            onChange={setDistance}
            placeholder="0"
            icon={Route}
          />
        </div>

        {/* Results */}
        {paceResults && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <StatDisplay
              label="Pace /km"
              value={formatPace(paceResults.secPerKm)}
              color="#10b981"
            />
            <StatDisplay
              label="Pace /mile"
              value={formatPace(paceResults.secPerMile)}
              color="#8b5cf6"
            />
            <StatDisplay
              label="Speed km/h"
              value={paceResults.speedKmh.toFixed(1)}
              color="#f59e0b"
            />
          </div>
        )}
      </div>

      {/* Split Table */}
      {splits.length > 0 && (
        <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Route size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Predicted Splits</h3>
          </div>

          <div className="space-y-0">
            {/* Header row */}
            <div className="grid grid-cols-3 text-[10px] text-gray-500 uppercase tracking-wider font-bold pb-2 border-b border-gray-700/50">
              <span>Distance</span>
              <span className="text-right">Time</span>
              <span className="text-right">Pace /km</span>
            </div>

            {splits.map((split) => (
              <div
                key={split.label}
                className="grid grid-cols-3 py-2.5 border-b border-gray-700/30 last:border-0"
              >
                <span className="text-gray-300 text-sm font-medium">
                  {split.label}
                </span>
                <span className="text-white text-sm font-bold text-right">
                  {split.time}
                </span>
                <span className="text-gray-400 text-sm text-right">
                  {formatPace(paceResults.secPerKm)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Race Predictor Section */}
      <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-white">Race Predictor</h3>
        </div>
        <p className="text-gray-500 text-xs -mt-2">
          Enter a known race result to predict other distances using Riegel's formula
        </p>

        <div className="grid grid-cols-3 gap-3">
          <InputField
            label="Hours"
            value={knownHours}
            onChange={setKnownHours}
            placeholder="0"
            icon={Clock}
          />
          <InputField
            label="Minutes"
            value={knownMinutes}
            onChange={setKnownMinutes}
            placeholder="0"
            icon={Clock}
          />
          <InputField
            label="Distance (km)"
            value={knownDistance}
            onChange={setKnownDistance}
            placeholder="0"
            icon={Route}
          />
        </div>

        {/* Predictions */}
        {predictions.length > 0 && (
          <div className="space-y-0 pt-2">
            <div className="grid grid-cols-3 text-[10px] text-gray-500 uppercase tracking-wider font-bold pb-2 border-b border-gray-700/50">
              <span>Race</span>
              <span className="text-right">Predicted Time</span>
              <span className="text-right">Pace /km</span>
            </div>

            {predictions.map((pred) => {
              const isKnownDist =
                Math.abs(pred.km - (parseFloat(knownDistance) || 0)) < 0.1;
              return (
                <div
                  key={pred.label}
                  className={`grid grid-cols-3 py-2.5 border-b border-gray-700/30 last:border-0 ${
                    isKnownDist ? "opacity-50" : ""
                  }`}
                >
                  <span className="text-gray-300 text-sm font-medium">
                    {pred.label}
                  </span>
                  <span className="text-white text-sm font-bold text-right">
                    {pred.time}
                  </span>
                  <span className="text-gray-400 text-sm text-right">
                    {pred.pace}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Formula Note */}
      <div className="text-center text-gray-600 text-[10px] pb-2">
        Race predictions use Riegel's formula: T2 = T1 x (D2/D1)^1.06
      </div>
    </div>
  );
}
