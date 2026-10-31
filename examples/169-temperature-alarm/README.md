# Example 169 — Latched temperature alarm

## Objective
Apply a threshold alarm with a latched buzzer output. The alarm trips at or above the configured temperature and reset is accepted only below the threshold.

## Run and expected result
With a 70 °C threshold, 65 °C is clear; 70 °C trips the alarm; reset at 75 °C is rejected; the alarm remains latched at 60 °C until reset is requested; 71 °C trips it again. Expected alarm states are false, true, true, true, true, false, true.

## Scope
Synthetic sample and Boolean alarm model only. It does not model a thermistor transfer curve, comparator or PLC circuitry, sensor accuracy, calibration, buzzer load, thermal dynamics, or a protective safety function.
