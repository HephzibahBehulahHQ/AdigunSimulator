# Single-sided PCB manufacturing export pack

## Goal

Run the bounded PCB checks for a simple LED board and create a consistent review pack: single-layer copper Gerber, board-outline Gerber, Excellon drill, bill of materials, placement CSV, printable assembly overview PDF, export manifest and SHA-256 checksum list.

## Run

Open the example, select **PCB → Export PCB files**, and review the downloaded files together. The application blocks the pack when its supported PCB checks fail.

## Acceptance

Automated coverage verifies the native project and supported analysis, all eight filenames, BOM and placement references, PDF structure, manifest values, every SHA-256 digest, and rejection of a project with a broken route mapping.

## Limits

This bounded exporter supports the project’s single F.Cu educational format. A passing result is not a general Gerber/Excellon validation, production DRC, manufacturer rule check, assembly drawing approval, or guarantee of fabrication. Independently verify stackup, real footprints, drill tooling, solder mask/paste, board outline, component sourcing and manufacturer requirements before ordering.
