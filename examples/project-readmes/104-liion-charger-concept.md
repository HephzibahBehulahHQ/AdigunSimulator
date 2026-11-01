# 104 — Li-ion charger concept

## Purpose

Classify a configured single-cell Li-ion charger as constant-current, constant-voltage taper, terminated, or no-cell, and enforce input headroom, cell voltage, temperature, current, and connected-path limits.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| BAT1 | `input.liion-cell-fixture` | CellState present; CellV 3.50 V; SetVoltage 4.20 V; ChargeCurrent 500 mA; TerminationCurrent 50 mA; TemperatureC 25; Efficiency 90%; Mode CC/CV |
| U1 | `active.liion-cccv-charger-ideal` | Chemistry Li-ion; Mode CC/CV; SetVoltage 4.20 V; MaxCharge 500 mA; Termination 50 mA; TempLow 0 C; TempHigh 45 C; Efficiency 90% |
| SCOPE1 | `output.liion-charge-report` | Charge phase report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VIN:** `source:+`, `charger:VIN`, `cell:VCC`, `charger:EN`
- **GND:** `source:-`, `cell:GND`, `charger:GND`, `report:GND`, `ground:0`
- **BATTERY:** `cell:CELL`, `charger:BAT`, `report:BAT`
- **STATUS:** `charger:STATUS`, `report:STATUS`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-liion-charger-concept`
- Engine: Ideal Li-ion CC/CV phase and limit estimator
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-single-cell-liion-cccv-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41187803742

Recorded expected result:

```json
{
  "kind": "liion-charge",
  "cellPresent": true,
  "phase": "CC",
  "inputVoltageV": 5,
  "cellVoltageV": 3.5,
  "setVoltageV": 4.2,
  "chargeCurrentA": 0.5,
  "terminationCurrentA": 0.05,
  "temperatureC": 25,
  "temperatureWindowC": [
    0,
    45
  ],
  "batteryPowerW": 1.75,
  "inputCurrentA": 0.3888888888888889,
  "inputPowerW": 1.9444444444444444,
  "chargerLossW": 0.19444444444444442,
  "assumedEfficiencyPercent": 90,
  "chargingEnabled": true,
  "hardwareModeled": false
}
```

## Safety and model limits

Ideal charger-state estimator only. It is not a charger IC, battery chemistry/state-of-charge model, balancing system, safety qualification, or physical charging instruction.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/104-liion-charger-concept.adigun.json`.