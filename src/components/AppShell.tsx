import { Link, useLocation } from "@tanstack/react-router";
import { Home, Store, Megaphone, BarChart3, User, Activity } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", icon: Home, key: "home" as const, label: "Home" },
  { to: "/markets", icon: Store, key: "markets" as const, label: "Markets" },
  { to: "/report", icon: Megaphone, key: "report" as const, label: "Report" },
  { to: "/analytics", icon: BarChart3, key: "analytics" as const, label: "Analytics" },
  { to: "/profile", icon: User, key: "profile" as const, label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useApp();
  const loc = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar (desktop) */}
      <header className="sticky top-0 z-40 border-b border-border bg-navy text-navy-foreground">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-gold-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span>LumaTrack</span>
            <span className="hidden text-xs font-normal text-navy-foreground/70 sm:inline">
              · {t("appTagline")}
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
            const active = n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-navy-foreground/15 text-navy-foreground"
                      : "text-navy-foreground/80 hover:bg-navy-foreground/10",
                  )}
                >
                  {t(n.key)}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 md:pb-12">{children}</main>

      {/* Glassmorphic bottom nav (mobile) */}
      <nav
        className="glass fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl px-2 py-2 shadow-elegant md:hidden"
        aria-label="Primary"
      >
        {NAV.map((n) => {
          const active = loc.pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] transition-all",
                active ? "bg-navy text-navy-foreground shadow-md" : "text-foreground/70",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{t(n.key)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
