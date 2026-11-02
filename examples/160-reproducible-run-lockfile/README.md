# Example 160 — Reproducible run lockfile

## What is locked
The checked-in JSON lockfile records the project ID, engine version, analytical mode, RC model selection/version, and each component reference, library ID, and value.

## Direct RC step result

The native 5 V, 1 kΩ, 100 µF series RC circuit has a 0.1 s time constant in the bounded first-order step model. The report export or reproducibility lock adds metadata around this analysis; neither broadens the engine into general SPICE.

## Run and verify
Open the project, choose **Simulation → Verify Run Lock**, and confirm the expected `first-order-rc-step-v1` model. Change a component value and verify the lock check reports drift.

## Boundary
This lock helps detect accidental project/model-selection changes. It is not a cryptographic signature, a supply-chain attestation, or proof that physical parts match the schematic.
