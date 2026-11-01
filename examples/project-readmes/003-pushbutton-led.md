# 003 — 5 V pushbutton LED with pull-down

## Purpose

Model the catalogue pushbutton LED circuit with a 5 V ideal source, a normally-open series button, a 330 Ω LED resistor, a 10 kΩ pull-down, and a red LED.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SW1 | `input.pushbutton` | Normally open |
| R1 | `passive.resistor` | 330 Ω |
| R2 | `passive.resistor` | 10 kΩ |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source-1:+`, `switch-1:1`
- **SW_OUT:** `switch-1:2`, `resistor-series:1`, `resistor-pulldown:1`
- **LED_A:** `resistor-series:2`, `led-1:A`
- **GND:** `led-1:K`, `source-1:-`, `resistor-pulldown:2`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-pushbutton-led`
- Engine: Analytical ideal pushbutton LED circuit
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-pushbutton-led-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41152070056

Recorded expected result:

```json
{
  "switchState": "normally-open",
  "sourceVoltage": 5,
  "ledVf": 2,
  "ledOn": false,
  "ledCurrentA": 0,
  "pullDownCurrentA": 0,
  "sourceCurrentA": 0,
  "outputVoltageV": 0,
  "ledPowerW": 0,
  "sourcePowerW": 0,
  "powerBalanceW": 0,
  "normallyOpen": {
    "switchState": "normally-open",
    "ledOn": false,
    "ledCurrentA": 0,
    "sourceCurrentA": 0
  },
  "pressed": {
    "switchState": "pressed",
    "ledOn": true,
    "ledCurrentA": 0.00909090909090909,
    "pullDownCurrentA": 0.0005,
    "sourceCurrentA": 0.00959090909090909,
    "sourcePowerW": 0.04795454545454545,
    "powerBalanceW": 0
  }
}
```

## Safety and model limits

Ideal low-voltage educational model only. It omits switch bounce, component tolerances and ratings, thermal effects, physical breadboard mapping, and hardware safety qualification.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/003-pushbutton-led.adigun.json`.