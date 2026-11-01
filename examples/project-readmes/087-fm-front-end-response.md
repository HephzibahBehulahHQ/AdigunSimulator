# 087 — FM radio front-end response concept

## Purpose

Sweep a bounded 88–108 MHz small-signal input through an ideal antenna placeholder, tuned band-pass response, and linear gain block; report the response peak at the configured center frequency.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SIG1 | `input.fm-frequency-sweep` | FrequenciesMHz 88,94,98,100,102,106,108; AmplitudeV 0.01; Mode small-signal sweep |
| ANT1 | `passive.fm-antenna-ideal` | Mode ideal; CenterMHz 100 |
| LC1 | `passive.fm-tuning-network-ideal` | Mode bandpass; CenterMHz 100; Q 8 |
| U1 | `active.fm-audio-gain-ideal` | Mode linear; GainDb 12 |
| DISP1 | `output.fm-response-report` | Frequency response |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `amplifier:VCC`, `report:VCC`
- **GND:** `supply:-`, `sweep:GND`, `antenna:GND`, `tuner:GND`, `amplifier:GND`, `report:GND`, `ground:0`
- **RF_INPUT:** `sweep:RF`, `antenna:INPUT`
- **ANTENNA_OUTPUT:** `antenna:OUTPUT`, `tuner:RF_IN`
- **TUNED_RF:** `tuner:RF_OUT`, `amplifier:INPUT`
- **GAIN_OUTPUT:** `amplifier:OUTPUT`, `report:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-fm-front-end-response`
- Engine: Small-signal ideal FM tuned response estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-fm-tuned-response-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41183981655

Recorded expected result:

```json
{
  "kind": "fm-front-end-response",
  "centerFrequencyMHz": 100,
  "q": 8,
  "gainDb": 12,
  "inputAmplitudeV": 0.01,
  "peakFrequencyMHz": 100,
  "peakResponseDb": 12,
  "peakOutputAmplitudeV": 0.039810717055349734,
  "rfTransmitted": false,
  "demodulationModeled": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal small-signal response concept only. No antenna impedance/coupling, FM modulation or demodulation, local oscillator, IF chain, noise, regional band compliance, RF transmission, firmware, or hardware behavior is modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/087-fm-front-end-response.adigun.json`.