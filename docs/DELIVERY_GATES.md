# Delivery gates and scope controls

## Current release boundary

The current application is a local-first static workspace. It stores projects in the browser and supports native import/export. It does not create accounts, upload projects, call an AI model, collect telemetry, or connect to a manufacturer.

Authentication is intentionally out of scope until product ownership confirms an identity provider, roles, retained data, deletion policy, privacy notice, deployment topology, incident contact, and budget. Adigun BOT remains visibly unavailable until a grounded, auditable service is approved and tested.

## Component evidence gate

A component may be listed as a candidate or in review, but it is counted as verified only when its ledger record has all of the following:

- An authoritative HTTPS datasheet source and a 64-character hexadecimal SHA-256 checksum for the reviewed document bytes.
- Exact manufacturer part number, lifecycle and package.
- Audited symbol-to-pin and footprint-to-pad maps with matching pin keys and unique pad assignments.
- A declared simulation-model status and licence/source record.
- A named reviewer and a valid ISO review date.

The 1,000-part target is measured from verified records only; candidate records are never presented as verified.

## Example release gate

Each catalogue entry is planned until its registry entry includes a native project file, stable test identifier, automated acceptance evidence, stated model/engine version, result record, BOM evidence where applicable, and a proportionate safety note. A passing LED or divider calculation is not evidence for a mains, RF, medical, thermal, manufacturing, or regulatory result.

## Simulation and layout gate

Only an engine that produced the displayed result may be named. The current analytical engine supports the ideal pushbutton LED circuit with pull-down, the documented LED current-limiter, unloaded two-resistor voltage-divider, and linear resistor networks with ideal DC voltage/current sources and a shared ground reference; ideal first-order RC charging from zero initial voltage; ideal first-order RL current rise from zero initial current; the selectable SPDT RC charge/discharge model; and the ideal first-order RC low-pass and high-pass plus RL low-pass sinusoidal steady-state responses at 0.1×, 1×, and 10× cutoff. A separate worker-isolated linear small-signal AC MNA analysis sweeps arbitrary passive RLC networks using ideal AC voltage sources, resistors, capacitors, inductors, and one ground reference; it exposes the selected output net, logarithmic frequency points, peak-phasor voltage magnitude/phase, solver residual, settings, model IDs, and convergence status. It is bounded to 64 components, 48 non-reference nets, 401 frequency points, and an 8-million dimension-cubed work estimate; ideal source/component models only, no RMS conversion or power output. RC discharge assumes an initial capacitor voltage equal to the source voltage and is evaluated as a separate run. General SPICE, nonlinear or unrestricted AC analysis, arbitrary multi-element reactive transient behavior, digital/mixed-signal engine simulation, and thermal analysis remain unavailable.

The supported circuit-analysis dispatcher runs in a module worker. Users can cancel analyses; jobs stop after 10 seconds, and serialized project input is capped at 4 MiB. This is a bounded payload guard, not a hard browser heap limit. The release-candidate test harness remains a separate asynchronous UI workflow; worker isolation does not expand the supported circuit models.

Projects that include stored PCB board, footprint, pad, and route data support interactive single-layer F.Cu routing between pads on the same declared net. Routing enforces the stored board bounds, net-class minimum trace width, configured copper clearance, existing foreign-net copper, pad clearances, and declared keep-outs; incomplete PCB mappings do not enable the tool. The existing PCB checks and Gerber/Excellon/BOM exporters cover a bounded educational rule subset. They are not a standards-complete DRC, exhaustive manufacturing rule check, or manufacturing release. Autorouting, multiple copper layers, 3D verification, impedance and high-speed constraints, and manufacturer-specific production checks remain unavailable.

The workspace shares component identity, nets and per-view positions. A view mapping is withheld rather than fabricated when a verified representation is absent. Operators must review physical breadboard rows, component orientation, wiring, power limits, measurements, PCB exports and applicable standards before energising or manufacturing any hardware.

## Required quality evidence before a production release

1. Automated unit, schema, serialization, localization and UI-contract tests pass in continuous integration.
2. Representative browser tests cover keyboard operation, mouse/touch layout edits, import/export, local recovery, four-language overflow, accessibility and responsive layouts.
3. Every released example has its result matrix and the exact engine/model/library-lock evidence recorded.
4. Independent electrical review signs off on any part promoted to verified and any new simulator model.
5. Security/privacy review is complete before enabling authentication, cloud sync, AI, telemetry or external data sources.
6. Deployment, rollback and monitoring plans are approved before publishing a public service.

No automated test suite justifies a claim of zero defects. Release notes must state the actual test evidence, known limitations and unresolved risk.

