import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { COLORS } from "../theme";

const { fontFamily: inter } = loadInter("normal", { weights: ["400", "600"] });
const { fontFamily: display } = loadSpaceGrotesk("normal", { weights: ["700"] });

const PriceTag: React.FC<{
  region: string;
  price: number;
  delay: number;
  highlight?: boolean;
}> = ({ region, price, delay, highlight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14 },
  });
  const y = interpolate(p, [0, 1], [30, 0]);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${y}px)`,
        background: highlight ? COLORS.alert : COLORS.navy,
        border: `2px solid ${highlight ? COLORS.alert : "#1F2D52"}`,
        color: COLORS.cream,
        padding: "28px 40px",
        borderRadius: 18,
        minWidth: 380,
        fontFamily: inter,
        boxShadow: highlight
          ? `0 20px 50px -10px ${COLORS.alert}55`
          : "0 10px 30px -10px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          fontSize: 22,
          opacity: 0.7,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {region}
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          fontFamily: display,
          marginTop: 6,
        }}
      >
        GMD {price.toLocaleString()}
      </div>
      <div style={{ fontSize: 20, opacity: 0.6, marginTop: 4 }}>
        1kg onions{highlight ? "  ·  +83% above fair price" : ""}
      </div>
    </div>
  );
};

export const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleP = spring({ frame, fps, config: { damping: 200 } });
  const titleY = interpolate(titleP, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navyDeep,
        padding: 120,
        fontFamily: inter,
      }}
    >
      <div
        style={{
          opacity: titleP,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            color: COLORS.green,
            fontSize: 24,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          The Problem
        </div>
        <h2
          style={{
            fontFamily: display,
            fontSize: 96,
            color: COLORS.cream,
            margin: "16px 0 0 0",
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 1500,
          }}
        >
          Same item.{" "}
          <span style={{ color: COLORS.alert }}>Three different prices.</span>
        </h2>
        <p
          style={{
            fontSize: 32,
            color: COLORS.muted,
            marginTop: 24,
            maxWidth: 1300,
            lineHeight: 1.4,
          }}
        >
          Citizens have no way to know what's fair — or where they're being
          overcharged.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 32,
          marginTop: 90,
          flexWrap: "wrap",
        }}
      >
        <PriceTag region="Banjul" price={60} delay={20} />
        <PriceTag region="Brikama" price={75} delay={35} />
        <PriceTag region="Serekunda" price={110} delay={50} highlight />
      </div>
    </AbsoluteFill>
  );
};
