# Component bank sourcing

The inventory separates placeable definitions, PLC instructions, taxonomy types, and manufacturer ledger records. Generate both public exports with `node scripts/export-component-inventory.mjs` and validate the ledger with `node scripts/validate-part-ledger.mjs`.

The baseline audit recorded 364 placeable definitions, including 25 ladder instructions, 565 taxonomy types across 15 categories, and 18 manufacturer records. Two were in review and none were verified. The first sourcing batch adds Vishay TSOP38438 as a candidate.

The sourcing target is 11,400 distinct orderable manufacturer entries across the twenty families in the component-bank directive. The ledger separately tracks its existing 1,000 verified-record target. An authored symbol, educational footprint, or example mapping is evidence for the corresponding view. Count independently approved parts and validated simulation models separately as those checks finish.

Continue in source-backed batches. Attach exact pin and package evidence, retain the existing verification gates, and validate native placement and analysis before reporting an entry ready for those uses.

## Sourcing coverage after the Microchip PDIP EEPROM batch

The ledger contains 12,015 manufacturer records. It has 12,013 candidates, two in review and zero independently verified parts. 1,606 records have symbol assets and 1,586 have footprint assets. Asset counts alone do not establish native placement or validated simulation.

| Directive family | Target | Ledger records |
| --- | ---: | ---: |
| Resistors and resistive components | 1,200 | 1,336 |
| Capacitors | 1,200 | 9,072 |
| Inductors and magnetic filters | 600 | 632 |
| Transformers | 200 | 201 |
| Diodes | 600 | 664 |
| Bipolar transistors | 600 | 80 |
| Field-effect transistors | 800 | 4 |
| Other power switching devices | 300 | 0 |
| Analog and timing ICs | 800 | 3 |
| Power-management ICs | 700 | 1 |
| Digital logic ICs | 800 | 9 |
| Memory | 400 | 4 |
| Microcontrollers and programmable devices | 500 | 2 |
| Interface and communication ICs | 400 | 0 |
| Sensors and measurement ICs | 500 | 2 |
| Optoelectronics and isolation | 300 | 1 |
| Displays and user-output devices | 250 | 0 |
| Connectors and interconnects | 500 | 4 |
| Switches and electromechanical devices | 400 | 0 |
| Protection and related devices | 350 | 0 |
| Total | 11,400 | 12,015 |

The family targets cover 3,910 current records when each family is capped at its target. The other families need 7,490 additional records to meet their individual targets. Continue sourcing underrepresented families and validating native mappings. Prioritize official selection tables that identify exact order codes and include land patterns and electrical limits.
