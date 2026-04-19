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

const Stat: React.FC<{
  big: string;
  label: string;
  delay: number;
  color: string;
}> = ({ big, label, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  const y = interpolate(p, [0, 1], [50, 0]);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${y}px)`,
        flex: 1,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: display,
          fontSize: 160,
          color,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: -4,
        }}
      >
        {big}
      </div>
      <div
        style={{
          fontSize: 28,
          color: COLORS.muted,
          marginTop: 16,
          maxWidth: 380,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.35,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const SceneImpact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleP = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navy,
        padding: 100,
        fontFamily: inter,
        justifyContent: "center",
      }}
    >
      <div style={{ opacity: titleP, textAlign: "center" }}>
        <div
          style={{
            color: COLORS.green,
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          The Impact
        </div>
        <h2
          style={{
            fontFamily: display,
            fontSize: 84,
            color: COLORS.cream,
            margin: "12px 0 0 0",
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          Two beneficiaries.
          <br />
          <span style={{ color: COLORS.green }}>One source of truth.</span>
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 100,
        }}
      >
        <Stat big="7" label="Regions covered nationwide" delay={20} color={COLORS.cream} />
        <Stat big="25+" label="Essential commodities tracked" delay={32} color={COLORS.green} />
        <Stat big="±15%" label="Verification threshold for trust" delay={44} color={COLORS.cream} />
        <Stat big="0" label="Accounts needed to report a price" delay={56} color={COLORS.green} />
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 90,
          fontSize: 30,
          color: COLORS.muted,
          opacity: spring({
            frame: frame - 100,
            fps,
            config: { damping: 200 },
          }),
        }}
      >
        Citizens shop smarter. Government acts faster.
      </div>
    </AbsoluteFill>
  );
};
