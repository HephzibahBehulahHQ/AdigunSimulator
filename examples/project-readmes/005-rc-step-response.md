# Example 005 — 5 V RC Step Response

## Circuit and expected result

A regulated 5 V DC input charges a 100 µF polarized capacitor through a 1 kΩ resistor. The capacitor voltage is measured at `RC_NODE` relative to `GND`. The ideal time constant is 100 ms; the analytical run records the exponential rise from 0 V toward 5 V. The scope uses the `RC_NODE` transient recording.

The project netlist is shared by Breadboard, Schematic and PCB views. The BB400 map places the supply at `TP2`/`BM2`, R1 at `A6`/`A10`, and C1 at `F14`/`F15`. Three jumpers connect VCC, the resistor output to capacitor positive, and capacitor negative to the ground rail. The assembly drawing identifies the actual radial capacitor and axial resistor.

## Source-backed parts

- **C1:** Panasonic ECA1VMH101I, 100 µF, 35 V, radial polarized electrolytic, 6.3 mm diameter × 11.2 mm body, 2.5 mm lead pitch. Pin 1 is positive (`RC_NODE`); pin 2 is negative (`GND`). [Panasonic specifications](https://na.industrial.panasonic.com/products/capacitors/aluminum-electrolytic-capacitors/series/84119/model/88360)
- **R1:** Vishay MRS25 1 kΩ, 1%, 0.6 W axial resistor. The board uses 10 mm lead centers. [Vishay MRS16/MRS25 data sheet](https://www.vishay.com/docs/28724/mrs16m25.pdf)
- **J1:** Samtec TSW-102-07-T-S 1×2, 2.54 mm through-hole header. Pin 1 is 5 V and pin 2 is ground. [Samtec product page](https://www.samtec.com/products/tsw-102-07-t-s)

The 2.5 mm capacitor pitch differs from the BB400 hole pitch by 0.04 mm. Check the purchased lead form and insert without force. The model has 5 V across a capacitor rated for 35 V; it does not model ESR, leakage, tolerance, source impedance, dielectric behavior, or temperature.

## PCB and fabrication review

The stored single-layer educational layout is 52 × 30 mm and contains all three physical parts, six through-hole pads, and three routed nets. Validate that the purchased component lead forms match the recorded placements. The generated Gerber, drill and BOM files describe this project layout; the DRC and exports are not a fabrication-house qualification. Independently check polarity, drill, annular ring, clearance and assembly before ordering.

## Validation

`tests/example-bank.test.mjs` verifies the shared three-view netlist, BB400 topology and sourced package assembly, completed RC analysis and scope samples, blocked run with a disconnected capacitor node, PCB DRC, and BOM/Gerber/drill exports.
