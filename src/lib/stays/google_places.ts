
import type { Stay } from "./types";
import { readCache, writeCache } from "../cache";

const CENTER = { lat: 2.2333, lng: 118.6000 };
const RADIUS_M = 15000;

// On Vercel, you can switch to "/tmp/places-maratua.json" if you prefer
// const CACHE_FILE = "/tmp/places-maratua.json";

type NearbyResult = {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry?: { location?: { lat: number; lng: number } };
  price_level?: number;
};


export async function fetchGooglePlacesCached(opts?: { force?: boolean }) {
  if (!opts?.force) {
    const cached = await readCache();
    if (cached) return cached.data;
  }
  const data = await fetchGooglePlacesFresh();
  console.log(data, "data from google places");
  await writeCache(data);
  return data;
}

async function fetchGooglePlacesFresh(): Promise<Stay[]> {
  const API_KEY = process.env.GOOGLE_API_KEY;
  if (!API_KEY) {
    console.warn("Missing GOOGLE_API_KEY");
    return [];
  }

  const BASE = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

  // first page
  let url =
    `${BASE}?location=${CENTER.lat},${CENTER.lng}` +
    `&radius=${RADIUS_M}` +
    `&type=lodging` +
    `&key=${API_KEY}`;

  const allResults: NearbyResult[] = [];

  for (let page = 0; page < 3 && url; page++) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Places nearby failed: ${res.status}`);

    const json = await res.json() as {
      results?: NearbyResult[];
      next_page_token?: string;
      status?: string;
      error_message?: string;
    };

    // Google may return HTTP 200 with a non-OK "status"
    if (json.status && json.status !== "OK" && json.status !== "ZERO_RESULTS") {
      throw new Error(
        `Places nearby status ${json.status}${json.error_message ? `: ${json.error_message}` : ""}`
      );
    }

    if (Array.isArray(json.results)) {
      allResults.push(...json.results);
    }

    if (json.next_page_token) {
      // token activates after a short delay, otherwise you get INVALID_REQUEST
      await new Promise((r) => setTimeout(r, 2000));
      url = `${BASE}?pagetoken=${json.next_page_token}&key=${API_KEY}`;
    } else {
      url = "";
    }
  }

  const basics: Stay[] = allResults.map((r) => ({
    name: r.name,
    address: r.vicinity ?? null,
    price: r.price_level != null ? String(r.price_level) : null,
    phone: null,
    link: null,
    sourceUrl: "google-places",
    lat: r.geometry?.location?.lat ?? null,
    lng: r.geometry?.location?.lng ?? null,
  }));

  return basics;
}


/* If you want details (phone/website), uncomment and call it above.

async function enrichWithPlaceDetails(placeIds: string[], apiKey: string, stays: Stay[]): Promise<Stay[]> {
  const out: Stay[] = [];
  for (let i = 0; i < placeIds.length; i++) {
    const pid = placeIds[i];
    const detailsUrl =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(pid)}` +
      `&fields=name,formatted_address,international_phone_number,website,price_level,geometry` +
      `&key=${apiKey}`;
    const r = await fetch(detailsUrl, { cache: "no-store" });
    if (!r.ok) { out.push(stays[i]); continue; }
    const data = await r.json();
    const p = data.result;
    out.push({
      ...stays[i],
      address: p?.formatted_address ?? stays[i].address,
      phone: p?.international_phone_number ?? stays[i].phone,
      link: p?.website ?? stays[i].link,
      price: p?.price_level != null ? String(p.price_level) : stays[i].price,
      lat: p?.geometry?.location?.lat ?? stays[i].lat,
      lng: p?.geometry?.location?.lng ?? stays[i].lng,
    });
    await new Promise(res => setTimeout(res, 120));
  }
  return out;
}
*/
