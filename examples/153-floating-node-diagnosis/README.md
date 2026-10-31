# Example 153 — Floating-node diagnosis

## Circuit condition
A 100 nF capacitor connects net FLOATING to ground. At DC, the capacitor is open, leaving the FLOATING node without a DC bias path. The diagnostic reports the net and component to inspect, then directs the user to consider an appropriate bias or bleed path only after checking loading and design intent.

## Behavior
Run the diagnostic to get a blocked DC result with error code `FLOATING_DC_NODE`. The workspace selects the capacitor and net in the schematic view to focus inspection. No project edits are made automatically.

## Limits
This is a focused educational DC check for the declared fixture. It does not provide general-purpose ERC, AC analysis, or SPICE.

## Run and verify
Select **Run**. Automated acceptance is in `tests/core.test.mjs` under “catalogue floating-node diagnosis identifies the object to inspect”.
