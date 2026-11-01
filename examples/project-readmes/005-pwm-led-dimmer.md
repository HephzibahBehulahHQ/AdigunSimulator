# 005 — PWM LED dimmer with a low-side MOSFET

## Purpose

Sweep a 1 kHz ideal PWM command through 10%, 50%, and 90% duty and confirm that average LED current changes in proportion to duty for an ideal low-side MOSFET switch.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| PWM1 | `power.pwm-source` | 1 kHz, 50%, 5 V |
| Q1 | `active.nmos-switch` | Vth 2.0 V |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source-1:+`, `resistor-1:1`
- **LED_A:** `resistor-1:2`, `led-1:A`
- **LED_K:** `led-1:K`, `mosfet-1:D`
- **GATE:** `pwm-1:+`, `mosfet-1:G`
- **GND:** `source-1:-`, `pwm-1:-`, `mosfet-1:S`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-pwm-led-dimmer`
- Engine: Analytical PWM LED average-current model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-pwm-led-average-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41152946819

Recorded expected result:

```json
{
  "10PercentDuty": {
    "frequencyHz": 1000,
    "requestedDutyPercent": 10,
    "gateHighVoltage": 5,
    "thresholdVoltage": 2,
    "mosfetConducting": true,
    "onCurrentA": 0.00909090909090909,
    "averageCurrentA": 0.0009090909090909091,
    "resistorPowerW": 0.0027272727272727275,
    "ledPowerW": 0.0018181818181818182,
    "sourcePowerW": 0.004545454545454546,
    "powerBalanceW": 0
  },
  "50PercentDuty": {
    "frequencyHz": 1000,
    "requestedDutyPercent": 50,
    "gateHighVoltage": 5,
    "thresholdVoltage": 2,
    "mosfetConducting": true,
    "onCurrentA": 0.00909090909090909,
    "averageCurrentA": 0.004545454545454545,
    "resistorPowerW": 0.013636363636363637,
    "ledPowerW": 0.00909090909090909,
    "sourcePowerW": 0.022727272727272728,
    "powerBalanceW": 0
  },
  "90PercentDuty": {
    "frequencyHz": 1000,
    "requestedDutyPercent": 90,
    "gateHighVoltage": 5,
    "thresholdVoltage": 2,
    "mosfetConducting": true,
    "onCurrentA": 0.00909090909090909,
    "averageCurrentA": 0.008181818181818182,
    "resistorPowerW": 0.024545454545454544,
    "ledPowerW": 0.01636363636363636,
    "sourcePowerW": 0.04090909090909091,
    "powerBalanceW": 0
  },
  "gateBelowThreshold": {
    "gateHighVoltage": 1,
    "thresholdVoltage": 2,
    "effectiveDutyFraction": 0,
    "averageCurrentA": 0
  }
}
```

## Safety and model limits

Ideal educational average-current model only. It does not model PWM waveforms, switching transients, MOSFET on-resistance, gate charge, ripple, thermal effects, component ratings, or physical hardware safety.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/005-pwm-led-dimmer.adigun.json`.