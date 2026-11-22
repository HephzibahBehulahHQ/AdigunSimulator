# 069 — Pico ADC divider voltmeter with OLED

The Raspberry Pi Pico reads GP26/ADC0 through a 30 kΩ / 10 kΩ divider. A 3.3 V Adafruit 4440 OLED displays the estimated input voltage. At 12 V input the ideal divider produces 3.000 V at ADC0.

| Reference | Assembly |
| --- | --- |
| J1 | Positive sensed input and common return |
| U1 | Raspberry Pi Pico with RP2040, SKU SC0915 |
| R1 | Vishay MRS25000C3002FCT00, 30 kΩ |
| R2 | Vishay MRS25000C1002FCT00, 10 kΩ |
| C1 | 100 nF from the divider midpoint to return |
| J2 | Samtec TSW-104-07-T-S for the off-board Adafruit 4440 OLED |

Power the Pico through its own USB socket before applying the input. Remove the input before removing USB power. Use an isolated, current-limited 0–12 V DC source at J1. The circuit has no external clamp or reverse-polarity protection. The model's 13 V case checks ideal quantization near full scale. It does not extend the bench input range.

Pin 31 is ADC0. Join Pico AGND (pin 33), GND (pin 38), J1 return and OLED ground. J2 pins 1–4 are ground, 3V3, SDA and SCL. The Pico supplies 3V3 on pin 36. SDA and SCL connect to GP4 and GP5 on pins 6 and 7. Match the cable to the OLED markings. On the BB400 orient the USB connector toward column 5. Keep the USB plug accessible on the 71 × 48 mm, two-layer PCB. J2 is the footprint for the cabled display. The native project includes the three view mappings and an educational fabrication export. [Raspberry Pi Pico datasheet](https://pip-assets.raspberrypi.com/categories/610-raspberry-pi-pico/documents/RP-008307-DS-2-pico-datasheet.pdf), [Adafruit OLED](https://www.adafruit.com/product/4440), [Samtec J2](https://www.samtec.com/products/tsw-104-07-t-s), [Vishay divider resistors](https://www.vishay.com/docs/28724/mrs16m25.pdf).

The [Arduino sketch](../069-pico-adc-voltmeter/069-pico-adc-voltmeter.ino) averages 16 ADC readings, applies the nominal divider gain and shows volts on the OLED. A reading near full scale displays a saturation diagnostic. The scope displays the analytical DC divider voltage. Calibrate the reference and divider gain against a known source before relying on hardware readings. Bench calibration, transient protection, and manufacturing qualification remain open.
