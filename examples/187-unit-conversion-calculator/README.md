# Example 187 — Unit conversion calculator

## Objective
Convert resistance, power, and length values across SI prefixes and apply explicit significant-digit rounding.

## Run and expected result
The built-in cases return 4.7 kΩ = 4700 Ω, 250 mW = 0.25 W, 125 mm = 0.125 m, and round 1.23456789 Ω to 1.23457 Ω at six significant digits. Cross-dimension conversions, non-finite inputs, unsupported units, and invalid precision are rejected.

## Limits
This calculator performs unit conversions only. It does not determine whether a resistor, power rating, trace, or mechanical dimension is suitable for a circuit.

## Direct circuit analysis result

The base 5 V, 330 Ω, 2 V LED circuit has a bounded DC estimate of 9.09 mA and 27.27 mW resistor dissipation. This calculator/advisor output is a separate analytical tool result.
