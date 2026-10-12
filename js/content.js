/* Lessons for Mahjong School.
   [[b5 b5 J]] renders a row of tiles. Add |48 to set size, like [[DR|48]].
   Practice lines are invented for teaching. They are not hands from the NMJL card. */

const LESSONS = [
  /* ---------------- BEGINNER ---------------- */
  {
    id: 'tiles', stage: 'Beginner', title: 'Know the tiles', drill: 'tiles',
    summary: 'The 152 tiles, the three suits, honors, flowers and jokers.',
    sections: [
      { h: 'The full set', body: `
        <p>American mahjong is played with <b>152 tiles</b>. A lot of sets come with a few blank tiles and extra jokers. Put those back in the box before you start.</p>
        <table class="t">
          <tr><th>Group</th><th>What's in it</th><th>Total</th></tr>
          <tr><td>Bams</td><td>1 to 9, four of each</td><td>36</td></tr>
          <tr><td>Craks</td><td>1 to 9, four of each</td><td>36</td></tr>
          <tr><td>Dots</td><td>1 to 9, four of each</td><td>36</td></tr>
          <tr><td>Winds</td><td>North, East, West, South, four each</td><td>16</td></tr>
          <tr><td>Dragons</td><td>Red, Green, White, four each</td><td>12</td></tr>
          <tr><td>Flowers</td><td>Eight, all interchangeable</td><td>8</td></tr>
          <tr><td>Jokers</td><td>Eight wild tiles with limits</td><td>8</td></tr>
        </table>` },
      { h: 'The three suits', body: `
        <p><b>Bams</b> (bamboo)</p>[[b1 b2 b5 b9]]
        <p><b>Craks</b> (characters)</p>[[c1 c3 c6 c9]]
        <p><b>Dots</b> (circles)</p>[[d1 d4 d7 d9]]` },
      { h: 'Honors, flowers and jokers', body: `
        <p><b>Winds</b></p>[[N E W S]]
        <p><b>Dragons:</b> red (中), green (發) and white. The white one is an empty frame called <b>soap</b>.</p>[[DR DG DW]]
        <p><b>Flowers</b> come with different pictures and numbers, but in American play they're all the same tile.</p>[[F]]
        <p><b>Jokers</b> are wild, but only in certain spots. You'll learn those in lesson 3.</p>[[J]]` },
      { h: 'Watch out for the bird', body: `
        <p>On most sets the 1 Bam is drawn as a bird, often a peacock. It's still the numbered 1 Bam. It is <b>not</b> a flower.</p>[[b1 F|48]]` },
      { tip: true, h: 'Try this at the table', body: `
        <p>Flip 20 tiles face up and say each one out loud. Don't go by color alone. Sort flowers away from the bird, winds away from dragons, and jokers away from numbers. Keep going until you don't have to think about it.</p>` }
    ]
  },
  {
    id: 'dragons', stage: 'Beginner', title: 'Dragons and soap', drill: 'dragons',
    summary: 'Which dragon goes with which suit, and when soap means zero.',
    sections: [
      { h: 'Every suit has a dragon', body: `
        <p>Each suit has a partner dragon. Card hands often ask for "matching" or "opposite" dragons, so learn these pairs cold.</p>
        <table class="t">
          <tr><th>Suit</th><th>Its dragon</th></tr>
          <tr><td>Bams [[b5|26]]</td><td>Green [[DG|26]]</td></tr>
          <tr><td>Craks [[c5|26]]</td><td>Red [[DR|26]]</td></tr>
          <tr><td>Dots [[d5|26]]</td><td>White, called soap [[DW|26]]</td></tr>
        </table>
        <p>An easy way to remember it: bamboo is green, and craks are red like the characters on them. That leaves soap for dots.</p>` },
      { h: 'Soap as zero', body: `
        <p>When the card prints a <b>0</b>, usually in a year like 2026, you use soap for it.</p>
        <p>In that job soap has no suit. It doesn't count as a dot, and it can't be the start of a run of numbers.</p>` },
      { h: 'Equipment you need', body: `
        <ul>
          <li>Four racks and two dice</li>
          <li>A flat table</li>
          <li>One copy of the same yearly card for every player</li>
          <li>Chips or a score sheet if you want to keep score</li>
        </ul>
        <p>Pushers and a table mat are nice to have, not required.</p>` }
    ]
  },
  {
    id: 'groups', stage: 'Beginner', title: 'Groups and jokers', drill: 'groups',
    summary: 'Pungs, kongs, quints and where jokers are allowed.',
    sections: [
      { h: 'The group names', body: `
        <table class="t">
          <tr><th>Group</th><th>Size</th><th>Jokers?</th></tr>
          <tr><td>Single</td><td>1</td><td class="no">No</td></tr>
          <tr><td>Pair</td><td>2 identical</td><td class="no">No</td></tr>
          <tr><td>Pung</td><td>3 identical</td><td class="yes">Yes</td></tr>
          <tr><td>Kong</td><td>4 identical</td><td class="yes">Yes</td></tr>
          <tr><td>Quint</td><td>5 identical</td><td class="yes">Yes</td></tr>
          <tr><td>Sextet</td><td>6 identical</td><td class="yes">Yes</td></tr>
        </table>
        <p>The simple rule: <b>jokers only go in groups of three or more.</b></p>` },
      { h: 'Legal examples', body: `
        <p>A pung with one joker:</p>[[b5 b5 J]]
        <p>A kong with two jokers:</p>[[c8 c8 J J]]
        <p>A quint of 3 Dots. There are only four real 3 Dots in the set, so a quint of a number always needs at least one joker.</p>[[d3 d3 d3 d3 J]]` },
      { h: 'Not legal', body: `
        <p>A flower pair with a joker. Pairs never take jokers.</p>[[F J]]
        <p>NEWS with a joker for East. NEWS is four separate singles, so no jokers.</p>[[N J W S]]` },
      { h: 'Two things that trip people up', body: `
        <ul>
          <li><b>Flowers break the four-copy limit.</b> There are eight and they're interchangeable, so a flower kong or quint can be all real flowers.</li>
          <li><b>There are no runs.</b> Three numbers in a row is not a group you can call. If a card line shows 1 2 3, those are separate pieces of the hand.</li>
        </ul>[[b3 b4 b5]]` }
    ]
  },
  {
    id: 'card', stage: 'Beginner', title: 'Reading the card', drill: 'card',
    summary: 'Turn a printed line into real tiles in five passes.',
    sections: [
      { h: 'What the card is', body: `
        <p>Every year the National Mah Jongg League prints a card with that year's winning hands. Everyone at the table has to use the same card. You win by building exactly <b>14 tiles</b> that match one line.</p>
        <p class="note">This app doesn't include the real card. Buy the current one from the League. The practice lines here are made up so you can learn how to read them.</p>` },
      { h: 'Read a line in five passes', body: `
        <ol>
          <li><b>Count</b> the tiles and spot each group.</li>
          <li><b>Assign suits.</b> Same color means same suit. Different colors mean different suits. Colors don't lock to a suit. Green on the card doesn't have to mean bams. Flowers, winds and zero have no suit.</li>
          <li><b>Read the note in parentheses.</b> It can limit which numbers, runs or dragons you can use.</li>
          <li><b>Check X or C.</b> X means you can call and expose tiles. C means the hand stays concealed until you win.</li>
          <li><b>Read the value.</b> That's what the hand pays.</li>
        </ol>
        <p>The word "only" doesn't ban jokers. Whether a joker fits depends on the group size and any rule that says so directly.</p>` },
      { h: 'Practice line', body: `
        <div class="cardline"><span class="ln-n">FF</span> <span class="ln-a">222</span> <span class="ln-b">4444</span> <span class="ln-c">66666</span> <span class="ln-tag">X</span></div>
        <p>Three colors, so three different suits. 2 + 3 + 4 + 5 = 14 tiles. Here's one way to build it with 2s in Bams, 4s in Craks and 6s in Dots:</p>
        [[F F b2 b2 b2 c4 c4 c4 c4 d6 d6 d6 d6 J|26]]
        <p>The flower pair has to be two real flowers. The number groups can take jokers, and the quint of 6s needs one.</p>` }
    ]
  },
  {
    id: 'setup', stage: 'Beginner', title: 'Setup and the deal', drill: 'setup',
    summary: 'Build the walls, break them, and deal 14 to East and 13 to everyone else.',
    sections: [
      { h: 'Build the walls', body: `
        <p>Pick the first East, usually with a dice roll. Mix the tiles face down. Each player builds a wall <b>19 stacks long and two tiles high</b>. That's 38 per wall and 152 total.</p>` },
      { h: 'Break the wall', body: `
        <p>East rolls both dice and counts that many stacks from the <b>right end</b> of East's own wall, then splits it there. Dealing starts with the part to the left of the break. The part to the right is saved for the very end of the game.</p>
        <p>That saved part is still live. It's not a dead wall like in Asian versions.</p>` },
      { h: 'Deal the tiles', body: `
        <ol>
          <li>East takes four tiles. Then each player to the right takes four. Go around three times so everyone has 12.</li>
          <li>East takes the top tile of the first and third stacks still there, ending with 14.</li>
          <li>The other three players each take one more, ending with 13.</li>
          <li>When a wall runs out, keep going on the next wall to the left.</li>
        </ol>
        <table class="t">
          <tr><th>What moves</th><th>Direction</th></tr>
          <tr><td>Player turns</td><td>To the right (counterclockwise)</td></tr>
          <tr><td>Which wall is used next</td><td>To the left (clockwise)</td></tr>
          <tr><td>Tiles inside a wall</td><td>From the active end, top tile then bottom</td></tr>
        </table>` },
      { tip: true, h: 'The most common setup mistake', body: `
        <p>Turns go one way and the walls go the other. Before the first turn, point at the active end of the wall so everyone agrees where to draw from.</p>` }
    ]
  },
  {
    id: 'charleston', stage: 'Beginner', title: 'The Charleston', drill: 'charleston',
    summary: 'Swap tiles before play: right, across, left and back again.',
    sections: [
      { h: 'What it is', body: `
        <p>Before anyone draws, players trade tiles they don't want, face down. Two rules always apply: <b>never pass a joker</b>, and <b>pass your tiles before you look at the ones coming in</b>.</p>` },
      { h: 'The three phases', body: `
        <table class="t">
          <tr><th>Phase</th><th>Order</th><th>Rules</th></tr>
          <tr><td>First Charleston</td><td>Right, Across, Left</td><td>Three tiles each pass. Required, unless East was dealt a winning hand.</td></tr>
          <tr><td>Second Charleston</td><td>Left, Across, Right</td><td>Optional. Everyone has to agree. Once it starts, finish it.</td></tr>
          <tr><td>Courtesy pass</td><td>Across</td><td>You and the player across trade 0 to 3 tiles. The smaller number wins.</td></tr>
        </table>
        <p>Any one player can stop the second Charleston before it starts. That doesn't cancel the courtesy pass.</p>` },
      { h: 'Blind passing', body: `
        <p>Only on the <b>first Left</b> and the <b>second Right</b>, you can pass along 1 to 3 tiles you just received without looking at them. Make up the rest from your own rack so the total is still three.</p>
        <p>Example: pass two tiles from your rack plus one unseen tile that just came in.</p>` },
      { h: 'Strategy: when to stop', body: `
        <p>If your rack already has a clear direction and another round would make you give up tiles you need, stopping the second Charleston can protect your hand. If your tiles are still all over the place, more passing might help.</p>
        <p>Try not to pass a group of useful tiles together when you have random junk you could pass instead. And don't break up a pair you need just to save a weak maybe.</p>` }
    ]
  },
  {
    id: 'turn', stage: 'Beginner', title: 'A normal turn', drill: 'turn',
    summary: 'Draw, check, swap jokers, discard. And keep your count at 13.',
    sections: [
      { h: 'Who goes first', body: `
        <p>After the Charleston, East discards first without drawing, since East already has 14. If East's 14 tiles already win, East declares it.</p>` },
      { h: 'Your turn, step by step', body: `
        <ol>
          <li>Draw the next tile from the wall, unless you're calling the last discard.</li>
          <li>Check if you have a winning 14-tile hand.</li>
          <li>If you want, swap jokers out of exposures.</li>
          <li>If you haven't won, discard one tile face up and say its name.</li>
        </ol>
        <p>Say it clearly: "Seven Dot", "North", "Red Dragon", "Flower". A discard counts once it's named or touches the table, whichever comes first. If you say the wrong name, fix the name. You can't swap in a different tile.</p>` },
      { h: 'Calls change the order', body: `
        <p>When someone calls a discard, play continues from the player to the <b>caller's</b> right. Anyone who got skipped doesn't get a make-up turn.</p>` },
      { h: 'Keep your count right', body: `
        <p>Exposed tiles count. Between turns you always have <b>13</b>. Right after you get a tile you have <b>14</b> until you discard or win.</p>
        <p>Example: an exposed kong of 4 plus 9 hidden tiles = 13. Draw one and you have 10 hidden + 4 exposed = 14. Discard and you're back to 13.</p>
        [[c4 c4 c4 c4|30]]
        <p>Kongs don't give you a replacement draw in American mahjong.</p>` },
      { tip: true, h: 'A good habit', body: `
        <p>Every turn, look at the new tile, then your target line, then every exposed joker on the table. Before you discard, ask if your tile could finish what someone else is showing. Same order every time so you don't miss anything.</p>` }
    ]
  },
  {
    id: 'calls', stage: 'Beginner', title: 'Calling a discard', drill: 'calls',
    summary: 'When you can take a discarded tile, and what you must do with it.',
    sections: [
      { h: 'The basic rule', body: `
        <p>You can only take the <b>most recent discard</b>. To call it normally, you have to use it right away in a complete pung, kong, quint or sextet for an X hand. You can add jokers from your rack. Put the group face up on top of your rack, then discard. You don't draw.</p>` },
      { h: 'Can I call it?', body: `
        <table class="t">
          <tr><th>What you want to do</th><th>Allowed?</th></tr>
          <tr><td>Finish a group of 3 or more for an X hand</td><td class="yes">Yes, expose it now</td></tr>
          <tr><td>Start a group to finish later</td><td class="no">No</td></tr>
          <tr><td>Make a pair or get a single</td><td>Only if it finishes your whole hand</td></tr>
          <tr><td>Expose a group for a C hand</td><td class="no">No</td></tr>
          <tr><td>Finish any winning hand, even a C hand</td><td class="yes">Yes</td></tr>
          <tr><td>Take an older discard</td><td class="no">No</td></tr>
          <tr><td>Take a discarded joker</td><td class="no">No, not even to win</td></tr>
        </table>` },
      { h: 'Examples', body: `
        <p>To call a 5 Bam for a pung, you need two 5 Bams, or one 5 Bam and a joker, or two jokers in your rack.</p>[[b5 b5 J]]
        <p>A kong call needs three supporting tiles already on your rack. An exposure can't be all jokers, because the tile you called is always in it.</p>` },
      { h: 'After you expose', body: `
        <p>You can still switch to another X line, as long as it uses every group you've shown. You can't take an exposure back. Once you discard or start a joker swap, its size is locked. Drawing the fourth tile later won't turn a pung into a kong.</p>` },
      { tip: true, h: 'Before you say "call"', body: `
        <p>Check the tile, the group size and your card line. Calling tells everyone what you're doing and cuts your options, so don't call just because a tile matches.</p>` }
    ]
  },

  /* ---------------- CONFIDENT PLAY ---------------- */
  {
    id: 'timing', stage: 'Confident play', title: 'Timing and priority', drill: 'timing',
    summary: 'When a discard can still be called, and who gets it when two people want it.',
    sections: [
      { h: 'The calling window', body: `
        <p>The window opens when the discard is named or touches the table. It closes when the next player draws <b>and racks</b> the tile, discards, declares Mah Jongg, or starts a joker swap.</p>
        <p>Just picking up or looking at the wall tile doesn't close it. Neither does tapping it on the rack. If someone calls in time, the next player puts the drawn tile back where it came from.</p>` },
      { h: 'Who gets the tile', body: `
        <ul>
          <li>A call for <b>Mah Jongg beats a call to expose</b>.</li>
          <li>Between two similar claims, the player <b>next in turn</b> usually wins.</li>
          <li>If someone has already started exposing, that can change things. Stop and check the exact rule instead of assuming the loudest voice wins.</li>
        </ul>` },
      { h: 'Committing to a call', body: `
        <p>Putting the called tile on your rack or exposing tiles commits you. Before you discard or swap a joker, you can still adjust the new group, as long as it keeps the called tile and stays legal. After that, the size is locked.</p>` },
      { h: '"Wait" isn\'t a claim', body: `
        <p>Saying "wait" just asks for a pause. It doesn't reserve the tile. If you want it, say "call" clearly. And give everyone a fair moment to react to each discard.</p>` },
      { h: 'Two winners, one tile', body: `
        <p>If the player with priority claims Mah Jongg but their hand is wrong, another player who also claimed Mah Jongg can get the tile. If the other claim was only to expose, the tile stays with the wrong winning claim. If both had already exposed, there's no clear League guidance. At an event, get the director.</p>` }
    ]
  },
  {
    id: 'jokers', stage: 'Confident play', title: 'Jokers and exchanges', drill: 'jokers',
    summary: 'Where jokers fit and how to steal one from an exposure.',
    sections: [
      { h: 'Joker rules', body: `
        <ul>
          <li>Jokers only stand in for tiles in identical groups of three or more.</li>
          <li>They can't be singles, pairs, NEWS, or the separate pieces of a year.</li>
          <li>A hidden group can be all jokers.</li>
          <li>A discarded joker can't be called by anyone.</li>
        </ul>` },
      { h: 'How to swap for a joker', body: `
        <ol>
          <li>On your turn, draw first, or call a tile and finish your exposure.</li>
          <li>Find a joker in an exposed group, yours or anyone's, where you hold the real tile.</li>
          <li>Say you're swapping, hand the real tile to the owner of that group, and take the joker.</li>
          <li>You can do this more than once. Then discard or declare Mah Jongg.</li>
        </ol>
        <p>You can't call a discard just to swap for a joker. It has to be a real exposure. You can't swap with hidden tiles. And your tile count doesn't change, since you gave a tile to get one.</p>` },
      { h: 'Example', body: `
        <p>An opponent shows this pung:</p>[[d7 d7 J]]
        <p>After you draw, you hand them your 7 Dot and take the joker. Their group is still a pung. You can use that joker in another group of three or more, but not as the missing tile in your flower pair.</p>` },
      { h: 'The hidden cost', body: `
        <p>Taking a joker helps you, but it also cleans up their hand. If they end up winning with no jokers at all, they get paid double. Weigh that against how much the joker helps you right now.</p>` }
    ]
  },
  {
    id: 'winning', stage: 'Confident play', title: 'Winning and getting paid', drill: 'payments',
    summary: 'Declaring Mah Jongg, checking the hand, and working out payments.',
    sections: [
      { h: 'Declaring Mah Jongg', body: `
        <p>Only declare with exactly 14 tiles that match one card line: the suits, group sizes, special notes and X or C status all have to be right. Lay the hand out so everyone can check it. A C hand stays hidden during play but can call its last real tile to win. Nobody breaks up their rack or the wall until the win is confirmed.</p>` },
      { h: 'Who pays what', body: `
        <p>Call the hand's printed value <b>V</b>. Chips or points work the same as money.</p>
        <table class="t">
          <tr><th>How you won</th><th>Discarder pays</th><th>Each other player</th><th>You get</th></tr>
          <tr><td>On a discard</td><td>2V</td><td>V</td><td>4V</td></tr>
          <tr><td>Self-drawn (or winning joker swap)</td><td>nobody</td><td>2V</td><td>6V</td></tr>
          <tr><td>Jokerless, on a discard</td><td>4V</td><td>2V</td><td>8V</td></tr>
          <tr><td>Jokerless, self-drawn</td><td>nobody</td><td>4V</td><td>12V</td></tr>
        </table>` },
      { h: 'Worked example', body: `
        <p>A 25 hand won on a discard pays 50 from the discarder plus 25 from each of the other two. That's 100.</p>
        <p>The same hand self-drawn pays 50 from all three players. That's 150.</p>` },
      { h: 'Fine print', body: `
        <ul>
          <li>The jokerless double doesn't apply to the Singles and Pairs section of the card.</li>
          <li>If you used a joker earlier but swapped it out before winning, your final hand can still count as jokerless.</li>
          <li>Players with dead hands still pay.</li>
        </ul>` },
      { h: 'After the game', body: `
        <p>If the wall runs out with no winner, it's a <b>wall game</b> and nobody pays. After each game, East moves to the right. The first East is the pivot. After four games, the pivot swaps seats with the player to the right and a new round starts.</p>` }
    ]
  },
  {
    id: 'errors', stage: 'Confident play', title: 'Mistakes and dead hands', drill: 'errors',
    summary: 'What happens when someone messes up, and how challenges work.',
    sections: [
      { h: 'What can kill a hand', body: `
        <table class="t">
          <tr><th>Situation</th><th>Usual result</th></tr>
          <tr><td>Wrong tile count, illegal exposure, or exposing a C hand</td><td>Hand may be dead</td></tr>
          <tr><td>Hand can't be finished based on what's shown and discarded</td><td>Others can challenge it as dead</td></tr>
          <tr><td>Drawing or discarding out of turn, wrong wall or wrong end</td><td>Strict rules may kill the hand. Some cases need a redeal or a special payment.</td></tr>
          <tr><td>Declaring Mah Jongg with a wrong hand</td><td>Dead once committed, with a few narrow exceptions</td></tr>
        </table>` },
      { h: 'Playing with a dead hand', body: `
        <p>Once a dead hand is agreed, that player stops drawing, calling, swapping and discarding. They still pay the winner. Jokers in their earlier legal exposures can still be swapped out by others.</p>` },
      { h: 'Challenges', body: `
        <p>Only challenge based on what everyone can see, never a guess about hidden tiles. If a challenge that could be disputed is turned down, play goes on and you sort it out after. In the League style explanation, whoever was wrong pays 50 to the other.</p>
        <p>If you realize on your own that your hand can't win, keep playing and play safe until someone else calls it dead.</p>` },
      { h: 'Special rulings', body: `
        <ul>
          <li><b>False Mah Jongg:</b> you can sometimes take back a spoken declaration if no hidden tiles were shown and no hands or walls were disturbed.</li>
          <li><b>Misnamed tile:</b> you can drop a call on a misnamed tile before you commit. If someone wins on the wrong name and that tile really would have won, the person who misnamed it can owe four times the hand.</li>
          <li><b>Out of turn:</b> a discard made out of turn or after drawing from the wrong end, if someone wins on it, can make the offender pay four times the value alone.</li>
        </ul>` },
      { h: 'Table manners', body: `
        <ul>
          <li>Handle only your own tiles. When swapping, hand the tile to the exposure's owner.</li>
          <li>Keep your exposed groups apart and easy to count.</li>
          <li>Say discards out loud. Don't rush someone who's thinking about a call.</li>
          <li>Don't coach someone's hidden hand or announce what they might be waiting on.</li>
          <li>Leave tiles and walls alone until a win or dispute is settled.</li>
        </ul>
        <p>For learning games, agree to fix mistakes openly. At an event, stop and get the director.</p>` }
    ]
  },

  /* ---------------- STRATEGY ---------------- */
  {
    id: 'choose', stage: 'Strategy', title: 'Choosing a workable hand', drill: 'choose',
    summary: 'Pick a target line that can actually be finished.',
    sections: [
      { h: 'Start with your rack', body: `
        <p>Sort by suit and number, then winds, dragons, flowers and jokers. Look for real pairs and repeated numbers. Compare two or three lines that fit, instead of scanning the whole card.</p>
        <table class="t">
          <tr><th>Check</th><th>What to look at</th></tr>
          <tr><td>Fit</td><td>How many of your tiles already sit in the line?</td></tr>
          <tr><td>Must-haves</td><td>Do you have the singles and pairs that can't use jokers?</td></tr>
          <tr><td>Flexibility</td><td>Could these tiles also work for a backup line?</td></tr>
          <tr><td>Joker room</td><td>How many missing spots can take a joker?</td></tr>
          <tr><td>Availability</td><td>Are the tiles you need already discarded or exposed?</td></tr>
          <tr><td>Restrictions</td><td>Do the suits, dragons and number rules match?</td></tr>
        </table>` },
      { h: 'Count honestly', body: `
        <p>Count each tile once. Three of a tile isn't three useful tiles if the line wants a pair. Place jokers only after checking which spots can't take them. One joker can't count for two different groups.</p>` },
      { h: 'Example', body: `
        <p>Line A uses nine of your tiles but you're missing two singles that can't be jokers. Line B uses eight, and you already have every pair and single it needs. B is probably stronger, because everything you're missing can be filled with jokers.</p>` },
      { tip: true, h: 'Don\'t get attached', body: `
        <p>Spending six turns on a line doesn't make it easier to finish. Look at what's left, not how long you've been at it. Throw away loose tiles that don't help any of your top choices, and keep pairs that work for more than one line.</p>` }
    ]
  },
  {
    id: 'pivots', stage: 'Strategy', title: 'Calls, pivots and efficiency', drill: 'pivots',
    summary: 'When a call is worth it and how to switch lines after exposing.',
    sections: [
      { h: 'A call trades flexibility for progress', body: `
        <table class="t">
          <tr><th>Call when...</th><th>Wait when...</th></tr>
          <tr><td>It finishes a hard-to-get group you need</td><td>It locks you into a weak line</td></tr>
          <tr><td>Your pairs and singles are already safe</td><td>A concealed line is still better</td></tr>
          <tr><td>Your exposures fit a strong line</td><td>You're not sure what size group you need</td></tr>
          <tr><td>It leaves you close to winning</td><td>You still need lots of rare real tiles</td></tr>
        </table>` },
      { h: 'Switching lines on purpose', body: `
        <p>Before you expose, compare freely. After you expose, first cross off every line that can't use exactly what you showed. Then compare what's left by fit, must-have tiles and what's still out there. A line that looks further away can still be the right move if it drops a requirement you can't meet.</p>` },
      { h: 'A quick worksheet', body: `
        <p>For each line, jot down: tiles already in place, missing tiles that can't be jokers, missing spots that can be jokers, how many of your key tiles are already showing, and which of your discards look risky. Go for the line you can realistically finish, not the one that pays the most on paper.</p>` },
      { tip: true, h: 'You\'re ready for the next level when...', body: `
        <p>You can name your best line and one backup that fits your exposures, explain what each joker is doing, and say which real tile is holding you up.</p>` }
    ]
  },
  {
    id: 'reading', stage: 'Strategy', title: 'Reading opponents and counting tiles', drill: 'reading',
    summary: 'Use exposures and discards to see what is still possible.',
    sections: [
      { h: 'Use exposures to narrow the card', body: `
        <p>One exposure fits a lot of lines. Two can narrow it down a lot. Match the exact numbers, suits and group sizes, then check the special notes. Keep several guesses until the table rules them out.</p>` },
      { h: 'Count what\'s left', body: `
        <p>Every normal tile starts at four. Subtract the ones in your rack, in exposures and in the discards. What's left is the most that could still be out there, hidden or in the wall. It's not a promise you'll draw one. Flowers start at eight.</p>` },
      { h: 'Example', body: `
        <p>You need a real pair of 8 Craks and you hold one. Two are discarded and one is exposed. That's all four accounted for. Jokers can't fill a pair, so this line is impossible.</p>
        [[c8|30]] in your rack, [[c8 c8|30]] discarded, [[c8|30]] exposed
        <p>If you haven't exposed anything, switch lines. If your exposures leave no possible line, someone can challenge your hand as dead.</p>` },
      { h: 'Spotting dangerous tiles', body: `
        <p>A tile is dangerous when it could finish a line that fits what an opponent is showing. Pair tiles and singles are extra risky, since jokers can't fill them. An opponent with nothing exposed is harder to read. No exposures doesn't mean safe.</p>
        <p>A tile that was safe earlier isn't safe forever. People draw and change plans.</p>` },
      { h: 'Keep your cards close', body: `
        <p>Don't announce your line, what you're short on, or why you stopped the Charleston. Remember what you passed, but people might have passed it along or changed direction.</p>` }
    ]
  },
  {
    id: 'defense', stage: 'Strategy', title: 'Attack and defense', drill: 'defense',
    summary: 'When to push for the win and when to stop feeding others.',
    sections: [
      { h: 'Three stages of a game', body: `
        <table class="t">
          <tr><th>Stage</th><th>Focus</th></tr>
          <tr><td>Early, flexible rack</td><td>Keep several paths open and lock in the pairs and singles you need.</td></tr>
          <tr><td>Middle, clear target</td><td>Finish the groups you need and re-read opponents after each exposure.</td></tr>
          <tr><td>Late, weak or blocked hand</td><td>Stop handing other people the win.</td></tr>
        </table>` },
      { h: 'Value versus chance', body: `
        <p>A hand worth more is only better if the extra pay makes up for being harder to finish and riskier to discard toward. A hand waiting on one rare real tile is often worse than one with several spots jokers can fill.</p>` },
      { h: 'When to play defense', body: `
        <p>Play safer when an opponent's exposures show what they're probably waiting on, the wall is short, and you're still far away. Holding a dangerous tile can be smart even if it kills your own chances.</p>
        <p>Throwing away a joker you don't need is a legal safe discard, because nobody can call it. Just don't toss one you actually need.</p>` },
      { h: 'Joker timing and jokerless dreams', body: `
        <p>Take a joker when it really helps. If your hand is weak, think about whether taking an opponent's last exposed joker sets them up for a double payment. But don't skip a swap that clearly helps you just because of that.</p>
        <p>Don't pass on a solid normal win hoping for a jokerless one. Waiting gives others time to win or forces you into risky discards.</p>` },
      { tip: true, h: 'Review without hindsight', body: `
        <p>After a game, think back to what you knew at the moment: your options, what was showing, how long the wall was. Judge the thinking, not the result. A lucky win can come from a bad choice, and a good choice can still lose.</p>` }
    ]
  }
];

