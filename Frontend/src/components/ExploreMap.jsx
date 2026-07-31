import React from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { CITY_COORDS, DEFAULT_CENTER, DEFAULT_ZOOM } from "../data/geo";

// Lime teardrop pin with the spot count — avoids Leaflet's broken default-icon
// asset paths under bundlers by using a divIcon.
const makeIcon = (n) =>
  L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#a3e635;color:#0a0f0d;font-weight:800;font-size:12px;box-shadow:0 2px 10px rgba(0,0,0,.45);border:2px solid #0a0f0d;"><span style="transform:rotate(45deg)">${n}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });

/**
 * Regional explore map. `regions` = [{ city, nearbyPlaces }]. One pin per city
 * that has known coordinates; the popup lists that city's spots as links.
 */
export default function ExploreMap({ regions = [], height = "70vh" }) {
  const markers = regions
    .map((r) => ({ city: r.city, coords: CITY_COORDS[r.city], places: r.nearbyPlaces || [] }))
    .filter((m) => m.coords);

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-white/[0.07]" style={{ height }}>
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.city} position={m.coords} icon={makeIcon(m.places.length)}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{m.city}</p>
                <p style={{ margin: "2px 0 8px", fontSize: 12, color: "#64748b" }}>
                  {m.places.length} spot{m.places.length !== 1 ? "s" : ""}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {m.places.slice(0, 6).map((p) => (
                    <Link key={p._id} to={`/city/${encodeURIComponent(m.city)}/spot/${p._id}`} style={{ fontSize: 13, fontWeight: 600, color: "#4d7c0f", textDecoration: "none" }}>
                      → {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
