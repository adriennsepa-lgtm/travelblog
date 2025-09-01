// File: app/api/jadesta/route.ts
// Next.js App Router API route that scrapes Jadesta village pages
// and returns [ { name, address, price, phone, link, sourceUrl, lat, lng }, ... ]
//
// Usage:
//   GET  /api/jadesta?urls=<comma-separated-urls>
//   POST /api/jadesta  { "urls": ["...","..."] }
//
// Install deps:
//   npm i cheerio undici zod

import { NextRequest } from "next/server";
import { z } from "zod";
import * as cheerio from "cheerio";
import { setTimeout as sleep } from "timers/promises";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// --- Types ---
export type Stay = {
  name: string;
  address?: string | null;
  price?: string | null;
  phone?: string | null;
  link?: string | null;    // absolute URL
  sourceUrl: string;       // village page that discovered it
  lat?: number | null;     // ⬅️ added
  lng?: number | null;     // ⬅️ added
};

const InputSchema = z.object({
  urls: z.array(z.string().url()).min(1),
});

// --- Helpers ---
function absolutize(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

// Extract phone numbers from a block of text
function extractPhone(text: string): string | null {
  const m = text.match(/(?:\+?62|\+?\d{1,3}|0)[\d\s\-()]{7,}/);
  return m ? m[0].replace(/\s+/g, " ").trim() : null;
}

// Extract price patterns like "Rp 250.000" or "$40–55"
function extractPrice(text: string): string | null {
  const m = text.match(/(?:Rp|IDR|\$)\s?[^\s,;()<>]{2,20}/i);
  return m ? m[0].trim() : null;
}

// --- Coordinates helpers ---
function parseLatLngFromUrl(raw: string): { lat: number; lng: number } | null {
  try {
    const u = new URL(raw, "https://example.com");
    const path = u.pathname + u.search + u.hash;

    // @lat,lng,zoom
    const at = path.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) };

    // !3dLAT!4dLNG
    const bang = path.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (bang) return { lat: parseFloat(bang[1]), lng: parseFloat(bang[2]) };

    // q=lat,lng
    const q = u.searchParams.get("q");
    if (q) {
      const m = q.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    }

    // ll=lat,lng
    const ll = u.searchParams.get("ll");
    if (ll) {
      const m = ll.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    }
  } catch {}
  return null;
}

