# Texas Instruments LM7805CT/NOPB evidence review

Review state: candidate; not verified  
Evidence checked: 2026-11-02

## Primary manufacturer evidence

- [LM7805CT/NOPB orderable page](https://www.ti.com/product/LM7800/part-details/LM7805CT/NOPB)
- [LM340/LM7805 family datasheet, revision L](https://www.ti.com/lit/ds/symlink/lm7800.pdf)

The TI orderable page identifies the exact order code. The family datasheet's three-pin TO-220 pin-function table maps pin 1 to INPUT, pin 2 to GND, and pin 3 to OUTPUT. It is a fixed 5 V regulator, but this entry is not a validated device simulation.

## Verification still required

- Download the canonical datasheet and record a reproducible SHA-256 checksum.
- Add symbol and TO-220 footprint assets with source and license evidence; verify the physical pad numbering and geometry.
- Complete safe operating limits, warnings, breadboard notes, alternate references, and four-locale metadata.
- Import and validate a licensed TI model or keep the explicit not-modelled limitation.
- Obtain a named independent human review and review date.

The record remains a candidate and is excluded from the verified-part count.

