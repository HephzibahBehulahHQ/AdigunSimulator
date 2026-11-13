# onsemi 2N3904BU evidence review

Review state: candidate; not verified  
Evidence checked: 2026-11-02

## Primary manufacturer evidence

- [onsemi 2N3904 datasheet](https://www.onsemi.com/download/data-sheet/pdf/2n3904-d.pdf)

The datasheet's TO-92 drawing and pin-function listing identify pin 1 as emitter, pin 2 as base, and pin 3 as collector. Those lead functions support the symbol map in the ledger; they do not establish a particular footprint geometry or license for an EDA asset.

The official onsemi PDF was downloaded over HTTPS on 2026-11-13 with content type application/pdf and a `%PDF-` signature. The downloaded file contained 324,812 bytes; SHA-256: `e2b2147b6e9608cc592e7178204f50ca65aaf5fe0dbcb5f30ed2d737ab7a4214`. The PDF bytes are not included in the repository.

## Verification still required

- Confirm exact orderable identity and lifecycle for the `BU` suffix from an authoritative onsemi order source.
- Add licensed source-backed symbol and footprint assets, then independently validate pad numbering.
- Add complete ratings, warnings, breadboard limits, four-locale descriptions, and a named human review.
- Import and validate a licensed model, or preserve the explicit not-modelled limitation.

The record remains a candidate and is excluded from the verified-part count.

