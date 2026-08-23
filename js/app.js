// Circuit Codex — app shell (vanilla JS, hash-based routing)

const app = document.getElementById("app");

// One value field is almost always being replaced, not appended to — select
// its whole contents on the first click so typing a new value doesn't
// require a manual select-all first. Delegated on #app (which survives every
// paint(), unlike the inputs inside it) rather than wired per calculator, so
// it applies everywhere at once instead of needing to be repeated in each
// render function. Left out of any .search-box input (the global Search
// screen, Formula search, Physical constants, and any future one) — a click
// there is meant to place a caret for editing a query, not replace it outright.
app.addEventListener("click", (e) => {
  const el = e.target;
  if (el.tagName !== "INPUT" || (el.type !== "number" && el.type !== "text")) return;
  if (el.closest(".search-box")) return;
  el.select();
});

// Reference rows (ASCII table, and any future lookup list) are read-only —
// there's no field to select() — but the reason to tap one is usually to
// copy it out, so a click selects the row's whole text instead. Opt in with
// the "tap-select" class rather than making every card do this, since it
// only makes sense for compact single-value rows.
function selectElementText(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
app.addEventListener("click", (e) => {
  const row = e.target.closest(".tap-select");
  if (row) selectElementText(row);
});

// Favourites are keyed by what a tool *is*, not where it sits. Position keys
// (domain:section:index) silently repoint at a different tool whenever the list
// is reordered or something is removed, which has already happened once.
function favoriteId(domain, section, tool) {
  return `${domain.id}:${section.title}:${tool.name}`;
}

function findByFavoriteId(id) {
  for (const d of DOMAINS) {
    for (let si = 0; si < d.sections.length; si++) {
      const sec = d.sections[si];
      for (let ti = 0; ti < sec.tools.length; ti++) {
        if (favoriteId(d, sec, sec.tools[ti]) === id) {
          return { domain: d, section: sec, tool: sec.tools[ti], key: `${d.id}:${si}:${ti}` };
        }
      }
    }
  }
  return null;
}

function favorites() {
  return JSON.parse(localStorage.getItem("cc_favorites") || "[]");
}
function toggleFavorite(id) {
  const favs = favorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1); else favs.push(id);
  localStorage.setItem("cc_favorites", JSON.stringify(favs));
}
function isFavorite(id) {
  return favorites().includes(id);
}

const POSITION_KEY = /^[^:]+:\d+:\d+$/;

// ---------- Icons (inline SVG, literal style) ----------
const ICONS = {
  resistor: `<svg width="36" height="36" viewBox="0 0 48 24"><path d="M2 12 H12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M36 12 H46" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/><rect x="12" y="6" width="24" height="12" rx="5" fill="#D9C9A8"/><rect x="16" y="6" width="2.4" height="12" fill="#7A4A2B"/><rect x="21" y="6" width="2.4" height="12" fill="#C24C3A"/><rect x="26" y="6" width="2.4" height="12" fill="#D8A62B"/></svg>`,
  transistor: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M8 6 V18 M8 10 L15 6 M8 14 L15 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  binary: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><text x="2" y="10" font-size="8" fill="currentColor" font-family="monospace">10</text><text x="2" y="20" font-size="8" fill="currentColor" font-family="monospace">01</text></svg>`,
  antenna: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 22 V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7" r="2" fill="currentColor"/><path d="M8 4 Q12 -1 16 4 M5 7 Q12 -4 19 7" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`,
  bolt: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M13 2 L4 14 H11 L9 22 L20 9 H13 L15 2 Z" fill="currentColor"/></svg>`,
  pcb: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/><circle cx="16" cy="8" r="1.4" fill="currentColor"/><circle cx="8" cy="16" r="1.4" fill="currentColor"/><path d="M8 9.4 V14.6 M9.4 8 H14.6" stroke="currentColor" stroke-width="1.4"/></svg>`,
  wrench: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 11 L12 4 L20 11 V20 H4 Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21 L16.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  tools: `<svg viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3 L14.6 9.3 L21.4 9.8 L16.2 14.1 L17.9 20.7 L12 17.1 L6.1 20.7 L7.8 14.1 L2.6 9.8 L9.4 9.3 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none"><path d="M15 5 L8 12 L15 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none"><path d="M9 5 L16 12 L9 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M12 11 V16 M12 8 V8.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  bolt2: `<svg viewBox="0 0 24 24" fill="none"><path d="M13 2 L4 14 H11 L9 22 L20 9 H13 L15 2 Z" fill="currentColor"/></svg>`,
};

// ---------- Router ----------
function render() {
  const hash = location.hash.replace("#", "") || "/home";
  const parts = hash.split("/").filter(Boolean);

  if (parts[0] === "home") return renderHome();
  if (parts[0] === "search") return renderSearch();
  if (parts[0] === "favorites") return renderFavorites();
  if (parts[0] === "domain" && parts[1]) return renderDomain(parts[1]);
  if (parts[0] === "tool" && parts[1] !== undefined) return renderTool(parts[1], parts[2]);

  renderHome();
}
window.addEventListener("hashchange", render);

function tabbarHTML(activeTab) {
  const tabs = [
    { id: "home", label: "Home", icon: "home" },
    { id: "search", label: "Search", icon: "search" },
    { id: "tools", label: "Tools", icon: "tools" },
    { id: "favorites", label: "Favorites", icon: "star" },
  ];
  return `<div class="tabbar">${tabs.map(t => `
    <button class="tab ${activeTab === t.id ? "active" : ""}" onclick="${t.id === "tools" ? `location.hash='/domain/tools'` : `location.hash='/${t.id}'`}">
      ${ICONS[t.icon]}<span>${t.label}</span>
    </button>`).join("")}</div>`;
}

function renderHome() {
  const domains = DOMAINS.filter(d => d.id !== "tools");
  const toolsDomain = DOMAINS.find(d => d.id === "tools");
  app.innerHTML = `
    <div class="topbar"><h1>Circuit Codex</h1></div>
    <div class="sub">Electronics reference and tools</div>
    <div class="domain-grid">
      ${domains.map(d => `
        <button class="domain-card" onclick="location.hash='/domain/${d.id}'">
          <div class="chip" style="background:${d.bg};color:${d.color}">${ICONS[d.icon]}</div>
          <div class="card-title">${d.title}</div>
          <div class="card-sub">${d.subtitle}</div>
        </button>`).join("")}
    </div>
    <button class="full-card" onclick="location.hash='/domain/${toolsDomain.id}'">
      <div class="chip" style="background:${toolsDomain.bg};color:${toolsDomain.color}">${ICONS[toolsDomain.icon]}</div>
      <div>
        <div class="card-title">${toolsDomain.title}</div>
        <div class="card-sub">${toolsDomain.subtitle}</div>
      </div>
    </button>
    ${tabbarHTML("home")}
  `;
}

function renderDomain(domainId) {
  const d = DOMAINS.find(x => x.id === domainId);
  if (!d) return renderHome();
  app.innerHTML = `
    <div class="topbar back-row">
      <button class="icon-btn" onclick="location.hash='/home'">${ICONS.chevronLeft}</button>
      <h1>${d.title}</h1>
      <span class="icon-btn" aria-hidden="true" style="visibility:hidden">${ICONS.chevronLeft}</span>
    </div>
    <div class="sub">${d.subtitle}</div>
    ${d.sections.map((sec, si) => `
      <div class="section-label" style="color:${d.color}">${sec.title}</div>
      <div class="tool-list">
        ${sec.tools.map((t, ti) => {
          const key = `${d.id}:${si}:${ti}`;
          return `<button class="tool-row" onclick="location.hash='/tool/${encodeURIComponent(key)}/${t.calc || ""}'">
            <span>${t.name}</span>
            <span class="chev">${ICONS.chevronRight}</span>
          </button>`;
        }).join("")}
      </div>`).join("")}
    <div style="height:8px"></div>
    ${tabbarHTML(domainId === "tools" ? "tools" : "home")}
  `;
}

function findTool(key) {
  const [domainId, si, ti] = key.split(":");
  const d = DOMAINS.find(x => x.id === domainId);
  if (!d) return null;
  const sec = d.sections[+si];
  if (!sec) return null;
  const tool = sec.tools[+ti];
  if (!tool) return null;
  return { domain: d, section: sec, tool, key };
}

function renderTool(rawKey, calcId) {
  const key = decodeURIComponent(rawKey);
  const found = findTool(key);
  if (!found) return renderHome();
  const { domain, section, tool } = found;
  const favId = favoriteId(domain, section, tool);

  if (calcId === "ohms-law") return renderOhmsLaw(domain, tool, favId);
  if (calcId === "resistor-color-code") return renderResistorColorCode(domain, tool, favId);
  if (calcId === "smd-code") return renderSmdCode(domain, tool, favId);
  if (calcId === "e-series") return renderESeries(domain, tool, favId);
  if (calcId === "voltage-divider") return renderVoltageDivider(domain, tool, favId);
  if (calcId === "current-divider") return renderCurrentDivider(domain, tool, favId);
  if (calcId === "wheatstone-bridge") return renderWheatstoneBridge(domain, tool, favId);
  if (calcId === "kirchhoff") return renderKirchhoff(domain, tool, favId);
  if (calcId === "series-parallel") return renderSeriesParallel(domain, tool, favId);
  if (calcId === "cap-series-parallel") return renderCapSeriesParallel(domain, tool, favId);
  if (calcId === "formula-search") return renderFormulaSearch(domain, tool, favId);
  if (calcId === "si-prefix") return renderSiPrefixConverter(domain, tool, favId);
  if (calcId === "sci-eng") return renderSciEngNotation(domain, tool, favId);
  if (calcId === "percent-tolerance") return renderPercentTolerance(domain, tool, favId);
  if (calcId === "basic-calculator") return renderBasicCalculator(domain, tool, favId);
  if (calcId === "physical-constants") return renderPhysicalConstants(domain, tool, favId);
  if (calcId === "si-units") return renderSiUnits(domain, tool, favId);
  if (calcId === "dec-hex-bin") return renderDecHexBin(domain, tool, favId);
  if (calcId === "ascii-table") return renderAsciiTable(domain, tool, favId);
  if (calcId === "wire-gauge") return renderWireGauge(domain, tool, favId);
  if (calcId === "cable-resistance-drop") return renderCableResistanceDrop(domain, tool, favId);
  if (calcId === "cable-colors") return renderCableColors(domain, tool, favId);

  // Placeholder screen for tools not yet built
  app.innerHTML = `
    <div class="topbar back-row">
      <button class="icon-btn" onclick="history.back()">${ICONS.chevronLeft}</button>
      <h1>${tool.name}</h1>
      <button class="icon-btn ${isFavorite(favId) ? "active" : ""}" id="fav-btn">${ICONS.star}</button>
    </div>
    <div class="sub">${domain.title} · ${section.title}</div>
    <div class="placeholder">
      ${ICONS.wrench}
      <div style="font-size:14px;">This calculator isn't built yet in this preview.</div>
      <div style="font-size:12px;margin-top:6px;">Structure and naming are final — logic comes next.</div>
    </div>
    ${tabbarHTML("")}
  `;

  document.getElementById("fav-btn").onclick = () => { toggleFavorite(favId); render(); };
}

function renderSearch() {
  app.innerHTML = `
    <div class="topbar"><h1>Search</h1></div>
    <div class="search-box">
      ${ICONS.search}
      <input id="search-input" type="text" placeholder="Search tools, formulas, terms" autofocus />
    </div>
    <div id="search-results" class="tool-list"></div>
    ${tabbarHTML("search")}
  `;
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    results.innerHTML = "";
    if (!q) return;
    const matches = [];
    DOMAINS.forEach(d => {
      d.sections.forEach((sec, si) => {
        sec.tools.forEach((t, ti) => {
          if (t.name.toLowerCase().includes(q)) {
            matches.push({ d, sec, t, key: `${d.id}:${si}:${ti}` });
          }
        });
      });
    });
    if (!matches.length) {
      results.innerHTML = `<div class="placeholder">${ICONS.search}<div>No matches for "${q}"</div></div>`;
      return;
    }
    results.innerHTML = matches.slice(0, 40).map(m => `
      <button class="tool-row" style="flex-direction:column;align-items:flex-start;" onclick="location.hash='/tool/${encodeURIComponent(m.key)}/${m.t.calc || ""}'">
        <span>${m.t.name}</span>
        <span class="breadcrumb">${m.d.title} · ${m.sec.title}</span>
      </button>`).join("");
  });
}

function renderFavorites() {
  const items = favorites().map(id => findByFavoriteId(id)).filter(Boolean);
  app.innerHTML = `
    <div class="topbar"><h1>Favorites</h1></div>
    <div class="tool-list">
      ${items.length ? items.map(it => `
        <div class="tool-row fav-row">
          <button class="fav-open" data-route="/tool/${encodeURIComponent(it.key)}/${it.tool.calc || ""}">
            <span>${it.tool.name}</span>
            <span class="breadcrumb">${it.domain.title} · ${it.section.title}</span>
          </button>
          <button class="icon-btn active fav-remove" data-id="${favoriteId(it.domain, it.section, it.tool)}"
                  aria-label="Remove ${it.tool.name} from favorites">${ICONS.star}</button>
        </div>`).join("") :
        `<div class="placeholder">${ICONS.star}<div>No favorites yet.</div><div style="font-size:12px;margin-top:6px;">Tap the star on any tool to pin it here.</div></div>`
      }
    </div>
    ${tabbarHTML("favorites")}
  `;

  // Wired rather than inline: identities carry apostrophes ("Ohm's law").
  app.querySelectorAll(".fav-open").forEach(btn => {
    btn.onclick = () => { location.hash = btn.dataset.route; };
  });
  app.querySelectorAll(".fav-remove").forEach(btn => {
    btn.onclick = () => { toggleFavorite(btn.dataset.id); renderFavorites(); };
  });
}


// ---------- Shared calculator screen ----------
// Every calculator is the same shape: header, an optional illustration, an
// optional mode selector, its own body, a footnote. That shape lives here so a
// fix lands once instead of four times — the duplication it replaces had
// already caused three bugs, twice by an edit landing in the wrong calculator.

function trim(n) {
  return Number(n.toPrecision(4)).toString();
}

function formatOhms(v) {
  if (!isFinite(v)) return "—";
  // A zero-ohm link is a real part; without this it falls through to the
  // milliohm branch and reads "0 mΩ".
  if (v === 0) return "0 Ω";
  for (const [scale, unit] of [[1e9, "GΩ"], [1e6, "MΩ"], [1e3, "kΩ"], [1, "Ω"]]) {
    if (Math.abs(v) >= scale) return `${trim(v / scale)} ${unit}`;
  }
  return `${trim(v * 1e3)} mΩ`;
}

function formatFarads(v) {
  if (!isFinite(v)) return "—";
  if (v === 0) return "0 F";
  for (const [scale, unit] of [[1, "F"], [1e-3, "mF"], [1e-6, "µF"], [1e-9, "nF"], [1e-12, "pF"]]) {
    if (Math.abs(v) >= scale) return `${trim(v / scale)} ${unit}`;
  }
  return `${trim(v / 1e-12)} pF`;
}

function calcHeader(tool, favId, subtitle) {
  return `
    <div class="topbar back-row">
      <button class="icon-btn" onclick="history.back()">${ICONS.chevronLeft}</button>
      <h1>${tool.name}</h1>
      <button class="icon-btn ${isFavorite(favId) ? "active" : ""}" id="fav-btn">${ICONS.star}</button>
    </div>
    ${subtitle ? `<div class="sub">${subtitle}</div>` : ""}`;
}

// options is [value, label] pairs; the active one is tinted with the domain
// accent. Values are compared as strings so callers can pass numbers.
function pillRow(options, active, bg) {
  return `
    <div class="mode-pills">
      ${options.map(([value, label]) => `
        <button class="pill ${String(value) === String(active) ? "active" : ""}" data-pill="${value}"
                style="${String(value) === String(active) ? `background:${bg};color:#8FC1F5` : ""}">${label}</button>`).join("")}
    </div>`;
}

// note is falsy on the four calculators formulaSection now covers in full —
// the one-liner this used to carry would just repeat that section's first
// line right below it.
function calcFooter(note) {
  return `
      ${note ? `<div class="formula-note">${ICONS.info}<span data-res="note">${note}</span></div>` : ""}
      ${tabbarHTML("")}`;
}

// The one-liner in calcFooter names only the rearrangement the current
// mode/solve actually uses. This is the rest of the family — every legal
// rearrangement, not just the one on screen — reusing the Formula search
// screen's own card styling. Scrolling to see it is fine: unlike the rest of
// a calculator screen, this section only exists to be read, not glanced at.
function formulaSection(lines, note) {
  return `
    <div class="section-label" style="color:#9AA0A8">Formula</div>
    <div class="formula-card formula-card--static" style="margin:0 16px 10px;">
      ${lines.map(l => `<div class="formula-line">${l}</div>`).join("")}
      ${note ? `<div class="formula-card-note">${note}</div>` : ""}
    </div>`;
}

function wireCalc(favId, repaint, onPill) {
  document.getElementById("fav-btn").onclick = () => { toggleFavorite(favId); repaint(); };
  if (onPill) {
    app.querySelectorAll(".pill").forEach(btn => { btn.onclick = () => onPill(btn.dataset.pill); });
  }
}

// ---------- Ohm's law calculator (fully functional proof of concept) ----------
function renderOhmsLaw(domain, tool, favId) {
  const state = { mode: "vi", tol: 1, V: 12, I: 250, Ivi_unit: "mA" };

  // Series loop with V, I and R marked where they physically are: V across the
  // source, I as a current arrow along the wire, R on the resistor. The resistor
  // is the ANSI/IEEE 315 zigzag at the same proportions as every other schematic
  // in the app: six peaks, body about 2.5 times its width, straight wire either
  // side. Wires stay
  // neutral so the labels can carry the mode — a quantity you entered is drawn
  // in the input blue, one being solved for in the result green, matching the
  // "Your inputs" and "Results" headings below.
  function diagram() {
    const known = fieldsForMode(state.mode);
    const tone = (v) => (known.includes(v) ? "#8FC1F5" : "#5DCAA5");
    const wire = "#5A6169";
    return `<svg width="220" height="90" viewBox="0 0 220 90" fill="none">
      <path d="M34 34 H95 M131 34 H186 M186 34 V84 M186 84 H34 M34 34 V52 M34 62 V84" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M95 34 L98 27 L104 41 L110 27 L116 41 L122 27 L128 41 L131 34" stroke="${tone("R")}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
      <path d="M22 52 H46" stroke="${tone("V")}" stroke-width="2"/>
      <path d="M28 62 H40" stroke="${tone("V")}" stroke-width="2"/>
      <path d="M50 22 H74 M69 18 L75 22 L69 26" stroke="${tone("I")}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="12" y="61" fill="${tone("V")}" font-size="12" font-weight="600" text-anchor="middle">V</text>
      <text x="62" y="14" fill="${tone("I")}" font-size="12" font-weight="600" text-anchor="middle">I</text>
      <text x="113" y="18" fill="${tone("R")}" font-size="12" font-weight="600" text-anchor="middle">R</text>
    </svg>`;
  }

  function unitScale(unit, base) {
    // returns factor to convert display value -> base SI unit
    const scales = { "V": 1, "mV": 1e-3, "A": 1, "mA": 1e-3, "µA": 1e-6, "Ω": 1, "kΩ": 1e3, "MΩ": 1e6, "W": 1, "mW": 1e-3 };
    return scales[unit] ?? 1;
  }

  function fieldsForMode(mode) {
    if (mode === "vi") return ["V", "I"];
    if (mode === "vr") return ["V", "R"];
    return ["I", "R"];
  }


  function unitOptionsFor(varName) {
    if (varName === "V") return ["V", "mV"];
    if (varName === "I") return ["A", "mA", "µA"];
    if (varName === "R") return ["Ω", "kΩ", "MΩ"];
    if (varName === "P") return ["W", "mW"];
    return [""];
  }

  function defaultUnit(varName) {
    return { V: "V", I: "mA", R: "kΩ", P: "W" }[varName];
  }

  if (!state.units) {
    state.units = { V: "V", I: "mA", R: "kΩ", P: "W" };
    state.values = { V: 12, I: 250, R: 1, P: 3 };
  }

  // A resistor you supply carries a tolerance, so whatever it determines carries
  // one too. In VI mode R is derived from measured V and I instead, so there is
  // no tolerance to propagate — only a nearest standard part to suggest.
  function spreadFor(name, r) {
    const t = state.tol / 100;
    if (state.mode === "vi" || !isFinite(r.R) || r.R <= 0) return null;
    if (state.mode === "vr") {
      if (name === "I") return { lo: r.V / (r.R * (1 + t)), hi: r.V / (r.R * (1 - t)) };
      if (name === "P") return { lo: (r.V * r.V) / (r.R * (1 + t)), hi: (r.V * r.V) / (r.R * (1 - t)) };
    }
    if (state.mode === "ir") {
      if (name === "V") return { lo: r.I * r.R * (1 - t), hi: r.I * r.R * (1 + t) };
      if (name === "P") return { lo: r.I * r.I * r.R * (1 - t), hi: r.I * r.I * r.R * (1 + t) };
    }
    return null;
  }

  function seriesHint(ohms) {
    if (!isFinite(ohms) || ohms <= 0) return "";
    const series = eSeriesForTolerance(state.tol);
    const near = nearestESeries(ohms, series);
    return near.exact ? series : `${series} → ${formatOhms(near.value)}`;
  }

  function resultSub(v, r) {
    if (v === "R") return seriesHint(r.R);
    const spread = spreadFor(v, r);
    if (!spread) return "";
    const unit = state.units[v] || defaultUnit(v);
    const scale = unitScale(unit);
    return `${fmt(spread.lo / scale)} – ${fmt(spread.hi / scale)} ${unit}`;
  }

  function compute() {
    const inputs = fieldsForMode(state.mode);
    const [a, b] = inputs;
    const va = state.values[a] * unitScale(state.units[a]);
    const vb = state.values[b] * unitScale(state.units[b]);
    let V, I, R;
    if (state.mode === "vi") { V = va; I = vb; R = I !== 0 ? V / I : NaN; }
    if (state.mode === "vr") { V = va; R = vb; I = R !== 0 ? V / R : NaN; }
    if (state.mode === "ir") { I = va; R = vb; V = I * R; }
    const P = V * I;
    return { V, I, R, P };
  }

  function fmt(num) {
    if (!isFinite(num)) return "—";
    if (Math.abs(num) >= 1000 || (Math.abs(num) < 0.001 && num !== 0)) return num.toExponential(2);
    return Number(num.toPrecision(4)).toString();
  }

  function displayValue(varName, siValue) {
    const scale = unitScale(state.units[varName]);
    return fmt(siValue / scale);
  }

  // Refresh only the result numbers. The set of result fields depends on the
  // mode, not on the values, so it is stable while typing — updating in place
  // keeps the caret alive, which a full paint() would destroy on every keystroke.
  function updateResults() {
    const inputs = fieldsForMode(state.mode);
    const results = compute();
    ["V", "I", "R", "P"].filter(v => !inputs.includes(v)).forEach(v => {
      const num = app.querySelector(`.result-field[data-out="${v}"] .num`);
      if (num) num.textContent = fmt(results[v] / unitScale(state.units[v] || defaultUnit(v)));
      const sub = app.querySelector(`.result-field[data-out="${v}"] [data-sub]`);
      if (sub) sub.textContent = resultSub(v, results);
    });
    const hint = app.querySelector('[data-hint="R"]');
    if (hint) hint.textContent = seriesHint(state.values.R * unitScale(state.units.R));
    if (inputs.includes("R")) {
      syncSliderPositions(eSeriesForTolerance(state.tol),
        () => state.values.R * unitScale(state.units.R),
        () => unitSliderBounds(unitScale(state.units.R)));
    }
  }

  function paint() {
    const inputs = fieldsForMode(state.mode);
    const outputs = ["V", "I", "R", "P"].filter(v => !inputs.includes(v));
    const results = compute();

    app.innerHTML = `
      ${calcHeader(tool, favId, "Voltage, current, resistance")}

      <div class="diagram-box">${diagram()}</div>

      ${pillRow([["vi", "VI"], ["vr", "VR"], ["ir", "IR"]], state.mode, "#1B2A3B")}

      <div class="section-label" style="color:#8FC1F5">Your inputs
        <select id="ohm-tol" class="label-select">
          ${[0.1, 0.5, 1, 2, 5, 10].map(t => `<option value="${t}" ${state.tol === t ? "selected" : ""}>±${t}% · ${eSeriesForTolerance(t)}</option>`).join("")}
        </select>
      </div>
      ${inputs.map(v => `
        <div class="field">
          <label><span class="field-name">${{ V: "Voltage (V)", I: "Current (I)", R: "Resistance (R)" }[v]}</span>${
            v === "R" ? `<span class="field-hint" data-hint="R">${seriesHint(state.values.R * unitScale(state.units.R))}</span>` : ""}</label>
          <div class="field-row">
            <input type="number" inputmode="decimal" data-var="${v}" value="${displayValue(v, state.values[v] === undefined ? 0 : state.values[v] * unitScale(state.units[v]))}" />
            <select data-unit="${v}">
              ${unitOptionsFor(v).map(u => `<option value="${u}" ${state.units[v] === u ? "selected" : ""} style="color:#8FC1F5;background:#15181D;">${u}</option>`).join("")}
            </select>
          </div>
          ${v === "R" ? seriesSliderHTML("R", eSeriesForTolerance(state.tol), state.values.R * unitScale(state.units.R), unitSliderBounds(unitScale(state.units.R))) : ""}
        </div>`).join("")}

      <div class="section-label" style="color:#5DCAA5">Results</div>
      ${outputs.map(v => `
        <div class="result-field" data-out="${v}">
          <div class="result-head">
            <span class="label">${{ V: "Voltage (V)", I: "Current (I)", R: "Resistance (R)", P: "Power (P)" }[v]}</span>
            <span class="badge-calc">${ICONS.bolt2}Calculated</span>
          </div>
          <div class="result-value">
            <span class="num">${fmt(results[v] / unitScale(state.units[v] || defaultUnit(v)))}</span>
            <span class="unit">${state.units[v] || defaultUnit(v)}</span>
          </div>
          <div class="result-sub" data-sub="${v}">${resultSub(v, results)}</div>
        </div>`).join("")}

      ${formulaSection(
        ["V = I × R", "I = V / R", "R = V / I", "P = V × I", "P = I² × R", "P = V² / R"],
        "Any two of V, I, R give the third; power follows from any pair."
      )}
      ${calcFooter()}
    `;

    wireCalc(favId, paint, (v) => { state.mode = v; paint(); });
    app.querySelectorAll("input[data-var]").forEach(inp => {
      inp.oninput = () => {
        // Store NaN for a blank or half-typed field too: compute() propagates it
        // and fmt() shows "—", rather than leaving a stale number under a
        // "Calculated" badge that no longer matches the inputs on screen.
        state.values[inp.dataset.var] = parseFloat(inp.value);
        updateResults();
      };
    });
    app.querySelectorAll("select[data-unit]").forEach(sel => {
      sel.onchange = () => { state.units[sel.dataset.unit] = sel.value; paint(); };
    });
    document.getElementById("ohm-tol").onchange = (e) => {
      state.tol = parseFloat(e.target.value);
      paint();
    };
    if (inputs.includes("R")) {
      wireSlider("R",
        () => eSeriesRange(eSeriesForTolerance(state.tol), ...unitSliderBounds(unitScale(state.units.R))),
        (ohms) => {
          state.values.R = ohms / unitScale(state.units.R);
          app.querySelector('input[data-var="R"]').value = trim(state.values.R);
          updateResults();
        });
    }
  }

  paint();
}

