# Example 190 — Voltage-divider calculator

## Objective
Calculate an unloaded resistor-divider output and estimate the effect of a finite load resistance.

## Run and expected result
For 12 V with two 10 kΩ resistors, unloaded output is 6 V. A 100 kΩ load gives about 5.714 V and remains below the default 5% warning threshold. A 10 kΩ load gives 4 V and triggers the loading warning.

## Limits
This ideal DC calculator does not include source impedance, resistor tolerance, temperature, resistor power, or real downstream input characteristics.
