/* Drills for Mahjong School.
   A question is either
     { type:'choice', prompt, options:[html], answer:index, explain }
     { type:'order',  prompt, items:[text], answer:[text in order], explain }
   Prompts and options can contain [[tile codes]]. */

const rand = n => Math.floor(Math.random() * n);
const pick = a => a[rand(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const SUITED = ALL_KINDS.filter(c => /^[bcd]/.test(c));
const randSuited = () => pick(SUITED);

function fromBank(item) {
  const opts = shuffle([item.a].concat(item.w));
  return { type: 'choice', prompt: `<p class="q">${item.q}</p>`, options: opts, answer: opts.indexOf(item.a), explain: item.e };
}
function bankQs(bank, n) { return shuffle(bank).slice(0, n || bank.length).map(fromBank); }

function choice(prompt, correct, wrongs, explain) {
  const opts = shuffle([correct].concat(wrongs));
  return { type: 'choice', prompt, options: opts, answer: opts.indexOf(correct), explain };
}

function uniqueNums(correct, candidates, n) {
  const out = [];
  shuffle(candidates).forEach(c => { if (c !== correct && c > 0 && out.indexOf(c) < 0 && out.length < n) out.push(c); });
  return out;
}

/* ================= 1. Tiles ================= */
function tileExplain(code) {
  const p = parseTile(code), name = tileName(code);
  if (code === 'b1') return `That's the 1 Bam. The bird is a numbered tile, not a flower.`;
  if (p.kind === 'suit') return `That's the ${name}. ${p.suit === 'bam' ? 'Bams show bamboo sticks. Count them or check the corner number.' : p.suit === 'crak' ? 'Craks show a Chinese number over the red 萬. The corner number tells you which.' : 'Dots show circles. Count them or check the corner number.'}`;
  if (code === 'DW') return `White Dragon, better known as soap. It goes with Dots and can stand in for zero.`;
  if (p.kind === 'dragon') return `${name} (${p.which === 'red' ? '中' : '發'}). It goes with ${p.which === 'red' ? 'Craks' : 'Bams'}.`;
  if (p.kind === 'wind') return `That's ${name}, one of the four winds. Check the letter in the corner.`;
  if (p.kind === 'flower') return `A flower. All eight flowers count as the same tile.`;
  return `A joker. Wild, but only in groups of three or more.`;
}

function genTileId() {
  const code = pick(ALL_KINDS);
  const p = parseTile(code), name = tileName(code);
  let pool = [];
  if (p.kind === 'suit') {
    const others = ['b', 'c', 'd'].filter(s => SUIT_LETTER[s] !== p.suit);
    others.forEach(s => pool.push(tileName(s + p.n)));
    if (p.n > 1) pool.push(tileName(code[0] + (p.n - 1)));
    if (p.n < 9) pool.push(tileName(code[0] + (p.n + 1)));
    if (code === 'b1') pool.push('Flower');
  } else {
    pool = ['North', 'East', 'West', 'South', 'Red Dragon', 'Green Dragon', 'White Dragon (Soap)', 'Flower', 'Joker'];
  }
  const wrong = shuffle(pool.filter(x => x !== name)).slice(0, 3);
  return choice(`<p class="q">What is this tile?</p>[[${code}|80]]`, name, wrong, tileExplain(code));
}

/* ================= 2. Dragons ================= */
const DRAGON_OF = { bam: 'DG', crak: 'DR', dot: 'DW' };
const DRAGON_BANK = [
  { q: 'When the card prints a 0, which tile do you use?', a: 'Soap (White Dragon)', w: ['Any joker', 'A flower', 'The 1 Dot'], e: 'Soap plays the zero, often in year lines.' },
  { q: 'When soap is used as a zero, what suit is it?', a: 'No suit at all', w: ['Dots', 'Whatever suit is next to it', 'Bams'], e: 'As a zero, soap is suitless. It also can\'t start a run.' },
  { q: 'What do players call the White Dragon?', a: 'Soap', w: ['Ghost', 'Blank', 'Snow'], e: 'The white dragon is nicknamed soap.' }
];
function genDragon() {
  const r = Math.random();
  if (r < 0.45) {
    const s = pick(['b', 'c', 'd']), n = 1 + rand(9), suit = SUIT_LETTER[s];
    const opts = ['DR', 'DG', 'DW'];
    const correct = DRAGON_OF[suit];
    const html = c => `[[${c}|30]] ${tileName(c)}`;
    const q = { type: 'choice', prompt: `<p class="q">Which dragon goes with this suit?</p>[[${s + n}|72]]`,
      options: opts.map(html), answer: opts.indexOf(correct),
      explain: `${SUIT_NAME[suit]}s pair with the ${tileName(correct)}.` };
    return q;
  }
  if (r < 0.85) {
    const d = pick(['DR', 'DG', 'DW']);
    const suits = ['Bams', 'Craks', 'Dots'];
    const correct = d === 'DG' ? 'Bams' : d === 'DR' ? 'Craks' : 'Dots';
    return { type: 'choice', prompt: `<p class="q">This dragon goes with which suit?</p>[[${d}|72]]`,
      options: suits, answer: suits.indexOf(correct), explain: `The ${tileName(d)} goes with ${correct}.` };
  }
  return fromBank(pick(DRAGON_BANK));
}

/* ================= 3. Groups ================= */
const GROUP_CASES = [
  () => { const t = randSuited(); return { tiles: [t, t, 'J'], legal: true, e: 'A pung can use jokers. Two real tiles and one joker is fine.' }; },
  () => { const t = randSuited(); return { tiles: [t, t, 'J', 'J'], legal: true, e: 'A kong can use jokers, even two of them.' }; },
  () => { const t = randSuited(); return { tiles: [t, t, t, t, 'J'], legal: true, e: 'Only four real copies exist, so a quint of a number always needs a joker.' }; },
  () => { const t = randSuited(); return { tiles: [t, 'J'], legal: false, e: 'A pair can never use a joker.' }; },
  () => ({ tiles: ['F', 'J'], legal: false, e: 'A flower pair needs two real flowers. Pairs never take jokers.' }),
  () => ({ tiles: ['F', 'F', 'F', 'J'], legal: true, e: 'A flower kong is a group of four, so a joker is allowed.' }),
  () => { const s = shuffle(['N', 'E', 'W', 'S']); const i = rand(4); const order = ['N', 'E', 'W', 'S'].map((w, k) => k === i ? 'J' : w); return { tiles: order, legal: false, e: 'NEWS is four separate singles. Jokers can\'t be singles.' }; },
  () => { const s = pick(['b', 'c', 'd']), k = 1 + rand(7); return { tiles: [s + k, s + (k + 1), s + (k + 2)], legal: false, e: 'There are no runs in American mahjong. You can\'t build or call a group like this.' }; },
  () => { const w = pick(['N', 'E', 'W', 'S', 'DR', 'DG', 'DW']); return { tiles: [w, w, w, 'J'], legal: true, e: 'Winds and dragons make kongs too, and kongs take jokers.' }; },
  () => ({ tiles: ['F', 'F', 'F', 'F', 'F'], legal: true, e: 'Flowers are the exception to the four-copy limit. There are eight of them, so five real flowers works.' })
];
const GROUP_NAMES = { 3: 'Pung', 4: 'Kong', 5: 'Quint', 6: 'Sextet' };
function genGroup() {
  if (Math.random() < 0.7) {
    const c = pick(GROUP_CASES)();
    const opts = ['Yes, legal', 'No, not legal'];
    return { type: 'choice', prompt: `<p class="q">Is this a legal group?</p>[[${c.tiles.join(' ')}|48]]`, options: opts, answer: c.legal ? 0 : 1, explain: c.e };
  }
  const size = 3 + rand(4), t = pick(SUITED.concat(['N', 'E', 'DR']));
  const tiles = [];
  for (let i = 0; i < size; i++) tiles.push(i < 4 ? t : 'J');
  if (size <= 4 && Math.random() < 0.5) tiles[size - 1] = 'J';
  const opts = ['Pung', 'Kong', 'Quint', 'Sextet'];
  return { type: 'choice', prompt: `<p class="q">What is this group called?</p>[[${tiles.join(' ')}|${size > 4 ? 40 : 48}]]`,
    options: opts, answer: opts.indexOf(GROUP_NAMES[size]),
    explain: `${size} identical tiles is a ${GROUP_NAMES[size].toLowerCase()}. Pung 3, kong 4, quint 5, sextet 6.` };
}

/* ================= 4. Card reading ================= */
const LINES = [
  [{ k: 'F', n: 2 }, { num: 2, n: 3, c: 0 }, { num: 4, n: 4, c: 1 }, { num: 6, n: 5, c: 2 }],
  [{ k: 'NEWS' }, { num: 3, n: 4, c: 0 }, { num: 5, n: 2, c: 0 }, { num: 7, n: 4, c: 0 }],
  [{ k: 'F', n: 4 }, { num: 1, n: 4, c: 0 }, { num: 2, n: 2, c: 1 }, { num: 3, n: 4, c: 0 }],
  [{ k: 'F', n: 2 }, { num: 9, n: 4, c: 0 }, { num: 8, n: 4, c: 1 }, { num: 9, n: 4, c: 2 }],
  [{ num: 1, n: 3, c: 0 }, { num: 1, n: 4, c: 1 }, { num: 5, n: 3, c: 0 }, { num: 5, n: 4, c: 1 }]
];
const LINE_COLOR_CLASS = ['ln-a', 'ln-b', 'ln-c'];
const LINE_COLOR_NAME = ['blue', 'red', 'green'];

function lineHtml(line, xc) {
  return '<div class="cardline">' + line.map(g => {
    if (g.k === 'F') return `<span class="ln-n">${'F'.repeat(g.n)}</span>`;
    if (g.k === 'NEWS') return `<span class="ln-n">NEWS</span>`;
    return `<span class="${LINE_COLOR_CLASS[g.c]}">${String(g.num).repeat(g.n)}</span>`;
  }).join(' ') + ` <span class="ln-tag">${xc}</span></div>`;
}

function genCardRack() {
  const line = pick(LINES);
  const colors = [...new Set(line.filter(g => g.num).map(g => g.c))];
  let suits = shuffle(['b', 'c', 'd']);
  const variants = ['ok', 'ok', 'suits', 'count'];
  if (line.some(g => g.k === 'F' && g.n === 2 || g.k === 'NEWS' || (g.num && g.n === 2))) variants.push('pair');
  const v = pick(variants);
  const groupSuit = line.map(g => g.num ? suits[g.c] : null);

  if (v === 'suits') {
    if (colors.length >= 2) {
      // give two different colors the same suit
      const [c1, c2] = shuffle(colors).slice(0, 2);
      line.forEach((g, i) => { if (g.num && g.c === c2) groupSuit[i] = suits[c1]; });
    } else {
      // one color, but one group in a different suit
      const idx = shuffle(line.map((g, i) => g.num ? i : -1).filter(i => i >= 0))[0];
      groupSuit[idx] = suits.find(s => s !== groupSuit[idx]);
    }
  }

  const groups = line.map((g, i) => {
    if (g.k === 'F') return Array(g.n).fill('F');
    if (g.k === 'NEWS') return ['N', 'E', 'W', 'S'];
    const tiles = [];
    for (let k = 0; k < g.n; k++) tiles.push(k < 4 ? groupSuit[i] + g.num : 'J');
    if (g.n >= 3 && g.n <= 4 && Math.random() < 0.4) tiles[g.n - 1] = 'J';
    return tiles;
  });

  if (v === 'pair') {
    const idx = shuffle(line.map((g, i) => (g.k === 'F' && g.n === 2) || g.k === 'NEWS' || (g.num && g.n === 2) ? i : -1).filter(i => i >= 0))[0];
    groups[idx][rand(groups[idx].length)] = 'J';
  }
  if (v === 'count') {
    // add one extra tile to a group of 3 or more, so the only problem is the count (15 tiles)
    const idx = shuffle(line.map((g, i) => g.k === 'F' || (g.num && g.n >= 3) ? i : -1).filter(i => i >= 0))[0];
    const g = groups[idx];
    const naturals = g.filter(t => t !== 'J').length;
    g.unshift(g[0] === 'F' || naturals < 4 ? g[0] : 'J');
  }

  const total = groups.reduce((a, g) => a + g.length, 0);
  const mapText = colors.map(c => `${LINE_COLOR_NAME[c]} = ${SUIT_NAME[SUIT_LETTER[suits[c]]]}s`).join(', ');
  const opts = ['Yes, it matches', 'No, a joker is in a pair or single', 'No, the suits don\'t follow the colors', 'No, wrong number of tiles'];
  const ans = { ok: 0, pair: 1, suits: 2, count: 3 }[v];
  const explain = {
    ok: `It matches. Same color, same suit; different colors, different suits. Jokers only sit in groups of 3 or more. 14 tiles.`,
    pair: `A joker is filling a pair or a single. Jokers only go in groups of three or more.`,
    suits: colors.length >= 2 ? `Two different colors were built in the same suit. Different colors must be different suits.` : `Everything in this line is one color, so every number group must be in the same suit.`,
    count: `This rack has ${total} tiles. A winning hand is always exactly 14.`
  }[v];
  return {
    type: 'choice',
    prompt: `<p class="q">Does this rack match the line?</p>${lineHtml(line, 'X')}<div class="rack">${groups.map(g => `[[${g.join(' ')}|24]]`).join('')}</div>`,
    options: opts, answer: ans, explain: explain + (v === 'ok' ? ` Here ${mapText}.` : '')
  };
}

const CARD_BANK = [
  { q: 'A line on the card is marked X. What does that mean?', a: 'You can call discards and expose groups', w: ['It must stay concealed', 'It pays double', 'Jokers are not allowed'], e: 'X means exposures are allowed. C means concealed.' },
  { q: 'A line is marked C. Can you call a discard to expose a pung for it?', a: 'No, only to win the whole hand', w: ['Yes, any time', 'Yes, but only once', 'Only with a joker'], e: 'A C hand stays hidden. You can only call the tile that completes it.' },
  { q: 'A line uses three different colors. What does that tell you?', a: 'Three different suits', w: ['Bams, Craks and Dots in that exact order', 'Any suits, even repeats', 'Three dragons'], e: 'Different colors means different suits, but the color doesn\'t lock to a specific suit.' },
  { q: 'A note in parentheses says "only." Does that ban jokers?', a: 'No, joker rules depend on group size', w: ['Yes, always', 'Only in pairs', 'Only on C hands'], e: '"Only" doesn\'t ban jokers. Group size and any direct rule decide that.' },
  { q: 'What is the number printed at the end of a line?', a: 'What the hand pays', w: ['How many jokers you may use', 'The line number', 'How many turns you have'], e: 'That\'s the value, used for payments.' },
  { q: 'How many tiles does every winning hand have?', a: '14', w: ['13', '15', '16'], e: 'Always exactly 14.' }
];

/* ================= 5. Setup ================= */
const SETUP_BANK = [
  { q: 'How many tiles do you play American mahjong with?', a: '152', w: ['144', '136', '160'], e: '108 suit tiles, 16 winds, 12 dragons, 8 flowers and 8 jokers.' },
  { q: 'How big is each wall?', a: '19 stacks, two high', w: ['18 stacks, two high', '17 stacks, two high', '20 stacks, two high'], e: '19 stacks of two is 38 tiles per wall.' },
  { q: 'After the deal, how many tiles does East have?', a: '14', w: ['13', '12', '15'], e: 'East has 14 and discards first without drawing.' },
  { q: 'After the deal, how many tiles do the other players have?', a: '13', w: ['14', '12', '16'], e: 'Everyone but East has 13.' },
  { q: 'Which way do turns go?', a: 'To the right (counterclockwise)', w: ['To the left (clockwise)', 'Across first', 'Whoever is ready'], e: 'Turns move to the right.' },
  { q: 'When a wall runs out, which wall is used next?', a: 'The next wall to the left', w: ['The next wall to the right', 'The wall across', 'East\'s wall again'], e: 'Walls are served clockwise, to the left, the opposite of turn order.' },
  { q: 'Who rolls the dice to break the wall?', a: 'East', w: ['The youngest player', 'The player to East\'s right', 'Whoever built the last wall'], e: 'East rolls and counts stacks from the right end of East\'s own wall.' },
  { q: 'During the deal, how many tiles do you take at a time?', a: 'Four, for three rounds', w: ['Three, for four rounds', 'Two, for six rounds', 'One at a time'], e: 'Four at a time, three times around, for 12 each. Then East takes two and the others take one.' },
  { q: 'What happens to the section to the right of the break?', a: 'It\'s used last, and it\'s still live', w: ['It\'s a dead wall, never used', 'It goes back in the box', 'It\'s dealt first'], e: 'It\'s the final live part of the wall. There\'s no dead wall in American play.' }
];

/* ================= 6. Charleston ================= */
const CHAR_BANK = [
  { q: 'Can you ever pass a joker?', a: 'Never, not even in the courtesy pass', w: ['Only in the second Charleston', 'Only blind', 'Yes, if both players agree'], e: 'Jokers are never passed.' },
  { q: 'Is the second Charleston required?', a: 'No, everyone has to agree to it', w: ['Yes, always', 'Only if East wants it', 'Only in tournaments'], e: 'It\'s optional and any one player can stop it before it starts.' },
  { q: 'Someone stops the second Charleston. What about the courtesy pass?', a: 'It still happens', w: ['It\'s cancelled too', 'Only East can do it', 'It becomes required'], e: 'Stopping the second Charleston doesn\'t cancel the courtesy pass.' },
  { q: 'Courtesy pass: you want to trade 3, your partner across wants 1. How many do you trade?', a: '1', w: ['3', '2', '0'], e: 'The smaller number wins.' },
  { q: 'On which passes is blind passing allowed?', a: 'First Left and second Right', w: ['Any pass', 'Only the courtesy pass', 'First Right and second Left'], e: 'Those are the last pass of each Charleston.' },
  { q: 'How many tiles go in each Charleston pass?', a: '3', w: ['2', '4', 'Any number'], e: 'Three tiles each pass. The courtesy pass is the only one that\'s 0 to 3.' },
  { q: 'The second Charleston has started. Can you stop halfway?', a: 'No, once it starts you finish it', w: ['Yes, any time', 'Only East can stop it', 'Yes, after the across pass'], e: 'Once begun, it has to be completed.' },
  { q: 'Should you look at incoming tiles before passing your own?', a: 'No, pass first, then look', w: ['Yes, always look first', 'Only on the first pass', 'Only on the across pass'], e: 'You pick your tiles before seeing what\'s coming.' }
];
const ORDER_QS = [
  { type: 'order', prompt: '<p class="q">Tap the <b>first Charleston</b> passes in order.</p>', items: ['Right', 'Across', 'Left'], answer: ['Right', 'Across', 'Left'], explain: 'First Charleston: Right, Across, Left.' },
  { type: 'order', prompt: '<p class="q">Tap the <b>second Charleston</b> passes in order.</p>', items: ['Right', 'Across', 'Left'], answer: ['Left', 'Across', 'Right'], explain: 'Second Charleston is the mirror: Left, Across, Right. Then the optional courtesy pass across.' }
];

/* ================= 7. Turn counting ================= */
function genTurn() {
  const nExp = rand(3);
  const exposures = [];
  let used = [];
  for (let i = 0; i < nExp; i++) {
    let t; do t = pick(SUITED.concat(['N', 'E', 'W', 'S', 'DR', 'DG'])); while (used.includes(t));
    used.push(t);
    const size = 3 + rand(2);
    const g = Array(size).fill(t);
    if (Math.random() < 0.4) g[size - 1] = 'J';
    exposures.push(g);
  }
  const exposed = exposures.reduce((a, g) => a + g.length, 0);
  const kind = pick(['hidden-after-draw', 'total-after-draw', 'hidden-after-discard', 'total-after-discard']);
  let q, ans;
  if (kind === 'hidden-after-draw') { q = 'You just drew. How many tiles are <b>hidden</b> on your rack?'; ans = 14 - exposed; }
  else if (kind === 'total-after-draw') { q = 'You just drew. How many tiles do you have <b>in total</b>, hidden plus exposed?'; ans = 14; }
  else if (kind === 'hidden-after-discard') { q = 'You just discarded. How many tiles are <b>hidden</b> on your rack?'; ans = 13 - exposed; }
  else { q = 'You just discarded. How many tiles do you have <b>in total</b>?'; ans = 13; }
  const expHtml = nExp ? `<p class="small">Your exposures:</p><div class="rack">${exposures.map(g => `[[${g.join(' ')}|30]]`).join('')}</div>` : `<p class="small">You have nothing exposed.</p>`;
  const wrong = uniqueNums(ans, [ans - 1, ans + 1, ans - 2, ans + 2, 13, 14, 12, 15], 3);
  return choice(`${expHtml}<p class="q">${q}</p>`, String(ans), wrong.map(String),
    `You hold 13 between turns and 14 right after getting a tile. Exposed tiles count: ${exposed} exposed, so ${kind.indexOf('total') >= 0 ? 'the total is ' + ans : (kind.indexOf('draw') >= 0 ? 14 : 13) + ' minus ' + exposed + ' = ' + ans + ' hidden'}.`);
}
const TURN_BANK = [
  { q: 'You expose a kong. Do you get a replacement tile?', a: 'No, kongs don\'t give a replacement draw', w: ['Yes, from the end of the wall', 'Yes, from the discards', 'Only for a kong of dragons'], e: 'American kongs never trigger a replacement draw.' },
  { q: 'Who discards first after the Charleston?', a: 'East, without drawing', w: ['East, after drawing', 'The player to East\'s right', 'Whoever has the most jokers'], e: 'East already has 14, so East just discards.' },
  { q: 'Someone across from you calls a discard. Who plays next?', a: 'The player to the caller\'s right', w: ['The player who was next before the call', 'The discarder', 'You, always'], e: 'Play continues from the caller. Skipped players don\'t get a make-up turn.' },
  { q: 'When does a discard count as made?', a: 'When it\'s named or touches the table', w: ['When the next player draws', 'Only when it\'s named', 'When you let go of it over your rack'], e: 'Whichever happens first, naming it or it touching the table.' }
];

/* ================= 8. Calls ================= */
const CALLS_BANK = [
  { q: 'The latest discard is a 5 Bam. You hold one 5 Bam and a joker, and your X line needs a pung of 5 Bams. Can you call?', a: 'Yes, expose 5 Bam, 5 Bam, joker', w: ['No, you need two real 5 Bams', 'No, pungs can\'t be called', 'Yes, but you also draw'], e: 'The called tile plus your tile and joker make a complete pung.' },
  { q: 'An 8 Dot would give you a pair, but your hand still has empty spots. Can you call it?', a: 'No', w: ['Yes, pairs can always be called', 'Yes, with a joker', 'Only on an X hand'], e: 'You can only call for a pair or single if it finishes your whole hand.' },
  { q: 'You\'re one tile from finishing a C hand, and that tile was just discarded. Can you call it?', a: 'Yes, call Mah Jongg', w: ['No, C hands can never call', 'Only if it\'s a joker', 'Only on your own turn'], e: 'Any hand, even a concealed one, can call the tile that wins it.' },
  { q: 'You want a discard for a pung in your C hand, but it won\'t win yet. Can you call it?', a: 'No', w: ['Yes', 'Yes, if you keep it hidden', 'Only with a joker'], e: 'C hands can\'t make exposures.' },
  { q: 'Someone discards a joker and it would win your hand. Can you take it?', a: 'No, a discarded joker can\'t be called', w: ['Yes, to win only', 'Yes, any time', 'Only if you\'re next in turn'], e: 'Discarded jokers are dead to everyone.' },
  { q: 'The tile you want was discarded two turns ago. Can you take it now?', a: 'No, only the latest discard', w: ['Yes, if no one else wanted it', 'Yes, on your turn', 'Only to win'], e: 'Only the most recent discard is ever available.' },
  { q: 'You hold one matching tile and want to take the discard to finish the pung later. Allowed?', a: 'No, the group must be complete right away', w: ['Yes', 'Yes, if you add it to your rack', 'Only for kongs'], e: 'A call has to finish a group of 3 or more on the spot.' },
  { q: 'To call a tile for a kong, how many supporting tiles must already be on your rack?', a: '3', w: ['2', '4', '1'], e: 'The called tile makes the fourth.' },
  { q: 'After you call and expose, do you also draw from the wall?', a: 'No, you expose and then discard', w: ['Yes, then discard', 'Yes, but only for a kong', 'Only if you have a joker'], e: 'The called tile replaces your draw.' },
  { q: 'Can an exposure be made of only jokers?', a: 'No, the called tile is always in it', w: ['Yes', 'Only a pung', 'Only on a C hand'], e: 'You called a real tile, so the exposure always includes it.' },
  { q: 'You exposed a pung and already discarded. Next turn you draw the fourth tile. Can you add it?', a: 'No, the size is locked', w: ['Yes, it becomes a kong', 'Yes, and you draw a replacement', 'Only if it\'s a dragon'], e: 'Once you discard, an exposure\'s size is fixed.' }
];

/* ================= 9. Timing ================= */
const TIMING_BANK = [
  { q: 'When does the window to call a discard open?', a: 'When it\'s named or touches the table', w: ['When the next player draws', 'After a three-second pause', 'When the discarder lets go'], e: 'Whichever comes first.' },
  { q: 'The next player has lifted a wall tile but hasn\'t racked it. Can you still call?', a: 'Yes, the window is still open', w: ['No, it closed', 'Only for Mah Jongg', 'Only if they agree'], e: 'Lifting or looking at the tile doesn\'t close the window.' },
  { q: 'The next player drew and racked the tile. Can you still call?', a: 'No, the window closed', w: ['Yes, for a pung', 'Yes, until they discard', 'Only if you say wait'], e: 'Drawing and racking ends the chance to call.' },
  { q: 'One player calls for a pung, another for Mah Jongg. Who gets the tile?', a: 'The Mah Jongg call', w: ['Whoever spoke first', 'The one next in turn', 'The pung call'], e: 'Mah Jongg beats an exposure.' },
  { q: 'Two players both call to expose, no Mah Jongg. Who usually gets it?', a: 'The one next in turn after the discarder', w: ['Whoever spoke louder', 'The one with fewer exposures', 'East'], e: 'Turn order breaks the tie, unless someone already started exposing.' },
  { q: 'Does saying "wait" reserve the tile for you?', a: 'No, you need to actually call it', w: ['Yes, for five seconds', 'Yes, until your turn', 'Only for Mah Jongg'], e: '"Wait" is just a courtesy request.' },
  { q: 'Someone calls in time after the next player already picked up a wall tile. What happens to that tile?', a: 'It goes back where it came from', w: ['The next player keeps it', 'It\'s discarded', 'It goes to the caller'], e: 'The uncommitted draw returns to its spot in the wall.' },
  { q: 'You just exposed a called group and haven\'t discarded yet. Can you adjust it?', a: 'Yes, if it keeps the called tile and stays legal', w: ['No, never', 'Yes, any way you like', 'Only by adding jokers from others'], e: 'You can adjust until you discard or start a joker swap.' }
];

/* ================= 10. Jokers ================= */
function genSwap() {
  const pool = SUITED.concat(['N', 'E', 'W', 'S', 'DR', 'DG', 'DW']);
  const a = pick(pool); let b; do b = pick(pool); while (b === a);
  const bHasJoker = Math.random() < 0.5;
  const expA = Math.random() < 0.5 ? [a, a, 'J'] : [a, a, 'J', 'J'];
  const expB = bHasJoker ? [b, b, b, 'J'] : [b, b, b];
  const correct = bHasJoker && Math.random() < 0.5 ? b : a;
  const notIn = [a, b];
  const distract = [];
  if (!bHasJoker) distract.push(b);
  while (distract.length < 3) { const t = pick(pool); if (!notIn.includes(t) && !distract.includes(t)) distract.push(t); }
  const opts = shuffle([correct].concat(distract));
  const ownerGroup = correct === a ? expA : expB;
  let explain = `Your ${tileName(correct)} matches the group [[${ownerGroup.join(' ')}|22]]. Hand it to the owner and take a joker.`;
  if (!bHasJoker && opts.includes(b)) explain += ` The ${tileName(b)} group has no joker in it, so there's nothing to take.`;
  return {
    type: 'choice', grid: true,
    prompt: `<p class="small">Opponents' exposures:</p><div class="rack">[[${expA.join(' ')}|30]][[${expB.join(' ')}|30]]</div><p class="q">It's your turn and you've drawn. Which of your tiles can you trade for a joker?</p>`,
    options: opts.map(c => `[[${c}|40]]<span class="optlabel">${tileName(c)}</span>`), answer: opts.indexOf(correct), explain
  };
}
const JOKER_BANK = [
  { q: 'Can a joker fill a pair?', a: 'No', w: ['Yes', 'Only a flower pair', 'Only on an X hand'], e: 'Jokers only go in groups of 3 or more.' },
  { q: 'Can you swap for a joker before drawing on your turn?', a: 'No, draw or call first', w: ['Yes, any time on your turn', 'Yes, during anyone\'s turn', 'Only before the Charleston'], e: 'Get your tile first, then swap.' },
  { q: 'When you swap, who gets your real tile?', a: 'The owner of the exposure', w: ['It goes to the discards', 'You keep it', 'The next player'], e: 'Hand it to whoever owns that exposed group.' },
  { q: 'Can you swap a joker out of your own exposure?', a: 'Yes', w: ['No, only from others', 'Only on a C hand', 'Only once per game'], e: 'Your own exposures or anyone else\'s.' },
  { q: 'After a joker swap, how does your tile count change?', a: 'It stays the same', w: ['Up by one', 'Down by one', 'Up by two'], e: 'You gave one tile and got one back.' },
  { q: 'Can you call a discard just so you can swap it for a joker?', a: 'No, it has to be a real exposure', w: ['Yes', 'Only on your turn', 'Only if the joker is yours'], e: 'A call must make a legal group for your hand.' },
  { q: 'Can a hidden pung be all jokers?', a: 'Yes', w: ['No, it needs one real tile', 'Only a kong', 'Only for a C hand'], e: 'Hidden joker-eligible groups can be all jokers. Only exposures need the called tile.' },
  { q: 'Can you swap a joker out of someone\'s hidden tiles?', a: 'No, only from exposures', w: ['Yes, if you guess right', 'Yes, on your turn', 'Only after Mah Jongg'], e: 'Swaps only happen with face-up groups.' }
];

/* ================= 11. Payments ================= */
const WIN_TYPES = [
  { id: 'discard', label: 'on a discard', disc: 2, other: 1, total: 4 },
  { id: 'self', label: 'self-drawn', disc: 0, other: 2, total: 6 },
  { id: 'jl-discard', label: 'jokerless, on a discard', disc: 4, other: 2, total: 8 },
  { id: 'jl-self', label: 'jokerless, self-drawn', disc: 0, other: 4, total: 12 }
];
function genPayment() {
  const V = pick([25, 30, 35, 40, 50, 75]);
  const w = pick(WIN_TYPES);
  const asks = ['total', 'other'];
  if (w.disc) asks.push('disc');
  const ask = pick(asks);
  let q, mult;
  if (ask === 'total') { q = 'How much does the winner collect in total?'; mult = w.total; }
  else if (ask === 'disc') { q = 'How much does the discarder pay?'; mult = w.disc; }
  else { q = w.disc ? 'How much does each player who did <b>not</b> discard pay?' : 'How much does each other player pay?'; mult = w.other; }
  const ans = V * mult;
  const wrong = uniqueNums(ans, [1, 2, 3, 4, 6, 8, 12].map(m => m * V), 3);
  const breakdown = w.disc ? `Discarder pays ${w.disc}V = ${w.disc * V}, the other two pay ${w.other}V = ${w.other * V} each, total ${w.total * V}.`
    : `No discarder. All three pay ${w.other}V = ${w.other * V}, total ${w.total * V}.`;
  return choice(`<div class="money">Hand value <b>${V}</b>, won <b>${w.label}</b></div><p class="q">${q}</p>`, String(ans), wrong.map(String), breakdown);
}
const PAY_BANK = [
  { q: 'Does the jokerless double apply to Singles and Pairs hands?', a: 'No', w: ['Yes', 'Only on a self-draw', 'Only with flowers'], e: 'Singles and Pairs hands can\'t use jokers anyway, so they don\'t get the bonus.' },
  { q: 'A player at the table has a dead hand. Do they still pay the winner?', a: 'Yes, dead hands still pay', w: ['No', 'Only half', 'Only on a self-draw'], e: 'Dead hands still pay.' },
  { q: 'You used a joker earlier but swapped it out before winning. Can the win count as jokerless?', a: 'Yes, if the final hand has no jokers', w: ['No', 'Only if self-drawn', 'Only with the table\'s permission'], e: 'What matters is the final hand.' },
  { q: 'The wall runs out with no winner. What is that called?', a: 'A wall game', w: ['A dead game', 'A draw hand', 'A misdeal'], e: 'Nobody wins and nobody pays.' },
  { q: 'After a game is over, where does East move?', a: 'To the right', w: ['To the left', 'Across', 'East stays put'], e: 'East passes to the right after each game.' }
];

/* ================= 12. Errors ================= */
const ERR_BANK = [
  { q: 'You accidentally expose tiles for a C hand. What\'s the likely result?', a: 'Your hand is dead', w: ['Nothing, just hide them again', 'You pay 50', 'You redraw'], e: 'Exposing a concealed hand usually kills it.' },
  { q: 'Once a hand is declared dead, what does that player do?', a: 'Stops playing but still pays the winner', w: ['Keeps playing normally', 'Leaves and pays nothing', 'Draws but can\'t discard'], e: 'No drawing, calling, swapping or discarding. Still pays.' },
  { q: 'What should a dead-hand challenge be based on?', a: 'What everyone can see on the table', w: ['A hunch about hidden tiles', 'How long they\'ve been thinking', 'Their facial expression'], e: 'Only public evidence.' },
  { q: 'In the League style explanation, a disputed challenge turns out wrong. What happens?', a: 'The wrong party pays 50 to the other', w: ['Nothing', 'The hand is replayed', 'The challenger leaves the game'], e: 'That\'s the cited penalty for a disputable challenge.' },
  { q: 'You privately realize your own hand can\'t win. What should you do?', a: 'Keep playing safely until someone calls it dead', w: ['Announce it right away', 'Throw in your tiles', 'Swap with a neighbor'], e: 'Keep playing defensively.' },
  { q: 'You called a tile that was named wrong. Can you take the call back?', a: 'Yes, if you haven\'t committed yet', w: ['Never', 'Only if it was a joker', 'Only on your turn'], e: 'Look before you expose. Before commitment, you can withdraw.' },
  { q: 'Someone discards out of turn and another player wins on it. Who pays?', a: 'The offender can pay four times the value alone', w: ['Everyone pays normally', 'Nobody, the game is replayed', 'The winner pays the offender'], e: 'That\'s a special case ruling, not a general fine.' },
  { q: 'Is it okay to coach another player\'s hidden hand during play?', a: 'No', w: ['Yes, if they\'re new', 'Yes, quietly', 'Only after the Charleston'], e: 'Don\'t coach active hands or announce what someone might be waiting on.' },
  { q: 'At a tournament, there\'s a contested mistake. What should the table do?', a: 'Pause and call the director', w: ['Vote on it', 'Let East decide', 'Fine the player 25'], e: 'Don\'t improvise penalties at an event.' }
];

/* ================= 13-16. Strategy ================= */
const CHOOSE_BANK = [
  { q: 'Line A uses 9 of your tiles but you\'re missing two singles that can\'t be jokers. Line B uses 8 and you have every pair and single. Which is likely stronger?', a: 'Line B', w: ['Line A', 'They\'re equal', 'Neither, start over'], e: 'B\'s missing spots can all take jokers. "More tiles match" is just a starting point.' },
  { q: 'You have three of a tile and your line needs a pair of it. How many of those tiles are useful?', a: '2', w: ['3', '1', '0'], e: 'Count each tile only once, toward the spot it actually fills.' },
  { q: 'Can one joker count toward two different groups in the same line?', a: 'No', w: ['Yes', 'Only in a kong', 'Only for C hands'], e: 'Each joker fills one spot.' },
  { q: 'Early in the game, what should you usually discard first?', a: 'Loose tiles that don\'t help any of your top lines', w: ['Your jokers', 'Pairs you need for two lines', 'Your highest number'], e: 'Keep pairs that serve more than one line.' },
  { q: 'You\'ve worked on a line for six turns. Does that make it more likely to finish?', a: 'No, judge what\'s still missing', w: ['Yes', 'Only if you\'ve exposed', 'Only with jokers'], e: 'Time spent doesn\'t change what\'s left to get.' },
  { q: 'Before picking lines to compare, what should you do with your rack?', a: 'Sort it by suit and number, then honors, flowers and jokers', w: ['Pass your jokers', 'Read the card top to bottom', 'Expose a pung'], e: 'Sorting shows your pairs and repeats.' }
];
const PIVOT_BANK = [
  { q: 'When is calling a discard most attractive?', a: 'When it finishes a hard-to-get group you need', w: ['Any time a tile matches', 'When it locks you into a weak line', 'When you need many rare tiles'], e: 'A call trades flexibility for progress.' },
  { q: 'You exposed a group and want to switch lines. What\'s the first step?', a: 'Cross off lines that can\'t use that exact exposure', w: ['Hide the exposure again', 'Pick the highest-paying line', 'Ask the table'], e: 'Exposures can\'t be undone, so only compatible lines are left.' },
  { q: 'Is it worth exposing a group just to grab a joker if the group fits none of your lines?', a: 'No', w: ['Yes, jokers are always worth it', 'Yes, if it\'s early', 'Only for a kong'], e: 'The swap can\'t rescue a call that wrecked your hand.' },
  { q: 'One line pays more but the tiles you need are mostly gone. Another is easier. Which do you favor?', a: 'The one you can realistically finish', w: ['The higher paying one', 'Whichever has more jokers', 'Neither'], e: 'Achievable beats impressive on paper.' },
  { q: 'Should you wait to call when you\'re not sure what size group you need?', a: 'Yes, waiting keeps your options', w: ['No, call right away', 'Call it as a kong just in case', 'Call it and decide later'], e: 'An exposure\'s size gets locked.' }
];
function genAvailability() {
  const tile = randSuited();
  if (Math.random() < 0.55) {
    let h = rand(3), d = rand(3), e = rand(2);
    while (h + d + e > 4) d--;
    const left = 4 - h - d - e;
    return choice(`<p class="small">You hold ${h}, ${d} ${d === 1 ? 'is' : 'are'} discarded, and ${e} ${e === 1 ? 'is' : 'are'} exposed.</p>[[${tile}|56]]<p class="q">How many real ${tileName(tile)}s could still be hidden or in the wall?</p>`,
      String(left), uniqueNums(left, [0, 1, 2, 3, 4], 3).concat(left === 0 ? [] : []).map(String).slice(0, 3),
      `Start at 4, then subtract ${h} + ${d} + ${e}. That leaves ${left}. It's the most that could be out there, not a promise.`);
  }
  let h = rand(2), d = rand(3), e = rand(3);
  while (h + d + e > 4) e--;
  const left = 4 - h - d - e;
  const possible = h + left >= 2;
  const opts = ['Still possible', 'Impossible'];
  return { type: 'choice', prompt: `<p class="small">You need a <b>real pair</b> of this tile. You hold ${h}. ${d} ${d === 1 ? 'is' : 'are'} discarded and ${e} ${e === 1 ? 'is' : 'are'} exposed.</p>[[${tile}|56]]<p class="q">Can you still make the pair?</p>`,
    options: opts, answer: possible ? 0 : 1,
    explain: possible ? `${left} could still be out there, so it's possible, though not guaranteed.` : `Only ${left} could be left, and jokers can't fill a pair. That line is dead.` };
}
const READ_BANK = [
  { q: 'How many flowers do you start counting from?', a: '8', w: ['4', '6', '12'], e: 'There are eight flowers. Normal tiles start at four.' },
  { q: 'An opponent has nothing exposed. Are your discards safe?', a: 'Not necessarily, concealed hands are just harder to read', w: ['Yes, totally safe', 'Yes, until the wall is half gone', 'Only jokers are unsafe'], e: 'No exposures isn\'t proof of safety.' },
  { q: 'A tile was safe to discard earlier. Is it still safe now?', a: 'Not always, people draw and change plans', w: ['Yes, forever', 'Yes, if you discarded it', 'Only for East'], e: 'Safety changes as the game goes on.' },
  { q: 'Why are pair and single tiles extra dangerous to discard late?', a: 'Jokers can\'t fill them, so someone may need that exact tile', w: ['They\'re worth more', 'They can\'t be called', 'They end the game'], e: 'Real tiles are the bottleneck for pairs and singles.' }
];
const DEFENSE_BANK = [
  { q: 'Late in the game with a weak hand, what\'s your main goal?', a: 'Avoid handing someone else the win', w: ['Go for the highest hand', 'Call everything', 'Pass jokers'], e: 'Defense matters most when you\'re far away and the wall is short.' },
  { q: 'Is discarding a joker you don\'t need a safe defensive move?', a: 'Yes, nobody can call it', w: ['No, it\'s illegal', 'No, it gives someone a win', 'Only on your first turn'], e: 'Just don\'t toss one you actually need.' },
  { q: 'Should you turn down a solid normal win hoping to go jokerless later?', a: 'Usually no', w: ['Yes, always', 'Yes, if it\'s a discard win', 'Only if you\'re East'], e: 'Waiting lets others win or forces risky discards.' },
  { q: 'When reviewing a game, what should you judge?', a: 'Your reasoning with what you knew then', w: ['Only whether you won', 'What the others had', 'How fast you played'], e: 'Lucky wins can come from bad choices.' },
  { q: 'Should you tell the table why you stopped the second Charleston?', a: 'No, keep that to yourself', w: ['Yes, to be fair', 'Only if asked', 'Only if you\'re East'], e: 'It gives away information about your hand.' },
  { q: 'A higher value hand is better when...', a: 'The extra pay makes up for being harder and riskier', w: ['Always', 'It has more jokers', 'It\'s concealed'], e: 'Weigh value against your real chances.' }
];

/* ================= Final quiz (handbook practice scenarios) ================= */
const EXAM_BANK = [
  { q: 'You need a flower pair and hold one flower and a joker. Is the pair done?', a: 'No, you need another real flower', w: ['Yes', 'Yes, on an X hand', 'Only if self-drawn'], e: 'Pairs can\'t use jokers.' },
  { q: 'An 8 Dot discard would make your pair, but other spots are still empty. Call it?', a: 'No', w: ['Yes', 'Yes, with a joker', 'Only if it\'s your turn'], e: 'Pair calls only to finish the whole hand.' },
  { q: 'Your C hand is one tile short and that exact tile is discarded. What do you do?', a: 'Call Mah Jongg', w: ['Let it go, C hands can\'t call', 'Call it for a pair', 'Wait for the wall'], e: 'Any hand can call its winning tile.' },
  { q: 'A discard would complete a kong with two naturals and one joker from your rack. When can you call?', a: 'Only if the kong fits an X line, and you expose all four', w: ['Any time', 'Only on a C hand', 'Never with a joker'], e: 'Expose the discard plus your three supporting tiles.' },
  { q: 'You exposed a pung last turn and now draw its fourth tile. Can you make it a kong?', a: 'No, its size is fixed', w: ['Yes', 'Yes, and draw a replacement', 'Only if it\'s East\'s turn'], e: 'Size locks once you discard.' },
  { q: 'You hold a tile that matches a joker in an exposure, but it\'s not your turn. Can you swap?', a: 'No, wait for your turn and get a tile first', w: ['Yes', 'Yes, if you say wait', 'Only for Mah Jongg'], e: 'Draw or call first, on your turn.' },
  { q: 'The next player lifted a wall tile but hasn\'t committed it. Can the last discard be called?', a: 'Yes', w: ['No', 'Only by the discarder', 'Only for a pung'], e: 'The window is still open.' },
  { q: 'Your line needs a real pair of a tile. Three are showing and you hold none. Possible?', a: 'No, only one could be left', w: ['Yes', 'Yes, with a joker', 'Only if concealed'], e: 'One tile can\'t make a pair, and jokers can\'t help.' },
  { q: 'You\'re far from winning and must discard either a likely winning tile for someone or an unused joker. Which is safer?', a: 'The joker', w: ['The likely winning tile', 'Either one', 'Neither, pass'], e: 'Nobody can call a discarded joker.' },
  { q: 'Two players both claim Mah Jongg on the same discard before anyone exposes. Who gets it?', a: 'The one closest in turn to the discarder\'s right', w: ['Whoever spoke first', 'The higher value hand', 'Split the payment'], e: 'Turn order decides.' }
];

/* ================= Question pools =================
   Every drill draws from families of questions. Each question has a stable `sig`.
   The app remembers what you've seen, so a question only comes back after
   every drill has shown you at least 100 others (see makeTest at the bottom). */

const HON = ['N', 'E', 'W', 'S', 'DR', 'DG', 'DW'];
const GROUPABLE = SUITED.concat(HON);
const SEATS = ['East', 'South', 'West', 'North'];
const seatAt = (s, k) => SEATS[(SEATS.indexOf(s) + k) % 4];
const rightOf = s => seatAt(s, 1), acrossOf = s => seatAt(s, 2), leftOf = s => seatAt(s, 3);
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];
const NUM_WORD = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const plural = (n, w, ws) => n === 1 ? w : (ws || w + 's');
const tn = c => tileName(c).replace(' (Soap)', '');
const tnp = c => { const p = parseTile(c); return p.kind === 'wind' ? tn(c) + ' winds' : tn(c) + 's'; };
const SIZE_NAME = { 1: 'single', 2: 'pair', 3: 'pung', 4: 'kong', 5: 'quint', 6: 'sextet' };

function Q(sig, prompt, correct, wrongs, explain, extra) {
  const seen = new Set([correct]);
  const w = wrongs.filter(x => { if (seen.has(x)) return false; seen.add(x); return true; });
  return Object.assign(choice(prompt, correct, w, explain), { sig }, extra || {});
}
const B = item => Object.assign(fromBank(item), { sig: 'bank:' + item.q });
const bankFam = (name, bank) => ({ name, items: bank.map(B) });
const fam = (name, items) => ({ name, items });
const genFam = (name, gen) => ({ name, gen: () => { const q = gen(); if (!q.sig) q.sig = name + ':' + q.prompt + '|' + q.options[q.answer]; return q; } });
const tilesHtml = (arr, size) => `[[${arr.join(' ')}|${size || 40}]]`;

/* ---------- pictures for questions ---------- */
const SEAT_POS = { East: [110, 196], South: [196, 110], West: [110, 24], North: [24, 110] };
const ROLE_COL = { disc: '#e5484d', mj: '#d4a017', pung: '#2e8b6e', call: '#2e8b6e', you: '#1f5c46', ask: '#3b82f6', partner: '#8a5a1c', empty: '#9aa49c' };
// roles: { East: { t: 'discards', k: 'disc' } }, center: text in the middle of the table
function seatFig(roles, center) {
  roles = roles || {};
  let g = `<rect x="58" y="58" width="104" height="104" rx="14" fill="var(--feltbg, #1f5c46)"/>`;
  if (center) g += `<text x="110" y="110" font-size="12" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">${center}</text>`;
  Object.entries(SEAT_POS).forEach(([n, [x, y]]) => {
    const r = roles[n], col = r ? ROLE_COL[r.k] || '#1f5c46' : null;
    g += `<circle cx="${x}" cy="${y}" r="21" fill="${col || 'var(--surface2, #f3f3f3)'}" stroke="${col || 'var(--line, #ccc)'}" stroke-width="2"/>`;
    g += `<text x="${x}" y="${y}" font-size="10.5" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="${col ? '#fff' : 'var(--ink, #222)'}">${n}</text>`;
    if (r && r.t) {
      const ty = n === 'West' ? y - 31 : y + 31;
      const tx = n === 'South' ? x + 8 : n === 'North' ? x - 8 : x;
      g += `<rect x="${tx - 34}" y="${ty - 9}" width="68" height="18" rx="9" fill="${col}"/>`;
      g += `<text x="${tx}" y="${ty}" font-size="9.5" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#fff">${r.t}</text>`;
    }
  });
  return `<div class="qfig"><svg class="seatfig" viewBox="-26 -26 272 272" role="img" aria-label="Table seats">${g}</svg></div>`;
}
const DIE_P = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function diceFig(a, b) {
  const die = (v, x) => `<rect x="${x}" y="4" width="52" height="52" rx="11" fill="#fffdf7" stroke="#d6ccb3" stroke-width="1.5"/>` +
    DIE_P[v].map(i => `<circle cx="${x + 12 + (i % 3) * 14}" cy="${16 + Math.floor(i / 3) * 14}" r="4.6" fill="${v === 1 || v === 4 ? '#c62828' : '#1b2333'}"/>`).join('');
  return `<div class="qfig"><svg viewBox="0 0 128 60" width="128" height="60" role="img" aria-label="Dice ${a} and ${b}">${die(a, 6)}${die(b, 70)}</svg></div>`;
}
function seqFig(hi, known) {
  const lab = ['1st R', '1st A', '1st L', '2nd L', '2nd A', '2nd R', 'Court.'];
  return `<div class="qfig seqfig">${CH_SEQ.map((d, i) => `<span class="${i === hi ? 'on' : ''}${i < (known || 0) ? ' known' : ''}"><small>${i < 3 ? '1st' : i < 6 ? '2nd' : 'Court.'}</small><b>${i < (known || 0) ? d : i === hi ? '?' : '·'}</b></span>`).join('')}</div>`;
}
function discardFig(t, label) { return `<div class="qfig discfig">[[${t}|54]]<span>${label || 'Latest discard'}</span></div>`; }
function autoFig(prompt) {
  const text = prompt.replace(/<[^>]+>/g, ' ');
  const counting = /how many|fewest|the most|how much/i.test(text);
  if (counting) { const w = text.match(/(\d+) tiles (left|in the wall)/i); return w && /wall/i.test(text) ? wallFig(+w[1]) : ''; }
  const codes = [];
  const add = c => { if (!codes.includes(c) && codes.length < 5) codes.push(c); };
  let m; const re = /\b([1-9]) (Bam|Crak|Dot)s?\b/g;
  while ((m = re.exec(text))) add({ Bam: 'b', Crak: 'c', Dot: 'd' }[m[2]] + m[1]);
  if (/\bNEWS\b/.test(text)) ['N', 'E', 'W', 'S'].forEach(add);
  if (/Red Dragon/i.test(text)) add('DR');
  if (/Green Dragon/i.test(text)) add('DG');
  if (/White Dragon|\bsoap\b/i.test(text)) add('DW');
  if (/\bbird\b/i.test(text)) add('b1');
  if (/\bflowers?\b/i.test(text)) add('F');
  if (/\bjokers?\b/i.test(text)) add('J');
  if (codes.length) return `<div class="qfig">[[${codes.join(' ')}|44]]</div>`;
  // topic pictures when no tile is named
  const wl = text.match(/(\d+) tiles (left|in the wall)/i);
  if (wl && /wall/i.test(text)) return wallFig(+wl[1]);
  if (/\bkong\b/i.test(text)) return `<div class="qfig">[[c8 c8 c8 c8|40]]</div>`;
  if (/\bquint\b/i.test(text)) return `<div class="qfig">[[d3 d3 d3 d3 J|38]]</div>`;
  if (/\bpung\b/i.test(text)) return `<div class="qfig">[[b5 b5 b5|40]]</div>`;
  if (/\bpairs?\b/i.test(text)) return `<div class="qfig">[[d4 d4|40]]</div>`;
  if (/charleston|\bpass(es|ed|ing)?\b/i.test(text)) return passFig();
  if (/\bexpos/i.test(text)) return `<div class="qfig discfig">[[c7 c7 c7|38]]<span>exposed group</span></div>`;
  if (/mah jongg|\bwins?\b|winning|winner/i.test(text)) return `<div class="qfig discfig">[[F F d2 d2 d2 d2 d4 d4 d6 d6 d8 d8 d8 d8|21]]<span>a winning hand: 14 tiles</span></div>`;
  const seatsNamed = ['East', 'South', 'West', 'North'].filter(n => new RegExp('\\b' + n + '\\b').test(text));
  if (seatsNamed.length) { const r = {}; seatsNamed.forEach(n => { r[n] = { k: 'ask' }; }); return seatFig(r); }
  if (/\bwalls?\b/i.test(text)) return wallFig(null);
  if (/discard|\bcall/i.test(text)) return discardFig('d7', 'a discard');
  if (/\bcard\b|\bline\b/i.test(text)) return `<div class="qfig"><div class="cardline mini"><span class="ln-n">FF</span> <span class="ln-a">2222</span> <span class="ln-a">44</span> <span class="ln-a">66</span> <span class="ln-a">8888</span> <span class="ln-tag">X</span></div></div>`;
  return '';
}
function wallFig(left) {
  const n = 38, full = left == null ? n : Math.max(0, Math.round(left / 4));
  let g = '';
  for (let i = 0; i < n; i++) g += `<rect x="${i * 7}" y="0" width="6" height="12" rx="1.5" fill="${i < full ? '#2e8b6e' : 'none'}" stroke="${i < full ? '#14503d' : '#9aa49c'}" stroke-width=".8" ${i < full ? '' : 'stroke-dasharray="2 1.5"'}/>`;
  return `<div class="qfig discfig"><svg viewBox="-1 -1 268 14" width="268" height="14" role="img" aria-label="The wall">${g}</svg><span>${left == null ? 'the wall' : left + ' tiles left in the wall'}</span></div>`;
}
function passFig() {
  return `<div class="qfig passfig">[[X|30]]<span class="parr">➜</span><span class="pseat">Charleston pass</span></div>`;
}

/* ---------- extra hand-written questions ---------- */
SETUP_BANK.push(
  { q: 'Some sets come with blank tiles and extra jokers. What do you do with them?', a: 'Put them back in the box', w: ['Use them as extra jokers', 'Use them as soap', 'Give them to East'], e: 'You play with exactly 152 tiles.' },
  { q: 'How is the first East usually chosen?', a: 'With a dice roll', w: ['The youngest player', 'Whoever sat down first', 'The host'], e: 'A roll of the dice is the usual way.' },
  { q: 'At the end of the deal, East takes two more tiles. Which ones?', a: 'The top tiles of the first and third stacks still there', w: ['The two bottom tiles of the next stack', 'Any two tiles from the far end', 'Two tiles from the player on the right'], e: 'That gives East 14.' },
  { q: 'Inside a wall, which tile is drawn first from a stack?', a: 'The top tile, then the bottom one', w: ['The bottom tile first', 'Either one', 'Both at once'], e: 'Take from the active end, top then bottom.' },
  { q: 'Why is it smart to point at the active end of the wall before the first turn?', a: 'Turns and walls move in opposite directions, so it prevents drawing from the wrong spot', w: ['It decides who is East', 'It lets you count the tiles', 'It\'s required for the Charleston'], e: 'Getting everyone to agree up front avoids the most common setup mistake.' },
  { q: 'How many dice does East roll to break the wall?', a: '2', w: ['1', '3', '4'], e: 'East rolls both dice.' },
  { q: 'Before you start, what should the table agree on out loud?', a: 'Stakes or points, how strict to be, and any house rules', w: ['Nothing, the rules cover everything', 'Only who is East', 'Only who keeps score'], e: 'Settling these first avoids arguments later.' },
  { q: 'Does everyone at the table need the same yearly card?', a: 'Yes', w: ['No, any year works', 'Only East needs one', 'Only for tournaments'], e: 'Everyone plays from the same card.' },
  { q: 'Which of these do you actually need to play?', a: 'Tiles, four racks, two dice, and a card for each player', w: ['Pushers and a table mat', 'A timer', 'A score sheet for each player'], e: 'Pushers and a mat are nice to have, not required.' },
  { q: 'Each player builds their wall where?', a: 'In front of their own rack', w: ['In front of the player across', 'In the middle of the table', 'Next to East'], e: 'Four walls, one in front of each player.' },
  { q: 'After a game ends, where does the East seat move?', a: 'To the player on the right', w: ['To the player on the left', 'Across the table', 'It stays with the winner'], e: 'East passes to the right after each game.' },
  { q: 'After four games, what does the first East (the pivot) do?', a: 'Swaps seats with the player to the right, and a new round starts', w: ['Leaves the game', 'Stays East for four more games', 'Picks a new card'], e: 'That starts a new round.' },
  { q: 'How many rounds of four tiles are dealt to everyone?', a: '3', w: ['2', '4', '13'], e: 'Three rounds of four makes 12 each before the last pickups.' },
  { q: 'Is the part of the wall to the right of the break a dead wall?', a: 'No, it\'s still live and used last', w: ['Yes, it\'s never used', 'Yes, it holds replacement tiles', 'Only in tournaments'], e: 'American mahjong has no dead wall.' }
);

CHAR_BANK.push(
  { q: 'Which pass always comes first?', a: 'Right', w: ['Left', 'Across', 'Whichever East picks'], e: 'The first Charleston is Right, Across, Left.' },
  { q: 'What is the last pass of the first Charleston?', a: 'Left', w: ['Right', 'Across', 'Courtesy'], e: 'Right, Across, Left.' },
  { q: 'What is the first pass of the second Charleston?', a: 'Left', w: ['Right', 'Across', 'Courtesy'], e: 'The second Charleston mirrors the first: Left, Across, Right.' },
  { q: 'What is the last pass of the second Charleston?', a: 'Right', w: ['Left', 'Across', 'Courtesy'], e: 'Left, Across, Right.' },
  { q: 'Which direction is the courtesy pass?', a: 'Across', w: ['Right', 'Left', 'Any direction'], e: 'You trade with the player across from you.' },
  { q: 'Before the second Charleston can start, who has to agree?', a: 'All four players', w: ['Only East', 'Any two players', 'Nobody, it\'s automatic'], e: 'Any one player can stop it before it starts.' },
  { q: 'You blind pass 2 tiles on the first Left. How many tiles do you pass in all?', a: '3', w: ['2', '1', '5'], e: 'Make up the rest from your own rack so it\'s still three.' },
  { q: 'Can the courtesy pass be zero tiles?', a: 'Yes, it\'s 0 to 3', w: ['No, always 3', 'No, at least 1', 'Only if East says so'], e: 'Each side names 0 to 3, and the smaller number wins.' },
  { q: 'Your rack already has a clear direction, and another round would make you give up tiles you need. What can you do?', a: 'Stop the second Charleston', w: ['Pass jokers instead', 'Skip the first Charleston', 'Pass only 2 tiles'], e: 'Any one player can stop it before it starts.' },
  { q: 'Your tiles are all over the place. Might more passing help?', a: 'Yes, it might', w: ['No, never', 'Only if you pass jokers', 'Only the courtesy pass'], e: 'A messy rack can benefit from more passes.' },
  { q: 'What should you pass first?', a: 'Random tiles that don\'t fit any of your top lines', w: ['A pair you need', 'Your jokers', 'A group of useful tiles'], e: 'Keep useful tiles and pairs together.' },
  { q: 'Should you break up a pair you need to save a weak maybe?', a: 'No', w: ['Yes', 'Only on the courtesy pass', 'Only for flowers'], e: 'Pairs are hard to rebuild, since jokers can\'t fill them.' },
  { q: 'You got 3 tiles on the first Across. Can you pass some of them on unseen in the next pass?', a: 'Yes, the next pass is the first Left, where blind passing is allowed', w: ['No, never', 'Only all three', 'Only if East agrees'], e: 'Blind passing is allowed on the first Left and the second Right.' },
  { q: 'You got 3 tiles on the second Left. Can you pass them on unseen in the next pass?', a: 'No, the next pass is the second Across', w: ['Yes, always', 'Yes, if you pass all three', 'Only during the courtesy pass'], e: 'Blind passing is only on the first Left and the second Right.' },
  { q: 'Why do you pass your tiles before looking at the ones coming in?', a: 'That\'s the rule, so incoming tiles can\'t change what you pass', w: ['So nobody sees your rack', 'To save time', 'It doesn\'t matter'], e: 'Choose first, then look.' },
  { q: 'How many tiles go in each pass of the second Charleston?', a: '3', w: ['2', '1', '0 to 3'], e: 'Only the courtesy pass is 0 to 3.' },
  { q: 'If the second Charleston is stopped, which pass can still happen?', a: 'The courtesy pass', w: ['None', 'The first Charleston again', 'Only a Right pass'], e: 'Stopping the second Charleston doesn\'t cancel the courtesy pass.' },
  { q: 'Is the first Charleston optional?', a: 'No, it\'s required unless East was dealt a winning hand', w: ['Yes, everyone has to agree', 'Yes, East decides', 'Only in tournaments'], e: 'The first Charleston always happens in a normal game.' }
);

TURN_BANK.push(
  { q: 'What\'s the first thing you do on a normal turn?', a: 'Draw from the wall, unless you\'re calling the last discard', w: ['Discard', 'Swap a joker', 'Pass a tile right'], e: 'Get your tile first.' },
  { q: 'Right after you get a tile, what should you check?', a: 'Whether you now have a winning hand', w: ['Who is East', 'The discards from last game', 'Nothing'], e: 'Check for Mah Jongg before you discard.' },
  { q: 'When can you swap for a joker on your turn?', a: 'After you get your tile and before you discard', w: ['Before you draw', 'After you discard', 'Only on someone else\'s turn'], e: 'Draw or call, then swap, then discard.' },
  { q: 'You say the wrong name for your discard. What do you fix?', a: 'The name, not the tile', w: ['You swap in a different tile', 'You take it back', 'Nothing'], e: 'You can correct the name, but the tile stays.' },
  { q: 'After a call, do skipped players get a make-up turn?', a: 'No', w: ['Yes', 'Only East', 'Only if they ask'], e: 'Play just continues from the caller.' },
  { q: 'Do your exposed tiles count toward your 13?', a: 'Yes', w: ['No', 'Only kongs', 'Only after you win'], e: 'Hidden plus exposed is always 13 between turns.' },
  { q: 'East\'s 14 dealt tiles already make a winning hand. What happens?', a: 'East declares Mah Jongg', w: ['East discards one first', 'The Charleston happens anyway', 'It\'s a redeal'], e: 'A dealt win is declared right away.' },
  { q: 'Your discard touches the table before you name it. Has it been discarded?', a: 'Yes', w: ['No, not until you name it', 'Only if someone calls it', 'Only on East\'s turn'], e: 'Named or touching the table, whichever comes first.' },
  { q: 'Before you discard, what\'s a good question to ask yourself?', a: 'Could this tile finish what someone else is showing?', w: ['Is it my highest tile?', 'Did I discard this last game?', 'Nothing, just discard'], e: 'Look at every exposure before you let go of a tile.' },
  { q: 'Is it fine to discard without saying the tile\'s name?', a: 'No, say it out loud', w: ['Yes', 'Only for jokers', 'Only late in the game'], e: 'Naming discards clearly is part of good table manners.' }
);

CALLS_BANK.push(
  { q: 'After you call and expose, can you switch to a different X line?', a: 'Yes, if it uses every group you\'ve shown', w: ['No, never', 'Yes, any line', 'Only to a C line'], e: 'Your exposures have to fit the new line exactly.' },
  { q: 'Can you take back an exposure?', a: 'No', w: ['Yes, before your next turn', 'Yes, if nobody objects', 'Only a pung'], e: 'Exposures are permanent.' },
  { q: 'Where do your called group\'s tiles go?', a: 'Face up on top of your rack', w: ['Face down in front of you', 'Into the discards', 'Back in the wall'], e: 'Everyone has to be able to see them.' },
  { q: 'Should you call just because a tile matches something you hold?', a: 'No, it shows your plan and cuts your options', w: ['Yes, always', 'Yes, early in the game', 'Only for kongs'], e: 'Call with a purpose.' },
  { q: 'Before you say "call", what should you check?', a: 'The tile, the group size, and your card line', w: ['Only the tile', 'How many jokers others have', 'Nothing, call fast'], e: 'A quick three-part check avoids illegal exposures.' },
  { q: 'Can you call a tile during the Charleston?', a: 'No, calls only happen on discards during play', w: ['Yes, any time', 'Only on the Across pass', 'Only East can'], e: 'The Charleston is just passing.' },
  { q: 'You call from across the table. Who discards next?', a: 'You do, after exposing', w: ['The player who would have been next', 'The discarder', 'East'], e: 'Then play continues to your right.' },
  { q: 'Can you call the latest discard just to swap it for a joker on the table?', a: 'No, a call has to make a legal group for your hand', w: ['Yes', 'Only on your turn', 'Only if it\'s a flower'], e: 'Joker swaps use tiles you already have.' }
);

TIMING_BANK.push(
  { q: 'The player with priority claims Mah Jongg, but their hand is wrong. Another player also claimed Mah Jongg. Who can get the tile?', a: 'The other Mah Jongg claimant', w: ['Nobody, it\'s dead', 'The discarder', 'The next player in turn'], e: 'A second Mah Jongg claim can step in.' },
  { q: 'The player with priority claims Mah Jongg, but their hand is wrong. The other claim was only to expose. Where does the tile go?', a: 'It stays with the wrong Mah Jongg claim', w: ['To the exposing player', 'Back to the discards', 'To East'], e: 'That\'s how the League explains it.' },
  { q: 'At a tournament, two claims both already exposed and it\'s unclear who gets the tile. What do you do?', a: 'Get the director', w: ['Flip a coin', 'Give it to East', 'Let the louder player have it'], e: 'There\'s no clear League guidance for that case.' },
  { q: 'What commits you to a call?', a: 'Putting the called tile on your rack or exposing tiles', w: ['Saying "wait"', 'Looking at the tile', 'Thinking about it'], e: 'After that, you\'re in.' },
  { q: 'After a call, once you discard, can you change your new group\'s size?', a: 'No, it\'s locked', w: ['Yes, any time', 'Yes, on your next turn', 'Only to make it bigger'], e: 'Size locks when you discard or start a joker swap.' },
  { q: 'Does saying "wait" claim the tile for you?', a: 'No, it only asks for a pause', w: ['Yes, for five seconds', 'Yes, until your turn', 'Only for Mah Jongg'], e: 'Say "call" clearly if you want it.' },
  { q: 'Is the loudest call the one that wins?', a: 'No, Mah Jongg first, then turn order', w: ['Yes', 'Only for Mah Jongg', 'Only when East calls'], e: 'Priority rules decide, not volume.' },
  { q: 'A Mah Jongg call and an exposure call come at once. Does turn order matter?', a: 'No, Mah Jongg wins no matter where it is', w: ['Yes, closest player wins', 'Only if East is involved', 'They split the tile'], e: 'Mah Jongg always beats an exposure.' },
  { q: 'Who is "next in turn" after a discard?', a: 'The player on the discarder\'s right', w: ['The player on the discarder\'s left', 'The player across', 'East'], e: 'Turns move to the right.' },
  { q: 'What\'s the fair way to treat each discard?', a: 'Give everyone a moment to react before drawing', w: ['Draw as fast as you can', 'Wait for East\'s okay', 'Never pause'], e: 'Rushing can cut off a legal call.' }
);

JOKER_BANK.push(
  { q: 'Can you swap for a joker right after calling a discard?', a: 'Yes, after you finish your exposure', w: ['No, only after drawing', 'Only on East\'s turn', 'Never in the same turn'], e: 'Calling counts as getting your tile.' },
  { q: 'How many joker swaps can you make in one turn?', a: 'As many as you have matching tiles for', w: ['Only one', 'Two', 'None after a call'], e: 'You can swap more than once, then discard or win.' },
  { q: 'Why can taking an opponent\'s last joker be risky?', a: 'It can set them up for a jokerless win that pays double', w: ['It\'s illegal', 'It kills your hand', 'You have to pay them'], e: 'Weigh that against how much the joker helps you.' },
  { q: 'Can a joker stand in for soap used as a zero?', a: 'No, the zero is a single', w: ['Yes', 'Only in a year', 'Only on an X hand'], e: 'Singles never take jokers.' },
  { q: 'Can a joker be one of the four tiles in NEWS?', a: 'No, NEWS is four singles', w: ['Yes', 'Only for North', 'Only if exposed'], e: 'Jokers need a group of three or more identical tiles.' },
  { q: 'Can a joker be in a kong of flowers?', a: 'Yes', w: ['No, flowers never take jokers', 'Only one flower', 'Only if exposed'], e: 'It\'s a group of four.' },
  { q: 'You took a joker in a swap. Can it fill the missing tile in your flower pair?', a: 'No', w: ['Yes', 'Only if it came from a flower group', 'Only for Mah Jongg'], e: 'A pair can never use a joker.' },
  { q: 'A joker swap completes your hand. How is the win paid?', a: 'Like a self-drawn win', w: ['Like a discard win', 'Nobody pays', 'The joker\'s owner pays double'], e: 'A winning joker swap pays like self-drawn.' },
  { q: 'Can you exchange for a joker in a dead hand\'s earlier legal exposure?', a: 'Yes', w: ['No', 'Only the dead player can', 'Only after the game'], e: 'Those jokers stay available.' }
);

PAY_BANK.push(
  { q: 'The wall runs out with no winner. Who pays?', a: 'Nobody', w: ['Everyone pays East', 'East pays everyone', 'The last discarder'], e: 'A wall game pays nothing.' },
  { q: 'A hand wins on a discard. Who pays the most?', a: 'The discarder', w: ['East', 'The player across', 'Everyone pays the same'], e: 'The discarder pays double.' },
  { q: 'Someone wins self-drawn. Does anyone pay as the discarder?', a: 'No, there is no discarder', w: ['Yes, the last player to discard', 'Yes, East', 'Yes, the player on the left'], e: 'All three pay double instead.' },
  { q: 'In the payment table, what does V stand for?', a: 'The value printed on the card for that hand', w: ['The number of jokers', 'The winner\'s seat', 'The number of exposures'], e: 'Everything is a multiple of V.' },
  { q: 'Do chips or points work the same way as money?', a: 'Yes', w: ['No, chips pay half', 'Only in tournaments', 'Only for jokerless hands'], e: 'Same multiples.' },
  { q: 'When should players break up their racks after a Mah Jongg?', a: 'Only after the win is confirmed', w: ['Right away', 'Before the winner shows the hand', 'After East says so'], e: 'Everyone needs to be able to check the hand.' }
);

ERR_BANK.push(
  { q: 'You declare Mah Jongg with a wrong hand and you\'re committed. What usually happens?', a: 'Your hand is dead', w: ['You just keep playing', 'Everyone pays you anyway', 'It\'s a redeal'], e: 'A few narrow exceptions exist.' },
  { q: 'When can a spoken false Mah Jongg sometimes be taken back?', a: 'If no hidden tiles were shown and nothing was disturbed', w: ['Never', 'Any time before payment', 'Only if East allows it'], e: 'Once tiles are shown or racks are disturbed, it\'s too late.' },
  { q: 'Someone wins on a misnamed tile, and that tile really would have won. Who can owe four times the hand?', a: 'The player who misnamed it', w: ['The winner', 'East', 'Everyone equally'], e: 'That\'s a special ruling.' },
  { q: 'Should you touch another player\'s tiles?', a: 'No, handle only your own', w: ['Yes, to help', 'Only to fix their exposures', 'Only during a swap'], e: 'Hand tiles to the owner instead.' },
  { q: 'A hand clearly can\'t be finished based on what\'s exposed and discarded. What can the others do?', a: 'Challenge it as dead', w: ['Nothing', 'Take its jokers', 'Make it pay right away'], e: 'Challenges use only what everyone can see.' },
  { q: 'In a learning game, how should mistakes be handled?', a: 'Agree to fix them openly', w: ['Call every hand dead', 'Ignore them', 'Charge a penalty'], e: 'Save strict rulings for real games and events.' },
  { q: 'Is it okay to say out loud what someone might be waiting on?', a: 'No', w: ['Yes, to be helpful', 'Only to new players', 'Only late in the game'], e: 'Don\'t coach active hands.' },
  { q: 'When can players touch the walls again after a Mah Jongg or dispute?', a: 'Once it\'s settled', w: ['Right away', 'After the next discard', 'Whenever East says'], e: 'Leave everything alone until it\'s sorted out.' },
  { q: 'How should your exposed groups look?', a: 'Kept apart and easy to count', w: ['Stacked together', 'Mixed with your hidden tiles', 'Face down'], e: 'Others need to read them.' },
  { q: 'Someone draws from the wrong end of the wall and someone wins on their discard. What can happen?', a: 'The offender may pay four times the value alone', w: ['Nothing', 'The game is replayed', 'The winner pays'], e: 'That\'s a special case ruling.' }
);

CHOOSE_BANK.push(
  { q: 'How many lines should you compare closely at the start?', a: 'Two or three that fit', w: ['Every line on the card', 'Just one', 'At least ten'], e: 'Narrow it down first.' },
  { q: 'When counting a line, which spots should you check first?', a: 'The pairs and singles, since jokers can\'t fill them', w: ['The kongs', 'The quints', 'The value'], e: 'Those are the hardest to finish.' },
  { q: 'What makes a line flexible?', a: 'Its tiles also work for a backup line', w: ['It pays more', 'It\'s concealed', 'It has flowers'], e: 'Flexibility keeps options open.' },
  { q: 'Lots of the tiles you need are already discarded or exposed. What does that mean?', a: 'The line is harder to finish', w: ['It\'s easier', 'Nothing', 'You should call right away'], e: 'Check availability, not just fit.' },
  { q: 'When should you place jokers in your count?', a: 'After you check which spots can\'t take them', w: ['First', 'Never', 'Only in pairs'], e: 'Jokers only go in groups of three or more.' },
  { q: 'Early on, which should you keep: a pair that fits two lines, or a single that fits one?', a: 'The pair', w: ['The single', 'Neither', 'Both, pass a joker'], e: 'Pairs that serve more than one line are valuable.' },
  { q: 'Is the highest-paying line always the best choice?', a: 'No, go for the one you can realistically finish', w: ['Yes', 'Only for East', 'Only if it\'s concealed'], e: 'A finished 25 beats an unfinished 50.' },
  { q: 'A line matches lots of your tiles but needs a rare real single. Is it as strong as it looks?', a: 'Often not, since jokers can\'t fill that single', w: ['Yes, always', 'Yes, if you have jokers', 'Only if it pays 50'], e: 'Real-tile bottlenecks matter.' },
  { q: 'What does sorting your rack help you spot?', a: 'Real pairs and repeated numbers', w: ['Which player is East', 'The wall\'s active end', 'Discards'], e: 'Sort by suit and number, then honors, flowers and jokers.' }
);

PIVOT_BANK.push(
  { q: 'What does calling a tile trade away?', a: 'Flexibility, in exchange for progress', w: ['Nothing', 'Your jokers', 'Your turn'], e: 'Exposures lock you in.' },
  { q: 'When should you usually wait instead of calling?', a: 'When the call would lock you into a weak line', w: ['When the tile fits', 'When you have a joker', 'Never'], e: 'A call should help your best line.' },
  { q: 'Your pairs and singles are already done. Does that make calling more attractive?', a: 'Yes', w: ['No', 'Only for C hands', 'It doesn\'t matter'], e: 'Then exposures fill the joker-friendly parts.' },
  { q: 'Before you expose anything, how freely can you compare lines?', a: 'Completely freely', w: ['Only within one category', 'Only C lines', 'Not at all'], e: 'Nothing is locked yet.' },
  { q: 'After an exposure, what\'s the first thing to cross off?', a: 'Every line that can\'t use exactly what you showed', w: ['Lines that pay less', 'All C lines only', 'Nothing'], e: 'Then compare what\'s left.' },
  { q: 'A line looks further away but drops a tile you can\'t get. Could it be the better move?', a: 'Yes', w: ['No, always pick the closest', 'Only if it pays more', 'Only before the Charleston'], e: 'Impossible beats close, every time.' },
  { q: 'A concealed line is still clearly better for you. Should you call to expose?', a: 'No', w: ['Yes', 'Only for a kong', 'Only if it\'s a flower'], e: 'Exposing would rule out the C line.' },
  { q: 'You still need lots of rare real tiles. Is exposing a good idea?', a: 'Usually wait', w: ['Yes, always', 'Only early', 'Only with jokers'], e: 'Keep options until the line firms up.' },
  { q: 'You exposed two groups. A new line uses only one of them. Can you switch?', a: 'No, it must use every group you\'ve shown', w: ['Yes', 'Only if it\'s X', 'Only before you discard'], e: 'All exposures have to fit.' },
  { q: 'You\'re ready for the next level when you can...', a: 'Name your best line and a backup, explain each joker, and say which real tile is holding you up', w: ['Win every game', 'Memorize the whole card', 'Call every discard'], e: 'That\'s the handbook\'s benchmark.' },
  { q: 'No line on the card can use your exposures anymore. What can the others do?', a: 'Challenge your hand as dead', w: ['Nothing', 'Take your tiles', 'Make you redraw'], e: 'Based on what\'s visible.' }
);

READ_BANK.push(
  { q: 'One exposure fits lots of lines. What usually narrows it down?', a: 'A second exposure', w: ['The player\'s discards from last game', 'Their seat', 'Nothing'], e: 'Two exposures often point to a few lines.' },
  { q: 'When reading an opponent, what do you match?', a: 'The exact numbers, suits and group sizes, then the notes', w: ['Only the colors', 'Only the value', 'Their facial expression'], e: 'Then check special notes on the card.' },
  { q: 'Should you lock onto one guess about an opponent early?', a: 'No, keep several until the table rules them out', w: ['Yes', 'Only for East', 'Only if they have jokers'], e: 'Stay flexible.' },
  { q: 'When counting a tile, what do you subtract from 4?', a: 'Copies in your rack, in exposures, and in the discards', w: ['Only the discards', 'Only your rack', 'Jokers'], e: 'What\'s left is the most that could be out there.' },
  { q: 'All four real copies of a tile are visible. Your line needs a kong of it. Is the line dead?', a: 'Not necessarily, jokers can fill a kong', w: ['Yes', 'Only if exposed', 'Only for dragons'], e: 'Only pairs and singles need real tiles.' },
  { q: 'Should you tell the table which line you\'re going for?', a: 'No', w: ['Yes', 'Only if asked', 'Only to East'], e: 'Keep your cards close.' },
  { q: 'Why is a player with no exposures harder to read?', a: 'There\'s nothing to match against the card', w: ['They have more jokers', 'They can\'t win', 'They\'re always close'], e: 'No exposures doesn\'t mean safe.' },
  { q: 'Late in the game, which tiles are most dangerous to discard?', a: 'Ones that could finish a line matching an opponent\'s exposures', w: ['Jokers', 'Tiles already discarded twice', 'Flowers only'], e: 'Especially pair and single tiles.' }
);

DEFENSE_BANK.push(
  { q: 'Early in the game with a flexible rack, what\'s the main focus?', a: 'Keep several paths open and lock in the pairs and singles you need', w: ['Call every discard', 'Play only defense', 'Pass your jokers'], e: 'Stay flexible early.' },
  { q: 'In the middle of a game with a clear target, what\'s the focus?', a: 'Finish your groups and re-read opponents after each exposure', w: ['Switch lines every turn', 'Discard your jokers', 'Ignore the table'], e: 'Keep reading the table.' },
  { q: 'A hand waiting on one rare real tile, or one with several spots jokers can fill. Which is usually better?', a: 'The one with joker spots', w: ['The rare real tile', 'They\'re the same', 'Whichever pays more'], e: 'Jokers can come from anywhere.' },
  { q: 'When should you play safer?', a: 'When an opponent looks close, the wall is short, and you\'re still far', w: ['Always', 'Never', 'Only when you\'re East'], e: 'All three together point to defense.' },
  { q: 'Can holding a dangerous tile be smart even if it hurts your own hand?', a: 'Yes', w: ['No', 'Only early', 'Only with jokers'], e: 'Not feeding a win can matter more.' },
  { q: 'Should you skip a joker swap that clearly helps you, just because it cleans up an opponent\'s hand?', a: 'No', w: ['Yes, always', 'Only late', 'Only if they\'re East'], e: 'Weigh it, but don\'t skip clear help.' },
  { q: 'Is a lucky win proof that you played well?', a: 'No', w: ['Yes', 'Only if it was jokerless', 'Only if self-drawn'], e: 'Judge the thinking, not the result.' },
  { q: 'Can a good decision still lose?', a: 'Yes', w: ['No', 'Only on Hard', 'Only for East'], e: 'Luck is part of every game.' },
  { q: 'Should you throw away a joker you actually need just to be safe?', a: 'No', w: ['Yes', 'Only late', 'Only if you have two'], e: 'Only toss jokers you can spare.' },
  { q: 'Late in the game, a 25 hand one tile away, or a 50 hand six tiles away?', a: 'The 25 hand', w: ['The 50 hand', 'Neither', 'Switch every turn'], e: 'Finished beats impressive.' },
  { q: 'Is it a good idea to announce that you\'ve given up on winning?', a: 'No', w: ['Yes', 'Only to East', 'Only in learning games'], e: 'It hands everyone information.' },
  { q: 'You\'re one tile from winning and the wall is still full. Should you switch to defense?', a: 'No, play to win', w: ['Yes', 'Only if you\'re East', 'Only with no jokers'], e: 'Defense is for when you\'re far and time is short.' }
);

EXAM_BANK.push(
  { q: 'You\'re East and your 14 dealt tiles already win. What do you do?', a: 'Declare Mah Jongg', w: ['Discard first', 'Do the Charleston anyway', 'Ask for a redeal'], e: 'A dealt win is declared right away.' },
  { q: 'Courtesy pass: you want to trade 3, the player across wants 2. How many do you trade?', a: '2', w: ['3', '1', '5'], e: 'The smaller number wins.' },
  { q: 'A 40 hand is won self-drawn. How much does the winner collect?', a: '240', w: ['160', '120', '480'], e: 'Each of three players pays 2 × 40 = 80.' },
  { q: 'A 25 hand wins jokerless on a discard. What does the discarder pay?', a: '100', w: ['50', '25', '200'], e: 'Jokerless discard: the discarder pays 4V.' },
  { q: 'You hold one 9 Bam and two jokers. A 9 Bam is discarded and your X line needs a kong of 9 Bams. Can you call?', a: 'Yes, expose the 9 Bam, your 9 Bam and two jokers', w: ['No, you need two real 9 Bams', 'No, kongs can\'t be called', 'Yes, but you also draw'], e: 'A kong call needs three supporting tiles, and jokers count.' },
  { q: 'An opponent shows 4 Dot, 4 Dot, joker. You just drew and hold a 4 Dot. What can you do?', a: 'Hand them your 4 Dot and take the joker', w: ['Nothing until their turn', 'Take the joker and keep your 4 Dot', 'Call the 4 Dot from the discards'], e: 'That\'s a joker exchange.' },
  { q: 'You need a real pair of soap. You hold one and three are discarded. Is it still possible?', a: 'No', w: ['Yes', 'Yes, with a joker', 'Only if concealed'], e: 'All four are accounted for, and pairs can\'t use jokers.' },
  { q: 'You received 3 tiles on the second Across. Can you pass some on unseen during the second Right?', a: 'Yes', w: ['No', 'Only all three', 'Only East can'], e: 'Blind passing is allowed on the second Right.' },
  { q: 'A player exposes a flower pair made with a joker. Is that legal?', a: 'No', w: ['Yes', 'Only on an X hand', 'Only late'], e: 'Pairs can\'t use jokers.' },
  { q: 'The wall has 12 tiles left, you\'re 6 tiles away, and an opponent shows three exposures. What\'s your focus?', a: 'Defense: avoid feeding their win', w: ['Push hard for your hand', 'Call every discard', 'Pass your jokers'], e: 'Far away plus short wall means play safe.' }
);

/* ---------- families built from rules ---------- */

// Tiles
function famsTiles() {
  const nameQ = ALL_KINDS.map(code => {
    const q = genTileIdFor(code);
    q.sig = 'tile-name:' + code; return q;
  });
  const suitQ = SUITED.map(c => Q('tile-suit:' + c, `<p class="q">Which suit is this tile?</p>[[${c}|80]]`,
    SUIT_NAME[parseTile(c).suit] + 's', ['Bams', 'Craks', 'Dots', 'No suit'], tileExplain(c)));
  const findQ = ALL_KINDS.map(code => {
    const p = parseTile(code);
    let pool = p.kind === 'suit'
      ? ['b', 'c', 'd'].filter(s => s !== code[0]).map(s => s + p.n).concat([code[0] + (p.n === 9 ? 8 : p.n + 1)])
      : shuffle(HON.concat(['F', 'J', 'b1']).filter(x => x !== code)).slice(0, 3);
    if (code === 'F') pool = ['b1', 'DW', 'J'];
    const opts = shuffle([code].concat(pool.slice(0, 3)));
    return { type: 'choice', grid: true, sig: 'tile-find:' + code,
      prompt: `<p class="q">Which one is the <b>${tileName(code)}</b>?</p>`,
      options: opts.map(c => `[[${c}|50]]`), answer: opts.indexOf(code), explain: tileExplain(code) };
  });
  const numQ = SUITED.map(c => {
    const n = parseTile(c).n;
    return Q('tile-num:' + c, `<p class="q">What number is this tile?</p>[[${c}|80]]`, String(n),
      [n - 1, n + 1, n - 2, n + 2, n + 3, n - 3].filter(x => x >= 1 && x <= 9).slice(0, 3).map(String),
      `It's the ${tileName(c)}. The small number in the corner always tells you.`);
  });
  const kinds = { wind: 'A wind', dragon: 'A dragon', flower: 'A flower', joker: 'A joker', suit: 'A suit tile' };
  const kindQ = HON.concat(['F', 'J', 'b1']).map(c => Q('tile-kind:' + c, `<p class="q">What kind of tile is this?</p>[[${c}|80]]`,
    kinds[parseTile(c).kind], Object.values(kinds), tileExplain(c)));
  return [fam('name', nameQ), fam('suit', suitQ), fam('find', findQ), fam('number', numQ), fam('kind', kindQ)];
}
function genTileIdFor(code) {
  const p = parseTile(code), name = tileName(code);
  let pool = [];
  if (p.kind === 'suit') {
    ['b', 'c', 'd'].filter(s => SUIT_LETTER[s] !== p.suit).forEach(s => pool.push(tileName(s + p.n)));
    if (p.n > 1) pool.push(tileName(code[0] + (p.n - 1)));
    if (p.n < 9) pool.push(tileName(code[0] + (p.n + 1)));
    if (code === 'b1') pool.push('Flower');
  } else pool = ['North', 'East', 'West', 'South', 'Red Dragon', 'Green Dragon', 'White Dragon (Soap)', 'Flower', 'Joker'];
  return choice(`<p class="q">What is this tile?</p>[[${code}|80]]`, name, shuffle(pool.filter(x => x !== name)).slice(0, 3), tileExplain(code));
}

// Dragons
function famsDragons() {
  const dOpt = c => `[[${c}|30]] ${tn(c)}`;
  const DR3 = ['DG', 'DR', 'DW'];
  const t2d = SUITED.map(c => {
    const d = DRAGON_OF[parseTile(c).suit];
    return { type: 'choice', sig: 'dr-t2d:' + c, prompt: `<p class="q">Which dragon goes with this tile?</p>[[${c}|72]]`,
      options: DR3.map(dOpt), answer: DR3.indexOf(d), explain: `${SUIT_NAME[parseTile(c).suit]}s go with the ${tn(d)}. The number doesn't matter.` };
  });
  const d2s = DR3.map(d => {
    const s = d === 'DG' ? 'Bams' : d === 'DR' ? 'Craks' : 'Dots';
    return Q('dr-d2s:' + d, `<p class="q">This dragon goes with which suit?</p>[[${d}|72]]`, s, ['Bams', 'Craks', 'Dots'], `The ${tileName(d)} goes with ${s}.`);
  });
  const line = SUITED.map(c => {
    const p = parseTile(c), d = DRAGON_OF[p.suit];
    return { type: 'choice', sig: 'dr-line:' + c,
      prompt: `<p class="small">A card line reads <b>${String(p.n).repeat(3)} DDDD</b>, "matching dragon." You're building the ${p.n}s in this suit:</p>[[${c}|64]]<p class="q">Which dragon do you need?</p>`,
      options: DR3.map(dOpt), answer: DR3.indexOf(d), explain: `Matching means the dragon of the same suit. ${SUIT_NAME[p.suit]}s match the ${tn(d)}.` };
  });
  const yn = [];
  SUITED.forEach(c => DR3.forEach(d => {
    const ok = DRAGON_OF[parseTile(c).suit] === d;
    yn.push(Q(`dr-yn:${c}:${d}`, `<p class="q">Do these two go together?</p>[[${c} ${d}|60]]`, ok ? 'Yes, they match' : 'No, they don\'t match',
      ['Yes, they match', 'No, they don\'t match'], `${tileName(c)} is a ${SUIT_NAME[parseTile(c).suit]}, which goes with the ${tn(DRAGON_OF[parseTile(c).suit])}.`));
  }));
  const extra = DRAGON_BANK.concat([
    { q: 'Which dragon is drawn as an empty frame on most sets?', a: 'White Dragon (soap)', w: ['Red Dragon', 'Green Dragon', 'None of them'], e: 'Soap is the frame.' },
    { q: 'Which character is on the Red Dragon?', a: '中', w: ['發', '萬', '東'], e: 'Red shows 中.' },
    { q: 'Which character is on the Green Dragon?', a: '發', w: ['中', '萬', '北'], e: 'Green shows 發.' },
    { q: 'Can soap used as a zero start a run of numbers?', a: 'No', w: ['Yes', 'Only in Dots', 'Only with a joker'], e: 'As zero, soap has no suit and can\'t start a run.' },
    { q: 'How many of each dragon are in a set?', a: '4', w: ['2', '3', '8'], e: 'Four red, four green, four white.' },
    { q: 'How many dragon tiles are there in all?', a: '12', w: ['8', '16', '9'], e: 'Three colors, four each.' },
    { q: 'What\'s an easy way to remember the dragon pairs?', a: 'Bamboo is green, craks are red, and soap is left for dots', w: ['Alphabetical order', 'By number', 'Biggest to smallest'], e: 'Colors give it away.' },
    { q: 'A year like 2026 on the card uses how many soap tiles?', a: '1', w: ['2', '0', '4'], e: 'One 0 means one soap.' }
  ]);
  return [fam('tile-dragon', t2d), fam('dragon-suit', d2s), fam('line', line), fam('yes-no', yn), bankFam('bank', extra)];
}

// Groups
function famsGroups() {
  const legal = (sig, tiles, ok, e) => Q(sig, `<p class="q">Is this a legal group?</p>${tilesHtml(tiles, tiles.length > 4 ? 42 : 50)}`, ok ? 'Yes, legal' : 'No, not legal', ['Yes, legal', 'No, not legal'], e);
  const pung = GROUPABLE.map(t => legal('g-pung:' + t, [t, t, 'J'], true, `A pung of ${tnp(t)} can use a joker.`));
  const pair = GROUPABLE.map(t => legal('g-pair:' + t, [t, 'J'], false, 'A pair can never use a joker.'));
  const kong = GROUPABLE.map(t => legal('g-kong:' + t, [t, t, 'J', 'J'], true, 'A kong can use jokers, even two.'));
  const quint = GROUPABLE.map(t => legal('g-quint:' + t, [t, t, t, t, 'J'], true, 'Only four real copies exist, so this quint needs a joker. That\'s legal.'));
  const runs = [];
  ['b', 'c', 'd'].forEach(s => { for (let k = 1; k <= 7; k++) runs.push(legal(`g-run:${s}${k}`, [s + k, s + (k + 1), s + (k + 2)], false, 'There are no runs in American mahjong.')); });
  const misc = [
    legal('g-news', ['N', 'E', 'J', 'S'], false, 'NEWS is four singles, so no jokers.'),
    legal('g-news2', ['J', 'E', 'W', 'S'], false, 'NEWS is four singles, so no jokers.'),
    legal('g-news3', ['N', 'J', 'W', 'S'], false, 'NEWS is four singles, so no jokers.'),
    legal('g-news4', ['N', 'E', 'W', 'J'], false, 'NEWS is four singles, so no jokers.'),
    legal('g-fpair', ['F', 'J'], false, 'A flower pair needs two real flowers.'),
    legal('g-fkong', ['F', 'F', 'F', 'J'], true, 'A flower kong can use a joker.'),
    legal('g-f5', ['F', 'F', 'F', 'F', 'F'], true, 'There are eight flowers, so five real ones works.'),
    legal('g-f6', ['F', 'F', 'F', 'F', 'F', 'F'], true, 'Six real flowers is fine. There are eight.'),
    legal('g-5real', ['d5', 'd5', 'd5', 'd5', 'd5'], false, 'Only four real 5 Dots exist. A quint of a number needs at least one joker.')
  ];
  const names = [];
  GROUPABLE.forEach(t => [3, 4, 5, 6].forEach(size => {
    const tiles = [];
    for (let i = 0; i < size; i++) tiles.push(i < 4 ? t : 'J');
    names.push(Q(`g-name:${t}:${size}`, `<p class="q">What is this group called?</p>${tilesHtml(tiles, size > 4 ? 40 : 48)}`,
      GROUP_NAMES[size], ['Pung', 'Kong', 'Quint', 'Sextet'], `${size} identical tiles is a ${GROUP_NAMES[size].toLowerCase()}. Pung 3, kong 4, quint 5, sextet 6.`));
  }));
  const minJ = [];
  GROUPABLE.forEach(t => [5, 6].forEach(size => minJ.push(Q(`g-minj:${t}:${size}`, `[[${t}|60]]<p class="q">What\'s the fewest jokers a ${SIZE_NAME[size]} of ${tnp(t)} can have?</p>`,
    String(size - 4), ['0', '1', '2', '3'], `Only four real ${tnp(t)} exist, so a ${SIZE_NAME[size]} needs at least ${size - 4}.`))));
  minJ.push(Q('g-minj:F:5', `[[F|60]]<p class="q">What\'s the fewest jokers a quint of flowers can have?</p>`, '0', ['0', '1', '2', '3'], 'There are eight flowers, so five can all be real.'));
  return [fam('pung', pung), fam('pair', pair), fam('kong', kong), fam('quint', quint), fam('runs', runs), fam('misc', misc), fam('names', names), fam('min-jokers', minJ)];
}

// Card reading
function famsCard() {
  const CS = (typeof window !== 'undefined' && window.CardSchool) || (typeof CardSchool !== 'undefined' ? CardSchool : null);
  const out = [genFam('rack', genCardRack), bankFam('bank', CARD_BANK.concat([
    { q: 'Each line on the card is how many tiles?', a: '14', w: ['13', '12', 'It depends'], e: 'Every winning hand is exactly 14 tiles.' },
    { q: 'On the card, what does a D stand for?', a: 'A dragon', w: ['A Dot', 'A discard', 'Double'], e: 'D is a dragon. Which one depends on the line.' },
    { q: 'On the card, what does an F stand for?', a: 'A flower', w: ['A five', 'A free tile', 'Final'], e: 'F is a flower.' },
    { q: 'On the card, what does a 0 stand for?', a: 'Soap (the White Dragon)', w: ['Any joker', 'A blank tile', 'Nothing'], e: 'Soap plays the zero.' },
    { q: 'Two groups are printed in the same color. What does that mean?', a: 'They\'re in the same suit', w: ['They\'re in different suits', 'They\'re both dragons', 'Nothing'], e: 'Same color, same suit.' },
    { q: 'Does green on the card always mean Bams?', a: 'No, colors don\'t lock to a suit', w: ['Yes', 'Only in 2468', 'Only for dragons'], e: 'Colors only show same versus different.' },
    { q: 'Where on the card do you find what a hand pays?', a: 'The number at the end of the line', w: ['The first group', 'The color', 'The category name'], e: 'That\'s the value, V.' },
    { q: 'What do the notes in parentheses do?', a: 'They limit which numbers, suits or dragons you can use', w: ['Nothing', 'They list the jokers', 'They show who wins ties'], e: 'Always read the note.' }
  ]))];
  if (!CS) return out;
  const flat = l => l.g.reduce((a, g) => a.concat(g.k === 'cluster' ? g.parts : [g]), []);
  const colors = l => new Set(flat(l).filter(g => g.k === 'num' || g.k === 'drag').map(g => g.c)).size;
  const slotsJ = l => l.cat === 'sp' ? 0 : flat(l).reduce((a, g) => a + (g.n >= 3 ? g.n : 0), 0);
  const maxJ = l => Math.min(8, slotsJ(l));
  const show = l => CS.lineHtml(l);
  out.push(fam('suits', CS.CARD.map(l => {
    const n = colors(l), ans = n ? String(n) : 'None';
    return Q('c-suits:' + l.id, `${show(l)}<p class="q">How many different suits (colors) does this line use?</p>`, ans, ['1', '2', '3', 'None'],
      n ? `${n} ${plural(n, 'color')} on the card means ${n} different ${plural(n, 'suit')}.` : 'No numbers or dragons, so no suits at all.');
  })));
  out.push(fam('xc', CS.CARD.map(l => Q('c-xc:' + l.id, `${show(l)}<p class="q">Can you call discards to expose groups for this hand?</p>`,
    l.xc === 'X' ? 'Yes, it\'s marked X' : 'No, it\'s marked C (concealed)', ['Yes, it\'s marked X', 'No, it\'s marked C (concealed)'],
    l.xc === 'X' ? 'X means exposures are allowed.' : 'C means it stays hidden. You can only call the very last tile to win.'))));
  out.push(fam('value', CS.CARD.map(l => Q('c-val:' + l.id, `${show(l)}<p class="q">What does this hand pay?</p>`, String(l.v), ['25', '30', '40', '50'], 'It\'s the number at the end of the line.'))));
  out.push(fam('maxj', CS.CARD.map(l => {
    const m = maxJ(l);
    return Q('c-maxj:' + l.id, `${show(l)}<p class="q">What\'s the most jokers this hand could use?</p>`, String(m),
      [m - 2, m - 1, m + 1, m + 2, 0, 14].filter(x => x >= 0 && x <= 14 && x !== m).slice(0, 3).map(String),
      l.cat === 'sp' ? 'Singles and Pairs hands can\'t use jokers at all.' : slotsJ(l) > 8 ? `Groups of 3 or more have ${slotsJ(l)} spots, but there are only 8 jokers in a set.` : `Add up every group of 3 or more: that's ${m}. Pairs and singles need real tiles.`);
  })));
  return out;
}

// Setup
function famsSetup() {
  const count = ALL_KINDS.map(c => {
    const n = (c === 'F' || c === 'J') ? 8 : 4;
    return Q('s-count:' + c, `[[${c}|64]]<p class="q">How many ${c === 'F' ? 'flowers' : c === 'J' ? 'jokers' : tnp(c)} are in a set?</p>`, String(n), ['4', '8', '2', '1'],
      n === 8 ? `There are eight ${c === 'F' ? 'flowers' : 'jokers'}.` : 'Every regular tile has four copies.');
  });
  const totals = [['Bams', 36], ['Craks', 36], ['Dots', 36], ['winds', 16], ['dragons', 12], ['flowers', 8], ['jokers', 8], ['tiles in the whole set', 152], ['suit tiles (Bams, Craks and Dots together)', 108]]
    .map(([w, n]) => Q('s-tot:' + w, `<p class="q">How many ${w} are there?</p>`, String(n), [36, 16, 12, 8, 152, 108, 144, 9, 4, 27].filter(x => x !== n).slice(0, 5).map(String).sort(() => Math.random() - .5).slice(0, 3), `There are ${n} ${w}.`));
  const seats = [];
  SEATS.forEach(s => {
    seats.push(Q('s-next:' + s, `${seatFig({ [s]: { t: 'their turn', k: 'ask' } })}<p class="q">It\'s ${s}\'s turn. Who goes next?</p>`, rightOf(s), SEATS.filter(x => x !== s), `Turns move to the right: East, South, West, North.`));
    seats.push(Q('s-prev:' + s, `${seatFig({ [s]: { t: 'up next', k: 'ask' } })}<p class="q">${s} is about to play. Who played just before?</p>`, leftOf(s), SEATS.filter(x => x !== s), `The player before you is on your left.`));
    seats.push(Q('s-across:' + s, `${seatFig({ [s]: { k: 'ask' } })}<p class="q">Who sits across from ${s}?</p>`, acrossOf(s), SEATS.filter(x => x !== s), 'East and West face each other, and so do South and North.'));
    seats.push(Q('s-right:' + s, `${seatFig({ [s]: { k: 'ask' } })}<p class="q">Who sits on ${s}\'s right?</p>`, rightOf(s), SEATS.filter(x => x !== s), 'Turn order goes East, South, West, North, each to the right.'));
    seats.push(Q('s-left:' + s, `${seatFig({ [s]: { k: 'ask' } })}<p class="q">Who sits on ${s}\'s left?</p>`, leftOf(s), SEATS.filter(x => x !== s), 'Your left neighbor is the one who plays just before you.'));
  });
  const dice = [];
  for (let a = 1; a <= 6; a++) for (let b = a; b <= 6; b++) {
    const t = a + b;
    dice.push(Q(`s-dice:${a}${b}`, `${diceFig(a, b)}<p class="q">East rolls a ${a} and a ${b}. Where does East break the wall?</p>`,
      `${t} stacks in from the right end of East\'s own wall`,
      [`${t} stacks in from the left end of East\'s own wall`, `${t} stacks in from the right end of the wall across`, `${t + 1} stacks in from the right end of East\'s own wall`],
      `Add the dice (${t}) and count that many stacks from the right end of East's own wall.`));
  }
  const deal = [
    Q('s-deal1', '<p class="q">After the first round of the deal, how many tiles does each player have?</p>', '4', ['3', '8', '13'], 'Four at a time.'),
    Q('s-deal2', '<p class="q">After the second round of the deal, how many tiles does each player have?</p>', '8', ['6', '4', '12'], 'Two rounds of four.'),
    Q('s-deal3', '<p class="q">After the third round of the deal, how many tiles does each player have?</p>', '12', ['13', '14', '9'], 'Three rounds of four, then the last pickups.'),
    Q('s-deal4', '<p class="q">Right after the deal, how many tiles are in all four players\' hands together?</p>', '53', ['52', '56', '48'], '14 for East plus 13 for each of the others.'),
    Q('s-deal5', '<p class="q">Right after the deal, how many tiles are left in the walls?</p>', '99', ['100', '96', '104'], '152 minus 53 dealt.'),
    Q('s-deal6', '<p class="q">How many tiles are in one wall?</p>', '38', ['36', '19', '40'], '19 stacks of two.'),
    Q('s-deal7', '<p class="q">How long is each wall?</p>', '19 stacks', ['18 stacks', '17 stacks', '20 stacks'], '19 stacks, two high.')
  ];
  const NEXTW = { East: 'North', North: 'West', West: 'South', South: 'East' };
  const walls = Object.keys(NEXTW).map(w => Q('s-wall:' + w, `${seatFig({ [w]: { t: 'wall empty', k: 'empty' } }, 'Which wall next?')}<p class="q">${w}'s wall runs out. Which wall do you take tiles from next?</p>`,
    `${NEXTW[w]}'s wall`, SEATS.filter(x => x !== w).map(x => `${x}'s wall`),
    'Walls are used to the left (clockwise): East\'s, North\'s, West\'s, South\'s, then back to East\'s.'));
  walls.push(Q('s-wall:first', '<p class="q">Which wall does the deal always start on?</p>', 'East\'s wall, just left of the break', ['North\'s wall', 'The wall across from East', 'Whichever wall is longest'], 'East breaks their own wall and dealing starts just left of the break.'));
  walls.push(Q('s-wall:last', '<p class="q">Which tiles are the very last ones drawn in a game?</p>', 'The stacks East counted with the dice', ['The end of South\'s wall', 'The middle of West\'s wall', 'The first stacks dealt'], 'Those counted stacks sit at the end of the line, after South\'s wall.'));
  walls.push(Q('s-wall:dirs', '<p class="q">Walls move one way and dealing moves the other. Which is which?</p>', 'Walls go left (clockwise), dealing and turns go right', ['Walls go right, dealing goes left', 'Both go to the right', 'Both go to the left'], 'Opposite directions: that\'s why it helps to point at the active end before play starts.'));
  return [fam('count', count), fam('totals', totals), fam('seats', seats), fam('dice', dice), fam('deal', deal), fam('walls', walls), bankFam('bank', SETUP_BANK)];
}

// Charleston
const CH_SEQ = ['Right', 'Across', 'Left', 'Left', 'Across', 'Right', 'Across'];
const CH_LABEL = ['first Right', 'first Across', 'first Left', 'second Left', 'second Across', 'second Right', 'courtesy Across'];
function famsCharleston() {
  const dirOpts = ['Right', 'Across', 'Left'];
  const pos = CH_SEQ.map((d, i) => Q('ch-pos:' + i, `${seqFig(i, 0)}<p class="q">Counting the whole Charleston, including the courtesy pass, which way is the ${ORD[i]} pass?</p>`, d, dirOpts,
    'The full order: Right, Across, Left, then Left, Across, Right, then the courtesy pass Across.'));
  const next = CH_SEQ.slice(0, 6).map((d, i) => Q('ch-next:' + i, `${seqFig(i + 1, i + 1)}<p class="q">You just finished the ${CH_LABEL[i]} pass. Which way is the next pass?</p>`, CH_SEQ[i + 1], dirOpts,
    'Right, Across, Left, Left, Across, Right, then courtesy Across.'));
  const route = [];
  SEATS.forEach(s => {
    [['Right', rightOf(s), leftOf(s)], ['Across', acrossOf(s), acrossOf(s)], ['Left', leftOf(s), rightOf(s)]].forEach(([dir, to, from]) => {
      route.push(Q(`ch-to:${s}:${dir}`, `${seatFig({ [s]: { t: 'you', k: 'you' } }, dir + ' pass')}<p class="q">You sit ${s}. On ${dir === 'Across' ? 'an' : 'a'} ${dir} pass, who gets your tiles?</p>`, to, SEATS.filter(x => x !== s), dir === 'Across' ? 'On an Across pass your tiles go straight across the table.' : `On a ${dir} pass your tiles go to the player on your ${dir.toLowerCase()}.`));
      route.push(Q(`ch-from:${s}:${dir}`, `${seatFig({ [s]: { t: 'you', k: 'you' } }, dir + ' pass')}<p class="q">You sit ${s}. On ${dir === 'Across' ? 'an' : 'a'} ${dir} pass, who sends tiles to you?</p>`, from, SEATS.filter(x => x !== s), dir === 'Across' ? 'Across passes are a straight swap.' : `Everyone passes ${dir.toLowerCase()} at once, so yours come from the player on your ${dir === 'Right' ? 'left' : 'right'}.`));
    });
    route.push(Q('ch-cpart:' + s, `${seatFig({ [s]: { t: 'you', k: 'you' } }, 'Courtesy')}<p class="q">You sit ${s}. Who is your courtesy pass partner?</p>`, acrossOf(s), SEATS.filter(x => x !== s), 'The courtesy pass is with the player across.'));
  });
  const court = [];
  for (let a = 0; a <= 3; a++) for (let b = 0; b <= 3; b++) {
    court.push(Q(`ch-court:${a}${b}`, `${seatFig({ East: { t: 'you: ' + a, k: 'you' }, West: { t: 'across: ' + b, k: 'partner' } }, 'Courtesy')}<p class="q">Courtesy pass: you want to trade ${a}, the player across wants ${b}. How many do you each pass?</p>`, String(Math.min(a, b)), ['0', '1', '2', '3'], 'The smaller number wins.'));
  }
  const blind = [];
  ['first Left', 'second Right'].forEach(p => [1, 2, 3].forEach(k => blind.push(Q(`ch-blind:${p}:${k}`,
    `<p class="q">On the ${p}, you pass ${k} of the tiles you just got without looking. How many come from your own rack?</p>`, String(3 - k), ['0', '1', '2', '3'], 'Each pass is still three tiles total.'))));
  CH_LABEL.forEach((p, i) => blind.push(Q('ch-ok:' + i, `<p class="q">Is blind passing allowed on the ${p} pass?</p>`, (i === 2 || i === 5) ? 'Yes' : 'No', ['Yes', 'No'], 'Blind passing is only on the first Left and the second Right.')));
  const jok = ['first Right', 'second Left', 'courtesy Across'].map(p => Q('ch-j:' + p, `<p class="q">Can you pass a joker on the ${p} pass?</p>`, 'No, never', ['No, never', 'Yes', 'Only if blind', 'Only to the player across'], 'Jokers are never passed.'));
  const totals = [
    Q('ch-t1', '<p class="q">How many tiles do you pass in the whole first Charleston?</p>', '9', ['3', '6', '12'], 'Three passes of three.'),
    Q('ch-t2', '<p class="q">How many tiles do you pass in both Charlestons together?</p>', '18', ['9', '12', '21'], 'Six passes of three.'),
    Q('ch-t3', '<p class="q">What\'s the most tiles you can pass, counting the courtesy pass?</p>', '21', ['18', '24', '15'], '18 plus up to 3.'),
    Q('ch-t4', '<p class="q">Someone stops the second Charleston and the courtesy pass is 0. How many tiles did you pass?</p>', '9', ['0', '3', '18'], 'Only the first Charleston happened.')
  ];
  const order = ORDER_QS.map((q, i) => Object.assign({}, q, { sig: 'ch-order:' + i, items: q.items.slice(), answer: q.answer.slice() }));
  const which = CH_LABEL.map((p, i) => Q('ch-which:' + i, `<p class="q">The ${p} pass belongs to which part of the Charleston?</p>`,
    i < 3 ? 'The first Charleston' : i < 6 ? 'The second Charleston' : 'The courtesy pass', ['The first Charleston', 'The second Charleston', 'The courtesy pass'],
    'First: Right, Across, Left. Second: Left, Across, Right. Then the courtesy pass across.'));
  const howMany = CH_LABEL.map((p, i) => Q('ch-count:' + i, `<p class="q">Counting from the start, how many passes have happened once the ${p} pass is done?</p>`,
    String(i + 1), ['1', '2', '3', '4', '5', '6', '7'].filter(x => x !== String(i + 1)).sort(() => Math.random() - .5).slice(0, 3), 'Right, Across, Left, Left, Across, Right, courtesy Across.'));
  return [fam('position', pos), fam('next', next), fam('route', route), fam('courtesy', court), fam('blind', blind), fam('jokers', jok), fam('totals', totals), fam('order', order), fam('which', which.concat(howMany)), bankFam('bank', CHAR_BANK)];
}

// Turn
const EXP_SETS = (() => { const out = [[]]; [3, 4, 5].forEach(a => { out.push([a]); [3, 4, 5].forEach(b => { if (b >= a) { out.push([a, b]); [3, 4, 5].forEach(c => { if (c >= b) out.push([a, b, c]); }); } }); }); return out; })();
function expHtml(sizes, label) {
  if (!sizes.length) return label ? '<p class="small">Nothing is exposed.</p>' : '<p class="small">You have nothing exposed.</p>';
  const used = [];
  const groups = sizes.map(n => { let t; do t = pick(GROUPABLE); while (used.includes(t)); used.push(t); const g = []; for (let i = 0; i < n; i++) g.push(i < 3 || n === 4 && i < 4 ? t : 'J'); if (n === 4 && Math.random() < .4) g[3] = 'J'; return g; });
  return `<p class="small">${label || 'Exposed on your rack'}:</p><div class="rack">${groups.map(g => `[[${g.join(' ')}|28]]`).join('')}</div>`;
}
function famsTurn() {
  const hidden = [];
  EXP_SETS.forEach(sz => {
    const e = sz.reduce((a, b) => a + b, 0);
    ['draw', 'discard'].forEach(when => {
      const total = when === 'draw' ? 14 : 13, ans = total - e;
      if (ans < 1) return;
      hidden.push(Q(`t-hid:${sz.join('')}:${when}`, `${expHtml(sz)}<p class="q">You just ${when === 'draw' ? 'drew' : 'discarded'}. How many tiles are <b>hidden</b> on your rack?</p>`,
        String(ans), uniqueNums(ans, [ans - 1, ans + 1, ans - 2, ans + 2, 13, 14], 3).map(String),
        `${total} total, minus ${e} exposed, leaves ${ans} hidden.`));
    });
  });
  const check = [];
  EXP_SETS.forEach(sz => {
    const e = sz.reduce((a, b) => a + b, 0);
    [-1, 0, 1].forEach(dl => {
      const h = 13 - e + dl;
      if (h < 1) return;
      const ans = dl === 0 ? 'That\'s right' : dl > 0 ? 'Too many tiles' : 'Too few tiles';
      check.push(Q(`t-chk:${sz.join('')}:${dl}`, `${expHtml(sz)}<div class="qfig discfig">[[${Array(h).fill('X').join(' ')}|18]]<span>${h} hidden</span></div><p class="q">It\'s between turns and you have <b>${h}</b> hidden tiles. Is your count right?</p>`,
        ans, ['That\'s right', 'Too many tiles', 'Too few tiles'], `Between turns you need 13 in all. ${e} exposed + ${h} hidden = ${e + h}.`));
    });
  });
  const say = ALL_KINDS.map(c => {
    const p = parseTile(c);
    const word = p.kind === 'suit' ? `${NUM_WORD[p.n]} ${SUIT_NAME[p.suit]}` : p.kind === 'dragon' ? (p.which === 'soap' ? 'Soap' : tn(c)) : tn(c);
    let wrong;
    if (p.kind === 'suit') wrong = ['b', 'c', 'd'].filter(s => s !== c[0]).map(s => `${NUM_WORD[p.n]} ${SUIT_NAME[SUIT_LETTER[s]]}`).concat([`${NUM_WORD[p.n === 9 ? 8 : p.n + 1]} ${SUIT_NAME[p.suit]}`]);
    else wrong = shuffle(['North', 'East', 'West', 'South', 'Red Dragon', 'Green Dragon', 'Soap', 'Flower', 'Joker'].filter(x => x !== word)).slice(0, 3);
    return Q('t-say:' + c, `<p class="small">You\'re discarding this tile.</p>[[${c}|72]]<p class="q">What do you say?</p>`, `"${word}"`, wrong.map(w => `"${w}"`), 'Say the tile clearly as you discard it.');
  });
  return [fam('hidden', hidden), fam('check', check), fam('say', say), bankFam('bank', TURN_BANK)];
}

// Calls
function famsCalls() {
  const xcalls = [];
  GROUPABLE.forEach(t => [3, 4, 5].forEach(s => {
    for (let nat = 0; nat <= Math.min(3, s - 1); nat++) for (let jok = 0; jok <= 2; jok++) {
      if (nat + jok === 0) continue;
      const need = s - 1, ok = nat + jok >= need;
      const rack = Array(nat).fill(t).concat(Array(jok).fill('J'));
      xcalls.push(Q(`k-x:${t}:${s}:${nat}:${jok}`,
        `${discardFig(t)}<p class="small">The latest discard is the <b>${tn(t)}</b>. Your X line needs a <b>${SIZE_NAME[s]}</b> of ${tnp(t)}. These are on your rack:</p>${tilesHtml(rack, 40)}<p class="q">Can you call it?</p>`,
        ok ? `Yes, expose ${s} tiles` : 'No, not enough supporting tiles',
        [`Yes, expose ${s} tiles`, 'No, not enough supporting tiles', 'Yes, take it now and finish the group later', 'No, jokers can\'t be used in a call'],
        `A ${SIZE_NAME[s]} call needs ${need} supporting tiles from your rack. You have ${nat + jok}${jok ? ' (jokers count)' : ''}.`));
    }
  }));
  const ccalls = [];
  GROUPABLE.forEach(t => [false, true].forEach(wins => ccalls.push(Q(`k-c:${t}:${wins}`,
    `${discardFig(t)}<p class="small">The latest discard is the <b>${tn(t)}</b>. You\'re going for a <b>C (concealed)</b> line that has a pung of ${tnp(t)}. ${wins ? 'It\'s the very last tile your hand needs.' : 'Your hand still has other empty spots.'}</p><p class="q">Can you call it?</p>`,
    wins ? 'Yes, call Mah Jongg' : 'No, C hands can\'t expose',
    ['Yes, call Mah Jongg', 'No, C hands can\'t expose', 'Yes, expose the pung', 'Only with a joker'],
    wins ? 'Any hand can call the tile that wins it.' : 'A concealed hand can only call its winning tile.'))));
  const pairs = [];
  GROUPABLE.forEach(t => [false, true].forEach(wins => pairs.push(Q(`k-p:${t}:${wins}`,
    `${discardFig(t)}<p class="small">The latest discard is the <b>${tn(t)}</b>. You hold one ${tn(t)} and it would make a pair your line needs. ${wins ? 'That pair is the last thing your hand needs.' : 'Other spots in your hand are still empty.'}</p><p class="q">Can you call it?</p>`,
    wins ? 'Yes, for Mah Jongg' : 'No, pairs can only be called to win',
    ['Yes, for Mah Jongg', 'No, pairs can only be called to win', 'Yes, expose the pair', 'Yes, with a joker'],
    wins ? 'A pair or single can be called only when it finishes the whole hand.' : 'You can only call a pair or single when it finishes the whole hand.'))));
  return [fam('x-calls', xcalls), fam('c-calls', ccalls), fam('pairs', pairs), bankFam('bank', CALLS_BANK)];
}

// Timing
function famsTiming() {
  const prio = [];
  SEATS.forEach(d => {
    const others = SEATS.filter(s => s !== d);
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
      const a = others[i], b = others[j];
      [['MJ', 'MJ'], ['MJ', 'EX'], ['EX', 'MJ'], ['EX', 'EX']].forEach(([ta, tb]) => {
        const name = x => x === 'MJ' ? 'Mah Jongg' : 'a pung';
        let win, why;
        if (ta !== tb) { win = ta === 'MJ' ? a : b; why = 'Mah Jongg beats a call to expose.'; }
        else {
          const dist = s => (SEATS.indexOf(s) - SEATS.indexOf(d) + 4) % 4;
          win = dist(a) < dist(b) ? a : b; why = `Same kind of call, so the player next in turn after ${d} wins it. Turns go ${d}, ${rightOf(d)}, ${acrossOf(d)}, ${leftOf(d)}.`;
        }
        prio.push(Q(`ti-p:${d}:${a}${ta}:${b}${tb}`,
          `${seatFig({ [d]: { t: 'discards', k: 'disc' }, [a]: { t: ta === 'MJ' ? 'Mah Jongg' : 'pung', k: ta === 'MJ' ? 'mj' : 'pung' }, [b]: { t: tb === 'MJ' ? 'Mah Jongg' : 'pung', k: tb === 'MJ' ? 'mj' : 'pung' } })}<p class="small">${d} discards. At the same moment, ${a} calls it for ${name(ta)} and ${b} calls it for ${name(tb)}. Nobody has exposed anything yet.</p><p class="q">Who gets the tile?</p>`,
          win, [a, b, d, 'Whoever spoke first'], why));
      });
    }
  });
  const three = [];
  SEATS.forEach(d => {
    const others = SEATS.filter(x => x !== d);
    others.forEach(m => {
      const rest = others.filter(x => x !== m);
      three.push(Q(`ti-3a:${d}:${m}`, `${seatFig({ [d]: { t: 'discards', k: 'disc' }, [m]: { t: 'Mah Jongg', k: 'mj' }, [rest[0]]: { t: 'pung', k: 'pung' }, [rest[1]]: { t: 'pung', k: 'pung' } })}<p class="small">${d} discards. ${m} calls it for Mah Jongg. ${rest[0]} and ${rest[1]} both call it for a pung.</p><p class="q">Who gets the tile?</p>`,
        m, others.concat(['Whoever spoke first']), 'Mah Jongg beats every call to expose, no matter the seat.'));
      const dist = s => (SEATS.indexOf(s) - SEATS.indexOf(d) + 4) % 4;
      const win = dist(rest[0]) < dist(rest[1]) ? rest[0] : rest[1];
      three.push(Q(`ti-3b:${d}:${m}`, `${seatFig({ [d]: { t: 'discards', k: 'disc' }, [m]: { t: 'pung', k: 'pung' }, [rest[0]]: { t: 'Mah Jongg', k: 'mj' }, [rest[1]]: { t: 'Mah Jongg', k: 'mj' } })}<p class="small">${d} discards. ${rest[0]} and ${rest[1]} both call it for Mah Jongg. ${m} calls it for a pung.</p><p class="q">Who gets the tile?</p>`,
        win, others.concat(['Whoever spoke first']), `Two Mah Jongg calls, so the one next in turn after ${d} wins it.`));
    });
  });
  const windows = [
    ['picks up the wall tile', true], ['looks at the wall tile', true], ['taps the wall tile on their rack', true],
    ['draws and racks the wall tile', false], ['discards', false], ['declares Mah Jongg', false], ['starts a joker swap', false]
  ].map(([act, open]) => Q('ti-w:' + act, `<p class="small">A tile was just discarded. The next player ${act}.</p><p class="q">Can you still call the discard?</p>`,
    open ? 'Yes, the window is still open' : 'No, the window has closed', ['Yes, the window is still open', 'No, the window has closed'],
    open ? 'Only racking the drawn tile, discarding, declaring or starting a swap closes it.' : 'That closes the window.'));
  windows.push(Q('ti-w:named', '<p class="small">The discarder just named the tile out loud.</p><p class="q">Is the window to call it open?</p>', 'Yes', ['Yes', 'No, not until it touches the table'], 'Named or touching the table, whichever comes first.'));
  windows.push(Q('ti-w:touch', '<p class="small">The discard touched the table before it was named.</p><p class="q">Is the window to call it open?</p>', 'Yes', ['Yes', 'No, not until it\'s named'], 'Named or touching the table, whichever comes first.'));
  const after = [], skipped = [];
  SEATS.forEach(d => SEATS.filter(c => c !== d).forEach(c => {
    after.push(Q(`ti-a:${d}:${c}`, `${seatFig({ [d]: { t: 'discards', k: 'disc' }, [c]: { t: 'calls', k: 'call' } })}<p class="small">${d} discards and ${c} calls it, exposes, and discards.</p><p class="q">Who plays next?</p>`, rightOf(c), SEATS.filter(x => x !== c),
      `Play continues from the caller, so the next turn goes to the player on ${c}'s right.`));
    const skip = []; let s = rightOf(d); while (s !== c) { skip.push(s); s = rightOf(s); }
    const ans = skip.length ? skip.join(' and ') : 'Nobody';
    const wr = ['Nobody', d].concat(SEATS.filter(x => x !== d && x !== c)).concat([SEATS.filter(x => x !== d && x !== c).join(' and ')]);
    skipped.push(Q(`ti-s:${d}:${c}`, `${seatFig({ [d]: { t: 'discards', k: 'disc' }, [c]: { t: 'calls', k: 'call' } })}<p class="small">${d} discards and ${c} calls it.</p><p class="q">Who loses a turn?</p>`, ans, wr,
      skip.length ? `Anyone between ${d} and ${c} in turn order gets skipped, with no make-up turn.` : `${c} was next anyway, so nobody is skipped.`));
  }));
  const normal = SEATS.map(d => Q('ti-n:' + d, `${seatFig({ [d]: { t: 'discards', k: 'disc' } })}<p class="small">${d} discards and nobody calls it.</p><p class="q">Who draws next?</p>`, rightOf(d), SEATS.filter(x => x !== d), 'The player on the discarder\'s right.'));
  return [fam('priority', prio), fam('three-calls', three), fam('window', windows), fam('after-call', after), fam('skipped', skipped), fam('normal', normal), bankFam('bank', TIMING_BANK)];
}

