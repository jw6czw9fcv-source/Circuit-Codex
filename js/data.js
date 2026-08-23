// Circuit Codex — content data
// Mirrors the consolidated reference document. Each domain has sub-sections
// with tools. Tools with `calc: "id"` open a working calculator screen;
// all others open a placeholder "coming soon" screen.

const DOMAINS = [
  {
    id: "passive",
    title: "Passive components",
    subtitle: "Resistors, capacitors, coils",
    color: "#5B9BE0",
    bg: "#1B2A3B",
    icon: "resistor",
    sections: [
      {
        title: "Resistors",
        tools: [
          { name: "Color code", calc: "resistor-color-code" },
          { name: "SMD code", calc: "smd-code" },
          { name: "E-series value", calc: "e-series" },
          { name: "Series/parallel", calc: "series-parallel" },
          { name: "Voltage divider", calc: "voltage-divider" },
          { name: "Current divider", calc: "current-divider" },
          { name: "Wheatstone bridge", calc: "wheatstone-bridge" },
          { name: "Delta-Y transform" },
          { name: "NTC/PTC thermistor" },
        ],
      },
      {
        title: "Capacitors",
        tools: [
          { name: "Ceramic code" },
          { name: "Film code" },
          { name: "SMD code" },
          { name: "Series/parallel", calc: "cap-series-parallel" },
          { name: "Charge/discharge (RC)" },
          { name: "Stored energy" },
        ],
      },
      {
        title: "Inductors",
        tools: [
          { name: "Color code" },
          { name: "SMD code" },
          { name: "Air-core coil (Wheeler)" },
          { name: "Toroid winding" },
          { name: "Transformer (turns ratio)" },
          { name: "Series/parallel" },
          { name: "Toroid/ferrite reference table" },
        ],
      },
      {
        title: "Passive filters",
        tools: [
          { name: "RC filter" },
          { name: "RL filter" },
          { name: "LC filter (band-pass/notch)" },
          { name: "RLC filter" },
        ],
      },
      {
        title: "Reference",
        tools: [{ name: "SMD package sizes — Imperial" }, { name: "SMD package sizes — Metric" }],
      },
    ],
  },
  {
    id: "active",
    title: "Active & semiconductor devices",
    subtitle: "Diodes, transistors, op-amps",
    color: "#B98FE0",
    bg: "#2A1B32",
    icon: "transistor",
    sections: [
      { title: "Diodes", tools: [{ name: "Forward voltage / biasing" }, { name: "Zener regulation" }, { name: "LED series resistor" }] },
      { title: "Transistors (BJT)", tools: [{ name: "Biasing (voltage divider bias)" }, { name: "NPN/PNP as a switch" }, { name: "Example calculation (hFE, IC)" }] },
      { title: "FET / MOSFET / IGBT", tools: [{ name: "Biasing" }, { name: "Switching calculation" }] },
      { title: "Rectifiers", tools: [{ name: "Half-wave" }, { name: "Full-wave (bridge)" }, { name: "Full-wave with center tap" }, { name: "Half-wave with capacitor (ripple)" }] },
      { title: "Thyristors & TRIAC", tools: [{ name: "Firing angle basics" }] },
      {
        title: "Op-amps",
        tools: [
          { name: "Inverting amplifier" }, { name: "Non-inverting amplifier" }, { name: "Buffer (voltage follower)" },
          { name: "Comparator (± hysteresis / Schmitt trigger)" }, { name: "Integrator" }, { name: "Differentiator" },
          { name: "Summing amplifier" }, { name: "Differential amplifier" }, { name: "Sallen-Key filter" },
        ],
      },
      { title: "Optoelectronics", tools: [{ name: "Photocell / LDR" }, { name: "Optocoupler" }, { name: "LED forward voltage/current" }, { name: "Wavelength ↔ color/spectrum chart" }] },
    ],
  },
  {
    id: "digital",
    title: "Digital & logic circuits",
    subtitle: "Gates, flip-flops, binary",
    color: "#5DCAA5",
    bg: "#1F3B33",
    icon: "binary",
    sections: [
      { title: "Logic gates", tools: [{ name: "Basic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)" }, { name: "Karnaugh map simplification" }] },
      { title: "Sequential logic", tools: [{ name: "Flip-flops (SR, D, JK, T)" }, { name: "Multivibrators (astable/monostable)" }, { name: "555 Timer (astable/monostable)" }] },
      { title: "Number systems", tools: [{ name: "DEC / HEX / BIN conversion", calc: "dec-hex-bin" }, { name: "ASCII table", calc: "ascii-table" }] },
      {
        title: "Timing & interfaces",
        tools: [
          { name: "PWM (duty cycle)" }, { name: "Debounce / RC timing" }, { name: "I2C pull-up resistor" }, { name: "UART baud rate" },
          { name: "Crystal load capacitance" }, { name: "Oscillator stability (ppm → Hz)" }, { name: "PLL multiplication factor" },
        ],
      },
      { title: "Data conversion", tools: [{ name: "ADC resolution / quantization" }, { name: "DAC resolution" }, { name: "SNR estimation" }] },
    ],
  },
  {
    id: "rf",
    title: "RF & microwave",
    subtitle: "Radio, antennas, wireless",
    color: "#E08585",
    bg: "#3B1E22",
    icon: "antenna",
    sections: [
      { title: "Antennas & propagation", tools: [{ name: "Path loss" }, { name: "Wavelength" }, { name: "Beamwidth & gain" }, { name: "Fresnel zone" }, { name: "Antenna length (dipole/monopole)" }] },
      { title: "Transmission lines", tools: [{ name: "VSWR / Return loss" }, { name: "Velocity factor" }, { name: "Coax impedance" }, { name: "Smith chart matching" }, { name: "Skin depth" }, { name: "Coax cable standards" }] },
      { title: "Power & gain", tools: [{ name: "dB / dBm / dBu / dBV conversion" }, { name: "Cascade gain, noise figure, P1dB" }, { name: "Intercept point" }, { name: "Intermodulation" }, { name: "Attenuator (Pi, T, bridged-T)" }, { name: "Power divider" }] },
      { title: "Mixing & conversion", tools: [{ name: "IF calculator" }, { name: "Image frequency" }] },
      { title: "RF components", tools: [{ name: "Common mode choke" }, { name: "Balun" }, { name: "SAW filter" }, { name: "RF diode types" }] },
      { title: "Reference", tools: [{ name: "Microwave bands & frequencies" }] },
    ],
  },
  {
    id: "power",
    title: "Power electronics",
    subtitle: "Batteries, regulators, motors, supplies",
    color: "#EF9F27",
    bg: "#3B2A17",
    icon: "bolt",
    sections: [
      {
        title: "Supply & regulation",
        tools: [
          { name: "Linear regulator (LDO)" }, { name: "DC/DC buck converter" }, { name: "DC/DC boost converter" },
          { name: "Zener voltage stabilization" }, { name: "Zener + transistor stabilization" }, { name: "SMPS flyback basics" },
          { name: "Inrush current limiter (NTC)" }, { name: "Constant current source/driver" }, { name: "Power factor" }, { name: "POE classes" },
        ],
      },
      { title: "Battery", tools: [{ name: "Runtime / capacity estimation" }, { name: "C-rate" }, { name: "Internal resistance" }, { name: "Battery types & sizes" }, { name: "Button cells" }, { name: "Accumulators" }] },
      { title: "Thermal management", tools: [{ name: "Thermal resistance (θJA / θJC)" }, { name: "Heat sink sizing" }, { name: "Power derating" }, { name: "Power density" }] },
      { title: "Motors", tools: [{ name: "Torque & power conversion" }, { name: "Back-EMF / Lenz's law" }, { name: "Stepper motor torque/step" }, { name: "RPM ↔ frequency conversion" }, { name: "Starting current estimation" }] },
      { title: "Switching & control", tools: [{ name: "Relay driver" }] },
    ],
  },
  {
    id: "pcb",
    title: "PCB & interconnect",
    subtitle: "Traces, cables, wiring",
    color: "#5BC4E0",
    bg: "#17303B",
    icon: "pcb",
    sections: [
      {
        title: "Trace & impedance",
        tools: [
          { name: "PCB trace width / resistance" }, { name: "Trace current capacity (ampacity)" }, { name: "Via current capacity" },
          { name: "Microstrip impedance" }, { name: "Embedded microstrip impedance" }, { name: "Differential microstrip impedance" },
          { name: "Stripline impedance" }, { name: "Dual stripline impedance" }, { name: "Coplanar waveguide impedance" },
          { name: "Via impedance (R, L, C)" }, { name: "Signal propagation delay" }, { name: "Planar (PCB) inductor" },
          { name: "Padstack calculator" }, { name: "Crosstalk calculator" }, { name: "BGA land pattern" },
          { name: "Effective dielectric constant (Er effective)" }, { name: "Trace inductance" }, { name: "Decoupling capacitor" },
          { name: "Trace current — IPC-2152 method" }, { name: "Laminate material reference (Dk/Df) — IPC-4101" },
        ],
      },
      { title: "Cabling", tools: [{ name: "Wire gauge (AWG/SWG)", calc: "wire-gauge" }, { name: "Cable current capacity" }, { name: "Cable resistance / voltage drop", calc: "cable-resistance-drop" }, { name: "IEC cable reference" }, { name: "Cable colors (standard + DIN47100)" }] },
      { title: "Electrical safety", tools: [{ name: "Fuse/breaker sizing" }, { name: "Resettable fuse (PTC) sizing" }, { name: "TVS diode selection" }, { name: "ESD protection basics" }, { name: "Clearance & creepage distance" }, { name: "Wire color code by rating" }, { name: "IP-Ratings" }] },
      { title: "Manufacturing & fabrication", tools: [{ name: "Copper weight converter" }, { name: "Annular ring calculator" }, { name: "Via aspect ratio calculator" }, { name: "Flex PCB bend radius" }, { name: "IPC-7351 land pattern calculator" }] },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    subtitle: "Calculators, converters, generator, scope",
    color: "#9AA0A8",
    bg: "#2C2C2A",
    icon: "wrench",
    sections: [
      {
        title: "Calculators",
        tools: [
          { name: "Ohm's law", calc: "ohms-law" },
          { name: "AC Ohm's law (impedance form)" },
          { name: "Kirchhoff's laws", calc: "kirchhoff" },
          { name: "Standard & Scientific Calculators", calc: "basic-calculator" },
          { name: "Circuit calculators (divider, attenuator, delta-Y)" },
          { name: "SI prefix converter", calc: "si-prefix" },
          { name: "Scientific ↔ engineering notation", calc: "sci-eng" },
          { name: "Percent tolerance / error", calc: "percent-tolerance" },
          { name: "Generic dB ratio calculator" },
        ],
      },
      { title: "Converters", tools: [{ name: "Unit converter" }, { name: "PPM calculator" }] },
      { title: "Signal & test", tools: [{ name: "Signal generator" }, { name: "Two-tone generator" }, { name: "Oscilloscope" }, { name: "Frequency counter" }] },
      {
        title: "Reference",
        tools: [
          { name: "Formula", calc: "formula-search" }, { name: "Glossary" }, { name: "Physical constants", calc: "physical-constants" }, { name: "SI-Units", calc: "si-units" },
          { name: "RMS calculator" }, { name: "Quiescent current" }, { name: "4-20mA loop conversion" }, { name: "Lumen/Watt" },
        ],
      },
      { title: "Links", tools: [{ name: "Saved links" }] },
      { title: "Notes", tools: [{ name: "Personal notes" }] },
    ],
  },
];
