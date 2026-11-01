# 105 — BMS cell monitor

## Purpose

Compare a three-cell stack fixture against configurable over/under-voltage thresholds, calculate stack/min/max values, flag high-cell balance requests, and verify that warnings do not claim physical protection actuation.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| CELL1 | `input.bms-cell-stack-fixture` | Cell1 3.70 V; Cell2 3.72 V; Cell3 3.71 V; Mode 3S |
| U1 | `active.bms-cell-monitor-ideal` | Mode 3S; OV 4.20 V; UV 3.00 V; BalanceDelta 0.03 V; MaxCell 4.35 V |
| SCOPE1 | `output.bms-cell-report` | Cell monitor report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `fixture:VCC`, `monitor:VCC`, `report:VCC`
- **GND:** `source:-`, `fixture:GND`, `monitor:GND`, `report:GND`, `ground:0`
- **CELL1:** `fixture:C1`, `monitor:C1`
- **CELL2:** `fixture:C2`, `monitor:C2`
- **CELL3:** `fixture:C3`, `monitor:C3`
- **STATUS:** `monitor:STATUS`, `report:STATUS`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-bms-cell-monitor`
- Engine: Ideal three-cell BMS threshold and passive-balance request estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-three-cell-bms-threshold-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41188070373

Recorded expected result:

```json
{
  "kind": "bms-cell-monitor",
  "chemistryModel": "not modeled",
  "cellCount": 3,
  "cellReports": [
    {
      "cell": 1,
      "voltageV": 3.7,
      "overVoltage": false,
      "underVoltage": false,
      "balanceRequested": false
    },
    {
      "cell": 2,
      "voltageV": 3.72,
      "overVoltage": false,
      "underVoltage": false,
      "balanceRequested": false
    },
    {
      "cell": 3,
      "voltageV": 3.71,
      "overVoltage": false,
      "underVoltage": false,
      "balanceRequested": false
    }
  ],
  "minimumCellV": 3.7,
  "maximumCellV": 3.72,
  "stackVoltageV": 11.13,
  "overVoltageThresholdV": 4.2,
  "underVoltageThresholdV": 3,
  "balanceDeltaV": 0.03,
  "faultState": "normal",
  "overVoltageCells": [],
  "underVoltageCells": [],
  "cellsToBalance": [],
  "balancingActuated": false,
  "protectionActuated": false
}
```

## Safety and model limits

Ideal cell-voltage threshold estimator only. It does not model cell chemistry/state of charge, measurement error, balancing current, contactors, thermal behavior, fault timing, or BMS safety qualification; reported actions are not actuated.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/105-bms-cell-monitor.adigun.json`.