// Jokers
function famsJokers() {
  const slot = [];
  GROUPABLE.forEach(t => {
    [[1, false], [2, false], [3, true], [4, true], [5, true], [6, true]].forEach(([n, ok]) => slot.push(Q(`j-slot:${t}:${n}`,
      `[[${t}|56]]<p class="q">Your line has ${n === 1 ? `a <b>single</b> ${tn(t)}` : `a <b>${SIZE_NAME[n]}</b> of ${tnp(t)}`}. Can a joker fill ${n === 1 ? 'it' : 'one of its spots'}?</p>`,
      ok ? 'Yes' : 'No', ['Yes', 'No'], ok ? 'Groups of three or more can take jokers.' : 'Singles and pairs need real tiles.')));
  });
  [['the N in NEWS', false], ['the 2 in a year like 2026', false], ['soap used as a 0', false], ['a pair of flowers', false], ['a kong of flowers', true], ['a hidden pung', true], ['a pair in a Singles and Pairs hand', false], ['an exposed kong', true]]
    .forEach(([what, ok]) => slot.push(Q('j-slot:' + what, `<p class="q">Can a joker fill ${what}?</p>`, ok ? 'Yes' : 'No', ['Yes', 'No'], ok ? 'It\'s a group of three or more.' : 'That spot is a single or part of a pair.')));
  return [genFam('swap', genSwap), fam('slots', slot), bankFam('bank', JOKER_BANK)];
}

