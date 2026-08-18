// Circuit Codex — app shell (vanilla JS, hash-based routing)

const app = document.getElementById("app");

function favorites() {
  return JSON.parse(localStorage.getItem("cc_favorites") || "[]");
}
function toggleFavorite(key) {
  const favs = favorites();
  const idx = favs.indexOf(key);
  if (idx >= 0) favs.splice(idx, 1); else favs.push(key);
  localStorage.setItem("cc_favorites", JSON.stringify(favs));
}
function isFavorite(key) {
  return favorites().includes(key);
}

// ---------- Icons (inline SVG, literal style) ----------
const ICONS = {
  resistor: `<svg width="24" height="24" viewBox="0 0 48 24"><path d="M2 12 H12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M36 12 H46" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/><rect x="12" y="6" width="24" height="12" rx="5" fill="#D9C9A8"/><rect x="16" y="6" width="2.4" height="12" fill="#7A4A2B"/><rect x="21" y="6" width="2.4" height="12" fill="#C24C3A"/><rect x="26" y="6" width="2.4" height="12" fill="#D8A62B"/></svg>`,
  transistor: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M8 6 V18 M8 10 L15 6 M8 14 L15 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  binary: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><text x="2" y="10" font-size="8" fill="currentColor" font-family="monospace">10</text><text x="2" y="20" font-size="8" fill="currentColor" font-family="monospace">01</text></svg>`,
  antenna: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22 V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7" r="2" fill="currentColor"/><path d="M8 4 Q12 -1 16 4 M5 7 Q12 -4 19 7" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`,
  bolt: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2 L4 14 H11 L9 22 L20 9 H13 L15 2 Z" fill="currentColor"/></svg>`,
  pcb: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/><circle cx="16" cy="8" r="1.4" fill="currentColor"/><circle cx="8" cy="16" r="1.4" fill="currentColor"/><path d="M8 9.4 V14.6 M9.4 8 H14.6" stroke="currentColor" stroke-width="1.4"/></svg>`,
  wrench: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
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
    <div class="sub sub-center">Electronics reference and tools</div>
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
    </div>
    <div class="sub" style="padding-left:46px;">${d.subtitle}</div>
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

  if (calcId === "ohms-law") return renderOhmsLaw(domain, tool, key);
  if (calcId === "resistor-color-code") return renderResistorColorCode(domain, tool, key);

  // Placeholder screen for tools not yet built
  app.innerHTML = `
    <div class="topbar back-row">
      <button class="icon-btn" onclick="history.back()">${ICONS.chevronLeft}</button>
      <h1>${tool.name}</h1>
      <button class="icon-btn ${isFavorite(key) ? "active" : ""}" onclick="toggleFavorite('${key}');render()">${ICONS.star}</button>
    </div>
    <div class="sub" style="padding-left:46px;">${domain.title} · ${section.title}</div>
    <div class="placeholder">
      ${ICONS.wrench}
      <div style="font-size:14px;">This calculator isn't built yet in this preview.</div>
      <div style="font-size:12px;margin-top:6px;">Structure and naming are final — logic comes next.</div>
    </div>
    ${tabbarHTML("")}
  `;
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
  const favs = favorites();
  const items = favs.map(key => findTool(key)).filter(Boolean);
  app.innerHTML = `
    <div class="topbar"><h1>Favorites</h1></div>
    <div class="tool-list">
      ${items.length ? items.map(it => `
        <button class="tool-row" style="flex-direction:column;align-items:flex-start;" onclick="location.hash='/tool/${encodeURIComponent(it.key)}/${it.tool.calc || ""}'">
          <span>${it.tool.name}</span>
          <span class="breadcrumb">${it.domain.title} · ${it.section.title}</span>
        </button>`).join("") :
        `<div class="placeholder">${ICONS.star}<div>No favorites yet.</div><div style="font-size:12px;margin-top:6px;">Tap the star on any tool to pin it here.</div></div>`
      }
    </div>
    ${tabbarHTML("favorites")}
  `;
}

// ---------- Ohm's law calculator (fully functional proof of concept) ----------
function renderOhmsLaw(domain, tool, key) {
  const state = { mode: "vi", V: 12, I: 250, Ivi_unit: "mA" };

  // Series loop with V, I and R marked where they physically are: V across the
  // source, I as a current arrow along the wire, R on the resistor. Wires stay
  // neutral so the labels can carry the mode — a quantity you entered is drawn
  // in the input blue, one being solved for in the result green, matching the
  // "Your inputs" and "Results" headings below.
  function diagram() {
    const known = fieldsForMode(state.mode);
    const tone = (v) => (known.includes(v) ? "#8FC1F5" : "#5DCAA5");
    const wire = "#5A6169";
    return `<svg width="220" height="104" viewBox="0 0 220 104" fill="none">
      <path d="M34 34 H95 M137 34 H186 M186 34 V84 M186 84 H34 M34 34 V52 M34 62 V84" stroke="${wire}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M95 34 L100 26 L108 42 L116 26 L124 42 L132 26 L137 34" stroke="${tone("R")}" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
      <path d="M22 52 H46" stroke="${tone("V")}" stroke-width="2"/>
      <path d="M28 62 H40" stroke="${tone("V")}" stroke-width="2"/>
      <path d="M50 22 H74 M69 18 L75 22 L69 26" stroke="${tone("I")}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="12" y="61" fill="${tone("V")}" font-size="12" font-weight="600" text-anchor="middle">V</text>
      <text x="62" y="14" fill="${tone("I")}" font-size="12" font-weight="600" text-anchor="middle">I</text>
      <text x="116" y="18" fill="${tone("R")}" font-size="12" font-weight="600" text-anchor="middle">R</text>
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
    });
  }

  function paint() {
    const inputs = fieldsForMode(state.mode);
    const outputs = ["V", "I", "R", "P"].filter(v => !inputs.includes(v));
    const results = compute();

    app.innerHTML = `
      <div class="topbar back-row">
        <button class="icon-btn" onclick="history.back()">${ICONS.chevronLeft}</button>
        <h1>${tool.name}</h1>
        <button class="icon-btn ${isFavorite(key) ? "active" : ""}" id="fav-btn">${ICONS.star}</button>
      </div>
      <div class="sub" style="padding-left:46px;">Voltage, current, resistance</div>

      <div class="diagram-box">${diagram()}</div>

      <div class="mode-pills">
        <button class="pill ${state.mode === "vi" ? "active" : ""}" data-mode="vi" style="${state.mode === "vi" ? "background:#1B2A3B;color:#8FC1F5" : ""}">VI</button>
        <button class="pill ${state.mode === "vr" ? "active" : ""}" data-mode="vr" style="${state.mode === "vr" ? "background:#1B2A3B;color:#8FC1F5" : ""}">VR</button>
        <button class="pill ${state.mode === "ir" ? "active" : ""}" data-mode="ir" style="${state.mode === "ir" ? "background:#1B2A3B;color:#8FC1F5" : ""}">IR</button>
      </div>

      <div class="section-label" style="color:#8FC1F5">Your inputs</div>
      ${inputs.map(v => `
        <div class="field">
          <label>${{ V: "Voltage (V)", I: "Current (I)", R: "Resistance (R)" }[v]}</label>
          <div class="field-row">
            <input type="number" inputmode="decimal" data-var="${v}" value="${displayValue(v, state.values[v] === undefined ? 0 : state.values[v] * unitScale(state.units[v]))}" />
            <select data-unit="${v}">
              ${unitOptionsFor(v).map(u => `<option value="${u}" ${state.units[v] === u ? "selected" : ""} style="color:#8FC1F5;background:#15181D;">${u}</option>`).join("")}
            </select>
          </div>
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
        </div>`).join("")}

      <div class="formula-note">${ICONS.info}<span>${formulaFor(state.mode)}</span></div>
      ${tabbarHTML("")}
    `;

    document.getElementById("fav-btn").onclick = () => { toggleFavorite(key); paint(); };

    app.querySelectorAll(".pill").forEach(btn => {
      btn.onclick = () => { state.mode = btn.dataset.mode; paint(); };
    });
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

function renderResistorColorCode(domain, tool, key) {
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

  function trim(n) {
    return Number(n.toPrecision(4)).toString();
  }

  function formatOhms(v) {
    if (!isFinite(v)) return "—";
    for (const [scale, unit] of [[1e9, "GΩ"], [1e6, "MΩ"], [1e3, "kΩ"], [1, "Ω"]]) {
      if (Math.abs(v) >= scale) return `${trim(v / scale)} ${unit}`;
    }
    return `${trim(v * 1e3)} mΩ`;
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

  function footnoteHTML(roles) {
    return [`${roles.filter(x => x[0] === "d").length} digits ${multLabel(BAND_COLORS[state.bands.mult].mult)}`, "tolerance"]
      .concat(roles.includes("tc") ? ["temp. coefficient"] : [])
      .join(" &nbsp;·&nbsp; ");
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
      <div class="topbar back-row">
        <button class="icon-btn" onclick="history.back()">${ICONS.chevronLeft}</button>
        <h1>${tool.name}</h1>
        <button class="icon-btn ${isFavorite(key) ? "active" : ""}" id="fav-btn">${ICONS.star}</button>
      </div>
      <div class="sub" style="padding-left:46px;">4 to 6 bands</div>

      <div class="diagram-box">${resistor()}</div>

      <div class="mode-pills">
        ${[4, 5, 6].map(n => `
          <button class="pill ${state.count === n ? "active" : ""}" data-count="${n}" style="${state.count === n ? `background:${domain.bg};color:#8FC1F5` : ""}">${n} bands</button>`).join("")}
      </div>

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

      <div class="formula-note">${ICONS.info}<span data-res="note">${footnoteHTML(roles)}</span></div>
      ${tabbarHTML("")}
    `;

    document.getElementById("fav-btn").onclick = () => { toggleFavorite(key); paint(); };

    app.querySelectorAll(".pill").forEach(btn => {
      btn.onclick = () => { state.count = +btn.dataset.count; paint(); };
    });
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

render();
