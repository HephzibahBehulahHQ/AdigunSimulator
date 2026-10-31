# Example 123: Op-amp filter PCB

## Circuit and board

This project maps the existing first-order active low-pass circuit to a single-sided PCB. Headers expose the positive rail, negative rail, and input. The ideal amplifier uses a generic SOIC-8 footprint with only its five modeled pins assigned; the three unmodeled package pads are included as no-connect copper pads. RIN, RF, RG and C1 use 0805/0603 SMD footprints.

The 45 × 30 mm board uses one F.Cu layer. Its native circuit and physical pad maps are cross-checked by net name and endpoint, and every physical pad must appear on a route.

## Expected exports

The test compares the generated files byte-for-byte:

- `board-F_Cu.gbr`
- `board-Edge_Cuts.gbr`
- `board-PTH.drl`
- `BOM.csv`

## Limits

The op-amp is an ideal circuit model. The SOIC pinout and all other package names are generic and are not tied to a verified orderable part. The bounded DRC does not assess track crossings, trace capacity, stability, noise, solder-mask/paste/silkscreen or manufacturer-specific rules. Verify the selected amplifier datasheet, supply rails, footprint drawings, board files and BOM before assembly.
