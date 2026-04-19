import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Megaphone, Users, MapPin, ShieldCheck, Clock, Landmark } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { COMMODITIES, REGIONS } from "@/data/commodities";
import { saveReport, loadReports, getVerifiedReports, type CitizenReport, type VerifiedReport } from "@/data/store";
import { getLatest } from "@/data/generator";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Price — DalasiWatch" },
      {
        name: "description",
        content:
          "Help your community. Report a market price you observed and contribute to national price transparency.",
      },
    ],
  }),
  component: Report,
});

function Report() {
  const { refreshHistory, history } = useApp();
  const [submitted, setSubmitted] = React.useState(false);
  const [reports, setReports] = React.useState<CitizenReport[]>([]);
  const [verified, setVerified] = React.useState<VerifiedReport[]>([]);
  const [form, setForm] = React.useState({
    commodityId: COMMODITIES[0].id,
    regionId: REGIONS[0].id,
    market: "",
    price: "",
    reporter: "",
  });
  const [commodityQuery, setCommodityQuery] = React.useState(
    `${COMMODITIES[0].name} (${COMMODITIES[0].unit})`,
  );
  const [commodityOpen, setCommodityOpen] = React.useState(false);
  const [highlightIdx, setHighlightIdx] = React.useState(0);
  const commodityBoxRef = React.useRef<HTMLDivElement>(null);

  const filteredCommodities = React.useMemo(() => {
    const q = commodityQuery.trim().toLowerCase();
    if (!q) return COMMODITIES;
    return COMMODITIES.filter((c) =>
      `${c.name} ${c.unit} ${c.category}`.toLowerCase().includes(q),
    );
  }, [commodityQuery]);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (commodityBoxRef.current && !commodityBoxRef.current.contains(e.target as Node)) {
        setCommodityOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pickCommodity(c: (typeof COMMODITIES)[number]) {
    update("commodityId", c.id);
    setCommodityQuery(`${c.name} (${c.unit})`);
    setCommodityOpen(false);
  }

  const refreshLists = React.useCallback(async () => {
    const [r, v] = await Promise.all([loadReports(), getVerifiedReports()]);
    setReports(r);
    setVerified(v);
  }, []);

  React.useEffect(() => {
    refreshLists();
  }, [refreshLists]);

  // Already-trusted reference prices per region (from official history feed)
  const regionalReference = React.useMemo(() => {
    const latest = getLatest(history).filter((p) => p.commodityId === form.commodityId);
    return REGIONS.map((r) => {
      const point = latest.find((p) => p.regionId === r.id);
      return { region: r, price: point?.price };
    });
  }, [history, form.commodityId]);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price);
    if (!price || !form.market) return;
    try {
      await saveReport({
        commodityId: form.commodityId,
        regionId: form.regionId,
        market: form.market,
        price,
        reporter: form.reporter || "Anonymous",
        date: new Date().toISOString().slice(0, 10),
      });
      await Promise.all([refreshHistory(), refreshLists()]);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setForm((f) => ({ ...f, market: "", price: "" }));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Citizen Reporting
          </p>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Report a Price</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your submission helps thousands of Gambian families find fair prices.
          </p>
        </div>

        <PageIntro
          title="Be a market watchdog for your community"
          description="Saw a seller charging an unfair price? Tell us! A report becomes 'Verified' once at least 2 people report the same item at the same market — that way only trustworthy prices reach other shoppers."
          bullets={[
            "Pick the item, your region, and the market name.",
            "Type the exact price you saw on the shelf (in GMD).",
            "We need 2+ matching reports before a price is shown as Verified ✅.",
            "Your name is optional — you can stay anonymous.",
          ]}
        />

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-navy" />
            <h2 className="text-lg font-bold">Trusted prices across regions</h2>
            <span className="ml-auto text-xs text-muted-foreground">
              {COMMODITIES.find((c) => c.id === form.commodityId)?.name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Latest verified prices already on record for the item you selected. Use them as a reference before you submit your own report.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {regionalReference.map(({ region, price }) => (
              <li
                key={region.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{region.name}</span>
                </div>
                <span className="text-sm font-bold text-navy">
                  {price ? `GMD ${price.toLocaleString()}` : "—"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-stable/40 bg-stable/10 px-4 py-3 text-sm text-stable"
          >
            <CheckCircle2 className="h-4 w-4" />
            Thank you! Your report has been recorded.
          </motion.div>
        )}

        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <Field label="Commodity">
            <div ref={commodityBoxRef} className="relative">
              <input
                type="text"
                value={commodityQuery}
                onChange={(e) => {
                  setCommodityQuery(e.target.value);
                  setCommodityOpen(true);
                  setHighlightIdx(0);
                }}
                onFocus={() => setCommodityOpen(true)}
                onKeyDown={(e) => {
                  if (!commodityOpen) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlightIdx((i) => Math.min(i + 1, filteredCommodities.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightIdx((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const pick = filteredCommodities[highlightIdx];
                    if (pick) pickCommodity(pick);
                  } else if (e.key === "Escape") {
                    setCommodityOpen(false);
                  }
                }}
                placeholder="Type to search e.g. Rice, Sugar, Onion…"
                className="input"
                role="combobox"
                aria-expanded={commodityOpen}
                aria-autocomplete="list"
              />
              {commodityOpen && filteredCommodities.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-card shadow-elegant">
                  {filteredCommodities.map((c, i) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setHighlightIdx(i)}
                        onClick={() => pickCommodity(c)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                          i === highlightIdx ? "bg-accent" : ""
                        } ${c.id === form.commodityId ? "font-semibold text-navy" : ""}`}
                      >
                        <span>
                          {c.name}{" "}
                          <span className="text-xs text-muted-foreground">({c.unit})</span>
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {c.category}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {commodityOpen && filteredCommodities.length === 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-elegant">
                  No commodity matches “{commodityQuery}”.
                </div>
              )}
            </div>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Region">
              <select
                value={form.regionId}
                onChange={(e) => update("regionId", e.target.value)}
                className="input"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Market name">
              <input
                value={form.market}
                onChange={(e) => update("market", e.target.value)}
                placeholder="e.g. Albert Market"
                className="input"
                required
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Price observed (GMD)">
              <input
                type="number"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="e.g. 2400"
                className="input"
                required
                min={1}
              />
            </Field>
            <Field label="Your name (optional)">
              <input
                value={form.reporter}
                onChange={(e) => update("reporter", e.target.value)}
                placeholder="Anonymous"
                className="input"
              />
            </Field>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-3 font-semibold text-navy-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
          >
            <Megaphone className="h-4 w-4" />
            Submit Report
          </button>
        </form>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-navy" />
            <h2 className="text-lg font-bold">Community Reports</h2>
            <span className="ml-auto text-xs text-muted-foreground">
              Names hidden for privacy
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            A price needs <strong>2 or more matching reports</strong> from different shoppers before it shows the green Verified badge. Until then, it stays as Pending.
          </p>
          {verified.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No reports yet. Be the first to share a price you saw today!
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {verified.slice(0, 12).map((v) => {
                const c = COMMODITIES.find((x) => x.id === v.commodityId);
                const reg = REGIONS.find((x) => x.id === v.regionId);
                return (
                  <li key={v.key} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span>{c?.name ?? v.commodityId}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="truncate text-muted-foreground">{v.market}</span>
                        {v.verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-stable/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stable">
                            <ShieldCheck className="h-3 w-3" /> Verified · {v.count}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                            <Clock className="h-3 w-3" /> Pending · {v.count}/2
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {reg?.name ?? v.regionId} · {v.lastDate}
                      </div>
                    </div>
                    <div
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold ${
                        v.verified ? "bg-stable/10 text-stable" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      GMD {v.avgPrice.toLocaleString()}
                      {c?.unit ? <span className="ml-1 text-xs font-medium opacity-70">/{c.unit}</span> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {reports.length > 0 && (
            <p className="pt-1 text-[11px] text-muted-foreground">
              {reports.length} total submission{reports.length === 1 ? "" : "s"} from the community.
            </p>
          )}
        </section>
      </div>

      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 2px var(--navy)}`}</style>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
