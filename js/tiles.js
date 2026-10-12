/* Tile drawing for Mahjong School.
   Tile codes: b1-b9 (Bams), c1-c9 (Craks), d1-d9 (Dots),
   N E W S (winds), DR DG DW (dragons, DW = soap), F (flower), J (joker), X (face down). */

const SANS = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";

const TILE_THEMES = [
  {
    id: 'real', name: 'Real Tiles', layout: 'big', frame: 'real',
    desc: 'Drawn like a real American set: bamboo sticks, a peacock 1 Bam, colored circles, Chinese characters, and small corner numbers.',
    face: '#fffdf5', face2: '#efe7d3', edge: '#14503d', stroke: '#d6ccb3', sw: 1, r: 7,
    ink: '#1b2333', bam: '#1f7a45', crak: '#c62828', dot: '#1e4e9a',
    joker: '#7a3d9e', flower: '#e0577e', back: '#2e8b6e', font: "Georgia,serif"
  },
  {
    id: 'ivory', name: 'Classic Ivory', layout: 'big',
    desc: 'Warm cream tiles with a big number and a small suit mark. Feels like a real set.',
    face: '#fdf8ec', face2: '#efe4c8', edge: '#b8925a', stroke: '#c9ad7a', sw: 1, r: 7,
    ink: '#2a241c', bam: '#1d7a47', crak: '#c0392b', dot: '#1f5fa8',
    joker: '#7a3d9e', flower: '#cf4f86', back: '#2f6b4f',
    font: "Georgia,'Times New Roman',serif"
  },
  {
    id: 'flat', name: 'Modern Flat', layout: 'band',
    desc: 'Clean white cards with a colored band that spells out the suit. Easiest for brand new players.',
    face: '#ffffff', face2: '#f6f7f9', edge: '#c9cfd8', stroke: '#dfe3e8', sw: 1, r: 8,
    ink: '#1c2430', bam: '#15a34a', crak: '#e0322f', dot: '#2563eb',
    joker: '#9333ea', flower: '#db2777', back: '#334155', font: SANS
  },
  {
    id: 'pips', name: 'Pip Count', layout: 'pips',
    desc: 'Dots and bams are drawn as real pips you can count, closest to the tiles you will buy.',
    face: '#fffdf7', face2: '#f3efe2', edge: '#8fae9c', stroke: '#d7d1bf', sw: 1, r: 6,
    ink: '#1f2a37', bam: '#2e7d4f', crak: '#c62828', dot: '#1565c0',
    joker: '#6a1b9a', flower: '#d81b60', back: '#1e5d8c',
    font: "'Trebuchet MS',system-ui,sans-serif"
  },
  {
    id: 'night', name: 'Night Table', layout: 'corner',
    desc: 'Dark tiles with bright corner numbers like playing cards. Easy on the eyes at night.',
    face: '#262d3f', face2: '#181d2a', edge: '#05070b', stroke: '#3c4660', sw: 1, r: 7,
    ink: '#eef1f7', bam: '#4ade80', crak: '#fb7185', dot: '#60a5fa',
    joker: '#c084fc', flower: '#f472b6', back: '#0f172a', font: SANS
  },
  {
    id: 'contrast', name: 'High Contrast', layout: 'shape',
    desc: 'Thick outlines and a different shape for each suit, so you never need color to tell them apart.',
    face: '#ffffff', face2: '#ffffff', edge: '#000000', stroke: '#000000', sw: 2.6, r: 6,
    ink: '#000000', bam: '#00703c', crak: '#b3001b', dot: '#0040a8',
    joker: '#5b0f99', flower: '#a3005a', back: '#111111',
    font: "Verdana,system-ui,sans-serif"
  }
];

const SUIT_LETTER = { b: 'bam', c: 'crak', d: 'dot' };
const SUIT_NAME = { bam: 'Bam', crak: 'Crak', dot: 'Dot' };
const WIND_NAMES = { N: 'North', E: 'East', W: 'West', S: 'South' };

const ALL_KINDS = (() => {
  const out = [];
  ['b', 'c', 'd'].forEach(s => { for (let n = 1; n <= 9; n++) out.push(s + n); });
  return out.concat(['N', 'E', 'W', 'S', 'DR', 'DG', 'DW', 'F', 'J']);
})();

