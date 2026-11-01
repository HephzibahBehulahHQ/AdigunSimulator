# 097 — RGB LED PWM colour controller

## Purpose

Map requested 8-bit red, green, and blue codes to active-high PWM duties and estimate per-channel and total average current through explicit current-limiting resistors.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CMD1 | `input.rgb-colour-command` | R 255; G 128; B 0; Frequency 1000 Hz |
| U1 | `active.rgb-pwm-controller-ideal` | Mode active-high PWM; Resolution 8 bit |
| R1 | `passive.resistor` | 220 Ω |
| R2 | `passive.resistor` | 220 Ω |
| R3 | `passive.resistor` | 220 Ω |
| LED1 | `output.rgb-led-common-cathode` | VfRed 2.0 V; VfGreen 3.0 V; VfBlue 3.0 V |
| SCOPE1 | `output.rgb-pwm-report` | RGB channel report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `controller:VCC`, `report:VCC`
- **GND:** `source:-`, `command:GND`, `controller:GND`, `led:K`, `report:GND`, `ground:0`
- **CONFIG:** `command:CONFIG`, `controller:CONFIG`
- **RED_PWM:** `controller:R_PWM`, `r-red:1`
- **RED_OUT:** `r-red:2`, `led:R`, `report:R_SENSE`
- **GREEN_PWM:** `controller:G_PWM`, `r-green:1`
- **GREEN_OUT:** `r-green:2`, `led:G`, `report:G_SENSE`
- **BLUE_PWM:** `controller:B_PWM`, `r-blue:1`
- **BLUE_OUT:** `r-blue:2`, `led:B`, `report:B_SENSE`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-rgb-led-controller`
- Engine: Ideal three-channel RGB PWM and LED-current estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-common-cathode-rgb-8bit-pwm-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41186115734

Recorded expected result:

```json
{
  "kind": "rgb-pwm-controller",
  "frequencyHz": 1000,
  "resolutionBits": 8,
  "channelCodes": {
    "R": 255,
    "G": 128,
    "B": 0
  },
  "redDutyPercent": 100,
  "greenDutyPercent": 50.19607843137255,
  "blueDutyPercent": 0,
  "redAverageCurrentMa": 13.636363636363637,
  "greenAverageCurrentMa": 4.563,
  "blueAverageCurrentMa": 0,
  "cssColor": "rgb(255, 128, 0)",
  "monotonicDutyMapping": true,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal PWM duty and resistor-current estimate only. Optical output, LED bin variation, colour calibration/gamma, switching edge behavior, MCU timer limits, thermal behavior, firmware, and hardware are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/097-rgb-led-controller.adigun.json`.