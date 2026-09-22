# Circuit Codex — User Manual

The theory behind each tool. This file is the **content**; the Help screen that
presents it gets built once, at the end, when the structure is obvious.

The in-app note on a tool carries only what you need to use it without getting a
wrong answer. Everything else — where a formula comes from, why a bound exists,
what the method can and cannot see — lives here.

<a id="index"></a>
## Index

Links point at the anchors the renderer makes from the headings, which is the
form that works in the most places. Each section also carries an explicit
`calc:` id anchor — `#karnaugh`, `#i2c-pullup` — which is what the Help screen
will key on, since that is the id the app already holds for each tool.

### Digital

- Logic gates → [Karnaugh map simplification](#karnaugh-map-simplification)
- Timing & interfaces → [I2C pull-up resistor](#i2c-pull-up-resistor)
- Timing & interfaces → [UART baud rate](#uart-baud-rate)

Tools finished before this file existed get their section when they are next
touched. The completeness pass under **Before release** in `TODO.md` catches
whatever is still missing.

## How a section is written

Every tool gets the same five headings, in this order:

- **What it computes** — the job, in a sentence or two.
- **Source** — the standard, datasheet or derivation the numbers come from. If
  there is no citable source, say so.
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
