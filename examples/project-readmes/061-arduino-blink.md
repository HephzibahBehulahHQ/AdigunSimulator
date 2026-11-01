# 061 — Uno-class D13 blink behavior

## Purpose

Produce a deterministic configured D13 high/low trace and estimate the series LED current for a 500 ms/500 ms blink cycle.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.mcu-uno-ideal` | Program Blink; Pin D13; High 500 ms; Low 500 ms; Runtime 2000 ms |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`
- **GND:** `supply:-`, `mcu:GND`, `led:K`, `ground:0`
- **D13:** `mcu:D13`, `resistor:1`
- **LED:** `resistor:2`, `led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-arduino-blink`
- Engine: Ideal Uno-class GPIO blink sequence
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-uno-gpio-blink-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41176513029

Recorded expected result:

```json
{
  "pin": "D13",
  "highMs": 500,
  "lowMs": 500,
  "runtimeMs": 2000,
  "trace": [
    "HIGH",
    "LOW",
    "HIGH",
    "LOW"
  ],
  "frequencyHz": 1,
  "firmwareExecuted": false
}
```

## Safety and model limits

Configured ideal GPIO behavior model; Arduino C++ is not executed. CPU timing, output resistance, PWM, interrupts, and board-specific limits are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/061-arduino-blink.adigun.json`.