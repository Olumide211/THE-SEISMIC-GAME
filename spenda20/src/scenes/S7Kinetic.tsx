import React from "react";
import { brand } from "../brand";
import { T } from "../timeline";
import { KineticCard } from "../components/KineticText";
import { SpendaLogo } from "../components/Logo";
import { useSceneTime } from "../components/motion";

const S = T.s7;

export const S7Kinetic: React.FC = () => {
  const t = useSceneTime(S.start);
  const [a, b, c] = brand.copy.kinetic2;
  if (t < S.cuts[1]) return <KineticCard text={a} t={t} start={S.cuts[0]} dark />;
  if (t < S.cuts[2]) return <KineticCard text={b} t={t} start={S.cuts[1]} dark={false} />;
  return <KineticCard text={c} t={t} start={S.cuts[2]} dark before={<SpendaLogo size={150} />} />;
};
