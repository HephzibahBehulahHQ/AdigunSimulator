# Example 151 — Thermal warning boundary

## Circuit and calculation
This 12 V divider uses R1 = 100 Ω and R2 = 10 Ω. The supported ideal DC divider calculates approximately 109.1 mA and 1.19 W dissipation in R1. The demonstration compares that electrical estimate with a user-entered 0.25 W rating at a 50% derating factor, so it reports a rating concern and a minimum nameplate rating estimate.

## Boundary
This is not a thermal simulation. It does not calculate resistor body temperature, heatsink needs, enclosure effects, ambient derating curves, thermal runaway, reliability, or certification. Check the exact part datasheet and the actual circuit before selecting hardware.

## Direct divider result

The native 12 V, 100 Ω/10 Ω divider has 109.1 mA current and 1.091 V lower-node output in the bounded DC analyzer. The thermal boundary report is an additional analytical warning, not a measured component temperature.

## Run and verify
Open the example and select **Run**. Confirm the dissipation/rating warning and the explicit “thermal model not modeled” result. Automated acceptance is in `tests/core.test.mjs` under “catalogue thermal boundary reports dissipation without claiming a thermal model”.
