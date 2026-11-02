# Example 186 — Pin-incompatible substitution

## Objective
Preview substituting an 8-pin LM386 amplifier library part for the 8-pin NE555 timer in a valid astable LED circuit.

## Run and expected result
Both parts have eight pins, but their pin names and functions do not match. All eight used NE555 pins are reported as unmapped in the LM386 candidate. The substitution is blocked, the preview is canceled, and the original project snapshot remains byte-for-byte unchanged.

## Limits
Pin count alone does not establish electrical, package, or footprint compatibility. This is a safe compatibility-preview example and does not authorize a real-world substitution.

## Direct circuit analysis result

The 5 V NE555 astable project estimates a 2.079 s period at 0.481 Hz and 66.7% duty under the bounded ideal timing model. The pin-incompatible substitution preview is separate from that circuit calculation.
