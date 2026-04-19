import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { COMMODITIES, REGIONS } from "@/data/commodities";
import { getLatest, isGouging, pctVsRecommended } from "@/data/generator";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — DalasiWatch" },
      {
        name: "description",
        content:
          "Ministry-grade analytics: regional heatmap, inflation indicators, and gouging incidents across The Gambia.",
      },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { history } = useApp();
  const latest = history.length ? getLatest(history) : [];

  // Per-region inflation index (avg pct vs recommended across all commodities)
  const regionStats = REGIONS.map((r) => {
    const pts = latest.filter((p) => p.regionId === r.id);
    const pcts = pts
      .map((p) => {
        const c = COMMODITIES.find((x) => x.id === p.commodityId);
        return c ? pctVsRecommended(p.price, c.recommended) : 0;
      })
      .filter(Number.isFinite);
    const avg = pcts.length ? pcts.reduce((s, x) => s + x, 0) / pcts.length : 0;
    const alerts = pts.filter((p) => {
      const c = COMMODITIES.find((x) => x.id === p.commodityId);
      return c && isGouging(p.price, c.recommended);
    }).length;
    return { region: r, avg, alerts };
  });

  const totalAlerts = regionStats.reduce((s, r) => s + r.alerts, 0);
  const nationalIndex =
    regionStats.reduce((s, r) => s + r.avg, 0) / Math.max(regionStats.length, 1);

  // Top gouging incidents
  const incidents = latest
    .map((p) => {
      const c = COMMODITIES.find((x) => x.id === p.commodityId);
      const r = REGIONS.find((x) => x.id === p.regionId);
      if (!c || !r) return null;
      const pct = pctVsRecommended(p.price, c.recommended);
      if (pct < 20) return null;
      return { c, r, price: p.price, pct };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ministry View
          </p>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">National Analytics</h1>
        </div>

        <PageIntro
          title="The Ministry of Trade's bird's-eye view"
          description="This dashboard turns thousands of price points into a few simple numbers so officials can act fast on inflation and unfair pricing."
          bullets={[
            "The 3 big cards show overall inflation, active alerts, and regions covered.",
            "The Regional Heatmap colors each region: green = fair, yellow = warming up, red = unfair pricing.",
            "The Top Gouging Incidents table lists the worst overcharges right now.",
          ]}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            icon={TrendingUp}
            label="National Inflation Index"
            value={`${nationalIndex >= 0 ? "+" : ""}${nationalIndex.toFixed(1)}%`}
            tone={nationalIndex > 5 ? "alert" : "stable"}
          />
          <Stat
            icon={AlertTriangle}
            label="Active Gouging Alerts"
            value={String(totalAlerts)}
            tone={totalAlerts > 0 ? "alert" : "stable"}
          />
          <Stat
            icon={ShieldCheck}
            label="Regions Monitored"
            value={String(REGIONS.length)}
            tone="navy"
          />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <h2 className="mb-3 text-lg font-bold">Regional Heatmap</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {regionStats.map((rs) => {
              const intensity = Math.min(Math.max(rs.avg, -10), 30);
              const tone =
                intensity > 10
                  ? "bg-alert text-alert-foreground"
                  : intensity > 3
                    ? "bg-gold text-gold-foreground"
                    : "bg-stable text-stable-foreground";
              return (
                <div key={rs.region.id} className={`rounded-xl p-4 ${tone}`}>
                  <p className="text-xs uppercase tracking-wider opacity-80">
                    {rs.region.division}
                  </p>
                  <p className="mt-0.5 text-lg font-bold">{rs.region.name}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-2xl font-extrabold">
                      {rs.avg >= 0 ? "+" : ""}
                      {rs.avg.toFixed(1)}%
                    </span>
                    <span className="rounded-full bg-black/15 px-2 py-0.5 text-xs">
                      {rs.alerts} alerts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        <section>
          <h2 className="mb-3 text-lg font-bold">Top Gouging Incidents</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {incidents.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No active incidents above the +20% threshold.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Commodity</th>
                    <th className="px-4 py-2 text-left">Region</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Over Recommended</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((i, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="font-medium">{i.c.name}</div>
                        <div className="text-xs text-muted-foreground">{i.c.unit}</div>
                      </td>
                      <td className="px-4 py-3">{i.r.name}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        GMD {i.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="rounded-full bg-alert px-2 py-0.5 text-[10px] font-bold uppercase text-alert-foreground">
                          +{i.pct.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "alert" | "stable" | "navy";
}) {
  const map = {
    alert: "bg-alert text-alert-foreground",
    stable: "bg-stable text-stable-foreground",
    navy: "bg-navy text-navy-foreground",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${map[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}
