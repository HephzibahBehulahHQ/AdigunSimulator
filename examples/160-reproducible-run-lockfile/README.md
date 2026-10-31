# Example 160 — Reproducible run lockfile

## What is locked
The checked-in JSON lockfile records the project ID, engine version, analytical mode, RC model selection/version, and each component reference, library ID, and value.

## Run and verify
Open the project, choose **Simulation → Verify Run Lock**, and confirm the expected `first-order-rc-step-v1` model. Change a component value and verify the lock check reports drift.

## Boundary
This lock helps detect accidental project/model-selection changes. It is not a cryptographic signature, a supply-chain attestation, or proof that physical parts match the schematic.
