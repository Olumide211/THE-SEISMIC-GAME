import * as THREE from 'three';
import {Ctx, Shot} from '../engine/shot';
import {backOut, clamp01, easeInOut, easeOut, expoInOut, expoOut, lerp, lerpV, makeDecal, makeHaze, makeSlab, prog, setCam, Slab, smooth, V3} from '../engine/kit';
import {ANCHOR} from './screens';
import {Phone, PHONE_W} from './phone';
import cam0 from '../../cloth/race_cam.json';

const SCALE = (PHONE_W - 0.044) / 860; // world units per CSS px on the glass
const P2P_X = -0.62;
const SP_X = 0.62;

type CamKey = [number, V3, V3, number, ((x: number) => number)?];

/* 0.0-3.5 follows cloth/race_cam.json exactly (smoothstep), matching the Blender plates. */
const CLOTH_KEYS: CamKey[] = (cam0.keys as [number, V3, V3][]).map(([t, p, a]) => [t, p, a, 0, smooth]);

const KEYS: CamKey[] = [
  ...CLOTH_KEYS,
  // START: both phones, slow drift while the thumbs tap
  [4.5, [0.0, 0.28, 6.3], [0.0, 0.0, 0.0], -4, easeInOut],
  // P2P PAIN: push into the left phone, Spenda falls out of focus
  [5.3, [-1.2, 0.42, 2.9], [P2P_X, 0.05, 0.0], -10, easeInOut],
  [8.95, [-1.0, 0.18, 2.2], [P2P_X, -0.05, 0.0], -13, (x) => x],
  // whip pan to Spenda
  [9.25, [1.2, 0.72, 1.8], [SP_X, 0.35, 0.0], 10, expoInOut],
  // SPENDA macro dolly across its screens
  [10.4, [1.08, 0.3, 1.9], [SP_X, 0.12, 0.0], 8, easeInOut],
  [11.6, [0.12, 0.42, 1.95], [SP_X, 0.25, 0.0], -6, easeInOut],
  [13.4, [0.22, -0.3, 1.7], [SP_X, -0.48, 0.0], -8, easeInOut],
  [14.8, [0.32, -0.45, 1.42], [SP_X, -0.58, 0.05], -9, easeOut],
  // CREDIT ALERT: camera rises as the phone flips to its lock screen
  [15.4, [0.98, 0.2, 3.3], [SP_X, 0.1, 0.0], -4, expoOut],
  [17.45, [0.88, 1.0, 3.0], [SP_X, 0.35, 0.0], 6, easeInOut],
  // BONUS FLEX
  [17.9, [0.38, 0.5, 2.7], [SP_X, 0.15, 0.0], -7, easeInOut],
  [20.8, [0.34, 0.8, 2.55], [SP_X, 0.45, 0.0], -9, easeInOut],
  // CUT BACK: wide on both
  [21.7, [0.15, 0.4, 6.0], [0.0, 0.0, 0.0], -9, easeInOut],
  [24.0, [-0.1, 0.35, 6.3], [0.0, 0.0, 0.0], -8, (x) => x],
  // STACK + hero drift
  [25.6, [0.0, 0.2, 4.6], [0.0, 0.0, 0.0], -3, easeInOut],
  [27.0, [0.0, 0.15, 4.3], [0.0, 0.02, 0.0], -1.5, (x) => x],
  [30.0, [0.0, 0.1, 4.05], [0.0, 0.02, 0.0], 0, (x) => x],
];

function camAt(t: number) {
  if (t <= KEYS[0][0]) return {pos: KEYS[0][1], tgt: KEYS[0][2], roll: KEYS[0][3]};
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [t0, p0, a0, r0] = KEYS[i];
    const [t1, p1, a1, r1, e] = KEYS[i + 1];
    if (t <= t1) {
      const k = (e ?? easeInOut)(clamp01((t - t0) / (t1 - t0)));
      return {pos: lerpV(p0, p1, k), tgt: lerpV(a0, a1, k), roll: lerp(r0, r1, k)};
    }
  }
  const l = KEYS[KEYS.length - 1];
  return {pos: l[1], tgt: l[2], roll: l[3]};
}

