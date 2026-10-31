# Example 108 — USB-C source concept

## Objective
Filter fixed PDO advertisements against configured source voltage, current, and power limits; select the requested valid profile or fall back to 5 V; estimate a resistive load and model current limiting or overcurrent shutdown.

## Example values
PDO fixture: 5 V at 1.5 A, 9 V at 2 A, and 12 V at 1.5 A. Source limits: 12 V, 2 A, 18 W. Requested profile: 12 V. Load: 10 Ω. The 12 V profile is advertised and supplies an estimated 1.2 A and 14.4 W.

## Acceptance cases
- The valid 12 V PDO is advertised and selected.
- If source power is limited to 10 W, 9 V and 12 V PDOs are removed; request falls back to 5 V.
- A 7 Ω load exceeds the selected PDO current but remains below its OCP trip threshold; the model reports current limiting and the estimated reduced output voltage.
- A 1 Ω load crosses the OCP threshold; the modeled output is disabled.
- Invalid PDOs, missing CC wiring, and broken output/load wiring block the result.

## Boundaries and safety
This educational policy estimator does not implement USB-PD signaling, cable/e-marker behavior, timing, thermal protection, actual output-stage dynamics, standards compliance, or hardware qualification. It is not a real USB power source design.
