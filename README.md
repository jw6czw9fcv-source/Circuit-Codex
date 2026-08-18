# Circuit Codex

Electronics reference and tools — iPhone-first PWA for hobbyists and professionals.

## Status

Working proof of concept:
- Full navigation (Home grid → domain → sub-section → tool)
- 185 tools/categories listed across 7 domains, matching `REFERENCE.md` exactly
- Global search across all tool names
- Favorites (localStorage)
- **Three fully working calculators:**
  - **Ohm's law** (`js/app.js`, `renderOhmsLaw`) — 3 modes, unit selection, live calculation, mode-aware circuit diagram and formula footnote
  - **Resistor color code** (`js/app.js`, `renderResistorColorCode`) — 4/5/6 bands, 3D band roller, value entry with unit and tolerance, live resistor illustration, E-series check
  - **SMD resistor code** (`js/app.js`, `renderSmdCode`) — 3 and 4 digit markings including R notation, both directions, live chip illustration, E-series check
- All other 182 tools currently open a "not built yet" placeholder screen
- Installable PWA (manifest + service worker + icons), works offline once installed

## Stack

Plain HTML/CSS/JS. No build step, no framework, no dependencies. Chosen deliberately so it can be built and tested without a Mac, and so it stays trivial to host (GitHub Pages, Netlify, any static host).

## Files

```
index.html         App shell, loads css/js
css/styles.css      Full design system (see below)
js/data.js          Content: 7 domains → sections → tools (single source of truth for structure)
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
2. Next good candidates: **Series/parallel** and **Voltage divider** (Passive components) — both reuse the numeric-input pattern from `renderOhmsLaw` and want a mode-aware diagram.
3. Circuit diagrams: add the schematic SVG per calculator that needs one (see REFERENCE.md section 4, "Calculator screen template").
4. **Extract the calculator template into a shared render helper — overdue.** The shape (header → diagram → mode pills → inputs → results → footnote) is now duplicated verbatim across three calculators, along with `trim`/`formatOhms`. The duplication has already caused two real bugs: an edit anchored on "Results" hit the wrong calculator, and a helper was defined inside the wrong closure because both define `compute()`.
5. Longer term: Links and Notes sections (Tools domain) need actual storage logic (localStorage is fine to start, same pattern as favorites).

## Deploying

Static site — works from GitHub Pages (`Settings → Pages → branch: main → root`), Netlify, or any static host. No environment variables, no server, no build command.
