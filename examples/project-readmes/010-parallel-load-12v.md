# 12 V Parallel Resistor Load

## Circuit and solved result

V1 feeds R1 (1 kΩ) in series with the parallel 2 kΩ R2 and 3 kΩ R3 branches. The parallel equivalent is 1.2 kΩ; source current is 5.455 mA and MID is 6.545 V. The modeled resistor dissipation is about 29.75 mW in R1, 21.42 mW in R2, and 14.28 mW in R3. The scope shows the steady-state DC node solution, not a transient waveform.

## Physical views

The BB400 map places all eight resistor/supply pins and three jumpers to reproduce VCC, MID, and GND. The schematic keeps one series resistor feeding two parallel branches. The single-sided 34 mm × 28 mm PCB maps J1 and all three through-hole resistors to eight pads, with routed VCC, MID and GND copper. Probe MID at the joined R1, R2 and R3 pads. The project exports Gerber copper/outline, drill and BOM data and can print its breadboard, schematic and PCB views.

## Source-backed parts

- J1: Samtec TSW-102-07-T-S, 1×02 2.54 mm through-hole header; pin 1 VCC and pin 2 GND. [Samtec product page](https://www.samtec.com/products/tsw-102-07-t-s)
- R1: Vishay MRS25000C1001FCT00, 1 kΩ, 1%, MRS25, 0.6 W.
- R2: Vishay MRS25000C2001FCT00, 2 kΩ, 1%, MRS25, 0.6 W.
- R3: Vishay MRS25000C3001FCT00, 3 kΩ, 1%, MRS25, 0.6 W.

The resistor identity, tolerance, power and package details follow the [Vishay MRS16/MRS25 datasheet](https://www.vishay.com/docs/28724/mrs16m25.pdf). The 10 mm PCB lead centers, BB400 bend positions, pad drills, and routing are layout choices that require confirmation against the actual purchased parts and fabrication house rules.

## Limits

The result is an ideal DC resistor-network calculation; it excludes supply tolerance, parasitics, resistor temperature coefficient and output loading. Run/print results and PCB DRC do not replace independent engineering, footprint or manufacturing review.