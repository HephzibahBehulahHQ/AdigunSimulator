# 071 — PIC16F886 ADC LED bargraph

A 10 kΩ Bourns 3296W trimmer drives PIC16F886 AN0. The PIC uses supply-referenced 10-bit ADC conversion and sinks current through up to ten red LED segments. At the default midpoint, the model gives ADC count 512 and lights five segments. The scope shows the ideal 2.500 V at AN0.

| Reference | Assembly |
| --- | --- |
| J1 | Regulated 5 V input and return |
| U1 | Microchip PIC16F886-I/SP, 28-pin SPDIP |
| RV1 | Bourns 3296W-1-103LF, 10 kΩ |
| DS1 | Kingbright DC10EWA, ten individually wired red LEDs |
| RN1, RN2 | Bourns 4606X-101-102LF, five independent 1 kΩ branches sharing pin 1 |
| C1 | 100 nF supply bypass |
| R7 | 10 kΩ MCLR pull-up |

Connect both PIC VSS pins to the common return. AN0 is pin 2. RB0–RB5, pins 21–26, sink the first six segments. RC0–RC3, pins 11–14, sink segments seven through ten. DS1 anodes are pins 1–10, paired with cathodes 20–11. Each anode has an individual 1 kΩ branch to 5 V. On the BB400, fit PIC pin 1 at F5 and align the marked DS1 anode row at F20–F29. Check the marked common lead of each resistor network before power is applied. [Microchip PIC16F886 datasheet](https://www.microchip.com/content/dam/mchp/documents/OTH/ProductDocuments/DataSheets/40001291H.pdf), [Kingbright DC10EWA datasheet](https://www.kingbrightusa.com/images/catalog/SPEC/DC10EWA.pdf), [Bourns resistor networks](https://www.bourns.com/docs/Product-Datasheets/4600x.pdf).

The [PIC assembly firmware](../071-pic-adc-bargraph/bargraph.asm) samples AN0, compares the 10-bit count with ten fixed thresholds, and drives the cathodes active low. Program the PIC in a suitable ICSP programming fixture before mounting it. The 89 x 58 mm two-layer board uses 0.35 mm copper clearance. The native project records the source-backed layout, PCB routes and educational fabrication outputs. The ideal model omits ADC noise, LED current and brightness, and firmware execution. Verify hardware thresholds and output behavior on the bench before relying on the meter.
