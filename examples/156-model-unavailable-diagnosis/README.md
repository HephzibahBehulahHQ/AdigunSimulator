# Example 156 — Model-unavailable diagnosis

## Fixture
U1 is drawn as a generic ideal op-amp symbol but requests a vendor-specific TL081C macromodel that is not installed. The interface identifies the component as **unavailable, schematic only** and blocks analysis.

## Expected behavior
The model-availability check reports `COMPONENT_MODEL_UNAVAILABLE`, confirms that no analysis was attempted, and asks for a compatible validated model. It must not substitute the generic symbol's ideal behavior as if it were the requested device model.

## Run and verify
Open the example and select **Run**. Confirm the unavailable status and absence of simulated results. Automated acceptance is in `tests/core.test.mjs` under “catalogue unavailable-model fixture is schematic-only and never simulates a fake model”.
