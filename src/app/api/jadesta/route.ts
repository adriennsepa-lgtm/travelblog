
// import { NextResponse } from "next/server";
// import { load, CheerioAPI  } from "cheerio";
// import type { AnyNode } from "domhandler";


// interface HomeStayData {
//     count: number;
//     items: [];
// }

// // ★ Force Node runtime so Cheerio works
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic"; // optional, but fine
// const DESA_URLS = [
//   "https://jadesta.kemenparekraf.go.id/desa/bohesilian_1",
//   "https://jadesta.kemenparekraf.go.id/desa/payungpayung",
//   "https://jadesta.kemenparekraf.go.id/desa/teluk_harapan",
//   "https://jadesta.kemenparekraf.go.id/desa/_teluk_alulu_maratua",
// ];
// const ORIGIN = "https://jadesta.kemenparekraf.go.id/";
// const UA =
//   "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) JadestaHomestayScraper/1.0";
// const TEL_RE = /(\+?62|0)[\d\s\-\.\(\)]{6,}/gi;
// const PRICE_HINTS = [/harga/i, /tarif/i, /price/i, /biaya/i, /per\s*malam/i, /per\s*night/i];
// const PRICE_RE   = /rp\s*([0-9][0-9\.\,\s]*)/ig;


// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


// const fetchHtml = async (url: string, retries = 3, attempt = 0): Promise<string> => {
//     try {
//       const res = await fetch(url, {
//         headers: { "User-Agent": "NextScraper" },
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       return await res.text();
//     } catch (e) {
//       if (attempt >= retries - 1) throw e;
//       await sleep(600 + 300 * attempt);
//       return fetchHtml(url, retries, attempt + 1);
//     }
//   };
  
  

// const fullUrl = (url: string)  => {
//   try {
//     return new URL(url, ORIGIN).toString();
//   } catch {
//     return url;
//   }
// }

// const normalizePhone = (raw: string) =>  {
//   let s = String(raw || "").replace(/[\s\-\.\(\)]/g, "");
//   if (s.startsWith("+")) s = "+" + s.slice(1).replace(/\D/g, "");
//   else s = s.replace(/\D/g, "");
//   if (s.startsWith("+62")) return s;
//   if (s.startsWith("62")) return "+" + s;
//   if (s.startsWith("0")) return "+62" + s.slice(1);
//   if (s.length >= 8 && !s.startsWith("+")) return "+62" + s;
//   return s;
// }

// function extractHomestayLinks(html: string): string[] {
//     const $ = load(html);
//     const set = new Set<string>();
//     $('a[href*="/homestay/"]').each((_, a) => {
//       const href = $(a).attr("href");
//       if (!href) return;
//       set.add(fullUrl(href));
//     });
//     return Array.from(set).sort();
//   }

// function extractName($: CheerioAPI) {
//   const sels = ["h1", "h2", "h3", "title", ".title", ".judul", ".card-title"];
//   for (const s of sels) {
//     const t = $(s).first().text().trim();
//     if (t) return t.replace(/^\s*Homestay\s+/i, "").trim();
//   }
//   return $("strong,b").first().text().trim() || "";
// }

// const extractImages = ($: CheerioAPI) => {
//     const imgs: string[] = [];
//     $(".homestay img, .gallery img").each((_, img) => {
//       const src = $(img).attr("src") || $(img).attr("data-src");
//       if (!src) return;
//       const u = fullUrl(src);
//       const lo = u.toLowerCase();
//       if (lo.includes("logo") || lo.includes("icon") || lo.includes("qrcode") || lo.includes("placeholder")) return;
//       imgs.push(u);
//     });
  
//     // deduplicate
//     return Array.from(new Set(imgs));
//   }
  

// function extractPhones($: CheerioAPI) {
//   const phones = new Set<string>();
//   $('a[href^="tel:"], a[href*="wa.me"], a[href*="api.whatsapp.com"]').each((_, a) => {
//     const href = String($(a).attr("href") || "");
//     const m = href.match(/(\+?\d[\d\s\-\.\(\)]{7,})/);
//     if (m) phones.add(normalizePhone(m[1]));
//   });
//   const pageText = $("body").text();
//   const matches = pageText.match(TEL_RE) || [];
//   for (const m of matches) phones.add(normalizePhone(m));
//   return Array.from(phones).filter((p) => p.replace(/\D/g, "").length >= 8).sort();
// }

// function cleanAddr(s: string) {
//   let x = (s || "").replace(/\s+/g, " ").trim();
//   return x.replace(/Lihat Peta.*$/i, "").trim();
// }

// function extractAddress($: CheerioAPI) {
//   const body = $("body").text().replace(/\s+/g, " ").trim();
//   const m = body.match(/(Alamat|Lokasi)\s*:?\s*(.{8,150})/i);
//   if (m) return cleanAddr(m[2]);
//   const hits: string[] = [];
//   $("p,div,li,span").each((_, el) => {
//     const t = $(el).text().replace(/\s+/g, " ").trim();
//     if (t.length >= 10) {
//       const tl = t.toLowerCase();
//       if (tl.includes("alamat") || tl.includes("lokasi") || tl.includes("maratua") || tl.includes("berau") || tl.includes("kaltim")) {
//         hits.push(t);
//       }
//     }
//   });
//   return cleanAddr(hits[0] || "");
// }