function parseTile(code) {
  if (/^[bcd][1-9]$/.test(code)) return { kind: 'suit', suit: SUIT_LETTER[code[0]], n: +code[1] };
  if (/^[NEWS]$/.test(code)) return { kind: 'wind', letter: code };
  if (code === 'DR') return { kind: 'dragon', which: 'red' };
  if (code === 'DG') return { kind: 'dragon', which: 'green' };
  if (code === 'DW') return { kind: 'dragon', which: 'soap' };
  if (code === 'F') return { kind: 'flower' };
  if (code === 'J') return { kind: 'joker' };
  return { kind: 'back' };
}

function tileName(code) {
  const p = parseTile(code);
  switch (p.kind) {
    case 'suit': return p.n + ' ' + SUIT_NAME[p.suit];
    case 'wind': return WIND_NAMES[p.letter];
    case 'dragon': return p.which === 'red' ? 'Red Dragon' : p.which === 'green' ? 'Green Dragon' : 'White Dragon (Soap)';
    case 'flower': return 'Flower';
    case 'joker': return 'Joker';
    default: return 'Face-down tile';
  }
}

/* ---------- drawing helpers ---------- */
function T(x, y, txt, size, fill, font, weight, extra) {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="${font}" font-weight="${weight || 700}" text-anchor="middle" dominant-baseline="central"${extra || ''}>${txt}</text>`;
}
const f1 = v => (+v).toFixed(1);

function suitColor(t, suit) { return t[suit]; }
function dragonColor(t, which) { return which === 'red' ? t.crak : which === 'green' ? t.bam : t.dot; }

function bird(cx, cy, s, c) {
  const k = s / 20;
  return `<g transform="translate(${f1(cx)},${f1(cy)}) scale(${f1(k)})">` +
    `<path d="M-8 2 L-15 -5 L-13 5 Z" fill="${c}"/>` +
    `<ellipse cx="-1" cy="2" rx="8.5" ry="6.5" fill="${c}"/>` +
    `<circle cx="6.5" cy="-5.5" r="4.3" fill="${c}"/>` +
    `<path d="M10 -6 L15 -4 L10 -2.6 Z" fill="#e0a100"/>` +
    `<circle cx="7.5" cy="-6.5" r="1" fill="#fff"/></g>`;
}

function glyph(suit, cx, cy, s, t, n) {
  const c = suitColor(t, suit);
  if (suit === 'bam') {
    if (n === 1) return bird(cx, cy, s * 1.1, c);
    const w = s * 0.24;
    return [-1, 0, 1].map(i =>
      `<rect x="${f1(cx + i * s * 0.36 - w / 2)}" y="${f1(cy - s / 2)}" width="${f1(w)}" height="${f1(s)}" rx="${f1(w / 2)}" fill="${c}"/>`
    ).join('');
  }
  if (suit === 'crak') return T(cx, cy, '萬', f1(s * 1.1), c, t.font, 700);
  return `<circle cx="${cx}" cy="${cy}" r="${f1(s * 0.46)}" fill="none" stroke="${c}" stroke-width="${f1(s * 0.13)}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${f1(s * 0.17)}" fill="${c}"/>`;
}

function star(cx, cy, R, r, fill) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r : R, a = -Math.PI / 2 + i * Math.PI / 5;
    pts.push(f1(cx + rad * Math.cos(a)) + ',' + f1(cy + rad * Math.sin(a)));
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
}

function flowerMark(cx, cy, s, t) {
  let out = '';
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
    out += `<circle cx="${f1(cx + s * 0.62 * Math.cos(a))}" cy="${f1(cy + s * 0.62 * Math.sin(a))}" r="${f1(s * 0.48)}" fill="${t.flower}"/>`;
  }
  out += `<circle cx="${cx}" cy="${cy}" r="${f1(s * 0.38)}" fill="#f4b400"/>`;
  out += `<path d="M${cx} ${f1(cy + s * 1.1)} q -2 8 2 14" stroke="${t.bam}" stroke-width="1.6" fill="none"/>`;
  return out;
}

const WORD = { N: 'NORTH', E: 'EAST', W: 'WEST', S: 'SOUTH' };

function honor(p, t, cy, showWord) {
  if (showWord === undefined) showWord = true;
  const word = (txt, c) => showWord ? T(30, cy + 24, txt, 7.5, c, SANS, 700, ' letter-spacing="0.8"') : '';
  if (p.kind === 'wind') {
    return T(30, cy - 5, p.letter, 33, t.ink, t.font, 800) + word(WORD[p.letter], t.ink);
  }
  if (p.kind === 'dragon') {
    const c = dragonColor(t, p.which);
    let g = `<rect x="15" y="${cy - 22}" width="30" height="34" rx="5" fill="none" stroke="${c}" stroke-width="3.2"/>`;
    if (p.which === 'soap') {
      g += `<rect x="20.5" y="${cy - 16.5}" width="19" height="23" rx="3" fill="none" stroke="${c}" stroke-width="2"/>`;
    } else {
      g += T(30, cy - 5, p.which === 'red' ? 'R' : 'G', 20, c, t.font, 800);
    }
    return g + word(p.which === 'red' ? 'RED' : p.which === 'green' ? 'GREEN' : 'SOAP', c);
  }
  if (p.kind === 'flower') return flowerMark(30, cy - 9, 11, t) + word('FLOWER', t.flower);
  if (p.kind === 'joker') {
    return star(30, cy - 6, 17, 7.5, t.joker) + T(30, cy - 5, 'J', 11, '#fff', SANS, 800) +
      T(30, cy + 24, 'JOKER', 9, t.joker, SANS, 800, ' letter-spacing="0.6"');
  }
  return '';
}

/* pip positions for the Pip Count style */
const PIPS = {
  1: [[30, 39]],
  2: [[30, 24], [30, 55]],
  3: [[17, 21], [30, 39], [43, 57]],
  4: [[19, 24], [41, 24], [19, 55], [41, 55]],
  5: [[18, 22], [42, 22], [30, 39], [18, 57], [42, 57]],
  6: [[19, 20], [41, 20], [19, 39], [41, 39], [19, 58], [41, 58]],
  7: [[16, 17], [30, 25], [44, 33], [19, 48], [41, 48], [19, 63], [41, 63]],
  8: [[19, 16], [41, 16], [19, 32], [41, 32], [19, 48], [41, 48], [19, 64], [41, 64]],
  9: [[16, 21], [30, 21], [44, 21], [16, 39], [30, 39], [44, 39], [16, 57], [30, 57], [44, 57]]
};
const PIP_R = { 1: 14, 2: 9.5, 3: 8, 4: 8.5, 5: 7.5, 6: 7, 7: 6, 8: 6, 9: 6 };

function pipsSuit(p, t) {
  const c = suitColor(t, p.suit);
  if (p.suit === 'crak') {
    return T(30, 25, p.n, 24, t.ink, t.font, 800) + T(30, 55, '萬', 25, t.crak, t.font, 700);
  }
  if (p.suit === 'bam' && p.n === 1) return bird(31, 40, 31, c);
  let out = T(7.5, 9.5, p.n, 7.5, t.ink, SANS, 800);
  PIPS[p.n].forEach(([x, y]) => {
    const r = PIP_R[p.n];
    if (p.suit === 'dot') {
      out += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${f1(r * 0.58)}" fill="${t.face}"/><circle cx="${x}" cy="${y}" r="${f1(r * 0.28)}" fill="${c}"/>`;
    } else {
      const h = p.n <= 2 ? 22 : p.n >= 7 ? 12 : 14, w = p.n <= 2 ? 7 : 5;
      out += `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${w}" height="${h}" rx="${f1(w / 2)}" fill="${c}"/>` +
        `<line x1="${f1(x - w / 2)}" y1="${y}" x2="${f1(x + w / 2)}" y2="${y}" stroke="${t.face}" stroke-width="1.2"/>`;
    }
  });
  return out;
}

