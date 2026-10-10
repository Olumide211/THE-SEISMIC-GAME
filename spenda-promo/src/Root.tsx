import React from "react";
import { Composition } from "remotion";
import { SpendaP2P } from "./Video";
import { DURATION, FPS } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition id="SpendaP2P" component={SpendaP2P} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
