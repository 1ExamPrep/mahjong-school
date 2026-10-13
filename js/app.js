/* Mahjong School app shell: routing, pages, quiz engine and saved progress. */
(function () {
  const PASS = 80;

  const Store = {
    key: 'mahjong-school-v1',
    data: { theme: 'real', themeChosen: false, lessons: {}, drills: {} },
    load() {
      try { const raw = localStorage.getItem(this.key); if (raw) Object.assign(this.data, JSON.parse(raw)); } catch (e) { /* storage blocked */ }
    },
    save() {
      try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* storage blocked */ }
    }
  };
  Store.load();

  window.currentTheme = () => (Store.data.themeChosen && TILE_THEMES.find(t => t.id === Store.data.theme)) || TILE_THEMES[0];

  const app = document.getElementById('app');
  const backBtn = document.getElementById('back');
  let parentRoute = null;

  function expandTiles(html, defSize) {
    defSize = defSize || 36;
    return html.replace(/\[\[([^\]]+)\]\]/g, (m, inner) => {
      const parts = inner.split('|');
      const size = +parts[1] || defSize;
      return '<span class="tile-row">' + parts[0].trim().split(/\s+/).map(c => renderTile(c, size)).join('') + '</span>';
    });
  }

  function setBack(route) {
    parentRoute = route;
    backBtn.hidden = !route;
  }
  backBtn.addEventListener('click', () => { if (parentRoute) location.hash = parentRoute; });

  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [page, id] = h.split('/');
    window.scrollTo(0, 0);
    if (page === 'lesson') return showLesson(id);
    if (page === 'drill') return showDrill(id);
    if (page === 'tiles') return showTiles();
    if (page === 'reference') return showReference();
    if (page === 'tour') return showTour(id);
    if (page === 'finder') return CardSchool.showHub();
    if (page === 'card') return CardSchool.showCardPage();
    if (page === 'cardlesson') return CardSchool.showLessonPage();
    if (page === 'find') return CardSchool.playGame(id);
    if (page === 'ask') return AskSchool.showAsk();
    if (page === 'helper') return HelperSchool.show();
    if (page === 'step3') return ({ dice: StepsSchool.showDiceTool, break: StepsSchool.showBreakPractice, deal: StepsSchool.showDealPractice }[id] || StepsSchool.showStep3)();
    if (page === 'step4') return ({ order: StepsSchool.showOrderDrill, pass: StepsSchool.showPassPractice }[id] || StepsSchool.showStep4)();
    showHome();
  }
  window.addEventListener('hashchange', route);
  window.MS = { app, setBack: r => setBack(r), Store, expandTiles: (h, z) => expandTiles(h, z) };

  const best = id => Store.data.drills[id];
  const passed = id => (best(id) || 0) >= PASS;

  /* ---------- Home ---------- */
  function lessonCard(l, i) {
    const b = best(l.drill);
    const read = Store.data.lessons[l.id];
    let status = '';
    if (passed(l.drill)) status = `<span class="chip ok">${b}%</span>`;
    else if (b !== undefined) status = `<span class="chip warn">${b}%</span>`;
    else if (read) status = `<span class="chip">Read</span>`;
    return `<a class="card lesson-card${passed(l.drill) ? ' done' : ''}" href="#/lesson/${l.id}">
      <span class="num">${passed(l.drill) ? '✓' : i + 1}</span>
      <span class="card-body"><b>${l.title}</b><small>${l.summary}</small></span>${status}</a>`;
  }

  function showHome() {
    setBack(null);
    const total = LESSONS.length;
    const done = LESSONS.filter(l => passed(l.drill)).length;
    const pct = Math.round(done / total * 100);
    const stages = [...new Set(LESSONS.map(l => l.stage))];
    const next = LESSONS.find(l => !passed(l.drill));
    let html = `<section class="hero">
      <div class="hero-tiles">${expandTiles('[[b1 DR F J|40]]')}</div>
      <h1>Learn American Mahjong</h1>
      <p>Short lessons with a quick drill after each one. Pass a drill with ${PASS}% to check it off.</p>
      <div class="meter"><i style="width:${pct}%"></i></div>
      <p class="meter-label">${done} of ${total} lessons passed</p>
      ${!Store.data.tourDone ? `<a class="btn primary" href="#/tour/0">Step 1: Tile tour</a>`
        : !CardSchool.done(Store) ? `<a class="btn primary" href="#/finder">Step 2: Read the card and find your hand</a>`
        : !StepsSchool.step3Done() ? `<a class="btn primary" href="#/step3">Step 3: Dice, walls and the deal</a>`
        : !StepsSchool.step4Done() ? `<a class="btn primary" href="#/step4">Step 4: The Charleston</a>`
        : next ? `<a class="btn primary" href="#/lesson/${next.id}">${done ? 'Continue' : 'Start'}: ${next.title}</a>` : `<a class="btn primary" href="#/drill/exam">Take the final quiz</a>`}
    </section>`;
    html += `<div class="tools"><a class="askcard" href="#/ask"><span class="askicon">💬</span><span><b>Ask about the rules</b><small>Type any rules question</small></span></a>
      <a class="askcard alt" href="#/helper"><span class="askicon">📷</span><span><b>Hand helper</b><small>Snap your rack, see what to go for</small></span></a></div>`;
    if (!Store.data.themeChosen) {
      html += `<a class="banner" href="#/tiles"><span class="tile-row">${TILE_THEMES.map(t => renderTile('d5', 26, t)).join('')}</span><span><b>Pick your tile style</b><small>Six looks to try. Tap to choose.</small></span></a>`;
    }
    const s2 = CardSchool.done(Store), s3 = StepsSchool.step3Done(), s4 = StepsSchool.step4Done();
    html += `<h2 class="stage">Start here</h2><div class="list">
      <a class="card tour-card${Store.data.tourDone ? ' done' : ''}" href="#/tour/0">
        <span class="num">${Store.data.tourDone ? '✓' : '1'}</span>
        <span class="card-body"><b>Step 1: Tile tour</b><small>Names, colors, and which tiles go together. Tap along, about 5 minutes.</small></span>
        ${Store.data.tourDone ? '<span class="chip ok">Done</span>' : '<span class="chip warn">Start</span>'}</a>
      <a class="card tour-card${s2 ? ' done' : ''}" href="#/finder">
        <span class="num">${s2 ? '✓' : '2'}</span>
        <span class="card-body"><b>Step 2: Read the card and find your hand</b><small>Look at 13 tiles, count them against the card, and pick what to go for. Four practice games.</small></span>
        ${s2 ? '<span class="chip ok">Done</span>' : Store.data.tourDone ? '<span class="chip warn">Next</span>' : ''}</a>
      <a class="card tour-card${s3 ? ' done' : ''}" href="#/step3">
        <span class="num">${s3 ? '✓' : '3'}</span>
        <span class="card-body"><b>Step 3: Dice, walls and the deal</b><small>Pick East, break the wall with the dice, and deal. Includes a dice roller for real games.</small></span>
        ${s3 ? '<span class="chip ok">Done</span>' : s2 ? '<span class="chip warn">Next</span>' : ''}</a>
      <a class="card tour-card${s4 ? ' done' : ''}" href="#/step4">
        <span class="num">${s4 ? '✓' : '4'}</span>
        <span class="card-body"><b>Step 4: The Charleston</b><small>Learn the passing order, then practice a full Charleston with a real rack.</small></span>
        ${s4 ? '<span class="chip ok">Done</span>' : s3 ? '<span class="chip warn">Next</span>' : ''}</a>
    </div>`;
    let idx = 0;
    stages.forEach(st => {
      html += `<h2 class="stage">${st}</h2><div class="list">`;
      LESSONS.filter(l => l.stage === st).forEach(l => { html += lessonCard(l, idx++); });
      html += '</div>';
    });
    html += `<h2 class="stage">Practice and reference</h2><div class="list">
      <a class="card" href="#/drill/exam"><span class="num">★</span><span class="card-body"><b>Final quiz</b><small>Ten real table situations from the handbook.</small></span>${best('exam') !== undefined ? `<span class="chip ${passed('exam') ? 'ok' : 'warn'}">${best('exam')}%</span>` : ''}</a>
      <a class="card" href="#/reference"><span class="num">≡</span><span class="card-body"><b>Table reference</b><small>Checklists to keep open while you play.</small></span></a>
      <a class="card" href="#/tiles"><span class="num">◐</span><span class="card-body"><b>Tile style</b><small>Now using ${currentTheme().name}.</small></span></a>
    </div>
    <footer class="foot">An independent learning app, not an official National Mah Jongg League product. Use the current League card and rules for real games and disputes. Practice lines here are invented.
    <br><button class="linkbtn" id="reset">Reset my progress</button></footer>`;
    app.innerHTML = html;
    app.querySelector('#reset').onclick = () => {
      if (confirm('Clear all lesson and drill progress?')) { Store.data.lessons = {}; Store.data.drills = {}; Store.save(); showHome(); }
    };
  }

  /* ---------- Lesson ---------- */
  function showLesson(id) {
    const i = LESSONS.findIndex(l => l.id === id);
    if (i < 0) return showHome();
    const l = LESSONS[i];
    setBack('#/');
    Store.data.lessons[l.id] = true; Store.save();
    const prev = LESSONS[i - 1], next = LESSONS[i + 1];
    const b = best(l.drill);
    app.innerHTML = `<article class="lesson">
      <p class="eyebrow">${l.stage} · Lesson ${i + 1} of ${LESSONS.length}</p>
      <h1>${l.title}</h1>
      ${l.sections.map(s => `<section class="sec${s.tip ? ' tip' : ''}"><h3>${s.h}</h3>${expandTiles(s.body)}</section>`).join('')}
      <div class="practice">
        <div><b>Practice: ${DRILLS[l.drill].title}</b><small>${b !== undefined ? `Best score ${b}%` : `Pass with ${PASS}% to check this lesson off.`}</small></div>
        <a class="btn primary" href="#/drill/${l.drill}">${b !== undefined ? 'Try again' : 'Start drill'}</a>
      </div>
      <nav class="pager">
        ${prev ? `<a class="btn ghost" href="#/lesson/${prev.id}">‹ ${prev.title}</a>` : '<span></span>'}
        ${next ? `<a class="btn ghost" href="#/lesson/${next.id}">${next.title} ›</a>` : `<a class="btn ghost" href="#/drill/exam">Final quiz ›</a>`}
      </nav>
    </article>`;
  }

  /* ---------- Drill engine ---------- */
  function showDrill(id) {
    const d = DRILLS[id];
    if (!d) return showHome();
    const backTo = d.lesson ? '#/lesson/' + d.lesson : '#/';
    setBack(backTo);
    Store.data.seen = Store.data.seen || {};
    const test = makeTest(id, Store.data.seen[id] || []);
    Store.data.seen[id] = test.seen; Store.save();
    const st = { qs: test.qs, i: 0, score: 0 };

    function render() {
      if (st.i >= st.qs.length) return finish();
      const q = st.qs[st.i];
      if (q.h) { Store.data.seen[id] = markSeen(Store.data.seen[id] || [], q.h); Store.save(); }
      app.innerHTML = `<div class="drill">
        <div class="drill-top"><b>${d.title}</b><span>${st.i + 1} / ${st.qs.length}</span></div>
        <div class="meter small"><i style="width:${st.i / st.qs.length * 100}%"></i></div>
        <div class="qcard"><div class="prompt">${expandTiles(q.prompt, 40)}</div><div id="opts"></div><div id="fb"></div></div>
      </div>`;
      if (q.type === 'order') renderOrder(q); else renderChoice(q);
    }

    function renderChoice(q) {
      const box = app.querySelector('#opts');
      box.className = 'opts' + (q.grid ? ' grid' : '');
      q.options.forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'opt';
        b.innerHTML = expandTiles(o, 30);
        b.onclick = () => {
          [...box.children].forEach(x => { x.disabled = true; });
          const ok = i === q.answer;
          box.children[q.answer].classList.add('right');
          if (!ok) b.classList.add('wrong');
          if (ok) st.score++;
          feedback(ok, q.explain);
        };
        box.appendChild(b);
      });
    }

    function renderOrder(q) {
      const box = app.querySelector('#opts');
      box.className = 'order';
      const picked = [];
      box.innerHTML = `<div class="slots">${q.answer.map((_, i) => `<span class="slot" data-i="${i}">${i + 1}</span>`).join('')}</div><div class="order-items"></div><button class="linkbtn" id="undo">Undo</button>`;
      const items = box.querySelector('.order-items');
      const slots = box.querySelectorAll('.slot');
      const draw = () => {
        slots.forEach((s, i) => { s.textContent = picked[i] || (i + 1); s.classList.toggle('filled', !!picked[i]); });
        items.innerHTML = '';
        shuffleOnce.forEach(it => {
          const b = document.createElement('button');
          b.className = 'opt'; b.textContent = it;
          b.disabled = picked.includes(it);
          b.onclick = () => {
            picked.push(it); draw();
            if (picked.length === q.answer.length) {
              const ok = picked.every((p, i) => p === q.answer[i]);
              slots.forEach((s, i) => s.classList.add(picked[i] === q.answer[i] ? 'right' : 'wrong'));
              items.querySelectorAll('button').forEach(x => { x.disabled = true; });
              box.querySelector('#undo').remove();
              if (ok) st.score++;
              feedback(ok, q.explain);
            }
          };
          items.appendChild(b);
        });
      };
      const shuffleOnce = q.items.slice().sort(() => Math.random() - 0.5);
      box.querySelector('#undo').onclick = () => { picked.pop(); draw(); };
      draw();
    }

    function feedback(ok, explain) {
      const fb = app.querySelector('#fb');
      fb.innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Correct' : 'Not quite'}</b><p>${expandTiles(explain || '', 24)}</p></div>
        <button class="btn primary wide" id="next">${st.i + 1 < st.qs.length ? 'Next' : 'See results'}</button>`;
      fb.querySelector('#next').onclick = () => { st.i++; render(); window.scrollTo(0, 0); };
      setTimeout(() => fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }

    function finish() {
      const pct = Math.round(st.score / st.qs.length * 100);
      const prev = best(id);
      if (prev === undefined || pct > prev) { Store.data.drills[id] = pct; Store.save(); }
      const ok = pct >= PASS;
      const li = d.lesson ? LESSONS.findIndex(l => l.id === d.lesson) : -1;
      const nextLesson = li >= 0 ? LESSONS[li + 1] : null;
      let msg;
      if (pct === 100) msg = 'Perfect score. You know this one.';
      else if (ok) msg = 'Passed. Nice work.';
      else msg = `You need ${PASS}% to pass. Have another look at ${d.lesson ? 'the lesson' : 'the lessons'} and try again.`;
      app.innerHTML = `<div class="result ${ok ? 'ok' : 'no'}">
        <div class="big">${pct}%</div>
        <p>${st.score} of ${st.qs.length} right</p>
        <p class="msg">${msg}</p>
        ${prev !== undefined && pct > prev ? '<p class="small">New best score.</p>' : ''}
        <p class="small fresh">Try again any time and you'll get new questions. This test has ${test.hasGen ? 'over ' + Math.max(test.total, 1000).toLocaleString() : test.total} different questions, and none repeat until you've seen at least 100 others.</p>
        <div class="stack">
          ${ok && nextLesson ? `<a class="btn primary wide" href="#/lesson/${nextLesson.id}">Next lesson: ${nextLesson.title}</a>` : ''}
          ${ok && !nextLesson && id !== 'exam' ? `<a class="btn primary wide" href="#/drill/exam">Take the final quiz</a>` : ''}
          <button class="btn ${ok ? 'ghost' : 'primary'} wide" id="again">Try again with new questions</button>
          ${d.lesson ? `<a class="btn ghost wide" href="#/lesson/${d.lesson}">Back to the lesson</a>` : ''}
          <a class="btn ghost wide" href="#/">Home</a>
        </div></div>`;
      app.querySelector('#again').onclick = () => showDrill(id);
    }

    render();
  }

  /* ---------- Tile styles ---------- */
  function showTiles() {
    setBack('#/');
    const sampleA = ['b1', 'b6', 'c3', 'c8', 'd2', 'd7'];
    const sampleB = ['N', 'E', 'DR', 'DG', 'DW', 'F', 'J'];
    const cur = currentTheme();
    app.innerHTML = `<h1 class="page-title">Tile style</h1>
      <p class="lead">Pick whichever is easiest for you to read. You can switch any time and your progress stays the same.</p>
      <div class="styles">${TILE_THEMES.map((t, i) => `
        <button class="style-card${t.id === cur.id ? ' on' : ''}" data-id="${t.id}">
          <div class="style-head"><b>${i + 1}. ${t.name}</b>${t.id === cur.id ? '<span class="chip ok">In use</span>' : '<span class="chip">Tap to use</span>'}</div>
          <p>${t.desc}</p>
          <div class="tile-row">${sampleA.map(c => renderTile(c, 38, t)).join('')}</div>
          <div class="tile-row">${sampleB.map(c => renderTile(c, 38, t)).join('')}</div>
        </button>`).join('')}</div>
      <h2 class="stage">Every tile in ${cur.name}</h2>
      <div class="allset">${ALL_KINDS.map(c => `<figure>${renderTile(c, 42)}<figcaption>${tileName(c).replace(' (Soap)', '')}</figcaption></figure>`).join('')}</div>`;
    app.querySelectorAll('.style-card').forEach(b => {
      b.onclick = () => {
        Store.data.theme = b.dataset.id; Store.data.themeChosen = true; Store.save();
        const y = window.scrollY; showTiles(); window.scrollTo(0, y);
      };
    });
  }

  /* ---------- Tile tour ---------- */
  const FAMILY_HINT = {
    Bams: 'bamboo sticks (or the bird for 1)', Craks: 'a Chinese number over a red 萬', Dots: 'circles',
    Winds: 'a big character with N, E, W or S in the corner', Dragons: 'a red 中, a green 發, or a blue frame (soap)', Flowers: 'a flower', Jokers: 'JOKER'
  };
  function familyOf(code) {
    const p = parseTile(code);
    if (p.kind === 'suit') return SUIT_NAME[p.suit] + 's';
    return { wind: 'Winds', dragon: 'Dragons', flower: 'Flowers', joker: 'Jokers' }[p.kind];
  }

  function tourQuestions(gen) {
    if (gen === 'suits') {
      const qs = [];
      const used = shuffle(SUITED);
      for (let i = 0; i < 4; i++) {
        const c = used[i], p = parseTile(c);
        if (i % 2 === 0) {
          const opts = ['Bams', 'Craks', 'Dots'];
          qs.push({ tile: c, q: 'Which suit is this?', options: opts, answer: SUIT_NAME[p.suit] + 's',
            explain: `It's a ${SUIT_NAME[p.suit]}. ${p.suit === 'bam' ? 'Bamboo sticks or the bird.' : p.suit === 'crak' ? 'The red 萬 symbol.' : 'Circles.'}` });
        } else {
          const name = tileName(c);
          const wrong = shuffle(['b', 'c', 'd'].filter(s => SUIT_LETTER[s] !== p.suit).map(s => tileName(s + p.n))
            .concat([tileName(c[0] + (p.n === 9 ? 8 : p.n + 1))]));
          qs.push({ tile: c, q: 'What is this tile called?', options: shuffle([name].concat(wrong.slice(0, 3))), answer: name,
            explain: `The ${name}: number ${p.n}, suit ${SUIT_NAME[p.suit]}.` });
        }
      }
      return qs;
    }
    const bank = [
      { tile: 'DR', q: 'Which suit does this dragon go with?', options: ['Craks', 'Bams', 'Dots'], answer: 'Craks', explain: 'Red Dragon goes with Craks. Both are red.' },
      { tile: 'DG', q: 'Which suit does this dragon go with?', options: ['Bams', 'Craks', 'Dots'], answer: 'Bams', explain: 'Green Dragon goes with Bams. Both are green.' },
      { tile: 'DW', q: 'What is this dragon\'s nickname?', options: ['Soap', 'Ghost', 'Blank'], answer: 'Soap', explain: 'The White Dragon is called soap. It goes with Dots.' },
      { tile: 'b1', q: 'Is this a flower?', options: ['No, it\'s the 1 Bam', 'Yes, a flower'], answer: 'No, it\'s the 1 Bam', explain: 'The bird is always the 1 Bam.' },
      { tile: pick(['N', 'E', 'W', 'S']), q: 'Which wind is this?', options: ['North', 'East', 'West', 'South'], answer: null, explain: 'Check the letter in the corner: N, E, W or S.' },
      { tile: 'F', q: 'How many flowers are in a set?', options: ['8', '4', '12'], answer: '8', explain: 'Eight flowers, and they all count as the same tile.' },
      { tile: 'J', q: 'A joker can fill in for a tile in...', options: ['A group of 3 or more', 'A pair', 'Any single tile'], answer: 'A group of 3 or more', explain: 'Never a pair or a single.' },
      { tile: 'E', q: 'What suit are the winds?', options: ['No suit', 'Dots', 'Bams'], answer: 'No suit', explain: 'Winds, flowers and jokers have no suit.' }
    ];
    return shuffle(bank).slice(0, 4).map(q => {
      if (q.answer === null) q.answer = tileName(q.tile);
      return Object.assign({}, q, { options: q.options.length > 2 ? shuffle(q.options) : q.options });
    });
  }

  function showTour(n) {
    n = Math.max(0, Math.min(TOUR.length - 1, parseInt(n, 10) || 0));
    setBack('#/');
    const s = TOUR[n], last = n === TOUR.length - 1;
    if (last) { Store.data.tourDone = true; Store.save(); }
    app.innerHTML = `<div class="tour">
      <div class="tour-dots">${TOUR.map((_, i) => `<i class="${i < n ? 'done' : i === n ? 'on' : ''}"></i>`).join('')}</div>
      <p class="eyebrow">Tile tour · Step ${n + 1} of ${TOUR.length}</p>
      <h1>${s.title}</h1>
      <div class="sec tour-body">${expandTiles(s.body || '', 44)}<div id="tw"></div>
      ${s.note ? `<p class="tour-note">${s.note}</p>` : ''}</div>
      <div class="tour-nav">
        ${n > 0 ? `<a class="btn ghost" href="#/tour/${n - 1}">Back</a>` : '<a class="btn ghost" href="#/">Later</a>'}
        <button class="btn primary" id="tnext">${last ? 'Go to Step 2' : 'Next'}</button>
      </div></div>`;
    const next = app.querySelector('#tnext');
    const w = app.querySelector('#tw');
    const lock = on => { next.disabled = on; next.textContent = on ? 'Finish this step first' : (last ? 'Go to Step 2' : 'Next'); };
    next.onclick = () => { location.hash = last ? '#/finder' : '#/tour/' + (n + 1); };
    if (s.type === 'tap') tourTap(w, s);
    else if (s.type === 'pick') tourPick(w, s, lock);
    else if (s.type === 'match') tourMatch(w, lock);
    else if (s.type === 'sort') tourSort(w, lock);
  }

  function tourTap(w, s) {
    const found = new Set();
    w.innerHTML = `<div class="tapgrid">${s.tiles.map(c => `<button class="tapt" data-c="${c}">${renderTile(c, 54)}<span>Tap</span></button>`).join('')}</div>
      <div class="tapinfo" id="tinfo">Tap a tile to see its name.</div>
      <button class="linkbtn" id="tall">Show all names</button>`;
    const info = w.querySelector('#tinfo');
    const reveal = (b, announce) => {
      const c = b.dataset.c;
      b.classList.add('shown');
      b.querySelector('span').textContent = tileName(c).replace(' (Soap)', '');
      found.add(c);
      if (announce) {
        w.querySelectorAll('.tapt').forEach(x => x.classList.toggle('active', x === b));
        const fact = (s.facts && s.facts[c]) || '';
        info.innerHTML = `<b>${tileName(c)}</b>${fact && fact !== tileName(c) ? `<br>${fact}` : ''}<br><small>${found.size} of ${s.tiles.length} found</small>`;
      }
    };
    w.querySelectorAll('.tapt').forEach(b => { b.onclick = () => reveal(b, true); });
    w.querySelector('#tall').onclick = () => { w.querySelectorAll('.tapt').forEach(b => reveal(b, false)); info.innerHTML = `<small>All ${s.tiles.length} names showing.</small>`; };
  }

  function tourPick(w, s, lock) {
    const qs = tourQuestions(s.gen);
    let i = 0;
    lock(true);
    const draw = () => {
      if (i >= qs.length) {
        w.innerHTML = `<div class="fb ok"><b>All ${qs.length} done.</b><p>Tap Next to keep going.</p></div>`;
        lock(false);
        return;
      }
      const q = qs[i];
      w.innerHTML = `<p class="small center">Question ${i + 1} of ${qs.length}</p>
        <div class="center">${renderTile(q.tile, 72)}</div>
        <p class="q center">${q.q}</p>
        <div class="opts ${q.options.length === 4 ? 'grid' : ''}">${q.options.map(o => `<button class="opt">${o}</button>`).join('')}</div>
        <div id="pfb"></div>`;
      const btns = [...w.querySelectorAll('.opt')];
      btns.forEach(b => {
        b.onclick = () => {
          const fb = w.querySelector('#pfb');
          if (b.textContent === q.answer) {
            btns.forEach(x => { x.disabled = true; });
            b.classList.add('right');
            fb.innerHTML = `<div class="fb ok"><b>Yes!</b><p>${q.explain}</p></div>`;
            setTimeout(() => { i++; draw(); }, 1300);
          } else {
            b.classList.add('wrong'); b.disabled = true;
            fb.innerHTML = `<div class="fb no"><b>Not that one.</b><p>Try again.</p></div>`;
          }
        };
      });
    };
    draw();
  }

  function tourMatch(w, lock) {
    lock(true);
    // 8 suit tiles: each suit at least twice, all different, 1 Bam bird sometimes included
    let tiles;
    do {
      tiles = [];
      ['b', 'c', 'd'].forEach(s => { shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 2).forEach(n => tiles.push(s + n)); });
      while (tiles.length < 8) { const t = pick(SUITED); if (!tiles.includes(t)) tiles.push(t); }
    } while (new Set(tiles).size !== 8);
    tiles = shuffle(tiles);
    const goesWith = { b: 'DG', c: 'DR', d: 'DW' };
    const dragons = ['DG', 'DR', 'DW'];
    const counts = { DG: 0, DR: 0, DW: 0 };
    let sel = null, done = 0;
    w.innerHTML = `<p class="small center" id="mcount">0 of 8 matched</p>
      <div class="m8grid">${tiles.map(c => `<button class="m8" data-c="${c}">${renderTile(c, 50)}<span>${tileName(c)}</span></button>`).join('')}</div>
      <div class="m8drag">${dragons.map(c => `<button class="mdrag" data-c="${c}">${renderTile(c, 52)}<span class="mdn">${tileName(c).replace(' (Soap)', '')}${c === 'DW' ? '<small>soap</small>' : ''}</span><span class="mpile" id="pile-${c}"></span></button>`).join('')}</div>
      <div id="mfb" class="tapinfo">Tap a tile on top, then tap its dragon below.</div>`;
    const fb = w.querySelector('#mfb'), cnt = w.querySelector('#mcount');
    const tbtns = [...w.querySelectorAll('.m8')], dbtns = [...w.querySelectorAll('.mdrag')];
    tbtns.forEach(b => {
      b.onclick = () => {
        tbtns.forEach(x => x.classList.remove('sel'));
        b.classList.add('sel'); sel = b;
        fb.innerHTML = `<b>${tileName(b.dataset.c)}</b>. Now tap the dragon that goes with ${SUIT_NAME[SUIT_LETTER[b.dataset.c[0]]]}s.`;
      };
    });
    dbtns.forEach(b => {
      b.onclick = () => {
        if (!sel) { fb.textContent = 'Pick a tile on top first.'; return; }
        const c = sel.dataset.c, s = c[0], d = b.dataset.c;
        if (goesWith[s] === d) {
          sel.classList.remove('sel'); sel.classList.add('matched', 'm-' + s); sel.disabled = true;
          counts[d]++; done++; sel = null;
          w.querySelector('#pile-' + d).insertAdjacentHTML('beforeend', renderTile(c, 20));
          b.classList.add('flash', 'm-' + s); setTimeout(() => b.classList.remove('flash'), 350);
          cnt.textContent = `${done} of 8 matched`;
          fb.innerHTML = `<b>Match!</b> ${tileName(c)} is a ${SUIT_NAME[SUIT_LETTER[s]]}, so it goes with the ${tileName(d).replace(' (Soap)', ' (soap)')}.`;
          if (done === 8) {
            fb.innerHTML = `<b>All 8 matched!</b> Bams go with the Green Dragon, Craks with the Red Dragon, and Dots with soap. The number never matters, only the suit.`;
            lock(false);
          }
        } else {
          b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400);
          fb.innerHTML = `Not that one. ${tileName(c)} is a <b>${SUIT_NAME[SUIT_LETTER[s]]}</b>. ${s === 'b' ? 'Bamboo is green.' : s === 'c' ? 'Craks have the red 萬.' : 'Dots go with the white dragon.'}`;
        }
      };
    });
  }

  function tourSort(w, lock) {
    lock(true);
    const must = ['b1', 'F', 'J', pick(['N', 'E', 'W', 'S']), pick(['DR', 'DG', 'DW']), 'DW'];
    const rest = shuffle(SUITED.filter(c => c !== 'b1'));
    const tiles = shuffle(must.concat(rest.slice(0, 10 - must.length)));
    const bins = ['Bams', 'Craks', 'Dots', 'Winds', 'Dragons', 'Flowers', 'Jokers'];
    let i = 0, misses = 0;
    const draw = () => {
      if (i >= tiles.length) {
        w.innerHTML = `<div class="fb ok"><b>All sorted${misses ? '' : ' with no misses'}!</b><p>${misses ? `You missed ${misses}, but you got there.` : 'You know your tile families.'} Tap Next.</p></div>`;
        lock(false); return;
      }
      const c = tiles[i];
      w.innerHTML = `<div class="meter small"><i style="width:${i / tiles.length * 100}%"></i></div>
        <div class="center sort-tile">${renderTile(c, 84)}</div>
        <p class="q center">Which family?</p>
        <div class="bins">${bins.map(b => `<button class="opt bin">${b}</button>`).join('')}</div>
        <div id="sfb"></div>`;
      w.querySelectorAll('.bin').forEach(b => {
        b.onclick = () => {
          const fam = familyOf(c), fb = w.querySelector('#sfb');
          if (b.textContent === fam) {
            w.querySelectorAll('.bin').forEach(x => { x.disabled = true; });
            b.classList.add('right');
            fb.innerHTML = `<div class="fb ok"><b>${tileName(c)}</b><p>${c === 'b1' ? 'The bird is a Bam, not a flower.' : c === 'DW' ? 'Soap is a dragon.' : 'Right family.'}</p></div>`;
            setTimeout(() => { i++; draw(); }, 900);
          } else {
            misses++;
            b.classList.add('wrong'); b.disabled = true;
            fb.innerHTML = `<div class="fb no"><b>Not quite.</b><p>Hint: ${fam} look like ${FAMILY_HINT[fam]}.</p></div>`;
          }
        };
      });
    };
    draw();
  }

  /* ---------- Reference ---------- */
  function showReference() {
    setBack('#/');
    app.innerHTML = `<article class="lesson"><p class="eyebrow">Keep this open at the table</p><h1>Table reference</h1>${REFERENCE}</article>`;
  }

  route();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
