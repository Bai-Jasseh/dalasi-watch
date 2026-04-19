import { AlertTriangle } from "lucide-react";
import { COMMODITIES, REGIONS } from "@/data/commodities";
import { getLatest, isGouging, pctVsRecommended } from "@/data/generator";
import { useApp } from "@/context/AppContext";

export function AlertBanner() {
  const { history, t } = useApp();
  if (!history.length) return null;
  const latest = getLatest(history);
  const alerts = latest
    .map((p) => {
      const c = COMMODITIES.find((x) => x.id === p.commodityId);
      const r = REGIONS.find((x) => x.id === p.regionId);
      if (!c || !r) return null;
      if (!isGouging(p.price, c.recommended)) return null;
      return { c, r, price: p.price, pct: pctVsRecommended(p.price, c.recommended) };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  if (!alerts.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-alert/40 bg-alert text-alert-foreground shadow-elegant animate-fade-in-up">
      <div className="flex items-center gap-2 border-b border-alert-foreground/20 px-4 py-2 text-sm font-bold uppercase tracking-wider">
        <AlertTriangle className="h-4 w-4" />
        {t("nationalAlert")}
      </div>
      <ul className="divide-y divide-alert-foreground/15">
        {alerts.map((a, i) => (
          <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span>
              <strong>{a.c.name}</strong> ({a.c.unit}) in <strong>{a.r.name}</strong>
            </span>
            <span className="rounded-full bg-alert-foreground/15 px-2 py-0.5 text-xs font-bold">
              +{a.pct.toFixed(0)}% vs recommended
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
