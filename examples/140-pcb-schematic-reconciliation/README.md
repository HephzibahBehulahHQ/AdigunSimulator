# PCB to schematic reconciliation

## Goal

Demonstrate two proposed board edits that differ from the schematic snapshot: an R1 footprint change and a D1 cathode net change. Each appears as a reconciliation item requiring an explicit choice.

## Run

Open the example and use **PCB → Export PCB files**. Export is blocked while either conflict has no recorded choice. The reconciliation report identifies the schematic source, current PCB value, proposed PCB value, and required choice.

## Acceptance

Automated coverage confirms that both conflicts appear, neither review nor choice recording mutates the native project, unresolved conflicts block export, and even recorded choices are not silently applied.

## Limits

This example demonstrates conflict detection and choice recording. It does not perform a merge or source edit. Any decision must be applied separately, then electrical analysis and PCB DRC must be rerun before export.
