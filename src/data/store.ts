import { generateHistory, type PricePoint } from "./generator";

const KEY = "lumatrack:history:v1";
const REPORTS_KEY = "lumatrack:reports:v1";

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

  // Also append to history so it shows in dashboards
  try {
    const h = loadHistory();
    h.push({
      commodityId: r.commodityId,
      regionId: r.regionId,
      date: r.date,
      price: r.price,
    });
    localStorage.setItem(KEY, JSON.stringify(h));
  } catch {
    /* ignore */
  }
}
