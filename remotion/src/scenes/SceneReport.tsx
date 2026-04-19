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

const Field: React.FC<{
  label: string;
  value: string;
  delay: number;
}> = ({ label, value, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  const x = interpolate(p, [0, 1], [-30, 0]);
  return (
    <div style={{ opacity: p, transform: `translateX(${x}px)` }}>
      <div
        style={{
          fontSize: 18,
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          background: COLORS.white,
          borderRadius: 12,
          padding: "20px 24px",
          fontSize: 28,
          color: COLORS.navyDeep,
          border: "2px solid #E5E7EB",
        }}
      >
        {value}
      </div>
    </div>
  );
};

export const SceneReport: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleP = spring({ frame, fps, config: { damping: 200 } });

  // Submit button press
  const btnPressP = spring({
    frame: frame - 150,
    fps,
    config: { damping: 12 },
  });
  const btnScale = interpolate(btnPressP, [0, 0.5, 1], [1, 0.94, 1]);

  // Confirmation toast
  const toastP = spring({
    frame: frame - 165,
    fps,
    config: { damping: 14 },
  });
  const toastY = interpolate(toastP, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navy,
        padding: 100,
        fontFamily: inter,
        flexDirection: "row",
        gap: 80,
      }}
    >
      {/* Left copy */}
      <div style={{ flex: 1, opacity: titleP }}>
        <div
          style={{
            color: COLORS.green,
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Citizen Report
        </div>
        <h2
          style={{
            fontFamily: display,
            fontSize: 80,
            color: COLORS.cream,
            margin: "10px 0 0 0",
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          10 seconds.
          <br />
          <span style={{ color: COLORS.green }}>No account.</span>
          <br />
          Anonymous.
        </h2>
        <p
          style={{
            fontSize: 28,
            color: COLORS.muted,
            marginTop: 28,
            lineHeight: 1.45,
            maxWidth: 600,
          }}
        >
          A vendor charged you 110 dalasi for onions? Tell DalasiWatch. Help
          everyone in your region.
        </p>
      </div>

      {/* Right form */}
      <div
        style={{
          flex: 1,
          background: COLORS.cream,
          borderRadius: 28,
          padding: 50,
          display: "flex",
          flexDirection: "column",
          gap: 26,
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)",
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: display,
            fontSize: 36,
            color: COLORS.navyDeep,
            fontWeight: 700,
          }}
        >
          New report
        </div>
        <Field label="Commodity" value="Onions (Local) — kg" delay={15} />
        <Field label="Region · Market" value="Kanifing · Serekunda" delay={30} />
        <Field label="Price seen (GMD)" value="110" delay={45} />

        <div
          style={{
            transform: `scale(${btnScale})`,
            background: COLORS.green,
            color: COLORS.white,
            padding: "22px",
            borderRadius: 14,
            fontSize: 30,
            fontWeight: 700,
            textAlign: "center",
            marginTop: 6,
            boxShadow: `0 14px 30px -10px ${COLORS.green}`,
          }}
        >
          Submit report
        </div>

        {/* Toast */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 50,
            right: 50,
            background: COLORS.navyDeep,
            color: COLORS.cream,
            padding: "20px 26px",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: toastP,
            transform: `translateY(${toastY}px)`,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: COLORS.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: COLORS.white,
              fontSize: 22,
            }}
          >
            ✓
          </div>
          <div style={{ fontSize: 22 }}>
            Report received. Awaiting verification.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