function parseLatLngFromText(t: string): { lat: number; lng: number } | null {
  // e.g., "2.2345, 118.6152" — requires 3+ decimals to avoid false positives
  const m = t.match(/(-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

// Try common label-value patterns on detail pages
function labeledValue($: cheerio.CheerioAPI, labels: string[]): string | null {
  const hay = $.root().text();
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:\\-]?\\s*([^\\n\\r]+)`, "i");
    const m = hay.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

async function parseDetailPage(detailUrl: string): Promise<Partial<Stay>> {
  try {
    const html = await fetchHTML(detailUrl);
    const $ = cheerio.load(html);
    const text = $.root().text().replace(/\s+/g, " ").trim();

    // Name
    const name =
      $("h1, h2, .title, .judul, .page-title").first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="title"]').attr("content") ||
      null;

    // Address
    const address =
      labeledValue($, ["Alamat", "Address", "Lokasi"]) ||
      $(".alamat,.address,.location").first().text().trim() ||
      (text.match(/(Maratua|Berau|Kalimantan Timur)[^.|\n\r]{0,120}/i)?.[0] || null);

    // Phone / Price
    const phone =
      $("a[href^='tel:']").first().attr("href")?.replace(/^tel:/, "") ||
      extractPhone(text);

    const price = labeledValue($, ["Harga", "Tarif", "Price"]) || extractPrice(text);

    // Coordinates: check map embeds/links, JSON-LD geo, then naked text
    let lat: number | undefined;
    let lng: number | undefined;

    $("iframe[src], a[href]").each((_, el) => {
      if (lat !== undefined && lng !== undefined) return;
      const src = ($(el).attr("src") || $(el).attr("href") || "").toString();
      if (/maps\.google|google\.com\/maps|goo\.gl\/maps|openstreetmap|osm\.org/i.test(src)) {
        const p = parseLatLngFromUrl(src);
        if (p) { lat = p.lat; lng = p.lng; }
      }
    });

    if (lat === undefined || lng === undefined) {
      $("script[type='application/ld+json']").each((_, s) => {
        if (lat !== undefined && lng !== undefined) return;
        try {
          const data = JSON.parse($(s).contents().text());
          const arr = Array.isArray(data) ? data : [data];
          for (const d of arr) {
            const g = d.geo || (d.address && d.address.geo);
            const plat = g?.latitude ?? g?.lat ?? d.latitude;
            const plng = g?.longitude ?? g?.lng ?? d.longitude;
            if (typeof plat === "number" && typeof plng === "number") {
              lat = plat; lng = plng; break;
            }
          }
        } catch {}
      });
    }

    if (lat === undefined || lng === undefined) {
      const p = parseLatLngFromText(text);
      if (p) { lat = p.lat; lng = p.lng; }
    }

    return { name: name || undefined, address, phone, price, lat, lng };
  } catch (e) {
    console.error("detail error", detailUrl, e);
    return {};
  }
}

async function parseVillagePage(villageUrl: string): Promise<Stay[]> {
  const html = await fetchHTML(villageUrl);
  const $ = cheerio.load(html);

  // Find homestay links: any anchor containing "/homestay/"
  const links = new Set<string>();
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href") || "";
    if (/\/homestay\//i.test(href)) links.add(absolutize(href, villageUrl));
  });

  // Also scan cards/tiles that might link via child <a>
  $(".homestay, .card, article, .content, .list-group a").each((_, el) => {
    const a = $(el).find("a[href]").first();
    const href = a.attr("href");
    if (href && /\/homestay\//i.test(href)) links.add(absolutize(href, villageUrl));
  });

  const stays: Stay[] = [];

  for (const detailUrl of links) {
    const partial = await parseDetailPage(detailUrl);

    // Infer name from slug if needed
    const inferredName =
      decodeURIComponent(detailUrl)
        .split("/")
        .pop()
        ?.replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) || null;

    stays.push({
      name: (partial.name || inferredName || "(Unnamed)").trim(),
      address: partial.address ?? null,
      price: partial.price ?? null,
      phone: partial.phone ?? null,
      link: detailUrl,
      sourceUrl: villageUrl,
      lat: (partial as any).lat ?? null,
      lng: (partial as any).lng ?? null,
    });

    await sleep(120); // be polite
  }

  return stays;
}

function dedupeByNameAddress(items: Stay[]): Stay[] {
  const map = new Map<string, Stay>();
  for (const s of items) {
    const key = `${s.name.toLowerCase()}|${(s.address || "").toLowerCase()}`;
    if (!map.has(key)) map.set(key, s);
    else {
      const prev = map.get(key)!;
      map.set(key, {
        ...prev,
        address: s.address || prev.address,
        price: s.price || prev.price,
        phone: s.phone || prev.phone,
        link: s.link || prev.link,
        lat: s.lat ?? prev.lat ?? null,
        lng: s.lng ?? prev.lng ?? null,
      });
    }
  }
  return [...map.values()];
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const list = url.searchParams.get("urls");
    const urls = list ? list.split(",").map((u) => u.trim()).filter(Boolean) : [];
    if (urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "Provide ?urls=comma,separated,urls" }, null, 2),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const all: Stay[] = [];
    for (const u of urls) {
      const stays = await parseVillagePage(u);
      all.push(...stays);
      await sleep(200);
    }

    const final = dedupeByNameAddress(all);
    return new Response(JSON.stringify(final, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }, null, 2), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }, null, 2), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const { urls } = parsed.data;
    const all: Stay[] = [];
    for (const u of urls) {
      const stays = await parseVillagePage(u);
      all.push(...stays);
      await sleep(200);
    }

    const final = dedupeByNameAddress(all);
    return new Response(JSON.stringify(final, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }, null, 2), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
