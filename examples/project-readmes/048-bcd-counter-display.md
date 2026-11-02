# 048 — BCD counter and seven-segment display

## Purpose

Count ten clock edges from 0 through 9 and wrap to 0; assert the correct seven-segment output pattern for each decimal digit and support active-low reset.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CLK | `power.dc-source` | 0 V |
| RESET_N | `power.dc-source` | 0 V |
| U1 | `active.logic-bcd-display-ideal` | Ideal BCD decade counter; common-cathode segments |
| RA | `passive.resistor` | 330 Ω |
| RB | `passive.resistor` | 330 Ω |
| RC | `passive.resistor` | 330 Ω |
| RD | `passive.resistor` | 330 Ω |
| RE | `passive.resistor` | 330 Ω |
| RF | `passive.resistor` | 330 Ω |
| RG | `passive.resistor` | 330 Ω |
| DA | `diode.led-red` | Vf 2 V |
| DB | `diode.led-red` | Vf 2 V |
| DC | `diode.led-red` | Vf 2 V |
| DD | `diode.led-red` | Vf 2 V |
| DE | `diode.led-red` | Vf 2 V |
| DF | `diode.led-red` | Vf 2 V |
| DG | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `display:VCC`
- **GND:** `supply:-`, `clock-input:-`, `reset-input:-`, `display:GND`, `ground:0`, `leda:K`, `ledb:K`, `ledc:K`, `ledd:K`, `lede:K`, `ledf:K`, `ledg:K`
- **CLOCK:** `clock-input:+`, `display:CLK`
- **RESET_N:** `reset-input:+`, `display:RESET_N`
- **SEG_A:** `display:SEG_A`, `ra:1`
- **SEG_LED_A:** `ra:2`, `leda:A`
- **SEG_B:** `display:SEG_B`, `rb:1`
- **SEG_LED_B:** `rb:2`, `ledb:A`
- **SEG_C:** `display:SEG_C`, `rc:1`
- **SEG_LED_C:** `rc:2`, `ledc:A`
- **SEG_D:** `display:SEG_D`, `rd:1`
- **SEG_LED_D:** `rd:2`, `ledd:A`
- **SEG_E:** `display:SEG_E`, `re:1`
- **SEG_LED_E:** `re:2`, `lede:A`
- **SEG_F:** `display:SEG_F`, `rf:1`
- **SEG_LED_F:** `rf:2`, `ledf:A`
- **SEG_G:** `display:SEG_G`, `rg:1`
- **SEG_LED_G:** `rg:2`, `ledg:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-bcd-counter-display`
- Engine: Ideal BCD decade counter and seven-segment decoder
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-bcd-counter-display-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41174097741

Recorded expected result:

```json
{
  "digit": 0,
  "segmentsOn": [true, true, true, true, true, true, false],
  "digits0to9": [
    [
      1,
      1,
      1,
      1,
      1,
      1,
      0
    ],
    [
      0,
      1,
      1,
      0,
      0,
      0,
      0
    ],
    [
      1,
      1,
      0,
      1,
      1,
      0,
      1
    ],
    [
      1,
      1,
      1,
      1,
      0,
      0,
      1
    ],
    [
      0,
      1,
      1,
      0,
      0,
      1,
      1
    ],
    [
      1,
      0,
      1,
      1,
      0,
      1,
      1
    ],
    [
      1,
      0,
      1,
      1,
      1,
      1,
      1
    ],
    [
      1,
      1,
      1,
      0,
      0,
      0,
      0
    ],
    [
      1,
      1,
      1,
      1,
      1,
      1,
      1
    ],
    [
      1,
      1,
      1,
      1,
      0,
      1,
      1
    ]
  ],
  "wrapsAfterNine": true,
  "activeLowResetDigit": 0,
  "invalidClockAboveSupply": "blocked"
}
```

## Safety and model limits

Generic ideal static BCD counter/decoder. Clock waveform, propagation delay, timing violations, metastability, segment-driver current limits beyond explicit resistors, and device-specific behavior are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/048-bcd-counter-display.adigun.json`.