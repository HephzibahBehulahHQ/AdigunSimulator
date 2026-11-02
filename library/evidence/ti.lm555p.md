# Texas Instruments LM555P evidence review

Review state: candidate; not verified  
Evidence checked: 2026-11-02

## Primary manufacturer evidence

- [TI LM555 product page](https://www.ti.com/product/LM555)
- [LM555 Timer datasheet, revision D](https://www.ti.com/lit/ds/symlink/lm555.pdf)

TI lists the LM555 as active and provides an 8-pin PDIP package. The datasheet assigns these functions:

The canonical PDF was downloaded from the TI URL above on 2026-11-02 (1,221,961 bytes). Its SHA-256 is `0bb44c3df8e5254bd887333faf4303a86722e1e1c4c7c2f038200ff8f540d99d`.

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

The pin types describe intended circuit roles; they are not a substitute for a validated electrical model. The package listing does not provide a footprint asset or license for redistribution.

## Verification still required

- Record a reproducible checksum for the canonical datasheet bytes.
- Add and license a symbol asset and PDIP-8 footprint geometry; verify every pin-to-pad mapping.
- Add complete ratings, breadboard limits, warnings, alternate-part notes, and four-locale metadata.
- Import and validate a licensed device model against fixtures or maintain the explicit not-modelled limitation.
- Obtain an independent named human review and date.

Until then this part stays a candidate and is excluded from the verified-part count.

