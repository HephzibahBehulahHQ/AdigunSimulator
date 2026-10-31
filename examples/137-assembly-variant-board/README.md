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

## Limits

Variant filtering is a BOM preparation aid. It does not prove that a changed assembly variant passes electrical simulation, alternate-part qualification, sourcing, placement, or manufacturer assembly checks. Verify each intended build independently.
