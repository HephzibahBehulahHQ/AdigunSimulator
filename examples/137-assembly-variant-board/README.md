# LED assembly variant board

## Goal

Create two variant BOMs from one electrically complete single-sided LED PCB project:
- **Basic:** designator D1 is explicitly marked do-not-fit (DNP) and is omitted.
- **Indicator:** D1 is fitted and appears in the BOM.

The normal export pack includes both variant BOMs and adds them to the manifest and SHA-256 checksum listing.

## Run

Open the example and use **PCB → Export PCB files**. Review "BOM-basic.csv" and "BOM-indicator.csv" separately. The base BOM remains available as the complete design inventory.

## Acceptance

Automated coverage verifies both BOMs, confirms D1 is absent only from the DNP variant, confirms R1 remains in both variants, checks the two files enter the export checksum list, and blocks unknown DNP designators.

## Direct analysis result

The base native circuit runs through the bounded DC LED analyzer at 5 V with a 330 Ω resistor and an ideal 2 V LED drop. Its estimated current is 9.09 mA and resistor dissipation is approximately 27.27 mW. This result describes the base circuit; DNP variant BOM generation does not re-run electrical analysis for each assembly variant.

## Limits

Variant filtering is a BOM preparation aid. It does not prove that a changed assembly variant passes electrical simulation, alternate-part qualification, sourcing, placement, or manufacturer assembly checks. Verify each intended build independently.
