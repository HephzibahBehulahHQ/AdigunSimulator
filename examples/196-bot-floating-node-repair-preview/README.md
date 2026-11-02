# Example 196 — Adigun BOT floating-node repair preview

## Objective
Diagnose the fixture's capacitor-isolated DC node and propose a validated, reviewable bleed-resistor change without editing the open project.

## Preview and confirmation
The existing diagnosis identifies net FLOATING at C1. The BOT proposes adding a 1 MΩ resistor from that node to GND, constructs a separate candidate project, and runs project validation on that candidate. Running the example creates only a preview. Applying it is gated by a separate explicit confirmation; canceling leaves the original project untouched. A stale preview is rejected if the project changes before confirmation.

## Limits
The 1 MΩ value is illustrative, not an engineering recommendation. A bleed/bias path can load a signal or alter circuit behavior. Review the design intent, signal loading, component ratings and physical schematic before accepting any change. The local rule preview is not a substitute for electrical engineering review.

## Direct divider analysis result

The base 9 V, 1 kΩ/2 kΩ divider has 3 mA current and 6 V unloaded output in the bounded DC analyzer. The BOT repair preview proposes edits and does not apply or validate them as physical repairs.
