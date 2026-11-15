# Example 006 — 5 V RL Step Response

## Circuit and expected result

A regulated 5 V input drives a 100 mH inductor through a 120 Ω resistor. `RL_NODE` is the resistor/inductor junction measured against `GND`. The ideal time constant is `L/R = 0.833 ms`; the oscilloscope records the inductor voltage as current rises from zero. The shared netlist drives Breadboard, Schematic and PCB views.

R1 is 120 Ω rather than 100 Ω so the ideal model's 41.7 mA steady-state current stays below the selected coil's 50 mA rated current. The 0.6 W MRS25 resistor dissipates about 0.21 W at that ideal steady state.

## Source-backed parts

- **L1:** Würth Elektronik WE-TIS 7447471104, 100 mH ±10%, 50 mA rated current, 50 mA typical saturation current, 5.0 ±0.5 mm radial lead pitch, 11 mm diameter × 11.5 mm body. Its documented winding resistance is 115 Ω typical and 140 Ω maximum. [Manufacturer datasheet](https://media.digikey.com/pdf/Data%20Sheets/Wurth%20Electronics%20PDFs/7447471104.pdf)
- **R1:** Vishay MRS25 120 Ω, 1%, 0.6 W axial resistor, with 10 mm board lead centers. [Vishay MRS25 data sheet](https://www.vishay.com/docs/28724/mrs16m25.pdf)
- **J1:** Samtec TSW-102-07-T-S 1×2 through-hole header. Pin 1 is 5 V and pin 2 is ground. [Samtec product page](https://www.samtec.com/products/tsw-102-07-t-s)

## Physical placement

On BB400, R1 uses `D6`–`D10`; `D10` and L1 pin 1 at `A10` are on the same five-hole strip. L1 pins use `A10`–`A12`, a 5.08 mm hole separation within the documented 5.0 ±0.5 mm part pitch. The breadboard drawing records the sourced body and direct lead mapping. Connect the source return and L1 pin 2 to the blue ground rail as shown.

The stored educational PCB is 52 × 32 mm, single-sided, with three physical parts, six through-hole pads and three routed nets. The inductor's 1.0 mm recommended drill is represented in the pad map. Exported Gerber, drill and BOM files describe this layout; the DRC is not a fabrication-house qualification.

## Model limits

The analytical scope curve is an ideal RL response. It omits the selected coil's substantial winding resistance, ±10% inductance tolerance, saturation behavior and temperature effects. The real coil resistance changes both the current and time constant, so use the displayed trace as an ideal estimate, not a hardware prediction. Use a regulated, current-limited supply and verify the assembled circuit.

## Validation

`tests/example-bank.test.mjs` checks the netlist in all three views, BB400 topology and physical package alignment, the ideal current/time constant and scope samples, blocked analysis for a disconnected RL node, PCB DRC and BOM/Gerber/drill exports.
