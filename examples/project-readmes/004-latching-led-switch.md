# 004 — Latching LED switch

## Purpose

Model an SPDT switch that selects an illuminated or off state for a low-voltage LED circuit.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SW1 | `input.spdt-switch` | Position A |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source-1:+`, `switch-1:A`
- **SW_OUT:** `switch-1:COM`, `resistor-1:1`
- **LED_A:** `resistor-1:2`, `led-1:A`
- **GND:** `switch-1:B`, `led-1:K`, `source-1:-`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-latching-led-switch`
- Engine: Analytical ideal latching SPDT LED switch
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-latching-led-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41152593055

Recorded expected result:

```json
{
  "switchPosition": "A",
  "ledOn": true,
  "sourceVoltage": 5,
  "ledVf": 2,
  "ledCurrentA": 0.00909090909090909,
  "sourceCurrentA": 0.00909090909090909,
  "powerBalanceW": 0,
  "positionA": {
    "switchPosition": "A",
    "ledOn": true,
    "ledCurrentA": 0.00909090909090909,
    "sourceCurrentA": 0.00909090909090909,
    "powerBalanceW": 0
  },
  "positionB": {
    "switchPosition": "B",
    "ledOn": false,
    "ledCurrentA": 0,
    "sourceCurrentA": 0,
    "powerBalanceW": 0
  }
}
```

## Safety and model limits

Ideal educational low-voltage model only. It omits switch contact resistance/bounce, part tolerances and ratings, thermal effects, and physical hardware validation.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/004-latching-led-switch.adigun.json`.