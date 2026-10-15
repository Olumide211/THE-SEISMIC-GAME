import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { brand } from "./brand";
import { AUDIO, BEATS, sec, T } from "./timeline";
import { clamp } from "./components/motion";
import { hasFile, Sfx } from "./components/Sfx";
import { S1Problem } from "./scenes/S1Problem";
import { S2Kinetic } from "./scenes/S2Kinetic";
import { S3Reveal } from "./scenes/S3Reveal";
import { S4Flow } from "./scenes/S4Flow";
import { S5Success } from "./scenes/S5Success";
import { S6Montage } from "./scenes/S6Montage";
import { S7Kinetic } from "./scenes/S7Kinetic";
import { S8Outro } from "./scenes/S8Outro";

// S4 keeps rendering while its card collapses under the S5 pill.
const S4_OVERLAP = 0.22;

export const Spenda20: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: brand.colors.black }}>
      <Sequence name="S1 Problem" from={sec(T.s1.start)} durationInFrames={sec(T.s1.end - T.s1.start)} premountFor={fps}>
        <S1Problem />
      </Sequence>
      <Sequence name="S2 Kinetic" from={sec(T.s2.start)} durationInFrames={sec(T.s2.end - T.s2.start)} premountFor={fps}>
        <S2Kinetic />
      </Sequence>
      <Sequence name="S3 Reveal" from={sec(T.s3.start)} durationInFrames={sec(T.s3.end - T.s3.start)} premountFor={fps}>
        <S3Reveal />
      </Sequence>
      <Sequence name="S4 Flow" from={sec(T.s4.start)} durationInFrames={sec(T.s4.end + S4_OVERLAP - T.s4.start)} premountFor={fps}>
        <S4Flow />
      </Sequence>
      <Sequence name="S5 Success" from={sec(T.s5.start)} durationInFrames={sec(T.s5.end - T.s5.start)} premountFor={fps}>
        <S5Success />
      </Sequence>
      <Sequence name="S6 Montage" from={sec(T.s6.start)} durationInFrames={sec(T.s6.end - T.s6.start)} premountFor={fps}>
        <S6Montage />
      </Sequence>
      <Sequence name="S7 Kinetic" from={sec(T.s7.start)} durationInFrames={sec(T.s7.end - T.s7.start)} premountFor={fps}>
        <S7Kinetic />
      </Sequence>
      <Sequence name="S8 Outro" from={sec(T.s8.start)} durationInFrames={sec(T.s8.end - T.s8.start)} premountFor={fps}>
        <S8Outro />
      </Sequence>

      {/* Audio: every file is optional */}
      {hasFile("music.mp3") && (
        <Audio
          src={staticFile("music.mp3")}
          volume={(f) =>
            AUDIO.musicVolume *
            interpolate(f, [durationInFrames - sec(AUDIO.musicFadeOut), durationInFrames], [1, 0], clamp)
          }
        />
      )}
      {T.s1.bubbles.map((at) => (
        <Sfx key={`pop${at}`} file="message-pop.mp3" at={at} />
      ))}
      <Sfx file="message-pop.mp3" at={T.s1.typing[0]} volume={0.6} />
      <Sfx file="tick.mp3" at={T.s1.clockIn} length={T.s1.end - T.s1.clockIn} volume={0.35} loop />
      {[...BEATS, T.s6.flip[0], T.s6.slide[0]].map((at) => (
        <Sfx key={`whoosh${at}`} file="whoosh.mp3" at={at} volume={0.7} />
      ))}
      <Sfx file="riser.mp3" at={AUDIO.riserAt} />
      <Sfx file="impact.mp3" at={AUDIO.impactAt} />
      {[T.s4.tap1, T.s4.tap2, T.s6.downloadTap, T.s6.darkToggle, T.s6.tfaToggle].map((at) => (
        <Sfx key={`click${at}`} file="click.mp3" at={at} />
      ))}
      <Sfx file="coin.mp3" at={T.s4.coinIn[1]} />
      <Sfx file="success-chime.mp3" at={T.s5.ringDraw[0]} />
      <Sfx file="glitch.mp3" at={AUDIO.glitchAt} />
      <Sfx file="typing.mp3" at={T.s8.creditType[0]} length={T.s8.creditType[1] - T.s8.creditType[0] + 0.1} />
    </AbsoluteFill>
  );
};
