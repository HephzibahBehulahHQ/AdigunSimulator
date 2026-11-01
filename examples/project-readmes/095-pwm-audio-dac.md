# 095 — PWM audio DAC RC filter concept

## Purpose

Estimate loaded average output and steady-state ripple for a PWM-to-RC filter across bounded duty cycles and frequencies, confirming that mean voltage tracks duty and ripple falls as frequency rises.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SIG1 | `input.pwm-dac-settings` | Frequency 1000 Hz; Duty 50%; Vlogic 5 V |
| PWM1 | `active.pwm-waveform-source-ideal` | Mode PWM; ActiveHigh true |
| R1 | `passive.resistor` | 1 kΩ |
| C1 | `passive.capacitor` | 10 µF |
| R2 | `passive.resistor` | 100 kΩ |
| SCOPE1 | `output.pwm-dac-report` | PWM DAC report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `pwm:VCC`, `report:VCC`
- **GND:** `source:-`, `settings:GND`, `pwm:GND`, `report:GND`, `filter-cap:2`, `load:2`, `ground:0`
- **PWM_CONFIG:** `settings:CONFIG`, `pwm:CONFIG`
- **PWM_OUT:** `pwm:OUT`, `series:1`
- **FILTER_OUT:** `series:2`, `filter-cap:1`, `load:1`, `report:IN`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-pwm-audio-dac`
- Engine: Ideal PWM-to-RC average and steady-state ripple estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `loaded-pwm-first-order-rc-dac-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41185766802

Recorded expected result:

```json
{
  "kind": "pwm-audio-dac",
  "frequencyHz": 1000,
  "dutyCyclePercent": 50,
  "logicVoltageV": 5,
  "seriesResistanceOhm": 1000,
  "loadResistanceOhm": 100000,
  "capacitanceF": 0.00001,
  "averageOutputV": 2.475247524752475,
  "rippleVppBelow": 0.2,
  "tracksDutyCycle": true,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal steady-state first-order RC/PWM model only. Switching edge time, capacitor ESR and leakage, component tolerances, noise, DAC accuracy, firmware, and physical behavior are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/095-pwm-audio-dac.adigun.json`.