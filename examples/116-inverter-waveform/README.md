# Example 116 — Single-phase inverter waveform concept

Estimates the fundamental RMS voltage of an ideal bipolar sine-PWM H-bridge and the frequency response of a series-inductor/shunt-capacitor filter feeding a resistive load.

## Nominal target
- DC bus: 48 V
- Modulation index: 0.50
- Fundamental: 50 Hz; carrier: 10 kHz
- Filter: 10 mH and 4.7 µF with 100 Ω load
- Target: 17 V RMS ±5%

The analysis computes an ideal fundamental estimate and a linear second-order LC response. It does not synthesize or plot PWM switching waveforms or harmonics, model switching/dead time, qualify an inverter, generate mains output, or evaluate isolation, thermal limits, or hardware safety.
