# Example 112 — IGBT inverter leg

Models a 24 V ideal DC bus, IGBT half bridge, gate commands, fault input, and a 12 Ω resistive load. The mutual-exclusion interlock disables both gates when both commands are on or when a desaturation/overcurrent fault is injected.

## Expected nominal result
- High-side on, low-side off; output estimate 22.2 V.
- Resistive load estimate 1.85 A and 41.07 W.
- No simultaneous gate conduction.

## Try
- Set `HighCommand off; LowCommand on`: output is held at the low-side state.
- Set both commands to `on`: the command-conflict interlock turns both gates off.
- Set `Fault desat` or `Fault overcurrent`: fault interlock turns both gates off.
- Set `Fault none` to clear the modeled fault and resume gate logic.

This bounded educational estimate omits switching transients, inductive load current, freewheel paths, diode recovery, gate-driver propagation, isolation, thermal effects, protection circuitry, device safe-operating-area, and hardware qualification. It is not a production or safety design approval.
