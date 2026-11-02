# Ground copper-zone refill demo

## Goal

Show a bounded ground-plane fill preview with declared board clearance, a GND net assignment, four-spoke thermal-relief intent for the through-hole ground terminal, and explicit pad/route exclusions for other nets.

## Run

Open the example and use **PCB → Export PCB files**. The export pack includes "Copper-Zone-Review.csv" after both supported PCB checks and zone preview checks pass.

## Acceptance

Tests validate the board and supported electrical analysis, check permitted GND pad candidates and the declared terminal thermal-relief candidate, confirm non-zone cells are excluded in the generated fill preview, and reject a clearance below the board minimum.

## Direct analysis result

The base native circuit runs through the bounded DC LED analyzer at 5 V, 330 Ω, and an ideal 2 V LED drop. It estimates 9.09 mA LED current and 27.27 mW resistor dissipation. The copper-zone cell preview is a separate conceptual PCB check; it is not production copper geometry.

## Limits

This feature produces a rectangular grid estimate and a review report. It does not write filled polygons to the Gerber output, calculate thermal spokes or island connectivity, or replace production zone refill, DRC, or fabrication review.
