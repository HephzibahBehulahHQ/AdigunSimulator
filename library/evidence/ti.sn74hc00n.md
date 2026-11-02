# Texas Instruments SN74HC00N evidence review

Review state: candidate; not verified  
Evidence checked: 2026-11-02

## Primary manufacturer evidence

- [SN74HC00N orderable product page](https://www.ti.com/product/SN74HC00/part-details/SN74HC00N)
- [SNx4HC00 datasheet, revision H](https://www.ti.com/lit/ds/symlink/sn74hc00.pdf)

The TI datasheet identifies four independent two-input NAND gates, a 2 V to 6 V operating supply range, a −40 °C to +85 °C operating temperature range, and the SN74HC00N as a 14-pin PDIP. The datasheet pinout gives this pin-number-to-signal map:

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

The electrical pin classifications are engineering interpretations of the signal names and function; they are not quoted TI electrical-interface declarations.

## Package asset

`library/assets/footprints/ti.sn74hc00n/footprint.json` maps all fourteen pin numbers. TI lists the N package as PDIP-14 with a nominal 19.30 mm × 6.40 mm body. The 2.54 mm lead pitch and 7.62 mm row spacing are the selected DIP convention used by this educational candidate. Its CC0 1.8 mm pad and 0.8 mm drill are application-selected defaults, not TI land-pattern recommendations.

## Verification still required

- Independently check the generated symbol and PDIP-14 pin-to-pad map against the exact physical part.
- Confirm breadboard center-trench fit with a physical part and board.
- Either import a licensed TI model and validate it against fixtures, or retain the explicit not-modelled limitation.
- Obtain a named independent human review and date.

Until these items are complete, this part remains a candidate and must not count toward the 1,000 verified-part target.

