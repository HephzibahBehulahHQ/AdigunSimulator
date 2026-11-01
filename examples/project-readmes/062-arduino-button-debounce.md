# 062 — Uno-class debounced button toggle

## Purpose

Reject short digital bounce sequences and toggle the D13 output only after each three-sample stable press.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.mcu-uno-ideal` | Program Button debounce; Input D2; Output D13; Mode Toggle; Stable 3 |
| SIG1 | `input.digital-sample-sequence` | Samples 0,1,0,1,1,1,0,0,0,1,1,1; Rate 1000 Hz |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`
- **GND:** `supply:-`, `mcu:GND`, `button:GND`, `led:K`, `ground:0`
- **BUTTON:** `button:OUT`, `mcu:D2`
- **D13:** `mcu:D13`, `resistor:1`
- **LED:** `resistor:2`, `led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-arduino-button-debounce`
- Engine: Ideal Uno-class sampled button debounce model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-button-debounce-toggle-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41176694806

Recorded expected result:

```json
{
  "stableSamples": 3,
  "sampleRateHz": 1000,
  "acceptedPresses": 2,
  "toggleCount": 2,
  "finalOutput": "off",
  "firmwareExecuted": false
}
```

## Safety and model limits

Configured sampled digital behavior only; it does not execute Arduino C++ or model switch contacts, analog RC behavior, CPU scheduling, or electrical noise.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/062-arduino-button-debounce.adigun.json`.