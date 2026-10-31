# Example 184 — Unsupported breadboard package

## Objective
Show how a board-only conceptual 4 × 4 BGA behaves when the active view is a breadboard.

## Run and expected result
The library declares the package unavailable in the breadboard view. The view projection creates one reconciliation item and filters the component out of rendered breadboard placements. The schematic and illustrative PCB views remain available for this capability example. The PCB fixture is explicitly not fabrication-qualified and makes no manufacturing claim.

## Coordinate and package limits
The project schema requires integer coordinates for every view. The stored breadboard coordinate is dormant metadata only: it is not rendered or presented as a physical package placement. This generic BGA is not a manufacturer-specific part, and the escape layout is conceptual.
