import { COMMODITIES, REGIONS, type Commodity, type Region } from "./commodities";

// Deterministic PRNG (mulberry32)
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface PricePoint {
  commodityId: string;
  regionId: string;
  date: string; // YYYY-MM-DD
  price: number;
}

function regionMultiplier(region: Region, c: Commodity): number {
  let m = 1;
  if (c.imported && region.inland) m *= 1 + 0.05 + (region.id === "basse" ? 0.03 : 0.015);
  if (c.fish) {
    if (region.coastal) m *= 0.7;
    else if (region.inland) m *= 1.25;
  }
  if (region.id === "banjul") m *= 0.98;
  return m;
}

export function generateHistory(days = 30): PricePoint[] {
  const out: PricePoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const c of COMMODITIES) {
    for (const r of REGIONS) {
      const seed = hash(`${c.id}|${r.id}`);
      const rand = mulberry32(seed);
      const base = c.recommended * regionMultiplier(r, c);
      let price = base * (0.94 + rand() * 0.08);

      for (let d = days - 1; d >= 0; d--) {
        const date = new Date(today);
        date.setDate(today.getDate() - d);
        // Random walk
        const drift = (rand() - 0.48) * 0.025 * base;
        price = Math.max(base * 0.78, Math.min(base * 1.35, price + drift));

        // Onion spike in Serekunda last 3 days
        if (
          (c.id === "onion-local" || c.id === "onion-holland") &&
          r.id === "kanifing" &&
          d <= 2
        ) {
          price = base * (1.32 + (2 - d) * 0.04);
        }

        out.push({
          commodityId: c.id,
          regionId: r.id,
          date: date.toISOString().slice(0, 10),
          price: Math.round(price),
        });
      }
    }
  }
  return out;
}

export function getLatest(history: PricePoint[]): PricePoint[] {
  const map = new Map<string, PricePoint>();
  for (const p of history) {
    const k = `${p.commodityId}|${p.regionId}`;
    const cur = map.get(k);
    if (!cur || cur.date < p.date) map.set(k, p);
  }
  return [...map.values()];
}

export function isGouging(price: number, recommended: number) {
  return price > recommended * 1.2;
}

export function pctVsRecommended(price: number, recommended: number) {
  return ((price - recommended) / recommended) * 100;
}
