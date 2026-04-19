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

const ReporterCard: React.FC<{
  name: string;
  price: number;
  delay: number;
}> = ({ name, price, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  const y = interpolate(p, [0, 1], [40, 0]);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${y}px)`,
        background: COLORS.cream,
        borderRadius: 20,
        padding: 30,
        minWidth: 320,
        textAlign: "center",
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ fontSize: 22, color: "#6B7280", marginBottom: 8 }}>
        {name}
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 56,
          color: COLORS.navyDeep,
          fontWeight: 700,
        }}
      >
        GMD {price}
      </div>
    </div>
  );
};

export const SceneVerify: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleP = spring({ frame, fps, config: { damping: 200 } });

  // Verified badge
  const badgeP = spring({
    frame: frame - 130,
    fps,
    config: { damping: 12 },
  });
  const badgeScale = interpolate(badgeP, [0, 1], [0.6, 1]);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navyDeep,
        padding: 100,
        fontFamily: inter,
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
          Verification Engine
        </div>
        <h2
          style={{
            fontFamily: display,
            fontSize: 84,
            color: COLORS.cream,
            margin: "12px auto 0",
            letterSpacing: -2,
            maxWidth: 1500,
            lineHeight: 1.05,
          }}
        >
          When 2 citizens agree within ±15%,
          <br />
          <span style={{ color: COLORS.green }}>the price becomes truth.</span>
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 50,
          marginTop: 90,
        }}
      >
        <ReporterCard name="Reporter A · Serekunda" price={108} delay={20} />
        <div
          style={{
            fontFamily: display,
            fontSize: 60,
            color: COLORS.muted,
            opacity: spring({ frame: frame - 50, fps, config: { damping: 200 } }),
          }}
        >
          +
        </div>
        <ReporterCard name="Reporter B · Serekunda" price={112} delay={70} />
        <div
          style={{
            fontFamily: display,
            fontSize: 60,
            color: COLORS.muted,
            opacity: spring({ frame: frame - 100, fps, config: { damping: 200 } }),
          }}
        >
          =
        </div>
        <div
          style={{
            transform: `scale(${badgeScale})`,
            opacity: badgeP,
            background: COLORS.green,
            borderRadius: 24,
            padding: "32px 40px",
            color: COLORS.white,
            textAlign: "center",
            boxShadow: `0 25px 60px -10px ${COLORS.green}88`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 600,
              opacity: 0.9,
            }}
          >
            ✓ Verified
          </div>
          <div
            style={{
              fontFamily: display,
              fontSize: 64,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            GMD 110
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 70,
          fontSize: 28,
          color: COLORS.muted,
          opacity: spring({
            frame: frame - 160,
            fps,
            config: { damping: 200 },
          }),
        }}
      >
        Published to the national feed in real time.
      </div>
    </AbsoluteFill>
  );
};
