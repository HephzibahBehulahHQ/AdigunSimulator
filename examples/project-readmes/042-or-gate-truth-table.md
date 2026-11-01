# 042 — Two-input OR gate truth table

## Purpose

Exercise a generic ideal five-volt two-input OR gate across all four static input vectors and drive a red LED through 330 Ω; test that either high input asserts the output.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| VA | `power.dc-source` | 0 V |
| VB | `power.dc-source` | 0 V |
| U1 | `active.logic-or-ideal` | Ideal OR logic; 5 V supply |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `gate:VCC`
- **GND:** `supply:-`, `input-a:-`, `input-b:-`, `gate:GND`, `led:K`, `ground:0`
- **A:** `input-a:+`, `gate:A`
- **B:** `input-b:+`, `gate:B`
- **Y:** `gate:Y`, `output-resistor:1`
- **LED_A:** `output-resistor:2`, `led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-or-gate-truth-table`
- Engine: Ideal static two-input OR truth-table estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-or-gate-truth-table-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41173002014

Recorded expected result:

```json
{
  "supplyVoltage": 5,
  "logicThresholdV": 2.5,
  "truthTable": [
    {
      "a": 0,
      "b": 0,
      "y": 0
    },
    {
      "a": 0,
      "b": 5,
      "y": 5
    },
    {
      "a": 5,
      "b": 0,
      "y": 5
    },
    {
      "a": 5,
      "b": 5,
      "y": 5
    }
  ],
  "ledCurrentWhenHighA": 0.00909090909090909
}
```

## Safety and model limits

Generic ideal static OR-gate model, not a manufacturer-specific 74xx device. It uses a 50% supply threshold and ideal rail-to-rail output, and omits propagation delay, output drive limits, input leakage, logic-family thresholds, switching noise, and part ratings.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/042-or-gate-truth-table.adigun.json`.