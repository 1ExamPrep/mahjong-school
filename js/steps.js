/* Step 3 (dice, walls and the deal) and Step 4 (the Charleston).
   Seats on screen: East at the bottom (that's you), South on the right,
   West at the top, North on the left. Turns go East, South, West, North
   (to the right). Walls are used the other way, clockwise. */
(function () {
  const MS = () => window.MS;
  const steps = () => { const d = MS().Store.data; d.steps = d.steps || {}; return d.steps; };
  const saveStep = k => { steps()[k] = true; MS().Store.save(); };
  const SEAT_ORDER = ['East', 'South', 'West', 'North'];
  const ri = n => Math.floor(Math.random() * n);

  /* ================= dice ================= */
  const PIP = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const dieHtml = (v, cls) => `<span class="die ${cls || ''}" data-v="${v}">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<i class="${PIP[v].includes(i) ? 'p' : ''}"></i>`).join('')}</span>`;
  function setDie(el, v) { el.dataset.v = v; [...el.children].forEach((c, i) => { c.className = PIP[v].includes(i) ? 'p' : ''; }); }
  function roll(els, done) {
    const finals = els.map(() => 1 + ri(6));
    els.forEach(e => e.classList.add('rolling'));
    let t = 0;
    const iv = setInterval(() => {
      els.forEach(e => setDie(e, 1 + ri(6)));
      if ((t += 70) >= 770) {
        clearInterval(iv);
        els.forEach((e, i) => { setDie(e, finals[i]); e.classList.remove('rolling'); });
        done(finals);
      }
    }, 70);
  }

  /* ================= table geometry ================= */
  const CELL = 15, PAD = 30, GRID = 20, SIZE = GRID * CELL + PAD * 2;
  // stacks keyed by wall: E bottom (x 0..18, y 19), N left (x 0, y 0..18), W top (x 1..19, y 0), S right (x 19, y 1..19)
  function drawOrder(n) {
    const o = [];
    for (let x = 18 - n; x >= 0; x--) o.push({ w: 'E', x, y: 19 });
    for (let y = 18; y >= 0; y--) o.push({ w: 'N', x: 0, y });
    for (let x = 1; x <= 19; x++) o.push({ w: 'W', x, y: 0 });
    for (let y = 1; y <= 19; y++) o.push({ w: 'S', x: 19, y });
    for (let x = 18; x > 18 - n; x--) o.push({ w: 'E', x, y: 19, saved: true });
    return o;
  }
  function buildDeal(order) {
    const g = [];
    let k = 0;
    for (let r = 0; r < 3; r++) SEAT_ORDER.forEach(s => { g.push({ seat: s, take: [[k, 2], [k + 1, 2]], n: 4, what: `${s} takes 2 stacks (4 tiles).` }); k += 2; });
    g.push({ seat: 'East', take: [[k, 1], [k + 2, 1]], n: 2, what: 'East takes the top tile of the 1st and 3rd stacks. That\'s 14.' });
    g.push({ seat: 'South', take: [[k, 1]], n: 1, what: 'South takes the bottom tile of the 1st stack.' });
    g.push({ seat: 'West', take: [[k + 1, 1]], n: 1, what: 'West takes the top tile of the 2nd stack.' });
    g.push({ seat: 'North', take: [[k + 1, 1]], n: 1, what: 'North takes the bottom tile of the 2nd stack.' });
    return g;
  }
  function tableSvg(st) {
    const cnt = st.count, order = st.order || [];
    const idxOf = {}; order.forEach((s, i) => { idxOf[s.x + ',' + s.y] = i; });
    let r = '';
    const cell = (x, y) => {
      const i = idxOf[x + ',' + y];
      const c = i === undefined ? 2 : cnt[i];
      const saved = i !== undefined && order[i].saved;
      const hl = st.hl && st.hl.includes(i);
      const counted = st.counted && st.counted.includes(x);
      const px = PAD + x * CELL, py = PAD + y * CELL;
      const fill = c === 2 ? 'var(--wall2)' : c === 1 ? 'var(--wall1)' : 'transparent';
      r += `<rect x="${px + 1}" y="${py + 1}" width="${CELL - 2}" height="${CELL - 2}" rx="2.5" fill="${fill}" stroke="${hl ? '#f5a524' : saved && st.showSaved ? '#d4a017' : c ? 'rgba(0,0,0,.25)' : 'var(--line)'}" stroke-width="${hl ? 2.6 : saved && st.showSaved ? 1.6 : 1}" ${c ? '' : 'stroke-dasharray="2 2"'}/>`;
      if (counted && y === 19) r += `<text x="${px + CELL / 2}" y="${py + CELL / 2 + .5}" font-size="8.5" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">${18 - x + 1}</text>`;
    };
    for (let x = 0; x <= 18; x++) cell(x, 19);
    for (let y = 0; y <= 18; y++) cell(0, y);
    for (let x = 1; x <= 19; x++) cell(x, 0);
    for (let y = 1; y <= 19; y++) cell(19, y);
    if (st.breakAt !== undefined) {
      const bx = PAD + (18 - st.breakAt + 1) * CELL;
      r += `<line x1="${bx}" y1="${PAD + 19 * CELL - 6}" x2="${bx}" y2="${PAD + 20 * CELL + 6}" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/>`;
    }
    const lab = (t, x, y, on) => `<text x="${x}" y="${y}" font-size="13" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="${on ? 'var(--felt)' : 'var(--muted)'}">${t}</text>`;
    const on = st.active;
    r += lab(`East${st.hands ? ' · ' + st.hands.East : ''}${st.you ? ' (you)' : ''}`, SIZE / 2, SIZE - 11, on === 'East');
    r += lab(`West${st.hands ? ' · ' + st.hands.West : ''}`, SIZE / 2, 12, on === 'West');
    r += `<g transform="rotate(-90 ${SIZE - 12} ${SIZE / 2})">${lab(`South${st.hands ? ' · ' + st.hands.South : ''}`, SIZE - 12, SIZE / 2, on === 'South')}</g>`;
    r += `<g transform="rotate(90 12 ${SIZE / 2})">${lab(`North${st.hands ? ' · ' + st.hands.North : ''}`, 12, SIZE / 2, on === 'North')}</g>`;
    r += `<rect x="${PAD + CELL + 6}" y="${PAD + CELL + 6}" width="${(GRID - 2) * CELL - 12}" height="${(GRID - 2) * CELL - 12}" rx="10" fill="var(--feltbg)"/>`;
    if (st.center) r += `<text x="${SIZE / 2}" y="${SIZE / 2}" font-size="13" fill="#fff" font-weight="700" text-anchor="middle" dominant-baseline="central">${st.center}</text>`;
    return `<svg class="tablesvg" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="Mahjong table with four walls">${r}</svg>`;
  }

  /* ---------- walls go left, turns go right ---------- */
  const WALL_NAME = { E: 'East\'s wall', N: 'North\'s wall', W: 'West\'s wall', S: 'South\'s wall' };
  function dirSvg(kind) {
    const seats = { East: [100, 188], South: [210, 100], West: [100, 12], North: [-10, 100] };
    const lab = (t, x, y, c, sz) => `<text x="${x}" y="${y}" font-size="${sz || 12}" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="${c}">${t}</text>`;
    let g = `<rect x="44" y="44" width="112" height="112" rx="12" fill="var(--feltbg)"/>`;
    Object.entries(seats).forEach(([n, [x, y]]) => { g += lab(n === 'East' ? 'East (you)' : n, x, y, 'var(--ink)', 11); });
    if (kind === 'walls') {
      const bars = [['E', 52, 160, 96, 9, '1'], ['N', 31, 52, 9, 96, '2'], ['W', 52, 31, 96, 9, '3'], ['S', 160, 52, 9, 96, '4']];
      bars.forEach(([w, x, y, wd, h, n]) => {
        g += `<rect x="${x}" y="${y}" width="${wd}" height="${h}" rx="3" fill="var(--wall2)"/>`;
        const cx = x + wd / 2, cy = y + h / 2;
        g += `<circle cx="${cx}" cy="${cy}" r="9" fill="#d4a017"/>` + lab(n, cx, cy + .5, '#fff', 11);
      });
      g += `<path d="M100 132 A32 32 0 1 1 132 100" fill="none" stroke="#f5c451" stroke-width="5" stroke-linecap="round" marker-end="url(#dw)"/>`;
      g += lab('walls', 100, 100, '#fff', 12);
    } else {
      [['East', 100, 168, '1'], ['South', 168, 100, '2'], ['West', 100, 32, '3'], ['North', 32, 100, '4']].forEach(([n, x, y, k]) => {
        g += `<circle cx="${x}" cy="${y}" r="10" fill="var(--felt)" stroke="#fff" stroke-width="1.5"/>` + lab(k, x, y + .5, '#fff', 11);
      });
      g += `<path d="M100 132 A32 32 0 1 0 68 100" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" marker-end="url(#dt)"/>`;
      g += lab('turns', 100, 100, '#fff', 12);
    }
    return `<svg class="dirsvg" viewBox="-26 0 252 200" role="img" aria-label="${kind === 'walls' ? 'Walls are used to the left, clockwise' : 'Turns go to the right, counterclockwise'}"><defs>
      <marker id="dw" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><path d="M0 0 L4 2 L0 4 Z" fill="#f5c451"/></marker>
      <marker id="dt" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><path d="M0 0 L4 2 L0 4 Z" fill="#fff"/></marker></defs>${g}</svg>`;
  }

  /* ================= STEP 3 hub ================= */
  function step3Done() { const s = steps(); return !!(s.s3break && s.s3deal); }
  function showStep3() {
    const m = MS(); m.setBack('#/');
    const s = steps();
    m.app.innerHTML = `<article class="lesson">
      <p class="eyebrow">Start here · Step 3</p><h1>Dice, walls and the deal</h1>
      <p class="lead">Before anyone plays, the table picks East, builds four walls, breaks one with the dice, and deals. Here's how, with a dice roller you can use at a real table.</p>

      <section class="sec"><h3>1. Pick who is East</h3>
        <p>Each player rolls both dice. The <b>highest total is East</b>. If there's a tie for highest, just those players roll again.</p>
        <p>East is the dealer for that game. After each game, the East seat moves to the player on the right.</p></section>

      <section class="sec"><h3>2. Build the walls</h3>
        <p>Mix the tiles face down. Each player builds a wall in front of their own rack, <b>19 stacks long and two tiles high</b>. That's 38 tiles per wall and 152 in all. Push the four walls together into a square.</p>
        <div class="minitable">${tableSvg({ count: Array(76).fill(2), order: drawOrder(0), you: true })}</div></section>

      <section class="sec"><h3>3. Break the wall with the dice</h3>
        <ol>
          <li>East rolls both dice and <b>adds them up</b>.</li>
          <li>East counts that many stacks starting from the <b>right end of East's own wall</b>.</li>
          <li>East splits the wall right after the last stack counted.</li>
        </ol>
        <p>Say East rolls a 4 and a 3. That's 7, so East counts 7 stacks in from the right and splits there:</p>
        <div class="minitable">${tableSvg({ count: Array(76).fill(2), order: drawOrder(7), breakAt: 7, counted: [18, 17, 16, 15, 14, 13, 12], showSaved: true, you: true })}</div>
        <p class="small">The 7 counted stacks (gold outline) stay where they are. They're the very last part of the wall to be used, and they're still live.</p></section>

      <section class="sec"><h3>4. Deal the tiles</h3>
        <ol>
          <li>Start just <b>left of the break</b>. East takes 2 stacks (4 tiles).</li>
          <li>Then South, West and North each take 2 stacks, going to the right around the table.</li>
          <li>Go around <b>three times</b>. Everyone now has 12.</li>
          <li>East takes the <b>top tile of the 1st and 3rd stacks</b>, ending with 14.</li>
          <li>South takes the bottom of the 1st, West the top of the 2nd, North the bottom of the 2nd. They each have 13.</li>
        </ol>
        <p>You'll run out of East's wall partway through the deal. The next section shows where to go.</p>
        <table class="t"><tr><th>Count it</th><th></th></tr>
          <tr><td>Tiles East holds</td><td><b>14</b></td></tr><tr><td>Tiles each other player holds</td><td><b>13</b></td></tr>
          <tr><td>Tiles dealt in all</td><td><b>53</b></td></tr><tr><td>Tiles left in the walls</td><td><b>99</b></td></tr></table></section>

      <section class="sec"><h3>5. Which wall comes next</h3>
        <p>You always start on <b>East's wall</b>, just left of the break. When it runs out, move to the <b>next wall on the left</b>:</p>
        <ol class="wallorder">
          <li><b>East's wall</b> (start just left of the break)</li>
          <li><b>North's wall</b></li>
          <li><b>West's wall</b></li>
          <li><b>South's wall</b></li>
          <li>Back to <b>East's wall</b>: the stacks you counted with the dice. They're the very last tiles.</li>
        </ol>
        <p>The wall moves <b>to the left</b> (clockwise), but the dealing and the turns go <b>to the right</b> (counterclockwise). They go in opposite directions.</p>
        <div class="dirpair">
          <figure>${dirSvg('walls')}<figcaption><b>Walls go left</b><br>East → North → West → South</figcaption></figure>
          <figure>${dirSvg('turns')}<figcaption><b>Dealing and turns go right</b><br>East → South → West → North</figcaption></figure>
        </div>
        <p class="tour-note"><b>Easy way to remember:</b> the turn is handed to the player on your <b>right</b>, while the wall gets eaten up toward your <b>left</b>. Before the first turn, point at the end of the wall where the next tile will come from, so everyone agrees.</p></section>

      <h2 class="stage">Try it</h2>
      <div class="list">
        <a class="card" href="#/step3/dice"><span class="num">🎲</span><span class="card-body"><b>Dice roller</b><small>Roll to pick East, or roll to break the wall. Use it at a real table too.</small></span></a>
        <a class="card${s.s3break ? ' done' : ''}" href="#/step3/break"><span class="num">${s.s3break ? '✓' : 'A'}</span><span class="card-body"><b>Practice: break the wall</b><small>Roll the dice, then tap the stack where the wall splits.</small></span>${s.s3break ? '<span class="chip ok">Done</span>' : ''}</a>
        <a class="card${s.s3deal ? ' done' : ''}" href="#/step3/deal"><span class="num">${s.s3deal ? '✓' : 'B'}</span><span class="card-body"><b>Practice: the deal</b><small>Watch it step by step, then deal it yourself by picking who takes tiles next.</small></span>${s.s3deal ? '<span class="chip ok">Done</span>' : ''}</a>
        <a class="card" href="#/drill/setup"><span class="num">?</span><span class="card-body"><b>Quiz: setup check</b><small>Questions on walls, dice and counting.</small></span></a>
      </div>
      <p class="note" style="margin-top:16px">Some groups use their own house rules for picking East or breaking the wall. Agree on them before you start. This app teaches the standard way.</p>
    </article>`;
  }

  /* ---------- dice roller ---------- */
  function showDiceTool() {
    const m = MS(); m.setBack('#/step3');
    m.app.innerHTML = `<article class="lesson"><p class="eyebrow">Step 3 · Dice roller</p><h1>Dice roller</h1>
      <div class="seg" role="tablist"><button class="on" data-mode="break">Break the wall</button><button data-mode="east">Pick East</button></div>
      <div id="dz"></div></article>`;
    const dz = m.app.querySelector('#dz');
    const modes = {
      break() {
        dz.innerHTML = `<div class="dicebox"><div class="dice">${dieHtml(3)}${dieHtml(4)}</div>
          <button class="btn primary wide" id="rollb">Roll the dice</button><div id="rres" class="tapinfo">East rolls both dice to break the wall.</div></div>`;
        dz.querySelector('#rollb').onclick = () => {
          const b = dz.querySelector('#rollb'); b.disabled = true;
          roll([...dz.querySelectorAll('.die')], ([a, c]) => {
            b.disabled = false; b.textContent = 'Roll again';
            dz.querySelector('#rres').innerHTML = `<div class="bigsum">${a} + ${c} = <b>${a + c}</b></div>Count <b>${a + c} stacks</b> in from the <b>right end of East's wall</b>, then split it there.`;
          });
        };
      },
      east() {
        dz.innerHTML = `<p class="small">Each seat rolls both dice. Highest total is East. Ties for highest roll again.</p>
          <div class="eastgrid">${['Player 1', 'Player 2', 'Player 3', 'Player 4'].map((p, i) => `<div class="eastseat" data-i="${i}"><b>${p}</b><div class="dice sm">${dieHtml(1, 'sm')}${dieHtml(1, 'sm')}</div><span class="tot">&nbsp;</span></div>`).join('')}</div>
          <button class="btn primary wide" id="rolle">Roll for everyone</button><div id="eres" class="tapinfo">Tap to roll.</div>`;
        const seats = [...dz.querySelectorAll('.eastseat')];
        let inPlay = [0, 1, 2, 3];
        const go = () => {
          const b = dz.querySelector('#rolle'); b.disabled = true;
          seats.forEach((s, i) => s.classList.toggle('out', !inPlay.includes(i)));
          const totals = {}; let left = inPlay.length;
          inPlay.forEach(i => roll([...seats[i].querySelectorAll('.die')], ([a, c]) => {
            totals[i] = a + c; seats[i].querySelector('.tot').textContent = a + c;
            if (--left) return;
            const hi = Math.max(...Object.values(totals));
            const top = inPlay.filter(k => totals[k] === hi);
            b.disabled = false;
            if (top.length === 1) {
              seats.forEach((s, k) => s.classList.toggle('win', k === top[0]));
              dz.querySelector('#eres').innerHTML = `<b>Player ${top[0] + 1} is East</b> with ${hi}. They sit at East, and the seats go South, West, North to their right.`;
              b.textContent = 'Start over'; inPlay = [0, 1, 2, 3];
              b.onclick = () => { seats.forEach(s => { s.classList.remove('win', 'out'); s.querySelector('.tot').innerHTML = '&nbsp;'; }); b.textContent = 'Roll for everyone'; b.onclick = go; go(); };
            } else {
              dz.querySelector('#eres').innerHTML = `Tie at ${hi} between ${top.map(k => 'Player ' + (k + 1)).join(' and ')}. Only they roll again.`;
              inPlay = top; b.textContent = 'Roll the tie-breaker';
            }
          }));
        };
        dz.querySelector('#rolle').onclick = go;
      }
    };
    m.app.querySelectorAll('.seg button').forEach(b => {
      b.onclick = () => { m.app.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b)); modes[b.dataset.mode](); };
    });
    modes.break();
  }

  /* ---------- practice: break the wall ---------- */
  function showBreakPractice() {
    const m = MS(); m.setBack('#/step3');
    const st = { round: 0, total: 5, score: 0 };
    const next = () => {
      if (st.round >= st.total) return finish();
      m.app.innerHTML = `<div class="drill"><div class="drill-top"><b>Break the wall</b><span>${st.round + 1} / ${st.total}</span></div>
        <div class="meter small"><i style="width:${st.round / st.total * 100}%"></i></div>
        <div class="qcard"><div class="dicebox"><div class="dice">${dieHtml(1)}${dieHtml(1)}</div>
        <button class="btn primary wide" id="roll">Roll the dice</button></div>
        <p class="q center" id="ask">East rolls first.</p>
        <p class="small center">This is East's wall. You're East, sitting below it.</p>
        <div class="ewall" id="ew">${Array.from({ length: 19 }, (_, i) => `<button class="stk" data-x="${i}" disabled></button>`).join('')}</div>
        <div class="ewall-ends"><span>left end</span><span>right end</span></div>
        <div id="fb"></div></div></div>`;
      m.app.querySelector('#roll').onclick = e => {
        e.target.disabled = true;
        roll([...m.app.querySelectorAll('.die')], ([a, c]) => {
          const n = a + c;
          e.target.textContent = `${a} + ${c} = ${n}`;
          m.app.querySelector('#ask').innerHTML = `You rolled <b>${n}</b>. Tap the <b>last stack you count</b>.`;
          const stks = [...m.app.querySelectorAll('.stk')];
          stks.forEach(b => {
            b.disabled = false;
            b.onclick = () => {
              const x = +b.dataset.x, want = 19 - n;
              const ok = x === want;
              stks.forEach(s => { s.disabled = true; });
              let k = 0;
              for (let i = 18; i >= want; i--) { const s = stks[i]; s.classList.add('cnt'); s.textContent = 18 - i + 1; s.style.animationDelay = (k++ * 60) + 'ms'; }
              stks[want].classList.add('last'); if (!ok) b.classList.add('wrongpick');
              m.app.querySelector('#ew').insertAdjacentHTML('beforeend', `<i class="brk" style="left:calc(${want} * (100% / 19))"></i>`);
              if (ok) st.score++;
              const off = x - want;
              m.app.querySelector('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Right!' : 'Not quite'}</b><p>${ok ? '' : off > 0 ? `You counted ${off} too few. ` : `You counted ${-off} too many. `}Start at the right end and count ${n} stacks: 1, 2, 3 ... ${n}. Split just to the left of stack ${n}. The ${n} counted stacks are used last.</p></div><button class="btn primary wide" id="nx">${st.round + 1 < st.total ? 'Next roll' : 'See results'}</button>`;
              m.app.querySelector('#nx').onclick = () => { st.round++; next(); };
            };
          });
        });
      };
    };
    const finish = () => {
      const ok = st.score >= 4;
      if (ok) saveStep('s3break');
      m.app.innerHTML = `<div class="result ${ok ? 'ok' : 'no'}"><div class="big">${st.score}/${st.total}</div>
        <p class="msg">${ok ? 'You can break the wall like a pro.' : 'Get 4 of 5 to pass. Remember: count from the right end.'}</p>
        <div class="stack">${ok ? '<a class="btn primary wide" href="#/step3/deal">Next: practice the deal</a>' : ''}
        <button class="btn ${ok ? 'ghost' : 'primary'} wide" id="ag">Try again</button><a class="btn ghost wide" href="#/step3">Back to Step 3</a></div></div>`;
      m.app.querySelector('#ag').onclick = showBreakPractice;
    };
    next();
  }

  /* ---------- practice: the deal ---------- */
  function showDealPractice() {
    const m = MS(); m.setBack('#/step3');
    const st = { mode: 'watch', n: 0, order: [], count: [], grabs: [], g: 0, hands: null, hl: [], mistakes: 0 };
    m.app.innerHTML = `<article class="lesson"><p class="eyebrow">Step 3 · The deal</p><h1>Practice the deal</h1>
      <div class="seg"><button class="on" data-mode="watch">Watch it</button><button data-mode="you">You deal</button></div>
      <p class="small" id="modehelp"></p>
      <div class="dealtop"><div class="dice">${dieHtml(1, 'sm')}${dieHtml(1, 'sm')}</div><button class="btn primary" id="droll">Roll to break the wall</button></div>
      <div class="tablewrap" id="tw"></div>
      <div id="dctl"></div></article>`;
    const tw = m.app.querySelector('#tw'), ctl = m.app.querySelector('#dctl'), help = m.app.querySelector('#modehelp');
    const draw = (extra) => { tw.innerHTML = tableSvg(Object.assign({ count: st.count, order: st.order, hands: st.hands, hl: st.hl, breakAt: st.n || undefined, showSaved: !!st.n, you: true }, extra || {})); };
    const reset = () => {
      st.n = 0; st.order = drawOrder(0); st.count = Array(76).fill(2); st.grabs = []; st.g = 0; st.hl = []; st.hands = { East: 0, South: 0, West: 0, North: 0 }; st.mistakes = 0; st.walls = ['E']; st.askedWall = -1;
      draw(); ctl.innerHTML = '';
      help.textContent = st.mode === 'watch' ? 'Roll, then step through the deal one grab at a time. Watch for when a wall runs out.' : 'Roll, then for each grab tap the player who takes tiles next. When a wall runs out, you pick the next wall.';
      const rb = m.app.querySelector('#droll'); rb.disabled = false; rb.textContent = 'Roll to break the wall';
    };
    const applyGrab = gr => { gr.take.forEach(([i, k]) => { st.count[i] -= k; }); st.hands[gr.seat] += gr.n; st.hl = gr.take.map(t => t[0]); };
    const newWall = gr => { const w = gr.take.map(([i]) => st.order[i].w).find(x => !st.walls.includes(x)); return w || null; };
    const wallNote = (from, to) => `${WALL_NAME[from]} has run out, so the deal moves <b>left</b> to <b>${WALL_NAME[to]}</b>.`;
    const finished = () => {
      st.hl = []; draw({ center: 'Deal done' });
      const youMode = st.mode === 'you';
      if (youMode && st.mistakes <= 2) saveStep('s3deal');
      if (!youMode) saveStep('s3dealwatch');
      ctl.innerHTML = `<div class="fb ok"><b>Deal complete</b><p>East has 14, everyone else has 13. That's 53 tiles dealt and 99 left in the walls. The deal used ${st.walls.map(w => WALL_NAME[w]).join(', then ')}, moving left each time, while the tiles went to the players on the right. East discards first.${youMode ? ` You made ${st.mistakes} ${st.mistakes === 1 ? 'mistake' : 'mistakes'}.` : ''}</p></div>
        ${youMode && st.mistakes > 2 ? '<p class="small">Deal with 2 or fewer mistakes to check this off.</p>' : ''}
        <div class="stack">${!youMode ? '<button class="btn primary wide" id="tryyou">Now you deal</button>' : ''}<button class="btn ${youMode ? 'primary' : 'ghost'} wide" id="again">Deal again</button><a class="btn ghost wide" href="#/step3">Back to Step 3</a></div>`;
      const ty = ctl.querySelector('#tryyou');
      if (ty) ty.onclick = () => { m.app.querySelector('[data-mode="you"]').click(); };
      ctl.querySelector('#again').onclick = reset;
    };
    const stepWatch = () => {
      if (st.g >= st.grabs.length) return finished();
      const gr = st.grabs[st.g++];
      const nw = newWall(gr), prev = st.walls[st.walls.length - 1];
      if (nw) st.walls.push(nw);
      applyGrab(gr); draw({ active: gr.seat });
      ctl.innerHTML = `${nw ? `<div class="wallnote">${wallNote(prev, nw)}</div>` : ''}<div class="tapinfo"><b>${gr.what}</b><br><small>Grab ${st.g} of ${st.grabs.length} · taking from ${WALL_NAME[st.order[gr.take[gr.take.length - 1][0]].w]}</small></div>
        <div class="stack"><button class="btn primary wide" id="nx">${st.g < st.grabs.length ? 'Next grab' : 'Finish'}</button><button class="btn ghost wide" id="auto">Play the rest</button></div>`;
      ctl.querySelector('#nx').onclick = stepWatch;
      ctl.querySelector('#auto').onclick = () => {
        ctl.innerHTML = '<div class="tapinfo" id="autonote">Dealing...</div>';
        const t = setInterval(() => {
          if (st.g >= st.grabs.length) { clearInterval(t); finished(); return; }
          const g = st.grabs[st.g++], nw = newWall(g), prev = st.walls[st.walls.length - 1];
          if (nw) { st.walls.push(nw); ctl.querySelector('#autonote').innerHTML = wallNote(prev, nw); }
          applyGrab(g); draw({ active: g.seat });
        }, 420);
      };
    };
    const stepYou = () => {
      if (st.g >= st.grabs.length) return finished();
      const gr = st.grabs[st.g];
      const nw = newWall(gr);
      if (nw && st.askedWall !== st.g) {
        const prev = st.walls[st.walls.length - 1];
        const opts = ['N', 'W', 'S', 'E'].filter(w => w !== prev);
        ctl.innerHTML = `<div class="wallnote">${WALL_NAME[prev]} is running out.</div><p class="q center">Which wall do the next tiles come from?</p>
          <div class="seatbtns three">${opts.map(w => `<button class="opt" data-w="${w}">${WALL_NAME[w]}</button>`).join('')}</div><div id="yfb" class="tapinfo">Walls are used in one direction all the way around.</div>`;
        ctl.querySelectorAll('[data-w]').forEach(b => {
          b.onclick = () => {
            if (b.dataset.w !== nw) {
              st.mistakes++; b.classList.add('wrong'); b.disabled = true;
              ctl.querySelector('#yfb').innerHTML = `Not that one. Walls go to the <b>left</b> (clockwise): East's, then North's, then West's, then South's.`;
              return;
            }
            st.walls.push(nw); st.askedWall = st.g;
            ctl.querySelector('#yfb').innerHTML = `<b>Yes.</b> ${wallNote(prev, nw)}`;
            ctl.querySelectorAll('[data-w]').forEach(x => { x.disabled = true; });
            setTimeout(stepYou, 1100);
          };
        });
        return;
      }
      ctl.innerHTML = `<p class="q center">${st.g === 12 ? 'Everyone has 12. Who takes the next tile?' : st.g === 0 ? 'Who takes the first tiles?' : 'Who takes tiles next?'}</p>
        <div class="seatbtns">${SEAT_ORDER.map(s => `<button class="opt" data-s="${s}">${s}</button>`).join('')}</div><div id="yfb" class="tapinfo">Grab ${st.g + 1} of ${st.grabs.length}</div>`;
      ctl.querySelectorAll('[data-s]').forEach(b => {
        b.onclick = () => {
          if (b.dataset.s !== gr.seat) {
            st.mistakes++; b.classList.add('wrong'); b.disabled = true;
            ctl.querySelector('#yfb').innerHTML = st.g < 12 ? 'Not them. Tiles go around to the right: East, South, West, North.' : 'Not them. After the three rounds, East goes first again: East, then South, West, North.';
            return;
          }
          st.g++; applyGrab(gr); draw({ active: gr.seat });
          ctl.querySelector('#yfb').innerHTML = `<b>Yes.</b> ${gr.what}`;
          ctl.querySelectorAll('[data-s]').forEach(x => { x.disabled = true; });
          setTimeout(stepYou, 650);
        };
      });
    };
    m.app.querySelector('#droll').onclick = e => {
      e.target.disabled = true;
      roll([...m.app.querySelectorAll('.dealtop .die')], ([a, c]) => {
        st.n = a + c; st.order = drawOrder(st.n); st.count = Array(76).fill(2); st.grabs = buildDeal(st.order); st.walls = ['E']; st.askedWall = -1;
        e.target.textContent = `${a} + ${c} = ${st.n}`;
        let k = 0; const counted = [];
        const t = setInterval(() => {
          counted.push(18 - k); k++;
          draw({ counted: counted.slice(), breakAt: k === st.n ? st.n : undefined, showSaved: false });
          if (k >= st.n) {
            clearInterval(t);
            draw({ counted: counted.slice() });
            ctl.innerHTML = `<div class="tapinfo">East counted <b>${st.n} stacks</b> from the right end and split the wall. The dealing starts just left of the red line.</div><button class="btn primary wide" id="go">Start dealing</button>`;
            ctl.querySelector('#go').onclick = st.mode === 'watch' ? stepWatch : stepYou;
          }
        }, 160);
      });
    };
    m.app.querySelectorAll('.seg button').forEach(b => {
      b.onclick = () => { m.app.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b)); st.mode = b.dataset.mode; reset(); };
    });
    reset();
  }

  /* ================= STEP 4: the Charleston ================= */
  const PASSES = [
    { dir: 'Right', part: 'First Charleston', k: 1 },
    { dir: 'Across', part: 'First Charleston', k: 2 },
    { dir: 'Left', part: 'First Charleston', k: 3, blind: true },
    { dir: 'Left', part: 'Second Charleston', k: 1 },
    { dir: 'Across', part: 'Second Charleston', k: 2 },
    { dir: 'Right', part: 'Second Charleston', k: 3, blind: true },
    { dir: 'Across', part: 'Courtesy pass', courtesy: true }
  ];
  const TO = { Right: 'South', Across: 'West', Left: 'North' };
  const FROM = { Right: 'North', Across: 'West', Left: 'South' };
  function arrowSvg(dir) {
    const pos = { East: [100, 168], South: [168, 100], West: [100, 32], North: [32, 100] };
    const seat = (n, lab) => `<g><circle cx="${pos[n][0]}" cy="${pos[n][1]}" r="22" fill="${n === 'East' ? 'var(--felt)' : 'var(--surface2)'}" stroke="var(--line)"/><text x="${pos[n][0]}" y="${pos[n][1]}" font-size="11" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="${n === 'East' ? '#fff' : 'var(--ink)'}">${lab}</text></g>`;
    let a = '';
    if (dir) {
      const to = pos[TO[dir]], from = [100, 140];
      const end = [to[0] + (from[0] - to[0]) * .32, to[1] + (from[1] - to[1]) * .32];
      const ctrl = dir === 'Across' ? [100, 100] : dir === 'Right' ? [150, 150] : [50, 150];
      a = `<path d="M${from[0]} ${from[1]} Q${ctrl[0]} ${ctrl[1]} ${end[0]} ${end[1]}" fill="none" stroke="#e5484d" stroke-width="5" stroke-linecap="round" marker-end="url(#ah)"/>`;
    }
    return `<svg class="passsvg" viewBox="0 0 200 200" role="img" aria-label="${dir ? 'Pass ' + dir : 'Table'}"><defs><marker id="ah" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><path d="M0 0 L4 2 L0 4 Z" fill="#e5484d"/></marker></defs>
      <rect x="55" y="55" width="90" height="90" rx="12" fill="var(--feltbg)"/>${seat('East', 'You')}${seat('South', 'South')}${seat('West', 'West')}${seat('North', 'North')}${a}</svg>`;
  }
  function step4Done() { const s = steps(); return !!(s.s4order && s.s4pass); }
  function showStep4() {
    const m = MS(); m.setBack('#/');
    const s = steps();
    m.app.innerHTML = `<article class="lesson">
      <p class="eyebrow">Start here · Step 4</p><h1>The Charleston</h1>
      <p class="lead">Before the first discard, everyone trades tiles they don't want. Learn the order, then practice a full Charleston with a real rack.</p>

      <section class="sec"><h3>The rules</h3>
        <ul>
          <li>Each pass is <b>3 tiles, face down</b>.</li>
          <li><b>Never pass a joker</b>.</li>
          <li>Pick your 3 tiles <b>before</b> you look at the ones coming to you.</li>
        </ul></section>

      <section class="sec"><h3>The order</h3>
        <div class="chorder">
          <div><b>First Charleston</b><small>Required</small><div class="seq"><span>Right</span><span>Across</span><span>Left</span></div></div>
          <div><b>Second Charleston</b><small>Optional, everyone must agree</small><div class="seq alt"><span>Left</span><span>Across</span><span>Right</span></div></div>
          <div><b>Courtesy pass</b><small>Optional, 0 to 3 tiles</small><div class="seq one"><span>Across</span></div></div>
        </div>
        <p class="tour-note"><b>Memory trick:</b> the first one spells R-A-L. The second is the same thing backwards, L-A-R.</p></section>

      <section class="sec"><h3>Who gets your tiles</h3>
        <p>You're East, at the bottom.</p>
        <div class="threearrows"><figure>${arrowSvg('Right')}<figcaption><b>Right</b> goes to South</figcaption></figure><figure>${arrowSvg('Across')}<figcaption><b>Across</b> goes to West</figcaption></figure><figure>${arrowSvg('Left')}<figcaption><b>Left</b> goes to North</figcaption></figure></div>
        <p class="small">Everyone passes the same direction at the same time, so on a Right pass your new tiles come from the player on your left.</p></section>

      <section class="sec"><h3>The second Charleston and the courtesy pass</h3>
        <p>After the first Left, the table decides on the second Charleston. <b>Any one player can stop it</b> before it starts. Once it starts, finish all three passes.</p>
        <p>The courtesy pass happens either way. You and the player across each name 0 to 3. <b>The smaller number wins</b>, and you trade that many.</p></section>

      <section class="sec"><h3>Blind passing</h3>
        <p>Only on the <b>first Left</b> and the <b>second Right</b>, you can pass along tiles you just got without looking at them. Fill the rest from your rack so it's still 3.</p></section>

      <section class="sec tip"><h3>What to pass</h3>
        <ul>
          <li>Tiles that don't fit any of the 2 or 3 hands you're considering.</li>
          <li>Keep pairs you might need. Jokers can't fill pairs later.</li>
          <li>Don't pass three useful tiles together. Mix in junk instead.</li>
        </ul></section>

      <h2 class="stage">Practice</h2>
      <div class="list">
        <a class="card${s.s4order ? ' done' : ''}" href="#/step4/order"><span class="num">${s.s4order ? '✓' : 'A'}</span><span class="card-body"><b>Learn the order</b><small>Tap the direction of all 7 passes in order. Get a perfect run.</small></span>${s.s4order ? '<span class="chip ok">Done</span>' : ''}</a>
        <a class="card${s.s4pass ? ' done' : ''}" href="#/step4/pass"><span class="num">${s.s4pass ? '✓' : 'B'}</span><span class="card-body"><b>Practice a full Charleston</b><small>You get a real rack. Pick tiles to pass every round and watch your hand improve.</small></span>${s.s4pass ? '<span class="chip ok">Done</span>' : ''}</a>
        <a class="card" href="#/drill/charleston"><span class="num">?</span><span class="card-body"><b>Quiz: Charleston</b><small>Questions on the order, seats, courtesy and blind passing.</small></span></a>
      </div></article>`;
  }

  /* ---------- order drill ---------- */
  function showOrderDrill() {
    const m = MS(); m.setBack('#/step4');
    const seq = PASSES.map(p => p.dir);
    let i = 0, miss = 0;
    const labels = ['1st R', '', '', '2nd', '', '', 'Court.'];
    m.app.innerHTML = `<div class="drill"><div class="drill-top"><b>Learn the order</b><span id="oc">0 / 7</span></div>
      <div class="qcard"><p class="q center" id="oq">Pass 1: which way?</p>
      <div class="oslots">${PASSES.map((p, k) => `<div class="oslot" data-k="${k}"><small>${p.courtesy ? 'Courtesy' : (p.part === 'First Charleston' ? '1st' : '2nd') + ' · ' + p.k}</small><b>?</b></div>`).join('')}</div>
      <div id="oarrow" class="center">${arrowSvg(null)}</div>
      <div class="dirbtns">${['Right', 'Across', 'Left'].map(d => `<button class="opt" data-d="${d}">${d}</button>`).join('')}</div>
      <div id="ofb"></div></div></div>`;
    const slots = [...m.app.querySelectorAll('.oslot')];
    slots[0].classList.add('cur');
    m.app.querySelectorAll('[data-d]').forEach(b => {
      b.onclick = () => {
        if (i >= 7) return;
        const d = b.dataset.d;
        if (d !== seq[i]) {
          miss++; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400);
          m.app.querySelector('#ofb').innerHTML = `<div class="fb no"><b>Not ${d}.</b><p>${i < 3 ? 'First Charleston: R-A-L.' : i < 6 ? 'Second Charleston is the first one backwards: L-A-R.' : 'The courtesy pass is with the player across.'}</p></div>`;
          return;
        }
        slots[i].classList.remove('cur'); slots[i].classList.add('ok'); slots[i].querySelector('b').textContent = d;
        m.app.querySelector('#oarrow').innerHTML = arrowSvg(d);
        m.app.querySelector('#ofb').innerHTML = `<div class="tapinfo"><b>${PASSES[i].part}${PASSES[i].courtesy ? '' : ', pass ' + PASSES[i].k}: ${d}.</b> Your tiles go to ${TO[d]}.</div>`;
        i++;
        m.app.querySelector('#oc').textContent = `${i} / 7`;
        if (i < 7) { slots[i].classList.add('cur'); m.app.querySelector('#oq').textContent = `Pass ${i + 1}: which way?`; return; }
        if (!miss) saveStep('s4order');
        m.app.querySelector('#oq').textContent = miss ? `Done, with ${miss} ${miss === 1 ? 'miss' : 'misses'}.` : 'Perfect run!';
        m.app.querySelector('#ofb').innerHTML = `<div class="fb ${miss ? 'no' : 'ok'}"><b>${miss ? 'Try for a perfect run' : 'You know the order'}</b><p>Right, Across, Left. Left, Across, Right. Then Across.</p></div>
          <div class="stack">${miss ? '' : '<a class="btn primary wide" href="#/step4/pass">Next: practice a full Charleston</a>'}<button class="btn ${miss ? 'primary' : 'ghost'} wide" id="oag">Go again</button><a class="btn ghost wide" href="#/step4">Back to Step 4</a></div>`;
        m.app.querySelector('#oag').onclick = showOrderDrill;
      };
    });
  }

  /* ---------- full Charleston practice ---------- */
  const FULLSET = (() => { const w = []; ALL_KINDS.forEach(k => { const n = (k === 'F' || k === 'J') ? 8 : 4; for (let i = 0; i < n; i++) w.push(k); }); return w; })();
  function showPassPractice() {
    const m = MS(); m.setBack('#/step4');
    const CS = window.CardSchool;
    const start = CS.deal(d => d.ranked[0].matched >= 4 && d.ranked[0].matched <= 6);
    const st = { rack: start.rack.slice(), tray: [], p: 0, sel: [], phase: 'ask', startFit: start.ranked[0].matched, useful: 0, dirMiss: 0, log: [], courtesyN: 0 };
    const pool = () => { const p = FULLSET.slice(); st.rack.concat(st.tray).forEach(t => p.splice(p.indexOf(t), 1)); return p.filter(t => t !== 'J'); };
    const top2 = () => CS.rankAll(st.rack).slice(0, 2);
    const rackRow = (sel, used) => {
      const u = used ? Object.assign({}, used) : null;
      return `<div class="prack selectable" id="rk">${st.rack.map((c, i) => {
        let cls = sel.includes('r' + i) ? 'picked' : '';
        if (u) { if ((u[c] || 0) > 0) { u[c]--; cls += ' use'; } }
        return `<button class="rt ${cls}" data-k="r${i}">${renderTile(c, 34)}</button>`;
      }).join('')}</div>`;
    };
    const trayRow = (sel, selectable) => st.tray.length ? `<p class="small center">${selectable ? 'Unseen tiles from the last pass. You can pass these blind:' : 'Just received (not looked at yet):'}</p>
      <div class="tray">${st.tray.map((c, i) => `<button class="rt ${sel.includes('t' + i) ? 'picked' : ''}" data-k="t${i}" ${selectable ? '' : 'disabled'}>${renderTile('X', 34)}</button>`).join('')}</div>` : '';
    const header = () => {
      const p = PASSES[st.p];
      return `<div class="drill-top"><b>Practice Charleston</b><span>${p.part}${p.courtesy ? '' : ' · ' + p.k + ' of 3'}</span></div>
        <div class="passdots">${PASSES.map((x, k) => `<i class="${k < st.p ? 'done' : k === st.p ? 'on' : ''}${x.skipped ? ' skip' : ''}"></i>`).join('')}</div>`;
    };
    const targetsHtml = () => {
      const t = top2();
      return `<details class="targets"><summary>Your closest hands right now (${t[0].matched} tiles fit)</summary>${t.map(r => CS.lineHtml(r.line, `<span class="pl-cat">${r.matched} fit</span>`)).join('')}<p class="small">Lit-up tiles in your rack fit one of these.</p></details>`;
    };

    function render() {
      const p = PASSES[st.p];
      if (st.phase === 'ask') {
        m.app.innerHTML = `<div class="drill">${header()}<div class="qcard">
          <div class="center">${arrowSvg(null)}</div>
          <p class="q center">${p.courtesy ? 'Courtesy pass' : `${p.part}, pass ${p.k}`}. Which way do your tiles go?</p>
          <div class="dirbtns">${['Right', 'Across', 'Left'].map(d => `<button class="opt" data-d="${d}">${d}</button>`).join('')}</div><div id="fb"></div></div></div>`;
        m.app.querySelectorAll('[data-d]').forEach(b => {
          b.onclick = () => {
            if (b.dataset.d !== p.dir) {
              st.dirMiss++; b.classList.add('wrong'); b.disabled = true;
              m.app.querySelector('#fb').innerHTML = `<div class="fb no"><b>Not ${b.dataset.d}.</b><p>First Charleston R-A-L, second L-A-R, courtesy Across.</p></div>`;
              return;
            }
            st.phase = p.courtesy ? 'ccount' : 'pick'; st.sel = []; render();
          };
        });
        return;
      }
      if (st.phase === 'ccount') {
        m.app.innerHTML = `<div class="drill">${header()}<div class="qcard"><div class="center">${arrowSvg('Across')}</div>
          <p class="q center">How many tiles do you want to trade with West?</p><p class="small center">West picks a number too. The smaller one wins.</p>
          ${rackRow([], CS.usedMap(top2()))}
          <div class="dirbtns">${[0, 1, 2, 3].map(n => `<button class="opt" data-n="${n}">${n}</button>`).join('')}</div></div></div>`;
        m.app.querySelectorAll('[data-n]').forEach(b => {
          b.onclick = () => {
            const mine = +b.dataset.n, theirs = [0, 1, 2, 2, 3, 3][ri(6)];
            st.courtesyN = Math.min(mine, theirs);
            st.log.push(`Courtesy: you said ${mine}, West said ${theirs}, so you traded ${st.courtesyN}.`);
            if (!st.courtesyN) { st.phase = 'cnone'; st.cmsg = `You said ${mine}, West said ${theirs}. The smaller number is 0, so nobody trades.`; render(); return; }
            st.phase = 'pick'; st.sel = []; st.cmsg = `You said ${mine}, West said ${theirs}. You'll trade <b>${st.courtesyN}</b>.`; render();
          };
        });
        return;
      }
      if (st.phase === 'cnone') {
        m.app.innerHTML = `<div class="drill">${header()}<div class="qcard"><div class="tapinfo">${st.cmsg}</div><button class="btn primary wide" id="fin">See how your hand did</button></div></div>`;
        m.app.querySelector('#fin').onclick = () => { st.p = 7; summary(); };
        return;
      }
      if (st.phase === 'vote') {
        m.app.innerHTML = `<div class="drill">${header()}<div class="qcard">
          <p class="q center">The first Charleston is done. Keep going with the second Charleston?</p>
          <p class="small center">In a real game, all four players have to agree, and any one can stop it. Stop if your hand already has a clear direction and more passing would cost you tiles you need.</p>
          ${targetsHtml()}${rackRow([], CS.usedMap(top2()))}
          <div class="stack"><button class="btn primary wide" id="yes">Keep going</button><button class="btn ghost wide" id="no">Stop it here</button></div></div></div>`;
        m.app.querySelector('#yes').onclick = () => { st.p = 3; st.phase = 'ask'; render(); };
        m.app.querySelector('#no').onclick = () => { PASSES.slice(3, 6).forEach(x => { x.skipped = true; }); st.log.push('You stopped the second Charleston.'); st.p = 6; st.phase = 'ask'; render(); };
        return;
      }
      if (st.phase === 'pick') {
        const need = p.courtesy ? st.courtesyN : 3;
        const blindOK = p.blind && st.tray.length;
        const used = CS.usedMap(top2());
        m.app.innerHTML = `<div class="drill">${header()}<div class="qcard">
          ${st.cmsg && p.courtesy ? `<div class="tapinfo">${st.cmsg}</div>` : ''}
          <div class="passrow"><div class="center">${arrowSvg(p.dir)}</div><div><p class="q">Pass ${need} ${p.dir.toLowerCase()} to ${TO[p.dir]}</p><p class="small">Tap tiles to pick them. Lit-up tiles fit your closest hands, so think twice before passing those.${blindOK ? ' This is a blind-pass round.' : ''}</p></div></div>
          ${targetsHtml()}
          ${trayRow(st.sel, blindOK)}
          ${rackRow(st.sel, used)}
          <div id="pmsg" class="small center"></div>
          <button class="btn primary wide" id="go" disabled>Pick ${need}</button></div></div>`;
        const go = m.app.querySelector('#go'), msg = m.app.querySelector('#pmsg');
        m.app.querySelectorAll('[data-k]').forEach(b => {
          b.onclick = () => {
            const k = b.dataset.k;
            if (k[0] === 'r' && st.rack[+k.slice(1)] === 'J') { msg.innerHTML = '<b>Jokers can never be passed.</b>'; return; }
            const i = st.sel.indexOf(k);
            if (i >= 0) st.sel.splice(i, 1); else if (st.sel.length < need) st.sel.push(k); else { msg.textContent = `You can only pass ${need}. Tap a picked tile to put it back.`; return; }
            msg.textContent = '';
            render();
          };
        });
        go.disabled = st.sel.length !== need;
        go.textContent = st.sel.length === need ? `Pass ${need} to ${TO[p.dir]}` : `Pick ${need - st.sel.length} more`;
        go.onclick = doPass;
        return;
      }
    }

    function doPass() {
      const p = PASSES[st.p];
      const used = Object.assign({}, CS.usedMap(top2()));
      const fromRack = st.sel.filter(k => k[0] === 'r').map(k => +k.slice(1)).sort((a, b) => b - a);
      const fromTray = st.sel.filter(k => k[0] === 't').map(k => +k.slice(1)).sort((a, b) => b - a);
      const passed = [], blind = [];
      // which rack tiles were useful (count copies in order)
      const u = Object.assign({}, used), usefulIdx = new Set();
      st.rack.forEach((c, i) => { if ((u[c] || 0) > 0) { u[c]--; usefulIdx.add(i); } });
      let usefulPassed = 0;
      fromRack.forEach(i => { if (usefulIdx.has(i)) usefulPassed++; passed.push(st.rack[i]); st.rack.splice(i, 1); });
      fromTray.forEach(i => { blind.push(st.tray[i]); st.tray.splice(i, 1); });
      st.useful += usefulPassed;
      const revealed = st.tray.splice(0);
      st.rack = st.rack.concat(revealed);
      const n = passed.length + blind.length;
      const inc = shuffle(pool()).slice(0, n);
      const keepUnseen = (st.p === 1 || st.p === 4);
      if (keepUnseen) st.tray = inc; else st.rack = st.rack.concat(inc);
      st.rack = CS.sortRack(st.rack);
      st.log.push(`${p.courtesy ? 'Courtesy' : p.part + ' ' + p.dir}: passed ${n}${blind.length ? ` (${blind.length} blind)` : ''}${usefulPassed ? `, ${usefulPassed} of them useful` : ''}.`);
      const fit = CS.rankAll(st.rack)[0].matched;
      m.app.innerHTML = `<div class="drill">${header()}<div class="qcard">
        <div class="fb ${usefulPassed ? 'no' : 'ok'}"><b>${usefulPassed ? `You passed ${usefulPassed} useful ${usefulPassed === 1 ? 'tile' : 'tiles'}` : 'Good pass'}</b>
        <p>You sent ${n} to ${TO[p.dir]}${blind.length ? `, including ${blind.length} blind` : ''}.${usefulPassed ? ' Those fit one of your closest hands. Next time, pass tiles that fit neither.' : ' None of them fit your closest hands.'}</p></div>
        ${passed.length ? `<p class="small center">You passed:</p><div class="prack">${passed.map(c => `<span class="rt">${renderTile(c, 34)}</span>`).join('')}${blind.map(() => `<span class="rt">${renderTile('X', 34)}</span>`).join('')}</div>` : ''}
        ${revealed.length ? `<p class="small center">You now look at the unseen tiles you kept:</p><div class="prack">${revealed.map(c => `<span class="rt">${renderTile(c, 34)}</span>`).join('')}</div>` : ''}
        <p class="small center">${FROM[p.dir]} passed you ${n} ${n === 1 ? 'tile' : 'tiles'}${keepUnseen ? '. They stay face down for now, so you can pass them blind next round if you want.' : ':'}</p>
        <div class="prack">${inc.map(c => `<span class="rt newt">${renderTile(keepUnseen ? 'X' : c, 34)}</span>`).join('')}</div>
        <div class="fitbar"><span>Best hand now</span><b>${fit} tiles fit</b><small>started at ${st.startFit}</small></div>
        <button class="btn primary wide" id="nx">${st.p === 2 ? 'Decide on the second Charleston' : st.p === 6 ? 'See how your hand did' : 'Next pass'}</button></div></div>`;
      m.app.querySelector('#nx').onclick = () => {
        if (st.p === 2) { st.phase = 'vote'; st.p = 3; render(); return; }
        if (st.p === 6) { st.p = 7; summary(); return; }
        st.p++; st.phase = 'ask'; st.sel = []; render();
      };
    }

    function summary() {
      st.rack = CS.sortRack(st.rack.concat(st.tray)); st.tray = [];
      const ranked = CS.rankAll(st.rack), endFit = ranked[0].matched;
      const better = endFit - st.startFit;
      saveStep('s4pass');
      PASSES.forEach(x => { delete x.skipped; });
      m.app.innerHTML = `<div class="drill"><div class="qcard">
        <p class="eyebrow center">Charleston complete</p>
        <div class="fitbar big"><span>Your best hand</span><b>${st.startFit} → ${endFit} tiles fit</b><small>${better > 0 ? `${better} better than when you started` : better === 0 ? 'Same as when you started' : `${-better} worse than when you started`}</small></div>
        <div class="fb ${st.useful ? 'no' : 'ok'}"><b>${st.useful ? `You passed ${st.useful} useful ${st.useful === 1 ? 'tile' : 'tiles'} along the way` : 'You never passed a useful tile'}</b>
        <p>${st.dirMiss ? `You picked the wrong direction ${st.dirMiss} ${st.dirMiss === 1 ? 'time' : 'times'}.` : 'You got every direction right.'}</p></div>
        <p class="small center">Your final 13 tiles:</p><div class="prack">${st.rack.map(c => `<span class="rt">${renderTile(c, 34)}</span>`).join('')}</div>
        <h3 class="catttl">Your closest hands now</h3>
        ${ranked.slice(0, 2).map(r => `<div class="topcard">${CS.lineHtml(r.line, `<span class="pl-cat">${r.matched} fit</span>`)}${CS.buildHtml(r, 28)}</div>`).join('')}
        <details class="targets"><summary>What happened each pass</summary><ul>${st.log.map(l => `<li>${l}</li>`).join('')}</ul></details>
        <div class="stack"><button class="btn primary wide" id="again">Practice with a new rack</button><a class="btn ghost wide" href="#/step4">Back to Step 4</a><a class="btn ghost wide" href="#/">Home</a></div></div></div>`;
      m.app.querySelector('#again').onclick = showPassPractice;
    }
    PASSES.forEach(x => { delete x.skipped; });
    render();
  }

  window.StepsSchool = { dirSvg, showStep3, showStep4, showDiceTool, showBreakPractice, showDealPractice, showOrderDrill, showPassPractice, step3Done, step4Done, drawOrder, buildDeal };
})();
