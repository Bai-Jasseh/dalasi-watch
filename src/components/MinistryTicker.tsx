import { MINISTRY_FEED } from "@/data/commodities";
import { useApp } from "@/context/AppContext";
import { Megaphone } from "lucide-react";

export function MinistryTicker() {
  const { t } = useApp();
  const items = [...MINISTRY_FEED, ...MINISTRY_FEED];
  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card py-2 shadow-sm">
      <div className="flex shrink-0 items-center gap-2 border-r border-border px-3 text-xs font-semibold uppercase tracking-wider text-navy">
        <Megaphone className="h-4 w-4 text-gold" />
        {t("ministryFeed")}
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-track flex w-max gap-12 whitespace-nowrap text-sm text-foreground/80">
          {items.map((m, i) => (
            <span key={i}>• {m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