// ---------- Resistor colour code ----------
// A band's meaning depends on which position it sits in, so one table carries
// every reading of a colour and each role picks the property it needs. A colour
// is offered for a role only if it has a value for it — silver is a legal
// multiplier and tolerance but never a digit.
const BAND_COLORS = {
  black:  { hex: "#1A1A1A", digit: 0, mult: 1,    tc: 250 },
  brown:  { hex: "#7A4A21", digit: 1, mult: 1e1,  tol: 1,    tc: 100 },
  red:    { hex: "#C62828", digit: 2, mult: 1e2,  tol: 2,    tc: 50 },
  orange: { hex: "#EF6C00", digit: 3, mult: 1e3,             tc: 15 },
  yellow: { hex: "#F2C200", digit: 4, mult: 1e4,             tc: 25 },
  green:  { hex: "#2E8B45", digit: 5, mult: 1e5,  tol: 0.5,  tc: 20 },
  blue:   { hex: "#2160C4", digit: 6, mult: 1e6,  tol: 0.25, tc: 10 },
  violet: { hex: "#7C4DBE", digit: 7, mult: 1e7,  tol: 0.1,  tc: 5 },
  grey:   { hex: "#9AA0A8", digit: 8, mult: 1e8,  tol: 0.05, tc: 1 },
  white:  { hex: "#F2F2F2", digit: 9, mult: 1e9 },
  gold:   { hex: "#C9A227",           mult: 0.1,  tol: 5 },
  silver: { hex: "#C0C4C8",           mult: 0.01, tol: 10 },
  // IEC 60062 marks ±20% by leaving the tolerance band off the part, so this
  // entry is the absence of a band rather than a colour. It is legal on the
  // tolerance role only, and draws nothing on the resistor.
  none:   { hex: "transparent",                   tol: 20 },
};

// Column headers are abbreviated: six columns across a phone leaves ~50px each.
// The full label from BAND_ROLE_LABEL rides along as the column's title.
const ROLLER_NAME = {
  d1: "1st", d2: "2nd", d3: "3rd", mult: "Mult", tol: "Tol", tc: "Temp",
};

// E6/E12/E24 are published two-digit sets and do not come out of the decade
// formula (it yields 14, the standard says 15), so they are listed. E48/E96/E192
// are three-digit and do follow it, so they are generated.
const E_LISTED = {
  E6: [10, 15, 22, 33, 47, 68],
  E12: [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82],
  E24: [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91],
};

function eSeriesValues(name) {
  if (E_LISTED[name]) return E_LISTED[name];
  const count = { E48: 48, E96: 96, E192: 192 }[name];
  return Array.from({ length: count }, (_, i) => Number((Math.pow(10, i / count) * 100).toPrecision(3)));
}

// Each series exists to cover a tolerance band: at ±5% the E24 steps just touch,
// so the tolerance on the part tells you which series it was drawn from.
function eSeriesForTolerance(tol) {
  if (tol >= 20) return "E6";
  if (tol >= 10) return "E12";
  if (tol >= 5) return "E24";
  if (tol >= 2) return "E48";
  if (tol >= 1) return "E96";
  return "E192";
}

function nearestESeries(ohms, name) {
  const values = eSeriesValues(name);
  const places = values[0] >= 100 ? 3 : 2;
  const scale = Math.pow(10, Math.floor(Math.log10(ohms)) - (places - 1));
  const mantissa = ohms / scale;
  // The top of the decade is the first value of the next one, so include it or
  // a 9.7 mantissa reports a long way off instead of just under 10.
  let best = values[0] * 10;
  for (const v of values) {
    if (Math.abs(v - mantissa) < Math.abs(best - mantissa)) best = v;
  }
  return { value: best * scale, exact: Math.abs(best - mantissa) < mantissa * 1e-9 };
}

// ---------- Standard-value slider ----------
// A resistor field's slider drags through the active E-series only — every
// position it can land on is an orderable part. The overall span it could
// ever reach is a practical 1 Ω to 10 MΩ (narrower than E_LISTED could
// technically cover, but nobody is dragging a slider out to milliohms or
// gigohms looking for a stock part) — but at any moment it only explores the
// one decade family the unit selector is currently set to. Crossing from Ω
// into kΩ by dragging would be surprising when there is a unit dropdown
// sitting right there for exactly that job — switch units first, then drag.
const SLIDER_MIN_OHMS = 1;
const SLIDER_MAX_OHMS = 10e6;

// 999× rather than 999.999×: the gap this needs to land in is "below the
// next unit's first value" (…, 976, [boundary], 1000, …), and even E192's
// tightest step is ~1.2% — a 0.1% margin comfortably clears that without
// float rounding on either side accidentally pulling the next unit's value
// into range, which a wider margin did.
function unitSliderBounds(scale, rangeMin = SLIDER_MIN_OHMS, rangeMax = SLIDER_MAX_OHMS) {
  return [Math.max(rangeMin, scale), Math.min(rangeMax, scale * 999)];
}

function eSeriesRange(series, minOhms = SLIDER_MIN_OHMS, maxOhms = SLIDER_MAX_OHMS) {
  const values = eSeriesValues(series);
  const places = values[0] >= 100 ? 3 : 2;
  let decade = Math.pow(10, Math.floor(Math.log10(minOhms)) - (places - 1));
  const out = [];
  // Float-precision slack only (repeated ×10 can land a fraction of a percent
  // off an exact boundary like the 10 MΩ ceiling) — not a real tolerance, or
  // it reopens the gap the 999× margin above exists to close.
  const eps = 1e-6;
  while (decade * values[0] <= maxOhms * (1 + eps)) {
    for (const v of values) {
      const ohms = v * decade;
      if (ohms >= minOhms * (1 - eps) && ohms <= maxOhms * (1 + eps)) out.push(ohms);
    }
    decade *= 10;
  }
  return out;
}

// Nearest by ratio rather than absolute difference — a range spanning a full
// decade family needs "close" to mean the same thing at both ends.
function nearestSliderIndex(range, ohms) {
  if (!isFinite(ohms) || ohms <= 0 || range.length === 0) return 0;
  let best = 0, bestDiff = Infinity;
  for (let i = 0; i < range.length; i++) {
    const diff = Math.abs(Math.log(range[i]) - Math.log(ohms));
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  }
  return best;
}

function seriesSliderHTML(fieldId, series, ohms, bounds) {
  const range = eSeriesRange(series, bounds[0], bounds[1]);
  const idx = nearestSliderIndex(range, ohms);
  const max = Math.max(0, range.length - 1);
  return `<div class="slider-row">
    <button type="button" class="slider-step" data-slider="${fieldId}" data-dir="-1" aria-label="Previous standard value">−</button>
    <input type="range" class="series-slider" data-slider="${fieldId}" min="0" max="${max}" step="1" value="${idx}" aria-label="Drag to a standard value within this unit" />
    <button type="button" class="slider-step" data-slider="${fieldId}" data-dir="1" aria-label="Next standard value">+</button>
  </div>`;
}

// Wires one resistor field's slider together with its ± step buttons.
// getRange() is called fresh on every interaction rather than memoized,
// since the active series or unit can have changed since the last render.
// onPick receives the chosen value in ohms — converting it, writing it into
// state, mirroring the number field, and refreshing results is the caller's
// job, since that bookkeeping differs per calculator.
function wireSlider(fieldId, getRange, onPick) {
  const slider = app.querySelector(`.series-slider[data-slider="${fieldId}"]`);
  if (!slider) return;
  const step = (dir) => {
    // A held button's repeat timer outlives a single interaction — if a
    // tolerance/mode change repainted the screen while it was still running,
    // this element is a detached leftover from the old render and the field
    // it used to control may no longer exist at all. Stop quietly instead of
    // writing into whatever now occupies app's DOM.
    if (!slider.isConnected) return;
    const range = getRange();
    if (!range.length) return;
    const idx = Math.max(0, Math.min(range.length - 1, +slider.value + dir));
    slider.value = idx;
    onPick(range[idx]);
  };
  slider.oninput = () => {
    const range = getRange();
    if (range.length) onPick(range[+slider.value]);
  };
  app.querySelectorAll(`.slider-step[data-slider="${fieldId}"]`).forEach(btn => {
    const dir = +btn.dataset.dir;
    let holdTimeout = null, repeatInterval = null;
    const stop = () => { clearTimeout(holdTimeout); clearInterval(repeatInterval); };
    const start = () => {
      stop();
      step(dir);
      // A held button repeats after a short delay, faster than a single tap
      // could — release (mouseup/leave/touchend) always clears both timers.
      holdTimeout = setTimeout(() => { repeatInterval = setInterval(() => step(dir), 90); }, 420);
    };
    btn.onmousedown = start;
    btn.onmouseup = stop;
    btn.onmouseleave = stop;
    btn.ontouchstart = (e) => { e.preventDefault(); start(); };
    btn.ontouchend = stop;
    btn.ontouchcancel = stop;
  });
}

// Repositions every slider in the current paint to match its field's live
// value — needed after typing a number directly, after a tolerance change
// resizes the active series, and after a unit change moves the decade family
// a slider is allowed to explore.
function syncSliderPositions(series, getOhms, getBounds) {
  app.querySelectorAll(".series-slider").forEach(el => {
    const name = el.dataset.slider;
    const bounds = getBounds(name);
    const range = eSeriesRange(series, bounds[0], bounds[1]);
    el.max = Math.max(0, range.length - 1);
    el.value = nearestSliderIndex(range, getOhms(name));
  });
}

const TOL_ORDER = ["brown", "red", "green", "blue", "violet", "grey", "gold", "silver", "none"];

const BAND_ROLE_LABEL = {
  d1: "1st digit", d2: "2nd digit", d3: "3rd digit",
  mult: "Multiplier", tol: "Tolerance", tc: "Temp. coefficient",
};

const OHM_UNITS = { "mΩ": 1e-3, "Ω": 1, "kΩ": 1e3, "MΩ": 1e6, "GΩ": 1e9 };

function renderResistorColorCode(domain, tool, favId) {
  const state = {
    count: 4,
    unit: "kΩ",
    bands: { d1: "brown", d2: "black", d3: "black", mult: "red", tol: "gold", tc: "brown" },
  };

  // Digits, then multiplier, then tolerance; the 6th band adds temperature
  // coefficient. The order here is also the order the bands are painted.
  function rolesFor(count) {
    if (count === 4) return ["d1", "d2", "mult", "tol"];
    if (count === 5) return ["d1", "d2", "d3", "mult", "tol"];
    return ["d1", "d2", "d3", "mult", "tol", "tc"];
  }

  function propFor(role) {
    return role === "mult" || role === "tol" || role === "tc" ? role : "digit";
  }

  function optionsFor(role) {
    // Tolerance needs its own order. Table order is dictated by the digit and
    // multiplier bands, where white sits at 9 and ×1G, but on the tolerance band
    // it belongs past gold and silver at the loose end of the scale.
    if (role === "tol") return TOL_ORDER;
    const prop = propFor(role);
    return Object.keys(BAND_COLORS).filter(c => BAND_COLORS[c][prop] !== undefined);
  }



  function multLabel(v) {
    if (v >= 1e9) return "×1G";
    if (v >= 1e6) return `×${trim(v / 1e6)}M`;
    if (v >= 1e3) return `×${trim(v / 1e3)}k`;
    return `×${trim(v)}`;
  }

  // What the colour on this band is worth, in the units of its role.
  function valueLabel(role, color) {
    const v = BAND_COLORS[color][propFor(role)];
    if (role === "mult") return multLabel(v);
    if (role === "tol") return `±${v}%`;
    if (role === "tc") return `${v} ppm/K`;
    return String(v);
  }

  // The roller column is only ~50px wide, so its readout drops units the column
  // header already implies. valueLabel stays the full form for tooltips and the
  // results card, where there is room to be unambiguous.
  function shortValue(role, color) {
    // Keep the unit on the temp column — a bare number reads as a digit band.
    // Only "/K" is dropped, which the results card still spells out.
    if (role === "tc") return `${BAND_COLORS[color].tc} ppm`;
    return valueLabel(role, color);
  }

  function compute() {
    const roles = rolesFor(state.count);
    const digits = roles.filter(r => r[0] === "d").map(r => BAND_COLORS[state.bands[r]].digit).join("");
    const ohms = parseInt(digits, 10) * BAND_COLORS[state.bands.mult].mult;
    const tol = BAND_COLORS[state.bands.tol].tol;
    return {
      ohms,
      tol,
      min: ohms * (1 - tol / 100),
      max: ohms * (1 + tol / 100),
      tc: roles.includes("tc") ? BAND_COLORS[state.bands.tc].tc : null,
    };
  }

  // Literal resistor, not a schematic symbol: this drawing identifies a physical
  // part rather than showing topology, which is the case REFERENCE.md carves out
  // for literal illustration. Value bands cluster left, tolerance sits apart on
  // the right the way it does on a real part.
  function resistor() {
    const roles = rolesFor(state.count);
    const valueBands = roles.filter(r => r !== "tol" && r !== "tc");
    const bars = valueBands.map((r, i) =>
      `<rect x="${71 + i * 12}" y="12" width="8" height="40" fill="${BAND_COLORS[state.bands[r]].hex}"/>`
    );
    if (state.bands.tol !== "none") {
      bars.push(`<rect x="132" y="12" width="8" height="40" fill="${BAND_COLORS[state.bands.tol].hex}"/>`);
    }
    if (roles.includes("tc")) {
      bars.push(`<rect x="145" y="12" width="8" height="40" fill="${BAND_COLORS[state.bands.tc].hex}"/>`);
    }
    return `<svg width="220" height="64" viewBox="0 0 220 64" fill="none">
      <defs>
        <clipPath id="rc-body"><rect x="62" y="12" width="96" height="40" rx="9"/></clipPath>
      </defs>
      <path d="M6 32 H62 M158 32 H214" stroke="#8A9099" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="62" y="12" width="96" height="40" rx="9" fill="#C8AE7D"/>
      <g clip-path="url(#rc-body)">${bars.join("")}</g>
      <rect x="62" y="12" width="96" height="40" rx="9" fill="none" stroke="#00000055" stroke-width="1"/>
    </svg>`;
  }

  function colorWith(prop, value) {
    return Object.keys(BAND_COLORS).find(c => BAND_COLORS[c][prop] === value);
  }

  // Work the code backwards: split the resistance into the n significant digits
  // the band count allows plus a power-of-ten multiplier, then look up the
  // colour that carries each. Returns false when no legal multiplier reaches the
  // value — below 0.01x or above 1e9x there is simply no band for it.
  function bandsFromOhms(ohms) {
    const n = rolesFor(state.count).filter(r => r[0] === "d").length;
    if (!isFinite(ohms) || ohms <= 0) return false;
    let e = Math.floor(Math.log10(ohms)) - (n - 1);
    let digits = Math.round(ohms / Math.pow(10, e));
    // Rounding can carry past the digit budget: 99.6 -> 100 needs one fewer digit.
    if (digits >= Math.pow(10, n)) { digits = Math.round(digits / 10); e += 1; }
    const mult = Math.pow(10, e);
    const multColor = Object.keys(BAND_COLORS)
      .find(c => BAND_COLORS[c].mult !== undefined && Math.abs(BAND_COLORS[c].mult - mult) <= mult * 1e-9);
    if (!multColor) return false;
    const each = String(digits).padStart(n, "0").split("").map(Number);
    const picked = {};
    for (let i = 0; i < n; i++) {
      const c = colorWith("digit", each[i]);
      if (!c) return false;
      picked["d" + (i + 1)] = c;
    }
    picked.mult = multColor;
    return picked;
  }

  // Drive the rollers from state rather than repainting: a repaint would drop
  // the caret out of the value field the user is typing in.
  function syncRollers() {
    rolesFor(state.count).forEach(role => {
      const track = app.querySelector(`.roller-track[data-role="${role}"]`);
      if (!track) return;
      const i = optionsFor(role).indexOf(state.bands[role]);
      if (i < 0) return;
      // Clear any in-progress user gesture: this scroll is the app's, and must
      // not be read back as a selection.
      delete track.dataset.user;
      track.scrollTop = i * ITEM_H;
    });
    updateReadout();
  }

  function applyTypedValue(raw) {
    const err = app.querySelector('[data-res="err"]');
    const ohms = parseFloat(raw) * OHM_UNITS[state.unit];
    if (!isFinite(ohms) || ohms <= 0) { err.textContent = ""; return; }
    const picked = bandsFromOhms(ohms);
    if (!picked) {
      err.textContent = "No band combination reaches that value.";
      return;
    }
    err.textContent = "";
    Object.assign(state.bands, picked);
    syncRollers();
  }

  // Report the coarsest series the value belongs to, not the one its tolerance
  // implies: 4.7k is a stock E6 value even when bought at 2%, and calling that
  // "not E48" would be true of the grid but misleading about the part. The
  // tolerance only decides which grid to measure the distance against when the
  // value is not standard at all.
  function seriesLine(r) {
    for (const name of ["E6", "E12", "E24", "E48", "E96", "E192"]) {
      if (nearestESeries(r.ohms, name).exact) return `${name} standard value`;
    }
    const grid = eSeriesForTolerance(r.tol);
    return `Not standard — nearest ${grid} is ${formatOhms(nearestESeries(r.ohms, grid).value)}`;
  }

  // Height of one roller slot, shared by the CSS and the scroll maths.
  const ITEM_H = 30;

  // Refresh what a colour change affects, in place. A full paint() would reset
  // every roller's scroll position, throwing the user out of their own gesture.
  function updateReadout() {
    const roles = rolesFor(state.count);
    const r = compute();
    app.querySelector(".diagram-box").innerHTML = resistor();
    roles.forEach(role => {
      const el = app.querySelector(`[data-value="${role}"]`);
      if (el) el.textContent = shortValue(role, state.bands[role]);
    });
    app.querySelector('[data-res="ohms"]').textContent = formatOhms(r.ohms);
    app.querySelector('[data-res="tol"]').textContent = `±${r.tol}%`;
    app.querySelector('[data-res="sub"]').innerHTML =
      `${formatOhms(r.min)} – ${formatOhms(r.max)}${r.tc === null ? "" : ` &nbsp;·&nbsp; ${r.tc} ppm/K`}`;
    app.querySelector('[data-res="series"]').textContent = seriesLine(r);

    // Mirror the bands back into the value field, unless the user is mid-edit
    // there — overwriting what someone is typing is worse than a stale field.
    const typed = app.querySelector("#cc-value");
    if (typed && document.activeElement !== typed) {
      typed.value = trim(r.ohms / OHM_UNITS[state.unit]);
    }
    const tolSel = app.querySelector("#cc-tol");
    if (tolSel) tolSel.value = state.bands.tol;
  }

  function paint() {
    const roles = rolesFor(state.count);
    const r = compute();

    app.innerHTML = `
      ${calcHeader(tool, favId, "4 to 6 bands")}

      <div class="diagram-box">${resistor()}</div>

      ${pillRow([4, 5, 6].map(n => [n, `${n} bands`]), state.count, domain.bg)}

      <div class="field">
        <label>Enter a value</label>
        <div class="field-row">
          <input id="cc-value" type="number" inputmode="decimal" step="any" value="${trim(r.ohms / OHM_UNITS[state.unit])}" />
          <select id="cc-unit">${Object.keys(OHM_UNITS).map(u => `<option ${state.unit === u ? "selected" : ""}>${u}</option>`).join("")}</select>
          <select id="cc-tol">${optionsFor("tol").map(c => `<option value="${c}" ${state.bands.tol === c ? "selected" : ""}>±${BAND_COLORS[c].tol}%</option>`).join("")}</select>
        </div>
      </div>
      <div class="error-text" data-res="err"></div>

      <div class="section-label" style="color:#8FC1F5">Your bands</div>
      <div class="rollers">
        ${roles.map((role, i) => `
          <div class="roller">
            <div class="roller-name" title="Band ${i + 1} · ${BAND_ROLE_LABEL[role]}">${ROLLER_NAME[role]}</div>
            <div class="roller-window">
              <div class="roller-track" data-role="${role}">
                ${optionsFor(role).map(c => `
                  <button class="roller-item${c === "none" ? " roller-item--none" : ""}" data-color="${c}" title="${c} · ${valueLabel(role, c)}"><span style="background:${BAND_COLORS[c].hex}">${c === "none" ? "—" : ""}</span></button>`).join("")}
              </div>
            </div>
            <div class="roller-value" data-value="${role}">${shortValue(role, state.bands[role])}</div>
          </div>`).join("")}
      </div>

      <div class="section-label" style="color:#5DCAA5">Results</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">Resistance</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="ohms">${formatOhms(r.ohms)}</span>
          <span class="unit" data-res="tol">±${r.tol}%</span>
        </div>
        <div class="result-sub" data-res="series">${seriesLine(r)}</div>
        <div class="result-sub" data-res="sub">${formatOhms(r.min)} – ${formatOhms(r.max)}${r.tc === null ? "" : ` &nbsp;·&nbsp; ${r.tc} ppm/K`}</div>
      </div>

      ${formulaSection(
        [roles.filter(x => x[0] === "d").length === 2
          ? "Value = (10 × D1 + D2) × Multiplier"
          : "Value = (100 × D1 + 10 × D2 + D3) × Multiplier"],
        "Tolerance band sets ±%; the temperature-coefficient band (6-band only) adds ppm/K drift per degree."
      )}
      ${calcFooter()}
    `;

    wireCalc(favId, paint, (v) => { state.count = +v; paint(); });
    const typed = document.getElementById("cc-value");
    typed.oninput = () => applyTypedValue(typed.value);
    document.getElementById("cc-unit").onchange = (e) => {
      state.unit = e.target.value;
      applyTypedValue(typed.value);
    };
    document.getElementById("cc-tol").onchange = (e) => {
      state.bands.tol = e.target.value;
      syncRollers();
    };

    app.querySelectorAll(".roller-track").forEach(track => {
      const role = track.dataset.role;
      const opts = optionsFor(role);
      const items = [...track.querySelectorAll(".roller-item")];

      // Lay the slots on a drum: each one tilts by its distance from the centre
      // and is pushed back as it goes, so the column reads as a wheel rather
      // than a flat list. Runs off the scroll position, so it tracks the finger.
      const shape = () => {
        const centre = track.scrollTop / ITEM_H;
        items.forEach((item, i) => {
          const d = i - centre;
          const angle = Math.max(-64, Math.min(64, d * 22));
          item.style.transform = `rotateX(${-angle}deg) translateZ(${30 - Math.abs(d) * 5}px)`;
          item.style.opacity = String(Math.max(0.18, 1 - Math.abs(d) * 0.3));
        });
      };

      track.scrollTop = opts.indexOf(state.bands[role]) * ITEM_H;
      shape();

      let frame = 0;
      let settle;
      // Only a scroll the user actually drove may change the selection. Reading
      // it back from scrollTop unconditionally also picks up the app's own
      // scrolls — and those are still travelling when the timer fires, so it
      // commits the slot being passed through rather than the one aimed at.
      // One slot out on the multiplier column is a factor of ten in the result.
      track.addEventListener("pointerdown", () => { track.dataset.user = "1"; }, { passive: true });
      track.addEventListener("touchstart", () => { track.dataset.user = "1"; }, { passive: true });
      track.addEventListener("wheel", () => { track.dataset.user = "1"; }, { passive: true });
      track.addEventListener("keydown", () => { track.dataset.user = "1"; });

      track.addEventListener("scroll", () => {
        // Shape on a frame so a fast flick does not queue a write per event.
        if (!frame) frame = requestAnimationFrame(() => { frame = 0; shape(); });
        if (!track.dataset.user) return;
        // Safari has no scrollend event yet, so treat a quiet moment as the end
        // of the gesture rather than reacting to every scroll frame.
        clearTimeout(settle);
        settle = setTimeout(() => {
          delete track.dataset.user;
          const i = Math.min(opts.length - 1, Math.max(0, Math.round(track.scrollTop / ITEM_H)));
          if (opts[i] !== state.bands[role]) { state.bands[role] = opts[i]; updateReadout(); }
        }, 90);
      });

      // A tap knows its own index, so commit it directly instead of inferring it
      // from where the smooth scroll ends up.
      items.forEach((item, i) => {
        item.onclick = () => {
          delete track.dataset.user;
          if (opts[i] !== state.bands[role]) { state.bands[role] = opts[i]; updateReadout(); }
          track.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
        };
      });
    });
  }

  paint();
}