const LAYOUTS = {
  big(p, t) {
    if (p.kind === 'suit') {
      const c = suitColor(t, p.suit);
      return T(30, 29, p.n, 34, c, t.font, 800) + glyph(p.suit, 30, 58, 15, t, p.n);
    }
    return honor(p, t, 40);
  },
  band(p, t, clipId) {
    let color, label;
    if (p.kind === 'suit') { color = suitColor(t, p.suit); label = SUIT_NAME[p.suit].toUpperCase(); }
    else if (p.kind === 'wind') { color = t.ink; label = 'WIND'; }
    else if (p.kind === 'dragon') { color = dragonColor(t, p.which); label = 'DRAGON'; }
    else if (p.kind === 'flower') { color = t.flower; label = 'FLOWER'; }
    else { color = t.joker; label = 'JOKER'; }
    let out = `<rect x="2" y="2" width="56" height="17" fill="${color}" clip-path="url(#${clipId})"/>` +
      T(30, 11, label, 8, '#fff', SANS, 800, ' letter-spacing="1"');
    if (p.kind === 'suit') out += T(30, 47, p.n, 36, color, t.font, 800);
    else out += honor(p, t, 46, p.kind === 'wind' || p.kind === 'dragon');
    return out;
  },
  pips(p, t) {
    if (p.kind === 'suit') return pipsSuit(p, t);
    return honor(p, t, 40);
  },
  corner(p, t) {
    if (p.kind === 'suit') {
      const c = suitColor(t, p.suit);
      return T(12, 14, p.n, 16, c, t.font, 800) +
        glyph(p.suit, 12, 29, 8, t, p.n === 1 ? 0 : p.n) +
        glyph(p.suit, 34, 50, 26, t, p.n);
    }
    return honor(p, t, 41);
  },
  shape(p, t) {
    if (p.kind === 'suit') {
      const c = suitColor(t, p.suit);
      let shape;
      if (p.suit === 'bam') shape = `<rect x="13" y="13" width="34" height="34" rx="3" fill="none" stroke="${c}" stroke-width="3.6"/>`;
      else if (p.suit === 'crak') shape = `<path d="M30 9 L51 30 L30 51 L9 30 Z" fill="none" stroke="${c}" stroke-width="3.6" stroke-linejoin="round"/>`;
      else shape = `<circle cx="30" cy="30" r="18" fill="none" stroke="${c}" stroke-width="3.6"/>`;
      return shape + T(30, 31, p.n, 24, t.ink, t.font, 800) +
        T(30, 63, SUIT_NAME[p.suit].toUpperCase(), 10, c, SANS, 800, ' letter-spacing="0.8"');
    }
    return honor(p, t, 40);
  }
};

