import * as THREE from 'three';

/* ---------------------------------------------------------------- time + easing */
export const FPS = 30;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const expoOut = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const expoInOut = (x: number) =>
  x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;
export const backOut = (x: number, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);

export type V3 = [number, number, number];
export const v3 = (a: V3) => new THREE.Vector3(a[0], a[1], a[2]);
export const lerpV = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** piecewise keyframes: [[t, value], ...] with per-segment easing */
export function keys<T extends number | V3>(t: number, ks: [number, T, ((x: number) => number)?][]): T {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [t0, a] = ks[i];
    const [t1, b, e] = ks[i + 1];
    if (t <= t1) {
      const k = (e ?? easeInOut)(prog(t, t0, t1));
      if (typeof a === 'number') return lerp(a, b as number, k) as T;
      return lerpV(a as V3, b as V3, k) as T;
    }
  }
  return ks[ks.length - 1][1];
}

/** place camera: position, look target, roll (deg, Dutch tilt), vertical fov */
export function setCam(cam: THREE.PerspectiveCamera, pos: V3, target: V3, rollDeg = 0, fov?: number) {
  cam.position.set(pos[0], pos[1], pos[2]);
  cam.up.set(0, 1, 0);
  cam.lookAt(target[0], target[1], target[2]);
  if (rollDeg) cam.rotateZ((rollDeg * Math.PI) / 180);
  if (fov !== undefined && cam.fov !== fov) {
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }
  cam.updateMatrixWorld();
}

/* ---------------------------------------------------------------- geometry */
export function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** planar UVs from bounding box for a ShapeGeometry */
export function boxUV(g: THREE.BufferGeometry, w: number, h: number) {
  const p = g.attributes.position;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    uv[i * 2] = p.getX(i) / w + 0.5;
    uv[i * 2 + 1] = p.getY(i) / h + 0.5;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
}

/* ---------------------------------------------------------------- materials */
export const bodyMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0a,
    metalness: 0.85,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.6,
  });

export type Slab = THREE.Group & {screen: THREE.Mesh; screenMat: THREE.MeshStandardMaterial; body: THREE.Mesh; frontZ: number; sw: number; sh: number};

/**
 * Thick UI slab: extruded rounded rectangle with a bevel that catches the studio
 * strips as bright white rims; the UI texture is an emissive glass face on the front.
 */
export function makeSlab(o: {w: number; h: number; depth?: number; radius?: number; bevel?: number; tex?: THREE.Texture; glow?: number}): Slab {
  const depth = o.depth ?? 0.08;
  const radius = o.radius ?? Math.min(o.w, o.h) * 0.04;
  const bevel = o.bevel ?? 0.014;
  const g = new THREE.Group() as Slab;
  const shape = roundedRectShape(o.w - bevel * 2, o.h - bevel * 2, Math.max(0.001, radius - bevel));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 5,
    curveSegments: 18,
  });
  geo.translate(0, 0, -depth / 2);
  const body = new THREE.Mesh(geo, bodyMaterial());
  g.add(body);
  const frontZ = depth / 2 + bevel + 0.0015;
  const sg = boxUV(new THREE.ShapeGeometry(roundedRectShape(o.w - bevel * 2.2, o.h - bevel * 2.2, Math.max(0.001, radius - bevel)), 18), o.w - bevel * 2.2, o.h - bevel * 2.2);
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveMap: o.tex ?? null,
    emissiveIntensity: o.glow ?? 1,
    roughness: 0.32,
    metalness: 0.0,
    envMapIntensity: 0.16,
  });
  const screen = new THREE.Mesh(sg, screenMat);
  screen.position.z = frontZ;
  g.add(screen);
  g.screen = screen;
  g.screenMat = screenMat;
  g.frontZ = frontZ;
  g.body = body;
  g.sw = o.w - bevel * 2.2;
  g.sh = o.h - bevel * 2.2;
  return g;
}

