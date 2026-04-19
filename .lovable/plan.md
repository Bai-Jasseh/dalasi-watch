

## Simplification Plan — Final

Keep **Compare** in the nav. Final nav: **Home · Markets · Compare · Analytics · Report**

### Changes

**1. Nav: 6 → 5 items** (`src/components/AppShell.tsx`, `src/routes/index.tsx`)
- Remove **Profile** from primary nav
- Keep Compare, Markets, Analytics, Report
- Add a small globe icon button in the header for language toggle (replaces the Profile language section)
- Profile route stays accessible via a small user icon in the header

**2. Simplify gauge → badge** (`src/routes/markets.$commodityId.tsx`)
Replace animated price-pressure gauge with a single color-coded status badge:
- 🟢 Green: "Fair price (within recommended)"
- 🟡 Amber: "Above recommended (+X%)"
- 🔴 Red: "⚠ Potential price gouging (+X%) — Report to Ministry"

**3. Trim landing page** (`src/routes/index.tsx`)
- Remove the 6-button quick-nav grid (redundant now that top nav is tighter)
- Keep: hero, single CTA, "How it works" trust bar

**4. Header polish** (`src/components/AppShell.tsx`)
- Add globe icon (language switcher popover) and user icon (→ /profile) on the right side of the header
- Mobile bottom nav: 5 items instead of 6 — easier tap targets

### Files touched
- `src/components/AppShell.tsx`
- `src/routes/index.tsx`
- `src/routes/markets.$commodityId.tsx`

### What stays untouched
- Compare route + page (in nav as requested)
- i18n system (just relocated)
- Gouging detection logic, Top Gouging Alerts widget, Analytics page, Report verification
- Profile page (reachable via header icon)

### Demo narrative this enables
"Browse Markets → Compare regions → see Analytics → Report gouging" — 5 clean nav items that mirror the pitch sentence exactly.

