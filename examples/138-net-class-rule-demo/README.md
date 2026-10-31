# Power and signal net-class rule demo

## Goal

Assign VCC and GND to POWER, LED_A to SIGNAL, and evaluate each route against its class minimum width plus the declared POWER-to-SIGNAL clearance. Export the resulting CSV report with the manufacturing review pack.

## Run

Open the example and use **PCB → Export PCB files**. The pack contains "Net-Class-Rule-Report.csv" when the project has net-class rules.

## Acceptance

Automated coverage checks valid POWER/SIGNAL rules and report generation, then deliberately narrows and shifts the signal route to assert that both width and class-clearance violations are reported.

## Limits

This checker measures declared route segments in an educational single-layer model. It does not replace production DRC, polygon zone refill, manufacturer rules, stackup analysis, or a fabrication sign-off.
