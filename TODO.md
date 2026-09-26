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
ripple/efficiency shape as the bridge for a given per-half voltage) ·
Half-wave rectifier with capacitor/ripple (smoothing cap turns the
pulses into a sawtooth; standard linear-discharge approximation —
Vr(pp)=Vp,out/(fRC), Vdc=Vp,out−Vr(pp)/2 — PIV nearly doubles to
2×Vp since the cap holds the output up while Vac swings negative;
waveform panel step-simulates the real exponential-decay shape,
zoomed to the ripple band since the ripple is invisible at full
Vp scale) · Thyristor/TRIAC firing angle basics (device toggle
instead of a rectifier's fixed conduction — a gate pulse delays
turn-on by angle α (0-180°) from each half-cycle's zero crossing;
SCR half-wave: Vdc=(Vp/2π)(1+cosα); TRIAC full-wave/symmetric:
Vrms=Vac×√((π−α+sin2α/2)/π); both share the same normalized
power-vs-α shape, non-linear not straight-line; ideal-switch
model, no Vf term; waveform panel shows the classic notched-sine
dimmer shape with an α delay bracket on the zero line) ·
Op-amp: inverting amplifier (ideal op-amp virtual-ground model —
Gain=−Rf/Rin, independent of everything else in the circuit; Vout
clips at the ±supply rails with a "Saturated" badge, and the note
flags that a real non-rail-to-rail op-amp actually saturates 1–2V
short of that; results include Gain in both ×and dB, Iin, and Zin=Rin
as its own explicit result since that's the non-obvious teaching
point of the virtual-ground argument) ·
Op-amp: non-inverting amplifier (Gain=1+Rf/R1 — never below 1 and
never inverting, since the Rf/R1 divider can only divide; Rf=0 gives a
unity-gain buffer; V− shown as its own result because the virtual
short is what makes the whole derivation work; same rail clipping and
red saturation warning as the inverting amp; the note names the real
reason to choose this topology — Zin is the op-amp’s own input
impedance, not R1) ·
Op-amp: buffer (voltage follower) (gain is fixed at 1, so the number
worth computing is what the buffer saves you: Rs and RL are the source
and load around it, and tying them together directly makes a divider —
the Unbuffered result is what actually arrives, with the loading loss as
a percentage beside it; Rs=0 correctly reports 0% loss, i.e. a stiff
source needs no buffer; the note flags the two limits the ideal model
hides, rail clipping and the op-amp’s output current rating vs Iload) ·
Op-amp: comparator / Schmitt trigger (two modes sharing one divider,
as the reference sheet draws them — R1 down from the +V port and R2 on
to ground hold V+ at the reference, the signal drives V−, and the
Schmitt mode adds Rf from the output back to that same node; with three
sources reaching V+ at once the thresholds come from the conductance sum
G = 1/R1 + 1/R2 + 1/Rf rather than a plain divider, giving VT+, VT−, the
hysteresis band and its centre; between the thresholds the state is
genuinely undetermined and the tool says so — “Holds last state” —
instead of inventing one; a third mode adds the non-inverting Schmitt —
signal and feedback both land on V+ through Rin and Rf, so the trip point
is where they cancel against a grounded V−, giving VT± = ±Vsat·Rin/Rf on a
band centred on zero and an output that follows the input instead of
inverting it; V− is grounded rather than fed by the divider because a
divider column would have to cross the Rin arm on the schematic) ·
Photocell / LDR (the power law R = R₁₀·(E/10)^−γ that datasheets quote,
plus the divider that is the only way to read the cell; a log-x plot of
Vout against illuminance spans four decades centred on the operating
point, so you can see whether you are on the steep part or out on a flat
end; sensitivity per decade is written as ln10·γ·Vout·(Vcc−Vout)/Vcc, which
makes it obvious the peak is at Vout = Vcc/2 — i.e. Rfixed = Rldr, the
design rule, and a badge confirms when you are there; photoresistor drawn
ANSI-style, zigzag with two arrows pointing in) ·
Optocoupler (built around CTR and the question that actually matters —
does the output pull low? — by computing both the collector current the
part can deliver and the one RL demands to reach Vce sat, and badging
which wins with the margin; drives the input side too, sizing Rin from a
target If; drawing is the LED and a base-less NPN either side of a dashed
barrier with two beams crossing it, since that gap is the whole point of
the part; note warns CTR is binned 50-600% on a PC817 and degrades with
age and low If, so design on the worst-case minimum) ·
LED forward voltage/current (NOT a new tool — the existing “LED series
resistor” in Diodes already did this calculation, colour presets and
E-series snapping included. A duplicate was built by mistake and removed;
the Optoelectronics entry was then dropped entirely on Pierre’s call, so
the tool lives only in Diodes; the one idea
the duplicate had that the original lacked — ΔI per 0.1V of Vf, the
headroom sensitivity, red when it exceeds 20% — was folded in. Its five
stacked full-width fields were also paired up; that screen had been
scrolling at ~985px and now fits 932 in every state) ·
Wavelength ↔ colour/spectrum chart (a real spectrum strip, 180 five-nm
slices rather than a gradient so the invisible shoulders read as plain
grey instead of fading to black on a dark page; axis runs 200–1100nm
because that is where LEDs, photodiodes and IR remotes live, not just
what the eye sees; colour from Dan Bruton’s approximation, a swatch in
the result cell; λ on a slider with ±5nm steps and a reset; gives the
band, photon energy in eV and frequency — the eV figure being the floor
an LED’s Vf sits on, which ties this to the LED tool) ·
Flip-flops SR/D/JK/T (four pills, each with its logic symbol, its truth
table and — the part that actually explains a flip-flop — an eight-cycle
timing trace whose input sequence is chosen to walk every row of that
table; Q is computed by running the sequence rather than drawn, so the
trace cannot disagree with the table above it; SR’s S=R=1 corner returns
null rather than a made-up answer, and the notes carry the thread that
JK exists to fill that corner while D and T are JK with inputs tied) ·
Multivibrators astable/monostable (discrete two-transistor family — the
555 keeps its own item for the IC. One topology serves both modes, which
is the truth: the monostable is the astable with one cross-coupling made
DC, so the left arm switches from a capacitor to a resistor between
pills. Each half-cycle is ln2·RC; the timing trace is drawn from the
computed times so an asymmetric duty looks asymmetric. Monostable adds
the number people miss — recovery through the collector resistor, which
sets the real max trigger rate. Bistable deliberately absent: that is
the SR latch in the flip-flop tool, and the note says so) ·
555 Timer astable/monostable (the IC, live in both directions like the
discrete pair: frequency and duty against R1/R2/C, pulse width against
R/C, with an E-series picker on the results. The astable’s duty cannot
reach 50% — charge is through R1+R2 and discharge through R2 alone — so
asking for 50% or less grows a diode across R2 in the drawing and
switches the formulas with it, which teaches the limitation at the
moment it blocks you. Vcc is an input only to report the ⅔ and ⅓
thresholds, since the comparators sit on three equal internal resistors
and the supply cancels out of every time constant. Monostable is ln3·RC,
not ln2 — the cap starts empty and climbs to ⅔ Vcc, the 1.1·RC of the
datasheets. Amber cautions when R1 falls under 1 kΩ or the chain passes
10 MΩ, the two bounds every application note gives) ·
Karnaugh map simplification (2, 3 or 4 variables; tap a cell to cycle
0 · 1 · X. The minimum sum of products comes from Quine-McCluskey with
an exhaustive cover search, ordered fewest terms then fewest literals
— greedy would be wrong exactly where someone is checking their own
homework, and without the literal tie-break a third of the ties came
out wordier than a textbook prints. The payoff is the overlay: each
group is boxed on the map in its own colour and the matching term in
the expression carries that colour, so the link between a rectangle
and a product term is visible rather than asserted. Wrapping groups
draw in two or four pieces at the edges, the four corners included.
Verified against a second minimiser written separately — all cubes
enumerated, smallest cover by iterative deepening — agreeing on term
and literal counts over 3500 random functions, with the truth table
reproduced on every care position of 12000 more) ·
I2C pull-up resistor (both bounds straight from NXP UM10204, not from
a rule of thumb: Rp min is what the open-drain stage can sink at the
0.4 V low level, Rp max is what lets the line climb from 0.3 to 0.7
Vdd inside the mode’s budget. The 0.8473 is ln(7/3), the span between
those two fractions on an RC curve, and the note says so rather than
leaving it a magic number. Three pills move the rise budget, the bus
capacitance ceiling and I_OL together — 20 mA in Fast mode Plus, not
3. Rp is editable so an existing value can be checked, and the
suggestion is the geometric mean of the two bounds snapped to the
chosen E-series, which puts 3.3k on a 3.3 V standard-mode bus, the
value everyone actually fits. The case worth seeing is the window
closing: past about 366 pF in Fast mode no resistor satisfies both
ends, and the tool says so in red with what to do about it) ·
UART baud rate (the divisor is an integer and the rounding is the
error — 16 MHz at 115200 wants 8.68, gets 9, runs 3.55% slow, which
is the whole reason 14.7456 MHz crystals exist. The drawing is the
part that teaches: a frame drawn at the transmitter’s real bit width
against evenly spaced sample marks, so raising the error walks the
marks toward the bit edges and the ones that fall outside turn red.
That is the sampling inequality drawn rather than asserted. Under it,
a table of every standard rate on the chosen clock, colour-coded and
tappable, which answers the question people actually have: with this
crystal, what works?) ·
Crystal load capacitance (the two load capacitors are in SERIES as
the crystal sees them — out through one, along the ground, back
through the other — which is the step people get backwards. With
stray added, a 12.5 pF crystal on a 3 pF board wants 19 pF parts,
not 25 and certainly not 12.5. Two-way: editing the spec or the
stray sizes the pair, editing a capacitor moves the presented load
instead, which is how to check a board that already exists. The
payoff is pullability, C1/(2(C0+CL)²), so a load error becomes ppm
rather than a shrug — and the two pills carry the fact that a watch
tuning fork pulls a third as far per pF as an MHz plate) ·
Oscillator stability (not a second ppm converter — that already exists
under Tools — but the budget that produces the figure: tolerance,
temperature, ageing and load pulling. Limits and offsets are kept apart,
so a window of −69 to −23 ppm reads as −69, a clock that can only lose
time, not ±69. Worst case and RSS both shown, then hertz, seconds a day
and minutes a year. The 32.768 kHz pill draws the tuning-fork parabola
with the operating point on it, which is why a logger outdoors in
winter runs slow; the MHz pill stacks the budget as a bar) ·
PLL multiplication factor (not the division, which is trivial, but the
search: every M, N and P the chip allows, walked exhaustively and
ranked by error, then on STM32 by whether Q gives USB exactly 48 MHz,
then by the higher PFD. Presets for STM32F4 and RP2040 with limits taken
from ST's HAL and the Pico SDK's vcocalc.py, not from summaries, which
disagree; Generic takes any integer-N PLL's ranges. Matches the shipped
settings exactly: 8→168 MHz gives M4 N168 P2 Q7, 12→125 MHz gives VCO
1500 with 6·2. The chain is drawn with each stage's frequency on it) ·
ADC resolution / quantization (LSB, code, code voltage and error both
ways — type a voltage or a code. Single-ended and Bipolar ± pills, the
second in two's complement as the ADS1115 register holds it. Rounds as
the ideal converter does, first transition at ½ LSB, which the
ATmega328P datasheet confirms; the note warns that Arduino and ST's LL
macros divide by 2ᴺ − 1. The staircase is drawn zoomed to eight codes
around the input, since 4096 steps look like a line)
Op-amp: integrator (the inverting amp’s schematic with C in place of Rf,
as the reference sheet draws it, plus a waveform panel under it — two
cycles of the input sine against its integral, a cosine, on one shared
axis scaled to whichever is larger so the quarter-cycle shift reads at a
glance and the gain reads as the height difference rather than being
normalised away; a Square/Sine selector picks the input, square first
because that is the real use (constant current → straight ramp → triangle
out, the function-generator pairing with the Schmitt trigger) while sine
is the shape to reason about frequency response with; the square input is
drawn rather than sampled so its edges stay vertical; output clamps at
the rails and visibly flattens; each mode’s note carries a “Used for”
sentence in the domain accent — function generators, PWM ramps and
dual-slope ADCs for the square, PID integral term, charge amplifiers and
rate-recovery for the sine ·
Op-amp: differentiator (the integrator mirrored — C moved into the input
arm, R into the feedback, as the reference sheet draws it; C passes only
change so the summing-node current is C·dVin/dt and the output is the
input’s slope scaled by −RC; Triangle/Sine selector like the integrator’s,
triangle first because a fixed slope each half cycle is what gives square
out; gain = 2πfRC climbs 6dB/octave, the integrator’s response upside
down — the two gains multiply to 1 at any frequency, checked across the
two tools; the note carries the caveat that a bare differentiator
amplifies noise without limit) ·
Op-amp: summing amplifier (the inverting amp with a second input arm, as
the reference sheet draws it — two arms straddling the − input onto one
node column, Rf over the top; the virtual ground is what adds, so each
input sees only its own resistor and the currents sum through Rf; six
results in a 6-column grid — Vout, both channel gains, both input
currents and their sum — so the addition is visible as arithmetic;
defaults 1V+2V at unity gain give exactly −3V; unequal resistors weight
each channel, which is how a mixer sets levels) ·
Op-amp: differential amplifier (an input arm into each side, Rf over the
top from the − node, R3 from the + node to ground, as the reference sheet
draws it; built around common-mode rejection rather than the trivial
Vout=(Rf/R1)(V2−V1) — inputs are split into Vd and Vcm and the results
carry Ad, Acm and CMRR, with a matched/unmatched badge; a float-noise
guard clamps Acm to exactly zero when the arms balance, otherwise a
perfectly matched bridge reports a finite ~300dB CMRR; a 10% error on R3
costs 11% of the answer, which the red warning quantifies; the waveform
panel is the family’s most useful — the common-mode part drawn swinging
while the difference sits still, so matched arms give a dead flat output
under a full input swing and a mismatch puts a visible ripple on it,
which is the leak the CMRR figure names; the panel uses the amplifiers’
single shared axis — grey is the differential input as a sine, blue is
Ad×that sine plus Acm×a slower common-mode interference, so the height
ratio comes out at exactly the gain and matched arms give peaks that do
not vary at all while a mismatch modulates them)
when it does, with the family’s badge and red warning; Gain = 1/(2πfRC)
falls 6dB/octave and passes unity at f₀)

## Tier 1 — Basic (single formula or reference table, no prerequisites)

Empty — every Tier 1 item is built. Next up is Tier 2.

## Tier 2 — Intermediate (a real circuit or standard behind the numbers)

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

**Before release**

- [ ] MANUAL.md completeness pass — every built tool has a section.
      Sections are written as each tool is built; tools finished before
      that decision (2026-09-20) get theirs when next touched, so this
      pass catches whatever is still missing.
- [ ] Help screen that presents MANUAL.md in the app