// ---------- SMD resistor code ----------
// Chip resistors mark the value as significant digits followed by a decade
// exponent (472 = 47 x 10^2), and use R in place of a decimal point below the
// range that reaches (4R7 = 4.7). EIA-96 is the three-character scheme used
// where two digits are not enough: a 2-digit index into E96 plus a letter for
// the decade. All three are the same job — read the marking — so they share
// this screen; the EIA-96 tool entry opens it straight into that mode.
const EIA96_MULT = { Z: 1e-3, Y: 1e-2, R: 1e-2, X: 1e-1, S: 1e-1, A: 1, B: 1e1, H: 1e1, C: 1e2, D: 1e3, E: 1e4, F: 1e5 };
// Y/R, X/S and B/H are alternates for the same decade; these are the ones to
// print, the table above still reads the others back.
const EIA96_LETTER = [["Z", 1e-3], ["Y", 1e-2], ["X", 1e-1], ["A", 1], ["B", 1e1], ["C", 1e2], ["D", 1e3], ["E", 1e4], ["F", 1e5]];

function eia96Decode(code) {
  const m = /^(\d{2})([A-Z])$/.exec(String(code).trim().toUpperCase());
  if (!m) return NaN;
  const index = Number(m[1]);
  const mult = EIA96_MULT[m[2]];
  if (index < 1 || index > 96 || mult === undefined) return NaN;
  return eSeriesValues("E96")[index - 1] * mult;
}

// Only E96 values are expressible, so this returns the code and the value that
// code actually means — they differ whenever the input was not an E96 value.
function eia96Encode(ohms) {
  if (!isFinite(ohms) || ohms <= 0) return null;
  const values = eSeriesValues("E96");
  const decade = Math.pow(10, Math.floor(Math.log10(ohms)) - 2);
  const mantissa = ohms / decade;
  let idx = 0;
  for (let i = 1; i < values.length; i++) {
    if (Math.abs(values[i] - mantissa) < Math.abs(values[idx] - mantissa)) idx = i;
  }
  // Just under the next decade, 01 of that decade is the closer code.
  if (Math.abs(1000 - mantissa) < Math.abs(values[idx] - mantissa)) {
    const up = decade * 10;
    const letterUp = EIA96_LETTER.find(([, m]) => Math.abs(m - up) <= up * 1e-9);
    return letterUp ? { code: "01" + letterUp[0], ohms: 100 * up } : null;
  }
  const letter = EIA96_LETTER.find(([, m]) => Math.abs(m - decade) <= decade * 1e-9);
  return letter ? { code: String(idx + 1).padStart(2, "0") + letter[0], ohms: values[idx] * decade } : null;
}

function renderSmdCode(domain, tool, favId) {
  const state = { mode: "3", ohms: 4700, unit: "kΩ" };

  // EIA-96 can only express E96 values, so entering that mode has to pull the
  // current value onto the grid. Without it the screen opens showing a code and
  // a resistance that disagree.
  function normalize() {
    if (state.mode !== "96") return;
    const e = eia96Encode(state.ohms);
    if (e) state.ohms = e.ohms;
  }

  function sig() {
    return state.mode === "3" ? 2 : 3;
  }



  // R sits where the decimal point would: 4R7 is 4.7, R47 is 0.47, 47R0 is 47.
  function codeFor(ohms) {
    if (state.mode === "96") {
      const e = eia96Encode(ohms);
      return e ? e.code : null;
    }
    const digits = Number(state.mode);
    if (ohms === 0) return "0".repeat(digits);
    if (!isFinite(ohms) || ohms < 0) return null;
    const n = sig();
    const e = Math.floor(Math.log10(ohms));
    const d = String(Math.round(ohms / Math.pow(10, e - n + 1)));
    if (d.length > n) return codeFor(Math.pow(10, e + 1));
    const exponent = e - n + 1;
    if (exponent > 9) return null;
    if (exponent >= 0) return d + String(exponent);
    const code = e >= 0 ? `${d.slice(0, e + 1)}R${d.slice(e + 1)}` : `R${"0".repeat(-e - 1)}${d}`;
    return code.length <= digits + 1 ? code : null;
  }

  function ohmsFor(code) {
    const raw = String(code).trim().toUpperCase();
    if (!raw) return NaN;
    if (state.mode === "96") return eia96Decode(raw);
    const digits = Number(state.mode);
    if (raw.includes("R")) {
      if ((raw.match(/R/g) || []).length > 1 || /[^0-9R]/.test(raw)) return NaN;
      const v = parseFloat(raw.replace("R", "."));
      return isFinite(v) ? v : NaN;
    }
    if (!/^[0-9]+$/.test(raw) || raw.length !== digits) return NaN;
    if (Number(raw) === 0) return 0;
    const n = sig();
    return Number(raw.slice(0, n)) * Math.pow(10, Number(raw.slice(n)));
  }

  function seriesLine(ohms) {
    if (!isFinite(ohms) || ohms <= 0) return "";
    for (const name of ["E6", "E12", "E24", "E48", "E96", "E192"]) {
      if (nearestESeries(ohms, name).exact) return `${name} standard value`;
    }
    const grid = state.mode === "3" ? "E24" : "E96";
    return `Not standard — nearest ${grid} is ${formatOhms(nearestESeries(ohms, grid).value)}`;
  }

  function subtitle() {
    if (state.mode === "96") return "2 digits + multiplier letter";
    return `${state.mode} digit codes`;
  }

  // Literal part, like the colour code's resistor: a black chip with metallised
  // ends and the marking in white, which is what you are holding.
  function chip(code) {
    return `<svg width="220" height="80" viewBox="0 0 220 80" fill="none">
      <rect x="44" y="16" width="132" height="48" rx="5" fill="#141619" stroke="#3A3F47" stroke-width="1"/>
      <rect x="44" y="16" width="20" height="48" rx="4" fill="#C6CBD2"/>
      <rect x="156" y="16" width="20" height="48" rx="4" fill="#C6CBD2"/>
      <text x="110" y="48" fill="#FFFFFF" font-size="21" font-weight="600" text-anchor="middle"
            font-family="ui-monospace, SFMono-Regular, Menlo, monospace" letter-spacing="1.5">${code || "—"}</text>
    </svg>`;
  }

  // Update in place rather than repainting, so the field being typed in keeps
  // its caret — same reason as the colour code.
  function refresh(source, notice) {
    const code = codeFor(state.ohms);
    app.querySelector(".diagram-box").innerHTML = chip(code);
    app.querySelector('[data-res="ohms"]').textContent = formatOhms(state.ohms);
    app.querySelector('[data-res="series"]').textContent = seriesLine(state.ohms);
    const codeField = app.querySelector("#smd-code");
    const valueField = app.querySelector("#smd-value");
    if (source !== "code" && document.activeElement !== codeField) codeField.value = code || "";
    if (source !== "value" && document.activeElement !== valueField) {
      valueField.value = trim(state.ohms / OHM_UNITS[state.unit]);
    }
    app.querySelector('[data-res="err"]').textContent =
      notice || (code === null ? `Out of range for ${state.mode === "96" ? "EIA-96" : `a ${state.mode}-digit code`}.` : "");
  }

  // EIA-96 can only express E96 values, so a typed value snaps to the nearest
  // one. Say so rather than showing a code that means something else.
  function applyValue(raw) {
    const v = parseFloat(raw) * OHM_UNITS[state.unit];
    if (!isFinite(v) || v < 0) return;
    if (state.mode === "96") {
      const e = eia96Encode(v);
      if (!e) { state.ohms = v; refresh("value"); return; }
      const snapped = Math.abs(e.ohms - v) > v * 1e-9;
      state.ohms = e.ohms;
      refresh("value", snapped ? `Rounded to the nearest EIA-96 value, ${formatOhms(e.ohms)}.` : "");
      return;
    }
    state.ohms = v;
    refresh("value");
  }

  function paint() {
    const code = codeFor(state.ohms);
    app.innerHTML = `
      ${calcHeader(tool, favId, subtitle())}

      <div class="diagram-box">${chip(code)}</div>

      ${pillRow([["3", "3 digit"], ["4", "4 digit"], ["96", "EIA-96"]], state.mode, domain.bg)}

      <div class="section-label" style="color:#8FC1F5">Marking on the chip</div>
      <div class="field">
        <label>Code</label>
        <div class="field-row">
          <input id="smd-code" type="text" autocapitalize="characters" spellcheck="false" maxlength="4" value="${code || ""}" />
        </div>
      </div>

      <div class="section-label" style="color:#8FC1F5">Or enter a value</div>
      <div class="field">
        <label>Resistance</label>
        <div class="field-row">
          <input id="smd-value" type="number" inputmode="decimal" step="any" value="${trim(state.ohms / OHM_UNITS[state.unit])}" />
          <select id="smd-unit">${Object.keys(OHM_UNITS).map(u => `<option ${state.unit === u ? "selected" : ""}>${u}</option>`).join("")}</select>
        </div>
      </div>
      <div class="error-text" data-res="err"></div>

      <div class="section-label" style="color:#5DCAA5">Results</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">Resistance</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="ohms">${formatOhms(state.ohms)}</span>
        </div>
        <div class="result-sub" data-res="series">${seriesLine(state.ohms)}</div>
      </div>

      ${formulaSection(
        state.mode === "96"
          ? ["Value = E96 table[2-digit code] × multiplier letter"]
          : [`Value = (${sig() === 2 ? "D1D2" : "D1D2D3"}) × 10^${sig() === 2 ? "D3" : "D4"}`],
        state.mode === "96"
          ? "The 2-digit index looks up an E96 mantissa; the letter (A, B, C, …) sets which decade it's multiplied into."
          : "R stands in for the decimal point when there's no room for an exponent — 4R7 marks 4.7 Ω, R47 marks 0.47 Ω."
      )}
      ${calcFooter()}
    `;

    wireCalc(favId, paint, (v) => { state.mode = v; normalize(); paint(); });

    const codeField = document.getElementById("smd-code");
    codeField.oninput = () => {
      const v = ohmsFor(codeField.value);
      if (!isNaN(v)) { state.ohms = v; refresh("code"); }
      else {
        app.querySelector('[data-res="err"]').textContent =
          state.mode === "96" ? "Not a valid EIA-96 marking." : "Not a valid marking.";
      }
    };
    const valueField = document.getElementById("smd-value");
    valueField.oninput = () => applyValue(valueField.value);
    document.getElementById("smd-unit").onchange = (e) => {
      state.unit = e.target.value;
      applyValue(valueField.value);
    };
  }

  normalize();
  paint();
}

// Anything stored under the old position keys is converted once, on load.
// A key whose tool no longer exists is dropped rather than left dangling.
(function migrateFavorites() {
  const stored = favorites();
  if (!stored.some(k => POSITION_KEY.test(k))) return;
  const migrated = [];
  for (const entry of stored) {
    if (!POSITION_KEY.test(entry)) { migrated.push(entry); continue; }
    const found = findTool(entry);
    if (found) migrated.push(favoriteId(found.domain, found.section, found.tool));
  }
  localStorage.setItem("cc_favorites", JSON.stringify([...new Set(migrated)]));
})();

// ---------- E-series standard values ----------
// Every series is a decade split into equal ratio steps, sized so that parts at
// the matching tolerance just cover the gaps between neighbours. Both jobs live
// here: the nearest standard value to something you want, and the whole table
// to read off.
const E_TOLERANCE = { E6: "±20%", E12: "±10%", E24: "±5%", E48: "±2%", E96: "±1%", E192: "±0.5%" };

