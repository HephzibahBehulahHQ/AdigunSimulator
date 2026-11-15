# 5 V Two-LED Polarity Indicator

## Circuit and result

The signed 5 V source feeds two opposite-facing LED branches, each with its own 330 Ω series resistor. At +5 V, the red branch conducts about 9.09 mA and the green branch is reverse-biased. At −5 V, the green branch conducts about 8.79 mA and the red branch is reverse-biased. The scope shows the DC operating-point nodes for the selected polarity; it is not a transient SPICE simulation.

## Physical views

The BB400 map assigns all 11 physical pins to holes and four jumpers reproduce VCC, RED_A, GREEN_K and GND. The schematic retains both LED directions and their separate resistors. The 40 mm × 30 mm single-sided PCB maps the two-pin 5 V input, both resistors and both LEDs to 10 through-hole pads and routed copper. D1’s cathode connects to ground; D2 is rotated so its cathode faces the green resistor. Print the three project views and export the Gerber, drill and BOM from the native data.

## Source-backed parts

- J1: Samtec TSW-102-07-T-S, 1×02 2.54 mm header. Pin 1 is VCC; pin 2 is GND. [Samtec product page](https://www.samtec.com/products/tsw-102-07-t-s)
- R1 and R2: Vishay MRS25000C3300FCT00, 330 Ω, 1%, MRS25, 0.6 W. [Vishay MRS16/MRS25 datasheet](https://www.vishay.com/docs/28724/mrs16m25.pdf)
- D1: Lite-On LTL-307E-002A, 5 mm red LED; [manufacturer datasheet](https://optoelectronics.liteon.com/upload/download/DS20-2000-034/307E-002A.pdf).
- D2: Lite-On LTL-307G, 5 mm green LED; [Lite-On datasheet copy](https://media.digikey.com/pdf/Data%20Sheets/Lite-On%20PDFs/LTL-307G.pdf) lists 2.1 V typical and 2.6 V maximum at 20 mA, 2.54 mm lead pitch and cathode lead identity.

The PCB’s 10 mm resistor lead centers and pad/drill dimensions are layout choices. Verify the purchased LEDs’ polarity, reverse-voltage limits, resistor dimensions and board fabrication rules before assembly.

## Limits

The analytical model uses typical LED forward drops, ideal switching and fixed resistor values. It does not model LED reverse breakdown, recovery, temperature, tolerances or general SPICE behavior. DRC and generated files do not replace independent engineering or manufacturing review.