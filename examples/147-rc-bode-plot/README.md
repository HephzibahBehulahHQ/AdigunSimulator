# RC low-pass Bode plot

## Goal

Plot the ideal first-order RC low-pass magnitude in dB and phase in degrees across four decades, with an exact marker at the calculated cutoff frequency.

## Run

Open the example and select Run. The result dashboard draws magnitude and phase curves and reports the cutoff marker in Hz, dB and degrees.

## Acceptance

Automated checks verify the 41-point logarithmic sweep, units, the exact cutoff sample, and the theoretical -3.0103 dB / -45° values. A broken R/C topology is blocked.

## Limits

This analytic response assumes an unloaded ideal first-order network. It excludes source impedance, capacitor parasitics, tolerances, nonlinear behavior and measurement loading.
