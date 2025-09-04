import type { Stay } from "./types";

export function dedupeByNameAddress(items: Stay[]): Stay[] {
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
