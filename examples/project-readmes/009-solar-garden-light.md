# 009 — Solar garden light day/night model

## Purpose

Estimate solar-cell charging through a Schottky diode during daylight and switch a battery-powered LED through an LDR divider and ideal MOSFET at night; test both light extremes and energy accounting.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| PV1 | `power.solar-cell` | Voc 6 V; Isc 100 mA |
| BAT1 | `power.rechargeable-battery` | 3.7 V |
| D1 | `diode.schottky` | Vf 0.3 V |
| R1 | `passive.ldr` | Rbright 10 kΩ; Rdark 1 MΩ; light 100% |
| R2 | `passive.resistor` | 100 kΩ |
| R3 | `passive.resistor` | 330 Ω |
| Q1 | `active.nmos-switch` | Vth 2.0 V |
| D2 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **SOLAR_POS:** `solar-1:+`, `diode-1:A`
- **BAT_POS:** `diode-1:K`, `battery-1:+`, `gate-resistor-1:1`, `led-resistor-1:1`
- **GATE:** `gate-resistor-1:2`, `ldr-1:1`, `mosfet-1:G`
- **LED_A:** `led-resistor-1:2`, `led-1:A`
- **LED_K:** `led-1:K`, `mosfet-1:D`
- **GND:** `solar-1:-`, `battery-1:-`, `ldr-1:2`, `mosfet-1:S`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-solar-garden-light`
- Engine: Analytical solar garden-light day/night and charge estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `solar-garden-light-fixed-battery-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41154318481

Recorded expected result:

```json
{
  "batteryVoltage": 3.7,
  "illuminationPercent": 100,
  "ldrResistance": 10000,
  "gateVoltage": 0.33636363636363636,
  "mosfetThresholdVoltage": 2,
  "mosfetConducting": false,
  "ledOn": false,
  "ledCurrentA": 0,
  "solarOpenCircuitVoltage": 6,
  "solarShortCircuitCurrentA": 0.1,
  "effectiveSolarVoc": 6,
  "effectiveSolarIsc": 0.1,
  "chargeHeadroomV": 2,
  "chargeCurrentA": 0.03333333333333334,
  "batteryCurrentIntoBatteryA": 0.03333333333333334,
  "solarPowerAtDiodeInputW": 0.13333333333333336,
  "diodePowerW": 0.010000000000000002,
  "batteryChargePowerW": 0.12333333333333336,
  "solarPowerBalanceW": 0,
  "ledPowerBalanceW": 0,
  "daylight": {
    "illuminationPercent": 100,
    "ldrResistance": 10000,
    "gateVoltage": 0.33636363636363636,
    "mosfetConducting": false,
    "ledOn": false,
    "chargeCurrentA": 0.03333333333333334,
    "solarPowerAtDiodeInputW": 0.13333333333333336,
    "diodePowerW": 0.010000000000000002,
    "batteryChargePowerW": 0.12333333333333336,
    "solarPowerBalanceW": 0
  },
  "night": {
    "illuminationPercent": 0,
    "ldrResistance": 1000000,
    "gateVoltage": 3.3636363636363638,
    "mosfetConducting": true,
    "ledOn": true,
    "chargeCurrentA": 0,
    "ledCurrentA": 0.005151515151515152,
    "batteryCurrentIntoBatteryA": -0.005151515151515152,
    "ledResistorPowerW": 0.00875757575757576,
    "ledPowerW": 0.010303030303030303,
    "batteryPowerToLedW": 0.019060606060606063,
    "ledPowerBalanceW": 0
  }
}
```

## Safety and model limits

Educational quasi-static model only. The battery is a fixed-voltage sink/source; no state-of-charge, chemistry, charge-control, cell curvature, twilight hysteresis, component ratings, thermal behavior, or hardware safety is modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/009-solar-garden-light.adigun.json`.