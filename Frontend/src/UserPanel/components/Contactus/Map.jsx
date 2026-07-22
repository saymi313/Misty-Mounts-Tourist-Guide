import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Mini Leaflet map for the contact page, centred on Hazara.
const Map = () => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [34.3, 73.2],
      zoom: 9,
      scrollWheelZoom: false,
      zoomControl: false,
    });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const pin = L.divIcon({
      className: 'mm-pin',
      html: `<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50% 50% 50% 0;background:#111813;transform:rotate(-45deg);box-shadow:0 6px 14px rgba(15,30,26,.4);border:2px solid #a3e635;"><span style="width:9px;height:9px;border-radius:50%;background:#a3e635;transform:rotate(45deg);"></span></span>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
    L.marker([34.1688, 73.2215], { icon: pin }).addTo(map).bindPopup('<strong>Misty Mounts · Hazara</strong>');

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return <div ref={containerRef} className="h-64 w-full" />;
};

export default Map;
