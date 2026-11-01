# 029 — Dual-comparator window indicator

## Purpose

Generate 5 V divider limits at 1.667 V and 3.333 V and light an LED only for input values within the window.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| VIN | `power.dc-source` | 2.5 V |
| U1 | `active.comparator-dual-ideal` | Ideal comparator: Vin > lower threshold |
| U2 | `active.comparator-dual-ideal` | Ideal comparator: Vin < upper threshold |
| R1 | `passive.resistor` | 10 kΩ |
| R2 | `passive.resistor` | 10 kΩ |
| R3 | `passive.resistor` | 10 kΩ |
| U3 | `active.logic-and-ideal` | Ideal two-input AND |
| R4 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `lower:VCC`, `upper:VCC`, `and:VCC`, `rtop:1`
- **UPPER_LIMIT:** `rtop:2`, `rmid:1`, `upper:IN+`
- **LOWER_LIMIT:** `rmid:2`, `rbottom:1`, `lower:IN-`
- **INPUT:** `signal:+`, `lower:IN+`, `upper:IN-`
- **LOWER_OK:** `lower:OUT`, `and:A`
- **UPPER_OK:** `upper:OUT`, `and:B`
- **WINDOW_OUT:** `and:Y`, `rled:1`
- **LED:** `rled:2`, `led:A`
- **GND:** `supply:-`, `signal:-`, `lower:GND`, `upper:GND`, `and:GND`, `rbottom:2`, `led:K`, `ground:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-window-comparator`
- Engine: Ideal dual-comparator window detector
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-window-comparator-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41170285376

Recorded expected result:

```json
{
  "supplyVoltage": 5,
  "inputVoltage": 2.5,
  "lowerThresholdV": 1.6666666666666667,
  "upperThresholdV": 3.3333333333333335,
  "lowerComparatorHigh": true,
  "upperComparatorHigh": true,
  "windowActive": true,
  "ledOn": true
}
```

## Safety and model limits

Ideal educational comparator and logic-gate model only. It omits propagation delay, threshold tolerances, offset, noise, loading, and component-specific behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/029-window-comparator.adigun.json`.