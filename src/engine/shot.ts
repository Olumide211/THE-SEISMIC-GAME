import * as THREE from 'three';
import type {TexMap} from './assets';
import type {DofParams} from './post';

export type Ctx = {renderer: THREE.WebGLRenderer; tex: TexMap; env: THREE.Texture; envSide: THREE.Texture};

export type Grade = {exposure: number; bloom: number; threshold: number; vignette: number; grain: number};
export const BASE_GRADE: Grade = {exposure: 1.0, bloom: 0.55, threshold: 1.25, vignette: 0.8, grain: 0.032};

export abstract class Shot {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.03, 120);
  overlay?: {scene: THREE.Scene; cam: THREE.Camera};
  constructor(public ctx: Ctx) {
    this.scene.background = new THREE.Color(0x030303);
    this.scene.environment = ctx.env;
  }
  /** set every transform for global time t (called per motion-blur subframe) */
  abstract update(t: number): void;
  dof(_t: number): DofParams | null {
    return null;
  }
  grade(_t: number): Partial<Grade> {
    return {};
  }
  /** extra subframes for fast object motion the camera-based estimate can't see */
  minSamples(_t: number) {
    return 1;
  }
  /** shutter in frames (0.5 = 180 degrees) */
  shutter(_t: number) {
    return 0.5;
  }
}
