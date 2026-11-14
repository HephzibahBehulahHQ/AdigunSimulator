# 102 — LM2577 asynchronous boost reference

## Purpose and analysis

This example implements the TI LM2577T-ADJ reference topology for a 5 V input and approximately 12 V output. The model uses the TI 1.23 V feedback reference, 52 kHz oscillator, 100 µH inductor, 0.5 V diode drop, 680 µF output capacitor and 100 Ω load.

The supported result is an average CCM estimate: 11.931 V output, 119.31 mA load current, approximately 59.78% duty, and 2.02 mV ideal-capacitor ripple estimate. The oscilloscope records an estimated output ripple envelope over four switching periods. It does not simulate switch transitions, the LM2577 control loop, capacitor ESR, tolerances, thermal behavior, EMI, or hardware.

## Project components and wiring

There are 14 project components. SCOPE1 and GND are logical analysis/ground symbols, not PCB-mounted parts.

| Reference | Part/value |
|---|---|
| V1 | 5 V off-board input source |
| U1 | TI LM2577T-ADJ/NOPB |
| L1 | Bourns RLB0914-101KL, 100 µH |
| D1 | onsemi 1N5822G Schottky, 0.5 V model drop |
| CIN | KEMET C315C104M5U5TA, 0.1 µF |
| C1 | Nichicon UPW1E681MPD, 680 µF, 25 V |
| RLOAD | Vishay AC0300001000JAC00, 100 Ω, 3 W |
| RFB1 / RFB2 | 17.4 kΩ / 2 kΩ |
| RCOMP / CCOMP | 2.2 kΩ / 0.33 µF |
| J2 | Phoenix Contact 1757242 output terminal |
| SCOPE1 / GND | logical report and ground markers |

- **VIN:** V1+, U1 VIN (pin 5), L1.1, CIN.1
- **GND:** V1−, U1 case/tab (pin 3), CIN.2, C1.2, RLOAD.2, RFB2.2, CCOMP.2, J2 GND, SCOPE1 GND, GND.0
- **SWITCH:** U1 SWITCH (pin 4), L1.2, D1 anode
- **VOUT:** D1 cathode, C1.1, RLOAD.1, RFB1.1, J2 VOUT, SCOPE1 VOUT
- **FB:** U1 FB (pin 2), RFB1.2, RFB2.1
- **COMP:** U1 COMP (pin 1), RCOMP.1
- **COMP_RC:** RCOMP.2, CCOMP.1

## Three views and PCB

The native project stores separate breadboard, schematic and PCB canvas positions with the same electrical nets. The TO-220 case ground is a logical connection in the breadboard presentation; it is not a fifth projecting lead. Confirm how the case is grounded in a breadboard prototype.

The PCB contains 12 mapped through-hole parts, 27 mapped pads and 20 routed traces on a 112 × 70 mm, two-layer board. U1 has four electrical leads plus its grounded case/tab. The input source is represented by J1, an off-board source connection. The PCB export pack contains F.Cu, B.Cu, edge outline, plated-hole drill and BOM outputs. SCOPE1 and the GND marker are intentionally unmapped.

## Acceptance and limits

- Stable test ID: `core-lm2577-boost-reference`
- Engine: TI LM2577-ADJ boost reference CCM average and ripple estimate
- Model version: `ti-lm2577-adjustable-boost-average-ccm-v1`
- Regression coverage includes supported output, wiring/value diagnostics, scope recording, PCB DRC/export, and all three current-view print routes.

TI source: [LM2577 datasheet](https://www.ti.com/lit/ds/symlink/lm2577.pdf) and [LM2577T-ADJ/NOPB product page](https://www.ti.com/product/LM2577/part-details/LM2577T-ADJ/NOPB).

This routed source-backed board proposal is not a manufacturing release. Verify the TO-220 case/tab pad and mounting connection, every selected part ordering code and package, capacitor ESR/ripple and lifetime, component derating, board-house electrical and mechanical rules, enclosure, thermal performance and assembly before fabrication or operation.
