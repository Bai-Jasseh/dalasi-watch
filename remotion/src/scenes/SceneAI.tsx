import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { COLORS } from "../theme";

const { fontFamily: inter } = loadInter("normal", { weights: ["400", "500", "600"] });
const { fontFamily: display } = loadSpaceGrotesk("normal", { weights: ["700"] });

const Bubble: React.FC<{
  side: "user" | "ai";
  delay: number;
  children?: React.ReactNode;
  typing?: boolean;
}> = ({ side, delay, children, typing }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  const y = interpolate(p, [0, 1], [20, 0]);
  const isUser = side === "user";
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${y}px)`,
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "82%",
        background: isUser ? COLORS.green : "rgba(255,255,255,0.06)",
        color: isUser ? COLORS.white : COLORS.cream,
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)",
        padding: "18px 24px",
        borderRadius: 22,
        borderBottomRightRadius: isUser ? 6 : 22,
        borderBottomLeftRadius: isUser ? 22 : 6,
        fontSize: 22,
        lineHeight: 1.45,
        fontFamily: inter,
      }}
    >
      {typing ? (
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center", height: 20 }}>
          {[0, 1, 2].map((i) => {
            const t = (frame - delay - i * 4) / 8;
            const op = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t));
            return (
              <span
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: COLORS.cream,
                  opacity: Math.min(1, Math.max(0.3, op)),
                  display: "inline-block",
                }}
              />
            );
          })}
        </span>
      ) : (
        children
      )}
    </div>
  );
};

const FeatureRow: React.FC<{ baseDelay: number }> = ({ baseDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = [
    { label: "Tool-calling", icon: "🔧" },
    { label: "Grounded in DB", icon: "📊" },
    { label: "No hallucinations", icon: "✓" },
  ];

  return (
    <div style={{ display: "flex", gap: 14, marginTop: 36, flexWrap: "wrap" }}>
      {items.map((it, i) => {
        const p = spring({
          frame: frame - baseDelay - i * 8,
          fps,
          config: { damping: 18 },
        });
        const y = interpolate(p, [0, 1], [16, 0]);
        return (
          <div
            key={it.label}
            style={{
              opacity: p,
              transform: `translateY(${y}px)`,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: COLORS.cream,
              padding: "12px 20px",
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{it.icon}</span>
            {it.label}
          </div>
        );
      })}
    </div>
  );
};

export const SceneAI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleP = spring({ frame, fps, config: { damping: 200 } });
  const phoneP = spring({ frame: frame - 10, fps, config: { damping: 18 } });
  const phoneY = interpolate(phoneP, [0, 1], [60, 0]);
  const pulse = 1 + 0.06 * Math.sin(frame / 6);

  // Frame-gated rendering for chat bubbles
  const showAnswer = frame >= 90;
  const showSecondQ = frame >= 160;
  const showSecondTyping = frame >= 200;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.navyDeep} 0%, ${COLORS.navy} 100%)`,
        padding: 90,
        fontFamily: inter,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 70,
      }}
    >
      {/* Left side */}
      <div style={{ flex: 1, opacity: titleP, alignSelf: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.35)",
            color: COLORS.amber,
            padding: "10px 20px",
            borderRadius: 999,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            transform: `scale(${pulse})`,
            transformOrigin: "left center",
          }}
        >
          ✨ New · AI Assistant
        </div>
        <h2
          style={{
            fontFamily: display,
            fontSize: 84,
            color: COLORS.cream,
            margin: "24px 0 0 0",
            lineHeight: 1.02,
            letterSpacing: -2,
            fontWeight: 700,
          }}
        >
          Ask DalasiWatch
          <br />
          <span style={{ color: COLORS.green }}>in plain English.</span>
        </h2>
        <p
          style={{
            fontSize: 24,
            color: COLORS.muted,
            marginTop: 24,
            lineHeight: 1.45,
            maxWidth: 620,
          }}
        >
          Every answer is grounded in real prices from{" "}
          <span style={{ color: COLORS.cream }}>price_history</span> and{" "}
          <span style={{ color: COLORS.cream }}>citizen reports</span> —
          never hallucinated.
        </p>

        <FeatureRow baseDelay={70} />
      </div>

      {/* Right side: chat mockup */}
      <div
        style={{
          width: 560,
          opacity: phoneP,
          transform: `translateY(${phoneY}px)`,
          alignSelf: "center",
        }}
      >
        <div
          style={{
            background: "rgba(11,27,59,0.92)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 32,
            overflow: "hidden",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(16,185,129,0.15)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.green})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              ✨
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  color: COLORS.cream,
                  fontWeight: 600,
                  fontSize: 20,
                  fontFamily: display,
                  lineHeight: 1.1,
                }}
              >
                Ask DalasiWatch
              </div>
              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 14,
                  marginTop: 4,
                  lineHeight: 1.1,
                }}
              >
                AI · powered by real market data
              </div>
            </div>
          </div>

          {/* Chat */}
          <div
            style={{
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minHeight: 560,
            }}
          >
            <Bubble side="user" delay={20}>
              Where is sugar cheapest this week?
            </Bubble>

            {!showAnswer && <Bubble side="ai" delay={55} typing />}

            {showAnswer && (
              <Bubble side="ai" delay={90}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  Sugar (1kg) — last 7 days
                </div>
                <div style={{ color: COLORS.muted, fontSize: 18, lineHeight: 1.5 }}>
                  Cheapest:{" "}
                  <span style={{ color: COLORS.green, fontWeight: 600 }}>
                    Brikama · GMD 72
                  </span>
                  <br />
                  Most expensive:{" "}
                  <span style={{ color: COLORS.amber, fontWeight: 600 }}>
                    Basse · GMD 84
                  </span>
                  <br />
                  Ministry cap:{" "}
                  <span style={{ color: COLORS.cream }}>GMD 75</span>
                </div>
              </Bubble>
            )}

            {showSecondQ && (
              <Bubble side="user" delay={160}>
                Compare onion prices: Banjul vs Basse
              </Bubble>
            )}

            {showSecondTyping && <Bubble side="ai" delay={200} typing />}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
