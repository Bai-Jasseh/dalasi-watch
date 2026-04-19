import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";

import { MinistryTicker } from "@/components/MinistryTicker";
import { CommoditySearch } from "@/components/CommoditySearch";
import { useApp } from "@/context/AppContext";
import { COMMODITIES, REGIONS } from "@/data/commodities";
import { getLatest, isGouging, pctVsRecommended } from "@/data/generator";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DalasiWatch" },
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

  // Top gouging alerts: commodities most above recommended price (region-level)
  const topGouging = (() => {
    const rows = COMMODITIES.flatMap((c) => {
      const points = latest.filter((p) => p.commodityId === c.id);
      return points.map((p) => {
        const region = REGIONS.find((r) => r.id === p.regionId);
        return {
          commodity: c,
          regionName: region?.name ?? p.regionId,
          regionId: p.regionId,
          price: p.price,
          pct: pctVsRecommended(p.price, c.recommended),
        };
      });
    });
    return rows
      .filter((r) => r.pct > 20)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 4);
  })();

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

        <PageIntro
          title="Your national market control room"
          description="See what's happening with food prices across The Gambia right now — at a glance."
          bullets={[
            "Read official government messages in the announcements ticker.",
            "Spot any unfair pricing in the red alert banner.",
            "Tap a Featured Commodity card to open its full report card.",
          ]}
        />

        <MinistryTicker />
        

        {topGouging.length > 0 && (
          <section>
            <div className="mb-3 flex items-end justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-alert/15 text-alert">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-bold">Top Price Gouging Alerts</h2>
              </div>
              <Link
                to="/analytics"
                className="text-sm text-navy underline-offset-4 hover:underline"
              >
                See analytics →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topGouging.map((g, i) => (
                <motion.div
                  key={`${g.commodity.id}-${g.regionId}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Link
                    to="/markets/$commodityId"
                    params={{ commodityId: g.commodity.id }}
                    className="group block overflow-hidden rounded-2xl border border-alert/30 bg-gradient-to-br from-alert/10 via-card to-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{g.commodity.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{g.regionName}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-alert px-2 py-0.5 text-[10px] font-extrabold uppercase text-alert-foreground">
                        +{g.pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Market avg
                        </p>
                        <p className="text-xl font-extrabold text-alert">
                          GMD {Math.round(g.price).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Recommended
                        </p>
                        <p className="text-sm font-semibold text-muted-foreground line-through">
                          GMD {Math.round(g.commodity.recommended).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-alert">
                      View details
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

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
