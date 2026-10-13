/* Hand helper: snap or upload a photo of your rack, tap in your tiles,
   and get ranked categories, best hands and tiles to pass. Works offline.
   The photo is only shown on screen. It's never uploaded or saved. */
(function () {
  const GROUPS = [
    { name: 'Bams', tiles: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9'] },
    { name: 'Craks', tiles: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'] },
    { name: 'Dots', tiles: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9'] },
    { name: 'Winds, dragons, flowers and jokers', tiles: ['N', 'E', 'W', 'S', 'DR', 'DG', 'DW', 'F', 'J'] }
  ];
  const MAXN = c => (c === 'F' || c === 'J') ? 8 : 4;
  let rack = [], photoURL = null, bigPhoto = false;

  function show() {
    const m = window.MS; m.setBack('#/');
    const CS = window.CardSchool;
    const count = c => rack.filter(x => x === c).length;
    const html = () => `<article class="lesson helper">
      <p class="eyebrow">Hand helper</p><h1>What should I go for?</h1>
      <p class="lead">Take a photo of your rack (or skip it), tap in your tiles, and see which categories and hands fit best. Everything stays on your phone.</p>

      <section class="sec photosec${photoURL ? ' has' : ''}">
        ${photoURL ? `<div class="photobox${bigPhoto ? ' big' : ''}"><img src="${photoURL}" alt="Your rack"><div class="photobtns"><button class="linkbtn" id="zoom">${bigPhoto ? 'Smaller' : 'Bigger'}</button><button class="linkbtn" id="clearph">Remove photo</button></div></div>`
          : `<label class="photodrop"><input type="file" accept="image/*" capture="environment" id="ph" hidden><span class="phicon">📷</span><b>Take or upload a photo of your rack</b><small>Optional. It helps you tap in the right tiles.</small></label>`}
      </section>

      <section class="sec">
        <div class="rackhead"><h3>Your tiles <span class="rcount ${rack.length >= 13 ? 'ok' : ''}">${rack.length} / 13</span></h3>${rack.length ? '<button class="linkbtn" id="clr">Clear</button>' : ''}</div>
        <div class="myrack">${rack.length ? CS.sortRack(rack).map(c => `<button class="rt" data-del="${c}" aria-label="Remove ${tileName(c)}">${renderTile(c, 36)}</button>`).join('') : '<p class="small">Tap tiles below to add them. Tap a tile here to remove it.</p>'}</div>
        <div id="padmsg" class="small center"></div>
        ${GROUPS.map(g => `<p class="padlabel">${g.name}</p><div class="pad">${g.tiles.map(c => `<button class="padt${count(c) ? ' has' : ''}" data-add="${c}" aria-label="Add ${tileName(c)}">${renderTile(c, 34)}${count(c) ? `<i>${count(c)}</i>` : ''}</button>`).join('')}</div>`).join('')}
      </section>

      <button class="btn primary wide" id="go" ${rack.length >= 13 ? '' : 'disabled'}>${rack.length >= 13 ? 'Analyze my hand' : `Add ${13 - rack.length} more ${13 - rack.length === 1 ? 'tile' : 'tiles'}`}</button>
      <div id="result"></div>
      <p class="note" style="margin-top:16px">Suggestions use this app's practice card. The real NMJL card changes every year, but the same categories and the same counting work there too.</p>
    </article>`;

    const render = () => {
      const y = window.scrollY;
      m.app.innerHTML = html();
      window.scrollTo(0, y);
      wire();
    };
    function wire() {
      const msg = m.app.querySelector('#padmsg');
      const ph = m.app.querySelector('#ph');
      if (ph) ph.onchange = () => {
        const f = ph.files && ph.files[0];
        if (!f) return;
        if (photoURL) URL.revokeObjectURL(photoURL);
        photoURL = URL.createObjectURL(f); render();
      };
      const z = m.app.querySelector('#zoom'); if (z) z.onclick = () => { bigPhoto = !bigPhoto; render(); };
      const cp = m.app.querySelector('#clearph'); if (cp) cp.onclick = () => { URL.revokeObjectURL(photoURL); photoURL = null; render(); };
      const clr = m.app.querySelector('#clr'); if (clr) clr.onclick = () => { rack = []; render(); };
      m.app.querySelectorAll('[data-add]').forEach(b => {
        b.onclick = () => {
          const c = b.dataset.add;
          if (rack.length >= 14) { msg.textContent = 'That\'s 14 tiles, the most a hand can have.'; return; }
          if (count(c) >= MAXN(c)) { msg.textContent = `There are only ${MAXN(c)} ${tileName(c)} tiles in a set.`; return; }
          rack.push(c); render();
        };
      });
      m.app.querySelectorAll('[data-del]').forEach(b => {
        b.onclick = () => { const i = rack.indexOf(b.dataset.del); if (i >= 0) rack.splice(i, 1); render(); };
      });
      const go = m.app.querySelector('#go');
      if (go) go.onclick = () => { analyze(); };
    }

    function analyze() {
      const ranked = CS.rankAll(rack);
      // best per category
      const byCat = CS.CATS.map(c => {
        const rs = ranked.filter(r => r.line.cat === c.id);
        return { cat: c, best: rs[0], score: rs[0] ? rs[0].matched : 0 };
      }).sort((a, b) => b.score - a.score || (b.best ? b.best.naturals : 0) - (a.best ? a.best.naturals : 0));
      const top = ranked.slice(0, 3);
      const used = CS.usedMap(ranked.slice(0, 2));
      const u = Object.assign({}, used), spare = [];
      CS.sortRack(rack).forEach(c => { if ((u[c] || 0) > 0) u[c]--; else if (c !== 'J') spare.push(c); });

      // simple theme facts
      const nums = rack.filter(c => /^[bcd]/.test(c)).map(c => +c[1]);
      const ev = nums.filter(n => n % 2 === 0).length, od = nums.length - ev;
      const t369 = nums.filter(n => n % 3 === 0).length;
      const winds = rack.filter(c => 'NEWS'.includes(c) && c.length === 1).length;
      const drag = rack.filter(c => c[0] === 'D').length;
      const jok = rack.filter(c => c === 'J').length, flw = rack.filter(c => c === 'F').length;
      const pairs = [...new Set(rack)].filter(c => c !== 'J' && rack.filter(x => x === c).length >= 2).length;
      const bySuit = ['b', 'c', 'd'].map(s => rack.filter(c => c[0] === s).length);
      const facts = [
        `${ev} even and ${od} odd number ${ev + od === 1 ? 'tile' : 'tiles'}`,
        t369 ? `${t369} ${t369 === 1 ? 'tile that is' : 'tiles that are'} 3, 6 or 9` : null,
        winds ? `${winds} ${winds === 1 ? 'wind' : 'winds'}` : null,
        drag ? `${drag} ${drag === 1 ? 'dragon' : 'dragons'}` : null,
        flw ? `${flw} ${flw === 1 ? 'flower' : 'flowers'}` : null,
        jok ? `${jok} ${jok === 1 ? 'joker' : 'jokers'}` : 'no jokers',
        `${pairs} real ${pairs === 1 ? 'pair' : 'pairs'}`,
        `Bams ${bySuit[0]}, Craks ${bySuit[1]}, Dots ${bySuit[2]}`
      ].filter(Boolean);

      const best = byCat[0];
      const second = byCat[1];
      const verdict = best.score >= 8 ? 'You\'re in great shape.' : best.score >= 6 ? 'You have a solid start.' : best.score >= 5 ? 'A typical start. Keep two or three options open.' : 'A messy rack. Keep jokers and pairs, and let the Charleston help.';
      const maxS = Math.max(1, best.score);
      const res = m.app.querySelector('#result');
      res.innerHTML = `<section class="sec resultsec">
        <h3>Look at <span class="hl">${best.cat.name}</span>${second && second.score >= best.score - 1 ? ` and <span class="hl">${second.cat.name}</span>` : ''}</h3>
        <p>${verdict} Your best hand has <b>${best.score}</b> of your tiles already.</p>
        <p class="small">What I see: ${facts.join(' · ')}.</p>
      </section>
      <section class="sec"><h3>Categories, best to worst</h3>
        <div class="catbars">${byCat.map((c, i) => `<div class="catbar${i < 2 ? ' top' : ''}"><span class="cbname">${c.cat.name}</span><span class="cbtrack"><i style="width:${c.score / 14 * 100}%"></i></span><b>${c.score}</b></div>`).join('')}</div>
        <p class="small">Each bar shows how many of your tiles fit the best hand in that category (out of 14).</p></section>
      <section class="sec"><h3>Your 3 closest hands</h3>
        ${top.map(r => `<div class="topcard">${CS.lineHtml(r.line, `<span class="pl-cat">${CS.CATS.find(c => c.id === r.line.cat).name}</span>`)}${CS.buildHtml(r, 26)}<p class="small">${r.matched} fit, ${r.away} to go: ${r.missJ} ${r.missJ === 1 ? 'spot' : 'spots'} a joker could fill and ${r.missNat} that ${r.missNat === 1 ? 'needs' : 'need'} a real tile.${r.line.xc === 'C' ? ' Concealed: no calling until the winning tile.' : ''}</p></div>`).join('')}
        <p class="small">Solid tiles are ones you have, underlined ones are jokers, faded ones are still missing.</p></section>
      <section class="sec"><h3>Tiles to think about passing</h3>
        ${spare.length ? `<div class="prack">${spare.map(c => `<span class="rt">${renderTile(c, 34)}</span>`).join('')}</div><p class="small">These don't fit your top two hands. In the Charleston, pass from these first. Never pass jokers.</p>` : '<p>Every tile fits one of your top two hands. Nice.</p>'}
      </section>
      <div class="stack"><a class="btn ghost wide" href="#/finder">Practice reading the card (Step 2)</a></div>`;
      res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    render();
  }
  window.HelperSchool = { show };
})();