// Payments
function famsPayments() {
  const items = [];
  [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75].forEach(V => WIN_TYPES.forEach(w => {
    const asks = ['total', 'other'].concat(w.disc ? ['disc'] : []);
    asks.forEach(ask => {
      let q, mult;
      if (ask === 'total') { q = 'How much does the winner collect in total?'; mult = w.total; }
      else if (ask === 'disc') { q = 'How much does the discarder pay?'; mult = w.disc; }
      else { q = w.disc ? 'How much does each player who did <b>not</b> discard pay?' : 'How much does each other player pay?'; mult = w.other; }
      const ans = V * mult;
      const mv = m => (m === 1 ? 'V' : m + 'V') + ' = ' + m * V;
      const breakdown = w.disc ? `Discarder pays ${mv(w.disc)}, the other two pay ${mv(w.other)} each, total ${w.total * V}.`
        : `No discarder. All three pay ${mv(w.other)}, total ${w.total * V}.`;
      items.push(Q(`pay:${V}:${w.id}:${ask}`, `<div class="money">Hand value <b>${V}</b>, won <b>${w.label}</b></div><p class="q">${q}</p>`, String(ans),
        uniqueNums(ans, [1, 2, 3, 4, 6, 8, 12].map(m => m * V), 3).map(String), breakdown));
    });
  }));
  const byType = WIN_TYPES.map(w => fam('pay-' + w.id, items.filter(q => q.sig.split(':')[2] === w.id)));
  return byType.concat([bankFam('bank', PAY_BANK)]);
}