/* ================= REAL TILES ================= */
const RC = { G: '#1f7a45', R: '#c62828', B: '#1e4e9a', K: '#1b2333', Y: '#e9a800', P: '#e0577e', W: '#7a4a2a' };
const CJK = "'Noto Serif CJK SC','Noto Serif SC','Songti SC','STSong','SimSun','Hiragino Mincho ProN',serif";
const CN_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const CN_WIND = { N: '北', E: '東', W: '西', S: '南' };

function rIndex(txt, color) {
  return T(8.5, 11, txt, 9, color, SANS, 800);
}

function bamStick(x, y, h, c, rot) {
  const w = 5.4, top = y - h / 2;
  const g = `<rect x="${f1(x - w / 2)}" y="${f1(top)}" width="${w}" height="${f1(h)}" rx="2.7" fill="${c}"/>` +
    `<rect x="${f1(x - w / 2 + 1)}" y="${f1(top + 1.2)}" width="1.3" height="${f1(h - 2.4)}" rx=".65" fill="rgba(255,255,255,.5)"/>` +
    [top + 1.4, y, top + h - 1.4].map(ny =>
      `<rect x="${f1(x - w / 2 - .7)}" y="${f1(ny - 1)}" width="${f1(w + 1.4)}" height="2" rx="1" fill="${c}"/>` +
      `<line x1="${f1(x - w / 2)}" y1="${f1(ny)}" x2="${f1(x + w / 2)}" y2="${f1(ny)}" stroke="#fffdf5" stroke-width=".7"/>`
    ).join('');
  return rot ? `<g transform="rotate(${rot} ${x} ${y})">${g}</g>` : g;
}

