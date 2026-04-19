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

const ITEMS = [
  { name: "Rice (Sadam)", unit: "50kg bag", price: 2200, rec: 2200, status: "ok" },
  { name: "Cooking Oil", unit: "5L", price: 740, rec: 650, status: "warn" },
  { name: "Sugar", unit: "1kg", price: 75, rec: 75, status: "ok" },
  { name: "Onions (Local)", unit: "kg", price: 110, rec: 60, status: "alert" },
  { name: "Bonga Fish", unit: "kg", price: 80, rec: 80, status: "ok" },
  { name: "Beef (boneless)", unit: "kg", price: 480, rec: 420, status: "warn" },
];

const Card: React.FC<{ item: (typeof ITEMS)[0]; delay: number }> = ({
  item,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  const y = interpolate(p, [0, 1], [30, 0]);
  const color =
    item.status === "alert"
      ? COLORS.alert
      : item.status === "warn"
      ? COLORS.amber
      : COLORS.green;
  const label =
    item.status === "alert" ? "ALERT" : item.status === "warn" ? "+14%" : "FAIR";
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${y}px)`,
        background: COLORS.cream,
        borderRadius: 20,
        padding: 32,
        boxShadow: "0 20px 50px -20px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 600, color: COLORS.navyDeep }}>
            {item.name}
          </div>
          <div style={{ fontSize: 20, color: "#6B7280", marginTop: 2 }}>
            {item.unit}
          </div>
        </div>
        <div
          style={{
            background: color,
            color: COLORS.white,
            fontSize: 16,
            fontWeight: 700,
            padding: "6px 14px",
            borderRadius: 999,
            letterSpacing: 1,
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: display,
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.navyDeep,
          }}
        >
          GMD {item.price.toLocaleString()}
        </div>
        <div style={{ fontSize: 18, color: "#6B7280" }}>
          Rec. {item.rec.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export const SceneMarkets: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleP = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.navyDeep,
        padding: 100,
        fontFamily: inter,
      }}
    >
      <div style={{ opacity: titleP }}>
        <div
          style={{
            color: COLORS.green,
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Markets · Live View
        </div>
        <h2
          style={{
            fontFamily: display,
            fontSize: 76,
            color: COLORS.cream,
            margin: "10px 0 0 0",
            letterSpacing: -2,
          }}
        >
          Every commodity. Every region.
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 26,
          marginTop: 70,
        }}
      >
        {ITEMS.map((item, i) => (
          <Card key={item.name} item={item} delay={20 + i * 10} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
