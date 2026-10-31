# Example 111 — MOSFET half-bridge with dead time

## Objective
Check complementary high-side/low-side gate timing for shoot-through overlap, enforce a minimum dead time, and estimate the resistive load current during high-side conduction.

## Example values
12 V bus, 10 µs period, 45% high-side duty, 45% low-side duty, 0.5 µs dead time at both transitions, 0.08 Ω on-resistance, and 8 Ω load. The timing uses 4.5 µs high-side, 0.5 µs dead, 4.5 µs low-side, 0.5 µs dead.

## Acceptance cases
- The valid complementary sequence reports no overlap.
- Gate state pairs never assert high and low together.
- Duty values that leave less time than two required dead intervals block.
- Dead time below the driver's minimum and a load above device current rating block analysis.

## Boundaries and safety
This is an ideal timing and resistive-load estimator. It does not model switching transitions, inductive freewheel, reverse recovery, gate charge, parasitics, thermal limits, device safe operating area, or hardware safety.
