# Example 191 — RC timing calculator

## Objective
Calculate the ideal RC time constant τ = R × C and cutoff frequency f = 1/(2πRC) with decimal SI prefixes.

## Run and expected result
10 kΩ with 100 nF gives τ = 1 ms and f ≈ 159.15 Hz. 4.7 kΩ with 10 µF gives τ = 47 ms and f ≈ 3.386 Hz. 1 MΩ with 2.2 pF gives τ = 2.2 µs and f ≈ 72.34 kHz.

## Limits
This is an ideal first-order calculation. Real component tolerance, ESR, leakage, layout parasitics, source impedance, and load are not included.
