import * as cheerio from "cheerio";
import { setTimeout as sleep } from "timers/promises";
import type { Stay } from "./types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36";

function absolutize(href: string, base: string) {
  try { return new URL(href, base).toString(); } catch { return href; }
}

async function fetchHTML(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

function extractPhone(text: string) {
  const m = text.match(/(?:\+?62|\+?\d{1,3}|0)[\d\s\-()]{7,}/);
  return m ? m[0].replace(/\s+/g, " ").trim() : null;
}
function extractPrice(text: string) {
  const m = text.match(/(?:Rp|IDR|\$)\s?[^\s,;()<>]{2,20}/i);
  return m ? m[0].trim() : null;
}
function labeledValue($: cheerio.CheerioAPI, labels: string[]) {
  const hay = $.root().text();
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:\\-]?\\s*([^\\n\\r]+)`, "i");
    const m = hay.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

// Try to resolve short/redirected map URLs to a final URL that contains the coords
async function resolveRedirect(url: string, base?: string, hops = 3): Promise<string> {
  try {
    let current = new URL(url, base).toString();
    for (let i = 0; i < hops; i++) {
      const res = await fetch(current, { method: "HEAD", redirect: "manual" });
      const loc = res.headers.get("location");
      if (!loc) return current;
      current = new URL(loc, current).toString();
      // If we already landed on a full google maps URL with @lat,lng, stop early
      if (/@-?\d+\.\d+,-?\d+\.\d+/.test(current)) return current;
    }
    return current;
  } catch {
    return url;
  }
}

// Parse coords out of arbitrary JSON blobs (JSON-LD or inline)
// Very forgiving: picks the first numeric latitude/longitude pair it finds
function parseLatLngFromAnyJson(jsonText: string) {
  try {
    const parsed = JSON.parse(jsonText);
    const stack = Array.isArray(parsed) ? [...parsed] : [parsed];
    while (stack.length) {
      const obj = stack.pop();
      if (obj && typeof obj === "object") {
        // common shapes
        const g = obj.geo || obj.address?.geo || obj.location || obj.position || obj;
        const lat = g?.latitude ?? g?.lat ?? g?.y ?? undefined;
        const lng = g?.longitude ?? g?.lng ?? g?.lon ?? g?.x ?? undefined;
        if (typeof lat === "number" && typeof lng === "number") return { lat, lng };
        // traverse
        for (const v of Object.values(obj)) {
          if (v && typeof v === "object") stack.push(v);
        }
      }
    }
  } catch { /* ignore */ }
  return null;
}



// coords helpers
function parseLatLngFromUrl(raw: string) {
  try {
    const u = new URL(raw, "https://example.com");
    const path = u.pathname + u.search + u.hash;

    // @lat,lng form
    const at = path.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) };

    // !3dlat!4dlng form
    const bang = path.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (bang) return { lat: parseFloat(bang[1]), lng: parseFloat(bang[2]) };

    // q=loc:lat,lng or q=lat,lng
    const q = u.searchParams.get("q");
    if (q) {
      const m = q.match(/loc:?\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)/i) || q.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    }

    // query=lat,lng
    const query = u.searchParams.get("query");
    if (query) {
      const m = query.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    }

    // ll=lat,lng (you already had this)
    const ll = u.searchParams.get("ll");
    if (ll) {
      const m = ll.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    }
  } catch {}
  return null;
}

function parseLatLngFromText(t: string) {
  const m = t.match(/(-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

function normalizeAddress(raw: string): string {
  let s = raw.replace(/\s+/g, " ").trim();
  s = s.replace(/\bJl\.\s*/gi, "Jalan ");
  s = s.replace(/\bKec\.\s*/gi, "Kecamatan ");
  s = s.replace(/\bKab\.\s*/gi, "Kabupaten ");
  if (!/indonesia/i.test(s)) s += ", Indonesia";
  return s;
}


// simple in-memory cache (address -> coords)
const geocodeCache = new Map<string, { lat: number; lng: number }>();

async function geocodeAddress(address: string, apiKey: string) {
  const norm = normalizeAddress(address);

  // 1) return cached if we already resolved this address
  const cached = geocodeCache.get(norm);
  if (cached) return cached;

  const bounds = "1.90,118.20|2.55,119.05"; // Maratua/Berau bounding box

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?address=${encodeURIComponent(norm)}` +
    `&components=country:ID` +
    `&region=id` +
    `&bounds=${bounds}` +
    `&language=id` +
    `&key=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== "OK" || !data.results?.length) return null;

  const { lat, lng } = data.results[0].geometry.location;

  // 2) store result in cache for later
  const coords = { lat, lng };
  geocodeCache.set(norm, coords);

  return coords;
}


// --- simple gazetteer of village centroids (approx) ---
const PLACE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  // tweak if you have better points
  "teluk harapan": { lat: 2.2788, lng: 118.5694 },
  "teluk alulu":   { lat: 2.2790, lng: 118.6000 }, // ~5km E of Teluk Harapan (est.)
  "bohesilian":    { lat: 2.2860, lng: 118.5450 },
  "payung-payung": { lat: 2.2460, lng: 118.5220 },
  "maratua":       { lat: 2.2700, lng: 118.6000 }, // island-wide fallback
};

const aliases: Record<string, string[]> = {
  "teluk harapan": ["teluk harapan"],
  "teluk alulu":   ["teluk alulu", "alulu"],
  "bohesilian":    ["bohesilian", "bohe silian"],
  "payung-payung": ["payung-payung", "payung payung"],
  "maratua":       ["kecamatan maratua", "maratua"],
};

function normalize(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/\s+/g, " ").trim();
}

function findPlaceKeys(address: string): string[] {
  const hay = normalize(address);
  const hits: string[] = [];
  for (const [key, words] of Object.entries(aliases)) {
    if (words.some(w => hay.includes(w))) hits.push(key);
  }
  // ensure uniqueness
  return [...new Set(hits)];
}

function midpoint(a: {lat:number; lng:number}, b: {lat:number; lng:number}) {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
}

/** Try to estimate coords from village names inside the address text */
function estimateCoordsFromAddress(address: string | null | undefined) {
  if (!address) return null;
  const keys = findPlaceKeys(address);
  if (keys.length === 0) return null;

  // two or more places mentioned -> use midpoint of first two
  if (keys.length >= 2) {
    const a = PLACE_CENTROIDS[keys[0]];
    const b = PLACE_CENTROIDS[keys[1]];
    if (a && b) return midpoint(a, b);
  }

  // single place -> use its centroid
  const a = PLACE_CENTROIDS[keys[0]];
  return a ?? null;
}


// --- detail page parser ---
export async function parseDetailPage(detailUrl: string): Promise<Partial<Stay>> {
  const html = await fetchHTML(detailUrl);
  const $ = cheerio.load(html);
  const text = $.root().text().replace(/\s+/g, " ").trim();

  // helpers
  const cleanRowText = ($row: cheerio.Cheerio<any>) =>
    $row.clone().find("i, svg, a, span").remove().end().text().replace(/\s+/g, " ").trim();

  const normalizePhone = (t: string | null) =>
    t ? t.replace(/[^\d+]/g, "").replace(/^\+0+/, "+").trim() : null;

  // --- name ---
  const name =
    $("h1, h2, .title, .judul, .page-title").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="title"]').attr("content") ||
    null;

  // --- phone ---
  const phoneRow = $("li:has(i.sl-icon-phone), li:has(i[class*='icon-phone'])").first();
  const phoneDirect = phoneRow.length ? cleanRowText(phoneRow) : null;
  const phone =
    normalizePhone(phoneDirect) ||
    $("a[href^='tel:']").first().attr("href")?.replace(/^tel:/, "") ||
    extractPhone(text);

  // --- address ---
  let addressDirect: string | null = null;

  const addrRow = $("li:has(i.sl-icon-map), li:has(i[class*='icon-map'])").first();
  if (addrRow.length) addressDirect = cleanRowText(addrRow);

  if (!addressDirect) {
    const addrTitlebar = $("#titlebar .fa-map-marker").parent();
    if (addrTitlebar.length) {
      addressDirect = addrTitlebar
        .clone()
        .find("i, svg")
        .remove()
        .end()
        .text()
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  const address =
    addressDirect ||
    labeledValue($, ["Alamat", "Address", "Lokasi"]) ||
    $(".alamat,.address,.location").first().text().trim() ||
    (text.match(/(Maratua|Berau|Kalimantan Timur)[^.\n\r]{0,120}/i)?.[0] ?? null);

  // --- price ---
  const price = labeledValue($, ["Harga", "Tarif", "Price"]) || extractPrice(text);

  // --- coords ---
  let lat: number | undefined;
  let lng: number | undefined;

  // (1) data attributes
  const dataLat = $('[data-lat],[data-latitude],[data-lng],[data-longitude]').first();
  if (dataLat.length) {
    const vLat = Number(dataLat.attr("data-lat") ?? dataLat.attr("data-latitude") ?? dataLat.attr("data-y"));
    const vLng = Number(dataLat.attr("data-lng") ?? dataLat.attr("data-longitude") ?? dataLat.attr("data-x"));
    if (Number.isFinite(vLat) && Number.isFinite(vLng)) {
      lat = vLat;
      lng = vLng;
    }
  }

  // (2) JSON-LD blobs
  if (lat === undefined || lng === undefined) {
    $("script[type='application/ld+json']").each((_, s) => {
      if (lat !== undefined && lng !== undefined) return;
      const txt = $(s).contents().text().trim();
      if (!txt) return;
      const p = parseLatLngFromAnyJson(txt);
      if (p) { lat = p.lat; lng = p.lng; }
    });
  }

  // (3) map links/iframes
  if (lat === undefined || lng === undefined) {
    const candidates: string[] = [];
    $("iframe[src], a[href]").each((_, el) => {
      const raw = ($(el).attr("src") || $(el).attr("href") || "").toString();
      if (/maps\.google|goo\.gl\/maps|openstreetmap|osm\.org/i.test(raw)) candidates.push(raw);
    });
    for (const raw of candidates) {
      const resolved = await resolveRedirect(raw, detailUrl);
      const p = parseLatLngFromUrl(resolved) || parseLatLngFromUrl(raw);
      if (p) { lat = p.lat; lng = p.lng; break; }
    }
  }

 // (4) fallback: geocode address
if ((lat === undefined || lng === undefined) && address) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (apiKey) {
    const coords = await geocodeAddress(address, apiKey);
    if (coords) { lat = coords.lat; lng = coords.lng; }
  }
}

// (5) last-resort: estimate from village names (e.g. "Teluk Harapan - Teluk Alulu")
if (lat === undefined || lng === undefined) {
  const est = estimateCoordsFromAddress(address);
  if (est) { lat = est.lat; lng = est.lng; }
}

// final safety: still undefined? set to island centroid so nothing is null
if (lat === undefined || lng === undefined) {
  const island = PLACE_CENTROIDS["maratua"];
  lat = island.lat; lng = island.lng;
}

  return { name: name || undefined, address, phone, price, lat, lng };
}

export async function scrapeJadestaVillage(villageUrl: string): Promise<Stay[]> {
  const html = await fetchHTML(villageUrl);
  const $ = cheerio.load(html);

  const links = new Set<string>();
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href") || "";
    if (/\/homestay\//i.test(href)) links.add(absolutize(href, villageUrl));
  });
  $(".homestay, .card, article, .content, .list-group a").each((_, el) => {
    const a = $(el).find("a[href]").first();
    const href = a.attr("href");
    if (href && /\/homestay\//i.test(href)) links.add(absolutize(href, villageUrl));
  });

  const out: Stay[] = [];
  for (const detailUrl of links) {
    const partial = await parseDetailPage(detailUrl);
    const inferredName =
      decodeURIComponent(detailUrl).split("/").pop()
        ?.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || null;

    out.push({
      name: (partial.name || inferredName || "(Unnamed)")!.trim(),
      address: partial.address ?? null,
      price: partial.price ?? null,
      phone: partial.phone ?? null,
      link: detailUrl,
      sourceUrl: villageUrl,
      lat: partial.lat ?? null,
      lng: partial.lng ?? null,
    });

    await sleep(120);
  }
  return out;
}
