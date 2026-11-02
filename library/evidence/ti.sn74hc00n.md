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

The electrical pin classifications are engineering interpretations of the signal names and function; they are not quoted TI electrical-interface declarations. Pin numbering is not a substitute for a footprint geometry file.

## Verification still required

- Download the canonical datasheet bytes and record a reproducible SHA-256 digest.
- Add a source-backed symbol asset and PDIP-14 footprint geometry, each with provenance and license evidence; independently check symbol-to-pin and pin-to-pad alignment.
- Establish supported breadboard use and explicit operating limits for that use.
- Either import a licensed TI model and validate it against fixtures, or retain the explicit not-modelled limitation.
- Add required warning/alternate and four-locale metadata, then obtain a named independent human review and date.

Until these items are complete, this part remains a candidate and must not count toward the 1,000 verified-part target.

