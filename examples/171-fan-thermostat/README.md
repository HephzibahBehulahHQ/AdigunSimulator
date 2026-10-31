# Example 171 — Fan thermostat

## Objective
Apply a two-threshold fan controller. The fan starts at or above 30 °C, stops at or below 25 °C, and retains its prior state within the hysteresis band.

## Run and expected result
The seven input temperatures (24, 30, 28, 25, 26, 31, 24 °C) produce fan states off, on, on, off, off, on, off. The exact threshold values cause transitions; intermediate values retain the state.

## Scope
Synthetic temperatures and a Boolean command only. No NTC characteristics, sensor tolerance, thermal mass, airflow, fan dynamics, switch hardware, or cooling performance is modeled.
