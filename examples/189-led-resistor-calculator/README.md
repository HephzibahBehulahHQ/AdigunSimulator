# Example 189 — LED series-resistor calculator

## Objective
Calculate a minimum series resistance from supply voltage, LED forward voltage, and target current, then recommend an E12 resistor at or above that value.

## Run and expected result
The examples cover a 3.3 V red LED, a 5 V blue LED, and a 12 V case that exceeds a 0.125 W resistor rating. The selected E12 value keeps the ideal current estimate at or below the target. The 12 V case produces a resistor power warning.

## Limits
These are ideal DC estimates. Source and LED variation, resistor tolerance, thermal derating, pulse behavior, and manufacturer limits are not modeled.
