import { Link, useLocation } from "@tanstack/react-router";
import { Home, Store, Scale, Megaphone, BarChart3, User, Activity, Globe } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Lang } from "@/i18n/strings";

const NAV = [
  { to: "/", icon: Home, key: "home" as const, label: "Home" },
  { to: "/markets", icon: Store, key: "markets" as const, label: "Markets" },
  { to: "/compare", icon: Scale, key: "compare" as const, label: "Compare" },
  { to: "/analytics", icon: BarChart3, key: "analytics" as const, label: "Analytics" },
  { to: "/report", icon: Megaphone, key: "report" as const, label: "Report" },
];

const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "wo", label: "Wolof" },
  { id: "mn", label: "Mandinka" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useApp();
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
            <span>DalasiWatch</span>
            <span className="hidden text-xs font-normal text-navy-foreground/70 sm:inline">
              · {t("appTagline")}
            </span>
          </Link>
          <div className="flex items-center gap-1">
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
            <div className="ml-2 flex items-center gap-1 border-l border-navy-foreground/20 pl-2">
              <Popover>
                <PopoverTrigger
                  aria-label="Change language"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-navy-foreground/80 hover:bg-navy-foreground/10"
                >
                  <Globe className="h-4 w-4" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-44 p-1">
                  {LANGS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLang(l.id)}
                      className={cn(
                        "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                        lang === l.id ? "bg-navy text-navy-foreground" : "hover:bg-accent",
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <Link
                to="/profile"
                aria-label="Profile"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  loc.pathname.startsWith("/profile")
                    ? "bg-navy-foreground/15 text-navy-foreground"
                    : "text-navy-foreground/80 hover:bg-navy-foreground/10",
                )}
              >
                <User className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 md:pb-12">{children}</main>

      {/* Glassmorphic bottom nav (mobile) */}
      <nav
        className="glass fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl px-2 py-2 shadow-elegant md:hidden"
        aria-label="Primary"
      >
        {NAV.map((n) => {
          const active = n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to);
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
