# Example 179 — Warehouse occupancy beacon

## Objective
Map synthetic vacant, occupied, and sensor-fault states to distinct green, red, and amber/buzzer outputs.

## Run and expected result
Input states [vacant, occupied, fault, vacant] should produce green, red, amber plus buzzer, then green. There are three state transitions and exactly one status color per sample.

## Scope
Synthetic state mapping only. No occupancy sensor, industrial beacon photometry, sound level, placement, installation, machine interface, or safety behavior is modeled.
