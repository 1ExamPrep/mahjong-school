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
  { q: 'Your hand has a dead hand at the table. Does that player pay the winner?', a: 'Yes, dead hands still pay', w: ['No', 'Only half', 'Only on a self-draw'], e: 'Dead hands still pay.' },
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

/* ================= Drill registry ================= */
function mix(n, gens) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(gens[i % gens.length]());
  return shuffle(out);
}
function makeFromBankAndGen(gen, genCount, bank, bankCount) {
  const qs = [];
  for (let i = 0; i < genCount; i++) qs.push(gen());
  return shuffle(qs.concat(bankQs(bank, bankCount)));
}

const DRILLS = {
  tiles: { title: 'Name that tile', lesson: 'tiles', make: () => Array.from({ length: 10 }, genTileId) },
  dragons: { title: 'Dragon match', lesson: 'dragons', make: () => Array.from({ length: 8 }, genDragon) },
  groups: { title: 'Legal groups', lesson: 'groups', make: () => Array.from({ length: 10 }, genGroup) },
  card: { title: 'Read the card', lesson: 'card', make: () => makeFromBankAndGen(genCardRack, 6, CARD_BANK, 4) },
  setup: { title: 'Setup check', lesson: 'setup', make: () => bankQs(SETUP_BANK, 8) },
  charleston: { title: 'Charleston', lesson: 'charleston', make: () => shuffle(ORDER_QS.map(q => Object.assign({}, q)).concat(bankQs(CHAR_BANK, 6))) },
  turn: { title: 'Count your tiles', lesson: 'turn', make: () => makeFromBankAndGen(genTurn, 6, TURN_BANK, 3) },
  calls: { title: 'Call or pass?', lesson: 'calls', make: () => bankQs(CALLS_BANK, 8) },
  timing: { title: 'Timing and priority', lesson: 'timing', make: () => bankQs(TIMING_BANK, 8) },
  jokers: { title: 'Joker swaps', lesson: 'jokers', make: () => makeFromBankAndGen(genSwap, 5, JOKER_BANK, 4) },
  payments: { title: 'Who pays what', lesson: 'winning', make: () => makeFromBankAndGen(genPayment, 7, PAY_BANK, 3) },
  errors: { title: 'Mistakes and rulings', lesson: 'errors', make: () => bankQs(ERR_BANK, 8) },
  choose: { title: 'Pick your hand', lesson: 'choose', make: () => bankQs(CHOOSE_BANK) },
  pivots: { title: 'Calls and pivots', lesson: 'pivots', make: () => bankQs(PIVOT_BANK) },
  reading: { title: 'Count the tiles', lesson: 'reading', make: () => makeFromBankAndGen(genAvailability, 6, READ_BANK, 3) },
  defense: { title: 'Attack or defend', lesson: 'defense', make: () => bankQs(DEFENSE_BANK) },
  exam: { title: 'Final quiz', lesson: null, make: () => bankQs(EXAM_BANK) }
};

if (typeof module !== 'undefined') module.exports = { DRILLS };
