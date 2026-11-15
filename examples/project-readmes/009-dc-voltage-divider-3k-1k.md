# 9 V Divider 3 kΩ / 1 kΩ

## Circuit and result

An external 9 V bench supply feeds a 3 kΩ upper resistor and 1 kΩ lower resistor. The junction is VOUT. The unloaded analytical result is 2.25 V, 2.25 mA and 20.25 mW total resistor dissipation. R1 dissipates about 15.19 mW and R2 about 5.06 mW. The oscilloscope shows the solved DC operating point at VCC, VOUT and GND; it is a steady-state reading, not a time-varying SPICE waveform.

## Physical views

The breadboard maps all seven physical pins to a BB400 and uses jumpers that reproduce VCC, VOUT and GND. The schematic keeps the source and two-resistor series divider topology. The 34 mm × 28 mm single-sided PCB maps the 2-pin external supply header and both through-hole resistor packages, with six pads and routed VCC, VOUT and GND copper. The VOUT measurement junction is accessible at the shared R1/R2 pads. Gerber, drill and BOM exports are generated from this layout; the printed views use each view's project geometry.

## Parts and layout basis

- J1: Samtec TSW-102-07-T-S, 1×02 2.54 mm through-hole header; pin 1 VCC and pin 2 GND. [Samtec product page](https://www.samtec.com/products/tsw-102-07-t-s)
- R1: Vishay MRS25000C3001FCT00, 3 kΩ, 1%, MRS25, 0.6 W.
- R2: Vishay MRS25000C1001FCT00, 1 kΩ, 1%, MRS25, 0.6 W. The part-number resistance code and package ratings are from the [Vishay MRS16/MRS25 datasheet](https://www.vishay.com/docs/28724/mrs16m25.pdf). The 10 mm lead centers and mapped board coordinates are layout choices, not vendor footprint claims.

## Limits

The analysis treats the source and resistors as ideal values; it does not include resistor tolerance, source impedance, temperature, PCB parasitics or output loading. The schematic/PCB are a sourced educational implementation and still require design-rule, footprint, supply and manufacturing review before hardware fabrication.