# Circuit Codex

Electronics reference and tools — iPhone-first PWA for hobbyists and professionals.

## Status

Working proof of concept:
- Full navigation (Home grid → domain → sub-section → tool)
- 185 tools/categories listed across 7 domains, matching `REFERENCE.md` exactly
- Global search across all tool names
- Favorites (localStorage)
- **One fully working calculator: Ohm's law** (`js/app.js`, `renderOhmsLaw`) — 3 modes, unit selection, live calculation
- All other 184 tools currently open a "not built yet" placeholder screen
- Installable PWA (manifest + service worker + icons), works offline once installed

## Stack

Plain HTML/CSS/JS. No build step, no framework, no dependencies. Chosen deliberately so it can be built and tested without a Mac, and so it stays trivial to host (GitHub Pages, Netlify, any static host).

## Files

```
index.html         App shell, loads css/js
css/styles.css      Full design system (see below)
js/data.js          Content: 7 domains → sections → tools (single source of truth for structure)
js/app.js           Routing (hash-based), screen rendering, Ohm's law calculator logic
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
2. Good second candidate: **Resistor color code** (Passive components) — visual band picker, good test of a non-numeric-input calculator.
3. Circuit diagrams: add the schematic SVG per calculator that needs one (see REFERENCE.md section 4, "Calculator screen template").
4. Consider extracting the calculator template into a shared render helper once 3-4 calculators exist, to avoid repeating the boilerplate seen in `renderOhmsLaw`.
5. Longer term: Links and Notes sections (Tools domain) need actual storage logic (localStorage is fine to start, same pattern as favorites).

## Deploying

Static site — works from GitHub Pages (`Settings → Pages → branch: main → root`), Netlify, or any static host. No environment variables, no server, no build command.
