# Example 172 — PWM fan controller

## Objective
Map measured temperature samples to PWM duty using a monotonic, piecewise-linear curve, with endpoint clamping.

## Run and expected result
Knots are (20 °C, 0%), (30 °C, 40%), and (50 °C, 100%). Temperatures [15, 20, 25, 30, 40, 50, 60] °C must map to [0, 0, 20, 40, 70, 100, 100] percent. The 25 °C and 40 °C samples verify interpolation.

## Scope
This computes a synthetic duty setpoint only. It does not run MCU firmware, model PWM timer resolution or driver electronics, or represent fan startup, airflow, tachometer feedback, thermal response, or real cooling performance.