// Errors
function famsErrors() {
  const counts = [];
  EXP_SETS.forEach(sz => {
    const e = sz.reduce((a, b) => a + b, 0);
    [['between turns', 13], ['right after drawing', 14]].forEach(([when, total]) => [-1, 0, 1].forEach(dl => {
      const h = total - e + dl;
      if (h < 1) return;
      counts.push(Q(`e-cnt:${sz.join('')}:${total}:${dl}`, `${expHtml(sz, 'This player\'s exposures')}<div class="qfig discfig">[[${Array(h).fill('X').join(' ')}|18]]<span>${h} hidden</span></div><p class="small">It\'s ${when} and this player has <b>${h}</b> hidden tiles.</p><p class="q">What\'s the problem, if any?</p>`,
        dl === 0 ? 'Nothing, the count is right' : dl > 0 ? 'Too many tiles, the hand may be dead' : 'Too few tiles, the hand may be dead',
        ['Nothing, the count is right', 'Too many tiles, the hand may be dead', 'Too few tiles, the hand may be dead'],
        `${when === 'between turns' ? 'Between turns' : 'Right after drawing'} the total should be ${total}. Here it\'s ${e} + ${h} = ${e + h}.`));
    }));
  });
  const exps = [];
  GROUPABLE.forEach(t => {
    exps.push(Q('e-exp-pair:' + t, `<p class="small">A player exposes this group:</p>${tilesHtml([t, 'J'], 50)}<p class="q">Is that a legal exposure?</p>`, 'No, a pair can\'t use a joker', ['Yes, it\'s fine', 'No, a pair can\'t use a joker'], 'An illegal exposure can make the hand dead.'));
    exps.push(Q('e-exp-pung:' + t, `<p class="small">A player exposes this group for an X hand:</p>${tilesHtml([t, t, 'J'], 50)}<p class="q">Is that a legal exposure?</p>`, 'Yes, it\'s fine', ['Yes, it\'s fine', 'No, a pung can\'t use a joker'], 'Pungs can take jokers.'));
  });
  ['b', 'c', 'd'].forEach(s => { for (let k = 1; k <= 7; k++) exps.push(Q(`e-exp-run:${s}${k}`, `<p class="small">A player exposes this group:</p>${tilesHtml([s + k, s + (k + 1), s + (k + 2)], 50)}<p class="q">Is that a legal exposure?</p>`, 'No, runs aren\'t groups', ['Yes, it\'s fine', 'No, runs aren\'t groups'], 'You can\'t call or expose a run.')); });
  const dead = [['draw tiles', false], ['call discards', false], ['swap for jokers', false], ['discard', false], ['declare Mah Jongg', false], ['pay the winner', true], ['have jokers taken from its earlier legal exposures', true]]
    .map(([act, ok]) => Q('e-dead:' + act, `<p class="q">Once a hand is agreed to be dead, can it still ${act}?</p>`, ok ? 'Yes' : 'No', ['Yes', 'No'], 'A dead hand stops playing but still pays, and its exposed jokers stay available.'));
  return [fam('counts', counts), fam('exposures', exps), fam('dead', dead), bankFam('bank', ERR_BANK)];
}

