# Example 165 — Star-delta starter concept

## Objective
Check that a bounded logical starter moves from star to a both-off transition interval and then to delta, with mutually exclusive output commands.

## Run and expected result
The eight timestamped events should produce modes: star, star, transition, transition, delta, delta, stopped, star. The transition interval begins at 1000 ms and ends at 1100 ms. Star and delta outputs must never be active together.

## Scope
This is a deterministic sequence model, not a motor starter design. It does not model contactors, coil or arc behavior, motor current/torque, transient current, overload protection, wiring, interlock hardware, or machine-safety compliance. The electrical solver reports this logical fixture as unsupported.