const R_BAMS = {
  2: { h: 24, s: [[30, 22, 'B'], [30, 53, 'G']] },
  3: { h: 22, s: [[30, 22, 'B'], [20, 52, 'G'], [40, 52, 'G']] },
  4: { h: 24, s: [[21, 23, 'B'], [39, 23, 'G'], [21, 53, 'G'], [39, 53, 'B']] },
  5: { h: 22, s: [[16, 23, 'G'], [44, 23, 'B'], [30, 38, 'R'], [16, 53, 'B'], [44, 53, 'G']] },
  6: { h: 24, s: [[17, 23, 'G'], [30, 23, 'G'], [43, 23, 'G'], [17, 53, 'B'], [30, 53, 'B'], [43, 53, 'B']] },
  7: { h: 17, s: [[30, 16, 'R'], [17, 37, 'G'], [30, 37, 'G'], [43, 37, 'G'], [17, 58, 'B'], [30, 58, 'B'], [43, 58, 'B']] },
  8: { h: 21, s: [[15, 26, 'G', 0], [25, 26, 'G', -22], [35, 26, 'G', 22], [45, 26, 'G', 0],
                  [15, 55, 'B', 0], [25, 55, 'B', 22], [35, 55, 'B', -22], [45, 55, 'B', 0]] },
  9: { h: 16, s: [[18, 21, 'G'], [30, 21, 'R'], [42, 21, 'B'], [18, 39, 'G'], [30, 39, 'R'], [42, 39, 'B'], [18, 57, 'G'], [30, 57, 'R'], [42, 57, 'B']] }
};

const R_DOTS = {
  2: { r: 11, s: [[30, 22, 'G'], [30, 53, 'B']] },
  3: { r: 9, s: [[19, 21, 'B'], [30, 39, 'R'], [41, 57, 'G']] },
  4: { r: 10, s: [[19, 23, 'B'], [41, 23, 'G'], [19, 53, 'G'], [41, 53, 'B']] },
  5: { r: 8.4, s: [[18, 22, 'B'], [42, 22, 'G'], [30, 39, 'R'], [18, 56, 'G'], [42, 56, 'B']] },
  6: { r: 7.8, s: [[20, 19, 'G'], [40, 19, 'G'], [20, 41, 'R'], [40, 41, 'R'], [20, 60, 'R'], [40, 60, 'R']] },
  7: { r: 6.6, s: [[18, 17, 'G'], [30, 22, 'G'], [42, 27, 'G'], [20, 45, 'R'], [40, 45, 'R'], [20, 61, 'R'], [40, 61, 'R']] },
  8: { r: 6.7, s: [[21, 16, 'B'], [40, 16, 'B'], [21, 31, 'B'], [40, 31, 'B'], [21, 46, 'B'], [40, 46, 'B'], [21, 61, 'B'], [40, 61, 'B']] },
  9: { r: 6.9, s: [[17, 21, 'B'], [30, 21, 'B'], [43, 21, 'B'], [17, 39, 'R'], [30, 39, 'R'], [43, 39, 'R'], [17, 57, 'G'], [30, 57, 'G'], [43, 57, 'G']] }
};

