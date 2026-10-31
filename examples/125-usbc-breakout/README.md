# Example 125: USB-C USB 2.0 breakout

## Circuit and pin map

J1 is identified as a GCT USB4105 16-contact USB 2.0 Type-C receptacle. The design maps all sixteen contacts, keeps SBU1/SBU2 unconnected, and leaves the shell unbonded in this template. A4/A9/B4/B9 form VBUS; A1/A12/B1/B12 form GND; A6/B6 form D+; A7/B7 form D-. A5 (CC1) and B5 (CC2) each have their own 5.1 kΩ pull-down resistor to GND. The four-position J2 breakout reports VBUS, GND, D+ and D-.

The USB-IF Type-C specification defines the CC Rd sink resistor as 5.1 kΩ ±20%. Manufacturer references: [GCT USB4105 product page](https://gct.co/connector/usb4105) and [USB Type-C Cable and Connector Specification, Release 2.0](https://www.usb.org/sites/default/files/USB%20Type-C%20Spec%20R2.0%20-%20August%202019.pdf).

## Checks and expected outputs

The test verifies the complete declared connector map, independent CC resistors, no native/PCB netlist mismatch, bounded single-layer DRC and byte-identical exports:

- `Connector-Pin-Report.csv`
- `board-F_Cu.gbr`
- `board-Edge_Cuts.gbr`
- `board-PTH.drl`
- `BOM.csv`

## Limits

The selected manufacturer part is identified, and its pin functions follow the USB-C specification. This repo's connector pad coordinates are a generic instructional template; verify the official package drawing and land pattern against the exact ordering code before assembly. DRC is bounded and does not establish trace-crossing, controlled impedance, USB signal integrity, current/thermal limits, ESD protection, shield strategy, USB-IF compliance or production readiness. This is a USB 2.0 sink breakout with 5 V VBUS; it does not implement USB Power Delivery or negotiate higher voltages.
