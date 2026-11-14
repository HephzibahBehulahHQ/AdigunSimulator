# 101 — Asynchronous Buck Converter CCM Estimate

## Purpose

Estimate continuous-conduction operation for the native TI LM2596 adjustable buck topology at 12 V input, 100 µH, 100 µF, and 24 Ω. The analytical model uses the TI 1.23 V feedback reference and nominal 150 kHz switching frequency. It is a bounded average estimate, not a switching or closed-loop simulation.

## Native project components

| Reference | Native identity | Current project value |
|---|---|---|
| V1 | Ideal DC source; mapped to the PCB input connector J1 | 12 V |
| U1 | TI LM2596T-ADJ/NOPB | 4.5–40 V input; 1.23 V reference; nominal 150 kHz |
| L1 | Bourns RLB0914-101KL | 100 µH |
| D1 | onsemi 1N5822G | Schottky; modeled Vf 0.5 V |
| C1 | Nichicon UPW1V101MPD | 100 µF |
| RLOAD | Vishay AC0300002409JAC00 | 24 Ω, 3 W |
| RFB1 | Vishay MRS25000C3681FCT00 | 3.68 kΩ |
| RFB2 | Vishay MRS25000C1001FCT00 | 1 kΩ |
| J2 | Phoenix Contact 1757242 | 2-pin output terminal |
| GND | Schematic reference | Virtual in breadboard and PCB physical maps |
| SCOPE1 | Analytical buck report | Virtual; not a physical part |

Component values and physical part records are stored in [the native project](../101-buck-converter-baseline.adigun.json). The native project maps each PCB part to a source URL, footprint record, pads, nets, and board geometry.

## Electrical topology

- **VIN:** V1 positive to U1 VIN and the J1 input connector.
- **Return:** V1 negative, U1 GND and ON/OFF, D1 anode, C1 negative, RLOAD low side, RFB2 low side, J2 return, and GND.
- **Switch node:** U1 SW, L1 input, and D1 cathode.
- **VOUT:** L1 output, C1 positive, RLOAD high side, RFB1 high side, J2 output, and SCOPE1 VOUT.
- **Feedback:** U1 FB and the RFB1/RFB2 divider junction.

The simulator blocks the supported LM2596 estimate when these required connections are missing or inconsistent and gives correction guidance. Its expected result is an average CCM estimate from the native component values; it does not establish switching behavior or hardware performance.

## Physical-view and export acceptance record

**PCB:** The current project records nine source-backed physical part entries, 21 pads, and 17 routes. The PCB DRC and manufacturing export checks passed in the PCB remediation release. GND and SCOPE1 are explicitly virtual in the PCB view. These records do not qualify the breadboard view.

**Breadboard:** Not accepted. The current generic 400-point board has no assigned pin holes or jumpers. Diagnostics reports 21 missing physical pin assignments and names them by component reference. Only GND and SCOPE1 are declared virtual. No breadboard wiring print has been generated and visually inspected.

The TI package drawing for U1 specifies four lead intervals of 1.45–1.96 mm; the generic breadboard model uses a 2.54 mm grid. This pitch difference means a direct pin-to-hole map is not verified. A sourced/measured adapter or another documented physical layout is required before claiming U1 is correctly placed on this breadboard. Do not silently bend leads or invent an adapter footprint.

**Schematic:** The native project contains the labeled LM2596 nets above. A schematic print/export still needs to be generated and inspected against the native project.

**Scope:** The estimate is analytical and may provide model-backed scope data. Runtime verification that Run opens the floating scope launcher and that the plotted values match the current project remains outstanding.

**Print and manufacturing files:** The PCB’s fabrication output is separate from the three visual print formats. Breadboard and schematic print artifacts, plus visual review of all three formats, remain outstanding. Do not treat a mocked print call as a reviewed artifact.

## Model limits

The estimate uses steady-state buck volt-second balance, CCM inductor ripple, and ideal-capacitor output ripple. It excludes switching transients, controller-loop stability, current-limit dynamics, inductor saturation and core loss, capacitor ESR, component tolerances, thermal behavior, EMC, and hardware qualification.

## Acceptance status — 2026-11-14

**Not accepted.** PCB physical data and diagnostics have been improved, but the breadboard map is incomplete and the runtime oscilloscope launcher and required view print artifacts have not yet been visually verified. Continue with this example until the remaining evidence is complete or a specific unsupported physical capability and its resolution are documented.

The all-project acceptance gate is in [AGENTS.md](../../AGENTS.md). TI mechanical/package reference: [LM2596 datasheet, mechanical data NEB0005E](https://www.ti.com/lit/ds/symlink/lm2596.pdf).
