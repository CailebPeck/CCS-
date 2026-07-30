#!/usr/bin/env node
/* Generates the app's original SVG artwork into www/img/.
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

// ── Garment silhouettes (viewBox 0 0 400 480) ──────────────────────────────
const TEE = 'M148 54 L108 72 L34 112 L18 182 L88 210 L88 436 L312 436 L312 210 L382 182 L366 112 L292 72 L252 54 C238 84 162 84 148 54 Z';
const LONG = 'M148 54 L108 72 L30 118 L8 330 L74 348 L92 240 L92 436 L308 436 L308 240 L326 348 L392 330 L370 118 L292 72 L252 54 C238 84 162 84 148 54 Z';
const TANK = 'M156 50 L120 66 L104 150 L104 436 L296 436 L296 150 L280 66 L244 50 C236 86 164 86 156 50 Z';
const HOODIE = 'M146 62 L104 80 L28 122 L10 200 L82 228 L82 448 L318 448 L318 228 L390 200 L372 122 L296 80 L254 62 C240 96 160 96 146 62 Z';

const collar = (kind) => {
  if (kind === 'hoodie') {
    return `<path d="M132 80 C142 6 258 6 268 80 C244 112 156 112 132 80 Z" fill="rgba(0,0,0,.34)"/>
      <path d="M150 76 C164 30 236 30 250 76" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="6"/>
      <path d="M176 100 L184 158 M224 100 L216 158" stroke="rgba(255,255,255,.32)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="184" cy="158" r="5" fill="rgba(255,255,255,.32)"/><circle cx="216" cy="158" r="5" fill="rgba(255,255,255,.32)"/>
      <rect x="146" y="306" width="108" height="76" rx="10" fill="rgba(0,0,0,.18)"/>`;
  }
  if (kind === 'zip') {
    return `<path d="M150 58 C170 22 230 22 250 58 C236 86 164 86 150 58 Z" fill="rgba(0,0,0,.34)"/>
      <path d="M200 40 L200 206" stroke="rgba(255,255,255,.5)" stroke-width="5"/>
      <path d="M200 40 L200 206" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-dasharray="6 5"/>
      <rect x="193" y="200" width="14" height="22" rx="4" fill="rgba(255,255,255,.55)"/>`;
  }
  return `<path d="M148 54 C168 78 232 78 252 54 C246 88 154 88 148 54 Z" fill="rgba(0,0,0,.25)"/>`;
};

const garment = ({ shape, body, graphic, kind, label }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480" role="img" aria-label="${label}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#141416"/><stop offset="1" stop-color="#08080a"/>
  </linearGradient>
  <linearGradient id="cloth" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="${body.hi}"/><stop offset="1" stop-color="${body.lo}"/>
  </linearGradient>
</defs>
<rect width="400" height="480" fill="url(#bg)"/>
<ellipse cx="200" cy="452" rx="150" ry="16" fill="rgba(0,0,0,.5)"/>
<path d="${shape}" fill="url(#cloth)" stroke="rgba(0,0,0,.35)" stroke-width="2"/>
${collar(kind)}
<g opacity=".9">${graphic}</g>
<path d="${shape}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="2"/>
</svg>`;

// ── Chest graphics ─────────────────────────────────────────────────────────
const G = {
  wave: (c) => `<g transform="translate(200,250)" stroke="${c}" fill="none" stroke-width="9" stroke-linecap="round">
      <path d="M-74 -14 Q-37 -44 0 -14 Q37 16 74 -14"/>
      <path d="M-74 16 Q-37 -14 0 16 Q37 46 74 16" opacity=".65"/>
    </g>
    <text x="200" y="330" text-anchor="middle" font-family="Oswald,Arial Narrow,sans-serif" font-weight="700" font-size="30" letter-spacing="6" fill="${c}">BLOODLINE</text>`,

  badge: (c) => `<circle cx="200" cy="252" r="62" fill="none" stroke="${c}" stroke-width="7"/>
    <g stroke="${c}" fill="none" stroke-width="7" stroke-linecap="round">
      <path d="M162 250 Q181 230 200 250 Q219 270 238 250"/>
    </g>
    <text x="200" y="352" text-anchor="middle" font-family="Oswald,Arial Narrow,sans-serif" font-weight="700" font-size="17" letter-spacing="4" fill="${c}">COASTLINE</text>`,

  bolt: (c) => `<path d="M214 176 L156 262 L192 262 L182 344 L250 244 L212 244 Z" fill="${c}"/>
    <text x="200" y="378" text-anchor="middle" font-family="Oswald,Arial Narrow,sans-serif" font-weight="700" font-size="24" letter-spacing="4" fill="${c}">COAST/LINE</text>`,

  compass: (c) => `<circle cx="200" cy="252" r="58" fill="none" stroke="${c}" stroke-width="6"/>
    <path d="M200 200 L216 244 L200 304 L184 244 Z" fill="${c}"/>
    <circle cx="200" cy="252" r="7" fill="${c}"/>
    <g stroke="${c}" stroke-width="5" stroke-linecap="round">
      <path d="M200 178v-14M200 340v14M126 252h-14M288 252h14"/>
    </g>`,

  riptide: (c) => `<g stroke="${c}" fill="none" stroke-width="10" stroke-linecap="round">
      <path d="M138 236 Q169 208 200 236 Q231 264 262 236"/>
      <path d="M138 272 Q169 244 200 272 Q231 300 262 272" opacity=".6"/>
    </g>
    <text x="200" y="200" text-anchor="middle" font-family="Oswald,Arial Narrow,sans-serif" font-weight="700" font-size="26" letter-spacing="5" fill="${c}">RIPTIDE</text>`,

  freq: (c) => `<g stroke="${c}" fill="none" stroke-width="7" stroke-linecap="round">
      <path d="M126 254 L146 254 L158 214 L176 296 L194 232 L210 276 L226 244 L242 264 L256 254 L278 254"/>
    </g>
    <text x="200" y="322" text-anchor="middle" font-family="Oswald,Arial Narrow,sans-serif" font-weight="700" font-size="19" letter-spacing="5" fill="${c}">FREQUENCY</text>`,

  // left-chest crest, sized for a quarter zip (keeps the centre placket clear)
  crest: (c) => `<g transform="translate(-58,44)">
      <path d="M168 160 h64 a7 7 0 0 1 7 7 v40 a39 39 0 0 1 -39 39 a39 39 0 0 1 -39 -39 v-40 a7 7 0 0 1 7 -7 z" fill="none" stroke="${c}" stroke-width="7"/>
      <path d="M182 196 q18 -20 36 0 " fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
      <path d="M182 218 q18 -20 36 0" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" opacity=".6"/>
    </g>`,
};

// ── Street products ────────────────────────────────────────────────────────
const CLOTH = {
  black: { hi: '#242427', lo: '#131315' },
  washed: { hi: '#33333a', lo: '#1d1d22' },
  white: { hi: '#f4f2ed', lo: '#d9d5cc' },
  grey: { hi: '#8d8d93', lo: '#5f5f66' },
  bone: { hi: '#e5dccb', lo: '#c9bfa9' },
  blood: { hi: '#8f1518', lo: '#5a0d10' },
};

const products = [
  ['st-1', TEE, 'black', G.wave(RED_HI), 'tee', 'Bloodline Wave Tee'],
  ['st-2', TEE, 'grey', G.badge(BONE), 'tee', 'Wave Badge Tee grey marle'],
  ['st-3', TEE, 'white', G.bolt(CHAR), 'tee', 'Coast/Line Bolt Tee white'],
  ['st-4', TEE, 'washed', G.compass(BONE), 'tee', 'Compass Tee vintage black'],
  ['st-5', HOODIE, 'black', G.riptide(RED_HI), 'hoodie', 'Riptide Hoodie black'],
  ['st-6', LONG, 'blood', G.compass(BONE), 'tee', 'Compass Long Sleeve'],
  ['st-7', TANK, 'washed', G.freq(RED_HI), 'tank', 'Frequency Tank washed black'],
  ['st-8', LONG, 'washed', G.crest(BONE), 'zip', 'Quarter Zip washed black'],
];

products.forEach(([id, shape, cloth, graphic, kind, label]) => {
  write(`street/${id}.svg`, garment({ shape, body: CLOTH[cloth], graphic, kind, label }));
});

// ── Volt Division mascots ──────────────────────────────────────────────────
const face = (x, y, s = 1, mood = 'grin') => `<g transform="translate(${x},${y}) scale(${s})">
  <circle cx="-15" cy="0" r="10" fill="#fff"/><circle cx="15" cy="0" r="10" fill="#fff"/>
  <circle cx="-12" cy="2" r="5" fill="#141414"/><circle cx="18" cy="2" r="5" fill="#141414"/>
  ${mood === 'grin'
    ? '<path d="M-16 20 Q0 36 16 20" fill="none" stroke="#141414" stroke-width="5" stroke-linecap="round"/>'
    : '<path d="M-14 24 Q0 12 14 24" fill="none" stroke="#141414" stroke-width="5" stroke-linecap="round"/>'}
</g>`;

const arms = (c) => `<g stroke="${c}" stroke-width="9" stroke-linecap="round" fill="none">
  <path d="M96 236 Q66 258 74 292"/><path d="M304 236 Q334 258 326 292"/>
</g>`;

const legs = (c) => `<g stroke="${c}" stroke-width="10" stroke-linecap="round">
  <path d="M170 392 L164 434"/><path d="M230 392 L236 434"/>
</g>`;

const mascotFrame = (inner, label, bg1 = '#f3f1ec', bg2 = '#ddd8cd') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480" role="img" aria-label="${label}">
<defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs>
<rect width="400" height="480" fill="url(#b)"/>
<circle cx="200" cy="228" r="150" fill="rgba(208,24,36,.07)"/>
${inner}
<text x="200" y="462" text-anchor="middle" font-family="Oswald,Arial Narrow,sans-serif" font-weight="700" font-size="19" letter-spacing="5" fill="#101010">VOLT DIVISION</text>
</svg>`;

// multimeter
write('street/sv-1.svg', mascotFrame(`
  ${arms('#c9a227')}${legs('#2a2a2e')}
  <rect x="100" y="120" width="200" height="276" rx="26" fill="#e8b21f" stroke="#a37c12" stroke-width="4"/>
  <rect x="128" y="150" width="144" height="86" rx="12" fill="#1d2b24" stroke="#0e1713" stroke-width="4"/>
  ${face(200, 190, 1, 'grin')}
  <circle cx="200" cy="300" r="42" fill="#2a2a2e"/>
  <circle cx="200" cy="300" r="30" fill="#3a3a40"/>
  <path d="M200 300 L200 274" stroke="#e8b21f" stroke-width="7" stroke-linecap="round"/>
  <circle cx="152" cy="360" r="11" fill="#c0392b"/><circle cx="248" cy="360" r="11" fill="#2c3e50"/>
`, 'Multimeter mascot'));

// screwdriver
write('street/sv-2.svg', mascotFrame(`
  ${arms('#b03a2e')}${legs('#2a2a2e')}
  <rect x="140" y="96" width="120" height="200" rx="34" fill="#d0402f" stroke="#8e2b1f" stroke-width="4"/>
  <g stroke="#8e2b1f" stroke-width="5" opacity=".55"><path d="M140 150h120M140 186h120M140 222h120"/></g>
  ${face(200, 170, 1, 'grin')}
  <rect x="186" y="292" width="28" height="88" fill="#b9bec4" stroke="#8b9096" stroke-width="3"/>
  <path d="M186 380 L214 380 L206 404 L194 404 Z" fill="#8b9096"/>
`, 'Screwdriver mascot'));

// pliers
write('street/sv-3.svg', mascotFrame(`
  ${arms('#e8b21f')}
  <g stroke="#2a2a2e" stroke-width="10" stroke-linecap="round"><path d="M172 400 L160 442"/><path d="M228 400 L240 442"/></g>
  <path d="M164 118 L200 216 L236 118" fill="none" stroke="#9aa0a6" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="200" cy="240" r="16" fill="#6f757b"/>
  <rect x="150" y="252" width="100" height="150" rx="26" fill="#e8b21f" stroke="#a37c12" stroke-width="4"/>
  ${face(200, 300, .82, 'grin')}
`, 'Pliers mascot'));

// live current bolt
write('street/sv-4.svg', mascotFrame(`
  <g stroke="#a3830c" stroke-width="9" stroke-linecap="round" fill="none">
    <path d="M150 218 Q112 240 120 276"/><path d="M268 236 Q302 254 296 288"/>
  </g>
  ${legs('#2a2a2e')}
  <path d="M244 78 L120 264 L192 264 L168 402 L292 216 L220 216 Z" fill="#f2c31c" stroke="#a3830c" stroke-width="5" stroke-linejoin="round"/>
  ${face(196, 190, 1, 'grin')}
`, 'Live current mascot'));

// tool crew — the three mates lined up
write('street/sv-5.svg', mascotFrame(`
  <g stroke="#2a2a2e" stroke-width="7" stroke-linecap="round">
    <path d="M84 356 L80 392M118 356 L122 392"/>
    <path d="M182 372 L178 410M222 372 L226 410"/>
    <path d="M290 356 L286 392M324 356 L328 392"/>
  </g>
  <!-- multimeter -->
  <g>
    <rect x="58" y="196" width="86" height="164" rx="18" fill="#e8b21f" stroke="#a37c12" stroke-width="4"/>
    <rect x="72" y="212" width="58" height="42" rx="7" fill="#1d2b24" stroke="#0e1713" stroke-width="3"/>
    ${face(101, 234, .52)}
    <circle cx="101" cy="300" r="22" fill="#2a2a2e"/><path d="M101 300 L101 286" stroke="#e8b21f" stroke-width="5" stroke-linecap="round"/>
  </g>
  <!-- screwdriver (tallest, middle) -->
  <g>
    <rect x="172" y="168" width="60" height="140" rx="22" fill="#d0402f" stroke="#8e2b1f" stroke-width="4"/>
    <g stroke="#8e2b1f" stroke-width="4" opacity=".5"><path d="M172 206h60M172 236h60"/></g>
    ${face(202, 214, .52)}
    <rect x="194" y="306" width="16" height="52" fill="#b9bec4" stroke="#8b9096" stroke-width="2"/>
    <path d="M194 358 L210 358 L205 374 L199 374 Z" fill="#8b9096"/>
  </g>
  <!-- bolt -->
  <g>
    <path d="M330 190 L268 288 L306 288 L294 366 L356 268 L318 268 Z" fill="#f2c31c" stroke="#a3830c" stroke-width="4" stroke-linejoin="round"/>
    ${face(305, 246, .5)}
  </g>
`, 'Tool crew mascots'));

// lock out & live (padlock)
write('street/sv-6.svg', mascotFrame(`
  ${legs('#2a2a2e')}
  <path d="M148 196 v-32 a52 52 0 0 1 104 0 v32" fill="none" stroke="#9aa0a6" stroke-width="22" stroke-linecap="round"/>
  <rect x="118" y="196" width="164" height="196" rx="28" fill="#d0402f" stroke="#8e2b1f" stroke-width="4"/>
  ${face(200, 268, 1, 'grin')}
  <circle cx="200" cy="336" r="18" fill="#8e2b1f"/><rect x="192" y="336" width="16" height="34" rx="7" fill="#8e2b1f"/>
`, 'Lock out and live mascot'));

// ── Street hero ────────────────────────────────────────────────────────────
write('street/hero.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="800" height="900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Bloodline campaign">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0" stop-color="#2a1114"/><stop offset="0.55" stop-color="#140b0d"/><stop offset="1" stop-color="#050505"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.72" cy="0.22" r="0.62">
    <stop offset="0" stop-color="${RED}" stop-opacity=".55"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="800" height="900" fill="url(#sky)"/>
<rect width="800" height="900" fill="url(#glow)"/>
<g stroke="rgba(232,226,214,.16)" fill="none" stroke-width="3">
  <path d="M-40 560 Q160 486 360 560 Q560 634 840 546"/>
  <path d="M-40 620 Q160 546 360 620 Q560 694 840 606"/>
  <path d="M-40 680 Q160 606 360 680 Q560 754 840 666"/>
</g>
<g opacity=".9">
  <path d="M470 150 L322 420 L410 420 L378 640 L556 356 L458 356 Z" fill="${RED}"/>
  <path d="M470 150 L322 420 L410 420 L378 640 L556 356 L458 356 Z" fill="none" stroke="${RED_HI}" stroke-width="4"/>
</g>
<g stroke="rgba(255,255,255,.07)" stroke-width="2">
  <path d="M0 300 H800 M0 760 H800"/>
</g>
</svg>`);

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

// ── App logo mark ──────────────────────────────────────────────────────────
write('logo.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Coastline Current Solutions">
<defs><linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d1d20"/><stop offset="1" stop-color="#0b0b0b"/></linearGradient></defs>
<rect width="120" height="120" rx="28" fill="url(#l)"/>
<path d="M12 82 Q38 68 60 78 Q82 88 108 74" fill="none" stroke="#2a3a4a" stroke-width="7" stroke-linecap="round"/>
<path d="M12 94 Q38 80 60 90 Q82 100 108 86" fill="none" stroke="#1c2a33" stroke-width="7" stroke-linecap="round"/>
<path d="M70 18 L40 64 L57 64 L49 100 L82 52 L64 52 Z" fill="${'#c62a2e'}"/>
</svg>`);

console.log('Artwork written to www/img/');