function renderESeries(domain, tool, favId) {
  const state = { series: "E24", ohms: 4700, unit: "kΩ" };



  // The decade the entered value sits in, and the factor that puts a table
  // mantissa into it. E6/E12/E24 are listed two-digit, the rest three-digit.
  function decade() {
    const values = eSeriesValues(state.series);
    const places = values[0] >= 100 ? 3 : 2;
    return Math.pow(10, Math.floor(Math.log10(state.ohms)) - (places - 1));
  }

  function nearest() {
    return nearestESeries(state.ohms, state.series);
  }

  function errorLine() {
    const near = nearest();
    if (near.exact) return `${state.series} standard value, exactly`;
    // Two decimals: the fourth significant figure of a drift is noise here.
    const drift = ((near.value - state.ohms) / state.ohms) * 100;
    return `${drift > 0 ? "+" : ""}${Number(drift.toFixed(2))}% from ${formatOhms(state.ohms)}`;
  }

  function table() {
    const values = eSeriesValues(state.series);
    const scale = decade();
    const hit = nearest().value;
    return values.map(v => {
      const ohms = v * scale;
      const isHit = Math.abs(ohms - hit) <= hit * 1e-9;
      return `<div class="eseries-cell${isHit ? " hit" : ""}">${formatOhms(ohms)}</div>`;
    }).join("");
  }

  function refresh() {
    app.querySelector('[data-res="ohms"]').textContent = formatOhms(nearest().value);
    app.querySelector('[data-res="drift"]').textContent = errorLine();
    app.querySelector('[data-res="grid"]').innerHTML = table();
    app.querySelector('[data-res="decade"]').textContent = decadeLabel();
    const field = app.querySelector("#es-value");
    if (document.activeElement !== field) field.value = trim(state.ohms / OHM_UNITS[state.unit]);
  }

  function decadeLabel() {
    const scale = decade();
    const values = eSeriesValues(state.series);
    return `${values.length} values · ${formatOhms(values[0] * scale)} to ${formatOhms(values[values.length - 1] * scale)}`;
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, "E6 to E192 standard values")}

      ${pillRow(Object.keys(E_TOLERANCE).map(s => [s, s]), state.series, domain.bg)}

      <div class="section-label" style="color:#8FC1F5">Value you want</div>
      <div class="field">
        <label>Resistance</label>
        <div class="field-row">
          <input id="es-value" type="number" inputmode="decimal" step="any" value="${trim(state.ohms / OHM_UNITS[state.unit])}" />
          <select id="es-unit">${Object.keys(OHM_UNITS).map(u => `<option ${state.unit === u ? "selected" : ""}>${u}</option>`).join("")}</select>
        </div>
      </div>

      <div class="section-label" style="color:#5DCAA5">Nearest standard value</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">${state.series} · ${E_TOLERANCE[state.series]}</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="ohms">${formatOhms(nearest().value)}</span>
        </div>
        <div class="result-sub" data-res="drift">${errorLine()}</div>
      </div>

      <div class="section-label" style="color:#8FC1F5">Whole series <span data-res="decade" class="decade-note">${decadeLabel()}</span></div>
      <div class="eseries-grid" data-res="grid">${table()}</div>

      ${formulaSection(
        ["Eᵢ = 10^(i / N), for i = 0 … N−1", "N = 6, 12, 24, 48, 96, or 192"],
        "Values space evenly on a logarithmic scale, so every part in a series covers the same percentage gap to its neighbours regardless of decade — that spacing is set to just cover the series' own tolerance."
      )}
      ${calcFooter(`Table follows the decade of your value &nbsp;·&nbsp; ${E_TOLERANCE[state.series]} parts`)}
    `;

    wireCalc(favId, paint, (v) => { state.series = v; paint(); });

    const field = document.getElementById("es-value");
    field.oninput = () => {
      const v = parseFloat(field.value) * OHM_UNITS[state.unit];
      if (isFinite(v) && v > 0) { state.ohms = v; refresh(); }
    };
    document.getElementById("es-unit").onchange = (e) => {
      state.unit = e.target.value;
      const v = parseFloat(field.value) * OHM_UNITS[state.unit];
      if (isFinite(v) && v > 0) state.ohms = v;
      refresh();
    };
  }

  paint();
}

// ---------- Voltage divider ----------
// Vout = Vin x R2 / (R1 + R2), rearranged for whichever leg you are solving
// for. Unloaded: drawing current from the tap changes the ratio, which is why
// the subtitle says so rather than leaving it implied.
const VOLT_UNITS = { mV: 1e-3, V: 1, kV: 1e3 };
const DIVIDER_R_UNITS = { "Ω": 1, "kΩ": 1e3, "MΩ": 1e6 };

// General SI formatter, for the quantities that are not resistance. formatOhms
// could delegate to this later; leaving it alone for now keeps this change from
// touching what the other calculators print.
function siFormat(v, unit, digits = 4) {
  if (!isFinite(v)) return "—";
  if (v === 0) return `0 ${unit}`;
  const fig = (x) => Number(x.toPrecision(digits)).toString();
  for (const [scale, prefix] of [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"]]) {
    if (Math.abs(v) >= scale) return `${fig(v / scale)} ${prefix}${unit}`;
  }
  return `${fig(v)} ${unit}`;
}

function renderVoltageDivider(domain, tool, favId) {
  const state = {
    solve: "vout",
    tol: 1,
    values: { vin: 12, vout: 6, r1: 10, r2: 10 },
    units: { vin: "V", vout: "V", r1: "kΩ", r2: "kΩ" },
  };

  const FIELD = {
    vin: { label: "Input voltage (Vin)", units: VOLT_UNITS },
    vout: { label: "Output voltage (Vout)", units: VOLT_UNITS },
    r1: { label: "R1 — top", units: DIVIDER_R_UNITS },
    r2: { label: "R2 — bottom", units: DIVIDER_R_UNITS },
  };

  // Which three you supply depends on which one you want back.
  function inputsFor(solve) {
    if (solve === "vout") return ["vin", "r1", "r2"];
    if (solve === "r1") return ["vin", "vout", "r2"];
    return ["vin", "vout", "r1"];
  }

  function si(name) {
    return state.values[name] * FIELD[name].units[state.units[name]];
  }

  function compute() {
    const vin = si("vin");
    let vout = si("vout");
    let r1 = si("r1");
    let r2 = si("r2");

    if (state.solve === "vout") vout = (vin * r2) / (r1 + r2);
    if (state.solve === "r1") r1 = (r2 * (vin - vout)) / vout;
    if (state.solve === "r2") r2 = (r1 * vout) / (vin - vout);

    const current = vin / (r1 + r2);
    return { vin, vout, r1, r2, current, p1: current * current * r1, p2: current * current * r2 };
  }

  // The arithmetic will happily return a negative resistance or divide by zero;
  // both mean the divider asked for cannot exist, so say which.
  function problem(r) {
    if (state.solve !== "vout") {
      if (r.vout <= 0) return "Vout must be greater than zero.";
      if (r.vout >= r.vin) return "Vout must be less than Vin.";
    }
    if (!isFinite(r.r1) || !isFinite(r.r2) || r.r1 < 0 || r.r2 < 0) return "No solution for those values.";
    if (r.r1 + r.r2 === 0) return "R1 and R2 cannot both be zero.";
    return "";
  }

  // Real resistors are only as good as their tolerance, and a divider's error is
  // worst when the two legs miss in opposite directions — so this is the true
  // worst case, not the ±tol you might assume from the ratio.
  // Scale a pair by the larger of the two and print the unit once. Repeating it
  // ("5.94 V – 6.06 V") is what pushed this line onto a second row.
  function pairText(a, b, unit, digits = 3) {
    const steps = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"]];
    const step = steps.find(([scale]) => Math.abs(b) >= scale) || [1, ""];
    const fig = (x) => Number((x / step[0]).toPrecision(digits)).toString();
    return `${fig(a)} / ${fig(b)} ${step[1]}${unit}`;
  }

  function outputSpread(r) {
    const t = state.tol / 100;
    const hi = (r.vin * r.r2 * (1 + t)) / (r.r1 * (1 - t) + r.r2 * (1 + t));
    const lo = (r.vin * r.r2 * (1 - t)) / (r.r1 * (1 + t) + r.r2 * (1 - t));
    return { lo, hi };
  }

  function spreadLine(r) {
    if (problem(r)) return "";
    const { lo, hi } = outputSpread(r);
    const drift = ((hi - r.vout) / r.vout) * 100;
    return `${pairText(lo, hi, "V").replace(" / ", " – ")} (±${Number(drift.toFixed(2))}%)`;
  }

  function solvedLabel() {
    return { vout: "Output voltage (Vout)", r1: "Resistance R1", r2: "Resistance R2" }[state.solve];
  }

  function solvedValue(r) {
    if (problem(r)) return "—";
    return state.solve === "vout" ? siFormat(r.vout, "V") : formatOhms(state.solve === "r1" ? r.r1 : r.r2);
  }

  // The resistor you supply has to exist too. Same grid, same question as the
  // one being solved for — a typed 7.3k is no more orderable than a computed
  // one, and only saying so about the calculated leg would be half the answer.
  function seriesHint(name) {
    const ohms = si(name);
    if (!isFinite(ohms) || ohms <= 0) return "";
    const series = eSeriesForTolerance(state.tol);
    const near = nearestESeries(ohms, series);
    return near.exact ? series : `${series} → ${formatOhms(near.value)}`;
  }

  function standardPart(r) {
    const name = eSeriesForTolerance(state.tol);
    const near = nearestESeries(state.solve === "r1" ? r.r1 : r.r2, name);
    const r1 = state.solve === "r1" ? near.value : r.r1;
    const r2 = state.solve === "r2" ? near.value : r.r2;
    return { name, value: near.value, exact: near.exact, vout: (r.vin * r2) / (r1 + r2) };
  }

  function detailLine(r) {
    if (problem(r)) return "";
    if (state.solve === "vout") {
      return `${spreadLine(r)} &nbsp;·&nbsp; ${siFormat(r.current, "A", 3)} &nbsp;·&nbsp; ${pairText(r.p1, r.p2, "W")}`;
    }
    const std = standardPart(r);
    const suffix = std.exact ? "is standard" : `→ ${formatOhms(std.value)}, Vout ${siFormat(std.vout, "V", 3)}`;
    return `${std.name} ${suffix} &nbsp;·&nbsp; ${siFormat(r.current, "A", 3)}`;
  }


  // Schematic, not literal: this shows how the parts are wired, which is the
  // case REFERENCE.md wants a symbol for. US convention — zigzag resistors,
  // never the IEC box. Known legs are drawn in the input blue, the one being
  // solved for in the result green.
  function diagram() {
    const known = inputsFor(state.solve);
    const tone = (n) => (known.includes(n) ? "#8FC1F5" : "#5DCAA5");
    const wire = "#5A6169";
    // ANSI/IEEE 315 resistor: six peaks alternating either side of the axis. The
    // zigzag here is the body only — the straight lead each side is drawn as
    // wire, long enough to read as the pin that joins the next part. R1's body
    // ends at 62 and R2's starts at 74, so the tap leaves from 68: the midpoint
    // of the wire between them, which is where the junction physically is.
    const zig = (t) => `M90 ${t} L83 ${t + 3} L97 ${t + 9} L83 ${t + 15} L97 ${t + 21} L83 ${t + 27} L97 ${t + 33} L90 ${t + 36}`;
    return `<svg width="220" height="134" viewBox="0 0 220 134" fill="none">
      <path d="M90 14 V26 M90 62 V74 M90 110 V122" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M90 68 H150" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="${zig(26)}" stroke="${tone("r1")}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
      <path d="${zig(74)}" stroke="${tone("r2")}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
      <circle cx="90" cy="68" r="2.6" fill="${wire}"/>
      <path d="M78 122 H102 M82 127 H98 M86 132 H94" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <text x="90" y="10" fill="${tone("vin")}" font-size="12" font-weight="600" text-anchor="middle">Vin</text>
      <text x="156" y="72" fill="${tone("vout")}" font-size="12" font-weight="600">Vout</text>
      <text x="70" y="48" fill="${tone("r1")}" font-size="12" font-weight="600" text-anchor="end">R1</text>
      <text x="70" y="96" fill="${tone("r2")}" font-size="12" font-weight="600" text-anchor="end">R2</text>
    </svg>`;
  }

  // Only the numbers move while typing, so update them in place and leave the
  // fields — and the caret — alone.
  function updateResults() {
    const r = compute();
    const issue = problem(r);
    app.querySelector('[data-res="solved"]').textContent = solvedValue(r);
    app.querySelector('[data-res="detail"]').innerHTML = detailLine(r);
    app.querySelector('[data-res="err"]').textContent = issue;
    app.querySelectorAll("[data-hint]").forEach(el => { el.textContent = seriesHint(el.dataset.hint); });
    syncSliderPositions(eSeriesForTolerance(state.tol), si,
      (name) => unitSliderBounds(FIELD[name].units[state.units[name]]));
  }

  function paint() {
    const r = compute();
    app.innerHTML = `
      ${calcHeader(tool, favId, "Unloaded resistive divider")}

      <div class="diagram-box" style="padding:2px 10px;">${diagram()}</div>

      ${pillRow([["vout", "Vout"], ["r1", "R1"], ["r2", "R2"]], state.solve, domain.bg)}

      <div class="section-label" style="color:#8FC1F5">Your inputs
        <select id="vd-tol" class="label-select">
          ${[0.1, 0.5, 1, 2, 5, 10].map(t => `<option value="${t}" ${state.tol === t ? "selected" : ""}>±${t}% · ${eSeriesForTolerance(t)}</option>`).join("")}
        </select>
      </div>
      ${inputsFor(state.solve).map(name => `
        <div class="field">
          <label><span class="field-name">${FIELD[name].label}</span>${FIELD[name].units === DIVIDER_R_UNITS
            ? `<span class="field-hint" data-hint="${name}">${seriesHint(name)}</span>` : ""}</label>
          <div class="field-row">
            <input type="number" inputmode="decimal" step="any" data-var="${name}" value="${state.values[name]}" />
            <select data-unit="${name}">
              ${Object.keys(FIELD[name].units).map(u => `<option ${state.units[name] === u ? "selected" : ""}>${u}</option>`).join("")}
            </select>
          </div>
          ${FIELD[name].units === DIVIDER_R_UNITS ? seriesSliderHTML(name, eSeriesForTolerance(state.tol), si(name), unitSliderBounds(FIELD[name].units[state.units[name]])) : ""}
        </div>`).join("")}
      <div class="error-text" data-res="err">${problem(r)}</div>

      <div class="section-label" style="color:#5DCAA5">Result</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">${solvedLabel()}</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="solved">${solvedValue(r)}</span>
        </div>
        <div class="result-sub" data-res="detail">${detailLine(r)}</div>
      </div>

      ${formulaSection(
        ["Vout = Vin × R2 / (R1 + R2)", "R1 = R2 × (Vin − Vout) / Vout", "R2 = R1 × Vout / (Vin − Vout)"],
        "Unloaded divider — assumes nothing else draws current from the Vout tap."
      )}
      ${calcFooter()}
    `;

    wireCalc(favId, paint, (v) => { state.solve = v; paint(); });

    app.querySelectorAll("input[data-var]").forEach(input => {
      input.oninput = () => {
        state.values[input.dataset.var] = parseFloat(input.value);
        updateResults();
      };
    });
    app.querySelectorAll("select[data-unit]").forEach(select => {
      select.onchange = () => { state.units[select.dataset.unit] = select.value; updateResults(); };
    });
    document.getElementById("vd-tol").onchange = (e) => {
      state.tol = parseFloat(e.target.value);
      updateResults();
    };
    inputsFor(state.solve).filter(name => FIELD[name].units === DIVIDER_R_UNITS).forEach(name => {
      wireSlider(name,
        () => eSeriesRange(eSeriesForTolerance(state.tol), ...unitSliderBounds(FIELD[name].units[state.units[name]])),
        (ohms) => {
          state.values[name] = ohms / FIELD[name].units[state.units[name]];
          app.querySelector(`input[data-var="${name}"]`).value = trim(state.values[name]);
          updateResults();
        });
    });
  }

  paint();
}

// ---------- Current divider ----------
// The dual of the voltage divider, and the place people trip: a branch takes
// current in proportion to the *other* resistor, so the smaller resistor carries
// the larger share. I1 = Iin x R2 / (R1 + R2).
const AMP_UNITS = { "µA": 1e-6, mA: 1e-3, A: 1 };

function renderCurrentDivider(domain, tool, favId) {
  const state = {
    solve: "i1",
    tol: 1,
    values: { iin: 20, i1: 10, r1: 1, r2: 1 },
    units: { iin: "mA", i1: "mA", r1: "kΩ", r2: "kΩ" },
  };

  const FIELD = {
    iin: { label: "Total current (Iin)", units: AMP_UNITS },
    i1: { label: "Branch current (I1)", units: AMP_UNITS },
    r1: { label: "R1 — left branch", units: DIVIDER_R_UNITS },
    r2: { label: "R2 — right branch", units: DIVIDER_R_UNITS },
  };

  function inputsFor(solve) {
    if (solve === "i1") return ["iin", "r1", "r2"];
    if (solve === "r1") return ["iin", "i1", "r2"];
    return ["iin", "i1", "r1"];
  }

  function si(name) {
    return state.values[name] * FIELD[name].units[state.units[name]];
  }

  function compute() {
    const iin = si("iin");
    let i1 = si("i1");
    let r1 = si("r1");
    let r2 = si("r2");

    if (state.solve === "i1") i1 = (iin * r2) / (r1 + r2);
    if (state.solve === "r1") r1 = (r2 * (iin - i1)) / i1;
    if (state.solve === "r2") r2 = (r1 * i1) / (iin - i1);

    const i2 = iin - i1;
    const volts = i1 * r1; // the two branches share one voltage, so either works
    return { iin, i1, i2, r1, r2, volts, p1: i1 * i1 * r1, p2: i2 * i2 * r2 };
  }

  function problem(r) {
    if (state.solve !== "i1") {
      if (r.i1 <= 0) return "I1 must be greater than zero.";
      if (r.i1 >= r.iin) return "I1 must be less than Iin.";
    }
    if (!isFinite(r.r1) || !isFinite(r.r2) || r.r1 < 0 || r.r2 < 0) return "No solution for those values.";
    if (r.r1 + r.r2 === 0) return "R1 and R2 cannot both be zero.";
    return "";
  }

  // Worst case is the two legs missing in opposite directions, same as the
  // voltage divider — the ratio is what the tolerance acts on, not the values.
  function branchSpread(r) {
    const t = state.tol / 100;
    return {
      lo: (r.iin * r.r2 * (1 - t)) / (r.r1 * (1 + t) + r.r2 * (1 - t)),
      hi: (r.iin * r.r2 * (1 + t)) / (r.r1 * (1 - t) + r.r2 * (1 + t)),
    };
  }

  function seriesHint(name) {
    const ohms = si(name);
    if (!isFinite(ohms) || ohms <= 0) return "";
    const series = eSeriesForTolerance(state.tol);
    const near = nearestESeries(ohms, series);
    return near.exact ? series : `${series} → ${formatOhms(near.value)}`;
  }

  function standardPart(r) {
    const name = eSeriesForTolerance(state.tol);
    const near = nearestESeries(state.solve === "r1" ? r.r1 : r.r2, name);
    const r1 = state.solve === "r1" ? near.value : r.r1;
    const r2 = state.solve === "r2" ? near.value : r.r2;
    return { name, value: near.value, exact: near.exact, i1: (r.iin * r2) / (r1 + r2) };
  }

  function solvedLabel() {
    return { i1: "Branch current (I1)", r1: "Resistance R1", r2: "Resistance R2" }[state.solve];
  }

  function solvedValue(r) {
    if (problem(r)) return "—";
    return state.solve === "i1" ? siFormat(r.i1, "A") : formatOhms(state.solve === "r1" ? r.r1 : r.r2);
  }

  function detailLine(r) {
    if (problem(r)) return "";
    if (state.solve === "i1") {
      const { lo, hi } = branchSpread(r);
      const drift = ((hi - r.i1) / r.i1) * 100;
      return `${siFormat(lo, "A", 3)} – ${siFormat(hi, "A", 3)} (±${Number(drift.toFixed(2))}%)`
        + ` &nbsp;·&nbsp; I2 ${siFormat(r.i2, "A", 3)} &nbsp;·&nbsp; ${siFormat(r.volts, "V", 3)}`;
    }
    const std = standardPart(r);
    const suffix = std.exact ? "is standard" : `→ ${formatOhms(std.value)}, I1 ${siFormat(std.i1, "A", 3)}`;
    return `${std.name} ${suffix} &nbsp;·&nbsp; I2 ${siFormat(r.i2, "A", 3)}`;
  }


  // Two branches in parallel between one node pair. ANSI zigzags at the app's
  // standard proportions, with straight leads into each node. I2 is never an
  // input, so tone() gives it the result green like any other derived quantity;
  // drawn in the wire grey it was all but invisible.
  function diagram() {
    const known = inputsFor(state.solve);
    const tone = (n) => (known.includes(n) ? "#8FC1F5" : "#5DCAA5");
    const wire = "#5A6169";
    const zig = (x, t) => `M${x} ${t} L${x - 7} ${t + 3} L${x + 7} ${t + 9} L${x - 7} ${t + 15} L${x + 7} ${t + 21} L${x - 7} ${t + 27} L${x + 7} ${t + 33} L${x} ${t + 36}`;
    return `<svg width="220" height="98" viewBox="0 0 220 98" fill="none">
      <path d="M110 14 V22 M106 18 L110 22 L114 18" stroke="${tone("iin")}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M84 26 H136 M84 26 V34 M136 26 V34 M84 70 V78 M136 70 V78 M84 78 H136 M110 78 V88" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="${zig(84, 34)}" stroke="${tone("r1")}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
      <path d="${zig(136, 34)}" stroke="${tone("r2")}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
      <circle cx="110" cy="26" r="2.6" fill="${wire}"/>
      <circle cx="110" cy="78" r="2.6" fill="${wire}"/>
      <text x="110" y="10" fill="${tone("iin")}" font-size="12" font-weight="600" text-anchor="middle">Iin</text>
      <text x="66" y="56" fill="${tone("r1")}" font-size="12" font-weight="600" text-anchor="end">R1</text>
      <text x="154" y="56" fill="${tone("r2")}" font-size="12" font-weight="600">R2</text>
      <text x="97" y="56" fill="${tone("i1")}" font-size="12" font-weight="600">I1</text>
      <text x="123" y="56" fill="${tone("i2")}" font-size="12" font-weight="600" text-anchor="end">I2</text>
    </svg>`;
  }

  function updateResults() {
    const r = compute();
    app.querySelector('[data-res="solved"]').textContent = solvedValue(r);
    app.querySelector('[data-res="detail"]').innerHTML = detailLine(r);
    app.querySelector('[data-res="err"]').textContent = problem(r);
    app.querySelectorAll("[data-hint]").forEach(el => { el.textContent = seriesHint(el.dataset.hint); });
    syncSliderPositions(eSeriesForTolerance(state.tol), si,
      (name) => unitSliderBounds(FIELD[name].units[state.units[name]]));
  }

  function paint() {
    const r = compute();
    app.innerHTML = `
      ${calcHeader(tool, favId, "Two branches in parallel")}

      <div class="diagram-box" style="padding:4px 10px;">${diagram()}</div>

      ${pillRow([["i1", "I1"], ["r1", "R1"], ["r2", "R2"]], state.solve, domain.bg)}

      <div class="section-label" style="color:#8FC1F5">Your inputs
        <select id="cd-tol" class="label-select">
          ${[0.1, 0.5, 1, 2, 5, 10].map(t => `<option value="${t}" ${state.tol === t ? "selected" : ""}>±${t}% · ${eSeriesForTolerance(t)}</option>`).join("")}
        </select>
      </div>
      ${inputsFor(state.solve).map(name => `
        <div class="field">
          <label><span class="field-name">${FIELD[name].label}</span>${FIELD[name].units === DIVIDER_R_UNITS
            ? `<span class="field-hint" data-hint="${name}">${seriesHint(name)}</span>` : ""}</label>
          <div class="field-row">
            <input type="number" inputmode="decimal" step="any" data-var="${name}" value="${state.values[name]}" />
            <select data-unit="${name}">
              ${Object.keys(FIELD[name].units).map(u => `<option ${state.units[name] === u ? "selected" : ""}>${u}</option>`).join("")}
            </select>
          </div>
          ${FIELD[name].units === DIVIDER_R_UNITS ? seriesSliderHTML(name, eSeriesForTolerance(state.tol), si(name), unitSliderBounds(FIELD[name].units[state.units[name]])) : ""}
        </div>`).join("")}
      <div class="error-text" data-res="err">${problem(r)}</div>

      <div class="section-label" style="color:#5DCAA5">Result</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">${solvedLabel()}</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="solved">${solvedValue(r)}</span>
        </div>
        <div class="result-sub" data-res="detail">${detailLine(r)}</div>
      </div>

      ${formulaSection(
        ["I1 = Iin × R2 / (R1 + R2)", "I2 = Iin × R1 / (R1 + R2)", "R1 = R2 × (Iin − I1) / I1", "R2 = R1 × I1 / (Iin − I1)"],
        "The smaller resistor carries the larger share — branches split inversely to their resistance."
      )}
      ${calcFooter()}
    `;

    wireCalc(favId, paint, (v) => { state.solve = v; paint(); });

    app.querySelectorAll("input[data-var]").forEach(input => {
      input.oninput = () => {
        state.values[input.dataset.var] = parseFloat(input.value);
        updateResults();
      };
    });
    app.querySelectorAll("select[data-unit]").forEach(select => {
      select.onchange = () => { state.units[select.dataset.unit] = select.value; updateResults(); };
    });
    document.getElementById("cd-tol").onchange = (e) => {
      state.tol = parseFloat(e.target.value);
      updateResults();
    };
    inputsFor(state.solve).filter(name => FIELD[name].units === DIVIDER_R_UNITS).forEach(name => {
      wireSlider(name,
        () => eSeriesRange(eSeriesForTolerance(state.tol), ...unitSliderBounds(FIELD[name].units[state.units[name]])),
        (ohms) => {
          state.values[name] = ohms / FIELD[name].units[state.units[name]];
          app.querySelector(`input[data-var="${name}"]`).value = trim(state.values[name]);
          updateResults();
        });
    });
  }

  paint();
}

// ---------- Wheatstone bridge ----------
// At balance the galvanometer carries no current, so R1/R2 = R3/Rx with no
// other measurement needed — that ratio is the whole calculator. Any of the
// four arms can be the one you're solving for: R1/R2 are usually the fixed
// ratio arms, R3 the adjustable one, and Rx the unknown under test, but
// nothing here assumes which physical role a given arm plays.
function renderWheatstoneBridge(domain, tool, favId) {
  const state = {
    solve: "rx",
    tol: 1,
    values: { r1: 1, r2: 1, r3: 1, rx: 1 },
    units: { r1: "kΩ", r2: "kΩ", r3: "kΩ", rx: "kΩ" },
  };

  const FIELD = {
    r1: { label: "R1 — top left" },
    r2: { label: "R2 — top right" },
    r3: { label: "R3 — bottom left" },
    rx: { label: "Rx — bottom right (unknown)" },
  };

  function inputsFor(solve) {
    return ["r1", "r2", "r3", "rx"].filter(n => n !== solve);
  }

  function si(name) {
    return state.values[name] * DIVIDER_R_UNITS[state.units[name]];
  }

  function compute() {
    let r1 = si("r1"), r2 = si("r2"), r3 = si("r3"), rx = si("rx");
    if (state.solve === "rx") rx = (r2 * r3) / r1;
    if (state.solve === "r1") r1 = (r2 * r3) / rx;
    if (state.solve === "r2") r2 = (r1 * rx) / r3;
    if (state.solve === "r3") r3 = (r1 * rx) / r2;
    return { r1, r2, r3, rx };
  }

  // Each rearrangement divides by a different arm, so the one that has to be
  // nonzero moves with what you're solving for — dividing by the arm you
  // just solved away is exactly the case that can't happen.
  function problem(r) {
    const divisor = { rx: "r1", r1: "rx", r2: "r3", r3: "r2" }[state.solve];
    if (si(divisor) <= 0) return `${FIELD[divisor].label.split(" —")[0]} cannot be zero.`;
    if (!isFinite(r[state.solve]) || r[state.solve] < 0) return "No solution for those values.";
    return "";
  }

  function solvedLabel() {
    return FIELD[state.solve].label;
  }

  function seriesHint(name) {
    const ohms = si(name);
    if (!isFinite(ohms) || ohms <= 0) return "";
    const series = eSeriesForTolerance(state.tol);
    const near = nearestESeries(ohms, series);
    return near.exact ? series : `${series} → ${formatOhms(near.value)}`;
  }

  // The arm you solved for has to exist as a real part too, same question the
  // three you supplied are already held to.
  function standardPart(r) {
    const name = eSeriesForTolerance(state.tol);
    const near = nearestESeries(r[state.solve], name);
    return { name, value: near.value, exact: near.exact };
  }

  function detailLine(r) {
    if (problem(r)) return "";
    const std = standardPart(r);
    return std.exact ? `${std.name} standard value` : `${std.name} → nearest ${formatOhms(std.value)}`;
  }

  function formulaFor(solve) {
    if (solve === "rx") return "Rx = R2 × R3 / R1";
    if (solve === "r1") return "R1 = R2 × R3 / Rx";
    if (solve === "r2") return "R2 = R1 × Rx / R3";
    return "R3 = R1 × Rx / R2";
  }

  // A short zigzag centered on a diagonal edge, with straight leads either
  // side reaching the corners — the diagonal version of the same body-plus-
  // leads shape every other resistor symbol in the app uses, rotated to
  // whatever angle this edge sits at instead of the usual horizontal/vertical.
  function edgeZigzag(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const px = -uy, py = ux;
    const amp = 4.5;
    const bx1 = x1 + dx * 0.28, by1 = y1 + dy * 0.28;
    const bx2 = x1 + dx * 0.72, by2 = y1 + dy * 0.72;
    const pts = [[bx1, by1]];
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      const side = i % 2 === 1 ? 1 : -1;
      pts.push([bx1 + (bx2 - bx1) * t + px * amp * side, by1 + (by2 - by1) * t + py * amp * side]);
    }
    pts.push([bx2, by2]);
    const zig = pts.map(p => p.map(n => n.toFixed(1)).join(",")).join(" L");
    return `M${x1},${y1} L${bx1.toFixed(1)},${by1.toFixed(1)} M${zig} M${bx2.toFixed(1)},${by2.toFixed(1)} L${x2},${y2}`;
  }

  // True diamond: A/B/D/C sit at equal radius from the centre (N/W/E/S), so
  // every internal corner is exactly 90° — a square standing on its point,
  // not just any rhombus. A and C carry the supply, B and D sit level and
  // are bridged by the galvanometer — the branch that reads zero at balance.
  function diagram() {
    const known = inputsFor(state.solve);
    const tone = (n) => (known.includes(n) ? "#8FC1F5" : "#5DCAA5");
    const wire = "#5A6169";
    const cx = 110, cy = 76, rad = 54;
    const A = [cx, cy - rad], B = [cx - rad, cy], D = [cx + rad, cy], C = [cx, cy + rad];
    const labelPos = {
      r1: [70, 44, "end"], r2: [150, 44, "start"],
      r3: [70, 112, "end"], rx: [150, 112, "start"],
    };
    const edges = [["r1", A, B], ["r2", A, D], ["r3", B, C], ["rx", D, C]];
    return `<svg width="220" height="150" viewBox="0 0 220 150" fill="none">
      <path d="M${cx} 10 V${A[1]} M${cx} ${C[1]} V138" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M${B[0]} ${B[1]} H${D[0]}" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="11" fill="#15181D" stroke="${wire}" stroke-width="1.6"/>
      <text x="${cx}" y="${cy + 4}" fill="${wire}" font-size="10" font-weight="700" text-anchor="middle">G</text>
      ${edges.map(([name, [x1, y1], [x2, y2]]) =>
        `<path d="${edgeZigzag(x1, y1, x2, y2)}" stroke="${tone(name)}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>`
      ).join("")}
      ${Object.entries(labelPos).map(([name, [x, y, anchor]]) =>
        `<text x="${x}" y="${y}" fill="${tone(name)}" font-size="11" font-weight="600" text-anchor="${anchor}">${name === "rx" ? "Rx" : name.toUpperCase()}</text>`
      ).join("")}
      <text x="${cx}" y="7" fill="${tone("r1")}" font-size="11" font-weight="600" text-anchor="middle" dy="6">V</text>
      <path d="M103 138 H117 M105.5 141 H114.5 M108 144 H112" stroke="${wire}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
  }

  function updateResults() {
    const r = compute();
    const issue = problem(r);
    app.querySelector('[data-res="solved"]').textContent = issue ? "—" : formatOhms(r[state.solve]);
    app.querySelector('[data-res="detail"]').innerHTML = detailLine(r);
    app.querySelector('[data-res="err"]').textContent = issue;
    app.querySelectorAll("[data-hint]").forEach(el => { el.textContent = seriesHint(el.dataset.hint); });
    syncSliderPositions(eSeriesForTolerance(state.tol), si,
      (name) => unitSliderBounds(DIVIDER_R_UNITS[state.units[name]]));
  }

  function paint() {
    const r = compute();
    app.innerHTML = `
      ${calcHeader(tool, favId, "Balanced ratio bridge")}

      <div class="diagram-box" style="padding:2px 10px;">${diagram()}</div>

      ${pillRow([["rx", "Rx"], ["r1", "R1"], ["r2", "R2"], ["r3", "R3"]], state.solve, domain.bg)}

      <div class="section-label" style="color:#8FC1F5">Your inputs
        <select id="wb-tol" class="label-select">
          ${[0.1, 0.5, 1, 2, 5, 10].map(t => `<option value="${t}" ${state.tol === t ? "selected" : ""}>±${t}% · ${eSeriesForTolerance(t)}</option>`).join("")}
        </select>
      </div>
      ${inputsFor(state.solve).map(name => `
        <div class="field">
          <label><span class="field-name">${FIELD[name].label}</span><span class="field-hint" data-hint="${name}">${seriesHint(name)}</span></label>
          <div class="field-row">
            <input type="number" inputmode="decimal" step="any" data-var="${name}" value="${state.values[name]}" />
            <select data-unit="${name}">
              ${Object.keys(DIVIDER_R_UNITS).map(u => `<option ${state.units[name] === u ? "selected" : ""}>${u}</option>`).join("")}
            </select>
          </div>
          ${seriesSliderHTML(name, eSeriesForTolerance(state.tol), si(name), unitSliderBounds(DIVIDER_R_UNITS[state.units[name]]))}
        </div>`).join("")}
      <div class="error-text" data-res="err">${problem(r)}</div>

      <div class="section-label" style="color:#5DCAA5">Result</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">${solvedLabel()}</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="solved">${problem(r) ? "—" : formatOhms(r[state.solve])}</span>
        </div>
        <div class="result-sub" data-res="detail">${detailLine(r)}</div>
      </div>

      ${formulaSection(
        ["At balance: R1 / R2 = R3 / Rx", "Rx = R2 × R3 / R1", "R1 = R2 × R3 / Rx", "R2 = R1 × Rx / R3", "R3 = R1 × Rx / R2"],
        "Balance means the galvanometer reads zero — no separate current or voltage measurement is needed, only the ratio."
      )}
      ${calcFooter()}
    `;

    wireCalc(favId, paint, (v) => { state.solve = v; paint(); });

    app.querySelectorAll("input[data-var]").forEach(input => {
      input.oninput = () => {
        state.values[input.dataset.var] = parseFloat(input.value);
        updateResults();
      };
    });
    app.querySelectorAll("select[data-unit]").forEach(select => {
      select.onchange = () => { state.units[select.dataset.unit] = select.value; updateResults(); };
    });
    document.getElementById("wb-tol").onchange = (e) => {
      state.tol = parseFloat(e.target.value);
      updateResults();
    };
    inputsFor(state.solve).forEach(name => {
      wireSlider(name,
        () => eSeriesRange(eSeriesForTolerance(state.tol), ...unitSliderBounds(DIVIDER_R_UNITS[state.units[name]])),
        (ohms) => {
          state.values[name] = ohms / DIVIDER_R_UNITS[state.units[name]];
          app.querySelector(`input[data-var="${name}"]`).value = trim(state.values[name]);
          updateResults();
        });
    });
  }

  paint();
}

