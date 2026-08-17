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
  resistor: `<svg width="18" height="18" viewBox="0 0 48 24"><path d="M2 12 H12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M36 12 H46" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/><rect x="12" y="6" width="24" height="12" rx="5" fill="#D9C9A8"/><rect x="16" y="6" width="2.4" height="12" fill="#7A4A2B"/><rect x="21" y="6" width="2.4" height="12" fill="#C24C3A"/><rect x="26" y="6" width="2.4" height="12" fill="#D8A62B"/></svg>`,
  transistor: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M8 6 V18 M8 10 L15 6 M8 14 L15 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  binary: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><text x="2" y="10" font-size="8" fill="currentColor" font-family="monospace">10</text><text x="2" y="20" font-size="8" fill="currentColor" font-family="monospace">01</text></svg>`,
  antenna: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22 V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7" r="2" fill="currentColor"/><path d="M8 4 Q12 -1 16 4 M5 7 Q12 -4 19 7" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`,
  bolt: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2 L4 14 H11 L9 22 L20 9 H13 L15 2 Z" fill="currentColor"/></svg>`,
  pcb: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/><circle cx="16" cy="8" r="1.4" fill="currentColor"/><circle cx="8" cy="16" r="1.4" fill="currentColor"/><path d="M8 9.4 V14.6 M9.4 8 H14.6" stroke="currentColor" stroke-width="1.4"/></svg>`,
  wrench: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
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

  function diagram() {
    return `<svg width="200" height="70" viewBox="0 0 200 70" fill="none">
      <path d="M10 35 H40" stroke="#8FC1F5" stroke-width="1.6"/>
      <path d="M40 20 V50 M47 20 V50" stroke="#8FC1F5" stroke-width="1.6"/>
      <path d="M47 35 H70" stroke="#8FC1F5" stroke-width="1.6"/>
      <path d="M70 35 L75 27 L83 43 L91 27 L99 43 L107 27 L112 35" stroke="#8FC1F5" stroke-width="1.6" stroke-linejoin="round" fill="none"/>
      <path d="M112 35 H170" stroke="#8FC1F5" stroke-width="1.6"/>
      <path d="M10 35 V58 H170 V35" stroke="#8FC1F5" stroke-width="1.6" fill="none"/>
      <text x="43" y="14" fill="#9A9EA6" font-size="10" text-anchor="middle">+/-</text>
      <text x="91" y="18" fill="#9A9EA6" font-size="10" text-anchor="middle">R</text>
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
        <button class="pill ${state.mode === "vi" ? "active" : ""}" data-mode="vi" style="${state.mode === "vi" ? "background:#1B2A3B;color:#8FC1F5" : ""}">V + I</button>
        <button class="pill ${state.mode === "vr" ? "active" : ""}" data-mode="vr" style="${state.mode === "vr" ? "background:#1B2A3B;color:#8FC1F5" : ""}">V + R</button>
        <button class="pill ${state.mode === "ir" ? "active" : ""}" data-mode="ir" style="${state.mode === "ir" ? "background:#1B2A3B;color:#8FC1F5" : ""}">I + R</button>
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
        <div class="result-field">
          <div class="result-head">
            <span class="label">${{ V: "Voltage (V)", I: "Current (I)", R: "Resistance (R)", P: "Power (P)" }[v]}</span>
            <span class="badge-calc">${ICONS.bolt2}Calculated</span>
          </div>
          <div class="result-value">
            <span class="num">${fmt(results[v] / unitScale(state.units[v] || defaultUnit(v)))}</span>
            <span class="unit">${state.units[v] || defaultUnit(v)}</span>
          </div>
        </div>`).join("")}

      <div class="formula-note">${ICONS.info}<span>V = I × R &nbsp;·&nbsp; P = V × I</span></div>
      ${tabbarHTML("")}
    `;

    document.getElementById("fav-btn").onclick = () => { toggleFavorite(key); paint(); };

    app.querySelectorAll(".pill").forEach(btn => {
      btn.onclick = () => { state.mode = btn.dataset.mode; paint(); };
    });
    app.querySelectorAll("input[data-var]").forEach(inp => {
      inp.oninput = () => {
        const v = inp.dataset.var;
        const num = parseFloat(inp.value);
        if (!isNaN(num)) state.values[v] = num;
      };
    });
    app.querySelectorAll("select[data-unit]").forEach(sel => {
      sel.onchange = () => { state.units[sel.dataset.unit] = sel.value; paint(); };
    });
  }

  paint();
}

render();
