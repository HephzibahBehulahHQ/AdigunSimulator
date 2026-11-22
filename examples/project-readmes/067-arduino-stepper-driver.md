# 067 — Uno-class bipolar stepper driver

An ATmega328P-PU sends STEP and DIR commands to a Pololu 1182 A4988 carrier. The carrier drives an off-board Pololu 1204 bipolar stepper with 200 full steps per revolution. The model computes signed travel from the configured count, rate and direction.

| Reference | Assembly |
| --- | --- |
| J1 | Regulated 5 V logic power and return |
| J2 | Regulated 12 V motor power and return |
| U1 | ATmega328P-PU with undivided internal 8 MHz clock |
| U2 | Pololu 1182 A4988 carrier, 2 × 8 pins at 2.54 mm pitch and 12.70 mm row spacing |
| J3 | Samtec TSW-104-07-T-S, pins 1–4 are A1, A2, B1, B2 |
| C1, C2 | 100 nF AVR VCC and AVCC bypass capacitors |
| C3 | Panasonic EEUFR1E101, 100 µF, 25 V, positive at VMOT |
| R7–R9 | 10 kΩ MCU reset pull-up, driver enable pull-up, and STEP pull-down |

Connect both returns. Keep the 5 V and 12 V positive rails separate. Mount U1 with pin 1 at F10 on the BB400 and orient U2 with EN at D2 and VMOT at G2. C3's positive lead goes to BP5 and negative to BM8. On the controller PCB, check U2 orientation and C3 polarity against the project before applying either supply. J3 is the footprint for the cabled motor, and on the breadboard J3 uses insulated pigtails. The 75 × 55 mm PCB uses two copper layers, 0.35 mm clearance, and 0.75 mm supply and coil traces. [Pololu carrier guide](https://www.pololu.com/product/1182), [carrier drawing](https://www.pololu.com/file/0J1082/a4988-stepper-motor-driver-carrier-dimension-diagram.pdf), [Panasonic C3](https://industrial.panasonic.com/ww/products/pt/aluminum-cap-lead/models/EEUFR1E101), [Samtec J3](https://www.samtec.com/products/tsw-104-07-t-s).

Connect black and green to A1 and A2 and red and blue to B1 and B2. Set the A4988 current-limit setting to at most 0.6 A using the carrier guide and the fitted sense resistors. Verify orientation and direction from an unloaded first move. Power down both supplies before connecting or disconnecting the motor. Keep C3 close to the carrier with short supply leads. [Pololu 1204 motor connection guide](https://www.pololu.com/product/1204).

D3 supplies STEP, D2 supplies DIR and D4 controls active-low enable. R8 keeps the bridge disabled during AVR reset. MS1–MS3 are low for full-step mode. RST and SLP are held high. The [AVR firmware](../067-arduino-stepper-driver/main.c) sends one default move of 200 pulses at approximately 200 steps/s, then disables bridge current. The scope shows the first four configured STEP pulses, with nominal 10 µs highs. The phase table represents ideal full-step sequencing. Current regulation, torque, missed steps, temperature, mechanical motion and firmware execution are outside the model. Bench and manufacturing qualification remain open.