// ---------- Series / parallel resistors ----------
// Capped at four resistors: past that the schematic stops being readable at
// phone width, and a drawing that no longer matches the inputs is worse than
// a limit. Four covers the overwhelming majority of real networks.
const SP_MAX = 4;

function renderSeriesParallel(domain, tool, favId) {
  const state = {
    mode: "series",
    tol: 1,
    rows: [
      { value: 1, unit: "kΩ" },
      { value: 1, unit: "kΩ" },
    ],
  };

  function ohmsOf(row) {
    return row.value * DIVIDER_R_UNITS[row.unit];
  }

  function values() {
    return state.rows.map(ohmsOf);
  }

  function total() {
    const v = values();
    if (v.some(x => !isFinite(x) || x < 0)) return NaN;
    if (state.mode === "series") return v.reduce((a, b) => a + b, 0);
    if (v.some(x => x === 0)) return 0; // a short across the group wins
    const inv = v.reduce((a, b) => a + 1 / b, 0);
    return inv === 0 ? NaN : 1 / inv;
  }

  function problem() {
    if (values().some(x => !isFinite(x) || x < 0)) return "Every resistance must be zero or more.";
    return "";
  }

  function seriesHint(ohms) {
    if (!isFinite(ohms) || ohms <= 0) return "";
    const name = eSeriesForTolerance(state.tol);
    const near = nearestESeries(ohms, name);
    return near.exact ? name : `${name} ${formatOhms(near.value)}`;
  }

  // Scaling every resistor by (1 ± t) scales both a series sum and a parallel
  // combination by exactly the same factor, so the total carries the part
  // tolerance unchanged — no better, and no worse.
  function detailLine() {
    const r = total();
    if (problem() || !isFinite(r) || r <= 0) return "";
    const t = state.tol / 100;
    const name = eSeriesForTolerance(state.tol);
    const near = nearestESeries(r, name);
    const single = near.exact
      ? `one ${name} part would do it`
      : `nearest single ${name} ${formatOhms(near.value)}`;
    return `${formatOhms(r * (1 - t))} – ${formatOhms(r * (1 + t))} &nbsp;·&nbsp; ${single}`;
  }


  // ANSI zigzags at the app's proportions. Series runs them along one wire;
  // parallel hangs them between two rails. The pitch is fixed at the four-part
  // spacing whatever the count, so adding or removing a resistor slides the
  // group wider or narrower instead of respacing the ones already drawn.
  const SP_SLOT = 196 / SP_MAX;
  const SP_BODY = 36;

  function centres(n) {
    const start = (220 - n * SP_SLOT) / 2;
    return Array.from({ length: n }, (_, i) => start + SP_SLOT * (i + 0.5));
  }

  function diagram() {
    const n = state.rows.length;
    const wire = "#5A6169";
    const ink = "#8FC1F5";
    const cx = centres(n);
    const half = SP_BODY / 2;

    if (state.mode === "series") {
      // Every length of trace is the same: the lead at each end matches the gap
      // between resistors, so the chain reads evenly instead of floating in two
      // long tails. The pitch is unchanged — body plus gap is still 49.
      const gap = SP_SLOT - SP_BODY;
      const width = n * SP_BODY + (n + 1) * gap;
      const x0 = (220 - width) / 2;
      const bodyStart = (i) => x0 + gap + i * (SP_BODY + gap);
      const step = SP_BODY / 6;
      const bodies = Array.from({ length: n }, (_, i) => {
        const x = bodyStart(i);
        const zig = `M${x} 35 L${x + step * 0.5} 28 L${x + step * 1.5} 42 L${x + step * 2.5} 28`
          + ` L${x + step * 3.5} 42 L${x + step * 4.5} 28 L${x + step * 5.5} 42 L${x + SP_BODY} 35`;
        return `<path d="${zig}" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>`
          + `<text x="${x + half}" y="18" fill="${ink}" font-size="11" font-weight="600" text-anchor="middle">R${i + 1}</text>`;
      });
      const links = Array.from({ length: n + 1 }, (_, i) =>
        `M${i === 0 ? x0 : bodyStart(i - 1) + SP_BODY} 35 H${i === n ? x0 + width : bodyStart(i)}`);
      return `<svg width="220" height="56" viewBox="0 0 220 56" fill="none">
        <path d="${links.join(" ")}" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
        ${bodies.join("")}
      </svg>`;
    }

    const zig = (x, t) => `M${x} ${t} L${x - 7} ${t + 3} L${x + 7} ${t + 9} L${x - 7} ${t + 15} L${x + 7} ${t + 21} L${x - 7} ${t + 27} L${x + 7} ${t + 33} L${x} ${t + 36}`;
    return `<svg width="220" height="96" viewBox="0 0 220 96" fill="none">
      <path d="M${cx[0]} 24 H${cx[n - 1]} M${cx[0]} 76 H${cx[n - 1]}" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="${cx.map(x => `M${x} 24 V32 M${x} 68 V76`).join(" ")}" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M110 12 V24 M110 76 V88" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      ${cx.map(x => `<path d="${zig(x, 32)}" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>`).join("")}
      ${cx.map((x, i) => `<text x="${x}" y="52" fill="${ink}" font-size="11" font-weight="600" text-anchor="${i === n - 1 ? "start" : "end"}" dx="${i === n - 1 ? 10 : -10}">R${i + 1}</text>`).join("")}
    </svg>`;
  }

  function rowsHTML() {
    return state.rows.map((row, i) => `
      <div class="r-item">
        <div class="r-line">
          <span class="r-index">R${i + 1}</span>
          <input type="number" inputmode="decimal" step="any" data-row="${i}" value="${row.value}" />
          <span class="r-hint" data-hint="${i}">${seriesHint(ohmsOf(row))}</span>
          <select data-unit="${i}">
            ${Object.keys(DIVIDER_R_UNITS).map(u => `<option ${row.unit === u ? "selected" : ""}>${u}</option>`).join("")}
          </select>
          <button class="r-drop" data-drop="${i}" aria-label="Remove R${i + 1}" ${state.rows.length <= 2 ? "disabled" : ""}>×</button>
        </div>
        ${seriesSliderHTML(i, eSeriesForTolerance(state.tol), ohmsOf(row), unitSliderBounds(DIVIDER_R_UNITS[row.unit]))}
      </div>`).join("");
  }

  function updateResults() {
    app.querySelector('[data-res="total"]').textContent = problem() ? "—" : formatOhms(total());
    app.querySelector('[data-res="detail"]').innerHTML = detailLine();
    app.querySelector('[data-res="err"]').textContent = problem();
    app.querySelectorAll("[data-hint]").forEach(el => {
      el.textContent = seriesHint(ohmsOf(state.rows[el.dataset.hint]));
    });
    app.querySelector(".diagram-box").innerHTML = diagram();
    syncSliderPositions(eSeriesForTolerance(state.tol), (i) => ohmsOf(state.rows[i]),
      (i) => unitSliderBounds(DIVIDER_R_UNITS[state.rows[i].unit]));
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, `${state.rows.length} resistors, ${state.mode === "series" ? "end to end" : "across each other"}`)}

      <div class="diagram-box" style="padding:6px 10px;">${diagram()}</div>

      ${pillRow([["series", "Series"], ["parallel", "Parallel"]], state.mode, domain.bg)}

      <div class="section-label split" style="color:#8FC1F5">
        <span>Resistors</span>
        <button class="label-btn" id="sp-add" ${state.rows.length >= SP_MAX ? "disabled" : ""}>+ add</button>
        <select id="sp-tol" class="label-select">
          ${[0.1, 0.5, 1, 2, 5, 10].map(t => `<option value="${t}" ${state.tol === t ? "selected" : ""}>±${t}% · ${eSeriesForTolerance(t)}</option>`).join("")}
        </select>
      </div>
      <div class="r-list">${rowsHTML()}</div>
      <div class="error-text" data-res="err">${problem()}</div>

      <div class="section-label" style="color:#5DCAA5">Result</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">Total resistance</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="total">${problem() ? "—" : formatOhms(total())}</span>
        </div>
        <div class="result-sub" data-res="detail">${detailLine()}</div>
      </div>

      ${formulaSection(
        ["Series: R = R1 + R2 + R3 + …", "Parallel: 1/R = 1/R1 + 1/R2 + 1/R3 + …", "Parallel (2 only): R = R1 × R2 / (R1 + R2)"],
        "Series always increases total resistance; parallel always decreases it below the smallest single resistor."
      )}
      ${calcFooter()}
    `;

    wireCalc(favId, paint, (v) => { state.mode = v; paint(); });

    app.querySelectorAll("input[data-row]").forEach(input => {
      input.oninput = () => {
        state.rows[input.dataset.row].value = parseFloat(input.value);
        updateResults();
      };
    });
    app.querySelectorAll("select[data-unit]").forEach(select => {
      select.onchange = () => { state.rows[select.dataset.unit].unit = select.value; updateResults(); };
    });
    app.querySelectorAll("[data-drop]").forEach(btn => {
      btn.onclick = () => {
        if (state.rows.length <= 2) return;
        state.rows.splice(+btn.dataset.drop, 1);
        paint();
      };
    });
    document.getElementById("sp-add").onclick = () => {
      if (state.rows.length >= SP_MAX) return;
      state.rows.push({ value: 1, unit: "kΩ" });
      paint();
    };
    document.getElementById("sp-tol").onchange = (e) => {
      state.tol = parseFloat(e.target.value);
      updateResults();
    };
    state.rows.forEach((row, i) => {
      wireSlider(i,
        () => eSeriesRange(eSeriesForTolerance(state.tol), ...unitSliderBounds(DIVIDER_R_UNITS[state.rows[i].unit])),
        (ohms) => {
          state.rows[i].value = trim(ohms / DIVIDER_R_UNITS[state.rows[i].unit]);
          app.querySelector(`input[data-row="${i}"]`).value = state.rows[i].value;
          updateResults();
        });
    });
  }

  paint();
}

// ---------- Series / parallel capacitors ----------
// The mirror image of the resistor version: series and parallel swap which
// formula applies (capacitance combines like conductance, not resistance),
// the practical value range runs pF–mF instead of Ω–MΩ, and the schematic
// symbol is a pair of plates instead of a zigzag — everything else (row
// add/remove, tolerance-driven E-series, the standard-value slider) is the
// same shape as renderSeriesParallel and kept separate rather than factored
// out, since threading two more config parameters through it would obscure
// more than four near-identical closures side by side would cost.
const CAP_UNITS = { pF: 1e-12, nF: 1e-9, "µF": 1e-6, mF: 1e-3, F: 1 };
const CAP_SLIDER_MIN = 1e-12;
const CAP_SLIDER_MAX = 1e-3;

function renderCapSeriesParallel(domain, tool, favId) {
  const state = {
    mode: "parallel",
    tol: 10,
    rows: [
      { value: 100, unit: "nF" },
      { value: 100, unit: "nF" },
    ],
  };

  function faradsOf(row) {
    return row.value * CAP_UNITS[row.unit];
  }

  function values() {
    return state.rows.map(faradsOf);
  }

  // Swapped from the resistor version: capacitors in series combine like
  // resistors in parallel, and vice versa — series capacitance is always
  // smaller than the smallest part, parallel always larger.
  function total() {
    const v = values();
    if (v.some(x => !isFinite(x) || x < 0)) return NaN;
    if (state.mode === "parallel") return v.reduce((a, b) => a + b, 0);
    if (v.some(x => x === 0)) return 0;
    const inv = v.reduce((a, b) => a + 1 / b, 0);
    return inv === 0 ? NaN : 1 / inv;
  }

  function problem() {
    if (values().some(x => !isFinite(x) || x < 0)) return "Every capacitance must be zero or more.";
    return "";
  }

  function seriesHint(farads) {
    if (!isFinite(farads) || farads <= 0) return "";
    const name = eSeriesForTolerance(state.tol);
    const near = nearestESeries(farads, name);
    return near.exact ? name : `${name} ${formatFarads(near.value)}`;
  }

  function detailLine() {
    const r = total();
    if (problem() || !isFinite(r) || r <= 0) return "";
    const t = state.tol / 100;
    const name = eSeriesForTolerance(state.tol);
    const near = nearestESeries(r, name);
    const single = near.exact
      ? `one ${name} part would do it`
      : `nearest single ${name} ${formatFarads(near.value)}`;
    return `${formatFarads(r * (1 - t))} – ${formatFarads(r * (1 + t))} &nbsp;·&nbsp; ${single}`;
  }

  const SP_SLOT = 196 / SP_MAX;
  const SP_BODY = 36;

  function centres(n) {
    const start = (220 - n * SP_SLOT) / 2;
    return Array.from({ length: n }, (_, i) => start + SP_SLOT * (i + 0.5));
  }

  function diagram() {
    const n = state.rows.length;
    const wire = "#5A6169";
    const ink = "#8FC1F5";
    const cx = centres(n);
    const half = SP_BODY / 2;

    if (state.mode === "series") {
      // Same lead/pitch math as the resistor chain — only the body itself,
      // two plates with a gap instead of a zigzag, differs.
      const gap = SP_SLOT - SP_BODY;
      const width = n * SP_BODY + (n + 1) * gap;
      const x0 = (220 - width) / 2;
      const bodyStart = (i) => x0 + gap + i * (SP_BODY + gap);
      const bodies = Array.from({ length: n }, (_, i) => {
        const x = bodyStart(i);
        const c = x + half;
        return `<path d="M${x} 35 H${c - 5} M${c - 5} 21 V49 M${c + 5} 21 V49 M${c + 5} 35 H${x + SP_BODY}" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`
          + `<text x="${c}" y="18" fill="${ink}" font-size="11" font-weight="600" text-anchor="middle">C${i + 1}</text>`;
      });
      const links = Array.from({ length: n + 1 }, (_, i) =>
        `M${i === 0 ? x0 : bodyStart(i - 1) + SP_BODY} 35 H${i === n ? x0 + width : bodyStart(i)}`);
      return `<svg width="220" height="56" viewBox="0 0 220 56" fill="none">
        <path d="${links.join(" ")}" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
        ${bodies.join("")}
      </svg>`;
    }

    // Parallel: plates rotate 90° to sit crosswise on the vertical drop
    // between the two rails, same as the resistor version's zigzags do.
    const plates = (x, t) => `<path d="M${x} ${t} V${t + 11} M${x - 9} ${t + 11} H${x + 9} M${x - 9} ${t + 19} H${x + 9} M${x} ${t + 19} V${t + 30}" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`;
    return `<svg width="220" height="96" viewBox="0 0 220 96" fill="none">
      <path d="M${cx[0]} 24 H${cx[n - 1]} M${cx[0]} 76 H${cx[n - 1]}" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="${cx.map(x => `M${x} 24 V35 M${x} 65 V76`).join(" ")}" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M110 12 V24 M110 76 V88" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      ${cx.map(x => plates(x, 35)).join("")}
      ${cx.map((x, i) => `<text x="${x}" y="52" fill="${ink}" font-size="11" font-weight="600" text-anchor="${i === n - 1 ? "start" : "end"}" dx="${i === n - 1 ? 10 : -10}">C${i + 1}</text>`).join("")}
    </svg>`;
  }

  function rowsHTML() {
    return state.rows.map((row, i) => `
      <div class="r-item">
        <div class="r-line">
          <span class="r-index">C${i + 1}</span>
          <input type="number" inputmode="decimal" step="any" data-row="${i}" value="${row.value}" />
          <span class="r-hint" data-hint="${i}">${seriesHint(faradsOf(row))}</span>
          <select data-unit="${i}">
            ${Object.keys(CAP_UNITS).map(u => `<option ${row.unit === u ? "selected" : ""}>${u}</option>`).join("")}
          </select>
          <button class="r-drop" data-drop="${i}" aria-label="Remove C${i + 1}" ${state.rows.length <= 2 ? "disabled" : ""}>×</button>
        </div>
        ${seriesSliderHTML(i, eSeriesForTolerance(state.tol), faradsOf(row), unitSliderBounds(CAP_UNITS[row.unit], CAP_SLIDER_MIN, CAP_SLIDER_MAX))}
      </div>`).join("");
  }

  function updateResults() {
    app.querySelector('[data-res="total"]').textContent = problem() ? "—" : formatFarads(total());
    app.querySelector('[data-res="detail"]').innerHTML = detailLine();
    app.querySelector('[data-res="err"]').textContent = problem();
    app.querySelectorAll("[data-hint]").forEach(el => {
      el.textContent = seriesHint(faradsOf(state.rows[el.dataset.hint]));
    });
    app.querySelector(".diagram-box").innerHTML = diagram();
    syncSliderPositions(eSeriesForTolerance(state.tol), (i) => faradsOf(state.rows[i]),
      (i) => unitSliderBounds(CAP_UNITS[state.rows[i].unit], CAP_SLIDER_MIN, CAP_SLIDER_MAX));
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, `${state.rows.length} capacitors, ${state.mode === "series" ? "end to end" : "across each other"}`)}

      <div class="diagram-box" style="padding:6px 10px;">${diagram()}</div>

      ${pillRow([["parallel", "Parallel"], ["series", "Series"]], state.mode, domain.bg)}

      <div class="section-label split" style="color:#8FC1F5">
        <span>Capacitors</span>
        <button class="label-btn" id="sp-add" ${state.rows.length >= SP_MAX ? "disabled" : ""}>+ add</button>
        <select id="sp-tol" class="label-select">
          ${[1, 2, 5, 10, 20].map(t => `<option value="${t}" ${state.tol === t ? "selected" : ""}>±${t}% · ${eSeriesForTolerance(t)}</option>`).join("")}
        </select>
      </div>
      <div class="r-list">${rowsHTML()}</div>
      <div class="error-text" data-res="err">${problem()}</div>

      <div class="section-label" style="color:#5DCAA5">Result</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">Total capacitance</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="total">${problem() ? "—" : formatFarads(total())}</span>
        </div>
        <div class="result-sub" data-res="detail">${detailLine()}</div>
      </div>

      ${formulaSection(
        ["Parallel: C = C1 + C2 + C3 + …", "Series: 1/C = 1/C1 + 1/C2 + 1/C3 + …", "Series (2 only): C = C1 × C2 / (C1 + C2)"],
        "The opposite of resistors: parallel always increases total capacitance; series always decreases it below the smallest single capacitor."
      )}
      ${calcFooter()}
    `;

    wireCalc(favId, paint, (v) => { state.mode = v; paint(); });

    app.querySelectorAll("input[data-row]").forEach(input => {
      input.oninput = () => {
        state.rows[input.dataset.row].value = parseFloat(input.value);
        updateResults();
      };
    });
    app.querySelectorAll("select[data-unit]").forEach(select => {
      select.onchange = () => { state.rows[select.dataset.unit].unit = select.value; updateResults(); };
    });
    app.querySelectorAll("[data-drop]").forEach(btn => {
      btn.onclick = () => {
        if (state.rows.length <= 2) return;
        state.rows.splice(+btn.dataset.drop, 1);
        paint();
      };
    });
    document.getElementById("sp-add").onclick = () => {
      if (state.rows.length >= SP_MAX) return;
      state.rows.push({ value: 100, unit: "nF" });
      paint();
    };
    document.getElementById("sp-tol").onchange = (e) => {
      state.tol = parseFloat(e.target.value);
      updateResults();
    };
    state.rows.forEach((row, i) => {
      wireSlider(i,
        () => eSeriesRange(eSeriesForTolerance(state.tol), ...unitSliderBounds(CAP_UNITS[state.rows[i].unit], CAP_SLIDER_MIN, CAP_SLIDER_MAX)),
        (farads) => {
          state.rows[i].value = trim(farads / CAP_UNITS[state.rows[i].unit]);
          app.querySelector(`input[data-row="${i}"]`).value = state.rows[i].value;
          updateResults();
        });
    });
  }

  paint();
}

// ---------- Kirchhoff's laws ----------
// Both laws are the same statement — a signed sum around a closed boundary
// is zero — just applied to a node (KCL, current) or a loop (KVL, voltage).
// One screen, one mechanism: enter every known signed term, and the missing
// one is whatever balances the sum back to zero. No topology is assumed —
// which terms are "into the node" or "a rise" is exactly what the sign on
// each row means, decided by whoever is filling it in.
const KL_MAX = 5;