const REFERENCE = `
  <section class="sec"><h3>Before dealing</h3>
    <p>152 tiles. Same card for everyone. Pick East. Agree on stakes or points, how strict to be with beginners, and any event rules. Build four walls of 19 two-tile stacks.</p></section>
  <section class="sec"><h3>Pass sequence</h3>
    <div class="seq"><span>Right</span><span>Across</span><span>Left</span></div>
    <div class="seq alt"><span>Left</span><span>Across</span><span>Right</span></div>
    <div class="seq one"><span>Courtesy Across</span></div>
    <p>The second set needs everyone to agree. Blind passes only on the first Left and the second Right. No jokers in any pass.</p></section>
  <section class="sec"><h3>Every turn</h3>
    <p>Get a tile, check for a win, swap jokers if you want, discard. Keep 13 between turns. East starts with 14 and discards first. The next player is on your right.</p></section>
  <section class="sec"><h3>Before you call</h3>
    <ul class="check"><li>Is it the latest discard?</li><li>Is the window still open?</li><li>Is it the right tile?</li><li>Does it finish a legal group for an X line, or win the whole hand right now?</li><li>Do you have enough supporting tiles?</li><li>Are pairs and singles all real tiles?</li></ul></section>
  <section class="sec"><h3>Before you declare Mah Jongg</h3>
    <ul class="check"><li>Exactly 14 tiles</li><li>Matches one line on the card</li><li>Suits follow the colors</li><li>Notes in parentheses are satisfied</li><li>Group sizes are right</li><li>Jokers only in groups of 3 or more</li><li>C or X status respected</li></ul></section>
  <section class="sec"><h3>Payments</h3>
    <table class="t"><tr><th>Win</th><th>Discarder</th><th>Others each</th><th>Total</th></tr>
    <tr><td>Discard</td><td>2V</td><td>V</td><td>4V</td></tr>
    <tr><td>Self-draw</td><td>none</td><td>2V</td><td>6V</td></tr>
    <tr><td>Jokerless discard</td><td>4V</td><td>2V</td><td>8V</td></tr>
    <tr><td>Jokerless self-draw</td><td>none</td><td>4V</td><td>12V</td></tr></table></section>
  <section class="sec"><h3>Fewer players</h3>
    <p><b>Three players:</b> keep all four walls, skip the empty seat when dealing, and skip the Charleston. Everyone gets 13, East gets one more.</p>
    <p><b>Two players:</b> each builds two walls, and there's no Charleston. Siamese and other two-player games have their own rules.</p></section>
  <section class="sec"><h3>Words you'll hear</h3>
    <table class="t">
      <tr><td><b>Rack</b></td><td>Holds hidden tiles on the slope and exposures on top.</td></tr>
      <tr><td><b>Wall</b></td><td>The undrawn tiles in two-high stacks.</td></tr>
      <tr><td><b>Call</b></td><td>Claim the latest discard to expose a group or win.</td></tr>
      <tr><td><b>Exposure</b></td><td>A group shown face up after a call.</td></tr>
      <tr><td><b>Ready</b></td><td>One tile away from winning.</td></tr>
      <tr><td><b>Natural</b></td><td>Any tile that isn't a joker.</td></tr>
      <tr><td><b>Wall game</b></td><td>The wall runs out with no winner.</td></tr>
    </table></section>
  <section class="sec"><h3>House rules to settle first</h3>
    <p>Payment units, jackpot or pie limits, extra bonuses, tournament scoring, time limits, seat schedules, and how much to help beginners. Agree on these out loud before you start.</p></section>
`;

