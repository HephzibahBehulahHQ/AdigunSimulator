# 092 — Audio tone generator and spectrum check

## Purpose

Generate a bounded coherent sampled sine tone, estimate its fundamental and second harmonic with a discrete Fourier calculation, and verify measured frequency from zero-crossing count.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SIG1 | `input.audio-tone-settings` | Waveform sine; Frequency 1000 Hz; Amplitude 1 V; Offset 2.5 V; SampleRate 48000 Hz; Duration 10 ms |
| OSC1 | `active.audio-tone-generator-ideal` | Mode ideal |
| SCOPE1 | `output.audio-spectrum-report` | Spectrum report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `generator:VCC`, `report:VCC`
- **GND:** `source:-`, `settings:GND`, `generator:GND`, `report:GND`, `ground:0`
- **TONE_CONFIG:** `settings:CONFIG`, `generator:CONFIG`
- **TONE_OUT:** `generator:OUT`, `report:IN`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-audio-tone-spectrum`
- Engine: Ideal sampled audio tone and DFT estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `coherent-sampled-sine-spectrum-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41185184995

Recorded expected result:

```json
{
  "kind": "audio-tone-spectrum",
  "waveform": "sine",
  "frequencyHz": 1000,
  "amplitudePeakV": 1,
  "offsetV": 2.5,
  "sampleRateHz": 48000,
  "sampleCount": 480,
  "durationSeconds": 0.01,
  "positiveZeroCrossings": 10,
  "negativeZeroCrossings": 10,
  "totalZeroCrossings": 20,
  "measuredFrequencyHz": 1000,
  "fundamentalAmplitudeV": 1,
  "secondHarmonicBelowV": 1e-12,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal digital tone and DFT estimate only. Oscillator startup and stability, amplifier distortion, speaker and acoustic response, analog anti-alias filters, firmware, and hardware behavior are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/092-audio-tone-generator.adigun.json`.