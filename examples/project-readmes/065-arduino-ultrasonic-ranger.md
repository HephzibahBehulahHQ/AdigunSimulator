# 065 — Uno-class ultrasonic ranger and OLED result

The US-100 sends an echo pulse to the ATmega328P-PU. The analytical model converts its width to distance at 343 m/s. The AVR firmware uses Timer1 input capture and displays millimetres through an SSD1306 OLED.

| Reference | Assembly |
| --- | --- |
| J1 | Regulated 5 V and ground |
| U1 | ATmega328P-PU, internal 8 MHz clock without division |
| J2 | Samtec TSW-104-07-T-S for the cabled US-100 |
| J3 | Samtec TSW-104-07-T-S for the cabled Adafruit 4440 OLED |
| R7 | 10 kΩ MCU reset pull-up |
| C1, C2 | 100 nF at VCC and AVCC |

J2 pins 1–4 carry VCC, TRIG, ECHO and GND. Match the cable to the sensor labels VCC, TRIG/TX, ECHO/RX and GND. Remove the US-100 mode jumper. U1 pin 15 (D9/PB1) sends the trigger and pin 14 (D8/PB0/ICP1) captures the echo. [US-100 product specifications](https://www.adafruit.com/product/4019), [US-100 pin and mode guide](https://learn.adafruit.com/ultrasonic-sonar-distance-sensors?view=all).

J3 pins 1–4 carry GND, VIN, SDA and SCL. Use the 5 V compatible Adafruit 4440 breakout at address 0x3C. Cable by signal marking. SDA and SCL go to U1 pins 27 and 28. The breakout provides pull-ups, level shifting and power-on reset. [Adafruit 4440 product page](https://www.adafruit.com/product/4440), [OLED wiring guide](https://learn.adafruit.com/monochrome-oled-breakouts/downloads).

Install U1 with pin 1 at F10 on the BB400. J2 and J3 are the PCB footprints for the off-board modules. The routed 65 × 49 mm controller board uses two copper layers and 0.35 mm clearance. The project stores native pin, hole, wire and route mappings and supports an educational Gerber, drill and BOM export. [Samtec J2](https://www.samtec.com/products/tsw-104-07-t-s), [Samtec J3](https://www.samtec.com/products/tsw-104-07-t-s).

The [AVR firmware](../065-arduino-ultrasonic-ranger/main.c) drives a 12 µs trigger, bounds its echo waits to 25 ms, and marks absent or out-of-range readings with dashes. The default 5882 µs input models 1008.763 mm and produces an ideal 5882 µs echo trace aligned to the rising edge. Model tests cover the configured 20–4000 mm window. Physical echo timing, noise, temperature compensation, OLED behavior and manufacturing qualification require hardware verification.
