import React from "react";
import { brand } from "../brand";
import { T } from "../timeline";
import { KineticCard } from "../components/KineticText";
import { useSceneTime } from "../components/motion";

const S = T.s2;

export const S2Kinetic: React.FC = () => {
  const t = useSceneTime(S.start);
  const [a, b] = brand.copy.kinetic1;
  return t < S.cuts[1] ? (
    <KineticCard text={a} t={t} start={S.cuts[0]} dark />
  ) : (
    <KineticCard text={b} t={t} start={S.cuts[1]} dark={false} />
  );
};
