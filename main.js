import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 700;

const CONFIG = {
    horizonRadius: 2.0,
    diskInner: 2.7,
    diskOuter: 13.5,
    diskParticles: isSmallScreen ? 45000 : 90000,
    jetParticles: isSmallScreen ? 3500 : 8000,
    starCount: 5000,
    einsteinScale: 1.55, // Einstein radius relative to the shadow radius
    cameraDistance: 26,
    minDistance: 12,
    maxDistance: 48,
    introDistance: 120,
};

// Layer 0: everything behind the black hole (stars + far half of the disk), which gets lensed.
// Layer 1: everything in front (near half of the disk + horizon sphere), drawn on top unlensed.
const LAYER_BACK = 0;
const LAYER_FRONT = 1;

// ---------------------------------------------------------------------------
// Renderer, scene, camera
// ---------------------------------------------------------------------------

const canvas = document.getElementById('scene');

let renderer;
try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
} catch (err) {
    const msg = document.createElement('div');
    msg.className = 'error';
    msg.textContent = 'WebGL is not available in this browser, so the black hole cannot be rendered.';
    document.body.appendChild(msg);
    throw err;
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0x000000, 1);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 4000);
camera.position.set(0, 5, CONFIG.introDistance);
camera.lookAt(0, 0, 0);

// ---------------------------------------------------------------------------
// Event horizon
// ---------------------------------------------------------------------------

