# Frequency counter

## Goal

Measure a declared oscillator period with a reciprocal-period counter, report period and frequency in SI units, and verify known 50 Hz, 1 kHz and 10 kHz cases.

## Run

Open the example and select Run. The result dashboard displays measured frequency, period, cycle count, edge count and method.

## Acceptance

Automated checks compare all three known frequencies and periods within strict numeric tolerances, and reject a zero-period oscillator.

## Limits

This is ideal reciprocal timing. Oscillator tolerance, jitter, input conditioning, noise, timebase calibration and gate-count quantization are not modeled.
