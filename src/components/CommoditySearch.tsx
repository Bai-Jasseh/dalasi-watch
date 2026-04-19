import * as React from "react";
import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { COMMODITIES } from "@/data/commodities";
import { useApp } from "@/context/AppContext";

export function CommoditySearch() {
  const { t } = useApp();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const results = React.useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    return COMMODITIES.filter(
      (c) => c.name.toLowerCase().includes(s) || c.category.toLowerCase().includes(s),
    ).slice(0, 8);
  }, [q]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-navy">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={t("searchPlaceholder")}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-auto rounded-xl border border-border bg-popover shadow-elegant">
          {results.map((r) => (
            <button
              key={r.id}
              onMouseDown={(e) => {
                e.preventDefault();
                navigate({ to: "/markets/$commodityId", params: { commodityId: r.id } });
              }}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <span>
                <span className="font-medium">{r.name}</span>{" "}
                <span className="text-muted-foreground">· {r.unit}</span>
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs">{r.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
