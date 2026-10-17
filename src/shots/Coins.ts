import * as THREE from 'three';
import {Ctx, Shot} from '../engine/shot';
import {addEdgeGlint, backOut, cssToLocal, easeInOut, easeOut, expoOut, keys, lerp, makeHaze, makeSlab, prog, rig, setCam, Slab, smooth, V3} from '../engine/kit';
import {PORTFOLIO_DONUT} from '../ui/screens';

type Chunk = {seg: THREE.Mesh; coin: THREE.Group; arrive: number; start: THREE.Vector3; spin: THREE.Vector3; mid: number};

const COLORS = {USDT: new THREE.Color('#22C55E'), USDC: new THREE.Color('#86EFAC'), NGN: new THREE.Color('#E8E8E8')};

/* Shot 9 (12.4-14.8s): extruded green coins tumble in from the right and snap into
   the donut on the vertical Portfolio card (60% USDT / 25% USDC / 15% NGN). */
export class Coins extends Shot {
  card: Slab;
  chunks: Chunk[] = [];
  donut = new THREE.Group();
  hub: THREE.Mesh;

  constructor(ctx: Ctx) {
    super(ctx);
    this.card = makeSlab({w: 1.52, h: 2.12, depth: 0.09, radius: 0.08, bevel: 0.018, tex: ctx.tex.portfolio, glow: 1.35});
    addEdgeGlint(this.card, 'left', 3.2, 0.9);
    addEdgeGlint(this.card, 'right', 2.0, 0.7, 0.1);
    this.card.rotation.set(0.05, -0.2, 0.0);
    this.scene.add(this.card);
    const [cx, cy] = cssToLocal(this.card, PORTFOLIO_DONUT.cx, PORTFOLIO_DONUT.cy, 760, 1060);
    this.donut.position.set(cx, cy, this.card.frontZ);
    this.card.add(this.donut);
    const R = (PORTFOLIO_DONUT.r / 760) * this.card.sw;
    const r = R * 0.72;
    // dark hub disc
    this.hub = new THREE.Mesh(new THREE.CircleGeometry(r * 0.94, 64), new THREE.MeshStandardMaterial({color: 0x141414, roughness: 0.4, metalness: 0.3}));
    this.hub.position.z = 0.002;
    this.donut.add(this.hub);

    // 60/25/15 split into coin-sized chunks
    const plan: [keyof typeof COLORS, number][] = [
      ...Array(6).fill(['USDT', 0.1]),
      ...Array(3).fill(['USDC', 0.25 / 3]),
      ...Array(2).fill(['NGN', 0.075]),
    ];
    const coinGeo = coinGeometry(0.09, 0.024);
    const faceT = new THREE.MeshStandardMaterial({map: ctx.tex.coin_usdt, emissiveMap: ctx.tex.coin_usdt, emissive: 0xffffff, emissiveIntensity: 0.35, metalness: 0.6, roughness: 0.25, transparent: true});
    const faceC = new THREE.MeshStandardMaterial({map: ctx.tex.coin_usdc, emissiveMap: ctx.tex.coin_usdc, emissive: 0xffffff, emissiveIntensity: 0.35, metalness: 0.6, roughness: 0.25, transparent: true});
    let a0 = Math.PI / 2; // start at 12 o'clock, clockwise
    const gap = 0.025;
    plan.forEach(([sym, frac], i) => {
      const a1 = a0 - frac * Math.PI * 2;
      const seg = new THREE.Mesh(
        annularSector(r, R, a1 + gap / 2, a0 - gap / 2, 0.06),
        new THREE.MeshPhysicalMaterial({
          color: COLORS[sym].clone().lerp(new THREE.Color(0xffffff), 0.25).multiplyScalar(0.55),
          emissive: COLORS[sym],
          emissiveIntensity: 0.18,
          metalness: 0.5,
          roughness: 0.25,
          clearcoat: 1,
        }),
      );
      const mid = (a0 + a1) / 2;
      this.donut.add(seg);
      const coin = new THREE.Group();
      const rimMat = new THREE.MeshPhysicalMaterial({color: COLORS[sym], metalness: 0.9, roughness: 0.2, emissive: COLORS[sym], emissiveIntensity: 0.15, clearcoat: 1});
      const body = new THREE.Mesh(coinGeo, rimMat);
      body.rotation.x = Math.PI / 2;
      coin.add(body);
      const face = sym === 'USDC' ? faceC : sym === 'USDT' ? faceT : null;
      if (face) {
        for (const s of [1, -1]) {
          const f = new THREE.Mesh(new THREE.CircleGeometry(0.082, 48), face);
          f.position.z = s * 0.0125;
          if (s < 0) f.rotation.y = Math.PI;
          coin.add(f);
        }
      }
      this.scene.add(coin);
      const arrive = 13.25 + i * 0.1;
      this.chunks.push({
        seg,
        coin,
        arrive,
        mid,
        start: new THREE.Vector3(3.2 + (i % 3) * 0.5, 0.9 - (i % 4) * 0.45, 0.6 + (i % 2) * 0.5),
        spin: new THREE.Vector3(3 + (i % 3), 5 + (i % 2) * 2, 2 + (i % 4)),
      });
      a0 = a1;
    });
    const haze = makeHaze(7, 0.05);
    haze.position.set(0.4, 0.6, -2);
    this.scene.add(haze);
  }

