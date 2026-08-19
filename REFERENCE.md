**Circuit Codex --- Reference Document**

*Consolidated app structure: navigation, naming, visual system, and full
domain/tool list.*

**App Store subtitle:** Electronics Reference & Tools **\| Keywords:**
electronics, circuit, resistor, capacitor, calculator, formula,
engineer, RF, PCB, converter, ohm

**1. Product overview**

iPhone app for electronics/electrical hobbyists and professionals.
Modern dark theme, literal (not schematic-abstract) icon illustrations,
English UI. Starting as a PWA (no Mac, no Apple Developer subscription
required); native app remains a future option once validated.

**2. Navigation structure**

Tab bar (4 items):

-   Home --- grid of the 7 domains

-   Search --- global search across technical terms and plain-language
    synonyms

-   Tools --- direct access (transversal calculators, converters,
    generator, scope)

-   Favorites --- user-pinned tools

The 7 domains are only reachable from Home (grid), except Tools which
also has its own tab due to frequent, transversal use.

**3. Naming convention**

Every category and tool uses two layers of naming:

-   Title --- exact scientific/technical term (what a professional
    searches for)

-   Subtitle --- plain-language synonym (what a beginner recognizes)

Search indexes both layers, so a professional typing an exact term (e.g.
θJA, VSWR, microstrip) reaches the tool even if the visible label is
simplified.

**3b. Ordering within sub-sections**

Tools within each sub-section are ordered logically/by frequency of use,
not alphabetically:

-   Most fundamental / most commonly used tool first (e.g. "Color code"
    before "SMD code")

-   Conceptually related tools stay grouped together (e.g. all resistor
    coding methods, then all network calculations)

-   Search compensates for the lack of alphabetical order --- a user who
    knows exactly what they want (e.g. typing "θJA") reaches it directly
    via Search regardless of its position in the list

Exception: purely reference lists with no natural hierarchy (e.g.
Glossary, ASCII table) are ordered alphabetically.

**4. Visual system**

**Color per domain**

Each domain has one accent color, applied only to the icon stroke and
the icon\'s background chip (a darkened tint of the same hue) --- never
as a full-screen background. Card backgrounds stay uniform dark gray
across the whole app.

-   Passive components --- blue

-   Active & semiconductor devices --- violet

-   Digital & logic circuits --- teal

-   RF & microwave --- coral

-   Power electronics --- amber

-   PCB & interconnect --- cyan

-   Tools --- neutral gray (deliberately non-technical, transversal)

**Icon principle**

Icons are literal, simplified illustrations of the real object --- not
the abstract schematic symbol. Example: the resistor color-code icon is
a beige resistor body with colored bands (elongated proportions), not a
zigzag schematic line. The SMD code icon is a black chip with two
metallic end contacts, digits in pure white.

**Calculator screen template**

Every calculator (of the \~150 in the app) follows one shared layout:
header (back, technical title, plain-language subtitle, favorite star) →
optional circuit diagram → optional mode selector (which variables are
known vs. solved for) → input fields (value + selectable unit) → result
fields, visually distinct via a tinted background and a small
'Calculated' badge rather than by dimming/low-contrast text → Calculate
button in the domain accent color → formula reminder footer.

Circuit diagram exception: unlike navigation icons
(literal/photographic), the in-calculator circuit diagram uses the
standard schematic symbol, because its job is to show circuit topology
(how components are wired --- series, parallel, RC, etc.), not to
identify a physical part. Symbols follow the **US (ANSI)** convention
throughout: a resistor is a zigzag, never the IEC rectangle. Where a
vertical zigzag is cramped, make the diagram taller rather than
substituting a box.
Shown for calculators where wiring configuration isn\'t obvious from the
name alone (e.g. R series vs. R parallel, RC circuit), and updates with
the selected mode when relevant.

**5. Domains and tools**

Legend: each domain lists its sub-sections, each with the individual
tools/calculators inside.

**Passive components**

*Resistors, capacitors, coils*

**Resistors**

-   Color code

-   SMD code (3-digit, 4-digit and EIA-96)

-   E-series value

-   Series/parallel

-   Voltage divider

-   Current divider

-   Wheatstone bridge

-   Delta-Y transform

-   NTC/PTC thermistor

**Capacitors**

