// Ask DalasiWatch — comprehensive market-analysis AI agent grounded in real price data.
// Public endpoint (verify_jwt = false). Reads only public price tables.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Mirror of src/data/commodities.ts (keep in sync if catalog changes)
const COMMODITIES = [
  { id: "rice-sadam", name: "Rice (Sadam)", unit: "50kg bag", category: "staple" },
  { id: "rice-broken", name: "Rice (Broken)", unit: "50kg bag", category: "staple" },
  { id: "rice-american", name: "Rice (American)", unit: "50kg bag", category: "staple" },
  { id: "sugar-50", name: "Sugar", unit: "50kg bag", category: "staple" },
  { id: "sugar-1", name: "Sugar", unit: "1kg", category: "staple" },
  { id: "flour", name: "Flour", unit: "50kg bag", category: "staple" },
  { id: "oil-20", name: "Cooking Oil", unit: "20L", category: "staple" },
  { id: "oil-5", name: "Cooking Oil", unit: "5L", category: "staple" },
  { id: "oil-1", name: "Cooking Oil", unit: "1L", category: "staple" },
  { id: "fish-bonga", name: "Bonga Fish", unit: "kg", category: "protein" },
  { id: "fish-ladyfish", name: "Ladyfish", unit: "kg", category: "protein" },
  { id: "beef-bone", name: "Beef (with bone)", unit: "kg", category: "protein" },
  { id: "beef-nobone", name: "Beef (boneless)", unit: "kg", category: "protein" },
  { id: "chicken-local", name: "Chicken (Local)", unit: "whole", category: "protein" },
  { id: "chicken-carton", name: "Chicken (Carton)", unit: "carton", category: "protein" },
  { id: "eggs", name: "Eggs", unit: "crate (30)", category: "protein" },
  { id: "onion-local", name: "Onions (Local)", unit: "kg", category: "vegetable" },
  { id: "onion-holland", name: "Onions (Holland)", unit: "kg", category: "vegetable" },
  { id: "potato", name: "Potatoes", unit: "kg", category: "vegetable" },
  { id: "tomato", name: "Tomatoes", unit: "kg", category: "vegetable" },
  { id: "bitter-tomato", name: "Bitter Tomato", unit: "kg", category: "vegetable" },
  { id: "pepper", name: "Peppers", unit: "kg", category: "vegetable" },
  { id: "charcoal", name: "Charcoal", unit: "large bag", category: "energy" },
  { id: "firewood", name: "Firewood", unit: "bundle", category: "energy" },
  { id: "gas-12", name: "Gas Cylinder", unit: "12.5kg", category: "energy" },
];

const REGIONS = [
  { id: "banjul", name: "Banjul" },
  { id: "kanifing", name: "Kanifing (Serekunda)" },
  { id: "brikama", name: "Brikama / Tanji" },
  { id: "soma", name: "Soma" },
  { id: "farafenni", name: "Farafenni" },
  { id: "bansang", name: "Bansang" },
  { id: "basse", name: "Basse" },
];

const REGION_IDS = new Set(REGIONS.map((r) => r.id));
const CATEGORIES = ["staple", "protein", "vegetable", "energy"] as const;

// Inflation basket: weighted staples representing typical household spend
const INFLATION_BASKET: Array<{ commodity_id: string; weight: number }> = [
  { commodity_id: "rice-sadam", weight: 0.25 },
  { commodity_id: "sugar-1", weight: 0.10 },
  { commodity_id: "oil-5", weight: 0.15 },
  { commodity_id: "flour", weight: 0.10 },
  { commodity_id: "onion-local", weight: 0.08 },
  { commodity_id: "tomato", weight: 0.07 },
  { commodity_id: "fish-bonga", weight: 0.10 },
  { commodity_id: "eggs", weight: 0.05 },
  { commodity_id: "gas-12", weight: 0.10 },
];

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

let AVAILABLE_COMMODITY_IDS: Set<string> = new Set();

async function loadAvailableCommodities(): Promise<void> {
  const ids = new Set<string>();
  for (const table of ["price_history", "citizen_reports"] as const) {
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select("commodity_id")
        .range(from, from + pageSize - 1);
      if (error || !data || data.length === 0) break;
      data.forEach((r: any) => ids.add(r.commodity_id));
      if (data.length < pageSize) break;
      from += pageSize;
    }
  }
  AVAILABLE_COMMODITY_IDS = ids;
}

