import * as THREE from 'three';
import {Ctx, Shot} from '../engine/shot';
import {addEdgeGlint, cssToLocal, easeInOut, easeOut, expoOut, keys, makeHaze, makeSlab, prog, rig, setCam, Slab, V3} from '../engine/kit';

/* Shot 10 (14.9-16.3s): grazing skim along a slab bevel with a light streak running
   down the edge, rising to reveal the Account Statement slab lying flat. */
export class Statement extends Shot {
  panel: Slab;
  streak: THREE.Mesh;
  streak2: THREE.Mesh;

  constructor(ctx: Ctx) {
    super(ctx);
    this.panel = makeSlab({w: 3.0, h: 1.8, depth: 0.12, radius: 0.07, bevel: 0.022, tex: ctx.tex.statement, glow: 1.4});
    this.panel.rotation.x = -Math.PI / 2;
    this.panel.updateMatrixWorld();
    this.scene.add(this.panel);
    this.streak = addEdgeGlint(this.panel, 'bottom', 7, 0.35);
    this.streak2 = addEdgeGlint(this.panel, 'left', 2.5, 0.6);
    const pool = makeHaze(3.2, 0.045);
    pool.position.set(0.2, 0.2, this.panel.frontZ + 0.006);
    this.panel.add(pool);
    const haze = makeHaze(10, 0.035);
    haze.position.set(0, 1.5, -4);
    this.scene.add(haze);
  }

  P(x: number, y: number): V3 {
    const [lx, ly] = cssToLocal(this.panel, x, y, 1500, 900);
    const w = this.panel.localToWorld(new THREE.Vector3(lx, ly, this.panel.frontZ));
    return [w.x, w.y, w.z];
  }

  cam(t: number) {
    return rig(t, [
      [14.8, this.P(700, 960), 82, 1.5, 1.2, 22, 30],
      [15.0, this.P(520, 900), 74, 2.5, 1.25, 16, 30, expoOut],
      [15.55, this.P(640, 760), 58, 7, 1.7, 12, 30, easeInOut],
      [16.3, this.P(760, 470), 30, 20, 2.6, 8, 30, easeInOut],
      [16.45, this.P(1000, 420), 20, 34, 2.6, 18, 30, (x) => x * x],
    ]);
  }

  update(t: number) {
    const c = this.cam(t);
    setCam(this.camera, c.pos, c.tgt, c.roll, c.fov);
    // light streak racing along the near bevel
    const k = easeInOut(prog(t, 14.85, 16.0));
    this.streak.position.x = -1.6 + 3.2 * k;
    (this.streak.material as THREE.MeshBasicMaterial).opacity = Math.sin(Math.PI * Math.min(1, k * 1.05));
    this.scene.environmentRotation.set(0, -1.2 + 1.4 * prog(t, 14.85, 16.45), 0);
  }

  dof(t: number) {
    return {focus: this.cam(t).dist, aperture: keys<number>(t, [[14.85, 10], [15.6, 7], [16.3, 5]]), maxCoc: 24};
  }

  shutter(t: number) {
    return t < 15.05 || t > 16.3 ? 1.0 : 0.6;
  }

  grade() {
    return {exposure: 1.05};
  }
}
