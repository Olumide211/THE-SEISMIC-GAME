import React from "react";

export const SCREEN_W = 390;
export const SCREEN_H = 844;
const BEZEL = 4;
const RADIUS = 56;

export type PhonePose = {
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  x?: number;
  y?: number;
  opacity?: number;
};

/**
 * Black-bodied phone, 390x844 screen, 4px bezel, 56px radius, soft drop shadow.
 * Centered in its parent; 3D pose applied with perspective(2000px).
 */
export const Phone: React.FC<
  PhonePose & { screen: React.ReactNode; style?: React.CSSProperties; dark?: boolean }
> = ({ screen, rotateX = 0, rotateY = 0, rotateZ = 0, scale = 1, x = 0, y = 0, opacity = 1, style }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: SCREEN_W + BEZEL * 2,
        height: SCREEN_H + BEZEL * 2,
        marginLeft: -(SCREEN_W + BEZEL * 2) / 2,
        marginTop: -(SCREEN_H + BEZEL * 2) / 2,
        transform: `perspective(2000px) translate3d(${x}px, ${y}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
        opacity,
        borderRadius: RADIUS,
        background: "#050505",
        padding: BEZEL,
        boxShadow: [
          "0 0 0 1.5px #2C2C30",
          "0 0 0 3px #0A0A0A",
          "0 50px 90px -20px rgba(18, 12, 48, 0.35)",
          "0 24px 40px -12px rgba(0,0,0,0.28)",
          "0 6px 12px rgba(0,0,0,0.12)",
        ].join(", "),
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: RADIUS - BEZEL,
          overflow: "hidden",
          background: "#fff",
          isolation: "isolate",
        }}
      >
        {screen}
        {/* dynamic island */}
        <div
          style={{
            position: "absolute",
            top: 11,
            left: "50%",
            width: 118,
            height: 34,
            marginLeft: -59,
            borderRadius: 20,
            background: "#000",
            zIndex: 50,
          }}
        />
        {/* glass sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 32%)",
            pointerEvents: "none",
            zIndex: 60,
          }}
        />
      </div>
    </div>
  );
};
