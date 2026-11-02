# Example 149 — LED current parameter sweep

## Goal
Compare the current through a red LED when its series resistor is 220 Ω, 330 Ω, or 470 Ω.

## Circuit and assumptions
The example reuses the validated 5 V source, red LED with ideal 2.0 V forward drop, and series resistor topology in the native project. Each sweep point clones the project, changes only R1, and calls the application's supported LED current limiter analysis. This is a bounded analytical DC model; it is not SPICE and does not model part tolerances, temperature, thermal behavior, GPIO limits, transient response, or manufacturer ratings.

## Expected results
Using I = (5 V − 2 V) / R:

| R1 | LED current |
| ---: | ---: |
| 220 Ω | 13.636 mA |
| 330 Ω | 9.091 mA |
| 470 Ω | 6.383 mA |

All three trials should complete, and current should decrease as resistance increases.

## Direct circuit result

The base native circuit produces an ideal estimated LED current of 9.09 mA from 5 V through 330 Ω with a 2 V LED drop. The parameter sweep evaluates its configured range separately.

## Run and verify
Open the example, choose **Run**, and inspect the parameter-sweep result chart and per-value readings. Automated acceptance is in `tests/core.test.mjs` under “catalogue parameter sweep analyzes three resistor values and reports the expected current trend”.
