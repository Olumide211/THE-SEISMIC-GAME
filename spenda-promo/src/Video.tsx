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
import { S5Meet } from "./scenes/S5Meet";
import { S6Open } from "./scenes/S6Open";
import { S7Deposit } from "./scenes/S7Deposit";
import { S8Send } from "./scenes/S8Send";
import { S9Convert } from "./scenes/S9Convert";
import { S10Press } from "./scenes/S10Press";
import { S11Instant } from "./scenes/S11Instant";
import { S12Done } from "./scenes/S12Done";
import { S13EndCard } from "./scenes/S13EndCard";

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
          volume={(f) => interpolate(f, [durationInFrames - fadeFrames, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
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
    {scene(scenes.s5, S5Meet, "S5 Meet Spenda 2.0")}
    <Sequence from={studio.from} durationInFrames={dur(studio)} name="Studio bg">
      <Studio />
    </Sequence>
    <Sequence from={particles.from} durationInFrames={dur(particles)} name="Particles">
      <Particles />
    </Sequence>
    {scene(scenes.s6, S6Open, "S6 Open")}
    {scene(scenes.s7, S7Deposit, "S7 Tap Deposit")}
    {scene(scenes.s8, S8Send, "S8 Send Naira")}
    {scene(scenes.s9, S9Convert, "S9 Convert")}
    {scene(scenes.s10, S10Press, "S10 Press")}
    {scene(scenes.s11, S11Instant, "S11 Instant")}
    {scene(scenes.s12, S12Done, "S12 Done")}
    {scene(scenes.s13, S13EndCard, "S13 End card")}
    <Soundtrack />
  </AbsoluteFill>
);
