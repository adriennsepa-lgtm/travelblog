import { NextRequest } from "next/server";
import { dedupeByNameAddress } from "@/lib/stays/utils";
import { scrapeJadestaVillage } from "@/lib/stays/jadesta";
import { fetchGooglePlacesCached } from "@/lib/stays/google_places";
import { Stay } from '../../../lib/stays/types'

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseUrls(req: NextRequest): string[] {
  const url = new URL(req.url);
  const list = url.searchParams.get("urls");
  if (!list) return [];
  return list.split(",").map(s => s.trim()).filter(Boolean);
}

const uniqueStaysList = (
  fetchedJadestaStays: Stay[],
  googleMapsStays: Stay[]
): Stay[] => {
  // helper: normalize names for loose comparison
  const normalizeName = (name: string) =>
    name
      .toLowerCase()
      .replace(/\b(home\s*stay|homestay|resort|maratua)\b/g, "") // remove filler words
      .replace(/\s+/g, " ") // collapse spaces
      .trim();

  const mergedStays = [...googleMapsStays, ...fetchedJadestaStays];

  return mergedStays.reduce<Stay[]>((acc, curr) => {
    const normCurr = normalizeName(curr.name);

    const existing = acc.find(
      (a) => normalizeName(a.name) === normCurr
    );

    if (existing) {
      // merge: prefer non-null values from curr
      for (const key of Object.keys(curr) as (keyof Stay)[]) {
        if (curr[key] != null) {
          (existing as Record<keyof Stay, unknown>)[key] = curr[key];
        }
      }
      return acc;
    }

    return [...acc, { ...curr }];
  }, []);
};


export async function GET(req: NextRequest) {
  const urls = parseUrls(req);
  if (urls.length === 0) {
    return new Response(JSON.stringify({ error: "Provide ?urls=comma,separated,urls" }, null, 2),
      { status: 400, headers: { "content-type": "application/json" } });
  }


  const jadestaStays = (
    await Promise.all(urls.map((u) => scrapeJadestaVillage(u)))
  ).flat();


  const googleStays = await fetchGooglePlacesCached();
  const filteredStays: Stay[] = uniqueStaysList(jadestaStays, googleStays);


  const final = dedupeByNameAddress(filteredStays);
  return new Response(JSON.stringify(final, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
