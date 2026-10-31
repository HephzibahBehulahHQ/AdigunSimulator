# Example 168 — Door guard interlock concept

## Objective
Verify that opening a guard drops and latches off the logical load command. Closing the guard and resetting are not enough to restart it; a separate start action is required.

## Run and expected result
The seven actions start the load, open the guard, reject reset while open, close the guard, reset without energizing, explicitly start, and stop. The load remains off whenever the guard is open.

## Scope
This is an educational logic sequence, not a guard-locking device or safety-rated interlock design. No switch diagnostics, fault tolerance, physical actuator, wiring, risk assessment, or compliance validation is modeled.
