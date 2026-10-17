import * as THREE from 'three';
import {Post} from './post';
import {BASE_GRADE, Ctx, Grade, Shot} from './shot';
import {FPS, prog, smooth} from './kit';

export type Segment = {shot: Shot; a: number; b: number};

/* Cloth plates (Blender) cover 0-2.9s: main pass alone, then the holdout pass
   (slab cut out) over the first 3D shot while the satin sweeps past the lens. */
export const PLATE_LAST = 88;
export const HOLD_FIRST = 72;
export const plateFor = (t: number) => {
  const f = Math.round(t * FPS) + 1;
  if (f > PLATE_LAST) return null;
  return f >= HOLD_FIRST ? {kind: 'hold' as const, frame: f} : {kind: 'main' as const, frame: f};
};

export class Director {
  post: Post;
  segs: Segment[];
  tmpA = new THREE.Matrix4();
  constructor(public ctx: Ctx, segs: Segment[], w: number, h: number) {
    this.post = new Post(ctx.renderer, w, h);
    this.segs = segs;
  }

  active(t: number) {
    return this.segs.filter((s) => t >= s.a && t < s.b);
  }

  /** projected screen motion (px per frame) of points at the focus plane -> subframe count */
  samplesFor(shot: Shot, t: number) {
    const sh = shot.shutter(t);
    const dt = 0.5 / FPS;
    const pts: THREE.Vector3[] = [];
    shot.update(t - dt);
    const cam = shot.camera;
    const f = shot.dof(t)?.focus ?? 2;
    for (const [x, y] of [
      [0, 0],
      [-0.7, -0.7],
      [0.7, 0.7],
      [0.7, -0.7],
      [-0.7, 0.7],
    ]) {
      const p = new THREE.Vector3(x, y, 0.5).unproject(cam).sub(cam.position).normalize().multiplyScalar(f).add(cam.position);
      pts.push(p);
    }
    shot.update(t + dt);
    cam.updateMatrixWorld();
    let maxPx = 0;
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const ref = [
      [0, 0],
      [-0.7, -0.7],
      [0.7, 0.7],
      [0.7, -0.7],
      [-0.7, 0.7],
    ];
    pts.forEach((p, i) => {
      a.copy(p).project(cam);
      b.set(ref[i][0], ref[i][1], 0);
      maxPx = Math.max(maxPx, Math.hypot((a.x - b.x) * this.post.w * 0.5, (a.y - b.y) * this.post.h * 0.5));
    });
    return Math.max(shot.minSamples(t), Math.min(12, Math.ceil((maxPx * sh) / 4)));
  }

  renderShot(shot: Shot, t: number, slot: number) {
    const n = this.samplesFor(shot, t);
    const sh = shot.shutter(t);
    // subframes ordered so the centre one renders last (its depth drives the DOF)
    const order = Array.from({length: n}, (_, i) => i).sort((a, b) => Math.abs(b - (n - 1) / 2) - Math.abs(a - (n - 1) / 2));
    order.forEach((i, j) => {
      const ts = n === 1 ? t : t + (sh / FPS) * ((i + 0.5) / n - 0.5);
      shot.update(ts);
      this.post.renderSub(shot.scene, shot.camera, 1 / n, j === 0);
    });
    this.post.resolveDof(slot, shot.camera, shot.dof(t));
    shot.update(t);
    return n;
  }

  render(t: number, plate: THREE.Texture | null) {
    const act = this.active(t);
    let slot = 0;
    let grade: Grade = {...BASE_GRADE};
    const pinfo = plateFor(t);
    if (act.length === 0 || (pinfo && pinfo.kind === 'main')) {
      // pure cloth plate
      const r = this.ctx.renderer;
      r.setRenderTarget(this.post.rtAccum[0]);
      r.setClearColor(0x000000, 1);
      r.clear();
    } else if (act.length === 1) {
      this.renderShot(act[0].shot, t, 0);
      grade = {...grade, ...act[0].shot.grade(t)};
    } else {
      const [A, B] = act;
      const k = smooth(prog(t, B.a, A.b));
      this.renderShot(A.shot, t, 0);
      this.renderShot(B.shot, t, 1);
      slot = this.post.mix(0, 1, k);
      const ga = {...BASE_GRADE, ...A.shot.grade(t)};
      const gb = {...BASE_GRADE, ...B.shot.grade(t)};
      grade = Object.fromEntries(Object.keys(ga).map((key) => [key, (ga as any)[key] * (1 - k) + (gb as any)[key] * k])) as Grade;
    }
    let overlayOnly = 0;
    if (pinfo) overlayOnly = pinfo.kind === 'main' ? 1 : 1 - smooth(prog(pinfo.frame, HOLD_FIRST, HOLD_FIRST + 7));
    const fade = 1 - smooth(prog(t, 25.0, 25.2));
    this.post.finish(slot, {
      ...grade,
      fade,
      seed: (Math.round(t * FPS) * 17.13) % 97,
      overlay: plate,
      overlayMix: plate ? 1 : 0,
      overlayOnly: plate ? overlayOnly : 0,
    });
  }
}
