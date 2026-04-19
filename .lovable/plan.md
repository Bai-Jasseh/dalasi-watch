
# LumaTrack — National Market Intelligence System for The Gambia

A premium, dual-audience price monitoring platform: citizens find fair prices, the Ministry of Trade monitors inflation and gouging.

## Pages & Routes
- `/` — Landing page (hero, trust bar, CTA to dashboard)
- `/dashboard` — Main overview: featured commodities, alerts banner, ministry ticker
- `/markets` — Browse commodities by category & region with global autocomplete search
- `/markets/$commodityId` — Detail view: 30-day Recharts area trend, regional breakdown, alert status
- `/compare` — Side-by-side bar chart comparison (commodity × two regions)
- `/report` — Citizen price report form (commodity, region, market, price, photo optional)
- `/analytics` — Ministry-style view: regional heatmap, inflation indicators, gouging incidents
- `/profile` — Settings: language toggle (English / Wolof / Mandinka), saved markets, install prompt

## Visual Identity
- **Palette**: Banjul Navy `#002147`, Savannah White `#F9F9F9`, Gambia Green `#00AB66` (stable), Basse Red `#CE1126` (alert), warm gold accent for CTAs
- **Typography**: Modern sans-serif headers with confident weight; readable body
- **Glassmorphic mobile bottom nav**: Home · Markets · Report · Analytics · Profile (blurred backdrop, floating)
- **Motion**: fade-in-up section entries, breathing pulse + hover-glide on hero CTA, smooth chart tooltips
- All design tokens defined as semantic HSL variables in `src/styles.css`

## Commodity Engine
Seeded mock dataset (in-memory, deterministic) covering:
- **Essentials**: Rice (Sadam/Broken/American), Sugar (50kg/1kg), Flour, Cooking Oil (20L/5L/1L)
- **Protein**: Bonga, Ladyfish, Beef (w/ & w/o bone), Chicken (local/carton), Eggs (crate)
- **Produce**: Onions (Local/Holland), Potatoes, Tomatoes, Bitter Tomato, Peppers
- **Utilities**: Charcoal (large bag), Firewood, Gas Cylinder (12.5kg)

**Regions (7)**: Banjul, Kanifing, West Coast (Brikama/Tanji), Lower River (Soma), North Bank (Farafenni), Central River (Bansang), Upper River (Basse)

**30-day historical generator** with realistic logic:
- Basse & Bansang +5–8% on imported goods (logistics premium)
- Tanji/Gunjur fish significantly cheaper than inland
- Serekunda onions spike last 3 days → triggers alert
- Each commodity has Ministry "recommended price"; >20% above = gouging alert

## Key Features
- **Global autocomplete search** across all commodities
- **Compare Markets** tool: pick commodity + 2 regions → grouped bar chart
- **30-day Recharts area chart** on detail pages with hover tooltips
- **National Warning banner** auto-displays active gouging alerts
- **Ministry of Trade ticker** scrolling official announcements (mock feed)
- **Citizen reporting form** that adds entries to local store and re-evaluates alerts
- **Language toggle** (English / Wolof / Mandinka) — UI strings via context
- **Offline-friendly**: data persisted to localStorage so dashboard loads without network; "Save to Home Screen" hint card in profile (no service worker — preview-safe)

## Tech Approach
- TanStack Start file-based routes; each page has its own `head()` metadata for SEO
- Recharts for area & bar charts; Framer Motion for entry animations
- Mock data lives in `src/data/` with a deterministic seeded generator; reads/writes mirrored to localStorage
- Responsive: desktop top nav + mobile glassmorphic bottom nav (shared header component)
- No backend required for v1 — all data client-side; structured so Lovable Cloud can be added later for real submissions
