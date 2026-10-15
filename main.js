import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 700;

const CONFIG = {
    horizonRadius: 2.0,
    diskInner: 2.7,
    diskOuter: 13.5,
    diskParticles: isSmallScreen ? 45000 : 90000,
    starCount: 5000,
    einsteinScale: 1.55, // Einstein radius relative to the shadow radius
    cameraDistance: 26,
    minDistance: 12,
    maxDistance: 48,
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

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 5, CONFIG.cameraDistance);
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
    };

    const vertexShader = /* glsl */ `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform vec3 uCameraPos;
        uniform float uInner;
        uniform float uOuter;
        uniform float uSide;

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
            float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);

            // Keplerian rotation: inner orbits are much faster than outer ones.
            float omega = 3.2 / pow(r, 1.5);
            float ang = aAngle + uTime * omega;

            // Disk flares (gets thicker) with radius.
            float thickness = 0.04 + 0.035 * r;
            vec3 pos = vec3(cos(ang) * r, aHeight * thickness, -sin(ang) * r);

            // Split the disk into the half in front of / behind the black hole (relative to the camera).
            float side = dot(pos, uCameraPos);
            if (side * uSide < 0.0) {
                gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
                gl_PointSize = 0.0;
                return;
            }

            // Swirling turbulence: spiral arms sheared by differential rotation plus per-particle flicker.
            float arms = 0.5 + 0.5 * sin(ang * 3.0 + log(r) * 7.0 - uTime * 0.6);
            float clumps = 0.5 + 0.5 * sin(ang * 11.0 - r * 2.3 + aSeed * 6.2831);
            float flicker = 0.75 + 0.25 * sin(uTime * (2.0 + aSeed * 4.0) + aSeed * 40.0);
            float brightness = (0.35 + 0.65 * arms) * (0.6 + 0.4 * clumps) * flicker;

            // Relativistic Doppler beaming: the side spinning towards the camera is brighter.
            vec3 velocity = normalize(vec3(-sin(ang), 0.0, -cos(ang)));
            vec3 toCamera = normalize(uCameraPos - pos);
            float doppler = dot(velocity, toCamera);
            brightness *= 1.0 + 0.75 * doppler * (1.0 - t * 0.6);

            // Fade the outer edge into space and the inner edge into the plunge region.
            float edgeFade = smoothstep(1.0, 0.75, t) * smoothstep(0.0, 0.015, t);

            vColor = diskGradient(t) * max(brightness, 0.05);
            vAlpha = edgeFade * (0.12 + 0.18 * (1.0 - t));

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

const disk = createAccretionDisk();
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
            float sourceR = r - (uEinstein * uEinstein) / r;
            vec2 src = dir * sourceR;
            src.x /= uAspect;
            vec3 col = texture2D(tBackground, uCenter + src).rgb;

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

const composer = new EffectComposer(renderer);
const lensPass = new LensedScenePass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.25, 0.6);
composer.addPass(lensPass);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

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
}

// ---------------------------------------------------------------------------
// Mouse / touch parallax orbit
// ---------------------------------------------------------------------------

const pointer = { x: 0, y: 0 };
const orbit = {
    azimuth: 0,
    elevation: THREE.MathUtils.degToRad(11),
    distance: CONFIG.cameraDistance,
    targetDistance: CONFIG.cameraDistance,
};

function setPointer(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = (clientY / window.innerHeight) * 2 - 1;
}

window.addEventListener('pointermove', (e) => setPointer(e.clientX, e.clientY));
window.addEventListener('pointerdown', (e) => setPointer(e.clientX, e.clientY));
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
    orbit.distance += (orbit.targetDistance - orbit.distance) * ease;

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

function animate() {
    const delta = Math.min(clock.getDelta(), 0.1);
    const time = clock.elapsedTime;

    updateCamera(time, delta);
    updateLensUniforms();

    disk.uniforms.uTime.value = time;
    disk.group.worldToLocal(disk.uniforms.uCameraPos.value.copy(camera.position));
    stars.material.uniforms.uTime.value = time;
    lensPass.uniforms.uTime.value = time;

    composer.render(delta);
}

renderer.setAnimationLoop(animate);