// Choosing hands
function famsChoose() {
  const CS = (typeof window !== 'undefined' && window.CardSchool) || null;
  const useful = [];
  SUITED.forEach(t => { for (let n = 1; n <= 4; n++) for (let s = 1; s <= 5; s++) useful.push(Q(`ch-use:${t}:${n}:${s}`,
    `<p class="small">You hold ${['', 'one', 'two', 'three', 'four'][n]} ${plural(n, tn(t), tnp(t))}. Your line needs ${s === 1 ? `a <b>single</b> ${tn(t)}` : `a <b>${SIZE_NAME[s]}</b> of ${tnp(t)}`}.</p>${tilesHtml(Array(n).fill(t), 40)}<p class="q">How many of them are useful for that group?</p>`,
    String(Math.min(n, s)), ['0', '1', '2', '3', '4'], `Count each tile once, only up to the size of the group (${s}).`)); });
  if (!CS) return [fam('useful', useful), bankFam('bank', CHOOSE_BANK)];

  /* Your 13 tiles + 4 hands from the card: pick the one with the most tiles that match.
     gap = how much the winner beats the next best (1 = a close race). */
  const catName = id => CS.CATS.find(c => c.id === id).name;
  function rackQ(gap) {
    for (let tries = 0; tries < 80; tries++) {
      const d = CS.deal(x => x.ranked[0].matched >= 4 && x.ranked[0].matched <= 9 && x.ranked[0].matched > x.ranked[1].matched - 1);
      const top = d.ranked[0];
      if (d.ranked[1].matched >= top.matched && d.ranked[1].line.cat !== top.line.cat) continue;
      const usedCat = new Set([top.line.cat]);
      const pool = shuffle(d.ranked.slice(1).filter(r => r.matched < top.matched));
      const others = [];
      // one close competitor at exactly top - gap, then two more lower ones
      const close = pool.find(r => r.matched === top.matched - gap && !usedCat.has(r.line.cat));
      if (!close) continue;
      others.push(close); usedCat.add(close.line.cat);
      pool.forEach(r => { if (others.length < 3 && !usedCat.has(r.line.cat) && r.matched < top.matched && r.matched >= 1) { others.push(r); usedCat.add(r.line.cat); } });
      if (others.length < 3) continue;
      const opts = shuffle([top].concat(others));
      const label = r => CS.lineHtml(r.line, `<span class="pl-cat">${catName(r.line.cat)}</span>`);
      const counts = opts.map((r, k) => `<li>${r === top ? '<b>' : ''}${catName(r.line.cat)}: ${r.matched} ${r.matched === 1 ? 'tile matches' : 'tiles match'}${r === top ? ' (the winner)</b>' : ''}</li>`).join('');
      return {
        type: 'choice', lineopts: true,
        sig: 'ch-rack:' + d.rack.join('') + '|' + opts.map(r => r.line.id).join(','),
        prompt: `<p class="small">Your 13 tiles</p><div class="prack">${d.rack.map(c => `<span class="rt">${renderTile(c, 34)}</span>`).join('')}</div><p class="q">Which hand matches the most of your tiles?</p><p class="small">Count jokers too, but only in groups of 3 or more.</p>`,
        options: opts.map(label),
        answer: opts.indexOf(top),
        explain: `The hand with the most matching tiles wins. ${top.matched} beats ${close.matched}.<ul class="cntlist">${counts}</ul>${top.line.vars ? `This hand lets you choose the numbers. With your tiles it works best starting at <b>${top.x}</b>, not the ${top.line.vars[0]} printed on the card. ` : ''}The winner, built from your tiles (faded tiles are still missing):${CS.buildHtml(top, 24)}`
      };
    }
    return null;
  }
  const rackFam = (name, gap) => ({ name, gen: () => rackQ(gap) || rackQ(1) });
  return [rackFam('rack-close', 1), rackFam('rack-clear', 2), rackFam('rack-close2', 1), rackFam('rack-mid', 3), fam('useful', useful), bankFam('bank', CHOOSE_BANK)];
}