/** [time, texture] schedule -> (current, next, crossfade k) */
function sched(t: number, s: [number, string, number?][], fade = 0.12): [string, string | null, number] {
  let i = 0;
  while (i < s.length - 1 && t >= s[i + 1][0]) i++;
  const cur = s[i][1];
  const next = s[i + 1];
  const f = next?.[2] ?? fade;
  if (next && t > next[0] - f) return [cur, next[1], smooth(prog(t, next[0] - f, next[0]))];
  return [cur, null, 0];
}

const P2P_SCREENS: [number, string][] = [
  [0, 'p2p_sell'],
  [4.55, 'p2p_vendors'],
  [5.4, 'p2p_chat'],
  [6.3, 'p2p_timer'],
  [7.3, 'p2p_offline'],
  [8.1, 'p2p_pending'],
  [21.0, 'p2p_stuck'],
];
const SP_SCREENS: [number, string, number?][] = [
  [0, 'sp_splash'],
  [3.85, 'sp_sell'],
  [9.2, 'sp_deposit'],
  [10.4, 'sp_received'],
  [11.6, 'sp_convert'],
  [15.28, 'sp_lock', 0.02], // swapped while the phone is edge-on mid-flip
  [17.65, 'sp_bills'],
  [21.1, 'sp_sent'],
];
const P2P_FAILS = [5.4, 6.3, 7.3, 8.1];

export class RaceShot extends Shot {
  p2p: Phone;
  sp: Phone;
  btn: Slab;
  notif: Slab;
  chips: Slab[] = [];
  label: THREE.Mesh;
  hazeRed: THREE.Mesh;
  hazeWhite: THREE.Mesh;
  hazeGreen: THREE.Mesh;
  greenSweep: THREE.Mesh;