  cam(t: number) {
    return rig(t, [
      [12.25, [0.7, 0.2, 0], -30, 4, 3.2, -14, 34],
      [12.6, [0.2, 0.08, 0], -16, 3, 3.5, -6, 34, expoOut],
      [14.75, [0.0, 0.0, 0], -8, 2, 3.8, -3, 34, easeInOut],
      [15.0, [-0.6, -0.3, 0], -2, -10, 3.9, -12, 34, (x) => x * x],
    ]);
  }

  update(t: number) {
    const c = this.cam(t);
    setCam(this.camera, c.pos, c.tgt, c.roll, c.fov);
    this.card.updateMatrixWorld();
    for (const ch of this.chunks) {
      const fly = prog(t, ch.arrive - 0.9, ch.arrive);
      const k = easeOut(fly);
      // slot position in world
      const slot = this.donut.localToWorld(new THREE.Vector3(Math.cos(ch.mid) * 0.3, Math.sin(ch.mid) * 0.3, 0.08));
      const p = ch.start.clone().lerp(slot, k);
      p.y += Math.sin(k * Math.PI) * 0.35;
      ch.coin.position.copy(p);
      ch.coin.rotation.set(ch.spin.x * (1 - k) * 2.2, ch.spin.y * (1 - k) * 2.2, ch.spin.z * (1 - k));
      const snap = prog(t, ch.arrive - 0.04, ch.arrive + 0.08);
      ch.coin.scale.setScalar((1 - smooth(snap)) * (fly > 0 ? 1 : 0) + 1e-4);
      ch.coin.visible = fly > 0 && snap < 1;
      const pop = backOut(prog(t, ch.arrive - 0.02, ch.arrive + 0.22), 2.6);
      ch.seg.scale.setScalar(Math.max(1e-4, pop));
      ch.seg.position.z = (1 - pop) * 0.15;
      const flash = Math.exp(-Math.max(0, t - ch.arrive) * 7) * (t > ch.arrive ? 1 : 0);
      (ch.seg.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.18 + 2.0 * flash;
    }
    this.scene.environmentRotation.set(0, 0.4 - 0.5 * prog(t, 12.3, 15), 0);
  }

  dof(t: number) {
    return {focus: this.cam(t).dist, aperture: 4.5, maxCoc: 22};
  }

  minSamples(t: number) {
    return t > 12.4 && t < 14.4 ? 5 : 1;
  }

  shutter(t: number) {
    return t < 12.6 || t > 14.8 ? 1.0 : 0.6;
  }

  grade() {
    return {exposure: 1.05, bloom: 0.6};
  }
}

/** flat annular sector (donut slice) extruded toward +z */
function annularSector(r: number, R: number, a0: number, a1: number, depth: number) {
  const s = new THREE.Shape();
  s.absarc(0, 0, R, a0, a1, false);
  s.absarc(0, 0, r, a1, a0, true);
  const g = new THREE.ExtrudeGeometry(s, {depth, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 3, curveSegments: 24});
  return g;
}

function coinGeometry(radius: number, thick: number) {
  // reeded edge: a short cylinder with a slight bevel
  const pts: THREE.Vector2[] = [];
  pts.push(new THREE.Vector2(0, -thick / 2));
  pts.push(new THREE.Vector2(radius - 0.006, -thick / 2));
  pts.push(new THREE.Vector2(radius, -thick / 2 + 0.006));
  pts.push(new THREE.Vector2(radius, thick / 2 - 0.006));
  pts.push(new THREE.Vector2(radius - 0.006, thick / 2));
  pts.push(new THREE.Vector2(0, thick / 2));
  return new THREE.LatheGeometry(pts, 64);
}
