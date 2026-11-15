# 006 — 9 V battery discharge monitor

## Circuit and expected behavior

The TI TPS3710DDCR monitors a 9 V nominal external source. A 180 kΩ / 10 kΩ divider presents the SENSE pin with 0.474 V at 9 V input. The device's nominal 0.4 V reference gives a calculated battery trip point of 7.6 V. Below that point, the open-drain OUT sinks current through a 1 kΩ resistor and red LED to signal low battery. C1 is a 0.1 µF VDD decoupling capacitor.

The simulator uses an ideal threshold and open-drain state estimate. It does not simulate the TPS3710's actual threshold tolerance, hysteresis bounds, propagation delay, output sink characteristic, battery chemistry, resistor/capacitor tolerance, or production corner behavior. This is not a validated battery product design.

## Bill of materials

| Reference | Manufacturer part | Function / package |
|---|---|---|
| J1 | Samtec TSW-102-07-T-S | External supply header, 2.54 mm through-hole |
| R1 | TE CFR25J180K | 180 kΩ, 5%, 0.33 W axial divider resistor |
| R2 | TE CFR25J10K0 | 10 kΩ, 5%, 0.33 W axial divider resistor |
| U1 | TI TPS3710DDCR | SOT-23-6, fixed 0.4 V nominal threshold |
| R3 | TE CFR25J1K0 | 1 kΩ, 5%, 0.33 W axial LED resistor |
| D1 | Vishay TLHR5400 | Red through-hole LED |
| C1 | KEMET C315C104K5R5TA | 0.1 µF, 50 V, X7R radial capacitor |

J1 provides external power; V1 is not mounted on the PCB. The GND symbol is schematic-only; the return uses J1 pin 2 and the routed GND net. BB400 assembly requires a SOT-23-6-to-through-hole breakout adapter for U1, which is not included in the BOM.

## Connections

- **VBAT:** J1 pin 1, R1 pin 1, U1 VDD, R3 pin 1, C1 pin 1
- **SENSE:** R1 pin 2, R2 pin 1, U1 SENSE
- **LED_A:** R3 pin 2, D1 anode
- **ALARM_N:** D1 cathode, U1 OUT
- **GND:** J1 pin 2, R2 pin 2, U1 pins 1/3/5, C1 pin 2

The stored BB400 pin-hole map identifies the required jumpers and shared rows. The PCB pad map uses the TI DDC0006A package drawing and example land pattern for U1. Application-selected through-hole drill sizes and board-specific routing still require an independent fabrication review.

## Verification

- Expected nominal battery trip calculation: 7.6 V
- At 9.0 V: open-drain output high-impedance; low-battery LED off
- At 7.4 V: open-drain output sinking; low-battery LED on
- Analysis limits: threshold-state analytical estimate, not SPICE or production qualification