function renderKirchhoff(domain, tool, favId) {
  const state = {
    mode: "kcl",
    rows: [
      { value: 2, unit: "A", sign: 1 },
      { value: 1.2, unit: "A", sign: -1 },
    ],
  };

  function unitsFor() {
    return state.mode === "kcl" ? AMP_UNITS : VOLT_UNITS;
  }

  // Rows carry whichever unit was on screen when the mode last changed, so
  // switching KCL/KVL needs to reset them to a sane default instead of
  // reading amps as volts.
  function resetRows() {
    const unit = state.mode === "kcl" ? "A" : "V";
    state.rows = [{ value: 2, unit, sign: 1 }, { value: 1.2, unit, sign: -1 }];
  }

  function signedValue(row) {
    return row.sign * row.value * unitsFor()[row.unit];
  }

  function sumKnown() {
    return state.rows.reduce((a, r) => a + (isFinite(signedValue(r)) ? signedValue(r) : 0), 0);
  }

  function unknown() {
    return -sumKnown();
  }

  // The unknown continues the same I1/I2.../V1/V2... sequence as the known
  // rows — shared between the diagram and the result label so they always
  // agree on which term they're both pointing at.
  function unknownLabel() {
    return `${state.mode === "kcl" ? "I" : "V"}${state.rows.length + 1}`;
  }

  function problem() {
    if (state.rows.some(r => !isFinite(r.value))) return "Every term needs a value.";
    return "";
  }

  function resultValue() {
    return formatSigned(unknown());
  }

  function formatSigned(v) {
    const unit = state.mode === "kcl" ? "A" : "V";
    return `${v < 0 ? "−" : "+"}${siFormat(Math.abs(v), unit, 4)}`;
  }

  function detailLine() {
    if (problem()) return "";
    const dir = state.mode === "kcl"
      ? (unknown() >= 0 ? "flows into the node" : "flows out of the node")
      : (unknown() >= 0 ? "is a rise" : "is a drop");
    return `The missing term ${dir} to bring the sum to zero.`;
  }

  function rowsHTML() {
    return state.rows.map((row, i) => `
      <div class="r-item">
        <div class="r-line">
          <span class="r-index">${state.mode === "kcl" ? "I" : "V"}${i + 1}</span>
          <button class="sign-btn" data-sign="${i}" style="color:${row.sign > 0 ? "#8FC1F5" : "#E08585"};border-color:${row.sign > 0 ? "#8FC1F5" : "#E08585"}55;" aria-label="${row.sign > 0 ? "Positive" : "Negative"} — tap to flip">${row.sign > 0 ? "+" : "−"}</button>
          <input type="number" inputmode="decimal" step="any" data-row="${i}" value="${row.value}" />
          <select data-unit="${i}">
            ${Object.keys(unitsFor()).map(u => `<option ${row.unit === u ? "selected" : ""}>${u}</option>`).join("")}
          </select>
          <button class="r-drop" data-drop="${i}" aria-label="Remove term ${i + 1}" ${state.rows.length <= 2 ? "disabled" : ""}>×</button>
        </div>
      </div>`).join("");
  }

  // Evenly spaced y-positions for n items between the canvas's top and
  // bottom margins — shared by both diagrams so an extra row (up to KL_MAX)
  // just adds another arrow or tick instead of needing a different layout.
  function spread(n, lo, hi) {
    if (n <= 1) return [(lo + hi) / 2];
    const step = (hi - lo) / (n - 1);
    return Array.from({ length: n }, (_, i) => lo + step * i);
  }

  function arrowPath(x1, y1, x2, y2) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const ax = x2 - 7 * Math.cos(a - 0.5), ay = y2 - 7 * Math.sin(a - 0.5);
    const bx = x2 - 7 * Math.cos(a + 0.5), by = y2 - 7 * Math.sin(a + 0.5);
    return `M${x1} ${y1} L${x2} ${y2} M${x2} ${y2} L${ax.toFixed(1)} ${ay.toFixed(1)} M${x2} ${y2} L${bx.toFixed(1)} ${by.toFixed(1)}`;
  }

  // KCL: every row draws its own arrow into or out of the centre node —
  // sign decides which side, row index picks its Iⁿ label — so the diagram
  // always matches exactly what's in the list below it, the way the
  // reference screenshot's I1/I2 labels do. KVL: same idea around a loop,
  // each row a tick with its Vⁿ label and sign-coloured to match its row.
  // The missing term is drawn too, dashed and marked "?" on whichever side
  // its computed sign puts it — leaving it out entirely (e.g. when every
  // known row happens to be "in") drew a node with nothing balancing it,
  // which looks like current can just vanish.
  function diagram() {
    const wire = "#5A6169";
    // Result green, not gold — every other calculator marks a computed value
    // this same colour, so the dashed line reads as "this one's calculated"
    // consistently with the rest of the app instead of introducing a new
    // meaning for gold. Reserved for the unknown alone: known rows each get
    // their own colour from this palette (cycling by index) instead of only
    // two colours split by side, so I2 and I3 are never just "both green"
    // — position (which side of the node, or +/− on the loop) already says
    // in/out or rise/drop; colour's job here is telling rows apart.
    const resultColor = "#5DCAA5";
    const palette = ["#8FC1F5", "#B98FE0", "#E08585", "#EF9F27", "#5BC4E0"];
    const label = state.mode === "kcl" ? "I" : "V";
    const u = unknown();
    const items = state.rows.map((r, i) => ({ sign: r.sign, text: `${label}${i + 1}`, unk: false, color: palette[i % palette.length] }));
    // No "out" naming — a real node can have more than one outgoing branch,
    // so singling the unknown out as *the* output would be wrong. It's just
    // the next term in the same sequence; the dashed styling is what marks
    // it as calculated rather than entered, not its label.
    items.push({ sign: u >= 0 ? 1 : -1, text: unknownLabel(), unk: true, color: resultColor });
    const inItems = items.filter(x => x.sign > 0);
    const outItems = items.filter(x => x.sign <= 0);
    if (state.mode === "kcl") {
      const inYs = spread(inItems.length, 14, 86);
      const outYs = spread(outItems.length, 14, 86);
      const inArrows = inItems.map((it, k) => `
        <path d="${arrowPath(34, inYs[k], 104, 50 - (50 - inYs[k]) * 0.06)}" stroke="${it.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${it.unk ? 'stroke-dasharray="3,2.5"' : ""}/>
        <text x="26" y="${inYs[k] + 4}" fill="${it.color}" font-size="11" font-weight="600" text-anchor="end">${it.text}</text>`);
      const outArrows = outItems.map((it, k) => `
        <path d="${arrowPath(116, 50 - (50 - outYs[k]) * 0.06, 186, outYs[k])}" stroke="${it.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${it.unk ? 'stroke-dasharray="3,2.5"' : ""}/>
        <text x="194" y="${outYs[k] + 4}" fill="${it.color}" font-size="11" font-weight="600" text-anchor="start">${it.text}</text>`);
      return `<svg width="220" height="100" viewBox="0 0 220 100" fill="none">
        <circle cx="110" cy="50" r="4" fill="${wire}"/>
        ${inArrows.join("")}
        ${outArrows.join("")}
      </svg>`;
    }
    // No loop-direction arrow: it only ever collided with whichever tick sat
    // near top-centre, and traversal direction isn't something this tool
    // needs to assert — a KVL loop is walked whichever way makes the signs
    // convenient, which is exactly what each row's own +/− already records.
    const xs = spread(items.length, 46, 174);
    const ticks = items.map((it, i) => {
      const x = xs[i];
      return `<path d="M${x} 16 V24" stroke="${it.color}" stroke-width="2.2" stroke-linecap="round" ${it.unk ? 'stroke-dasharray="2.5,2"' : ""}/>
        <text x="${x}" y="11" fill="${it.color}" font-size="10" font-weight="600" text-anchor="middle">${it.text}</text>`;
    }).join("");
    return `<svg width="220" height="100" viewBox="0 0 220 100" fill="none">
      <path d="M50 20 H170 V80 H50 Z" stroke="${wire}" stroke-width="1.6" stroke-linejoin="round"/>
      ${ticks}
      <text x="35" y="24" fill="#8FC1F5" font-size="13" font-weight="700" text-anchor="middle">+</text>
      <text x="35" y="84" fill="#E08585" font-size="13" font-weight="700" text-anchor="middle">−</text>
    </svg>`;
  }

  function updateResults() {
    app.querySelector('[data-res="solved"]').textContent = problem() ? "—" : resultValue();
    app.querySelector('[data-res="detail"]').textContent = detailLine();
    app.querySelector('[data-res="err"]').textContent = problem();
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, state.mode === "kcl" ? "Currents at a node sum to zero" : "Voltages around a loop sum to zero")}

      <div class="diagram-box" style="padding:6px 10px;">${diagram()}</div>

      ${pillRow([["kcl", "KCL — current"], ["kvl", "KVL — voltage"]], state.mode, domain.bg)}

      <div class="section-label split" style="color:#8FC1F5">
        <span>Known terms</span>
        <button class="label-btn" id="kl-add" ${state.rows.length >= KL_MAX ? "disabled" : ""}>+ add</button>
        <span aria-hidden="true"></span>
      </div>
      <div class="r-list">${rowsHTML()}</div>
      <div class="error-text" data-res="err">${problem()}</div>

      <div class="section-label" style="color:#5DCAA5">Result</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">Missing ${state.mode === "kcl" ? "current" : "voltage"} (${unknownLabel()})</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="solved">${problem() ? "—" : resultValue()}</span>
        </div>
        <div class="result-sub" data-res="detail">${detailLine()}</div>
      </div>

      ${formulaSection(
        state.mode === "kcl"
          ? ["ΣIin = ΣIout", "or equivalently: ΣI = 0"]
          : ["ΣV = 0 around any closed loop"],
        state.mode === "kcl"
          ? "Charge can't pile up at a node — whatever current arrives has to leave somewhere. + is a term flowing in, − a term flowing out."
          : "Energy gained going around a loop and back to the start has to equal energy lost — the signed sum of every rise and drop is zero. + is a rise, − a drop."
      )}
      ${calcFooter()}
    `;

    wireCalc(favId, paint, (v) => { state.mode = v; resetRows(); paint(); });

    app.querySelectorAll("input[data-row]").forEach(input => {
      input.oninput = () => {
        state.rows[input.dataset.row].value = parseFloat(input.value);
        updateResults();
      };
    });
    app.querySelectorAll("select[data-unit]").forEach(select => {
      select.onchange = () => { state.rows[select.dataset.unit].unit = select.value; updateResults(); };
    });
    app.querySelectorAll("[data-sign]").forEach(btn => {
      btn.onclick = () => {
        state.rows[btn.dataset.sign].sign *= -1;
        paint();
      };
    });
    app.querySelectorAll("[data-drop]").forEach(btn => {
      btn.onclick = () => {
        if (state.rows.length <= 2) return;
        state.rows.splice(+btn.dataset.drop, 1);
        paint();
      };
    });
    document.getElementById("kl-add").onclick = () => {
      if (state.rows.length >= KL_MAX) return;
      const unit = state.mode === "kcl" ? "A" : "V";
      state.rows.push({ value: 1, unit, sign: 1 });
      paint();
    };
  }

  paint();
}

// ---------- Formula search ----------
// The safety net for everything that isn't a full calculator yet: a topic,
// its formula, and a one-line note, findable by name or by the formula
// itself. When a real calculator later exists for the same tool name, the
// card links straight to it — this list and the navigation tree are separate
// data, joined only by that name match at render time.
function findRouteForTool(name) {
  for (const d of DOMAINS) {
    for (let si = 0; si < d.sections.length; si++) {
      const sec = d.sections[si];
      for (let ti = 0; ti < sec.tools.length; ti++) {
        if (sec.tools[ti].name === name && sec.tools[ti].calc) {
          return `/tool/${encodeURIComponent(`${d.id}:${si}:${ti}`)}/${sec.tools[ti].calc}`;
        }
      }
    }
  }
  return null;
}

function renderFormulaSearch(domain, tool, favId) {
  function card(f) {
    const route = findRouteForTool(f.tool);
    const d = DOMAINS.find(x => x.id === f.domain);
    const inner = `
      <div class="formula-card-head">
        <span class="formula-card-title">${f.tool}</span>
        ${route ? `<span class="formula-card-go">Open ${ICONS.chevronRight}</span>` : ""}
      </div>
      ${d ? `<div class="breadcrumb">${d.title}</div>` : ""}
      ${f.formulas.map(x => `<div class="formula-line">${x}</div>`).join("")}
      <div class="formula-card-note">${f.note}</div>`;
    return route
      ? `<button class="formula-card" onclick="location.hash='${route}'">${inner}</button>`
      : `<div class="formula-card formula-card--static">${inner}</div>`;
  }

  // The full list on open, filtered as you type, and back to the full list on
  // clearing — with only a few dozen entries, browsing is as useful as
  // searching, so nothing here waits for a query the way the global Search
  // screen does.
  function renderList(list, emptyQuery) {
    const results = document.getElementById("fs-results");
    results.innerHTML = list.length
      ? list.map(card).join("")
      : `<div class="placeholder">${ICONS.search}<div>No formula for "${emptyQuery}" yet.</div><div style="font-size:12px;margin-top:6px;">Still growing — most topics don't have an entry here yet.</div></div>`;
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, `${FORMULAS.length} formulas so far`)}

      <div class="search-box">
        ${ICONS.search}
        <input id="fs-input" type="text" placeholder="Search a topic or a formula" autocapitalize="off" spellcheck="false" />
      </div>
      <div id="fs-results"></div>
      ${tabbarHTML("")}
    `;

    document.getElementById("fav-btn").onclick = () => { toggleFavorite(favId); paint(); };

    const input = document.getElementById("fs-input");
    renderList(FORMULAS, "");
    input.oninput = () => {
      const q = input.value;
      renderList(q.trim() ? searchFormulas(q) : FORMULAS, q);
    };
    // No autofocus: focusing pops the keyboard immediately and covers the list
    // this screen exists to let you browse before you type anything.
  }

  paint();
}

// ---------- SI prefix converter ----------
// Every prefix is exactly ×1000 from its neighbor (p → n → µ → m → base → k →
// M → G → T), so one entered value converts to all of them by dividing the
// same base quantity by each prefix's own scale — no per-pair formula needed.
const SI_PREFIXES = [
  ["T", "tera", 1e12], ["G", "giga", 1e9], ["M", "mega", 1e6], ["k", "kilo", 1e3],
  ["", "base", 1], ["m", "milli", 1e-3], ["µ", "micro", 1e-6], ["n", "nano", 1e-9], ["p", "pico", 1e-12],
];

function renderSiPrefixConverter(domain, tool, favId) {
  const state = { value: 1, prefix: "" };

  function fmtCell(v) {
    if (!isFinite(v)) return "—";
    if (v === 0) return "0";
    const abs = Math.abs(v);
    if (abs >= 1e6 || abs < 1e-3) return v.toExponential(3);
    return Number(v.toPrecision(6)).toString();
  }

  function baseValue() {
    const scale = SI_PREFIXES.find(([p]) => p === state.prefix)[2];
    return state.value * scale;
  }

  function table() {
    const base = baseValue();
    return SI_PREFIXES.map(([p, name, scale]) => `
      <div class="eseries-cell${p === state.prefix ? " hit" : ""}">
        <div style="font-weight:600;">${p || "—"}</div>
        <div style="font-size:10.5px;color:var(--text-muted);">${name}</div>
        <div>${fmtCell(base / scale)}</div>
      </div>`).join("");
  }

  function refresh() {
    document.querySelector('[data-res="grid"]').innerHTML = table();
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, "pico to tera, one value at a time")}

      <div class="section-label" style="color:#8FC1F5">Value</div>
      <div class="field">
        <label>Enter a value</label>
        <div class="field-row">
          <input id="si-value" type="number" inputmode="decimal" step="any" value="${state.value}" />
          <select id="si-prefix">${SI_PREFIXES.map(([p, name]) => `<option value="${p}" ${state.prefix === p ? "selected" : ""}>${p || "(none)"} — ${name}</option>`).join("")}</select>
        </div>
      </div>

      <div class="section-label" style="color:#5DCAA5">Every prefix</div>
      <div class="eseries-grid" data-res="grid">${table()}</div>

      ${formulaSection(
        ["value × prefix multiplier = value in base units", "T=10¹², G=10⁹, M=10⁶, k=10³, m=10⁻³, µ=10⁻⁶, n=10⁻⁹, p=10⁻¹²"],
        "Each step up or down the ladder is ×1000 — the same steps a multimeter range or a datasheet spec uses."
      )}
      ${calcFooter("")}
    `;

    wireCalc(favId, paint);

    const valField = document.getElementById("si-value");
    const prefField = document.getElementById("si-prefix");
    valField.oninput = () => {
      const v = parseFloat(valField.value);
      if (isFinite(v)) { state.value = v; refresh(); }
    };
    prefField.onchange = () => { state.prefix = prefField.value; refresh(); };
  }

  paint();
}

// ---------- Scientific ↔ engineering notation ----------
// Scientific keeps the mantissa in [1, 10) — one digit before the point,
// exponent free to land anywhere. Engineering restricts the exponent to
// multiples of 3, at the cost of a mantissa in [1, 1000) — the trade that
// makes the exponent line up with an SI prefix every time.
const EXP_PREFIX = { "12": "tera (T)", "9": "giga (G)", "6": "mega (M)", "3": "kilo (k)", "0": "base unit", "-3": "milli (m)", "-6": "micro (µ)", "-9": "nano (n)", "-12": "pico (p)" };

function superscript(n) {
  const map = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  return String(n).split("").map(c => map[c] ?? c).join("");
}

function splitNotation(v, step) {
  if (v === 0) return { mantissa: 0, exp: 0 };
  const sign = v < 0 ? -1 : 1;
  const abs = Math.abs(v);
  let exp = Math.floor(Math.log10(abs) / step) * step;
  let mantissa = abs / Math.pow(10, exp);
  // log10 rounding can land the mantissa just outside its band (e.g. 999.9999997
  // instead of 1000) — nudge the exponent rather than print an out-of-band digit.
  const band = Math.pow(10, step);
  if (mantissa >= band) { exp += step; mantissa /= band; }
  if (mantissa < 1) { exp -= step; mantissa *= band; }
  return { mantissa: sign * mantissa, exp };
}

function fmtMantissa(m) {
  return Number(m.toPrecision(6)).toString();
}

function renderSciEngNotation(domain, tool, favId) {
  const state = { value: 47000 };

  function results() {
    const sci = splitNotation(state.value, 1);
    const eng = splitNotation(state.value, 3);
    return { sci, eng };
  }

  function refresh() {
    const { sci, eng } = results();
    app.querySelector('[data-res="sci"]').textContent = `${fmtMantissa(sci.mantissa)} × 10${superscript(sci.exp)}`;
    app.querySelector('[data-res="eng"]').textContent = `${fmtMantissa(eng.mantissa)} × 10${superscript(eng.exp)}`;
    app.querySelector('[data-res="eng-prefix"]').textContent = EXP_PREFIX[String(eng.exp)] ?? "outside the p–T prefix range";
  }

  function paint() {
    const { sci, eng } = results();

    app.innerHTML = `
      ${calcHeader(tool, favId, "a × 10ⁿ, two ways")}

      <div class="section-label" style="color:#8FC1F5">Value</div>
      <div class="field">
        <label>Enter a value</label>
        <input id="se-value" type="number" inputmode="decimal" step="any" value="${state.value}" />
      </div>

      <div class="section-label" style="color:#5DCAA5">Scientific notation</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">1 ≤ mantissa &lt; 10</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="sci">${fmtMantissa(sci.mantissa)} × 10${superscript(sci.exp)}</span>
        </div>
      </div>

      <div class="section-label" style="color:#5DCAA5">Engineering notation</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">exponent is a multiple of 3</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value">
          <span class="num" data-res="eng">${fmtMantissa(eng.mantissa)} × 10${superscript(eng.exp)}</span>
        </div>
        <div class="result-sub" data-res="eng-prefix">${EXP_PREFIX[String(eng.exp)] ?? "outside the p–T prefix range"}</div>
      </div>

      ${formulaSection(
        ["Scientific: v = m × 10ⁿ, 1 ≤ |m| < 10", "Engineering: v = m × 10ⁿ, 1 ≤ |m| < 1000, n a multiple of 3"],
        "Engineering notation trades a wider mantissa range for an exponent that always matches an SI prefix, which is why datasheets and multimeters use it instead of scientific notation."
      )}
      ${calcFooter("")}
    `;

    wireCalc(favId, paint);

    const field = document.getElementById("se-value");
    field.oninput = () => {
      const v = parseFloat(field.value);
      if (isFinite(v)) { state.value = v; refresh(); }
    };
  }

  paint();
}

// ---------- Percent tolerance / error ----------
// Two related but distinct questions share this screen: "what range can a
// toleranced part actually land in" (no measurement involved, just a spec)
// vs. "how far off was this measurement" (a real reading compared to a known
// true value). Same shape of arithmetic, different meaning, so a mode toggle
// rather than one generic screen keeps the labels honest about which is which.
function fmtPlain(n) {
  if (!isFinite(n)) return "—";
  return Number(n.toPrecision(6)).toString();
}

