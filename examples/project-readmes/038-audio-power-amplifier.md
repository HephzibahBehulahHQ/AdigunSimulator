# 038 — Generic low-voltage class-AB audio amplifier

## Purpose

Drive a nominal 8 Ω + 0.5 mH speaker model from a 9 V, gain-20 low-voltage class-AB amplifier using a 220 µF output coupling capacitor; test audio-band response, speaker RMS current/power, and configured output clipping.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 9 V |
| VIN | `power.ac-source` | 80 mV |
| U1 | `active.audio-amp-generic` | Av 20; Swing 2 V; Q 4 mA; f 1 kHz |
| COUT | `passive.capacitor` | 220 µF |
| SP1 | `passive.speaker-r-l-generic` | R 8 Ω; L 0.5 mH |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `amplifier:VCC`
- **GND:** `supply:-`, `input:-`, `amplifier:GND`, `speaker:-`, `ground:0`
- **AUDIO_IN:** `input:+`, `amplifier:IN`
- **AMP_OUT:** `amplifier:OUT`, `coupling:1`
- **SPEAKER_PLUS:** `coupling:2`, `speaker:+`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-audio-power-amplifier`
- Engine: Generic low-voltage class-AB amplifier and R-L speaker estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-audio-power-amp-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41172329608

Recorded expected result:

```json
{
  "supplyVoltage": 9,
  "inputAmplitudeV": 0.08,
  "frequencyHz": 1000,
  "gainVPerV": 20,
  "requestedOutputAmplitudeV": 1.6,
  "clipped": false,
  "outputBiasVoltageV": 4.5,
  "speakerVoltageRmsV": 1.163489393852444,
  "speakerCurrentRmsA": 0.1353722172005118,
  "speakerRealPowerW": 0.1466050975182603
}
```

## Safety and model limits

Generic ideal LM386-class estimate, not a manufacturer-specific LM386 model. It uses a 9 V supply, gain 20, 2 V peak output swing, 4 mA quiescent-current parameter, and an 8 Ω + 0.5 mH nominal speaker model. THD, actual output-stage current limits, mechanical sound, thermal behavior, supply decoupling parasitics, and device-specific ratings are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/038-audio-power-amplifier.adigun.json`.