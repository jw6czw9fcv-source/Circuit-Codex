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
  // incomplete Cholesky factorisation (MIC(0), relaxation ω). phi holds the
  // fixed values and the starting guess; it is solved in place.
  function solvePotential(lv, w, phi, tol) {
    const { nx1, N, fixed } = lv, { wE, wN } = w;
    const O = nx1 + 1;                       // padding: neighbours of any node are in range
    const P = (a) => { const out = new Float64Array(N + 2 * O); out.set(a, O); return out; };
    const x = P(phi);
    const diag = new Float64Array(N), D = new Float64Array(N);
    for (let k = 0; k < N; k++) {
      const i = k % nx1;
      diag[k] = wE[k] + (i > 0 ? wE[k - 1] : 0) + wN[k] + (k >= nx1 ? wN[k - nx1] : 0);
    }
    const OMEGA = 0.97;
    for (let k = 0; k < N; k++) {
      if (fixed[k]) continue;
      let d = diag[k];
      const i = k % nx1;
      if (i > 0 && !fixed[k - 1]) {
        const a = wE[k - 1], f = k - 1 + nx1 < N && !fixed[k - 1 + nx1] ? wN[k - 1] : 0;
        d -= a * (a + OMEGA * f) / D[k - 1];
      }
      if (k >= nx1 && !fixed[k - nx1]) {
        const a = wN[k - nx1], f = i + 1 < nx1 && !fixed[k - nx1 + 1] ? wE[k - nx1] : 0;
        d -= a * (a + OMEGA * f) / D[k - nx1];
      }
      D[k] = d > 1e-12 * diag[k] ? d : diag[k];
    }
    const r = new Float64Array(N), q = new Float64Array(N);
    const z = P(new Float64Array(N)), p = P(new Float64Array(N)), u = new Float64Array(N);
    // r = −A x on the free nodes.
    let rr0 = 0;
    for (let k = 0; k < N; k++) {
      if (fixed[k]) continue;
      const c = k + O, i = k % nx1;
      const Ax = diag[k] * x[c] - wE[k] * x[c + 1] - (i > 0 ? wE[k - 1] : 0) * x[c - 1] - wN[k] * x[c + nx1] - (k >= nx1 ? wN[k - nx1] : 0) * x[c - nx1];
      r[k] = -Ax; rr0 += r[k] * r[k];
    }
    if (rr0 === 0) return 0;
    const precondition = () => {
      for (let k = 0; k < N; k++) {
        if (fixed[k]) { u[k] = 0; continue; }
        const i = k % nx1;
        let s = r[k];
        if (i > 0) s += wE[k - 1] * u[k - 1];
        if (k >= nx1) s += wN[k - nx1] * u[k - nx1];
        u[k] = s / D[k];
      }
      for (let k = N - 1; k >= 0; k--) {
        const c = k + O;
        if (fixed[k]) { z[c] = 0; continue; }
        z[c] = u[k] + (wE[k] * z[c + 1] + wN[k] * z[c + nx1]) / D[k];
      }
    };
    precondition();
    let rz = 0;
    for (let k = 0; k < N; k++) { p[k + O] = z[k + O]; rz += r[k] * z[k + O]; }
    let it = 0;
    for (; it < 5000; it++) {
      let pq = 0;
      for (let k = 0; k < N; k++) {
        if (fixed[k]) { q[k] = 0; continue; }
        const c = k + O, i = k % nx1;
        const v = diag[k] * p[c] - wE[k] * p[c + 1] - (i > 0 ? wE[k - 1] : 0) * p[c - 1] - wN[k] * p[c + nx1] - (k >= nx1 ? wN[k - nx1] : 0) * p[c - nx1];
        q[k] = v; pq += p[c] * v;
      }
      const alpha = rz / pq;
      let rr = 0;
      for (let k = 0; k < N; k++) {
        if (fixed[k]) continue;
        x[k + O] += alpha * p[k + O];
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

  // Solve a cross-section on three grids and extrapolate.
  function solveSpec(spec) {
    const t0 = (typeof performance !== "undefined" ? performance : Date).now();
    const zs = [], es = [];
    let iters = 0, nodes = 0, prev = null, phiA = null, phiE = null;
    for (let L = 0; L <= 2; L++) {
      const lv = makeLevel(spec, L);
      nodes = lv.N;
      const wa = weights(lv, true);
      phiA = prev ? prolong(prev, phiA, lv) : start(lv);
      iters += solvePotential(lv, wa, phiA, 1e-7);
      const Sa = energy(lv, wa, phiA);
      let S = Sa * (spec.er || 1);
      if (spec.layered) {
        const we = weights(lv, false);
        phiE = prev ? prolong(prev, phiE, lv) : start(lv);
        iters += solvePotential(lv, we, phiE, 1e-7);
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
  // plane (centred when h1 is absent).
  function stripline({ w, t, b, er, s, mode, h1 }) {
    const single = !(s > 0);
    const y0 = h1 !== undefined ? h1 : (b - t) / 2, y1 = y0 + t;
    const x0 = single ? 0 : s / 2, x1 = x0 + (single ? w / 2 : w), X = x1 + 5 * b;
    const m = Math.min(b, w, single ? b : s, y0, b - y1);
    return {
      xb: [0, x0, x1, X], yb: t > 0 ? [0, y0, y1, b] : [0, y0, b], h0: m / 20, hmax: b / 4, grow: 1.25,
      rows: [0, b], cols: single || mode !== "odd" ? [X] : [X, 0], signals: [[x0, x1, y0, y1]],
      er, layered: false, factor: single ? 2 : 1,
    };
  }

  // Two traces one above the other, s apart face to face, centred between
  // planes b apart: the odd mode, the mid-plane at 0 V.
  function broadside({ w, t, s, b, er }) {
    const X = w / 2 + 5 * b, ya = b / 2 - s / 2 - t, yb = b / 2 - s / 2;
    const m = Math.min(b / 2, w, s, ya);
    return {
      xb: [0, w / 2, X], yb: t > 0 ? [0, ya, yb, b / 2] : [0, yb, b / 2], h0: m / 20, hmax: b / 4, grow: 1.25,
      rows: [0, b / 2], cols: [X], signals: [[0, w / 2, ya, yb]], er, layered: false, factor: 2,
    };
  }

  // On h of substrate over a plane, air above (a far grounded box, 80 h): a
  // single trace or an edge-coupled pair, optionally covered by the same
  // dielectric up to H2 above the plane.
  function microstrip({ w, t, h, er, s, mode, H2 }) {
    const single = !(s > 0), top = 80 * h;
    const cover = H2 > h ? H2 : h;
    const x0 = single ? 0 : s / 2, x1 = x0 + (single ? w / 2 : w), X = x1 + 80 * h;
    const m = Math.min(h, w, single ? h : s, cover > h ? cover - h : h);
    return {
      xb: [0, x0, x1, X], yb: [0, h, h + t, cover, top], h0: m / 20, hmax: 10 * h, grow: 1.3,
      rows: [0, top], cols: single || mode !== "odd" ? [X] : [X, 0], signals: [[x0, x1, h, h + t]],
      layers: [[0, cover, er]], layered: true, factor: single ? 2 : 1,
    };
  }

  const KINDS = { stripline, broadside, microstrip };
  function solve(kind, params) { return solveSpec(KINDS[kind](params)); }

  const api = { solve, solveSpec, KINDS, axis, ETA0 };
  root.FieldSolver = api;
  // As a worker: answer {id, kind, params} with {id, result} or {id, error}.
  if (typeof WorkerGlobalScope !== "undefined" && root instanceof WorkerGlobalScope) {
    root.onmessage = (e) => {
      const { id, kind, params } = e.data;
      try { root.postMessage({ id, result: solve(kind, params) }); } catch (err) { root.postMessage({ id, error: String(err) }); }
    };
  }
})(typeof self !== "undefined" ? self : this);
