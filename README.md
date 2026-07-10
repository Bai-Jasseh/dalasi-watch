# DalasiWatch

> A community-powered price tracker for The Gambia. From Banjul to Basse, keeping an eye on what matters.

**Live site:** [dalasi-watch.lovable.app](https://dalasi-watch.lovable.app)

---

## What is this?

DalasiWatch is a web app I built to help Gambians track prices of everyday essentials which includes rice, oil, sugar, cement, fuel, and more. Prices are submitted by people like you and me from local markets, and the app compares them against official Ministry of Trade recommendations so we can spot unfair pricing.

I made it because I noticed how hard it is to know if you're being overcharged. One market might sell rice for D1,200 while another sells it for D1,500, and most people never know the difference.

---

## Features

- **Live Price Dashboard** — See current prices across all 7 regions (Banjul, Kanifing, Brikama, Soma, Farafenni, Bansang, Basse)
- **Weekly Market Bulletin** — Auto-generated ministry-ready report with price movements, gouging alerts, and regional insights
- **Report a Price** — Anyone can submit what they paid at their local market
- **Price Trends** — Charts showing how prices have changed over the past 30 days
- **Fairness Check** — Prices that go 20% above government benchmarks get flagged automatically
- **Ask Dalasi** — A simple chatbot you can ask about market prices and commodities
- **Compare Markets** — Side-by-side price comparison between regions
- **Cost of Living Index** — A single number that tells you how expensive essentials are right now

---

## Tech Stack

I built this with:

- **React** + **TypeScript** — for the user interface
- **Tailwind CSS** — for styling
- **TanStack Router** — for page navigation
- **Recharts** — for the price charts
- **Supabase (via Lovable Cloud)** — for the database, authentication, and storing reported prices
- **Framer Motion** — for smooth animations

The app was built on [Lovable](https://lovable.dev), which handled a lot of the backend setup for me, so I could focus on building the actual product.

---

## Project Structure

```
src/
  routes/           # Pages (home, dashboard, markets, report, etc.)
  components/         # Reusable UI pieces
  data/             # Commodity data and price generators
  i18n/             # English / Wolof translations
  integrations/     # Supabase connection
  context/          # Global state (language, history)
```

---

## Getting Started

### Prerequisites

- Node.js 20+ (or Bun)
- A Lovable Cloud project (or your own Supabase backend)

### Install & Run

```bash
git clone https://github.com/Bai-Jasseh/dalasi-watch.git
cd dalasi-watch
bun install
bun dev
```

The app should open at `http://localhost:5173`.

> **Note:** The backend connection (Supabase) is auto-configured if you're using Lovable Cloud. If you're running this independently, you'll need to set up your own Supabase project and update the connection details.

---

## The Data

The app works with a dataset of:

- **7 Regions** — Banjul, Kanifing, Brikama, Mansakonko, Kerewan, Janjanbureh, Basse
- **25+ Commodities** — Rice, flour, sugar, oil, fish, onions, cement, fuel, etc.
- **Ministry of Trade Prices** — Government benchmark prices per commodity
- **Simulated History** — For demo purposes, the app generates 30 days of realistic price movements so you can see the charts working even without live submissions

In production, citizen-submitted prices are stored securely in the database.

---

## Deployment


- **Frontend:** Served by Lovable's CDN
- **Backend / Database:** Lovable Cloud (Supabase)
- **Authentication:** Supabase Auth (email/password)

**Live URL:** [https://dalasi-watch.lovable.app](https://dalasi-watch.lovable.app)

---

## Why I Built This

I'm passionate about using tech to solve real problems in The Gambia. Price transparency shouldn't require a degree in economics — it should be as simple as opening an app. This project is my way of contributing to that.

---

## Contact

**Built by:** [Bai-Jasseh](https://github.com/Bai-Jasseh)  
**Project:** [github.com/Bai-Jasseh/dalasi-watch](https://github.com/Bai-Jasseh/dalasi-watch)

---

<p align="center">Built for The Gambia 🇬🇲</p>
