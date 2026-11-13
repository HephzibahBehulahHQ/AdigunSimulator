# Texas Instruments SN74HC02N evidence review

Review state: candidate; not verified
Evidence checked: 2026-11-13

## Primary manufacturer evidence

- [SN74HC02N exact orderable part page](https://www.ti.com/product/SN74HC02/part-details/SN74HC02N)
- [SN74HC02 family product page](https://www.ti.com/product/SN74HC02)
- [SNx4HC02 datasheet, revision G](https://www.ti.com/lit/ds/symlink/sn74hc02.pdf)

TI currently lists the exact SN74HC02N orderable as active, with a 14-pin PDIP package; its orderable page showed out of stock when checked. The Rev. G datasheet describes four independent 2-input NOR gates, gives the N-package 14-pin function table, recommends 2 V to 6 V supply, and specifies -40 °C to +85 °C for SN74HC02.

## Datasheet pin map

| Pin | Signal | Logical electrical type |
|---:|---|---|
| 1 | 1Y | output |
| 2 | 1A | input |
| 3 | 1B | input |
| 4 | 2Y | output |
| 5 | 2A | input |
| 6 | 2B | input |
| 7 | GND | power-in |
| 8 | 3A | input |
| 9 | 3B | input |
| 10 | 3Y | output |
| 11 | 4A | input |
| 12 | 4B | input |
| 13 | 4Y | output |
| 14 | VCC | power-in |

Electrical types are project interpretations of the datasheet pin functions.

## Asset and simulation limits

The SVG is original generic pin-map artwork dedicated under CC0 1.0. Its labels and pin numbers are machine-linked to the ledger map. No physical footprint is supplied yet. The exact PDF bytes were not captured for a checksum. The record remains a candidate and is not counted as verified.

The simulator does not model this exact TI device. Do not present generic NOR behavior as an SN74HC02N electrical simulation.

## Review still required

- Independently compare the symbol pin map with the current datasheet and a physical part.
- Create and review a source-traceable N-package footprint before claiming PCB support.
- Capture the datasheet bytes and SHA-256.
- Keep manufacturer-specific simulation disabled unless a sourced, licensed, bounded model and expected-result fixtures are added.
- Obtain a named independent reviewer and date before changing verification status.

