// Circuit Codex — formula reference data
// Independent of DOMAINS (js/data.js): the navigation tree is what you tap
// through, this is what "Formula search" searches. An entry's `tool` field is
// matched against a DOMAINS tool name at render time (or its old name, or a
// name merged into it), so a card links straight to the real calculator.
// A card for a built tool takes its lines from that tool's own Formula
// section, so the two say the same thing; a card for a tool not built yet is
// a correct, sourced answer on its own.
//
// Deliberately not attempted here: anything empirical, graph-based, or a
// lookup table rather than a formula (marking codes, trace ampacity, IP
// ratings, package sizes, battery types, cable colours, constants). Giving
// those a fabricated "formula" would be worse than leaving them out.
const FORMULAS = [
  // ---- Passive ----
  {
    tool: "Resistor power",
    domain: "passive",
    formulas: ["P = V² / R = I² × R", "Vmax = √(P × R), or the V max if lower"],
    note: "The power a resistor turns to heat; pick a rating above it. Small chips also have a maximum working voltage.",
  },
  {
    tool: "E-series values",
    domain: "passive",
    formulas: ["Eᵢ = 10^(i / N), i = 0 … N − 1", "N = 6, 12, 24, 48, 96 or 192"],
    note: "Each series splits a decade into N equal ratio steps: E24 for ±5 % parts, E96 for ±1 %. E6 to E24 differ from the formula in eight places.",
  },
  {
    tool: "Series/parallel (R)",
    domain: "passive",
    formulas: ["Series: R = R1 + R2 + …", "Parallel: 1/R = 1/R1 + 1/R2 + …", "Two in parallel: R = R1 × R2 / (R1 + R2)"],
    note: "In parallel the total is always below the smallest: two equal resistors give half of one.",
  },
  {
    tool: "Voltage divider",
    domain: "passive",
    formulas: ["Vout = Vin × R2 / (R1 + R2)", "R1 = R2 × (Vin − Vout) / Vout", "R2 = R1 × Vout / (Vin − Vout)"],
    note: "R1 on top, R2 to ground. A load on Vout pulls it down, as if in parallel with R2.",
  },
  {
    tool: "Current divider",
    domain: "passive",
    formulas: ["I1 = Iin × R2 / (R1 + R2)", "I2 = Iin × R1 / (R1 + R2)"],
    note: "Parallel resistors share a current in inverse proportion: the smaller one carries more, so R2 appears in I1's formula.",
  },
  {
    tool: "Wheatstone bridge",
    domain: "passive",
    formulas: ["At balance: R1 / R2 = R3 / Rx", "Rx = R2 × R3 / R1"],
    note: "Two dividers on one supply: when the meter G between their midpoints reads zero, the ratio holds whatever the supply.",
  },
  {
    tool: "Delta-Y transform",
    domain: "passive",
    formulas: ["Ra = Rab·Rca / (Rab+Rbc+Rca)", "Rab = (Ra·Rb+Rb·Rc+Rc·Ra) / Rc"],
    note: "Δ → Y, then Y → Δ; the other legs follow by symmetry. A triangle (Δ) and a star (Y) of three resistors that behave the same between terminals A, B and C. It untangles bridges.",
  },
  {
    tool: "NTC/PTC thermistor",
    domain: "passive",
    formulas: ["NTC: R = R0 × e^(B × (1/T − 1/T0))", "NTC: T = 1 / (1/T0 + ln(R/R0) / B)", "PTC: R = R0 × (1 + α × (T − T0))"],
    note: "B-parameter equation, T and T0 in kelvin (°C + 273.15). R0 is the resistance at T0, usually 25 °C.",
  },
  {
    tool: "Series/parallel (C)",
    domain: "passive",
    formulas: ["Parallel: C = C1 + C2 + …", "Series: 1/C = 1/C1 + 1/C2 + …", "Two in series: C = C1 × C2 / (C1 + C2)"],
    note: "The opposite of resistors. In series the smallest capacitor takes the largest share of the voltage.",
  },
  {
    tool: "Series/parallel (L)",
    domain: "passive",
    formulas: ["Series: L = L1 + L2 + …", "Parallel: 1/L = 1/L1 + 1/L2 + …"],
    note: "Like resistors, provided the coils' fields do not link: coupled coils add a mutual inductance.",
  },
  {
    tool: "RC time constant",
    domain: "passive",
    formulas: ["τ = R × C", "Charging: V(t) = Vs × (1 − e^(−t/τ))", "Discharging: V(t) = V0 × e^(−t/τ)"],
    note: "τ, the time constant: 63 % of the way after one τ, 99.3 % after five.",
  },
  {
    tool: "Capacitor energy",
    domain: "passive",
    formulas: ["E = ½ × C × V²", "Q = C × V"],
    note: "Twice the voltage stores four times the energy. Q is the charge, in coulombs.",
  },
  {
    tool: "RC filter",
    domain: "passive",
    formulas: ["fc = 1 / (2π × R × C)", "f(−3 dB, N poles) = fc × √(2^(1/N) − 1)"],
    note: "fc, the cutoff, is where the output is down to 70.7 %, −3 dB. One pole falls 20 dB per decade past it.",
  },
  {
    tool: "RL filter",
    domain: "passive",
    formulas: ["fc = R / (2π × L)", "f(−3 dB, N poles) = fc × √(2^(1/N) − 1)"],
    note: "An inductor in series blocks the highs (low-pass); to ground it shorts the lows (high-pass).",
  },

  // ---- Active ----
  {
    tool: "Diode forward voltage",
    domain: "active",
    formulas: ["V(R) = Vs − Vf", "I = (Vs − Vf) / R"],
    note: "Vf, the forward voltage, rises with current; silicon's 0.6 to 0.7 V holds at a few milliamps.",
  },
  {
    tool: "LED series resistor",
    domain: "active",
    formulas: ["R = (Vs − n·Vf) / I", "P = (Vs − n·Vf) × I"],
    note: "n LEDs in series under one resistor. The resistor, not the LED, sets the current.",
  },
  {
    tool: "BJT biasing",
    domain: "active",
    formulas: ["Vth = Vcc × R2 / (R1 + R2)", "Rth = R1 ∥ R2", "Ib = (Vth − Vbe) / (Rth + (β+1)·Re)", "Ic = β × Ib"],
    note: "β is hFE, the current gain. Voltage-divider bias: Re fixes the emitter current, so the operating point barely depends on hFE.",
  },
  {
    tool: "BJT as a switch",
    domain: "active",
    formulas: ["Ib = (Vin − Vbe) / Rb", "Ic(sat) = (Vcc − Vce,sat) / Rload", "Overdrive = hFE × Ib / Ic(sat)"],
    note: "Fully on needs more base current than the load asks for: an overdrive of 2 or more.",
  },
  {
    tool: "BJT currents",
    domain: "active",
    formulas: ["Ic = hFE × Ib", "Ie = Ib + Ic", "α = Ic / Ie = hFE / (hFE + 1)"],
    note: "hFE (β) is the DC current gain; α is just under 1.",
  },
  {
    tool: "MOSFET biasing",
    domain: "active",
    formulas: ["Vg = Vdd × R2 / (R1 + R2)", "Saturation: Id = k × (Vgs − Vth)²", "Vgs = Vg − Id × Rs"],
    note: "The square law above the threshold Vth; Rs pulls Vgs back as the current rises, so it settles.",
  },
  {
    tool: "MOSFET switching",
    domain: "active",
    formulas: ["I = Vdd / (Rload + Rds(on))", "Heat = I² × Rds(on)", "Rise = heat × RθJA"],
    note: "Rds(on) is guaranteed only at the gate voltage the datasheet names, not at the threshold Vgs(th).",
  },
  {
    tool: "Half-wave rectifier",
    domain: "active",
    formulas: ["Vp = Vac × √2", "Vdc ≈ (Vp − Vf) / π", "PIV = Vp"],
    note: "One diode, one pulse per cycle. PIV, the peak inverse voltage, is what the diode must block.",
  },
  {
    tool: "Bridge rectifier",
    domain: "active",
    formulas: ["Vp = Vac × √2", "Vdc ≈ 2 × (Vp − 2Vf) / π", "PIV = Vp per diode"],
    note: "Four diodes, two pulses per cycle; the current crosses two diodes, so two Vf are lost.",
  },
  {
    tool: "Center-tap rectifier",
    domain: "active",
    formulas: ["Vp = Vac (one half) × √2", "Vdc ≈ 2 × (Vp − Vf) / π", "PIV = 2Vp − Vf"],
    note: "Two diodes on a centre-tapped secondary: one Vf lost, but each diode blocks the whole secondary.",
  },
  {
    tool: "Rectifier ripple",
    domain: "active",
    formulas: ["Vpk = Vac × √2 − n·Vf", "Vr(p-p) ≈ Vpk / (fr × Rload × C)", "Vdc ≈ Vpk − Vr / 2"],
    note: "fr is the ripple frequency: the mains frequency for a half-wave, twice it for a bridge or centre tap.",
  },
  {
    tool: "AC phase control",
    domain: "active",
    formulas: ["Vrms = Vac × √((π − α + sin(2α)/2) / π)", "P = Vrms² / Rload"],
    note: "Firing a thyristor at angle α (radians here) in each half-cycle cuts the start of the wave: how dimmers work.",
  },
  {
    tool: "Inverting",
    domain: "active",
    formulas: ["Gain = −Rf / Rin", "Zin = Rin", "Bandwidth = GBW / (1 + Rf / Rin)"],
    note: "The − input is a virtual ground, so Vin / Rin all flows on through Rf. The minus is the inversion.",
  },
  {
    tool: "Non-inverting",
    domain: "active",
    formulas: ["Gain = 1 + Rf / R1", "Bandwidth = GBW / Gain"],
    note: "Never below 1, same way up; the input is the op-amp's own, megohms and up.",
  },
  {
    tool: "Buffer",
    domain: "active",
    formulas: ["Vout = Vin", "Without it: Vin × RL / (Rs + RL)"],
    note: "Gain 1. It keeps a source's internal resistance Rs from dividing its voltage against the load RL.",
  },
  {
    tool: "Comparators",
    domain: "active",
    formulas: ["Vref = V × R2 / (R1 + R2)", "Vout = −Vsat if Vin > Vref, else +Vsat"],
    note: "No feedback: the output sits at one of two levels. Hysteresis keeps a noisy input from chattering.",
  },
  {
    tool: "Integrator",
    domain: "active",
    formulas: ["Vout(t) = −(1 / RC) × ∫ Vin dt", "Ramp = Vin / RC", "f₀ = 1 / (2π × RC)"],
    note: "The output is the running total of the input; a steady input makes a steady ramp, inverted.",
  },
  {
    tool: "Differentiator",
    domain: "active",
    formulas: ["Vout = −RC × dVin/dt", "f₀ = 1 / (2π × RC)"],
    note: "The output follows the input's slope, not its level: a triangle in gives a square out.",
  },
  {
    tool: "Summing",
    domain: "active",
    formulas: ["Vout = −Rf × (V1 / R1 + V2 / R2 + …)", "Weight of input k = −Rf / Rk"],
    note: "Each input's current meets at the virtual ground and flows on through Rf. Equal resistors give a plain sum.",
  },
  {
    tool: "Differential",
    domain: "active",
    formulas: ["If R3 / R2 = Rf / R1:", "Vout = (Rf / R1) × (V2 − V1)", "CMRR = 20 × log₁₀(|Ad / Acm|)", "Worst CMRR, ±t: (1 + Rf/R1) / 4t"],
    note: "Amplifies the difference and rejects what both inputs share, only as well as the resistors match.",
  },
  {
    tool: "Photocell / LDR",
    domain: "active",
    formulas: ["R_LDR = R(10 lx) × (light / 10)^−γ", "Vout = Vcc × R / (R_LDR + R)"],
    note: "γ, from the datasheet, is how steeply the resistance falls with light. Most sensitive when R = R_LDR.",
  },
  {
    tool: "Optocoupler",
    domain: "active",
    formulas: ["Rin = (Vin − Vf) / If", "Ic available = If × CTR / 100", "Ic needed = (Vcc − Vce(sat)) / RL"],
    note: "CTR, the current transfer ratio, in %. Aim for twice the current needed.",
  },
  {
    tool: "Wavelength ↔ color",
    domain: "active",
    formulas: ["f = c / λ", "E = h × c / λ", "E (eV) = 1239.84 / λ (nm)"],
    note: "λ is the wavelength, h Planck's constant. The eye sees about 380 to 780 nm.",
  },

  // ---- Digital ----
  {
    tool: "Logic gates",
    domain: "digital",
    formulas: ["AND: Y = A · B · OR: Y = A + B", "XOR: Y = A ⊕ B", "NOT: Y = <span style=\"text-decoration:overline\">A</span> · NAND: Y = <span style=\"text-decoration:overline\">A · B</span>"],
    note: "In Boolean algebra · is AND, + is OR and a bar is NOT.",
  },
  {
    tool: "Flip-flops",
    domain: "digital",
    formulas: ["D: Q⁺ = D · T: Q⁺ = T ⊕ Q", "JK: Q⁺ = J · Q̄ + K̄ · Q", "SR: Q⁺ = S + R̄ · Q, S · R = 0"],
    note: "Q⁺ is the state after the clock's active edge. SR forbids S = R = 1; JK makes it toggle.",
  },
  {
    tool: "Multivibrators",
    domain: "digital",
    formulas: ["T1 = ln2 × R1 × C1, T2 = ln2 × R2 × C2", "f = 1 / (T1 + T2), Duty = T1 / (T1 + T2)"],
    note: "The two-transistor astable: each half lasts while one capacitor recharges.",
  },
  {
    tool: "555 timer",
    domain: "digital",
    formulas: ["t high = ln2 × (R1 + R2) × C", "t low = ln2 × R2 × C", "f ≈ 1.44 / ((R1 + 2R2) × C)", "Duty = (R1 + R2) / (R1 + 2R2)"],
    note: "Astable: C charges through R1 + R2 and discharges through R2, between ⅓ and ⅔ Vcc, so the duty is always above 50 %.",
  },
  {
    tool: "Number bases",
    domain: "digital",
    formulas: ["Value = Σ digit × baseⁿ", "Signed: −2ʷ⁻¹ … 2ʷ⁻¹ − 1"],
    note: "n counts from 0 at the right; w is the width in bits. One hex digit is 4 bits, one octal digit 3. Two's complement: a set top bit means bits − 2ʷ.",
  },
  {
    tool: "ASCII table",
    domain: "digital",
    formulas: ["Lower case = upper case + 0x20", "Digit value = code − 0x30", "Ctrl + key = key's code AND 0x1F"],
    note: "ASCII is a 7-bit code, 0 to 127; 0 to 31 and 127 are control characters.",
  },
  {
    tool: "PWM (duty cycle)",
    domain: "digital",
    formulas: ["D = Ton / T, T = 1 / f", "Average = Vlow + D × (Vhigh − Vlow)", "RMS = √(Vlow² × (1 − D) + Vhigh² × D)"],
    note: "D, the duty cycle, is the share of each period spent high.",
  },
  {
    tool: "Switch debounce",
    domain: "digital",
    formulas: ["Press = R2 · C · ln(Vcc / VT−)", "Release = (R1+R2) · C · −ln(1 − VT+/Vcc)"],
    note: "Into a Schmitt-trigger input, thresholds VT+ and VT−. Size each delay to the bounce time.",
  },
  {
    tool: "I2C pull-up resistor",
    domain: "digital",
    formulas: ["Rp min = (Vdd − V_OL) / I_OL", "Rp max = t_r / (0.8473 × Cb)"],
    note: "Per the I2C specification (UM10204): Rp min protects the driver, Rp max keeps the rise time t_r within the bus speed.",
  },
  {
    tool: "UART baud rate",
    domain: "digital",
    formulas: ["Divisor = Clock / (Oversample × Baud)", "Error = (Actual − Baud) / Baud"],
    note: "The divisor is rounded to a whole number, so the rate comes out a little off. 8N1 frames are 10 bits.",
  },
  {
    tool: "Crystal load",
    domain: "digital",
    formulas: ["Load = CL1 × CL2 / (CL1 + CL2) + Stray", "CL1 = CL2 = 2 × (CL − Stray)"],
    note: "CL, the crystal's load capacitance, is on its datasheet. Stray is the board's; ST's AN2867 assumes 5 pF in its example.",
  },
  {
    tool: "Oscillator stability",
    domain: "digital",
    formulas: ["Worst case = offset ± (Tol + Temp + Age)", "Hz = ppm × f / 10⁶", "Per day = ppm × 86.4 ms"],
    note: "Tolerance, temperature stability and ageing are ± limits and add; pulling and a fork's parabola shift the window.",
  },
  {
    tool: "PLL settings",
    domain: "digital",
    formulas: ["PFD = Input / M", "VCO = PFD × N", "Out = VCO / P"],
    note: "M, N and P are the PLL's dividers; the PFD and VCO frequencies must stay in the datasheet's ranges.",
  },
  {
    tool: "ADC resolution",
    domain: "digital",
    formulas: ["LSB = VREF / 2ᴺ", "Code = round(Vin / LSB)"],
    note: "N is the resolution in bits. The rounding error is never more than half an LSB.",
  },
  {
    tool: "DAC resolution",
    domain: "digital",
    formulas: ["LSB = VREF × Gain / 2ᴺ", "Vout = Code × LSB"],
    note: "The top code stops one LSB under VREF. The SAMD21 and ESP32 datasheets divide by 2ᴺ − 1 instead, so their top code is VREF itself.",
  },
  {
    tool: "SNR estimation",
    domain: "digital",
    formulas: ["SNR = 6.02N + 1.76 dB", "ENOB = (SINAD − 1.76) / 6.02", "SNR(jitter) = −20 log(2π × fin × tj)"],
    note: "The ideal SNR of an N-bit ADC, for a full-scale sine over dc to fs/2. ENOB turns a datasheet's measured SINAD back into bits.",
  },

  // ---- RF ----
  {
    tool: "Path loss",
    domain: "rf",
    formulas: ["Lbf = 20 log₁₀(4πd / λ)", "Lbf = 32.45 + 20 log₁₀ f + 20 log₁₀ d"],
    note: "Free-space loss between isotropic antennas, f in MHz and d in km (ITU-R P.525-5, which rounds the constant to 32.4).",
  },
  {
    tool: "Radio wavelength",
    domain: "rf",
    formulas: ["λ = c / f", "T = 1 / f"],
    note: "c = 299 792 458 m/s. In a cable or a trace, multiply λ by the velocity factor.",
  },
  {
    tool: "VSWR / Return loss",
    domain: "rf",
    formulas: ["VSWR = (1 + |Γ|) / (1 − |Γ|)", "Return loss (dB) = −20 log₁₀|Γ|"],
    note: "Γ is the reflection coefficient, 0 (perfect match) to 1 (total reflection).",
  },
  {
    tool: "Antenna length (dipole/monopole)",
    domain: "rf",
    formulas: ["Half-wave dipole = 468 / f", "Quarter-wave monopole = 234 / f"],
    note: "Length in feet, f in MHz. 468 is 95 % of a free-space half wave (491.8 / f): the usual allowance for end effect on thin wire. Trim it on the air.",
  },

  // ---- Power ----
  {
    tool: "Battery runtime",
    domain: "power",
    formulas: ["Runtime = Capacity × Usable % / I"],
    note: "Runtime in h, capacity in Ah, the load current I in A. Constant current; real cells give less at high rates and below their cutoff voltage.",
  },
  {
    tool: "Battery C-rate",
    domain: "power",
    formulas: ["Current (A) = C-rate × Capacity (Ah)", "Time (h) = 1 / C-rate"],
    note: "1C moves the full rated capacity in one hour: a 2000 mAh cell at 1C draws 2 A.",
  },
  {
    tool: "Internal resistance",
    domain: "power",
    formulas: ["R = (V1 − V2) / (I2 − I1)", "V = Voc − I × R"],
    note: "Energizer's dual pulse: a light drain, then a heavier pulse. The resistance rises as the cell discharges and in the cold.",
  },
  {
    tool: "Linear regulator",
    domain: "power",
    formulas: ["Vout = Vref (1 + R2/R1) + Iadj·R2", "P = (Vin − Vout) × I", "Tj = Ta + P × RθJA"],
    note: "LM317: Vref 1.25 V, Iadj ≈ 50 µA, R1 from OUT to ADJ (TI datasheet, eq. 2). Every volt dropped becomes heat.",
  },
  {
    tool: "DC/DC buck converter",
    domain: "power",
    formulas: ["Vout = D × Vin"],
    note: "Ideal, continuous conduction; D is the duty cycle as a fraction, 0 to 1. Real converters lose a few per cent.",
  },
  {
    tool: "DC/DC boost converter",
    domain: "power",
    formulas: ["Vout = Vin / (1 − D)"],
    note: "Ideal, continuous conduction; D is the duty cycle as a fraction, 0 to 1.",
  },
  {
    tool: "Thermal resistance (θJA / θJC)",
    domain: "power",
    formulas: ["TJ = TA + P × θJA", "TJ = TC + P × θJC"],
    note: "θ in °C/W from the datasheet: junction to ambient (JA) or to case (JC). P is the power the part dissipates.",
  },

  // ---- PCB ----
  {
    tool: "Wire sizing",
    domain: "pcb",
    formulas: ["AWG: d(mm) = 0.127 × 92^((36 − n) / 39)", "R = 2L × (1/58 Ω·mm²/m) / A", "Vdrop = I × R"],
    note: "Six AWG steps double the diameter. The 2 is the round trip through both wires. Copper is 1/58 Ω·mm²/m at 20 °C, +0.393 % per °C.",
  },

  {
    tool: "Trace width",
    domain: "pcb",
    formulas: ["ΔT = 215.3 · I² · W^−1.15 · Th^−1 (outer)", "R = ρ · L / (W · Th)"],
    note: "IPC-2152, as fitted by Brooks and Adam: W and Th in mils, 1 oz = 1.37 mil. Inner traces have their own fits.",
  },

  // ---- Tools ----
  {
    tool: "Ohm's law",
    domain: "tools",
    formulas: ["V = I × R", "P = V × I = I² × R = V² / R", "I = √(P / R) · V = √(P × R)"],
    note: "Any two of voltage, current, resistance and power give the other two.",
  },
  {
    tool: "AC Ohm's law",
    domain: "tools",
    formulas: ["XL = 2πfL · XC = 1 / (2πfC)", "Series: Z = R + j(XL − XC)", "V = I × Z · PF = P / S = cos φ"],
    note: "V = I × Z for R, L and C. In parallel the admittances 1/Z add. At resonance, f₀ = 1 / (2π√(LC)), XL and XC cancel.",
  },
  {
    tool: "Kirchhoff's laws",
    domain: "tools",
    formulas: ["Current law: ΣI = 0 at a node", "Voltage law: ΣV = 0 around a loop"],
    note: "Charge cannot pile up at a node, and a loop ends where it started: + for a current in or a rise, − for a current out or a drop.",
  },
  {
    tool: "SI prefix converter",
    domain: "tools",
    formulas: ["value in a prefix = value ÷ 10ⁿ", "p 10⁻¹² · n 10⁻⁹ · µ 10⁻⁶ · m 10⁻³", "k 10³ · M 10⁶ · G 10⁹"],
    note: "Engineering notation keeps to steps of 1000, so the number stays between 1 and 999.",
  },
  {
    tool: "Tolerance & error",
    domain: "tools",
    formulas: ["min = nominal × (1 − below / 100)", "max = nominal × (1 + above / 100)", "error = (measured − expected) / expected"],
    note: "The error × 100 is in %. A tolerance is the maker's worst case, not a typical spread. Code letters per IEC 60062: J ±5 %, K ±10 %, M ±20 %.",
  },
  {
    tool: "dB ratio",
    domain: "tools",
    formulas: ["power: dB = 10 log₁₀(P2 / P1)", "voltage, current: dB = 20 log₁₀(V2 / V1)"],
    note: "Power ratios use 10, voltage and current ratios 20: ×2 in voltage and ×4 in power are both +6.02 dB.",
  },
  {
    tool: "dB levels",
    domain: "tools",
    formulas: ["dBm = 10 log₁₀(P / 1 mW)", "dBV = 20 log₁₀(V / 1 V)", "dBu = 20 log₁₀(V / 0.7746 V)"],
    note: "A level is against a fixed reference. Voltages are rms; 0 dBm is 0 dBu only across 600 Ω.",
  },
  {
    tool: "RMS calculator",
    domain: "tools",
    formulas: ["Vrms = √(mean of v²)", "Sine: Vp / √2 · Triangle: Vp / √3", "Square: Vp · Pulse at duty D: Vp × √D", "Crest factor = Vpeak / Vrms"],
    note: "RMS is the DC value that heats a resistor the same. An average-responding meter is right only on a sine.",
  },
  {
    tool: "Unit converter",
    domain: "tools",
    formulas: ["°F = °C × 1.8 + 32 · K = °C + 273.15", "1 in = 25.4 mm = 1000 mil", "1 KiB = 1024 byte · 1 kB = 1000 byte"],
    note: "Temperature is the one offset scale; every other unit is a fixed factor (NIST SP 811).",
  },
  {
    tool: "PPM converter",
    domain: "tools",
    formulas: ["deviation = value × ppm / 10⁶", "1 % = 10 000 ppm", "error = (Vm − Vn) / Vn × 10⁶ ppm", "R(T2) = R(T1) × (1 + α·ΔT)"],
    note: "ppm is a relative value of 10⁻⁶ (SI Brochure §5.4.7). Vm is the measured value, Vn the nominal; α is the tempco, ppm/K × 10⁻⁶, and ΔT = T2 − T1.",
  },
];

// Sorted once here rather than hand-ordered above, so the list stays correct
// as entries are added anywhere in it — no risk of a manual reorder mistake,
// and filtering preserves this order since it just filters the sorted array.
FORMULAS.sort((a, b) => a.tool.localeCompare(b.tool, undefined, { sensitivity: "base" }));

// Case-insensitive match against topic name, formula text and the note —
// "duty cycle" should find the 555 timer even though "duty cycle" is not in
// its tool name. Markup (the overline spans) is left out of the match.
function searchFormulas(query) {
  // searchFold (app.js) lower-cases and drops apostrophes: Ohm’s finds Ohm's.
  const q = searchFold(query.trim());
  if (!q) return [];
  const text = (s) => searchFold(s.replace(/<[^>]+>/g, ""));
  return FORMULAS.filter(f =>
    text(f.tool).includes(q) ||
    f.formulas.some(x => text(x).includes(q)) ||
    text(f.note).includes(q)
  );
}
