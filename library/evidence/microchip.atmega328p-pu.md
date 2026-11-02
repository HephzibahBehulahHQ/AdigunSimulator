# Microchip ATmega328P-PU evidence review

Review state: candidate; not verified  
Evidence checked: 2026-11-02

## Primary manufacturer evidence

- [Microchip ATmega328P product page](https://www.microchip.com/en-us/product/ATMEGA328P)
- [ATmega328P datasheet, 7810D-AVR-01/15](https://ww1.microchip.com/downloads/en/devicedoc/atmel-7810-automotive-microcontrollers-atmega328p_datasheet.pdf)
- [ATmega48A/PA/88A/PA/168A/PA/328/P datasheet, DS40002061A](https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega48A-PA-88A-PA-168A-PA-328-P-DS-DS40002061A.pdf), package drawing 28P3
- [Datasheet checksum capture](datasheet-checksums-2026-11-02.md)

Microchip lists the exact ATMEGA328P-PU as available to order in 28-pin SPDIP with a −40 °C to +85 °C range. The datasheet identifies the 28-pin PDIP pin functions. The ledger records the primary port names and selected alternate functions; GPIO electrical types are classified as bidirectional.

The datasheet specifies a 2.7 V to 5.5 V supply range for the ATmega328P and gives speed limits that depend on supply voltage. The checksum was computed from the official PDF download on 2026-11-02 (8,585,103 bytes); see the checksum capture file.

## Package asset

`library/assets/footprints/microchip.atmega328p-pu/footprint.json` maps all 28 pads to the package numbering. The 28P3 drawing gives a 2.54 mm typical lead pitch, 7.62 mm row spacing, and body limits of 34.544–34.798 mm by 7.112–7.493 mm. The 1.8 mm circular pad and 0.8 mm drill are explicit AdigunSimulator educational defaults, not Microchip recommendations. The asset is CC0 and remains a candidate pending physical fit review, fabrication-rule checks, and independent technical review.

## Verification still required

- Independently inspect the generated PDIP-28 footprint against the package drawing and a physical ATMEGA328P-PU; symbol artwork generated from the pin map is generic, not Microchip artwork.
- Obtain and license a processor/firmware model, validate representative programs, or keep firmware behavior explicitly unmodeled.
- Complete power, clock, and reset use notes, warnings, alternatives, and independent technical review.

The record remains a candidate and is excluded from the verified-part count.

