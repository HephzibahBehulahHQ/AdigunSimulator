# 101 — Asynchronous Buck Converter CCM Estimate

## Purpose

Estimate continuous-conduction operation for the native TI LM2596 adjustable buck topology at 12 V input, 100 µH, 100 µF, and 24 Ω. The analytical model uses the TI 1.23 V feedback reference and nominal 150 kHz switching frequency. It is a bounded average estimate, not a switching or closed-loop simulation.

## Native project components

| Reference | Native identity | Current project value |
|---|---|---|
| V1 | Ideal DC source; mapped to the PCB input connector J1 | 12 V |
| U1 | TI LM2596T-ADJ/NOPB | LM2596T-ADJ/NOPB |
| L1 | Bourns RLB0914-101KL | 100 µH |
| D1 | onsemi 1N5822G | Schottky; modeled Vf 0.5 V |
| C1 | Nichicon UPW1V101MPD | 100 µF |
| RLOAD | Vishay AC0300002409JAC00 | 24 Ω, 3 W |
| RFB1 | Vishay MRS25000C3681FCT00 | 3.68 kΩ |
| RFB2 | Vishay MRS25000C1001FCT00 | 1 kΩ |
| J2 | Phoenix Contact 1757242 | 5.76 V DC |
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

**Breadboard:** Not accepted. The selected board is the source-backed BusBoard BB400: 30 terminal columns, 2.54 mm hole pitch, and four continuous 25-hole rails. The layout currently has no assigned pin holes or jumpers. Diagnostics reports 21 missing physical pin assignments and names them by component reference. Only GND and SCOPE1 are declared virtual. The TI LM2596 package and onsemi 1N5822G diode both exceed the BB400's specified direct lead/contact fit; their mappings require verified adapters or a separately source-backed compatible part. The other pin placements and interconnects also remain unverified. A one-page breadboard print was generated and visually inspected; it shows unmapped parts and no physical wiring, so it fails acceptance.

The TI package drawing for U1 specifies adjacent lead intervals of 1.45–1.96 mm and lead widths of 0.76–1.02 mm. The BB400 has 2.54 mm hole pitch and is specified for 0.4–0.7 mm insertion wire. A direct pin-to-hole map is not verified. A sourced/measured adapter or another documented physical layout is required before claiming U1 is correctly placed on this breadboard. Do not silently bend leads or invent an adapter footprint.

**Schematic:** Production run after the schematic reflow showed 19 routed wire segments and zero blocked wires. Print review exposed ellipsized U1 and J2 values; the project now prints the exact U1 manufacturer part number and the J2 output voltage as concise labels. A regenerated one-page print shows both labels in full and was visually inspected against the native project.

**Scope:** Production Run completed, exposed the floating scope launcher, and opened a scope with model-backed VOUT/GND/VIN traces. The scope identifies the bounded LM2596 output-ripple model and its limits; browser page errors were zero.

**PCB and print:** The live board shows nine mapped footprints, 21 pads, and 17 copper routes across two layers (9 front, 8 back); GND and SCOPE1 are explicitly virtual. Its one-page print was generated and visually inspected. The PCB fabrication output remains separate from the three visual print formats. Do not treat a print image as fabrication sign-off.

## Model limits

The estimate uses steady-state buck volt-second balance, CCM inductor ripple, and ideal-capacitor output ripple. It excludes switching transients, controller-loop stability, current-limit dynamics, inductor saturation and core loss, capacitor ESR, component tolerances, thermal behavior, EMC, and hardware qualification.

## Acceptance status — 2026-11-14

**Not accepted.** The schematic, scope, PCB view, and all three one-page visual prints have been checked. The breadboard map remains empty and its print visibly fails the physical-placement and wiring gate. The documented next step is a verified physical solution for U1, then source-backed placements and jumpers for the remaining breadboard interfaces and components. Continue with this example until the breadboard is physically coherent or a specific unsupported capability and its resolution are documented.

The all-project acceptance gate is in [AGENTS.md](../../AGENTS.md). References: [BusBoard BB400 datasheet](https://www.busboard.com/documents/datasheets/BPS-DAT-%28BB400%29-Datasheet.pdf) and [TI LM2596 datasheet, mechanical data NEB0005E](https://www.ti.com/lit/ds/symlink/lm2596.pdf).
