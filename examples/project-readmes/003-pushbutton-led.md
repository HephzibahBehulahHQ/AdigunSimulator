# 003 — 5 V Pushbutton LED with Pull-down

## Circuit and operation

V1 supplies 5 V through SW1. When the normally-open button is pressed, SW_OUT drives R1 (330 Ω) and D1 (red LED) to ground. R2 (10 kΩ) pulls SW_OUT low while the button is open. The ideal calculation reports 9.09 mA LED current and 0.50 mA pull-down current in the pressed state. Its scope trace is a DC operating point; switch bounce and transient edges are not simulated.

## Three physical views

The BB400 map places R1, R2, and D1 on named holes, routes supply and return through the rails, and shows SW1 as an off-board momentary switch with insulated leads to TP6 and A10. This avoids pretending the Omron 4.5 × 6.5 mm terminal geometry fits the BB400 2.54 mm grid. The selected redundant switch terminals are described in the native project.

The 48 × 34 mm single-sided PCB maps J1, SW1, both resistors, and D1 to 12 through-hole pads with routed VCC, SW_OUT, LED_A, and GND copper. The switch uses four real package pads, with each redundant contact pair bridged to the two-pin ideal switch model. The project exports copper, outline, drill, and BOM data; breadboard, schematic, and PCB views remain printable in the application.

## Source-backed parts

- J1: Samtec TSW-102-07-T-S, 1×02, 2.54 mm pitch. [Samtec product page](https://www.samtec.com/products/tsw-102-07-t-s)
- SW1: Omron B3F-1000, 6 × 6 mm SPST-NO tactile switch, four through-hole terminals. The datasheet specifies a 3–24 VDC resistive rating, 1–50 mA, and up to 5 ms contact bounce. [Omron datasheet](https://components.omron.com/us-en/datasheet_pdf/A070-E1.pdf)
- R1/R2: Vishay MRS25 330 Ω and 10 kΩ, 1%, 0.6 W. [Vishay datasheet](https://www.vishay.com/docs/28724/mrs16m25.pdf)
- D1: Lite-On LTL-307E-002A, 5 mm red LED. [Manufacturer datasheet](https://optoelectronics.liteon.com/upload/download/DS20-2000-034/307E-002A.pdf)

## Limits

The analysis uses an ideal switch and fixed LED forward voltage. It excludes contact bounce, contact aging, part tolerances, parasitics, LED current-voltage behavior, and supply transients. Confirm pin orientation, purchased part identity, resistor power, BB400 wiring, and fabrication drills before hardware use. DRC and exports do not replace independent engineering or manufacturing review.
