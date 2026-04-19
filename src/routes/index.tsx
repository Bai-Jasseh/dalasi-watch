import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Map, ShieldCheck, ArrowRight, Activity } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
{ title: "DalasiWatch — Transparency in Every Basket" },
      {
        name: "description",
        content:
          "From Banjul to Basse, DalasiWatch tracks the pulse of the nation. Find fair prices and monitor inflation across The Gambia.",
      },
      { property: "og:title", content: "DalasiWatch — Transparency in Every Basket" },
      {
        property: "og:description",
        content: "The Gambia's official community-powered price monitoring platform.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero text-navy-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(800px 400px at 80% -10%, rgba(255,200,80,0.35), transparent), radial-gradient(600px 300px at 10% 110%, rgba(0,171,102,0.35), transparent)",
          }}
        />
        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-gold-foreground">
              <Activity className="h-4 w-4" />
            </div>
DalasiWatch
          </div>
          <Link
            to="/dashboard"
            className="rounded-full border border-navy-foreground/30 px-4 py-1.5 text-sm hover:bg-navy-foreground/10"
          >
            Dashboard
          </Link>
        </header>

        <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-12 text-center md:pb-32 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/20 bg-navy-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-wider"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-stable" />
            National Market Intelligence System
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl"
          >
            Transparency in Every Basket.
            <br />
            <span className="text-gradient-gold">Stability for Every Home.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-5 max-w-2xl text-base text-navy-foreground/85 md:text-lg"
          >
            The Gambia's official community-powered price monitoring platform. From Banjul to
            Basse, we track the pulse of the nation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex justify-center"
          >
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-semibold text-gold-foreground shadow-glow transition-transform duration-300 animate-breath hover:-translate-y-0.5 hover:shadow-elegant"
            >
              Launch DalasiWatch Dashboard
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-navy-foreground/70">
            <span>🇬🇲 7 Regions</span>
            <span>•</span>
            <span>25+ Tracked Commodities</span>
            <span>•</span>
            <span>Updated Daily</span>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">How DalasiWatch Works</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            A trusted bridge between citizens, markets, and the Ministry of Trade.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Crowd-Sourced Data",
              desc: "Citizens across all 7 regions submit live prices from local markets every day.",
              tone: "bg-stable text-stable-foreground",
            },
            {
              icon: Map,
              title: "Regional Analytics",
              desc: "From Banjul to Basse, see price trends, logistics premiums, and regional volatility.",
              tone: "bg-navy text-navy-foreground",
            },
            {
              icon: ShieldCheck,
              title: "Official Benchmarks",
              desc: "Every commodity is compared against Ministry of Trade recommended prices.",
              tone: "bg-gold text-gold-foreground",
            },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${c.tone}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} DalasiWatch · Built for The Gambia 🇬🇲
      </footer>
    </div>
  );
}
