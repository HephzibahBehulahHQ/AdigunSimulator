# Example 164 — PLC conveyor counter

## Objective
Count rising edges from a synthetic photoeye signal and stop the logical conveyor command at a configured target.

## Run and expected result
Run the deterministic analysis with a target of 3. Ten Boolean samples contain repeated high levels that must count once per rising edge. The counter reaches 3 at event 7, latches the motor command off, and ignores any later edge; final count is 3.

## Scope
Logic-only PLC concept. No sensor circuit, motor, conveyor inertia, braking, jam detection, guards, field wiring, or machine-safety validation is modeled. The electrical solver correctly reports this PLC-only document as unsupported.
