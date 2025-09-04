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

// coords helpers
function parseLatLngFromUrl(raw: string) {
  try {
    const u = new URL(raw, "https://example.com");
    const path = u.pathname + u.search + u.hash;
    const at = path.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) };
    const bang = path.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (bang) return { lat: parseFloat(bang[1]), lng: parseFloat(bang[2]) };
    const q = u.searchParams.get("q");
    if (q) {
      const m = q.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    }
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

async function parseDetailPage(detailUrl: string): Promise<Partial<Stay>> {
  const html = await fetchHTML(detailUrl);
  const $ = cheerio.load(html);
  const text = $.root().text().replace(/\s+/g, " ").trim();

  const name =
    $("h1, h2, .title, .judul, .page-title").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="title"]').attr("content") ||
    null;

  const address =
    labeledValue($, ["Alamat", "Address", "Lokasi"]) ||
    $(".alamat,.address,.location").first().text().trim() ||
    (text.match(/(Maratua|Berau|Kalimantan Timur)[^.\n\r]{0,120}/i)?.[0] || null);

  const phone =
    $("a[href^='tel:']").first().attr("href")?.replace(/^tel:/, "") ||
    extractPhone(text);

  const price = labeledValue($, ["Harga", "Tarif", "Price"]) || extractPrice(text);

  // coords
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
