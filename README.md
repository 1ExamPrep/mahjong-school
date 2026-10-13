# Mahjong School

A mobile-first study app for American Mahjong (NMJL style). 16 lessons from beginner to strategy, a drill after each one, a final quiz, a table reference, and six tile styles to pick from, with Real Tiles as the default.

Starts with four guided steps: a Tile Tour (Step 1), reading the card with four hand-finder games at Easy, Medium and Hard (Step 2), dice, walls and the deal with a table dice roller (Step 3), and the Charleston with a full passing practice (Step 4). The card practice uses an invented practice card. Plain HTML, CSS and JavaScript. No build step, no frameworks, no dependencies.

## Put it on GitHub Pages

1. Create a new repository on GitHub (for example `mahjong-school`).
2. Upload everything in this folder to the root of the repo. Keep the `css` and `js` folders as they are.
3. In the repo go to **Settings > Pages**.
4. Under **Build and deployment**, pick **Deploy from a branch**, choose `main` and `/ (root)`, and save.
5. After a minute your site is live at `https://YOUR-USERNAME.github.io/mahjong-school/`.

Open that link on your phone. In Safari tap Share > Add to Home Screen, or in Chrome tap the menu > Install app. It then opens full screen and works offline.

## Try it on your computer first

Open `index.html` straight in a browser, or run a tiny local server from this folder:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## What's where

| File | What it does |
|---|---|
| `index.html` | The page shell |
| `css/style.css` | All styling, with automatic dark mode |
| `js/tiles.js` | Draws every tile as SVG, and holds the 6 tile styles |
| `js/content.js` | Lesson text and the table reference |
| `js/drills.js` | Every quiz question and the question generators |
| `js/card.js` | Step 2: the practice card, the engine that scores any rack against every hand, and the four hand-finder games |
| `js/steps.js` | Step 3 (dice roller, wall breaking, deal simulator) and Step 4 (Charleston order drill and full passing practice) |
| `js/app.js` | Pages, the quiz engine, and saved progress |
| `sw.js` | Offline support |
| `manifest.webmanifest`, `icon.svg` | Lets phones install it like an app |

## Editing

- **Lesson text:** edit `js/content.js`. Write `[[b5 b5 J]]` anywhere to show tiles. Add a size like `[[DR|48]]`.
  Tile codes: `b1`-`b9` Bams, `c1`-`c9` Craks, `d1`-`d9` Dots, `N E W S` winds, `DR DG DW` dragons (DW is soap), `F` flower, `J` joker.
- **Questions:** add items to any `_BANK` list in `js/drills.js`. Each is `{ q, a, w: [wrong answers], e: explanation }`. Every test draws from 100+ questions (hand-written plus rule-built families) and remembers what each player has seen, so retakes get new questions and nothing repeats until at least 100 others have been shown.
- **Tile styles:** each style is one object in `TILE_THEMES` in `js/tiles.js`. Change colors there. Once you pick a favorite, you can set it as the default by moving it to the top of `TILE_THEMES` in `js/tiles.js`.
- **After any change:** bump `VERSION` in `sw.js` so installed phones get the update.

Progress is saved in the browser on each device. There's a reset link at the bottom of the home screen.

## Going to the app stores later

The code is already set up as an installable web app, so the easiest path is to wrap it with [Capacitor](https://capacitorjs.com/):

```
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "Mahjong School" com.yourname.mahjongschool --web-dir .
npx cap add ios
npx cap add android
```

That gives you real Xcode and Android Studio projects for phones and tablets using these same files. You'll want a PNG icon set at that point, since the stores don't take SVG icons.

## Content note

This is an independent learning app, not an official National Mah Jongg League product. It doesn't include the yearly NMJL card. Practice lines in the lessons and drills are made up for teaching. Use the current League card and official rules for real games and disputes.
