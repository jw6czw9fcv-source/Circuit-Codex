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
    tool: "555 Timer (astable/monostable)",
    domain: "digital",
    formulas: ["f = 1.44 / ((R1 + 2R2) × C)", "Duty = (R1 + R2) / (R1 + 2R2)"],
    note: "Standard astable configuration. Duty cycle is always above 50% in this topology.",
  },
  {
    tool: "ADC resolution / quantization",
    domain: "digital",
    formulas: ["Step size = Vref / 2ⁿ"],
    note: "n is the ADC's bit depth. Smaller step = finer resolution.",
  },
  {
    tool: "DAC resolution",
    domain: "digital",
    formulas: ["Step size = Vref / 2ⁿ"],
    note: "Same relationship as ADC resolution, read the other direction.",
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
    tool: "Wavelength",
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
    tool: "dB / dBm / dBu / dBV conversion",
    domain: "rf",
    formulas: ["dBm = 10 log10(P / 1 mW)", "dB (power ratio) = 10 log10(P1/P2)", "dB (voltage ratio) = 20 log10(V1/V2)"],
    note: "Power ratios use a factor of 10, voltage/amplitude ratios use 20 — the usual source of a wrong-by-2x answer.",
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
    tool: "Runtime / capacity estimation",
    domain: "power",
    formulas: ["Runtime (h) = Capacity (Ah) / Load current (A)"],
    note: "Assumes constant current and ignores the capacity fade real batteries show near empty.",
  },
  {
    tool: "C-rate",
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
    tool: "Voltage drop of a cable",
    domain: "pcb",
    formulas: ["Vdrop = 2 × I × L × R_per_length"],
    note: "The factor of 2 is the round trip through both conductors — the single-length resistance alone understates it by half.",
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
