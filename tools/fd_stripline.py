"""Check for Asymmetric stripline (and Stripline impedance): a 2D finite-difference field solver for a (possibly offset) stripline.

Cross-section: ground planes at y = 0 and y = B = h1 + t + h2, a trace of
width w and thickness t (t = 0 allowed) whose bottom is h1 above the lower
plane. Homogeneous dielectric, so Z0 = eta0 / (sqrt(er) * S), S = the
integral of |grad phi|^2 with phi = 1 on the trace (C_air / eps0).
Half domain, mirror at the trace centre; side wall far away grounded.
"""
import math, sys
import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spl
from scipy.special import ellipk

ETA0 = 376.730313668


def solve(w, t, h1, h2, er, d, side=4.0):
    """Lengths in any unit; d the cell size. Returns Z0."""
    B = h1 + t + h2
    j1 = round(h1 / d); jt = round(t / d); j2 = round(h2 / d)
    Ny = j1 + jt + j2
    iw = round(w / 2 / d)
    Nx = iw + round(side * B / d)
    nx, ny = Nx + 1, Ny + 1
    idx = lambda i, j: j * nx + i
    fixed = np.zeros(nx * ny, bool); val = np.zeros(nx * ny)
    for i in range(nx):
        fixed[idx(i, 0)] = fixed[idx(i, Ny)] = True
    for j in range(ny):
        fixed[idx(Nx, j)] = True
    for j in range(j1, j1 + jt + 1):
        for i in range(0, iw + 1):
            fixed[idx(i, j)] = True; val[idx(i, j)] = 1.0
    free = np.where(~fixed)[0]
    pos = -np.ones(nx * ny, int); pos[free] = np.arange(len(free))
    rows, cols, data = [], [], []
    rhs = np.zeros(len(free))
    for k, n in enumerate(free):
        i, j = n % nx, n // nx
        rows.append(k); cols.append(k); data.append(4.0)
        nb = [(i + 1, j), (i - 1 if i > 0 else 1, j), (i, j + 1), (i, j - 1)]
        for (a, b) in nb:
            m = idx(a, b)
            if fixed[m]:
                rhs[k] += val[m]
            else:
                rows.append(k); cols.append(pos[m]); data.append(-1.0)
    A = sp.csr_matrix((data, (rows, cols)), shape=(len(free), len(free)))
    x = spl.spsolve(A, rhs)
    phi = val.copy(); phi[free] = x
    P = phi.reshape(ny, nx)
    dx = np.diff(P, axis=1) ** 2  # horizontal edges, full weight
    dy = np.diff(P, axis=0) ** 2  # vertical edges; those at i = 0 half
    S_half = dx.sum() + dy[:, 1:].sum() + 0.5 * dy[:, 0].sum()
    S = 2 * S_half
    return ETA0 / (math.sqrt(er) * S)


def converged(w, t, h1, h2, er, base, levels=(1, 2, 4)):
    zs = [solve(w, t, h1, h2, er, base / L) for L in levels]
    # Richardson on the last two, assuming first order (corner singularity)
    rich = 2 * zs[-1] - zs[-2]
    return zs, rich


def cohn(w, b, er):
    k = 1 / math.cosh(math.pi * w / (2 * b)); kp = math.tanh(math.pi * w / (2 * b))
    return 30 * math.pi / math.sqrt(er) * ellipk(k * k) / ellipk(kp * kp)


def extrapolated(w, t, h1, h2, er, base):
    """Three refinements (base, base/2, base/4), then Richardson with the
    observed order. Every length must be a whole number of base cells."""
    zs = [solve(w, t, h1, h2, er, base / L) for L in (1, 2, 4)]
    p = math.log((zs[1] - zs[0]) / (zs[2] - zs[1]), 2)
    return zs[2] + (zs[2] - zs[1]) / (2 ** p - 1)


if __name__ == "__main__":
    # Needs numpy and scipy. Lengths in mm.
    print("Cohn exact, w/b 1/3, er 4.3:", round(cohn(0.2, 0.6, 4.3), 2))
    print("solver, zero thickness:     ", round(extrapolated(0.2, 0.0, 0.3, 0.3, 4.3, 0.02), 2))
    t = 0.035
    for (w, h1, h2) in [(0.2, 0.2825, 0.2825), (0.2, 0.2, 0.4), (0.1, 0.1, 0.5)]:
        print(f"w {w} h1 {h1} h2 {h2} t {t}:", round(extrapolated(w, t, h1, h2, 4.3, 0.005), 2))
