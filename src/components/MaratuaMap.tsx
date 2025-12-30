
"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";






L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// Fix default marker icons in Leaflet with bundlers
// You can also place the images locally if you want offline builds
const DefaultIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon as L.Icon;

// Types
type HotelPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  url?: string;
  price?: string;
  rating?: number;
  image?: string;
  tags?: string[];
};

type AccomodationMapProps = {
  hotels?: HotelPin[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number;
};



// Optional control to move the map when user selects a hotel from outside
export function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 0.6 });
  }, [lat, lng, map]);
  return null;
}


const res = await fetch(
  "http://localhost:3000/api/jadesta?urls=" + [
    "https://jadesta.kemenparekraf.go.id/desa/bohesilian_1",
    "https://jadesta.kemenparekraf.go.id/desa/payungpayung",
    "https://jadesta.kemenparekraf.go.id/desa/teluk_harapan",
    "https://jadesta.kemenparekraf.go.id/desa/_teluk_alulu_maratua",
  ].join(","),
  { cache: "no-store" }
);
const stays = await res.json();

console.log(stays, "jadesta stays");

export default function AccomodationMap({

  hotels = stays,
  center = { lat: 2.21, lng: 118.60 },
  zoom = 11,
  height = 480,
}: AccomodationMapProps) {
  return (
    <div className="w-full overflow-hidden shadow">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom
        style={{ height, width: "100%" }}
        className="z-0"
      >
        {/* Free OSM tiles, no API key. Respect tile usage policy if you get heavy traffic. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hotels.map((h) => (
          <Marker key={h.name} position={[h.lat, h.lng]}>

            <Tooltip>
              <div className="space-y-1">
                <div className="font-semibold">{h.name}</div>
                {h.price && <div className="text-sm">Price: ~ {h.price}</div>}
                {h.url && (
                  <a
                    href={h.url}
                    className="inline-block text-sm underline mt-1"
                  >
                    Read more
                  </a>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
