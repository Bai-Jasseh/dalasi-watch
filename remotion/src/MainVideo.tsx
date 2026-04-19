import { AbsoluteFill } from "remotion";
import {
  TransitionSeries,
  springTiming,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

import { TitleCard } from "./scenes/TitleCard";
import { ScreenScene } from "./scenes/ScreenScene";
import { SceneImpact } from "./scenes/SceneImpact";
import { SceneClose } from "./scenes/SceneClose";
import { COLORS } from "./theme";

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
      pointerEvents: "none",
    }}
  />
);

// Reusable timings
const fastFade = () => (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 14 })}
  />
);
const slideRight = () => (
  <TransitionSeries.Transition
    presentation={slide({ direction: "from-right" })}
    timing={springTiming({ config: { damping: 200 }, durationInFrames: 22 })}
  />
);
const wipeRight = () => (
  <TransitionSeries.Transition
    presentation={wipe({ direction: "from-right" })}
    timing={springTiming({ config: { damping: 200 }, durationInFrames: 22 })}
  />
);

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep }}>
      <TransitionSeries>
        {/* 1. HOOK */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <TitleCard
            eyebrow="The Gambia · Market Intelligence"
            title="Every household feels"
            accent="every price hike."
            body="DalasiWatch makes prices transparent — from Banjul to Basse — for citizens, traders, and the Ministry of Trade."
          />
        </TransitionSeries.Sequence>
        {fastFade()}

        {/* 2. PROBLEM CONTEXT */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <TitleCard
            eyebrow="The Problem"
            title="Citizens overpay."
            accent="Officials fly blind."
            body="No live national price data. No way to verify what's fair. No fast signal when traders gouge."
          />
        </TransitionSeries.Sequence>
        {wipeRight()}

        {/* 3. HOME PAGE */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <ScreenScene
            screen="home.png"
            chip="Step 1 · Landing"
            title="A national market intelligence platform."
            subtitle="One place to see prices, alerts, and trends across all 7 regions of The Gambia."
            zoomFrom={1.0}
            zoomTo={1.06}
            panY={-40}
          />
        </TransitionSeries.Sequence>
        {slideRight()}

        {/* 4. MARKETS BROWSE */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <ScreenScene
            screen="markets.png"
            chip="Step 2 · Browse Markets"
            title="Every essential, tracked daily."
            subtitle="Rice, sugar, oil, fish, produce — with the Ministry's recommended price next to every listing."
            zoomFrom={1.04}
            zoomTo={1.12}
            panY={-80}
            highlight={{ x: 1180, y: 470, w: 380, h: 130, label: "Rec. price shown" }}
          />
        </TransitionSeries.Sequence>
        {slideRight()}

        {/* 5. MARKETS — REGION FILTERING focus */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <ScreenScene
            screen="markets.png"
            chip="Filter by category & region"
            title="Drill down to your region."
            subtitle="Switch between Essentials, Protein, Produce, or pick a specific division — Brikama, Basse, Banjul…"
            zoomFrom={1.18}
            zoomTo={1.22}
            panX={-150}
            panY={-30}
            highlight={{ x: 335, y: 410, w: 360, h: 60, label: "Category filters" }}
          />
        </TransitionSeries.Sequence>
        {slideRight()}

        {/* 6. COMPARE */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <ScreenScene
            screen="compare.png"
            chip="Step 3 · Compare"
            title="Compare prices across regions."
            subtitle="Spot where the same kilo of sugar is cheapest — and where it's being marked up unfairly."
            zoomFrom={1.0}
            zoomTo={1.08}
            panY={-50}
          />
        </TransitionSeries.Sequence>
        {slideRight()}

        {/* 7. ANALYTICS / MINISTRY VIEW */}
        <TransitionSeries.Sequence durationInFrames={270}>
          <ScreenScene
            screen="analytics.png"
            chip="Step 4 · Ministry View"
            title="A bird's-eye view for officials."
            subtitle="National inflation index, active gouging alerts, and a live regional heatmap. Decisions in seconds, not weeks."
            zoomFrom={1.0}
            zoomTo={1.07}
            panY={-60}
            highlight={{ x: 1180, y: 370, w: 400, h: 120, label: "Live alerts" }}
          />
        </TransitionSeries.Sequence>
        {slideRight()}

        {/* 8. ANALYTICS — heatmap focus */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <ScreenScene
            screen="analytics.png"
            chip="Regional heatmap"
            title="Green = fair. Red = unfair pricing."
            subtitle="Every region scored automatically against the recommended price. The Ministry can act fast where it matters."
            zoomFrom={1.15}
            zoomTo={1.25}
            panY={-280}
            panX={0}
          />
        </TransitionSeries.Sequence>
        {slideRight()}

        {/* 9. DASHBOARD */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <ScreenScene
            screen="dashboard.png"
            chip="Step 5 · Citizen Dashboard"
            title="Personalized for every household."
            subtitle="Track the items that matter to your family. Get alerted when prices spike in your region."
            zoomFrom={1.0}
            zoomTo={1.07}
            panY={-50}
          />
        </TransitionSeries.Sequence>
        {slideRight()}

        {/* 10. REPORT */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <ScreenScene
            screen="report.png"
            chip="Step 6 · Citizen Reports"
            title="Citizens are the sensors."
            subtitle="Anyone can submit a price they paid. Crowdsourced data keeps the system honest, daily."
            zoomFrom={1.0}
            zoomTo={1.06}
            panY={-40}
          />
        </TransitionSeries.Sequence>
        {fastFade()}

        {/* 11. PROFILE — quick beat */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <ScreenScene
            screen="profile.png"
            chip="Your profile"
            title="Saved searches. Personal alerts."
            subtitle="Sign in to save the basket your family buys every week."
            zoomFrom={1.0}
            zoomTo={1.05}
            panY={-30}
          />
        </TransitionSeries.Sequence>
        {fastFade()}

        {/* 12. AI SECTION TITLE — the hero feature */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <TitleCard
            eyebrow="✨ NEW · Powered by AI"
            title="Ask DalasiWatch"
            accent="in plain English."
            body="An AI assistant grounded in real market data — never hallucinated, always citing live prices from price_history and citizen reports."
          />
        </TransitionSeries.Sequence>
        {wipeRight()}

        {/* 13. AI — chat opens */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <ScreenScene
            screen="ai-open.png"
            chip="AI Assistant"
            title="One tap. Real answers."
            subtitle="Floating on every page. Powered by Gemini, grounded in live data from all 7 regions."
            zoomFrom={1.0}
            zoomTo={1.05}
            panX={-80}
            panY={-20}
          />
        </TransitionSeries.Sequence>
        {fastFade()}

        {/* 14. AI — rice answer */}
        <TransitionSeries.Sequence durationInFrames={270}>
          <ScreenScene
            screen="ai-answer.png"
            chip="Real-time pricing"
            title="“What's the price of rice in Brikama?”"
            subtitle="The AI calls live data tools, finds the right commodity, and answers — every time, with real numbers."
            zoomFrom={1.05}
            zoomTo={1.12}
            panX={-200}
            panY={-50}
          />
        </TransitionSeries.Sequence>
        {fastFade()}

        {/* 15. AI — second question */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <ScreenScene
            screen="ai-answer2.png"
            chip="Multi-turn"
            title="“Where is sugar cheapest right now?”"
            subtitle="The assistant compares regions instantly. No spreadsheets. No phone calls. Just answers."
            zoomFrom={1.05}
            zoomTo={1.12}
            panX={-200}
            panY={-80}
          />
        </TransitionSeries.Sequence>
        {fastFade()}

        {/* 16. AI typed (typing UX) */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <ScreenScene
            screen="ai-typed.png"
            chip="Conversational"
            title="Ask anything about the market."
            subtitle="Compare commodities. Check trends. Find the fairest market. In English, in seconds."
            zoomFrom={1.08}
            zoomTo={1.14}
            panX={-200}
            panY={-100}
          />
        </TransitionSeries.Sequence>
        {wipeRight()}

        {/* 17. IMPACT */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneImpact />
        </TransitionSeries.Sequence>
        {fastFade()}

        {/* 18. RECAP TITLE */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <TitleCard
            eyebrow="One platform · Three audiences"
            title="Citizens. Traders."
            accent="The Ministry."
            body="Live prices · Regional intelligence · Crowd-sourced reports · AI answers — all in one app."
          />
        </TransitionSeries.Sequence>
        {fastFade()}

        {/* 19. CLOSE */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <SceneClose />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette />
    </AbsoluteFill>
  );
};
