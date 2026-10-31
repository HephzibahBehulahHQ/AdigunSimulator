# Example 167 — Emergency-stop latch concept

## Objective
Exercise a logical latch that drops a load command on an E-stop trip, rejects reset while the input remains tripped, and requires a separate start request after reset.

## Run and expected result
The seven actions should enable, trip, reject reset, release, reset, explicitly restart, then stop. Reset action 3 is rejected. Action 5 clears the latch while leaving the load disabled; only action 6 enables it again.

## Scope
Educational state logic only. This is not an emergency-stop circuit or safety relay design. No certified components, architecture, diagnostic coverage, performance level, risk assessment, electrical behavior, or machine-safety compliance is modeled. Do not use this model to implement or validate a real safety function.
