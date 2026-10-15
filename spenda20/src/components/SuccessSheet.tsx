import React from "react";
import { brand } from "../brand";
import { FONT } from "./fonts";
import { SuccessMark } from "./Icons";
import { mix } from "./motion";

const C = brand.colors;

// Spenda's real "Transfer sent" bottom sheet, laid out at 1080 px wide.
// Scale it with CSS to fit anywhere else.
export const SHEET = { w: 1080, h: 760 };

export const SuccessSheet: React.FC<{ ring: number; check: number; textP: number }> = ({ ring, check, textP }) => (
  <div
    style={{
      width: SHEET.w,
      height: SHEET.h,
      background: C.white,
      borderTopLeftRadius: 80,
      borderTopRightRadius: 80,
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: "0 -20px 60px rgba(0,0,0,0.12)",
    }}
  >
    <div style={{ marginTop: 38, width: 84, height: 12, borderRadius: 6, background: "#E8E8E8" }} />
    <div style={{ marginTop: 92 }}>
      <SuccessMark size={210} ring={ring} check={check} />
    </div>
    <div
      style={{
        marginTop: 86,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 72,
        letterSpacing: "-0.03em",
        color: C.black,
        opacity: textP,
        translate: `0 ${mix(14, 0, textP)}px`,
        filter: `blur(${mix(8, 0, textP)}px)`,
      }}
    >
      {brand.copy.success}
    </div>
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: 60,
        right: 60,
        display: "flex",
        gap: 60,
        opacity: textP,
        translate: `0 ${mix(20, 0, textP)}px`,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 146,
          borderRadius: brand.radius.button * 1.5,
          border: `4px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: 40,
          fontWeight: 500,
          color: C.black,
        }}
      >
        {brand.copy.viewReceipt}
      </div>
      <div
        style={{
          flex: 1,
          height: 146,
          borderRadius: brand.radius.button * 1.5,
          background: C.black,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: 40,
          fontWeight: 500,
          color: C.white,
        }}
      >
        {brand.copy.done}
      </div>
    </div>
  </div>
);
