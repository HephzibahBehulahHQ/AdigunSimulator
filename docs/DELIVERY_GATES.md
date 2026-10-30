# Delivery gates and scope controls

## Current release boundary

The current application is a local-first static workspace. It stores projects in the browser and supports native import/export. It does not create accounts, upload projects, call an AI model, collect telemetry, or connect to a manufacturer.

Authentication is intentionally out of scope until product ownership confirms an identity provider, roles, retained data, deletion policy, privacy notice, deployment topology, incident contact, and budget. Adigun BOT remains visibly unavailable until a grounded, auditable service is approved and tested.

## Component evidence gate

A component may be listed as a candidate or in review, but it is counted as verified only when its ledger record has all of the following:

- An authoritative source and SHA-256 checksum for the reviewed datasheet.
- Exact manufacturer part number, lifecycle and package.
- Audited symbol-to-pin and footprint-to-pad mappings.
- A declared simulation-model status and licence/source record.
- Reviewer identity and review date.

The 1,000-part target is measured from verified records only; candidate records are never presented as verified.

## Example release gate

Each catalogue entry is planned until its registry entry includes a native project file, stable test identifier, automated acceptance evidence, stated model/engine version, result record, BOM evidence where applicable, and a proportionate safety note. A passing LED or divider calculation is not evidence for a mains, RF, medical, thermal, manufacturing, or regulatory result.

## Simulation and layout gate

Only an engine that produced the displayed result may be named. The current analytical engine is limited to the documented LED current-limiter and unloaded two-resistor voltage-divider topologies. General SPICE, digital/mixed-signal simulation, thermal analysis, PCB autorouting, DRC, Gerber output and manufacturing checks remain unavailable.

The workspace shares component identity, nets and per-view positions. A view mapping is withheld rather than fabricated when a verified representation is absent. Operators must review physical breadboard rows, component orientation, wiring, power limits, measurements and applicable standards before energising any hardware.

## Required quality evidence before a production release

1. Automated unit, schema, serialization, localization and UI-contract tests pass in continuous integration.
2. Representative browser tests cover keyboard operation, mouse/touch layout edits, import/export, local recovery, four-language overflow, accessibility and responsive layouts.
3. Every released example has its result matrix and the exact engine/model/library-lock evidence recorded.
4. Independent electrical review signs off on any part promoted to verified and any new simulator model.
5. Security/privacy review is complete before enabling authentication, cloud sync, AI, telemetry or external data sources.
6. Deployment, rollback and monitoring plans are approved before publishing a public service.

No automated test suite justifies a claim of zero defects. Release notes must state the actual test evidence, known limitations and unresolved risk.

