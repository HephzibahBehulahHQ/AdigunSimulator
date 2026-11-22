# 072 — AVR NEC-like infrared receiver

A Vishay TSOP38438 demodulates 38 kHz infrared bursts. The ATmega328P-PU receives the active-low output on PD2/INT0 and sends the decoded address and command to a cabled Parallax serial LCD. The simulator uses a virtual optical stimulus with bytes 00 FF A2 5D. The virtual fixture has no conductor or PCB footprint.

| Reference | Assembly |
| --- | --- |
| J1 | Regulated 5 V and common return |
| U1 | Microchip ATmega328P-PU, undivided internal 8 MHz oscillator |
| IR1 | Vishay TSOP38438, pins 1 OUT, 2 GND and 3 VS |
| J2 | Samtec TSW-103-07-T-S, pins 1 GND, 2 +5 V and 3 TX |
| C1–C3 | 100 nF supply bypass for VCC, AVCC and IR1 |
| R7 | 10 kΩ AVR reset pull-up |

Install U1 with pin 1 at F10 on the BB400. Use insulated pigtails from IR1 to A9 (OUT), A8 (GND) and A7 (VS). Place IR1's supply bypass close to the module in a physical build. Cable J2 to the Parallax 27977 LCD by its GND, 5V and RX markings. Use a shared regulated 5 V supply and set SW1 OFF, SW2 ON for 9600 baud. [Vishay receiver datasheet](https://www.vishay.com/docs/82491/tsop382.pdf), [Parallax LCD guide](https://forums.parallax.com/uploads/attachments/61826/89125.pdf), [Samtec J2](https://www.samtec.com/products/tsw-103-07-t-s).

The [AVR firmware](../072-avr-ir-receiver/main.c) polls PD2 and measures each pulse with the Timer1 1 µs timebase. It accepts a full 32-bit frame with matching complement bytes and approximately ±20% timing tolerance. Valid frames update the LCD over 9600-baud 8N1. Repeat bursts and invalid frames leave the last valid display intact.

The scope shows the ideal demodulated output, including the 9 ms low leader and 4.5 ms high space. The native project contains the 65 × 49 mm two-layer PCB, the three view mappings and educational fabrication export. Optical range, ambient light, AGC response, digital timing margins and hardware operation require bench verification.
