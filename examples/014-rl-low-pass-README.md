# Example 014 — RL low-pass frequency response

## Purpose

Calculate the ideal sinusoidal steady-state response of a first-order low-pass circuit made from a 1 kΩ resistor and 100 mH inductor.

## Topology

```text
1 V AC source ── R1 1 kΩ ──┬── output
                            |
                         L1 100 mH
                            |
GND ────────────────────────┴── source return
```

The native project connects AC source positive to R1, R1 to the output node, L1 from the output node to ground, and source negative to ground. The analysis tests three frequencies derived from cutoff; the generic AC source amplitude is 1 V.

## Generic model BOM

| Ref | Generic model | Value | Model scope |
|---|---|---:|---|
| V1 | Ideal AC voltage source | 1 V amplitude | Sinusoidal magnitude only |
| R1 | Ideal resistor | 1 kΩ | No tolerance or power rating modeled |
| L1 | Ideal inductor | 100 mH | No winding resistance, core, saturation, or rating modeled |
| GND | Signal reference | 0 V | Solver reference only |

These generic models are not manufacturer parts or a purchasing BOM. The project has no verified breadboard-hole placement or PCB footprint and is not ready to energize or manufacture.

## Expected results

The cutoff is **fc = R / (2πL) = 1591.549431 Hz**. For a first-order RL low-pass, gain is **1 / √(1 + (f/fc)²)** and phase is **−atan(f/fc)**.

| Frequency | Expected gain | Output amplitude for 1 V input |
|---:|---:|---:|
| 0.1 × fc = 159.154943 Hz | 0.995037190 | 0.995037190 V |
| 1 × fc = 1591.549431 Hz | 0.707106781 | 0.707106781 V |
| 10 × fc = 15915.494309 Hz | 0.099503719 | 0.099503719 V |

## Acceptance test

Run `npm test`. The test checks cutoff and time-constant values, attenuation around cutoff, invalid values, broken wiring, and numeric bounds.

## Safety and limitations

This is an ideal low-voltage frequency-domain calculation. It does not model a waveform over time, arbitrary AC networks, real component tolerances or parasitics, physical board layout, thermal behavior, or regulatory requirements. Verify actual datasheets and independently review any hardware before use.
