import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, ExternalLink } from 'lucide-react';

// Interactive map (Leaflet + OpenStreetMap), driven imperatively so it works
// regardless of the react-leaflet / React version pairing.
const Map = ({ name, latitude, longitude }) => {
  const lat = latitude || 35.9208;
  const lng = longitude || 74.3083;
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 11,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Custom pine-and-sun pin to match the design system.
    const pin = L.divIcon({
      className: 'mm-pin',
      html: `<span style="
        display:flex;align-items:center;justify-content:center;
        width:34px;height:34px;border-radius:50% 50% 50% 0;
        background:#0e3a44;transform:rotate(-45deg);
        box-shadow:0 6px 14px rgba(15,30,26,.4);border:2px solid #38cbd6;">
        <span style="width:10px;height:10px;border-radius:50%;background:#38cbd6;transform:rotate(45deg);"></span>
      </span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });

    L.marker([lat, lng], { icon: pin })
      .addTo(map)
      .bindPopup(`<strong>${name || 'Spot'}</strong>`)
      .openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, name]);

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="eyebrow">Find your way</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-abyss-900 dark:text-frost-50">
            {name} on the map
          </h2>
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost hidden sm:inline-flex"
        >
          Open in OpenStreetMap <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="relative overflow-hidden rounded-3xl shadow-card ring-1 ring-abyss-900/10 dark:ring-frost-50/10">
        <div ref={containerRef} className="h-[440px] w-full" />
        <div className="pointer-events-none absolute left-4 top-4 z-[400] flex items-center gap-2 rounded-full bg-white/95 dark:bg-abyss-900/95 px-3.5 py-2 text-sm font-medium text-abyss-900 dark:text-frost-50 shadow-sm backdrop-blur">
          <MapPin className="h-4 w-4 text-glacier-700 dark:text-glacier-300" />
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>
    </section>
  );
};

export default Map;