// Pivots
function famsPivots() {
  const size = [], conc = [];
  GROUPABLE.forEach(t => {
    [3, 4, 5].forEach(s1 => [3, 4, 5].forEach(s2 => size.push(Q(`pv-sz:${t}:${s1}:${s2}`,
      `<div class="qfig">${tilesHtml(Array.from({ length: s1 }, (_, i) => i < 3 || (s1 === 4 && i < 4) ? t : 'J'), 38)}</div><p class="small">You exposed a <b>${SIZE_NAME[s1]}</b> of ${tnp(t)}. Another X line needs a <b>${SIZE_NAME[s2]}</b> of ${tnp(t)}.</p><p class="q">Can you switch to it?</p>`,
      s1 === s2 ? 'Yes, the exposure fits' : 'No, the size is locked', ['Yes, the exposure fits', 'No, the size is locked'],
      s1 === s2 ? 'Same tile, same size. It fits.' : 'An exposure can\'t grow or shrink, so it has to match exactly.'))));
    [3, 4].forEach(s1 => conc.push(Q(`pv-c:${t}:${s1}`, `<div class="qfig">${tilesHtml(Array(s1).fill(t), 38)}</div><p class="small">You exposed a ${SIZE_NAME[s1]} of ${tnp(t)}.</p><p class="q">Can you switch to a C (concealed) line?</p>`,
      'No', ['No', 'Yes, if it uses that group', 'Yes, any C line'], 'Once you expose, concealed lines are off the table.')));
  });
  return [fam('size', size), fam('concealed', conc), bankFam('bank', PIVOT_BANK)];
}

