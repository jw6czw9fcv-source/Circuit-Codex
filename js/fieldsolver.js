"use strict";
// Circuit Codex field solver: the impedance of a PCB transmission line from
// its cross-section, by finite differences. The cross-section is laid on a
// graded rectangular grid (fine at the copper's edges, coarse far away, every
// edge of the geometry on a grid line); Laplace's equation is solved for the
// potential with the conductors at 1 V and the planes at 0 V, and the
// capacitance per length follows from the field's energy:
//
//     S = Σ over grid edges of ε_edge (Δφ)²  =  C / ε0
//
// A line in one dielectric has Z0 = η0 / (√εr S_air); over layered
// dielectric Z0 = η0 / √(S S_air) and εeff = S / S_air. Each case is solved on
// three grids, every cell halved from one to the next, and extrapolated with
// two terms (h and h²). The same method as tools/fd_lines.py, checked against
// Cohn's exact stripline impedances (within 0.005 %) and Polar's boundary-
// element microstrip table (within 0.04 %). Lengths in mm.
//
// Runs on the page (FieldSolver.solve) or as a Web Worker (postMessage
// {id, kind, params} → {id, result}).
(function (root) {
  const ETA0 = 376.730313668;

  // Grid lines through every break, steps h0 at the breaks growing by `grow`
  // up to hmax, then every step split into 2^level.
  function axis(breaks, h0, hmax, level, grow) {
    const bs = [...new Set(breaks.map((b) => Math.round(b * 1e12) / 1e12))].sort((a, b) => a - b);
    const xs = [bs[0]];
    const sub = 1 << level;
    for (let k = 0; k + 1 < bs.length; k++) {
      const a = bs[k], b = bs[k + 1], L = b - a;
      const half = [];
      let tot = 0;
      for (let n = 0; tot < L - 1e-12; n++) { const st = Math.min(h0 * grow ** n, hmax); half.push(st); tot += 2 * st; }
      const steps = half.concat(half.slice().reverse());
      for (const st of steps) for (let q = 0; q < sub; q++) xs.push(xs[xs.length - 1] + st * L / tot / sub);
      xs[xs.length - 1] = b;
    }
    return Float64Array.from(xs);
  }

  function indexOf(arr, v) {
    let best = 0;
    for (let i = 1; i < arr.length; i++) if (Math.abs(arr[i] - v) < Math.abs(arr[best] - v)) best = i;
    if (Math.abs(arr[best] - v) > 1e-9) throw new Error(`no grid line at ${v}`);
    return best;
  }

  // One grid of a cross-section: coordinates, which nodes are held, their
  // values, and each cell's permittivity.
  function makeLevel(spec, level) {
    const xs = axis(spec.xb, spec.h0, spec.hmax, level, spec.grow);
    const ys = axis(spec.yb, spec.h0, spec.hmax, level, spec.grow);
    const nx1 = xs.length, ny1 = ys.length, nx = nx1 - 1, ny = ny1 - 1, N = nx1 * ny1;
    const fixed = new Uint8Array(N), val = new Float64Array(N);
    const eps = new Float64Array(nx * ny).fill(1);
    for (const [y0, y1, er] of spec.layers || []) {
      for (let j = 0; j < ny; j++) {
        const yc = (ys[j] + ys[j + 1]) / 2;
        if (yc > y0 && yc < y1) for (let i = 0; i < nx; i++) eps[j * nx + i] = er;
      }
    }
    // Rectangles of dielectric over the layers (a solder mask's coat).
    for (const [x0, x1, y0, y1, er] of spec.blocks || []) {
      for (let j = 0; j < ny; j++) {
        const yc = (ys[j] + ys[j + 1]) / 2;
        if (!(yc > y0 && yc < y1)) continue;
        for (let i = 0; i < nx; i++) { const xc = (xs[i] + xs[i + 1]) / 2; if (xc > x0 && xc < x1) eps[j * nx + i] = er; }
      }
    }
    for (const y of spec.rows || []) { const j = indexOf(ys, y); for (let i = 0; i < nx1; i++) { fixed[j * nx1 + i] = 1; val[j * nx1 + i] = 0; } }
    for (const x of spec.cols || []) { const i = indexOf(xs, x); for (let j = 0; j < ny1; j++) { fixed[j * nx1 + i] = 1; val[j * nx1 + i] = 0; } }
    const box = ([x0, x1, y0, y1], v) => {
      const a = indexOf(xs, x0), b = indexOf(xs, x1), c = indexOf(ys, y0), d = indexOf(ys, y1);
      for (let j = c; j <= d; j++) for (let i = a; i <= b; i++) { fixed[j * nx1 + i] = 1; val[j * nx1 + i] = v; }
    };
    for (const g of spec.grounds || []) box(g, 0);
    for (const s of spec.signals || []) box(s, 1);
    return { xs, ys, nx1, ny1, nx, ny, N, fixed, val, eps };
  }

  // Edge weights of the grid Laplacian: ε times the dual length over the
  // edge's length, the cells on either side each contributing half.
  function weights(lv, air) {
    const { xs, ys, nx1, ny1, nx, ny, N, eps } = lv;
    const wE = new Float64Array(N), wN = new Float64Array(N);
    const e = (j, i) => (j < 0 || j >= ny || i < 0 || i >= nx ? 0 : air ? 1 : eps[j * nx + i]);
    for (let j = 0; j < ny1; j++) {
      const dyB = j > 0 ? ys[j] - ys[j - 1] : 0, dyT = j < ny ? ys[j + 1] - ys[j] : 0;
      for (let i = 0; i < nx; i++) wE[j * nx1 + i] = (e(j - 1, i) * dyB / 2 + e(j, i) * dyT / 2) / (xs[i + 1] - xs[i]);
    }
    for (let j = 0; j < ny; j++) {
      const dy = ys[j + 1] - ys[j];
      for (let i = 0; i < nx1; i++) {
        const dxL = i > 0 ? xs[i] - xs[i - 1] : 0, dxR = i < nx ? xs[i + 1] - xs[i] : 0;
        wN[j * nx1 + i] = (e(j, i - 1) * dxL / 2 + e(j, i) * dxR / 2) / dy;
      }
    }
    return { wE, wN };
  }

  // Conjugate gradients on the free nodes, preconditioned by a modified
  // incomplete Cholesky factorisation (MIC(0); ω = 1 took a third fewer
  // iterations than 0.97 on these graded grids). phi holds the fixed values
  // and the starting guess; it is solved in place.
  function solvePotential(lv, w, phi, tol, omega = 1) {
    const { nx1, N, fixed } = lv, { wE, wN } = w;
    const O = nx1 + 1;                       // padding: neighbours of any node are in range
    const P = (a) => { const out = new Float64Array(N + 2 * O); out.set(a, O); return out; };
    const x = P(phi);
    // Each node's west and south weights, zero on the grid's edges, so the
    // loops below need no tests on the position.
    const wW = new Float64Array(N), wS = new Float64Array(N);
    for (let k = 0; k < N; k++) { if (k % nx1) wW[k] = wE[k - 1]; if (k >= nx1) wS[k] = wN[k - nx1]; }
    const diag = new Float64Array(N), D = new Float64Array(N);
    for (let k = 0; k < N; k++) diag[k] = wE[k] + wW[k] + wN[k] + wS[k];
    const OMEGA = omega;
    for (let k = 0; k < N; k++) {
      if (fixed[k]) { D[k] = 1; continue; }
      let d = diag[k];
      if (wW[k] && !fixed[k - 1]) {
        const a = wW[k], f = k - 1 + nx1 < N && !fixed[k - 1 + nx1] ? wN[k - 1] : 0;
        d -= a * (a + OMEGA * f) / D[k - 1];
      }
      if (wS[k] && !fixed[k - nx1]) {
        const a = wS[k], f = (k + 1) % nx1 && !fixed[k - nx1 + 1] ? wE[k - nx1] : 0;
        d -= a * (a + OMEGA * f) / D[k - nx1];
      }
      D[k] = d > 1e-12 * diag[k] ? d : diag[k];
    }
    // 1 on the free nodes, 0 on the held ones.
    const free = new Float64Array(N);
    for (let k = 0; k < N; k++) free[k] = fixed[k] ? 0 : 1;
    const r = new Float64Array(N), q = new Float64Array(N);
    const z = P(new Float64Array(N)), p = P(new Float64Array(N)), u = P(new Float64Array(N));
    // r = −A x on the free nodes.
    let rr0 = 0;
    for (let k = 0; k < N; k++) {
      const c = k + O;
      const Ax = diag[k] * x[c] - wE[k] * x[c + 1] - wW[k] * x[c - 1] - wN[k] * x[c + nx1] - wS[k] * x[c - nx1];
      r[k] = -Ax * free[k]; rr0 += r[k] * r[k];
    }
    if (rr0 === 0) return 0;
    const precondition = () => {
      for (let k = 0, c = O; k < N; k++, c++) u[c] = free[k] * (r[k] + wW[k] * u[c - 1] + wS[k] * u[c - nx1]) / D[k];
      for (let k = N - 1, c = N - 1 + O; k >= 0; k--, c--) z[c] = free[k] * (u[c] + (wE[k] * z[c + 1] + wN[k] * z[c + nx1]) / D[k]);
    };
    precondition();
    let rz = 0;
    for (let k = 0; k < N; k++) { p[k + O] = z[k + O]; rz += r[k] * z[k + O]; }
    let it = 0;
    for (; it < 5000; it++) {
      let pq = 0;
      for (let k = 0, c = O; k < N; k++, c++) {
        const v = free[k] * (diag[k] * p[c] - wE[k] * p[c + 1] - wW[k] * p[c - 1] - wN[k] * p[c + nx1] - wS[k] * p[c - nx1]);
        q[k] = v; pq += p[c] * v;
      }
      const alpha = rz / pq;
      let rr = 0;
      // p and q are zero on the held nodes, which therefore keep their values.
      for (let k = 0, c = O; k < N; k++, c++) {
        x[c] += alpha * p[c];
        r[k] -= alpha * q[k];
        rr += r[k] * r[k];
      }
      if (rr <= tol * tol * rr0) { it++; break; }
      precondition();
      let rzNew = 0;
      for (let k = 0; k < N; k++) rzNew += r[k] * z[k + O];
      const beta = rzNew / rz;
      rz = rzNew;
      for (let k = 0; k < N; k++) p[k + O] = z[k + O] + beta * p[k + O];
    }
    phi.set(x.subarray(O, O + N));
    return it;
  }

  function energy(lv, w, phi) {
    const { nx1, N } = lv, { wE, wN } = w;
    let S = 0;
    for (let k = 0; k < N; k++) {
      const i = k % nx1;
      if (i + 1 < nx1) { const d = phi[k + 1] - phi[k]; S += wE[k] * d * d; }
      if (k + nx1 < N) { const d = phi[k + nx1] - phi[k]; S += wN[k] * d * d; }
    }
    return S;
  }

  // The coarser grid's solution on the finer one (each cell halved), as the
  // starting guess there; the held nodes keep their own values.
  function prolong(c, phiC, f) {
    const phi = new Float64Array(f.N);
    for (let j = 0; j < f.ny1; j++) {
      const jc = j >> 1, jo = j & 1;
      for (let i = 0; i < f.nx1; i++) {
        const ic = i >> 1, io = i & 1;
        const at = (a, b) => phiC[Math.min(b, c.ny1 - 1) * c.nx1 + Math.min(a, c.nx1 - 1)];
        phi[j * f.nx1 + i] = io && jo ? (at(ic, jc) + at(ic + 1, jc) + at(ic, jc + 1) + at(ic + 1, jc + 1)) / 4
          : io ? (at(ic, jc) + at(ic + 1, jc)) / 2 : jo ? (at(ic, jc) + at(ic, jc + 1)) / 2 : at(ic, jc);
      }
    }
    for (let k = 0; k < f.N; k++) if (f.fixed[k]) phi[k] = f.val[k];
    return phi;
  }

  function start(lv) { const phi = new Float64Array(lv.N); for (let k = 0; k < lv.N; k++) if (lv.fixed[k]) phi[k] = lv.val[k]; return phi; }

  // Solve a cross-section on three grids and extrapolate. The energy is
  // stationary in the potential, so its error is the square of the
  // potential's: a residual 3e-4 of the starting one leaves it within 1e-9.
  const TOL = 3e-4;
  function solveSpec(spec) {
    const t0 = (typeof performance !== "undefined" ? performance : Date).now();
    const zs = [], es = [];
    let iters = 0, nodes = 0, prev = null, phiA = null, phiE = null;
    for (let L = 0; L <= 2; L++) {
      const lv = makeLevel(spec, L);
      nodes = lv.N;
      const wa = weights(lv, true);
      phiA = prev ? prolong(prev, phiA, lv) : start(lv);
      iters += solvePotential(lv, wa, phiA, TOL);
      const Sa = energy(lv, wa, phiA);
      let S = Sa * (spec.er || 1);
      if (spec.layered) {
        const we = weights(lv, false);
        phiE = prev ? prolong(prev, phiE, lv) : start(lv);
        iters += solvePotential(lv, we, phiE, TOL);
        S = energy(lv, we, phiE);
      }
      zs.push(ETA0 / (spec.factor * Math.sqrt(S * Sa)));
      es.push(S / Sa);
      prev = lv;
    }
    const fit = (v) => { const R1 = 2 * v[1] - v[0], R2 = 2 * v[2] - v[1]; return (4 * R2 - R1) / 3; };
    return { z: fit(zs), eeff: fit(es), zs, nodes, iters, ms: (typeof performance !== "undefined" ? performance : Date).now() - t0 };
  }

  // ---- Cross-sections (lengths in mm) ----
  // Between two planes b apart, one dielectric: a single trace (s absent) or
  // an edge-coupled pair (odd or even mode), its bottom h1 above the lower
  // plane (centred when h1 is absent). With er2, two dielectrics: er under
  // the trace (the core it is etched on), er2 from the trace's bottom face
  // up, around it and above it (the prepreg).
  function stripline({ w, t, b, er, er2, s, mode, h1 }) {
    const single = !(s > 0);
    const y0 = h1 !== undefined ? h1 : (b - t) / 2, y1 = y0 + t;
    const x0 = single ? 0 : s / 2, x1 = x0 + (single ? w / 2 : w), X = x1 + 5 * b;
    // The finest step follows the smallest dimension, but a sliver typed by
    // mistake (1 µm of dielectric) must not make the grid enormous.
    const base = Math.min(b, w, single ? b : s);
    const m = Math.max(Math.min(base, y0, b - y1), base / 4);
    const two = er2 > 0 && er2 !== er;
    return {
      xb: [0, x0, x1, X], yb: t > 0 ? [0, y0, y1, b] : [0, y0, b], h0: m / 20, hmax: b / 4, grow: 1.25,
      rows: [0, b], cols: single || mode !== "odd" ? [X] : [X, 0], signals: [[x0, x1, y0, y1]],
      er, layers: two ? [[0, y0, er], [y0, b, er2]] : [], layered: two, factor: single ? 2 : 1,
    };
  }

  // Two traces one above the other, s apart face to face, centred between
  // planes b apart: the odd mode with the mid-plane at 0 V, or (mode
  // "even", both traces at +1 V) the mid-plane a free edge, a mirror. With
  // er2, two dielectrics: er between the traces (the core they are etched
  // on), er2 outside them, around the copper (the prepreg).
  function broadside({ w, t, s, b, er, er2, mode }) {
    const X = w / 2 + 5 * b, ya = b / 2 - s / 2 - t, yb = b / 2 - s / 2;
    const m = Math.min(b / 2, w, s, ya);
    const two = er2 > 0 && er2 !== er;
    return {
      xb: [0, w / 2, X], yb: t > 0 ? [0, ya, yb, b / 2] : [0, yb, b / 2], h0: m / 20, hmax: b / 4, grow: 1.25,
      rows: mode === "even" ? [0] : [0, b / 2], cols: [X], signals: [[0, w / 2, ya, yb]],
      er, layers: two ? [[0, yb, er2], [yb, b / 2, er]] : [], layered: two, factor: 2,
    };
  }

  // On h of substrate over a plane, air above (a far grounded box, 80 h): a
  // single trace or an edge-coupled pair, optionally covered by the same
  // dielectric up to H2 above the plane.
  // mask {c1, c2, er}: a solder mask's coat, c1 thick on the bare board and
  // c2 over the trace's top and sides, its own εr (a conformal coat); it
  // replaces a cover H2.
  function microstrip({ w, t, h, er, s, mode, H2, mask }) {
    const single = !(s > 0), top = 80 * h;
    const cover = mask ? h : H2 > h ? H2 : h;
    const x0 = single ? 0 : s / 2, x1 = x0 + (single ? w / 2 : w), X = x1 + 80 * h;
    const base = Math.min(h, w, single ? h : s);
    let m = Math.max(Math.min(base, cover > h ? cover - h : h), base / 4);
    const xb = [0, x0, x1, X], yb = [0, h, h + t, cover, top], blocks = [];
    if (mask) {
      const { c1, c2 } = mask, wl = single ? 0 : Math.max(0, x0 - c2), wr = x1 + c2;
      xb.push(wl, wr); yb.push(h + c1, h + t + c2);
      blocks.push([0, X, h, h + c1, mask.er], [wl, wr, h, h + t + c2, mask.er]);
      m = Math.max(Math.min(m, c1 || m, c2 || m), base / 4);
    }
    return {
      xb, yb, h0: m / 20, hmax: 10 * h, grow: 1.3,
      rows: [0, top], cols: single || mode !== "odd" ? [X] : [X, 0], signals: [[x0, x1, h, h + t]],
      layers: [[0, cover, er]], blocks, layered: true, factor: single ? 2 : 1,
    };
  }

  // Coplanar waveguide: a trace w wide on h of substrate, ground copper on
  // the same layer from s beyond each edge to the side wall, a plane under
  // the substrate (ground) or air below it, air above; a far grounded box,
  // 40 b above and below and 20 b past the gap (b = w + 2s; a paper-thin CPW
  // in air is then within 0.006 % of its exact 30π K(k')/K(k)).
  // With pair > 0, an edge-coupled pair: two traces w wide, pair apart,
  // each with its ground s beyond its outer edge; odd or even mode, one
  // trace's impedance (x = 0 the pair's centre line).
  function coplanar({ w, s, t, h, er, ground, pair, mode }) {
    const single = !(pair > 0);
    const x0 = single ? 0 : pair / 2, x1 = x0 + (single ? w / 2 : w), x2 = x1 + s, b = 2 * x2, X = x2 + 20 * b;
    const D = ground ? 0 : 40 * b, y0 = D + h, y1 = y0 + t, top = y1 + 40 * b;
    const base = single ? Math.min(w, s, h) : Math.min(w, s, h, pair);
    const m = Math.max(base, Math.max(w, s) / 1000);
    return {
      xb: [0, x0, x1, x2, X], yb: [0, D, y0, y1, top], h0: m / 20, hmax: 2 * Math.max(b, h), grow: 1.4,
      rows: [0, top], cols: single || mode !== "odd" ? [X] : [X, 0], signals: [[x0, x1, y0, y1]], grounds: [[x2, X, y0, y1]],
      layers: [[D, y0, er]], layered: true, factor: single ? 2 : 1,
    };
  }

  const KINDS = { stripline, broadside, microstrip, coplanar };
  function solve(kind, params) { return solveSpec(KINDS[kind](params)); }

  const api = { solve, solveSpec, KINDS, axis, ETA0, _parts: { makeLevel, weights, solvePotential, energy, prolong, start } };
  root.FieldSolver = api;
  // As a worker: answer {id, kind, params} with {id, result} or {id, error}.
  if (typeof WorkerGlobalScope !== "undefined" && root instanceof WorkerGlobalScope) {
    root.onmessage = (e) => {
      const { id, kind, params } = e.data;
      try { root.postMessage({ id, result: solve(kind, params) }); } catch (err) { root.postMessage({ id, error: String(err) }); }
    };
  }
})(typeof self !== "undefined" ? self : this);
