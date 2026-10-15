import React from "react";
import { Audio } from "@remotion/media";
import { getStaticFiles } from "@remotion/studio";
import { Sequence, staticFile } from "remotion";
import { sec } from "../timeline";

// True when public/<name> exists. Missing audio is skipped silently.
export const hasFile = (name: string) => getStaticFiles().some((f) => f.name === name);

// One sound effect at an absolute time (s). Optional length for looped/trimmed sounds.
export const Sfx: React.FC<{ file: string; at: number; length?: number; volume?: number; loop?: boolean }> = ({
  file,
  at,
  length,
  volume = 1,
  loop,
}) => {
  if (!hasFile(file)) return null;
  return (
    <Sequence from={sec(at)} durationInFrames={length ? sec(length) : undefined} layout="none">
      <Audio src={staticFile(file)} volume={volume} loop={loop} />
    </Sequence>
  );
};
