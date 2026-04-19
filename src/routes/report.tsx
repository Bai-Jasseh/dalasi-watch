import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Megaphone } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { COMMODITIES, REGIONS } from "@/data/commodities";
import { saveReport, type CitizenReport } from "@/data/store";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Price — LumaTrack" },
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
  const { refreshHistory } = useApp();
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({
    commodityId: COMMODITIES[0].id,
    regionId: REGIONS[0].id,
    market: "",
    price: "",
    reporter: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price);
    if (!price || !form.market) return;
    const r: CitizenReport = {
      id: `${Date.now()}`,
      commodityId: form.commodityId,
      regionId: form.regionId,
      market: form.market,
      price,
      reporter: form.reporter || "Anonymous",
      date: new Date().toISOString().slice(0, 10),
    };
    saveReport(r);
    refreshHistory();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm((f) => ({ ...f, market: "", price: "" }));
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
          description="Saw a seller charging an unfair price? Tell us! Every report you send helps the Ministry of Trade spot price gouging faster and protects other shoppers."
          bullets={[
            "Pick the item, your region, and the market name.",
            "Type the exact price you saw on the shelf (in GMD).",
            "Your name is optional — you can stay anonymous.",
          ]}
        />

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
            <select
              value={form.commodityId}
              onChange={(e) => update("commodityId", e.target.value)}
              className="input"
            >
              {COMMODITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.unit})
                </option>
              ))}
            </select>
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
