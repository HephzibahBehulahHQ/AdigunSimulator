# 070 — STM32 timer PWM LED load

## Purpose

Calculate edge-aligned PWM frequency and duty from timer clock, prescaler, auto-reload, and compare values, and estimate LED average current.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| U1 | `active.stm32-timer-ideal` | NUCLEO-G031K8; CN4 pin 12 A0/PA0; CN4 pin 14 +3V3; CN4 pin 2 GND; ClockHz 64000000; Prescaler 63; AutoReload 999; Compare 499 |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

U1 identifies the ST NUCLEO-G031K8 board (MB1455). The breadboard image is an illustrative board drawing, not a mechanical board model. The connected external holes map to the documented CN4 pins. Only GND, A0/PA0, and +3V3 are modeled in this project; the remaining header pads are decorative and have no project nets. The timer and LED analysis remains an ideal behavior model, not MCU firmware execution or a board-level electrical simulation.

## Net connections

- **VCC:** `supply:+`, `timer:VCC`
- **GND:** `supply:-`, `timer:GND`, `led:K`, `ground:0`
- **PWM_LED:** `timer:PA0` (TIM2_CH1 alternate function), `resistor:1`
- **LED_SERIES:** `resistor:2`, `led:A`

## Views and physical-layout status

The native project contains 10 breadboard pin placement(s). The selected external 3.3 V source feeds CN4 pin 14. ST documents that this power mode does not power the on-board ST-LINK; that behavior and the board's other circuits are not simulated. GPIO drive limits and LED transient behavior are also outside the model. Verify the matching board revision and its manual before assembly.

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
