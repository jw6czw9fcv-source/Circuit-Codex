"""2D finite-difference field solver for PCB transmission lines, the check
behind Asymmetric stripline, Edge-coupled stripline, Broadside stripline,
Embedded microstrip and Differential microstrip.

A graded rectangular grid (fine at the conductors, coarse far away, every
edge of the geometry on a grid line); a permittivity per cell; conductors at
1 V, planes and odd-mode symmetry planes at 0 V; a free edge is a mirror
(even symmetry). The potential minimises the field energy, and

    S = phi . L phi  =  C / eps0        (L the weighted grid Laplacian)

so a line in one dielectric has Z0 = eta0 / (sqrt(er) S_air), and one over
layered dielectric Z0 = eta0 / sqrt(S S_air), eps_eff = S / S_air. Each
case is solved at three refinements (every cell halved each time) and
Richardson-extrapolated with the observed order. Needs numpy and scipy.
Lengths in any one unit (mm here).
"""
import math
import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spl
from scipy.special import ellipk

ETA0 = 376.730313668


def axis(breaks, h0, hmax, level, grow=1.25):
    """Grid coordinates through every break, steps h0 at the breaks growing
    by `grow` up to hmax, then every step split into 2**level."""
    bs = sorted(set(round(b, 12) for b in breaks))
    xs = [bs[0]]
    for a, b in zip(bs, bs[1:]):
        L = b - a; left, right, tot, k = [], [], 0.0, 0
        while tot < L - 1e-12:
            st = min(h0 * grow ** k, hmax); left.append(st); right.append(st); tot += 2 * st; k += 1
        steps = [s * L / tot for s in left + right[::-1]]
        for s in steps:
            for _ in range(2 ** level):
                xs.append(xs[-1] + s / 2 ** level)
        xs[-1] = b
    return np.array(xs)


class Grid:
    def __init__(self, xbreaks, ybreaks, h0, hmax, level):
        self.x = axis(xbreaks, h0, hmax, level); self.y = axis(ybreaks, h0, hmax, level)
        self.nx, self.ny = len(self.x) - 1, len(self.y) - 1
        self.eps = np.ones((self.ny, self.nx))
        self.fixed = np.zeros((self.ny + 1, self.nx + 1), bool)
        self.val = np.zeros((self.ny + 1, self.nx + 1))

    def i(self, v): k = int(np.argmin(abs(self.x - v))); assert abs(self.x[k] - v) < 1e-9; return k
    def j(self, v): k = int(np.argmin(abs(self.y - v))); assert abs(self.y[k] - v) < 1e-9; return k

    def box(self, x0, x1, y0, y1, volts=1.0):
        a, b, c, d = self.i(x0), self.i(x1), self.j(y0), self.j(y1)
        self.fixed[c:d + 1, a:b + 1] = True; self.val[c:d + 1, a:b + 1] = volts

    def row(self, y): k = self.j(y); self.fixed[k, :] = True; self.val[k, :] = 0
    def col(self, x): k = self.i(x); self.fixed[:, k] = True; self.val[:, k] = 0

    def layer(self, y0, y1, er):
        mid = (self.y[:-1] + self.y[1:]) / 2
        self.eps[(mid > y0) & (mid < y1), :] = er

    def S(self, air=False):
        eps = np.ones_like(self.eps) if air else self.eps
        ny, nx = eps.shape; dx, dy = np.diff(self.x), np.diff(self.y)
        pad = np.zeros((ny + 2, nx + 2)); pad[1:-1, 1:-1] = eps
        dyp = np.concatenate([[0], dy, [0]]); dxp = np.concatenate([[0], dx, [0]])
        # Horizontal edge (i,j)-(i+1,j): the cells below and above it.
        wh = (pad[0:ny + 1, 1:nx + 1] * dyp[0:ny + 1, None] / 2 + pad[1:ny + 2, 1:nx + 1] * dyp[1:ny + 2, None] / 2) / dx[None, :]
        # Vertical edge (i,j)-(i,j+1): the cells left and right of it.
        wv = (pad[1:ny + 1, 0:nx + 1] * dxp[None, 0:nx + 1] / 2 + pad[1:ny + 1, 1:nx + 2] * dxp[None, 1:nx + 2] / 2) / dy[:, None]
        N = (ny + 1) * (nx + 1); idx = np.arange(N).reshape(ny + 1, nx + 1)
        a = np.concatenate([idx[:, :-1].ravel(), idx[:-1, :].ravel()])
        b = np.concatenate([idx[:, 1:].ravel(), idx[1:, :].ravel()])
        w = np.concatenate([wh.ravel(), wv.ravel()])
        L = sp.coo_matrix((np.concatenate([w, w, -w, -w]), (np.concatenate([a, b, a, b]), np.concatenate([a, b, b, a]))), shape=(N, N)).tocsr()
        f = self.fixed.ravel(); v = self.val.ravel()
        free, fix = np.where(~f)[0], np.where(f)[0]
        phi = v.copy()
        phi[free] = spl.spsolve(L[free][:, free].tocsc(), -(L[free][:, fix] @ v[fix]))
        return float(phi @ (L @ phi))


