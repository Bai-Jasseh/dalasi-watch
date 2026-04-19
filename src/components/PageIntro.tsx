import { Info } from "lucide-react";

interface PageIntroProps {
  title: string;
  description: string;
  bullets?: string[];
}

/**
 * Friendly explainer banner shown at the top of every screen (except the landing page)
 * so first-time users instantly understand what the page does and how to use it.
 */
export function PageIntro({ title, description, bullets }: PageIntroProps) {
  return (
    <aside
      className="rounded-2xl border border-navy/15 bg-gradient-to-br from-navy/5 via-card to-gold/5 p-4 shadow-sm"
      aria-label="Page guide"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-navy-foreground shadow-sm">
          <Info className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy">
            What is this page?
          </p>
          <h2 className="mt-0.5 text-base font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">{description}</p>
          {bullets && bullets.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-foreground/75">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
