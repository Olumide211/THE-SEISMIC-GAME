import * as THREE from 'three';

/* Post pipeline, all driven per Remotion frame:
     for each motion-blur subframe: scene -> MSAA RT (+depth) -> DOF gather -> accumulate
     accum -> bloom chain -> ACES tonemap -> overlay (cloth plates) -> vignette, grain, fade -> screen */

const FS_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const DOF_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec2 texel;
uniform float near, far, focus, aperture, maxCoc;
float linZ(float d) {
  float z = d * 2.0 - 1.0;
  return 2.0 * near * far / (far + near - z * (far - near));
}
float coc(float z) { return clamp(aperture * abs(z - focus) / max(z, 1e-3), 0.0, maxCoc); }
void main() {
  vec4 c0 = texture2D(tColor, vUv);
  float z0 = linZ(texture2D(tDepth, vUv).x);
  float r0 = coc(z0);
  if (r0 < 0.6 || aperture <= 0.0) { gl_FragColor = c0; return; }
  vec3 acc = c0.rgb; float wsum = 1.0;
  const int N = 40;
  float ga = 2.39996323;
  for (int i = 1; i < N; i++) {
    float fi = float(i);
    float rr = sqrt(fi / float(N)) * r0;
    float a = fi * ga;
    vec2 o = vec2(cos(a), sin(a)) * rr;
    vec2 uv = vUv + o * texel;
    float zs = linZ(texture2D(tDepth, uv).x);
    float rs = coc(zs);
    // samples behind the centre only count if their own blur reaches us
    float w = zs < z0 ? 1.0 : smoothstep(rr - 1.5, rr + 0.5, rs);
    vec3 s = texture2D(tColor, uv).rgb;
    // gentle highlight boost -> bokeh
    w *= 1.0 + 1.5 * smoothstep(1.2, 4.0, dot(s, vec3(0.3333)));
    acc += s * w; wsum += w;
  }
  gl_FragColor = vec4(acc / wsum, c0.a);
}
`;

const COPY_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform float gain;
void main() { gl_FragColor = texture2D(tSrc, vUv) * gain; }
`;

const THRESH_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform float threshold, knee;
void main() {
  vec3 c = texture2D(tSrc, vUv).rgb;
  float l = max(c.r, max(c.g, c.b));
  float s = clamp(l - threshold + knee, 0.0, 2.0 * knee);
  s = s * s / (4.0 * knee + 1e-4);
  float w = max(s, l - threshold) / max(l, 1e-4);
  gl_FragColor = vec4(c * w, 1.0);
}
`;

const BLUR_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform vec2 dir;
void main() {
  vec3 c = texture2D(tSrc, vUv).rgb * 0.2270270270;
  c += texture2D(tSrc, vUv + dir * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(tSrc, vUv - dir * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(tSrc, vUv + dir * 3.2307692308).rgb * 0.0702702703;
  c += texture2D(tSrc, vUv - dir * 3.2307692308).rgb * 0.0702702703;
  gl_FragColor = vec4(c, 1.0);
}
`;

