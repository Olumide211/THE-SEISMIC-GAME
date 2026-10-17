import * as THREE from 'three';
import {Ctx, Shot} from '../engine/shot';
import {addEdgeGlint, cssToLocal, easeInOut, easeOut, expoOut, keys, makeHaze, makeSlab, prog, rig, setCam, Slab, V3} from '../engine/kit';
import {ASSET_ROWS, ASSETS_LAYOUT} from '../ui/screens';

/* Shot 6 (7.0-8.3s): whip onto the assets/rates table at a steep angle; rows streak in. */
export class Assets extends Shot {
  panel: Slab;
  rows: THREE.Mesh[] = [];

  constructor(ctx: Ctx) {
    super(ctx);
    this.panel = makeSlab({w: 3.2, h: 2.0, depth: 0.12, radius: 0.08, bevel: 0.022, tex: ctx.tex.assets_frame, glow: 2.0});
    // lying (almost) flat like a tabletop, face up
    this.panel.rotation.x = -Math.PI / 2 + 0.12;
    this.panel.updateMatrixWorld();
    this.scene.add(this.panel);
    const rw = ((1600 - ASSETS_LAYOUT.padX * 2) / 1600) * this.panel.sw;
    const rh = (ASSETS_LAYOUT.row / 1000) * this.panel.sh;
    ASSET_ROWS.forEach((sym, i) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(rw, rh),
        new THREE.MeshBasicMaterial({map: ctx.tex[`row_${sym}`], transparent: true, color: new THREE.Color(2.0, 2.0, 2.0), depthWrite: false}),
      );
      const [x, y] = cssToLocal(this.panel, 800, ASSETS_LAYOUT.head + ASSETS_LAYOUT.row * (i + 0.5), 1600, 1000);
      m.userData.home = new THREE.Vector3(x, y, this.panel.frontZ + 0.003);
      this.rows.push(m);
      this.panel.add(m);
    });
    // light pool on the glossy face
    addEdgeGlint(this.panel, 'left', 4, 0.95, -0.05);
    addEdgeGlint(this.panel, 'top', 1.6, 0.8, -0.1);
    const pool = makeHaze(3.6, 0.14);
    pool.position.set(-0.3, 0.1, this.panel.frontZ + 0.006);
    this.panel.add(pool);
    const haze = makeHaze(8, 0.04);
    haze.position.set(1, 1.5, -2.5);
    this.scene.add(haze);
  }

  P(x: number, y: number): V3 {
    const [lx, ly] = cssToLocal(this.panel, x, y, 1600, 1000);
    const w = this.panel.localToWorld(new THREE.Vector3(lx, ly, this.panel.frontZ));
    return [w.x, w.y, w.z];
  }

  cam(t: number) {
    // steep, low, from the left edge looking along the rows
    return rig(t, [
      [6.9, this.P(1000, 420), 20, 46, 3.2, 26, 32],
      [7.15, this.P(640, 390), 8, 38, 2.85, 15, 32, expoOut],
      [8.3, this.P(620, 440), 5, 40, 2.75, 13, 32, easeInOut],
      [8.5, this.P(800, 650), 2, 52, 3.0, 20, 32, (x) => x * x],
    ]);
  }

  update(t: number) {
    const c = this.cam(t);
    setCam(this.camera, c.pos, c.tgt, c.roll, c.fov);
    this.rows.forEach((m, i) => {
      const k = expoOut(prog(t, 7.0 + i * 0.07, 7.45 + i * 0.07));
      m.position.copy(m.userData.home);
      m.position.x += (1 - k) * 3.4;
      m.position.z += (1 - k) * 0.05;
      (m.material as THREE.MeshBasicMaterial).opacity = Math.min(1, k * 2.5);
    });
  }

  dof(t: number) {
    return {focus: this.cam(t).dist, aperture: 6, maxCoc: 22};
  }

  minSamples(t: number) {
    return t > 6.98 && t < 7.75 ? 8 : 1;
  }

  shutter(t: number) {
    return t < 7.2 || t > 8.35 ? 1.0 : 0.7;
  }

  grade(t: number) {
    return {exposure: 1.05 * (1 - 0.85 * easeInOut(prog(t, 8.3, 8.5)))};
  }
}
