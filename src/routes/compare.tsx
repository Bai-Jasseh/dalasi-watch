import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { COMMODITIES, REGIONS } from "@/data/commodities";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Markets — DalasiWatch" },
      {
        name: "description",
        content: "Compare commodity prices side-by-side between any two regions in The Gambia.",
      },
    ],
  }),
  component: Compare,
});

function Compare() {
  const { history } = useApp();
  const [commodityId, setCommodityId] = React.useState(COMMODITIES[0].id);
  const [a, setA] = React.useState("banjul");
  const [b, setB] = React.useState("basse");

  const data = React.useMemo(() => {
    const dates = [
      ...new Set(history.filter((p) => p.commodityId === commodityId).map((p) => p.date)),
    ]
      .sort()
      .slice(-10);
    return dates.map((d) => {
      const pa = history.find(
        (p) => p.commodityId === commodityId && p.regionId === a && p.date === d,
      );
      const pb = history.find(
        (p) => p.commodityId === commodityId && p.regionId === b && p.date === d,
      );
      return {
        date: d.slice(5),
        [REGIONS.find((r) => r.id === a)?.name ?? a]: pa?.price ?? 0,
        [REGIONS.find((r) => r.id === b)?.name ?? b]: pb?.price ?? 0,
      };
    });
  }, [history, commodityId, a, b]);

  const nameA = REGIONS.find((r) => r.id === a)?.name ?? a;
  const nameB = REGIONS.find((r) => r.id === b)?.name ?? b;

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tools
          </p>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Compare Markets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Side-by-side regional pricing for any commodity over the last 10 days.
          </p>
        </div>

        <PageIntro
          title="Compare prices in two cities at once"
          description="Wonder if rice is cheaper in Banjul or in Basse? Pick a food and two regions — we'll draw the bars side by side so the difference is obvious."
          bullets={[
            "Choose a commodity from the first dropdown.",
            "Pick Region A and Region B to compare.",
            "Taller bars = higher price. Compare the colors across the last 10 days.",
          ]}
        />

        <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-3">
          <Field label="Commodity">
            <select
              value={commodityId}
              onChange={(e) => setCommodityId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            >
              {COMMODITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.unit})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Region A">
            <RegionSelect value={a} onChange={setA} />
          </Field>
          <Field label="Region B">
            <RegionSelect value={b} onChange={setB} />
          </Field>
        </div>

        <motion.div
          key={`${commodityId}-${a}-${b}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
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
                />
                <Legend />
                <Bar dataKey={nameA} fill="var(--navy)" radius={[4, 4, 0, 0]} />
                <Bar dataKey={nameB} fill="var(--gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
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

function RegionSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
    >
      {REGIONS.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
}
