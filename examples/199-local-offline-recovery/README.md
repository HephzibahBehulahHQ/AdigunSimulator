# Example 199 — Local offline recovery

## Objective
Simulate an unsaved project edit, recover it from a local-draft storage mock, and verify that a native-project export remains available if browser storage throws.

## Expected result
The test changes R1 from 330 Ω to 470 Ω without changing the source fixture. A versioned draft is written and parsed back with the edited value. A second storage mock throws on access; the app's manual project serializer still produces a valid importable export with the same edit. The result explicitly instructs users to use File → Export before closing when local recovery storage is unavailable.

## Limits
CI uses an in-memory storage mock. It does not simulate a real browser crash, filesystem failure, quota eviction, or guarantee that a user's browser permits local storage. Keep an exported project copy when recovery matters.

## Direct circuit analysis result

The base 5 V, 330 Ω, 2 V LED circuit has a bounded DC estimate of 9.09 mA and 27.27 mW resistor dissipation. The proposal, language sweep, or offline-recovery scenario is checked separately.
