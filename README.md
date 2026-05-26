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

Frontend

React 19
TanStack Start (SSR/SSG)
Vite 7

Styling & UI

Tailwind CSS v4
shadcn/ui (Radix UI)
Framer Motion

Data Visualization

Recharts

Backend

Supabase (Lovable Cloud)
Real-time database + authentication

Forms & Validation

React Hook Form
Zod

---
Architecture Overview
File-based routing system (TanStack Start)
Modular component structure
Separation of UI / data / hooks / logic layers
Reusable analytics and dashboard components
Simulated + real-time hybrid data model
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

🤝 Impact

DalasiWatch demonstrates how data systems and frontend engineering can solve real economic visibility problems in developing regions, making pricing information more transparent and accessible.

---

## Contact

**Project Author:** [Bai-Jasseh](https://github.com/Bai-Jasseh)  
**Project Link:** [https://github.com/Bai-Jasseh/dalasi-watch](https://github.com/Bai-Jasseh/dalasi-watch)

---

<p align="center">Built for The Gambia 🇬🇲</p>
