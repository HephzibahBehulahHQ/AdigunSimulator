# 067 — Uno-class bipolar stepper driver

## Purpose

Apply an ideal full-step bipolar phase sequence and calculate signed angular travel, final position, and duration for CW and CCW motion.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.mcu-uno-ideal` | Program Stepper; Step D3; DirectionPin D2; Steps 200; Direction CW; StepRate 200 |
| U2 | `active.stepper-driver-ideal` | Full-step dual-phase drive |
| M1 | `output.stepper-motor-ideal` | StepsPerRevolution 200; StepAngle 1.8 deg |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`, `driver:VCC`
- **GND:** `supply:-`, `mcu:GND`, `driver:GND`, `ground:0`
- **STEP:** `mcu:D3`, `driver:STEP`
- **DIR:** `mcu:D2`, `driver:DIR`
- **MOTOR_A1:** `driver:A1`, `motor:A1`
- **MOTOR_A2:** `driver:A2`, `motor:A2`
- **MOTOR_B1:** `driver:B1`, `motor:B1`
- **MOTOR_B2:** `driver:B2`, `motor:B2`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-arduino-stepper-driver`
- Engine: Ideal Uno-class bipolar stepper sequence and position model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-uno-stepper-phase-position-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41177644194

Recorded expected result:

```json
{
  "stepsPerRevolution": 200,
  "stepAngleDegrees": 1.8,
  "clockwise200StepsTravelDegrees": 360,
  "counterclockwise50StepsTravelDegrees": -90,
  "stepRatesHzTested": [100, 200],
  "stepRateHz": 200,
  "direction": "CW",
  "steps": 200,
  "signedSteps": 200,
  "angularTravelDegrees": 360,
  "finalPositionDegrees": 0,
  "motionDurationSeconds": 1,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal digital phase and position model; no Arduino C++ execution, acceleration, torque, missed steps, coil current/temperature, resonance, or end-stop physics.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/067-arduino-stepper-driver.adigun.json`.