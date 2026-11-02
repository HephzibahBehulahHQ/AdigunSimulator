# PCB to schematic reconciliation

## Goal

Demonstrate two proposed board edits that differ from the schematic snapshot: an R1 footprint change and a D1 cathode net change. Each appears as a reconciliation item requiring an explicit choice.

## Run

Open the example and use **PCB → Export PCB files**. Export is blocked while either conflict has no recorded choice. The reconciliation report identifies the schematic source, current PCB value, proposed PCB value, and required choice.

## Acceptance

Automated coverage confirms that both conflicts appear, neither review nor choice recording mutates the native project, unresolved conflicts block export, and even recorded choices are not silently applied.

## Direct analysis result

The base 5 V, 330 Ω, 2 V LED circuit produces an ideal estimated current of 9.09 mA and resistor dissipation of 27.27 mW in the bounded DC analyzer. The PCB-to-schematic reconciliation report is a separate consistency check and does not validate manufacturing suitability.

## Limits

This example demonstrates conflict detection and choice recording. It does not perform a merge or source edit. Any decision must be applied separately, then electrical analysis and PCB DRC must be rerun before export.
