import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  TransitionSeries,
  springTiming,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

import { SceneHook } from "./scenes/SceneHook";
import { SceneProblem } from "./scenes/SceneProblem";
import { SceneSolution } from "./scenes/SceneSolution";
import { SceneMarkets } from "./scenes/SceneMarkets";
import { SceneReport } from "./scenes/SceneReport";
import { SceneVerify } from "./scenes/SceneVerify";
import { SceneAI } from "./scenes/SceneAI";
import { SceneImpact } from "./scenes/SceneImpact";
import { SceneClose } from "./scenes/SceneClose";
import { COLORS } from "./theme";

// Subtle persistent grain / vignette layer
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <SceneHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence durationInFrames={210}>
          <SceneProblem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 24,
          })}
        />

        <TransitionSeries.Sequence durationInFrames={210}>
          <SceneSolution />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 22,
          })}
        />

        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneMarkets />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 22,
          })}
        />

        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneReport />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 22,
          })}
        />

        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneVerify />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence durationInFrames={270}>
          <SceneAI />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 22,
          })}
        />

        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneImpact />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={180}>
          <SceneClose />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette />
    </AbsoluteFill>
  );
};
