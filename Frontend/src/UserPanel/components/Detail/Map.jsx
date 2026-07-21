import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, ExternalLink } from 'lucide-react';
import { Eyebrow } from '../bento/tiles';

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

    // Custom night-and-lime pin to match the bento design system.
    const pin = L.divIcon({
      className: 'mm-pin',
      html: `<span style="
        display:flex;align-items:center;justify-content:center;
        width:34px;height:34px;border-radius:50% 50% 50% 0;
        background:#111813;transform:rotate(-45deg);
        box-shadow:0 6px 14px rgba(0,0,0,.5);border:2px solid #a3e635;">
        <span style="width:10px;height:10px;border-radius:50%;background:#a3e635;transform:rotate(45deg);"></span>
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
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <Eyebrow><MapPin className="h-3.5 w-3.5" /> Find your way</Eyebrow>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {name} on the <span className="text-lime-400">map</span>
          </h2>
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-lime-400 hover:text-lime-400 sm:inline-flex"
        >
          Open in OpenStreetMap <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="relative overflow-hidden rounded-[1.4rem] border border-white/[0.07]">
        <div ref={containerRef} className="h-[440px] w-full" />
        <div className="pointer-events-none absolute left-4 top-4 z-[400] flex items-center gap-2 rounded-full border border-white/10 bg-night-800/90 px-3.5 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur">
          <MapPin className="h-4 w-4 text-lime-400" />
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>
    </section>
  );
};

export default Map;