  constructor(ctx: Ctx) {
    super(ctx);
    const T = ctx.tex;
    this.p2p = new Phone(T.p2p_sell);
    this.sp = new Phone(T.sp_splash);
    this.p2p.group.position.x = P2P_X;
    this.sp.group.position.x = SP_X;
    this.scene.add(this.p2p.group, this.sp.group);

    // Withdraw button: its own slab sitting in the slot on the convert screen
    const bw = ANCHOR.withdrawBtn.w * SCALE,
      bh = ANCHOR.withdrawBtn.h * SCALE;
    this.btn = makeSlab({w: bw, h: bh, depth: 0.03, radius: bh * 0.24, bevel: 0.008, tex: T.sp_withdraw, glow: 1.35});
    this.sp.slab.add(this.btn);

    // bank notification
    const nw = ANCHOR.notif.w * SCALE,
      nh = ANCHOR.notif.h * SCALE;
    this.notif = makeSlab({w: nw, h: nh, depth: 0.03, radius: nh * 0.19, bevel: 0.008, tex: T.notif, glow: 1.5});
    this.sp.slab.add(this.notif);

    // green chips
    for (const [id, cw] of [
      ['chip_airtime', 560],
      ['chip_power', 700],
    ] as [string, number][]) {
      const h = 104 * SCALE;
      const c = makeSlab({w: cw * SCALE, h, depth: 0.025, radius: h / 2, bevel: 0.007, tex: T[id], glow: 1.4});
      this.sp.slab.add(c);
      this.chips.push(c);
    }

    // small grey "P2P" label above the left phone
    this.label = makeDecal(T.p2p_label, 0.4, 0.12, 1.1);
    this.label.position.set(0, 1.22, 0.05);
    this.p2p.group.add(this.label);

    // mood lights: red behind P2P, cool white behind Spenda, green for the money moment
    this.hazeRed = makeHaze(4.5, 0.0, 0xe5484d);
    this.hazeRed.position.set(P2P_X - 0.2, 0.3, -1.6);
    this.hazeWhite = makeHaze(5.5, 0.0, 0xdfe8ff);
    this.hazeWhite.position.set(SP_X + 0.2, 0.4, -1.8);
    this.hazeGreen = makeHaze(4.0, 0.0, 0x22c55e);
    this.hazeGreen.position.set(SP_X, 0.6, -1.2);
    const ambient = makeHaze(10, 0.035);
    ambient.position.set(0, 0.6, -3.5);
    this.scene.add(this.hazeRed, this.hazeWhite, this.hazeGreen, ambient);

    // green light sweeping the bevel at the credit alert
    const gc = document.createElement('canvas');
    gc.width = 256;
    gc.height = 8;
    const g = gc.getContext('2d')!;
    const gr = g.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(0.5, 'rgba(255,255,255,1)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 8);
    this.greenSweep = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.012),
      new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(0.4, 2.6, 0.9)}),
    );
    this.sp.slab.add(this.greenSweep);
  }

  update(t: number) {
    const T = this.ctx.tex;
    const c = camAt(t);
    setCam(this.camera, c.pos, c.tgt, c.roll, 39.6);

    /* ---------------- phones: placement */
    const sink = easeInOut(prog(t, 24.0, 25.6));
    const toward = t < 24 ? 1 : 1 - sink;
    this.p2p.group.position.set(P2P_X, -3.4 * sink, -0.6 * sink);
    this.p2p.group.rotation.set(0.06 * sink, 0.1 * toward, 0);
    this.p2p.group.visible = sink < 0.995;
    const hero = easeInOut(prog(t, 24.0, 26.2));
    this.sp.group.position.set(lerp(SP_X, 0, hero), 0, 0);
    this.sp.group.scale.setScalar(lerp(1, 1.12, hero));
    // flip to the lock screen (full spin, screen swaps while edge-on)
    const flip = expoInOut(prog(t, 14.95, 15.55));
    this.sp.group.rotation.set(0, -0.1 * toward + flip * Math.PI * 2, 0);
    // taps: phones dip slightly
    const dip = (t0: number) => Math.exp(-Math.max(0, t - t0) * 14) * (t >= t0 ? 1 : 0) * Math.sin(Math.min(1, (t - t0) * 20) * Math.PI);
    this.p2p.group.position.z += -0.03 * dip(3.8);
    this.sp.slab.position.z = -0.03 * (dip(3.8) + dip(13.4) + dip(18.2) + dip(19.4));

    /* ---------------- P2P screen */
    const [pa, pb, pk] = sched(t, P2P_SCREENS, 0.08);
    const pain = smooth(prog(t, 4.5, 4.9)) * (1 - smooth(prog(t, 9.0, 9.4)));
    const stuck = smooth(prog(t, 21.0, 21.6));
    const p2pGain = (t < 3.3 ? 0.0 : smooth(prog(t, 3.0, 3.6))) * (1 - 0.45 * stuck) * (1 - sink);
    this.p2p.show(T[pa], pb ? T[pb] : null, pk, p2pGain);
    let flash = 0;
    for (const f of P2P_FAILS) flash = Math.max(flash, t >= f ? Math.exp(-(t - f) * 9) : 0);
    const timerOn = t >= 6.3 && t < 7.3;
    const secs = 39 * 60 + 58 - Math.floor(Math.max(0, t - 6.3));
    this.p2p.drawFx({
      t,
      timer: timerOn ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : null,
      timerXY: [ANCHOR.timer.x, ANCHOR.timer.y],
      timerSize: ANCHOR.timer.size,
      spinner: t >= 8.1 && t < 21.0 ? [ANCHOR.spinner.x, ANCHOR.spinner.y, ANCHOR.spinner.r] : null,
      ripples: [{x: ANCHOR.sellBtn.x, y: ANCHOR.sellBtn.y, t0: 3.8}],
      crack: stuck,
      redFlash: flash * pain,
    });
    this.label.visible = t > 2.9 && t < 24.5;
    (this.label.material as THREE.MeshBasicMaterial).opacity = smooth(prog(t, 3.0, 3.5)) * (1 - smooth(prog(t, 4.6, 5.0)) + smooth(prog(t, 21.2, 21.8))) * (1 - sink);

    /* ---------------- Spenda screen */
    const [sa, sb, sk] = sched(t, SP_SCREENS, 0.12);
    const splashGlow = t < 3.85 ? lerp(2.6, 1.4, smooth(prog(t, 3.2, 3.85))) : 1;
    const dimEnd = 1 - 0.35 * smooth(prog(t, 27.0, 27.8));
    const spGain = (t < 3.0 ? smooth(prog(t, 2.75, 3.15)) : 1) * splashGlow * (t >= 21.1 ? 1.15 : 1) * dimEnd;
    this.sp.show(T[sa], sb ? T[sb] : null, sk, spGain);
    this.sp.drawFx({
      t,
      ripples: [
        {x: ANCHOR.sellBtn.x, y: ANCHOR.sellBtn.y, t0: 3.8},
        {x: ANCHOR.withdrawBtn.x, y: ANCHOR.withdrawBtn.y, t0: 13.4},
        {x: ANCHOR.airtime.x, y: ANCHOR.airtime.y, t0: 18.2},
        {x: ANCHOR.electricity.x, y: ANCHOR.electricity.y, t0: 19.4},
      ],
    });

    // Withdraw button: in its slot from 11.6, lifts out on the tap and flares white
    const btnHome = this.sp.local(ANCHOR.withdrawBtn.x, ANCHOR.withdrawBtn.y);
    const lift = backOut(prog(t, 13.45, 13.8), 2.2);
    const settle = easeOut(prog(t, 13.8, 14.9));
    this.btn.visible = t > 11.5 && t < 15.25;
    this.btn.position.set(btnHome.x, btnHome.y, btnHome.z - 0.01 + 0.13 * lift - 0.03 * settle);
    this.btn.rotation.set(0.25 * lift - 0.1 * settle, 0, 0);
    const bflare = t < 13.45 ? 0 : expoOut(prog(t, 13.45, 13.52)) * Math.exp(-Math.max(0, t - 13.7) * 2.2);
    this.btn.screenMat.emissiveIntensity = (1.35 + 5.0 * bflare) * smooth(prog(t, 11.5, 11.75));

    // credit alert drops in with a bounce
    const nHome = this.sp.local(ANCHOR.notif.x, ANCHOR.notif.y);
    const drop = prog(t, 15.45, 15.95);
    const bounce = drop < 1 ? 1 - Math.abs(Math.cos(drop * Math.PI * 2.5)) * Math.pow(1 - drop, 2) : 1;
    const out = smooth(prog(t, 17.5, 17.8));
    this.notif.visible = t > 15.4 && t < 17.85;
    this.notif.position.set(nHome.x, nHome.y + (1 - bounce) * 0.9 + 0.6 * out, nHome.z + 0.1 + 0.06 * Math.sin(Math.PI * drop));
    this.notif.scale.setScalar(lerp(0.85, 1, easeOut(drop)) * (1 - 0.3 * out));
    const nGlow = Math.exp(-Math.max(0, t - 15.5) * 3) * (t > 15.5 ? 1 : 0);
    this.notif.screenMat.emissiveIntensity = (1.5 + 2.2 * nGlow) * (1 - out);
    // green sweep along the right bevel, top to bottom
    const sw = prog(t, 15.5, 16.3);
    this.greenSweep.visible = sw > 0 && sw < 1;
    this.greenSweep.rotation.z = Math.PI / 2;
    this.greenSweep.position.set(this.sp.slab.sw / 2 + 0.012, lerp(1.0, -1.0, easeInOut(sw)), this.sp.slab.frontZ - 0.004);
    (this.greenSweep.material as THREE.MeshBasicMaterial).opacity = Math.sin(Math.PI * sw);

    // chips fly up from their tiles and stack above the phone
    const chipFrom = [ANCHOR.airtime, ANCHOR.electricity];
    const chipT = [18.3, 19.5];
    this.chips.forEach((ch, i) => {
      const k = easeOut(prog(t, chipT[i], chipT[i] + 0.55));
      const from = this.sp.local(chipFrom[i].x, chipFrom[i].y);
      const stackY = 0.6 + (i === 0 && t > chipT[1] ? 0.16 * easeOut(prog(t, chipT[1], chipT[1] + 0.4)) : 0);
      const fade = 1 - smooth(prog(t, 21.0, 21.4));
      ch.visible = t > chipT[i] && fade > 0;
      ch.position.set(lerp(from.x, 0, k), lerp(from.y, stackY, k), from.z + 0.05 + 0.25 * Math.sin(Math.PI * k) + 0.12 * k);
      ch.rotation.set(0.3 * (1 - k), 0, (i ? -0.25 : 0.25) * (1 - k));
      ch.scale.setScalar(lerp(0.3, 1, backOut(clamp01(k * 1.15), 1.4)) * fade);
      const pop = t > chipT[i] + 0.45 ? Math.exp(-(t - chipT[i] - 0.45) * 5) : 0;
      ch.screenMat.emissiveIntensity = 1.4 + 1.8 * pop;
    });

    /* ---------------- light */
    const coolSp = smooth(prog(t, 9.0, 9.6));
    (this.hazeRed.material as THREE.MeshBasicMaterial).color.setRGB(0.9, 0.12, 0.13).multiplyScalar((0.05 + 0.1 * flash) * pain + 0.05 * stuck * (1 - sink));
    (this.hazeWhite.material as THREE.MeshBasicMaterial).color.setRGB(0.85, 0.9, 1.0).multiplyScalar(0.06 * coolSp * (1 - 0.5 * smooth(prog(t, 27, 28))));
    const money = Math.exp(-Math.max(0, t - 15.5) * 1.6) * (t > 15.5 ? 1 : 0);
    (this.hazeGreen.material as THREE.MeshBasicMaterial).color.setRGB(0.13, 0.77, 0.37).multiplyScalar(0.12 * money);
    this.p2p.sheenAt(0.3 + c.pos[0] * 0.15 + t * 0.01);
    this.sp.sheenAt(-0.2 + c.pos[0] * 0.15 + t * 0.012);
    this.scene.environmentRotation.set(0, -0.6 + 0.04 * t, 0);
    this.scene.environmentIntensity = 0.35 + 0.65 * smooth(prog(t, 0.5, 3.0));
  }

  dof(t: number) {
    const c = camAt(t);
    const d = (p: V3) => Math.hypot(c.pos[0] - p[0], c.pos[1] - p[1], c.pos[2] - p[2]);
    const focus = d(c.tgt);
    const defocus = smooth(prog(t, 27.0, 27.7));
    return {
      focus: lerp(focus, focus * 0.55, defocus),
      aperture: lerp(t > 4.6 && t < 21 ? (t < 9 ? 5 : 7) : 3.5, 18, defocus),
      maxCoc: lerp(26, 42, defocus),
    };
  }

  grade(t: number) {
    const defocus = smooth(prog(t, 27.0, 27.7));
    const money = Math.exp(-Math.max(0, t - 15.5) * 3) * (t > 15.5 ? 1 : 0);
    return {exposure: 1.05 * (1 - 0.3 * defocus), bloom: 0.6 + 0.6 * money + 0.3 * defocus, vignette: 0.85 + 0.15 * defocus};
  }

  minSamples(t: number) {
    // fast object motion: flip, notif drop, chips, button lift
    if ((t > 14.9 && t < 16.0) || (t > 18.2 && t < 20.1) || (t > 13.4 && t < 13.9)) return 4;
    return 1;
  }

  shutter(t: number) {
    return t > 8.9 && t < 9.35 ? 1.2 : 0.6;
  }
}
