# 035 — NPN relay-coil driver with flyback

## Purpose

Drive an Omron G5V-1 DC12 relay coil from 12 V with an NPN stage and 5 V drive. Estimate coil current, the nominal pull-in point, and electrical flyback decay.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| VIN | `power.dc-source` | 5 V |
| Q1 | `active.npn-small-signal` | β 100; VBE 0.7 V; VCEsat 0.2 V |
| RB | `passive.resistor` | 3.3 kΩ |
| K1 | `relay.omron-g5v1-dc12-coil` | 12 V; 960 Ω |
| D1 | `diode.schottky` | Vf 0.3 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `relay:COIL1`, `flyback:K`
- **CONTROL:** `control:+`, `base-resistor:1`
- **BASE:** `base-resistor:2`, `npn:B`
- **COLLECTOR:** `relay:COIL2`, `npn:C`, `flyback:A`
- **GND:** `supply:-`, `control:-`, `npn:E`, `ground:0`

## Views and physical-layout status

Mount K1 off board and attach insulated pigtails to pins 2 and 9 only. Q1 is the 2N3904BU with formed leads, RB is 3.3 kΩ, and the 1N5819 cathode stripe goes to 12 V. Use a current-limited supply and a shared return for the 0–5 V control.

The 57 × 40 mm PCB uses both copper layers. Place the relay mounting mark at the pin 1/10 end. Pins 2 and 9 connect the coil, and pins 1, 5, 6, and 10 are isolated. The fabrication export includes both copper Gerbers, outline, plated drill data, and BOM. The scope shows modeled collector DC in both states. [Omron package drawing](https://components.omron.com/eu-en/sites/components.omron.com.eu/files/datasheet_pdf/K048-E1.pdf)

## Acceptance test and expected result

- Stable test ID: `core-npn-relay-driver`
- Engine: Generic NPN relay-coil and flyback estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-npn-relay-driver-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41171584960

Recorded expected result:

```json
{
  "supplyVoltage": 12,
  "controlVoltage": 5,
  "baseCurrentA": 0.001303030303030303,
  "coilCurrentA": 0.012291666666666668,
  "transistorSaturated": true,
  "collectorVoltageV": 0.2,
  "relayPullInThresholdA": 0.01,
  "relayEnergizedEstimate": true,
  "flybackClampVoltageV": 12.3,
  "coilStoredEnergyJ": 0.00012313433159722223,
  "timeConstantS": 0.0016979166666666666,
  "turnOffCurrentAtOneTimeConstantA": 0.004324313789765054,
  "turnOffCurrentAtThreeTimeConstantsA": 0.00031502450755328517
}
```

## Safety and model limits

The model uses the 960 Ω nominal coil resistance, a 1.63 H reference inductance and a nominal current derived from the 9.6 V must-operate point. Transistor and diode behavior are idealized. The decay estimate describes coil current only. Hardware timing, contact motion, temperature effects, and bench characterization remain outside this result. [Archived Omron coil data](https://app.mectronic.com/dsheet/G5V1DC24_Omron.pdf)

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/035-npn-relay-driver.adigun.json`.