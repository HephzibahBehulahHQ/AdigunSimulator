# DC voltmeter use

## Goal

Measure the 9 V divider output VOUT relative to GND, show the reading in volts, account for the selected 10 MΩ meter input resistance, and report lead polarity.

## Run

Open the example and select Run. The output dashboard reports meter voltage, units, lead nets, polarity, input resistance, unloaded reference and estimated meter loading.

## Acceptance

Automated coverage checks the known divider reference near 6.000 V, finite input loading, units, reversed lead sign and rejection of a same-net lead placement.

## Direct divider result

The native 9 V, 1 kΩ/2 kΩ divider produces 3 mA and an unloaded 6 V output in the bounded DC analyzer. The voltmeter example then reports its separate finite-input-resistance measurement (5.9996 V); the two values describe different models.

## Limits

This is an analytical DC resistor-divider meter model. It does not model instrument accuracy, protection, AC measurement, bandwidth, transients, or physical voltage-category safety. Verify real instruments and leads before measuring hardware.
