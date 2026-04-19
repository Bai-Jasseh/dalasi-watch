import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AlertBanner } from "@/components/AlertBanner";
import { MinistryTicker } from "@/components/MinistryTicker";
import { CommoditySearch } from "@/components/CommoditySearch";
import { useApp } from "@/context/AppContext";
import { COMMODITIES, REGIONS } from "@/data/commodities";
import { getLatest, isGouging, pctVsRecommended } from "@/data/generator";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LumaTrack" },
      {
        name: "description",
        content: "Live commodity prices, alerts, and Ministry of Trade announcements.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { history } = useApp();
  const latest = history.length ? getLatest(history) : [];

  // Featured: average national price per commodity
  const featured = COMMODITIES.slice(0, 8).map((c) => {
    const points = latest.filter((p) => p.commodityId === c.id);
    const avg = points.length ? points.reduce((s, p) => s + p.price, 0) / points.length : 0;
    const prevAvg = (() => {
      const yesterday = history
        .filter((p) => p.commodityId === c.id)
        .sort((a, b) => a.date.localeCompare(b.date));
      const dates = [...new Set(yesterday.map((p) => p.date))];
      const prevDate = dates[dates.length - 2];
      const prev = yesterday.filter((p) => p.date === prevDate);
      return prev.length ? prev.reduce((s, p) => s + p.price, 0) / prev.length : avg;
    })();
    const delta = avg - prevAvg;
    const pct = prevAvg ? (delta / prevAvg) * 100 : 0;
    const gouging = isGouging(avg, c.recommended);
    return { c, avg, pct, gouging };
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              National Overview
            </p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time prices across {REGIONS.length} regions · {COMMODITIES.length} commodities
            </p>
          </div>
          <div className="md:w-96">
            <CommoditySearch />
          </div>
        </motion.div>

        <MinistryTicker />
        <AlertBanner />

        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold">Featured Commodities</h2>
            <Link to="/markets" className="text-sm text-navy underline-offset-4 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((f, i) => {
              const trendUp = f.pct > 0.3;
              const trendDown = f.pct < -0.3;
              const Icon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;
              return (
                <motion.div
                  key={f.c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <Link
                    to="/markets/$commodityId"
                    params={{ commodityId: f.c.id }}
                    className="block rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{f.c.name}</p>
                        <p className="text-xs text-muted-foreground">{f.c.unit}</p>
                      </div>
                      {f.gouging && (
                        <span className="rounded-full bg-alert px-2 py-0.5 text-[10px] font-bold uppercase text-alert-foreground">
                          Alert
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <span className="text-2xl font-extrabold tracking-tight">
                        GMD {Math.round(f.avg).toLocaleString()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          trendUp
                            ? "bg-alert/15 text-alert"
                            : trendDown
                              ? "bg-stable/15 text-stable"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {f.pct.toFixed(1)}%
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
