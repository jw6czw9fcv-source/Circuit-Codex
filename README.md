# Circuit Codex

Electronics reference and tools — iPhone-first PWA for hobbyists and professionals.

## Status

Working proof of concept:
- Full navigation (Home grid → domain → sub-section → tool)
- 184 tools/categories listed across 7 domains, matching `REFERENCE.md` exactly
- Global search across all tool names
- Favorites (localStorage)
- **Seven fully working calculators:**
  - **Ohm's law** (`js/app.js`, `renderOhmsLaw`) — 3 modes, unit selection, live calculation, mode-aware circuit diagram and formula footnote, resistor tolerance spread and E-series
  - **Resistor color code** (`js/app.js`, `renderResistorColorCode`) — 4/5/6 bands, 3D band roller, value entry with unit and tolerance, live resistor illustration, E-series check
  - **SMD resistor code** (`js/app.js`, `renderSmdCode`) — 3-digit, 4-digit and EIA-96 markings, both directions, live chip illustration, E-series check
  - **Voltage divider** (`js/app.js`, `renderVoltageDivider`) — solves for Vout, R1 or R2, mode-aware schematic, divider current and per-resistor power, guards on impossible ratios
  - **Series/parallel** (`js/app.js`, `renderSeriesParallel`) — 2 to 4 resistors, add and remove rows, schematic redraws to the count, total with tolerance range and the nearest single standard part
  - **Current divider** (`js/app.js`, `renderCurrentDivider`) — solves for I1, R1 or R2, parallel schematic, branch split with tolerance spread, E-series on every resistance
  - **E-series value** (`js/app.js`, `renderESeries`) — E6 to E192, nearest standard value with % drift, and the whole series as a table. The one screen that scrolls by design
- **Formula search** (`js/app.js`, `renderFormulaSearch`, data in `js/formulas.js`) — not a calculator itself: a growing reference list (20 formulas so far, in `js/formulas.js`) for topics that don't have a full calculator yet. Searches topic, formula and note text. A card links straight to the real calculator once one is built for that topic — the two lists are joined only by tool name at render time
- All other 176 tools currently open a "not built yet" placeholder screen
- Installable PWA (manifest + service worker + icons), works offline once installed

## Stack

Plain HTML/CSS/JS. No build step, no framework, no dependencies. Chosen deliberately so it can be built and tested without a Mac, and so it stays trivial to host (GitHub Pages, Netlify, any static host).

## Files

```
index.html         App shell, loads css/js
css/styles.css      Full design system (see below)
js/data.js          Content: 7 domains → sections → tools (single source of truth for structure)
js/formulas.js       Formula reference data for Formula search — separate from js/data.js, joined to it by tool name
js/app.js           Routing (hash-based), screen rendering, calculator logic
manifest.json        PWA manifest
sw.js                Service worker (offline caching)
icons/                App icons (generated to match the design system — literal resistor mark)
REFERENCE.md          Full product spec: navigation, naming convention, visual system, complete
                       domain/tool taxonomy, deliberately-excluded items, calculator screen template
```

## Design system (see REFERENCE.md section 4 for full detail)

- Dark theme. Background `#0B0D10`, cards `#15181D`.
- One accent color per domain (applied to icon + icon chip background only, never full-screen):
  - Passive components — blue `#5B9BE0`
  - Active & semiconductor — violet `#B98FE0`
  - Digital & logic — teal `#5DCAA5`
  - RF & microwave — coral `#E08585`
  - Power electronics — amber `#EF9F27`
  - PCB & interconnect — cyan `#5BC4E0`
  - Tools — neutral gray `#9AA0A8`
- Two-layer naming: technical title + plain-language subtitle (e.g. "Resistors" / "Color code" with subtitle "4 to 6 bands").
- Icon principle: **navigation icons are literal** (a real resistor body with color bands, not a schematic symbol). **In-calculator circuit diagrams are schematic** (zigzag/box symbols) — they show topology, not identify a part.
- Every calculator follows one shared template (header → optional circuit diagram → optional mode selector → input fields → result fields with a "Calculated" badge, high-contrast text → Calculate button → formula footnote). See `renderOhmsLaw()` in `js/app.js` for the reference implementation.
- Sub-section tool ordering is by frequency/logic, not alphabetical (exception: pure reference lists like Glossary).

## Next steps (suggested order)

1. Build out calculators one domain at a time, following the `renderOhmsLaw` pattern as the template for each new tool.
2. Next good candidates: the **Capacitors** sub-section — its series/parallel is the inverse of the resistor case and can reuse `renderSeriesParallel` almost wholesale — then **Wheatstone bridge** and **Delta-Y** to finish Resistors.
3. Circuit diagrams: add the schematic SVG per calculator that needs one (see REFERENCE.md section 4, "Calculator screen template").
4. **Done.** The shared screen shape lives in `calcHeader` / `pillRow` / `calcFooter` / `wireCalc`, and `trim` / `formatOhms` are module-level. A new calculator supplies a subtitle, an optional illustration, its pill options, its own body and a footnote.
5. Longer term: Links and Notes sections (Tools domain) need actual storage logic (localStorage is fine to start, same pattern as favorites).

## Deploying

Static site — works from GitHub Pages (`Settings → Pages → branch: main → root`), Netlify, or any static host. No environment variables, no server, no build command.
