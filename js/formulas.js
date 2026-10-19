// Circuit Codex — formula reference data
// Independent of DOMAINS (js/data.js): the navigation tree is what you tap
// through, this is what "Formula search" searches. An entry's `tool` field is
// matched against a DOMAINS tool name at render time, so a card links straight
// to the real calculator once one exists for that topic — until then it is
// still a correct, useful answer on its own.
//
// Deliberately not attempted here: anything empirical, graph-based, or a
// lookup table rather than a formula (trace ampacity, IP ratings, package
// sizes, battery types, coax standards). Giving those a fabricated "formula"
// would be worse than leaving them out. Those stay full calculators or
// reference tables to build properly, not entries here.
const FORMULAS = [
  {
    tool: "Ohm's law",
    domain: "tools",
    formulas: ["V = I × R", "P = V × I = I² × R = V² / R", "I = √(P / R) · V = √(P × R)"],
    note: "Any two of voltage, current, resistance and power give the other two.",
  },
  {
    tool: "Wheatstone bridge",
    domain: "passive",
    formulas: ["At balance: R1 / R2 = R3 / Rx", "Rx = R3 × R2 / R1"],
    note: "Galvanometer reads zero when the bridge is balanced — the unknown Rx falls out of the other three.",
  },
  {
    tool: "Delta-Y transform",
    domain: "passive",
    formulas: [
      "Δ→Y:  Ra = (Rab × Rca) / (Rab+Rbc+Rca)",
      "Y→Δ:  Rab = Ra+Rb + (Ra × Rb)/Rc",
    ],
    note: "Each Y resistor uses the two adjacent Δ resistors over the sum of all three; each Δ resistor sums two Y resistors plus their product over the third.",
  },
  {
    tool: "NTC/PTC thermistor",
    domain: "passive",
    formulas: ["R(T) = R0 · e^(B(1/T − 1/T0))"],
    note: "B-parameter equation. T and T0 in kelvin; R0 is resistance at reference temperature T0 (usually 25 °C).",
  },
  {
    tool: "PWM (duty cycle)",
    domain: "digital",
    formulas: ["Duty % = (t_on / T) × 100"],
    note: "T is the full period, t_on the time the signal is high within it.",
  },
  {
    tool: "555 timer",
    domain: "digital",
    formulas: ["f = 1.44 / ((R1 + 2R2) × C)", "Duty = (R1 + R2) / (R1 + 2R2)"],
    note: "Standard astable configuration. Duty cycle is always above 50% in this topology.",
  },
  {
    tool: "ADC resolution",
    domain: "digital",
    formulas: ["LSB = VREF / 2ᴺ", "Code = round(Vin / LSB)"],
    note: "N is the resolution in bits. A bipolar ADC spans ±FSR, so its LSB is 2 × FSR / 2ᴺ.",
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
  {
    tool: "I2C pull-up resistor",
    domain: "digital",
    formulas: ["R_min = (Vdd − Vol) / Iol", "R_max ≈ t_rise / (0.8473 × C_bus)"],
    note: "Per the I2C spec. R_min protects the output driver; R_max keeps the rising edge fast enough for the bus speed.",
  },
  {
    tool: "Path loss",
    domain: "rf",
    formulas: ["FSPL(dB) = 20 log10(d) + 20 log10(f) + 32.44"],
    note: "Free-space path loss. d in km, f in MHz.",
  },
  {
    tool: "Radio wavelength",
    domain: "rf",
    formulas: ["λ = c / f"],
    note: "c = 299,792,458 m/s. In a medium other than vacuum, divide c by the velocity factor first.",
  },
  {
    tool: "VSWR / Return loss",
    domain: "rf",
    formulas: ["VSWR = (1 + |Γ|) / (1 − |Γ|)", "Return Loss (dB) = −20 log10|Γ|"],
    note: "Γ is the reflection coefficient, 0 (perfect match) to 1 (total reflection).",
  },
  {
    tool: "dB ratio",
    domain: "tools",
    formulas: ["dB = 10 log10(P2 / P1)", "dB = 20 log10(V2 / V1)"],
    note: "Power ratios use 10, voltage and current ratios 20: the usual source of a wrong-by-2x answer.",
  },
  {
    tool: "dB levels",
    domain: "tools",
    formulas: ["dBm = 10 log10(P / 1 mW)", "dBV = 20 log10(V / 1 V)", "dBu = 20 log10(V / 0.7746 V)"],
    note: "A level is against a fixed reference. Voltages are rms; 0 dBm is 0 dBu only across 600 Ω.",
  },
  {
    tool: "Antenna length (dipole/monopole)",
    domain: "rf",
    formulas: ["Half-wave dipole (ft) = 468 / f(MHz)", "Quarter-wave monopole (ft) = 234 / f(MHz)"],
    note: "Classic amateur-radio approximation; ignores the antenna's actual velocity factor.",
  },
  {
    tool: "Linear regulator (LDO)",
    domain: "power",
    formulas: ["Vout = Vref × (1 + R1/R2)"],
    note: "Standard adjustable-LDO feedback divider (LM317-style). Ignores the small adjust-pin current most datasheets treat as negligible.",
  },
  {
    tool: "DC/DC buck converter",
    domain: "power",
    formulas: ["Vout = D × Vin"],
    note: "Ideal, continuous-conduction mode. D is duty cycle as a fraction (0–1). Real converters lose a few percent to switch and diode drops.",
  },
  {
    tool: "DC/DC boost converter",
    domain: "power",
    formulas: ["Vout = Vin / (1 − D)"],
    note: "Ideal, continuous-conduction mode. D is duty cycle as a fraction (0–1).",
  },
  {
    tool: "Battery runtime",
    domain: "power",
    formulas: ["Runtime (h) = Capacity (Ah) / Load current (A)"],
    note: "Assumes constant current and ignores the capacity fade real batteries show near empty.",
  },
  {
    tool: "Battery C-rate",
    domain: "power",
    formulas: ["C-rate = Current / Capacity"],
    note: "A 2000 mAh cell discharged at 1C draws 2 A; at 0.5C, 1 A.",
  },
  {
    tool: "Thermal resistance (θJA / θJC)",
    domain: "power",
    formulas: ["ΔT = P × θ"],
    note: "θJA (junction-to-ambient) or θJC (junction-to-case), from the datasheet. P is power dissipated in the part.",
  },
  {
    tool: "Wire sizing",
    domain: "pcb",
    formulas: ["AWG: d(mm) = 0.127 × 92^((36 − n) / 39)", "R = 2L × (1/58 Ω·mm²/m) / A", "Vdrop = I × R"],
    note: "Six AWG steps double the diameter, three double the cross-section; SWG is a table. The 2 is the round trip through both wires. Copper is 1/58 Ω·mm²/m at 20 °C, +0.393 % per °C.",
  },
];

// Sorted once here rather than hand-ordered above, so the list stays correct
// as entries are added anywhere in it — no risk of a manual reorder mistake,
// and filtering preserves this order since it just filters the sorted array.
FORMULAS.sort((a, b) => a.tool.localeCompare(b.tool, undefined, { sensitivity: "base" }));

// Case-insensitive match against topic name, formula text and the note —
// "duty cycle" should find the 555 timer even though "duty cycle" is not in
// its tool name.
function searchFormulas(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FORMULAS.filter(f =>
    f.tool.toLowerCase().includes(q) ||
    f.formulas.some(x => x.toLowerCase().includes(q)) ||
    f.note.toLowerCase().includes(q)
  );
}
