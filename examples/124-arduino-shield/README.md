# Example 124: Arduino Uno R3 shield

## Circuit and declared headers

This board carries a potentiometer input on A0 and an LED load driven from PWM pin D9. It models an Uno-class PWM controller and maps the shield header's +5V, GND, A0 and D9 contacts to the native circuit nets. The declared map includes both the 14-position power/analog row and 18-position digital row. Unused positions are represented as no-connect pads.

Header function labels follow the [official Arduino UNO R3 pinout](https://docs.arduino.cc/resources/pinouts/A000066-full-pinout.pdf) and the [UNO R3 CAD resource page](https://docs.arduino.cc/hardware/uno-rev3). This template stores explicit 2.54 mm header coordinates, a 68.58 × 53.34 mm outline and keep-outs for USB, barrel jack and mounting areas. The map test checks every declared contact against its physical pad.

## Checks and expected outputs

The bounded DRC checks native-net equivalence, every mapped physical pad, routed net coverage, pad spacing, drill dimensions and rectangular keep-outs. The project test verifies the Uno pin map and compares these outputs byte-for-byte:

- `board-F_Cu.gbr`
- `board-Edge_Cuts.gbr`
- `board-PTH.drl`
- `BOM.csv`

## Limits

The stored outline and header coordinates are an educational template and have not been overlaid against the current official CAD archive or tested with a physical Arduino revision. The keep-out boxes are conservative placeholders. The checks do not cover trace crossings, board contour details, annular rings, power/current limits, solder-mask/paste/silkscreen, connector stack height or manufacturer-specific rules. Confirm exact fit and the selected stackable headers against the official CAD files and the physical board before fabrication.