/* ---------------------------------------------------------------- studio environment */
/** black room with white softbox strips -> PMREM; strips give the bevel rim highlights */
export function makeStudioEnv(renderer: THREE.WebGLRenderer, variant: 'top' | 'side' | 'ring' = 'top') {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x000000);
  const strip = (w: number, h: number, pos: V3, rot: V3, intensity: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide}));
    m.position.set(...pos);
    m.rotation.set(...rot);
    s.add(m);
  };
  // big top softbox
  strip(10, 3, [0, 6, 0], [Math.PI / 2, 0, 0], variant === 'side' ? 1.5 : 5);
  // long rim strips left/right/back
  strip(0.6, 8, [-6, 1.5, 1], [0, Math.PI / 2, 0], 9);
  strip(0.6, 8, [6, 1.5, -1], [0, -Math.PI / 2, 0], variant === 'ring' ? 9 : 4);
  strip(10, 0.5, [0, 2.5, -6], [0, 0, 0], 7);
  strip(10, 0.4, [0, 3.5, 6], [0, Math.PI, 0], 3);
  // faint floor bounce
  strip(14, 14, [0, -5, 0], [-Math.PI / 2, 0, 0], 0.03);
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(s, 0.02).texture;
  pm.dispose();
  return env;
}

/** soft radial light pool behind the action (the grey haze in the reference) */
export function makeHaze(size: number, intensity = 0.06, color = 0xffffff) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const gr = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false, color: new THREE.Color(color).multiplyScalar(intensity), blending: THREE.AdditiveBlending}),
  );
  return m;
}

/** emissive plane carrying a transparent texture (ghost text, labels) */
export function makeDecal(tex: THREE.Texture, w: number, h: number, intensity = 1) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false, color: new THREE.Color(intensity, intensity, intensity), toneMapped: false}),
  );
  return m;
}

/** CSS px of a screen texture -> local coords on that slab's front face */
export function cssToLocal(slab: Slab, px: number, py: number, cssW: number, cssH: number): [number, number] {
  return [(px / cssW - 0.5) * slab.sw, (0.5 - py / cssH) * slab.sh];
}

/** camera position orbiting a target: yaw>0 swings to the left (-x), pitch>0 above */
export function orbit(target: V3, yawDeg: number, pitchDeg: number, dist: number): V3 {
  const y = (yawDeg * Math.PI) / 180,
    p = (pitchDeg * Math.PI) / 180;
  return [target[0] - Math.sin(y) * Math.cos(p) * dist, target[1] + Math.sin(p) * dist, target[2] + Math.cos(y) * Math.cos(p) * dist];
}

/** keyframed orbit rig: [t, target, yaw, pitch, dist, roll, fov, ease?] */
export type RigKey = [number, V3, number, number, number, number, number, ((x: number) => number)?];
export function rig(t: number, ks: RigKey[]) {
  const target = keys<V3>(t, ks.map((k) => [k[0], k[1], k[7]] as [number, V3, any]));
  const yaw = keys<number>(t, ks.map((k) => [k[0], k[2], k[7]] as [number, number, any]));
  const pitch = keys<number>(t, ks.map((k) => [k[0], k[3], k[7]] as [number, number, any]));
  const dist = keys<number>(t, ks.map((k) => [k[0], k[4], k[7]] as [number, number, any]));
  const roll = keys<number>(t, ks.map((k) => [k[0], k[5], k[7]] as [number, number, any]));
  const fov = keys<number>(t, ks.map((k) => [k[0], k[6], k[7]] as [number, number, any]));
  return {pos: orbit(target, yaw, pitch, dist), tgt: target, roll, fov, dist};
}

let glintTex: THREE.CanvasTexture | null = null;
/** thin emissive streak hugging a slab edge (specular rim glint), fading at both ends */
export function addEdgeGlint(slab: Slab, side: 'left' | 'right' | 'top' | 'bottom', intensity = 3, length = 0.9, offset = 0) {
  if (!glintTex) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 8;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.5, 'rgba(255,255,255,1)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 8);
    glintTex = new THREE.CanvasTexture(c);
  }
  const box = new THREE.Box3().setFromObject(slab.body);
  const W = box.max.x - box.min.x,
    H = box.max.y - box.min.y;
  const vertical = side === 'left' || side === 'right';
  const len = (vertical ? H : W) * length;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(len, 0.007),
    new THREE.MeshBasicMaterial({map: glintTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(intensity, intensity, intensity)}),
  );
  const z = slab.frontZ - 0.006;
  if (side === 'left') m.position.set(box.min.x + 0.003, offset * H, z);
  if (side === 'right') m.position.set(box.max.x - 0.003, offset * H, z);
  if (side === 'top') m.position.set(offset * W, box.max.y - 0.003, z);
  if (side === 'bottom') m.position.set(offset * W, box.min.y + 0.003, z);
  if (vertical) m.rotation.z = Math.PI / 2;
  slab.add(m);
  return m;
}
