
import fs from "node:fs/promises";
import path from "node:path";
import type { Stay } from "./stays/types";

type CacheShape = {
  cachedAt: number;
  data: Stay[];
};

const CACHE_MAX_AGE_MS = 120 * 24 * 60 * 60 * 1000; // 120 days
const CACHE_FILE = path.join(process.cwd(), "tmp-cache", "places-maratua.json");


export async function readCache(): Promise<CacheShape | null> {
    try {
      // ensure folder exists
      await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
      const raw = await fs.readFile(CACHE_FILE, "utf8");
      const parsed = JSON.parse(raw) as CacheShape;
      if (Date.now() - parsed.cachedAt <= CACHE_MAX_AGE_MS) return parsed;
      return null;
    } catch {
      return null;
    }
  }
  
 export async function writeCache(data: Stay[]): Promise<void> {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    const payload: CacheShape = { cachedAt: Date.now(), data };
    await fs.writeFile(CACHE_FILE, JSON.stringify(payload), "utf8");
  }
  