# 070 — STM32 timer PWM LED load

## Purpose

Calculate edge-aligned PWM frequency and duty from timer clock, prescaler, auto-reload, and compare values, and estimate LED average current.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| U1 | `active.stm32-timer-ideal` | ClockHz 72000000; Prescaler 71; AutoReload 999; Compare 499 |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `timer:VCC`
- **GND:** `supply:-`, `timer:GND`, `led:K`, `ground:0`
- **PWM_LED:** `timer:TIM1_CH1`, `resistor:1`
- **LED_SERIES:** `resistor:2`, `led:A`

## Views and physical-layout status

The native project contains 10 breadboard pin placement(s). Review the board orientation and jumper map before physical assembly.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-stm32-timer-pwm`
- Engine: Ideal STM32 timer register PWM and LED load estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-stm32-timer-pwm-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41178155218

Recorded expected result:

```json
{
  "frequencyHz": 1000,
  "dutyCycle": 0.499,
  "averageLedCurrentA": 0.001965757575757576,
  "firmwareExecuted": false,
  "physicalTimerAndGPIOBehavior": "not modeled"
}
```

## Safety and model limits

Ideal timer-register and LED current estimate only; firmware, clock-tree setup, GPIO current limits, switching transients, and nonlinear LED behavior are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/070-stm32-timer-pwm.adigun.json`.