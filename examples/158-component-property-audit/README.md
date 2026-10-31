# Example 158 — Component property audit

## What to try
Select R1 in the inspector. Set its resistance to **220 Ω** and apply the edit. The editor validates the value before recording the change, then the ordinary undo and redo commands restore and reapply it. Try **0 Ω**, **1e15 Ω**, or non-numeric text; the edit is rejected and history is left unchanged.

## Acceptance boundary
The editor permits nominal resistor values from 0.01 Ω through 1 GΩ. This range guard does not check power rating, tolerance, temperature, datasheet suitability, footprint, or PCB routing.

## Run and verify
Open this example and use the component inspector. Automated acceptance checks the accepted/rejected values and verifies validation runs before history capture and property update.
