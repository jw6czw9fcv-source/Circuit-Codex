# Circuit Codex — User Manual

The theory behind each tool. This file is the **content**; the Help screen that
presents it gets built once, at the end, when the structure is obvious.

The in-app note on a tool carries only what you need to use it without getting a
wrong answer, plus a line on what the tool does and what each of its terms
means — enough to understand it, not to derive it. Everything else — where a
formula comes from, why a bound exists, what the method can and cannot see —
lives here, starting with a plain explanation of what the tool and its terms
mean, for a reader who has never met them.

<a id="index"></a>
## Index

Links point at the anchors the renderer makes from the headings, which is the
form that works in the most places. Each section also carries an explicit
`calc:` id anchor — `#karnaugh`, `#i2c-pullup` — which is what the Help screen
will key on, since that is the id the app already holds for each tool.

### Passive components

- Resistors → [Resistor color code](#resistor-color-code)
- Resistors → [SMD resistor code](#smd-resistor-code)
- Resistors → [Resistor power rating](#resistor-power-rating)
- Resistors → [E-series values](#e-series-values)
- Resistors → [Series/parallel (R)](#seriesparallel-r)
- Resistors → [Voltage divider](#voltage-divider)
- Resistors → [Current divider](#current-divider)
- Resistors → [Wheatstone bridge](#wheatstone-bridge)
- Resistors → [Delta-Y transform](#delta-y-transform)
- Resistors → [NTC/PTC thermistor](#ntcptc-thermistor)
- Capacitors → [Ceramic cap code](#ceramic-cap-code)
- Capacitors → [Film capacitor code](#film-capacitor-code)
- Capacitors → [SMD capacitor code](#smd-capacitor-code)
- Capacitors → [Series/parallel (C)](#seriesparallel-c)
- Capacitors → [RC charge and discharge](#rc-charge-and-discharge)
- Capacitors → [Capacitor energy](#capacitor-energy)
- Inductors → [Inductor color code](#inductor-color-code)
- Inductors → [Inductor SMD code](#inductor-smd-code)
- Passive filters → [RC filter](#rc-filter)
- Passive filters → [RL filter](#rl-filter)
- Reference → [SMD package sizes](#smd-package-sizes)

### Active & semiconductor devices

- Diodes → [Diode forward voltage](#diode-forward-voltage)
- Diodes → [LED series resistor](#led-series-resistor)
- Rectifiers → [Half-wave rectifier](#half-wave-rectifier)
- Rectifiers → [Bridge rectifier](#bridge-rectifier)
- Rectifiers → [Center-tap rectifier](#center-tap-rectifier)
- Rectifiers → [Rectifier ripple](#rectifier-ripple)
- Thyristors (SCR, TRIAC) & MOSFET → [AC phase control](#ac-phase-control)
- Op-amps → [Inverting](#inverting)
- Op-amps → [Non-inverting](#non-inverting)
- Op-amps → [Buffer](#buffer)
- Op-amps → [Comparators](#comparators)
- Op-amps → [Integrator](#integrator)
- Op-amps → [Differentiator](#differentiator)

### Digital

- Logic gates → [Karnaugh map simplification](#karnaugh-map-simplification)
- Timing & interfaces → [I2C pull-up resistor](#i2c-pull-up-resistor)
- Timing & interfaces → [UART baud rate](#uart-baud-rate)
- Timing & interfaces → [Crystal load capacitance](#crystal-load-capacitance)
- Timing & interfaces → [Oscillator stability](#oscillator-stability)
- Timing & interfaces → [PLL multiplication factor](#pll-multiplication-factor)
- Data conversion → [ADC resolution / quantization](#adc-resolution--quantization)
- Data conversion → [DAC resolution](#dac-resolution)
- Data conversion → [SNR estimation](#snr-estimation)

Tools finished before this file existed get their section when they are next
touched. The completeness pass under **Before release** in `TODO.md` catches
whatever is still missing.

## How a section is written

Every tool gets the same five headings, in this order:

- **What it computes** — the job, in a sentence or two.
- **Source** — the standard, datasheet or derivation the numbers come from. If
  there is no citable source, say so.
- **What it means** — the tool and its terms in plain words, before any
  formula, so a beginner can follow what the numbers are. For a reference
  table this may be most of the section.
- **Why the formulas are these** — the derivation. This is the part that cannot
  be written later from memory, so it is written while the tool is built.
- **Assumptions and limits** — what has been idealised away, and where the
  answer stops being trustworthy.
- **What it deliberately does not do** — scope, so a reader does not go looking
  for something that was left out on purpose.

Where a result was checked against something independent, say what and how. That
is what answers "why should I trust this number".

Sections are written as each tool is built. Tools built before this decision get
theirs when they are next touched, and a completeness pass before release
catches whatever is still missing.

---

# Passive components

<a id="resistor-color-code"></a>
## Resistor color code

`calc: resistor-color-code` · Passive components › Resistors

### What it computes

The resistance, tolerance and, on 6-band parts, temperature coefficient that a
resistor's colour bands stand for — and the other way round: type a value and
it shows the bands. It also says whether the value is a standard E-series value
and, if not, the nearest one.

### Source

**IEC 60062:2016**, *Marking codes for resistors and capacitors*. Its Table 1
gives each colour a digit, a multiplier, a tolerance and a temperature
coefficient; clause 3 says how the bands are laid out. Both were read in the
official preview of the standard, which runs to clause 4.2.2 — all this tool
needs.

### What the bands mean

A resistor is too small to print a number on, so the value is painted as rings
of colour, one digit per ring. Each colour stands for a digit from 0 to 9:
black 0, brown 1, red 2, orange 3, yellow 4, green 5, blue 6, violet 7,
grey 8, white 9.

- **Digit bands** — the first two (4-band parts) or three (5- and 6-band parts)
  give the significant figures.
- **Multiplier** — the next band says how many zeros follow, as a power of ten:
  red is ×100, orange ×1000. Gold (×0.1), silver (×0.01) and pink (×0.001,
  new in the 2016 edition) make values below 10 Ω: yellow–violet–pink is 47 mΩ.
- **Tolerance** — how far the actual resistance may be from the marked value:
  gold ±5% means a 1 kΩ part measures somewhere from 950 Ω to 1050 Ω. Leaving
  the band off means ±20%.
- **Temperature coefficient** (6-band only) — how much the resistance drifts
  per degree of temperature change, in parts per million per kelvin: brown is
  100 ppm/K, so 0.01% per degree.

Brown–black–red–gold is therefore 1, 0, ×100, ±5%: 1 kΩ ±5%.

**Which end to start from.** The tolerance band stands apart from the others,
on the right, and the standard makes it at least 1.5 times as wide as the
others; the digits are bunched on the left, starting as near the end as
possible. Gold and silver are never digits, so a part with gold at one end is
read from the other. On 6-band parts the temperature band comes last but is
not the wide one: the 2016 edition changed that, because a wide sixth band
was mistaken for the tolerance.

**Standard values.** Resistors are made only in preferred values, the
E-series, spaced so that neighbouring values just overlap within their
tolerance. The tolerance band picks the one series the value is checked
against — gold, ±5%, means E24; brown, ±1%, means E96 — and when the value is
not in it, the tool gives the nearest one that is. A 1% 4.7 kΩ part therefore
reads "Not in E96", though makers do sell it (see the E-series tool).

### How the value is worked out

    4 bands:  Value = (10 × D1 + D2) × Multiplier
    5, 6:     Value = (100 × D1 + 10 × D2 + D3) × Multiplier

Typing a value runs it backwards: the value is split into as many significant
digits as the band count allows, rounded, and the remaining power of ten picks
the multiplier colour. The smallest value a code can show is 10 mΩ on 4 bands
(brown–black–pink) and 0.1 Ω on 5 or 6; the largest is 99 GΩ and 999 GΩ.
Outside that there is no band for it, and the tool says so.

### Assumptions and limits

- **The 2016 tolerance colours.** IEC 60062:2016 made orange ±0.05%, yellow
  ±0.02% and grey ±0.01%. Before that edition some manufacturers used grey for
  a non-standard ±0.05%, so a grey tolerance band on an old part may mean that.
- **Colours are only as good as the light.** Red, orange and brown are easily
  confused on a real part, and so are violet and grey. When in doubt, measure.
- **Zero-ohm links** are marked with a single black band and are not a colour
  code as such.

### What it deliberately does not do

- **Capacitor and inductor colour codes** have their own tools, since the same
  colours mean different units and tolerances there.
- **SMD resistor codes** (the three- and four-digit and EIA-96 markings) are
  the SMD code tool.

### How it was checked

Against the IEC 60062:2016 table: digits, multipliers, tolerances and
temperature coefficients for every colour. This check found the app had grey
as ±0.05%, the pre-2016 non-standard value, and no tolerance for orange or
yellow; all three now follow the standard. A second reading of the official
text found two more gaps, now fixed: the pink ×0.001 multiplier was missing,
and the drawing made the tolerance band no wider than the others.

Brown–black–red–gold reads 1 kΩ ±5%, 950 Ω to 1.05 kΩ, an E24 value. 47 mΩ gives
yellow–violet–pink. At grey's ±0.01% the
range reads 999.9 Ω to 1.0001 kΩ — at four figures it had printed as
"1 kΩ", which the range now shows to enough figures to see. Typing 4.7 k gives
yellow–violet–red; 0.22 Ω gives red–red–silver.

[↑ Index](#index)

---

<a id="smd-code"></a>
## SMD resistor code

`calc: smd-code` · Passive components › Resistors

### What it computes

The resistance printed on a surface-mount (chip) resistor, from its marking —
3-digit, 4-digit or EIA-96 — and the other way round: the marking a value would
carry. It says whether the value is a standard E-series value.

### Source

**IEC 60062:2016**, *Marking codes for resistors and capacitors*, which defines
the three-character code (clause 4.2.2), the four-character code (4.2.3), R as
the decimal point, and in its Annex A a special three-character code for
values with three figures — what the industry calls EIA-96.

What was read in the standard itself, and what was not: the official 2016
preview runs to clause 4.2.2, far enough to confirm the three-character code
and its limit — it "is applicable to values from an E series up to E24", since
it carries only two figures. The three- and four-character tables were read in
**GOST IEC 60062-2014**, the official Russian edition of IEC 60062:2004, declared identical to it (IDT) and published free by Standartinform; its tables 3 and 4 match the official IEC 2004 preview word for word, and the 2016 versions of both tables in ROHM's application note
"List of Nominal Resistance Values" (2024), which reproduces them from
IEC 60062:2016. Annex A (EIA-96) is new in 2016, lies beyond the preview and is
not in the ROHM note; it was checked against published examples only.

### What the marking means

A chip resistor is far too small for colour bands, so the value is printed as
characters, three or four of them.

- **3-digit code** — usual on ±5% parts. The first two digits are the value's
  figures, the last is how many zeros follow them. 472 is 47 followed by two
  zeros: 4700 Ω, 4.7 kΩ. 334 is 330 kΩ; 100 is 10 Ω, not 100 Ω.
- **4-digit code** — usual on ±1% parts, which need a third figure. The first
  three are the figures, the last the number of zeros. 1001 is 1.00 kΩ, 4992 is
  49.9 kΩ.
- **R and L** — below 10 Ω (3-digit) or 100 Ω (4-digit) there is no zero count
  small enough, so a letter stands where the decimal point is: R in ohms,
  down to 0.1 Ω, then L in milliohms. 4R7 is 4.7 Ω, R47 0.47 Ω, 47R0 47.0 Ω;
  47L is 47 mΩ, 1L0 1 mΩ, 10L0 10 mΩ, 12L7 12.7 mΩ — the milliohm values are
  current-sense resistors. Some makers print R010 for 10 mΩ instead of 10L0;
  it reads the same, and the tool reads it.
- **0, 000 or 0000** — a zero-ohm link, used as a jumper that a pick-and-place
  machine can fit.
- **EIA-96** — on small 1% parts (0603 and below) even four characters do not
  fit. Two digits and a letter do: the digits are not the value but its
  position among the 96 values of the E96 series, 01 for 100 up to 96 for 976,
  and the letter is the multiplier. 01C is the first E96 value, 100, times 100:
  10 kΩ. 68X is 499 × 0.1 = 49.9 Ω.

### How the value is worked out

    3-digit:  Value = D1D2 × 10^D3
    4-digit:  Value = D1D2D3 × 10^D4
    EIA-96:   Value = E96[code] × multiplier

EIA-96 multiplier letters: Z ×0.001, Y or R ×0.01, X or S ×0.1, A ×1, B or H
×10, C ×100, D ×1000, E ×10⁴, F ×10⁵. Where two letters share a multiplier the
tool reads both and prints the first.

Typing a value runs it backwards. A marking holds only two or three figures, so
a value with more is rounded to what the part could carry — 12 345 Ω becomes
1232, 12.3 kΩ — and the tool says so. In EIA-96 only E96 values exist, so a
value is moved to the nearest one: 4.7 kΩ becomes 66B, 4.75 kΩ.

### Assumptions and limits

- **The marking does not say the tolerance.** A 3-digit code is usually ±5% and
  a 4-digit or EIA-96 code ±1%, but only the datasheet or the reel label says.
- **Standard value.** The value is checked against the series of that usual
  tolerance: E24 for a 3-digit code, E96 for 4-digit and EIA-96. So 472 is an
  E24 value, and 4701 reads "Not in E96 — nearest is 4.75 kΩ": E96 has no 4.7.
  A 3-digit code carries two figures, enough for every E6 to E24 value; the
  three figures of E48 to E192 need 4 digits or EIA-96.
- **Which scheme a part uses** shows in the marking: a letter other than R or
  L at the end means EIA-96, and digits only are the 3- or 4-digit code, told
  apart by how many there are. Pick the pill that matches.
- **Small parts may not be marked at all.** 0402 and smaller usually carry no
  marking; the value is only on the reel.
- Some makers use their own schemes for current-sense resistors (such as a
  lowercase m for milliohms); those are not covered.

### What it deliberately does not do

- **Colour bands** are the Color code tool.
- **SMD capacitor and inductor markings** have their own tools, since the same
  characters mean picofarads or microhenries there.

### How it was checked

Against published examples of the codes: 334 is 330 kΩ, 222
is 2.2 kΩ, 1001 is 1.00 kΩ, 4992 is 49.9 kΩ, R300 is 0.30 Ω, 01C is 10 kΩ; also
68X is 49.9 Ω and 66B 4.75 kΩ.

The review found four faults, now fixed. 47 mΩ on the 3-digit pill printed
"R047", four characters; 10 mΩ on the 4-digit pill printed "R0100", five
characters, and typing R010 showed R0100 on the chip. A marking of just "0"
for a zero-ohm link was rejected. And 12 345 Ω showed the code 1232 beside a
resistance of 12.35 kΩ, with nothing to say the code means 12.3 kΩ.

Reading the standard's tables (in ROHM's note) then showed that the first fix
was itself wrong: milliohms take the letter L, not R. The tool had printed
47 mΩ as R05, rounding it to 50 mΩ, and 12.7 mΩ as R013; the standard writes
47L and 12L7, exactly. It now writes the L forms — 47L, 1L0, L12, 10L0,
12L7 — and still reads R010.

[↑ Index](#index)

---

<a id="resistor-power-rating"></a>
## Resistor power rating

`calc: resistor-power-rating` · Passive components › Resistors

### What it computes

Which size a resistor needs. Enter its resistance and the voltage across it, or
the current through it, and the tool gives the power it dissipates, the
smallest chip size that takes it, the smallest at half its rating — the usual
design margin — and the through-hole wattage class at half its rating. A chip
must also be rated for the voltage across it.

Below that is the reference table: how much power each common resistor size can
dissipate, with its dimensions. Surface-mount parts are listed by package code, with their
maximum working voltage; through-hole parts by their wattage class, with a
typical body size. It can be filtered to SMD or through-hole and searched by
package or wattage.

### Source

- **SMD** — Yageo's RC_L general-purpose thick-film chip resistor datasheet
  (V.11): rated power at 70 °C, maximum working voltage and operating
  temperature range for each size from 01005 to 2512. These are the
  conventional figures most tables repeat.
- **Vishay D/CRCW e3** (revision April 2026) as the counter-example: the same
  sizes rated higher, 0.125 W for 0603 and 0.25 W for 0805.
- **Through-hole** body sizes are typical ranges from distributor listings,
  not a standard.

### What it means

When current flows through a resistor, the resistor turns electrical power into
heat. The power rating is the most heat it can get rid of, continuously,
without being damaged or drifting out of tolerance. Exceed it and the part
runs hot, its value shifts, and eventually it fails.

The power a resistor actually has to handle comes from what is across it or
through it:

    P = V² / R = I² × R

A 1 kΩ resistor with 5 V across it dissipates 25 / 1000 = 25 mW, well inside an
0603's 100 mW. The same resistor at 12 V dissipates 144 mW: more than an 0805's
125 mW, so a 1206 at least, and a 1210 with the half-rating rule below.

**Temperature.** The rating holds only while the air around the part is at
70 °C or cooler. Above that the part can shed less heat, and the allowed power
falls in a straight line to nothing at 155 °C, the maximum film temperature —
125 °C for 0201 and 01005. A common rule is to use no more than half the
rating, which leaves room for a warm enclosure and for the board around the
part heating it too.

**Voltage.** Each size also has a maximum working voltage, set by the gap
between its terminals. For high resistance values this limit is reached before
the power one:

    V = √(P × R), or the maximum working voltage, whichever is lower

An 0603 (1/10 W, 75 V) at 1 MΩ would reach its power rating at 316 V, but may
only see 75 V, which is 75² / 1 MΩ = 5.6 mW. For high-voltage dividers the
voltage rating, not the wattage, sets the size — or several resistors in
series share the voltage.

### Assumptions and limits

- **Ratings depend on the series, not only the size.** The table gives the
  conventional general-purpose figures; anti-surge, high-power and some newer
  thick-film series rate the same package two or four times higher. The part's
  own datasheet has the last word.
- **The board matters.** An SMD rating assumes the copper pads and board carry
  heat away as in the maker's test. Small pads, thin copper or neighbouring hot
  parts lower it.
- **Through-hole sizes vary by maker and technology**: a metal-film 1/4 W part
  and a carbon-film one are not the same size. The ranges are for recognising a
  part, not for a footprint.
- Pulses are a separate question: a short pulse can exceed the continuous
  rating, within limits the datasheet gives as a pulse curve.
- **The size check uses the table's figures**: the Yageo ratings for chips,
  each with its maximum working voltage, and the wattage class for leaded
  parts, whose voltage rating is not in the table and depends on the part.
  "Half its rating" is the usual margin for a warm enclosure and hot
  neighbours; the full rating holds only up to 70 °C around the part, on the
  maker's pad layout.
- Above 200 V no chip in the table will do; several in series share the
  voltage, each taking its part.

### What it deliberately does not do

- **Package dimensions in detail** (pad sizes, heights) are the SMD package
  sizes tool.
- **Temperature rise** from a given power and board is a thermal calculation,
  not a rating lookup.

### How it was checked

Every SMD power rating, working voltage and the 125 °C / 155 °C limits against
the Yageo RC_L datasheet. The review corrected the 1210's size in inches, which
read 0.12″ × 0.125″, and the 0805's width to 1.25 mm; the SMD package sizes
review later aligned all the sizes to makers' datasheets (1210: 0.126″ ×
0.098″); it also withdrew the claim that SMD ratings are
standard across manufacturers, which the Vishay datasheet contradicts. The
maximum working voltages were added then.

The size check was added in the re-walk. Its reference cases: 1 kΩ at 12 V is
144 mW, a 1206 at full rating, a 1210 or a 1/2 W leaded part at half; a 0.1 Ω
shunt at 2 A is 0.4 W, a 1210 or at half a 2512; 1 MΩ at 100 V is only 10 mW
but needs an 0805, the first chip rated over 75 V. The re-walk also corrected
this section's own example, which had said 144 mW fits "an 0805 at least" when
an 0805 is rated 125 mW.

[↑ Index](#index)

---

<a id="e-series"></a>
## E-series values

`calc: e-series` · Passive components › Resistors

### What it computes

The standard value nearest to the one you want, in the series you choose (E6 to
E192), how far off it is in percent, and the whole series across the decade of
your value, with the nearest one highlighted.

### Source

**IEC 60063:2015**, *Preferred number series for resistors and capacitors*. It
lists every series value by value, and its tolerances: E6 ±20%, E12 ±10%, E24
±5%, E48 ±2%, E96 ±1%, E192 ±0.5% and better.

### What it means

Resistors and capacitors are not made in every value. It would be impossible to
stock them all, and pointless: a ±5% 1000 Ω resistor can be anything from 950
to 1050 Ω, so a separate 1010 Ω part would overlap it completely. Instead,
manufacturers make a fixed set of **preferred values**, the E-series.

Each series splits a decade — 1 to 10, 10 to 100, and so on — into a fixed
number of steps: 6 for E6, 24 for E24, 96 for E96. The steps are not equal in
ohms but equal in **ratio**, so each value is the same percentage above the
previous one, whatever the decade. And the number of steps is chosen so that
the gap between neighbours matches the tolerance: in E24 each value is about
10% above the last, so ±5% parts either side just meet. That is why the
tolerance tells you the series — ±5% parts come in E24 values, ±1% in E96.

In practice: pick the tolerance you need, look up the nearest value in its
series, and check whether the percent difference matters for your circuit. If
it does, a tighter series has a closer value, or two parts in series or
parallel can make up the difference.

### How the values are worked out

    Eᵢ = 10^(i / N),  i = 0 … N−1,  rounded to 2 figures (E6–E24) or 3 (E48–E192)

N is the number of values in the series. E48, E96 and E192 follow this formula,
with one exception: the standard lists 920 in E192 where the formula gives
919. E6, E12 and E24 are older than the formula and were chosen by hand; eight
E24 values differ from it — 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7 and 8.2 — which is
why 4.7 kΩ, not 4.6 kΩ, is the value everyone knows. The tool uses the
standard's lists, not the formula, for those.

The nearest value is the one with the smallest percentage difference from what
you typed. The top of a decade counts as the start of the next one, so 97 kΩ in
E24 gives 100 kΩ, not 91 kΩ.

### Assumptions and limits

- **E3** (±40%: 1.0, 2.2, 4.7) exists in the standard but is rarely used for new
  parts and is not offered.
- **Exactly between two values** the lower one is given; both are equally far
  off.
- **One tolerance, one series.** Throughout the app a tolerance picks exactly
  one series: ±1% means E96, and the sliders and hints step through E96 only.
  Manufacturers also sell the E24 values at ±1% — Yageo's RC_L datasheet lists
  "1% (E24/E96)" — so a 1% 4.7 kΩ part is easy to buy even though the app
  suggests 4.75 kΩ. The simpler rule is kept on purpose.
- **Capacitors** follow the same series, but in practice ceramic capacitors are
  mostly stocked in E6 or E12 values, and electrolytics in E3 or E6.
- The table shows the decade of the nearest value, so the value found is always
  highlighted in it: for 97 kΩ in E24 that is the 100 kΩ decade.

### What it deliberately does not do

- **Combining two standard values** to hit an exact one is a series/parallel
  question, the Series/parallel tool's job.

### How it was checked

Every E48 and E96 value against the IEC 60063 list, and E192 against the same
list. The review found the E192 exception missing: the tool showed 919 where
the standard has 920, so 9.2 kΩ was reported as not standard; it now uses 920.
The E6, E12 and E24 lists, including the eight values that differ from the
formula, match the standard. The table also showed the decade of the typed
value, so a nearest value in the next decade (97 kΩ → 100 kΩ) was not
highlighted; it now shows the nearest value's decade.

[↑ Index](#index)

---

<a id="series-parallel"></a>
## Series/parallel (R)

`calc: series-parallel` · Passive components › Resistors

### What it computes

The total resistance of two to four resistors connected in series or in
parallel, the range it can take given the parts' tolerance, and the nearest
single standard part to that total. Each resistor has a slider that steps
through standard values.

### Source

Ohm's law and Kirchhoff's laws; no standard is needed beyond them. The
standard values come from IEC 60063, as in the E-series tool.

### What it means

**In series** — resistors connected end to end, so the same current has to pass
through each of them in turn. Each one drops a voltage, and the drops add up,
so the resistances add:

    R = R1 + R2 + R3 + …

The total is always more than the largest one.

**In parallel** — resistors connected side by side between the same two points,
so each sees the same voltage and the current divides between them. Each gives
the current another path, so the total is always less than the smallest one.
It is the conductances, 1/R, that add:

    1/R = 1/R1 + 1/R2 + 1/R3 + …
    R = R1 × R2 / (R1 + R2)       for two

Two equal resistors in parallel give half of one; ten in parallel, a tenth. A
resistor much larger than another barely changes it: 1 kΩ in parallel with
1 MΩ is 999 Ω.

**Why combine them.** The common reason is to get a value the E-series does
not stock from two it does — 1 kΩ in parallel with 4.7 kΩ is 824.6 Ω, within a
tenth of a percent of the E96 value 825 Ω. Others: to share the power or the
voltage between several parts, each within its own rating.

### Tolerance of the total

If every resistor is off by the same fraction in the same direction, the series
sum and the parallel combination are both off by exactly that fraction. So in
the worst case the total has the same tolerance as the parts, no better and no
worse, and that is the range the tool shows. In practice the errors of separate
parts are independent and partly cancel, so the total is usually closer than
that — but a worst-case design should not count on it.

### Assumptions and limits

- **Up to four resistors**, all in series or all in parallel. Mixed networks
  (two in series, in parallel with a third) are worked out in steps: combine
  one group, then use its total as a single resistor.
- **A zero-ohm resistor in parallel** shorts the group, and the total is 0.
- Wire and contact resistance are ignored, which matters only for milliohm
  values.

### What it deliberately does not do

- **Capacitors and inductors** combine the other way round and have their own
  tools.
- **Finding the best pair** for a target value automatically is not done; the
  sliders make trying pairs quick.

### How it was checked

By hand: 1 k + 2.2 k = 3.2 kΩ; 1 k ∥ 1 k = 500 Ω; 1 k ∥ 4.7 k = 824.6 Ω, nearest
E96 825 Ω; a third 1 kΩ in parallel gives 451.9 Ω; 1 k ∥ 0 = 0 Ω. The tolerance
ranges are the total × (1 ± t).

[↑ Index](#index)

---

<a id="voltage-divider"></a>
## Voltage divider

`calc: voltage-divider` · Passive components › Resistors

### What it computes

For two resistors in series across a voltage, any one of the output voltage,
the top resistor R1 or the bottom resistor R2, from the other three. It also
gives the output's worst-case spread from the resistors' tolerance, the current
through the pair and the power in each resistor, and when a resistor is solved
for, the nearest standard value and the output that value would give.

### Source

Ohm's law applied to two resistors in series; standard values from IEC 60063.

### What it means

A voltage divider makes a smaller voltage out of a larger one. Two resistors
are connected in series from the input voltage to ground. The same current
flows through both, so each drops a share of the voltage in proportion to its
resistance, and the point between them — the output — sits at a fixed fraction
of the input:

    Vout = Vin × R2 / (R1 + R2)

Equal resistors give half. A 10 kΩ over a 4.7 kΩ gives 4.7 / 14.7, about a
third. Typical uses: bringing a 12 V signal down to what a 3.3 V ADC can read,
setting a reference voltage, or biasing a transistor.

Solved for either resistor:

    R1 = R2 × (Vin − Vout) / Vout
    R2 = R1 × Vout / (Vin − Vout)

**Choosing the values.** Only the ratio sets Vout, so 1 kΩ/1 kΩ and 1 MΩ/1 MΩ
both halve the voltage. What the size decides is the current: small values
waste power (12 V across 2 kΩ is 6 mA, 72 mW), large ones make the output weak,
easily pulled down by whatever it feeds and more sensitive to noise. Tens of kΩ
is a common middle ground for signals.

### Tolerance

The output is furthest off when the two resistors miss in opposite directions:
R2 high and R1 low pushes Vout up, the reverse pulls it down.

    Vout max = Vin × R2(1+t) / (R1(1−t) + R2(1+t))
    Vout min = Vin × R2(1−t) / (R1(1+t) + R2(1−t))

So a divider built from ±1% parts is not a ±1% divider: 10 kΩ over 4.7 kΩ at
±1% spreads by ±1.37%. The spread is widest when the output is a small fraction
of the input, and approaches ±2t.

### Loading

The formula assumes nothing draws current from the output. Anything that does
— an ADC input, a transistor base, a meter — is a resistor in parallel with R2,
and lowers the output. Seen from the output, the divider behaves like a source
with an internal resistance of R1 ∥ R2, so a load RL lowers Vout by roughly

    (R1 ∥ R2) / RL

1% for a load a hundred times R1 ∥ R2, 10% for one ten times. The fix is lower
divider resistances or a buffer (the op-amp voltage follower).

### Assumptions and limits

- **Unloaded**, as above.
- **Positive voltages.** For a negative supply, enter both voltages as
  positive values; the ratio and the resistors are the same.
- Vout must be between 0 and Vin when solving for a resistor; a divider can
  only divide.
- The standard value offered is from the one series the chosen tolerance
  implies (±1% → E96).

### What it deliberately does not do

- **A load resistor** is not an input; the loading rule above covers it.
- **Adjustable dividers** (a potentiometer with fixed end resistors) are not
  modelled.

### How it was checked

By hand: 12 V over 10 k/10 k gives 6 V, 5.94–6.06 V at ±1%, 600 µA, 3.6 mW
each. 10 k over 4.7 k gives 3.837 V, 3.78–3.89 V (±1.37%). R1 for 12 V to
3.3 V with R2 = 10 kΩ is 26.36 kΩ, nearest E96 26.1 kΩ giving 3.32 V. R2 for
5 V to 3.3 V with R1 = 10 kΩ is 19.41 kΩ, E96 19.6 kΩ giving 3.31 V. Vout equal
to Vin, or below zero, is refused with a reason.

[↑ Index](#index)

---

<a id="current-divider"></a>
## Current divider

`calc: current-divider` · Passive components › Resistors

### What it computes

For a current flowing into two resistors in parallel, any one of the current in
the first branch I1, R1 or R2, from the other three. It also gives the current
in the second branch, the voltage across both, the spread of I1 from the
resistors' tolerance, and when a resistor is solved for, the nearest standard
value and the current it would give.

### Source

Ohm's law and Kirchhoff's current law; standard values from IEC 60063.

### What it means

When a current reaches two resistors connected in parallel, it splits: part
goes through each branch and the two parts add back up to the whole
(Kirchhoff's current law). Both branches have the same voltage across them, so
by Ohm's law each takes a current inversely proportional to its resistance —
the easier path takes more:

    I1 = Iin × R2 / (R1 + R2)
    I2 = Iin × R1 / (R1 + R2)

This is the voltage divider turned inside out, and the place people trip: the
current in branch 1 is set by the *other* resistor, R2. With 20 mA into 1 kΩ in
parallel with 2 kΩ, the 1 kΩ branch takes two thirds, 13.3 mA, and the 2 kΩ
branch one third, 6.7 mA.

Solved for a resistor:

    R1 = R2 × (Iin − I1) / I1
    R2 = R1 × I1 / (Iin − I1)

**Where it is used.** Shunts that extend a meter's range (a small resistor in
parallel takes most of the current, the meter a known fraction), sharing
current between parallel parts, and understanding why a low-value resistor
in parallel with a circuit steals most of its current.

### Tolerance

As with the voltage divider, I1 is furthest off when the two resistors miss in
opposite directions, so the spread of I1 can exceed the parts' own tolerance.
When I1 is the larger share, it is less sensitive: 1 k ∥ 2 k at ±1% moves I1 by
only ±0.66%, because most of the error lands in the smaller branch current.

### Assumptions and limits

- **The total current is taken as given**, as if from a current source. In a
  real circuit fed from a voltage, Iin itself depends on R1 ∥ R2.
- **Two branches.** For more, combine all but one into a single resistance
  first with the Series/parallel tool.
- I1 must be between 0 and Iin when solving for a resistor.
- The standard value offered is from the one series the chosen tolerance
  implies.

### What it deliberately does not do

- **Power in each branch** is not shown; the voltage across the branches is,
  and P = V² / R from there.

### How it was checked

By hand: 20 mA into 1 k ∥ 1 k is 10 mA each at 10 V; into 1 k ∥ 2 k, 13.33 mA
and 6.67 mA at 13.3 V, I1 between 13.2 and 13.4 mA at ±1%. R1 for 15 mA of
20 mA with R2 = 1 kΩ is 333.3 Ω, E96 332 Ω. R2 for 5 mA of 20 mA with
R1 = 1 kΩ is 333.3 Ω. I1 above Iin is refused. The review labelled the
voltage in the result line, which had been a bare "10 V" with nothing to say
what it was.

[↑ Index](#index)

---

<a id="wheatstone-bridge"></a>
## Wheatstone bridge

`calc: wheatstone-bridge` · Passive components › Resistors

### What it computes

For a balanced Wheatstone bridge, any one of its four resistors from the other
three. Solving for the unknown Rx, it also gives the ratio R2 / R1 that
multiplies R3 into Rx; solving for one of the fixed arms, the nearest standard
value.

### Source

The balance condition follows from Ohm's law applied to the two dividers that
make up the bridge. The circuit is Samuel Hunter Christie's (1833),
popularised by Charles Wheatstone.

### What it means

A Wheatstone bridge measures an unknown resistance by comparing it with known
ones, instead of measuring a current and a voltage.

Four resistors form a diamond. A supply V is connected across the top and
bottom corners, so the left side (R1 over R3) and the right side (R2 over Rx)
are two voltage dividers on the same supply. A sensitive meter — a
galvanometer, G — joins the midpoints of the two sides.

If the two midpoints are at the same voltage, no current flows through the
meter and it reads zero. The bridge is then **balanced**, and that happens when
both dividers have the same ratio:

    R1 / R2 = R3 / Rx      so      Rx = R2 × R3 / R1

The supply voltage and the meter's own characteristics drop out entirely: the
only thing that matters is whether the meter reads zero, which even a crude
meter can tell very precisely. That is what made the bridge the standard way to
measure resistance accurately.

**In use.** R1 and R2 are fixed and set the range: with R2 / R1 = 10, Rx is ten
times R3. R3 is a calibrated adjustable resistor. Turn R3 until the meter reads
zero, and Rx = 10 × R3.

The same circuit, left unbalanced, is how strain gauges, pressure sensors and
many thermometers are read: a small change in one arm produces a small voltage
across the meter's position, measured by an amplifier.

### Assumptions and limits

- **Balance only.** The tool gives the resistance that balances the bridge; it
  does not compute the voltage or current through the meter when the bridge is
  off balance.
- **The precision is that of the known arms.** Rx can be no more accurate than
  R1, R2 and R3 combined; with ±0.1% parts, roughly ±0.3% worst case.
- The arm used as a divisor cannot be zero: R1 when solving Rx, Rx when solving
  R1, R3 for R2 and R2 for R3.

### What it deliberately does not do

- **Unbalanced output** for sensor bridges (the voltage across G as a function
  of a changing arm) is a different calculation, not done here.
- AC bridges for capacitance and inductance (Maxwell, Schering, Wien) are not
  covered.

### How it was checked

By hand: R1 = 1 k, R2 = 2 k, R3 = 3 k balance with Rx = 6 kΩ, ratio 2; each of
the other three arms solved from the remaining ones gives back 1 k, 2 k and
3 k. R1 = 0 is refused. The review replaced the "nearest standard value" once
shown for Rx, which is the resistance being measured rather than a part to
buy, with the bridge ratio; dropped "(unknown)" from Rx's label, which stayed
even when Rx was an input; and made the supply's V label neutral, which had
taken R1's colour.

[↑ Index](#index)

---

<a id="delta-y"></a>
## Delta-Y transform

`calc: delta-y` · Passive components › Resistors

### What it computes

Converts three resistors connected as a triangle (Delta, Δ) into the three of
an equivalent star (Y), or the reverse, so that the two behave identically
between their three terminals.

### Source

Arthur Edwin Kennelly's transform (1899), derived from requiring the resistance
between each pair of terminals to be the same in both networks.

### What it means

Three resistors can be connected to three terminals A, B and C in two ways:

- **Delta (Δ)** — a triangle. One resistor between each pair of terminals:
  Rab, Rbc, Rca.
- **Y (star, also called T)** — three resistors meeting at a common centre
  point, one leg to each terminal: Ra, Rb, Rc.

Seen only from the three terminals, a Delta and a suitably chosen Y cannot be
told apart: the resistance between any two terminals is the same, whatever else
is connected. So one can always be replaced by the other.

**Why that is useful.** Many networks are neither series nor parallel anywhere
— the classic case is a bridge, five resistors in a diamond with one across the
middle. Replacing one of its triangles by the equivalent star turns it into
ordinary series and parallel combinations that can be simplified step by step.
The same transform turns up in three-phase power, where loads are wired in
delta or in star.

### The formulas

**Delta to Y** — each leg of the star is the product of the two Delta sides that
touch its terminal, divided by the sum of all three:

    Ra = Rab × Rca / (Rab + Rbc + Rca)
    Rb = Rab × Rbc / (Rab + Rbc + Rca)
    Rc = Rbc × Rca / (Rab + Rbc + Rca)

**Y to Delta** — each side of the triangle is the sum of the products of the
legs taken in pairs, divided by the leg *opposite* that side:

    Rab = (Ra·Rb + Rb·Rc + Rc·Ra) / Rc
    Rbc = (Ra·Rb + Rb·Rc + Rc·Ra) / Ra
    Rca = (Ra·Rb + Rb·Rc + Rc·Ra) / Rb

A way to remember them: Delta to Y divides, so the star's legs are smaller;
Y to Delta multiplies, so the triangle's sides are larger. With three equal
parts the Y is a third of the Delta: a 300 Ω triangle is a 100 Ω star.

### Assumptions and limits

- **All three must be greater than zero.** A zero-ohm side or leg joins two
  terminals directly, and the network is no longer a true three-terminal one.
- **Resistance only.** The transform holds just as well for impedances
  (capacitors and inductors, in AC circuits), but this tool works in ohms.

### What it deliberately does not do

- **Solving a whole network** (such as the full bridge) is not automated; the
  tool does the one step that makes the rest ordinary.

### How it was checked

By hand: a 300 Ω Delta gives a 100 Ω Y, and back. Rab = 10, Rbc = 20,
Rca = 30 Ω give Ra = 5, Rb = 3.333, Rc = 10 Ω, and those three converted back
give 10, 20 and 30 Ω.

[↑ Index](#index)

---

<a id="thermistor"></a>
## NTC/PTC thermistor

`calc: thermistor` · Passive components › Resistors

### What it computes

For a temperature-sensing resistor, its resistance at a given temperature or
the temperature for a measured resistance, from the datasheet's reference
resistance and coefficient; and its sensitivity, in percent per degree, at that
point. A curve from −20 to 100 °C shows where the point sits.

- **NTC** — the B-parameter model, used for ordinary NTC thermistors.
- **PTC** — a linear model, for silicon (KTY) sensors and, approximately,
  platinum RTDs.

### Source

- The B-parameter equation, as NTC datasheets define it. The Vishay NTCLE100E3
  datasheet defines B as ln(R1/R2) / (1/T1 − 1/T2) and gives B25/85 = 3977 K
  for its 10 kΩ part, with a full resistance-temperature table, which is what
  the tool was checked against.
- The linear PTC model is the definition of a temperature coefficient α.

### What it means

A **thermistor** is a resistor whose resistance changes strongly with
temperature, made to be used as a temperature sensor. Put it in a voltage
divider, read the voltage with an ADC, work out the resistance, and from that
the temperature.

- **NTC** (negative temperature coefficient): resistance falls as temperature
  rises, steeply — about 4% per °C near room temperature for a typical part. A
  10 kΩ NTC is 10 kΩ at 25 °C, about 33 kΩ at 0 °C and about 1 kΩ at 85 °C.
- **PTC** (positive temperature coefficient): resistance rises with
  temperature. The sensors modelled here rise steadily; a KTY silicon sensor
  by about 0.7% per °C, a Pt100 platinum RTD by 0.385% per °C.

The datasheet gives two numbers that define the part:

- **R0 at T0** — its resistance at a reference temperature, almost always
  25 °C. "10 kΩ NTC" means 10 kΩ at 25 °C.
- **B** (for an NTC), in kelvin — how steep the curve is. A higher B means a
  larger change per degree. Or **α** (for a linear PTC) in percent per degree.

### The formulas

    NTC:  R = R0 × e^(B × (1/T − 1/T0))
          T = 1 / (1/T0 + ln(R/R0) / B)
    PTC:  R = R0 × (1 + α × (T − T0))

T and T0 are in kelvin (°C + 273.15) in the NTC equations. The sensitivity is
the slope of the curve as a percentage: −B / T² for the NTC, which grows
steeper the colder it is, and simply α for the linear PTC.

### How good the B model is

B is measured between two temperatures, written as a suffix: **B25/85** is
worked out from the resistance at 25 °C and at 85 °C, B25/50 from 25 and 50 °C.
The model then goes exactly through those two points and bends away from the
real curve outside them. Checked against the Vishay 10 kΩ part's own table,
with B25/85 = 3977 K:

| Temperature | Datasheet | B model | Difference |
|---|---|---|---|
| −40 °C | 332.1 kΩ | 412 kΩ | +24%, about 3.5 °C |
| −20 °C | 96.4 kΩ | 107 kΩ | +11%, about 2 °C |
| 0 °C | 32.6 kΩ | 33.9 kΩ | +4%, under 1 °C |
| 85 °C | 1.07 kΩ | 1.07 kΩ | exact |
| 100 °C | 677 Ω | 685 Ω | +1% |

So: use the B value whose temperature pair covers the range you measure, and
for accuracy well below 0 °C use the datasheet's table or the Steinhart-Hart
equation, which fits three points instead of two.

### Assumptions and limits

- **Self-heating is ignored.** The current used to measure a thermistor also
  warms it. Datasheets give a dissipation factor (a few mW/°C); keep the
  measuring current small enough that it adds a fraction of a degree.
- **The part's own tolerance** — typically ±1 to ±5% on R25 and ±0.5 to ±3% on
  B — adds to the model error.
- **Switching PTCs** (resettable polymer fuses, ceramic PTC heaters and motor
  protectors) jump sharply by orders of magnitude at a trip temperature. No
  single smooth formula describes them, and they are not modelled.
- A platinum RTD is not exactly linear; the linear model is within a few
  tenths of a degree over 0–100 °C, and the full Callendar-Van Dusen equation
  is needed beyond that.

### What it deliberately does not do

- **Steinhart-Hart** three-coefficient fitting is not offered.
- **The divider around the sensor** (choosing the fixed resistor for best
  resolution) is the Voltage divider tool's arithmetic.

### How it was checked

Against the Vishay NTCLE100E3 datasheet table as above. At 85 °C the model
gives 1.07 kΩ, as the datasheet does, and typing 1.07 kΩ back gives 85.0 °C;
the sensitivity at 25 °C is −4.47 %/°C. The linear PTC with R0 = 1 kΩ,
α = 0.7 %/°C gives 1.525 kΩ at 100 °C.

The review made the temperature field accept negative values on an iPhone,
whose number keypad has no minus key; limited the resistance units to Ω, kΩ
and MΩ; and replaced the table of "typical" B values, which had no source,
with the Vishay figures.

[↑ Index](#index)

---

<a id="ceramic-code"></a>
## Ceramic cap code

`calc: ceramic-code` · Passive components › Capacitors

### What it computes

The capacitance and tolerance printed on a ceramic capacitor as a three- or
four-digit code with an optional letter, and the other way round: the marking
for a value. It says whether the value is a standard E-series value.

### Source

- **EIA-198** (RS-198), the code for ceramic capacitors: digits in picofarads,
  with 8 and 9 as the multipliers ×0.01 and ×0.1 for values under 10 pF.
- **IEC 60062:2016**, for R as the decimal point, its three-character code for
  capacitors (clause 4.3.2) and the tolerance letters (clause 5: relative
  tolerances, asymmetrical ones such as Z, and absolute ones in pF).

What was read: IEC 60062's capacitor letter code (clause 4.3) and all its
tolerance letters (clause 5, tables 6 to 8) in **GOST IEC 60062-2014**, the official Russian edition of IEC 60062:2004, declared identical to it (IDT) and published free by Standartinform; its tables 3 and 4 match the official IEC 2004 preview word for word. The digit code
(104 = 100 nF) is given "according to IEC 60062" in Vishay's ceramic capacitor
catalogue, which also writes values below 10 pF as 1p0 to 9p1. EIA-198 is not
freely available: the 479 form, with 8 and 9 as ×0.01 and ×0.1, is found on
parts and in reference guides but was not read in any standard.

### What the marking means

Ceramic disc and small film capacitors have no room for "100 nF", so the value
is printed as a code, always counted in **picofarads** (pF). 1 nF is 1000 pF,
and 1 µF is 1 000 000 pF.

- **Three digits** — the first two are the value's figures, the last is how many
  zeros follow them. 104 is 10 followed by four zeros: 100 000 pF, which is
  100 nF or 0.1 µF — the most common capacitor there is. 472 is 4700 pF, 4.7 nF.
  220 is 22 pF, not 220 pF.
- **Small values** — below 10 pF the standard puts p where the decimal point
  would be: 4p7 is 4.7 pF, 1p0 is 1 pF. Parts are also seen with R in its
  place (4R7), or with a last digit 9 meaning ×0.1 and 8 meaning ×0.01, the
  EIA practice: 479 is 47 × 0.1 = 4.7 pF. The tool reads all three and writes
  the standard's 4p7.
- **Four digits** — three figures and a multiplier, for closer values: 1002 is
  10 000 pF, 10 nF.
- **A letter after the digits** is the tolerance:

| Letter | Below 10 pF | 10 pF and above |
|---|---|---|
| B | ±0.1 pF | ±0.1% |
| C | ±0.25 pF | ±0.25% |
| D | ±0.5 pF | ±0.5% |
| F | ±1 pF | ±1% |
| G | ±2 pF | ±2% |
| J | | ±5% |
| K | | ±10% |
| M | | ±20% |
| Q | | −10% / +30% |
| T | | −10% / +50% |
| S | | −20% / +50% |
| Z | | −20% / +80% |

  Small capacitors use a tolerance in picofarads because a percentage of a few
  picofarads would be a fraction of the stray capacitance of the leads. Q, T,
  S and Z are uneven tolerances, for parts whose value is mostly guaranteed
  not to be too low; Z is typical of cheap high-capacitance ceramics. Some
  makers use letters of their own outside the standard — Vishay prints Y for
  −20/+50% and P for −0/+100% — which the tool does not read.

So **473K** is 47 nF ±10%, **104M** 100 nF ±20%, **220J** 22 pF ±5%.

**Other markings on the part.** A code such as **X7R**, **X5R**, **C0G** or
**NP0** is the dielectric, which says how the capacitance changes with
temperature and voltage — C0G/NP0 barely at all, X7R by ±15% over −55 to
+125 °C, Y5V by much more. A number followed by V, or a code such as 1H or 2A,
is the voltage rating. Neither is part of the value code.

### Assumptions and limits

- **The value is nominal.** Class 2 ceramics (X7R, X5R, Y5V) lose capacitance
  with DC voltage applied: a 10 µF X5R part can be well under half of that at
  its rated voltage. The code says nothing about it; the datasheet's DC-bias
  curve does.
- **SMD ceramic chips are almost never marked**: they are too small, and the
  value is only on the reel. The code is mostly seen on through-hole discs and
  on film capacitors.
- A value typed in is encoded with p below 10 pF (4p7), as the standard
  writes it; 4R7 and 479 mean the same and are read as well.
- **Standard value.** The tolerance letter picks the one series the value is
  checked against: J (±5%) E24, K (±10%) E12, M (±20%) E6, as for resistors.
  With no letter, or an uneven one (Q, T, S, Z), it is E6, the series most
  ceramics are stocked in. Below 10 pF, B to G give a tolerance in picofarads,
  which implies no series, and the tool says so.

### What it deliberately does not do

- **Film capacitor markings** such as 4n7 and the voltage codes have the Film
  code tool; **SMD capacitor** two-character codes have their own tool.

### How it was checked

104 → 100 nF, 473K → 47 nF ±10%, 220J → 22 pF ±5%, 106M → 10 µF ±20%,
4R7 → 4.7 pF, 8R2C → 8.2 pF ±0.25 pF.

The review found three faults, now fixed. Codes ending in 8 or 9 were read as
powers of ten, so 479 came out as 47 mF instead of 4.7 pF; they now follow
EIA-198. B, C and D above 10 pF were read as picofarads, so 101D showed
±0.5 pF instead of ±0.5%. And the units offered ran to millifarads and farads,
which no ceramic capacitor reaches; they are now pF, nF and µF. The drawing now
shows the marking as typed (479 stays 479 rather than becoming 4R7).

The re-walk checked the value against the tolerance's own series rather than
the coarsest one it happened to be in: 182 is "Not in E6 — nearest is 1.5 nF",
182K an E12 value, 479C "no E-series implied".

A reading of the standard's text (GOST IEC 60062-2014, identical to the 2004
edition) and Vishay's catalogue then made four changes: the picofarad letters
apply below 10 pF, not at 10 pF itself (100C is ±0.25%, 8p2C ±0.25 pF); the
uneven letters Q, T and S were added; values below 10 pF are written 4p7, the
standard's form; and 4p7 is read.

[↑ Index](#index)

---

<a id="film-code"></a>
## Film capacitor code

`calc: film-code` · Passive components › Capacitors

### What it computes

The capacitance and tolerance printed on a film capacitor, in either of the two
ways film parts are marked — the 3-digit picofarad code or the letter code
(4n7) — and the other way round: the marking for a value.

### Source

- **EIA-198** for the 3-digit code, the same as on ceramic capacitors.
- **IEC 60062:2016** for the letter code (the "RKM" code: p, n, µ in place of
  the decimal point, clause 4.3.1) and the tolerance letters (clause 5).

The letter code (clause 4.3) and the tolerance letters (clause 5, table 6)
were read in **GOST IEC 60062-2014**, the official Russian edition of IEC 60062:2004, declared identical to it (IDT) and published free by Standartinform; its tables 3 and 4 match the official IEC 2004 preview word for word. TDK's film capacitor marking guide says its parts
use "the coded forms specified in IEC 60062:2004". EIA-198 is not freely
available and was not read.

### What the marking means

Film capacitors — polyester (PET), polypropylene (PP) and similar, usually a
small rectangular box with two leads — carry their value in one of two ways.

**The 3-digit code**, in picofarads. The first two digits are the figures, the
last how many zeros follow: 104 is 100 000 pF = 100 nF, 473 is 47 nF, 102 is
1 nF. As on ceramics, a last digit of 9 or 8 means ×0.1 or ×0.01 for values
under 10 pF, though film parts that small are rare.

**The letter code.** The unit letter stands where the decimal point would be:

- p = picofarad, n = nanofarad, µ (often written u) = microfarad
- 4n7 = 4.7 nF, n33 = 0.33 nF (330 pF), µ1 or u1 = 0.1 µF (100 nF),
  2µ2 = 2.2 µF, 100p = 100 pF

It is the same idea as 4k7 for a 4.7 kΩ resistor: no decimal point to rub off
or be misread.

**The tolerance letter** that often follows either form:

| Letter | Tolerance |
|---|---|
| F | ±1% |
| G | ±2% |
| H | ±3% |
| J | ±5% |
| K | ±10% |
| M | ±20% |

**H is where the sources disagree.** The standard's text gives H = ±3%
(IEC 60062:2004, table 6, in its official identical GOST edition). WIMA, TDK
and KEMET use H for ±2.5% in their part numbers and marking guides — TDK while
stating it follows IEC 60062:2004 — and WIMA also uses F for ±1.5% and E for
±1%. The tool follows the standard's text, ±3%; on a WIMA, TDK or KEMET part,
check the datasheet.

**The voltage code.** Many film capacitors add a two-character voltage code in
front of the value, per the same EIA scheme: 1H = 50 V, 2A = 100 V,
2E = 250 V, 2G = 400 V, 2J = 630 V. So **2A104J** is a 100 V, 100 nF, ±5% part.
Others print the voltage plainly (63 V, 400 V=).

### Assumptions and limits

- **Plain decimals** such as ".1" or "0.1" on older and larger parts mean
  microfarads (0.1 µF); the tool reads only the two coded forms.
- **The voltage code is not read** from the marking; type the part of the
  marking that follows it.
- A value typed in is encoded with the unit that gives the shortest marking;
  n33 and 330p mean the same.
- **Standard value.** The tolerance letter picks the one series the value is
  checked against: J (±5%) E24, K (±10%) E12, M (±20%) E6, G and H E48, F E96.
  With no letter it is E12, since film parts are mostly ±10% and stocked in
  E12 values.

### What it deliberately does not do

- **Ceramic codes with the pF-based tolerance letters** (B, C, D) are the
  Ceramic code tool; film capacitors are not made small enough to need them.
- **Electrolytic** capacitors print their value and voltage in plain text.

### How it was checked

104J → 100 nF ±5%, 473K → 47 nF ±10%, 102H → 1 nF ±3%, 4n7 → 4.7 nF,
4N7J → 4.7 nF ±5%, n33 → 330 pF, u1 and µ1 → 100 nF, 2u2K → 2.2 µF ±10%,
100p → 100 pF.

The review found the tolerance table borrowed from the inductor tool, which
had no H, a common film tolerance; added it, first as ±2.5% from WIMA's
datasheets, then as ±3% once the standard's own table was read. It made the unit letter
case-blind (4N7 was rejected), applied the 8 and 9 multipliers and the R-code
length fix from the ceramic tool, limited the units to pF, nF and µF, and made
the drawing show the marking as typed.

The re-walk checked the value against the tolerance's own series: 562 is an
E12 value, 912J an E24 one, 562M "Not in E6 — nearest is 4.7 nF". A value read
from a marking now shows in its own unit, n33 as 330 pF.

[↑ Index](#index)

---

<a id="cap-smd-code"></a>
## SMD capacitor code

`calc: cap-smd-code` · Passive components › Capacitors

### What it computes

The capacitance printed on a surface-mount capacitor, usually a tantalum part,
with the letter printed next to it read either as the rated voltage or as the
tolerance; and the other way round, the marking for a value.

### Source

- The capacitance digits are the EIA-198 picofarad code, as on ceramic parts.
- The marking layout and voltage letters from the **Kyocera-AVX TAJ** tantalum
  datasheet: "227 A" is 220 µF at 10 V (A = 10 V) on its larger cases; on its
  small cases the letter sits above the digits, "J" over "106" for 10 µF at
  6.3 V. The rest of the voltage letters are the EIA tantalum code as the
  makers print it; the EIA document itself was not read.
- The **KEMET T491** datasheet lists what its marking holds: polarity band,
  picofarad code, rated voltage and a date code.

### What the marking means

Most small ceramic chip capacitors carry no marking at all — they are too small
to print on, and the value is only on the reel. The SMD capacitors that are
marked are mostly **tantalum** (and polymer) capacitors, which are larger and
come in moulded cases.

**The digits** are the capacitance in picofarads, as on a ceramic disc: the last
digit is how many zeros follow the first two. 106 is 10 000 000 pF = 10 µF;
227 is 220 µF; 475 is 4.7 µF.

**The letter** is, on most tantalum parts, the **rated voltage** — the most it
may see continuously:

| Letter | Rated voltage |
|---|---|
| G | 4 V |
| J | 6.3 V |
| A | 10 V |
| C | 16 V |
| D | 20 V |
| E | 25 V |
| V | 35 V |
| T | 50 V |

It may be printed after the digits (227A) or before them (J106, often on a line
of its own above); the tool reads both. Some parts instead use a **tolerance**
letter (K ±10%, M ±20%). The two tables share letters — G and J mean 4 V and
6.3 V in one, ±2% and ±5% in the other — so the marking alone cannot say which
is meant; the datasheet can, and the pill chooses.

**Polarity.** A tantalum capacitor is polarised: the band or bevel at one end
marks the **positive** terminal — the opposite of an aluminium electrolytic,
whose stripe marks the negative. Fitted backwards, a tantalum can fail short and
burn.

### Assumptions and limits

- **Derate the voltage.** Tantalum (MnO₂) capacitors are usually run at no more
  than half their rated voltage, to survive turn-on surges; the letter gives the
  rating, not the voltage to design for.
- **Makers' own marks** — date codes, logos, ID codes — share the same face and
  are not read.
- A value typed in is encoded with R below 10 pF; tantalum parts never go that
  low.
- **Standard value.** A tolerance letter picks the one series the value is
  checked against (K, ±10%, E12; M, ±20%, E6). A voltage letter says nothing
  about tolerance, so the value is checked against E6, the series tantalum and
  polymer capacitors are stocked in.

### What it deliberately does not do

- **The two-character SMD capacitor code** (a letter for the figures and a
  digit for the multiplier, IEC 60062 Annex B) is not read.
- **Ceramic discs and film parts** have their own code tools.

### How it was checked

Against the AVX datasheet's own examples: 227A reads 220 µF at 10 V, J106 and
J 106 read 10 µF at 6.3 V. Also 475V → 4.7 µF at 35 V, 106K → 10 µF ±10%,
226M → 22 µF ±20%.

The review made the tool read a voltage letter printed before the digits
(J106 was rejected), applied the 8 and 9 multipliers and R-code length fix
from the ceramic tool, limited the units to pF, nF and µF, and made the drawing
show the marking as typed.

The re-walk checked the value against the tolerance's own series (156A is an
E6 value, 825K an E12 one), showed a value read from a code in its own unit
(471 as 470 pF) and put a space in "10 V".

[↑ Index](#index)

---

<a id="cap-series-parallel"></a>
## Series/parallel (C)

`calc: cap-series-parallel` · Passive components › Capacitors

### What it computes

The total capacitance of two to four capacitors in parallel or in series, the
range it can take given their tolerance, and the nearest single standard value.
Each capacitor has a slider that steps through standard values.

### Source

The charge relation Q = C × V applied to parts sharing a voltage (parallel) or a
charge (series); standard values from IEC 60063.

### What it means

Capacitors combine the **opposite way to resistors**.

**In parallel** — side by side between the same two points. Each has the same
voltage across it and stores its own charge, so the charges add, and so do the
capacitances — it is as if the plates were one larger plate:

    C = C1 + C2 + C3 + …

A 100 nF and a 10 µF in parallel make 10.1 µF. This is how a board gets both a
large capacitance for slow supply dips and a small one for fast noise: in
parallel they add, and each does the part of the job it is good at.

**In series** — end to end. The same charge has to appear on every capacitor
in turn, and their voltages add up to the total, so it is the reciprocals that
add:

    1/C = 1/C1 + 1/C2 + 1/C3 + …
    C = C1 × C2 / (C1 + C2)       for two

The total is always less than the smallest one. Two equal capacitors give half
of one; 1 µF in series with 10 µF gives 909 nF, a little less than the 1 µF.

### Voltage in series

The reason to put capacitors in series is usually voltage: two 2.7 V
supercapacitors in series make a part that can be charged to 5.4 V. But the
voltage does not split evenly on its own. With the same charge on each,

    V1 / V2 = C2 / C1

so the **smaller** capacitor takes the **larger** share of the voltage. Real
capacitors differ by their tolerance and by their leakage, so one of them can
be pushed past its rating. Series capacitors that are meant to share a voltage —
supercapacitors, electrolytics in a high-voltage supply — get a resistor
across each one, or an active balancing circuit, to hold the split even.

### Tolerance of the total

As for resistors, if every part is off by the same fraction in the same
direction the total is off by exactly that fraction, so the worst-case range is
the total × (1 ± t). Many capacitors have wide tolerances — ±10% or ±20% for
ceramics and electrolytics, and some ceramics +80/−20% — so the range is often
the more important number.

### Assumptions and limits

- **Up to four capacitors**, all in series or all in parallel.
- **Nominal values.** Class 2 ceramics lose capacitance with applied DC voltage
  and with temperature; electrolytics lose it as they age. The total is only as
  good as the values typed in.
- Leakage, ESR and inductance are ignored.

### What it deliberately does not do

- **Balancing resistor values** for series capacitors are not calculated.
- **Resistors** have their own series/parallel tool.

### How it was checked

By hand: 100 nF + 100 nF in parallel is 200 nF, in series 50 nF; 1 µF and
10 µF in series give 909.1 nF; two 2.7 F supercapacitors in series give 1.35 F.
The ranges are the total × (1 ± t).

[↑ Index](#index)

---

<a id="rc-charge"></a>
## RC charge and discharge

`calc: rc-charge` · Passive components › Capacitors

### What it computes

For a capacitor charging from a supply through a resistor, or discharging
through one: the time constant τ, the voltage after a given time, or the time it
takes to reach a given voltage. A table gives the percentage reached after
one to five time constants.

### Source

The solution of the circuit's differential equation, from Ohm's law and the
capacitor law I = C × dV/dt. No standard is involved.

### What it means

A capacitor stores charge, and its voltage rises as the charge builds up. When
it charges through a resistor, the current is largest at the start, when the
capacitor is empty and the whole supply voltage is across the resistor. As the
capacitor fills, less voltage is left across the resistor, the current falls,
and the charging slows. So the voltage does not climb in a straight line but
bends over, approaching the supply ever more slowly.

The pace is set by one number, the **time constant**:

    τ = R × C

10 kΩ and 100 µF make τ = 1 second. In each time constant the capacitor covers
63% of the distance that is still left:

| After | Charging, % of Vs | Discharging, % of V0 left |
|---|---|---|
| 1 τ | 63.2% | 36.8% |
| 2 τ | 86.5% | 13.5% |
| 3 τ | 95.0% | 5.0% |
| 4 τ | 98.2% | 1.8% |
| 5 τ | 99.3% | 0.7% |

It never quite arrives: mathematically the curve only approaches Vs. In
practice **5τ** counts as fully charged or discharged.

**Discharging** is the same curve upside down: a charged capacitor connected
across a resistor, with no supply, loses 63% of what is left in each τ.

### The formulas

    Charging:     V(t) = Vs × (1 − e^(−t/τ))       t = −τ × ln(1 − V/Vs)
    Discharging:  V(t) = V0 × e^(−t/τ)             t = −τ × ln(V/V0)

The second form of each answers the practical question — how long until the
capacitor reaches a threshold. For example, how long a power-on reset holds, or
when a slowly rising input crosses a logic level: charging to 2/3 of Vs takes
τ × ln 3 = 1.1 τ, which is where the 555 timer's 1.1 R C comes from.

### Assumptions and limits

- **An ideal source and capacitor.** The supply is taken as having no internal
  resistance, and the capacitor as having no leakage. A leaky capacitor, such as
  an electrolytic, levels off below Vs.
- **Nominal R and C.** With a ±20% capacitor the times are ±20% too.
- The target voltage must lie between 0 and Vs: a charging capacitor never
  reaches Vs, so asking for exactly Vs has no finite answer.

### What it deliberately does not do

- **Switch debouncing and RC timing for logic inputs** have the Debounce / RC
  timing tool, which adds input thresholds.
- **Energy** stored in the capacitor is the Stored energy tool.

### How it was checked

By hand: 10 kΩ and 100 µF give τ = 1 s; at 1 s a 5 V charge reaches 3.161 V
(63.21%); 4.5 V is reached at 2.303 s (ln 10 × τ); discharging from 5 V, 1.839 V
is left at 1 s, and 0.5 V is reached at 2.303 s.

The review fixed the layout, which put the voltage result 24 px under the tab
bar on the target phone; R and C now share a line, the voltage and time fields
share the next, and the results sit in one row. The schematic no longer shows a
supply when discharging, and the resistance units are Ω, kΩ and MΩ.

[↑ Index](#index)

---

<a id="cap-stored-energy"></a>
## Capacitor energy

`calc: cap-stored-energy` · Passive components › Capacitors

### What it computes

The energy stored in a charged capacitor from its capacitance and voltage, or
either of those from the other two; and the charge it holds.

### Source

The energy of a capacitor charged from zero: the work done moving charge onto
it against its own rising voltage. A standard result; no standard document is
involved.

### What it means

A capacitor stores energy in the electric field between its plates. Charging it
takes work, because each bit of charge has to be pushed on against the voltage
already there; that work is held, and comes back out when the capacitor
discharges.

    E = ½ × C × V²      in joules, with C in farads and V in volts
    Q = C × V            the charge, in coulombs

**The square matters.** Twice the voltage stores four times the energy. A
1000 µF capacitor at 12 V holds 72 mJ — a small spark; the same capacitor at
400 V would hold 80 J. This is why the capacitors in mains power supplies,
camera flashes and microwave ovens are dangerous long after the power is
removed, and why they are discharged through a resistor before being touched.

**How much is a joule.** One joule is one watt for one second. A 1 F
supercapacitor at 2.7 V holds 3.6 J: enough to keep a 10 mW real-time clock
circuit running for six minutes.

Rearranged:

    V = √(2E / C)       the voltage needed to store E in C
    C = 2E / V²         the capacitance needed to store E at V

### Usable energy

A circuit seldom uses all of it. A device powered from a capacitor stops
working when the voltage falls below its minimum, so the energy it can draw is
the difference between two voltages:

    E usable = ½ × C × (V start² − V min²)

A supercapacitor charged to 5 V feeding a circuit that needs at least 3 V
delivers only 1 − (3/5)² = 64% of what it holds. Use the tool twice, at the two
voltages, and subtract.

### Assumptions and limits

- **An ideal capacitor.** Leakage slowly drains the stored energy; ESR turns
  some of it to heat when it is drawn fast.
- **Nominal capacitance.** Class 2 ceramics hold less than their marked value
  at high voltage, and electrolytics lose capacitance with age.

### What it deliberately does not do

- **Discharge time** through a load is the RC charge and discharge tool's job.
- **Hold-up time** from the usable energy is not calculated directly; it is the
  usable energy divided by the power drawn.

### How it was checked

By hand: 1000 µF at 12 V holds 72 mJ and 12 mC; 1 F at 2.7 V holds 3.645 J;
storing 1 J in 100 µF needs 141.4 V; storing 10 J at 400 V needs 125 µF.

[↑ Index](#index)

---

<a id="inductor-color-code"></a>
## Inductor color code

`calc: inductor-color-code` · Passive components › Inductors

### What it computes

The inductance and tolerance that the colour bands on an axial (leaded)
inductor stand for, and the other way round: the bands for a value. A second
pill handles the 5-band form with the wide silver identifier band.

### Source

- **Inductors Inc., colour band guide**: the colours carry the same digits and
  multipliers as the resistor code, read in microhenries; gold among the digit
  bands is the decimal point; the tolerance colours are gold ±5%, silver ±10%
  and black ±20%; the wide silver band is a "military identifier" that does not
  imply military qualification.
- **Vishay IM series** (MIL-PRF-15305 molded inductors): inductance tolerances
  of ±1, ±3, ±5, ±10 and ±20%, of which only the last three have a colour.
- IEC 60062, the standard for resistor and capacitor codes, does not cover
  inductors; the inductor code borrows its colours.

### What the bands mean

Small axial inductors look like fat resistors, and use the same colours — but
the value is in **microhenries (µH)**, not ohms.

- **Band 1 and 2** — the two digits (black 0, brown 1, red 2 … white 9).
- **Band 3** — the multiplier, how many zeros follow: black ×1, brown ×10,
  red ×100; gold ×0.1 and silver ×0.01 for small values.
- **Band 4** — the tolerance: gold ±5%, silver ±10%, black or no band ±20%.

So brown–black–black–gold is 10 × 1 = 10 µH ±5%, and red–red–brown–silver is
22 × 10 = 220 µH ±10%.

**Gold as the decimal point.** A gold band in first or second place is not a
digit but the decimal point, and the band after it is then a digit too:
yellow–gold–violet is 4.7 µH, gold–yellow–violet is 0.47 µH. The same 4.7 µH
can also be written yellow–violet–gold, with gold as a ×0.1 multiplier; both
forms are read.

**The 5-band form.** Some parts start with a wide silver band. It is an
identifier in the military style and carries no digit; the four bands after it
read as above. It does not by itself mean the part is military-qualified.

### Assumptions and limits

- **Tolerance colours are only three.** Precision inductors (±1%, ±2%, ±3%) are
  not marked with a tolerance colour; their tolerance is on the datasheet or
  in the part number.
- **Makers vary.** Colour-coded inductors are old enough, and made by enough
  small makers, that some use their own scheme. When the result looks
  implausible for the part's size, measure it.
- Inductance alone does not say what current the part can carry; that is on
  its datasheet.
- **Standard value.** The tolerance band picks the one series the value is
  checked against: gold (±5%) E24, silver (±10%) E12, black or none (±20%) E6.
- **Units.** The value is shown in nH, µH or mH, whichever reads best: 1000 µH
  is shown as 1 mH. No colour-coded inductor reaches a henry, so H is not
  offered.

### What it deliberately does not do

- **SMD inductor markings** are the SMD code tool.
- **Resistor bands** are the resistor Color code tool, which uses the full
  IEC 60062 tolerance colours.

### How it was checked

Brown–black–black–gold reads 10 µH ±5%; red–red–brown–silver reads 220 µH
±10%; yellow–gold–violet 4.7 µH; gold–yellow–violet 0.47 µH; typing 4.7 µH gives
yellow–violet–gold.

The review found the tolerance list offering the resistor's precision colours,
brown ±1% down to grey ±0.01%, which no colour-coded inductor uses; it is now
gold, silver, black and none. It added gold as a decimal point in the digit
bands, which the tool could not read, and corrected the note's claim that the
silver band marks a part as military-qualified.

The re-walk checked the value against the tolerance's own series (4.7 µH with
silver is an E12 value), showed a value from the bands in its natural unit
(brown–black–red reads 1 mH, not 1000 µH) and dropped H from the units.

[↑ Index](#index)

---

<a id="inductor-smd-code"></a>
## Inductor SMD code

`calc: inductor-smd-code` · Passive components › Inductors

### What it computes

The inductance that the three-character stamp on a surface-mount power
inductor stands for — and the other way round, the stamp for a value. With the
tolerance taken from the part number, it also says whether the value is a
standard one.

### Source

There is no standard for it. IEC 60062, the marking standard, covers
resistors and capacitors only; inductor makers borrow its principle and apply
it in microhenries. What the tool follows is what their datasheets show:

- **Sumida CDRH74** lists a "Stamp" for every part: 100 for 10 µH, 101 for
  100 µH, 102 for 1.0 mH. The tolerance (M, ±20%) is in the part name,
  CDRH74NP-100MC, not in the stamp.
- **Bourns SRR1260** shows "100" on the body in its drawing; its tolerances,
  in the part number, are Y ±30%, M ±20% and K ±10%. It is "available in E12
  values".
- **Bourns SRN4018**, the part drawn, shows "4R7" on its core and is
  4.0 × 4.0 mm, the core at most 3.6 mm across, 4.55 mm across the terminals.

### What it means

An inductor stores energy in a magnetic field; its inductance, in henries (H),
says how strongly it opposes a change of current. Power inductors in DC/DC
converters are a few hundred nanohenries to a few millihenries, so the stamp
counts in **microhenries** (µH): 1 µH is a millionth of a henry, 1000 nH, and
1 mH is 1000 µH.

- **Three digits** — the first two are the figures, the last is how many zeros
  follow. 100 is 10 and no zeros: 10 µH. 101 is 100 µH, 102 is 1000 µH, 1 mH.
  470 is 47 µH, not 470.
- **R** — below 10 µH, R stands where the decimal point is: 4R7 is 4.7 µH, 1R0
  1 µH, R47 0.47 µH (470 nH).
- **The tolerance is not stamped.** It is a letter in the part number, and
  makers do not agree on the letters — Bourns uses Y for ±30%, a letter the
  resistor and capacitor standard does not have — so the tool asks for the
  percentage.

### How the value is worked out

    Value = D1D2 × 10^D3, in µH        (100 → 10 × 10⁰ = 10 µH)
    xRy   = x.y µH                      (4R7 → 4.7 µH)

A stamp holds two figures, so a typed value with more is rounded to what the
part could carry, and the tool says so. The shortest stamp is R10, 0.1 µH.

### Assumptions and limits

- **Not every maker uses this stamp.** Many small chip inductors carry no
  marking at all, and some makers print a code of their own or a colour dot.
  When the reading makes no sense for the part, trust its datasheet.
- **Standard value.** The tolerance picks the one series the value is checked
  against, as elsewhere in the app: ±5% E24, ±10% E12, ±20% and ±30% E6. With
  the tolerance not known it is E12, the series Bourns quotes. Power inductors
  are often sold in E12 values at ±20%, so an E12 value at ±20% can read "Not
  in E6" and still be a stock part.
- Inductance alone does not say what current the part can carry before its
  core saturates; that is in the datasheet, as the saturation current.

### What it deliberately does not do

- **Colour-banded inductors** are the Inductor color code tool.
- **A 4-digit code** is not offered: no inductor datasheet read shows one.

### How it was checked

Against the stamps in the Sumida CDRH74 datasheet (100 → 10 µH, 101 → 100 µH,
102 → 1 mH) and the Bourns SRR1260 and SRN4018 drawings (100, 4R7). R47 reads
470 nH, 4.7 µH is stamped 4R7, and a typed "10M" is refused with a note that
the tolerance letter belongs to the part number.

The review corrected three things. The tool offered a 4-digit mode, which no
standard or datasheet shows. It read a tolerance letter as part of the stamp,
where datasheets put it only in the part number, and it had no ±30%. And its
note said that "100" means 10 nH on some parts, a claim no source supported;
it was removed.

[↑ Index](#index)

---

<a id="rc-filter"></a>
## RC filter

`calc: rc-filter` · Passive components › Passive filters

### What it computes

The cutoff frequency of a filter made of one resistor and one capacitor — or
the resistor or capacitor for a cutoff you want — as a low-pass or a
high-pass, with up to six identical stages. It draws the frequency response,
and gives the attenuation and phase shift at any frequency you pick.

### Source

No standard is needed: the results follow from Ohm's law and the impedance of
a capacitor. The derivation is below.

### What it means

A **filter** passes some frequencies and weakens others. A **low-pass**
(resistor in series, capacitor to ground) lets slow signals through and
weakens fast ones: it smooths PWM into a steady voltage, or removes noise
above the band you care about. A **high-pass** (capacitor in series,
resistor to ground) does the reverse: it blocks DC and passes the signal
riding on it, as a coupling capacitor does in audio.

- **Cutoff frequency, fc** — where the output has fallen to 70.7% of the input
  (1/√2). Below it a low-pass passes nearly everything; above it, less and
  less.
- **Decibels (dB)** — a way of comparing two levels on a scale that suits
  signals: 20 × log₁₀(output ÷ input). −3 dB is 70.7%, −20 dB a tenth, −40 dB
  a hundredth.
- **Pole** — one RC stage. Past fc a single pole weakens the signal by a
  further 20 dB for every tenfold increase in frequency (20 dB per decade);
  two poles 40 dB, and so on.
- **Phase shift** — how far the output's waveform is behind (lag) or ahead of
  (lead) the input's, in degrees of a cycle. At fc it is 45°.

### Why the formulas are these

A capacitor's impedance falls with frequency: Z = 1 / (2πfC). The low-pass is
a voltage divider of R on top and C below, so its output is the part of the
input across C:

    Vout / Vin = 1 / (1 + j·f/fc),     fc = 1 / (2πRC)

At f = fc the real and imaginary parts are equal, so the magnitude is 1/√2
(−3.01 dB) and the phase −45°. Well above fc the magnitude is fc/f: ten times
the frequency, a tenth of the output, −20 dB. The high-pass swaps R and C, and
its response is the same with f/fc turned upside down.

Solving fc = 1 / (2πRC) for R or C gives the other two forms the tool uses.

With N identical stages each **buffered** (an op-amp between them, so none
loads the next), the responses multiply: the dB figures and the phase are N
times one stage's. At each stage's fc the total is already −3N dB, so the
system's own −3 dB point moves in:

    f(−3 dB) = fc × √(2^(1/N) − 1)          (low-pass; high-pass divides instead)

For two stages that is 0.644 × fc.

### Assumptions and limits

- **Nothing loads the output.** A load in parallel with the output changes the
  divider: keep it well above R (ten times R or more costs under 10%), or
  buffer it.
- **The source drives it with little resistance of its own.** A source
  resistance adds to R and lowers fc.
- **Several poles here means buffered stages.** Unbuffered RC stages in a
  chain load each other and give a softer knee than this.
- Parts have tolerances: a ±5% R and a ±10% C move fc by up to about 15%.

### What it deliberately does not do

- **RL filters** have their own tool; **op-amp active filters** with gain and
  sharper shapes (Butterworth, Sallen-Key) are not covered.
- **The time response** — how the output settles after a step — is the RC
  charge/discharge tool.

### How it was checked

10 kΩ with 100 nF gives 159.2 Hz; at fc the attenuation is −3.01 dB and the
phase −45°. Two buffered poles put the system's −3 dB point at 102.4 Hz,
0.644 × fc. 10 kΩ with 1 µF gives 15.92 Hz, and −35.97 dB at 1 kHz. A
high-pass of the same parts is 2.13 dB down at 20 Hz. fc = 20 kHz with 1 kΩ
needs 7.958 nF.

The review found the frequency to explore opening at 159.2 Hz, a rounded fc,
which showed −45.01°; it now starts at fc exactly. The units offered were cut
to those RC filters use: Ω to MΩ, pF to µF, Hz to MHz.

[↑ Index](#index)

---

<a id="rl-filter"></a>
## RL filter

`calc: rl-filter` · Passive components › Passive filters

### What it computes

The cutoff frequency of a filter made of one resistor and one inductor — or
the resistor or inductor for a cutoff you want — as a low-pass or a
high-pass, with up to six identical stages; the frequency response, and the
attenuation and phase shift at any frequency you pick.

### Source

No standard is needed: the results follow from Ohm's law and the impedance of
an inductor. The derivation is below.

### What it means

It is the RC filter's counterpart with an inductor in place of the capacitor
(see that section for what a filter, fc, a decibel, a pole and a phase shift
are). An inductor's impedance **rises** with frequency, where a capacitor's
falls, so the two parts swap places:

- **Low-pass** — inductor in series, resistor to ground. The inductor blocks
  the fast signals. Often the "resistor" is the load itself: a loudspeaker in
  a crossover, a circuit fed through a choke.
- **High-pass** — resistor in series, inductor to ground. The inductor shorts
  the slow signals to ground and lets the fast ones through, as in RF
  circuits where the series resistance is the 50 Ω of the system.

### Why the formulas are these

An inductor's impedance is Z = 2πfL. The low-pass is a divider of L on top and
R below, so its output is the part across R:

    Vout / Vin = R / (R + j·2πfL) = 1 / (1 + j·f/fc),     fc = R / (2πL)

This is the same shape as the RC low-pass, so everything that follows from it
is the same: −3.01 dB and −45° at fc, 20 dB per decade beyond, and for N
buffered stages a system −3 dB point at fc × √(2^(1/N) − 1). The high-pass
swaps R and L and turns f/fc upside down. Solving fc = R / (2πL) for R or L
gives the other two forms.

### Assumptions and limits

- **A real inductor has resistance.** Its winding's DC resistance (DCR, in the
  datasheet) adds to R in a low-pass and flattens the high-pass at low
  frequencies. For small R — an 8 Ω speaker — it matters.
- **Cores saturate.** Past its rated current an inductor with a ferrite or
  iron core loses much of its inductance, and fc moves up.
- **Every inductor resonates** with its own winding capacitance at its
  self-resonant frequency (SRF, in the datasheet); well below it the model
  holds, near it the part stops behaving as an inductor.
- **Nothing loads the output**, and several poles mean buffered stages, as
  for the RC filter.

### What it deliberately does not do

- **RC filters** have their own tool; **LC filters** (both an inductor and a
  capacitor, 40 dB per decade from one pair) are not covered.
- **Loudspeaker crossover design** beyond one coil — the speaker's impedance
  is not a pure 8 Ω across the band — is not covered.

### How it was checked

100 Ω with 100 mH gives 159.2 Hz; at fc −3.01 dB and −45°. An 8 Ω woofer
crossed over at 2.5 kHz needs 509.3 µH. A 10 µH choke into 10 Ω is a 159.2 kHz
low-pass, −16.07 dB at 1 MHz. 100 nH to ground in a 50 Ω system is a high-pass
at 79.58 MHz.

The review made the same corrections as on the RC filter: the frequency to
explore opens at fc exactly, Low-/High-pass take the mode pills, and the
resistor units are ohms to megohms. Inductors keep nH to H and frequencies up
to GHz, which RF inductors and supply chokes really reach.

[↑ Index](#index)

---

<a id="smd-package-sizes"></a>
## SMD package sizes

`calc: smd-package-sizes` · Passive components › Reference

### What it computes

A reference table of the common surface-mount chip sizes: each one's imperial
and metric name, its length and width in inches and millimetres, and what it
is typically used for. It can be searched by either name or by a dimension.

### Source

The body sizes are those manufacturers' datasheets give:

- **Panasonic ERJ** thick-film chip resistors — 01005 to 2512, e.g. 01005
  0.40 × 0.20 mm, 0805 2.00 × 1.25 mm, 1210 3.20 × 2.50 mm, 2512
  6.40 × 3.20 mm.
- **Vishay D/CRCW e3** (April 2026) — the same sizes, and 1218,
  3.2 × 4.6 mm; 2512 is 6.3 × 3.15 mm there.
- **KEMET C1002 X7R** (September 2026) ceramic capacitors — every size in
  millimetres and in inches (1210: 3.20 mm (0.126″) × 2.50 mm (0.098″)), and
  1808, 4.70 × 2.00 mm.
- **Murata LQM2HP** inductors — 1008 (metric 2520), 2.5 × 2.0 mm.

Where makers differ by a few hundredths of a millimetre, the metric name's
nominal size is given.

### What it means

A surface-mount chip — resistor, capacitor, inductor — is a small block with
metal ends, soldered flat onto pads on the board. Its **size code** names its
length and width:

- **Imperial** (the usual one in the US and in most catalogues): four digits,
  two for the length and two for the width, in hundredths of an inch. 0805 is
  about 0.08″ × 0.05″.
- **Metric**: the same idea in tenths of a millimetre. The 0805 body is metric
  2012, about 2.0 × 1.2 mm.

The two collide: **imperial 0402** is 1.0 × 0.5 mm, but **metric 0402** is
0.4 × 0.2 mm, the part imperial calls 01005 — a body six times smaller in
area. A bare "0402" in a drawing or a bill of materials is ambiguous until you
know which system it is in, which is why every row shows both.

**The names are rounded; the table gives the real size.** 0805's metric name
says 1.2 mm wide, but the parts are 1.25 mm. 1210's name says 0.12″ × 0.10″;
the parts are 3.2 × 2.5 mm, 0.126″ × 0.098″. The inches here are the
millimetres converted, as KEMET prints them.

### Assumptions and limits

- **Sizes are nominal.** Each has a tolerance of ±0.05 mm on the smallest to
  about ±0.2 mm on the larger ones; the height depends on the part and its
  value, and is not listed.
- **Some parts use a size but not its exact body**: power inductors and
  electrolytic capacitors have their own case codes, not these.
- The notes on hand-soldering are practical guidance, not a specification.

### What it deliberately does not do

- **Pad (footprint) dimensions** depend on the soldering process and the
  maker; take them from the part's datasheet or IPC-7351.
- **Power ratings** by size are in the Resistor power rating tool.

### How it was checked

Every size against the datasheets above. The review found three faults. 1210
was listed as 0.12″ × 0.125″, where the parts are 0.126″ × 0.098″; the code
claimed 1210, 1812 and 2512 were 0.125″ wide by exception, which the
datasheets do not support for 1210. 0805 was listed as 1.2 mm wide, the
metric name, where the parts are 1.25 mm. And 1806 (4516), found only in
online size charts and in no maker's datasheet read, was replaced by 1808,
from KEMET's; 1218, a common power-resistor size, was added from Vishay's. The
inches in the Resistor power rating table were aligned to the same
figures.

[↑ Index](#index)

---

# Active & semiconductor devices

<a id="diode-biasing"></a>
## Diode forward voltage

`calc: diode-biasing` · Active & semiconductor devices › Diodes

### What it computes

Nothing is calculated: it is a reference. It shows which way round a diode
conducts, and lists the forward voltage that common real diodes drop, each at
the current its datasheet quotes it for.

### Source

- **Vishay 1N4148** (Rev. 1.6, 2024): VF ≤ 1 V at 10 mA; its curves show VF
  at 25, 75 and 150 °C.
- **Vishay 1N4001–1N4007**: VF ≤ 1.1 V at 1.0 A.
- **Vishay 1N5817–1N5819**: VF ≤ 0.450 / 0.550 / 0.600 V at 1.0 A, and
  0.750 / 0.875 / 0.900 V at 3.1 A.
- **Diodes Inc. BAT54**: VF ≤ 240 mV at 0.1 mA, 320 mV at 1 mA, 400 mV at
  10 mA, 500 mV at 30 mA, 800 mV at 100 mA.
- **Taitron 1N34A** (germanium): VF ≤ 1.0 V at 5 mA.

These are guaranteed maximums; a typical part drops somewhat less.

### What it means

A **diode** lets current through one way only, like a valve. Its two leads
are the **anode (A)** and the **cathode (K)**, marked by the band on the body;
in the symbol the triangle points from A to K, the way current flows.

- **Forward bias** — the anode more positive than the cathode. Once the
  voltage across the diode reaches about its **forward voltage, Vf**, it
  conducts. From then on its voltage hardly changes: a little more voltage
  means a lot more current. So a diode must never be put straight across a
  supply; a resistor in series sets the current, taking the rest of the
  supply's voltage.
- **Reverse bias** — the cathode more positive. The diode blocks, apart from a
  tiny leakage current, up to its reverse rating (VRRM). Past it the diode
  breaks down and conducts, which destroys an ordinary diode. A Zener diode
  is made to work in that region, as a voltage reference.

**Vf is not one number.** It rises with the current — the BAT54 goes from
0.24 V at 0.1 mA to 0.8 V at 100 mA — and falls as the diode warms, by about
2 mV per °C for silicon. The familiar "0.6–0.7 V" is a rule of thumb for a
silicon diode at a few milliamps; a 1N4007 carrying its rated 1 A may drop
1.1 V. That is why each figure here comes with its current.

**Which kind to choose.** A Schottky drops less (useful where every tenth of
a volt counts, as in a supply's reverse-polarity protection) but leaks more
when blocking. A silicon rectifier such as the 1N4007 blocks up to 1000 V. A
small-signal diode such as the 1N4148 switches fast, at small currents.

### Assumptions and limits

- The figures are the datasheets' maximums at 25 °C, at the stated current.
  Between the listed currents, read the datasheet's VF–IF curve.
- Other makers' versions of the same part numbers have slightly different
  limits.

### What it deliberately does not do

- **Working out the series resistor** is the LED series resistor tool, which
  handles any diode's Vf.
- **Zener regulation** will have its own tool.

### How it was checked

Every figure against the datasheet named. The review found the table giving
bare ranges with no current ("silicon ≈0.6–0.7 V"), which a 1N4007 exceeds
at its rated current, and "germanium ≈0.2–0.3 V", which its datasheet does
not state; it now gives each part's figure with its current. It also found
the drawing putting a diode straight across a battery with no resistor —
the circuit that burns a diode out — and the note saying Vf stays "pinned
regardless of current"; both were corrected.

[↑ Index](#index)

---

<a id="led-series-resistor"></a>
## LED series resistor

`calc: led-series-resistor` · Active & semiconductor devices › Diodes

### What it computes

The resistor that sets an LED's current from a given supply — for one LED or
several in series — the power it dissipates, the next standard value up and
the current that value gives, and how much the current moves if the LED's
forward voltage is 0.1 V off.

### Source

- The formula is Ohm's law, applied to the voltage the LEDs leave.
- The colour presets are typical forward voltages from **Kingbright's WP7113**
  5 mm LED datasheets (typical / maximum): red 1.9 / 2.3 V and yellow
  1.95 / 2.4 V at 10 mA, standard (GaP) green 2.0 / 2.4 V at 10 mA; bright
  (InGaN) green 3.3 / 4.1 V, blue 3.3 / 4.0 V and white 3.3 / 4.0 V at 20 mA.
- Infrared from **Vishay's TSAL6200**: 1.35 V typical, 1.6 V maximum, at
  100 mA; its forward voltage falls 1.8 mV per kelvin.

### What it means

An LED is a diode that gives light (see Diode forward voltage). Like any
diode, once past its **forward voltage, Vf**, its current rises steeply with
the voltage, so it cannot be fed from a voltage directly: it would take as
much current as the supply can give and burn out. A **series resistor** takes
up the rest of the supply's voltage and so sets the current:

    R = (Vs − n·Vf) / I

with **n** LEDs in series, each dropping Vf, and **I** the current you want —
typically 10–20 mA for an indicator, and the datasheet's maximum is the
limit. The resistor turns P = (Vs − n·Vf) × I into heat; choose its power
rating from that (see Resistor power rating).

**The colour sets Vf.** Red and yellow LEDs are about 1.9–2 V; blue, white
and the bright green ones about 3.3 V. The old, dimmer green is about 2 V —
the tool offers both greens because they differ by more than a volt.

**Headroom.** The voltage the resistor is left with, Vs − n·Vf, is what
fixes the current. Vf varies from one LED to the next (the datasheets give a
typical and a maximum a few tenths of a volt apart) and with temperature. With
volts to spare, that hardly matters; with a few tenths left, it moves the
current a lot. The tool shows how much a 0.1 V change would move it, and
flags it in red above 20%. A white LED on 3.3 V has no headroom at all.

**Rounding up.** The standard value offered is the next one up in the chosen
series, never the nearest one down, so the LED gets at most the current asked
for.

### Assumptions and limits

- Vf is taken as fixed at the current asked. It really rises slightly with
  current, so the true current differs a little from the figure.
- **Several LEDs in parallel on one resistor** do not share the current
  evenly: the one with the lowest Vf takes most of it and runs hottest. Give
  each its own resistor.
- High-power LEDs (hundreds of milliamps) are usually driven by a
  constant-current regulator rather than a resistor, which would waste too
  much power.

### What it deliberately does not do

- **Brightness** (luminous intensity) is in the LED's datasheet, not
  calculated.
- **Constant-current drivers** are not covered.

### How it was checked

A red LED (1.9 V) on 5 V at 10 mA needs 310 Ω; the next E24 value up, 330 Ω,
gives 9.39 mA. 2.0 V at 20 mA from 5 V is exactly 150 Ω, an E24 value. 345 Ω
goes up to 360 Ω, not down to 330. Three red LEDs on 12 V at 20 mA need
315 Ω, 330 Ω in E24.

The review found the drawing's LED not joined to the wires either side, the
standard value rounded to the nearest (so the current could exceed the one
asked), and a green preset of 2.2 V that fits only the old GaP LEDs — a
bright green LED is 3.3 V. The presets now follow the datasheets, the value
rounds up, and the drawing is laid out like the diode screen's.

[↑ Index](#index)

---

<a id="rectifier-halfwave"></a>
## Half-wave rectifier

`calc: rectifier-halfwave` · Active & semiconductor devices › Rectifiers

### What it computes

For one diode feeding a resistive load from an AC source: the average (DC)
output voltage and current, the DC power, the RMS output, the peak reverse
voltage the diode must withstand, the ripple factor and the efficiency. It
draws the input and output waveforms.

### Source

No standard is needed: the results are averages of the output waveform over
one cycle, derived below. With a zero diode drop they reduce to the textbook
figures for a half-wave rectifier — Vdc = Vp/π, ripple factor 1.21,
efficiency 4/π² = 40.5%.

### What it means

A **rectifier** turns alternating current into current that flows one way
only. The **half-wave** rectifier is the simplest: a single diode in series
with the load. During the half of each cycle that makes the diode's anode
positive, it conducts and the load sees the input, less the diode's forward
voltage **Vf**; during the other half it blocks and the load sees nothing.
The output is one hump per cycle.

- **Vac** is the source's RMS voltage, the figure on a transformer's label;
  its **peak**, Vp = Vac × √2, is 1.41 times higher.
- **Vdc** is the average of the output, what a DC voltmeter reads.
- **PIV**, the peak inverse voltage, is the reverse voltage the diode must
  block while it is off: the whole input peak, since no current flows and the
  load drops nothing. The diode's rated reverse voltage (VRRM) must exceed it.
- **Ripple factor** — how much AC is left riding on the DC, as the ratio of
  the AC part's RMS to the DC value. 1.21 means the output is mostly ripple.
- **Efficiency** — the share of the power in the load that is DC, at most
  40.5% here.

A bare half-wave rectifier is used where smoothness does not matter, or with
a capacitor across the load to fill the gaps (the Rectifier ripple tool).

### Why the formulas are these

With a constant drop Vf, the output is Vout = max(0, Vp·sin θ − Vf): the
diode conducts from θ1 = asin(Vf / Vp) to π − θ1, a little less than half a
cycle. Averaging over the cycle:

    Vdc   = [Vp·cos θ1 − Vf·(π/2 − θ1)] / π
    Vrms² = [Vp²·((π − 2θ1)/2 + sin 2θ1 / 2) − 4·Vp·Vf·cos θ1 + Vf²·(π − 2θ1)] / 2π

With Vf = 0 these are Vp/π and Vp/2. The common shortcut Vdc ≈ (Vp − Vf)/π
treats the output as a whole half-sine of peak Vp − Vf, and reads 2.4% high
at 12 V AC with a 0.7 V diode.

Then Idc = Vdc / R, Pdc = Vdc × Idc, ripple factor = √((Vrms/Vdc)² − 1) and
efficiency = (Vdc/Vrms)², the DC power over the total power in the load.

### Assumptions and limits

- The diode is an ideal switch with a constant drop; a real one's drop rises
  with current (see Diode forward voltage).
- The source has no resistance of its own: a transformer's winding
  resistance lowers the output under load.
- The load is a resistor. With a capacitor across it the output, the PIV
  (up to twice the peak) and the diode's current all change; that is the
  Rectifier ripple tool.

### What it deliberately does not do

- **Full-wave rectifiers** (bridge, centre-tapped) have their own tools.
- **Smoothing and ripple voltage** with a capacitor is the Rectifier ripple
  tool.

### How it was checked

12 V AC with a 0.7 V diode into 100 Ω: Vp 16.97 V, Vdc 5.056 V, Idc
50.56 mA, ripple factor 1.237, efficiency 39.5%; with Vf = 0, 5.402 V
(Vp/π), 1.211 and 40.5%. Both closed forms were checked against a numerical
average over the cycle. 3 V AC gives 1.156 V with a 0.4 V Schottky and
1.019 V with 0.7 V silicon; 24 V AC has a 33.94 V PIV.

The review replaced the (Vp − Vf)/π shortcut with the exact averages, which
the drawn waveform already followed; put Vdc first and large; limited the
units to volts and ohms to megohms; and added plain definitions.

[↑ Index](#index)

---

<a id="rectifier-bridge"></a>
## Bridge rectifier

`calc: rectifier-bridge` · Active & semiconductor devices › Rectifiers

### What it computes

For a bridge of four diodes feeding a resistive load from an AC source: the
average (DC) output voltage and current, the DC power, the RMS output, the
peak reverse voltage each diode must withstand, the ripple factor and the
efficiency, with the input and output waveforms.

### Source

No standard is needed: the results are averages of the output waveform,
derived below. With zero diode drop they reduce to the textbook figures for a
full-wave rectifier — Vdc = 2Vp/π, ripple factor 0.483, efficiency
8/π² = 81.1%.

### What it means

A **bridge rectifier** is four diodes in a diamond. The AC source (usually a
transformer's secondary) connects to two opposite corners, the load to the
other two. On one half-cycle two of the diodes conduct, on the other half the
other two, and in both cases the current passes through the load **the same
way**. So where a half-wave rectifier (see that section) gives one pulse per
cycle, the bridge gives two, and uses the whole of the input.

The price is two diodes in the current's path at every moment: each pulse is
**2 × Vf** lower than the input's peak. From a low voltage that loss is a
large part of the output; Schottky diodes, with a smaller Vf, reduce it.

The other figures — **Vdc**, **PIV**, **ripple factor**, **efficiency** —
mean the same as for the half-wave rectifier. Each diode, while off, blocks
the input's peak Vp, as in the half-wave case; a bridge does not double it.

### Why the formulas are these

The output is Vout = max(0, Vp·|sin θ| − 2Vf). Each half-cycle conducts from
θ1 = asin(2Vf / Vp) to π − θ1, so the averages are twice the half-wave ones
with 2Vf as the drop:

    Vdc   = 2·[Vp·cos θ1 − 2Vf·(π/2 − θ1)] / π
    Vrms² = 2·[Vp²·((π − 2θ1)/2 + sin 2θ1 / 2) − 8·Vp·Vf·cos θ1 + 4Vf²·(π − 2θ1)] / 2π

With Vf = 0 these are 2Vp/π and Vp/√2. The shortcut 2(Vp − 2Vf)/π treats
each pulse as a whole half-sine and reads 5% high at 12 V AC with 0.7 V
diodes. Ripple factor and efficiency follow as for the half-wave rectifier.

### Assumptions and limits

- Each diode is an ideal switch with a constant drop.
- The source has no resistance; a transformer's winding resistance lowers the
  output under load.
- The load is a resistor. A smoothing capacitor changes the diodes' current
  into short peaks and the output into DC with a small ripple — the Rectifier
  ripple tool.
- Strictly, a blocking diode sees Vp − Vf, the conducting diode's drop taken
  off; Vp is the figure to rate it by.

### What it deliberately does not do

- **The centre-tapped full-wave rectifier**, two diodes and a transformer
  with a centre tap, has its own tool.
- **Smoothing** with a capacitor is the Rectifier ripple tool.

### How it was checked

12 V AC with 0.7 V diodes into 100 Ω: Vp 16.97 V, Vdc 9.441 V, Idc 94.41 mA,
ripple factor 0.546, efficiency 77.0%; with ideal diodes 10.80 V (2Vp/π),
0.483 and 81.1%. Both closed forms were checked against a numerical average.
5 V AC gives 3.190 V with 0.7 V diodes and 3.638 V with 0.45 V Schottky ones.

The review replaced the 2(Vp − 2Vf)/π shortcut with the exact averages, which
the drawn waveform already followed; put Vdc first and large; limited the
units; and added plain definitions and examples.

[↑ Index](#index)

---

<a id="rectifier-centertap"></a>
## Center-tap rectifier

`calc: rectifier-centertap` · Active & semiconductor devices › Rectifiers

### What it computes

For a full-wave rectifier made of two diodes and a centre-tapped transformer,
feeding a resistive load: the average (DC) output voltage and current, the DC
power, the RMS output, the peak reverse voltage each diode must withstand,
the ripple factor and the efficiency, with the waveforms.

### Source

No standard is needed: the results are averages of the output waveform, as
for the bridge rectifier (see that section), with one diode drop instead of
two. The peak inverse voltage follows from the circuit, below.

### What it means

The transformer's secondary winding has a connection at its middle, the
**centre tap**, which becomes the output's negative side. Each end of the
winding feeds the load through its own diode. On one half-cycle the top half
drives the load through the top diode, on the other half the bottom half
through the bottom diode — current flows through the load the same way both
times, so the output is full-wave, two pulses per cycle.

- **Vac** is the RMS voltage of **one half** of the secondary. A transformer
  sold as "24 V CT" (centre-tapped) is two 12 V halves: enter 12.
- **One diode drop.** Only one diode conducts at a time, so each pulse loses
  Vf, where a bridge loses 2 × Vf — better at low voltage.
- **The catch: PIV.** While one diode conducts, the other has one end at the
  peak of its own half and the other end at the peak of the conducting half,
  of opposite sign: it blocks nearly **twice the peak**, 2Vp − Vf. Choose
  diodes rated for that.
- **Vdc**, **ripple factor** and **efficiency** mean the same as for the
  half-wave rectifier.

**Bridge or centre tap?** The centre tap saves two diodes and one drop but
needs a winding twice as long, each half working only half the time, and
diodes rated for twice the voltage. The bridge uses the whole winding all the
time and is the usual choice today.

### Why the formulas are these

The output is Vout = max(0, Vp·|sin θ| − Vf), Vp being one half's peak. Each
half-cycle conducts from θ1 = asin(Vf / Vp) to π − θ1, so:

    Vdc   = 2·[Vp·cos θ1 − Vf·(π/2 − θ1)] / π
    Vrms² = 2·[Vp²·((π − 2θ1)/2 + sin 2θ1 / 2) − 4·Vp·Vf·cos θ1 + Vf²·(π − 2θ1)] / 2π
    PIV   = 2Vp − Vf

With Vf = 0, Vdc = 2Vp/π, ripple factor 0.483 and efficiency 81.1%, as for
the bridge. The shortcut 2(Vp − Vf)/π reads 2.4% high at 12 V a half.

### Assumptions and limits

- Each diode is an ideal switch with a constant drop.
- The transformer has no resistance or leakage, and both halves are equal.
- The load is a resistor; a smoothing capacitor is the Rectifier ripple tool.

### What it deliberately does not do

- **The bridge rectifier** has its own tool.
- **Transformer selection** (VA rating, regulation) is not covered.

### How it was checked

12 V a half, 0.7 V diodes, 100 Ω: Vp 16.97 V, Vdc 10.11 V, Idc 101.1 mA, PIV
33.24 V, ripple factor 0.515, efficiency 79.1%; with ideal diodes 10.80 V
and 0.483. 5 V a half gives 3.824 V; 24 V a half needs 67.18 V PIV. Both
closed forms were checked against a numerical average.

The review replaced the 2(Vp − Vf)/π shortcut with the exact averages, put
Vdc first and large, limited the units, and added plain definitions and
examples. The PIV, 2Vp − Vf, was already right.

[↑ Index](#index)

---

<a id="rectifier-halfwave-cap"></a>
## Rectifier ripple

`calc: rectifier-halfwave-cap` · Active & semiconductor devices › Rectifiers

### What it computes

For a half-wave, bridge or centre-tap rectifier with a smoothing capacitor
across a resistive load: the DC output voltage, current and power, the
ripple's peak-to-peak voltage and frequency, the ripple factor, the diodes'
peak inverse voltage, and the classic design estimate of the ripple for
comparison, with the output waveform.

### Source

No standard is needed. The figures come from simulating the circuit drawn
over a steady cycle; the design estimate is the usual textbook rule. Both
are explained below.

### What it means

A rectifier alone gives pulses (see the Half-wave and Bridge rectifier
sections). A **smoothing capacitor** across the load charges to the peak at
each pulse and, between pulses, feeds the load on its own, its voltage
sagging as it discharges until the next peak tops it up. The output is then
DC with a small sawtooth on top: the **ripple**.

- **Ripple frequency, fr** — how often the capacitor is topped up: the mains
  frequency for a half-wave, twice it for a bridge or centre tap. That is why
  full-wave rectification halves the ripple for the same capacitor.
- **Ripple (p-p)** — the height of the sawtooth, from peak to trough.
- **Vdc** — the average output, a little below the peak.
- **Ripple factor** — the ripple's RMS value as a percentage of Vdc.
- **PIV** — with the capacitor holding the output near the peak, a half-wave
  or centre-tap diode sees nearly twice the peak when off (2Vp − Vf); a bridge
  diode sees Vp.

More capacitance, or less load current (a larger Rload), gives less ripple.

### Why the formulas are these

**The simulation.** Over each short time step the capacitor either follows
the rectified input, while that is higher (the diodes conduct), or decays
through the load, v → v·e^(−dt/RC). After a few cycles to settle, one cycle
gives the maximum, the minimum, the average (Vdc) and the RMS of the ripple.
It models a perfect transformer — an ideal source, one that keeps its voltage
whatever current is drawn — and diodes with a constant drop, so it is exact
for the circuit drawn.

**The design rule.** Assuming the capacitor discharges at the full load
current for the whole period 1/fr gives

    Vr(p-p) ≈ Vpk / (fr × R × C),   Vdc ≈ Vpk − Vr / 2

with Vpk = Vac × √2 less one diode drop (two for a bridge). The capacitor is
really recharged before the period ends, so the rule overstates the ripple —
by little at light load, by a lot at heavy load: at 1 A from 2200 µF it
gives 4.9 V where the circuit gives 3.4 V. That makes it a safe bound for
choosing a capacitor.

### Assumptions and limits

- **An ideal source.** A real transformer's winding resistance and leakage
  inductance stop the capacitor charging fully to the peak and widen the
  diodes' conduction: Vdc comes out lower and the ripple somewhat larger than
  simulated. Keep margin, or use the design rule.
- **Diode current.** The diodes conduct in short pulses much larger than the
  average current; their peak and surge ratings matter, and are not
  calculated.
- The load is a resistor; a regulator after the capacitor draws a roughly
  constant current instead, for which the design rule is Vr ≈ I / (fr·C).

### What it deliberately does not do

- **Choosing C** for a target ripple is done by trying values; the rule
  above solves for it directly: C ≈ I / (fr × Vr).
- **Transformer and diode surge ratings** are not covered.

### How it was checked

Bridge, 12 V AC, 220 Ω, 1000 µF, 60 Hz: Vdc 15.31 V, ripple 532 mV p-p,
design rule 590 mV. 12 Ω and 2200 µF: 13.95 V, 3.40 V p-p against the rule's
4.91 V; on a half-wave, 6.73 V and a PIV of 33.24 V. At 50 Hz with 4700 µF,
2.13 V. The simulation was checked in a separate script with finer steps.

The review found the tool half-wave only, though the name did not say so and
the bridge is the common case; its numbers from the design rule while the
drawn waveform came from a simulation, so the two disagreed; and a badge
warning that the rule was strained, which the simulation makes unneeded. It
now offers the three rectifiers, takes its figures from the simulation with
the rule beside them, and is renamed Rectifier ripple.

[↑ Index](#index)

---

<a id="thyristor-firing"></a>
## AC phase control

`calc: thyristor-firing` · Active & semiconductor devices › Thyristors (SCR, TRIAC) & MOSFET
(formerly Thyristor firing angle)

### What it computes

For phase control of a resistive load from the mains, with an SCR, a TRIAC
or a pair of MOSFETs, at a chosen angle:
- the power (TRIAC, MOSFET) or the DC output (SCR);
- the RMS voltage and current;
- the share of full power;
- the delay from each zero crossing at which the device is switched;
- the peak voltage the device must block;
- for the MOSFETs, the power they lose;
- the waveforms.

### Source

No standard is needed. The results are averages of the chopped sine,
derived below, and match the formulas of power-electronics textbooks for
phase-controlled circuits with a resistive load.

### What it means

A **thyristor** is a semiconductor switch for AC. It stays off until a
short pulse on its **gate** (G) turns it on. It then stays on by itself
until the current through it falls to zero, which on AC happens at the end
of every half-cycle. So it can be switched on at any point of each
half-cycle, but it switches itself off at the next zero crossing.

- **SCR** (silicon-controlled rectifier) — conducts one way only, like a
  diode with a gate. It passes one half of each cycle, from the moment it is
  fired, and gives DC.
- **TRIAC** — conducts both ways and is fired in each half-cycle. It passes
  both halves, so the load gets AC. Lamp dimmers, heater controls and simple
  motor speed controls use it.
- **Firing angle, α** — how far into each half-cycle the gate is fired,
  from 0° (at once, full power) to 180° (never, no power). Firing later cuts
  off the start of each half-wave: this is **leading-edge** control.
- **Gate delay** — the same angle as a time after the zero crossing:
  α / 360° of a mains period, so 4.17 ms for 90° at 60 Hz. A microcontroller
  dimmer waits that long after it detects the zero crossing, then pulses the
  gate.
- **MOSFET** — a transistor switch that turns on and off whenever its gate
  says, not only at the zero crossing. Each MOSFET has a built-in diode (the
  body diode) that conducts backwards. One MOSFET alone would therefore
  still pass one half-wave, so an AC switch uses two back to back with their
  sources joined: one blocks each direction, and one gate signal drives
  both.
- **Cut-off angle, β** — with MOSFETs the switch is turned on at each zero
  crossing and off at β. This cuts the end of each half-wave instead of its
  start: **trailing-edge** control. β runs from 0° (off at once, no power)
  to 180° (never off, full power). It suits LED lamps and electronic
  transformers, and it is quieter, because the current starts gently from
  zero instead of jumping up.
- **Turns off at** — β as a time after the zero crossing.
- **Rds(on)** — the small resistance of a MOSFET that is switched on, from
  its datasheet (tens to hundreds of milliohms for mains parts). The load
  current flows through both MOSFETs, so they dissipate Irms² × 2 × Rds(on).
  That power becomes heat in the MOSFETs, which is what the heatsink must
  carry away.
- **Of full power** — the power at this angle as a share of the power with
  the switch always on. Power changes slowly near 0° and 180° and fastest
  around 90°, where it is exactly half.
- **PIV / Vds rating** — the peak voltage the device blocks while it is
  off: the mains peak. Choose a part rated above it, with margin.

### Why the formulas are these

With a TRIAC the load sees Vp·sin θ from α to π in each half-cycle. Its
power is Vrms² / R, and the RMS of that chopped sine over a half-cycle is

    Vrms = Vac × √((π − α + sin 2α / 2) / π)        (TRIAC)

This is Vac at α = 0 and 0 at α = π. The share of full power is the square
of Vrms / Vac, which is the bracket under the root.

An SCR conducts only one half of each cycle. So its RMS is that of a
half-wave, (Vp / 2)·√(…), and its average, the DC, is

    Vdc = (Vp / 2π) × (1 + cos α)

This is Vp/π at α = 0, the plain half-wave rectifier.

With MOSFETs the load sees Vp·sin θ from 0 to β instead. Because the sine
is symmetric about 90°, the part from 0 to β carries the same energy as the
part from 180° − β to 180°. So

    k = (β − sin 2β / 2) / π,   Irms = Vac × √k / (Rload + 2 × Rds(on))

For a resistive load, trailing-edge control at β gives exactly the power
of leading-edge control at α = 180° − β. The two differ in the shape of
the current, not in the power. The MOSFETs' on-resistance is in series with
the load, so it is included in the current.

The gate delay (thyristors) and the turn-off time (MOSFETs) are the angle
/ (360° × f).

### Assumptions and limits

- **A resistive load** — lamp, heater. With a motor or a transformer the
  current lags the voltage, a thyristor does not turn off at the zero
  crossing of the voltage, and a MOSFET switching off an inductive current
  must absorb its energy. These formulas do not hold for such loads.
- **Switches.**
  - A real thyristor drops 1–2 V while on, small against mains voltages,
    and needs a minimum holding current to stay on.
  - The MOSFET loss is the conduction loss only. Switching losses at each
    turn-off, and the rise of Rds(on) as the part heats, add to it.
- Phase control chops the current sharply, which causes electrical noise and
  harmonics, and dimmers need filtering to meet emission limits. This is not
  covered.

### What it deliberately does not do

- **Gate drive** is not covered: pulse current, opto-isolation, snubbers,
  and the floating supply a MOSFET pair's gate needs.
- **Inductive loads** need a different analysis, as above.

### How it was checked

- TRIAC, 120 V, 144 Ω (a 100 W lamp), α = 90°: 84.85 V RMS and 50 W,
  exactly half of the 100 W at α = 0. Gate delay 4.167 ms at 60 Hz, PIV
  169.7 V.
- SCR at 90°: Vdc 27.01 V (Vp / 2π), 60 V RMS, 25 W.
- A 1 kW, 230 V heater at 60°: 80.4% of full power, 3.333 ms at 50 Hz.
- SCR, 24 V AC at 45°: 9.222 V DC.
- MOSFETs, same lamp, β = 90°:
  - with Rds(on) = 0: 50 W;
  - with 2 × 100 mΩ: 49.86 W, and 69.25 mW lost in the MOSFETs.
- β = 120° gives 80.4%, the TRIAC's figure at 60°.

The review put the power (TRIAC) or the DC (SCR) first and large, showed
the gate delay the tool already worked out, and limited the units to real
ones (volts, 50 or 60 Hz, ohms to megohms). It also moved the waveform's
legend off the waves and added plain definitions and examples.

On Pierre's request it then added the MOSFET pair as a third switch, with
trailing-edge control, its own waveform and its conduction loss. The tool
was renamed AC phase control, and the old name stays findable in search.

[↑ Index](#index)

---

<a id="opamp-inverting"></a>
## Inverting

`calc: opamp-inverting` · Active & semiconductor devices › Op-amps
(formerly Inverting amplifier)

### What it computes

For the inverting op-amp amplifier:
- the output voltage for a given input, turned upside down;
- the gain, as a ratio and in decibels;
- the input current and the input impedance;
- where the output clips, from the supply and the op-amp's headroom;
- the bandwidth, from the op-amp's gain-bandwidth product.

It draws the input and output waves.

### Source

No standard applies. The gain comes from the ideal op-amp model found in
every analog textbook. The two real limits, headroom and bandwidth, were
checked against manufacturers' datasheets, read from the documents
themselves:
- **TI TL072** (SLOS080W, July 2025):
  - maximum peak output ±13.5 V typical, ±12 V minimum, on ±15 V into
    10 kΩ, so about 1.5 V short of each rail;
  - gain-bandwidth product 5.25 MHz (3 MHz for some versions).
- **TI LM358** (SLOS068AB, October 2024):
  - the output stops 2 V typical, 3 V maximum, below the positive rail
    at 30 V, and 5–20 mV above the negative one;
  - gain-bandwidth product 0.7 MHz (1.2 MHz for the LM358B).
- **Microchip MCP6002** (DS20001733L), a rail-to-rail part:
  - the output gets within 25 mV of each rail;
  - gain-bandwidth product 1 MHz.

### What it means

An **op-amp** (operational amplifier) is a chip with two inputs, "−" and
"+", and one output. It amplifies the difference between its inputs by a
huge amount, 100 000 times or more. It is almost always used with
**feedback**: part of the output is returned to the "−" input, and the
resistors then set the gain.

- **Virtual ground** — the "+" input is at 0 V here. With feedback, the
  op-amp drives its output until the "−" input sits at the same 0 V. So the
  "−" input is at ground potential without being connected to ground.
- **Rin** — the input resistor. With one end at Vin and the other at 0 V,
  it carries Iin = Vin / Rin.
- **Rf** — the feedback resistor, from the output back to the "−" input.
  The op-amp's input takes no current, so all of Iin continues through Rf.
- **Gain** — Vout / Vin = −Rf / Rin. The minus sign means the output is
  turned upside down: a positive input gives a negative output. For a sine
  wave this is a 180° phase shift.
- **Gain in dB** — 20 × log₁₀ of the size of the gain. A gain of 10 is
  20 dB, and a gain of 100 is 40 dB.
- **Zin** — the input impedance, the load the signal source sees. It is
  simply Rin, because the other end of Rin is held at 0 V.
- **Headroom** — how close the output can get to the supply. Enter the
  value from the op-amp's datasheet:
  - a classic op-amp (TL072, LM358) stops about 1.5–2 V short of each
    rail;
  - a rail-to-rail op-amp gets within a few tens of millivolts, so enter
    0 for it.
- **Clipping** — when the gain asks for more than the output can give, the
  output stops at its limit and the tops of the wave are cut flat. That is
  distortion.
- **GBW** (gain-bandwidth product) — a figure from the datasheet: the gain
  the op-amp can give, multiplied by the frequency, is at most this. A
  1 MHz op-amp can give a gain of 10 up to about 100 kHz.
- **Bandwidth** — the frequency where the stage's gain has fallen by 3 dB,
  to 71% of its low-frequency value.

### Why the formulas are these

The "−" input is at 0 V, so the current through Rin is Vin / Rin. None of
it enters the op-amp, so the same current flows through Rf, from the "−"
node towards the output. The output must therefore sit Iin × Rf below
0 V:

    Vout = −Vin × Rf / Rin

The output can only swing to the supply less the headroom, so

    |Vout| ≤ supply − headroom

beyond which it clips.

The bandwidth depends on the **noise gain**, 1 + Rf / Rin, rather than on
the signal gain Rf / Rin. The noise gain is how much the op-amp's own
feedback loop divides down its output, and GBW is shared out by it:

    Bandwidth = GBW / (1 + Rf / Rin)

That is why a unity-gain inverter (Rf = Rin) has only half the GBW as
bandwidth, whereas a unity-gain buffer has all of it.

### Assumptions and limits

- **An ideal op-amp for the gain.** Its open-loop gain is taken as
  infinite. A real one's is large but finite, which lowers the gain a
  little: well under 0.1% for ordinary gains.
- **Symmetric supply.** The supply is ± the value entered, and the
  headroom is taken as the same on both sides. A single-supply circuit
  needs its input biased to mid-supply, which is not covered.
- **Slew rate.** A large, fast output can also be limited by how fast the
  output can move (V/µs on the datasheet). This is not calculated.
- **Offset and bias current** add a small DC error at the output. They are
  not included.
- The output must also drive its load. A load below about 2 kΩ lowers the
  swing of most classic op-amps; see the datasheet.

### What it deliberately does not do

- It does not choose the resistors. Pick Rin for the input impedance you
  need (often 10 kΩ), then Rf = gain × Rin from the E-series.
- Frequency response curves and phase are not drawn.

### How it was checked

- 10 kΩ / 100 kΩ, 0.5 V peak, ±12 V, 1.5 V headroom, 1 MHz GBW:
  - gain −10 (20 dB), Vout −5 V, Iin 50 µA;
  - bandwidth 1 MHz / 11 = 90.91 kHz.
- Unity inverter: −1 V out, 500 kHz bandwidth.
- Mic preamp, 1 kΩ / 47 kΩ, 20 mV: −940 mV out, 20.83 kHz bandwidth.
- Gain −100, 0.2 V: the ideal −20 V clips at −10.5 V, or at −12 V with no
  headroom.

The review found three problems:
- the output clipped at the full supply, which only rail-to-rail op-amps
  reach;
- the gain was given without the bandwidth that limits it;
- the units included mΩ, GΩ and kV.

It now has the headroom and GBW fields, shows Vout first and large, and
remembers the units, and the op-amp's figures for all the op-amp tools. It also adds plain
definitions, examples and an 11 px legend under the waves.

[↑ Index](#index)

---

<a id="opamp-noninverting"></a>
## Non-inverting

`calc: opamp-noninverting` · Active & semiconductor devices › Op-amps
(formerly Non-inverting amplifier)

### What it computes

For the non-inverting op-amp amplifier, it gives:
- the output voltage for a given input, the same way up;
- the gain, as a ratio and in decibels;
- the current through the feedback divider;
- where the output clips, from the supply and the op-amp's headroom;
- the bandwidth, from the op-amp's gain-bandwidth product.

It also draws the input and output waves.

### Source

No standard applies: the gain comes from the ideal op-amp model. The
headroom and gain-bandwidth figures were read from the TL072, LM358 and
MCP6002 datasheets, as listed in the Inverting section.

### What it means

The signal goes straight into the op-amp's **+ input**. Rf and R1 form a
**voltage divider** from the output to ground, and its middle point feeds
the − input. The op-amp drives its output until the divided-down voltage
equals Vin.

- **Gain** — Vout / Vin = 1 + Rf / R1. The output is the same way up as the
  input (in phase), and the gain is never below 1.
  - With Rf = 0, or with no R1, the gain is exactly 1: a buffer.
- **Gain in dB** — 20 × log₁₀ of the gain.
- **Zin** — the signal source sees only the op-amp's own input, megohms to
  teraohms, and no resistor. This is the main reason to choose this circuit
  over the inverting amplifier, whose input impedance is only Rin.
- **Current in Rf, R1** — the divider current, supplied by the op-amp's
  output. Keep it to a few milliamps: resistors in the kΩ range.
- **Headroom** — how close the output can get to the supply. It is about
  1.5–2 V for a TL072 or LM358; enter 0 for a rail-to-rail op-amp.
  **Clipping** is when the gain asks for more than that and the tops of the
  wave are cut flat.
- **GBW** — the op-amp's gain-bandwidth product, from its datasheet.
  **Bandwidth** — the frequency where the gain has fallen by 3 dB.

The headroom and GBW entered here are remembered for all the op-amp tools,
since they describe the op-amp rather than the circuit.

### Why the formulas are these

The op-amp holds its − input at the same voltage as its + input, which is
Vin. The divider puts Vout × R1 / (R1 + Rf) on the − input, so

    Vout × R1 / (R1 + Rf) = Vin   →   Vout = Vin × (1 + Rf / R1)

The divider current is Vout / (Rf + R1). The output can only reach the
supply less the headroom, so |Vout| ≤ supply − headroom.

Here the **noise gain**, which sets the bandwidth, equals the signal gain,
so

    Bandwidth = GBW / Gain

A gain of 101 on a 1 MHz op-amp leaves only 9.9 kHz. For audio, use a faster
op-amp or split the gain over two stages.

### Assumptions and limits

The limits are the same as for the inverting amplifier:
- an ideal op-amp for the gain;
- a symmetric supply, with the same headroom on both sides;
- slew rate, offset and bias current are not calculated;
- the load and the divider together must not demand more current than the
  output can give.

The input voltage must also stay within the op-amp's **common-mode range**
(on the datasheet), because here the inputs follow the signal. Many
classic op-amps do not accept inputs close to their positive supply.

### What it deliberately does not do

- It does not choose the resistors. Pick R1 in the kΩ range, then
  Rf = (gain − 1) × R1 from the E-series.
- Frequency response curves and phase are not drawn.

### How it was checked

- 10 kΩ / 100 kΩ, 0.5 V peak, ±12 V, 1.5 V headroom, 1 MHz GBW:
  - gain 11 (20.83 dB), 5.5 V out, 50 µA in the divider;
  - bandwidth 90.91 kHz.
- Rf = R1: gain 2 (6.02 dB), 500 kHz.
- Gain 101, 20 mV: 2.02 V, 9.901 kHz.
- Gain 11, 1.5 V: the ideal 16.5 V clips at 10.5 V.
- Rf = 0: gain 1 and the whole 1 MHz.

The review found the same problems as on the inverting amplifier:
- clipping at the full supply;
- no bandwidth;
- units such as mΩ, GΩ and kV;
- a 9 px legend and textbook jargon ("series feedback", "virtual short").

It now shares the headroom and GBW fields and the waveform with the
inverting amplifier. It shows Vout first and large, and adds plain
definitions and examples.

[↑ Index](#index)

---

<a id="opamp-buffer"></a>
## Buffer

`calc: opamp-buffer` · Active & semiconductor devices › Op-amps
(formerly Buffer (voltage follower))

### What it computes

For an op-amp buffer between a source and a load, it gives:
- the voltage the load receives through the buffer;
- what the load would get without the buffer, and how much is lost;
- the load current;
- where the output clips, from the supply and the op-amp's headroom;
- the bandwidth.

### Source

No standard applies. The figures come from the ideal op-amp model and
from Ohm's law for the source and load.
- **Headroom and gain-bandwidth figures** — read from the TL072, LM358 and
  MCP6002 datasheets, as listed in the Inverting section.
- **The 10 mA warning** — follows the TI LM358 datasheet (SLOS068AB,
  October 2024). At a 15 V supply it gives an output current of 20 mA
  minimum (30 typical) when sourcing and 10 mA minimum (20 typical) when
  sinking.

### What it means

Every real signal source has some resistance of its own, **Rs**: a sensor,
a voltage divider, a guitar pickup, a reference. When it drives a **load**,
RL, current flows, and part of the voltage is lost across Rs before it
reaches the load. The two resistances form a divider. This is called
**loading**.

- **Without the buffer** — the load gets Vin × RL / (Rs + RL). A
  100 kΩ sensor into a 10 kΩ load delivers only 91 mV of its 1 V.
- **Buffer** — an op-amp whose output is wired straight back to its
  − input. It copies its + input to its output: a gain of 1, the same way
  up.
  - Its input draws almost no current, so no voltage is lost across Rs.
  - Its output drives the load from the op-amp's own supply, with almost
    no resistance of its own.
- **Load current** — Vout / RL. The op-amp's output has to supply it. Above
  about 10 mA many op-amps lose swing or limit; check the output current on
  the datasheet.
- **Headroom** — how close the output can get to the supply. It is about
  1.5–2 V for a TL072 or LM358, and 0 for a rail-to-rail op-amp. A larger
  input clips: a buffer has no gain to reduce, so the input itself is too
  large for the supply.
- **Bandwidth** — with a gain of 1, the bandwidth is the op-amp's whole
  gain-bandwidth product (GBW).

The headroom and GBW entered here are remembered for all the op-amp tools.

### Why the formulas are these

Without the buffer, the same current flows through Rs and RL, so RL gets
the share RL / (Rs + RL) of Vin, and the share Rs / (Rs + RL) is lost.

With the buffer, the op-amp holds its − input, which is its output, at the
voltage of its + input. Almost no current flows into the + input, so
nothing is dropped across Rs, and Vout = Vin, up to supply − headroom. The
noise gain is 1, so the bandwidth equals GBW.

### Assumptions and limits

- An ideal op-amp, apart from the headroom.
- **Input range.** In a buffer the inputs follow the signal, so Vin must
  stay within the op-amp's input common-mode range on the datasheet. Many
  classic op-amps do not accept inputs near their positive supply.
- **Output current.** The 10 mA figure is a rule of thumb from the LM358;
  other parts deliver more or less.
- **Capacitive loads** (long cables) can make a buffer oscillate. This is
  not covered.

### What it deliberately does not do

- It does not model the source's own frequency response or noise.
- Gain other than 1 belongs to the Non-inverting tool.

### How it was checked

- 1 V from 100 kΩ into 10 kΩ:
  - buffered: 1 V, 100 µA, a 1 MHz bandwidth on a 1 MHz op-amp;
  - without the buffer: 90.91 mV, 90.9% lost.
- A 10 k / 10 k divider (2.5 V from 5 kΩ) into 1 kΩ: 416.7 mV without the
  buffer, 2.5 V with it, 2.5 mA.
- 50 Ω into 10 kΩ: 0.498% lost.
- 11 V on ±12 V with 1.5 V headroom: clips at 10.5 V.
- 5 V into 100 Ω: 50 mA, with the warning.

The review kept the drawing from Pierre's sheet and added the source with
its Rs and the load RL around it. It added the headroom, the bandwidth and
the output-current warning, and put the buffered voltage first and large,
with the unbuffered value beside it. It also limited the units to real
ones, remembered the choices, and wrote the note in plain words with
examples.

[↑ Index](#index)

---

<a id="opamp-comparator"></a>
## Comparators

`calc: opamp-comparator` · Active & semiconductor devices › Op-amps
(formerly Comparator (± hysteresis / Schmitt trigger))

### What it computes

For an op-amp used as a comparator, in three forms, it gives:
- the switching point or points: one for a plain comparator, two for a
  Schmitt trigger;
- the hysteresis between the two points, and their centre;
- whether the output is high or low for a given input, and the two output
  levels;
- for the plain comparator, the reference divider's current.

The waveform shows a sine wave swept across the points and the output it
produces.

### Source

No standard applies. The points come from the resistor network at the
+ input; the derivation is below. The output levels use the op-amp's
headroom, read from the TL072, LM358 and MCP6002 datasheets as listed in
the Inverting section.

### What it means

A **comparator** answers one question: which input is higher? It has no
feedback to hold its output in between, so the output sits at one of two
levels, **high** or **low**. Those levels are the supply less the op-amp's
headroom, called **Vsat**. They are about 1.5–2 V short of the rails for a
TL072 or LM358, and at the rails for a rail-to-rail op-amp.

- **Comparator** — R1 and R2 divide the supply into a reference, Vref, on
  the + input. Vin goes to the − input. Vin above Vref sends the output low,
  and below it high: it is inverting. The divider draws its current all the
  time.
- **The problem with a plain comparator** — when the input is slow or noisy
  near Vref, the noise carries it back and forth across the point, and the
  output flips many times. This is called **chatter**.
- **Schmitt trigger** — the cure is **hysteresis**: two switching points
  instead of one. A rising input switches at the upper point, **VT+**, and a
  falling one at the lower point, **VT−**. Noise smaller than the gap
  between them cannot flip the output back.
  - **Inverting** — Rf feeds part of the output back to the divider's
    middle point, so the reference moves with the output. While the output
    is high, the point is VT+; while it is low, VT−. When Vin is between
    the points, the output keeps its last state.
  - **Non-inverting** — Vin comes to the + input through Rin, with Rf from
    the output to the same input, and the − input at 0 V. The points sit
    symmetrically around 0 V, and the output follows the input.
- **Centre** — the middle of the two points.

The headroom entered here is remembered for all the op-amp tools.

### Why the formulas are these

**Comparator.** Vref = V × R2 / (R1 + R2), and the divider current is
V / (R1 + R2).

**Inverting Schmitt.** Three resistors meet at the + input: R1 from the
supply V, R2 to ground, and Rf from the output (±Vsat). With no current
into the op-amp, the currents into that node sum to zero, so its voltage
is

    V+ = (V / R1 + Vout / Rf) / G,   G = 1/R1 + 1/R2 + 1/Rf

Putting Vout = +Vsat gives VT+, and −Vsat gives VT−. The gap is
2 × Vsat / (Rf × G). A smaller Rf makes it wider.

**Non-inverting Schmitt.** The output switches when the + input crosses
0 V. There Vin / Rin = −Vout / Rf, so

    VT± = ± Vsat × Rin / Rf

and the gap is 2 × Vsat × Rin / Rf.

The output level Vsat appears in both Schmitt formulas. That is why the
headroom changes the switching points, not only the output.

### Assumptions and limits

- **An op-amp used as a comparator.**
  - An op-amp is not made for this. It switches slowly (its slew rate),
    and some op-amps misbehave with their inputs far apart.
  - A dedicated comparator chip (LM393, LM339) is faster. Its output is
    usually open-collector: it only pulls low, a pull-up resistor makes the
    high level, and the high level is the pull-up's voltage. That case is
    not modelled.
- **Symmetric supply** of ± the value entered, with the same headroom on
  both sides.
- **Input range** — both inputs must stay within the op-amp's input
  common-mode range from the datasheet.
- The source driving Vin is taken as having no resistance of its own. In
  the non-inverting form, any source resistance adds to Rin.

### What it deliberately does not do

- It does not choose the resistors for given switching points. Try values
  instead: a smaller Rf widens the gap, and R1 and R2 move the centre.
- Switching speed and propagation delay are not calculated.

### How it was checked

All on ±12 V with 1.5 V headroom, so the output levels are ±10.5 V:
- **Comparator**, 10 k / 10 k: switches at 6 V. Vin 7 V gives a low
  output, −10.5 V, and the divider draws 600 µA.
- **Inverting Schmitt**, 10 k / 10 k:
  - Rf 100 k: VT+ 6.214 V, VT− 5.214 V, a 1 V gap;
  - Rf 22 k: 6.833 V and 2.944 V, 3.889 V apart;
  - Rf 100 k on a rail-to-rail op-amp (headroom 0): 6.286 V and 5.143 V.
- **Non-inverting Schmitt**, 10 k / 100 k: ±1.05 V. A 2 V input gives a
  high output.

The review made several changes:
- The output levels were the full supply, so the switching points were
  wrong for most op-amps. The shared headroom field fixes both.
- The switching points come first and large.
- The Schmitt mode's Rf no longer squeezes three fields into one row.
- The waveform legend is now 11 px, below the plot.
- Units are limited to real ones and remembered, the note is in plain
  words, and there are examples.
- The tool was renamed Comparators to fit on one line on the phone.

[↑ Index](#index)

---

<a id="opamp-integrator"></a>
## Integrator

`calc: opamp-integrator` · Active & semiconductor devices › Op-amps
(formerly Op-amp integrator)

### What it computes

For the op-amp integrator, with a square or a sine wave at its input:
- the output's peak;
- for a square, the triangle's peak-to-peak, its ramp rate and how long
  each ramp lasts;
- for a sine, the gain, as a ratio and in decibels;
- the time constant RC and the frequency f₀ where the gain is 1;
- with the optional drift resistor Rf across C, its corner frequency fL,
  and the output it then gives;
- where the output clips, from the supply and the op-amp's headroom.

It draws the input and output waves.

### Source

No standard applies. The output is the integral of the input, from the
ideal op-amp model. The headroom figures come from the TL072, LM358 and
MCP6002 datasheets, as listed in the Inverting section.

### What it means

To **integrate** is to keep adding up: the output is the running total of
the input over time.

- **How the circuit does it** — the op-amp holds its − input at 0 V, so the
  current through R is Vin / R, and none of it enters the op-amp. All of it
  charges C. A capacitor charged by a steady current changes its voltage at
  a steady rate, so the output moves at Vin / RC volts per second. It moves
  downwards for a positive input: the circuit inverts.
- **RC** — the time constant, in seconds. A larger RC makes a slower ramp
  and a smaller output.
- **Square in, triangle out** — a square wave is a steady +Vin, then a
  steady −Vin. The output ramps down, then up, which makes a triangle. Its
  height is the ramp rate times half a period.
- **Sine in** — a sine comes out as a sine moved a quarter cycle (90°)
  earlier, its size multiplied by the **gain**, 1 / (2πfRC). The gain
  halves each time the frequency doubles (−6 dB per octave).
- **f₀** — the frequency where the gain is exactly 1. Below it the output
  is larger than the input, and above it smaller.
- **Headroom** — how close the output can get to the supply. It is about
  1.5–2 V for a TL072 or LM358, and 0 for a rail-to-rail op-amp. At low
  frequencies the integrator asks for large outputs and clips.
- **Rf across C** (optional) — a real integrator also adds up the
  op-amp's own small offset voltage, so its output slowly drifts into a
  rail. A large resistor across C, around 100 × R, stops that. Leave the
  field empty for the ideal circuit.
  - **fL, the Rf corner** — 1 / (2π × Rf × C). Above fL the circuit
    integrates; well below it, it is just an inverting amplifier of gain
    Rf / R.
  - Under 10 × fL the tool warns that the integration is poor.

The headroom is remembered for all the op-amp tools.

### Why the formulas are these

The current into C is Vin / R. A capacitor's voltage changes at
I / C per second, and the output is the far side of C from the 0 V input:

    Vout(t) = −(1 / RC) × ∫ Vin dt

- **Square wave** — ±Vin holds for half a period, 1 / (2f), at the rate
  Vin / RC. The swing is

      Vout p-p = Vin / (2 × f × RC)

  and the peak is half of it, with the triangle centred on 0 V.
- **Sine** — integrating Vp × sin(2πft) gives −Vp × cos(2πft) / (2πf).
  With the minus sign of the circuit, that becomes +Vp × cos / (2πfRC):
  the same shape, a quarter cycle ahead, scaled by 1 / (2πfRC) = f₀ / f.
- **With Rf** — Rf in parallel with C makes a first-order low-pass of DC
  gain Rf / R and corner fL.
  - A sine sees a gain of (Rf / R) / √(1 + (f / fL)²) and leads by
    180° − atan(f / fL). Well above fL this is the ideal f₀ / f and 90°.
  - A square settles to exponential edges. Each half period starts at +A
    and heads towards −(Rf / R) × Vin with time constant Rf × C. Requiring
    it to end at −A gives

        A = (Rf / R) × Vin × tanh(1 / (4 × f × Rf × C))

    As Rf grows this becomes the ideal Vin / (4 × f × RC). The slope
    through 0 V is always Vin / RC.

### Assumptions and limits

- **Drift.** Without Rf, the tool shows the ideal integrator. A real one
  drifts into a rail; fit Rf to model the practical circuit. The offset
  itself is not calculated.
- **Steady state.** The output is shown as it settles, centred on 0 V.
  Without Rf, its level in a real circuit depends on where it started.
- **Op-amp speed.** At high frequencies the op-amp's gain-bandwidth and
  slew rate limit the output. This is not calculated.
- The input is assumed to have no DC part. A DC input makes a ramp that
  never stops.

### What it deliberately does not do

- The output's DC error from the offset voltage, multiplied by
  Rf / R, is not calculated.
- Other waveshapes (pulses, ramps) are not offered.

### How it was checked

All on ±12 V with 1.5 V headroom:
- Square, 10 kΩ, 100 nF, 1 V, 100 Hz: RC 1 ms, a 5 V p-p triangle
  (2.5 V peak), ramping 1 V/ms, each ramp 5 ms. f₀ 159.2 Hz.
- 10 nF at 1 kHz: RC 100 µs, 5 V p-p, 10 V/ms.
- Sine at 100 Hz with 10 kΩ and 100 nF: gain 1.592 (4.04 dB), 1.592 V
  peak.
- Square at 10 Hz: the ideal 25 V peak clips at 10.5 V.
- With Rf = 1 MΩ:
  - fL is 1.592 Hz;
  - the 100 Hz square gives 2.499 V peak, against 2.5 V ideal;
  - a 100 Hz sine has a gain of 1.591 and leads by 90.9°;
  - at 10 Hz, below 10 × fL (15.92 Hz), the tool warns.

  These were checked in a separate script.

The review made several changes:
- It moved clipping from the full supply to the supply less the headroom.
- It put the output peak first and large, with the triangle's size and
  ramp beside it.
- It shows the ramp in V/ms or V/µs instead of kV/s.
- It replaced a row with three fields squeezed into two places by two
  rows of three.
- It moved the 11 px legend below the waves.
- It limited the units to real ones and remembers them.
- It rewrote the note in plain words and added examples.
- On Pierre's request, it added the optional Rf across C, drawn as a
  second rung above C.

[↑ Index](#index)

---

<a id="opamp-differentiator"></a>
## Differentiator

`calc: opamp-differentiator` · Active & semiconductor devices › Op-amps
(formerly Op-amp differentiator)

### What it computes

For the op-amp differentiator, with a triangle or a sine wave at its
input, it gives:
- the output's peak;
- for a triangle, the square's peak-to-peak, the input's slope and how
  long each step lasts;
- for a sine, the gain, as a ratio and in decibels, and the phase;
- the time constant RC and the frequency f₀ where the gain is 1;
- with the optional resistor Rs in series with C, its corner frequency fH
  and the output it then gives;
- where the output clips, from the supply and the op-amp's headroom.

It draws the input and output waves.

### Source

No standard applies. The output is the derivative of the input, from the
ideal op-amp model. The headroom figures come from the TL072, LM358 and
MCP6002 datasheets, as listed in the Inverting section.

### What it means

To **differentiate** is to measure how fast something changes: the output
follows the input's slope, not its level. It is the mirror image of the
integrator.

- **How the circuit does it** — a capacitor passes current only while its
  voltage changes, so the current through C is C × (rate of change of
  Vin). The op-amp holds its − input at 0 V and sends that current through
  R, so Vout = −RC × slope. A rising input gives a negative output: the
  circuit inverts.
- **Triangle in, square out** — a triangle rises at one steady rate, then
  falls at the same rate. The output is therefore a steady negative level,
  then a steady positive one: a square. A triangle of peak Vp at
  frequency f rises at 4 × Vp × f.
- **Sine in** — a sine comes out as a sine a quarter cycle (90°) **behind**
  the input, multiplied by the gain 2πfRC. The derivative of a sine is a
  cosine, which is ahead, but the circuit's inversion turns it round. The
  gain doubles each time the frequency doubles (+6 dB per octave).
- **f₀** — the frequency where the gain is exactly 1.
- **Headroom** — how close the output can get to the supply: about
  1.5–2 V for a TL072 or LM358, 0 for a rail-to-rail op-amp. At high
  frequencies the differentiator asks for large outputs and clips.
- **Rs in series with C** (optional) — because the gain keeps rising with
  frequency, a bare differentiator amplifies high-frequency noise
  enormously and can oscillate. A small resistor in series with C stops
  the rise. Leave the field empty for the ideal circuit.
  - **fH, the Rs corner** — 1 / (2π × Rs × C). Above it the gain stops
    rising, at R / Rs.
  - The circuit differentiates well only below about fH / 10, and the
    tool warns above that.

The headroom is remembered for all the op-amp tools.

### Why the formulas are these

The current into the − node is C × dVin/dt, and it all flows through R:

    Vout = −RC × dVin/dt

- **Triangle** — the slope is ±4 × Vp × f, so the output is a square of
  ±RC × 4 × Vp × f. Each level lasts half a period.
- **Sine** — the derivative of Vp × sin(2πft) is 2πf × Vp × cos(2πft).
  With the minus sign it becomes −2πfRC × Vp × cos: the same shape, a
  quarter cycle behind, scaled by 2πfRC = f / f₀.
- **With Rs** — Rs in series with C makes a first-order high-pass of top
  gain R / Rs and corner fH.
  - A sine sees a gain of 2πfRC / √(1 + (f / fH)²) and lags by
    90° + atan(f / fH). Well below fH this is the ideal f / f₀ and 90°.
  - A triangle's slope drives the input current towards C × slope with
    time constant Rs × C, so the square gets exponential edges. Its peak
    is

        RC × slope × tanh(1 / (4 × f × Rs × C))

    which becomes the ideal RC × slope as Rs shrinks.

### Assumptions and limits

- **Ideal circuit without Rs.** It is shown as drawn on the reference
  sheet, but a real one needs Rs; fit it to model the practical circuit.
- **Input source.** The source driving Vin is taken as having no
  resistance of its own. A real source's resistance acts like part of Rs.
- **Op-amp speed.** The op-amp's gain-bandwidth and slew rate also limit
  the output at high frequencies. This is not calculated.
- **Sharp triangle corners** are taken as perfect, so the square switches
  instantly.

### What it deliberately does not do

- The small capacitor sometimes added across R, for more noise filtering,
  is not modelled.
- Other waveshapes are not offered.

### How it was checked

All with 10 kΩ, on ±12 V with 1.5 V headroom:
- **Triangle**, 100 nF, 1 V, 100 Hz:
  - RC 1 ms, slope 400 V/s;
  - a ±400 mV square (800 mV p-p), each step 5 ms.
- **Triangle**, 10 nF at 1 kHz: 4 V/ms, ±400 mV.
- **Sine**, 100 nF at 1 kHz: gain 6.283 (15.96 dB), lags 90°.
- **Sine** at 10 kHz: the ideal 62.83 V clips at 10.5 V.
- **With Rs = 100 Ω**:
  - fH 15.92 kHz;
  - at 1 kHz the gain is 6.271 and the lag 93.6°.
- **With Rs = 1 kΩ** at 1 kHz: above fH / 10 (159.2 Hz), so the tool warns
  that the gain tends to R / Rs = 10.

The review made these changes:
- It fixed the subtitle, which said a sine comes out a quarter cycle
  early; the output lags by 90°.
- It moved clipping from the full supply to the supply less the headroom,
  and put the output peak first and large.
- It shows slopes in V/s, V/ms or V/µs.
- It replaced a row with three fields squeezed into two places by two
  rows of three.
- It put an 11 px legend below the waves.
- It limited the units to real ones and remembers them, rewrote the note
  in plain words and added examples.
- On Pierre's request, it added the optional Rs, drawn in series ahead of
  C.

[↑ Index](#index)

---

# Digital

<a id="karnaugh"></a>
## Karnaugh map simplification

`calc: karnaugh` · Digital › Logic gates

### What it computes

Takes a truth table for 2, 3 or 4 variables — each cell either 0, 1 or a
don't-care — and returns the minimum sum-of-products expression, with each
product term drawn as a group on the map in its own colour.

### Source

The map is Karnaugh's (1953), itself a reworking of the Veitch diagram. The
minimisation is Quine–McCluskey, which is an exact algorithm rather than a
heuristic; the covering step is solved by exhaustive search, which is affordable
at four variables and would not be at twenty.

### Why the formulas are these

The whole method rests on the ordering along the edges: **00, 01, 11, 10**, not
00, 01, 10, 11. That is Gray code, and it means any two side-by-side cells differ
in exactly one variable. When two adjacent cells are both 1, that variable
appears once true and once complemented, so it cancels:

    A·B̄·C + A·B·C = A·C·(B̄ + B) = A·C

Extend it and a rectangle of 2^k cells cancels k variables. A pair drops one, a
block of four drops two, eight drops three. That is the entire trick — the map is
just an arrangement that puts algebraically adjacent terms physically next to
each other.

**The edges wrap.** The first and last columns also differ in one variable (00
and 10 differ only in the middle bit), and so do the first and last rows. The map
is really a torus. That is why the four corners of a four-variable map form one
group of four, and why a group can run off one edge and continue on the other. A
torus rectangle has no single box on a flat sheet, so the tool draws wrapping
groups as two or four pieces in the same colour.

**Quine–McCluskey.** Terms are combined pairwise wherever they differ in one bit,
the shared bit becoming a dash; repeat until nothing more combines. What never
combined is a **prime implicant** — a group that cannot be made larger. Then a
cover must be chosen: a minterm covered by exactly one prime implicant forces
that implicant in (it is *essential*), and the rest is a set-cover problem solved
here by branch and bound.

The cover is ordered **fewest terms first, then fewest literals**. The second key
matters: several covers can tie on term count while differing in how many
variables survive, and the answer a textbook prints is the one with fewer
letters.

**Don't-cares** are included when forming groups but never required to be
covered. That is where most of the saving usually comes from: an X adjacent to a
group lets the group double in size, dropping another variable for free.

**Parity is what the map cannot see.** A checkerboard of ones has no two
adjacent cells, so every group is a single cell and the sum of products comes out
at full length — twelve of twelve literals on a three-variable map, nothing saved
at all. That function is exclusive-OR:

    A ⊕ B ⊕ C = 1 whenever an odd number of A, B, C are 1

Two XOR gates implement it against four ANDs and an OR for the sum of products.
The map cannot find this because XOR is not a sum of products in any small form —
its minimal SOP genuinely is the long one. The tool therefore tests, separately
from the map, whether the function is the parity of any subset of its variables
(or the complement of one) and prints that form when it is.

### Assumptions and limits

- Two to four variables. Five and six variable maps exist, drawn as stacked
  pairs, but they stop being readable and the whole point of the map is that you
  can see it.
- The result is a minimum, not *the* minimum: several different expressions can
  tie on both term and literal count, and the tool shows one of them.
- Literal count is a proxy for cost, not a gate count. It ignores that inverters
  may be free if a signal is already available complemented, and that fan-in is
  limited in real logic families.
- No account of hazards. A minimal cover can contain a static hazard — a glitch
  when two inputs change at once — which is removed by adding a redundant group
  that the minimiser will never choose because it costs a term.

### What it deliberately does not do

- **Product of sums.** The minimal POS is the same procedure applied to the
  zeros, then inverted. It would double the interface for a form that is asked
  for far less often.
- **More than four variables**, as above.
- **Hazard-free covers.** Adding the redundant terms is a different objective
  from minimisation and would make the answers disagree with what a textbook
  shows.

### How it was checked

A second minimiser was written independently for the purpose: enumerate every
possible cube, discard those covering a zero, and find the smallest cover by
iterative deepening. The two were compared over 3500 random functions at 2, 3 and
4 variables, and 12000 more were checked only for the expression reproducing the
truth table at every care position.

That comparison earned its keep. Term counts matched from the start, but 34 of
the first 3400 came back with more literals than the reference — the cover search
was returning whichever minimum-size cover it reached first, with no tie-break on
literals. A correct minimum by term count, and still not the printed answer.

The parity detector was checked exhaustively over all 256 three-variable
functions: exactly eight are parity forms (three pairs and one triple, each with
its complement), and each one's exclusive-OR form reproduces its truth table.

[↑ Index](#index)

---

<a id="i2c-pullup"></a>
## I2C pull-up resistor

`calc: i2c-pullup` · Digital › Timing & interfaces

### What it computes

The window of pull-up resistances that work on an I²C bus, given the supply, the
bus capacitance and the speed mode — and a suggested value inside it, snapped to
a standard E-series.

### Source

The I²C specification, **NXP UM10204**. Every constant here is from it: the 0.4 V
output-low level, the 3 mA and 20 mA sink currents, the rise-time budgets, and
the bus capacitance ceilings.

### Why the formulas are these

I²C lines are **open-drain**. Nothing on the bus drives a line high; devices can
only pull it low, and the pull-up resistor is what brings it back up. That single
fact produces both bounds, pulling in opposite directions.

**The lower bound is the pull-down.** When a device asserts the line, its
open-drain transistor has to hold it below the 0.4 V that counts as a low, and
the current it must swallow is whatever the pull-up pushes through:

    Rp min = (Vdd − 0.4 V) / I_OL

The spec requires devices to sink **3 mA** up to Fast mode, and **20 mA** in Fast
mode Plus. A smaller resistor asks for more than the transistor is rated to take,
and the line stops reaching a valid low.

**The upper bound is the rise.** Going up, the line is just an RC: the pull-up
charging the bus capacitance. The spec measures rise time between **0.3 Vdd and
0.7 Vdd**, and an RC charge reaches those fractions at

    t(0.3 Vdd) = RC · ln(1/0.7)
    t(0.7 Vdd) = RC · ln(1/0.3)

so the specified rise time is the difference:

    t_r = RC · [ln(1/0.3) − ln(1/0.7)] = RC · ln(7/3) = 0.8473 · RC

Hence

    Rp max = t_r / (0.8473 × Cb)

That 0.8473 is copied everywhere without explanation; it is just ln(7/3). The
budget for t_r is 1000 ns at 100 kHz, 300 ns at 400 kHz and 120 ns at 1 MHz.

**The suggestion** is the geometric mean of the two bounds, √(Rp min × Rp max),
snapped to the chosen E-series. The geometric mean is the centre of the window on
a logarithmic scale, which is what "equal margin on both sides" means when the
two ends can differ by a decade. For a 3.3 V standard-mode bus with 100 pF it
lands on 3.3 kΩ — the value most designs actually fit.

**When the window closes.** Rp max falls as bus capacitance rises, while Rp min
does not move. Past roughly 366 pF in Fast mode at 3.3 V the two cross and no
resistor satisfies both: the bus cannot rise fast enough without asking the
pull-down for more current than it is rated for. That is a real dead end, not a
poor choice, and the ways out are a shorter bus, fewer devices, a slower mode, or
an active bus buffer that isolates segments.

### Assumptions and limits

- **Bus capacitance is an estimate.** Reckon on a few pF per centimetre of track
  plus about 10 pF per device. It is the input people are most wrong about, and
  the whole upper bound scales with it. Measure it on a long bus.
- The RC model treats the bus as one lumped capacitance and the pull-up as ideal.
  At Fast mode Plus, with long tracks, transmission-line behaviour starts to
  matter and the model flatters the real rise time.
- Leakage from many devices and from the pull-up itself is ignored. On a bus with
  dozens of devices it adds a small standing current that eats into the low-level
  margin.
- I_OL defaults to the spec value for the mode. A specific part may be rated
  differently; the field is editable for that reason.

### What it deliberately does not do

- **Current-source or active pull-ups.** Fast mode Plus devices sometimes use a
  current source rather than a resistor, which removes the RC ceiling entirely.
  Different circuit, different arithmetic.
- **Bus buffers and repeaters.** They break a bus into segments each with their
  own capacitance and their own resistor; the tool sizes one segment, so run it
  once per segment.
- **Level shifters.** A MOSFET level shifter between two voltage domains puts a
  pull-up on each side, and the two interact. Not modelled.

[↑ Index](#index)

---

<a id="uart-baud"></a>
## UART baud rate

`calc: uart-baud` · Digital › Timing & interfaces

### What it computes

The divisor a UART needs to reach a wanted baud rate from a given peripheral
clock, the rate it actually produces once that divisor is rounded to an
integer, and the resulting error — with the error shown against every standard
rate on the same clock.

### Source

There is no single standard for baud generation: it is per-device, and the
register is called BRR, UBRR, DLL/DLM or SBRG depending on whose part it is.
What is common to nearly all of them is the shape — an integer divider off a
peripheral clock, with the receiver oversampling each bit — and 16x
oversampling, inherited from the 8250 and 16550 and still the default almost
everywhere. The error budget below is derived from the sampling behaviour, not
quoted.

### Why the formulas are these

A UART has no oscillator of its own. It divides whatever clock it is given:

    Divisor = Clock / (Oversample × Baud)

The divider is a counter, so the value written is an **integer**. Rounding it
is the whole problem:

    Actual baud = Clock / (Oversample × round(Divisor))

At 16 MHz, 115200 baud and 16x oversampling the divisor comes to 8.68. Written
as 9, the line runs at 111111 baud — 3.55% slow. That single fact is why
14.7456 MHz crystals exist: 14745600 / 16 = 921600, which divides exactly into
every standard rate, so the divisor is always a whole number and the error is
zero. 11.0592 MHz and 18.432 MHz are the same trick at other speeds.

**Why the error matters, and how much is allowed.** There is no clock shared
between the two ends. The receiver finds the falling edge of the start bit,
starts its own counter, and samples each bit at what it believes is the middle.
Take the receiver as the reference: it samples bit *n* at time

    (n + 0.5) × T_rx

while the transmitter's bit *n* occupies

    [ n × T_tx , (n+1) × T_tx ]

Writing r = T_tx / T_rx, the sample lands in the right bit only while

    n × r  <  n + 0.5  <  (n+1) × r

Nothing resynchronises inside a frame, so the worst case is the last bit. For
8N1 that is the stop bit, n = 9:

    9 r < 9.5      →  r < 1.0556
    9.5 < 10 r     →  r > 0.95

So the two clocks may differ by about **−5.0% to +5.56%** — usually quoted as
±5%, and slightly asymmetric because the sample point is fixed at mid-bit
while the bit it must land in is what stretches. That budget covers **both**
ends together, which is why 2% each is the practical rule: it leaves room for
the other end plus edge jitter and finite rise time.

Note what does *not* happen: the error does not accumulate across a message.
The receiver re-finds the start edge on every frame, so the drift resets ten
bits at a time. A 3% error is not 3% worse each byte; it is the same 3% on each
of them, which is why it either works or does not.

**The drawing shows exactly this.** The waveform is drawn at the transmitter's
real bit width, stretched or squeezed by the error, while the sample marks stay
evenly spaced where the receiver puts them. Raise the error and the marks visibly
walk toward the bit edges; the ones that fall outside their own bit turn red.
It is the inequality above, drawn.

### Assumptions and limits

- **8N1 is assumed** — one start bit, eight data, one stop, no parity. Adding
  parity or a second stop bit makes the frame longer and the budget tighter,
  since the worst case moves to a later bit.
- **The receiver is taken as exact.** In reality both ends have error and the
  two add; the tool reports one side's, which is why the caution appears at 2%
  rather than 5%.
- **Integer divisors only.** See below.
- Oversampling is a divider stage, not noise immunity: 8x doubles the top speed
  from a given clock and halves the margin around each sample, so a noisy line
  suffers more.

### What it deliberately does not do

- **Fractional dividers.** Many modern UARTs — STM32, SAM, nRF — add fractional
  bits below the integer divisor, which cuts the error by roughly the resolution
  of that fraction and would make the numbers here pessimistic for those parts.
  Modelling it means picking a vendor, since the fraction is 4 bits on some
  parts, 6 on others, and a full 16-bit accumulator on a few.
- **Auto-baud detection**, where the receiver measures a known character
  instead of being told the rate.
- **Anything above the physical layer**: framing errors, break detection, flow
  control.

### How it was checked

The classic cases were recomputed by hand: 16 MHz at 115200 gives divisor 8.68,
used 9, 111111 baud, −3.549%; 14.7456 MHz gives exactly 8 and 0%; 16 MHz at
9600 gives 104.17, used 104, +0.160%, which is why that part runs 9600 happily
and 115200 badly. 8 MHz at 115200 gives +8.507%.

The sample-point test in the drawing was checked against the inequality above
at several errors: at 0% and −3.5% every sample lands inside its bit, at +0.16%
likewise, and at +8.5% the last four fail — which is what
n × 0.9216 < n + 0.5 predicts, the first failure being at n = 6.

[↑ Index](#index)

---

<a id="crystal-load"></a>
## Crystal load capacitance

`calc: crystal-load` · Digital › Timing & interfaces

### What it computes

The two capacitors a Pierce oscillator needs so the crystal sees the load it
was cut for, the load a given pair actually presents, and how far off frequency
the difference pulls it.

### Source

The series expression appears in every oscillator application note — ST AN2867,
the Abracon and Epson design guides, and the NXP equivalents. The pulling
expression comes from the crystal's equivalent circuit, the Butterworth–Van
Dyke model: a motional arm of L1, C1 and R1 in series, all in parallel with the
shunt capacitance C0 of the electrodes and holder.

### Why the formulas are these

**The two capacitors are in series, not in parallel.** This is the step people
get backwards. Each one runs from one crystal terminal to ground, so the loop
the crystal drives is: out through CL1, along the ground, back through CL2.
Two capacitors in series:

    CL1 × CL2 / (CL1 + CL2)

which for an equal pair is just half of one of them. Add the stray capacitance
of the two tracks and the two oscillator pins — that sits directly across the
same nodes, so it adds on:

    Load = CL1 × CL2 / (CL1 + CL2) + Stray

Turn it round for a symmetric pair and the capacitors come out at

    CL1 = CL2 = 2 × (CL spec − Stray)

A crystal marked 12.5 pF on a board with 3 pF of stray therefore wants **19 pF**
parts, not 25 pF and not 12.5 pF. Both of those are common mistakes, and the
second is the worse one.

**Why the load changes the frequency at all.** A crystal has two resonances. At
series resonance the motional arm is purely resistive; a little above it the
arm looks inductive and resonates with everything capacitive across it — C0 and
whatever load the circuit adds. The parallel-resonant frequency is

    fp = fs × [ 1 + C1 / (2 × (C0 + CL)) ]

A crystal is cut and trimmed so that this lands on the marked frequency **for
one particular CL**. Present a different load and it lands somewhere else, which
is the whole reason the number is on the datasheet.

Differentiating that with respect to CL gives the sensitivity, which is what the
tool reports as pullability:

    d(Δf/f) / dCL = − C1 / (2 × (C0 + CL)²)

The sign is negative: **more load, lower frequency**. For a typical MHz part
with C1 = 8 fF and C0 = 3 pF at CL = 12.5 pF that comes to about 16.6 ppm/pF, so
fitting 22 pF where 19 pF was wanted — 1.5 pF too much load — pulls it roughly
25 ppm slow. A 32.768 kHz tuning fork has a tenth the motional capacitance and
pulls far less per pF, around 6 ppm/pF on the same load, which is why watch
crystals are specified so tightly: there is little room to trim them back.

### Where the inputs come from, and what they are called

Three of the inputs are easy to look for in the wrong place.

- **C0** — on the crystal datasheet, as `C0`, "shunt capacitance" or "static
  capacitance". Often given only as a maximum; that is usable.
- **C1** — the motional capacitance, `C1` on datasheets that give it, after
  the Butterworth–Van Dyke model. **Many do not.** When it is missing, look
  for a pullability figure in ppm/pF, or a "frequency versus load
  capacitance" curve, and type that into Pullability instead: the tool works
  C1 back from it. C1 is the one that stays fixed when the load changes — it
  is the crystal — while pullability is its slope at whatever load is chosen,
  so changing CL spec recomputes pullability, not C1.
- **Stray** — **never** on the crystal datasheet, because it is not the
  crystal. It is the capacitance of the two oscillator pins, sometimes listed
  in the MCU datasheet, plus the two tracks. Application notes such as ST
  AN2867 give 2–5 pF as the usual range; that is an order of magnitude, not a
  value to copy.

The load capacitors are called **CL1 and CL2** rather than C1 and C2, which is
how MCU application notes label them and which keeps C1 free for its datasheet
meaning. Every capacitance here only ever comes in one unit — pF for load,
stray and shunt, fF for motional — so the fields show the unit fixed rather
than offering a picker.

**When CL says "Series".** Some datasheets offer, or list, a series-resonant
cut: the crystal is trimmed to its marked frequency with no load at all. A
Pierce oscillator cannot present no load, so the part runs above its marking by
the whole parallel-resonance offset,

    Δf/f = C1 / (2 × (C0 + Load))

which is not a trim but a few hundred ppm: 8 fF against 3 pF + 12.5 pF is
+258 ppm. Type 0 in CL spec to see it. The fix is to order the part with a load
capacitance, or to use it in a circuit that runs it at series resonance.

### Assumptions and limits

- **Stray is an estimate and it dominates the mistakes.** Two to five picofarads
  is the usual range for the pins plus short tracks, but a long or guarded
  layout can be well outside it. If the frequency matters, measure.
- The presets are typical for each family, not for any specific part, and
  a wrong C1 scales the pullability proportionally.
- The pulling figure is a **slope taken at the specified load**, so it is exact
  for small errors and increasingly optimistic for large ones, since the true
  curve flattens as CL grows.
- Sizing assumes a **symmetric pair**. Asymmetric capacitors are legitimate and
  the tool will report the load they present, but it will not propose them.

### What it deliberately does not do

- **Drive level and negative-resistance margin.** Whether the oscillator starts
  and whether it overdrives the crystal are the other half of the design, set by
  the amplifier's transconductance, the crystal's ESR and any series resistor.
  It is a separate calculation with separate datasheet numbers.
- **The feedback resistor**, which is inside the MCU on every part this applies
  to and is not drawn for that reason.
- **Temperature and ageing.** The load error here is a fixed offset; drift over
  temperature is the crystal's cut and belongs with the ppm tooling.

### How it was checked

Recomputed by hand: 12.5 pF specified with 3 pF stray gives 19 pF capacitors and
a presented load of exactly 12.5 pF, 0 ppm. Fitting 22 pF instead presents
14 pF, 1.5 pF over, and pulls −24.97 ppm against 16.65 × 1.5 = 24.98 by hand.
Fitting 33 pF presents 19.5 pF and pulls −116.5 ppm against 16.65 × 7 = 116.6.
The watch preset returns 6.378 ppm/pF against 2.5 fF / (2 × (1.5 + 12.5 pF)²)
= 6.38 by hand.

The pullability was wrong by twelve orders of magnitude on first write:
C1 / (2(C0+CL)²) is *per farad*, not dimensionless, because the numerator is
first order in capacitance and the denominator is second. It needs multiplying
by one picofarad to become per-pF. The hand check is what caught it.

[↑ Index](#index)

---

<a id="osc-stability"></a>
## Oscillator stability

`calc: osc-stability` · Digital › Timing & interfaces

### What it computes

The total frequency error budget of a crystal oscillator — tolerance,
temperature, ageing and load pulling combined — as a worst case and as a
root-sum-square estimate, then expressed as hertz and as time gained or lost
per day and per year.

For a single ppm figure applied to a single value, the **PPM converter** under
Tools does that; this tool is the budget that produces the figure.

### Source

The contributions and their names are the ones on crystal datasheets:
frequency tolerance at a reference temperature, frequency stability over the
operating temperature range, and ageing, usually per first year. The reference
is 20 °C on some datasheets and 25 °C on others — one Petermann-Technik page
quotes both for the same part — so the field is labelled Tolerance without a
temperature. The 32.768 kHz
temperature curve is the parabola the tuning-fork datasheets from Epson,
Abracon and Micro Crystal all quote, with a coefficient of about
−0.034 ppm/°C² (±0.006) about a turnover near 25 °C.

### Why the formulas are these

**Two kinds of error, kept apart.** Tolerance, temperature stability and ageing
are *limits*: the part is somewhere within ± each of them, and which way it
sits is not known. The tuning fork's temperature drift and the load pulling are
*offsets*: they have a known sign and they move the whole window. Mixing the two
kinds is how budgets end up either too pessimistic or wrong-signed, so the tool
computes

    Offset     = Drift + Pulling
    Worst case = Offset ± (Tolerance + Temperature + Ageing)

and reports the extreme of that window with its sign. A window of −69 to
−23 ppm is a clock that can only lose time, and writing it as ±69 ppm would
throw that away.

**Worst case and RSS.** The worst case adds every limit at full size in the same
direction. It is what datasheets call *overall stability*, and it is the right
figure to design against when failure is not an option. If the contributions are
independent, all of them sitting at their extremes together is unlikely, and the
root-sum-square

    RSS = Offset ± √(Tolerance² + Temperature² + Ageing²)

is the likelier spread. Offsets are added directly, never squared: they are not
random.

**The tuning-fork parabola.** A 32.768 kHz crystal is a quartz tuning fork, and
its frequency falls off either side of a turnover temperature:

    Δf/f = −0.034 ppm/°C² × (T − 25 °C)²

It only ever goes down. At 0 °C that is −21 ppm, about 1.8 seconds a day; at
−20 °C it is −69 ppm, six seconds a day. That is why a watch or a data
logger left outdoors in winter runs slow, and why the tool asks for the
temperature the fork will actually see rather than a spec. MHz crystals are
AT-cut plates, whose curve is a cubic set by the cut angle; their datasheets
fold it into one ±ppm figure over the range, which is what the MHz pill asks for.

**Into time.** A day is 86 400 s, so 1 ppm is 86.4 ms a day, and a year of
31 557 600 s makes 1 ppm about 31.6 s a year. Twenty ppm is 1.73 s a day or
10.5 minutes a year.

### Assumptions and limits

- **Ageing is not linear.** It is fastest in the first months and slows roughly
  logarithmically, so ten years is much less than ten times the first-year
  figure. Enter the total you expect over the period, not a rate.
- **The parabola is typical**, not the part's own curve: the coefficient varies
  by about ±18% and the turnover by several degrees. Near 25 °C that barely
  matters; at the extremes it does.
- The MHz temperature figure is taken as a symmetric ± limit, which is how it is
  specified, even though the real AT-cut curve is not symmetric.
- Pulling is carried in as a signed figure from the crystal load tool and is
  treated as exact.
- **Tolerance never includes temperature on a crystal datasheet.** The
  temperature stability is a separate line, often a separate ordering table,
  and the two add: ±20 ppm tolerance with ±30 ppm over −40/+85 °C is up to
  ±50 ppm before ageing. A packaged **XO or TCXO** is different: its
  "frequency stability" is often one all-inclusive figure covering tolerance,
  temperature, supply and load, sometimes ageing too. Read the footnote; if it
  is all-inclusive, enter it as Tolerance and leave the rest at zero.

### What it deliberately does not do

- **Compensated oscillators.** A TCXO or an RTC with digital trimming cancels
  most of the temperature term; its datasheet gives a residual stability, which
  can be entered as Temp. stability on the MHz pill.
- **Short-term stability and jitter.** Phase noise and Allan deviation are a
  different question from where the average frequency sits.
- **Protocol limits.** Whether a budget meets USB, CAN or Ethernet timing needs
  those standards' own tolerances and belongs with the tools for each.

### How it was checked

By hand, MHz defaults: 20 + 30 + 3 = 53 ppm worst case; √(400 + 900 + 9) =
36.18 ppm RSS; 53 ppm of 16 MHz is 848 Hz; 53 × 86.4 ms = 4.579 s a day; 53 ×
31.56 s = 27.88 minutes a year. With −25 ppm of pulling the window becomes
−78 to +28 ppm and the worst case reads −78, signed.

32.768 kHz at 0 °C: drift −0.034 × 25² = −21.25 ppm; with ±23 ppm of
limits the window is −44.25 to +1.75 ppm, worst −44.25 ppm, −3.82 s a day.
Switching pills resets pulling, which on first build carried over from one
family to the other.

[↑ Index](#index)

---

<a id="pll"></a>
## PLL multiplication factor

`calc: pll` · Digital › Timing & interfaces

### What it computes

Every combination of input divider M, feedback multiplier N and output divider P
that a chip's PLL allows, walked exhaustively, with the ones that land closest
to a target frequency listed first — each with its error in ppm and the
frequencies at the phase detector and the VCO, so the limits can be seen being
respected.

### Source

The limits are taken from the vendors' own code rather than from summaries,
which disagree with each other:

- **STM32F4** — ST's HAL driver (`stm32f4xx_hal_rcc.h`, `stm32f4xx_hal_rcc_ex.h`):
  PLLM 2–63, PLLN 50–432, PLLP 2, 4, 6 or 8, PLLQ 2–15, and the VCO input
  between 1 and 2 MHz. The VCO output window of 100–432 MHz and the 168 MHz
  system clock of the F405/407 are from RM0090.
- **RP2040** — the Pico SDK's own calculator, `vcocalc.py`: reference divider
  1–63 with at least 5 MHz after it, FBDIV 16–320, VCO 750–1600 MHz, and two
  post-dividers each 1–7. The 133 MHz system clock rating is the datasheet's.

### Why the formulas are these

An integer-N PLL has one loop and three dividers:

    PFD = Input / M
    VCO = PFD × N
    Out = VCO / P

The input is divided down to the **phase-frequency detector** (PFD) rate. The
VCO runs at N times that, because the loop compares the VCO divided by N
against the PFD reference and steers the VCO until they match. The output is
the VCO divided down again. Each stage has a window it must stay inside: the PFD
because the detector and its filter are designed for a range, the VCO because
the oscillator only tunes over a range. That is what makes this a search rather
than a division — the obvious M and N often put one of the stages outside its
window.

**Ranking.** Rows are ordered by error first. Among equally good rows:

- on the STM32F4, a row whose VCO also divides by some Q to exactly 48 MHz comes
  first, since USB OTG will not work on anything else;
- then the **higher PFD**. ST's manual recommends a 2 MHz VCO input to limit
  jitter, and in general a faster comparison lets the loop correct the VCO more
  often and filter less, which is quieter;
- then the higher VCO.

That is why 8 MHz to 168 MHz on the STM32F4 comes out as M 4, N 168, P 2, Q 7
(PFD 2 MHz, VCO 336 MHz, USB 48 MHz) ahead of the equally exact M 8, N 336,
which runs the detector at 1 MHz.

**RP2040's two post-dividers** multiply, so the tool offers each distinct
product once, as the pair with the larger first divider — the SDK prefers that
split for power.

### Assumptions and limits

- **Integer-N only.** Many modern PLLs add a fractional part to N, which can hit
  almost any target but trades it for spurs and depends on each vendor's
  modulator. Not modelled.
- The preset limits are for the named parts. Other members of a family can
  differ — the F401, for one, needs its VCO in 192–432 MHz, and
  the RP2350 is not the RP2040 — so use Generic with the right reference
  manual when in doubt.
- Lock time, loop-filter design and phase noise are not addressed; the tool
  answers only which settings are legal and how close they land.
- On Generic, the search stops at three million combinations to stay responsive
  and says so; narrow the ranges for a complete answer.

### What it deliberately does not do

- **Vendor clock trees beyond the PLL** — AHB and APB prescalers, peripheral
  clock muxes, flash wait states for the chosen frequency. Those are the next
  steps after this one, and every family arranges them differently.
- **Other presets.** The Generic pill covers any integer-N PLL given its manual;
  a preset is only worth adding for a part used often enough to save the
  reading.

### How it was checked

Against the configurations the vendors ship: 8 MHz to 168 MHz on the STM32F4
gives M 4, N 168, P 2, Q 7 with USB at exactly 48 MHz, and from a 25 MHz crystal
M 25, N 336, P 2, Q 7 — the standard setting for that crystal. 180 MHz is
flagged as above the part's 168 MHz rating and as leaving USB at 45 MHz.

On the RP2040, 12 MHz to 125 MHz gives VCO 1500 MHz with post-dividers 6 and 2,
and 133 MHz gives VCO 1596 MHz with 6 and 2 — both exactly the Pico SDK's own
default settings. The full RP2040 search takes about 3 ms.

[↑ Index](#index)

---

<a id="adc"></a>
## ADC resolution / quantization

`calc: adc` · Digital › Data conversion

### What it computes

For an ideal N-bit converter and its reference: the size of one step (the LSB),
the code a given input produces, the voltage that code stands for, and the
quantization error between the two, in volts and in LSB. It works both ways:
type a voltage to get the code, or type a code — say, one read off a register —
to get the voltage. The range of inputs and codes is shown under the fields.

Two pills cover the two ways converters are built:

- **Single-ended** — 0 to VREF, codes 0 to 2ᴺ − 1. Every MCU ADC (AVR, STM32,
  RP2040, ESP32) works this way.
- **Bipolar ±** — −FSR to +FSR, codes −2ᴺ⁻¹ to 2ᴺ⁻¹ − 1 in two's complement.
  Differential converters such as the ADS1115 work this way.

### Source

- The ideal transfer function is the one in IEEE Std 1241 and the one MCU
  datasheets measure their errors against. The ATmega328P datasheet (ADC
  characteristics) defines offset error as the deviation of the first transition
  from its ideal place "at 0.5 LSB", gain error against a last transition 1.5 LSB
  below full scale, and gives ±0.5 LSB as the ideal absolute accuracy.
- The bipolar pill follows the TI ADS1115 datasheet (SBAS444E): the full-scale
  range is set by the PGA to ±6.144, ±4.096, ±2.048 (the power-up default),
  ±1.024, ±0.512 or ±0.256 V; Table 7-1 gives the LSB as 125 µV at ±4.096 V
  and 62.5 µV at ±2.048 V; output is binary two's complement, clipping at 7FFFh
  and 8000h.

### Why the formulas are these

**The step.** N bits give 2ᴺ codes. Spread over the reference:

    Single-ended:  LSB = VREF / 2ᴺ
    Bipolar:       LSB = 2 × FSR / 2ᴺ

The bipolar span is twice FSR because it runs from −FSR to +FSR. The ADS1115
datasheet writes its Equation 4 as LSB = FSR / 2¹⁶, but its own table (125 µV
at ±4.096 V) only works with FSR as the whole 8.192 V span — the tool asks for
the ± figure, as the datasheet's register table quotes it, and doubles it.

**The code.** Code k stands for k × LSB and covers half an LSB either side, so
the ideal converter rounds:

    Code = round(Input / LSB)

The first transition, 0 to 1, is at ½ LSB. That is why the quantization error
is ±½ LSB rather than 0 to −1 LSB: the steps are centred on the ideal straight
line, and the error is the sawtooth between the line and the staircase. The
drawing shows eight codes around the input at scale, with the dashed ideal line
through the step centres.

**The top of the range.** The highest code is 2ᴺ − 1, not 2ᴺ, so the largest
voltage a code stands for is VREF − 1 LSB: 3.2992 V for 12 bits on 3.3 V. An
input at VREF itself reads the top code, a whole LSB short.

**Two's complement.** A bipolar converter's register holds negative codes as
2ᴺ + code, so −1 reads FFFFh and −FS reads 8000h. The Hex cell shows the
register as it would be read, the Code field the signed value it means.

**Dividing by 2ᴺ − 1.** Arduino's ReadAnalogVoltage example computes
code × 5.0 / 1023, and ST's LL macro divides by 4095. That treats the top code
as exactly VREF, stretching the scale: the reading is k / (2ᴺ − 1) instead of
k / 2ᴺ of VREF, high by up to one LSB near the top. Small beside a real ADC's
errors, but a systematic one, and it is why a 3.3 V input "reads 3.3 V" on
those examples and 3.2992 V here.

### Assumptions and limits

- **An ideal converter.** Offset, gain error, INL, DNL and noise are not
  modelled; on a real MCU ADC they add up to several LSB, far more than the
  quantization shown here. Their datasheet figures are in LSB, which is what
  this tool gives the size of.
- **VREF is taken as exact.** On most MCUs it is the supply, so the supply's
  own tolerance scales every reading. A 1% regulator is 41 LSB at 12 bits.
- **Inputs past the range** read the end code; the tool says so and the error
  then is the overshoot, not quantization. On the ADS1115 the ±4.096 and
  ±6.144 V settings are scaling only — the pins themselves never go past
  VDD + 0.3 V or below GND − 0.3 V.
- **Single-ended on a bipolar part.** The ADS1115 measuring one input against
  ground uses only codes 0000h to 7FFFh, so it is a 15-bit converter in that
  mode. Model it on the bipolar pill with 16 bits, and read only the positive
  half.

### What it deliberately does not do

- **SNR, ENOB, oversampling.** The noise that quantization adds, and what
  averaging buys back, is the next tool, SNR estimation.
- **DAC.** The reverse conversion has its own tool.
- **Offset-binary and sign-magnitude codes.** Some bipolar converters output
  these instead of two's complement; they are rare enough on current parts to
  leave out.

### How it was checked

By hand, single-ended 12 bits on 3.3 V: LSB = 3.3 / 4096 = 805.66 µV;
1.2 V / 805.66 µV = 1489.45, code 1489 = 0x5D1, code voltage 1.19963 V,
error +366.2 µV = +0.4545 LSB. Code 4095 gives 3.29919 V; 3.4 V reads 4095
and is flagged as over range.

Bipolar 16 bits on ±2.048 V: LSB 62.5 µV, matching the ADS1115's Table 7-1.
−1.23456 V / 62.5 µV = −19752.96, code −19753, register 0xB2D7
(65536 − 19753 = 45783); error +2.5 µV = +0.04 LSB. At ±4.096 V the LSB is
125 µV, again the datasheet's figure. Code −32768 reads 0x8000 and −4.096 V,
the datasheet's −FS. 24 and 32 bits keep enough figures in the code voltage
to tell neighbouring codes apart, and the hex fits its cell.

[↑ Index](#index)

---

<a id="dac"></a>
## DAC resolution

`calc: dac` · Digital › Data conversion

### What it computes

For an N-bit DAC, its reference and its output gain: the step between
neighbouring output levels (the LSB), the code to write for a target voltage,
the voltage that code really puts out, and how far that is from the target, in
volts and in LSB. It works both ways — type the voltage you want, or type a code
to see what it outputs. The output range is shown under the fields.

### Source

- **Microchip MCP4802/4812/4822** datasheet (DS20002249B): VOUT = VREF × D / 4096
  with the GA bit at 1 (×1), and 2 × VREF × D / 4096 with GA at 0 (×2), from the
  internal 2.048 V reference; its table gives 0.5 mV per step at ×1 and 1 mV at
  ×2. The MCP4725 datasheet writes the same VREF × Dn / 4096 with VREF = VDD.
- **ST's LL driver** for the STM32 DAC (`stm32f4xx_ll_dac.h`):
  `__LL_DAC_DIGITAL_SCALE` is 0xFFF, and `__LL_DAC_CALC_VOLTAGE_TO_DATA`
  multiplies by it and divides by VREF, i.e. code = V × 4095 / VREF.

### Why the formulas are these

**One level per code.** A DAC puts out one voltage for each code and nothing in
between:

    Vout = Code × LSB

so a target that is not exactly a level gets the nearer one, at most half an
LSB away. That is why the picture is points, not a staircase: eight levels
around the target at scale, the target a line between two of them, the chosen
one in green.

**Two divisors, and why it matters.** How big the step is depends on what the
datasheet divides by:

    ÷ 2ᴺ:        LSB = VREF × Gain / 2ᴺ         top code = VREF × Gain − 1 LSB
    ÷ (2ᴺ − 1):  LSB = VREF × Gain / (2ᴺ − 1)   top code = VREF × Gain exactly

Microchip, TI and Analog Devices write 2ᴺ: a resistor string or R-2R ladder of
2ᴺ equal steps, of which the top code uses 2ᴺ − 1, so the output never quite
reaches VREF. ST's own code for the STM32 DAC uses 2ᴺ − 1, so 4095 is VREF
itself. ST's documents do not all agree — a user on ST's community forum
points out that RM0444 and AN3126 write 4096 — but the driver says 4095, and
that user's bench measurements on a NUCLEO-G071RB matched 4095 within a
millivolt where 4096 was 3–5 mV out. The difference is under one LSB, but it is
systematic, and it is always largest near the top of the range.

**Gain.** Many DACs follow the ladder with an amplifier. On the MCP4822 the GA
bit picks ×1 or ×2 from its internal 2.048 V reference, which is how a 2.048 V
reference makes a 4.095 V range at 1 mV a step.

### Assumptions and limits

- **The output cannot reach the rails.** The MCP4822's amplifier swings from
  10 mV to VDD − 40 mV, and its accuracy holds only between those. The STM32
  DAC with its output buffer on is similarly limited near 0 V and VREF+. The
  top and bottom few codes on the tool's range are therefore not really
  available on those parts, and with ×2 gain the range can exceed VDD, which
  the output will not follow either.
- **An ideal DAC.** Offset, gain error, INL and DNL are not modelled; they are
  specified in LSB, which is what this tool gives the size of.
- **VREF is taken as exact.** When it is VDD, as on the MCP4725, the supply's
  tolerance scales every output.

### What it deliberately does not do

- **Bipolar DACs** (±VREF output with offset-binary or two's-complement
  codes) are rare on current general-purpose parts; the bipolar pill on the ADC
  tool covers the arithmetic if needed.
- **PWM as a DAC.** Resolution there is set by the timer and the filter, not a
  ladder; it is a different calculation.
- **SNR and ENOB** are the next tool.

### How it was checked

÷ 2ᴺ, 12 bits, 3.3 V: LSB 805.66 µV; 1.2 V gives code 1489 (0x5D1), output
1.19963 V, error −366.2 µV = −0.4545 LSB. Code 4095 outputs 3.29919 V, one LSB
short of VREF.

÷ (2ᴺ − 1): LSB 3.3 / 4095 = 805.86 µV; code 4095 outputs exactly 3.3 V;
1.2 V gives code 1489, output 1.19993 V.

MCP4822 at ×2 (VREF 2.048 V, gain 2): LSB 1 mV, matching the datasheet's
table; 3 V is code 3000 exactly; 5 V is flagged as above the 4.095 V range.
8 bits on the same settings: LSB 16 mV. 24 bits: output shown to enough figures
to tell neighbouring codes apart.

[↑ Index](#index)

---

<a id="snr"></a>
## SNR estimation

`calc: snr` · Digital › Data conversion

### What it computes

Two things, one per pill.

- **Estimate** — the signal-to-noise ratio an ADC can reach from the noises
  that can be calculated: quantization, the process gain of oversampling, and
  sampling-clock jitter. Each is shown on its own, then added as noise powers
  into one SNR and expressed as an effective number of bits (ENOB).
- **ENOB ↔ SINAD** — the conversion between the two figures ADC datasheets
  quote, both ways, with how many of the converter's bits noise and distortion
  take away.

The picture is a level diagram in dBFS: full scale at the top, the signal, and
each noise floor as a line. The gap from the signal down to the total floor is
the SNR, and the highest noise line is the one worth fixing.

### Source

Walt Kester's Analog Devices tutorials:

- **MT-001**, "Taking the Mystery out of the Infamous Formula, SNR = 6.02N +
  1.76 dB": the ideal SNR of an N-bit converter for a full-scale sine measured
  over dc to fs/2, and the correction 10 log(fs / 2BW) it calls process gain.
- **MT-003**, "Understand SINAD, ENOB, SNR, THD, THD + N, and SFDR": ENOB from
  SINAD, and its Equation 2, which adds the level below full scale so ENOB is
  normalised to full scale.
- **MT-007**, "Aperture Time, Aperture Jitter, Aperture Delay Time": the SNR
  limit set by jitter, and that the total jitter is the root-sum-square of the
  sampling clock's and the ADC's own aperture jitter.

The ENOB pill's defaults come from the **RP2040 datasheet**, section 4.9.3:
SINAD 54.0 dB typical at 997 Hz and almost full scale, ENOB 8.7.

### Why the formulas are these

**Quantization.** Rounding to the nearest code leaves an error spread evenly
over ±½ LSB, whose rms value is q / √12. A full-scale sine has an rms value of
2ᴺ q / (2√2). Their ratio, in dB, is

    SNR = 6.02N + 1.76 dB

— 6.02 dB per bit, which is 20 log 2, plus a constant from the shape of a sine.
12 bits: 74.0 dB. 16 bits: 98.1 dB.

**Level.** The quantization noise stays where it is when the signal gets
smaller, so the SNR falls one dB for every dB below full scale. A 12-bit ADC
reading a signal at −20 dBFS has 54 dB of SNR, the same as an ideal 8.7-bit
one. That is the most common way resolution is wasted.

**Process gain.** Quantization noise is spread evenly from dc to fs/2. Filter
the result digitally down to a bandwidth BW and only the share of the noise
inside BW remains:

    PG = 10 log(fs / 2BW)

Four times the bandwidth needed is 6.02 dB, one extra bit. MT-001's example: a
65 MSPS ADC with channels 30 kHz wide gains 30.3 dB, 65 dB becoming 95.3 dB.

**Jitter.** If the instant of sampling wanders by tj rms, the error it causes is
the signal's slope times that wander. For a full-scale sine at fin the result
is independent of amplitude:

    SNR(jitter) = −20 log(2π × fin × tj)

It depends on the input frequency, not the sample rate. 100 ps is harmless at
1 kHz (124 dB) and ruinous at 100 MHz (24 dB). MT-007 notes that 14-bit
performance at 100 MHz needs under 0.1 ps; the tool gives 84 dB at exactly
0.1 ps, just under the 86 dB of 14 bits.

**Adding them.** Uncorrelated noises add as powers:

    SNR = −10 log(10^(−Q/10) + 10^(−J/10))

so the total is always a little worse than the worse of the two, and a term
10 dB better than the other barely counts. When jitter is the lower one, the
tool says so — more bits will not help.

**What ENOB means.** ENOB, the *effective number of bits*, answers the
question "how many bits is this converter really worth?". The resolution on
the datasheet, 12 bits say, only counts the codes the ADC can output. A real
ADC also adds its own noise and distortion, so the last few bits are buried in
them: they change from reading to reading without telling you anything about
the signal. ENOB is the resolution of a perfect converter that would be exactly
as noisy as the real one. A 12-bit ADC with an ENOB of 8.7 gives, on a changing
signal, the same quality as a flawless 8.7-bit ADC; the bottom 3.3 bits are
noise. ENOB is not a whole number, because it is worked back from a measured
ratio, not counted.

**What SINAD means.** SINAD, the *signal-to-noise-and-distortion ratio*, is
that measured ratio: a pure sine is fed in, and the power of the sine is
compared with the power of everything else in the output — noise and the
harmonics that distortion adds. SNR is the same measurement leaving the
harmonics out, which is why a datasheet's SNR is always the higher of the two.
Because a perfect N-bit converter has an SINAD of 6.02N + 1.76 dB, the two
figures are the same fact in different units, and datasheets quote either.

**ENOB from the ratio.** The SNR equation solved for N, with the level term of
MT-003:

    ENOB = (SNR − 1.76 − Level) / 6.02

On the ENOB pill SINAD takes the place of SNR, as the datasheets do. The
RP2040's 54.0 dB gives 8.68 bits, and its datasheet says 8.7: of its 12 bits,
3.3 are lost to noise and distortion. Its SNR is 61.5 dB but its THD is −55 dB
— its INL and DNL errors (the DNL spikes are erratum RP2040-E11) cost more
than the noise.

### Assumptions and limits

- **Oversampling needs noise.** Process gain assumes the quantization error is
  random. A clean, slow signal on a quiet ADC can give the same code every
  time, and averaging a constant gives nothing. MT-001 warns about this
  correlation; the cure is noise or dither of about an LSB at the input.
- **Thermal noise and distortion are not estimated.** They are the ADC's own
  and only its datasheet knows them. The Estimate pill gives the ceiling the
  architecture allows; the ENOB pill gives what the part actually does.
- **No noise shaping.** Delta-sigma converters push quantization noise out of
  band and gain far more than 10 log per octave of oversampling. Their
  datasheets give SNR directly.
- **SINAD at other levels.** MT-003's level correction assumes the noise does
  not change with level. Distortion usually drops at lower levels, so ENOB
  normalised from a −6 dBFS measurement can read better than at full scale.

### What it deliberately does not do

- **THD, SFDR, THD + N.** Read from the datasheet, not calculated.
- **Noise-free resolution and effective resolution** from rms input noise, the
  measure for dc and slow signals. MT-003 warns not to confuse them with ENOB;
  they are a different calculation from different data.

### How it was checked

Default Estimate: 12 bits, 1 MSPS, 500 kHz, 0 dBFS, 100 kHz, 100 ps.
Q = 6.02 × 12 + 1.76 = 74.0 dB; J = −20 log(2π × 10⁵ × 10⁻¹⁰) = 84.04 dB;
total 73.59 dB; ENOB 11.93 bits.

MT-001's process-gain example: 65 MSPS and 30 kHz give 30.35 dB. MT-007's
jitter example: 14 bits, 100 MHz, 0.1 ps give J = 84.04 dB, total 81.91 dB,
with the jitter warning. 40 MHz of bandwidth at 65 MSPS is refused as past
fs/2. With no jitter at −1 dBFS, 14 bits give 85.04 dB and an ENOB of 14.0,
normalised.

ENOB pill: SINAD 54.0 dB at 0 dBFS gives 8.678 bits — the RP2040's 8.7 — with
3.32 bits lost; ENOB 10 gives SINAD 61.96 dB.

[↑ Index](#index)