function availableCommodities() {
  return COMMODITIES.filter((c) => AVAILABLE_COMMODITY_IDS.has(c.id));
}
function commodityLabel(id: string) {
  const c = COMMODITIES.find((x) => x.id === id);
  return c ? `${c.name} (${c.unit})` : id;
}
function regionLabel(id: string) {
  const r = REGIONS.find((x) => x.id === id);
  return r ? r.name : id;
}

// ---------- Data helpers (paged) ----------

async function fetchAllPriceHistory(opts: {
  commodity_ids?: string[];
  region_ids?: string[];
  since?: string; // YYYY-MM-DD
}) {
  const out: Array<{ commodity_id: string; region_id: string; price: number; point_date: string }> = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    let q = supabase
      .from("price_history")
      .select("commodity_id, region_id, price, point_date")
      .order("point_date", { ascending: false })
      .range(from, from + pageSize - 1);
    if (opts.commodity_ids?.length) q = q.in("commodity_id", opts.commodity_ids);
    if (opts.region_ids?.length) q = q.in("region_id", opts.region_ids);
    if (opts.since) q = q.gte("point_date", opts.since);
    const { data, error } = await q;
    if (error || !data || data.length === 0) break;
    data.forEach((r: any) => out.push({ ...r, price: Number(r.price) }));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

async function fetchAllCitizenReports(opts: { since?: string }) {
  const out: Array<{ commodity_id: string; region_id: string; market: string; price: number; report_date: string }> = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    let q = supabase
      .from("citizen_reports")
      .select("commodity_id, region_id, market, price, report_date")
      .order("report_date", { ascending: false })
      .range(from, from + pageSize - 1);
    if (opts.since) q = q.gte("report_date", opts.since);
    const { data, error } = await q;
    if (error || !data || data.length === 0) break;
    data.forEach((r: any) => out.push({ ...r, price: Number(r.price) }));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Latest price per (commodity, region) from a rows array (already sorted desc by date)
function latestByCR(rows: Array<{ commodity_id: string; region_id: string; price: number; point_date: string }>) {
  const map = new Map<string, { price: number; date: string }>();
  for (const r of rows) {
    const k = `${r.commodity_id}|${r.region_id}`;
    if (!map.has(k)) map.set(k, { price: r.price, date: r.point_date });
  }
  return map;
}

// Stats helpers
function mean(xs: number[]) { return xs.reduce((a, b) => a + b, 0) / xs.length; }
function stddev(xs: number[]) { if (xs.length < 2) return 0; const m = mean(xs); return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1)); }
function median(xs: number[]) { const s = [...xs].sort((a, b) => a - b); const n = s.length; return n === 0 ? 0 : n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }

// ---------- Tool implementations ----------

async function getLatestPrice(args: { commodity_id: string; region_id?: string }) {
  if (!AVAILABLE_COMMODITY_IDS.has(args.commodity_id))
    return { error: `No price data available for "${args.commodity_id}".` };
  if (args.region_id && !REGION_IDS.has(args.region_id))
    return { error: `Unknown region_id "${args.region_id}".` };

  const regions = args.region_id ? [args.region_id] : Array.from(REGION_IDS);
  const ph = await fetchAllPriceHistory({ commodity_ids: [args.commodity_id], region_ids: regions });
  const cr = await fetchAllCitizenReports({ since: isoDaysAgo(7) });
  const latest = latestByCR(ph);

  const results: Array<{ region: string; price: number; date: string; source: string }> = [];
  for (const rid of regions) {
    const phPoint = latest.get(`${args.commodity_id}|${rid}`);
    const reports = cr.filter((r) => r.commodity_id === args.commodity_id && r.region_id === rid);
    if (reports.length > 0) {
      const avg = mean(reports.map((r) => r.price));
      const lastDate = reports[0].report_date;
      const blended = phPoint ? Math.round((avg + phPoint.price) / 2) : Math.round(avg);
      results.push({ region: regionLabel(rid), price: blended, date: lastDate, source: phPoint ? "citizen+history" : "citizen" });
    } else if (phPoint) {
      results.push({ region: regionLabel(rid), price: Math.round(phPoint.price), date: phPoint.date, source: "history" });
    }
  }
  if (results.length === 0) return { commodity: commodityLabel(args.commodity_id), prices: [], note: "No data." };
  return { commodity: commodityLabel(args.commodity_id), currency: "GMD", prices: results };
}

