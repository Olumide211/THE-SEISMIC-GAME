import * as THREE from 'three';
import {Ctx, Shot} from '../engine/shot';
import {addEdgeGlint, cssToLocal, easeInOut, easeOut, keys, lerp, lerpV, makeHaze, makeSlab, prog, rig, setCam, Slab, smooth, V3} from '../engine/kit';
import {CONVERT_ARROW} from '../ui/screens';

const GREEN = new THREE.Color('#22C55E');
const GREEN_HI = new THREE.Color('#86EFAC');

/* Shots 7-8 (8.4-12.3s): a glowing green dot draws a line through the void, chased by
   the camera, past a dissolving red "P2P 40:00" ghost; the line lands as the arrow
   between From and To on the Convert screen, which settles front-on. */
export class LineConvert extends Shot {
  panel: Slab;
  curve: THREE.CatmullRomCurve3;
  tube: THREE.Mesh;
  tubeSegs = 900;
  radial = 10;
  head: THREE.Mesh;
  halo: THREE.Sprite;
  arrow: THREE.Group;
  ghost: THREE.Mesh;
  ghostMat: THREE.ShaderMaterial;

  constructor(ctx: Ctx) {
    super(ctx);
    this.scene.background = new THREE.Color(0x020202);
    this.panel = makeSlab({w: 3.2, h: 2.0, depth: 0.12, radius: 0.08, bevel: 0.022, tex: ctx.tex.convert, glow: 0});
    addEdgeGlint(this.panel, 'top', 2.2, 0.8, -0.15);
    addEdgeGlint(this.panel, 'left', 1.6, 0.7, 0.1);
    this.scene.add(this.panel);
    const z = this.panel.frontZ + 0.012;
    const [ax0, ay] = cssToLocal(this.panel, CONVERT_ARROW.x0 + 18, CONVERT_ARROW.y, 1600, 1000);
    const [ax1] = cssToLocal(this.panel, CONVERT_ARROW.x1 - 26, CONVERT_ARROW.y, 1600, 1000);
    const pts: V3[] = [
      [-5.4, -2.6, -7.5],
      [-4.2, -1.0, -6.0],
      [-2.6, -1.9, -4.6],
      [-3.3, 0.4, -3.2],
      [-2.2, 1.25, -1.8],
      [-1.7, 0.2, -0.6],
      [-0.9, ay + 0.06, 0.25],
      [ax0 - 0.12, ay, z + 0.03],
      [ax0, ay, z],
      [(ax0 + ax1) / 2, ay, z],
      [ax1, ay, z],
    ];
    this.curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'centripetal', 0.5);
    this.tube = new THREE.Mesh(
      new THREE.TubeGeometry(this.curve, this.tubeSegs, 0.017, this.radial, false),
      new THREE.MeshBasicMaterial({color: GREEN_HI.clone().lerp(GREEN, 0.35).multiplyScalar(1.7), transparent: true}),
    );
    this.scene.add(this.tube);
    this.head = new THREE.Mesh(new THREE.SphereGeometry(0.045, 24, 16), new THREE.MeshBasicMaterial({color: GREEN_HI.clone().multiplyScalar(2.6)}));
    this.scene.add(this.head);
    this.halo = new THREE.Sprite(new THREE.SpriteMaterial({map: haloTex(), color: GREEN_HI.clone().multiplyScalar(0.9), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true}));
    this.halo.scale.setScalar(0.5);
    this.scene.add(this.halo);

