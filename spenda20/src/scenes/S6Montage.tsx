import React from "react";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, interpolate } from "remotion";
import { brand } from "../brand";
import { T } from "../timeline";
import { Caption } from "../components/Caption";
import { Glow, Grain } from "../components/Glow";
import { PdfIcon } from "../components/Icons";
import { Phone, PHONE, SCREEN } from "../components/Phone";
import { SHEET, SuccessSheet } from "../components/SuccessSheet";
import { clamp, easeIn, easeInOut, easeOut, mix, pop, ramp, tapDip, useSceneTime } from "../components/motion";
import { HomeScreen, PhoneSuccess, SecurityScreen, StatementScreen } from "../screens/Screens";

const S = T.s6;
const C = brand.colors;

const RIGHT_X = 1180;
const LEFT_X = 740;

type Pose = { x: number; y: number; rx: number; ry: number; rz: number; scale: number; opacity: number };

// Phone choreography for the whole montage.
const poseAt = (t: number): Pose => {
  const float = Math.sin(t * 1.3);
  const land = pop(t, S.intro[0], { damping: 15, stiffness: 120 });
  let x = RIGHT_X;
  let y = mix(540 + 950, 540, land) + 6 * float;
  const rx = mix(28, 4, land);
  let ry = mix(-50, -16, land) + 2.5 * Math.sin(t * 1.1);
  let rz = mix(8, 0, land);
  let scale = 1;

  // Fast flip with the back visible mid-turn
  const f = ramp(t, [S.flip[0], S.flip[1]], easeInOut);
  ry += f * 390;
  x = mix(x, LEFT_X, f);
  scale *= 1 - 0.1 * Math.sin(f * Math.PI);

  // 3D slide back to the right
  const s = pop(t, S.slide[0], { damping: 14, stiffness: 150 });
  const sLin = ramp(t, [S.slide[0], S.slide[1]]);
  x = mix(x, RIGHT_X, s);
  ry += mix(0, -30, s) - 28 * Math.sin(sLin * Math.PI);
  rz += 3 * Math.sin(sLin * Math.PI);

  // Zoom back into darkness
  const z = ramp(t, [S.zoomOut[0], S.zoomOut[1]], easeIn);
  scale *= mix(1, 0.18, z);
  y += mix(0, -40, z);
  return { x, y, rx, ry, rz, scale, opacity: 1 - ramp(t, [S.zoomOut[1] - 0.1, S.zoomOut[1]]) };
};

const ScreenContent: React.FC<{ t: number }> = ({ t }) => {
  const toHome = ramp(t, [S.intro[1] - 0.06, S.homeBuild + 0.04]);
  const flipMid = (S.flip[0] + S.flip[1]) / 2;
  const slide = ramp(t, [S.slide[0], S.slide[1] - 0.05], easeOut);

  const pulse = t > S.downloadTap - 0.35 && t < S.downloadTap ? 1 + 0.045 * Math.sin(((t - (S.downloadTap - 0.35)) / 0.35) * Math.PI * 2) ** 2 : 1;
  const dark = ramp(t, [S.darkToggle + 0.06, S.darkToggle + 0.36], easeInOut);
  const lockOpen = 1 - pop(t, S.lockSnap, { damping: 10, stiffness: 320 });

  if (t < flipMid) {
    return (
      <>
        {toHome < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - toHome }}>
            <PhoneSuccess />
          </div>
        )}
        {toHome > 0 && <HomeScreen t={t} start={S.homeBuild} />}
      </>
    );
  }
  if (t < S.slide[0]) {
    return <StatementScreen t={t} start={S.statementBuild} pulse={pulse} tap={tapDip(t, S.downloadTap, 0.05)} />;
  }
  return (
    <>
      {slide < 1 && (
        <div style={{ position: "absolute", inset: 0, translate: `${-SCREEN.w * slide}px 0` }}>
          <StatementScreen t={t} start={S.statementBuild} pulse={1} tap={1} />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, translate: `${SCREEN.w * (1 - slide)}px 0` }}>
        <SecurityScreen
          t={t}
          start={S.securityBuild}
          dark={dark}
          darkOn={ramp(t, [S.darkToggle, S.darkToggle + 0.15])}
          tfaOn={ramp(t, [S.tfaToggle, S.tfaToggle + 0.15])}
          lockOpen={t < S.lockSnap ? 1 : lockOpen}
        />
      </div>
    </>
  );
};

