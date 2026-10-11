import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { getStaticFiles } from "@remotion/studio";
import { brand } from "./brand";
import { scenes, studio, particles, sfx, dur } from "./timeline";
import "./font";
import { Studio } from "./components/Studio";
import { Particles } from "./components/Particles";
import { S1Dear } from "./scenes/S1Dear";
import { S2Chat } from "./scenes/S2Chat";
import { S3Waiting } from "./scenes/S3Waiting";
import { S4Shatter } from "./scenes/S4Shatter";
import { S5Reveal } from "./scenes/S5Reveal";
import { S6Rates } from "./scenes/S6Rates";
import { S7Deposit } from "./scenes/S7Deposit";
import { S8Credited } from "./scenes/S8Credited";
import { S9Transfer } from "./scenes/S9Transfer";
import { S10Versus } from "./scenes/S10Versus";
import { S11NoWahala } from "./scenes/S11NoWahala";
import { S12EndCard } from "./scenes/S12EndCard";

const has = (name: string) => {
  try {
    return getStaticFiles().some((f) => f.name === name);
  } catch {
    return false;
  }
};

const Soundtrack: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const fadeFrames = Math.round(0.5 * fps);
  return (
    <>
      {has("music.mp3") ? (
        <Audio
          src={staticFile("music.mp3")}
          volume={(f) => interpolate(f, [durationInFrames - fadeFrames, durationInFrames], [0.66, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      ) : null}
      {sfx
        .filter((s) => has(s.file))
        .map((s, i) => (
          <Sequence key={i} from={s.at} durationInFrames={fps * 3} layout="none">
            <Audio src={staticFile(s.file)} volume={s.volume ?? 1} />
          </Sequence>
        ))}
    </>
  );
};

const scene = (span: { from: number; to: number }, Comp: React.FC, name: string) => (
  <Sequence from={span.from} durationInFrames={dur(span)} name={name}>
    <Comp />
  </Sequence>
);

export const SpendaP2P: React.FC = () => (
  <AbsoluteFill style={{ background: brand.colors.darkBg }}>
    {scene(scenes.s1, S1Dear, "S1 Dear vendor")}
    {scene(scenes.s2, S2Chat, "S2 Chat")}
    {scene(scenes.s3, S3Waiting, "S3 It's the waiting")}
    {scene(scenes.s4, S4Shatter, "S4 Shatter")}
    <Sequence from={studio.from} durationInFrames={dur(studio)} name="Studio bg">
      <Studio />
    </Sequence>
    <Sequence from={particles.from} durationInFrames={dur(particles)} name="Particles">
      <Particles />
    </Sequence>
    {scene(scenes.s5, S5Reveal, "S5 App launch reveal")}
    {scene(scenes.s6, S6Rates, "S6 Check the rate")}
    {scene(scenes.s7, S7Deposit, "S7 Send USDT")}
    {scene(scenes.s8, S8Credited, "S8 Naira lands")}
    {scene(scenes.s9, S9Transfer, "S9 Spend it")}
    {scene(scenes.s10, S10Versus, "S10 P2P vs Spenda")}
    {scene(scenes.s11, S11NoWahala, "S11 No wahala")}
    {scene(scenes.s12, S12EndCard, "S12 End card")}
    <Soundtrack />
  </AbsoluteFill>
);
