import { supabase } from "@/integrations/supabase/client";
import { generateHistory, type PricePoint } from "./generator";

const SEED_FLAG = "dalasiwatch:seeded:v1";

/**
 * Loads price history from Supabase. On first run (empty table), seeds the
 * generator output into the database so every visitor sees the same data.
 */
export async function loadHistory(): Promise<PricePoint[]> {
  const { data, error } = await supabase
    .from("price_history")
    .select("commodity_id, region_id, point_date, price")
    .order("point_date", { ascending: true });

  if (error) {
    console.error("loadHistory error", error);
    return generateHistory();
  }

  if (!data || data.length === 0) {
    return await seedHistoryIfNeeded();
  }

  return data.map((r) => ({
    commodityId: r.commodity_id,
    regionId: r.region_id,
    date: r.point_date as string,
    price: Number(r.price),
  }));
}

async function seedHistoryIfNeeded(): Promise<PricePoint[]> {
  // Avoid concurrent seeders from a single browser session
  if (typeof window !== "undefined" && sessionStorage.getItem(SEED_FLAG)) {
    return generateHistory();
  }
  if (typeof window !== "undefined") sessionStorage.setItem(SEED_FLAG, "1");

  const fresh = generateHistory();
  // Insert in chunks to stay within request limits
  const chunkSize = 500;
  for (let i = 0; i < fresh.length; i += chunkSize) {
    const chunk = fresh.slice(i, i + chunkSize).map((p) => ({
      commodity_id: p.commodityId,
      region_id: p.regionId,
      point_date: p.date,
      price: p.price,
    }));
    const { error } = await supabase
      .from("price_history")
      .insert(chunk);
    if (error) {
      // Likely a race — another tab already seeded. Stop and re-read below.
      console.warn("seed insert error (continuing)", error.message);
      break;
    }
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

export async function loadReports(): Promise<CitizenReport[]> {
  const { data, error } = await supabase
    .from("citizen_reports")
    .select("id, commodity_id, region_id, market, price, reporter, report_date")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("loadReports error", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    commodityId: r.commodity_id,
    regionId: r.region_id,
    market: r.market,
    price: Number(r.price),
    reporter: r.reporter ?? undefined,
    date: r.report_date as string,
  }));
}

export async function saveReport(
  r: Omit<CitizenReport, "id">,
): Promise<void> {
  const { error } = await supabase.from("citizen_reports").insert({
    commodity_id: r.commodityId,
    region_id: r.regionId,
    market: r.market,
    price: r.price,
    reporter: r.reporter || null,
    report_date: r.date,
  });
  if (error) {
    console.error("saveReport error", error);
    throw error;
  }

  // If the new report agrees with another report for the same item/market
  // within ±15%, push the average into shared price_history.
  try {
    const { data: group } = await supabase
      .from("citizen_reports")
      .select("price")
      .eq("commodity_id", r.commodityId)
      .eq("region_id", r.regionId)
      .ilike("market", r.market.trim());

    if (group && group.length >= 2) {
      const prices = group.map((g) => Number(g.price));
      const agree = prices.filter(
        (p) => Math.abs(p - r.price) / r.price <= 0.15,
      );
      if (agree.length >= 2) {
        const avg = Math.round(
          agree.reduce((s, x) => s + x, 0) / agree.length,
        );
        await supabase.from("price_history").insert({
          commodity_id: r.commodityId,
          region_id: r.regionId,
          point_date: r.date,
          price: avg,
        });
      }
    }
  } catch (e) {
    console.warn("verification step failed", e);
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
export async function getVerifiedReports(): Promise<VerifiedReport[]> {
  const all = await loadReports();
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
