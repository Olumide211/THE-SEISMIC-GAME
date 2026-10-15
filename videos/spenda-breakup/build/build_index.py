"""Write index.html for the Spenda 'Breakup Letter' video.

Inputs (all produced by other build steps):
  build/captions.json  - caption lines with Whisper word timings (assemble_audio.py)
  build/sfx_plan.json  - SFX cue list (assemble_audio.py)
Output: index.html (standalone root composition, 1080x1920, 45s)
"""
import html
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
captions = json.loads((HERE / "captions.json").read_text())
sfx = json.loads((HERE / "sfx_plan.json").read_text())

LOGO_TOP = "M140 58 H157.5 A6 6 0 0 1 163.5 64 V111.5 A6 6 0 0 1 157.5 117.5 H111 A6 6 0 0 1 105 111.5 V93 A35 35 0 0 1 140 58 Z"
LOGO_BOT = "M81 122 H128.5 A6 6 0 0 1 134.5 128 V150.5 A30 30 0 0 1 104.5 180.5 H81 A6 6 0 0 1 75 174.5 V128 A6 6 0 0 1 81 122 Z"


def logo_svg(cls="", ident=""):
    idattr = f' id="{ident}"' if ident else ""
    return (
        f'<svg{idattr} class="{cls}" viewBox="60 43 119 119" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
        f'<path fill="currentColor" d="{LOGO_TOP}"/><path fill="currentColor" d="{LOGO_BOT}"/></svg>'
    )


