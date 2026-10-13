/* "Ask about the rules": an offline rules helper.
   It matches a question against a library of answers built from
   hand-written FAQs, the lessons, and every quiz explanation. No server needed. */
(function () {
  const L = (id, t) => ` <a class="asklink" href="#/lesson/${id}">${t || 'Open the lesson'}</a>`;

  const FAQ = [
    // tiles
    { q: ['how many tiles are in a set', 'how many tiles total', 'number of tiles'], k: 'tiles set total 152', a: 'An American mahjong set has <b>152 tiles</b>: 108 suit tiles (Bams, Craks, Dots, 1 to 9, four of each), 16 winds, 12 dragons, 8 flowers and 8 jokers. Put any blanks or extra jokers back in the box.', l: 'tiles' },
    { q: ['what are the three suits', 'what are the suits', 'bams craks dots'], k: 'suit suits bam crak dot', a: 'The three suits are <b>Bams</b> (bamboo sticks), <b>Craks</b> (a Chinese number over the red 萬) and <b>Dots</b> (circles). Each runs 1 to 9 with four of each tile.[[b5 c5 d5|34]]', l: 'tiles' },
    { q: ['is the bird a flower', 'what is the bird tile', 'peacock tile'], k: 'bird peacock sparrow flower 1 bam one', a: 'No. The bird (often a peacock) is the <b>1 Bam</b>, a normal numbered tile. Flowers are separate tiles.[[b1 F|40]]', l: 'tiles' },
    { q: ['what are the winds', 'how many winds'], k: 'wind winds north east west south news', a: 'There are four winds: <b>North, East, West and South</b>, four of each (16 total). They have no suit and no number. One of each together is called <b>NEWS</b>.[[N E W S|34]]', l: 'tiles' },
    { q: ['how many flowers are there', 'are all flowers the same'], k: 'flower flowers eight same', a: 'There are <b>8 flowers</b>. Different sets print different pictures on them, but in American mahjong <b>every flower counts as the same tile</b>. Because there are 8, a flower group can have more than 4 real flowers.[[F|40]]', l: 'tiles' },
    // dragons
    { q: ['which dragon goes with which suit', 'what dragon matches bams', 'matching dragon'], k: 'dragon match matching suit green red white soap pair', a: 'Each suit has a partner dragon:<br>• <b>Bams → Green Dragon</b> 發<br>• <b>Craks → Red Dragon</b> 中<br>• <b>Dots → White Dragon (soap)</b><br>When the card says "matching dragon," use the dragon of the same suit.[[b8 DG c8 DR d8 DW|30]]', l: 'dragons' },
    { q: ['what is soap', 'what is the white dragon', 'soap tile'], k: 'soap white dragon zero blank frame', a: '<b>Soap</b> is the White Dragon, usually drawn as an empty blue frame. It goes with Dots. When the card shows a <b>0</b> (like in 2026), you use soap for the zero. As a zero, soap has no suit.[[DW|44]]', l: 'dragons' },
    { q: ['what does 0 mean on the card', 'zero in the year'], k: 'zero 0 year 2026 soap', a: 'A <b>0</b> on the card is played with <b>soap</b> (the White Dragon). In a year like 2026, the 0 is one soap tile, and it can\'t be replaced by a joker because it\'s a single.', l: 'dragons' },
    // groups
    { q: ['what are the group names', 'group sizes', 'all the groups'], k: 'pung kong quint sextet pair single group three four five six kind', a: 'Groups of identical tiles:<br>• <b>Pair</b>: 2<br>• <b>Pung</b>: 3<br>• <b>Kong</b>: 4<br>• <b>Quint</b>: 5<br>• <b>Sextet</b>: 6<br>Jokers can only go in groups of 3 or more.[[d4 d4 DR DR DR N N N N|26]]', l: 'groups' },
    { q: ['what is a pung', 'pung'], k: 'pung three', a: 'A <b>pung</b> is <b>3 identical tiles</b>. It can use jokers, and it can be called from a discard for an X hand.[[DR DR DR|36]] [[b5 b5 J|36]]', l: 'groups' },
    { q: ['what is a kong', 'kong'], k: 'kong four', a: 'A <b>kong</b> is <b>4 identical tiles</b>. It can use jokers. To call one from a discard you need 3 matching tiles (or jokers) already on your rack. There\'s no replacement draw.[[N N N N|36]] [[c8 c8 J J|36]]', l: 'groups' },
    { q: ['what is a quint', 'quint'], k: 'quint five', a: 'A <b>quint</b> is <b>5 identical tiles</b>. Since there are only 4 of each tile, a quint always needs at least one joker, except flowers (there are 8).[[d3 d3 d3 d3 J|32]]', l: 'groups' },
    { q: ['what is a pair', 'pair'], k: 'pair two', a: 'A <b>pair</b> is <b>2 identical tiles</b>. Pairs can <b>never</b> use jokers, and you can only call a discard for a pair if it finishes your whole hand.[[d4 d4|36]]', l: 'groups' },
    { q: ['are runs allowed', 'can i use 1 2 3', 'sequences chow'], k: 'run runs sequence chow straight consecutive 123', a: 'No. American mahjong has <b>no runs</b> (no chows). Numbers in a row like 3 4 5 are never a callable group. When a card line shows numbers in a row, each one is a separate piece of the hand.', l: 'groups' },
    { q: ['what is news'], k: 'news north east west south singles', a: '<b>NEWS</b> is one North, one East, one West and one South. It\'s four separate singles, so <b>no jokers</b> can be used in it.[[N E W S|34]]', l: 'groups' },
    // jokers
    { q: ['where can jokers be used', 'can a joker be in a pair', 'joker rules', 'can jokers go in a pair or single'], k: 'joker jokers wild pair single where use', a: 'Jokers can only stand in for tiles in a group of <b>3 or more identical tiles</b> (pung, kong, quint, sextet). They can <b>never</b> be in a pair, a single, NEWS, or the separate digits of a year. Singles and Pairs hands use no jokers at all.<br><b>Fine:</b> [[c7 c7 J|34]]<br><b>Not allowed:</b> [[F J|34]]', l: 'jokers' },
    { q: ['how do i swap for a joker', 'joker exchange', 'take a joker from an exposure'], k: 'joker swap exchange redeem take replace exposure', a: 'On your turn, <b>after you draw</b> (or after you call and expose), find an exposed group with a joker where you hold the real tile. Hand your real tile to that group\'s owner and take the joker. You can do this more than once, then discard or declare Mah Jongg. You can\'t swap with hidden tiles.' + L('jokers'), l: 'jokers' },
    { q: ['can i pick up a discarded joker', 'can you call a joker'], k: 'discarded joker call pick up dead', a: '<b>No.</b> Nobody can call a discarded joker, not even to win. That\'s why throwing an unneeded joker is a safe defensive discard.', l: 'jokers' },
    { q: ['can i pass a joker in the charleston'], k: 'pass joker charleston', a: '<b>Never.</b> Jokers can\'t be passed in any Charleston pass, including the courtesy pass.', l: 'charleston' },
    // setup
    { q: ['how is east chosen', 'who is the dealer', 'who goes first'], k: 'east dealer first pick choose roll highest', a: 'Each player rolls both dice and the <b>highest total is East</b> (ties roll again). East is the dealer, starts with 14 tiles, and makes the first discard without drawing. After each game, East moves to the player on the right.', l: 'setup' },
    { q: ['how do you build the wall', 'how big is the wall', 'how many tiles in a wall'], k: 'wall build stacks 19 two high', a: 'Each player builds a wall in front of their rack: <b>19 stacks long, 2 tiles high</b> (38 tiles). The four walls make a square of 152 tiles.', l: 'setup' },
    { q: ['how do you break the wall', 'how do the dice work', 'what do you do with the dice'], k: 'dice roll break wall count stacks right end', a: 'East rolls <b>both dice and adds them</b>. East counts that many stacks starting from the <b>right end of East\'s own wall</b> and splits it there. Dealing starts just left of the split. The counted stacks are used last.<br>Example: 4 + 3 = 7, so count 7 stacks from the right.' + ' <a class="asklink" href="#/step3">Open Step 3</a>', l: 'setup' },
    { q: ['which wall comes next', 'which way do the walls go', 'when a wall runs out'], k: 'wall next runs out left clockwise direction order', a: 'Walls are used to the <b>left (clockwise)</b>: <b>East\'s wall → North\'s → West\'s → South\'s</b>, then back to the stacks East counted with the dice. Turns and dealing go the other way, to the <b>right</b>: East → South → West → North.' + ' <a class="asklink" href="#/step3">See the diagram</a>', l: 'setup' },
    { q: ['how do you deal', 'how many tiles does each player get', 'how many tiles do i start with'], k: 'deal dealing tiles each player 13 14 four stacks', a: 'Starting left of the break, each player takes <b>2 stacks (4 tiles)</b> in turn, going right: East, South, West, North. Go around <b>three times</b> (12 each). Then East takes the top tile of the 1st and 3rd stacks (14 total), and the others each take 1 more (13).' + ' <a class="asklink" href="#/step3/deal">Practice the deal</a>', l: 'setup' },
    { q: ['which way does play go', 'which direction are turns'], k: 'direction turns right counterclockwise order play', a: 'Turns go to the <b>right</b> (counterclockwise): East, South, West, North. The wall is used the opposite way, to the left.', l: 'setup' },
    // charleston
    { q: ['how does the charleston work', 'what is the charleston', 'charleston order'], k: 'charleston pass passing order right across left trade', a: 'Before play, everyone trades tiles face down, <b>3 at a time</b>:<br>• <b>First Charleston</b> (required): Right, Across, Left<br>• <b>Second Charleston</b> (optional, all must agree): Left, Across, Right<br>• <b>Courtesy pass</b>: Across, 0 to 3 tiles<br>Never pass jokers. Pick your tiles before looking at incoming ones.' + ' <a class="asklink" href="#/step4">Open Step 4</a>', l: 'charleston' },
    { q: ['what is the courtesy pass'], k: 'courtesy pass across 0 3 smaller number', a: 'The <b>courtesy pass</b> is an optional last trade with the player <b>across</b>. Each of you names 0 to 3, and <b>the smaller number wins</b>. It happens even if the second Charleston was stopped.', l: 'charleston' },
    { q: ['what is a blind pass', 'can i pass tiles without looking'], k: 'blind pass unseen without looking steal', a: 'On the <b>first Left</b> and the <b>second Right</b> only, you can pass along 1 to 3 tiles you just received <b>without looking</b> at them. Fill the rest from your rack so it\'s still 3.', l: 'charleston' },
    { q: ['can i stop the second charleston', 'is the second charleston required'], k: 'second charleston stop optional agree', a: 'The second Charleston is <b>optional</b>. Everyone must agree, so <b>any one player can stop it</b> before it starts. Once it starts, all three passes are finished. The courtesy pass can still happen.', l: 'charleston' },
    { q: ['what should i pass in the charleston', 'what should i throw away in the charleston', 'what tiles should i get rid of'], k: 'what pass charleston strategy junk keep', a: 'Pass tiles that don\'t fit any of the 2 or 3 hands you\'re considering. Keep pairs you might need (jokers can\'t fill pairs later), and avoid passing three useful tiles together.', l: 'charleston' },
    // turns
    { q: ['what do i do on my turn', 'turn order steps'], k: 'turn draw discard steps my turn', a: 'On your turn: <b>1.</b> Draw from the wall (or call the last discard). <b>2.</b> Check if you\'ve won. <b>3.</b> Swap jokers if you want. <b>4.</b> Discard one tile face up and <b>say its name</b>.', l: 'turn' },
    { q: ['how many tiles should i have', 'tile count 13 14'], k: 'count 13 14 tiles hold hand how many', a: 'Between turns you always have <b>13</b> (hidden plus exposed). Right after you get a tile you have <b>14</b> until you discard or win. A wrong count can make your hand dead.', l: 'turn' },
    { q: ['do i get a replacement tile for a kong'], k: 'kong replacement draw extra', a: '<b>No.</b> In American mahjong a kong never gives a replacement draw.', l: 'turn' },
    { q: ['how do i name my discard', 'do i have to say my discard'], k: 'name say discard announce call out', a: 'Yes, say each discard out loud: "Seven Dot," "North," "Red Dragon," "Soap," "Flower." A discard counts once it\'s named or touches the table. If you say the wrong name, fix the name, not the tile.', l: 'turn' },
    // calls
    { q: ['when can i call a discard', 'how do i call a tile', 'can i take a discard', 'how do i pick up a discard'], k: 'call claim discard take pick up when', a: 'You can only call the <b>most recent discard</b>, and only if you use it right away to complete a <b>pung, kong, quint or sextet</b> for an X (exposed) hand, which you lay face up. You can also call any discard that <b>completes your whole hand</b> (Mah Jongg), even for a pair or single, even on a C hand.' + L('calls'), l: 'calls' },
    { q: ['can i call for a pair', 'call a single'], k: 'call pair single', a: 'Only if that tile <b>finishes your whole hand</b> for Mah Jongg. Otherwise you can\'t call for a pair or single.', l: 'calls' },
    { q: ['what is an x hand', 'what is a c hand', 'concealed hand', 'exposed hand', 'what does x mean', 'what does c mean'], k: 'xmark cmark concealed exposed hand card mark', a: '<b>X</b> on the card means you may call discards and expose groups. <b>C</b> means <b>concealed</b>: you can\'t expose anything, but you can still call the very last tile that wins.', l: 'card' },
    { q: ['can i take back an exposure', 'change my exposed group'], k: 'take back exposure change size locked', a: 'No, exposures are permanent. You can adjust a just-called group only until you discard or start a joker swap. After that its size is locked: a pung can\'t become a kong later.', l: 'calls' },
    { q: ['who gets the tile if two people call', 'call priority'], k: 'priority two call both who gets tile mah jongg next in turn', a: 'A call for <b>Mah Jongg beats a call to expose</b>. If both calls are the same kind, the player <b>next in turn</b> after the discarder gets it.', l: 'timing' },
    { q: ['when is it too late to call', 'calling window'], k: 'late window too late call draw rack', a: 'The window closes when the next player <b>draws and racks</b> their tile, discards, declares Mah Jongg, or starts a joker swap. Just picking up or looking at the wall tile doesn\'t close it.', l: 'timing' },
    { q: ['does saying wait reserve the tile'], k: 'wait reserve pause', a: 'No. "Wait" only asks for a pause. If you want the tile, say <b>"call"</b> clearly.', l: 'timing' },
    // card
    { q: ['how do i read the card', 'what do the colors mean on the card'], k: 'read card colors line suits same different', a: 'Each line is one 14-tile hand. <b>Same color = same suit; different colors = different suits</b> (colors don\'t lock to a specific suit). F is a flower, D a dragon, 0 is soap, N E W S are winds. Read the note in parentheses, check X or C, and the last number is what it pays.' + ' <a class="asklink" href="#/cardlesson">How the card works</a>', l: 'card' },
    { q: ['how do i pick which hand to go for', 'choose a hand'], k: 'choose pick hand line which go for', a: 'Sort your rack, look for a theme (evens, odds, the same number in different suits, winds), then count 2 or 3 lines in those categories. Go for the one you\'re closest to, especially if its missing spots can take jokers. Keep a backup line in mind.' + ' <a class="asklink" href="#/finder">Practice in Step 2</a>', l: 'choose' },
    { q: ['where do i get the card', 'is the real card in the app'], k: 'buy card official league nmjl yearly', a: 'The official card is sold each year by the National Mah Jongg League. This app uses a made-up practice card in the same style, so buy the current card for real games.', l: 'card' },
    // winning & paying
    { q: ['how do i win', 'how do i declare mah jongg'], k: 'win mah jongg declare winning hand', a: 'Declare <b>Mah Jongg</b> when you have exactly <b>14 tiles</b> that match one card line, with the right suits, group sizes, notes, and X or C status. Lay the hand out for everyone to check. Nobody breaks up their rack until it\'s confirmed.', l: 'winning' },
    { q: ['how does scoring work', 'who pays', 'how much do i get paid'], k: 'pay payment score money points who pays', a: 'Call the hand\'s value V:<br>• <b>On a discard</b>: discarder pays 2V, others pay V (4V total)<br>• <b>Self-drawn</b>: everyone pays 2V (6V)<br>• <b>Jokerless, on a discard</b>: discarder 4V, others 2V (8V)<br>• <b>Jokerless, self-drawn</b>: everyone 4V (12V)', l: 'winning' },
    { q: ['what is jokerless', 'jokerless bonus'], k: 'jokerless double no jokers bonus', a: 'A winning hand with <b>no jokers</b> pays double. It doesn\'t apply to Singles and Pairs hands (they never use jokers). If you swapped your jokers out before winning, it can still count as jokerless.', l: 'winning' },
    { q: ['what is a wall game', 'what if nobody wins'], k: 'wall game nobody wins draw tie', a: 'If the wall runs out with no winner, it\'s a <b>wall game</b>. Nobody pays, and East moves to the right for the next game.', l: 'winning' },
    // errors
    { q: ['what is a dead hand', 'what makes a hand dead'], k: 'dead hand mistake wrong count illegal exposure', a: 'A hand can be called <b>dead</b> for a wrong tile count, an illegal exposure, exposing a C hand, a wrong Mah Jongg, or when what\'s exposed and discarded shows it can\'t be finished. A dead hand stops playing but <b>still pays</b> the winner.', l: 'errors' },
    { q: ['what happens with a false mah jongg', 'i called mah jongg by mistake'], k: 'false mah jongg mistake wrong declare', a: 'Once committed, a wrong Mah Jongg usually makes your hand dead. You can sometimes take back a spoken declaration if no hidden tiles were shown and nothing was disturbed.', l: 'errors' },
    { q: ['can i challenge a hand'], k: 'challenge dead hand call out', a: 'Yes, but only based on what <b>everyone can see</b> (exposures and discards), never a guess about hidden tiles.', l: 'errors' },
    // strategy
    { q: ['when should i play defense', 'how to play defense'], k: 'defense defend safe discard dangerous', a: 'Play safer when an opponent\'s exposures show what they\'re waiting on, the wall is short, and you\'re still far away. Avoid tiles that could finish their line, especially pair and single tiles. Discarding an unneeded joker is always safe.', l: 'defense' },
    { q: ['how do i count what tiles are left', 'how do i know what tiles are left', 'tiles still out there'], k: 'count left remaining available tiles out', a: 'Every normal tile has 4 copies (flowers and jokers have 8). Subtract the ones in your rack, in exposures, and in the discards. What\'s left is the most that could still be out there.', l: 'reading' },
    { q: ['three players', 'can you play with three people', 'two players'], k: 'three players 3 two 2 fewer', a: '<b>Three players:</b> keep all four walls, skip the empty seat when dealing, and skip the Charleston. <b>Two players:</b> each builds two walls, no Charleston. Variants like Siamese have their own rules.', l: null }
  ];

  /* ---------- text tools ---------- */
  const STOP = new Set('a an the is are am be been do does did can could should would will i me my you your we it its of to in on at for and or if what whats how when where who why which this that there with from as by so about tell explain mean means please any some get got have has into than then them they just only also out up go goe going put use used using work mean happen know need want ok okay someone something thing like do my there one'.split(' '));
  const PHRASES = [
    [/mah\s*-?\s*jong+g?|mahjong|mahj\b/g, 'mahjongg'], [/three of a kind|3 of a kind|triple/g, 'pung'], [/four of a kind|4 of a kind/g, 'kong'],
    [/five of a kind|5 of a kind/g, 'quint'], [/six of a kind/g, 'sextet'], [/white dragon/g, 'soap'], [/wild ?cards?|wilds?\b/g, 'joker'],
    [/(throw|threw|thrown|throwing) away|toss(ed)?/g, 'discard'], [/pick(ing)? up/g, 'take'], [/claim/g, 'call'], [/dealer/g, 'east'], [/bamboo/g, 'bam'],
    [/characters?|cracks?/g, 'crak'], [/circles?/g, 'dot'], [/\bx hand|exposed hand/g, 'exposed xmark'], [/\bc hand|hidden hand|concealed hand/g, 'concealed cmark'], [/\bx\b/g, 'xmark'], [/\bc\b/g, 'cmark'],
    [/self[- ]?drawn|self[- ]?draw/g, 'selfdraw'], [/no jokers|without jokers/g, 'jokerless'], [/money|points|score|scoring|chips/g, 'pay'],
    [/sequences?|chows?|straights?/g, 'run'], [/exchange|redeem|replace/g, 'swap'], [/clockwise|counterclockwise/g, 'direction']
  ];
  const NOSTEM = new Set(['news', 'yes', 'dice', 'is', 'was', 'has', 'does', 'pass', 'across']);
  const stem = w => NOSTEM.has(w) ? w : w.length > 4 && w.endsWith('ing') ? w.slice(0, -3) : w.length > 3 && w.endsWith('es') && !w.endsWith('ses') ? w.slice(0, -2) : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w.length > 4 && w.endsWith('ed') ? w.slice(0, -2) : w;
  function toks(text) {
    let t = String(text).toLowerCase().replace(/<[^>]+>/g, ' ').replace(/\[\[[^\]]*\]\]/g, ' ');
    PHRASES.forEach(([re, r]) => { t = t.replace(re, ' ' + r + ' '); });
    return t.replace(/'s\b/g, '').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w && (w.length > 1 || /\d/.test(w)) && !STOP.has(w)).map(stem);
  }
  const plain = h => String(h).replace(/\[\[[^\]]*\]\]/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  /* ---------- library ---------- */
  let LIB = null, IDF = null;
  function build() {
    LIB = [];
    FAQ.forEach(f => LIB.push({ kind: 'faq', title: f.q[0], q: f.q.join(' ') + ' ' + f.k, qvar: f.q.join('|'), body: f.a, a: f.a, lesson: f.l }));
    if (typeof LESSONS !== 'undefined') LESSONS.forEach(les => les.sections.forEach(s => {
      LIB.push({ kind: 'lesson', title: `${les.title}: ${s.h}`, q: s.h + ' ' + les.title, body: plain(s.body), a: s.body, lesson: les.id });
    }));
    const BANKS = {
      SETUP_BANK: typeof SETUP_BANK !== 'undefined' && SETUP_BANK, CHAR_BANK: typeof CHAR_BANK !== 'undefined' && CHAR_BANK,
      TURN_BANK: typeof TURN_BANK !== 'undefined' && TURN_BANK, CALLS_BANK: typeof CALLS_BANK !== 'undefined' && CALLS_BANK,
      TIMING_BANK: typeof TIMING_BANK !== 'undefined' && TIMING_BANK, JOKER_BANK: typeof JOKER_BANK !== 'undefined' && JOKER_BANK,
      PAY_BANK: typeof PAY_BANK !== 'undefined' && PAY_BANK, ERR_BANK: typeof ERR_BANK !== 'undefined' && ERR_BANK,
      CHOOSE_BANK: typeof CHOOSE_BANK !== 'undefined' && CHOOSE_BANK, PIVOT_BANK: typeof PIVOT_BANK !== 'undefined' && PIVOT_BANK,
      READ_BANK: typeof READ_BANK !== 'undefined' && READ_BANK, DEFENSE_BANK: typeof DEFENSE_BANK !== 'undefined' && DEFENSE_BANK,
      CARD_BANK: typeof CARD_BANK !== 'undefined' && CARD_BANK, DRAGON_BANK: typeof DRAGON_BANK !== 'undefined' && DRAGON_BANK,
      EXAM_BANK: typeof EXAM_BANK !== 'undefined' && EXAM_BANK
    };
    const banks = ['SETUP_BANK', 'CHAR_BANK', 'TURN_BANK', 'CALLS_BANK', 'TIMING_BANK', 'JOKER_BANK', 'PAY_BANK', 'ERR_BANK', 'CHOOSE_BANK', 'PIVOT_BANK', 'READ_BANK', 'DEFENSE_BANK', 'CARD_BANK', 'DRAGON_BANK', 'EXAM_BANK'];
    const lessonFor = { SETUP_BANK: 'setup', CHAR_BANK: 'charleston', TURN_BANK: 'turn', CALLS_BANK: 'calls', TIMING_BANK: 'timing', JOKER_BANK: 'jokers', PAY_BANK: 'winning', ERR_BANK: 'errors', CHOOSE_BANK: 'choose', PIVOT_BANK: 'pivots', READ_BANK: 'reading', DEFENSE_BANK: 'defense', CARD_BANK: 'card', DRAGON_BANK: 'dragons', EXAM_BANK: null };
    banks.forEach(name => {
      const bank = BANKS[name];
      (bank || []).forEach(it => LIB.push({ kind: 'quiz', title: it.q, q: it.q, body: it.a + ' ' + (it.e || ''), a: `<b>${it.a}.</b> ${it.e || ''}`, lesson: lessonFor[name] }));
    });
    LIB.forEach(d => { d.qt = toks(d.q); d.bt = toks(d.body); d.all = new Set(d.qt.concat(d.bt)); d.qvs = (d.qvar ? d.qvar.split('|') : [d.q]).map(v => new Set(toks(v))); });
    const df = {};
    LIB.forEach(d => d.all.forEach(w => { df[w] = (df[w] || 0) + 1; }));
    IDF = {}; Object.keys(df).forEach(w => { IDF[w] = Math.log(1 + LIB.length / df[w]); });
  }
  function search(question) {
    if (!LIB) build();
    const qt = [...new Set(toks(question))];
    if (!qt.length) return [];
    return LIB.map(d => {
      const qs = new Set(d.qt), bs = new Set(d.bt);
      let s = 0, hits = 0;
      qt.forEach(w => {
        const idf = IDF[w] || 0;
        if (qs.has(w)) { s += idf * 2.2; hits++; } else if (bs.has(w)) { s += idf * .7; hits++; }
      });
      s *= (hits / qt.length) ** 1.2;
      const dens = Math.max(...d.qvs.map(v => v.size ? qt.filter(w => v.has(w)).length / v.size : 0));
      s *= 1 + 1.1 * dens;
      if (d.kind === 'faq') s *= 1.35; else if (d.kind === 'lesson') s *= 1.05;
      return { d, s };
    }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  }

  /* ---------- page ---------- */
  const SUGGEST = ['Can a joker be in a pair?', 'How does the Charleston work?', 'Which dragon goes with Dots?', 'Who pays when someone wins?', 'Which wall comes next?', 'When can I call a discard?', 'What is a kong?', 'What is a blind pass?'];
  let history = [];
  function showAsk() {
    const m = window.MS; m.setBack('#/');
    m.app.innerHTML = `<div class="ask">
      <div class="askhead"><h1>Ask about the rules</h1><p class="small">Type any rules question. Answers come from this app's lessons and rule library, and work offline.</p></div>
      <div class="chat" id="chat"></div>
      <form class="askbar" id="askf" autocomplete="off"><input id="askin" type="text" placeholder="e.g. Can I pass a joker?" aria-label="Your question" enterkeyhint="send"><button class="btn primary" type="submit">Ask</button></form>
    </div>`;
    const chat = m.app.querySelector('#chat');
    const put = (who, html) => { chat.insertAdjacentHTML('beforeend', `<div class="msg ${who}">${html}</div>`); return chat.lastElementChild; };
    const scroll = () => { const last = chat.lastElementChild; if (last) last.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    const chips = list => `<div class="askchips">${list.map(s => `<button type="button" class="chipq">${s}</button>`).join('')}</div>`;
    const wire = el => el.querySelectorAll('.chipq').forEach(b => { b.onclick = () => ask(b.textContent); });

    function answer(q) {
      const low = q.toLowerCase().trim();
      if (/^(hi|hello|hey|good (morning|evening|afternoon))\b/.test(low)) return { html: 'Hi! Ask me anything about the rules of American mahjong, like how the Charleston works or where jokers can go.', more: SUGGEST.slice(0, 4) };
      if (/^(thanks|thank you|thx|ty)\b/.test(low)) return { html: 'You\'re welcome! Ask another question any time.', more: [] };
      const res = search(q);
      if (!res.length || res[0].s < 1.4) {
        return { html: 'I\'m not sure about that one. Try asking with key words like <b>joker</b>, <b>Charleston</b>, <b>call</b>, <b>pung</b>, <b>dragon</b>, <b>wall</b> or <b>pay</b>. Here are some questions I can answer:', more: shuffle(SUGGEST).slice(0, 4) };
      }
      const top = res[0].d;
      let html = m.expandTiles(top.a, 30);
      if (top.kind === 'lesson') html = `<p class="srcline">From the lesson <b>${top.title}</b>:</p>${html}`;
      if (top.lesson && !/asklink/.test(top.a)) html += ` <a class="asklink" href="#/lesson/${top.lesson}">Open the lesson</a>`;
      const seen = new Set([top.title]);
      const more = [];
      res.slice(1).forEach(r => {
        if (more.length >= 3 || r.s < res[0].s * .45) return;
        const t = r.d.kind === 'faq' ? r.d.title : r.d.kind === 'quiz' ? r.d.title : null;
        if (!t || seen.has(t)) return;
        seen.add(t); more.push((t.charAt(0).toUpperCase() + t.slice(1)).replace(/\bi\b/g, 'I').replace(/\?*$/, '?'));
      });
      return { html, more };
    }

    function ask(q) {
      q = q.trim(); if (!q) return;
      put('me', q.replace(/</g, '&lt;'));
      const typing = put('bot typing', '<span></span><span></span><span></span>');
      scroll();
      setTimeout(() => {
        typing.remove();
        const r = answer(q);
        const el = put('bot', r.html + (r.more && r.more.length ? `<p class="small relq">Related:</p>${chips(r.more)}` : ''));
        wire(el); scroll();
        history.push({ q, a: r.html });
      }, 420);
    }

    if (history.length) history.forEach(h => { put('me', h.q.replace(/</g, '&lt;')); wire(put('bot', h.a)); });
    else { const w = put('bot', `Hi! I can explain the rules of American mahjong. Ask a question, or tap one of these:${chips(SUGGEST.slice(0, 6))}`); wire(w); }
    const f = m.app.querySelector('#askf'), inp = m.app.querySelector('#askin');
    f.onsubmit = e => { e.preventDefault(); const v = inp.value; inp.value = ''; ask(v); };
  }

  window.AskSchool = { showAsk, search, FAQ, _build: build };
})();