// Reading
function famsReading() {
  const flowers = [];
  for (let h = 0; h <= 3; h++) for (let d = 0; d <= 4; d++) for (let e = 0; e <= 4; e++) {
    if (h + d + e > 8) continue;
    const left = 8 - h - d - e;
    flowers.push(Q(`r-f:${h}${d}${e}`, `<p class="small">You hold ${h} ${plural(h, 'flower')}, ${d} ${d === 1 ? 'is' : 'are'} discarded, and ${e} ${e === 1 ? 'is' : 'are'} exposed.</p>[[F|56]]<p class="q">How many flowers could still be out there?</p>`,
      String(left), uniqueNums(left, [left - 1, left + 1, left + 2, left - 2, 8], 3).map(String).concat(left ? ['0'] : []).filter(x => x !== String(left)).slice(0, 3),
      `Flowers start at 8. Take away ${h} + ${d} + ${e} and ${left} could be left.`));
  }
  return [genFam('count', genAvailability), fam('flowers', flowers), bankFam('bank', READ_BANK)];
}

// Defense
function famsDefense() {
  const ad = [];
  [8, 12, 16, 20].forEach(W => [5, 6, 7].forEach(N => [2, 3].forEach(o => ad.push(Q(`d-ad:${W}:${N}:${o}`,
    `${wallFig(W)}<p class="small">The wall has <b>${W}</b> tiles left. You still need <b>${N}</b> tiles. An opponent shows <b>${o}</b> exposures.</p><p class="q">What should you focus on?</p>`,
    'Defense: don\'t feed their win', ['Defense: don\'t feed their win', 'Attack: push for your own hand'], 'You\'re far away, time is short, and someone looks close. Play safe.')))));
  [44, 52, 60, 68, 76].forEach(W => [0, 1].forEach(o => [1, 2].forEach(N => ad.push(Q(`d-ad:${W}:${N}:${o}`,
    `${wallFig(W)}<p class="small">The wall has <b>${W}</b> tiles left. You need just <b>${N}</b> more ${plural(N, 'tile')}. Opponents show <b>${o}</b> ${plural(o, 'exposure')}.</p><p class="q">What should you focus on?</p>`,
    'Attack: push for your own hand', ['Defense: don\'t feed their win', 'Attack: push for your own hand'], 'You\'re close and there\'s plenty of time. Play to win.')))));
  const turns = [];
  for (let W = 8; W <= 84; W += 4) turns.push(Q(`d-turns:${W}`, `${wallFig(W)}<p class="small">There are <b>${W}</b> tiles left in the wall, and all four players are drawing.</p><p class="q">About how many more draws will you get?</p>`,
    String(W / 4), uniqueNums(W / 4, [W / 4 - 2, W / 4 + 2, W / 2, W / 4 + 4, W / 4 - 1], 3).map(String), 'Each round of play uses about four tiles, one per player.'));
  const jd = GROUPABLE.map(t => Q('d-jd:' + t, `<p class="small">You\'re far from winning and the wall is short. You must discard one of these. The ${tn(t)} fits an opponent\'s exposures. You don\'t need the joker.</p>${tilesHtml([t, 'J'], 56)}<p class="q">Which is the safer discard?</p>`,
    'The joker', ['The joker', `The ${tn(t)}`], 'Nobody can call a discarded joker, so it\'s always a safe throw.'));
  return [fam('attack-defend', ad), fam('draws-left', turns), fam('joker-discard', jd), bankFam('bank', DEFENSE_BANK)];
}

