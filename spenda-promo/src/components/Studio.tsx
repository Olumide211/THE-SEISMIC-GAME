import React from "react";
import { AbsoluteFill } from "remotion";

/** White studio sweep with a soft floor shadow. */
export const Studio: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 75% at 50% 45%, #FFFFFF 0%, #F7F7FA 55%, #E9E9EF 100%)" }}>
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 70,
        width: 900,
        height: 120,
        marginLeft: -450,
        borderRadius: "50%",
        background: "radial-gradient(ellipse at center, rgba(40,30,90,0.10), rgba(40,30,90,0) 70%)",
      }}
    />
  </AbsoluteFill>
);
