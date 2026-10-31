# Example 012 — RC low-pass frequency response

## Purpose

Calculate the ideal sinusoidal steady-state response of a first-order low-pass circuit made from a 1 kΩ resistor and 100 µF capacitor.

## Topology

```text
1 V AC source ── R1 1 kΩ ──┬── output
                            |
                         C1 100 µF
                            |
GND ────────────────────────┴── source return
```

The native project connects AC source positive to R1, R1 to the output node, C1 from the output node to ground, and source negative to ground. The analysis tests three frequencies derived from the cutoff, so the AC source's generic amplitude is 1 V.

## Generic model BOM

| Ref | Generic model | Value | Model scope |
|---|---|---:|---|
| V1 | Ideal AC voltage source | 1 V amplitude | Sinusoidal magnitude only |
| R1 | Ideal resistor | 1 kΩ | No tolerance or power rating modeled |
| C1 | Ideal capacitor | 100 µF | No leakage, ESR, dielectric, or voltage rating modeled |
| GND | Signal reference | 0 V | Solver reference only |

These generic models are not manufacturer parts or a purchasing BOM. The project has no verified breadboard-hole placement or PCB footprint and is not ready to energize or manufacture.

## Expected results

The cutoff is **fc = 1 / (2πRC) = 1.591549431 Hz**. For a first-order RC low-pass, gain is **1 / √(1 + (f/fc)²)** and phase is **−atan(f/fc)**.

| Frequency | Expected gain | Output amplitude for 1 V input |
|---:|---:|---:|
| 0.1 × fc = 0.159154943 Hz | 0.995037190 | 0.995037190 V |
| 1 × fc = 1.591549431 Hz | 0.707106781 | 0.707106781 V |
| 10 × fc = 15.915494309 Hz | 0.099503719 | 0.099503719 V |

## Acceptance test

Run `npm test`. The test checks cutoff calculation, unity-normalized attenuation around cutoff, monotonic gain reduction, invalid component values, broken wiring, and numerical underflow handling.

## Safety and limitations

This is an ideal low-voltage frequency-domain calculation. It does not model a waveform over time, arbitrary AC networks, real component tolerances or parasitics, physical board layout, thermal behavior, or regulatory requirements. Verify actual datasheets and independently review any hardware before use.