const horizon = new THREE.Mesh(
    new THREE.SphereGeometry(CONFIG.horizonRadius, 64, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
horizon.layers.set(LAYER_FRONT);
scene.add(horizon);

// ---------------------------------------------------------------------------
// Accretion disk (GPU-animated particles)
// ---------------------------------------------------------------------------

function createAccretionDisk() {
    const count = CONFIG.diskParticles;
    const radius = new Float32Array(count);
    const angle = new Float32Array(count);
    const height = new Float32Array(count);
    const seed = new Float32Array(count);
    const size = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        // Bias towards the inner edge, where the disk is densest and hottest.
        const t = Math.pow(Math.random(), 1.9);
        radius[i] = CONFIG.diskInner + (CONFIG.diskOuter - CONFIG.diskInner) * t;
        angle[i] = Math.random() * Math.PI * 2;
        // Approximate gaussian for disk thickness.
        height[i] = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        seed[i] = Math.random();
        size[i] = 0.6 + Math.pow(Math.random(), 3) * 2.4;
    }

    const geometry = new THREE.BufferGeometry();
    // Positions are computed in the vertex shader; this attribute only exists so three.js knows the vertex count.
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aRadius', new THREE.BufferAttribute(radius, 1));
    geometry.setAttribute('aAngle', new THREE.BufferAttribute(angle, 1));
    geometry.setAttribute('aHeight', new THREE.BufferAttribute(height, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

    const sharedUniforms = {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uCameraPos: { value: new THREE.Vector3() }, // camera position in disk-local space
        uInner: { value: CONFIG.diskInner },
        uOuter: { value: CONFIG.diskOuter },
        uPulseAge: { value: 1000 }, // seconds since the last click-triggered flare
    };

    const vertexShader = /* glsl */ `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform vec3 uCameraPos;
        uniform float uInner;
        uniform float uOuter;
        uniform float uSide;
        uniform float uPulseAge;

        attribute float aRadius;
        attribute float aAngle;
        attribute float aHeight;
        attribute float aSeed;
        attribute float aSize;

        varying vec3 vColor;
        varying float vAlpha;

        vec3 diskGradient(float t) {
            vec3 white  = vec3(1.00, 0.95, 0.88) * 1.6;
            vec3 yellow = vec3(1.00, 0.70, 0.30) * 1.0;
            vec3 orange = vec3(1.00, 0.36, 0.06) * 0.65;
            vec3 purple = vec3(0.55, 0.12, 0.75) * 0.45;
            vec3 violet = vec3(0.20, 0.05, 0.42) * 0.3;
            if (t < 0.06) return mix(white, yellow, t / 0.06);
            if (t < 0.22) return mix(yellow, orange, (t - 0.06) / 0.16);
            if (t < 0.55) return mix(orange, purple, (t - 0.22) / 0.33);
            return mix(purple, violet, (t - 0.55) / 0.45);
        }

        void main() {
            float r = aRadius;
            float ang;
            float stream = 0.0;

            if (aSeed < 0.07) {
                // A few percent of the gas peels away and spirals down into the hole,
                // speeding up and heating up as it falls.
                float p = fract(uTime * (0.02 + aSeed * 0.5) + aSeed * 37.0);
                float rStart = aRadius + 2.0;
                r = mix(rStart, uInner * 0.9, p * p);
                ang = aAngle + uTime * 3.2 / pow(rStart, 1.5) + p * p * 10.0;
                stream = smoothstep(0.0, 0.15, p) * smoothstep(1.0, 0.85, p);
            } else {
                // Keplerian rotation: inner orbits are much faster than outer ones.
                ang = aAngle + uTime * 3.2 / pow(r, 1.5);
            }

            float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);

            // Disk flares (gets thicker) with radius.
            float thickness = 0.04 + 0.035 * r;
            vec3 pos = vec3(cos(ang) * r, aHeight * thickness, -sin(ang) * r);

            // Split the disk into the half in front of / behind the black hole (relative to the camera).
            // The halves cross-fade over a band so the lensed and unlensed parts meet without a seam.
            float side = dot(pos, uCameraPos) / (length(pos) * length(uCameraPos));
            float frontWeight = smoothstep(-0.25, 0.25, side);
            float layerWeight = uSide > 0.0 ? frontWeight : 1.0 - frontWeight;
            if (layerWeight <= 0.0) {
                gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
                gl_PointSize = 0.0;
                return;
            }

            // Swirling turbulence: spiral arms sheared by differential rotation plus per-particle flicker.
            float arms = 0.5 + 0.5 * sin(ang * 3.0 + log(r) * 7.0 - uTime * 0.6);
            float clumps = 0.5 + 0.5 * sin(ang * 11.0 - r * 2.3 + aSeed * 6.2831);
            float flicker = 0.75 + 0.25 * sin(uTime * (2.0 + aSeed * 4.0) + aSeed * 40.0);
            float brightness = (0.35 + 0.65 * arms) * (0.6 + 0.4 * clumps) * flicker;
            brightness *= 1.0 + stream * 1.5;

            // Click-triggered flare: a shell of heated gas racing outward from the inner edge.
            float waveR = uInner + uPulseAge * 7.0;
            float pulse = exp(-pow((r - waveR) / 1.3, 2.0)) * exp(-uPulseAge * 0.45);

            // Relativistic Doppler beaming: the side spinning towards the camera is brighter.
            vec3 velocity = normalize(vec3(-sin(ang), 0.0, -cos(ang)));
            vec3 toCamera = normalize(uCameraPos - pos);
            float doppler = dot(velocity, toCamera);
            brightness *= 1.0 + 0.75 * doppler * (1.0 - t * 0.6);

            // Fade the outer edge into space and the inner edge into the plunge region.
            float edgeFade = smoothstep(1.0, 0.75, t) * smoothstep(0.0, 0.015, t);

            vColor = diskGradient(t) * max(brightness, 0.05);
            vColor = mix(vColor, vec3(1.6, 1.3, 1.6), pulse * 0.7) * (1.0 + pulse * 2.0);
            vAlpha = edgeFade * (0.12 + 0.18 * (1.0 - t));
            if (aSeed < 0.07) vAlpha = (0.25 + 0.2 * (1.0 - t)) * stream * smoothstep(1.0, 0.75, t);
            vAlpha *= layerWeight;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = aSize * (1.0 + (1.0 - t) * 0.6) * uPixelRatio * (34.0 / -mvPosition.z);
        }
    `;

    const fragmentShader = /* glsl */ `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            a *= a;
            gl_FragColor = vec4(vColor, a * vAlpha);
        }
    `;

    const makeHalf = (sideSign, layer) => {
        const material = new THREE.ShaderMaterial({
            uniforms: { ...sharedUniforms, uSide: { value: sideSign } },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const points = new THREE.Points(geometry, material);
        points.frustumCulled = false;
        points.layers.set(layer);
        return points;
    };

    const group = new THREE.Group();
    group.add(makeHalf(-1, LAYER_BACK));
    group.add(makeHalf(1, LAYER_FRONT));
    // A slight tilt keeps the disk from looking perfectly edge-on at rest.
    group.rotation.z = THREE.MathUtils.degToRad(-8);

    return { group, uniforms: sharedUniforms };
}

// ---------------------------------------------------------------------------
// Relativistic jets: helical streams of plasma fired from both poles
// ---------------------------------------------------------------------------

function createJets(sharedUniforms) {
    const count = CONFIG.jetParticles;
    const offset = new Float32Array(count);
    const seed = new Float32Array(count);
    const spread = new Float32Array(count);
    const dir = new Float32Array(count);
    const size = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        offset[i] = Math.random();
        seed[i] = Math.random();
        spread[i] = Math.pow(Math.random(), 2);
        dir[i] = i % 2 === 0 ? 1 : -1;
        size[i] = 0.6 + Math.random() * 1.6;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offset, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute('aSpread', new THREE.BufferAttribute(spread, 1));
    geometry.setAttribute('aDir', new THREE.BufferAttribute(dir, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

    const vertexShader = /* glsl */ `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform vec3 uCameraPos;
        uniform float uSide;
        uniform float uPulseAge;

        attribute float aOffset;
        attribute float aSeed;
        attribute float aSpread;
        attribute float aDir;
        attribute float aSize;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            float p = fract(uTime * (0.08 + aSeed * 0.06) + aOffset);
            float y = 1.6 + p * 30.0;
            float radius = 0.06 + y * (0.015 + 0.05 * aSpread);
            float ang = aOffset * 6.2831 + y * 0.45 - uTime * 2.5;
            vec3 pos = vec3(cos(ang) * radius, aDir * y, sin(ang) * radius);

            if (dot(pos, uCameraPos) * uSide < 0.0) {
                gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
                gl_PointSize = 0.0;
                return;
            }

            // Knots of brighter plasma travelling up the jet.
            float knots = 0.6 + 0.4 * sin(y * 1.3 - uTime * 6.0 + aDir);
            float boost = 1.0 + 2.0 * exp(-uPulseAge * 1.2);
            vec3 core = vec3(0.80, 0.88, 1.00) * 1.3;
            vec3 tail = vec3(0.45, 0.25, 1.00) * 0.5;
            vColor = mix(core, tail, smoothstep(0.0, 0.7, p)) * knots * boost;
            vAlpha = smoothstep(0.0, 0.04, p) * pow(1.0 - p, 1.6) * (0.35 - 0.2 * aSpread);

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = aSize * (1.0 + p * 2.0) * uPixelRatio * (34.0 / -mvPosition.z);
        }
    `;

    const fragmentShader = /* glsl */ `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vColor, a * a * vAlpha);
        }
    `;

    const group = new THREE.Group();
    for (const [sideSign, layer] of [[-1, LAYER_BACK], [1, LAYER_FRONT]]) {
        const material = new THREE.ShaderMaterial({
            uniforms: { ...sharedUniforms, uSide: { value: sideSign } },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const points = new THREE.Points(geometry, material);
        points.frustumCulled = false;
        points.layers.set(layer);
        group.add(points);
    }
    return group;
}

const disk = createAccretionDisk();
disk.group.add(createJets(disk.uniforms));
scene.add(disk.group);
disk.group.updateMatrixWorld();

// ---------------------------------------------------------------------------
// Star field (5,000 twinkling points)
// ---------------------------------------------------------------------------

function createStarField() {
    const count = CONFIG.starCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    const palette = [
        new THREE.Color(0.75, 0.82, 1.0),
        new THREE.Color(1.0, 1.0, 1.0),
        new THREE.Color(1.0, 0.92, 0.78),
        new THREE.Color(1.0, 0.78, 0.65),
        new THREE.Color(0.85, 0.75, 1.0),
    ];

    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
        v.randomDirection().multiplyScalar(500 + Math.random() * 400);
        positions.set([v.x, v.y, v.z], i * 3);

        const c = palette[Math.floor(Math.random() * palette.length)];
        colors.set([c.r, c.g, c.b], i * 3);

        sizes[i] = 0.8 + Math.pow(Math.random(), 6) * 3.5;
        phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: renderer.getPixelRatio() },
        },
        vertexShader: /* glsl */ `
            uniform float uTime;
            uniform float uPixelRatio;
            attribute vec3 aColor;
            attribute float aSize;
            attribute float aPhase;
            varying vec3 vColor;
            varying float vTwinkle;

            void main() {
                float speed = 0.8 + fract(aPhase * 13.37) * 2.6;
                float twinkle = 0.55 + 0.45 * sin(uTime * speed + aPhase);
                twinkle *= 0.85 + 0.15 * sin(uTime * speed * 2.7 + aPhase * 3.0);
                vTwinkle = twinkle;
                vColor = aColor;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = aSize * uPixelRatio * (0.7 + 0.5 * twinkle);
            }
        `,
        fragmentShader: /* glsl */ `
            varying vec3 vColor;
            varying float vTwinkle;

            void main() {
                float d = length(gl_PointCoord - 0.5);
                float core = smoothstep(0.5, 0.0, d);
                gl_FragColor = vec4(vColor * vTwinkle * 1.4, core * core);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(geometry, material);
    stars.layers.set(LAYER_BACK);
    return stars;
}

const stars = createStarField();
scene.add(stars);

// ---------------------------------------------------------------------------
// Procedural nebula sky. The fbm noise is expensive, so it is rendered once
// into a cube map at startup and then displayed with a cheap lookup shader.
// ---------------------------------------------------------------------------

function createNebula() {
    const LAYER_BAKE = 2;
    const geometry = new THREE.SphereGeometry(1500, 64, 32);

    const skyVertex = /* glsl */ `
        varying vec3 vDir;
        void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const bakeMaterial = new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: /* glsl */ `
            varying vec3 vDir;

            float hash(vec3 p) {
                p = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }

            float noise(vec3 x) {
                vec3 i = floor(x);
                vec3 f = fract(x);
                f = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
                        mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
                        mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
                    f.z);
            }

            float fbm(vec3 p) {
                float v = 0.0;
                float a = 0.5;
                for (int i = 0; i < 6; i++) {
                    v += a * noise(p);
                    p = p * 2.03 + 0.17;
                    a *= 0.5;
                }
                return v;
            }

            void main() {
                vec3 d = normalize(vDir);

                // Domain-warped clouds.
                float n = fbm(d * 2.2);
                float n2 = fbm(d * 4.0 + n * 2.0);
                float dust = fbm(d * 9.0 + 5.0);

                // A tilted galactic band where the gas is densest.
                float band = exp(-pow(dot(d, normalize(vec3(0.35, 1.0, 0.15))) * 2.4 + 0.25 * sin(d.x * 4.0), 2.0));

                vec3 deep    = vec3(0.020, 0.010, 0.050);
                vec3 magenta = vec3(0.260, 0.040, 0.230);
                vec3 blue    = vec3(0.050, 0.110, 0.300);
                vec3 ember   = vec3(0.300, 0.110, 0.050);

                vec3 col = mix(deep, magenta, smoothstep(0.35, 0.75, n2));
                col = mix(col, blue, smoothstep(0.5, 0.8, n) * 0.7);
                col += ember * pow(smoothstep(0.55, 0.85, n2 * n * 1.6), 2.0);
                col *= 0.25 + 1.1 * band;
                col *= mix(0.35, 1.0, smoothstep(0.3, 0.6, dust));

                gl_FragColor = vec4(col * 0.42, 1.0);
            }
        `,
        side: THREE.BackSide,
        depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, bakeMaterial);
    mesh.layers.set(LAYER_BAKE);
    scene.add(mesh);

    const cubeTarget = new THREE.WebGLCubeRenderTarget(isSmallScreen ? 512 : 1024, { type: THREE.HalfFloatType });
    const cubeCamera = new THREE.CubeCamera(1, 4000, cubeTarget);
    cubeCamera.children.forEach((c) => c.layers.set(LAYER_BAKE));
    cubeCamera.update(renderer, scene);

    bakeMaterial.dispose();
    mesh.material = new THREE.ShaderMaterial({
        uniforms: { tCube: { value: cubeTarget.texture } },
        vertexShader: skyVertex,
        fragmentShader: /* glsl */ `
            uniform samplerCube tCube;
            varying vec3 vDir;
            void main() {
                gl_FragColor = vec4(textureCube(tCube, vDir).rgb, 1.0);
            }
        `,
        side: THREE.BackSide,
        depthWrite: false,
    });
    mesh.renderOrder = -1;
    mesh.layers.set(LAYER_BACK);
    return mesh;
}

createNebula();

// ---------------------------------------------------------------------------
// Gravitational lensing pass
//
// 1. Render everything behind the hole into an offscreen target.
// 2. Remap that image with the point-lens equation (beta = theta - thetaE^2 / theta),
//    which bends the far side of the disk up and over the shadow and produces
//    an Einstein ring for the background stars.
// 3. Draw the near half of the disk and the horizon on top, unlensed.
// ---------------------------------------------------------------------------

const LensShader = {
    uniforms: {
        tBackground: { value: null },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uAspect: { value: 1 },
        uShadow: { value: 0.1 },
        uEinstein: { value: 0.15 },
        uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: /* glsl */ `
        uniform sampler2D tBackground;
        uniform vec2 uCenter;
        uniform float uAspect;
        uniform float uShadow;
        uniform float uEinstein;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
            // Work in aspect-corrected space so the lens stays circular.
            vec2 d = vUv - uCenter;
            d.x *= uAspect;
            float r = max(length(d), 1e-5);
            vec2 dir = d / r;

            // Point-mass lens equation. Inside the Einstein radius the source position
            // flips sign, mirroring light from the opposite side of the hole.
            // Light is split slightly by colour where the bending is strongest.
            float deflection = (uEinstein * uEinstein) / r;
            vec2 scale = vec2(1.0 / uAspect, 1.0);
            vec3 col;
            col.r = texture2D(tBackground, uCenter + dir * (r - deflection * 0.975) * scale).r;
            col.g = texture2D(tBackground, uCenter + dir * (r - deflection) * scale).g;
            col.b = texture2D(tBackground, uCenter + dir * (r - deflection * 1.025) * scale).b;

            // Black hole shadow with a soft edge.
            float shadow = smoothstep(uShadow * 0.97, uShadow * 1.03, r);
            col *= shadow;

            // Thin, hot photon ring hugging the shadow, plus a faint halo.
            float ringWidth = uShadow * 0.025;
            float ring = exp(-pow((r - uShadow * 1.05) / ringWidth, 2.0));
            float halo = exp(-max(r - uShadow, 0.0) / (uShadow * 0.35)) * shadow;
            float shimmer = 0.85 + 0.15 * sin(atan(dir.y, dir.x) * 6.0 + uTime * 1.5);
            col += vec3(1.0, 0.62, 0.32) * ring * 0.9 * shimmer;
            col += vec3(0.9, 0.35, 0.55) * halo * 0.08;

            gl_FragColor = vec4(col, 1.0);
        }
    `,
};

class LensedScenePass extends Pass {
    constructor(scene, camera) {
        super();
        this.scene = scene;
        this.camera = camera;
        this.needsSwap = true;

        this.backgroundTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
        this.material = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(LensShader.uniforms),
            vertexShader: LensShader.vertexShader,
            fragmentShader: LensShader.fragmentShader,
            depthTest: false,
            depthWrite: false,
        });
        this.uniforms = this.material.uniforms;
        this.uniforms.tBackground.value = this.backgroundTarget.texture;
        this.quad = new FullScreenQuad(this.material);
    }

    setSize(width, height) {
        this.backgroundTarget.setSize(width, height);
    }

    render(renderer, writeBuffer) {
        const oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        // 1. Background layer.
        this.camera.layers.set(LAYER_BACK);
        renderer.setRenderTarget(this.backgroundTarget);
        renderer.clear();
        renderer.render(this.scene, this.camera);

        // 2. Lensed background.
        const target = this.renderToScreen ? null : writeBuffer;
        renderer.setRenderTarget(target);
        renderer.clear();
        this.quad.render(renderer);

        // 3. Foreground layer on top.
        renderer.clearDepth();
        this.camera.layers.set(LAYER_FRONT);
        renderer.render(this.scene, this.camera);

        this.camera.layers.set(LAYER_BACK);
        renderer.autoClear = oldAutoClear;
    }

    dispose() {
        this.backgroundTarget.dispose();
        this.material.dispose();
        this.quad.dispose();
    }
}

const CinematicShader = {
    uniforms: {
        tDiffuse: { value: null },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uAspect: { value: 1 },
        uTime: { value: 0 },
        uWaveAge: { value: 1000 },
    },
    vertexShader: LensShader.vertexShader,
    fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform vec2 uCenter;
        uniform float uAspect;
        uniform float uTime;
        uniform float uWaveAge;
        varying vec2 vUv;

        void main() {
            // Gravitational wave: a ripple of space-time expanding from the hole.
            vec2 d = vUv - uCenter;
            d.x *= uAspect;
            float r = max(length(d), 1e-5);
            vec2 dir = d / r;
            float waveR = uWaveAge * 0.75;
            float envelope = exp(-pow((r - waveR) / 0.09, 2.0)) * exp(-uWaveAge * 0.6);
            float ripple = sin((r - waveR) * 80.0) * envelope;
            vec2 offset = dir * ripple * 0.012;
            offset.x /= uAspect;

            vec3 col = texture2D(tDiffuse, vUv + offset).rgb;
            col += vec3(0.55, 0.4, 1.0) * max(ripple, 0.0) * envelope * 0.06;

            // Vignette.
            vec2 v = vUv - 0.5;
            v.x *= uAspect;
            col *= 1.0 - smoothstep(0.4, 1.3, length(v)) * 0.8;

            // Film grain.
            float grain = fract(sin(dot(vUv + fract(uTime * 7.13), vec2(12.9898, 78.233))) * 43758.5453);
            col += (grain - 0.5) * 0.018;

            gl_FragColor = vec4(max(col, 0.0), 1.0);
        }
    `,
};

const composer = new EffectComposer(renderer);
const lensPass = new LensedScenePass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.25, 0.6);
composer.addPass(lensPass);
const cinematicPass = new ShaderPass(CinematicShader);
composer.addPass(bloomPass);
composer.addPass(cinematicPass);
composer.addPass(new OutputPass());

const BLOOM_STRENGTH = bloomPass.strength;

// Projects the black hole into screen space each frame to drive the lens uniforms.
const _center = new THREE.Vector3();
const _edge = new THREE.Vector3();
const _up = new THREE.Vector3();

function updateLensUniforms() {
    const aspect = camera.aspect;

    _center.set(0, 0, 0).project(camera);
    _up.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    _edge.copy(_up).multiplyScalar(CONFIG.horizonRadius).project(camera);

    const cx = _center.x * 0.5 + 0.5;
    const cy = _center.y * 0.5 + 0.5;
    const ex = _edge.x * 0.5 + 0.5;
    const ey = _edge.y * 0.5 + 0.5;
    const shadow = Math.hypot((ex - cx) * aspect, ey - cy);

    lensPass.uniforms.uCenter.value.set(cx, cy);
    lensPass.uniforms.uAspect.value = aspect;
    lensPass.uniforms.uShadow.value = shadow;
    lensPass.uniforms.uEinstein.value = shadow * CONFIG.einsteinScale;
    cinematicPass.uniforms.uCenter.value.set(cx, cy);
    cinematicPass.uniforms.uAspect.value = aspect;
}

// ---------------------------------------------------------------------------
// Mouse / touch parallax orbit
// ---------------------------------------------------------------------------

const pointer = { x: 0, y: 0 };
const orbit = {
    azimuth: 0,
    elevation: 0.7,
    distance: CONFIG.introDistance,
    targetDistance: CONFIG.cameraDistance,
};

function setPointer(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = (clientY / window.innerHeight) * 2 - 1;
}

window.addEventListener('pointermove', (e) => setPointer(e.clientX, e.clientY));
window.addEventListener('pointerdown', (e) => {
    setPointer(e.clientX, e.clientY);
    if (e.target === canvas) triggerPulse();
});
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        triggerPulse();
    } else if (e.key === 'h' || e.key === 'H') {
        document.querySelector('.overlay').classList.toggle('hidden');
    }
});
window.addEventListener('mouseleave', () => {
    pointer.x = 0;
    pointer.y = 0;
});
window.addEventListener('wheel', (e) => {
    orbit.targetDistance = THREE.MathUtils.clamp(
        orbit.targetDistance * Math.exp(e.deltaY * 0.001),
        CONFIG.minDistance,
        CONFIG.maxDistance
    );
}, { passive: true });

function updateCamera(time, delta) {
    // Frame-rate independent easing towards the pointer-driven target.
    const ease = 1 - Math.exp(-delta * 2.2);
    const drift = Math.sin(time * 0.05) * 0.25;

    const targetAzimuth = pointer.x * 0.85 + drift;
    const targetElevation = THREE.MathUtils.degToRad(11) - pointer.y * 0.32;

    orbit.azimuth += (targetAzimuth - orbit.azimuth) * ease;
    orbit.elevation += (targetElevation - orbit.elevation) * ease;
    // Distance eases more slowly, which turns the opening into a long fly-in.
    orbit.distance += (orbit.targetDistance - orbit.distance) * (1 - Math.exp(-delta * 0.8));

    const elevation = THREE.MathUtils.clamp(orbit.elevation, -0.6, 0.85);
    camera.position.set(
        Math.sin(orbit.azimuth) * Math.cos(elevation) * orbit.distance,
        Math.sin(elevation) * orbit.distance,
        Math.cos(orbit.azimuth) * Math.cos(elevation) * orbit.distance
    );
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
}

// ---------------------------------------------------------------------------
// Resize + render loop
// ---------------------------------------------------------------------------

function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);

    disk.uniforms.uPixelRatio.value = pixelRatio;
    stars.material.uniforms.uPixelRatio.value = pixelRatio;
}

window.addEventListener('resize', onResize);
onResize();

const clock = new THREE.Clock();
let pulseStart = -1000;

function triggerPulse() {
    pulseStart = clock.elapsedTime;
}

function animate() {
    const delta = Math.min(clock.getDelta(), 0.1);
    const time = clock.elapsedTime;

    updateCamera(time, delta);
    updateLensUniforms();

    disk.uniforms.uTime.value = time;
    disk.group.worldToLocal(disk.uniforms.uCameraPos.value.copy(camera.position));
    stars.material.uniforms.uTime.value = time;
    lensPass.uniforms.uTime.value = time;
    cinematicPass.uniforms.uTime.value = time;

    const pulseAge = time - pulseStart;
    disk.uniforms.uPulseAge.value = pulseAge;
    cinematicPass.uniforms.uWaveAge.value = pulseAge;
    bloomPass.strength = BLOOM_STRENGTH * (1 + 0.8 * Math.exp(-pulseAge * 1.5));

    composer.render(delta);
}

renderer.setAnimationLoop(animate);
