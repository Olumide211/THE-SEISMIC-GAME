import * as THREE from 'three';
import {Ctx, Shot} from '../engine/shot';
import {addEdgeGlint, cssToLocal, easeInOut, easeOut, expoOut, keys, lerp, makeHaze, makeSlab, prog, rig, setCam, Slab, smooth} from '../engine/kit';
import {PHONE_BALANCE} from '../ui/screens';

const PW = 1.0;
const PH = (1860 / 860) * PW;

/* Shots 12-15 (17.5-22.5s), plus the blurred plate under the logo sting:
   edge-on layers slide together into one slab -> camera rises as the phone stands up ->
   front-on hero with the balance ticking -> dim + heavy defocus. */
export class Hero extends Shot {
  rigGroup = new THREE.Group(); // rotates flat -> upright
  body: Slab;
  mid: Slab;
  screen: Slab;
  balance: THREE.Mesh;
  balCanvas: HTMLCanvasElement;
  balTex: THREE.CanvasTexture;
  lastBal = '';
  backdrop: Slab[] = [];

  constructor(ctx: Ctx) {
    super(ctx);
    this.rigGroup.rotation.order = 'YXZ';
    this.scene.add(this.rigGroup);
    // three layers that stack into the phone
    this.body = makeSlab({w: PW, h: PH, depth: 0.06, radius: 0.14, bevel: 0.02, glow: 0});
    this.mid = makeSlab({w: PW * 0.985, h: PH * 0.99, depth: 0.012, radius: 0.135, bevel: 0.006, glow: 0});
    this.screen = makeSlab({w: PW, h: PH, depth: 0.02, radius: 0.14, bevel: 0.012, tex: ctx.tex.phone, glow: 1.35});
    for (const s of [this.body, this.mid, this.screen]) {
      addEdgeGlint(s, 'bottom', 4, 0.8);
      addEdgeGlint(s, 'left', 6, 0.95);
      addEdgeGlint(s, 'right', 1.5, 0.6);
      this.rigGroup.add(s);
    }
    (this.mid.body.material as THREE.MeshPhysicalMaterial).color.set(0x2a2a2a);

    // live balance digits
    this.balCanvas = document.createElement('canvas');
    this.balCanvas.width = 1400;
    this.balCanvas.height = 200;
    this.balTex = new THREE.CanvasTexture(this.balCanvas);
    this.balTex.colorSpace = THREE.SRGBColorSpace;
    this.balTex.anisotropy = 8;
    const bw = (700 / 860) * this.screen.sw;
    this.balance = new THREE.Mesh(
      new THREE.PlaneGeometry(bw, bw / 7),
      new THREE.MeshBasicMaterial({map: this.balTex, transparent: true, depthWrite: false, color: new THREE.Color(1.5, 1.5, 1.5)}),
    );
    const [bx, by] = cssToLocal(this.screen, PHONE_BALANCE.x, PHONE_BALANCE.y, 860, 1860);
    this.balance.position.set(bx, by, this.screen.frontZ + 0.002);
    this.screen.add(this.balance);

    // faint slabs far behind for depth (always defocused)
    const back: [string, number, number, number, number, number][] = [
      ['dashboard', -3.4, 0.9, -4.5, 0.5, 3.2],
      ['assets', 3.6, -0.4, -5.0, -0.45, 3.2],
      ['convert', -2.6, -1.9, -6.0, 0.3, 3.2],
    ];
    for (const [id, x, y, z, ry, w] of back) {
      const s = makeSlab({w, h: id === 'dashboard' ? w * 0.5625 : w * 0.625, depth: 0.1, tex: ctx.tex[id], glow: 0.35});
      s.position.set(x, y, z);
      s.rotation.y = ry;
      this.scene.add(s);
      this.backdrop.push(s);
    }
    const haze = makeHaze(9, 0.06);
    haze.position.set(0.3, 0.8, -2.2);
    this.scene.add(haze);
  }

  drawBalance(v: number) {
    const txt = '₦' + v.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    if (txt === this.lastBal) return;
    this.lastBal = txt;
    const c = this.balCanvas.getContext('2d')!;
    c.clearRect(0, 0, 1400, 200);
    c.fillStyle = '#FFFFFF';
    c.font = `500 ${PHONE_BALANCE.size * 2}px Inter`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    (c as any).letterSpacing = '-3px';
    c.fillText(txt, 700, 104);
    this.balTex.needsUpdate = true;
  }

