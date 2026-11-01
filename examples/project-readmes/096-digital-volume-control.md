# 096 — Digital potentiometer audio volume control

## Purpose

Apply a stepped linear digital-potentiometer attenuation to a bounded sine input while accounting for wiper resistance, source resistance, and a finite output load; verify monotonic level changes across command positions.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SIG1 | `input.digital-volume-audio-source` | AmplitudeV 0.5; FrequencyHz 1000; SourceResistance 1 kΩ |
| U1 | `active.digital-pot-volume-control-ideal` | Law linear; Rtotal 10 kΩ; Steps 11; Command 5; Rwiper 100 Ω |
| R1 | `passive.resistor` | 100 kΩ |
| SCOPE1 | `output.audio-volume-report` | Volume report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `pot:VCC`, `report:VCC`
- **GND:** `source:-`, `fixture:GND`, `pot:GND`, `pot:B`, `report:GND`, `load:2`, `ground:0`
- **AUDIO_IN:** `fixture:OUT`, `pot:A`
- **VOLUME_OUT:** `pot:W`, `report:IN`, `load:1`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-digital-volume-control`
- Engine: Loaded linear digital potentiometer audio attenuation estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `loaded-linear-digital-pot-audio-attenuator-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41185946165

Recorded expected result:

```json
{
  "kind": "digital-volume-control",
  "frequencyHz": 1000,
  "inputPeakV": 0.5,
  "command": 5,
  "steps": 11,
  "commandPercent": 50,
  "loadResistanceOhm": 100000,
  "monotonicControl": true,
  "deviceProtocolModeled": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

Generic loaded linear digital-potentiometer model only. It does not implement a specific device protocol or logarithmic audio taper and does not model noise, distortion, bandwidth, firmware, or physical behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/096-digital-volume-control.adigun.json`.