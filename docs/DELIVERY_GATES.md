# Delivery gates and scope controls

## Current release boundary

The current application is a local-first static workspace. It stores projects in the browser and supports native import/export. It does not create accounts, upload projects, call an external AI model, collect telemetry, or connect to a manufacturer. Adigun BOT currently provides deterministic local component explanations and live canvas suggestions grounded in native project nets and checked-in library pins.

Authentication is intentionally out of scope until product ownership confirms an identity provider, roles, retained data, deletion policy, privacy notice, deployment topology, incident contact, and budget. The local co-pilot does not require sign-in and does not auto-save; accepted previews modify only the unsaved working copy and can be rolled back with Undo. Any future external AI, account, or cloud service requires separate approval and testing.

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

Only an engine that produced the displayed result may be named. The current analytical engine supports the ideal pushbutton LED circuit with pull-down, the documented LED current-limiter, unloaded two-resistor voltage-divider, and linear resistor networks with ideal DC voltage/current sources and a shared ground reference; ideal first-order RC charging from zero initial voltage; ideal first-order RL current rise from zero initial current; the selectable SPDT RC charge/discharge model; and the ideal first-order RC low-pass and high-pass plus RL low-pass sinusoidal steady-state responses at 0.1×, 1×, and 10× cutoff. A separate worker-isolated linear small-signal AC MNA analysis sweeps arbitrary passive RLC networks using ideal AC voltage sources, resistors, capacitors, inductors, and one ground reference; it exposes the selected output net, logarithmic frequency points, peak-phasor voltage magnitude/phase, solver residual, settings, model IDs, and convergence status. It is bounded to 64 components, 48 non-reference nets, 401 frequency points, and an 8-million dimension-cubed work estimate; ideal source/component models only, no RMS conversion or power output. A separate worker-dispatched digital discrete-event engine models ideal AND, OR, XOR, and NOR gates plus positive-edge D flip-flops using grounded DC sources as digital inputs, explicit Boolean initial states, input transitions, and ideal non-loading logic probes. D flip-flop preset and clear pins must remain inactive-high. It supports atomic simultaneous changes, sorted event execution, 2,000 events, and a 1-second maximum simulated interval; timing is zero-delay. It does not model latches or other sequential elements, asynchronous controls, setup/hold timing, propagation delay, metastability, electrical loading, analog voltages, or mixed-signal bridges. RC discharge assumes an initial capacitor voltage equal to the source voltage and is evaluated as a separate run. General SPICE, nonlinear or unrestricted AC analysis, arbitrary multi-element reactive transient behavior, general mixed-signal simulation, and thermal analysis remain unavailable.

The supported circuit-analysis dispatcher runs in a module worker. Users can cancel analyses; jobs stop after 10 seconds, and serialized project input is capped at 4 MiB. This is a bounded payload guard, not a hard browser heap limit. The release-candidate test harness remains a separate asynchronous UI workflow; worker isolation does not expand the supported circuit models.

Projects that include stored PCB board, footprint, pad, and route data support interactive single-layer F.Cu routing between pads on the same declared net. Routing enforces the stored board bounds, net-class minimum trace width, configured copper clearance, existing foreign-net copper, pad clearances, and declared keep-outs; incomplete PCB mappings do not enable the tool. The existing PCB checks and Gerber/Excellon/BOM exporters cover a bounded educational rule subset. They are not a standards-complete DRC, exhaustive manufacturing rule check, or manufacturing release. Autorouting, multiple copper layers, 3D verification, impedance and high-speed constraints, and manufacturer-specific production checks remain unavailable.

The workspace shares component identity, nets and per-view positions. A view mapping is withheld rather than fabricated when a verified representation is absent. Operators must review physical breadboard rows, component orientation, wiring, power limits, measurements, PCB exports and applicable standards before energising or manufacturing any hardware.

The selectable linear RLC transient analysis uses bounded modified nodal analysis with trapezoidal companion models for ideal DC voltage sources, resistors, capacitors and inductors. Capacitor voltages (bounded to ±1 GV) and inductor currents (bounded to ±1 MA) default to zero and may be overridden by component reference; DC sources step instantaneously. Samples run from the first time step through the stop time, while initial states are reported separately rather than inventing a t=0 node voltage. Runs are limited to 64 components, 48 non-reference nodes, 2,000 steps and 8,000,000 estimated solve operations. It reports the sampled output-net voltage and normalized linear-system residual. ESR, parasitics, non-linear devices, source slew, thermal behavior and impulsive-current detail are not modeled; this is not general-purpose SPICE. Automated RC, RL and damped RLC tests do not replace independent circuit-model review or browser interaction testing.

## Required quality evidence before a production release

1. Automated unit, schema, serialization, localization and UI-contract tests pass in continuous integration.
2. Representative browser tests cover keyboard operation, mouse/touch layout edits, import/export, local recovery, four-language overflow, accessibility and responsive layouts.
3. Every released example has its result matrix and the exact engine/model/library-lock evidence recorded.
4. Independent electrical review signs off on any part promoted to verified and any new simulator model.
5. Security/privacy review is complete before enabling authentication, cloud sync, AI, telemetry or external data sources.
6. Deployment, rollback and monitoring plans are approved before publishing a public service.

No automated test suite justifies a claim of zero defects. Release notes must state the actual test evidence, known limitations and unresolved risk.