  /** layer offsets (in the phone's local frame) for the stack beat */
  layers(t: number) {
    const k = easeInOut(prog(t, 17.45, 18.55));
    return {
      body: new THREE.Vector3(lerp(-1.4, 0, k), 0, lerp(-0.34, 0, k)),
      mid: new THREE.Vector3(lerp(1.5, 0, k), lerp(0.2, 0, k), lerp(-0.1, 0.044, k)),
      screen: new THREE.Vector3(lerp(-0.7, 0, k), lerp(-0.25, 0, k), lerp(0.36, 0.062, k)),
    };
  }

  cam(t: number) {
    // world target ~ phone centre once upright
    return rig(t, [
      [17.4, [0.35, -0.12, 0.2], 26, 1.0, 2.5, -14, 28],
      [17.6, [0.15, -0.12, 0.0], 8, 2.0, 2.7, -4, 28, expoOut],
      [18.6, [0.0, -0.1, 0.0], 3, 3.0, 2.8, -3, 28, easeInOut],
      [20.0, [0.0, 0.0, 0.0], 3, 2.0, 4.85, -2, 30, easeInOut],
      [21.8, [0.0, 0.02, 0.0], -3, 1.0, 4.55, 1, 30, (x) => x],
      [25.2, [0.0, 0.05, 0.0], -9, 0.0, 4.25, 3, 30, (x) => x],
    ]);
  }

  update(t: number) {
    const c = this.cam(t);
    // two sub-bass punches at 20.0 / 20.8
    const punch = (t0: number) => (t >= t0 ? Math.exp(-(t - t0) * 9) * Math.sin((t - t0) * 40) : 0);
    const d = 0.05 * (punch(20.0) + punch(20.8));
    setCam(this.camera, [c.pos[0], c.pos[1] + d, c.pos[2] - d * 2], c.tgt, c.roll, c.fov);
    // phone lies flat (edge-on to camera) through the stack, then stands up facing us
    const stand = easeInOut(prog(t, 18.55, 19.95));
    // long edge across frame while flat, unwinding as it stands
    this.rigGroup.rotation.set(lerp(-Math.PI / 2 + 0.03, 0, stand), lerp(Math.PI / 2 - 0.08, 0, stand), 0);
    this.rigGroup.position.set(0, lerp(-0.15, 0, stand), 0);
    const L = this.layers(t);
    this.body.position.copy(L.body);
    this.mid.position.copy(L.mid);
    this.screen.position.copy(L.screen);
    // balance ticks up with the "+₦50,000 received"
    this.drawBalance(Math.round((2450000 + 50000 * easeOut(prog(t, 20.05, 21.6))) / 10) * 10);
    // dim + defocus beat
    const dim = smooth(prog(t, 21.8, 22.5));
    this.screen.screenMat.emissiveIntensity = 1.35 * (1 - 0.55 * dim) * (0.25 + 0.75 * smooth(prog(t, 18.2, 19.3)));
    (this.balance.material as THREE.MeshBasicMaterial).opacity = smooth(prog(t, 18.6, 19.3));
    this.scene.environmentRotation.set(0, -0.8 + 0.9 * prog(t, 17.4, 21.8), 0);
    const backK = smooth(prog(t, 19.0, 20.2));
    for (const b of this.backdrop) {
      b.visible = backK > 0;
      b.screenMat.emissiveIntensity = 0.35 * backK;
    }
    this.scene.environmentIntensity = 0.6 + 0.4 * smooth(prog(t, 18.4, 19.6));
  }

  dof(t: number) {
    const c = this.cam(t);
    const dim = smooth(prog(t, 21.8, 22.5));
    return {
      focus: lerp(c.dist, c.dist * 0.35, dim),
      aperture: keys<number>(t, [[17.4, 7], [18.6, 6], [20.0, 3.0], [21.8, 2.8], [22.5, 22]]),
      maxCoc: lerp(24, 60, dim),
    };
  }

  grade(t: number) {
    const dim = smooth(prog(t, 21.8, 22.5));
    const edgeOn = 1 - 0.55 * smooth(prog(t, 17.45, 17.7)) * (1 - smooth(prog(t, 18.5, 19.4)));
    return {exposure: 1.05 * edgeOn * (1 - 0.6 * dim), bloom: 0.6 + 0.3 * dim, vignette: 0.8 + 0.25 * dim};
  }

  minSamples(t: number) {
    return t > 17.45 && t < 18.6 ? 4 : 1;
  }

  shutter(t: number) {
    return t < 17.6 ? 1.0 : 0.5;
  }
}
