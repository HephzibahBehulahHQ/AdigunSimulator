# Example navigation, PCB coverage and comparator scope

The existing Example menu now contains search, Type, Level, Category and PCB coverage filters, with 40 results per page. Index loading is deferred until opening that menu. Search matches titles, filenames and editorial classifications. If index loading fails, the original example list remains usable. No extra top menu or toolbar was added.

The reproducible audit covers every one of the 216 native project files. It records 211 completed bounded analyses/workflow reports and five intentionally blocked fault lessons. These counts do not mean 211 general SPICE simulations. All five fault lessons can now load for inspection; the short-circuit lesson retains its blocking electrical error. Other invalid imports remain rejected.

Stored PCB layouts increased from 21 to 27. Six projects with exactly the same native component identities, types and nets as the existing single-sided LED board now reuse that compatible layout:

- 001 LED current limiter
- 003 9 V LED current limiter
- 007 12 V LED current limiter
- 008 3.3 V LED current limiter
- 181 breadboard/schematic synchronization
- 183 three-view LED project

The reused board contains the existing two-pin terminal block, resistor 0805 and LED 0805 package templates, six pads and stored routes. PCB validation passed and electrical/workflow results were unchanged. These are package templates, not newly verified manufacturer parts or fabrication certification.

**189 projects still lack stored PCB layouts.** The menu exposes that fact before loading, including unmapped references. Logical instructions, test sources and ideal functional blocks cannot be assigned invented physical packages. The audit distinguishes missing data from rendering failures: every stored layout renders footprint groups. It does not claim board completeness, electrical correctness or manufacturing approval for all projects.

The battery-discharge comparator now exposes its calculated DC supply, sense, output and LED node voltages to the floating scope and current feedback. Tests cover 9 V and 6 V inputs above/below its existing threshold. A DC signal is a flat trace; no oscillation is invented. The scope explicitly identifies this as an ideal comparator DC estimate. Existing 555/PWM recordings and full-viewport dragging remain unchanged.

## Verification and remaining work

Run `node scripts/audit-example-bank.mjs` to regenerate `examples/index.json`. Tests check every source hash, native file coverage, expected analysis states, actual PCB rendering, filtering, paging, diagnostic exceptions and the six assigned layouts.

Browser checks covered combined filters, actual PCB preview, short-circuit lesson loading, retained validation blocking, and 390 px menu layout without horizontal overflow. The release PR records final CI/deployment and scope browser evidence.

The current static index is intended for this bank (hard limit 20,000 entries), not one million records. A million distinct validated projects requires sourced circuits, model/package evidence, deduplication, individual assertions and a server/search index or sharded delivery. No generated variants were added to inflate the count.

General SPICE remains unimplemented. At the time of this audit, no `ngspice` or `emcc` executable was found on PATH. Since then, pinned native and WebAssembly CI workflows have passed resistor-divider operating-point smoke checks (main workflow runs #8 and #24, using ngspice commit `a80f6e3e95d51534905b1f23410a951802666656`; Emscripten 3.1.64 for WebAssembly). They qualify builds only: GitHub Pages still serves no engine, and there is no app worker integration, broader model qualification, resource-bound/cancellation validation or redistributed engine package. The comparator limitation disclosure remains accurate and has not been hidden.

The [ngspice model documentation](https://ngspice.sourceforge.io/modelparams.html) distinguishes engine inputs from device models and notes that encrypted vendor models cannot be used by ngspice. Its [shared-library interface](https://ngspice.sourceforge.io/shared.html) supports netlist control and sampled results, but a native DLL is not directly executable in this browser app. [TI's LM393B product page](https://www.ti.com/product/LM393B) is a candidate source for device specifications, not evidence that its full behavior is already modeled here. Battery chemistry and tolerance/temperature validation require separate sourced models.
