import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Printer, Share2, ArrowRight, TrendingUp, TrendingDown, AlertTriangle, MapPin, Newspaper } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { COMMODITIES, REGIONS } from "@/data/commodities";
import { getLatest, isGouging, pctVsRecommended } from "@/data/generator";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/bulletin")({
  head: () => ({
    meta: [
      { title: "Weekly Market Bulletin — DalasiWatch" },
      {
        name: "description",
        content:
          "Official weekly market bulletin for The Gambia: price movements, gouging alerts, and regional insights from DalasiWatch.",
      },
      { property: "og:title", content: "Weekly Market Bulletin — DalasiWatch" },
      {
        property: "og:description",
        content:
          "Official weekly market bulletin for The Gambia: price movements, gouging alerts, and regional insights.",
      },
      { property: "og:type", content: "article" },
    ],
  }),
  component: Bulletin,
});

function Bulletin() {
  const { history } = useApp();

  if (!history.length) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Loading market data…</p>
        </div>
      </AppShell>
    );
  }

  const latest = getLatest(history);
  const today = latest.reduce((max, p) => (p.date > max ? p.date : max), latest[0].date);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const prevDate = oneWeekAgo.toISOString().slice(0, 10);

  const findPrice = (commodityId: string, regionId: string, date: string) =>
    history.find((p) => p.commodityId === commodityId && p.regionId === regionId && p.date === date);

  // National index: average % deviation from recommended across all latest prices
  const nationalIndex =
    latest.reduce((sum, p) => {
      const c = COMMODITIES.find((x) => x.id === p.commodityId);
      return c ? sum + pctVsRecommended(p.price, c.recommended) : sum;
    }, 0) / latest.length;

  // Previous week index
  const prevPrices = history.filter((p) => p.date === prevDate);
  const prevIndex =
    prevPrices.length > 0
      ? prevPrices.reduce((sum, p) => {
          const c = COMMODITIES.find((x) => x.id === p.commodityId);
          return c ? sum + pctVsRecommended(p.price, c.recommended) : sum;
        }, 0) / prevPrices.length
      : nationalIndex;

  const indexChange = nationalIndex - prevIndex;

  // Commodity-level week-over-week changes (national average across regions)
  const commodityChanges = COMMODITIES.map((c) => {
    let currentSum = 0;
    let currentCount = 0;
    let prevSum = 0;
    let prevCount = 0;

    for (const r of REGIONS) {
      const cur = findPrice(c.id, r.id, today);
      const prev = findPrice(c.id, r.id, prevDate);
      if (cur) {
        currentSum += cur.price;
        currentCount++;
      }
      if (prev) {
        prevSum += prev.price;
        prevCount++;
      }
    }

    const currentAvg = currentCount ? currentSum / currentCount : 0;
    const prevAvg = prevCount ? prevSum / prevCount : 0;
    const change = prevAvg ? ((currentAvg - prevAvg) / prevAvg) * 100 : 0;

    return {
      c,
      currentAvg,
      prevAvg,
      change,
    };
  });

  const risers = [...commodityChanges]
    .filter((x) => x.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 5);

  const fallers = [...commodityChanges]
    .filter((x) => x.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, 5);

  // Top gouging incidents
  const incidents = latest
    .map((p) => {
      const c = COMMODITIES.find((x) => x.id === p.commodityId);
      const r = REGIONS.find((x) => x.id === p.regionId);
      if (!c || !r) return null;
      const pct = pctVsRecommended(p.price, c.recommended);
      if (!isGouging(p.price, c.recommended)) return null;
      return { c, r, price: p.price, pct };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);

  // Regional rankings (avg % deviation from recommended)
  const regionStats = REGIONS.map((r) => {
    const pts = latest.filter((p) => p.regionId === r.id);
    const pcts = pts
      .map((p) => {
        const c = COMMODITIES.find((x) => x.id === p.commodityId);
        return c ? pctVsRecommended(p.price, c.recommended) : 0;
      })
      .filter(Number.isFinite);
    const avg = pcts.length ? pcts.reduce((s, x) => s + x, 0) / pcts.length : 0;
    return { region: r, avg };
  });

  const cheapestRegion = [...regionStats].sort((a, b) => a.avg - b.avg)[0];
  const mostExpensiveRegion = [...regionStats].sort((a, b) => b.avg - a.avg)[0];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GM", { day: "numeric", month: "long", year: "numeric" });

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const text = `DalasiWatch Weekly Bulletin: ${formatDate(today)}. National prices are ${nationalIndex >= 0 ? "+" : ""}${nationalIndex.toFixed(1)}% vs Ministry recommendations.`;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "DalasiWatch Weekly Bulletin", text, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        {/* Controls */}
        <div className="mb-4 flex items-center justify-between gap-2 print:hidden">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Analytics
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print / PDF
            </Button>
          </div>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm print:shadow-none print:border-0"
        >
          {/* Header */}
          <header className="border-b border-border bg-navy p-6 text-navy-foreground sm:p-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-foreground/80">
              <Newspaper className="h-4 w-4" />
              Ministry of Trade · Weekly Market Intelligence
            </div>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl">
              DalasiWatch Weekly Bulletin
            </h1>
            <p className="mt-1 text-sm text-navy-foreground/80 sm:text-base">
              Week ending {formatDate(today)} · 7 regions · 25+ commodities
            </p>
          </header>

          <div className="space-y-8 p-6 sm:p-10">
            {/* Executive summary */}
            <section>
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                  label="National Price Index"
                  value={`${nationalIndex >= 0 ? "+" : ""}${nationalIndex.toFixed(1)}%`}
                  sub={`vs recommended · ${indexChange >= 0 ? "up" : "down"} ${Math.abs(indexChange).toFixed(1)}% from last week`}
                  tone={nationalIndex > 5 ? "alert" : "stable"}
                />
                <SummaryCard
                  label="Active Gouging Alerts"
                  value={String(incidents.length)}
                  sub="prices above +20% vs recommended"
                  tone={incidents.length > 0 ? "alert" : "stable"}
                />
                <SummaryCard
                  label="Markets Covered"
                  value={String(REGIONS.length)}
                  sub="regions monitored daily"
                  tone="navy"
                />
              </div>

              <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5">
              <p className="text-sm leading-relaxed text-foreground sm:text-base">
                This week, national prices averaged{" "}
                <strong>
                  {nationalIndex >= 0 ? "+" : ""}
                  {nationalIndex.toFixed(1)}%
                  {nationalIndex >= 0 ? " above" : " below"} the Ministry of Trade's recommended
                  prices
                </strong>
                . {indexChange >= 0 ? "Pressure increased" : "Pressure eased"} by{" "}
                {Math.abs(indexChange).toFixed(1)} percentage points compared to the previous week.
                The highest stress is in <strong>{mostExpensiveRegion?.region.name}</strong>, while{" "}
                <strong>{cheapestRegion?.region.name}</strong> remains closest to the benchmark.
              </p>
              </div>
            </section>

            {/* Price movements */}
            <section className="grid gap-8 md:grid-cols-2">
              <MoverCard
                title="Prices Rising"
                icon={TrendingUp}
                tone="alert"
                items={risers}
                empty="No commodities rose significantly this week."
              />
              <MoverCard
                title="Prices Falling"
                icon={TrendingDown}
                tone="stable"
                items={fallers}
                empty="No commodities fell significantly this week."
              />
            </section>

            {/* Gouging alerts */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <AlertTriangle className="h-5 w-5 text-alert" />
                Gouging Alerts
              </h2>
              {incidents.length === 0 ? (
                <p className="rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                  No active gouging incidents above the +20% threshold this week.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border">
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
                </div>
              )}
            </section>

            {/* Regional snapshot */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <MapPin className="h-5 w-5 text-navy" />
                Regional Snapshot
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {regionStats
                  .sort((a, b) => a.avg - b.avg)
                  .map((rs) => (
                    <div
                      key={rs.region.id}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{rs.region.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            rs.avg > 10
                              ? "bg-alert text-alert-foreground"
                              : rs.avg > 3
                                ? "bg-gold text-gold-foreground"
                                : "bg-stable text-stable-foreground"
                          }`}
                        >
                          {rs.avg >= 0 ? "+" : ""}
                          {rs.avg.toFixed(1)}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{rs.region.division}</p>
                    </div>
                  ))}
              </div>
            </section>

            {/* What to watch */}
            <section className="rounded-xl border border-gold/40 bg-gold/10 p-5">
              <h2 className="text-lg font-bold text-gold-foreground">What to Watch Next Week</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                Monitor {risers[0]?.c.name || "essential commodities"} closely, as it showed the
                strongest upward movement this week. The Ministry of Trade recommends continued
                surveillance in {mostExpensiveRegion?.region.name} where prices remain most detached
                from benchmarks. Citizens can help by reporting prices from their local markets on
                the Report page.
              </p>
            </section>

            {/* Footer */}
            <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
              <p>
                Published by DalasiWatch · National Market Intelligence System for The Gambia 🇬🇲
              </p>
              <p className="mt-1">
                Data sourced from citizen reports and Ministry of Trade benchmarks. Updated weekly.
              </p>
            </footer>
          </div>
        </motion.article>

        {/* Link to analytics */}
        <div className="mt-6 flex justify-center print:hidden">
          <Link
            to="/analytics"
            className="group inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
          >
            Explore full Ministry analytics
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "alert" | "stable" | "navy";
}) {
  const map = {
    alert: "bg-alert text-alert-foreground",
    stable: "bg-stable text-stable-foreground",
    navy: "bg-navy text-navy-foreground",
  } as const;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
      <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${map[tone]}`}>
        {sub}
      </p>
    </div>
  );
}

function MoverCard({
  title,
  icon: Icon,
  tone,
  items,
  empty,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "alert" | "stable";
  items: { c: (typeof COMMODITIES)[number]; currentAvg: number; prevAvg: number; change: number }[];
  empty: string;
}) {
  const color = tone === "alert" ? "text-alert" : "text-stable";
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className={`mb-4 flex items-center gap-2 font-bold ${color}`}>
        <Icon className="h-5 w-5" />
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.c.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.c.name}</p>
                <p className="text-xs text-muted-foreground">{item.c.unit}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {item.change >= 0 ? "+" : ""}
                  {item.change.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  GMD {Math.round(item.currentAvg).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