function dotPip(x, y, r, c) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` +
    `<circle cx="${x}" cy="${y}" r="${f1(r * .8)}" fill="#fffdf5"/>` +
    `<circle cx="${x}" cy="${y}" r="${f1(r * .64)}" fill="${c}"/>` +
    `<circle cx="${x}" cy="${y}" r="${f1(r * .36)}" fill="#fffdf5"/>` +
    `<circle cx="${x}" cy="${y}" r="${f1(r * .2)}" fill="${c}"/>`;
}

function oneDot() {
  let s = `<circle cx="30" cy="38" r="20" fill="${RC.G}"/><circle cx="30" cy="38" r="17.5" fill="#fffdf5"/>`;
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    s += `<circle cx="${f1(30 + 13.6 * Math.cos(a))}" cy="${f1(38 + 13.6 * Math.sin(a))}" r="2.3" fill="${RC.R}"/>`;
  }
  return s + `<circle cx="30" cy="38" r="10" fill="${RC.B}"/><circle cx="30" cy="38" r="7.4" fill="#fffdf5"/>` +
    `<circle cx="30" cy="38" r="5.2" fill="${RC.R}"/><circle cx="30" cy="38" r="2" fill="#fffdf5"/>`;
}

function peacock() {
  return `<g>` +
    `<path d="M12 64 Q30 58 50 61" stroke="${RC.W}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
    `<path d="M20 50 Q8 56 9 68 Q15 60 24 56 Z" fill="${RC.G}"/>` +
    `<path d="M22 52 Q14 64 19 72 Q21 62 27 57 Z" fill="${RC.B}"/>` +
    `<circle cx="12" cy="64" r="2.2" fill="${RC.R}"/><circle cx="19" cy="68" r="2" fill="${RC.Y}"/>` +
    `<ellipse cx="31" cy="44" rx="10" ry="13" transform="rotate(-18 31 44)" fill="${RC.G}"/>` +
    `<path d="M26 38 Q36 44 33 56 Q24 52 26 38 Z" fill="${RC.B}"/>` +
    `<path d="M28 42 Q33 46 31 52" stroke="#9fd3b4" stroke-width="1" fill="none"/>` +
    `<path d="M35 33 Q37 26 39 23" stroke="${RC.G}" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    `<circle cx="40" cy="21" r="5" fill="${RC.G}"/>` +
    `<path d="M44.5 20 L50 21.5 L44.5 23.5 Z" fill="${RC.Y}"/>` +
    `<circle cx="41.5" cy="20" r="1.5" fill="#fff"/><circle cx="41.8" cy="20" r=".8" fill="#111"/>` +
    `<path d="M38 16 L36 9 M40 16 L40 8.5 M42 16 L44 9.5" stroke="${RC.R}" stroke-width="1"/>` +
    `<circle cx="36" cy="9" r="1.4" fill="${RC.R}"/><circle cx="40" cy="8.5" r="1.4" fill="${RC.R}"/><circle cx="44" cy="9.5" r="1.4" fill="${RC.R}"/>` +
    `<path d="M29 56 L28 62 M34 55 L35 61" stroke="${RC.W}" stroke-width="1.3"/>` +
    `</g>`;
}

function blossom(x, y, s, c) {
  let g = '';
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
    g += `<circle cx="${f1(x + s * .62 * Math.cos(a))}" cy="${f1(y + s * .62 * Math.sin(a))}" r="${f1(s * .5)}" fill="${c}"/>`;
  }
  return g + `<circle cx="${x}" cy="${y}" r="${f1(s * .34)}" fill="${RC.Y}"/>`;
}

function flowerArt() {
  const leaf = (x, y, a) => `<ellipse cx="${x}" cy="${y}" rx="5.5" ry="2.4" transform="rotate(${a} ${x} ${y})" fill="${RC.G}"/>`;
  return `<path d="M14 68 Q22 48 30 40 Q38 30 46 14" stroke="${RC.W}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
    `<path d="M30 40 Q22 36 17 28" stroke="${RC.W}" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
    leaf(22, 54, -50) + leaf(36, 30, -40) + leaf(24, 34, 30) + leaf(41, 22, 60) +
    blossom(45, 15, 8, RC.P) + blossom(17, 27, 7, RC.R) + blossom(36, 45, 7.5, RC.P) +
    `<circle cx="26" cy="61" r="2.6" fill="${RC.P}"/>`;
}

function jokerArt() {
  return `<path d="M14 40 L9 18 L22 30 Z" fill="${RC.R}"/>` +
    `<path d="M22 30 L30 9 L38 30 Z" fill="${RC.B}"/>` +
    `<path d="M38 30 L51 18 L46 40 Z" fill="${RC.G}"/>` +
    `<path d="M14 40 L22 30 L38 30 L46 40 Z" fill="${RC.Y}"/>` +
    `<path d="M22 30 L30 40 L38 30" stroke="#b07d00" stroke-width="1" fill="none"/>` +
    `<circle cx="9" cy="18" r="3" fill="${RC.Y}"/><circle cx="30" cy="9" r="3" fill="${RC.Y}"/><circle cx="51" cy="18" r="3" fill="${RC.Y}"/>` +
    `<rect x="13" y="39" width="34" height="5" rx="2.5" fill="${RC.K}"/>` +
    T(30, 56, 'JOKER', 11, RC.R, SANS, 900, ' letter-spacing="0.5"') +
    `<path d="M14 64 H46" stroke="${RC.B}" stroke-width="1.6"/>`;
}

function realInner(p) {
  if (p.kind === 'suit') {
    if (p.suit === 'bam') {
      if (p.n === 1) return peacock() + rIndex(1, RC.G);
      const d = R_BAMS[p.n];
      return d.s.map(([x, y, c, rot]) => bamStick(x, y, d.h, RC[c], rot)).join('') + rIndex(p.n, RC.G);
    }
    if (p.suit === 'dot') {
      if (p.n === 1) return oneDot() + rIndex(1, RC.B);
      const d = R_DOTS[p.n];
      return d.s.map(([x, y, c]) => dotPip(x, y, d.r, RC[c])).join('') + rIndex(p.n, RC.B);
    }
    return T(32, 23, CN_NUM[p.n], 21, RC.K, CJK, 700) + T(30, 52, '萬', 27, RC.R, CJK, 700) + rIndex(p.n, RC.R);
  }
  if (p.kind === 'wind') return T(31, 40, CN_WIND[p.letter], 33, RC.K, CJK, 700) + rIndex(p.letter, RC.R);
  if (p.kind === 'dragon') {
    if (p.which === 'red') return T(30, 38, '中', 36, RC.R, CJK, 700);
    if (p.which === 'green') return T(30, 38, '發', 33, RC.G, CJK, 700);
    return `<rect x="11" y="10" width="38" height="56" rx="3" fill="none" stroke="${RC.B}" stroke-width="3"/>` +
      `<rect x="16.5" y="15.5" width="27" height="45" rx="2" fill="none" stroke="${RC.B}" stroke-width="1.4"/>` +
      [[11, 10], [49, 10], [11, 66], [49, 66]].map(([x, y]) => `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" fill="${RC.B}"/>`).join('');
  }
  if (p.kind === 'flower') return flowerArt();
  if (p.kind === 'joker') return jokerArt();
  return '';
}

