import * as THREE from 'three';
import {Ctx, Shot} from '../engine/shot';
import {backOut, cssToLocal, easeInOut, easeOut, expoOut, keys, makeHaze, makeSlab, prog, rig, setCam, Slab, V3} from '../engine/kit';
import {DEPOSIT_SLOT} from '../ui/screens';

/* Shots 3-5 (2.9-6.95s): macro dolly across the home header, arc left onto the
   sidebar, then the beat drop where "Deposit Naira" lifts out and flares. */
export class Dashboard extends Shot {
  panel: Slab;
  button: Slab;
  btnHome: THREE.Vector3;
  haze: THREE.Mesh;
  flash: THREE.Mesh;

  constructor(ctx: Ctx) {
    super(ctx);
    this.panel = makeSlab({w: 3.2, h: 1.8, depth: 0.12, radius: 0.07, bevel: 0.02, tex: ctx.tex.dashboard, glow: 1.6});
    this.scene.add(this.panel);
    this.button = makeSlab({w: 0.84, h: 0.192, depth: 0.05, radius: 0.096, bevel: 0.012, tex: ctx.tex.deposit_dark});
    // white face that flashes in on the drop
    this.flash = new THREE.Mesh(
      this.button.screen.geometry,
      new THREE.MeshBasicMaterial({map: ctx.tex.deposit, transparent: true, opacity: 0, depthWrite: false, toneMapped: false}),
    );
    this.flash.position.z = this.button.frontZ + 0.001;
    this.button.add(this.flash);
    const [bx, by] = cssToLocal(this.panel, DEPOSIT_SLOT.x + DEPOSIT_SLOT.w / 2, DEPOSIT_SLOT.y + DEPOSIT_SLOT.h / 2, 1600, 900);
    this.btnHome = new THREE.Vector3(bx, by, this.panel.frontZ - 0.03);
    this.scene.add(this.button);
    this.haze = makeHaze(9, 0.05);
    this.haze.position.set(-1, 1.2, -2.5);
    this.scene.add(this.haze);
    this.scene.environmentRotation = new THREE.Euler(0, 0, 0);
  }

  /** CSS px on the dashboard texture -> world point on its face */
  P(x: number, y: number, z = 0): V3 {
    const [lx, ly] = cssToLocal(this.panel, x, y, 1600, 900);
    return [lx, ly, this.panel.frontZ + z];
  }

  cam(t: number) {
    // [t, target, yaw, pitch, dist, roll, fov]
    return rig(t, [
      [2.35, this.P(1010, 150), 40, 12, 1.1, -5, 34],
      [2.9, this.P(900, 150), 38, 12, 1.15, -4, 34, easeOut],
      [4.0, this.P(560, 160), 34, 12, 1.15, -4, 34, easeInOut],
      [5.2, this.P(250, 190), 27, 12, 1.45, -5, 34, easeInOut],
      [6.8, this.P(280, 225), 24, 12, 1.2, -4, 34, easeOut],
      [7.05, this.P(900, 760), 10, 30, 1.6, -14, 34, (x) => x * x],
    ]);
  }

  update(t: number) {
    const c = this.cam(t);
    setCam(this.camera, c.pos, c.tgt, c.roll, c.fov);
    // beat drop: button pops out of its slot, tilts toward camera and flares white
    const lift = backOut(prog(t, 5.2, 5.55), 2.2);
    const settle = easeOut(prog(t, 5.55, 6.8));
    this.button.position.copy(this.btnHome);
    this.button.position.z += 0.16 * lift - 0.02 * settle;
    this.button.rotation.set(0.0, 0.32 * lift - 0.08 * settle, 0.0);
    // flash: snaps white at the drop, holds a beat, decays back to the dark pill with a hot rim
    const on = expoOut(prog(t, 5.2, 5.27));
    const decay = Math.exp(-Math.max(0, t - 5.45) * 2.6);
    const k = t < 5.2 ? 0 : on * decay;
    const fm = this.flash.material as THREE.MeshBasicMaterial;
    fm.opacity = Math.min(1, k * 1.2);
    fm.color.setScalar(1 + 2.6 * k);
    this.button.screenMat.emissiveIntensity = 1.3 + 0.9 * settle;
    // light sweep across the bevels as the camera arcs
    this.scene.environmentRotation.set(0, -0.6 + 0.5 * prog(t, 2.4, 7), 0);
  }

  dof(t: number) {
    const c = this.cam(t);
    return {focus: c.dist, aperture: keys<number>(t, [[2.35, 9], [4.0, 6], [5.2, 4.5]]), maxCoc: 24};
  }

  grade(t: number) {
    return {bloom: 0.55 + 0.6 * Math.exp(-Math.max(0, t - 5.2) * 4) * (t > 5.2 ? 1 : 0), exposure: 1.05};
  }

  shutter(t: number) {
    return t > 6.85 ? 1.0 : 0.5;
  }
}
