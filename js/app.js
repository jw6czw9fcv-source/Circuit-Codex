// Circuit Codex — app shell (vanilla JS, hash-based routing)

const app = document.getElementById("app");

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
  if (calcId === "series-parallel") return renderSeriesParallel(domain, tool, favId);
  if (calcId === "formula-search") return renderFormulaSearch(domain, tool, favId);

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

function calcHeader(tool, favId, subtitle) {
  return `
    <div class="topbar back-row">
      <button class="icon-btn" onclick="history.back()">${ICONS.chevronLeft}</button>
      <h1>${tool.name}</h1>
      <button class="icon-btn ${isFavorite(favId) ? "active" : ""}" id="fav-btn">${ICONS.star}</button>
    </div>
    <div class="sub">${subtitle}</div>`;
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

function calcFooter(note) {
  return `
      <div class="formula-note">${ICONS.info}<span data-res="note">${note}</span></div>
      ${tabbarHTML("")}`;
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

  // The footnote states how each result is derived from the two values the
  // user actually typed, so it tracks the mode instead of naming a rearrangement
  // that is not the one on screen.
  function formulaFor(mode) {
    if (mode === "vi") return "R = V / I &nbsp;·&nbsp; P = V × I";
    if (mode === "vr") return "I = V / R &nbsp;·&nbsp; P = V² / R";
    return "V = I × R &nbsp;·&nbsp; P = I² × R";
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
  }

  function paint() {
    const inputs = fieldsForMode(state.mode);
    const outputs = ["V", "I", "R", "P"].filter(v => !inputs.includes(v));
    const results = compute();

    app.innerHTML = `
      ${calcHeader(tool, favId, "Voltage, current, resistance")}

      <div class="diagram-box">${diagram()}</div>

      ${pillRow([["vi", "VI"], ["vr", "VR"], ["ir", "IR"]], state.mode, "#1B2A3B")}

      <div class="section-label" style="color:#8FC1F5">Your inputs</div>
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
        </div>`).join("")}

      <div class="section-label" style="color:#5DCAA5">Results
        <select id="ohm-tol" class="label-select">
          ${[0.1, 0.5, 1, 2, 5, 10].map(t => `<option value="${t}" ${state.tol === t ? "selected" : ""}>±${t}% · ${eSeriesForTolerance(t)}</option>`).join("")}
        </select>
      </div>
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

      ${calcFooter(formulaFor(state.mode))}
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

  // Says how the code composes, and nothing the screen already shows: the band
  // roles are the roller column headers, the multiplier and tolerance are read
  // out under them, and the value is in the results card. What is left that is
  // not on screen anywhere is which end you read from.
  function footnoteHTML(roles) {
    const digits = roles.filter(x => x[0] === "d").length;
    return `${digits} digits × multiplier &nbsp;·&nbsp; tolerance band goes last`;
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
    app.querySelector('[data-res="note"]').innerHTML = footnoteHTML(roles);

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

      ${calcFooter(footnoteHTML(roles))}
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

  function footnoteHTML() {
    if (state.mode === "96") {
      return ["2-digit E96 index + letter", "letter sets the decade", "±1%"].join(" &nbsp;·&nbsp; ");
    }
    return [
      `${sig()} digits + ×10ⁿ`,
      "R marks the decimal point",
      state.mode === "3" ? "usually ±5%" : "usually ±1%",
    ].join(" &nbsp;·&nbsp; ");
  }

  // Update in place rather than repainting, so the field being typed in keeps
  // its caret — same reason as the colour code.
  function refresh(source, notice) {
    const code = codeFor(state.ohms);
    app.querySelector(".diagram-box").innerHTML = chip(code);
    app.querySelector('[data-res="ohms"]').textContent = formatOhms(state.ohms);
    app.querySelector('[data-res="series"]').textContent = seriesLine(state.ohms);
    app.querySelector('[data-res="note"]').innerHTML = footnoteHTML();
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

      ${calcFooter(footnoteHTML())}
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

  function formulaFor(solve) {
    if (solve === "vout") return "Vout = Vin × R2 / (R1 + R2)";
    if (solve === "r1") return "R1 = R2 × (Vin − Vout) / Vout";
    return "R2 = R1 × Vout / (Vin − Vout)";
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
  }

  function paint() {
    const r = compute();
    app.innerHTML = `
      ${calcHeader(tool, favId, "Unloaded resistive divider")}

      <div class="diagram-box" style="padding:2px 10px;">${diagram()}</div>

      ${pillRow([["vout", "Vout"], ["r1", "R1"], ["r2", "R2"]], state.solve, domain.bg)}

      <div class="section-label" style="color:#8FC1F5">Your inputs</div>
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
        </div>`).join("")}
      <div class="error-text" data-res="err">${problem(r)}</div>

      <div class="section-label" style="color:#5DCAA5">Result
        <select id="vd-tol" class="label-select">
          ${[0.1, 0.5, 1, 2, 5, 10].map(t => `<option value="${t}" ${state.tol === t ? "selected" : ""}>±${t}% · ${eSeriesForTolerance(t)}</option>`).join("")}
        </select>
      </div>
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

      ${calcFooter(formulaFor(state.solve))}
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

  function formulaFor(solve) {
    if (solve === "i1") return "I1 = Iin × R2 / (R1 + R2)";
    if (solve === "r1") return "R1 = R2 × (Iin − I1) / I1";
    return "R2 = R1 × I1 / (Iin − I1)";
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
  }

  function paint() {
    const r = compute();
    app.innerHTML = `
      ${calcHeader(tool, favId, "Two branches in parallel")}

      <div class="diagram-box" style="padding:4px 10px;">${diagram()}</div>

      ${pillRow([["i1", "I1"], ["r1", "R1"], ["r2", "R2"]], state.solve, domain.bg)}

      <div class="section-label" style="color:#8FC1F5">Your inputs</div>
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
        </div>`).join("")}
      <div class="error-text" data-res="err">${problem(r)}</div>

      <div class="section-label" style="color:#5DCAA5">Result
        <select id="cd-tol" class="label-select">
          ${[0.1, 0.5, 1, 2, 5, 10].map(t => `<option value="${t}" ${state.tol === t ? "selected" : ""}>±${t}% · ${eSeriesForTolerance(t)}</option>`).join("")}
        </select>
      </div>
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

      ${calcFooter(formulaFor(state.solve))}
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

  function formulaFor(mode) {
    return mode === "series"
      ? "R = R1 + R2 + …"
      : "1/R = 1/R1 + 1/R2 + …";
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
      <path d="${cx.map(x => `M${x} 24 V30 M${x} 66 V76`).join(" ")}" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M110 12 V24 M110 76 V88" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      ${cx.map(x => `<path d="${zig(x, 30)}" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>`).join("")}
      ${cx.map((x, i) => `<text x="${x}" y="52" fill="${ink}" font-size="11" font-weight="600" text-anchor="${i === n - 1 ? "start" : "end"}" dx="${i === n - 1 ? 10 : -10}">R${i + 1}</text>`).join("")}
    </svg>`;
  }

  function rowsHTML() {
    return state.rows.map((row, i) => `
      <div class="r-row">
        <span class="r-index">R${i + 1}</span>
        <input type="number" inputmode="decimal" step="any" data-row="${i}" value="${row.value}" />
        <span class="r-hint" data-hint="${i}">${seriesHint(ohmsOf(row))}</span>
        <select data-unit="${i}">
          ${Object.keys(DIVIDER_R_UNITS).map(u => `<option ${row.unit === u ? "selected" : ""}>${u}</option>`).join("")}
        </select>
        <button class="r-drop" data-drop="${i}" aria-label="Remove R${i + 1}" ${state.rows.length <= 2 ? "disabled" : ""}>×</button>
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
  }

  function paint() {
    app.innerHTML = `
      ${calcHeader(tool, favId, `${state.rows.length} resistors, ${state.mode === "series" ? "end to end" : "across each other"}`)}

      <div class="diagram-box" style="padding:6px 10px;">${diagram()}</div>

      ${pillRow([["series", "Series"], ["parallel", "Parallel"]], state.mode, domain.bg)}

      <div class="section-label" style="color:#8FC1F5">Resistors
        <button class="label-btn" id="sp-add" ${state.rows.length >= SP_MAX ? "disabled" : ""}>+ add</button>
      </div>
      <div class="r-list">${rowsHTML()}</div>
      <div class="error-text" data-res="err">${problem()}</div>

      <div class="section-label" style="color:#5DCAA5">Result
        <select id="sp-tol" class="label-select">
          ${[0.1, 0.5, 1, 2, 5, 10].map(t => `<option value="${t}" ${state.tol === t ? "selected" : ""}>±${t}% · ${eSeriesForTolerance(t)}</option>`).join("")}
        </select>
      </div>
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

      ${calcFooter(formulaFor(state.mode))}
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
    const results = document.getElementById("fs-results");
    input.oninput = () => {
      const q = input.value;
      if (!q.trim()) { results.innerHTML = ""; return; }
      const matches = searchFormulas(q);
      results.innerHTML = matches.length
        ? matches.map(card).join("")
        : `<div class="placeholder">${ICONS.search}<div>No formula for "${q}" yet.</div><div style="font-size:12px;margin-top:6px;">Still growing — most topics don't have an entry here yet.</div></div>`;
    };
    input.focus();
  }

  paint();
}

render();
