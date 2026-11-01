# 066 — Uno-class potentiometer servo sweep

## Purpose

Map the 10-bit potentiometer range to calibrated 1–2 ms servo pulses at 50 Hz and a linear 0–180° position estimate.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.mcu-uno-ideal` | Program Servo control; ADC A0; Servo D9 |
| RV1 | `input.potentiometer-adc-ideal` | Position 50%; Resolution 10 bit |
| SERVO1 | `output.servo-angle-ideal` | MinPulse 1000 us; MaxPulse 2000 us; MinAngle 0 deg; MaxAngle 180 deg; Frequency 50 Hz |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`, `pot:VCC`, `servo:VCC`
- **GND:** `supply:-`, `mcu:GND`, `pot:GND`, `servo:GND`, `ground:0`
- **POT_OUT:** `pot:OUT`, `mcu:A0`
- **SERVO_PWM:** `mcu:D9`, `servo:PWM`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-arduino-servo-control`
- Engine: Ideal Uno-class hobby-servo pulse mapping
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-uno-servo-pulse-angle-map-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41177468886

Recorded expected result:

```json
{
  "positionPercent": 50,
  "adcResolutionBits": 10,
  "adcCount": 512,
  "pulseWidthUs": 1500.4897360703812,
  "angleDegrees": 90.08797653958945,
  "angleRangeDegrees": [0, 180],
  "pwmFrequencyHz": 50,
  "frameRateHz": 50,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal pulse-to-angle mapping only; Arduino firmware, servo torque, mechanical load, backlash, current transients, and model-specific calibration are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/066-arduino-servo-control.adigun.json`.