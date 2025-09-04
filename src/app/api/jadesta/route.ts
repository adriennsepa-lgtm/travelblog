import { NextRequest } from "next/server";
import { dedupeByNameAddress } from "@/lib/stays/utils";
import { scrapeJadestaVillage } from "@/lib/stays/jadesta";
import { fetchGooglePlacesCached } from "@/lib/stays/google_places";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseUrls(req: NextRequest): string[] {
  const url = new URL(req.url);
  const list = url.searchParams.get("urls");
  if (!list) return [];
  return list.split(",").map(s => s.trim()).filter(Boolean);
}

export async function GET(req: NextRequest) {
  const urls = parseUrls(req);
  if (urls.length === 0) {
    return new Response(JSON.stringify({ error: "Provide ?urls=comma,separated,urls" }, null, 2),
      { status: 400, headers: { "content-type": "application/json" } });
  }

  const all: any[] = [];
  for (const u of urls) {
    const stays = await scrapeJadestaVillage(u);
    // console.log(stays, "ez pedig jadesta stays"); 

    // all.push(...stays);
  }

  const google = await fetchGooglePlacesCached();
  console.log(google, "googleee staysss"); 
  all.push(...google);

  const final = dedupeByNameAddress(all);
  return new Response(JSON.stringify(final, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
