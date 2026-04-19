import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { COLORS } from "../theme";

const { fontFamily: inter } = loadInter("normal", { weights: ["400", "500", "600"] });
const { fontFamily: display } = loadSpaceGrotesk("normal", { weights: ["700"] });

type Props = {
  screen: string;          // file name in public/screens/
  title: string;           // big caption title
  subtitle?: string;       // narration line
  chip?: string;           // top-left section chip
  // Ken Burns
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number;           // pixels at end
  panY?: number;
  highlight?: { x: number; y: number; w: number; h: number; label?: string };
};

export const ScreenScene: React.FC<Props> = ({
  screen,
  title,
  subtitle,
  chip,
  zoomFrom = 1.0,
  zoomTo = 1.08,
  panX = 0,
  panY = -30,
  highlight,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Ken Burns: smooth across full duration
  const t = frame / Math.max(1, durationInFrames - 1);
  const zoom = interpolate(t, [0, 1], [zoomFrom, zoomTo]);
  const tx = interpolate(t, [0, 1], [0, panX]);
  const ty = interpolate(t, [0, 1], [0, panY]);

  // Caption entrance
  const capP = spring({ frame: frame - 8, fps, config: { damping: 22 } });
  const capY = interpolate(capP, [0, 1], [40, 0]);

  // Chip entrance
  const chipP = spring({ frame, fps, config: { damping: 20 } });

  // Outro fade for last 12 frames
  const outOp = interpolate(frame, [durationInFrames - 12, durationInFrames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Highlight pulse
  const hlP = spring({ frame: frame - 20, fps, config: { damping: 18 } });
  const pulse = 1 + 0.04 * Math.sin(frame / 5);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep, fontFamily: inter, opacity: outOp }}>
      {/* Screenshot layer with Ken Burns */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoom}) translate(${tx}px, ${ty}px)`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile(`screens/${screen}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
      </AbsoluteFill>

      {/* Bottom-left caption gradient */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(6,15,34,0.92) 0%, rgba(6,15,34,0.75) 18%, rgba(6,15,34,0) 45%)",
          pointerEvents: "none",
        }}
      />

      {/* Highlight rectangle */}
      {highlight && (
        <div
          style={{
            position: "absolute",
            left: highlight.x,
            top: highlight.y,
            width: highlight.w,
            height: highlight.h,
            border: `3px solid ${COLORS.amber}`,
            borderRadius: 14,
            opacity: hlP,
            transform: `scale(${pulse})`,
            transformOrigin: "center",
            boxShadow: `0 0 40px ${COLORS.amber}88`,
          }}
        >
          {highlight.label && (
            <div
              style={{
                position: "absolute",
                top: -42,
                left: 0,
                background: COLORS.amber,
                color: COLORS.navyDeep,
                padding: "6px 14px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 0.5,
              }}
            >
              {highlight.label}
            </div>
          )}
        </div>
      )}

      {/* Section chip top-left */}
      {chip && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 70,
            opacity: chipP,
            transform: `translateY(${interpolate(chipP, [0, 1], [-20, 0])}px)`,
            background: "rgba(11,27,59,0.85)",
            border: `1px solid ${COLORS.amber}55`,
            color: COLORS.amber,
            padding: "10px 22px",
            borderRadius: 999,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            backdropFilter: "blur(0px)",
          }}
        >
          {chip}
        </div>
      )}

      {/* Caption block bottom-left */}
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 70,
          opacity: capP,
          transform: `translateY(${capY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: display,
            color: COLORS.cream,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            maxWidth: 1300,
            textShadow: "0 2px 30px rgba(0,0,0,0.6)",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              marginTop: 18,
              color: COLORS.muted,
              fontSize: 26,
              maxWidth: 1100,
              lineHeight: 1.4,
              textShadow: "0 2px 18px rgba(0,0,0,0.7)",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
