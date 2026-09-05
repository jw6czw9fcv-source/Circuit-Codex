# Circuit Codex — build order (basic → advanced)

Generated from `js/data.js`. Every tool without a `calc:` id still opens the
"coming soon" placeholder. Ordered as a build queue, roughly easiest/most
foundational first, hardest/most niche last — not grouped by domain anymore,
since the goal is "learn as you go," not "finish one domain before starting
another."

**Built**: Resistor color code · Resistor SMD code · E-series value ·
Resistor series/parallel · Voltage divider · Current divider · Wheatstone
bridge · Capacitor series/parallel · Ohm's law · Kirchhoff's laws · Formula
search · SI prefix converter · Scientific ↔ engineering notation ·
Percent tolerance / error · Standard & Scientific Calculators ·
Physical constants · SI-Units · DEC / HEX / OCT / BIN conversion ·
ASCII table · Wire gauge (AWG/SWG) · Cable resistance / voltage drop ·
Wire & cable colors (merged with the former "Wire color code by
rating" — one screen covers AC mains (IEC, US, Canada), US three-phase
by voltage system, DC, and DIN 47100 multi-core numbering, with filter
chips to jump straight to a country/topic) · IP-Ratings ·
Inductor color code · Inductor SMD code · Ceramic capacitor code ·
Film capacitor code · Capacitor SMD code · SMD package sizes (imperial
and metric merged onto one screen — same physical bodies, two naming
systems, and same-numbered codes collide between them, so splitting them
across two screens would've hidden that instead of explaining it) ·
Resistor power rating (wasn't on this list — Pierre noticed it was
missing while looking at SMD package sizes; SMD ratings are a real
per-package-code standard, through-hole ratings are organized by watt
instead since there's no code system for THT body size) ·
Basic logic gates · LED series resistor · Diode forward voltage / biasing ·
RMS calculator · Generic dB ratio calculator · dB / dBm / dBu / dBV
conversion · Battery runtime / capacity estimation · C-rate ·
Battery types & sizes · Button cells · Capacitor charge/discharge (RC) ·
Capacitor stored energy · RC filter · RL filter · PWM (duty cycle) ·
Debounce / RC timing · Wavelength (RF) · Delta-Y transform ·
NTC/PTC thermistor · Unit converter (Temperature, Length, Area,
Volume, Mass, Speed, Force, Pressure, Energy, Data, Time, Angle) ·
Octal added to DEC / HEX / BIN conversion · PPM converter
(ppm tolerance × a base value → deviation, range, and the
equivalent % as a small annotation) · **Transistor biasing
(voltage divider bias)** (NPN/PNP self-bias Q-point: Ib, Ic, Ie,
Vb, Ve, Vc, Vce, with active/saturation/cutoff detection —
standard BJT symbol, symmetric R1/Rc and R2/Re layout, continuous
traces with no gaps at any lead/zigzag junction) ·
**NPN/PNP as a switch** (low-side NPN vs high-side PNP — genuinely
different topologies, not just relabeled; Ib, Ic, Ie, Vce, and a
base-drive overdrive factor with a 5–10× design-target note) ·
Transistor example calculation (hFE, IC) (bare current-gain
relationship — solve for Ic, Ib, or hFE given the other two, no
bias network; illustrative Q1 symbol with Ib/Ic/Ie KCL arrows) ·
MOSFET biasing (N-channel enhancement, voltage-divider gate bias:
Vg from an unloaded divider since the gate draws no current, Id/Vgs
solved as a pair via the square-law device equation and a datasheet
on-state reference point, active/cutoff/triode detection — NMOS-only
for now, PMOS not yet added) · MOSFET/IGBT switching calculation
(low-side switch driving a resistive load, device-type toggle instead
of a polarity toggle since both share the same low-side topology;
MOSFET solves I = Vdd/(Rload+Rds,on) directly, IGBT linearizes the
Vce–Ic curve as a knee voltage plus slope — On/Marginal/Off state,
conduction loss and efficiency) · Half-wave rectifier (single diode,
ideal constant-Vf drop; Vdc = Vp/π, PIV = Vp, ripple factor ≈1.21 and
efficiency ≈40.6% fixed by the half-wave shape itself regardless of
Vin/Vf/Rload) · Full-wave rectifier — bridge (four diodes in the
standard diamond, current on both half-cycles through two diodes in
series; Vdc = 2×Vp,out/π, ripple ≈0.482 and efficiency ≈81.2% — same
PIV per diode as the half-wave case despite the 2×Vf drop) ·
Full-wave rectifier — center tap (two diodes, one center-tapped
secondary; only one diode drop (Vf) but PIV = 2×Vp since the off
diode swings from +Vp to −Vp across the full winding — same Vdc/
ripple/efficiency shape as the bridge for a given per-half voltage)

## Tier 1 — Basic (single formula or reference table, no prerequisites)

Empty — every Tier 1 item is built. Next up is Tier 2.

## Tier 2 — Intermediate (a real circuit or standard behind the numbers)

- [ ] Half-wave rectifier with capacitor (ripple)
- [ ] Thyristor/TRIAC firing angle basics
- [ ] Op-amp: inverting amplifier
- [ ] Op-amp: non-inverting amplifier
- [ ] Op-amp: buffer (voltage follower)
- [ ] Op-amp: comparator (± hysteresis / Schmitt trigger)
- [ ] Op-amp: integrator
- [ ] Op-amp: differentiator
- [ ] Op-amp: summing amplifier
- [ ] Op-amp: differential amplifier
- [ ] Photocell / LDR
- [ ] Optocoupler
- [ ] LED forward voltage/current
- [ ] Wavelength ↔ color/spectrum chart
- [ ] Flip-flops (SR, D, JK, T)
- [ ] Multivibrators (astable/monostable)
- [ ] 555 Timer (astable/monostable)
- [ ] Karnaugh map simplification
- [ ] I2C pull-up resistor
- [ ] UART baud rate
- [ ] Crystal load capacitance
- [ ] Oscillator stability (ppm → Hz)
- [ ] PLL multiplication factor
- [ ] ADC resolution / quantization
- [ ] DAC resolution
- [ ] SNR estimation
- [ ] Antenna length (dipole/monopole)
- [ ] Beamwidth & gain
- [ ] Fresnel zone
- [ ] Path loss
- [ ] Velocity factor
- [ ] Coax impedance
- [ ] Skin depth
- [ ] Coax cable standards
- [ ] Attenuator (Pi, T, bridged-T)
- [ ] Power divider (RF)
- [ ] IF calculator
- [ ] Image frequency
- [ ] Common mode choke
- [ ] Balun
- [ ] SAW filter
- [ ] RF diode types
- [ ] Microwave bands & frequencies
- [ ] Amateur radio bands
- [ ] Linear regulator (LDO)
- [ ] Zener voltage stabilization
- [ ] Zener + transistor stabilization
- [ ] Inrush current limiter (NTC)
- [ ] Constant current source/driver
- [ ] Power factor
- [ ] POE classes
- [ ] Internal resistance (battery)
- [ ] Accumulators
- [ ] Thermal resistance (θJA / θJC)
- [ ] Heat sink sizing
- [ ] Power derating
- [ ] Power density
- [ ] Torque & power conversion
- [ ] Back-EMF / Lenz's law
- [ ] Stepper motor torque/step
- [ ] RPM ↔ frequency conversion
- [ ] Starting current estimation
- [ ] Relay driver
- [ ] PCB trace width / resistance
- [ ] Trace current capacity (ampacity)
- [ ] Via current capacity
- [ ] Signal propagation delay
- [ ] Planar (PCB) inductor
- [ ] Decoupling capacitor
- [ ] Fuse/breaker sizing
- [ ] Resettable fuse (PTC) sizing
- [ ] TVS diode selection
- [ ] ESD protection basics
- [ ] Clearance & creepage distance
- [ ] Copper weight converter
- [ ] Annular ring calculator
- [ ] Via aspect ratio calculator
- [ ] Flex PCB bend radius
- [ ] Cable current capacity
- [ ] IEC cable reference
- [ ] AC Ohm's law (impedance form)
- [ ] Circuit calculators (divider, attenuator, delta-Y)
- [ ] Quiescent current
- [ ] 4-20mA loop conversion
- [ ] Lumen/Watt
- [ ] Glossary

## Tier 3 — Advanced (needs the intermediate concepts as building blocks)

- [ ] Sallen-Key filter
- [ ] LC filter (band-pass/notch)
- [ ] RLC filter
- [ ] Air-core coil (Wheeler)
- [ ] Toroid winding
- [ ] Transformer (turns ratio)
- [ ] Inductor series/parallel
- [ ] Toroid/ferrite reference table
- [ ] VSWR / Return loss
- [ ] Smith chart matching
- [ ] Cascade gain, noise figure, P1dB
- [ ] Intercept point
- [ ] Intermodulation
- [ ] SMPS flyback basics
- [ ] DC/DC buck converter
- [ ] DC/DC boost converter
- [ ] Microstrip impedance
- [ ] Embedded microstrip impedance
- [ ] Differential microstrip impedance
- [ ] Stripline impedance
- [ ] Dual stripline impedance
- [ ] Coplanar waveguide impedance
- [ ] Via impedance (R, L, C)
- [ ] Crosstalk calculator
- [ ] Effective dielectric constant (Er effective)
- [ ] Trace inductance
- [ ] BGA land pattern
- [ ] Padstack calculator
- [ ] Trace current — IPC-2152 method
- [ ] Laminate material reference (Dk/Df) — IPC-4101
- [ ] IPC-7351 land pattern calculator

## Not calculators — separate track (UI/simulation, not formula screens)

- [ ] Signal generator
- [ ] Two-tone generator
- [ ] Oscilloscope
- [ ] Frequency counter
- [ ] Saved links
- [ ] Personal notes
