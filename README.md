# DalasiWatch

> The Gambia's community-powered price monitoring platform. From Banjul to Basse, tracking the pulse of the nation.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-dalasi--watch.lovable.app-gold)](https://dalasi-watch.lovable.app)

---

## Overview

**DalasiWatch** is a full-stack web application that brings price transparency to The Gambia. It empowers citizens, journalists, traders, and government bodies with real-time insights into commodity prices across all seven regions.

Prices are crowd-sourced from local markets and compared against official **Ministry of Trade** recommended benchmarks. The platform includes trend analytics, a cost-of-living index, an AI-powered assistant, and a public reporting interface for citizen submissions.

---

## Features

### Core Dashboard
- **Real-time Price Dashboard** — Live prices for 25+ essential commodities across all 7 regions (Banjul, Kanifing, Brikama, Mansakonko, Kerewan, Janjanbureh, Basse)
- **Regional Analytics** — Interactive charts (trends, volatility, logistics premiums) powered by Recharts
- **Cost Index** — A composite basket index summarizing how expensive essentials are versus government recommendations
- **Price Comparison** — Side-by-side market and regional price comparisons
- **Gouging Detection** — Automatic flagging when prices exceed 20% above Ministry of Trade benchmarks

### Citizen Engagement
- **Report a Price** — Public submission form for citizens to report local market prices
- **AI Chatbot** — "Ask Dalasi" — a conversational assistant for market and price questions
- **Demo Video** — A 4-minute pitch demo embedded on the landing page

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [TanStack Start](https://tanstack.com/start) v1 (React 19, SSR/SSG, file-based routing) |
| **Build Tool** | [Vite](https://vitejs.dev/) 7 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4 + CSS design tokens |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Backend / Auth** | [Lovable Cloud](https://lovable.dev) (Supabase) — Database, Auth, Realtime |
| **Server Functions** | TanStack `createServerFn` (RPC over HTTP) |
| **Forms** | React Hook Form + Zod |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## Project Structure

```
├── src/
│   ├── components/          # React components (UI primitives + domain)
│   ├── context/             # AppContext.tsx — global state
│   ├── data/                # Static data: commodities, regions, price generator
│   ├── hooks/               # Custom React hooks
│   ├── i18n/                # Internationalization strings
│   ├── integrations/        # Supabase clients (auto-generated)
│   ├── lib/                 # Utility functions
│   ├── routes/              # TanStack file-based routes
│   │   ├── index.tsx        # Landing page
│   │   ├── dashboard.tsx    # Price dashboard
│   │   ├── analytics.tsx    # Charts & trends
│   │   ├── compare.tsx      # Market comparison
│   │   ├── markets.tsx      # Market directory
│   │   ├── markets.$commodityId.tsx  # Commodity detail
│   │   ├── report.tsx       # Citizen price report form
│   │   ├── profile.tsx      # User profile
│   │   └── __root.tsx       # Root layout
│   ├── styles.css           # Tailwind v4 + design tokens
│   └── router.tsx           # Router configuration
├── supabase/                # Supabase config (config.toml)
├── package.json
├── vite.config.ts
└── wrangler.jsonc           # Cloudflare Workers config
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (or [Bun](https://bun.sh/))
- A [Lovable Cloud](https://lovable.dev) project

### Installation

```bash
# Clone the repository
git clone https://github.com/Bai-Jasseh/dalasi-watch.git
cd dalasi-watch

# Install dependencies
bun install
```

### Environment Setup

This project uses Lovable Cloud (Supabase) for the backend. Environment variables are managed through the Lovable Cloud integration and are auto-configured.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `bun run dev` | Start Vite dev server with hot reload |
| Build | `bun run build` | Production build (SSG/SSR ready) |
| Preview | `bun run preview` | Preview production build locally |
| Lint | `bun run lint` | Run ESLint |
| Format | `bun run format` | Run Prettier on all files |

---

## Data Model

The application works with a static dataset of:

- **7 Regions** — Banjul, Kanifing, Brikama, Mansakonko, Kerewan, Janjanbureh, Basse
- **25+ Commodities** — Rice, flour, sugar, oil, fish, onions, cement, fuel, etc.
- **Ministry of Trade Recommended Prices** — Government benchmark prices per commodity
- **Simulated Daily History** — A deterministic random-walk generator produces 30 days of realistic price data for demo/analytics purposes

In production, citizen-submitted prices and official benchmarks are stored in the Supabase database with RLS policies ensuring secure read/write access.

---

## Deployment

This project deploys seamlessly on [Lovable](https://lovable.dev):

- **Frontend:** Lovable Cloud (CDN + Edge SSR)
- **Backend / Database:** Lovable Cloud (Supabase)
- **Auth:** Supabase Auth (email/password + social providers)

**Published URL:** [https://dalasi-watch.lovable.app](https://dalasi-watch.lovable.app)

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code passes linting and formatting checks before submitting.

---

## Contact

**Project Author:** [Bai-Jasseh](https://github.com/Bai-Jasseh)  
**Project Link:** [https://github.com/Bai-Jasseh/dalasi-watch](https://github.com/Bai-Jasseh/dalasi-watch)

---

<p align="center">Built for The Gambia 🇬🇲</p>