def extrapolate(f):
    zs = [f(L) for L in (1, 2, 3)]
    r = (zs[1] - zs[0]) / (zs[2] - zs[1])
    p = math.log(r, 2) if r > 1 else 1.0
    return zs[2] + (zs[2] - zs[1]) / (2 ** p - 1)


def _h(scale):  # base step at the conductors and the coarsest step
    return scale / 40, scale / 4


def stripline_pair(w, t, s, b, er, mode, level):
    """Edge-coupled strips centred between planes b apart, gap s; s None
    for a single strip. x = 0: the gap's centre (0 V odd, mirror even) or
    the single strip's centre line (mirror, energy doubled)."""
    single = s is None
    x0 = 0 if single else s / 2; x1 = x0 + (w / 2 if single else w); X = x1 + 5 * b
    y0, y1 = (b - t) / 2, (b + t) / 2
    h0, hm = _h(min(b, w, s or b) )
    g = Grid([0, x0, x1, X], [0, y0, y1, b] if t > 0 else [0, y0, b], h0, hm, level)
    g.row(0); g.row(b); g.col(X)
    if not single and mode == "odd": g.col(0)
    g.box(x0, x1, y0, y1)
    return ETA0 / (math.sqrt(er) * (2 if single else 1) * g.S(air=True))


def broadside_pair(w, t, s, b, er, level):
    """Strips one above the other, s apart face to face, centred between
    planes b apart; odd mode: the mid-plane at 0 V. x = 0 the centre line."""
    X = w / 2 + 5 * b; ya, yb = b / 2 - s / 2 - t, b / 2 - s / 2
    h0, hm = _h(min(b / 2, w, s))
    g = Grid([0, w / 2, X], [0, ya, yb, b / 2] if t > 0 else [0, yb, b / 2], h0, hm, level)
    g.row(0); g.row(b / 2); g.col(X)
    g.box(0, w / 2, ya, yb)
    return ETA0 / (math.sqrt(er) * 2 * g.S(air=True))


def microstrip_pair(w, t, s, h, er, mode, level):
    """Edge-coupled microstrip, s None for one trace. Substrate h thick on
    the plane, air above up to a far grounded lid (20 h)."""
    single = s is None
    x0 = 0 if single else s / 2; x1 = x0 + (w / 2 if single else w); X = x1 + 20 * h; top = 20 * h
    h0, hm = _h(min(h, w, s or h))
    g = Grid([0, x0, x1, X], [0, h, h + t, top] if t > 0 else [0, h, top], h0, max(hm, h), level)
    g.row(0); g.row(top); g.col(X)
    if not single and mode == "odd": g.col(0)
    g.layer(0, h, er)
    g.box(x0, x1, h, h + t)
    S, Sa = g.S(), g.S(air=True)
    k = 2 if single else 1
    return ETA0 / (k * math.sqrt(S * Sa)), S / Sa


def embedded(w, t, h1, H2, er, level, er_cover=None):
    """One trace on h1 of substrate, a cover of the same (or er_cover)
    dielectric up to H2 above the plane, air above to a far lid (20 h1)."""
    x1 = w / 2; X = x1 + 20 * h1; top = max(20 * h1, H2 + 10 * h1)
    ys = sorted(set([0, h1, h1 + t, H2, top]))
    h0, hm = _h(min(h1, w, (H2 - h1) if H2 > h1 else h1))
    g = Grid([0, x1, X], ys, h0, max(hm, h1), level)
    g.row(0); g.row(top); g.col(X)
    g.layer(0, h1, er)
    if H2 > h1: g.layer(h1, H2, er_cover or er)
    g.box(0, x1, h1, h1 + t)
    S, Sa = g.S(), g.S(air=True)
    return ETA0 / (2 * math.sqrt(S * Sa)), S / Sa


def cohn_single(w, b, er):
    k = 1 / math.cosh(math.pi * w / (2 * b)); kp = math.tanh(math.pi * w / (2 * b))
    return 30 * math.pi / math.sqrt(er) * ellipk(k * k) / ellipk(kp * kp)


def cohn_odd(w, s, b, er):
    ko = math.tanh(math.pi * w / (2 * b)) / math.tanh(math.pi * (w + s) / (2 * b))
    return 30 * math.pi / math.sqrt(er) * ellipk(1 - ko * ko) / ellipk(ko * ko)


if __name__ == "__main__":
    er = 4.3
    print("single strip, t 0, w 0.2 b 0.6: Cohn", round(cohn_single(0.2, 0.6, er), 3),
          "solver", round(extrapolate(lambda L: stripline_pair(0.2, 0, None, 0.6, er, None, L)), 3))
    print("odd pair, t 0, w 0.2 s 0.2 b 0.6: Cohn", round(cohn_odd(0.2, 0.2, 0.6, er), 3),
          "solver", round(extrapolate(lambda L: stripline_pair(0.2, 0, 0.2, 0.6, er, "odd", L)), 3))
    # Polar Instruments (Burkhardt, Gregg, Staniforth, IPC 1999) table 1:
    # t 35 um, h 794 um, er 4.2, their boundary-element values.
    for w, ref in [(3.3, 30.09), (1.5, 50.63), (0.45, 89.63)]:
        z = extrapolate(lambda L: microstrip_pair(w, 0.035, None, 0.794, 4.2, None, L)[0])
        print(f"microstrip w {w}: Polar {ref}, solver {z:.2f}")