async function getPriceTrend(args: { commodity_id: string; region_id: string; days?: number }) {
  if (!AVAILABLE_COMMODITY_IDS.has(args.commodity_id)) return { error: `No data for "${args.commodity_id}".` };
  if (!REGION_IDS.has(args.region_id)) return { error: `Unknown region "${args.region_id}".` };
  const days = Math.min(Math.max(args.days ?? 30, 1), 365);
  const rows = await fetchAllPriceHistory({
    commodity_ids: [args.commodity_id],
    region_ids: [args.region_id],
    since: isoDaysAgo(days),
  });
  if (rows.length === 0) return { commodity: commodityLabel(args.commodity_id), region: regionLabel(args.region_id), points: [], note: "No trend data." };
  rows.sort((a, b) => a.point_date.localeCompare(b.point_date));
  const first = rows[0].price, last = rows[rows.length - 1].price;
  const step = Math.max(1, Math.floor(rows.length / 12));
  const sampled = rows.filter((_, i) => i % step === 0);
  if (sampled[sampled.length - 1] !== rows[rows.length - 1]) sampled.push(rows[rows.length - 1]);
  return {
    commodity: commodityLabel(args.commodity_id),
    region: regionLabel(args.region_id),
    currency: "GMD",
    days,
    first_price: Math.round(first),
    last_price: Math.round(last),
    pct_change: Math.round(((last - first) / first) * 1000) / 10,
    points: sampled.map((p) => ({ date: p.point_date, price: Math.round(p.price) })),
  };
}

async function compareRegions(args: { commodity_id: string }) {
  const latest = await getLatestPrice({ commodity_id: args.commodity_id });
  if ("error" in latest) return latest;
  const sorted = [...(latest.prices ?? [])].sort((a, b) => a.price - b.price);
  return { commodity: latest.commodity, currency: "GMD", cheapest: sorted[0], most_expensive: sorted[sorted.length - 1], all: sorted };
}

// NEW: top movers — biggest % changes over a window
async function topMovers(args: { days?: number; direction?: "up" | "down" | "both"; limit?: number; region_id?: string; category?: string }) {
  const days = Math.min(Math.max(args.days ?? 30, 7), 365);
  const limit = Math.min(Math.max(args.limit ?? 5, 1), 20);
  const direction = args.direction ?? "both";
  if (args.region_id && !REGION_IDS.has(args.region_id)) return { error: `Unknown region "${args.region_id}".` };
  const rows = await fetchAllPriceHistory({ since: isoDaysAgo(days), region_ids: args.region_id ? [args.region_id] : undefined });

  // Group by commodity → average across regions per date
  const byCommodity = new Map<string, Array<{ date: string; price: number }>>();
  for (const r of rows) {
    if (args.category) {
      const c = COMMODITIES.find((x) => x.id === r.commodity_id);
      if (!c || c.category !== args.category) continue;
    }
    if (!byCommodity.has(r.commodity_id)) byCommodity.set(r.commodity_id, []);
    byCommodity.get(r.commodity_id)!.push({ date: r.point_date, price: r.price });
  }

  const movers: Array<{ commodity_id: string; commodity: string; first: number; last: number; pct_change: number }> = [];
  for (const [cid, points] of byCommodity) {
    points.sort((a, b) => a.date.localeCompare(b.date));
    if (points.length < 2) continue;
    const first = points[0].price, last = points[points.length - 1].price;
    if (first <= 0) continue;
    const pct = ((last - first) / first) * 100;
    movers.push({ commodity_id: cid, commodity: commodityLabel(cid), first: Math.round(first), last: Math.round(last), pct_change: Math.round(pct * 10) / 10 });
  }

  let filtered = movers;
  if (direction === "up") filtered = movers.filter((m) => m.pct_change > 0).sort((a, b) => b.pct_change - a.pct_change);
  else if (direction === "down") filtered = movers.filter((m) => m.pct_change < 0).sort((a, b) => a.pct_change - b.pct_change);
  else filtered = movers.sort((a, b) => Math.abs(b.pct_change) - Math.abs(a.pct_change));

  return {
    days,
    direction,
    region: args.region_id ? regionLabel(args.region_id) : "All regions (avg)",
    category: args.category ?? "all",
    currency: "GMD",
    movers: filtered.slice(0, limit),
  };
}

