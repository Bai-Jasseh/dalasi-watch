import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { CommoditySearch } from "@/components/CommoditySearch";
import { CATEGORIES, COMMODITIES, REGIONS, type Category } from "@/data/commodities";
import { getLatest, isGouging } from "@/data/generator";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — LumaTrack" },
      {
        name: "description",
        content: "Browse all commodities tracked by LumaTrack across 7 regions of The Gambia.",
      },
    ],
  }),
  component: Markets,
});

function Markets() {
  const { history } = useApp();
  const [cat, setCat] = React.useState<Category | "All">("All");
  const [region, setRegion] = React.useState<string>("avg");

  const latest = history.length ? getLatest(history) : [];

  const items = COMMODITIES.filter((c) => cat === "All" || c.category === cat);

  function priceFor(commodityId: string) {
    const pts = latest.filter((p) => p.commodityId === commodityId);
    if (region === "avg") {
      if (!pts.length) return 0;
      return Math.round(pts.reduce((s, p) => s + p.price, 0) / pts.length);
    }
    return pts.find((p) => p.regionId === region)?.price ?? 0;
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Browse Markets
          </p>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">All Commodities</h1>
        </div>

        <PageIntro
          title="Browse every food and household item we track"
          description="This is the full shopping list for the whole country. Filter by category, choose a region, then tap any item to open its detailed price report."
          bullets={[
            "Use the category buttons (Essentials, Protein, Produce…) to narrow the list.",
            "Switch the Region selector to see prices in one specific area.",
            "Items with a red Alert tag are priced unfairly high.",
          ]}
        />

        <CommoditySearch />

        <div className="flex flex-wrap items-center gap-2">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c as Category | "All")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                cat === c
                  ? "border-navy bg-navy text-navy-foreground"
                  : "border-border bg-card hover:bg-accent",
              )}
            >
              {c}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-md border border-border bg-card px-2 py-1.5 text-sm"
            >
              <option value="avg">National Average</option>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => {
            const price = priceFor(c.id);
            const gouging = price > 0 && isGouging(price, c.recommended);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.35 }}
              >
                <Link
                  to="/markets/$commodityId"
                  params={{ commodityId: c.id }}
                  className="block rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.unit} · {c.category}
                      </p>
                    </div>
                    {gouging && (
                      <span className="rounded-full bg-alert px-2 py-0.5 text-[10px] font-bold uppercase text-alert-foreground">
                        Alert
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-xl font-extrabold">
                      GMD {price ? price.toLocaleString() : "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Rec. {c.recommended.toLocaleString()}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
