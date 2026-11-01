# 065 — Uno-class ultrasonic ranger and OLED result

## Purpose

Convert supplied round-trip echo times into distances using 343 m/s sound speed and display valid in-range results or an out-of-range status.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.mcu-uno-ideal` | Program Ultrasonic ranger; Trigger D9; Echo D8; Display D7 |
| US1 | `sensor.ultrasonic-echo-ideal` | Echo 5882 us; Minimum 20 mm; Maximum 4000 mm |
| OLED1 | `output.oled-text-sink-ideal` | Distance result |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`, `sensor:VCC`, `oled:VCC`
- **GND:** `supply:-`, `mcu:GND`, `sensor:GND`, `oled:GND`, `ground:0`
- **TRIG:** `mcu:D9`, `sensor:TRIG`
- **ECHO:** `sensor:ECHO`, `mcu:D8`
- **OLED_DATA:** `mcu:D7`, `oled:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-arduino-ultrasonic-ranger`
- Engine: Ideal Uno-class ultrasonic time-of-flight estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-ultrasonic-echo-range-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41177254361

Recorded expected result:

```json
{
  "soundSpeedMPerS": 343,
  "minimumEchoUs": 117,
  "nominalEchoUs": 5882,
  "maximumEchoUs": 23323,
  "outOfRangeEchoUs": 25000,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal time-of-flight arithmetic and text sink; no Arduino C++ execution, trigger waveform, transducer physics, sound-speed temperature correction, reflections, or physical display behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/065-arduino-ultrasonic-ranger.adigun.json`.