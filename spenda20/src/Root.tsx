import { Composition } from "remotion";
import { Spenda20 } from "./Spenda20";

export const RemotionRoot: React.FC = () => {
  return <Composition id="Spenda20" component={Spenda20} durationInFrames={600} fps={30} width={1920} height={1080} />;
};
