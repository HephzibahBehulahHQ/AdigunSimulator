# 091 — Electret microphone audio level meter

## Purpose

Bias a generic electret small-signal source, apply bounded ideal gain and full-wave envelope detection, and compare calibrated sine levels against ten explicit LED thresholds.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| MIC1 | `sensor.electret-mic-generic` | Imic 0.5 mA; Vsig 10 mV; f 1 kHz; Rs 2.2 kΩ |
| R1 | `passive.resistor` | 2.2 kΩ |
| U1 | `active.electret-envelope-preamp-ideal` | Gain 20 |
| BR1 | `active.audio-envelope-rectifier-ideal` | Mode full-wave; DropV 0 V |
| LED1 | `output.audio-level-ledbar-ideal` | Segments 10; ThresholdsV 0.02,0.04,0.06,0.08,0.10,0.12,0.14,0.16,0.18,0.20 |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `bias:1`, `preamp:VCC`, `rectifier:VCC`, `bargraph:VCC`
- **MIC_BIAS:** `bias:2`, `microphone:VCC`
- **GND:** `source:-`, `microphone:GND`, `preamp:GND`, `rectifier:GND`, `bargraph:GND`, `ground:0`
- **MIC_SIGNAL:** `microphone:OUT`, `preamp:IN`
- **PREAMP_OUT:** `preamp:OUT`, `rectifier:IN`
- **RECTIFIED:** `rectifier:OUT`, `bargraph:IN`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-electret-mic-meter`
- Engine: Ideal electret envelope and calibrated LED meter estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-electret-audio-envelope-led-meter-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41184828300

Recorded expected result:

```json
{
  "kind": "electret-mic-meter",
  "micBiasCurrentMa": 0.5,
  "micBiasResistorOhm": 2200,
  "micSupplyVoltageV": 3.9,
  "inputPeakV": 0.01,
  "frequencyHz": 1000,
  "gain": 20,
  "preampPeakV": 0.2,
  "rectifierDropV": 0,
  "rectifiedPeakV": 0.2,
  "ledSegmentsOn": 10,
  "calibrationInputLevelsMv": [
    1,
    5,
    10,
    20
  ],
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal electret signal-chain estimate only. Acoustic sensitivity/noise, preamplifier bandwidth/noise, rectifier ripple and diode behavior, analog clipping recovery, LED current limiting, firmware and hardware behavior are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/091-electret-microphone-meter.adigun.json`.