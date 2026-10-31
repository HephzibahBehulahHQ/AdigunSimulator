# Example 174 — Smart irrigation decision model

## Objective
Command a logical pump/valve only when soil is dry and watering is permitted. Treat a failed sensor as a fail-off condition.

## Run and expected result
At a 35% dry threshold, six samples produce watering commands [on, off, off, off, off, on]. The fourth sample is faulted with a null reading and must not water. A dry reading with permission disabled also remains off.

## Scope
Synthetic moisture, permission, and fault inputs only. No soil calibration, weather, flow, pressure, pump protection, water-use limits, schedules, or crop response is modeled.
