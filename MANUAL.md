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
- Resistors → [E-series standard values](#e-series-standard-values)
- Resistors → [Resistors in series and parallel](#resistors-in-series-and-parallel)
- Resistors → [Voltage divider](#voltage-divider)
- Resistors → [Current divider](#current-divider)
- Resistors → [Wheatstone bridge](#wheatstone-bridge)
- Resistors → [Delta-Y transform](#delta-y-transform)
- Resistors → [NTC/PTC thermistor](#ntcptc-thermistor)
- Capacitors → [Ceramic capacitor code](#ceramic-capacitor-code)

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

**IEC 60062:2016**, *Marking codes for resistors and capacitors*. Its table
gives each colour a digit, a multiplier, a tolerance and a temperature
coefficient.

### What the bands mean

A resistor is too small to print a number on, so the value is painted as rings
of colour, one digit per ring. Each colour stands for a digit from 0 to 9:
black 0, brown 1, red 2, orange 3, yellow 4, green 5, blue 6, violet 7,
grey 8, white 9.

- **Digit bands** — the first two (4-band parts) or three (5- and 6-band parts)
  give the significant figures.
- **Multiplier** — the next band says how many zeros follow, as a power of ten:
  red is ×100, orange ×1000. Gold (×0.1) and silver (×0.01) make values below
  10 Ω.
- **Tolerance** — how far the actual resistance may be from the marked value:
  gold ±5% means a 1 kΩ part measures somewhere from 950 Ω to 1050 Ω. Leaving
  the band off means ±20%.
- **Temperature coefficient** (6-band only) — how much the resistance drifts
  per degree of temperature change, in parts per million per kelvin: brown is
  100 ppm/K, so 0.01% per degree.

Brown–black–red–gold is therefore 1, 0, ×100, ±5%: 1 kΩ ±5%.

**Which end to start from.** The tolerance band usually stands apart from the
others, on the right; the digits are bunched on the left. Gold and silver are
never digits, so a part with gold at one end is read from the other.

**Standard values.** Resistors are made only in preferred values, the
E-series, spaced so that neighbouring values just overlap within their
tolerance. The tool reports the coarsest series the value belongs to — 4.7 kΩ
is an E6 value even when bought at 1% — and when the value is in none, the
nearest one in the series its tolerance implies.

### How the value is worked out

    4 bands:  Value = (10 × D1 + D2) × Multiplier
    5, 6:     Value = (100 × D1 + 10 × D2 + D3) × Multiplier

Typing a value runs it backwards: the value is split into as many significant
digits as the band count allows, rounded, and the remaining power of ten picks
the multiplier colour. The smallest value a code can show is 0.1 Ω on 4 bands
(brown–black–silver) and 1 Ω on 5 or 6; the largest is 99 GΩ and 999 GΩ.
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
yellow; all three now follow the standard.

Brown–black–red–gold reads 1 kΩ ±5%, 950 Ω to 1.05 kΩ, E6. At grey's ±0.01% the
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
the 3- and 4-character numerical codes, R as the decimal point, and the
three-character code for E96 values that the industry calls EIA-96.

### What the marking means

A chip resistor is far too small for colour bands, so the value is printed as
characters, three or four of them.

- **3-digit code** — usual on ±5% parts. The first two digits are the value's
  figures, the last is how many zeros follow them. 472 is 47 followed by two
  zeros: 4700 Ω, 4.7 kΩ. 334 is 330 kΩ; 100 is 10 Ω, not 100 Ω.
- **4-digit code** — usual on ±1% parts, which need a third figure. The first
  three are the figures, the last the number of zeros. 1001 is 1.00 kΩ, 4992 is
  49.9 kΩ.
- **R** — below 10 Ω (3-digit) or 100 Ω (4-digit) there is no zero count small
  enough, so R stands where the decimal point is. 4R7 is 4.7 Ω, R47 0.47 Ω,
  47R0 47.0 Ω, R010 10 mΩ — the last one a current-sense resistor.
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
- **Which scheme a part uses** shows in the marking: a letter other than R
  means EIA-96, and digits only are the 3- or 4-digit code, told apart by how
  many there are. Pick the pill that matches.
- **Small parts may not be marked at all.** 0402 and smaller usually carry no
  marking; the value is only on the reel.
- Some makers use their own schemes for current-sense resistors (such as a
  lowercase m for milliohms); those are not covered.

### What it deliberately does not do

- **Colour bands** are the Color code tool.
- **SMD capacitor and inductor markings** have their own tools, since the same
  characters mean picofarads or microhenries there.

### How it was checked

Against the examples given with the IEC 60062:2016 codes: 334 is 330 kΩ, 222
is 2.2 kΩ, 1001 is 1.00 kΩ, 4992 is 49.9 kΩ, R300 is 0.30 Ω, 01C is 10 kΩ; also
68X is 49.9 Ω and 66B 4.75 kΩ.

The review found four faults, now fixed. 47 mΩ on the 3-digit pill printed
"R047", four characters, where the marking is R05; 10 mΩ on the 4-digit pill
printed "R0100", five characters, instead of R010, and typing R010 showed
R0100 on the chip. A marking of just "0" for a zero-ohm link was rejected. And
12 345 Ω showed the code 1232 beside a resistance of 12.35 kΩ, with nothing to
say the code means 12.3 kΩ.

[↑ Index](#index)

---

<a id="resistor-power-rating"></a>
## Resistor power rating

`calc: resistor-power-rating` · Passive components › Resistors

### What it computes

A reference table: how much power each common resistor size can dissipate, with
its dimensions. Surface-mount parts are listed by package code, with their
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
0603's 100 mW. The same resistor at 12 V dissipates 144 mW, and needs an 0805
at least, or better a 1206.

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

### What it deliberately does not do

- **Package dimensions in detail** (pad sizes, heights) are the SMD package
  sizes tool.
- **Temperature rise** from a given power and board is a thermal calculation,
  not a rating lookup.

### How it was checked

Every SMD power rating, working voltage and the 125 °C / 155 °C limits against
the Yageo RC_L datasheet. The review corrected the 1210's size in inches, which
read 0.12″ × 0.125″ against the 0.12″ × 0.10″ its name encodes, and the
0805's width to 1.25 mm; it also withdrew the claim that SMD ratings are
standard across manufacturers, which the Vishay datasheet contradicts. The
maximum working voltages were added then.

[↑ Index](#index)

---

<a id="e-series"></a>
## E-series standard values

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
## Resistors in series and parallel

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
## Ceramic capacitor code

`calc: ceramic-code` · Passive components › Capacitors

### What it computes

The capacitance and tolerance printed on a ceramic capacitor as a three- or
four-digit code with an optional letter, and the other way round: the marking
for a value. It says whether the value is a standard E-series value.

### Source

- **EIA-198** (RS-198), the code for ceramic capacitors: digits in picofarads,
  with 8 and 9 as the multipliers ×0.01 and ×0.1 for values under 10 pF.
- **IEC 60062:2016**, for R as the decimal point and the tolerance letters.

### What the marking means

Ceramic disc and small film capacitors have no room for "100 nF", so the value
is printed as a code, always counted in **picofarads** (pF). 1 nF is 1000 pF,
and 1 µF is 1 000 000 pF.

- **Three digits** — the first two are the value's figures, the last is how many
  zeros follow them. 104 is 10 followed by four zeros: 100 000 pF, which is
  100 nF or 0.1 µF — the most common capacitor there is. 472 is 4700 pF, 4.7 nF.
  220 is 22 pF, not 220 pF.
- **Small values** — below 10 pF there is no zero count small enough, so the
  last digit 9 means ×0.1 and 8 means ×0.01: 479 is 47 × 0.1 = 4.7 pF, 109 is
  1.0 pF. Some makers write R for the decimal point instead: 4R7 is 4.7 pF.
- **Four digits** — three figures and a multiplier, for closer values: 1002 is
  10 000 pF, 10 nF.
- **A letter after the digits** is the tolerance:

| Letter | 10 pF and below | Above 10 pF |
|---|---|---|
| B | ±0.1 pF | ±0.1% |
| C | ±0.25 pF | ±0.25% |
| D | ±0.5 pF | ±0.5% |
| F | ±1 pF | ±1% |
| G | ±2 pF | ±2% |
| J | | ±5% |
| K | | ±10% |
| M | | ±20% |
| Z | | +80% / −20% |

  Small capacitors use a tolerance in picofarads because a percentage of a few
  picofarads would be a fraction of the stray capacitance of the leads. Z is
  typical of cheap high-capacitance ceramics, whose value is mostly guaranteed
  not to be too low.

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
- A value typed in is encoded with R below 10 pF (4R7); the 479 form means the
  same and is read as well.

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
