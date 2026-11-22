# 066 — Uno-class potentiometer servo control

The Bourns 3296W 10 kΩ trimmer drives A0 on an ATmega328P-PU. D9 sends a 1–2 ms high pulse every 20 ms to a cabled FEETECH FS90-C servo. The analytical angle is a normalized 0–180° estimate. The FS90-C specification gives 120° of travel over 900–2100 µs. The 1000–2000 µs firmware window stays inside that pulse range. [FEETECH FS90-C specification](https://www.pololu.com/file/0J1435/FS90-specs.pdf).

| Reference | Assembly |
| --- | --- |
| J1 | Regulated 5 V input and return |
| U1 | ATmega328P-PU, internal 8 MHz oscillator without division |
| RV1 | Bourns 3296W-1-103LF, with wiper at A0 |
| J2 | Samtec TSW-103-07-T-S, pins 1–3 are GND, 5 V and D9/PWM |
| R7 | 10 kΩ MCU reset pull-up |
| C1–C3 | 100 nF at VCC, AVCC and AREF |
| C4 | Panasonic EEUFR1A471, 470 µF, 10 V, positive at 5 V |

Power J1 from a regulated 5 V source sized for at least 1 A. Check the servo connector against GND, 5 V and PWM before energizing. The servo uses a shared return and mounts off board. Its only controller-board footprint is J2. Use the BB400 with U1 pin 1 at F10 and C4 positive at H29 and negative at H27 via insulated pigtails. [BB400 data sheet](https://www.busboard.com/documents/datasheets/BPS-DAT-%28BB400%29-Datasheet.pdf), [Samtec header](https://www.samtec.com/products/tsw-103-07-t-s), [Panasonic C4](https://industrial.panasonic.com/ww/products/pt/aluminum-cap-lead/models/EEUFR1A471).

The controller PCB is 65 × 49 mm with two copper layers, 0.35 mm clearance and 0.75 mm power traces. The native project supports the educational copper, outline, drill and BOM export. Check voltage drop and temperature under load on assembled hardware.

The [AVR firmware](../066-arduino-servo-control/main.c) uses Timer1 with a 1 µs timebase. Its buffered compare value changes the pulse width at the frame boundary. At the default 50% setting, the analytical scope shows a 1500.49 µs pulse in a 20 ms frame. The model omits servo torque, mechanical load, backlash, supply transients and firmware execution. Bench measurements and manufacturing qualification remain open.
