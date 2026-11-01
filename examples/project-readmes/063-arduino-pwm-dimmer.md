# 063 — Uno-class potentiometer PWM dimmer

## Purpose

Map a potentiometer position to a rounded 10-bit A0 ADC count and D9 PWM duty, then estimate current through a low-side MOSFET and protected LED.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.mcu-uno-ideal` | Program PWM dimmer; ADC A0; PWM D9; Frequency 490 |
| RV1 | `input.potentiometer-adc-ideal` | Position 50%; Resolution 10 bit |
| Q1 | `active.nmos-switch` | Vth 2.0 V |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`, `pot:VCC`, `resistor:1`
- **GND:** `supply:-`, `mcu:GND`, `pot:GND`, `mosfet:S`, `ground:0`
- **ADC:** `pot:OUT`, `mcu:A0`
- **PWM:** `mcu:D9`, `mosfet:G`
- **LED_RES:** `resistor:2`, `led:A`
- **LED_MOSFET:** `led:K`, `mosfet:D`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-arduino-pwm-dimmer`
- Engine: Ideal Uno-class ADC-to-PWM MOSFET dimmer
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-uno-adc-pwm-mosfet-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41176881089

Recorded expected result:

```json
{
  "resolutionBits": 10,
  "positionCounts": [
    [
      0,
      0
    ],
    [
      50,
      512
    ],
    [
      100,
      1023
    ]
  ],
  "pwmFrequencyHz": 490,
  "mosfetTopology": "low-side ideal switch",
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal ADC/PWM behavior and MOSFET load estimate; Arduino C++ is not executed. ADC noise, MOSFET switching/thermal losses, and analog potentiometer tolerances are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/063-arduino-pwm-dimmer.adigun.json`.