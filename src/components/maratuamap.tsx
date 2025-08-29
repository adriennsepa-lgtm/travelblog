// Install first:
//   npm i react-leaflet leaflet react-leaflet-cluster
// Add to your global CSS (e.g., app/globals.css) or in <head> via layout.tsx:
//   import 'leaflet/dist/leaflet.css'

// app/layout.tsx — include Leaflet CSS once for the whole app
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <head />
//       <body className="min-h-screen">
//         {children}
//       </body>
//     </html>
//   )
// }

// app/components/HotelMap.tsx
"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Optional clustering. If you prefer no clustering, remove this import and the <MarkerClusterGroup> wrapper.

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
L.Marker.prototype.options.icon = DefaultIcon as any;

// Types
export type HotelPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  url?: string; // link to your blog post or external site
  price?: string; // optional string so you can show a range or currency
  rating?: number; // 0..5
  image?: string; // thumbnail URL if available
  tags?: string[];
};

// Example data. Replace with data from your CMS or Markdown frontmatter.
const SAMPLE_HOTELS: HotelPin[] = [
  {
    id: "1",
    name: "Bajo Homestay",
    lat: 2.2126,
    lng: 118.605,
    url: "/blog/bajo-homestay",
    price: "$25–35",
    rating: 4.6,
    tags: ["beach", "quiet"],
  },
  {
    id: "2",
    name: "Kakaban Lodge",
    lat: 2.183,
    lng: 118.55,
    url: "/blog/kakaban-lodge",
    price: "$60–80",
    rating: 4.4,
    tags: ["snorkeling"],
  },
  {
    id: "3",
    name: "Maratua Bay Bungalows",
    lat: 2.234,
    lng: 118.615,
    url: "/blog/maratua-bay",
    price: "$40–55",
    rating: 4.7,
    tags: ["sunset", "wifi"],
  },
];

// Optional control to move the map when user selects a hotel from outside
export function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 0.6 });
  }, [lat, lng, map]);
  return null;
}

export default function HotelMap({
  hotels = SAMPLE_HOTELS,
  center = { lat: 2.21, lng: 118.60 },
  zoom = 11,
  height = 480,
}: {
  hotels?: HotelPin[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number;
}) {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow">
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

        {/* Cluster many markers cleanly. Remove wrapper if you dislike clustering. */}
        <MarkerClusterGroup chunkedLoading>
          {hotels.map((h) => (
            <Marker key={h.id} position={[h.lat, h.lng]}>
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{h.name}</div>
                  {h.price && <div className="text-sm">{h.price}</div>}
                  {typeof h.rating === "number" && (
                    <div className="text-sm">Rating: {h.rating.toFixed(1)}/5</div>
                  )}
                  {h.tags && h.tags.length > 0 && (
                    <div className="text-xs opacity-80">{h.tags.join(" · ")}</div>
                  )}
                  {h.url && (
                    <a
                      href={h.url}
                      className="inline-block text-sm underline mt-1"
                    >
                      Read more
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

// app/map/page.tsx — example page to render the map
// import dynamic from "next/dynamic";
// const DynamicHotelMap = dynamic(() => import("../components/HotelMap"), { ssr: false });
// export default function MapPage() {
//   return (
//     <main className="mx-auto max-w-4xl p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Hotel Map</h1>
//       <DynamicHotelMap />
//     </main>
//   );
// }

// MDX integration idea:
// If each blog post has frontmatter with coords, generate a hotels[] array at build time.
// Example frontmatter:
// ---
// title: "Maratua Bay Bungalows"
// coords: { lat: 2.234, lng: 118.615 }
// price: "$40–55"
// rating: 4.7
// tags: ["sunset", "wifi"]
// ---
// Then pass those into <HotelMap hotels={hotelsFromContent} />

// Styling notes:
// - Wrap the map in a responsive container
// - Control height prop per breakpoint
// - For dark mode tiles, swap TileLayer url for a dark tile provider

// Performance notes:
// - Use { ssr: false } when dynamically importing the map component in Next.js to avoid window/DOM errors
// - For many markers, keep clustering on, and consider server-side filtering by viewport bounds
// - If you expect heavy traffic, use a proper tile provider or self-host tiles instead of public OSM tiles