// The phone reads its own frame so CameraMotionBlur can sample it at sub-frames.
const PhoneRig: React.FC = () => {
  const t = useSceneTime(S.start);
  const p = poseAt(t);
  return (
    <AbsoluteFill style={{ opacity: p.opacity }}>
      <Phone x={p.x} y={p.y} rx={p.rx} ry={p.ry} rz={p.rz} scale={p.scale}>
        <ScreenContent t={t} />
      </Phone>
    </AbsoluteFill>
  );
};

const inWindow = (t: number, w: readonly [number, number], pad = 0.03) => t >= w[0] - pad && t <= w[1] + pad;

export const S6Montage: React.FC = () => {
  const t = useSceneTime(S.start);
  const pose = poseAt(t);
  const fast = inWindow(t, S.flip) || inWindow(t, S.slide) || inWindow(t, [S.intro[0], S.intro[0] + 0.3]);

  // Success sheet frame shrinking into the phone screen
  const shrink = ramp(t, [S.intro[0], S.intro[1] - 0.06], easeInOut);
  const screenTop = 540 - PHONE.h / 2 + PHONE.bezel;
  const clipL = mix(0, RIGHT_X - SCREEN.w / 2, shrink);
  const clipR = mix(0, 1920 - (RIGHT_X + SCREEN.w / 2), shrink);
  const clipT = mix(0, screenTop, shrink);
  const clipB = mix(0, 1080 - (screenTop + SCREEN.h), shrink);
  const sheetScale = mix(1, SCREEN.w / SHEET.w, shrink);
  const sheetCx = mix(960, RIGHT_X, shrink);
  const sheetBottom = mix(1080, screenTop + SCREEN.h, shrink);
  const flatOut = 1 - ramp(t, [S.intro[1] - 0.14, S.intro[1] - 0.02]);

  // PDF flying out of the phone
  const pdf = ramp(t, [S.pdfFly[0], S.pdfFly[1]], easeOut);
  const pdfOut = 1 - ramp(t, [S.slide[0] - 0.15, S.slide[0]]);
  const pdfX = interpolate(pdf, [0, 1], [LEFT_X, 1060], clamp);
  const pdfY = interpolate(pdf, [0, 0.5, 1], [850, 460, 330], clamp);

  const phone = <PhoneRig />;

  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Glow t={t} x={pose.x} y={540} strength={pose.opacity} />
      {fast ? (
        <CameraMotionBlur samples={10} shutterAngle={200}>
          {phone}
        </CameraMotionBlur>
      ) : (
        phone
      )}

      {t >= S.pdfFly[0] && (
        <div
          style={{
            position: "absolute",
            left: pdfX - 45,
            top: pdfY - 60,
            scale: String(mix(0.5, 1.8, pdf)),
            rotate: `${mix(-30, 8, pdf)}deg`,
            opacity: Math.min(1, pdf * 4) * pdfOut,
            filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.5)) blur(${mix(6, 0, pdf)}px)`,
          }}
        >
          <PdfIcon size={90} />
        </div>
      )}

      <Caption text={brand.copy.captions.home} t={t} start={S.homeCaption} end={S.flip[0]} side="left" />
      <Caption text={brand.copy.captions.statement} t={t} start={S.statementCaption} end={S.slide[0]} side="right" />
      <Caption text={brand.copy.captions.security} t={t} start={S.securityCaption} end={S.zoomOut[0]} side="left" />

      {flatOut > 0 && (
        <AbsoluteFill
          style={{
            clipPath: `inset(${clipT}px ${clipR}px ${clipB}px ${clipL}px round ${mix(0, SCREEN.r, shrink)}px)`,
            background: C.sheetBackdrop,
            opacity: flatOut,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: sheetCx - SHEET.w / 2,
              top: sheetBottom - SHEET.h,
              width: SHEET.w,
              height: SHEET.h,
              transformOrigin: "50% 100%",
              scale: String(sheetScale),
            }}
          >
            <SuccessSheet ring={1} check={1} textP={1} />
          </div>
        </AbsoluteFill>
      )}
      <Grain t={t} />
    </AbsoluteFill>
  );
};
