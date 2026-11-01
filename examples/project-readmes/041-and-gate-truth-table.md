# 041 — Two-input AND gate truth table

## Purpose

Exercise an ideal five-volt two-input AND gate for all four static input vectors and drive a red LED through 330 Ω; test the truth table, threshold, and output current.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| VA | `power.dc-source` | 0 V |
| VB | `power.dc-source` | 0 V |
| U1 | `active.logic-and-ideal` | Ideal AND logic; 5 V supply |
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

- Stable test ID: `core-and-gate-truth-table`
- Engine: Ideal static two-input AND truth-table estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-and-gate-truth-table-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41172827850

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
      "y": 0
    },
    {
      "a": 5,
      "b": 0,
      "y": 0
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

Generic ideal static AND-gate model, not a manufacturer-specific 74xx device. It uses a 50% supply threshold and ideal rail-to-rail output. It omits propagation delay, output drive limits, input leakage, real logic-family thresholds, switching noise, and part ratings.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/041-and-gate-truth-table.adigun.json`.