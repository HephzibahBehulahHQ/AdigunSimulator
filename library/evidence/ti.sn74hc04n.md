# Texas Instruments SN74HC04N evidence review

Review state: candidate; not verified
Evidence checked: 2026-11-13

## Primary manufacturer evidence

- [SN74HC04N exact orderable part page](https://www.ti.com/product/SN74HC04/part-details/SN74HC04N)
- [SN74HC04 family product page](https://www.ti.com/product/SN74HC04)
- [SNx4HC04 datasheet, revision H](https://www.ti.com/lit/ds/symlink/sn74hc04.pdf)

TI currently lists the exact SN74HC04N orderable as active, with a 14-pin PDIP package; the orderable page showed out of stock when checked. The Rev. H datasheet describes six independent inverters, gives the N-package 14-pin function table, recommends 2 V to 6 V supply, and specifies -40 °C to +85 °C for SN74HC04.

## Datasheet pin map

| Pin | Signal | Logical electrical type |
|---:|---|---|
| 1 | 1A | input |
| 2 | 1Y | output |
| 3 | 2A | input |
| 4 | 2Y | output |
| 5 | 3A | input |
| 6 | 3Y | output |
| 7 | GND | power-in |
| 8 | 4Y | output |
| 9 | 4A | input |
| 10 | 5Y | output |
| 11 | 5A | input |
| 12 | 6Y | output |
| 13 | 6A | input |
| 14 | VCC | power-in |

Electrical types are project interpretations of the datasheet pin functions.

## Asset and simulation limits

The SVG is original generic pin-map artwork dedicated under CC0 1.0. Its labels and pin numbers are machine-linked to the ledger map. An educational candidate footprint is supplied; it is not a TI land pattern. The official TI PDF response was downloaded over HTTPS on 2026-11-13 with content type application/pdf and a `%PDF-` signature. The downloaded file contained 2,153,970 bytes; SHA-256: `a48266c5ce3f22a87a30cd78b0fdb80e99820220534b215a11a9b67a35f41101`. The PDF bytes are not included in the repository. The record remains a candidate and is not counted as verified.

The simulator does not model this exact TI device. Do not present generic inverter behavior as an SN74HC04N electrical simulation. TI says unused inputs must be tied to VCC or GND; unused outputs may be left unconnected.

## Review still required

- Independently compare the symbol pin map with the current datasheet and a physical part.
- Create and review a source-traceable N-package footprint before claiming PCB support.
- Keep manufacturer-specific simulation disabled unless a sourced, licensed, bounded model and expected-result fixtures are added.
- Obtain a named independent reviewer and date before changing verification status.

## Candidate package footprint

The educational footprint uses the TI NFF0014A / N14A (R-PDIP-T14) mechanical drawing and the SN74HC04N orderable page. The TI drawing specifies .100-inch (2.54 mm) lead pitch. The 7.62 mm row spacing follows the project DIP layout convention. Pad diameter (1.8 mm) and drill (0.8 mm) are application-selected CC0 defaults, not TI recommendations. No independent physical fit or board-manufacturing review has been completed; the footprint remains educational-candidate only.

- [TI NFF0014A / N14A mechanical drawing](https://www.ti.com/lit/ml/mpdi093/mpdi093.pdf)
- [TI SN74HC04N orderable page](https://www.ti.com/product/SN74HC04/part-details/SN74HC04N)
