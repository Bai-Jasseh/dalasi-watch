import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { COLORS } from "../theme";

const { fontFamily: inter } = loadInter("normal", { weights: ["400", "500", "600", "700"] });
const { fontFamily: display } = loadSpaceGrotesk("normal", { weights: ["700"] });

// "Title card" between sections — bold typographic moment
type Props = {
  eyebrow?: string;
  title: string;
  accent?: string;        // colored portion
  body?: string;
};

export const TitleCard: React.FC<Props> = ({ eyebrow, title, accent, body }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const ebP = spring({ frame, fps, config: { damping: 22 } });
  const titleP = spring({ frame: frame - 8, fps, config: { damping: 18 } });
  const bodyP = spring({ frame: frame - 24, fps, config: { damping: 20 } });
  const titleY = interpolate(titleP, [0, 1], [40, 0]);
  const bodyY = interpolate(bodyP, [0, 1], [20, 0]);

  // subtle gradient drift
  const gx = 50 + 8 * Math.sin(frame / 60);
  const gy = 50 + 6 * Math.cos(frame / 70);

  const outOp = interpolate(frame, [durationInFrames - 12, durationInFrames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at ${gx}% ${gy}%, ${COLORS.navy} 0%, ${COLORS.navyDeep} 70%)`,
        fontFamily: inter,
        padding: 110,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        opacity: outOp,
      }}
    >
      {eyebrow && (
        <div
          style={{
            opacity: ebP,
            display: "inline-flex",
            alignSelf: "flex-start",
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.35)",
            color: COLORS.amber,
            padding: "10px 22px",
            borderRadius: 999,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 30,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          opacity: titleP,
          transform: `translateY(${titleY}px)`,
          fontFamily: display,
          fontSize: 124,
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: -3,
          color: COLORS.cream,
          maxWidth: 1500,
        }}
      >
        {title}
        {accent && (
          <>
            <br />
            <span style={{ color: COLORS.amber }}>{accent}</span>
          </>
        )}
      </div>
      {body && (
        <div
          style={{
            opacity: bodyP,
            transform: `translateY(${bodyY}px)`,
            marginTop: 36,
            fontSize: 30,
            color: COLORS.muted,
            maxWidth: 1100,
            lineHeight: 1.4,
          }}
        >
          {body}
        </div>
      )}
    </AbsoluteFill>
  );
};
