import React from "react";
import { Audio } from "@remotion/media";
import { getStaticFiles } from "@remotion/studio";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { brand } from "./brand";
import { sec, T } from "./timeline";
import { clamp } from "./components/motion";
import { Intro } from "./scenes/Intro";
import { Letters } from "./scenes/Letters";
import { DepositPill } from "./scenes/DepositPill";
import { ConversionCard } from "./scenes/ConversionCard";
import { Progress } from "./scenes/Progress";
import { Outro } from "./scenes/Outro";

// Audio is optional: each file plays only if it exists in public/.
const hasFile = (name: string) => getStaticFiles().some((f) => f.name === name);

export const SpendaPromo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const music = hasFile("music.mp3");
  const click = hasFile("click.mp3");
  const popSfx = hasFile("pop.mp3");

  return (
    <AbsoluteFill style={{ background: brand.colors.black }}>
      <Sequence name="Intro" from={sec(T.intro.start)} durationInFrames={sec(T.intro.end - T.intro.start)} premountFor={fps}>
        <Intro />
      </Sequence>
      <Sequence name="Letters" from={sec(T.letters.start)} durationInFrames={sec(T.letters.end - T.letters.start)} premountFor={fps}>
        <Letters />
      </Sequence>
      <Sequence name="Deposit pill" from={sec(T.pill.start)} durationInFrames={sec(T.pill.end - T.pill.start)} premountFor={fps}>
        <DepositPill />
      </Sequence>
      <Sequence name="Conversion card" from={sec(T.card.start)} durationInFrames={sec(T.card.collapseEnd - T.card.start)} premountFor={fps}>
        <ConversionCard />
      </Sequence>
      <Sequence name="Progress" from={sec(T.progress.start)} durationInFrames={sec(T.progress.end - T.progress.start)} premountFor={fps}>
        <Progress />
      </Sequence>
      <Sequence name="Outro" from={sec(T.outro.start)} durationInFrames={sec(T.outro.end - T.outro.start)} premountFor={fps}>
        <Outro />
      </Sequence>

      {music && (
        <Audio
          src={staticFile("music.mp3")}
          volume={(f) =>
            interpolate(f, [durationInFrames - sec(T.audio.musicFadeOut), durationInFrames], [1, 0], clamp)
          }
        />
      )}
      {click && (
        <>
          <Audio src={staticFile("click.mp3")} from={sec(T.pill.click)} premountFor={fps} />
          <Audio src={staticFile("click.mp3")} from={sec(T.card.click)} premountFor={fps} />
        </>
      )}
      {popSfx && <Audio src={staticFile("pop.mp3")} from={sec(T.progress.complete)} premountFor={fps} />}
    </AbsoluteFill>
  );
};
