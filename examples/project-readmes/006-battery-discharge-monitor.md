# 006 — 9 V battery discharge monitor

## Purpose

Compare a divided 9 V battery signal with an ideal 3.75 V reference and assert a current-limited LED alarm below a 7.5 V battery threshold; test a ±0.1 V crossing.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 9 V |
| R1 | `passive.resistor` | 10 kΩ |
| R2 | `passive.resistor` | 10 kΩ |
| U1 | `active.comparator-ideal` | Vref 3.75 V |
| R3 | `passive.resistor` | 1 kΩ |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VBAT:** `battery-1:+`, `upper-1:1`, `comparator-1:VCC`
- **SENSE:** `upper-1:2`, `lower-1:1`, `comparator-1:SENSE`
- **ALARM:** `comparator-1:OUT`, `series-1:1`
- **LED_A:** `series-1:2`, `led-1:A`
- **GND:** `battery-1:-`, `lower-1:2`, `comparator-1:GND`, `led-1:K`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-battery-discharge-monitor`
- Engine: Analytical ideal low-battery comparator and divider
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-battery-monitor-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41153365413

Recorded expected result:

```json
{
  "nominal9V": {
    "batteryVoltage": 9,
    "senseVoltage": 4.5,
    "tripVoltage": 3.75,
    "tripBatteryVoltage": 7.5,
    "lowBattery": false,
    "ledOn": false,
    "dividerCurrentA": 0.00045,
    "sourceCurrentA": 0.00045,
    "sourcePowerW": 0.00405,
    "powerBalanceW": 0
  },
  "aboveThreshold7_6V": {
    "batteryVoltage": 7.6,
    "senseVoltage": 3.8,
    "tripVoltage": 3.75,
    "tripBatteryVoltage": 7.5,
    "lowBattery": false,
    "ledOn": false,
    "dividerCurrentA": 0.00038
  },
  "belowThreshold7_4V": {
    "batteryVoltage": 7.4,
    "senseVoltage": 3.7,
    "tripVoltage": 3.75,
    "tripBatteryVoltage": 7.5,
    "lowBattery": true,
    "ledOn": true,
    "ledCurrentA": 0.0054,
    "dividerCurrentA": 0.00037,
    "sourceCurrentA": 0.00577,
    "dividerPowerW": 0.002738,
    "ledResistorPowerW": 0.02916,
    "ledPowerW": 0.0108,
    "sourcePowerW": 0.042698,
    "powerBalanceW": 0
  }
}
```

## Safety and model limits

Ideal educational comparator and battery-divider model only. It does not model a physical comparator, hysteresis, input offset/bias, propagation, output limits, battery chemistry, tolerance, thermal effects, or hardware safety.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/006-battery-discharge-monitor.adigun.json`.