// NEW: regional cost ranking — rank regions by overall cost (mean of latest prices, normalized)
async function rankRegionsByCost(args: { category?: string }) {
  const ph = await fetchAllPriceHistory({});
  const latest = latestByCR(ph);
  // For each commodity, compute its baseline (avg across regions). For each region, compute average of (price/baseline).
  const commodityRegionPrice = new Map<string, Map<string, number>>(); // cid -> rid -> price
  for (const [k, v] of latest) {
    const [cid, rid] = k.split("|");
    if (args.category) {
      const c = COMMODITIES.find((x) => x.id === cid);
      if (!c || c.category !== args.category) continue;
    }
    if (!commodityRegionPrice.has(cid)) commodityRegionPrice.set(cid, new Map());
    commodityRegionPrice.get(cid)!.set(rid, v.price);
  }
  const baselines = new Map<string, number>();
  for (const [cid, m] of commodityRegionPrice) {
    const vals = [...m.values()];
    if (vals.length > 0) baselines.set(cid, mean(vals));
  }
  const regionScores: Record<string, number[]> = {};
  for (const [cid, m] of commodityRegionPrice) {
    const base = baselines.get(cid)!;
    if (!base) continue;
    for (const [rid, price] of m) {
      regionScores[rid] = regionScores[rid] || [];
      regionScores[rid].push(price / base);
    }
  }
  const ranking = Object.entries(regionScores)
    .map(([rid, scores]) => ({ region: regionLabel(rid), index: Math.round(mean(scores) * 1000) / 10, items: scores.length }))
    .sort((a, b) => a.index - b.index);
  return { category: args.category ?? "all", note: "Index = 100 means average. <100 cheaper than national avg, >100 more expensive.", ranking };
}

// NEW: volatility — coefficient of variation per commodity over window
async function volatility(args: { days?: number; limit?: number; region_id?: string }) {
  const days = Math.min(Math.max(args.days ?? 60, 14), 365);
  const limit = Math.min(Math.max(args.limit ?? 8, 1), 25);
  if (args.region_id && !REGION_IDS.has(args.region_id)) return { error: `Unknown region "${args.region_id}".` };
  const rows = await fetchAllPriceHistory({ since: isoDaysAgo(days), region_ids: args.region_id ? [args.region_id] : undefined });
  const byC = new Map<string, number[]>();
  for (const r of rows) {
    if (!byC.has(r.commodity_id)) byC.set(r.commodity_id, []);
    byC.get(r.commodity_id)!.push(r.price);
  }
  const out = [...byC.entries()]
    .filter(([, v]) => v.length >= 5)
    .map(([cid, prices]) => {
      const m = mean(prices);
      const sd = stddev(prices);
      return { commodity_id: cid, commodity: commodityLabel(cid), mean: Math.round(m), stddev: Math.round(sd), cv_pct: m > 0 ? Math.round((sd / m) * 1000) / 10 : 0, samples: prices.length };
    })
    .sort((a, b) => b.cv_pct - a.cv_pct)
    .slice(0, limit);
  return { days, region: args.region_id ? regionLabel(args.region_id) : "All regions", currency: "GMD", note: "CV% = stddev/mean. Higher = more volatile.", commodities: out };
}

// NEW: stats summary (avg/min/max/median/stddev) for a commodity over window
async function statsSummary(args: { commodity_id: string; days?: number; region_id?: string }) {
  if (!AVAILABLE_COMMODITY_IDS.has(args.commodity_id)) return { error: `No data for "${args.commodity_id}".` };
  if (args.region_id && !REGION_IDS.has(args.region_id)) return { error: `Unknown region "${args.region_id}".` };
  const days = Math.min(Math.max(args.days ?? 30, 7), 365);
  const rows = await fetchAllPriceHistory({ commodity_ids: [args.commodity_id], region_ids: args.region_id ? [args.region_id] : undefined, since: isoDaysAgo(days) });
  if (rows.length === 0) return { commodity: commodityLabel(args.commodity_id), note: "No data in window." };
  const prices = rows.map((r) => r.price);
  return {
    commodity: commodityLabel(args.commodity_id),
    region: args.region_id ? regionLabel(args.region_id) : "All regions",
    days,
    currency: "GMD",
    samples: prices.length,
    mean: Math.round(mean(prices)),
    median: Math.round(median(prices)),
    min: Math.round(Math.min(...prices)),
    max: Math.round(Math.max(...prices)),
    stddev: Math.round(stddev(prices)),
  };
}

