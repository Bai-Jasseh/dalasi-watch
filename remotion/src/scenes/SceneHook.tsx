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
const { fontFamily: display } = loadSpaceGrotesk("normal", {
  weights: ["500", "700"],
});

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 90 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  const subProgress = spring({
    frame: frame - 18,
    fps,
    config: { damping: 200 },
  });
  const subOpacity = interpolate(subProgress, [0, 1], [0, 1]);

  const linePulse = (Math.sin(frame / 14) + 1) / 2;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.navyDeep} 0%, ${COLORS.navy} 100%)`,
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 160,
        paddingRight: 160,
        fontFamily: inter,
      }}
    >
      {/* Soft accent orb */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: COLORS.green,
          opacity: 0.12,
          filter: "blur(80px)",
        }}
      />

      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: "10px 22px",
            borderRadius: 999,
            border: `1px solid ${COLORS.green}`,
            color: COLORS.green,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.4 + linePulse * 0.6,
            marginBottom: 40,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: COLORS.green,
            }}
          />
          The Gambia · Civic AI Build Weekend
        </div>

        <h1
          style={{
            fontFamily: display,
            fontWeight: 700,
            fontSize: 180,
            lineHeight: 0.95,
            color: COLORS.cream,
            margin: 0,
            letterSpacing: -4,
          }}
        >
          Dalasi
          <span style={{ color: COLORS.green }}>Watch</span>
        </h1>
      </div>

      <div
        style={{
          marginTop: 40,
          opacity: subOpacity,
          fontSize: 44,
          color: COLORS.muted,
          maxWidth: 1200,
          lineHeight: 1.3,
        }}
      >
        Real prices. Real people. Real transparency.
      </div>
    </AbsoluteFill>
  );
};
