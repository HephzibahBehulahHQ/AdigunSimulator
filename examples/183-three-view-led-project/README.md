# Example 183 — Three-view LED project

## Objective
Change the LED series resistor once, then inspect the shared project graph in breadboard, schematic, and PCB views. Exercise serialized undo and redo snapshots.

## Run and expected result
The audit changes R1 from 330 Ω to 470 Ω. The same component identity, reference, and net endpoints remain in the shared project graph. Undo restores 330 Ω and redo restores 470 Ω exactly. Breadboard and schematic mappings are available. The generic starter parts have no PCB mappings, so the PCB view must list reconciliation items and place no fabricated footprints.

## Limits
This is a structural editor-state example. It does not verify physical breadboard placement, a standards-complete schematic, PCB geometry, DRC, or manufacturing output.

## Direct circuit analysis result

The base 5 V, 330 Ω, 2 V LED circuit has a bounded DC estimate of 9.09 mA and 27.27 mW resistor dissipation. The three-view edit and history check separately verifies synchronized project identity.