function renderPercentTolerance(domain, tool, favId) {
  const state = { mode: "tol", nominal: 100, tol: 5, measured: 98, expected: 100 };

  function computeTol() {
    const delta = state.nominal * (state.tol / 100);
    return { min: state.nominal - delta, max: state.nominal + delta, delta };
  }

  function computeErr() {
    const diff = state.measured - state.expected;
    const pct = state.expected !== 0 ? (diff / state.expected) * 100 : NaN;
    return { diff, pct };
  }

  function refresh() {
    if (state.mode === "tol") {
      const r = computeTol();
      app.querySelector('[data-res="range"]').textContent = `${fmtPlain(r.min)} – ${fmtPlain(r.max)}`;
      app.querySelector('[data-res="delta"]').textContent = `± ${fmtPlain(r.delta)}`;
    } else {
      const r = computeErr();
      app.querySelector('[data-res="pct"]').textContent = isFinite(r.pct) ? `${fmtPlain(r.pct)} %` : "—";
      app.querySelector('[data-res="diff"]').textContent = `Δ ${fmtPlain(r.diff)}`;
    }
  }

  function fieldsHTML() {
    if (state.mode === "tol") {
      return `
        <div class="section-label" style="color:#8FC1F5">Nominal value & tolerance</div>
        <div class="field">
          <label>Nominal value</label>
          <input id="pt-nominal" type="number" inputmode="decimal" step="any" value="${state.nominal}" />
        </div>
        <div class="field">
          <label>Tolerance (%)</label>
          <input id="pt-tol" type="number" inputmode="decimal" step="any" value="${state.tol}" />
        </div>`;
    }
    return `
      <div class="section-label" style="color:#8FC1F5">Measured vs expected</div>
      <div class="field">
        <label>Measured value</label>
        <input id="pt-measured" type="number" inputmode="decimal" step="any" value="${state.measured}" />
      </div>
      <div class="field">
        <label>Expected (true) value</label>
        <input id="pt-expected" type="number" inputmode="decimal" step="any" value="${state.expected}" />
      </div>`;
  }

  function resultsHTML() {
    if (state.mode === "tol") {
      const r = computeTol();
      return `
        <div class="section-label" style="color:#5DCAA5">Range</div>
        <div class="result-field">
          <div class="result-head">
            <span class="label">min – max</span>
            <span class="badge-calc">${ICONS.bolt2}Calculated</span>
          </div>
          <div class="result-value"><span class="num" data-res="range">${fmtPlain(r.min)} – ${fmtPlain(r.max)}</span></div>
          <div class="result-sub" data-res="delta">± ${fmtPlain(r.delta)}</div>
        </div>`;
    }
    const r = computeErr();
    return `
      <div class="section-label" style="color:#5DCAA5">Percent error</div>
      <div class="result-field">
        <div class="result-head">
          <span class="label">(measured − expected) / expected</span>
          <span class="badge-calc">${ICONS.bolt2}Calculated</span>
        </div>
        <div class="result-value"><span class="num" data-res="pct">${isFinite(r.pct) ? `${fmtPlain(r.pct)} %` : "—"}</span></div>
        <div class="result-sub" data-res="diff">Δ ${fmtPlain(r.diff)}</div>
      </div>`;
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, state.mode === "tol" ? "Range from a nominal value ± tolerance" : "How far a reading is from expected")}

      ${pillRow([["tol", "Tolerance range"], ["err", "Percent error"]], state.mode, domain.bg)}

      ${fieldsHTML()}
      ${resultsHTML()}

      ${formulaSection(
        state.mode === "tol"
          ? ["min = nominal × (1 − tol/100)", "max = nominal × (1 + tol/100)"]
          : ["% error = (measured − expected) / expected × 100"],
        state.mode === "tol"
          ? "A component's tolerance is the manufacturer's guaranteed worst case, not a typical spread — a 5% resistor can land anywhere in that band."
          : "Percent error is signed: positive means the measurement read high, negative means it read low."
      )}
      ${calcFooter("")}
    `;

    wireCalc(favId, paint, (m) => { state.mode = m; paint(); });

    if (state.mode === "tol") {
      document.getElementById("pt-nominal").oninput = (e) => { const v = parseFloat(e.target.value); if (isFinite(v)) { state.nominal = v; refresh(); } };
      document.getElementById("pt-tol").oninput = (e) => { const v = parseFloat(e.target.value); if (isFinite(v)) { state.tol = v; refresh(); } };
    } else {
      document.getElementById("pt-measured").oninput = (e) => { const v = parseFloat(e.target.value); if (isFinite(v)) { state.measured = v; refresh(); } };
      document.getElementById("pt-expected").oninput = (e) => { const v = parseFloat(e.target.value); if (isFinite(v)) { state.expected = v; refresh(); } };
    }
  }

  paint();
}

// ---------- Basic calculator ----------
// Expression-based rather than "evaluate immediately on each key press":
// keys build a text expression, tokenized and parsed only when "=" is
// pressed. That's what real parentheses require — grouping is meaningless
// without operator precedence to group against, so adding "(" and ")" meant
// trading the old chained left-to-right model for a real (if small)
// recursive-descent parser. One consequence worth knowing: "6+3×2" now
// evaluates to 12 (standard precedence), not 18 (old left-to-right
// chaining) — every calculator with real parentheses works this way, only
// bare four-function calculators chain naively.
function calcTokenize(s) {
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      tokens.push({ type: "num", value: parseFloat(s.slice(i, j)) });
      i = j;
    } else if (/[a-zA-Z]/.test(c)) {
      // Identifiers may trail digits ("log2") once they've started with a
      // letter — a leading digit is still parsed as a number, so "2π" stays
      // implicit multiplication rather than becoming one run-on identifier.
      let j = i + 1;
      while (j < s.length && /[a-zA-Z0-9]/.test(s[j])) j++;
      tokens.push({ type: "ident", value: s.slice(i, j).toLowerCase() });
      i = j;
    } else if (c === "π") {
      tokens.push({ type: "num", value: Math.PI });
      i++;
    } else if ("+-×÷^".includes(c)) {
      tokens.push({ type: "op", value: c });
      i++;
    } else if (c === "(") {
      tokens.push({ type: "lparen" });
      i++;
    } else if (c === ")") {
      tokens.push({ type: "rparen" });
      i++;
    } else {
      i++;
    }
  }
  return tokens;
}

const CALC_FN = {
  sin: (v, deg) => Math.sin(deg ? (v * Math.PI) / 180 : v),
  cos: (v, deg) => Math.cos(deg ? (v * Math.PI) / 180 : v),
  tan: (v, deg) => Math.tan(deg ? (v * Math.PI) / 180 : v),
  log: (v) => Math.log10(v),
  ln: (v) => Math.log(v),
  sqrt: (v) => Math.sqrt(v),
  exp: (v) => Math.exp(v),
};

// Standard precedence: + - loosest, then × ÷ (which also absorb "implicit"
// multiplication — "2(3+4)" and "2π" both need to parse without an explicit
// × between the factors), then ^ (right-associative), then unary minus.
function calcParse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const canStartFactor = (t) => !!t && (t.type === "num" || t.type === "lparen" || t.type === "ident");

  function parseExpression() {
    let node = parseTerm();
    while (peek() && peek().type === "op" && (peek().value === "+" || peek().value === "-")) {
      const op = next().value;
      node = { op, left: node, right: parseTerm() };
    }
    return node;
  }

  function parseTerm() {
    let node = parsePower();
    while (peek() && ((peek().type === "op" && (peek().value === "×" || peek().value === "÷")) || canStartFactor(peek()))) {
      const op = peek().type === "op" ? next().value : "×";
      node = { op, left: node, right: parsePower() };
    }
    return node;
  }

  function parsePower() {
    const base = parseUnary();
    if (peek() && peek().type === "op" && peek().value === "^") {
      next();
      return { op: "^", left: base, right: parsePower() };
    }
    return base;
  }

  function parseUnary() {
    if (peek() && peek().type === "op" && peek().value === "-") {
      next();
      return { op: "neg", arg: parseUnary() };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const tok = peek();
    if (!tok) throw new Error("unexpected end");
    if (tok.type === "num") { next(); return { op: "num", value: tok.value }; }
    if (tok.type === "lparen") {
      next();
      const node = parseExpression();
      if (peek() && peek().type === "rparen") next();
      return node;
    }
    if (tok.type === "ident") {
      next();
      if (tok.value === "e") return { op: "num", value: Math.E };
      if (peek() && peek().type === "lparen") {
        next();
        const arg = parseExpression();
        if (peek() && peek().type === "rparen") next();
        return { op: "fn", fn: tok.value, arg };
      }
      throw new Error("unknown identifier");
    }
    throw new Error("unexpected token");
  }

  const result = parseExpression();
  if (pos !== tokens.length) throw new Error("trailing tokens");
  return result;
}

function calcEval(node, deg) {
  if (node.op === "num") return node.value;
  if (node.op === "neg") return -calcEval(node.arg, deg);
  if (node.op === "fn") {
    const fn = CALC_FN[node.fn];
    if (!fn) throw new Error("unknown function");
    return fn(calcEval(node.arg, deg), deg);
  }
  const l = calcEval(node.left, deg);
  const r = calcEval(node.right, deg);
  if (node.op === "+") return l + r;
  if (node.op === "-") return l - r;
  if (node.op === "×") return l * r;
  if (node.op === "÷") return r === 0 ? NaN : l / r;
  if (node.op === "^") return Math.pow(l, r);
  throw new Error("unknown operator");
}

function formatCalcResult(n) {
  if (!isFinite(n)) return "Error";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-9) return n.toExponential(6);
  return Number(n.toPrecision(10)).toString();
}

const CALC_OP_SYMBOL = { add: "+", subtract: "-", multiply: "×", divide: "÷", power: "^" };

function renderBasicCalculator(domain, tool, favId) {
  const state = { expr: "0", justEvaluated: false, mode: "basic", angle: "deg" };

  function updateDisplay() {
    document.querySelector('[data-res="display"]').textContent = state.expr;
  }

  function currentNumberTail() {
    const m = state.expr.match(/[0-9.]*$/);
    return m ? m[0] : "";
  }

  function inputDigit(d) {
    if (state.justEvaluated) { state.expr = d; state.justEvaluated = false; return; }
    state.expr = state.expr === "0" ? d : state.expr + d;
  }

  function inputDecimal() {
    if (state.justEvaluated) { state.expr = "0."; state.justEvaluated = false; return; }
    const tail = currentNumberTail();
    if (tail.includes(".")) return;
    state.expr += tail === "" ? "0." : ".";
  }

  function clearAll() {
    state.expr = "0";
    state.justEvaluated = false;
  }

  function backspace() {
    state.expr = state.expr.length > 1 ? state.expr.slice(0, -1) : "0";
  }

  function openParen() {
    if (state.justEvaluated) { state.expr = "("; state.justEvaluated = false; return; }
    state.expr = state.expr === "0" ? "(" : state.expr + "(";
  }

  function closeParen() {
    const opens = (state.expr.match(/\(/g) || []).length;
    const closes = (state.expr.match(/\)/g) || []).length;
    if (opens > closes) state.expr += ")";
  }

  function appendRaw(text) {
    state.expr = state.expr === "0" ? text : state.expr + text;
  }

  function insertFunction(name) {
    appendRaw(`${name}(`);
  }

  function appendOperator(sym) {
    if (state.expr === "0") {
      if (sym === "-") state.expr = "-";
      return;
    }
    const last = state.expr.slice(-1);
    const isOp = (ch) => "+-×÷^".includes(ch);
    if (isOp(last) && !(sym === "-" && "×÷^(".includes(last))) {
      state.expr = state.expr.slice(0, -1) + sym;
    } else {
      state.expr += sym;
    }
  }

  function toggleSign() {
    if (state.expr.startsWith("-(") && state.expr.endsWith(")")) {
      state.expr = state.expr.slice(2, -1);
    } else {
      state.expr = `-(${state.expr})`;
    }
  }

  function inputPercent() {
    state.expr = `(${state.expr})÷100`;
  }

  function applyReciprocal() {
    state.expr = `1÷(${state.expr})`;
  }

  function equals() {
    try {
      const tokens = calcTokenize(state.expr);
      if (!tokens.length) return;
      const result = calcEval(calcParse(tokens), state.angle === "deg");
      state.expr = formatCalcResult(result);
    } catch (err) {
      state.expr = "Error";
    }
    state.justEvaluated = true;
  }

  function press(key) {
    // The angle-mode toggle changes a key's own label (DEG ↔ RAD), which a
    // display-only update can't reach — it needs the keypad re-drawn.
    if (key === "toggle-angle") { state.angle = state.angle === "deg" ? "rad" : "deg"; paint(); return; }
    // A leftover "Error" is text, not a number — anything but Clear should
    // discard it first rather than edit it character by character.
    if (state.expr === "Error" && key !== "clear") clearAll();

    if (/^[0-9]$/.test(key)) { inputDigit(key); updateDisplay(); return; }
    if (key === "decimal") { inputDecimal(); updateDisplay(); return; }
    if (key === "open") { openParen(); updateDisplay(); return; }

    state.justEvaluated = false;
    if (key === "clear") clearAll();
    else if (key === "backspace") backspace();
    else if (key === "close") closeParen();
    else if (key === "sign") toggleSign();
    else if (key === "percent") inputPercent();
    else if (key === "square") state.expr += "^2";
    else if (key === "reciprocal") applyReciprocal();
    else if (key === "pi") appendRaw("π");
    else if (key === "e") appendRaw("e");
    else if (key === "pow10") appendRaw("10^(");
    else if (key in CALC_FN) insertFunction(key);
    else if (key in CALC_OP_SYMBOL) appendOperator(CALC_OP_SYMBOL[key]);
    else if (key === "equals") equals();
    updateDisplay();
  }

  // Keydown isn't scoped to the keypad's own DOM the way a click listener is,
  // so it can't rely on paint() replacing app.innerHTML to clean it up when
  // the user navigates away. It cleans itself up instead: once the display
  // element it looks for is gone, it removes itself on the next keystroke.
  function onKeyDown(e) {
    if (!document.querySelector('[data-res="display"]')) { window.removeEventListener("keydown", onKeyDown); return; }
    const map = {
      "0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
      ".": "decimal", "+": "add", "-": "subtract", "*": "multiply", "/": "divide", "^": "power",
      "(": "open", ")": "close", "Enter": "equals", "=": "equals", "Backspace": "backspace",
      "Escape": "clear", "Delete": "clear", "%": "percent",
    };
    const key = map[e.key];
    if (!key) return;
    e.preventDefault();
    press(key);
  }
  window.addEventListener("keydown", onKeyDown);

  // Matches the iPhone's own Calculator app: Standard carries no parentheses
  // or power key at all — those, along with backspace, only showed up here
  // because this screen used to be the only mode. Now that Scientific mode
  // exists to hold them, Standard goes back to exactly what the real app
  // ships: ⌫ C % ÷ / 7 8 9 × / 4 5 6 − / 1 2 3 + / ± 0 . =.
  const BASE_KEYS = [
    ["backspace", "⌫", "fn"], ["clear", "C", "fn"], ["percent", "%", "fn"], ["divide", "÷", "op"],
    ["7", "7"], ["8", "8"], ["9", "9"], ["multiply", "×", "op"],
    ["4", "4"], ["5", "5"], ["6", "6"], ["subtract", "−", "op"],
    ["1", "1"], ["2", "2"], ["3", "3"], ["add", "+", "op"],
    ["sign", "±", "fn"], ["0", "0"], ["decimal", ".", ""], ["equals", "=", "op"],
  ];

  // The parentheses and power operator that Standard no longer carries live
  // here instead, alongside trig, logs and the constants that show up
  // constantly in electronics math (reactance angles, RC time constants).
  // Ordered to track the iPhone's own Scientific layout row by row — reading
  // its six-column rows left to right and keeping only the functions this
  // screen actually has, the sequence is: ( ) · x² xʸ eˣ 10ˣ · 1/x √ ln log ·
  // sin cos tan e · π Deg. That's also why Deg/Rad ends up last: the photo
  // puts it at the end of its own last row too.
  function sciKeys() {
    return [
      ["open", "(", "fn"], ["close", ")", "fn"], ["square", "x²", "fn"], ["power", "xʸ", "fn"],
      ["exp", "eˣ", "fn"], ["pow10", "10ˣ", "fn"], ["reciprocal", "1/x", "fn"], ["sqrt", "√", "fn"],
      ["ln", "ln", "fn"], ["log", "log", "fn"], ["sin", "sin", "fn"], ["cos", "cos", "fn"],
      ["tan", "tan", "fn"], ["e", "e", "fn"], ["pi", "π", "fn"], ["toggle-angle", state.angle === "deg" ? "DEG" : "RAD", "fn"],
    ];
  }

  function keyBtn([key, label, kind]) {
    return `<button class="calc-key${kind ? ` calc-key--${kind}` : ""}" data-key="${key}">${label}</button>`;
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, "")}

      ${pillRow([["basic", "Standard"], ["sci", "Scientific"]], state.mode, domain.bg)}

      <div class="calc-display">
        <div class="calc-display-value" data-res="display">${state.expr}</div>
      </div>
      <div id="calc-keypad">
        ${state.mode === "sci" ? `<div class="calc-keypad" style="margin-bottom:8px;">${sciKeys().map(keyBtn).join("")}</div>` : ""}
        <div class="calc-keypad">${BASE_KEYS.map(keyBtn).join("")}</div>
      </div>

      ${calcFooter("")}
    `;

    wireCalc(favId, paint, (m) => { state.mode = m; paint(); });
    document.getElementById("calc-keypad").addEventListener("click", (e) => {
      const btn = e.target.closest(".calc-key");
      if (btn) press(btn.dataset.key);
    });
  }

  paint();
}

// ---------- Physical constants ----------
// A browsable reference, same shape as Formula search: full list on open,
// filtered as you type. Values reuse the scientific-notation formatting
// built for the sci/eng calculator (splitNotation/fmtMantissa/superscript)
// rather than SI prefixes — several of these constants are far outside the
// pico-to-tera range a prefix can name (Planck's constant is 10⁻³⁴).
// Kept to entries an electronics app actually reaches for — general-physics
// constants with no circuit-design use (gravitational constant, standard
// gravity, Avogadro's number, the molar gas constant, proton mass) were cut
// in favor of ones that show up in real component/device equations.
const PHYSICAL_CONSTANTS = [
  { symbol: "c", name: "Speed of light in vacuum", value: 299792458, unit: "m/s", note: "Exact by definition since 1983." },
  { symbol: "e", name: "Elementary charge", value: 1.602176634e-19, unit: "C", note: "Magnitude of the charge on a single electron." },
  { symbol: "eV", name: "Electronvolt", value: 1.602176634e-19, unit: "J", note: "Numerically identical to e in coulombs — no coincidence: 1 eV is defined as e × 1 volt. Common energy unit in semiconductor and photonics work." },
  { symbol: "h", name: "Planck constant", value: 6.62607015e-34, unit: "J·s", note: "Relates a photon's energy to its frequency: E = hf." },
  { symbol: "ħ", name: "Reduced Planck constant", value: 1.054571817e-34, unit: "J·s", note: "h / 2π." },
  { symbol: "k", name: "Boltzmann constant", value: 1.380649e-23, unit: "J/K", note: "Relates temperature to thermal noise power and energy per particle." },
  { symbol: "Vₜ", name: "Thermal voltage (at 300 K)", value: 0.025852, unit: "V", note: "kT/q — appears in the diode and BJT equations (the Shockley equation). Unlike the rest of this list it scales with temperature; this is the 300 K value." },
  { symbol: "ε₀", name: "Vacuum permittivity", value: 8.8541878128e-12, unit: "F/m", note: "Sets the capacitance of free space; appears in Coulomb's law." },
  { symbol: "μ₀", name: "Vacuum permeability", value: 1.25663706212e-6, unit: "N/A²", note: "Sets the inductance of free space; appears in the Biot–Savart law." },
  { symbol: "Z₀", name: "Impedance of free space", value: 376.730313668, unit: "Ω", note: "√(μ₀ / ε₀) — the E/H field ratio in a plane wave, central to antenna theory." },
  { symbol: "F", name: "Faraday constant", value: 96485.33212, unit: "C/mol", note: "Charge per mole of electrons — used in battery and electrochemical-cell capacity calculations." },
  { symbol: "mₑ", name: "Electron mass", value: 9.1093837015e-31, unit: "kg", note: "Used in semiconductor carrier-mobility and effective-mass calculations." },
  { symbol: "Eg(Si)", name: "Silicon bandgap energy", value: 1.12, unit: "eV", note: "Room-temperature (300 K) bandgap of silicon; sets the forward-voltage floor of silicon diodes and BJTs." },
  { symbol: "σ", name: "Stefan–Boltzmann constant", value: 5.670374419e-8, unit: "W/(m²·K⁴)", note: "Total blackbody radiant power per unit area — relevant to heat-sink and thermal-management calculations." },
];

function formatConstantValue(v) {
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e5 || abs < 1e-3) {
    const { mantissa, exp } = splitNotation(v, 1);
    return `${fmtMantissa(mantissa)} × 10${superscript(exp)}`;
  }
  return Number(v.toPrecision(10)).toString();
}

function renderPhysicalConstants(domain, tool, favId) {
  function card(c) {
    return `
      <div class="formula-card formula-card--static">
        <div class="formula-card-head">
          <span class="formula-card-title">${c.symbol} — ${c.name}</span>
        </div>
        <div class="formula-line">${formatConstantValue(c.value)} ${c.unit}</div>
        ${c.note ? `<div class="formula-card-note">${c.note}</div>` : ""}
      </div>`;
  }

  function matches(c, q) {
    return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
  }

  function renderList(list, emptyQuery) {
    const results = document.getElementById("pc-results");
    results.innerHTML = list.length
      ? list.map(card).join("")
      : `<div class="placeholder">${ICONS.search}<div>No constant for "${emptyQuery}".</div></div>`;
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, `${PHYSICAL_CONSTANTS.length} constants`)}

      <div class="search-box">
        ${ICONS.search}
        <input id="pc-input" type="text" placeholder="Search a constant" autocapitalize="off" spellcheck="false" />
      </div>
      <div id="pc-results"></div>
      ${tabbarHTML("")}
    `;

    document.getElementById("fav-btn").onclick = () => { toggleFavorite(favId); paint(); };

    const input = document.getElementById("pc-input");
    renderList(PHYSICAL_CONSTANTS, "");
    input.oninput = () => {
      const q = input.value.trim().toLowerCase();
      renderList(q ? PHYSICAL_CONSTANTS.filter((c) => matches(c, q)) : PHYSICAL_CONSTANTS, q);
    };
  }

  paint();
}

// ---------- SI units ----------
// Same browsable-reference shape as Physical constants. The seven base units
// are here as the foundation the electrical ones are built from — a volt is
// only "kg·m²·s⁻³·A⁻¹" if you know what kg, m, s and A are — but the real
// content is the eleven derived units electronics actually runs on. Purely
// mechanical derived units (newton, pascal) are left out on the same
// electronics-only basis the physical-constants trim used.
const SI_UNITS = [
  { symbol: "m", name: "Metre", quantity: "Length", definition: "SI base unit", note: "Defined by fixing the speed of light c." },
  { symbol: "kg", name: "Kilogram", quantity: "Mass", definition: "SI base unit", note: "Defined by fixing the Planck constant h." },
  { symbol: "s", name: "Second", quantity: "Time", definition: "SI base unit", note: "Defined by a fixed number of caesium-133 hyperfine transitions." },
  { symbol: "A", name: "Ampere", quantity: "Electric current", definition: "SI base unit", note: "Defined by fixing the elementary charge e — the base unit every electrical unit below is ultimately built from." },
  { symbol: "K", name: "Kelvin", quantity: "Thermodynamic temperature", definition: "SI base unit", note: "Defined by fixing the Boltzmann constant k." },
  { symbol: "mol", name: "Mole", quantity: "Amount of substance", definition: "SI base unit", note: "Defined by fixing the Avogadro constant." },
  { symbol: "cd", name: "Candela", quantity: "Luminous intensity", definition: "SI base unit", note: "Rarely used directly in circuit work; relevant mainly to LED photometry." },
  { symbol: "Hz", name: "Hertz", quantity: "Frequency", definition: "s⁻¹", note: "Cycles per second — clock speeds, signal frequency, sample rates." },
  { symbol: "J", name: "Joule", quantity: "Energy", definition: "kg·m²·s⁻²", note: "= 1 W·s. Battery capacity in watt-hours is a scaled joule." },
  { symbol: "W", name: "Watt", quantity: "Power", definition: "kg·m²·s⁻³", note: "= 1 J/s = 1 V·A. Power dissipation, ratings, and P = VI all live here." },
  { symbol: "C", name: "Coulomb", quantity: "Electric charge", definition: "A·s", note: "= 1 A for 1 s. Battery capacity in amp-hours is a scaled coulomb." },
  { symbol: "V", name: "Volt", quantity: "Electric potential", definition: "kg·m²·s⁻³·A⁻¹", note: "= 1 W/A = 1 J/C." },
  { symbol: "F", name: "Farad", quantity: "Capacitance", definition: "s⁴·A²·kg⁻¹·m⁻²", note: "= 1 C/V. A real 1 F capacitor is enormous — µF, nF and pF are the everyday sizes." },
  { symbol: "Ω", name: "Ohm", quantity: "Electrical resistance", definition: "kg·m²·s⁻³·A⁻²", note: "= 1 V/A." },
  { symbol: "S", name: "Siemens", quantity: "Electrical conductance", definition: "kg⁻¹·m⁻²·s³·A²", note: "= 1/Ω — the reciprocal of resistance." },
  { symbol: "Wb", name: "Weber", quantity: "Magnetic flux", definition: "kg·m²·s⁻²·A⁻¹", note: "= 1 V·s. Flux linkage in transformer and motor design." },
  { symbol: "T", name: "Tesla", quantity: "Magnetic flux density", definition: "kg·s⁻²·A⁻¹", note: "= 1 Wb/m². Field strength in inductor and motor design." },
  { symbol: "H", name: "Henry", quantity: "Inductance", definition: "kg·m²·s⁻²·A⁻²", note: "= 1 Wb/A = 1 V·s/A." },
];

function renderSiUnits(domain, tool, favId) {
  function card(u) {
    return `
      <div class="formula-card formula-card--static">
        <div class="formula-card-head">
          <span class="formula-card-title">${u.symbol} — ${u.name}</span>
        </div>
        <div class="breadcrumb">${u.quantity}</div>
        <div class="formula-line">${u.definition}</div>
        ${u.note ? `<div class="formula-card-note">${u.note}</div>` : ""}
      </div>`;
  }

  function matches(u, q) {
    return u.name.toLowerCase().includes(q) || u.symbol.toLowerCase().includes(q) || u.quantity.toLowerCase().includes(q);
  }

  function renderList(list, emptyQuery) {
    const results = document.getElementById("su-results");
    results.innerHTML = list.length
      ? list.map(card).join("")
      : `<div class="placeholder">${ICONS.search}<div>No unit for "${emptyQuery}".</div></div>`;
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, `${SI_UNITS.length} units`)}

      <div class="search-box">
        ${ICONS.search}
        <input id="su-input" type="text" placeholder="Search a unit or quantity" autocapitalize="off" spellcheck="false" />
      </div>
      <div id="su-results"></div>
      ${tabbarHTML("")}
    `;

    document.getElementById("fav-btn").onclick = () => { toggleFavorite(favId); paint(); };

    const input = document.getElementById("su-input");
    renderList(SI_UNITS, "");
    input.oninput = () => {
      const q = input.value.trim().toLowerCase();
      renderList(q ? SI_UNITS.filter((u) => matches(u, q)) : SI_UNITS, q);
    };
  }

  paint();
}

// ---------- DEC / HEX / BIN conversion ----------
const BASE_RADIX = { dec: 10, hex: 16, bin: 2 };
const BASE_CHARS = { dec: /[^0-9]/g, hex: /[^0-9a-fA-F]/g, bin: /[^01]/g };

// Binary reads better broken into nibbles — pad on the left so the grouping
// lines up from the right, the same way you'd read it off a byte boundary.
function groupNibbles(bin) {
  const pad = (4 - (bin.length % 4)) % 4;
  return ("0".repeat(pad) + bin).match(/.{1,4}/g).join(" ");
}

function renderDecHexBin(domain, tool, favId) {
  const state = { base: "dec", raw: "255" };

  function parsedValue() {
    if (state.raw === "") return NaN;
    return parseInt(state.raw, BASE_RADIX[state.base]);
  }

  function refresh() {
    const v = parsedValue();
    const ok = isFinite(v) && !isNaN(v);
    app.querySelector('[data-res="dec"]').textContent = ok ? v.toString(10) : "—";
    app.querySelector('[data-res="hex"]').textContent = ok ? v.toString(16).toUpperCase() : "—";
    app.querySelector('[data-res="bin"]').textContent = ok ? groupNibbles(v.toString(2)) : "—";
  }

  // Switching base re-reads the field's digits under the OLD base and
  // re-writes them in the new one, so the underlying value survives the
  // switch instead of the field just going blank or keeping stale digits.
  function switchBase(newBase) {
    const v = parsedValue();
    state.base = newBase;
    state.raw = isFinite(v) && !isNaN(v) ? v.toString(BASE_RADIX[newBase]).toUpperCase() : "";
    paint();
  }

  function paint() {
    const v = parsedValue();
    const ok = isFinite(v) && !isNaN(v);

    app.innerHTML = `
      ${calcHeader(tool, favId, "Enter a value in one base, read it in all three")}

      ${pillRow([["dec", "DEC"], ["hex", "HEX"], ["bin", "BIN"]], state.base, domain.bg)}

      <div class="field">
        <label>Value (${state.base.toUpperCase()})</label>
        <input id="dhb-value" type="text" inputmode="${state.base === "dec" ? "numeric" : "text"}" autocapitalize="characters" spellcheck="false" value="${state.raw}" />
      </div>

      <div class="section-label" style="color:#5DCAA5">Decimal</div>
      <div class="result-field">
        <div class="result-value"><span class="num" data-res="dec">${ok ? v.toString(10) : "—"}</span></div>
      </div>

      <div class="section-label" style="color:#5DCAA5">Hexadecimal</div>
      <div class="result-field">
        <div class="result-value"><span class="num" data-res="hex">${ok ? v.toString(16).toUpperCase() : "—"}</span></div>
      </div>

      <div class="section-label" style="color:#5DCAA5">Binary</div>
      <div class="result-field">
        <div class="result-value" style="font-size:22px;"><span class="num" data-res="bin">${ok ? groupNibbles(v.toString(2)) : "—"}</span></div>
      </div>

      ${formulaSection(
        ["Decimal: each digit × 10ⁿ", "Hexadecimal: each digit × 16ⁿ (a-f = 10-15)", "Binary: each digit × 2ⁿ — one hex digit is exactly 4 binary digits"],
        "Hex is really just binary written in groups of 4, which is why register and memory values are usually shown in hex rather than decimal."
      )}
      ${calcFooter("")}
    `;

    wireCalc(favId, paint, switchBase);

    const field = document.getElementById("dhb-value");
    field.oninput = () => {
      const filtered = field.value.replace(BASE_CHARS[state.base], "").toUpperCase();
      if (filtered !== field.value) field.value = filtered;
      state.raw = filtered;
      refresh();
    };
  }

  paint();
}

