# 021 — 555 astable LED blinker

## Purpose

Model an ideal NE555 astable using RA=10 kΩ, RB=10 kΩ, and CT=100 µF; verify the calculated frequency, high/low times, duty cycle, and LED average current.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.ne555` | NE555 astable ideal model |
| RA | `passive.resistor` | 10 kΩ |
| RB | `passive.resistor` | 10 kΩ |
| CT | `passive.capacitor` | 100 µF |
| CCTRL | `passive.capacitor` | 10 nF |
| RLED | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source-1:+`, `timer-1:8`, `timer-1:4`, `ra-1:1`
- **DISCHARGE:** `timer-1:7`, `ra-1:2`, `rb-1:1`
- **TIMING:** `timer-1:2`, `timer-1:6`, `rb-1:2`, `timing-capacitor-1:1`
- **OUTPUT:** `timer-1:3`, `led-resistor-1:1`
- **LED_A:** `led-resistor-1:2`, `led-1:A`
- **CONTROL:** `timer-1:5`, `control-capacitor-1:1`
- **GND:** `source-1:-`, `timer-1:1`, `timing-capacitor-1:2`, `control-capacitor-1:2`, `led-1:K`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-555-astable-blinker`
- Engine: Analytical ideal 555 astable timing estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ne555-astable-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41168597440

Recorded expected result:

```json
{
  "raOhm": 10000,
  "rbOhm": 10000,
  "timingCapacitanceF": 0.0001,
  "frequencyHz": 0.481000481000481,
  "dutyCycle": 0.6666666666666666,
  "ledBlinking": true
}
```

## Safety and model limits

Ideal timer equation and output model only. It omits timer saturation, tolerances, startup, control-pin noise, component ratings, thermal effects, and hardware qualification.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/021-555-astable-blinker.adigun.json`.