function renderRealTile(code, size, t) {
  const p = parseTile(code);
  const h = Math.round(size * 80 / 60);
  const gid = 'rf-' + t.id, bid = 'rb-' + t.id;
  const defs = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#fffef9"/><stop offset=".7" stop-color="#f7f1e2"/><stop offset="1" stop-color="#ebe2cc"/></linearGradient>` +
    `<linearGradient id="${bid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.back}"/><stop offset="1" stop-color="${t.edge}"/></linearGradient></defs>`;
  const body = `<rect x="2" y="6" width="56" height="73" rx="7" fill="url(#${bid})"/>` +
    `<rect x="2" y="4" width="56" height="70" rx="7" fill="#e3d8bf"/>`;
  let face;
  if (p.kind === 'back') {
    face = `<rect x="2" y="1.5" width="56" height="71" rx="7" fill="url(#${bid})"/>` +
      `<rect x="8" y="8" width="44" height="58" rx="4" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.4"/>`;
  } else {
    face = `<rect x="2.3" y="1.5" width="55.4" height="71" rx="6.5" fill="url(#${gid})" stroke="#d6ccb3" stroke-width=".8"/>` +
      `<rect x="3.8" y="3" width="52.4" height="68" rx="5.4" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1"/>` +
      realInner(p);
  }
  return `<svg class="tile" viewBox="0 0 60 80" width="${size}" height="${h}" role="img" aria-label="${tileName(code)}">${defs}${body}${face}</svg>`;
}

let _tileUid = 0;
function renderTile(code, size, theme) {
  size = size || 40;
  const t = theme || (typeof currentTheme === 'function' ? currentTheme() : TILE_THEMES[0]);
  if (t.frame === 'real') return renderRealTile(code, size, t);
  const p = parseTile(code);
  const h = Math.round(size * 80 / 60);
  const gid = 'tg-' + t.id, cid = 'tc-' + t.id + '-' + (++_tileUid);
  const defs = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.face}"/><stop offset="1" stop-color="${t.face2}"/></linearGradient>` +
    `<clipPath id="${cid}"><rect x="2" y="2" width="56" height="72" rx="${t.r}"/></clipPath></defs>`;
  const depth = `<rect x="2" y="5" width="56" height="73" rx="${t.r}" fill="${t.edge}"/>`;
  let face, inner = '';
  if (p.kind === 'back') {
    face = `<rect x="2" y="2" width="56" height="72" rx="${t.r}" fill="${t.back}" stroke="${t.stroke}" stroke-width="${t.sw}"/>` +
      `<rect x="9" y="9" width="42" height="58" rx="4" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>`;
  } else {
    face = `<rect x="2" y="2" width="56" height="72" rx="${t.r}" fill="url(#${gid})" stroke="${t.stroke}" stroke-width="${t.sw}"/>`;
    inner = LAYOUTS[t.layout](p, t, cid);
  }
  return `<svg class="tile" viewBox="0 0 60 80" width="${size}" height="${h}" role="img" aria-label="${tileName(code)}">${defs}${depth}${face}${inner}</svg>`;
}

if (typeof module !== 'undefined') module.exports = { TILE_THEMES, ALL_KINDS, parseTile, tileName, renderTile };
