/* Step 2: the practice card, the hand-matching engine, and the hand-finder games.
   The practice card is invented for teaching. Its categories follow the kinds of
   sections on a real yearly card, but the hands are not the National Mah Jongg League's. */
(function () {
  /* ---------- group builders ---------- */
  const num = (v, n, c) => ({ k: 'num', v, n, c });      // number tile, v is a digit or 'x' / 'x+1'...
  const zero = n => ({ k: 'zero', n });                   // soap used as 0
  const flw = n => ({ k: 'flower', n });
  const drg = (n, c) => ({ k: 'drag', n, c });            // dragon that matches the suit of color c
  const wnd = (w, n) => ({ k: 'wind', w, n });
  const cl = (...parts) => ({ k: 'cluster', parts });     // printed together, counted separately
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  const yr = c => cl(num(2, 1, c), zero(1), num(2, 1, c), num(6, 1, c));

  const CATS = [
    { id: '2026', name: '2026', desc: 'Built from the year: 2, 0, 2, 6. The 0 is always soap.', look: 'Lots of 2s and 6s, soap, or flowers.' },
    { id: '2468', name: '2468', desc: 'Even numbers only.', look: 'Lots of 2s, 4s, 6s and 8s, especially in one suit.' },
    { id: 'like', name: 'Any Like Numbers', desc: 'The same number in different suits.', look: 'The same number showing up in two or three suits.' },
    { id: 'quints', name: 'Quints', desc: 'Groups of five. They always need jokers (except flowers).', look: 'Two or more jokers and a few kongs started.' },
    { id: 'run', name: 'Consecutive Run', desc: 'Numbers in a row, like 4 5 6. You choose where the run starts.', look: 'Numbers next to each other, like 3 4 5 or 6 7 8.' },
    { id: 'odd', name: '13579', desc: 'Odd numbers only.', look: 'Lots of 1s, 3s, 5s, 7s and 9s.' },
    { id: 'wd', name: 'Winds and Dragons', desc: 'No numbers at all.', look: 'Three or more winds, or several dragons.' },
    { id: '369', name: '369', desc: 'Only 3s, 6s and 9s.', look: 'A handful of 3s, 6s and 9s.' },
    { id: 'sp', name: 'Singles and Pairs', desc: 'Only pairs and singles. Always concealed, and jokers can\'t be used at all.', look: 'Lots of natural pairs and few jokers.' }
  ];

  const CARD = [
    { id: 'y1', cat: '2026', g: [flw(2), yr(0), num(2, 4, 1), num(6, 4, 2)], xc: 'X', v: 25, note: 'Any 3 suits' },
    { id: 'y2', cat: '2026', g: [num(2, 3, 0), zero(4), num(2, 3, 1), num(6, 4, 2)], xc: 'X', v: 25, note: 'Any 3 suits' },
    { id: 'y3', cat: '2026', g: [cl(wnd('N', 2), wnd('E', 2), wnd('W', 2), wnd('S', 2)), yr(0), flw(2)], xc: 'C', v: 50, note: 'Any 1 suit' },

    { id: 'e1', cat: '2468', g: [num(2, 3, 0), num(4, 4, 0), num(6, 3, 0), num(8, 4, 0)], xc: 'X', v: 25, note: 'Any 1 suit' },
    { id: 'e2', cat: '2468', g: [flw(2), num(2, 4, 0), num(4, 2, 0), num(6, 2, 0), num(8, 4, 0)], xc: 'X', v: 25, note: 'Any 1 suit' },
    { id: 'e3', cat: '2468', g: [num(2, 2, 0), num(4, 2, 0), num(6, 3, 0), num(8, 3, 0), drg(4, 0)], xc: 'X', v: 25, note: 'Any 1 suit, matching dragons' },
    { id: 'e4', cat: '2468', g: [flw(2), cl(num(2, 1, 0), num(4, 1, 0), num(6, 1, 0), num(8, 1, 0)), num(2, 4, 1), num(8, 4, 2)], xc: 'X', v: 30, note: 'Any 3 suits' },

    { id: 'l1', cat: 'like', g: [flw(2), num('x', 4, 0), num('x', 4, 1), num('x', 4, 2)], xc: 'X', v: 25, note: 'Any like numbers, 3 suits', vars: range(1, 9) },
    { id: 'l2', cat: 'like', g: [num('x', 3, 0), drg(4, 0), num('x', 3, 1), drg(4, 1)], xc: 'X', v: 30, note: 'Any like numbers, 2 suits, matching dragons', vars: range(1, 9) },
    { id: 'l3', cat: 'like', g: [num('x', 2, 0), num('x', 3, 1), num('x', 4, 2), flw(5)], xc: 'X', v: 30, note: 'Any like numbers, 3 suits', vars: range(1, 9) },

    { id: 'q1', cat: 'quints', g: [flw(4), num('x', 5, 0), num('x+1', 5, 0)], xc: 'X', v: 40, note: 'Any 2 numbers in a row, 1 suit', vars: range(1, 8) },
    { id: 'q2', cat: 'quints', g: [num(1, 5, 0), drg(4, 0), num(9, 5, 0)], xc: 'X', v: 40, note: 'Any 1 suit, matching dragon' },

    { id: 'r1', cat: 'run', g: [num('x', 3, 0), num('x+1', 4, 0), num('x+2', 3, 0), num('x+3', 4, 0)], xc: 'X', v: 25, note: 'Any 4 numbers in a row, 1 suit', vars: range(1, 6) },
    { id: 'r2', cat: 'run', g: [flw(2), num('x', 4, 0), num('x+1', 4, 1), num('x+2', 4, 2)], xc: 'X', v: 25, note: 'Any 3 numbers in a row, 3 suits', vars: range(1, 7) },
    { id: 'r3', cat: 'run', g: [num('x', 2, 0), num('x+1', 3, 0), num('x+2', 4, 0), drg(5, 0)], xc: 'X', v: 30, note: 'Any 3 numbers in a row, 1 suit, matching dragon', vars: range(1, 7) },

    { id: 'o1', cat: 'odd', g: [num(1, 3, 0), num(3, 4, 0), num(5, 3, 0), num(7, 4, 0)], xc: 'X', v: 25, note: 'Any 1 suit' },
    { id: 'o2', cat: 'odd', g: [num(1, 2, 0), num(3, 2, 0), num(5, 3, 0), num(7, 3, 0), num(9, 4, 0)], xc: 'X', v: 25, note: 'Any 1 suit' },
    { id: 'o3', cat: 'odd', g: [num(1, 4, 0), num(3, 3, 1), num(5, 4, 2), drg(3, 0)], xc: 'X', v: 30, note: 'Any 3 suits, dragon matches the 1s' },

    { id: 'w1', cat: 'wd', g: [wnd('N', 4), wnd('E', 3), wnd('W', 3), wnd('S', 4)], xc: 'X', v: 25, note: 'Winds only' },
    { id: 'w2', cat: 'wd', g: [flw(2), wnd('N', 4), wnd('S', 4), drg(4, 0)], xc: 'X', v: 25, note: 'Any dragon' },
    { id: 'w3', cat: 'wd', g: [cl(wnd('N', 1), wnd('E', 1), wnd('W', 1), wnd('S', 1)), drg(3, 0), drg(3, 1), drg(4, 2)], xc: 'X', v: 30, note: 'All three dragons' },

    { id: 't1', cat: '369', g: [num(3, 3, 0), num(6, 4, 0), num(9, 3, 0), flw(4)], xc: 'X', v: 25, note: 'Any 1 suit' },
    { id: 't2', cat: '369', g: [flw(2), num(3, 4, 0), num(6, 4, 1), num(9, 4, 2)], xc: 'X', v: 25, note: 'Any 3 suits' },
    { id: 't3', cat: '369', g: [num(3, 3, 0), num(6, 3, 0), num(9, 3, 0), drg(5, 0)], xc: 'X', v: 30, note: 'Any 1 suit, matching dragon' },

    { id: 'p1', cat: 'sp', g: [cl(wnd('N', 2), wnd('E', 2), wnd('W', 2), wnd('S', 2)), cl(drg(2, 0), drg(2, 1), drg(2, 2))], xc: 'C', v: 50, note: 'Pairs of every wind and dragon' },
    { id: 'p2', cat: 'sp', g: [flw(2), cl(num('x', 2, 0), num('x+1', 2, 0), num('x+2', 2, 0), num('x+3', 2, 0), num('x+4', 2, 0), num('x+5', 2, 0))], xc: 'C', v: 50, note: 'Any 6 numbers in a row, 1 suit', vars: range(1, 4) },
    { id: 'p3', cat: 'sp', g: [cl(num(3, 2, 0), num(6, 2, 0), num(9, 2, 0)), cl(num(3, 2, 1), num(6, 2, 1), num(9, 2, 1)), flw(2)], xc: 'C', v: 50, note: 'Any 2 suits' }
  ];

  /* ---------- engine ---------- */
  const SUITS = ['b', 'c', 'd'];
  const DRAGON_BY_SUIT = { b: 'DG', c: 'DR', d: 'DW' };
  const flat = line => line.g.reduce((a, g) => a.concat(g.k === 'cluster' ? g.parts : [g]), []);
  const numVal = (g, x) => typeof g.v === 'number' ? g.v : x + (+(g.v.split('+')[1] || 0));
  const kColors = line => flat(line).reduce((k, g) => (g.k === 'num' || g.k === 'drag') ? Math.max(k, g.c + 1) : k, 0);
  const PERMS = {};
  function perms(k) {
    if (PERMS[k]) return PERMS[k];
    const out = [];
    const rec = c => {
      if (c.length === k) { out.push(c.slice()); return; }
      SUITS.forEach(s => { if (!c.includes(s)) { c.push(s); rec(c); c.pop(); } });
    };
    rec([]);
    return (PERMS[k] = out);
  }
  function tileOf(g, x, p) {
    switch (g.k) {
      case 'num': return p[g.c] + numVal(g, x);
      case 'zero': return 'DW';
      case 'flower': return 'F';
      case 'wind': return g.w;
      case 'drag': return DRAGON_BY_SUIT[p[g.c]];
    }
  }
  function countRack(rack) {
    const c = {}; let j = 0;
    rack.forEach(t => { if (t === 'J') j++; else c[t] = (c[t] || 0) + 1; });
    return { c, j };
  }

  function evalInst(line, x, p, cnt) {
    const left = Object.assign({}, cnt.c);
    const fill = flat(line).map(g => ({ tile: tileOf(g, x, p), n: g.n, ok: g.n >= 3, nat: 0, jok: 0 }));
    // real tiles go to pairs and singles first, since jokers can't fill those
    [false, true].forEach(pass => fill.forEach(f => {
      if (f.ok !== pass) return;
      const take = Math.min(left[f.tile] || 0, f.n, f.tile === 'F' ? 8 : 4);
      f.nat = take; left[f.tile] = (left[f.tile] || 0) - take;
    }));
    let J = cnt.j;
    fill.forEach(f => { if (f.ok && J > 0) { const t = Math.min(J, f.n - f.nat); f.jok = t; J -= t; } });
    const naturals = fill.reduce((a, f) => a + f.nat, 0);
    const jokers = fill.reduce((a, f) => a + f.jok, 0);
    const missNat = fill.reduce((a, f) => a + (f.ok ? 0 : f.n - f.nat), 0);
    const missJ = fill.reduce((a, f) => a + (f.ok ? f.n - f.nat - f.jok : 0), 0);
    return { line, x, p, fill, naturals, jokers, matched: naturals + jokers, missNat, missJ, away: 14 - naturals - jokers };
  }

  function bestFor(line, cnt) {
    let best = null;
    (line.vars || [0]).forEach(x => perms(Math.max(1, kColors(line))).forEach(p => {
      const r = evalInst(line, x, p, cnt);
      if (!best || r.matched > best.matched || (r.matched === best.matched &&
        (r.naturals > best.naturals || (r.naturals === best.naturals && r.missNat < best.missNat)))) best = r;
    }));
    return best;
  }

  function rankAll(rack) {
    const cnt = countRack(rack);
    return CARD.map(l => bestFor(l, cnt)).sort((a, b) =>
      b.matched - a.matched || b.naturals - a.naturals || a.missNat - b.missNat);
  }

  function usedMap(results) {
    const u = {};
    results.forEach(r => {
      const m = {};
      r.fill.forEach(f => { m[f.tile] = (m[f.tile] || 0) + f.nat; m.J = (m.J || 0) + f.jok; });
      Object.keys(m).forEach(t => { u[t] = Math.max(u[t] || 0, m[t]); });
    });
    return u;
  }

  const WALL = (() => { const w = []; ALL_KINDS.forEach(k => { const n = (k === 'F' || k === 'J') ? 8 : 4; for (let i = 0; i < n; i++) w.push(k); }); return w; })();
  const ORDER = ALL_KINDS.reduce((o, k, i) => (o[k] = i, o), {});
  const sortRack = r => r.slice().sort((a, b) => ORDER[a] - ORDER[b]);

  function deal(ok, tries) {
    let last;
    for (let i = 0; i < (tries || 300); i++) {
      const rack = sortRack(shuffle(WALL).slice(0, 13));
      const ranked = rankAll(rack);
      last = { rack, ranked };
      if (!ok || ok(last)) return last;
    }
    return last;
  }

  /* ---------- difficulty levels ---------- */
  const LEVELS = {
    easy: { name: 'Easy', min: 8, max: 12, short: '8 or more fit', desc: 'Your best hand already has 8 or more tiles. Learn to spot it fast.' },
    medium: { name: 'Medium', min: 5, max: 5, short: '5 fit', desc: 'Your best hand has 5 tiles, like most real deals.' },
    hard: { name: 'Hard', min: 3, max: 4, short: 'only 3 or 4 fit', desc: 'Only 3 or 4 tiles really go anywhere. Practice what to do with a messy rack.' }
  };
  const LEVEL_IDS = ['easy', 'medium', 'hard'];
  const level = () => { const l = MS().Store.data.level; return LEVELS[l] ? l : 'medium'; };

  function fullHand(line, x, p) {
    const out = [], cnt = {};
    flat(line).forEach(g => {
      const t = tileOf(g, x, p);
      for (let i = 0; i < g.n; i++) {
        if (t !== 'F' && (cnt[t] || 0) >= 4) out.push('J');
        else { out.push(t); cnt[t] = (cnt[t] || 0) + 1; }
      }
    });
    return out;
  }
  // Easy racks start from a real hand, then the rest is random
  function seededRack(k) {
    const line = pick(CARD);
    const x = pick(line.vars || [0]), p = pick(perms(Math.max(1, kColors(line))));
    const pool = WALL.slice(), rack = [];
    shuffle(fullHand(line, x, p)).forEach(t => {
      if (rack.length >= k) return;
      const i = pool.indexOf(t);
      if (i >= 0) { pool.splice(i, 1); rack.push(t); }
    });
    return sortRack(rack.concat(shuffle(pool).slice(0, 13 - rack.length)));
  }
  // Hard racks: swap out useful tiles until the best hand only fits `target` tiles
  function messyRack(target) {
    let rack = shuffle(WALL).slice(0, 13).filter(t => t !== 'J');
    const pool = WALL.slice();
    rack.forEach(t => pool.splice(pool.indexOf(t), 1));
    while (rack.length < 13) { const i = pool.findIndex(t => t !== 'J'); rack.push(pool.splice(i, 1)[0]); }
    for (let step = 0; step < 60; step++) {
      const top = rankAll(rack)[0];
      if (top.matched <= target) break;
      const usedTiles = top.fill.filter(f => f.nat > 0).map(f => f.tile);
      const out = rack.indexOf(pick(usedTiles));
      let j = rand(pool.length), guard = 0;
      while (pool[j] === 'J' && guard++ < 20) j = rand(pool.length);
      if (pool[j] === 'J') continue;
      const incoming = pool.splice(j, 1)[0];
      pool.push(rack[out]);
      rack[out] = incoming;
    }
    return sortRack(rack);
  }
  function dealLevel(lv, extra) {
    const L = LEVELS[lv];
    let fallback = null;
    for (let i = 0; i < 1500; i++) {
      const rack = lv === 'easy' ? seededRack(8 + rand(2))
        : lv === 'hard' ? messyRack(Math.random() < 0.7 ? 3 : 4)
        : sortRack(shuffle(WALL).slice(0, 13));
      const d = { rack, ranked: rankAll(rack) };
      const m = d.ranked[0].matched;
      if (m >= L.min && m <= L.max) {
        if (!extra || extra(d)) return d;
        if (!fallback) fallback = d;
      }
    }
    return fallback || deal();
  }
  function levelPicker(cur) {
    return `<div class="levels" role="radiogroup" aria-label="Difficulty">${LEVEL_IDS.map(id => `<button class="lvl lvl-${id}${id === cur ? ' on' : ''}" data-lv="${id}" role="radio" aria-checked="${id === cur}"><b>${LEVELS[id].name}</b><small>${LEVELS[id].short}</small></button>`).join('')}</div>`;
  }
  function wireLevels(root, onPick) {
    root.querySelectorAll('.lvl').forEach(b => {
      b.onclick = () => { MS().Store.data.level = b.dataset.lv; MS().Store.save(); onPick(b.dataset.lv); };
    });
  }
  const HARD_TIP = `<div class="hardtip"><b>Messy rack tips</b><ul><li>Keep your jokers and any natural pairs.</li><li>Favor hands built from pungs and kongs, so jokers can fill the gaps.</li><li>Keep 3 or 4 hands in mind and let the Charleston pick for you.</li></ul></div>`;
  const tip = () => level() === 'hard' ? HARD_TIP : '';
  const scoreKey = (id, lv) => 'find' + id + '-' + lv;

  /* ---------- drawing ---------- */
  const CLS = ['ln-a', 'ln-b', 'ln-c'];
  const gCls = g => (g.k === 'num' || g.k === 'drag') ? CLS[g.c] : 'ln-n';
  function gTxt(g, x) {
    switch (g.k) {
      case 'num': return String(numVal(g, x)).repeat(g.n);
      case 'zero': return '0'.repeat(g.n);
      case 'flower': return 'F'.repeat(g.n);
      case 'wind': return g.w.repeat(g.n);
      case 'drag': return 'D'.repeat(g.n);
    }
  }
  function lineHtml(line, extra) {
    const x = line.vars ? line.vars[0] : 0;
    const groups = line.g.map(g => g.k === 'cluster'
      ? `<span class="grp">${g.parts.map(p => `<span class="${gCls(p)}">${gTxt(p, x)}</span>`).join('')}</span>`
      : `<span class="grp ${gCls(g)}">${gTxt(g, x)}</span>`).join('');
    return `<div class="pline"><div class="pl-groups">${groups}</div>
      <div class="pl-meta"><span class="pl-note">${line.note}</span><span class="pl-tag">${line.xc}</span><span class="pl-val">${line.v}</span>${extra || ''}</div></div>`;
  }
  const tw = (c, size, cls) => `<span class="tw ${cls || ''}">${renderTile(c, size)}</span>`;
  function buildHtml(r, size) {
    size = size || 32;
    return '<div class="build">' + r.fill.map(f => {
      let s = '';
      for (let i = 0; i < f.n; i++) {
        if (i < f.nat) s += tw(f.tile, size);
        else if (i < f.nat + f.jok) s += tw('J', size, 'jk');
        else s += tw(f.tile, size, 'ghost');
      }
      return `<span class="bgrp">${s}</span>`;
    }).join('') + '</div>';
  }
  function sampleBuild(line) {
    const x = line.vars ? line.vars[0] : 0, p = perms(Math.max(1, kColors(line)))[0];
    return '<div class="build">' + flat(line).map(g => {
      const t = tileOf(g, x, p); let s = '';
      for (let i = 0; i < g.n; i++) s += tw(i >= 4 && t !== 'F' ? 'J' : t, 32);
      return `<span class="bgrp">${s}</span>`;
    }).join('') + '</div>';
  }
  function rackHtml(rack, opts) {
    opts = opts || {};
    const used = opts.used ? Object.assign({}, opts.used) : null;
    return `<div class="prack${opts.select ? ' selectable' : ''}">` + rack.map((c, i) => {
      let cls = '';
      if (used) { if ((used[c] || 0) > 0) { used[c]--; cls = 'use'; } else cls = 'dim'; }
      if (opts.marked && opts.marked.includes(i)) cls += ' picked';
      return opts.select ? `<button class="rt ${cls}" data-i="${i}">${renderTile(c, opts.size || 34)}</button>`
        : `<span class="rt ${cls}">${renderTile(c, opts.size || 34)}</span>`;
    }).join('') + '</div>';
  }
  function summary(r) {
    const jt = r.jokers ? ` (${r.jokers} of them ${r.jokers === 1 ? 'is a joker' : 'are jokers'})` : '';
    let s = `<b>${r.matched}</b> of your tiles fit${jt}. You need <b>${r.away}</b> more`;
    if (r.away) s += `: ${r.missJ} ${r.missJ === 1 ? 'spot' : 'spots'} a joker could fill, and ${r.missNat} ${r.missNat === 1 ? 'tile that has' : 'tiles that have'} to be real.`;
    else s += '. That\'s Mah Jongg!';
    return s;
  }
  const catName = id => CATS.find(c => c.id === id).name;

  /* ---------- the mock card: looks like the printed card ---------- */
  function buildIn(line, p, x, size) {
    x = x === undefined ? (line.vars ? line.vars[0] : 0) : x;
    return '<div class="build">' + flat(line).map(g => {
      const t = tileOf(g, x, p); let s = '';
      for (let i = 0; i < g.n; i++) s += tw(i >= 4 && t !== 'F' ? 'J' : t, size || 30);
      return `<span class="bgrp">${s}</span>`;
    }).join('') + '</div>';
  }
  const mcGroups = line => {
    const x = line.vars ? line.vars[0] : 0;
    return line.g.map(g => g.k === 'cluster'
      ? `<span class="mg">${g.parts.map(p => `<span class="${gCls(p)}">${gTxt(p, x)}</span>`).join('')}</span>`
      : `<span class="mg ${gCls(g)}">${gTxt(g, x)}</span>`).join('');
  };
  function mockCardHtml(opts) {
    opts = opts || {};
    const cats = opts.cats ? CATS.filter(c => opts.cats.includes(c.id)) : CATS;
    return `<div class="mockcard${opts.mini ? ' mini' : ''}">
      <div class="mc-head"><div><b>PRACTICE CARD</b><small>Mahjong School · for learning only</small></div><span class="mc-year">2026</span></div>
      <div class="mc-cols"><span>Hands</span><span>Values</span></div>
      <div class="mc-body">${cats.map(c => `<section class="mc-sec"><h4>${c.name.toUpperCase()}</h4>
        ${CARD.filter(l => l.cat === c.id).map(l => `<div class="mc-row${opts.tap ? ' tap' : ''}" data-id="${l.id}"${opts.tap ? ' role="button" tabindex="0"' : ''}>
          <div class="mc-hand">${mcGroups(l)}</div>
          <div class="mc-val"><span class="mc-xc">${l.xc}</span><span>${l.v}</span></div>
          <div class="mc-note">(${l.note})</div>
          ${opts.tap ? `<div class="mc-open" hidden>${sampleBuild(l)}<p>${l.vars ? 'Shown with the lowest numbers. ' : ''}One way to build it.${l.xc === 'C' ? ' Concealed: no calling.' : ''}</p></div>` : ''}
        </div>`).join('')}</section>`).join('')}</div>
      <div class="mc-foot">Colors = suits. D = dragon · F = flower · 0 = soap · N E W S = winds · X = exposed OK · C = concealed</div>
    </div>`;
  }
  function wireMock(root) {
    root.querySelectorAll('.mc-row.tap').forEach(r => {
      const go = () => { const o = r.querySelector('.mc-open'); o.hidden = !o.hidden; r.classList.toggle('open', !o.hidden); };
      r.onclick = go;
      r.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    });
  }

  /* Anatomy of one line: tap each part */
  const ANAT = [
    { lab: 'FF', cls: 'ln-n', h: 'A pair of flowers', tiles: 'F F',
      t: 'Two letters means two tiles. Flowers are printed in black because they have no suit. Any two flowers work, they don\'t have to match.' },
    { lab: '2468', cls: 'ln-a', h: 'Four singles, printed together', tiles: 'b2 b4 b6 b8',
      t: 'Numbers printed side by side with no space are still separate tiles: one 2, one 4, one 6 and one 8, all in the <b>same suit</b> because they\'re the same color. Singles can never be jokers.' },
    { lab: '2222', cls: 'ln-b', h: 'A kong of 2s in a second suit', tiles: 'c2 c2 c2 c2',
      t: 'Four of the same digit is a kong. It\'s a <b>different color</b>, so it has to be a <b>different suit</b> from the 2468. Groups of 3 or more can use jokers.' },
    { lab: '8888', cls: 'ln-c', h: 'A kong of 8s in the third suit', tiles: 'd8 d8 d8 d8',
      t: 'The third color means the third suit. Count every digit on the line: 2 + 4 + 4 + 4 = 14 tiles. Every line on the card adds up to 14.' },
    { lab: '(Any 3 suits)', cls: 'note', h: 'The note in parentheses', tiles: '',
      t: 'The note tells you how to read the colors. <b>The colors don\'t name the suit.</b> Blue doesn\'t mean Bams. They only tell you "same suit" or "different suit." You choose which suit goes where. Both of these are the same hand:' , alt: true },
    { lab: 'X', cls: 'xc', h: 'X or C', tiles: '',
      t: '<b>X</b> means exposed is OK: you can call a discard to finish a pung, kong or quint and put it face up. <b>C</b> means concealed: you can\'t call any tile except the one that wins the game.' },
    { lab: '30', cls: 'val', h: 'The value', tiles: '',
      t: 'What the hand pays. Win this on a discard and the discarder pays 60 (double), the other two pay 30 each. Draw it yourself and all three pay 60. Harder hands are worth more.' }
  ];
  function anatomyHtml() {
    return `<div class="anat">
      <div class="anat-line">${ANAT.map((a, i) => `<button class="ap ${a.cls}" data-i="${i}"><i>${i + 1}</i>${a.lab}</button>`).join('')}</div>
      <div class="anat-info" aria-live="polite"></div>
      <div class="anat-nav"><button class="btn ghost" data-d="-1">Back</button><span class="anat-count"></span><button class="btn primary" data-d="1">Next part</button></div>
    </div>`;
  }
  function wireAnatomy(root) {
    const box = root.querySelector('.anat'); if (!box) return;
    const e4 = CARD.find(l => l.id === 'e4');
    let cur = 0;
    const show = i => {
      cur = (i + ANAT.length) % ANAT.length;
      const a = ANAT[cur];
      box.querySelectorAll('.ap').forEach((b, j) => b.classList.toggle('on', j === cur));
      box.querySelector('.anat-info').innerHTML = `<b>${cur + 1}. ${a.h}</b><p>${a.t}</p>` +
        (a.tiles ? MS().expandTiles(`[[${a.tiles}|40]]`) : '') +
        (a.alt ? `<div class="altbuild"><small>Singles in Bams, kongs in Craks and Dots</small>${buildIn(e4, ['b', 'c', 'd'], 0, 24)}<small>Singles in Dots, kongs in Bams and Craks</small>${buildIn(e4, ['d', 'b', 'c'], 0, 24)}</div>` : '');
      box.querySelector('.anat-count').textContent = `${cur + 1} of ${ANAT.length}`;
    };
    box.querySelectorAll('.ap').forEach(b => { b.onclick = () => show(+b.dataset.i); });
    box.querySelectorAll('.anat-nav button').forEach(b => { b.onclick = () => show(cur + +b.dataset.d); });
    show(0);
  }

  /* Symbol key: what each mark on the card means, in tiles */
  const KEY = [
    ['<span class="ln-a">1</span>–<span class="ln-a">9</span>', 'A number tile. The digit is the number, the color is the suit.', 'b5'],
    ['<span class="ln-a">222</span>', 'Repeat the digit to show how many: 3 digits is a pung, 4 a kong, 5 a quint.', 'b2 b2 b2'],
    ['<span class="ln-a">22</span> <span class="ln-a">44</span>', 'Same color: same suit.', 'd2 d2 d4 d4'],
    ['<span class="ln-a">22</span> <span class="ln-b">44</span>', 'Different colors: different suits.', 'd2 d2 c4 c4'],
    ['<span class="ln-n">FF</span>', 'Flowers. Always black, no suit.', 'F F'],
    ['<span class="ln-n">NNNN</span>', 'Winds: N, E, W, S. Black, no suit.', 'N N N N'],
    ['<span class="ln-a">DDD</span>', 'Dragon. Its color tells you which suit it goes with: Green with Bams, Red with Craks, Soap with Dots.', 'b6 DG DG DG'],
    ['<span class="ln-n">0</span>', 'Zero is always the soap (white dragon), used in year hands like 2026.', 'DW'],
    ['<span class="ln-n">1111</span> <i>(any like no.)</i>', 'When the note says "any," the printed number is only an example. Pick any number that fits the pattern.', 'b7 b7 b7 b7'],
    ['<span class="mc-xc">X</span> / <span class="mc-xc">C</span>', 'X: you may call discards. C: concealed, no calling until the winning tile.', ''],
    ['<span class="ln-n">J</span>?', 'Jokers are never printed. You add them yourself in any group of 3 or more.', 'b3 b3 J']
  ];
  const keyHtml = () => `<div class="keygrid">${KEY.map(([s, t, tiles]) => `<div class="key"><div class="key-sym">${s}</div><div class="key-txt">${t}${tiles ? `<div class="key-tiles">${MS().expandTiles(`[[${tiles}|30]]`)}</div>` : ''}</div></div>`).join('')}</div>`;

  /* ---------- pages ---------- */
  const MS = () => window.MS;
  const GAME_INFO = [
    { id: 1, title: 'Count the match', desc: 'One hand from the card. How many of your 13 tiles fit it?' },
    { id: 2, title: 'Which hand is closest?', desc: 'Four hands from the card. Pick the one you\'re closest to.' },
    { id: 3, title: 'Pick your hands', desc: 'The whole card. Choose up to 3 hands worth chasing, like a real game.' },
    { id: 4, title: 'What would you pass?', desc: 'You know your targets. Pick 3 tiles that don\'t help, for the Charleston.' }
  ];

  function showHub() {
    const m = MS(); m.setBack('#/');
    const lv = level();
    const best = id => m.Store.data.drills[scoreKey(id, lv)];
    const stars = id => LEVEL_IDS.map(l => `<i class="dot lvl-${l}${(m.Store.data.drills[scoreKey(id, l)] || 0) >= 80 ? ' on' : ''}" title="${LEVELS[l].name}"></i>`).join('');
    m.app.innerHTML = `<article class="lesson">
      <p class="eyebrow">Start here · Step 2</p>
      <h1>Read the card and find your hand</h1>
      <p class="lead">This is the first real skill of the game. You get 13 tiles, you look at the card, and you decide which hand to go for. Learn how, then practice until it's quick.</p>
      <div class="list">
        <a class="card" href="#/cardlesson"><span class="num">📖</span><span class="card-body"><b>How the card works</b><small>What the card looks like, every symbol, how to read a line part by part, and how to count your tiles.</small></span>${m.Store.data.lessons.cardlesson ? '<span class="chip">Read</span>' : ''}</a>
        <a class="card" href="#/card"><span class="num">🀄</span><span class="card-body"><b>The practice card</b><small>See the whole card laid out like the real one. Tap any line to see it in tiles.</small></span></a>
      </div>
      <h2 class="stage">Practice games</h2>
      ${levelPicker(lv)}
      <p class="small lvl-desc">${LEVELS[lv].desc}</p>
      <div class="list">${GAME_INFO.map(g => `<a class="card${(best(g.id) || 0) >= 80 ? ' done' : ''}" href="#/find/${g.id}">
        <span class="num">${(best(g.id) || 0) >= 80 ? '✓' : g.id}</span>
        <span class="card-body"><b>${g.title}</b><small>${g.desc}</small><span class="lvdots">${stars(g.id)}</span></span>
        ${best(g.id) !== undefined ? `<span class="chip ${best(g.id) >= 80 ? 'ok' : 'warn'}">${best(g.id)}%</span>` : ''}</a>`).join('')}</div>
      <p class="small">The three dots on each game light up as you pass Easy, Medium and Hard.</p>
      <p class="note" style="margin-top:20px">The practice card is made up for learning. Its categories match the kinds you'll see on the real yearly card from the National Mah Jongg League, but the hands are different. Use the official card for real games.</p>
    </article>`;
    wireLevels(m.app, () => showHub());
  }

  function showCardPage() {
    const m = MS(); m.setBack('#/finder');
    m.app.innerHTML = `<article class="lesson"><p class="eyebrow">Practice card · not the official NMJL card</p><h1>The practice card</h1>
      <p class="lead">This is laid out like the real card you'll hold at the table. <b>Tap any line</b> to see it in tiles.</p>
      ${mockCardHtml({ tap: true })}
      <details class="sec keydet"><summary><b>What do the symbols mean?</b></summary>${keyHtml()}</details>
      <h2 class="stage">What each category is about</h2>
      <table class="t">${CATS.map(c => `<tr><td><b>${c.name}</b></td><td>${c.desc}</td></tr>`).join('')}</table>
      <p class="note" style="margin-top:16px">The real card from the National Mah Jongg League changes every year and has more lines. Use it for real games. This one is made up so you can learn how to read any card.</p>
    </article>`;
    wireMock(m.app);
  }

  function showLessonPage() {
    const m = MS(); m.setBack('#/finder');
    m.Store.data.lessons.cardlesson = true; m.Store.save();
    const exRack = sortRack(['b2', 'b2', 'b4', 'b4', 'b6', 'b8', 'b8', 'c3', 'd5', 'd7', 'N', 'DR', 'J']);
    const exRanked = rankAll(exRack);
    const exA = exRanked.find(r => r.line.id === 'e2') || exRanked[0];
    const exB = exRanked.find(r => r.line.id === 'o1');
    const L = id => CARD.find(l => l.id === id);
    m.app.innerHTML = `<article class="lesson">
      <p class="eyebrow">Start here · Step 2</p><h1>How the card works</h1>

      <section class="sec"><h3>One card, many hands</h3>
        <p>The card lists every winning hand for the year. Each line is one complete hand of exactly <b>14 tiles</b>. The lines are grouped into <b>categories</b>, and each category has a theme like even numbers or the year.</p>
        <p>You don't build "any" hand. You pick <b>one line</b> on the card and collect the exact tiles it shows.</p></section>

      <section class="sec"><h3>What the card looks like</h3>
        <p>Here's the top of the practice card. Every card is set up the same way: a <b>category name</b> in a band, the <b>hands</b> under it on the left, and the <b>values</b> on the right. The note in parentheses under each hand tells you how to read it.</p>
        ${mockCardHtml({ cats: ['2026', '2468'], mini: true, tap: true })}
        <p class="small">Tap a line to see it in tiles.</p>
        <a class="btn ghost wide" href="#/card">See the whole practice card</a></section>

      <section class="sec"><h3>Read a line, one part at a time</h3>
        <p>Tap each numbered part of this line, or use <b>Next part</b>.</p>
        ${anatomyHtml()}</section>

      <section class="sec"><h3>The symbols</h3>
        <p>Everything printed on a card is one of these:</p>
        ${keyHtml()}</section>

      <section class="sec"><h3>One line, many ways to build it</h3>
        <p>When a line says "any 1 suit," you get to choose. This is the same 2468 line three times:</p>
        <div class="altbuild"><small>In Bams</small>${buildIn(L('e2'), ['b'], 0, 26)}<small>In Craks</small>${buildIn(L('e2'), ['c'], 0, 26)}<small>In Dots</small>${buildIn(L('e2'), ['d'], 0, 26)}</div>
        <p>And when it says "any like numbers," the number is yours to pick too. This line is printed with 1s, but 5s or 9s work just as well:</p>
        ${lineHtml(L('l1'))}
        <div class="altbuild"><small>With 1s</small>${buildIn(L('l1'), ['b', 'c', 'd'], 1, 24)}<small>With 5s</small>${buildIn(L('l1'), ['b', 'c', 'd'], 5, 24)}<small>With 9s</small>${buildIn(L('l1'), ['b', 'c', 'd'], 9, 24)}</div>
        <p class="note">That's why one rack can fit a line in lots of ways. When you count, try the suit and number that match the most of your tiles.</p></section>

      <section class="sec"><h3>The categories</h3>
        <table class="t">${CATS.map(c => `<tr><td><b>${c.name}</b></td><td>${c.desc}</td></tr>`).join('')}</table>
        <p class="small">Real cards change their hands every year, but these kinds of categories show up again and again.</p></section>

      <section class="sec"><h3>Reading one line</h3>
        ${lineHtml(L('e2'))}
        <ul>
          <li><b>FF</b> is a pair of flowers.</li>
          <li><b>2222</b>, <b>44</b>, <b>66</b>, <b>8888</b> are all the same color, so they're all the <b>same suit</b>. The note says "any 1 suit," so you choose Bams, Craks or Dots.</li>
          <li>Count them: 2 + 4 + 2 + 2 + 4 = 14.</li>
          <li><b>X</b> means you can call discards. It pays <b>25</b>.</li>
        </ul>
        <p>Built in Dots, it looks like this:</p>${sampleBuild(L('e2'))}
        <p>And this one uses three colors, so three different suits:</p>${lineHtml(L('r2'))}${sampleBuild(L('r2'))}</section>

      <section class="sec"><h3>Counting your tiles against a line</h3>
        <p>Here's a rack of 13:</p>${rackHtml(exRack, { size: 30 })}
        <p>Check it against the 2468 line from above. Tiles you have are solid, jokers fill groups of 3 or more, and faded tiles are what's missing:</p>
        ${lineHtml(exA.line)}${buildHtml(exA)}<p class="small">${summary(exA)}</p>
        ${exB ? `<p>Now the same rack against an odd-number line:</p>${lineHtml(exB.line)}${buildHtml(exB)}<p class="small">${summary(exB)}</p>` : ''}
        <p>Same rack, very different answers. The even line is the one to chase. That's the whole skill: <b>count each likely line and go for the one you're closest to.</b></p>
        <p class="note">Always count jokers, but only where a group has 3 or more tiles. Pairs and singles need real tiles, so those are the hardest spots to fill.</p></section>

      <section class="sec"><h3>How to pick your hand</h3>
        <ol>
          <li><b>Sort your rack.</b> Suits together, then winds, dragons, flowers and jokers.</li>
          <li><b>Look for a theme.</b> Mostly even? Mostly odd? The same number in different suits? Numbers in a row? Lots of winds?</li>
          <li><b>Go to those categories</b> and count 3 or 4 lines. Skip categories that obviously don't fit.</li>
          <li><b>Keep 2 or 3 hands in mind</b> at the start, ideally ones that share tiles. A rack with 2s, 4s and 8s fits several 2468 lines at once.</li>
          <li><b>Pass tiles that fit none of them</b> during the Charleston.</li>
          <li><b>Narrow it down</b> to 1 or 2 hands after the Charleston, and commit by the time you expose anything.</li>
        </ol></section>

      <section class="sec"><h3>What to look for</h3>
        <table class="t">${CATS.map(c => `<tr><td>${c.look}</td><td><b>${c.name}</b></td></tr>`).join('')}</table></section>

      <section class="sec tip"><h3>When nothing goes anywhere</h3>
        <p>Some racks are just a mess. That's normal. When your best line still needs 8 or 9 tiles:</p>
        <ul>
          <li><b>Lean on joker-friendly hands.</b> Lines made of pungs and kongs let jokers fill the gaps. Avoid lines full of pairs and singles.</li>
          <li><b>Keep your jokers</b> and any natural pairs. They make almost every hand easier.</li>
          <li><b>Keep 3 or 4 options open</b> through the Charleston instead of forcing one. Let the passes show you which way to go.</li>
          <li><b>Think about defense.</b> If you're still far away late in the game, focus on not throwing someone else their winning tile.</li>
        </ul></section>

      <div class="practice"><div><b>Now practice it</b><small>Four quick games, from counting to picking your own hands.</small></div><a class="btn primary" href="#/find/1">Start game 1</a></div>
    </article>`;
    wireMock(m.app);
    wireAnatomy(m.app);
  }

  /* ---------- games ---------- */
  function shell(title, st) {
    const lv = level();
    return `<div class="drill-top"><b>${title} <span class="lvl-badge lvl-${lv}">${LEVELS[lv].name}</span></b><span>${st.round + 1} / ${st.total}</span></div><div class="meter small"><i style="width:${st.round / st.total * 100}%"></i></div>`;
  }
  function nextBtn(st) { return `<button class="btn primary wide" id="gnext">${st.round + 1 < st.total ? 'Next rack' : 'See results'}</button>`; }

  const ROUNDS = {
    1(app, st, finish) {
      const { rack, ranked } = dealLevel(level());
      const r = Math.random() < 0.4 ? ranked[0] : pick(ranked.slice(0, 8));
      const ans = r.matched;
      const opts = shuffle([ans].concat(shuffle([ans - 2, ans - 1, ans + 1, ans + 2].filter(v => v >= 0 && v <= 13)).slice(0, 3)));
      app.innerHTML = `<div class="drill">${shell('Count the match', st)}<div class="qcard">
        <p class="small center">Your 13 tiles</p>${rackHtml(rack)}
        <p class="small center">The hand</p>${lineHtml(r.line)}
        <p class="q center">How many of your tiles fit this hand?</p>
        <p class="small center">Count jokers where a group has 3 or more. Pick whichever suits fit you best.</p>
        <div class="opts grid">${opts.map(o => `<button class="opt" style="justify-content:center;font-size:20px">${o}</button>`).join('')}</div><div id="fb"></div></div></div>`;
      const btns = [...app.querySelectorAll('.opt')];
      btns.forEach(b => {
        b.onclick = () => {
          btns.forEach(x => { x.disabled = true; });
          const ok = +b.textContent === ans;
          btns.find(x => +x.textContent === ans).classList.add('right');
          if (!ok) b.classList.add('wrong');
          app.querySelector('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Correct' : 'The answer is ' + ans}</b>
            <p>${summary(r)}</p></div>${buildHtml(r)}<p class="small center">Your rack, with the tiles that fit lit up:</p>${rackHtml(rack, { used: usedMap([r]), size: 30 })}${tip()}${nextBtn(st)}`;
          app.querySelector('#gnext').onclick = () => finish(ok);
        };
      });
    },

    2(app, st, finish) {
      let d, others;
      for (let i = 0; i < 50; i++) {
        d = dealLevel(level());
        const top = d.ranked[0];
        const pool = shuffle(d.ranked.filter(r => r.matched <= top.matched - 2));
        others = [];
        pool.forEach(r => { if (others.length < 3 && r.line.cat !== top.line.cat && !others.some(o => o.line.cat === r.line.cat)) others.push(r); });
        if (others.length === 3) break;
      }
      const top = d.ranked[0];
      const opts = shuffle([top].concat(others));
      app.innerHTML = `<div class="drill">${shell('Which hand is closest?', st)}<div class="qcard">
        <p class="small center">Your 13 tiles</p>${rackHtml(d.rack)}
        <p class="q center">Which hand are you closest to?</p>
        <div class="opts">${opts.map((r, i) => `<button class="opt lineopt" data-i="${i}">${lineHtml(r.line, `<span class="pl-cat">${catName(r.line.cat)}</span>`)}</button>`).join('')}</div><div id="fb"></div></div></div>`;
      const btns = [...app.querySelectorAll('.lineopt')];
      btns.forEach(b => {
        b.onclick = () => {
          const pickR = opts[+b.dataset.i];
          const ok = pickR.matched === top.matched;
          btns.forEach((x, i) => {
            x.disabled = true;
            x.insertAdjacentHTML('beforeend', `<span class="fitchip">${opts[i].matched} fit · ${opts[i].away} away</span>`);
            if (opts[i] === top) x.classList.add('right');
          });
          if (!ok) b.classList.add('wrong');
          app.querySelector('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Right, that\'s the closest' : 'Not quite'}</b>
            <p>${catName(top.line.cat)} is the best of these. ${summary(top)}</p></div>${buildHtml(top)}
            ${rackHtml(d.rack, { used: usedMap([top]), size: 30 })}${tip()}${nextBtn(st)}`;
          app.querySelector('#gnext').onclick = () => finish(ok);
        };
      });
    },

    3(app, st, finish) {
      const d = dealLevel(level());
      const picks = [];
      app.innerHTML = `<div class="drill">${shell('Pick your hands', st)}
        <div class="sticky-rack">${rackHtml(d.rack, { size: 26 })}<p class="small center" id="pcount">Tap up to 3 hands you'd go for.</p></div>
        <div id="cardpick">${CATS.map(c => `<h3 class="catttl">${c.name}</h3>${CARD.filter(l => l.cat === c.id).map(l => `<button class="opt lineopt" data-id="${l.id}">${lineHtml(l)}</button>`).join('')}`).join('')}</div>
        <div class="checkbar"><button class="btn primary wide" id="check" disabled>Check my picks</button></div><div id="fb"></div></div>`;
      const btns = [...app.querySelectorAll('#cardpick .lineopt')];
      const check = app.querySelector('#check'), pc = app.querySelector('#pcount');
      btns.forEach(b => {
        b.onclick = () => {
          const id = b.dataset.id, i = picks.indexOf(id);
          if (i >= 0) picks.splice(i, 1); else if (picks.length < 3) picks.push(id); else return;
          b.classList.toggle('chosen', picks.includes(id));
          check.disabled = !picks.length;
          pc.textContent = picks.length ? `${picks.length} of 3 picked` : 'Tap up to 3 hands you\'d go for.';
        };
      });
      check.onclick = () => {
        const bestM = d.ranked[0].matched;
        const mine = picks.map(id => d.ranked.find(r => r.line.id === id));
        const myBest = Math.max(...mine.map(r => r.matched));
        const ok = myBest >= bestM - 1;
        btns.forEach(b => {
          b.disabled = true;
          const r = d.ranked.find(x => x.line.id === b.dataset.id);
          if (picks.includes(b.dataset.id) || d.ranked.indexOf(r) < 3) b.insertAdjacentHTML('beforeend', `<span class="fitchip">${r.matched} fit · ${r.away} away</span>`);
          if (d.ranked.indexOf(r) < 3) b.classList.add('top3');
        });
        check.parentNode.remove();
        const top = d.ranked.slice(0, 3);
        app.querySelector('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${myBest === bestM ? 'You found the best hand' : ok ? 'Good pick, within one tile of the best' : 'There was a closer hand'}</b>
          <p>Your best pick has ${myBest} tiles that fit. The best on the card has ${bestM}.</p></div>
          <h3 class="catttl">Top 3 for this rack</h3>
          ${top.map(r => `<div class="topcard${picks.includes(r.line.id) ? ' mine' : ''}">${lineHtml(r.line, `<span class="pl-cat">${catName(r.line.cat)}</span>`)}${buildHtml(r, 30)}<p class="small">${summary(r)}${picks.includes(r.line.id) ? ' <b>You picked this one.</b>' : ''}</p></div>`).join('')}
          ${tip()}${nextBtn(st)}`;
        app.querySelector('#gnext').onclick = () => finish(ok);
        app.querySelector('#fb').scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    },

    4(app, st, finish) {
      const unusedOf = x => {
        const u = Object.assign({}, usedMap(x.ranked.slice(0, 2))), idx = [];
        x.rack.forEach((c, k) => { if ((u[c] || 0) > 0) u[c]--; else if (c !== 'J') idx.push(k); });
        return idx;
      };
      const d = dealLevel(level(), x => unusedOf(x).length >= 3);
      const targets = d.ranked.slice(0, 2), used = usedMap(targets), unusedIdx = unusedOf(d);
      const sel = [];
      app.innerHTML = `<div class="drill">${shell('What would you pass?', st)}<div class="qcard">
        <p class="small center">You've decided to aim for one of these two hands:</p>
        ${targets.map(r => lineHtml(r.line, `<span class="pl-cat">${catName(r.line.cat)}</span>`)).join('')}
        <p class="q center">Pick 3 tiles to pass in the Charleston.</p>
        <p class="small center">Pass tiles that don't help either hand.</p>
        <div id="rk">${rackHtml(d.rack, { select: true, marked: sel })}</div>
        <div id="fb"><button class="btn primary wide" id="pass" disabled>Pass these 3</button></div></div></div>`;
      const wire = () => {
        app.querySelectorAll('#rk .rt').forEach(b => {
          b.onclick = () => {
            const i = +b.dataset.i;
            if (d.rack[i] === 'J') { app.querySelector('#pass').textContent = 'Jokers can never be passed'; return; }
            const k = sel.indexOf(i);
            if (k >= 0) sel.splice(k, 1); else if (sel.length < 3) sel.push(i);
            app.querySelector('#rk').innerHTML = rackHtml(d.rack, { select: true, marked: sel });
            const p = app.querySelector('#pass');
            p.disabled = sel.length !== 3; p.textContent = sel.length === 3 ? 'Pass these 3' : `Pick ${3 - sel.length} more`;
            wire();
          };
        });
      };
      wire();
      app.querySelector('#pass').onclick = () => {
        const bad = sel.filter(i => !unusedIdx.includes(i));
        const ok = bad.length === 0;
        app.querySelector('#rk').innerHTML = rackHtml(d.rack, { used, marked: sel });
        app.querySelector('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Good pass' : bad.length === 1 ? 'One of those tiles was useful' : bad.length + ' of those tiles were useful'}</b>
          <p>Lit-up tiles fit at least one of your two hands. Faded ones fit neither, so those are the safe ones to pass.${bad.length ? ' The tiles you picked that are lit up should stay.' : ''}</p></div>
          ${targets.map(r => `<div class="topcard">${lineHtml(r.line)}${buildHtml(r, 30)}</div>`).join('')}${tip()}${nextBtn(st)}`;
        app.querySelector('#gnext').onclick = () => finish(ok);
      };
    }
  };

  function playGame(id) {
    id = +id;
    const m = MS();
    if (!ROUNDS[id]) return showHub();
    m.setBack('#/finder');
    const info = GAME_INFO[id - 1];
    const st = { round: 0, total: id === 3 ? 4 : 6, score: 0 };
    const run = () => {
      window.scrollTo(0, 0);
      if (st.round >= st.total) return result();
      ROUNDS[id](m.app, st, ok => { if (ok) st.score++; st.round++; run(); });
    };
    const result = () => {
      const pct = Math.round(st.score / st.total * 100);
      const lv = level(), key = scoreKey(id, lv), prev = m.Store.data.drills[key];
      if (prev === undefined || pct > prev) { m.Store.data.drills[key] = pct; m.Store.save(); }
      const ok = pct >= 80, nextG = GAME_INFO[id];
      const harder = LEVEL_IDS[LEVEL_IDS.indexOf(lv) + 1];
      m.app.innerHTML = `<div class="result ${ok ? 'ok' : 'no'}"><p class="eyebrow">${info.title} · ${LEVELS[lv].name}</p><div class="big">${pct}%</div><p>${st.score} of ${st.total} right</p>
        <p class="msg">${ok ? 'Nice. You\'re reading the card like a player.' : 'Keep at it. This gets fast with practice, and every rack is new.'}</p>
        <div class="stack">
          ${ok && harder ? `<button class="btn primary wide" id="harder">Try ${LEVELS[harder].name}: ${LEVELS[harder].short}</button>` : ''}
          ${ok && nextG ? `<a class="btn ${harder ? 'ghost' : 'primary'} wide" href="#/find/${nextG.id}">Next game: ${nextG.title}</a>` : ''}
          ${ok && !nextG ? `<a class="btn primary wide" href="#/lesson/tiles">On to Lesson 1</a>` : ''}
          <button class="btn ${ok ? 'ghost' : 'primary'} wide" id="again">Play again with new racks</button>
          <a class="btn ghost wide" href="#/finder">Back to Step 2</a></div></div>`;
      m.app.querySelector('#again').onclick = () => playGame(id);
      const h = m.app.querySelector('#harder');
      if (h) h.onclick = () => { m.Store.data.level = harder; m.Store.save(); playGame(id); };
    };
    run();
  }

  window.CardSchool = {
    CATS, CARD, rankAll, bestFor, countRack, evalInst, usedMap, deal, sortRack, lineHtml, buildHtml, rackHtml,
    showHub, showCardPage, showLessonPage, playGame,
    LEVELS, dealLevel,
    done: store => [1, 2].every(id => ['find' + id].concat(LEVEL_IDS.map(l => scoreKey(id, l))).some(k => (store.data.drills[k] || 0) >= 80))
  };
})();