// NEW: filter & sort — flexible query across latest prices
async function filterCommodities(args: {
  region_id?: string;
  category?: string;
  max_price?: number;
  min_price?: number;
  sort_by?: "price_asc" | "price_desc" | "name";
  limit?: number;
}) {
  if (args.region_id && !REGION_IDS.has(args.region_id)) return { error: `Unknown region "${args.region_id}".` };
  const limit = Math.min(Math.max(args.limit ?? 20, 1), 50);
  const ph = await fetchAllPriceHistory({ region_ids: args.region_id ? [args.region_id] : undefined });
  const latest = latestByCR(ph);

  // For each commodity, compute price (single-region if specified, else avg across regions)
  const items: Array<{ commodity_id: string; commodity: string; category: string; price: number; region: string }> = [];
  const grouped = new Map<string, Array<{ rid: string; price: number }>>();
  for (const [k, v] of latest) {
    const [cid, rid] = k.split("|");
    if (!grouped.has(cid)) grouped.set(cid, []);
    grouped.get(cid)!.push({ rid, price: v.price });
  }
  for (const [cid, arr] of grouped) {
    const meta = COMMODITIES.find((x) => x.id === cid);
    if (!meta) continue;
    if (args.category && meta.category !== args.category) continue;
    let price: number; let region: string;
    if (args.region_id) {
      const hit = arr.find((x) => x.rid === args.region_id);
      if (!hit) continue;
      price = hit.price; region = regionLabel(args.region_id);
    } else {
      price = Math.round(mean(arr.map((x) => x.price)));
      region = "Avg of regions";
    }
    if (args.min_price != null && price < args.min_price) continue;
    if (args.max_price != null && price > args.max_price) continue;
    items.push({ commodity_id: cid, commodity: commodityLabel(cid), category: meta.category, price: Math.round(price), region });
  }
  const sortBy = args.sort_by ?? "price_asc";
  if (sortBy === "price_asc") items.sort((a, b) => a.price - b.price);
  else if (sortBy === "price_desc") items.sort((a, b) => b.price - a.price);
  else items.sort((a, b) => a.commodity.localeCompare(b.commodity));
  return { count: items.length, currency: "GMD", filters: args, items: items.slice(0, limit) };
}

// NEW: cross-commodity trend comparison
async function compareCommoditiesTrend(args: { commodity_ids: string[]; region_id?: string; days?: number }) {
  if (!Array.isArray(args.commodity_ids) || args.commodity_ids.length < 2) return { error: "Provide at least 2 commodity_ids." };
  if (args.region_id && !REGION_IDS.has(args.region_id)) return { error: `Unknown region "${args.region_id}".` };
  const days = Math.min(Math.max(args.days ?? 30, 7), 365);
  const rows = await fetchAllPriceHistory({
    commodity_ids: args.commodity_ids,
    region_ids: args.region_id ? [args.region_id] : undefined,
    since: isoDaysAgo(days),
  });
  const result: Array<{ commodity: string; first: number; last: number; pct_change: number; points: Array<{ date: string; price: number }> }> = [];
  for (const cid of args.commodity_ids) {
    const pts = rows.filter((r) => r.commodity_id === cid).map((r) => ({ date: r.point_date, price: r.price }));
    if (pts.length < 2) continue;
    pts.sort((a, b) => a.date.localeCompare(b.date));
    const step = Math.max(1, Math.floor(pts.length / 10));
    const sampled = pts.filter((_, i) => i % step === 0);
    if (sampled[sampled.length - 1] !== pts[pts.length - 1]) sampled.push(pts[pts.length - 1]);
    const first = pts[0].price, last = pts[pts.length - 1].price;
    result.push({
      commodity: commodityLabel(cid),
      first: Math.round(first),
      last: Math.round(last),
      pct_change: Math.round(((last - first) / first) * 1000) / 10,
      points: sampled.map((p) => ({ date: p.date, price: Math.round(p.price) })),
    });
  }
  return { region: args.region_id ? regionLabel(args.region_id) : "All regions (avg)", days, currency: "GMD", series: result };
}

