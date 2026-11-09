# Texas Instruments SN74HC14N evidence review

Review state: candidate; not verified
Evidence checked: 2026-11-03

## Primary manufacturer evidence

- [SN74HC14N exact orderable part page](https://www.ti.com/product/SN74HC14/part-details/SN74HC14N)
- [SN74HC14 family product page](https://www.ti.com/product/SN74HC14)
- [SNx4HC14 datasheet, revision L](https://www.ti.com/lit/ds/symlink/sn74hc14.pdf)

TI identifies SN74HC14N as an active PDIP-14 orderable option. The family is a six-channel inverter with Schmitt-trigger inputs. The Rev. L datasheet specifies a recommended supply range of 2 V to 6 V and operating temperature of −40 °C to +85 °C.

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

Electrical types are engineering interpretations of each pin function, rather than TI interface-type declarations.

## Datasheet checksum

The official TI PDF was downloaded on 2026-11-03. Its 2,079,245 bytes hash to SHA-256 `24911ae018ad9bf6f8f069158b8689d0d941e3cde9f48924e2421276ae10e397`. The checksum identifies the captured PDF bytes; it is not a technical review or validation of the symbol, footprint, or simulation model.

## Package, asset, and model limits

The orderable page identifies the N package as 14-pin PDIP. The accompanying educational through-hole footprint follows the project's 14-pin DIP layout convention and uses CC0 application-selected pad and drill defaults. It is not a TI-recommended land pattern, and exact physical fit, board rules, soldering tolerances, and manufacturing constraints have not been independently checked.

The record is intentionally `not-modelled`: the generic digital-gate engine does not reproduce this device's Schmitt thresholds, hysteresis, propagation delay, supply current, output drive, or analog transfer characteristics. Do not present a generic inverter result as simulation of the SN74HC14N.

## Review still required

- Independently compare the 14-pin symbol and pad map with the current datasheet and a physical part.
- Review package geometry and physical breadboard/footprint fit.
- Keep manufacturer-specific simulation disabled unless a sourced, licensed, bounded model and expected-result fixtures are added.
- Obtain a named independent reviewer and date before changing verification status.

This candidate does not count toward the 1,000 verified-part target.
