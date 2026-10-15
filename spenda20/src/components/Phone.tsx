import React from "react";
import { SpendaLogo } from "./Logo";

export const PHONE = { w: 418, h: 872, r: 68, bezel: 13, depth: 20 };
export const SCREEN = { w: PHONE.w - PHONE.bezel * 2, h: PHONE.h - PHONE.bezel * 2, r: PHONE.r - PHONE.bezel };

const EDGE_LAYERS = 10;

const Lens: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: s,
      height: s,
      borderRadius: "50%",
      background: "radial-gradient(circle at 40% 35%, #3a3f48 0%, #0b0c10 45%, #000 70%)",
      boxShadow: "0 0 0 5px #1b1c1f, 0 0 0 7px #3a3b3e, inset 0 0 8px rgba(120,140,170,0.35)",
    }}
  />
);

// Sleek black 3D phone. The screen content is rendered at SCREEN size.
export const Phone: React.FC<{
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
  children: React.ReactNode;
}> = ({ x, y, rx = 0, ry = 0, rz = 0, scale = 1, children }) => {
  // Light sweep across the glass follows the Y rotation.
  const sheen = 50 + Math.sin((ry * Math.PI) / 180) * 70;
  return (
    <div
      style={{
        position: "absolute",
        left: x - PHONE.w / 2,
        top: y - PHONE.h / 2,
        width: PHONE.w,
        height: PHONE.h,
        perspective: 2400,
      }}
    >
      <div
        style={{
          position: "relative",
          width: PHONE.w,
          height: PHONE.h,
          transformStyle: "preserve-3d",
          transform: `scale(${scale}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
        }}
      >
        {/* Edge (titanium band) */}
        {new Array(EDGE_LAYERS).fill(0).map((_, i) => {
          const z = -PHONE.depth / 2 + (PHONE.depth * (i + 0.5)) / EDGE_LAYERS;
          const shade = 0.55 + 0.35 * Math.sin((i / EDGE_LAYERS) * Math.PI);
          const c = Math.round(58 * shade);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: PHONE.r,
                transform: `translateZ(${z}px)`,
                background: `rgb(${c}, ${c}, ${c + 4})`,
              }}
            />
          );
        })}

        {/* Front */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: PHONE.r,
            transform: `translateZ(${PHONE.depth / 2}px)`,
            backfaceVisibility: "hidden",
            background: "#050505",
            boxShadow: "inset 0 0 0 2px #4a4a4e, inset 0 0 0 4px #111",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: PHONE.bezel,
              top: PHONE.bezel,
              width: SCREEN.w,
              height: SCREEN.h,
              borderRadius: SCREEN.r,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {children}
            {/* Dynamic island */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: SCREEN.w / 2 - 58,
                width: 116,
                height: 34,
                borderRadius: 17,
                background: "#000",
              }}
            />
            {/* Glass sheen */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(120deg, transparent ${sheen - 22}%, rgba(255,255,255,0.12) ${sheen}%, transparent ${sheen + 18}%)`,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Back */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: PHONE.r,
            transform: `rotateY(180deg) translateZ(${PHONE.depth / 2}px)`,
            backfaceVisibility: "hidden",
            background: "linear-gradient(150deg, #5a5a60 0%, #2a2a2e 50%, #3c3c41 100%)",
            boxShadow: "inset 0 0 0 3px #8a8a90, inset 0 0 40px rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 26,
              top: 26,
              width: 180,
              height: 190,
              borderRadius: 48,
              background: "linear-gradient(150deg, #333336, #1a1a1c)",
              boxShadow: "inset 0 0 0 2px #444, 0 6px 14px rgba(0,0,0,0.5)",
            }}
          >
            <Lens x={22} y={22} s={60} />
            <Lens x={22} y={106} s={60} />
            <Lens x={104} y={64} s={60} />
            <div style={{ position: "absolute", left: 120, top: 26, width: 22, height: 22, borderRadius: 11, background: "#d9d2b8" }} />
          </div>
          <div style={{ position: "absolute", left: PHONE.w / 2 - 40, top: PHONE.h / 2 - 54, opacity: 0.9 }}>
            <SpendaLogo size={80} color="#d0d0d4" />
          </div>
        </div>
      </div>
    </div>
  );
};