    // final arrow between the cards (shaft + head), takes over from the tube
    this.arrow = new THREE.Group();
    const shaftLen = ax1 - ax0 - 0.03;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, shaftLen, 12), new THREE.MeshBasicMaterial({color: GREEN.clone().multiplyScalar(2.6), transparent: true}));
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = ax0 + shaftLen / 2;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 24), new THREE.MeshBasicMaterial({color: GREEN_HI.clone().multiplyScalar(3), transparent: true}));
    tip.rotation.z = -Math.PI / 2;
    tip.position.x = ax1 - 0.005;
    this.arrow.add(shaft, tip);
    this.arrow.position.set(0, ay, z);
    this.scene.add(this.arrow);

    // red "P2P 40:00" ghost dissolving behind the start of the line
    this.ghostMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {map: {value: ctx.tex.p2p}, dissolve: {value: 0}, gain: {value: 1.4}},
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: /* glsl */ `
        varying vec2 vUv; uniform sampler2D map; uniform float dissolve, gain;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
        void main(){
          vec4 c = texture2D(map, vUv);
          float nn = 0.6*n(vUv*vec2(18.,5.)) + 0.4*n(vUv*vec2(60.,17.));
          float edge = smoothstep(dissolve - 0.08, dissolve, nn);
          float glow = smoothstep(dissolve, dissolve + 0.06, nn);
          vec3 red = vec3(0.79, 0.06, 0.07);
          gl_FragColor = vec4(red * gain * (1.0 + 2.5 * (1.0 - glow)), c.a * edge * 0.7);
        }`,
    });
    this.ghost = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.52), this.ghostMat);
    this.ghost.position.set(-5.0, -3.5, -8.4);
    this.ghost.rotation.set(-0.75, 0.35, 0.05);
    this.scene.add(this.ghost);

    const haze = makeHaze(10, 0.03);
    haze.position.set(0, 0.5, -3);
    this.scene.add(haze);
  }

  /** head progress along the curve */
  u(t: number) {
    return easeInOut(prog(t, 8.45, 11.25));
  }

  cam(t: number) {
    const u = this.u(t);
    const head = this.curve.getPointAt(Math.min(1, u));
    const tan = this.curve.getTangentAt(Math.min(0.999, u));
    const ahead = this.curve.getPointAt(Math.min(1, u + 0.04));
    // chase: behind the head, offset up/right
    // chase from above and behind so the trail reads as a curve
    const sw = keys<number>(t, [[8.4, 0.0], [10.6, 1.0]]);
    const off: V3 = [lerp(0.9, 0.2, sw) - tan.x * 0.9, lerp(1.7, 0.9, sw), lerp(1.9, 1.8, sw) - tan.z * 0.9];
    const chasePos: V3 = [head.x + off[0], head.y + off[1], head.z + off[2]];
    const chaseTgt: V3 = [lerp(head.x, ahead.x, 0.5), lerp(head.y, ahead.y, 0.5) - 0.15, lerp(head.z, ahead.z, 0.5)];
    // settle: front-on Convert screen
    const front = rig(t, [
      [10.4, [0.0, 0.05, 0], 14, 8, 2.6, -6, 32],
      [12.3, [0.0, 0.0, 0], 2, 1, 3.45, -2, 32, easeOut],
      [12.45, [0.6, -0.2, 0], -6, -4, 3.45, -6, 32, (x) => x * x],
    ]);
    const k = smooth(prog(t, 10.5, 11.6));
    return {
      pos: lerpV(chasePos, front.pos, k),
      tgt: lerpV(chaseTgt, front.tgt, k),
      roll: lerp(keys<number>(t, [[8.4, -12], [10.5, -8]]), front.roll, k),
      fov: 32,
      focus: lerp(Math.hypot(chasePos[0] - head.x, chasePos[1] - head.y, chasePos[2] - head.z), front.dist, k),
    };
  }

  update(t: number) {
    const c = this.cam(t);
    setCam(this.camera, c.pos, c.tgt, c.roll, c.fov);
    const u = this.u(t);
    const g = this.tube.geometry as THREE.BufferGeometry;
    g.setDrawRange(0, Math.floor(u * this.tubeSegs) * this.radial * 6);
    const head = this.curve.getPointAt(Math.min(1, u));
    this.head.position.copy(head);
    this.halo.position.copy(head);
    const arrive = smooth(prog(t, 11.1, 11.5));
    // tube hands over to the arrow, then fades out of the void
    (this.tube.material as THREE.MeshBasicMaterial).opacity = 1 - smooth(prog(t, 11.35, 11.9));
    this.head.visible = t < 11.45;
    this.halo.material.opacity = (1 - arrive) * (t > 8.42 ? 1 : 0);
    this.halo.scale.setScalar(0.3 + 0.04 * Math.sin(t * 18));
    this.arrow.children.forEach((m) => (((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = arrive));
    // screen wakes up as the line approaches
    this.panel.screenMat.emissiveIntensity = 1.35 * smooth(prog(t, 10.35, 11.3));
    this.scene.environmentIntensity = 0.15 + 0.85 * smooth(prog(t, 10.2, 11.4));
    // P2P ghost dissolves behind the line start
    this.ghostMat.uniforms.dissolve.value = keys<number>(t, [[8.4, 0.0], [8.7, 0.05], [9.7, 1.05]]);
    this.ghost.visible = t < 9.8;
  }

  dof(t: number) {
    const c = this.cam(t);
    return {focus: c.focus, aperture: keys<number>(t, [[8.4, 6], [10.5, 5], [12.0, 2.5]]), maxCoc: 26};
  }

  grade(t: number) {
    return {exposure: 1.05 * smooth(prog(t, 8.35, 8.55)), bloom: 0.7, vignette: 0.85};
  }

  minSamples(t: number) {
    return t < 11.3 ? 4 : 1;
  }

  shutter(t: number) {
    return t > 12.3 ? 1.0 : 0.6;
  }
}

let _halo: THREE.CanvasTexture | null = null;
function haloTex() {
  if (_halo) return _halo;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  _halo = new THREE.CanvasTexture(c);
  return _halo;
}
