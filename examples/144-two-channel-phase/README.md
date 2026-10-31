# Two-channel phase measurement

## Goal

Compare two matched 1 kHz, 1 V-peak sine sources with a known 90° phase offset. Report signed phase in degrees, frequency, period, and two-channel trace samples.

## Run

Open the example and select Run. The output dashboard shows phase, frequency and sample metadata.

## Acceptance

Automated checks verify the 90° reference, sign convention when phase wraps to -90°, 201 samples, and blocking when channel frequencies differ by more than 1 ppm.

## Limits

This analytic demonstration reads phase values declared by ideal sources. It does not derive phase from physical samples or model noise, timebase error, probe delay, loading, bandwidth, or calibrated instrument uncertainty.
