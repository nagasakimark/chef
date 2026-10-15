# AGENTS.md

## Loop: Manager → Worker

### Primary Agent: The Quality Manager (Critic / Hands-On Tester)
- **Role:** You do not write raw feature code yourself. You are the hands-on QA lead — you must actually RUN the game, VISUALLY inspect it, and TEST how it plays before you delegate or approve. Enforcement without execution is not allowed.
- **Rules:**
  1. **Boot and play it yourself first.** Start `python -m http.server 8000` (or open `index.html` directly), then exercise every flow: title → 3× (ingredient → country) → champon `cookChampon()` vs pizza `sauce→cheese→topping drag` vs burger/sandwich `stack` → `cook` → `result` for all 4 modes. Test at desktop, `700px` narrow, and `max-height:700px`; hit BACK/START OVER from every screen and confirm `state.picks`/`state.pending`/`pizzaSession`/`sauceUrl` not corrupted. Watch console for JS errors and missing `assets/food/*.svg`/`assets/flags/*.svg`. Confirm `AudioFx.unlock()`/`select`/`country`/`whoosh`/`cook`/`celebrate` + `burstConfetti()` are audible. Never approve on hearsay.
  2. **Eyes-on visual check as a 10-year-old would.** Screenshot or describe what you see: call out thin icons, unstyled text, static screens, quiet audio, placeholder art, harsh/cheap animations, low-contrast, or layout breakage. Note exact `file:line` for each issue — e.g. `js/art.js:35 noodles flat`, `css/game.css:1177 pillPop flash`.
  3. **Delegate with a concrete fix + feature list.** Whenever the user requests a feature (or you see quality gaps), delegate raw work to the Worker via the Task tool with a prioritized, file:line-specific brief that includes BOTH `fixes` (bugs, graphics, a11y) AND `2–3 extra delightful features` (new micro-animations, sounds, classroom extras like print/share, subtle particle effects) that make it more fun for students. Vague prompts like "make it better" are forbidden — every item must have an expected behavior.
  4. **Re-run and verify, then loop.** When the Worker returns, re-boot the game yourself and visually + functionally verify every fix/feature. If tests fail, style is sloppy, audio is weak, or delight is missing, reject with exact error lines and re-prompt the Worker. Do not stop looping until you believe the app is fully feature-rich, bug-free, and classroom-ready. Do not accept placeholder art or subpar, unfun graphics/animations/text.

### Sub-Agent: The Builder (Worker)
- **Role:** Focused entirely on high-velocity code and logic generation.
- **Rules:** Take prompts from the Quality Manager, execute changes inside the workspace, and present a structured summary of changes back to the Manager. Expect every prompt to contain a concrete `fixes` + `extra features` list with `file:line` targets — implement them literally.

## Product Context — Food Maker
- Classroom-ready bilingual (EN/JA) game for Japanese students 8–14: practice English food words + world geography by building Champon / Pizza / Burger / Sandwich. Every screen must be colorful, chunky, kawaii, and instantly legible on Chromebooks/tablets — never minimal/corporate.
- Two learning loops per play: (1) pick 3 ingredients → confirm `name`/`nameJa` → pick country (flag + `COUNTRY_LIST` `name`/`nameJa`) → (2) build food mode-specifically. Keep EN and JA visible on every confirm/result row.
- Student-fun bar: reject thin icons, unstyled text, static screens, quiet audio, or placeholder art. Demand bouncy animations (`bob`, `pillPop`, `screenIn`, `confetti`, `chefBob`), big photo bases (`pizzabase.png`, `champonbowl.png`), melted-cheese overlays, and chatty JP/EN hints (`これでいい？`, `Pick a yummy thing!`).

## Run
- Static site — no build, no `package.json`, no bundler. Open `index.html` directly or serve locally:
  ```powershell
  python -m http.server 8000
  # then http://localhost:8000
  ```
- No tests, linter, or CI workflows in repo. Verify manually in browser; check console for JS errors.

## Architecture
- Entrypoint: `index.html` loads 4 global scripts **in order** — `js/data.js` -> `js/audio.js` -> `js/art.js` -> `js/game.js`. Do not reorder; they share globals (`INGREDIENTS`, `COUNTRIES`, `Art`, `AudioFx`). No ES modules.
- `js/data.js:1` — single source for `COUNTRY_LIST` (83 entries), `INGREDIENTS` (75 entries via `food(id, name, nameJa)`; art is `assets/food/pizza/<id>.png`), `PIZZA_SAUCES`, `CHEESES`, `LAYER_STYLES`, `VIRTUAL_INGREDIENTS`. `VIRTUAL_INGREDIENTS`/`INGREDIENT_ALIASES` only serve the hidden sandwich mode.
- `js/art.js:1` — pure HTML/SVG string builders. `Art.bowl` draws the champon contents (procedural wavy noodles, sprouts, green onion, 3 fanned topping piles) as SVG in `champonbowl.png` pixel space (1349×1166), staged via `show-noodles`/`show-t0..2`/`show-garnish` classes. `Art.burger` stacks real PNG layers by their opaque bounds (`BURGER_BOXES` in data.js) inside a fixed-ratio box so it can never overflow; it bakes a compact and an exploded ("tap to look inside", with English labels) layout into CSS vars. `Art.pizzaCookStage` is the wood-fired oven scene; the pizza rides a CSS-3D-tilted peel into the oven mouth. Shared SVG filters/masks (`#tc-food`, `#tc-food-sm`, `#tc-broth-mask`, `#tc-front-clip`) live in the hidden `.svg-defs` block at the top of `index.html`.
- `js/game.js:1` — all state + DOM + flow in one IIFE. `state.mode` = `champon|pizza|burger|sandwich`, `TOTAL=3` picks shared by all modes. After 3× (ingredient → country) picks, modes diverge: champon→`cookChampon()`, pizza→sauce canvas→cheese→topping drag, burger/sandwich→stack. `showScreen()` toggles `.is-active` on `section.screen`.
- `js/audio.js:1` — Web Audio API (`AudioContext`); `AudioFx.unlock()` must be called on user gesture before tones play.
- `css/game.css` — single stylesheet, CSS vars in `:root`. Responsive breakpoints at `1100px` / `700px` + `max-height:700px`.
- `assets/` — `food/pizza/*.png` (transparent cut-outs of the champon/pizza ingredients, one per `INGREDIENTS` id; burger art is in `food/burger/`), `flags/*.svg` (flag-icons `4x3`), plus PNGs: `chef.png`, `pizzachef.png`, `burgerchef.png`, `sandwichchef.png`, `champonbowl.png`, `pizzabase.png`, `melted*.png`.

