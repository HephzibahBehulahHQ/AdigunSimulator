# Example 120: Surge-protected input

## Purpose

Estimate the response of a low-voltage DC input with a source-resistance-limited surge pulse, an ideal shunt TVS clamp, an I²t fuse model, and a series-resistance/capacitor output filter.

## Default case

- Bus: 12 V; pulse fixture: 60 V peak for 1 ms with 10 Ω source resistance.
- Ideal TVS clamp: 24 V and 1 J energy limit.
- Fuse: 0.02 A²s threshold and 2 A hold-current warning.
- Output filter: 10 Ω and 100 µF, feeding a 100 Ω load.
- The estimated pulse current is 3.6 A, TVS energy is 0.0864 J, and fuse current warning is active while the I²t threshold is not tripped.
- RC time constant is 1 ms; the bounded output transient estimate is approximately 17.82 V. The steady loaded output estimate is approximately 10.91 V.

## Limits

This is a single-pulse educational estimate. It does not implement a standardized surge waveform, MOV aging, TVS dynamic resistance, fuse time-current curves, PCB parasitics, thermal behavior, compliance testing, or hardware safety qualification. Verify protection design against selected real components and applicable standards.
