# Texas Instruments LM555CN/NOPB evidence review

Internal record ID: `ti.lm555p` (retained for project compatibility)

Review state: candidate; independent technical review not recorded

Manufacturer identity/package checked: 2026-11-12

## Primary manufacturer evidence

- [TI LM555CN/NOPB part page](https://www.ti.com/product/LM555/part-details/LM555CN/NOPB)
- [LM555 Timer datasheet, revision D](https://www.ti.com/lit/ds/symlink/lm555.pdf)

TI lists the exact orderable part LM555CN/NOPB as Active, Production, PDIP (P), 8 pins, with an operating-temperature range of 0 °C to 70 °C. The datasheet assigns these functions:

The canonical PDF was downloaded from TI on 2026-11-02 (1,221,961 bytes). Its recorded SHA-256 is `0bb44c3df8e5254bd887333faf4303a86722e1e1c4c7c2f038200ff8f540d99d`, also listed in `datasheet-checksums-2026-11-02.md`.

TI lists an operating supply range of 4.5 V to 16 V and an operating temperature range of 0 °C to 70 °C. The breadboard compatibility entry is a mechanical fit assessment based on the PDIP package; verify trench clearance and do not use it as an electrical safety rating.

| Pin | Function | Logical electrical type |
|---:|---|---|
| 1 | GND | power-in |
| 2 | TRIG | input |
| 3 | OUT | output |
| 4 | RESET | input |
| 5 | CONT | analog |
| 6 | THRES | input |
| 7 | DISCH | open-collector |
| 8 | VCC | power-in |

The pin types describe intended circuit roles; they are not a substitute for a validated electrical model. The TI package drawing specifies the P (R-PDIP-T8) outline; the generated CC0 asset is our educational land-pattern proposal, not TI artwork or a manufacturer recommendation.

## Package asset

`library/assets/footprints/ti.lm555p/footprint.json` maps all eight package pin numbers to pads. Body limits are transcribed from TI drawing 4040082/E; 2.54 mm lead pitch and 7.62 mm row spacing follow the package drawing convention. The 1.8 mm pad and 0.8 mm drill are application-selected educational defaults, not TI recommendations. The asset remains a candidate pending independent physical-fit and fabrication review.

## Verification still required

- Independently inspect the generated PDIP-8 geometry and every pin-to-pad mapping against the physical part and TI package drawing; the generated symbol artwork is a generic pin map.
- Review electrical limits and the educational footprint defaults for the intended use; the app still has no validated LM555-specific model.
- Record the independent reviewer's name and review date after that review occurs.

The evidence validator reports no structural evidence blockers beyond the missing reviewer identity and date. This is a review-ready candidate, not a completed human review; it remains excluded from the verified-part count.