// NEW: citizen reports insights
async function citizenInsights(args: { days?: number; region_id?: string; limit?: number }) {
  const days = Math.min(Math.max(args.days ?? 30, 1), 365);
  const limit = Math.min(Math.max(args.limit ?? 10, 1), 25);
  const reports = await fetchAllCitizenReports({ since: isoDaysAgo(days) });
  let filtered = reports;
  if (args.region_id) {
    if (!REGION_IDS.has(args.region_id)) return { error: `Unknown region "${args.region_id}".` };
    filtered = reports.filter((r) => r.region_id === args.region_id);
  }
  const byC: Record<string, number> = {};
  const byR: Record<string, number> = {};
  const byMarket: Record<string, number> = {};
  for (const r of filtered) {
    byC[r.commodity_id] = (byC[r.commodity_id] || 0) + 1;
    byR[r.region_id] = (byR[r.region_id] || 0) + 1;
    byMarket[r.market] = (byMarket[r.market] || 0) + 1;
  }
  const topCommodities = Object.entries(byC).map(([cid, n]) => ({ commodity: commodityLabel(cid), reports: n })).sort((a, b) => b.reports - a.reports).slice(0, limit);
  const topRegions = Object.entries(byR).map(([rid, n]) => ({ region: regionLabel(rid), reports: n })).sort((a, b) => b.reports - a.reports);
  const topMarkets = Object.entries(byMarket).map(([m, n]) => ({ market: m, reports: n })).sort((a, b) => b.reports - a.reports).slice(0, limit);
  return { days, total_reports: filtered.length, region: args.region_id ? regionLabel(args.region_id) : "All regions", top_commodities: topCommodities, top_regions: topRegions, top_markets: topMarkets };
}

// NEW: inflation basket — weighted index over time
async function inflationBasket(args: { days?: number; region_id?: string }) {
  const days = Math.min(Math.max(args.days ?? 90, 30), 365);
  if (args.region_id && !REGION_IDS.has(args.region_id)) return { error: `Unknown region "${args.region_id}".` };
  const cids = INFLATION_BASKET.map((b) => b.commodity_id);
  const rows = await fetchAllPriceHistory({ commodity_ids: cids, region_ids: args.region_id ? [args.region_id] : undefined, since: isoDaysAgo(days) });
  // Bucket by week
  const byWeek = new Map<string, Map<string, number[]>>(); // weekKey -> cid -> prices
  for (const r of rows) {
    const wk = r.point_date.slice(0, 7); // YYYY-MM (monthly buckets to keep stable)
    if (!byWeek.has(wk)) byWeek.set(wk, new Map());
    const m = byWeek.get(wk)!;
    if (!m.has(r.commodity_id)) m.set(r.commodity_id, []);
    m.get(r.commodity_id)!.push(r.price);
  }
  const weeks = [...byWeek.keys()].sort();
  if (weeks.length === 0) return { note: "No basket data." };
  // Compute weighted basket value per week
  const series: Array<{ date: string; basket_value: number }> = [];
  for (const wk of weeks) {
    const m = byWeek.get(wk)!;
    let val = 0; let totalW = 0;
    for (const { commodity_id, weight } of INFLATION_BASKET) {
      const prices = m.get(commodity_id);
      if (!prices || prices.length === 0) continue;
      val += mean(prices) * weight;
      totalW += weight;
    }
    if (totalW > 0) series.push({ date: wk, basket_value: Math.round((val / totalW) * 100) / 100 });
  }
  if (series.length < 2) return { note: "Not enough data for inflation index." };
  const base = series[0].basket_value;
  const indexed = series.map((s) => ({ date: s.date, index: Math.round((s.basket_value / base) * 1000) / 10, value: s.basket_value }));
  const last = indexed[indexed.length - 1];
  return {
    days,
    region: args.region_id ? regionLabel(args.region_id) : "National (avg)",
    currency: "GMD",
    basket: INFLATION_BASKET.map((b) => ({ commodity: commodityLabel(b.commodity_id), weight: b.weight })),
    base_index: 100,
    current_index: last.index,
    pct_change: Math.round((last.index - 100) * 10) / 10,
    series: indexed,
  };
}

// ---------- Tool registry ----------

