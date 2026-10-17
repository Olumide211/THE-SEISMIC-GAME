import * as THREE from 'three';
import {Ctx, Shot} from '../engine/shot';
import {addEdgeGlint, cssToLocal, easeInOut, expoOut, keys, makeHaze, makeSlab, prog, rig, setCam, Slab, V3} from '../engine/kit';

/* Shot 11 (16.4-17.4s): close diagonal pass over Security settings. Dark Mode clicks on
   at 16.6, 2FA at 16.9; PIN and Biometric rows follow. Transactions sit defocused behind. */
export class Security extends Shot {
  panel: Slab;
  tx: Slab;
  pulse: THREE.Mesh;

  constructor(ctx: Ctx) {
    super(ctx);
    this.panel = makeSlab({w: 2.0, h: 1.8, depth: 0.1, radius: 0.07, bevel: 0.02, tex: ctx.tex.settings0, glow: 1.7});
    this.panel.rotation.x = -Math.PI / 2;
    this.panel.updateMatrixWorld();
    addEdgeGlint(this.panel, 'right', 5, 0.95);
    addEdgeGlint(this.panel, 'bottom', 2, 0.7, 0.2);
    this.scene.add(this.panel);
    this.tx = makeSlab({w: 2.0, h: 2.2, depth: 0.1, radius: 0.07, bevel: 0.02, tex: ctx.tex.txlist, glow: 1.0});
    this.tx.rotation.x = -Math.PI / 2;
    this.tx.position.set(-2.4, -0.55, -0.9);
    this.scene.add(this.tx);
    // toggle click pulse
    this.pulse = makeHaze(0.5, 0.0, 0x22c55e);
    this.panel.add(this.pulse);
    const haze = makeHaze(9, 0.03);
    haze.position.set(0, 1.2, -4);
    this.scene.add(haze);
  }

  P(x: number, y: number): V3 {
    const [lx, ly] = cssToLocal(this.panel, x, y, 1000, 900);
    const w = this.panel.localToWorld(new THREE.Vector3(lx, ly, this.panel.frontZ));
    return [w.x, w.y, w.z];
  }

  cam(t: number) {
    return rig(t, [
      [16.3, this.P(640, 170), -20, 44, 2.0, -38, 30],
      [16.45, this.P(600, 250), -14, 40, 1.8, -30, 30, expoOut],
      [17.0, this.P(560, 400), -10, 38, 1.75, -27, 30, easeInOut],
      [17.45, this.P(520, 600), -8, 36, 1.85, -25, 30, easeInOut],
      [17.55, this.P(400, 800), -4, 18, 2.2, -32, 30, (x) => x * x],
    ]);
  }

  update(t: number) {
    const c = this.cam(t);
    setCam(this.camera, c.pos, c.tgt, c.roll, c.fov);
    const tex = t < 16.6 ? 'settings0' : t < 16.9 ? 'settings1' : 'settings2';
    if (this.panel.screenMat.emissiveMap !== this.ctx.tex[tex]) {
      this.panel.screenMat.emissiveMap = this.ctx.tex[tex];
      this.panel.screenMat.needsUpdate = true;
    }
    // green pulse at each toggle as it clicks on
    const click = t >= 16.9 ? 16.9 : 16.6;
    const row = t >= 16.9 ? 357 : 225;
    const [lx, ly] = cssToLocal(this.panel, 898, row, 1000, 900);
    this.pulse.position.set(lx, ly, this.panel.frontZ + 0.01);
    const e = t >= 16.6 ? Math.exp(-(t - click) * 6) : 0;
    (this.pulse.material as THREE.MeshBasicMaterial).color.setRGB(0.13 * 3 * e, 0.77 * 3 * e, 0.37 * 3 * e);
  }

  dof(t: number) {
    return {focus: this.cam(t).dist, aperture: 4, maxCoc: 28};
  }

  shutter(t: number) {
    return t < 16.45 || t > 17.45 ? 1.0 : 0.6;
  }

  grade() {
    return {exposure: 1.05};
  }
}
