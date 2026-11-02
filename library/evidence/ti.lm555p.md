# Texas Instruments LM555P evidence review

Review state: candidate; not verified  
Evidence checked: 2026-11-02

## Primary manufacturer evidence

- [TI LM555 product page](https://www.ti.com/product/LM555)
- [LM555 Timer datasheet, revision D](https://www.ti.com/lit/ds/symlink/lm555.pdf)

TI lists the LM555 as active and provides an 8-pin PDIP package. The datasheet assigns these functions:

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

The pin types describe intended circuit roles; they are not a substitute for a validated electrical model. The package listing does not provide a footprint asset or license for redistribution.

## Verification still required

- Record a reproducible checksum for the canonical datasheet bytes.
- Add and license a symbol asset and PDIP-8 footprint geometry; verify every pin-to-pad mapping.
- Add complete ratings, breadboard limits, warnings, alternate-part notes, and four-locale metadata.
- Import and validate a licensed device model against fixtures or maintain the explicit not-modelled limitation.
- Obtain an independent named human review and date.

Until then this part stays a candidate and is excluded from the verified-part count.

