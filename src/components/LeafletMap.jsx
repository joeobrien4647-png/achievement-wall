import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { matchLocation } from "../data/ukMap";
import { TYPE_COLORS } from "../data/schema";
import "leaflet/dist/leaflet.css";

const STATUS_RING = {
  completed: "#10b981",
  upcoming: "#ef4444",
  wishlist: "#6366f1",
};

export default function LeafletMap({ events }) {
  const markers = useMemo(() => {
    return events
      .map((e) => {
        const loc = matchLocation(e.location);
        if (!loc || loc.lat == null) return null;
        return { ...e, lat: loc.lat, lon: loc.lon };
      })
      .filter(Boolean);
  }, [events]);

  // Auto-fit bounds: default to UK center if no markers
  const center = useMemo(() => {
    if (markers.length === 0) return [54.5, -2.5];
    const avgLat = markers.reduce((s, m) => s + m.lat, 0) / markers.length;
    const avgLon = markers.reduce((s, m) => s + m.lon, 0) / markers.length;
    return [avgLat, avgLon];
  }, [markers]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-700/50" style={{ height: 360 }}>
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ background: "#111827" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((m) => (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lon]}
            radius={6 + (m.difficulty || 1)}
            pathOptions={{
              color: STATUS_RING[m.status] || "#6366f1",
              fillColor: TYPE_COLORS[m.type] || "#6366f1",
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-bold">{m.name}</div>
                <div className="text-gray-600">
                  {m.type}{m.distance ? ` · ${m.distance}km` : ""}
                  {m.status !== "completed" && ` · ${m.status}`}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
