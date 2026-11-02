# Texas Instruments SN74HC74N evidence review

Review state: candidate; not verified
Evidence checked: 2026-11-03

## Primary manufacturer evidence

- [SN74HC74N orderable product page](https://www.ti.com/product/SN74HC74/part-details/SN74HC74N)
- [SNx4HC74 datasheet, revision F](https://www.ti.com/lit/ds/symlink/sn74hc74.pdf)

TI identifies SN74HC74N as an active, catalog-rated dual positive-edge D flip-flop with asynchronous preset and clear. The N package is PDIP-14, with a nominal body size of 19.30 mm × 6.40 mm. Recommended supply is 2 V to 6 V and operating temperature is −40 °C to +85 °C.

The datasheet identifies this package pin map:

| Pin | Signal | Logical electrical type |
|---:|---|---|
| 1 | 1CLR | input |
| 2 | 1D | input |
| 3 | 1CLK | input |
| 4 | 1PRE | input |
| 5 | 1Q | output |
| 6 | 1QBAR | output |
| 7 | GND | power-in |
| 8 | 2QBAR | output |
| 9 | 2Q | output |
| 10 | 2PRE | input |
| 11 | 2CLK | input |
| 12 | 2D | input |
| 13 | 2CLR | input |
| 14 | VCC | power-in |

The electrical classifications are engineering interpretations from pin function; they are not quoted TI interface-type declarations.

## Datasheet checksum

The official TI PDF was downloaded on 2026-11-03 and its exact file bytes were hashed locally with SHA-256. The 2,256,700-byte PDF checksum is `a4043d37d693a2997900a0542dd226b9b61285794f3c1a541adb99cc7dcb1ae2`.

## Package and model limits

The proposed footprint uses standard 2.54 mm lead pitch and 7.62 mm row spacing for an educational PDIP-14 view. Pad diameter and drill are application-selected CC0 defaults, not TI land-pattern specifications. Breadboard fit and the footprint still need physical review.

The record maps the part to the simulator's generic ideal positive-edge D flip-flop event mode only. It does not represent TI-specific logic thresholds, timing, output drive, power, temperature behavior, or full analog characteristics. The simulator should state those limits wherever this part is used.

## Verification still required

- Independently verify the symbol and pin-to-pad map against a physical SN74HC74N.
- Confirm package and breadboard fit with physical hardware.
- Validate the generic event-mode mapping against part-specific behavior or retain the explicit model limitation.
- Obtain a named independent human reviewer and review date.

This record remains a candidate and does not count toward the 1,000 verified-part target.
