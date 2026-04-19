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

export const SceneClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP = spring({ frame, fps, config: { damping: 18 } });
  const logoScale = interpolate(logoP, [0, 1], [0.85, 1]);

  const taglineP = spring({
    frame: frame - 25,
    fps,
    config: { damping: 200 },
  });

  const urlP = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 },
  });

  const pulse = (Math.sin(frame / 18) + 1) / 2;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${COLORS.navy} 0%, ${COLORS.navyDeep} 100%)`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: inter,
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: COLORS.green,
          opacity: 0.08 + pulse * 0.05,
          filter: "blur(100px)",
        }}
      />

      <div
        style={{
          opacity: logoP,
          transform: `scale(${logoScale})`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: display,
            fontWeight: 700,
            fontSize: 200,
            color: COLORS.cream,
            margin: 0,
            letterSpacing: -5,
            lineHeight: 0.95,
          }}
        >
          Dalasi
          <span style={{ color: COLORS.green }}>Watch</span>
        </h1>
      </div>

      <div
        style={{
          opacity: taglineP,
          marginTop: 32,
          fontSize: 42,
          color: COLORS.muted,
          textAlign: "center",
          maxWidth: 1300,
          lineHeight: 1.3,
        }}
      >
        Built for The Gambia. Built for transparency.
      </div>

      <div
        style={{
          opacity: urlP,
          marginTop: 80,
          padding: "16px 36px",
          borderRadius: 999,
          border: `2px solid ${COLORS.green}`,
          color: COLORS.green,
          fontSize: 28,
          letterSpacing: 1,
          fontWeight: 600,
        }}
      >
        dalasi-watch.lovable.app
      </div>
    </AbsoluteFill>
  );
};
