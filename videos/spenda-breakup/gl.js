// Spenda 2.0: GPU layers (Three.js). Every frame is rendered from HyperFrames time (hf-seek).
//   s3-gl  13.75 → 15.0   the frozen chat explodes into ~20k GPU particles
//   s4-gl  15.0  → 20.0   particles gather into the Spenda S, which becomes a 3D extruded mark
//                           that spins, folds and unfolds its two ribbon leaves, and lands at 17.14 s
//   s5-gl  23.2  → 24.6   a glossy green USDT coin spins out of the phone toward the camera
import * as THREE from "./vendor/three.module.js";

const W = 1080, H = 1920;
const FOV = 30;
const DIST = H / 2 / Math.tan((FOV * Math.PI) / 360); // world unit = 1 px at z = 0
const LAND = (60 / 112) * 32; // 17.142857 s: logo lands on beat 32
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut3 = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const toWorld = (px, py) => [px - W / 2, H / 2 - py];

function mkLayer(id) {
  const canvas = document.getElementById(id);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, W / H, 1, 20000);
  camera.position.set(0, 0, DIST);
  return { renderer, scene, camera, live: false };
}
function blank(L) {
  if (!L.live) return;
  L.renderer.clear();
  L.live = false;
}

const pointVS = `
  uniform float uT; uniform float uMode; uniform float uSize;
  attribute vec3 aStart; attribute vec3 aVel; attribute vec3 aCol; attribute float aSeed;
  varying vec3 vCol; varying float vA;
  void main() {
    vec3 p;
    float a = 1.0;
    if (uMode < 0.5) {
      // explode: shockwave delay from the impact point, ballistic flight with drag
      float t = max(0.0, uT - aSeed * 0.22);
      float k = (1.0 - exp(-1.6 * t)) / 1.6;
      p = position + aVel * k + vec3(0.0, -160.0, 0.0) * t * t;
      a = 1.0 - smoothstep(0.55, 1.15, t);
    } else {
      // gather: swirl in from a seeded shell onto the logo target
      float q = clamp((uT - aSeed * 0.45) / 0.95, 0.0, 1.0);
      float e = 1.0 - pow(1.0 - q, 3.0);
      float ang = (1.0 - e) * (2.2 + aSeed * 2.0);
      vec3 s = aStart - vec3(0.0, 260.0, 0.0);
      vec3 sw = vec3(s.x * cos(ang) - s.z * sin(ang), s.y, s.x * sin(ang) + s.z * cos(ang)) + vec3(0.0, 260.0, 0.0);
      p = mix(sw, position, e);
      a = smoothstep(0.0, 0.25, uT - aSeed * 0.3) * (1.0 - smoothstep(1.22, 1.5, uT));
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (${DIST.toFixed(1)} / -mv.z);
    gl_Position = projectionMatrix * mv;
    vCol = aCol; vA = a;
  }`;
const pointFS = `
  varying vec3 vCol; varying float vA;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d);
    if (r > 0.25) discard;
    gl_FragColor = vec4(vCol, vA * (1.0 - r * 2.2));
  }`;
function pointsMaterial(size) {
  return new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uMode: { value: 0 }, uSize: { value: size } },
    vertexShader: pointVS, fragmentShader: pointFS, transparent: true, depthWrite: false,
  });
}