// // If you already have this, keep yours.
// const PRICE_WORD = /(harga|price|tarif)/i;
// const RP_TOKEN   = /rp/i;
// // Matches e.g. "Rp 1.500.000", "Rp1,500,000", "Rp 1 500 000"

// const looksLikeCode = (s: string) =>
//   /(\$\s*\(|\bvar\s+|\blet\s+|\bconst\s+|function\s*\(|=>|\)\s*;)/i.test(s);

// const compact = (s: string) => s.replace(/\s+/g, " ").trim();

// const parseRupiahNumber = (s: string): number => {
//   // keep digits only
//   const num = s.replace(/[^\d]/g, "");
//   return num ? Number(num) : 0;
// };

// /**
//  * Extracts the first (or smallest) "Rp ..." value from a homestay page.
//  * Returns both raw text and numeric rupiah.
//  */
// export const extractPrice = ($: CheerioAPI): { price_raw: string; price_rp_numeric: number } => {
//   // 1) Remove noise nodes so .text() won’t suck in scripts
//   $("script, style, noscript, template").remove();
//   // also remove JSON-LD blobs
//   $('script[type="application/ld+json"]').remove();

//   // 2) Build candidate text blocks (short, likely price-bearing)
//   const candidates: string[] = [];

//   // Meta description sometimes carries a price
//   $('meta[name="description"], meta[property="og:description"]').each((_, el) => {
//     const v = ($(el).attr("content") || "").trim();
//     if (v) candidates.push(compact(v));
//   });

//   // Short text nodes from typical content tags
//   $("h1,h2,h3,h4,p,li,span,small,strong,b,div").each((_, el: AnyNode) => {
//     const t = compact($(el).text() || "");
//     if (!t) return;
//     // ignore long paragraphs without "Rp" or price words
//     if (!RP_TOKEN.test(t) && !PRICE_WORD.test(t)) return;
//     // skip if it looks like code accidentally scraped
//     if (looksLikeCode(t)) return;
//     candidates.push(t);
//   });

//   // 3) Scan candidates for price tokens, collect all numbers
//   type Hit = { raw: string; num: number };
//   const hits: Hit[] = [];

//   for (const block of candidates) {
//     // reset regex state per block
//     PRICE_RE.lastIndex = 0;
//     let m: RegExpExecArray | null;
//     while ((m = PRICE_RE.exec(block))) {
//       const rawNum = m[1];
//       const num = parseRupiahNumber(rawNum);
//       if (num > 0) {
//         hits.push({ raw: compact(block), num });
//       }
//     }
//   }

//   // 4) Decide which price to return
//   // Heuristic: prefer the *smallest* positive price (usually "mulai dari"),
//   // fallback to the first hit.
//   if (hits.length) {
//     const best = hits.reduce((a, b) => (b.num > 0 && b.num < a.num ? b : a), hits[0]);
//     return { price_raw: best.raw, price_rp_numeric: best.num };
//   }

//   // 5) Final fallback — nothing found
//   return { price_raw: "", price_rp_numeric: 0 };
// };

// async function scrapeHomestay(url: string) {
//     const html = await fetchHtml(url);
//     const $ = load(html);
  
//     // remove scripts/styles so text() doesn’t suck in JS garbage
//     $("script,style,noscript,template").remove();
  
//     const name = extractName($);            // from the homestay page
//     const images = extractImages($);        // from the homestay page
//     const phones = extractPhones($);        // from the homestay page
//     const address = extractAddress($);      // from the homestay page
//     const { price_raw, price_rp_numeric } = extractPrice($);
  
//     return {
//       name,
//       url,
//       address,
//       price_raw,
//       price_rp_numeric,
//       phone_primary: phones[0] || "",
//       all_phones: phones.join(";"),
//       image_primary: images[0] || "",
//       all_images: images.join(";"),
//     };
//   }
  

//   export async function getHomestays() {
//     const homestayLinks = new Set<string>();
  
//     for (const desa of DESA_URLS) {
//       console.log("[desa] fetching:", desa);
//       const html = await fetchHtml(desa);
//       const found = extractHomestayLinks(html);
//       found.forEach((u) => homestayLinks.add(u));
//       await sleep(400); // be polite
//     }
  
//     const links = Array.from(homestayLinks).sort();
//     console.log("[links]", links.length);
  
//     // optional: small concurrency to speed up but avoid hammering
//     const CONC = 3;
//     const items: any[] = [];
//     let i = 0;
  
//     while (i < links.length) {
//       const batch = links.slice(i, i + CONC);
//       const results = await Promise.all(
//         batch.map(async (u) => {
//           try {
//             console.log("[homestay] →", u);
//             const item = await scrapeHomestay(u);
//             return item;
//           } catch (e: any) {
//             console.error("[homestay error]", u, e?.message || e);
//             return null;
//           }
//         })
//       );
//       results.forEach((r) => r && items.push(r));
//       i += CONC;
//       await sleep(400);
//     }
  
//     return { count: items.length, items };
//   }
  

//   export async function GET() {
//     try {
//       const data = await getHomestays();
//       return NextResponse.json(data);
//     } catch (e: any) {
//       return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
//     }
//   }


