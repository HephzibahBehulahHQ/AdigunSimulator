# 002 — Two-LED polarity indicator

## Purpose

Use red and green LEDs in opposite orientations, each with a 330 Ω series resistor, to indicate the polarity of a signed 5 V DC source.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| R2 | `passive.resistor` | 330 Ω |
| D2 | `diode.led-green` | Vf 2.1 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source-1:+`, `resistor-red:1`, `resistor-green:1`
- **RED_A:** `resistor-red:2`, `led-red:A`
- **GND:** `led-red:K`, `led-green:A`, `source-1:-`, `ground-1:0`
- **GREEN_K:** `led-green:K`, `resistor-green:2`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-two-led-polarity-indicator`
- Engine: Analytical anti-parallel LED polarity indicator
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-led-polarity-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41152385551

Recorded expected result:

```json
{
  "positive5V": {
    "polarity": "positive",
    "redLedOn": true,
    "greenLedOn": false,
    "redCurrentA": 0.00909090909090909,
    "greenCurrentA": 0
  },
  "negative5V": {
    "polarity": "negative",
    "redLedOn": false,
    "greenLedOn": true,
    "redCurrentA": 0,
    "greenCurrentA": 0.008787878787878787
  },
  "zeroV": {
    "polarity": "zero",
    "redLedOn": false,
    "greenLedOn": false,
    "redCurrentA": 0,
    "greenCurrentA": 0
  }
}
```

## Safety and model limits

Ideal educational model using generic LEDs with nominal 2.0 V and 2.1 V forward drops. It omits reverse breakdown, tolerance, thermal behavior, ratings, and physical hardware validation.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/002-two-led-polarity-indicator.adigun.json`.