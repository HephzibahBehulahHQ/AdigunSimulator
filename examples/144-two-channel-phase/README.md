# Two-channel phase measurement

## Goal

Compare two matched 1 kHz, 1 V-peak sine sources with a known 90° phase offset. Report signed phase in degrees, frequency, period, and two-channel trace samples.

## Run

Open the example and select Run. The output dashboard shows phase, frequency and sample metadata.

## Acceptance

Automated checks verify the 90° reference, sign convention when phase wraps to -90°, 201 samples, and blocking when channel frequencies differ by more than 1 ppm.

## Direct PWM LED analysis result

The native 5 V PWM circuit runs through the bounded average-current analyzer at 1 kHz and 50% duty. It estimates 9.09 mA during the on interval, 4.55 mA average LED current, and 13.64 mW average resistor dissipation under the ideal switch model. The instrument capture or measurement is a separate modeled result.

## Limits

This analytic demonstration reads phase values declared by ideal sources. It does not derive phase from physical samples or model noise, timebase error, probe delay, loading, bandwidth, or calibrated instrument uncertainty.