const FINAL_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tSrc;
uniform sampler2D tB0, tB1, tB2, tB3, tB4;
uniform sampler2D tOverlay;
uniform float overlayMix, overlayOnly;
uniform float bloom, exposure, vignette, grain, fade, seed, aberration;
uniform vec2 res;
vec3 aces(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main() {
  vec2 d = vUv - 0.5;
  float r2 = dot(d, d);
  vec2 ca = d * aberration * r2;
  vec3 c;
  c.r = texture2D(tSrc, vUv - ca).r;
  c.g = texture2D(tSrc, vUv).g;
  c.b = texture2D(tSrc, vUv + ca).b;
  vec3 b = texture2D(tB0, vUv).rgb * 0.9 + texture2D(tB1, vUv).rgb * 0.8 + texture2D(tB2, vUv).rgb * 0.7
         + texture2D(tB3, vUv).rgb * 0.6 + texture2D(tB4, vUv).rgb * 0.6;
  c += b * bloom;
  c = aces(c * exposure);
  c = pow(c, vec3(1.0 / 2.2));
  vec4 o = texture2D(tOverlay, vUv);
  // overlay plates are display-referred, premultiplied
  c = mix(c, o.rgb + c * (1.0 - o.a), overlayMix);
  c = mix(c, o.rgb, overlayOnly);
  // heavy oval vignette
  vec2 vd = d * vec2(1.0, 0.82);
  float v = smoothstep(0.85, 0.18, length(vd) * (0.9 + vignette));
  c *= mix(1.0, v, clamp(vignette, 0.0, 1.0));
  // film grain (luma weighted, a little stronger in mids)
  float n = hash(vUv * res + seed) + hash(vUv * res * 1.7 - seed) - 1.0;
  c += n * grain * (0.35 + 0.65 * (1.0 - abs(dot(c, vec3(0.333)) * 2.0 - 1.0)));
  c *= fade;
  gl_FragColor = vec4(max(c, 0.0), 1.0);
}
`;

export type DofParams = {focus: number; aperture: number; maxCoc?: number};

export class Post {
  w: number;
  h: number;
  renderer: THREE.WebGLRenderer;
  rtScene: THREE.WebGLRenderTarget;
  rtDof: THREE.WebGLRenderTarget;
  rtPre: THREE.WebGLRenderTarget;
  rtAccum: THREE.WebGLRenderTarget[];
  rtBloom: {a: THREE.WebGLRenderTarget; b: THREE.WebGLRenderTarget}[];
  quad: THREE.Mesh;
  fsScene = new THREE.Scene();
  fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  dofMat: THREE.ShaderMaterial;
  copyMat: THREE.ShaderMaterial;
  addMat: THREE.ShaderMaterial;
  threshMat: THREE.ShaderMaterial;
  blurMat: THREE.ShaderMaterial;
  finalMat: THREE.ShaderMaterial;
  blank: THREE.DataTexture;

  constructor(renderer: THREE.WebGLRenderer, w: number, h: number) {
    this.renderer = renderer;
    this.w = w;
    this.h = h;
    const hf = {type: THREE.HalfFloatType, format: THREE.RGBAFormat, colorSpace: THREE.LinearSRGBColorSpace};
    this.rtScene = new THREE.WebGLRenderTarget(w, h, {...hf, samples: 4, depthTexture: new THREE.DepthTexture(w, h, THREE.FloatType)});
    this.rtDof = new THREE.WebGLRenderTarget(w, h, hf);
    this.rtPre = new THREE.WebGLRenderTarget(w, h, hf);
    this.rtAccum = [new THREE.WebGLRenderTarget(w, h, hf), new THREE.WebGLRenderTarget(w, h, hf), new THREE.WebGLRenderTarget(w, h, hf)];
    this.rtBloom = [];
    let bw = w / 2,
      bh = h / 2;
    for (let i = 0; i < 5; i++) {
      this.rtBloom.push({a: new THREE.WebGLRenderTarget(bw, bh, hf), b: new THREE.WebGLRenderTarget(bw, bh, hf)});
      bw = Math.max(1, Math.floor(bw / 2));
      bh = Math.max(1, Math.floor(bh / 2));
    }
    const mk = (frag: string, uniforms: Record<string, any>, blending: THREE.Blending = THREE.NoBlending) =>
      new THREE.ShaderMaterial({vertexShader: FS_VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, blending});
    this.dofMat = mk(DOF_FRAG, {
      tColor: {value: null},
      tDepth: {value: null},
      texel: {value: new THREE.Vector2(1 / w, 1 / h)},
      near: {value: 0.1},
      far: {value: 100},
      focus: {value: 5},
      aperture: {value: 0},
      maxCoc: {value: 28},
    });
    this.copyMat = mk(COPY_FRAG, {tSrc: {value: null}, gain: {value: 1}});
    this.addMat = mk(COPY_FRAG, {tSrc: {value: null}, gain: {value: 1}}, THREE.AdditiveBlending);
    this.threshMat = mk(THRESH_FRAG, {tSrc: {value: null}, threshold: {value: 0.9}, knee: {value: 0.4}});
    this.blurMat = mk(BLUR_FRAG, {tSrc: {value: null}, dir: {value: new THREE.Vector2()}});
    this.blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
    this.blank.needsUpdate = true;
    this.finalMat = mk(FINAL_FRAG, {
      tSrc: {value: null},
      tB0: {value: null},
      tB1: {value: null},
      tB2: {value: null},
      tB3: {value: null},
      tB4: {value: null},
      tOverlay: {value: this.blank},
      overlayMix: {value: 0},
      overlayOnly: {value: 0},
      bloom: {value: 0.6},
      exposure: {value: 1.0},
      vignette: {value: 0.75},
      grain: {value: 0.035},
      fade: {value: 1},
      seed: {value: 0},
      aberration: {value: 0.012},
      res: {value: new THREE.Vector2(w, h)},
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.copyMat);
    this.quad.frustumCulled = false;
    this.fsScene.add(this.quad);
  }

  pass(mat: THREE.Material, target: THREE.WebGLRenderTarget | null, clear = true) {
    this.quad.material = mat;
    this.renderer.setRenderTarget(target);
    if (clear) this.renderer.clear();
    this.renderer.render(this.fsScene, this.fsCam);
  }

  /** render one motion-blur subframe and add it (weighted) into rtPre */
  renderSub(scene: THREE.Scene, cam: THREE.PerspectiveCamera, weight: number, first: boolean) {
    const r = this.renderer;
    r.setRenderTarget(this.rtScene);
    r.setClearColor(0x000000, 1);
    r.clear();
    r.render(scene, cam);
    const m = first ? this.copyMat : this.addMat;
    m.uniforms.tSrc.value = this.rtScene.texture;
    m.uniforms.gain.value = weight;
    this.pass(m, this.rtPre, first);
  }

  /** one DOF gather on the accumulated subframes (depth from the last = centre subframe) -> accum[slot] */
  resolveDof(slot: number, cam: THREE.PerspectiveCamera, dof: DofParams | null) {
    const u = this.dofMat.uniforms;
    u.tColor.value = this.rtPre.texture;
    u.tDepth.value = this.rtScene.depthTexture;
    u.near.value = cam.near;
    u.far.value = cam.far;
    u.focus.value = dof ? dof.focus : 1;
    // aperture is expressed in pixels of CoC at 1080p for an object at 2x the focus distance
    u.aperture.value = dof ? dof.aperture * 2 * (this.h / 1080) : 0;
    u.maxCoc.value = (dof?.maxCoc ?? 26) * (this.h / 1080);
    this.pass(this.dofMat, this.rtAccum[slot]);
  }

  /** mix accum[a] (1-k) + accum[b] k into accum[2] */
  mix(a: number, b: number, k: number) {
    this.copyMat.uniforms.tSrc.value = this.rtAccum[a].texture;
    this.copyMat.uniforms.gain.value = 1 - k;
    this.pass(this.copyMat, this.rtAccum[2], true);
    this.addMat.uniforms.tSrc.value = this.rtAccum[b].texture;
    this.addMat.uniforms.gain.value = k;
    this.pass(this.addMat, this.rtAccum[2], false);
    return 2;
  }

  finish(
    slot: number,
    o: {bloom: number; threshold: number; exposure: number; vignette: number; grain: number; fade: number; seed: number; overlay?: THREE.Texture | null; overlayMix?: number; overlayOnly?: number},
  ) {
    const src = this.rtAccum[slot].texture;
    this.threshMat.uniforms.tSrc.value = src;
    this.threshMat.uniforms.threshold.value = o.threshold;
    this.pass(this.threshMat, this.rtBloom[0].a);
    for (let i = 0; i < this.rtBloom.length; i++) {
      const lv = this.rtBloom[i];
      if (i > 0) {
        this.copyMat.uniforms.tSrc.value = this.rtBloom[i - 1].a.texture;
        this.copyMat.uniforms.gain.value = 1;
        this.pass(this.copyMat, lv.a);
      }
      const w = lv.a.width,
        h = lv.a.height;
      this.blurMat.uniforms.tSrc.value = lv.a.texture;
      this.blurMat.uniforms.dir.value.set(1 / w, 0);
      this.pass(this.blurMat, lv.b);
      this.blurMat.uniforms.tSrc.value = lv.b.texture;
      this.blurMat.uniforms.dir.value.set(0, 1 / h);
      this.pass(this.blurMat, lv.a);
    }
    const u = this.finalMat.uniforms;
    u.tSrc.value = src;
    for (let i = 0; i < 5; i++) u['tB' + i].value = this.rtBloom[i].a.texture;
    u.bloom.value = o.bloom;
    u.exposure.value = o.exposure;
    u.vignette.value = o.vignette;
    u.grain.value = o.grain;
    u.fade.value = o.fade;
    u.seed.value = o.seed;
    u.tOverlay.value = o.overlay ?? this.blank;
    u.overlayMix.value = o.overlay ? o.overlayMix ?? 1 : 0;
    u.overlayOnly.value = o.overlay ? o.overlayOnly ?? 0 : 0;
    this.pass(this.finalMat, null);
  }
}