-   Charge/discharge (RC)

-   Stored energy

-   Ceramic code

-   Film code

-   SMD code

-   Series/parallel

**Inductors**

-   Color code

-   SMD code

-   Air-core coil (Wheeler)

-   Toroid winding

-   Transformer (turns ratio)

-   Series/parallel

-   Toroid/ferrite reference table

**Passive filters**

-   RC filter

-   RL filter

-   LC filter (band-pass/notch)

-   RLC filter

**Reference**

-   SMD package sizes --- Imperial

-   SMD package sizes --- Metric

**Active & semiconductor devices**

*Diodes, transistors, op-amps*

**Diodes**

-   Forward voltage / biasing

-   Zener regulation

-   LED series resistor

**Transistors (BJT)**

-   Biasing (voltage divider bias)

-   NPN/PNP as a switch

-   Example calculation (hFE, IC)

**FET / MOSFET / IGBT**

-   Biasing

-   Switching calculation

**Rectifiers**

-   Half-wave

-   Full-wave (bridge)

-   Full-wave with center tap

-   Half-wave with capacitor (ripple)

**Thyristors & TRIAC**

-   Firing angle basics

**Op-amps**

-   Inverting amplifier

-   Non-inverting amplifier

-   Buffer (voltage follower)

-   Comparator (± hysteresis / Schmitt trigger)

-   Integrator

-   Differentiator

-   Summing amplifier

-   Differential amplifier

-   Sallen-Key filter

**Optoelectronics**

-   Photocell / LDR

-   Optocoupler

-   LED forward voltage/current

-   Wavelength ↔ color/spectrum chart (visible + near IR/UV)

**Digital & logic circuits**

*Gates, flip-flops, binary*

**Logic gates**

-   Basic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)

-   Karnaugh map simplification

**Sequential logic**

-   Flip-flops (SR, D, JK, T)

-   Multivibrators (astable/monostable)

-   555 Timer (astable/monostable)

**Number systems**

-   DEC / HEX / BIN conversion

-   ASCII table

**Timing & interfaces**

-   PWM (duty cycle)

-   Debounce / RC timing

-   I2C pull-up resistor

-   UART baud rate

-   Crystal load capacitance

-   Oscillator stability (ppm → Hz)

-   PLL multiplication factor

**Data conversion**

-   ADC resolution / quantization

-   DAC resolution

-   SNR estimation

**RF & microwave**

*Radio, antennas, wireless*

**Antennas & propagation**

-   Path loss

-   Wavelength

-   Beamwidth & gain

-   Fresnel zone

-   Antenna length (dipole/monopole)

**Transmission lines**

-   VSWR / Return loss

-   Velocity factor

-   Coax impedance

-   Smith chart matching (interactive)

-   Skin depth

-   Coax cable standards (reference)

**Power & gain**

-   dB / dBm / dBu / dBV conversion

-   Cascade gain, noise figure, P1dB

-   Intercept point

-   Intermodulation

-   Attenuator (Pi, T, bridged-T)

-   Power divider (equal/unequal split)

**Mixing & conversion**

-   IF calculator

-   Image frequency

**RF components**

-   Common mode choke

-   Balun

-   SAW filter

-   RF diode types (Schottky, PIN, varactor, tunnel)

**Reference**

-   Microwave bands & frequencies

**Power electronics**

*Batteries, regulators, motors, supplies*

**Supply & regulation**

-   Linear regulator (LDO, adjustable ± Vref)

-   DC/DC buck converter

-   DC/DC boost converter

-   Zener voltage stabilization

-   Zener + transistor stabilization

-   SMPS flyback basics

-   Inrush current limiter (NTC)

-   Constant current source/driver

-   Power factor (VA, cos φ)

-   POE classes (reference)

**Battery**

-   Runtime / capacity estimation

-   C-rate

-   Internal resistance

-   Battery types & sizes (reference)

-   Button cells (reference)

-   Accumulators (reference)

**Thermal management**

-   Thermal resistance (θJA / θJC)

-   Heat sink sizing

-   Power derating

-   Power density

**Motors**

-   Torque & power conversion (horsepower ↔ watts)

-   Back-EMF / Lenz\'s law

-   Stepper motor torque/step

-   RPM ↔ frequency conversion

-   Starting current estimation

**Switching & control**

