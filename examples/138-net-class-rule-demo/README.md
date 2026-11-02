# Power and signal net-class rule demo

## Goal

Assign VCC and GND to POWER, LED_A to SIGNAL, and evaluate each route against its class minimum width plus the declared POWER-to-SIGNAL clearance. Export the resulting CSV report with the manufacturing review pack.

## Run

Open the example and use **PCB → Export PCB files**. The pack contains "Net-Class-Rule-Report.csv" when the project has net-class rules.

## Acceptance

Automated coverage checks valid POWER/SIGNAL rules and report generation, then deliberately narrows and shifts the signal route to assert that both width and class-clearance violations are reported.

## Direct analysis result

The base native circuit runs through the bounded DC LED analyzer at 5 V with a 330 Ω resistor and an ideal 2 V LED drop. It estimates 9.09 mA LED current and approximately 27.27 mW resistor dissipation. The PCB net-class review is a separate check and does not certify those component values for fabrication.

## Limits

This checker measures declared route segments in an educational single-layer model. It does not replace production DRC, polygon zone refill, manufacturer rules, stackup analysis, or a fabrication sign-off.
