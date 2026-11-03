# Texas Instruments SN74HC08N evidence review

Review state: candidate; not verified
Evidence checked: 2026-11-03

## Primary manufacturer evidence

- [SN74HC08N exact orderable page](https://www.ti.com/product/SN74HC08/part-details/SN74HC08N)
- [SNx4HC08 datasheet, revision J](https://www.ti.com/lit/ds/symlink/sn74hc08.pdf)

The TI orderable page lists SN74HC08N as ACTIVE, a 14-pin PDIP, and a four-channel two-input AND gate. The page reported out of stock when checked; lifecycle state does not mean inventory is currently available. The datasheet specifies 2 V to 6 V recommended supply and −40 °C to +85 °C operating temperature.

## Pin map and package

| Pin | Signal | Logical electrical type |
|---:|---|---|
| 1 | 1A | input |
| 2 | 1B | input |
| 3 | 1Y | output |
| 4 | 2A | input |
| 5 | 2B | input |
| 6 | 2Y | output |
| 7 | GND | power-in |
| 8 | 3Y | output |
| 9 | 3A | input |
| 10 | 3B | input |
| 11 | 4Y | output |
| 12 | 4A | input |
| 13 | 4B | input |
| 14 | VCC | power-in |

The N-package nominal body is 19.30 mm × 6.40 mm. Electrical types are interpreted from TI pin functions.

## Datasheet checksum and model boundary

The 2,048,028-byte official TI PDF captured on 2026-11-03 has SHA-256 `0d125b415972726a34eb93fbb7ce093909319f4252593fab37a7e77541e363`. The simulator's generic ideal AND event mode does not model TI thresholds, propagation delay, output drive/loading, supply current, or temperature behavior.

The CC0 footprint is an educational 14-pin DIP draft using the published N-package outline and conventional hole spacing. Its pad and drill defaults are not a TI-recommended land pattern; physical fit and manufacturing DRC have not been reviewed.

This candidate does not count toward the 1,000 verified-part target. An independent reviewer must check the datasheet, symbol, pad numbering, physical fit, and model limits before promotion.