/* ================= Drill registry ================= */
const DRILLS = {
  tiles: { title: 'Name that tile', lesson: 'tiles', size: 10, fams: famsTiles },
  dragons: { title: 'Dragon match', lesson: 'dragons', size: 8, fams: famsDragons },
  groups: { title: 'Legal groups', lesson: 'groups', size: 10, fams: famsGroups },
  card: { title: 'Read the card', lesson: 'card', size: 10, fams: famsCard },
  setup: { title: 'Setup check', lesson: 'setup', size: 8, fams: famsSetup },
  charleston: { title: 'Charleston', lesson: 'charleston', size: 8, fams: famsCharleston },
  turn: { title: 'Count your tiles', lesson: 'turn', size: 9, fams: famsTurn },
  calls: { title: 'Call or pass?', lesson: 'calls', size: 8, fams: famsCalls },
  timing: { title: 'Timing and priority', lesson: 'timing', size: 8, fams: famsTiming },
  jokers: { title: 'Joker swaps', lesson: 'jokers', size: 9, fams: famsJokers },
  payments: { title: 'Who pays what', lesson: 'winning', size: 10, fams: famsPayments },
  errors: { title: 'Mistakes and rulings', lesson: 'errors', size: 8, fams: famsErrors },
  choose: { title: 'Pick your hand', lesson: 'choose', size: 8, fams: famsChoose },
  pivots: { title: 'Calls and pivots', lesson: 'pivots', size: 8, fams: famsPivots },
  reading: { title: 'Count the tiles', lesson: 'reading', size: 9, fams: famsReading },
  defense: { title: 'Attack or defend', lesson: 'defense', size: 8, fams: famsDefense },
  exam: {
    title: 'Final quiz', lesson: null, size: 15,
    fams: () => [bankFam('exam', EXAM_BANK)].concat(...Object.keys(DRILLS).filter(k => k !== 'exam' && k !== 'tiles' && k !== 'dragons')
      .map(k => DRILLS[k].fams().map(f => Object.assign(f, { name: k + '/' + f.name }))))
  }
};

/* ================= No-repeat picker =================
   `seen` is the list of question ids already shown (oldest first).
   Unseen questions always come first. Old ones only come back once
   there aren't enough new ones left, oldest first. Every drill has
   well over 100 questions, so nothing repeats within 100. */
const MAX_SEEN = 700;
function qHash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

function makeTest(id, seenArr) {
  const d = DRILLS[id];
  const fams = d.fams().filter(f => (f.items && f.items.length) || f.gen);
  fams.forEach(f => f.items && f.items.forEach(q => { q.h = qHash(q.sig); }));
  const all = new Set(); fams.forEach(f => f.items && f.items.forEach(q => all.add(q.h)));
  const hasGen = fams.some(f => f.gen);
  let seen = (seenArr || []).slice();
  let seenSet = new Set(seen);
  const unseenCount = () => { let n = 0; all.forEach(h => { if (!seenSet.has(h)) n++; }); return n; };
  let free = unseenCount();
  while (seen.length && free + (hasGen ? d.size : 0) < d.size) { const h = seen.shift(); seenSet.delete(h); if (all.has(h)) free++; }

  const out = [], used = new Set();
  let order = shuffle(fams), guard = 0;
  while (out.length < d.size && guard++ < 200) {
    let progressed = false;
    for (const f of order) {
      if (out.length >= d.size) break;
      let q = null;
      if (f.items) {
        const c = f.items.filter(x => !seenSet.has(x.h) && !used.has(x.h));
        if (c.length) q = pick(c);
      } else {
        for (let t = 0; t < 40 && !q; t++) { const g = f.gen(); if (!g) continue; g.h = qHash(g.sig); if (!seenSet.has(g.h) && !used.has(g.h)) q = g; }
      }
      if (q) { out.push(q); used.add(q.h); progressed = true; }
    }
    if (!progressed) { if (!seen.length) break; const h = seen.shift(); seenSet.delete(h); }
    order = shuffle(order);
  }
  out.forEach(q => { if (q.prompt && !q.grid && !/\[\[|<svg|qfig|pline|cardline|money/.test(q.prompt)) { const f = autoFig(q.prompt); if (f) q.prompt = f + q.prompt; } });
  return { qs: shuffle(out), seen, total: all.size, hasGen };
}
function markSeen(seen, h) {
  const i = seen.indexOf(h);
  if (i >= 0) seen.splice(i, 1);
  seen.push(h);
  while (seen.length > MAX_SEEN) seen.shift();
  return seen;
}
function poolSize(id) {
  const fams = DRILLS[id].fams();
  const n = new Set(); fams.forEach(f => f.items && f.items.forEach(q => n.add(q.sig)));
  return { total: n.size, hasGen: fams.some(f => f.gen) };
}
Object.keys(DRILLS).forEach(k => { DRILLS[k].make = () => makeTest(k, []).qs; });

if (typeof module !== 'undefined') module.exports = { DRILLS, makeTest, markSeen, poolSize };
