import { Composition } from "remotion";
import { SpendaPromo } from "./SpendaPromo";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SpendaPromo"
      component={SpendaPromo}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
