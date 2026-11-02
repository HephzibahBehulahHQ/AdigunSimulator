# Example 153 — Floating-node diagnosis

## Circuit condition
A 100 nF capacitor connects net FLOATING to ground. At DC, the capacitor is open, leaving the FLOATING node without a DC bias path. The diagnostic reports the net and component to inspect, then directs the user to consider an appropriate bias or bleed path only after checking loading and design intent.

## Behavior
Run the diagnostic to get a blocked DC result with error code `FLOATING_DC_NODE`. The workspace selects the capacitor and net in the schematic view to focus inspection. No project edits are made automatically.

## Limits
This is a focused educational DC check for the declared fixture. It does not provide general-purpose ERC, AC analysis, or SPICE.

## Direct divider result

The base 9 V, 1 kΩ/2 kΩ divider has 3 mA current and 6 V unloaded output in the bounded DC analyzer. The deliberately floating capacitor is handled separately by the floating-node diagnostic.

## Run and verify
Select **Run**. Automated acceptance is in `tests/core.test.mjs` under “catalogue floating-node diagnosis identifies the object to inspect”.
