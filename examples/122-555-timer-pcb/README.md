# Example 122: 555 timer PCB

## Circuit

This project uses the NE555 astable LED blinker topology: a 5 V supply, timing resistors RA/RB, 100 µF timing capacitor, 10 nF control capacitor, output resistor and red LED. The bounded ideal timer estimate is about 0.481 Hz with a 66.7% duty cycle.

## Board and checks

The board is a 70 × 50 mm, 1.6 mm single-sided F.Cu preview with a DIP-8 NE555-class footprint and through-hole passive/LED footprints. Each physical pad maps to a native circuit pin and declared net. Bounded checks require every physical pad to appear in its net's copper path, every physical net to have routing, connected route endpoints, valid drill sizes, board bounds and a single copper layer.

The checked-in expected files are compared byte-for-byte by the project test:

- `board-F_Cu.gbr`
- `board-Edge_Cuts.gbr`
- `board-PTH.drl`
- `BOM.csv`

## Limits

The component packages are generic footprints, not manufacturer-verified parts. These simple checks do not evaluate trace crossings, impedance, trace current, thermal rise, solder-mask/paste/silkscreen, detailed annular rings, or manufacturer-specific rules. Confirm the selected timer, polarities, footprint drawings, clearances and all production files with your PCB manufacturer before fabrication.
