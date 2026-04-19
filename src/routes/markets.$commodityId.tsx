import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { COMMODITIES, REGIONS } from "@/data/commodities";
import { useApp } from "@/context/AppContext";
import { isGouging, pctVsRecommended } from "@/data/generator";

export const Route = createFileRoute("/markets/$commodityId")({
  head: ({ params }) => {
    const c = COMMODITIES.find((x) => x.id === params.commodityId);
    const title = c ? `${c.name} (${c.unit}) — DalasiWatch` : "Commodity — DalasiWatch";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: c
            ? `Live ${c.name} prices across The Gambia with 30-day trend and Ministry benchmark.`
            : "Commodity detail",
        },
      ],
    };
  },
  loader: ({ params }) => {
    const c = COMMODITIES.find((x) => x.id === params.commodityId);
    if (!c) throw notFound();
    return { commodity: c };
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Commodity not found</h1>
        <Link to="/markets" className="mt-4 inline-block text-navy underline">
          Back to markets
        </Link>
      </div>
    </AppShell>
  ),
  component: Detail,
});

function Detail() {
  const { commodity } = Route.useLoaderData();
  const { history } = useApp();

  const cHistory = history.filter((p) => p.commodityId === commodity.id);

  // National average per date
  const dates = [...new Set(cHistory.map((p) => p.date))].sort();
  const trend = dates.map((d) => {
    const pts = cHistory.filter((p) => p.date === d);
    const avg = pts.reduce((s, p) => s + p.price, 0) / pts.length;
    return { date: d.slice(5), price: Math.round(avg) };
  });

  // Latest per region
  const regional = REGIONS.map((r) => {
    const last = cHistory
      .filter((p) => p.regionId === r.id)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    const price = last?.price ?? 0;
    return {
      region: r,
      price,
      gouging: price > 0 && isGouging(price, commodity.recommended),
      pct: price > 0 ? pctVsRecommended(price, commodity.recommended) : 0,
    };
  }).sort((a, b) => b.price - a.price);

  const latestAvg = trend.at(-1)?.price ?? 0;

  // Gauge: 0% = at/below recommended, 100% = 50%+ above recommended
  // Green zone 0-20%, Amber 20-40%, Red 40-100% (gouging threshold is +20%)
  const overPct = commodity.recommended > 0
    ? ((latestAvg - commodity.recommended) / commodity.recommended) * 100
    : 0;
  const gaugePos = Math.max(0, Math.min(100, (overPct / 50) * 100));
  const gouging = isGouging(latestAvg, commodity.recommended);
  const zoneColor =
    overPct >= 20 ? "var(--alert)" : overPct >= 10 ? "#f59e0b" : "var(--stable)";

  return (
    <AppShell>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/markets" className="text-sm text-muted-foreground hover:text-foreground">
            ← All commodities
          </Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {commodity.category}
              </p>
              <h1 className="text-3xl font-extrabold md:text-4xl">{commodity.name}</h1>
              <p className="text-sm text-muted-foreground">Unit: {commodity.unit}</p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Nat. Avg
                </p>
                <p className="text-xl font-extrabold">GMD {latestAvg.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Recommended
                </p>
                <p className="text-xl font-extrabold text-stable">
                  GMD {commodity.recommended.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <PageIntro
          title="The full report card for this item"
          description="Everything you need to know about this product's price, all on one page."
          bullets={[
            "The two big numbers compare today's average price with the Ministry's fair price.",
            "The chart shows how the price moved every day for the last 30 days.",
            "The table lists each region so you can see where it's cheapest and where it's overpriced.",
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Price Pressure Gauge
            </h2>
            <span
              className="text-xs font-bold"
              style={{ color: zoneColor }}
            >
              {overPct > 0 ? "+" : ""}
              {overPct.toFixed(1)}% vs recommended
            </span>
          </div>

          {/* Gauge bar */}
          <div className="relative h-5 w-full overflow-hidden rounded-full border border-border">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, var(--stable) 0%, var(--stable) 30%, #f59e0b 50%, var(--alert) 80%, var(--alert) 100%)",
                opacity: 0.85,
              }}
            />
            {/* Marker */}
            <motion.div
              initial={{ left: "0%" }}
              animate={{ left: `${gaugePos}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-1/2 z-10 h-7 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-lg ring-2 ring-background"
            />
          </div>

          <div className="mt-2 flex justify-between text-[11px] font-medium text-muted-foreground">
            <span>
              Ministry Recommended
              <br />
              <span className="text-stable font-bold">
                GMD {commodity.recommended.toLocaleString()}
              </span>
            </span>
            <span className="text-right">
              Market Average
              <br />
              <span className="font-bold" style={{ color: zoneColor }}>
                GMD {latestAvg.toLocaleString()}
              </span>
            </span>
          </div>

          {gouging && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-start gap-3 rounded-xl border border-alert/40 bg-alert/10 p-3"
            >
              <span className="mt-0.5 text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-alert">
                  Potential Price Gouging Detected
                </p>
                <p className="text-xs text-muted-foreground">
                  Market average is more than 20% above the Ministry's recommended price.
                </p>
                <Link
                  to="/report"
                  className="mt-2 inline-block text-xs font-semibold text-alert underline underline-offset-2 hover:opacity-80"
                >
                  Report to Ministry of Trade →
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            30-Day National Trend
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--navy)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--navy)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`GMD ${Number(v).toLocaleString()}`, "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--navy)"
                  strokeWidth={2.5}
                  fill="url(#gradPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="mb-3 text-lg font-bold">Regional Breakdown</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Region</th>
                  <th className="px-4 py-2 text-right">Price (GMD)</th>
                  <th className="px-4 py-2 text-right">vs Recommended</th>
                  <th className="px-4 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {regional.map((r) => (
                  <tr key={r.region.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.region.name}</div>
                      <div className="text-xs text-muted-foreground">{r.region.division}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {r.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={r.pct > 0 ? "text-alert" : "text-stable"}>
                        {r.pct > 0 ? "+" : ""}
                        {r.pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.gouging ? (
                        <span className="rounded-full bg-alert px-2 py-0.5 text-[10px] font-bold uppercase text-alert-foreground">
                          Alert
                        </span>
                      ) : (
                        <span className="rounded-full bg-stable/15 px-2 py-0.5 text-[10px] font-bold uppercase text-stable">
                          Stable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
