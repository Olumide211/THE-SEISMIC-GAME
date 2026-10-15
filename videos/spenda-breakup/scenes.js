/* Spenda 2.0: The Breakup Letter. Root choreography.
   One timeline (created by HyperShader so shader transitions own scene visibility),
   every beat placed at global seconds on the 112 BPM grid. Seek-safe: all per-frame
   state is a pure function of tl.time(). */
(function () {
  const BEAT = 60 / 112;
  const b = (n) => n * BEAT; // beat -> seconds

  // Scene handoffs: every one sits in a VO gap, so no caption is on screen while a shader runs.
  const X = {
    s1s2: 4.62, s2s3: 10.52, s3s4: 14.55, s4s5: 19.95, s56a: 29.75,
    s6ab: 31.95, s6bc: 33.75, s6c7: 36.7, s78: 40.95,
  };

  const tl = HyperShader.init({
    bgColor: "#000000",
    accentColor: "#FFF1DC", // warm-white glow on the shaders: never blue
    scenes: ["s1", "s2", "s3", "s4", "s5", "s6a", "s6b", "s6c", "s7", "s8"],
    transitions: [
      { time: X.s1s2, shader: "glitch", duration: 0.36 },
      { time: X.s2s3, shader: "chromatic-split", duration: 0.34 },
      { time: X.s3s4, shader: "domain-warp", duration: 0.45 },
      { time: X.s4s5, shader: "light-leak", duration: 0.6 },
      { time: X.s56a, shader: "whip-pan", duration: 0.34 },
      { time: X.s6ab, shader: "whip-pan", duration: 0.3 },
      { time: X.s6bc, shader: "whip-pan", duration: 0.3 },
      { time: X.s6c7, shader: "cinematic-zoom", duration: 0.26 },
      { time: X.s78, shader: "cross-warp-morph", duration: 0.45 },
    ],
  });

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const sh = (n) => hash(n) * 2 - 1; // -1..1
  // A driver tween: onUpdate receives scene-agnostic global time.
  const drive = (start, dur, fn) => {
    const o = { p: 0 };
    tl.fromTo(o, { p: 0 }, { p: 1, duration: dur, ease: "none", onUpdate: () => fn(tl.time(), o.p) }, start);
  };
  const fmtClock = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60);
    return [h, m, x].map((v) => String(v).padStart(2, "0")).join(":");
  };

  // ------------------------------------------------------------ ambient: film grain on every scene
  const grains = $$(".grain");
  drive(0, 45, (t) => {
    const f = Math.floor(t * 30);
    const x = Math.floor(hash(f * 3.1) * 256), y = Math.floor(hash(f * 7.7) * 256);
    grains.forEach((g) => (g.style.backgroundPosition = `${x}px ${y}px`));
  });

  // ============================================================ S1 HOOK (0 → 4.62)
  const chats = ["s1-chat", "s1-gw", "s1-gc"];
  const all = (suffix) => chats.map((c) => `#${c}${suffix}`).join(",");
  tl.fromTo("#s1-stack", { scale: 0.9, y: 60, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, 0.04);
  tl.fromTo("#s1-timer-row", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, 0.12);
  [0, 1, 2].forEach((i) => {
    const at = [0.36, 1.08, 2.14][i];
    tl.fromTo(all(`-m${i}`), { scale: 0.6, y: 30, opacity: 0, transformOrigin: i === 1 ? "100% 100%" : "0% 100%" },
      { scale: 1, y: 0, opacity: 1, duration: 0.32, ease: "back.out(2.2)" }, at);
  });
  tl.fromTo(all("-typing"), { opacity: 0, scale: 0.7, transformOrigin: "0% 100%" }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, 3.0);
  // typing dots bounce on the beat (finite)
  $$("#s1-chat-typing i").forEach((d, i) => {
    tl.to(d, { y: -10, duration: BEAT / 2, ease: "sine.inOut", yoyo: true, repeat: 2 }, 3.05 + i * 0.12);
  });
  tl.fromTo("#s1-hand-m", { rotation: 0, svgOrigin: "32 32" }, { rotation: 2160, svgOrigin: "32 32", duration: X.s1s2 + 0.4, ease: "power1.in" }, 0);
  tl.fromTo("#s1-hand-h", { rotation: 0, svgOrigin: "32 32" }, { rotation: 200, svgOrigin: "32 32", duration: X.s1s2 + 0.4, ease: "power1.in" }, 0);
  const timerEl = $("#s1-timer");
  drive(0, X.s1s2 + 0.4, (t) => (timerEl.textContent = fmtClock(39 * 60 + 47 + t * 5.4)));
  // camera shake + RGB-split bursts (chromatic-glitch, Form A on the whole chat)
  const BURSTS = [[0.36, 0.24, 1], [2.14, 0.28, 1], [3.3, 0.18, 0.7], [4.18, 0.5, 1.4]];
  const ghostW = $("#s1-stack .ghost.warm"), ghostC = $("#s1-stack .ghost.cool"), cam = $("#s1-cam"), scan = $("#s1-scan");
  drive(0, X.s1s2 + 0.4, (t) => {
    let amp = 0;
    BURSTS.forEach(([s, d, k]) => { if (t >= s && t < s + d) amp = Math.max(amp, k * Math.pow(1 - (t - s) / d, 2)); });
    const steady = 0.18 + 0.25 * (t / X.s1s2); // nervous hand-held drift that grows
    const step = Math.floor(t * 20);
    cam.style.transform = `translate(${(sh(step) * (4 + 22 * amp) + Math.sin(t * 9) * 3 * steady).toFixed(2)}px, ${(sh(step + 99) * (3 + 14 * amp)).toFixed(2)}px) rotate(${(sh(step + 7) * 0.5 * amp).toFixed(3)}deg)`;
    const split = 18 * amp;
    ghostW.style.opacity = amp > 0.02 ? 0.75 : 0;
    ghostC.style.opacity = amp > 0.02 ? 0.75 : 0;
    ghostW.style.transform = `translate(${(-split + sh(step + 3) * split * 0.5).toFixed(1)}px, ${(sh(step + 5) * split * 0.3).toFixed(1)}px)`;
    ghostC.style.transform = `translate(${(split + sh(step + 4) * split * 0.5).toFixed(1)}px, ${(sh(step + 6) * split * 0.3).toFixed(1)}px)`;
    scan.style.opacity = amp > 0.02 ? 0.9 : 0.25;
  });

  // ============================================================ S2 THE PAIN (4.62 → 10.52)
  const SL = [
    { el: "#s2-w0", in: 5.0, out: 6.48 },
    { el: "#s2-w1", in: 6.7, out: 8.08 },
    { el: "#s2-w2", in: 8.3, out: 10.02 },
  ];
  tl.fromTo("#s2-chip", { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, 4.85);
  const s2timer = $("#s2-timer");
  drive(4.62, 6.2, (t) => (s2timer.textContent = fmtClock(40 * 60 + 16 + (t - 4.62) * 8.5)));
  tl.fromTo("#s2-chip i", { opacity: 1 }, { opacity: 0.2, duration: BEAT / 2, ease: "steps(1)", yoyo: true, repeat: 9 }, 4.9);
  tl.fromTo("#s2-ghost", { x: -90, opacity: 0.0 }, { x: 90, opacity: 1, duration: 5.9, ease: "none" }, 4.62);
  // three distinct entrances (kinetic-beat-slam)
  tl.fromTo(SL[0].el, { scale: 1.7, filter: "blur(18px)", opacity: 0 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: 0.38, ease: "power4.out" }, SL[0].in);
  tl.fromTo(SL[1].el, { x: -760, skewX: -18, opacity: 0 }, { x: 0, skewX: 0, opacity: 1, duration: 0.34, ease: "expo.out" }, SL[1].in);
  tl.fromTo(SL[2].el, { y: 190, rotation: 7, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.42, ease: "circ.out" }, SL[2].in);
  SL.forEach((s, i) => {
    tl.to(s.el, { scale: 1.035, duration: s.out - s.in - 0.45, ease: "sine.inOut" }, s.in + 0.45);
    tl.set(s.el, { opacity: 0 }, s.out); // the word becomes particles here (canvas below)
    tl.fromTo("#s2-flash", { opacity: 0.32 }, { opacity: 0, duration: 0.14, ease: "power2.out", immediateRender: false }, s.out);
  });
  // RGB-split on entrance and right before the shatter: quantized jitter on text-shadow
  const slamEls = SL.map((s) => $(s.el));
  drive(4.62, 6.0, (t) => {
    const step = Math.floor(t * 24);
    slamEls.forEach((el, i) => {
      const s = SL[i];
      let amp = 0;
      if (t >= s.in && t < s.in + 0.3) amp = 1 - (t - s.in) / 0.3;
      if (t >= s.out - 0.22 && t < s.out) amp = Math.max(amp, (t - (s.out - 0.22)) / 0.22);
      const d = (10 * amp * (0.6 + 0.4 * hash(step + i))).toFixed(1);
      el.style.textShadow = amp > 0.01 ? `${d}px 0 rgba(255,59,48,0.85), ${-d}px ${(sh(step) * 3).toFixed(1)}px rgba(0,229,255,0.75)` : "none";
    });
  });

  // Word → particles (canvas 2D, seeded). Points sampled from the word's own glyphs.
  const pc = $("#s2-particles"), pctx = pc.getContext("2d");
  let wordParts = null;
  function sampleWords() {
    const root = $("#root").getBoundingClientRect();
    const k = 1080 / root.width;
    const off = document.createElement("canvas");
    off.width = 1080; off.height = 1920;
    const o = off.getContext("2d");
    return SL.map((s, wi) => {
      o.clearRect(0, 0, 1080, 1920);
      o.fillStyle = "#fff";
      o.textBaseline = "middle";
      o.textAlign = "center";
      o.font = '900 108px "Montserrat"';
      $$(`${s.el} span`).forEach((sp) => {
        const r = sp.getBoundingClientRect();
        o.fillText(sp.textContent, 540, ((r.top + r.bottom) / 2 - root.top) * k + 4);
      });
      const img = o.getImageData(0, 0, 1080, 1920).data;
      const pts = [];
      let n = 0;
      for (let y = 560; y < 1000; y += 4) for (let x = 40; x < 1040; x += 4) {
        if (img[(y * 1080 + x) * 4 + 3] > 128) {
          n++;
          const a = Math.atan2(y - 780, x - 540) + sh(n * 1.3 + wi) * 0.9;
          const sp = 160 + 900 * Math.pow(hash(n * 2.7 + wi * 13), 2);
          pts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, r: 2.2 + hash(n * 5.1) * 2.6, red: hash(n * 9.3 + wi) > 0.9 });
        }
      }
      return pts;
    });
  }
  drive(4.62, 6.0, (t) => {
    if (!wordParts) {
      if (!document.fonts || document.fonts.status !== "loaded") return;
      wordParts = sampleWords();
    }
    pctx.clearRect(0, 0, 1080, 1920);
    SL.forEach((s, i) => {
      const dt = t - s.out;
      if (dt < 0 || dt > 1.25) return;
      const drag = (1 - Math.exp(-2.2 * dt)) / 2.2; // integrated velocity with drag
      const a = Math.max(0, 1 - dt / 1.25);
      wordParts[i].forEach((p) => {
        pctx.globalAlpha = a;
        pctx.fillStyle = p.red ? "#FF3B30" : "#FFFFFF";
        pctx.fillRect(p.x + p.vx * drag, p.y + p.vy * drag + 140 * dt * dt, p.r, p.r);
      });
    });
    pctx.globalAlpha = 1;
  });

  // ============================================================ S3 THE BREAK (10.52 → 14.55)
  tl.fromTo("#s3-wrap", { scale: 1.0 }, { scale: 1.05, duration: 2.2, ease: "sine.out" }, 10.52);
  tl.to("#s3-wrap", { scale: 1.1, duration: 0.18, ease: "power3.out" }, 12.75);
  tl.fromTo("#s3-tag", { opacity: 0 }, { opacity: 1, duration: BEAT / 4, ease: "steps(1)", yoyo: true, repeat: 7 }, 10.75);
  const abR = $("#s3-wrap .ab-r"), abC = $("#s3-wrap .ab-c");
  drive(10.52, 4.1, (t) => {
    const step = Math.floor(t * 12);
    const base = 6 + 4 * Math.sin(t * 3.2) + (t > 12.75 && t < 13.0 ? 14 : 0) + (t > 13.45 ? 10 : 0);
    abR.style.transform = `translate(${(-base + sh(step) * 2).toFixed(1)}px, ${(sh(step + 1) * 2).toFixed(1)}px)`;
    abC.style.transform = `translate(${(base + sh(step + 2) * 2).toFixed(1)}px, ${(sh(step + 3) * 2).toFixed(1)}px)`;
  });
  $$("#s3-cracks .crk").forEach((c, i) => {
    tl.fromTo(c, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.16 + hash(i) * 0.1, ease: "power2.out" }, 13.45 + hash(i + 4) * 0.12);
  });
  tl.fromTo("#s3-wrap", { x: 0 }, { x: 10, duration: 0.04, ease: "none", yoyo: true, repeat: 5, immediateRender: false }, 13.45);
  tl.set("#s3-wrap", { opacity: 0 }, 13.75); // the GPU particle field (gl.js) takes over from this frame
  tl.set("#s3-tag", { opacity: 0 }, 13.75);

  // ============================================================ S4 THE REVEAL (14.55 → 19.95)
  tl.fromTo("#s4-leak", { x: 0, opacity: 0 }, { x: 2300, opacity: 1, duration: 1.7, ease: "power1.inOut" }, 15.0);
  tl.to("#s4-leak", { opacity: 0, duration: 0.5, ease: "power1.out" }, 16.3);
  tl.fromTo("#s4-leak2", { opacity: 0, x: -200 }, { opacity: 0.55, x: 120, duration: 3.0, ease: "sine.inOut" }, 16.9);
  tl.fromTo("#s4-bloom", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.15, duration: 0.14, ease: "power2.out" }, b(32));
  tl.to("#s4-bloom", { opacity: 0.22, scale: 1, duration: 0.9, ease: "power2.out" }, b(32) + 0.14);
  tl.fromTo("#s4-flash", { opacity: 0.35 }, { opacity: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, b(32));
  tl.fromTo("#s4-wm", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power3.inOut" }, 17.4);
  tl.fromTo("#s4-ver", { scale: 0.4, opacity: 0, transformOrigin: "0% 80%" }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2.5)" }, 17.78);
  tl.to("#s4-wm", { y: -10, duration: 1.8, ease: "sine.inOut" }, 18.0);

  // ============================================================ S5 THE FLOW (19.95 → 29.75)
  // bokeh (depth-of-field backdrop), seeded
  const bk = $("#s5-bokeh");
  for (let i = 0; i < 12; i++) {
    const d = document.createElement("i");
    const r = 60 + hash(i * 3.3) * 170;
    d.style.cssText = `left:${(hash(i * 1.7) * 1080 - r).toFixed(0)}px;top:${(200 + hash(i * 2.9) * 1500 - r).toFixed(0)}px;width:${(2 * r).toFixed(0)}px;height:${(2 * r).toFixed(0)}px;background:${i % 4 === 0 ? "rgba(34,197,94,0.28)" : "rgba(255,244,230,0.13)"}`;
    bk.appendChild(d);
  }
  tl.fromTo("#s5-bokeh", { y: 40 }, { y: -60, duration: 9.8, ease: "none" }, 19.95);
  tl.fromTo("#s5-leak", { opacity: 0, x: 0 }, { opacity: 0.7, x: 260, duration: 4, ease: "sine.inOut" }, 20.2);
  tl.fromTo("#p5-rig", { y: 520, rotationX: 22, rotationY: -40, rotationZ: 6, opacity: 0 },
    { y: 0, rotationX: 8, rotationY: -16, rotationZ: 0, opacity: 1, duration: 1.0, ease: "power3.out" }, 20.0);
  tl.to("#p5-rig", { rotationY: -5, rotationX: 4, duration: 8.6, ease: "sine.inOut" }, 21.0);
  tl.to("#p5", { y: -14, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: 4 }, 21.0);
  tl.fromTo("#p5-glare", { backgroundPosition: "95% 0%" }, { backgroundPosition: "10% 0%", duration: 9.6, ease: "sine.inOut" }, 20.0);
  // home → tap Deposit → deposit sheet
  tl.to("#p5-dep-btn", { scale: 0.93, duration: 0.08, ease: "power2.in", yoyo: true, repeat: 1 }, 20.92);
  tl.fromTo("#p5-deposit", { x: 452 }, { x: 0, duration: 0.36, ease: "power3.out" }, 21.12);
  tl.to("#p5-home", { x: -140, opacity: 0.4, duration: 0.36, ease: "power3.out" }, 21.12);
  const depNum = $("#p5-dep-num");
  const depObj = { v: 0 };
  tl.fromTo(depObj, { v: 0 }, { v: 50000, duration: 1.1, ease: "power2.out", onUpdate: () => (depNum.textContent = Math.round(depObj.v).toLocaleString("en-US")) }, 21.32);
  tl.fromTo("#p5-dep-ok", { y: 20, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 22.42);
  // convert
  tl.fromTo("#p5-convert", { x: 452 }, { x: 0, duration: 0.36, ease: "power3.out" }, 22.72);
  tl.to("#p5-deposit", { x: -140, opacity: 0.4, duration: 0.36, ease: "power3.out" }, 22.72);
  tl.fromTo("#s5-chip-usdt", { x: 120, y: 180, scale: 0.4, rotation: -8, opacity: 0 }, { x: 0, y: 0, scale: 1, rotation: -4, opacity: 1, duration: 0.45, ease: "back.out(1.8)" }, 23.62);
  tl.to("#s5-chip-usdt", { y: -18, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: 1 }, 24.1);
  tl.to("#p5-cv-btn", { scale: 0.94, duration: 0.08, ease: "power2.in", yoyo: true, repeat: 1 }, 24.16);
  tl.fromTo("#p5-cv-bar", { scaleX: 0 }, { scaleX: 1, duration: 0.24, ease: "power3.in" }, 24.22);
  tl.fromTo("#p5-usdt", { scale: 1 }, { scale: 1.12, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "0% 50%" }, 24.46);
  // Fee? Zero.
  tl.fromTo("#p5-fee-line", { backgroundColor: "rgba(34,197,94,0)" }, { backgroundColor: "rgba(34,197,94,0.18)", duration: 0.2, ease: "power2.out" }, 26.5);
  tl.fromTo("#s5-chip-fee", { x: -160, y: 60, scale: 0.3, rotation: 10, opacity: 0 }, { x: 0, y: 0, scale: 1, rotation: 5, opacity: 1, duration: 0.42, ease: "back.out(2.2)" }, 26.95);
  tl.to(["#s5-chip-fee", "#s5-chip-usdt"], { opacity: 0, scale: 0.8, duration: 0.25, ease: "power2.in" }, 27.3);
  // Transfer sent
  tl.fromTo("#p5-success .sx-dim", { opacity: 0 }, { opacity: 0.85, duration: 0.3, ease: "power1.out" }, 27.45);
  tl.fromTo("#p5-sheet", { y: 660 }, { y: 0, duration: 0.4, ease: "power3.out" }, 27.45);
  tl.fromTo("#p5-ring", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.38, ease: "power2.inOut" }, 27.78);
  tl.fromTo("#p5-disc", { scale: 0, transformOrigin: "60px 60px" }, { scale: 1, transformOrigin: "60px 60px", duration: 0.32, ease: "back.out(2.4)" }, 27.98);
  tl.fromTo("#p5-tick", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.24, ease: "power2.out" }, 28.12);
  // green particle burst (particle-burst rule, seeded ballistic)
  const burst = $("#p5-burst"), parts = [];
  for (let i = 0; i < 46; i++) {
    const el = document.createElement("i");
    const s = 6 + hash(i * 3.7) * 12;
    el.style.width = el.style.height = `${s.toFixed(1)}px`;
    if (i % 5 === 0) el.style.background = "#FFFFFF";
    burst.appendChild(el);
    const a = hash(i * 5.3) * Math.PI * 2;
    const sp = 260 + hash(i * 7.9) * 520;
    parts.push({ el, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120 });
  }
  drive(28.2, 1.4, (t) => {
    const d = t - 28.2;
    parts.forEach((p) => {
      const k = (1 - Math.exp(-3 * d)) / 3;
      p.el.style.transform = `translate(${(p.vx * k).toFixed(1)}px, ${(p.vy * k + 260 * d * d).toFixed(1)}px)`;
      p.el.style.opacity = d <= 0 ? 0 : Math.max(0, 1 - d / 1.3).toFixed(3);
    });
  });
  tl.to("#p5-rig", { scale: 1.05, duration: 1.8, ease: "power1.inOut" }, 27.9);

  // ============================================================ S6a STATEMENTS (light)
  const flipIn = (rig, at, from) => {
    tl.fromTo(rig, { rotationY: from, rotationX: 6, scale: 0.92, filter: "blur(10px)" },
      { rotationY: -10, rotationX: 4, scale: 1, filter: "blur(0px)", duration: 0.46, ease: "expo.out" }, at);
    tl.to(rig, { rotationY: 6, duration: 1.6, ease: "sine.inOut" }, at + 0.46);
  };
  flipIn("#p6a-rig", X.s56a + 0.05, -190);
  tl.fromTo("#s6a-ghost", { x: 80 }, { x: -80, duration: 2.6, ease: "none" }, X.s56a);
  tl.to("#p6a-btn", { scale: 0.94, duration: 0.08, ease: "power2.in", yoyo: true, repeat: 1 }, 30.86);
  tl.fromTo("#p6a-bar", { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.inOut" }, 30.92);
  tl.fromTo("#p6a-ok", { y: 16, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 31.4);

  // ============================================================ S6b DARK MODE (light → dark)
  flipIn("#p6b-rig", X.s6ab + 0.05, 190);
  tl.fromTo("#s6b-ghost", { x: -80 }, { x: 80, duration: 2.2, ease: "none" }, X.s6ab);
  tl.to("#p6b-knob", { x: 36, duration: 0.18, ease: "power3.out" }, 32.64);
  tl.to("#p6b-tgl", { backgroundColor: "#000000", duration: 0.18 }, 32.64);
  tl.fromTo("#p6b-darkscr", { clipPath: "circle(0px at 384px 412px)" }, { clipPath: "circle(1200px at 384px 412px)", duration: 0.5, ease: "power2.inOut" }, 32.68);
  tl.fromTo("#s6b-flood", { clipPath: "circle(0px at 695px 660px)" }, { clipPath: "circle(2300px at 695px 660px)", duration: 0.55, ease: "power2.inOut" }, 32.7);
  tl.set("#p6b-rig .ph-front", { borderColor: "#2c2c2c" }, 32.9);

  // ============================================================ S6c 2FA (dark)
  flipIn("#p6c-rig", X.s6bc + 0.05, -190);
  tl.fromTo("#s6c-ghost", { x: 80 }, { x: -80, duration: 3.0, ease: "none" }, X.s6bc);
  for (let i = 0; i < 6; i++) {
    tl.fromTo(`#p6c-d${i} b`, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.16, ease: "back.out(2.5)" }, 34.18 + i * 0.1);
    tl.to(`#p6c-d${i}`, { borderColor: "#FFFFFF", duration: 0.1 }, 34.18 + i * 0.1);
  }
  tl.fromTo("#p6c-shackle", { y: -20 }, { y: 0, duration: 0.16, ease: "back.in(3)" }, 35.18);
  tl.fromTo("#p6c-rig .lock", { scale: 1 }, { scale: 0.92, duration: 0.07, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "50% 60%" }, 35.33);
  tl.fromTo("#p6c-ok", { y: 16, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 35.5);
  tl.to("#p6c-rig", { scale: 1.16, z: 200, duration: 0.95, ease: "power2.in" }, 35.85);

  // ============================================================ S7 PUNCHLINE (36.70 → 40.95)
  const HIT = [b(69), b(71), b(73)]; // 36.96 / 38.04 / 39.11
  tl.set("#s7-bg", { backgroundColor: "#FFFFFF" }, HIT[0]);
  tl.set("#s7-p0", { color: "#000000" }, HIT[0]);
  tl.fromTo("#s7-p0", { scale: 1.9, filter: "blur(20px)", opacity: 0 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: 0.3, ease: "power4.out" }, HIT[0]);
  tl.set("#s7-p0", { opacity: 0 }, HIT[1]);
  tl.set("#s7-bg", { backgroundColor: "#000000" }, HIT[1]);
  tl.set("#s7-p1", { color: "#FFFFFF" }, HIT[1]);
  tl.fromTo("#s7-p1", { x: 900, skewX: -16, opacity: 0 }, { x: 0, skewX: 0, opacity: 1, duration: 0.28, ease: "expo.out" }, HIT[1]);
  tl.set("#s7-p1", { opacity: 0 }, HIT[2]);
  tl.set("#s7-bg", { backgroundColor: "#FFFFFF" }, HIT[2]);
  tl.set("#s7-p2", { color: "#000000" }, HIT[2]);
  tl.fromTo("#s7-p2", { y: 220, rotation: -6, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.34, ease: "circ.out" }, HIT[2]);
  // slam shake on every hit
  HIT.forEach((h, i) => tl.fromTo(`#s7-p${i}`, { yPercent: 0 }, { yPercent: 2.5, duration: 0.04, yoyo: true, repeat: 3, ease: "none" }, h + 0.3));
  // last word glitches and settles (mono RGB split, then clean)
  const gA = $("#s7-g .g-a"), gB = $("#s7-g .g-b");
  drive(HIT[2], 1.0, (t) => {
    const d = t - HIT[2];
    let amp = 0;
    if (d >= 0.12 && d < 0.55) amp = Math.pow(1 - (d - 0.12) / 0.43, 1.5);
    if (d >= 0.7 && d < 0.84) amp = Math.max(amp, 0.6 * (1 - (d - 0.7) / 0.14));
    const step = Math.floor(t * 24);
    gA.style.opacity = gB.style.opacity = amp > 0.01 ? 0.9 : 0;
    gA.style.transform = `translate(${(-16 * amp + sh(step) * 8 * amp).toFixed(1)}px, ${(sh(step + 2) * 6 * amp).toFixed(1)}px)`;
    gB.style.transform = `translate(${(16 * amp + sh(step + 1) * 8 * amp).toFixed(1)}px, ${(sh(step + 3) * 6 * amp).toFixed(1)}px)`;
  });
  tl.fromTo("#s7-under", { scaleX: 0 }, { scaleX: 1, duration: 0.32, ease: "power3.out" }, HIT[2] + 0.9);
  tl.to("#s7-p2", { scale: 1.03, duration: 0.9, ease: "sine.inOut" }, HIT[2] + 1.0);

  // ============================================================ S8 OUTRO (40.95 → 45)
  tl.fromTo("#s8-leak", { opacity: 0, x: -80, y: 40 }, { opacity: 0.75, x: 120, y: -40, duration: 4.0, ease: "sine.inOut" }, 41.0);
  tl.fromTo("#s8-leak2", { opacity: 0, x: 60 }, { opacity: 0.35, x: -60, duration: 3.6, ease: "sine.inOut" }, 41.2);
  tl.fromTo("#s8-lockup", { opacity: 0, scale: 0.9, filter: "blur(12px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }, 41.15);
  tl.to("#s8-lockup", { scale: 1.03, duration: 3.2, ease: "sine.inOut" }, 41.85);
  tl.fromTo("#s8-lockup .glint-layer, #s8-lockup .glint-text", { "--g": "-40%" }, { "--g": "140%", duration: 1.1, ease: "power2.inOut" }, 41.95);
  tl.fromTo("#s8-tag", { y: 30, opacity: 0, filter: "blur(8px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "power2.out" }, 42.45);
  tl.fromTo("#s8-line", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 43.15);
  tl.fromTo("#s8-credit .cr-by", { y: 14, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }, 43.35);
  tl.fromTo("#s8-credit .cr-name", { y: 14, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }, 43.45);

  // ============================================================ captions (word-by-word, Whisper timings)
  (window.CAPTIONS || []).forEach((line, li) => {
    const lineSel = `#cap-${li}`;
    tl.set(lineSel, { opacity: 1 }, Math.max(0, line.t0 - 0.02));
    line.words.forEach((w, wi) => {
      tl.fromTo(`#cw-${li}-${wi}`, { y: 34, scale: 0.7, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.2, ease: "back.out(3)" }, w.start);
      if (w.key) tl.fromTo(`#cw-${li}-${wi} u`, { scaleX: 0 }, { scaleX: 1, duration: 0.24, ease: "power3.out" }, w.start + 0.06);
    });
    tl.to(lineSel, { opacity: 0, y: -16, duration: 0.12, ease: "power2.in" }, Math.max(line.t1, line.t0 + 0.3));
  });
  // light scenes flip the caption ink
  tl.set("#captions", { color: "#000000" }, 29.9);
  tl.set(".cap-line", { textShadow: "none" }, 29.9);
  tl.set("#captions", { color: "#FFFFFF" }, 32.86);
  tl.set(".cap-line", { textShadow: "0 4px 22px rgba(0,0,0,0.6)" }, 32.86);

  window.__timelines["main"] = tl;
})();