/* ---------------- TILE TOUR (the very first step) ----------------
   type: 'info'  plain step
         'tap'   tap tiles to reveal names (tiles, facts)
         'pick'  quick check, retry until right (gen: 'suits' | 'honors')
         'match' match each suit to its dragon
         'sort'  sort tiles into their families */
const TOUR = [
  {
    type: 'info', title: 'Meet the tiles',
    body: `<p>A mahjong set has <b>152 tiles</b>, and every one belongs to one of <b>7 families</b>. By the end of this tour you'll know each one by name and color, and which ones go together.</p>
      <div class="fam">
        <div class="fam-row suit">[[b5|34]]<span><b>Bams</b><small>36 tiles · bamboo sticks</small></span></div>
        <div class="fam-row suit">[[c5|34]]<span><b>Craks</b><small>36 tiles · red 萬 character</small></span></div>
        <div class="fam-row suit">[[d5|34]]<span><b>Dots</b><small>36 tiles · circles</small></span></div>
        <div class="fam-row">[[N|34]]<span><b>Winds</b><small>16 tiles · N, E, W, S</small></span></div>
        <div class="fam-row">[[DR|34]]<span><b>Dragons</b><small>12 tiles · red, green, white</small></span></div>
        <div class="fam-row">[[F|34]]<span><b>Flowers</b><small>8 tiles · all the same</small></span></div>
        <div class="fam-row">[[J|34]]<span><b>Jokers</b><small>8 tiles · wild cards</small></span></div>
      </div>
      <p class="small">The first three are the <b>suits</b>. They're the only tiles with numbers.</p>`
  },
  {
    type: 'tap', title: 'Bams',
    body: `<p><b>Bams</b> is short for bamboo. They're drawn as <b class="c-bam">bamboo sticks</b>, mostly green with some blue and red. Count the sticks to get the number, or just read the small number in the corner. 1 to 9, four of each, 36 in all.</p><p class="small">Tap each tile to see its name.</p>`,
    tiles: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9'],
    facts: { b1: 'The bird is the 1 Bam. It is not a flower. Everybody mixes this up at first.' },
    note: 'Heads up: the 1 Bam is a bird, usually a peacock or sparrow, not bamboo sticks.'
  },
  {
    type: 'tap', title: 'Craks',
    body: `<p><b>Craks</b> is short for characters. The top is the number written in Chinese, and underneath is a <b class="c-crak">red 萬 symbol</b>. 1 to 9, four of each.</p><p class="small">Tap each tile to see its name.</p>`,
    tiles: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'],
    facts: {},
    note: 'You don\'t need to read Chinese. American sets print a regular number in the top corner. The red 萬 is the same on every Crak.'
  },
  {
    type: 'tap', title: 'Dots',
    body: `<p><b>Dots</b> are <b class="c-dot">circles</b> in blue, green and red. The number of circles is the number of the tile, and it's also in the corner. 1 to 9, four of each.</p><p class="small">Tap each tile to see its name.</p>`,
    tiles: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9'],
    facts: {},
    note: 'You say them like "Seven Dot" or "Two Bam" when you discard.'
  },
  { type: 'pick', title: 'Quick check: the suits', body: '<p>Name the suit or the tile. If you miss one, just try again.</p>', gen: 'suits' },
  {
    type: 'tap', title: 'Winds',
    body: `<p>There are four <b>winds</b>: North, East, West and South. The big symbol is the Chinese word, and the letter in the corner tells you which one it is. Four of each, 16 total. Winds have <b>no suit and no number</b>. They go with each other.</p><p class="small">Tap each tile to see its name.</p>`,
    tiles: ['N', 'E', 'W', 'S'],
    facts: { N: 'North', E: 'East. Also the name of the dealer\'s seat.', W: 'West', S: 'South' },
    note: 'One of each wind together is called <b>NEWS</b>. You\'ll see it on the card.'
  },
  {
    type: 'info', title: 'Dragons',
    body: `<p>There are three <b>dragons</b>, four of each, 12 total. Red shows a red 中, green shows a green 發, and white is an empty blue frame. Here's the key part: <b>every dragon belongs to one suit</b>.</p>
      <div class="pairs">
        <div class="pair-row">[[b5 DG|44]]<span><b class="c-bam">Green Dragon</b> goes with <b>Bams</b></span></div>
        <div class="pair-row">[[c5 DR|44]]<span><b class="c-crak">Red Dragon</b> goes with <b>Craks</b></span></div>
        <div class="pair-row">[[d5 DW|44]]<span><b class="c-dot">White Dragon</b> goes with <b>Dots</b>. It's just a blue frame, and its nickname is <b>soap</b>.</span></div>
      </div>
      <p class="small">Soap has one more job: when the card shows a 0, like in a year, soap plays the zero.</p>`
  },
  { type: 'match', title: 'Match the dragons', body: '<p>Tap a suit tile, then tap the dragon that goes with it.</p>' },
  {
    type: 'info', title: 'Flowers',
    body: `<p>There are eight <b>flowers</b>. Different sets print different flowers, seasons or numbers on them, but in American mahjong <b>every flower counts as the same tile</b>. They have no suit.</p>
      [[F F F F|44]]
      <p>Don't confuse the bird with a flower. The bird is the 1 Bam.</p>
      <div class="vs">[[b1|56]]<span>vs</span>[[F|56]]</div>`
  },
  {
    type: 'info', title: 'Jokers',
    body: `<p>There are eight <b>jokers</b>. A joker can stand in for a tile, but only inside a group of <b>three or more of the same tile</b>.</p>
      <div class="pairs">
        <div class="pair-row ok">[[c7 c7 J|40]]<span>Fine. Three 7 Craks, one is a joker.</span></div>
        <div class="pair-row bad">[[F J|40]]<span>Not allowed. A pair can't use a joker.</span></div>
      </div>
      <p class="small">You can never pass a joker to another player, and nobody can pick up a joker someone throws away.</p>`
  },
  { type: 'pick', title: 'Quick check: honors and more', body: '<p>Dragons, winds, flowers and jokers. Try again if you miss.</p>', gen: 'honors' },
  {
    type: 'info', title: 'What goes with what',
    body: `<p>This is the whole tile family tree on one screen. It's worth a screenshot.</p>
      <table class="t famtable">
        <tr><th>Family</th><th>Look</th><th>Goes with</th></tr>
        <tr><td>[[b3|26]] Bams</td><td class="c-bam">Sticks</td><td>[[DG|26]] Green Dragon</td></tr>
        <tr><td>[[c3|26]] Craks</td><td class="c-crak">Red 萬</td><td>[[DR|26]] Red Dragon</td></tr>
        <tr><td>[[d3|26]] Dots</td><td class="c-dot">Circles</td><td>[[DW|26]] Soap</td></tr>
        <tr><td>[[E|26]] Winds</td><td>None</td><td>Each other (NEWS)</td></tr>
        <tr><td>[[F|26]] Flowers</td><td>None</td><td>Each other, all the same</td></tr>
        <tr><td>[[J|26]] Jokers</td><td>None</td><td>Any group of 3 or more</td></tr>
      </table>
      <p class="small">The colors on the tiles vary a little from set to set. The dragon colors are what matter: green goes with Bams, red with Craks, and the white frame with Dots.</p>`
  },
  {
    type: 'info', title: 'Tiles make groups',
    body: `<p>To win, you build groups of matching tiles. Here are the names you'll hear:</p>
      <div class="pairs">
        <div class="pair-row">[[d4 d4|36]]<span><b>Pair</b>: 2 of the same</span></div>
        <div class="pair-row">[[DR DR DR|36]]<span><b>Pung</b>: 3 of the same</span></div>
        <div class="pair-row">[[N N N N|36]]<span><b>Kong</b>: 4 of the same</span></div>
        <div class="pair-row">[[b2 b2 b2 b2 J|36]]<span><b>Quint</b>: 5 of the same. Needs a joker, since only 4 exist.</span></div>
      </div>
      <p>Numbers in a row, like 3 4 5, are <b>not</b> a group in American mahjong. Lesson 3 covers groups in detail.</p>`
  },
  { type: 'sort', title: 'Sort the tiles', body: '<p>Put each tile in its family. Ten tiles to go.</p>' },
  {
    type: 'info', title: 'Tour complete',
    body: `<div class="center">[[b1 c5 d9 E DR F J|40]]</div>
      <p>Nice work. You now know every tile, its color, and which ones go together.</p>
      <p>Next is <b>Step 2</b>: reading the card and figuring out which hand to go for with the tiles you're dealt. That's the first real skill of the game. You can come back to this tour any time from the home screen.</p>`
  }
];

if (typeof module !== 'undefined') module.exports = { LESSONS, REFERENCE, TOUR };
