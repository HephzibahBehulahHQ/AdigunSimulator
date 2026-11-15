# 004 — 5 V Latching SPDT LED Switch

## Circuit and operation

SW1 selects either V1 (Position A) or ground (Position B) at COM. COM feeds the 330 Ω resistor and red LED. Position A produces about 9.09 mA LED current and a 2.0 V LED anode scope node; Position B grounds the switched node and turns the LED off. The scope shows DC operating points; switch movement and contact bounce are not simulated.

## Three physical views

The BB400 layout places SW1 directly across A10–A12. The EG1218 three-pin pitch is 2.50 mm, close to the board's 2.54 mm hole pitch. VCC and ground are wired to the switch throws; COM connects to R1. R1 spans D11–D15 and crosses the breadboard trench to D1 at F15/F16.

The 52 × 34 mm single-sided PCB maps J1, SW1, R1, and D1 to nine plated through-holes, with routed VCC, SW_OUT, LED_A, and GND copper. The project exports copper, outline, drill, and BOM files; the breadboard, schematic, and PCB views remain printable in the application.

## Source-backed parts

- SW1: E-Switch EG1218, SPDT on-on, three PC pins at 2.50 mm pitch, 0.90 mm recommended PCB holes, 200 mA at 30 VDC. [Manufacturer product page](https://www.e-switch.com/product/eg-series-subminiature-slide-switch/?part-number=EG1218) · [2D drawing](https://configured-product-images.s3.amazonaws.com/2D/specs/EG1218.pdf)
- J1: Samtec TSW-102-07-T-S, 1×02 2.54 mm input header.
- R1: Vishay MRS25000C3300FCT00, 330 Ω, 1%, MRS25, 0.6 W.
- D1: Lite-On LTL-307E-002A, 5 mm red LED.

The SPDT terminal numbers map as 1=A/VCC, 2=COM/SW_OUT, and 3=B/GND, following the manufacturer's circuit and pin drawing. Board drills and resistor/LED lead dimensions still require confirmation with the purchased components and fabrication rules.

## Limits

The analysis uses an ideal latching switch and fixed LED forward voltage. It excludes contact bounce, switching transients, part tolerances, parasitics, LED I-V behavior, and supply variation. Verify pin orientation, LED polarity, current limits, and fabrication clearances before hardware use. DRC and exports do not replace independent engineering or manufacturing review.