ICON = {
    "signal": '<svg viewBox="0 0 24 24"><path d="M3 18h2v-3H3zm4 0h2v-6H7zm4 0h2V9h-2zm4 0h2V6h-2z" fill="currentColor"/></svg>',
    "eye_off": '<svg viewBox="0 0 24 24"><path d="M3 4l17 16M10.6 6.2A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a15 15 0 0 1-3.2 3.6M6.4 7.9A15 15 0 0 0 3 12s4 6 9 6a9 9 0 0 0 3.4-.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    "plus": '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    "up": '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "down": '<svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "phone": '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="currentColor"/></svg>',
    "wifi": '<svg viewBox="0 0 24 24"><path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="19.5" r="1.6" fill="currentColor"/></svg>',
    "bill": '<svg viewBox="0 0 24 24"><path d="M5 3h14v18l-2.3-1.6L14.4 21 12 19.4 9.6 21l-2.3-1.6L5 21z" fill="currentColor"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#fff" stroke-width="1.6"/></svg>',
    "gift": '<svg viewBox="0 0 24 24"><path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    "bank": '<svg viewBox="0 0 24 24"><path d="M3 9l9-5 9 5zM5 10h2v7H5zm4 0h2v7H9zm4 0h2v7h-2zm4 0h2v7h-2zM3 18h18v2H3z" fill="currentColor"/></svg>',
    "doc": '<svg viewBox="0 0 24 24"><path d="M6 2h8l5 5v15H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 2v5h5M9 13h7M9 17h7" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    "moon": '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor"/></svg>',
    "bell": '<svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 1 1 12 0v6l2 2H4zM10 21h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    "user": '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21a8 8 0 0 1 16 0z" fill="currentColor"/></svg>',
    "shield": '<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    "chev": '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "back": '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "swap": '<svg viewBox="0 0 24 24"><path d="M7 4v14M3 14l4 4 4-4M17 20V6M13 10l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

TETHER = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22C55E"/><path d="M6.5 6.8h11v2.6h-4.2v1.3c2.7.2 4.6.8 4.6 1.5s-1.9 1.3-4.6 1.5v4.6h-2.6v-4.6C8 13.5 6.1 12.9 6.1 12.2s1.9-1.3 4.6-1.5V9.4H6.5z" fill="#fff"/><ellipse cx="12" cy="12.2" rx="4.6" ry="0.9" fill="#22C55E"/></svg>'
NAIRA = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#111"/><path d="M8 17V7l8 10V7M6 10.5h12M6 13.5h12" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def status_bar(theme="light"):
    return (
        f'<div class="sb"><span>9:41</span><span class="sb-r">{ICON["signal"]}<i class="batt"></i></span></div>'
    )


def phone(pid, screens, theme="light"):
    return f"""
      <div class="phone-rig" id="{pid}-rig">
        <div class="phone-floor" id="{pid}-floor"></div>
        <div class="phone" id="{pid}">
          <div class="ph-side ph-left"></div><div class="ph-side ph-right"></div>
          <div class="ph-cap ph-top"></div><div class="ph-cap ph-bottom"></div>
          <div class="ph-face ph-back">
            <div class="ph-cam"><i></i><i></i><i></i></div>
            {logo_svg("ph-back-logo")}
          </div>
          <div class="ph-face ph-front">
            <div class="ph-screen ph-{theme}" id="{pid}-screen">{screens}</div>
            <div class="ph-island"></div>
            <div class="ph-glare" id="{pid}-glare"></div>
          </div>
        </div>
      </div>"""


def grain(sid):
    return f'<div class="grain" id="{sid}-grain"></div>'


# ------------------------------------------------------------------ screens
HOME = f"""
<div class="scr" id="p5-home">
  {status_bar()}
  <div class="home-card">
    <div class="hc-top"><div class="hc-avatar">{ICON["user"]}</div><div class="hc-hi">Hi, Breeze</div><div class="hc-bell">{ICON["bell"]}</div></div>
    <div class="hc-label">Total Balance <span class="ic">{ICON["eye_off"]}</span></div>
    <div class="hc-bal">₦ ••••••</div>
    <div class="hc-btns"><div class="hc-btn" id="p5-dep-btn"><span class="ic">{ICON["plus"]}</span>Deposit</div><div class="hc-btn"><span>Transfer</span><span class="ic">{ICON["up"]}</span></div></div>
  </div>
  <div class="qa">
    <div class="qa-i"><div class="qa-c" style="background:#F2F2F2">{ICON["phone"]}</div>Airtime</div>
    <div class="qa-i"><div class="qa-c" style="background:#F2F2F2">{ICON["wifi"]}</div>Data</div>
    <div class="qa-i"><div class="qa-c" style="background:#F2F2F2">{ICON["bill"]}</div>Bills</div>
    <div class="qa-i"><div class="qa-c" style="background:#F2F2F2">{ICON["gift"]}</div>Rewards</div>
  </div>
  <div class="tx-head">Recent</div>
  <div class="tx"><div class="tx-ic">{ICON["bank"]}</div><div class="tx-m"><b>Deposit</b><span>Bank • Today</span></div><div class="tx-amt">₦ ••••</div></div>
  <div class="tx"><div class="tx-ic">{ICON["swap"]}</div><div class="tx-m"><b>Convert</b><span>USDT • Today</span></div><div class="tx-amt">•••</div></div>
  <div class="tabbar"><b>Home</b><span>Rates</span><span>Cards</span><span>Account</span></div>
</div>"""

DEPOSIT = f"""
<div class="scr" id="p5-deposit">
  {status_bar()}
  <div class="nav"><span class="ic">{ICON["back"]}</span><b>Deposit Naira</b><i></i></div>
  <div class="dep-label">Amount received</div>
  <div class="dep-amt"><span class="cur">₦</span><span id="p5-dep-num">0</span></div>
  <div class="dep-sub">From your bank account • Fee ₦0</div>
  <div class="dep-row"><span>Account name</span><b>Breeze</b></div>
  <div class="dep-row"><span>Bank</span><b>Your bank</b></div>
  <div class="dep-ok" id="p5-dep-ok"><span class="dot-ok"></span>Deposit received</div>
</div>"""

CONVERT = f"""
<div class="scr" id="p5-convert">
  {status_bar()}
  <div class="seg"><span>Rates</span><b>Calculator</b></div>
  <div class="cv-box">
    <div class="cv-lbl">You Send</div>
    <div class="cv-row"><div class="cv-num">50,000</div><div class="cv-pill"><i class="tok">{NAIRA}</i>NGN</div></div>
    <div class="cv-mid">
      <div class="cv-line"><span class="ic">{ICON["swap"]}</span>Exchange Rate<b>$1 = ₦1,357</b></div>
      <div class="cv-line" id="p5-fee-line"><span class="ic">{ICON["swap"]}</span>Fee<b id="p5-fee">₦0</b></div>
    </div>
    <div class="cv-recv">
      <div class="cv-lbl">You Receive</div>
      <div class="cv-row"><div class="cv-num" id="p5-usdt">36.85</div><div class="cv-pill"><i class="tok">{TETHER}</i>USDT</div></div>
    </div>
  </div>
  <div class="cv-btn" id="p5-cv-btn"><span id="p5-cv-txt">Convert now</span><i id="p5-cv-bar"></i></div>
</div>"""

SUCCESS = f"""
<div class="scr" id="p5-success">
  <div class="sx-dim"></div>
  <div class="sx-sheet" id="p5-sheet">
    <div class="sx-grab"></div>
    <svg class="sx-check" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="52" fill="none" stroke="#22C55E" stroke-width="10" id="p5-ring" pathLength="1"/>
      <circle cx="60" cy="60" r="38" fill="#22C55E" id="p5-disc"/>
      <path d="M43 61 l12 11 l23 -25" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="square" id="p5-tick" pathLength="1"/>
    </svg>
    <div class="sx-title">Transfer sent</div>
    <div class="sx-sub">36.85 USDT • Fee ₦0</div>
    <div class="sx-btns"><div class="sx-b1">View Receipt</div><div class="sx-b2">Done</div></div>
  </div>
  <div class="burst" id="p5-burst"></div>
</div>"""

STATEMENT = f"""
<div class="scr" id="p6a-st">
  {status_bar()}
  <div class="nav"><span class="ic">{ICON["back"]}</span><b>Statements</b><i></i></div>
  <div class="st-card"><div class="st-ic">{ICON["doc"]}</div><div><b>Account statement</b><span>PDF • All transactions</span></div></div>
  <div class="st-row"><span>September 2026</span><span class="ic">{ICON["chev"]}</span></div>
  <div class="st-row"><span>August 2026</span><span class="ic">{ICON["chev"]}</span></div>
  <div class="st-row"><span>July 2026</span><span class="ic">{ICON["chev"]}</span></div>
  <div class="st-btn" id="p6a-btn"><span class="ic">{ICON["down"]}</span><span id="p6a-btn-txt">Download statement</span><i id="p6a-bar"></i></div>
  <div class="st-ok" id="p6a-ok"><span class="dot-ok"></span>Statement_Sep.pdf saved</div>
</div>"""

def settings(dark=False):
    sfx = "-d" if dark else ""
    sid = ' id="p6b-darkscr"' if dark else ' id="p6b-set"'
    cls = "scr dark" if dark else "scr"
    return f"""
<div class="{cls}"{sid}>
  {status_bar()}
  <div class="nav"><span class="ic">{ICON["back"]}</span><b>Settings</b><i></i></div>
  <div class="set-row"><span class="set-ic">{ICON["user"]}</span>Profile<span class="ic">{ICON["chev"]}</span></div>
  <div class="set-row"><span class="set-ic">{ICON["bell"]}</span>Notifications<span class="ic">{ICON["chev"]}</span></div>
  <div class="set-row"><span class="set-ic">{ICON["moon"]}</span>Dark mode<span class="tgl" id="p6b-tgl{sfx}"><i id="p6b-knob{sfx}"></i></span></div>
  <div class="set-row"><span class="set-ic">{ICON["shield"]}</span>Security<span class="ic">{ICON["chev"]}</span></div>
  <div class="set-row"><span class="set-ic">{ICON["doc"]}</span>Statements<span class="ic">{ICON["chev"]}</span></div>
</div>"""


SETTINGS = settings(False) + settings(True)

TWOFA = f"""
<div class="scr" id="p6c-2fa">
  {status_bar()}
  <div class="nav"><span class="ic">{ICON["back"]}</span><b>Security</b><i></i></div>
  <svg class="lock" viewBox="0 0 120 150" aria-hidden="true">
    <path id="p6c-shackle" d="M30 66 V44 a30 30 0 0 1 60 0 V66" fill="none" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round"/>
    <rect x="14" y="62" width="92" height="80" rx="18" fill="#FFFFFF"/>
    <circle cx="60" cy="96" r="9" fill="#000"/><rect x="56" y="98" width="8" height="20" rx="3" fill="#000"/>
  </svg>
  <div class="tfa-title">Two-factor authentication</div>
  <div class="tfa-codes">{''.join(f'<i class="tfa-d" id="p6c-d{i}"><b>{d}</b></i>' for i, d in enumerate("481207"))}</div>
  <div class="tfa-ok" id="p6c-ok"><span class="dot-ok"></span>2FA on • Account locked in</div>
</div>"""


def chat(cid, frozen=False):
    msgs = [
        ("in", "Send screenshot", "12:02"),
        ("out", "Sent. Check am.", "12:03"),
        ("in", "Send screenshot", "12:41"),
    ]
    rows = "".join(
        f'<div class="msg {d}" id="{cid}-m{i}"><span>{html.escape(t)}</span><em>{ts}{" ✓✓" if d == "out" else ""}</em></div>'
        for i, (d, t, ts) in enumerate(msgs)
    )
    typing = f'<div class="msg in typing" id="{cid}-typing"><i></i><i></i><i></i></div>'
    return f"""
      <div class="chat" id="{cid}">
        <div class="chat-head"><div class="ch-av">PV</div><div><b>P2P Vendor</b><span id="{cid}-status">online</span></div></div>
        <div class="chat-body">{rows}{typing}</div>
        <div class="chat-input"><span>Message</span><i></i></div>
      </div>"""


# ------------------------------------------------------------------ captions
cap_html = []
for li, line in enumerate(captions):
    words = "".join(
        f'<span class="cw{" key" if w["key"] else ""}" id="cw-{li}-{wi}">{html.escape(w["w"])}{"<u></u>" if w["key"] else ""}</span>'
        for wi, w in enumerate(line["words"])
    )
    cap_html.append(f'<div class="cap-line" id="cap-{li}">{words}</div>')
CAPTIONS_HTML = "\n        ".join(cap_html)
CAPTIONS_JSON = json.dumps(captions, separators=(",", ":"))

# give every SFX a track lane where it overlaps nothing (interval scheduling)
lanes = []
for c in sorted(sfx, key=lambda c: c["t"]):
    for li, end in enumerate(lanes):
        if c["t"] >= end + 0.01:
            lanes[li] = c["t"] + c["dur"]
            c["lane"] = li
            break
    else:
        lanes.append(c["t"] + c["dur"])
        c["lane"] = len(lanes) - 1
SFX_HTML = "\n    ".join(
    f'<audio id="sfx-{i:02d}" src="{c["src"]}" data-start="{c["t"]:.3f}" data-duration="{c["dur"]:.3f}" data-track-index="{30 + c["lane"]}" data-volume="{c["vol"]}"></audio>'
    for i, c in enumerate(sorted(sfx, key=lambda c: c["t"]))
)
SCENES_JS = (ROOT / "scenes.js").read_text()

# ------------------------------------------------------------------ document
DOC = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Spenda 2.0: The Breakup Letter</title>
    <script src="vendor/gsap.min.js"></script>
    <script src="vendor/shader-transitions.js"></script>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="45">

      <!-- 1 HOOK: glitchy vendor chat, spinning clock, red timer, camera shake -->
      <div id="s1" class="scene clip" data-start="0" data-duration="45" data-track-index="0">
        <div class="vignette"></div>
        <div class="cam" id="s1-cam">
          <div class="timer" id="s1-timer-row">
            <svg class="clock" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27" fill="none" stroke="#FF3B30" stroke-width="5"/><line id="s1-hand-m" x1="32" y1="32" x2="32" y2="12" stroke="#FF3B30" stroke-width="5" stroke-linecap="round"/><line id="s1-hand-h" x1="32" y1="32" x2="45" y2="32" stroke="#FF3B30" stroke-width="5" stroke-linecap="round"/></svg>
            <div class="timer-num"><span id="s1-timer">00:39:47</span></div>
            <div class="timer-lbl">waiting</div>
          </div>
          <div class="glitch-stack" id="s1-stack">
            <div class="ghost warm" aria-hidden="true">{chat("s1-gw")}</div>
            <div class="ghost cool" aria-hidden="true">{chat("s1-gc")}</div>
            <div class="base">{chat("s1-chat")}</div>
          </div>
        </div>
        <div class="scan" id="s1-scan"></div>
        {grain("s1")}
      </div>

      <!-- 2 THE PAIN: kinetic slams that shatter into particles -->
      <div id="s2" class="scene clip" data-start="0" data-duration="45" data-track-index="1">
        <div class="ghost-type" id="s2-ghost">P2P</div>
        <div class="pain-chip" id="s2-chip"><i></i>Pending <span id="s2-timer">00:40:16</span></div>
        <div class="slam" id="s2-w0"><span class="sl-a">SEND</span><span class="sl-b">SCREENSHOT.</span></div>
        <div class="slam" id="s2-w1"><span class="sl-a">STILL</span><span class="sl-b">PENDING.</span></div>
        <div class="slam" id="s2-w2"><span class="sl-a">SEEN.</span><span class="sl-b">NO REPLY.</span></div>
        <div class="rgb" id="s2-rgb-r"></div><div class="rgb" id="s2-rgb-c"></div>
        <canvas id="s2-particles" class="fx-canvas" width="1080" height="1920"></canvas>
        <div class="flash" id="s2-flash"></div>
        {grain("s2")}
      </div>

      <!-- 3 THE BREAK: freeze frame, chromatic aberration, crack, GPU particle explosion -->
      <div id="s3" class="scene clip" data-start="0" data-duration="45" data-track-index="2">
        <div class="freeze-wrap" id="s3-wrap">
          <div class="ab ab-r" aria-hidden="true">{chat("s3-ar", True)}</div>
          <div class="ab ab-c" aria-hidden="true">{chat("s3-ac", True)}</div>
          <div class="ab-base" id="s3-base">{chat("s3-chat", True)}</div>
          <svg class="cracks" id="s3-cracks" viewBox="0 0 1080 1920" aria-hidden="true">
            <g fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round">
              <path class="crk" pathLength="1" d="M540 760 L455 640 L430 520 L360 455"/>
              <path class="crk" pathLength="1" d="M540 760 L650 690 L760 700 L860 610"/>
              <path class="crk" pathLength="1" d="M540 760 L600 880 L585 1010 L660 1110"/>
              <path class="crk" pathLength="1" d="M540 760 L420 830 L300 820 L215 905"/>
              <path class="crk" pathLength="1" d="M540 760 L560 600 L620 470"/>
              <path class="crk" pathLength="1" d="M540 760 L470 960 L380 1060"/>
              <path class="crk" pathLength="1" d="M455 640 L520 610 M650 690 L640 600 M600 880 L700 900 M420 830 L440 930"/>
            </g>
          </svg>
        </div>
        <div class="freeze-tag" id="s3-tag">PAUSED</div>
        <canvas id="s3-gl" class="fx-canvas" width="1080" height="1920"></canvas>
        <div class="vignette strong"></div>
        {grain("s3")}
      </div>

      <!-- 4 THE REVEAL: light leak, particles gather into the 3D S, wordmark -->
      <div id="s4" class="scene clip" data-start="0" data-duration="45" data-track-index="3">
        <div class="leak leak-warm" id="s4-leak"></div>
        <div class="leak leak-green" id="s4-leak2"></div>
        <div class="bloom" id="s4-bloom"></div>
        <canvas id="s4-gl" class="fx-canvas" width="1080" height="1920"></canvas>
        <div class="wordmark" id="s4-wm"><span class="wm-name">Spenda</span><span class="wm-ver" id="s4-ver">2.0</span></div>
        <div class="flash" id="s4-flash"></div>
        {grain("s4")}
      </div>

      <!-- 5 THE FLOW: 3D phone, deposit → convert (coin) → transfer sent -->
      <div id="s5" class="scene clip" data-start="0" data-duration="45" data-track-index="4">
        <div class="bokeh" id="s5-bokeh"></div>
        <div class="leak leak-green soft" id="s5-leak"></div>
        <div class="stage3d">{phone("p5", HOME + DEPOSIT + CONVERT + SUCCESS)}</div>
        <div class="chip3d" id="s5-chip-fee"><span>Fee</span><b>₦0</b></div>
        <div class="chip3d green" id="s5-chip-usdt"><i class="tok">{TETHER}</i><b>36.85 USDT</b></div>
        <canvas id="s5-gl" class="fx-canvas" width="1080" height="1920"></canvas>
        {grain("s5")}
      </div>

      <!-- 6a EXTRAS: statement download (light) -->
      <div id="s6a" class="scene clip light" data-start="0" data-duration="45" data-track-index="5">
        <div class="ghost-type dark" id="s6a-ghost">PDF</div>
        <div class="stage3d">{phone("p6a", STATEMENT)}</div>
        {grain("s6a")}
      </div>

      <!-- 6b EXTRAS: dark mode toggle inverts the whole frame -->
      <div id="s6b" class="scene clip light" data-start="0" data-duration="45" data-track-index="6">
        <div class="ghost-type dark" id="s6b-ghost">DARK</div>
        <div class="dark-flood" id="s6b-flood"></div>
        <div class="stage3d">{phone("p6b", SETTINGS)}</div>
        {grain("s6b")}
      </div>

      <!-- 6c EXTRAS: 2FA lock snaps shut -->
      <div id="s6c" class="scene clip" data-start="0" data-duration="45" data-track-index="7">
        <div class="ghost-type" id="s6c-ghost">2FA</div>
        <div class="stage3d">{phone("p6c", TWOFA, "dark")}</div>
        {grain("s6c")}
      </div>

      <!-- 7 THE PUNCHLINE: No vendor. No waiting. No wahala. -->
      <div id="s7" class="scene clip" data-start="0" data-duration="45" data-track-index="8">
        <div class="pl-bg" id="s7-bg"></div>
        <div class="pl" id="s7-p0"><span>NO</span><span>VENDOR.</span></div>
        <div class="pl" id="s7-p1"><span>NO</span><span>WAITING.</span></div>
        <div class="pl" id="s7-p2">
          <span>NO</span>
          <span class="pl-glitch" id="s7-g">
            <span class="g-copy g-a" aria-hidden="true">WAHALA.</span>
            <span class="g-copy g-b" aria-hidden="true">WAHALA.</span>
            <span class="g-base">WAHALA.</span>
            <i class="pl-under" id="s7-under"></i>
          </span>
        </div>
        {grain("s7")}
      </div>

      <!-- 8 OUTRO: logo + wordmark glint, tagline, end credit -->
      <div id="s8" class="scene clip" data-start="0" data-duration="45" data-track-index="9">
        <div class="leak leak-green outro" id="s8-leak"></div>
        <div class="leak leak-warm outro" id="s8-leak2"></div>
        <div class="lockup" id="s8-lockup">
          <div class="lk-mark">{logo_svg("lk-svg")}<div class="glint-layer">{logo_svg("lk-svg")}</div></div>
          <div class="lk-word"><span>Spenda</span><span class="glint-text" aria-hidden="true">Spenda</span></div>
        </div>
        <div class="tagline" id="s8-tag">Bye bye, P2P.</div>
        <div class="credit" id="s8-credit">
          <i class="cr-line" id="s8-line"></i>
          <div class="cr-by">Edited by</div>
          <div class="cr-name">BreezeOg</div>
        </div>
        {grain("s8")}
      </div>

      <!-- Captions: word-by-word from Whisper timings (never on screen during a shader transition) -->
      <div id="captions" class="clip" data-start="0" data-duration="45" data-track-index="20">
        {CAPTIONS_HTML}
      </div>

    </div>

    <!-- Audio: cloned-voice VO, code-composed score (carved + ducked), Kenney SFX on the beats -->
    <audio id="vo" src="assets/audio/vo.wav" data-start="0" data-duration="45" data-track-index="10" data-volume="1"></audio>
    <audio id="music" src="assets/audio/music.wav" data-start="0" data-duration="45" data-track-index="11" data-volume="1"></audio>
    {SFX_HTML}

    <script>window.CAPTIONS = {CAPTIONS_JSON};</script>
    <script>\n{SCENES_JS}\n    </script>
    <script type="module" src="gl.js"></script>
  </body>
</html>
"""

(ROOT / "index.html").write_text(DOC)
print("wrote index.html", len(DOC), "bytes;", len(captions), "caption lines;", len(sfx), "sfx")
