# Example 193 — PCB trace-width advisor

## Objective
Estimate copper trace width from current, copper thickness, layer type, and a requested temperature rise.

## Method and expected result
This example solves the legacy empirical relationship `I = k × ΔT^0.44 × A^0.725`, with cross-sectional area in square mils, `k = 0.048` for an external layer and `k = 0.024` for an internal layer. At 2 A, 35 µm copper, and 10 °C rise, the estimates are about 0.781 mm external and 2.033 mm internal.

## Standards and limits
The equation is an educational legacy estimate, not an IPC-2152 chart analysis or a compliance decision. IPC's own design guidance describes current-carrying capacity as dependent on broader board construction and thermal conditions. Verify stackup, planes, vias, ambient, duty cycle, voltage drop, copper tolerances, fabrication rules, and safety requirements using the applicable standard and board-specific analysis.

References: [IPC design process flow](https://www.electronics.org/media/10284/download) · [IPC standards revision table](https://www.ipc.org/ipc-document-revision-table)
