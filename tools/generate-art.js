#!/usr/bin/env node
/* Generates the app's brand marks, icons and illustrations into www/img/.
   Run: node tools/generate-art.js
   Everything is drawn from code so colourways and graphics stay consistent
   and are easy to restyle — no external image files, so the app works offline. */

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'www', 'img');
const write = (rel, svg) => {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, svg.replace(/\n\s+/g, '\n').trim());
};

const RED = '#d01824';
const RED_HI = '#f21d2a';
const BONE = '#e8e2d6';
const CHAR = '#1c1c1e';

// ── CCS Tools illustration ─────────────────────────────────────────────────
write('tools/tool.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 460" width="800" height="460" role="img" aria-label="Cable retrieval hook tool and camera probe">
<defs>
  <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9ced4"/><stop offset="1" stop-color="#7d848c"/></linearGradient>
  <linearGradient id="grip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e3238"/><stop offset="1" stop-color="#191c20"/></linearGradient>
  <radialGradient id="led" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff8d0"/><stop offset="1" stop-color="#e0b05a" stop-opacity="0"/></radialGradient>
</defs>
<rect width="800" height="460" fill="#0d0d0f"/>
<!-- wall cavity hint -->
<g stroke="#1e1e22" stroke-width="3" fill="none"><path d="M60 40 V420 M740 40 V420"/></g>
<rect x="60" y="40" width="120" height="380" fill="rgba(255,255,255,.015)"/>
<rect x="620" y="40" width="120" height="380" fill="rgba(255,255,255,.015)"/>

<!-- HOOK TOOL -->
<g>
  <rect x="96" y="150" width="150" height="54" rx="20" fill="url(#grip)" stroke="#3a3f46" stroke-width="2"/>
  <g stroke="#4a5058" stroke-width="4"><path d="M126 158v38M150 158v38M174 158v38"/></g>
  <circle cx="222" cy="177" r="13" fill="${'#e0b05a'}"/>
  <rect x="246" y="168" width="180" height="18" rx="9" fill="url(#metal)"/>
  <rect x="420" y="171" width="130" height="12" rx="6" fill="#9aa1a9"/>
  <path d="M550 177 q56 0 56 46 q0 40 -44 40 q-30 0 -34 -28" fill="none" stroke="url(#metal)" stroke-width="14" stroke-linecap="round"/>
  <text x="120" y="128" font-family="Oswald,Arial Narrow,sans-serif" font-size="19" letter-spacing="3" fill="#e0b05a">HOOK TOOL</text>
</g>

<!-- CAMERA PROBE -->
<g>
  <rect x="96" y="300" width="140" height="50" rx="18" fill="url(#grip)" stroke="#3a3f46" stroke-width="2"/>
  <rect x="122" y="314" width="88" height="22" rx="5" fill="#1a2b32" stroke="#0e1a1f" stroke-width="2"/>
  <path d="M236 325 q120 0 180 -46 q64 -48 130 -10" fill="none" stroke="#5c6views" stroke-width="0"/>
  <path d="M236 325 q120 0 180 -46 q64 -48 130 -10" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>
  <g fill="#2a2e34" stroke="#4a5058" stroke-width="2">
    <circle cx="566" cy="272" r="26"/>
  </g>
  <circle cx="566" cy="272" r="13" fill="#0f1418" stroke="#8ec5e8" stroke-width="3"/>
  <circle cx="566" cy="272" r="5" fill="#8ec5e8"/>
  <circle cx="612" cy="256" r="34" fill="url(#led)"/>
  <circle cx="606" cy="258" r="7" fill="#ffe9a8"/>
  <text x="120" y="386" font-family="Oswald,Arial Narrow,sans-serif" font-size="19" letter-spacing="3" fill="#e0b05a">CAMERA PROBE</text>
</g>

<!-- cable being hooked -->
<path d="M660 90 q-40 130 20 250 q14 30 46 40" fill="none" stroke="#7a4a2a" stroke-width="10" stroke-linecap="round" opacity=".85"/>
</svg>`.replace('stroke="#5c6views" stroke-width="0"', 'stroke="none"'));

// ── Category icons (electrical) ────────────────────────────────────────────
const icon = (body, tint) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<rect width="64" height="64" rx="14" fill="${tint}"/>
<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".92">${body}</g>
</svg>`;

const CATS = {
  Labour: ['#5a1a1c', '<path d="M40 20a8 8 0 0 0-11 10L20 39a4 4 0 0 0 6 6l9-9a8 8 0 0 0 10-11l-5 5-5-1-1-5z"/>'],
  // Australian GPO: two angled active/neutral pins over a vertical earth pin
  Power: ['#2a3a4a', '<rect x="13" y="13" width="38" height="38" rx="8"/><path d="M24 23l5 7M40 23l-5 7M32 36v7"/>'],
  Switch: ['#3a2a2a', '<rect x="18" y="12" width="28" height="40" rx="5"/><path d="M26 24h12" /><rect x="26" y="30" width="12" height="12" rx="2"/>'],
  Lighting: ['#4a3a2a', '<path d="M32 12a12 12 0 0 0-7 21v5h14v-5a12 12 0 0 0-7-21z"/><path d="M27 46h10M29 51h6"/>'],
  Appliance: ['#2a3a3a', '<circle cx="32" cy="32" r="6"/><path d="M32 26c0-8 12-10 12-3s-8 6-12 3M32 38c0 8-12 10-12 3s8-6 12-3M38 32c8 0 10 12 3 12s-6-8-3-12M26 32c-8 0-10-12-3-12s6 8 3 12"/>'],
  Switchboard: ['#3a3a2a', '<rect x="12" y="14" width="40" height="36" rx="5"/><path d="M22 22v10M32 22v10M42 22v10M12 40h40"/>'],
  EV: ['#3a2a3a', '<path d="M22 14v10M34 14v10"/><rect x="16" y="24" width="24" height="16" rx="5"/><path d="M28 40v6a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5V30"/>'],
  Cameras: ['#2a2a3a', '<path d="M12 24h24l6 6v10a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z"/><circle cx="26" cy="36" r="6"/><path d="M42 32l10-6v18l-10-6"/>'],
  Data: ['#2a2a4a', '<rect x="14" y="34" width="36" height="16" rx="4"/><path d="M32 34V20M20 20h24M22 42h4M32 42h4"/>'],
  'Low Voltage': ['#2a4a3a', '<path d="M34 12L20 34h10l-2 18 16-24H34z"/>'],
  Bakerlite: ['#3a2a4a', '<rect x="14" y="18" width="36" height="28" rx="5"/><path d="M14 28h36M28 18v28"/>'],
  Plug: ['#4a2a4a', '<circle cx="32" cy="32" r="18"/><circle cx="26" cy="27" r="2.5"/><circle cx="38" cy="27" r="2.5"/><circle cx="32" cy="39" r="2.5"/>'],
  Hire: ['#333333', '<path d="M10 38V20h24v18M34 26h10l8 8v4H34"/><circle cx="20" cy="42" r="4"/><circle cx="42" cy="42" r="4"/>'],
};

Object.entries(CATS).forEach(([id, [tint, body]]) => {
  write(`cat/${id.replace(/\s+/g, '-')}.svg`, icon(body, tint));
});

// ── Brand marks ────────────────────────────────────────────────────────────
// Redrawn from the Coastline Current Solutions brand sheets so they scale
// cleanly and can sit on any background. Three marks are in use:
//   roundel  — the wave + bolt badge that appears on the mascot range
//   wordmark — the boxed COASTLINE / CURRENT SOLUTIONS lockup
//   bolt     — the sleeve icon

const BRAND_RED = '#d0181f';

// The official Coastline mark: red sun and grey breaking wave inside a
// double ring, split by a red bolt with a white keyline.
const RED_DEEP = '#a8151c';
const waveBolt = () => `
  <circle cx="60" cy="60" r="52" fill="#161616"/>
  <circle cx="60" cy="60" r="46" fill="none" stroke="${BRAND_RED}" stroke-width="3.5"/>
  <circle cx="60" cy="60" r="43" fill="#dedede"/>
  <circle cx="48" cy="42" r="16" fill="${BRAND_RED}"/>
  <g clip-path="url(#dial)" stroke="#141414" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
    <!-- open water behind -->
    <path d="M12 84 q14 7 27 2 q15 -6 28 2 q13 6 29 -5 v34 h-84 z" fill="#6d6d6d"/>
    <!-- the curl: a breaking wave rising from the left -->
    <path d="M18 104 C13 70 28 45 51 43 C69 41 80 54 81 68
             C74 56 61 51 50 58 C37 66 32 85 34 104 Z" fill="#949494"/>
    <path d="M27 104 C24 78 33 60 49 56 C60 53 70 58 76 66
             C67 59 56 59 47 68 C38 77 35 90 36 104 Z" fill="#6f6f6f" stroke="none"/>
    <!-- white foam breaking off the crest -->
    <path d="M19 76 C21 55 34 42 52 42 C67 42 77 51 81 63
             C74 56 65 53 57 56 C63 49 57 43 50 45 C44 47 43 53 45 58
             C39 55 32 58 28 65 C25 70 23 74 19 76 Z" fill="#fff"/>
    <!-- foam curls -->
    <path d="M36 52 q6 -6 13 -3 M56 49 q6 -1 9 4" fill="none" stroke-width="1.3"/>
    <!-- second, smaller wave to the right -->
    <path d="M76 92 C78 80 87 74 94 78 C101 82 102 92 99 100
             C95 92 88 90 83 94 C80 96 77 95 76 92 Z" fill="#fff"/>
    <path d="M12 106 h96 v14 h-96 z" fill="#6d6d6d" stroke="none"/>
  </g>
  <path d="M84 12 L46 66 L64 66 L50 110 L92 54 L72 54 Z"
        fill="${BRAND_RED}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
  <path d="M84 12 L46 66 L64 66 L50 110 L92 54 L72 54 Z"
        fill="none" stroke="#161616" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M84 12 L64 66 L72 54 Z" fill="${RED_DEEP}" opacity=".55"/>`;

const DIAL_CLIP = '<defs><clipPath id="dial"><circle cx="60" cy="60" r="43"/></clipPath></defs>';

// The mark on its own — transparent ground, works on light or dark
write('brand/roundel.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Coastline Current Solutions">
${DIAL_CLIP}${waveBolt()}
</svg>`);
write('brand/roundel-line.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Coastline Current Solutions">
${DIAL_CLIP}${waveBolt()}
</svg>`);

// The wordmark lockup is built by tools/generate-wordmark.py instead, which
// converts the Brothers lettering to outlines using the real font file. It has
// to be done that way: an SVG loaded through an <img> tag — which is how the
// app uses these marks — cannot reach a webfont, so <text> here would silently
// fall back to whatever the device happens to have.

// Sleeve bolt icon
write('brand/bolt.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96" width="64" height="96" role="img" aria-label="bolt">
<path d="M46 4 L10 54 L28 54 L18 92 L54 40 L34 40 Z" fill="${BRAND_RED}"/>
</svg>`);

// ── App logo mark ──────────────────────────────────────────────────────────
// App logo tile — the roundel on a rounded dark square, used in the app header
write('logo.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Coastline Current Solutions">
<defs><linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d1d20"/><stop offset="1" stop-color="#0b0b0b"/></linearGradient>
<clipPath id="dial"><circle cx="60" cy="60" r="43"/></clipPath></defs>
<rect width="120" height="120" rx="28" fill="url(#l)"/>
<g transform="translate(60,60) scale(.86) translate(-60,-60)">${waveBolt()}</g>
</svg>`);

// Store icon source — the mark centred on white, 1024px, no rounded corners
// (Apple and Google apply their own masking).
write('appicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-label="Coastline Current Solutions">
<defs><clipPath id="dial"><circle cx="60" cy="60" r="43"/></clipPath></defs>
<rect width="1024" height="1024" fill="#ffffff"/>
<g transform="translate(512,512) scale(7.4) translate(-60,-60)">${waveBolt()}</g>
</svg>`);

console.log('Artwork written to www/img/');