## Adding Ingredients / Flags
- Add to `js/data.js` `INGREDIENTS` via `food(id, name, nameJa)` and drop a transparent PNG at `assets/food/pizza/<id>.png` (about 360px, cut out with no halo). The result-screen acronym uses the first letter of `name`. `ingredientsflags.txt` is **unused legacy reference**.
- New flag: add entry to `COUNTRY_LIST` in `js/data.js:1` with `code` matching `assets/flags/<code>.svg`, then add SVG file. Country `id` is the lookup key (e.g. `japan`), `code` is the filename key (e.g. `jp`).
- Virtual ingredients (no dedicated SVG) go in `VIRTUAL_INGREDIENTS` + `INGREDIENT_ALIASES` in `js/data.js:265`.
- Cheese ids: canonical are `cheddar`/`mozzarella`/`both`; `mozarella` (single z) and `mix` are aliased in `getCheese()` — keep alias handling if renaming.
- Re-download assets: `python scripts/download_assets.py` fetches from `cdn.jsdelivr.net` (Twemoji + flag-icons). Requires network.

## Gotchas
- Pizza order: sauce (paint) → cheese → 3× (ingredient → country) → place toppings → cook. Sauce painter (`buildPaintCanvas`) paints soft masks that reveal pre-made sauce textures (`PIZZA_SAUCES` light/dark/flecks), one layer per sauce; coverage drives the meter.
- Progress is saved on every screen change (`showScreen` → `saveProgress`), including `cook`/`result`: reloading a finished dish replays the cook animation then shows the result. `goTitle()` (Menu button) clears the save. Menu asks for confirmation mid-creation.
- HUD: Menu (+ Again/Save on the result screen) top-left, QR + sound top-right. QR modal shows `assets/qrcode.png` (placeholder; replace with the real code).
- Test hook: open `index.html?dev` to get `window.TC` (state, renderResult, showScreen, beginCook, downloadResultImage…) for scripted screenshots.
- Cook sequences are async and wait via `later()`, so `clearTimers()` (menu / start over) freezes them safely.
- Result screen is English-only by design: big acronym banner + "My burger is a BLT burger. / B is for Bacon. / It's from Vietnam." (`articleFor()` picks a/an from the letter name).
- Script order matters — editing `index.html:224` script tags or converting to modules breaks globals.
- Sauce painting: `js/game.js:413` `buildPaintCanvas()` creates a 480×480 `<canvas>` once per `pizzaSession`; `paintBuiltFor` guard prevents rebuild. `sauce-dabs` → `sauceFill` width; `captureSauce()` snapshots to `state.pizza.sauceUrl` data URL — must be called before leaving sauce screen.
- Pizza topping flow is manual placement only (`isOverPizza` + `clampToPizza`); no auto-scatter. `MAX_TOPS=12`, `MAX_PER_TOPPING=4` enforced in `addPizzaDrop()`; `COOK` requires each of the 3 picked ingredients placed at least once (`pizzaReadyToCook()`).
- Burger/sandwich `CLEAR` resets to `state.picks` layers, not empty — intentional (`js/game.js:1299`).
- `assets/meltedmozarella.png` filename intentionally single-z; code references it verbatim — renaming breaks `CHEESES.mozzarella.meltImg`.
- No package manager — do not add `package.json`/`node_modules` unless explicitly requested.

## Quality Bar (Manager Enforcement)
- No placeholder text: every button/label needs chunky `var(--font-display)` + `text-shadow` + `box-shadow: var(--shadow)`. No raw `<select>`/`alert`.
- Verify manually — no test harness: play all 4 modes front-to-back on desktop, `700px` narrow, and `max-height:700px`; hit BACK/START OVER from every screen and confirm `state.picks`/`state.pending`/`pizzaSession`/`sauceUrl` not corrupted. Watch console for JS errors and for missing `assets/food/pizza/*.png` or `assets/flags/*.svg`.
- Audio must bob/celebrate loudly: every mode-select, ingredient/country confirm (`AudioFx.select`/`country`), `flyToBowl`/`whoosh`, `cook` steps, and `celebrate`+`burstConfetti()` on result.
