import * as THREE from 'three';
import {addEdgeGlint, makeSlab, Slab} from '../engine/kit';
import {PH as CSS_H, PW as CSS_W} from './screens';

export const PHONE_W = 1.0;
const BEVEL = 0.02;
// height chosen so the glass matches the 860x1860 screen texture exactly
export const PHONE_H = (PHONE_W - BEVEL * 2.2) * (CSS_H / CSS_W) + BEVEL * 2.2;

const FX_W = 512;
const FX_H = Math.round((FX_W * CSS_H) / CSS_W);

export type Ripple = {x: number; y: number; t0: number};

/**
 * Thick 3D phone: rim-lit slab + glass screen (emissive UI texture), a second glass layer for
 * crossfades, a live canvas FX layer (timers, spinner, tap ripples, cracks) and a moving
 * glass sheen.
 */
export class Phone {
  group = new THREE.Group();
  slab: Slab;
  over: THREE.Mesh;
  overMat: THREE.MeshBasicMaterial;
  fx: THREE.Mesh;
  fxCanvas: HTMLCanvasElement;
  fxTex: THREE.CanvasTexture;
  sheen: THREE.Mesh;
  glow = 1.35;

  constructor(tex: THREE.Texture) {
    this.slab = makeSlab({w: PHONE_W, h: PHONE_H, depth: 0.06, radius: 0.14, bevel: BEVEL, tex, glow: this.glow});
    addEdgeGlint(this.slab, 'left', 5, 0.92);
    addEdgeGlint(this.slab, 'right', 3, 0.8, 0.05);
    addEdgeGlint(this.slab, 'top', 3, 0.7);
    this.group.add(this.slab);
    const geo = this.slab.screen.geometry;
    this.overMat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false, color: new THREE.Color(this.glow, this.glow, this.glow)});
    this.over = new THREE.Mesh(geo, this.overMat);
    this.over.position.z = this.slab.frontZ + 0.0008;
    this.slab.add(this.over);

    this.fxCanvas = document.createElement('canvas');
    this.fxCanvas.width = FX_W;
    this.fxCanvas.height = FX_H;
    this.fxTex = new THREE.CanvasTexture(this.fxCanvas);
    this.fxTex.colorSpace = THREE.SRGBColorSpace;
    this.fx = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({map: this.fxTex, transparent: true, depthWrite: false, color: new THREE.Color(1.6, 1.6, 1.6)}));
    this.fx.position.z = this.slab.frontZ + 0.0016;
    this.slab.add(this.fx);

    // glass sheen: a soft diagonal band that slides as the phone/camera moves
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d')!;
    const gr = g.createLinearGradient(0, 0, 256, 256);
    gr.addColorStop(0.0, 'rgba(255,255,255,0)');
    gr.addColorStop(0.42, 'rgba(255,255,255,0)');
    gr.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    gr.addColorStop(0.58, 'rgba(255,255,255,0)');
    gr.addColorStop(1.0, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    const st = new THREE.CanvasTexture(c);
    st.wrapS = st.wrapT = THREE.RepeatWrapping;
    this.sheen = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({map: st, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(0.09, 0.09, 0.09)}),
    );
    this.sheen.position.z = this.slab.frontZ + 0.0024;
    this.slab.add(this.sheen);
  }

  /** base screen A with B crossfaded on top (k in 0..1); gain scales the UI brightness */
  show(a: THREE.Texture, b: THREE.Texture | null, k: number, gain = 1) {
    const m = this.slab.screenMat;
    if (m.emissiveMap !== a) {
      m.emissiveMap = a;
      m.needsUpdate = true;
    }
    m.emissiveIntensity = this.glow * gain;
    this.overMat.map = b;
    this.overMat.opacity = b ? k : 0;
    this.overMat.color.setScalar(this.glow * gain);
    this.overMat.needsUpdate = true;
  }

  sheenAt(u: number) {
    const t = (this.sheen.material as THREE.MeshBasicMaterial).map!;
    t.offset.set(u, u * 0.6);
  }

  /** CSS px on the screen texture -> local coords on the glass */
  local(x: number, y: number): THREE.Vector3 {
    return new THREE.Vector3((x / CSS_W - 0.5) * this.slab.sw, (0.5 - y / CSS_H) * this.slab.sh, this.slab.frontZ + 0.003);
  }

  /** redraw the live FX layer */
  drawFx(o: {t: number; timer?: string | null; timerXY?: [number, number]; timerSize?: number; spinner?: [number, number, number] | null; ripples?: Ripple[]; crack?: number; redFlash?: number}) {
    const c = this.fxCanvas.getContext('2d')!;
    const s = FX_W / CSS_W;
    c.clearRect(0, 0, FX_W, FX_H);
    if (o.redFlash && o.redFlash > 0.01) {
      c.fillStyle = `rgba(229,72,77,${0.16 * o.redFlash})`;
      c.fillRect(0, 0, FX_W, FX_H);
    }
    if (o.timer && o.timerXY) {
      c.save();
      c.font = `500 ${(o.timerSize ?? 200) * s}px Inter`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.shadowColor = 'rgba(229,72,77,0.8)';
      c.shadowBlur = 30 * s;
      c.fillStyle = '#E5484D';
      c.fillText(o.timer, o.timerXY[0] * s, o.timerXY[1] * s);
      c.restore();
    }
    if (o.spinner) {
      const [x, y, r] = o.spinner;
      c.save();
      c.lineWidth = 16 * s;
      c.strokeStyle = 'rgba(255,255,255,0.12)';
      c.beginPath();
      c.arc(x * s, y * s, r * s, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = '#D8D8DC';
      c.lineCap = 'round';
      const a = o.t * 7;
      c.beginPath();
      c.arc(x * s, y * s, r * s, a, a + 1.6);
      c.stroke();
      c.restore();
    }
    for (const r of o.ripples ?? []) {
      const dt = o.t - r.t0;
      if (dt < 0 || dt > 0.6) continue;
      const k = dt / 0.6;
      c.save();
      c.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k)})`;
      c.lineWidth = 8 * s;
      c.beginPath();
      c.arc(r.x * s, r.y * s, (30 + 170 * k) * s, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = `rgba(255,255,255,${0.35 * Math.max(0, 1 - k * 2.5)})`;
      c.beginPath();
      c.arc(r.x * s, r.y * s, 60 * s, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    if (o.crack && o.crack > 0) drawCrack(c, FX_W, FX_H, o.crack);
    this.fxTex.needsUpdate = true;
  }
}

/** procedural cracked-glass lines radiating from an impact point (deterministic) */
function drawCrack(c: CanvasRenderingContext2D, w: number, h: number, k: number) {
  let seed = 4242;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const ox = w * 0.72,
    oy = h * 0.2;
  c.save();
  c.globalAlpha = 0.55 * k;
  c.strokeStyle = '#EDEDED';
  c.lineWidth = 1.3;
  for (let i = 0; i < 14; i++) {
    let a = (i / 14) * Math.PI * 2 + rnd() * 0.3;
    let x = ox,
      y = oy;
    c.beginPath();
    c.moveTo(x, y);
    const len = (0.35 + rnd() * 0.75) * h * 0.6 * k;
    for (let d = 0; d < len; d += 18) {
      a += (rnd() - 0.5) * 0.35;
      x += Math.cos(a) * 18;
      y += Math.sin(a) * 18;
      c.lineTo(x, y);
    }
    c.stroke();
  }
  for (let ring = 1; ring <= 3; ring++) {
    c.beginPath();
    for (let i = 0; i <= 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const r = ring * 26 * (0.8 + rnd() * 0.4);
      const px = ox + Math.cos(a) * r,
        py = oy + Math.sin(a) * r;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.stroke();
  }
  // edge vignette darkening
  const g = c.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${0.55 * k})`);
  c.globalAlpha = 1;
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  c.restore();
}