// ---------------------------------------------------------------- S3: chat → particles
const L3 = mkLayer("s3-gl");
let pts3 = null;
function drawDomToCanvas(rootEl) {
  // rasterise the frozen chat card (boxes + text) so the particles carry its real look
  const rootRect = document.getElementById("root").getBoundingClientRect();
  const k = W / rootRect.width;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const els = [rootEl, ...rootEl.querySelectorAll("*")];
  for (const el of els) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || parseFloat(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const x = (r.left - rootRect.left) * k, y = (r.top - rootRect.top) * k, w = r.width * k, h = r.height * k;
    const bg = cs.backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)") {
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, Math.min(parseFloat(cs.borderTopLeftRadius) || 0, h / 2));
      ctx.fill();
    }
    let text = "";
    for (const n of el.childNodes) if (n.nodeType === 3) text += n.textContent;
    text = text.trim();
    if (text) {
      ctx.fillStyle = cs.color;
      ctx.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * 1}px ${cs.fontFamily}`;
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + h / 2);
    }
  }
  return ctx.getImageData(0, 0, W, H).data;
}
function buildS3() {
  const card = document.querySelector("#s3-chat");
  const img = drawDomToCanvas(card);
  const pos = [], vel = [], col = [], seed = [];
  let n = 0;
  const cx = 540, cy = 760;
  for (let y = 370; y < 1150; y += 4) {
    for (let x = 100; x < 980; x += 4) {
      const i = (y * W + x) * 4;
      if (img[i + 3] < 100) continue;
      const lum = (img[i] + img[i + 1] + img[i + 2]) / 765;
      n++;
      if (lum < 0.1 && hash(n * 1.37) > 0.45) continue; // thin out the dark card body
      const [wx, wy] = toWorld(x, y);
      pos.push(wx, wy, 0);
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) + 1;
      const sp = 220 + 1500 * Math.pow(hash(n * 2.31), 2.2);
      const jit = (hash(n * 4.7) - 0.5) * 0.9;
      const ax = dx / d + jit, ay = dy / d - jit;
      vel.push(ax * sp, -ay * sp, 300 + 2600 * hash(n * 6.1));
      const c = Math.max(lum, 0.16);
      col.push(Math.min(1, img[i] / 255 + (c - lum)), Math.min(1, img[i + 1] / 255 + (c - lum)), Math.min(1, img[i + 2] / 255 + (c - lum)));
      seed.push(Math.min(1, d / 700) * (0.7 + 0.3 * hash(n * 8.9)));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aVel", new THREE.Float32BufferAttribute(vel, 3));
  g.setAttribute("aCol", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
  g.setAttribute("aStart", new THREE.Float32BufferAttribute(pos, 3));
  const m = pointsMaterial(5.2);
  pts3 = new THREE.Points(g, m);
  L3.scene.add(pts3);
}
function renderS3(t) {
  if (!pts3 || t < 13.75 || t > 15.05) return blank(L3);
  pts3.material.uniforms.uT.value = t - 13.75;
  L3.renderer.render(L3.scene, L3.camera);
  L3.live = true;
}

// ---------------------------------------------------------------- S4: particles → 3D Spenda S
const L4 = mkLayer("s4-gl");
const LOGO = { cx: 119.25, cy: 119.25, s: 440 / 122.5, px: 540, py: 700 };
const lw = (x, y) => [(x - LOGO.cx) * LOGO.s, -(y - LOGO.cy) * LOGO.s];
let pts4 = null, logoGroup = null, leafTop = null, leafBot = null, logoMats = [];

function leafShape(x0, y0, x1, y1, r) {
  // rounded rect in SVG units, radii [tl, tr, br, bl]; built in world space (y up)
  const [tl, tr, br, bl] = r.map((v) => v * LOGO.s);
  const [X0, Ytop] = lw(x0, y0), [X1, Ybot] = lw(x1, y1);
  const s = new THREE.Shape();
  s.moveTo(X0 + bl, Ybot);
  s.lineTo(X1 - br, Ybot);
  s.absarc(X1 - br, Ybot + br, br, -Math.PI / 2, 0, false);
  s.lineTo(X1, Ytop - tr);
  s.absarc(X1 - tr, Ytop - tr, tr, 0, Math.PI / 2, false);
  s.lineTo(X0 + tl, Ytop);
  s.absarc(X0 + tl, Ytop - tl, tl, Math.PI / 2, Math.PI, false);
  s.lineTo(X0, Ybot + bl);
  s.absarc(X0 + bl, Ybot + bl, bl, Math.PI, Math.PI * 1.5, false);
  return s;
}
function buildS4() {
  // lights
  L4.scene.add(new THREE.HemisphereLight(0xfff4e6, 0x0b1a10, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(400, 700, 1400);
  L4.scene.add(key);
  const rim = new THREE.PointLight(0x22c55e, 3.0, 0, 0);
  rim.position.set(-500, 600, -500);
  L4.scene.add(rim);
  const warm = new THREE.PointLight(0xffe2c0, 1.6, 0, 0);
  warm.position.set(700, -300, 900);
  L4.scene.add(warm);
  L4.scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  // extruded leaves, each on a hinge pivot so the ribbon can fold and unfold
  const ext = { depth: 70, bevelEnabled: true, bevelThickness: 10, bevelSize: 7, bevelSegments: 5, curveSegments: 28 };
  const mat = () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.26, metalness: 0.08, clearcoat: 1, clearcoatRoughness: 0.12, emissive: 0x1a1a1a, transparent: true, opacity: 0 });
  const topGeo = new THREE.ExtrudeGeometry(leafShape(105, 58, 163.5, 117.5, [35, 6, 6, 6]), ext);
  const botGeo = new THREE.ExtrudeGeometry(leafShape(75, 122, 134.5, 180.5, [6, 6, 30, 6]), ext);
  topGeo.translate(0, 0, -35);
  botGeo.translate(0, 0, -35);
  const hingeTop = lw(0, 117.5)[1], hingeBot = lw(0, 122)[1];
  topGeo.translate(0, -hingeTop, 0);
  botGeo.translate(0, -hingeBot, 0);
  const m1 = mat(), m2 = mat();
  logoMats = [m1, m2];
  leafTop = new THREE.Group(); leafTop.position.y = hingeTop; leafTop.add(new THREE.Mesh(topGeo, m1));
  leafBot = new THREE.Group(); leafBot.position.y = hingeBot; leafBot.add(new THREE.Mesh(botGeo, m2));
  logoGroup = new THREE.Group();
  logoGroup.add(leafTop, leafBot);
  logoGroup.position.set(LOGO.px - W / 2, H / 2 - LOGO.py, 0);
  L4.scene.add(logoGroup);

  // particle targets sampled from the flat mark
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.setTransform(LOGO.s, 0, 0, LOGO.s, LOGO.px - LOGO.cx * LOGO.s, LOGO.py - LOGO.cy * LOGO.s);
  ctx.fillStyle = "#fff";
  ctx.fill(new Path2D("M140 58 H157.5 A6 6 0 0 1 163.5 64 V111.5 A6 6 0 0 1 157.5 117.5 H111 A6 6 0 0 1 105 111.5 V93 A35 35 0 0 1 140 58 Z"));
  ctx.fill(new Path2D("M81 122 H128.5 A6 6 0 0 1 134.5 128 V150.5 A30 30 0 0 1 104.5 180.5 H81 A6 6 0 0 1 75 174.5 V128 A6 6 0 0 1 81 122 Z"));
  const img = ctx.getImageData(0, 0, W, H).data;
  const pos = [], start = [], col = [], seed = [], vel = [];
  let n = 0;
  for (let y = 420; y < 980; y += 4) for (let x = 260; x < 820; x += 4) {
    if (img[(y * W + x) * 4 + 3] < 128) continue;
    n++;
    const [wx, wy] = toWorld(x, y);
    pos.push(wx, wy, 0);
    const th = hash(n * 1.9) * Math.PI * 2, ph = Math.acos(2 * hash(n * 3.3) - 1), r = 700 + 900 * hash(n * 5.7);
    start.push(r * Math.sin(ph) * Math.cos(th), 260 + r * Math.cos(ph) * 0.8, -900 + r * Math.sin(ph) * Math.sin(th));
    const g = hash(n * 7.1) > 0.86;
    col.push(g ? 0.13 : 1.0, g ? 0.77 : 0.95, g ? 0.37 : 0.88);
    seed.push(hash(n * 9.7));
    vel.push(0, 0, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aStart", new THREE.Float32BufferAttribute(start, 3));
  geo.setAttribute("aCol", new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
  geo.setAttribute("aVel", new THREE.Float32BufferAttribute(vel, 3));
  const m = pointsMaterial(6.0);
  m.uniforms.uMode.value = 1;
  m.blending = THREE.AdditiveBlending;
  pts4 = new THREE.Points(geo, m);
  L4.scene.add(pts4);
}
function renderS4(t) {
  if (!logoGroup || t < 14.98 || t > 20.6) return blank(L4);
  const u = t - 15.0;
  pts4.material.uniforms.uT.value = u;
  pts4.visible = u < 1.5;
  // mesh: appears as the particles settle, spins 1.25 turns, folds/unfolds, lands on the beat
  const T0 = 16.2;
  const a = clamp01((t - T0) / 0.25);
  logoMats.forEach((mm) => (mm.opacity = a));
  logoGroup.visible = t >= T0;
  const spin = clamp01((t - T0) / (LAND - T0));
  const settle = t > LAND ? t - LAND : 0;
  logoGroup.rotation.y = -Math.PI * 2.5 * (1 - easeOut3(spin)) + 0.16 * Math.sin(settle * 1.1) * (1 - Math.exp(-settle * 2));
  logoGroup.rotation.x = 0.42 * (1 - easeOut3(spin)) + 0.05 * Math.sin(settle * 0.8);
  const fold = Math.sin(Math.PI * clamp01((t - T0) / (LAND - T0 - 0.05))) * 1.15;
  leafTop.rotation.x = -fold;
  leafBot.rotation.x = fold;
  const land = t >= LAND ? 1 + 0.07 * Math.exp(-(t - LAND) * 9) * Math.cos((t - LAND) * 30) : 0.9 + 0.1 * easeInOut(spin);
  logoGroup.scale.setScalar(land);
  logoGroup.position.z = t < LAND ? -500 * (1 - easeOut3(spin)) : 0;
  L4.renderer.render(L4.scene, L4.camera);
  L4.live = true;
}

// ---------------------------------------------------------------- S5: USDT coin
const L5 = mkLayer("s5-gl");
let coin = null;
function coinFace() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(200, 180, 30, 256, 256, 260);
  g.addColorStop(0, "#5BE38D"); g.addColorStop(0.55, "#22C55E"); g.addColorStop(1, "#11793A");
  x.fillStyle = g; x.beginPath(); x.arc(256, 256, 256, 0, Math.PI * 2); x.fill();
  x.strokeStyle = "rgba(255,255,255,0.55)"; x.lineWidth = 10; x.beginPath(); x.arc(256, 256, 214, 0, Math.PI * 2); x.stroke();
  x.fillStyle = "#FFFFFF"; // Tether-style T with a band
  x.fillRect(136, 124, 240, 62);
  x.fillRect(222, 124, 68, 268);
  x.lineWidth = 16; x.strokeStyle = "#FFFFFF"; x.beginPath(); x.ellipse(256, 250, 132, 30, 0, 0, Math.PI * 2); x.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function buildS5() {
  L5.scene.add(new THREE.HemisphereLight(0xffffff, 0x0a1a10, 1.4));
  const k = new THREE.DirectionalLight(0xffffff, 2.6); k.position.set(500, 800, 1500); L5.scene.add(k);
  const r = new THREE.PointLight(0xfff1dc, 2.2, 0, 0); r.position.set(-700, -200, 1200); L5.scene.add(r);
  const face = coinFace();
  const side = new THREE.MeshStandardMaterial({ color: 0x16a34a, metalness: 0.75, roughness: 0.22 });
  const cap = new THREE.MeshStandardMaterial({ map: face, metalness: 0.35, roughness: 0.28 });
  const geo = new THREE.CylinderGeometry(150, 150, 26, 96);
  coin = new THREE.Mesh(geo, [side, cap, cap]);
  L5.scene.add(coin);
}
function renderS5(t) {
  if (!coin || t < 23.2 || t > 24.6) return blank(L5);
  const p = clamp01((t - 23.25) / 1.2);
  const [sx, sy] = toWorld(520, 760);
  coin.position.set(sx + 160 * p, sy - 260 * p + 120 * Math.sin(p * Math.PI), 60 + 3300 * Math.pow(p, 2.2));
  coin.rotation.set(Math.PI / 2 - 0.35 + 0.25 * Math.sin(p * 6), 0, 0);
  coin.rotateZ(p * 13.5);
  coin.scale.setScalar(0.25 + 0.75 * clamp01(p / 0.18));
  coin.visible = t >= 23.25;
  L5.renderer.render(L5.scene, L5.camera);
  L5.live = true;
}

// ---------------------------------------------------------------- seek wiring
function renderAt(t) {
  renderS3(t);
  renderS4(t);
  renderS5(t);
}
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["spenda-gl"] = (async () => {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  buildS4();
  buildS5();
  buildS3();
  renderAt(window.__hfThreeTime || 0);
})();
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
