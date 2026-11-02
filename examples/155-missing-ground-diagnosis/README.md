# Example 155 — Missing-ground diagnosis

## Circuit condition
The example removes the signal-ground reference component while leaving the circuit return net present. Project validation can still load the document, but reports the `NO_REFERENCE` warning. The preflight blocks DC analysis and explains that a net label alone is not a physical reference.

## Direct divider result

The project’s 9 V, 1 kΩ/2 kΩ resistor network has a nominal 3 mA branch current and 6 V divider output in the bounded DC calculation. The missing-reference diagnostic shows why a named ground reference remains necessary for circuit interpretation.

## Run and verify
Select **Run**. Confirm the `MISSING_GROUND_REFERENCE` block and `NO_REFERENCE` rule ID, then review the circuit's return-path intent before adding an explicit reference.

## Safety scope
Signal ground is a circuit reference concept; it is not automatically protective earth or chassis bonding. This check does not determine isolation, protective-earth connections, or installation safety.
