# Example 118 — Hot-swap input protection

Models a 24 V source passing through an ideal hot-swap controller and series MOSFET to a 470 µF load capacitor and 24 Ω resistive load.

## Expected behavior
- A 20 ms ramp requests 0.564 A of capacitor inrush.
- The 0.5 A current limit clamps the estimate and gives a 22.56 ms charge-time estimate.
- The nominal 24 Ω load remains below the 1.5 A overload threshold.
- Lowering the overload threshold to 0.8 A trips the output in the steady-state model.

This educational estimate does not simulate controller timing, current-limit loop stability, short-circuit response, MOSFET safe operating area, transient thermal impedance, component tolerance, or hardware safety. It is not a validated hot-swap controller design.