// ---------- ASCII table ----------
const ASCII_CONTROL_NAMES = {
  0: "NUL", 1: "SOH", 2: "STX", 3: "ETX", 4: "EOT", 5: "ENQ", 6: "ACK", 7: "BEL",
  8: "BS", 9: "TAB", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI",
  16: "DLE", 17: "DC1", 18: "DC2", 19: "DC3", 20: "DC4", 21: "NAK", 22: "SYN", 23: "ETB",
  24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS", 30: "RS", 31: "US",
  127: "DEL",
};

// Generated rather than hand-listed — 128 entries hand-typed is 128 chances
// to get a code point wrong, where String.fromCharCode can't.
function asciiEntries() {
  const rows = [];
  for (let i = 0; i <= 127; i++) {
    const printable = i >= 32 && i <= 126;
    const glyph = i === 32 ? "Space" : printable ? String.fromCharCode(i) : (ASCII_CONTROL_NAMES[i] || "?");
    rows.push({
      dec: i,
      hex: i.toString(16).toUpperCase().padStart(2, "0"),
      bin: i.toString(2).padStart(7, "0"),
      glyph,
      printable,
    });
  }
  return rows;
}
const ASCII_ENTRIES = asciiEntries();

function renderAsciiTable(domain, tool, favId) {
  function row(e) {
    return `
      <div class="ascii-row tap-select">
        <span class="ascii-dec">${e.dec}</span>
        <span class="ascii-hex">${e.hex}</span>
        <span class="ascii-bin">${e.bin}</span>
        <span class="ascii-char${e.printable ? "" : " muted"}">${e.glyph}</span>
      </div>`;
  }

  function matches(e, q) {
    return String(e.dec).includes(q) || e.hex.toLowerCase().includes(q) || e.glyph.toLowerCase().includes(q);
  }

  function renderList(list, emptyQuery) {
    const results = document.getElementById("at-results");
    results.innerHTML = list.length
      ? `<div class="ascii-row head"><span>Dec</span><span>Hex</span><span>Bin</span><span>Char</span></div>${list.map(row).join("")}`
      : `<div class="placeholder">${ICONS.search}<div>No character for "${emptyQuery}".</div></div>`;
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, "128 characters, codes 0-127")}

      <div class="search-box">
        ${ICONS.search}
        <input id="at-input" type="text" placeholder="Search a character, decimal or hex code" autocapitalize="off" spellcheck="false" />
      </div>
      <div class="ascii-list" id="at-results"></div>
      ${tabbarHTML("")}
    `;

    document.getElementById("fav-btn").onclick = () => { toggleFavorite(favId); paint(); };

    const input = document.getElementById("at-input");
    renderList(ASCII_ENTRIES, "");
    input.oninput = () => {
      const q = input.value.trim().toLowerCase();
      renderList(q ? ASCII_ENTRIES.filter((e) => matches(e, q)) : ASCII_ENTRIES, q);
    };
  }

  paint();
}

// ---------- Wire gauge (AWG/SWG) ----------
// Scope kept to gauge -> physical size on purpose: resistance and current
// capacity are their own tools further down the build queue (Cable
// resistance, Cable current capacity) and belong there, with the right
// context (temperature, insulation), not duplicated into a sizing lookup.

// AWG has a real formula — SWG never did; it was fixed by British statute
// as a table, so it's reproduced here rather than derived.
function awgLabel(n) {
  return n <= 0 ? `${1 - n}/0` : String(n);
}
function awgDiameterMm(n) {
  return 0.127 * Math.pow(92, (36 - n) / 39);
}
const AWG_SIZES = [];
for (let n = -3; n <= 40; n++) AWG_SIZES.push({ value: n, label: awgLabel(n) });

const SWG_TABLE = {
  "7/0": 12.7, "6/0": 11.786, "5/0": 10.973, "4/0": 10.16, "3/0": 9.449, "2/0": 8.837, "1/0": 8.229,
  "1": 7.62, "2": 7.01, "3": 6.401, "4": 5.893, "5": 5.385, "6": 4.877, "7": 4.470, "8": 4.064,
  "9": 3.658, "10": 3.251, "11": 2.946, "12": 2.642, "13": 2.337, "14": 2.032, "15": 1.829,
  "16": 1.626, "17": 1.422, "18": 1.219, "19": 1.016, "20": 0.914, "21": 0.813, "22": 0.711,
  "23": 0.610, "24": 0.559, "25": 0.508, "26": 0.457, "27": 0.417, "28": 0.376, "29": 0.345,
  "30": 0.315, "31": 0.295, "32": 0.274, "33": 0.254, "34": 0.234, "35": 0.213, "36": 0.193,
  "37": 0.173, "38": 0.152, "39": 0.132, "40": 0.122, "41": 0.112, "42": 0.102, "43": 0.091,
  "44": 0.081, "45": 0.071, "46": 0.061, "47": 0.051, "48": 0.041, "49": 0.031, "50": 0.025,
};
const SWG_SIZES = Object.keys(SWG_TABLE).map((label) => ({ value: label, label }));

function renderWireGauge(domain, tool, favId) {
  const state = { standard: "awg", awg: 24, swg: "24" };

  function diameterMm() {
    return state.standard === "awg" ? awgDiameterMm(state.awg) : SWG_TABLE[state.swg];
  }

  function results() {
    const d = diameterMm();
    const areaMm2 = Math.PI * (d / 2) ** 2;
    const dIn = d / 25.4;
    const circularMils = (dIn * 1000) ** 2;
    return { d, areaMm2, dIn, circularMils };
  }

  function refresh() {
    const r = results();
    app.querySelector('[data-res="dmm"]').textContent = `${trim(r.d)} mm`;
    app.querySelector('[data-res="din"]').textContent = `${Number(r.dIn.toPrecision(4))} in`;
    app.querySelector('[data-res="area"]').textContent = `${trim(r.areaMm2)} mm²`;
    app.querySelector('[data-res="cm"]').textContent = `${Math.round(r.circularMils).toLocaleString()} CM`;
  }

  function sizeOptions() {
    const sizes = state.standard === "awg" ? AWG_SIZES : SWG_SIZES;
    const current = state.standard === "awg" ? state.awg : state.swg;
    return sizes.map((s) => `<option value="${s.value}" ${String(s.value) === String(current) ? "selected" : ""}>${s.label}</option>`).join("");
  }

  function paint() {
    const r = results();
    app.innerHTML = `
      ${calcHeader(tool, favId, "Gauge number to physical wire size")}

      ${pillRow([["awg", "AWG"], ["swg", "SWG"]], state.standard, domain.bg)}

      <div class="section-label" style="color:#8FC1F5">Gauge</div>
      <div class="field">
        <label>${state.standard === "awg" ? "American Wire Gauge" : "Standard Wire Gauge (British)"}</label>
        <select id="wg-size">${sizeOptions()}</select>
      </div>

      <div class="section-label" style="color:#5DCAA5">Diameter</div>
      <div class="result-field">
        <div class="result-value"><span class="num" data-res="dmm">${trim(r.d)} mm</span></div>
        <div class="result-sub" data-res="din">${Number(r.dIn.toPrecision(4))} in</div>
      </div>

      <div class="section-label" style="color:#5DCAA5">Cross-sectional area</div>
      <div class="result-field">
        <div class="result-value"><span class="num" data-res="area">${trim(r.areaMm2)} mm²</span></div>
        <div class="result-sub" data-res="cm">${Math.round(r.circularMils).toLocaleString()} CM</div>
      </div>

      ${formulaSection(
        ["AWG: d(mm) = 0.127 × 92^((36 − n) / 39)", "SWG: fixed table, no formula (set by British statute, BS 3737)", "Area = π × (d / 2)² · Circular mils = (d in thousandths of an inch)²"],
        "Circular mils (CM) is the customary US unit for conductor size — a mil is 0.001 in, so a wire's CM rating is just its diameter in mils, squared."
      )}
      ${calcFooter("")}
    `;

    wireCalc(favId, paint, (m) => { state.standard = m; paint(); });

    document.getElementById("wg-size").onchange = (e) => {
      if (state.standard === "awg") state.awg = parseInt(e.target.value, 10);
      else state.swg = e.target.value;
      refresh();
    };
  }

  paint();
}

// ---------- Cable resistance / voltage drop ----------
// Shares the gauge tables with Wire gauge rather than redefining them —
// same underlying question (what does this gauge physically look like), so
// there is exactly one place that answer can drift out of sync.
const CABLE_RESISTIVITY = { cu: 1.68e-8, al: 2.82e-8 };

function cableDiameterMm(standard, gaugeValue) {
  return standard === "awg" ? awgDiameterMm(gaugeValue) : SWG_TABLE[gaugeValue];
}

// Length is the one-way run; real current makes a round trip through both
// conductors, so resistance and drop are computed on 2x the entered length.
function cableRoundTripResistance(standard, gaugeValue, material, lengthM) {
  const dMm = cableDiameterMm(standard, gaugeValue);
  const areaM2 = Math.PI * (dMm / 1000 / 2) ** 2;
  return (CABLE_RESISTIVITY[material] * (2 * lengthM)) / areaM2;
}

// Smallest (thinnest) gauge in the table whose diameter still meets the
// minimum — both AWG_SIZES and SWG_SIZES are already ordered thickest to
// thinnest, so the last one still meeting the minimum is the answer.
function minAdequateGauge(standard, dMinMm) {
  const sizes = standard === "awg" ? AWG_SIZES : SWG_SIZES;
  let chosen = null;
  for (const s of sizes) {
    const d = cableDiameterMm(standard, s.value);
    if (d >= dMinMm) chosen = s; else break;
  }
  return chosen;
}

function renderCableResistanceDrop(domain, tool, favId) {
  const state = {
    mode: "drop", standard: "awg", awg: 12, swg: "12", material: "cu",
    length: 10, current: 10, supplyV: 12, targetPct: 3,
  };

  function gaugeSelectHTML() {
    const sizes = state.standard === "awg" ? AWG_SIZES : SWG_SIZES;
    const current = state.standard === "awg" ? state.awg : state.swg;
    return sizes.map((s) => `<option value="${s.value}" ${String(s.value) === String(current) ? "selected" : ""}>${s.label}</option>`).join("");
  }

  function currentGauge() {
    return state.standard === "awg" ? state.awg : state.swg;
  }

  function dropResults() {
    const rRound = cableRoundTripResistance(state.standard, currentGauge(), state.material, state.length);
    const vDrop = state.current * rRound;
    const pLoss = state.current * state.current * rRound;
    return { rRound, vDrop, pLoss };
  }

  function gaugeResults() {
    const targetVdrop = state.supplyV * (state.targetPct / 100);
    const maxRround = targetVdrop / state.current;
    const maxRone = maxRround / 2;
    const minAreaM2 = (CABLE_RESISTIVITY[state.material] * state.length) / maxRone;
    const minDiaMm = Math.sqrt((4 * minAreaM2) / Math.PI) * 1000;
    const gauge = minAdequateGauge(state.standard, minDiaMm);
    if (!gauge) return { minDiaMm, gauge: null };
    const achieved = cableRoundTripResistance(state.standard, gauge.value, state.material, state.length);
    const achievedVdrop = state.current * achieved;
    return { minDiaMm, gauge, achievedRround: achieved, achievedVdrop, achievedPct: (achievedVdrop / state.supplyV) * 100 };
  }

  function problem() {
    if (state.length <= 0) return "Length must be greater than zero.";
    if (state.current <= 0) return "Current must be greater than zero.";
    if (state.mode === "gauge") {
      if (state.supplyV <= 0) return "Supply voltage must be greater than zero.";
      if (state.targetPct <= 0) return "Target drop % must be greater than zero.";
    }
    return "";
  }

  function sharedFieldsHTML() {
    return `
      <div class="section-label" style="color:#8FC1F5">Wire standard</div>
      <div class="field">
        <div class="field-row">
          <select id="cr-standard" style="flex:1;">
            <option value="awg" ${state.standard === "awg" ? "selected" : ""}>AWG</option>
            <option value="swg" ${state.standard === "swg" ? "selected" : ""}>SWG</option>
          </select>
          <select id="cr-material" style="flex:1;">
            <option value="cu" ${state.material === "cu" ? "selected" : ""}>Copper</option>
            <option value="al" ${state.material === "al" ? "selected" : ""}>Aluminum</option>
          </select>
        </div>
      </div>
      <div class="field-pair">
        <div class="field">
          <label>Length, one-way (m)</label>
          <input id="cr-length" type="number" inputmode="decimal" step="any" value="${state.length}" />
        </div>
        <div class="field">
          <label>Current (A)</label>
          <input id="cr-current" type="number" inputmode="decimal" step="any" value="${state.current}" />
        </div>
      </div>`;
  }

  function modeFieldsHTML() {
    if (state.mode === "drop") {
      return `
        <div class="section-label" style="color:#8FC1F5">Gauge</div>
        <div class="field">
          <select id="cr-gauge">${gaugeSelectHTML()}</select>
        </div>`;
    }
    return `
      <div class="field-pair">
        <div class="field">
          <label>Supply voltage (V)</label>
          <input id="cr-supply" type="number" inputmode="decimal" step="any" value="${state.supplyV}" />
        </div>
        <div class="field">
          <label>Target drop (%)</label>
          <input id="cr-target" type="number" inputmode="decimal" step="any" value="${state.targetPct}" />
        </div>
      </div>`;
  }

  function resultsHTML() {
    const err = problem();
    if (err) return `<div class="error-text" data-res="err">${err}</div>`;

    if (state.mode === "drop") {
      const r = dropResults();
      return `
        <div class="section-label" style="color:#5DCAA5">Resistance (round-trip)</div>
        <div class="result-field"><div class="result-value"><span class="num" data-res="r">${formatOhms(r.rRound)}</span></div></div>
        <div class="section-label" style="color:#5DCAA5">Voltage drop</div>
        <div class="result-field">
          <div class="result-value"><span class="num" data-res="v">${siFormat(r.vDrop, "V")}</span></div>
          <div class="result-sub" data-res="pct">${siFormat(r.pLoss, "W")} power loss</div>
        </div>`;
    }

    const g = gaugeResults();
    if (!g.gauge) {
      return `<div class="error-text" data-res="err">No gauge in the table is thick enough for that target — try a shorter run, less current, or a higher drop %.</div>`;
    }
    return `
      <div class="section-label" style="color:#5DCAA5">Minimum gauge</div>
      <div class="result-field">
        <div class="result-value"><span class="num" data-res="gauge">${state.standard.toUpperCase()} ${g.gauge.label}</span></div>
        <div class="result-sub">min. diameter ${trim(g.minDiaMm)} mm</div>
      </div>
      <div class="section-label" style="color:#5DCAA5">At that gauge</div>
      <div class="result-field">
        <div class="result-value"><span class="num">${siFormat(g.achievedVdrop, "V")}</span></div>
        <div class="result-sub">${trim(g.achievedPct)}% of supply · ${formatOhms(g.achievedRround)} round-trip</div>
      </div>`;
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, "Wire gauge, run length and current, both ways")}

      ${pillRow([["drop", "Voltage drop"], ["gauge", "Min. gauge"]], state.mode, domain.bg)}

      ${sharedFieldsHTML()}
      ${modeFieldsHTML()}
      <div id="cr-results">${resultsHTML()}</div>

      ${formulaSection(
        ["R = ρ × 2L / A", "V = I × R"],
        "Length is one-way; current makes a round trip, so R and V use 2L. Min. gauge solves the same equations backward for the smallest wire that stays under a target % drop. Area is the nominal solid-wire figure for the gauge — real stranded wire runs a bit higher (~1–3%) from strand lay and packing, and that margin isn't a fixed constant, so it isn't modeled here."
      )}
      ${calcFooter("")}
    `;

    wireCalc(favId, paint, (m) => { state.mode = m; paint(); });

    // Number fields refresh only the results block, not a full repaint —
    // paint() would tear down and rebuild the input the user is mid-keystroke
    // in, dropping focus and the caret after every digit.
    function refreshResults() {
      document.getElementById("cr-results").innerHTML = resultsHTML();
    }
    const bind = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.oninput = () => {
        const v = parseFloat(el.value);
        if (isFinite(v)) { state[key] = v; refreshResults(); }
      };
    };
    bind("cr-length", "length");
    bind("cr-current", "current");
    bind("cr-supply", "supplyV");
    bind("cr-target", "targetPct");

    const standardSel = document.getElementById("cr-standard");
    if (standardSel) standardSel.onchange = (e) => { state.standard = e.target.value; paint(); };
    const materialSel = document.getElementById("cr-material");
    if (materialSel) materialSel.onchange = (e) => { state.material = e.target.value; paint(); };
    const gaugeSel = document.getElementById("cr-gauge");
    if (gaugeSel) gaugeSel.onchange = (e) => {
      if (state.standard === "awg") state.awg = parseInt(e.target.value, 10);
      else state.swg = e.target.value;
      paint();
    };
  }

  paint();
}

// ---------- Cable colors (standard + DIN 47100) ----------
// Cores 1-10 are solid colours; 11-44 add a second colour as a printed ring
// around the base insulation colour (not a second solid, which is why the
// note reads "X with a Y ring" rather than "X/Y"); 45-60 add a third ring,
// always black. Cross-checked against three independent sources (Wikipedia,
// Eland Cables, igus) for 1-40, and against a fourth for 41-60, rather than
// taken from memory — a wiring reference is exactly the place a
// misremembered stripe colour would actually cause someone a bad day.
const DIN47100_HEX = {
  white: "#F2F2ED", brown: "#8B5A2B", green: "#2E8B3D", yellow: "#E8C820", grey: "#8A8A8A",
  pink: "#F0A0B8", blue: "#2255CC", red: "#CC2222", black: "#1A1A1A", violet: "#7B4FA0",
};
const DIN47100_SOLID = ["white", "brown", "green", "yellow", "grey", "pink", "blue", "red", "black", "violet"];
// Cores 11-40, base colour then ring colour, in standard order.
const DIN47100_RINGED = [
  ["grey", "pink"], ["red", "blue"], ["white", "green"], ["brown", "green"], ["white", "yellow"],
  ["yellow", "brown"], ["white", "grey"], ["grey", "brown"], ["white", "pink"], ["pink", "brown"],
  ["white", "blue"], ["brown", "blue"], ["white", "red"], ["brown", "red"], ["white", "black"],
  ["brown", "black"], ["grey", "green"], ["yellow", "grey"], ["pink", "green"], ["yellow", "pink"],
  ["green", "blue"], ["yellow", "blue"], ["green", "red"], ["yellow", "red"], ["green", "black"],
  ["yellow", "black"], ["grey", "blue"], ["pink", "blue"], ["grey", "red"], ["pink", "red"],
  // Cores 41-44: same two-colour scheme, still climbing through the base-10
  // pairings before the third (always black) stripe joins at 45.
  ["grey", "black"], ["pink", "black"], ["blue", "black"], ["red", "black"],
];
// Cores 45-60: a third stripe joins, always black.
const DIN47100_TRIPLE = [
  ["white", "brown"], ["yellow", "green"], ["grey", "pink"], ["red", "blue"], ["white", "green"],
  ["brown", "green"], ["white", "yellow"], ["yellow", "brown"], ["white", "grey"], ["grey", "brown"],
  ["white", "pink"], ["pink", "brown"], ["white", "blue"], ["brown", "blue"], ["white", "red"], ["brown", "red"],
];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

const CABLE_COLORS = [
  { group: "IEC 60446 (international / EU)", label: "Live / Line (L)", swatch: "#8B5A2B", note: "Brown" },
  { group: "IEC 60446 (international / EU)", label: "Neutral (N)", swatch: "#2255CC", note: "Blue" },
  { group: "IEC 60446 (international / EU)", label: "Earth / protective earth (PE)", swatch: "linear-gradient(135deg, #2E8B3D 50%, #E8C820 50%)", note: "Green with a yellow stripe" },
  { group: "IEC 60446 (international / EU)", label: "Line 2 — L2 (three-phase)", swatch: "#1A1A1A", note: "Black" },
  { group: "IEC 60446 (international / EU)", label: "Line 3 — L3 (three-phase)", swatch: "#8A8A8A", note: "Grey" },
  { group: "NEC (US)", label: "Hot / Line", swatch: "#1A1A1A", note: "Black — red or blue for additional hots" },
  { group: "NEC (US)", label: "Neutral", swatch: "#F2F2ED", note: "White, sometimes grey" },
  { group: "NEC (US)", label: "Ground", swatch: "#2E8B3D", note: "Green, or bare copper" },
  ...DIN47100_SOLID.map((c, i) => ({
    group: "DIN 47100 (cores 1–10)", label: `Core ${i + 1}`, swatch: DIN47100_HEX[c], note: cap(c),
  })),
  ...DIN47100_RINGED.map(([base, ring], i) => ({
    group: "DIN 47100 (cores 11–44)", label: `Core ${i + 11}`,
    swatch: `linear-gradient(135deg, ${DIN47100_HEX[base]} 65%, ${DIN47100_HEX[ring]} 65%)`,
    note: `${cap(base)} with a ${ring} ring`,
  })),
  ...DIN47100_TRIPLE.map(([base, second], i) => ({
    group: "DIN 47100 (cores 45–60)", label: `Core ${i + 45}`,
    swatch: `linear-gradient(135deg, ${DIN47100_HEX[base]} 0%, ${DIN47100_HEX[base]} 45%, ${DIN47100_HEX[second]} 45%, ${DIN47100_HEX[second]} 75%, ${DIN47100_HEX.black} 75%, ${DIN47100_HEX.black} 100%)`,
    note: `${cap(base)} with ${second} and black rings`,
  })),
];

function renderCableColors(domain, tool, favId) {
  function row(c) {
    const bg = c.swatch.startsWith("#") ? `background:${c.swatch};` : `background:${c.swatch};`;
    return `
      <div class="color-row tap-select">
        <div class="color-swatch" style="${bg}"></div>
        <div class="color-row-text">
          <div class="color-row-label">${c.label}</div>
          <div class="color-row-note">${c.note}</div>
        </div>
      </div>`;
  }

  function matches(c, q) {
    return c.label.toLowerCase().includes(q) || c.note.toLowerCase().includes(q) || c.group.toLowerCase().includes(q);
  }

  function groupedHTML(list) {
    const groups = [];
    for (const c of list) {
      let g = groups.find((x) => x.name === c.group);
      if (!g) { g = { name: c.group, items: [] }; groups.push(g); }
      g.items.push(c);
    }
    return groups.map((g) => `
      <div class="section-label" style="color:#8FC1F5">${g.name}</div>
      <div class="color-list">${g.items.map(row).join("")}</div>`).join("");
  }

  function renderList(list, emptyQuery) {
    const results = document.getElementById("cc-results");
    results.innerHTML = list.length ? groupedHTML(list) : `<div class="placeholder">${ICONS.search}<div>No match for "${emptyQuery}".</div></div>`;
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, "Mains wiring and DIN 47100 multi-core numbering")}

      <div class="search-box">
        ${ICONS.search}
        <input id="cc-input" type="text" placeholder="Search a colour, function, or standard" autocapitalize="off" spellcheck="false" />
      </div>
      <div id="cc-results"></div>
      ${tabbarHTML("")}
    `;

    document.getElementById("fav-btn").onclick = () => { toggleFavorite(favId); paint(); };

    const input = document.getElementById("cc-input");
    renderList(CABLE_COLORS, "");
    input.oninput = () => {
      const q = input.value.trim().toLowerCase();
      renderList(q ? CABLE_COLORS.filter((c) => matches(c, q)) : CABLE_COLORS, q);
    };
  }

  paint();
}

render();
