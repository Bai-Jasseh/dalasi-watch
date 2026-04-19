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

const { fontFamily: inter } = loadInter("normal", { weights: ["400", "600"] });
const { fontFamily: display } = loadSpaceGrotesk("normal", { weights: ["700"] });

const Pillar: React.FC<{
  num: string;
  title: string;
  desc: string;
  delay: number;
}> = ({ num, title, desc, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  const y = interpolate(p, [0, 1], [40, 0]);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${y}px)`,
        flex: 1,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: 44,
      }}
    >
      <div
        style={{
          fontFamily: display,
          fontSize: 64,
          color: COLORS.green,
          fontWeight: 700,
        }}
      >
        {num}
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 36,
          color: COLORS.cream,
          marginTop: 12,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 22,
          color: COLORS.muted,
          marginTop: 14,
          lineHeight: 1.45,
        }}
      >
        {desc}
      </div>
    </div>
  );
};

export const SceneSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleP = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navy,
        padding: 120,
        fontFamily: inter,
      }}
    >
      <div style={{ opacity: titleP }}>
        <div
          style={{
            color: COLORS.green,
            fontSize: 24,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          The Solution
        </div>
        <h2
          style={{
            fontFamily: display,
            fontSize: 88,
            color: COLORS.cream,
            margin: "16px 0 0 0",
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          A live national price feed,
          <br />
          <span style={{ color: COLORS.green }}>powered by citizens.</span>
        </h2>
      </div>

      <div style={{ display: "flex", gap: 28, marginTop: 80 }}>
        <Pillar
          num="01"
          title="Browse"
          desc="See prices for every commodity across all 7 regions."
          delay={15}
        />
        <Pillar
          num="02"
          title="Compare"
          desc="Spot regional gaps and find the fair price instantly."
          delay={28}
        />
        <Pillar
          num="03"
          title="Report"
          desc="Submit a price you saw — anonymously, in 10 seconds."
          delay={41}
        />
        <Pillar
          num="04"
          title="Verify"
          desc="2 reporters within 15% = trusted national average."
          delay={54}
        />
      </div>
    </AbsoluteFill>
  );
};
