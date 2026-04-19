import { generateHistory, type PricePoint } from "./generator";

const KEY = "dalasiwatch:history:v1";
const REPORTS_KEY = "dalasiwatch:reports:v1";

export function loadHistory(): PricePoint[] {
  if (typeof window === "undefined") return generateHistory();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const fresh = generateHistory();
  try {
    localStorage.setItem(KEY, JSON.stringify(fresh));
  } catch {
    /* ignore */
  }
  return fresh;
}

export interface CitizenReport {
  id: string;
  commodityId: string;
  regionId: string;
  market: string;
  price: number;
  date: string;
  reporter?: string;
}

export function loadReports(): CitizenReport[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveReport(r: CitizenReport) {
  const all = loadReports();
  all.unshift(r);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(all.slice(0, 200)));

  // Only push to shared history when the report is verified by 2+ reporters
  // for the same commodity, region and market (within ±15% price agreement).
  try {
    const group = all.filter(
      (x) =>
        x.commodityId === r.commodityId &&
        x.regionId === r.regionId &&
        x.market.trim().toLowerCase() === r.market.trim().toLowerCase(),
    );
    const agree = group.filter(
      (x) => Math.abs(x.price - r.price) / r.price <= 0.15,
    );
    if (agree.length >= 2) {
      const avg = Math.round(agree.reduce((s, x) => s + x.price, 0) / agree.length);
      const h = loadHistory();
      h.push({
        commodityId: r.commodityId,
        regionId: r.regionId,
        date: r.date,
        price: avg,
      });
      localStorage.setItem(KEY, JSON.stringify(h));
    }
  } catch {
    /* ignore */
  }
}

export interface VerifiedReport {
  key: string;
  commodityId: string;
  regionId: string;
  market: string;
  avgPrice: number;
  count: number;
  verified: boolean;
  lastDate: string;
}

/**
 * Groups raw citizen reports by commodity + region + market and marks a group
 * as verified once at least 2 reporters submitted prices that agree within ±15%.
 */
export function getVerifiedReports(): VerifiedReport[] {
  const all = loadReports();
  const groups = new Map<string, CitizenReport[]>();
  for (const r of all) {
    const k = `${r.commodityId}|${r.regionId}|${r.market.trim().toLowerCase()}`;
    const arr = groups.get(k) ?? [];
    arr.push(r);
    groups.set(k, arr);
  }
  const out: VerifiedReport[] = [];
  for (const [k, arr] of groups) {
    const sorted = [...arr].sort((a, b) => a.price - b.price);
    const median = sorted[Math.floor(sorted.length / 2)].price;
    const agree = arr.filter((x) => Math.abs(x.price - median) / median <= 0.15);
    const avg = Math.round(agree.reduce((s, x) => s + x.price, 0) / agree.length);
    const lastDate = arr.reduce((d, x) => (x.date > d ? x.date : d), arr[0].date);
    out.push({
      key: k,
      commodityId: arr[0].commodityId,
      regionId: arr[0].regionId,
      market: arr[0].market,
      avgPrice: avg,
      count: agree.length,
      verified: agree.length >= 2,
      lastDate,
    });
  }
  return out.sort((a, b) => (a.lastDate < b.lastDate ? 1 : -1));
}
