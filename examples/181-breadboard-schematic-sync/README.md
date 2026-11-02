# Example 181 — Breadboard-to-schematic sync

## Objective
Verify that a valid LED circuit edit in the canonical breadboard project graph is reflected in the schematic structural projection with the same component instance IDs, net IDs, and pin endpoints.

## Run and expected result
The test removes the resistor-to-LED connection, reconnects it as a breadboard wiring edit, and compares the resulting breadboard and schematic projections. Component IDs remain unchanged, the new shared connection receives one canonical net ID, the unrelated VCC/GND net IDs remain unchanged, and both projections are structurally identical.

## Direct circuit result
The unchanged 5 V, 330 Ω, 2 V LED circuit has an ideal estimated current of 9.09 mA and resistor dissipation of 27.27 mW in the bounded DC analyzer. The structural sync test separately checks graph consistency.

## Scope
This checks shared project structure only. Breadboard and schematic placement remain separate view data. It does not claim geometric placement or routing synchronization.