const TOOLS = [
  { type: "function", function: { name: "list_commodities", description: "List all tracked commodities with IDs, names, units, categories.", parameters: { type: "object", properties: {}, additionalProperties: false } } },
  { type: "function", function: { name: "list_regions", description: "List all tracked regions of The Gambia.", parameters: { type: "object", properties: {}, additionalProperties: false } } },
  {
    type: "function", function: {
      name: "get_latest_price",
      description: "Latest price for a commodity, optionally one region. Combines official history + recent citizen reports.",
      parameters: { type: "object", properties: { commodity_id: { type: "string" }, region_id: { type: "string" } }, required: ["commodity_id"], additionalProperties: false },
    },
  },
  {
    type: "function", function: {
      name: "get_price_trend",
      description: "Price trend for a commodity in one region over N days (default 30).",
      parameters: { type: "object", properties: { commodity_id: { type: "string" }, region_id: { type: "string" }, days: { type: "number" } }, required: ["commodity_id", "region_id"], additionalProperties: false },
    },
  },
  {
    type: "function", function: {
      name: "compare_regions",
      description: "Compare latest price of one commodity across all 7 regions.",
      parameters: { type: "object", properties: { commodity_id: { type: "string" } }, required: ["commodity_id"], additionalProperties: false },
    },
  },
  {
    type: "function", function: {
      name: "top_movers",
      description: "Top commodities by price change (% up, down, or absolute) over N days. Optional category/region filter.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "7-365, default 30" },
          direction: { type: "string", enum: ["up", "down", "both"], description: "default 'both'" },
          limit: { type: "number", description: "1-20, default 5" },
          region_id: { type: "string" },
          category: { type: "string", enum: ["staple", "protein", "vegetable", "energy"] },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function", function: {
      name: "rank_regions_by_cost",
      description: "Rank all 7 regions by overall cost-of-living index (100 = national average). Optional category filter.",
      parameters: { type: "object", properties: { category: { type: "string", enum: ["staple", "protein", "vegetable", "energy"] } }, additionalProperties: false },
    },
  },
  {
    type: "function", function: {
      name: "volatility",
      description: "Most volatile commodities (coefficient of variation %) over N days. Useful for 'unstable' or 'risky' questions.",
      parameters: { type: "object", properties: { days: { type: "number" }, limit: { type: "number" }, region_id: { type: "string" } }, additionalProperties: false },
    },
  },
  {
    type: "function", function: {
      name: "stats_summary",
      description: "Statistical summary (mean/median/min/max/stddev) for one commodity over N days.",
      parameters: { type: "object", properties: { commodity_id: { type: "string" }, region_id: { type: "string" }, days: { type: "number" } }, required: ["commodity_id"], additionalProperties: false },
    },
  },
  {
    type: "function", function: {
      name: "filter_commodities",
      description: "Flexible filter+sort across all commodities by category, price range, region. Use for 'show me X under GMD Y' questions.",
      parameters: {
        type: "object",
        properties: {
          region_id: { type: "string" },
          category: { type: "string", enum: ["staple", "protein", "vegetable", "energy"] },
          max_price: { type: "number" },
          min_price: { type: "number" },
          sort_by: { type: "string", enum: ["price_asc", "price_desc", "name"] },
          limit: { type: "number" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function", function: {
      name: "compare_commodities_trend",
      description: "Compare price trends of 2+ commodities side by side over N days. Use for 'rice vs flour' questions.",
      parameters: { type: "object", properties: { commodity_ids: { type: "array", items: { type: "string" }, minItems: 2 }, region_id: { type: "string" }, days: { type: "number" } }, required: ["commodity_ids"], additionalProperties: false },
    },
  },
  {
    type: "function", function: {
      name: "citizen_insights",
      description: "Insights from citizen reports: most-reported commodities, regional hotspots, top markets.",
      parameters: { type: "object", properties: { days: { type: "number" }, region_id: { type: "string" }, limit: { type: "number" } }, additionalProperties: false },
    },
  },
  {
    type: "function", function: {
      name: "inflation_basket",
      description: "Weighted household inflation index (base 100) over time using a 9-item staple basket.",
      parameters: { type: "object", properties: { days: { type: "number" }, region_id: { type: "string" } }, additionalProperties: false },
    },
  },
];

async function runTool(name: string, args: any) {
  switch (name) {
    case "list_commodities": return { commodities: availableCommodities() };
    case "list_regions": return { regions: REGIONS };
    case "get_latest_price": return await getLatestPrice(args);
    case "get_price_trend": return await getPriceTrend(args);
    case "compare_regions": return await compareRegions(args);
    case "top_movers": return await topMovers(args);
    case "rank_regions_by_cost": return await rankRegionsByCost(args);
    case "volatility": return await volatility(args);
    case "stats_summary": return await statsSummary(args);
    case "filter_commodities": return await filterCommodities(args);
    case "compare_commodities_trend": return await compareCommoditiesTrend(args);
    case "citizen_insights": return await citizenInsights(args);
    case "inflation_basket": return await inflationBasket(args);
    default: return { error: `Unknown tool: ${name}` };
  }
}

const SYSTEM_PROMPT = `You are DalasiWatch's market analysis assistant for The Gambia — a data-driven analyst, not just a price lookup bot.

CORE RULES:
- ALWAYS use tools to get real data. NEVER guess prices, percentages, or trends.
- All prices in GMD (Gambian Dalasi). Format like "GMD 75".
- Default time window when user doesn't specify: 30 days.
- Be concise but insightful. Add brief interpretation, not just raw numbers.
- If a tool returns no data, say so honestly — never fabricate.

TOOL SELECTION GUIDE:
- "Price of X in Y?" → get_latest_price
- "Where is X cheapest?" → compare_regions
- "How has X changed?" / "trend" → get_price_trend
- "What's risen/fallen most?" / "biggest movers" → top_movers
- "Which region is most expensive?" / "rank regions" → rank_regions_by_cost
- "Most unstable / volatile / risky" → volatility
- "Average / min / max / stats for X" → stats_summary
- "Show me X under GMD Y" / "list / filter / sort" → filter_commodities
- "Compare X vs Y" (multi commodity) → compare_commodities_trend
- "What are people reporting?" / "hotspots" → citizen_insights
- "Inflation" / "cost of living index" / "basket" → inflation_basket

VISUAL OUTPUT — IMPORTANT:
When you have time-series or comparison data, embed a chart using a fenced block. The UI will render it inline.

For a single-line trend or basket index, use:
\`\`\`chart
{"type":"line","title":"Rice (Sadam) — Banjul","xKey":"date","yKey":"price","unit":"GMD","data":[{"date":"2025-01","price":2400},{"date":"2025-02","price":2480}]}
\`\`\`

For comparing multiple series, use:
\`\`\`chart
{"type":"multiLine","title":"Rice vs Flour","xKey":"date","series":[{"name":"Rice","data":[{"date":"2025-01","value":2400}]},{"name":"Flour","data":[{"date":"2025-01","value":1800}]}],"unit":"GMD"}
\`\`\`

For regional comparison or top-movers ranking, use:
\`\`\`chart
{"type":"bar","title":"Cheapest regions for Sugar","xKey":"label","yKey":"value","unit":"GMD","data":[{"label":"Basse","value":68},{"label":"Banjul","value":75}]}
\`\`\`

RULES FOR CHARTS:
- Embed a chart whenever the data is time-series, ranking, or comparison (4+ data points).
- Keep data arrays small (≤ 12 points). Use the sampled points the tools return.
- Always include a short markdown summary BEFORE the chart and a 1-2 sentence insight AFTER.
- For pure single-number lookups, no chart needed — just the answer.

For tabular data (e.g. filter results, top markets), use markdown tables.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages: userMessages } = await req.json();
    if (!Array.isArray(userMessages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    await loadAvailableCommodities();
    const catalog = availableCommodities().map((c) => `- ${c.id}: ${c.name} (${c.unit}) [${c.category}]`).join("\n");
    const dynamicSystem = `${SYSTEM_PROMPT}

TRACKED COMMODITIES (only these have data — do NOT invent others):
${catalog}

TRACKED REGIONS:
${REGIONS.map((r) => `- ${r.id}: ${r.name}`).join("\n")}

CATEGORIES: ${CATEGORIES.join(", ")}`;

    let messages: any[] = [{ role: "system", content: dynamicSystem }, ...userMessages];

    for (let round = 0; round < 6; round++) {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, tools: TOOLS }),
      });

      if (!resp.ok) {
        if (resp.status === 429) return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await resp.text();
        console.error("AI gateway error", resp.status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const json = await resp.json();
      const msg = json.choices?.[0]?.message;
      if (!msg) return new Response(JSON.stringify({ error: "No response from model" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const toolCalls = msg.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        messages.push({ role: "assistant", content: msg.content ?? "", tool_calls: toolCalls });
        for (const tc of toolCalls) {
          let parsed: any = {};
          try { parsed = JSON.parse(tc.function.arguments || "{}"); } catch { /* ignore */ }
          console.log("tool_call", tc.function.name, parsed);
          const result = await runTool(tc.function.name, parsed);
          messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
        }
        continue;
      }

      return new Response(JSON.stringify({ content: msg.content ?? "" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Tool-call loop exceeded max rounds." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ask-dalasi error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
