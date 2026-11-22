# 064 — Uno-class temperature monitor with LCD output

The TI LM35DZ drives PC0/ADC0 on an ATmega328P-PU. PB0/D8 sends a temperature row to an off-board Parallax 27977 LCD through J2.

| Reference | Function |
| --- | --- |
| J1 | Regulated 5 V input and return |
| U1 | Microchip ATmega328P-PU, internal 8 MHz oscillator without clock division |
| TS1 | TI LM35DZ/NOPB, pins 1–3 are +5 V, analog output and ground |
| J2 | Samtec TSW-103-07-T-S, pins 1–3 are ground, +5 V and serial data |
| R7 | 10 kΩ reset pull-up |
| C1–C4 | 100 nF bypass at VCC, AVCC, AREF and the sensor supply |

Run TS1 output to U1 pin 23 and U1 pin 14 to J2 data. AVCC joins the 5 V rail. AREF has its own capacitor to ground. The native project stores the full net, package, and pin mappings. Install U1 with pin 1 at F10 on the BB400 and use separate insulated pigtails on TS1. On the 65 × 49 mm two-layer PCB, form the sensor's center lead to the staggered land pattern. The PCB stores 0.35 mm copper clearance and supports the educational Gerber, drill and BOM export.

Cable J2 to the matching GND, 5V and RX markings on the LCD. Use the same regulated 5 V supply for the LCD and controller. Set the LCD switches to SW1 OFF and SW2 ON. The LCD is a cabled assembly and J2 is its only footprint on the controller PCB. [TI LM35 datasheet](https://www.ti.com/lit/ds/symlink/lm35.pdf), [Parallax serial LCD guide](https://forums.parallax.com/uploads/attachments/61826/89125.pdf), [Samtec J2 header](https://www.samtec.com/products/tsw-103-07-t-s).

The [AVR firmware](../064-arduino-temperature-monitor/main.c) uses Timer1 to send 9600-baud 8N1 bytes on PB0. The hardware row uses ASCII (for example, `Temp  24.9 C`). Check actual oscillator accuracy and serial timing on the assembled board.

The analytical model converts 0, 25 and 100 °C through a 10-bit ADC. The scope shows the steady ideal A0 voltage, 250 mV at the default 25 °C. The automated test checks the temperature result within 0.5 °C and rejects incorrect wiring. At 0 °C the model uses an ideal 0 V output, while the manufacturer's basic single-supply circuit is specified from approximately +2 °C. Sensor error, ADC noise, thermal effects, LCD serial timing and firmware execution are outside the model. Bench operation and manufacturing qualification remain unverified.
