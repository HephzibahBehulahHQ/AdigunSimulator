# Example 013 — RC high-pass frequency response

## Purpose

Calculate the ideal sinusoidal steady-state response of a first-order high-pass circuit made from a 1 kΩ resistor and 100 µF capacitor.

## Topology

```text
1 V AC source ── C1 100 µF ──┬── output
                              |
                           R1 1 kΩ
                              |
GND ─────────────────────────┴── source return
```

The native project connects AC source positive to C1, C1 to the output node, R1 from the output node to ground, and source negative to ground. The analysis tests three frequencies derived from cutoff; the generic AC source amplitude is 1 V.

## Generic model BOM

| Ref | Generic model | Value | Model scope |
|---|---|---:|---|
| V1 | Ideal AC voltage source | 1 V amplitude | Sinusoidal magnitude only |
| C1 | Ideal capacitor | 100 µF | No leakage, ESR, dielectric, or voltage rating modeled |
| R1 | Ideal resistor | 1 kΩ | No tolerance or power rating modeled |
| GND | Signal reference | 0 V | Solver reference only |

These generic models are not manufacturer parts or a purchasing BOM. The project has no verified breadboard-hole placement or PCB footprint and is not ready to energize or manufacture.

## Expected results

The cutoff is **fc = 1 / (2πRC) = 1.591549431 Hz**. For a first-order RC high-pass, gain is **(f/fc) / √(1 + (f/fc)²)** and phase is **π/2 − atan(f/fc)**.

| Frequency | Expected gain | Output amplitude for 1 V input |
|---:|---:|---:|
| 0.1 × fc = 0.159154943 Hz | 0.099503719 | 0.099503719 V |
| 1 × fc = 1.591549431 Hz | 0.707106781 | 0.707106781 V |
| 10 × fc = 15.915494309 Hz | 0.995037190 | 0.995037190 V |

## Acceptance test

Run `npm test`. The test checks cutoff calculation, attenuation below cutoff, passband above cutoff, invalid component values, and broken wiring.

## Safety and limitations

This is an ideal low-voltage frequency-domain calculation. It does not model a waveform over time, arbitrary AC networks, real component tolerances or parasitics, physical board layout, thermal behavior, or regulatory requirements. Verify actual datasheets and independently review any hardware before use.