-   Relay driver

**PCB & interconnect**

*Traces, cables, wiring*

**Trace & impedance**

-   PCB trace width / resistance

-   Trace current capacity (ampacity)

-   Via current capacity

-   Microstrip impedance

-   Embedded microstrip impedance

-   Differential microstrip impedance

-   Stripline impedance

-   Dual stripline impedance

-   Coplanar waveguide impedance

-   Via impedance (R, L, C)

-   Signal propagation delay

-   Planar (PCB) inductor calculator

-   Padstack calculator

-   Crosstalk calculator

-   BGA land pattern calculator

-   Effective dielectric constant (Er effective)

-   Trace inductance calculator

-   Decoupling capacitor calculator

-   Trace current capacity --- IPC-2152 method (advanced thermal)

-   Laminate material reference (Dk/Df) --- IPC-4101

**Manufacturing & fabrication**

-   Copper weight converter (oz ↔ mils/µm)

-   Annular ring calculator

-   Via aspect ratio calculator

-   Flex PCB bend radius calculator

-   IPC-7351 land pattern calculator (passive packages: chip R/C, SOT,
    SOIC...)

**Cabling**

-   Wire gauge (AWG/SWG)

-   Cable current capacity (ampacity)

-   Voltage drop of a cable

-   Cable resistance

-   IEC cable reference

-   Cable colors (standard + DIN47100)

**Electrical safety**

-   Fuse/breaker sizing

-   Resettable fuse (PTC) sizing

-   TVS diode selection (clamping voltage)

-   ESD protection basics

-   Clearance & creepage distance

-   Wire color code by rating

-   IP-Ratings (reference)

**Tools**

*Calculators, converters, generator, scope*

**Calculators**

-   Ohm\'s law (interactive wheel: R+I, R+V, R+P, I+V, I+P, V+P)

-   AC Ohm\'s law (impedance form)

-   Kirchhoff\'s laws (1st & 2nd)

-   Basic calculator

-   Circuit calculators (generic divider, attenuator, delta-Y)

-   SI prefix converter (pico→giga)

-   Scientific ↔ engineering notation converter

-   Percent tolerance / error calculator

-   Generic dB ratio calculator (power/voltage)

**Converters**

-   Unit converter (voltage, dB, temperature, frequency, length, area,
    volume, weight)

-   PPM (parts per million) calculator

**Signal & test**

-   Signal generator (sine, sweep, noise, burst, dual-tone, multitone)

-   Two-tone generator

-   Oscilloscope (mic-based)

-   Frequency counter

**Reference**

-   Formula search

-   Glossary

-   Physical constants

-   SI-Units

-   RMS calculator (sine, square, triangle, sawtooth, pulsating)

-   Quiescent current

-   4-20mA loop conversion

-   Lumen/Watt

**Links**

-   Saved links (datasheets, articles, references)

**Notes**

-   Personal notes (free text, optionally linked to a project or tool)

**6. Deliberately excluded (out of scope for now)**

Kept out to stay focused on circuit behavior/calculation rather than a
component or hardware database:

-   Component package databases (SMD/THT footprints beyond size
    reference), pinouts, physical switches

-   Development boards & suppliers (Arduino, Raspberry Pi, ESP32, RS
    Components, SparkFun, Digi-Key...)

-   Vacuum tubes

-   Logic family reference tables (7400/4000 series) --- pure reference,
    not calculation

-   Passive audio crossover design

-   NAC/CTCSS conversion (amateur radio squelch codes) --- very niche

-   Circuit simulation (schematic capture + SPICE) --- explicitly
    deferred, possible future phase

-   3D printing materials, drill sizes, DIN car terminal designations,
    torque conversion, proximity sensors --- unrelated to electronics
    calculation

**7. Build path notes**

Starting platform: Progressive Web App (PWA). No Mac and no Apple
Developer subscription required to build, test, or use personally
(installs via "Add to Home Screen" on iPhone). A native app remains
possible later; it would require a Mac (or cloud Mac rental) plus, only
if published on the App Store, the paid Apple Developer Program
(≈\$99/yr). Content and structure documented here carry over directly to
that path if pursued.

*GUI reference: Saturn PCB Toolkit --- to revisit as a visual/UX
reference specifically for the PCB & interconnect domain screens.*
