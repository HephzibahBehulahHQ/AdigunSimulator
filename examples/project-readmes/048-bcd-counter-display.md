# 048 — BCD counter and seven-segment display

## Purpose

Count ten clock edges from 0 through 9 and wrap to 0; assert the correct seven-segment output pattern for each decimal digit and support active-high reset.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CLK | `power.dc-source` | 0 V |
| RESET | `power.dc-source` | 5 V |
| U1 | `active.cd4026be-decade` | CD4026BE |
| RA | `passive.resistor` | 10 kΩ |
| RB | `passive.resistor` | 10 kΩ |
| RC | `passive.resistor` | 10 kΩ |
| RD | `passive.resistor` | 10 kΩ |
| RE | `passive.resistor` | 10 kΩ |
| RF | `passive.resistor` | 10 kΩ |
| RG | `passive.resistor` | 10 kΩ |
| GND | `ground.signal` | 0 V |
| DS1 | `display.sc56-11ewa` | Vf 2 V |
| C1 | `passive.capacitor` | 100 nF |

## Net connections

- **VCC:** `supply:+`, `display:VCC`, `display:ENABLE`, `bypass:1`
- **GND:** `supply:-`, `clock-input:-`, `reset-input:-`, `display:GND`, `ground:0`, `display:INHIBIT`, `digit:K1`, `digit:K2`, `bypass:2`
- **CLOCK:** `clock-input:+`, `display:CLK`
- **RESET:** `reset-input:+`, `display:RESET`
- **SEG_A:** `display:SEG_A`, `ra:1`
- **SEG_LED_A:** `ra:2`, `digit:A`
- **SEG_B:** `display:SEG_B`, `rb:1`
- **SEG_LED_B:** `rb:2`, `digit:B`
- **SEG_C:** `display:SEG_C`, `rc:1`
- **SEG_LED_C:** `rc:2`, `digit:C`
- **SEG_D:** `display:SEG_D`, `rd:1`
- **SEG_LED_D:** `rd:2`, `digit:D`
- **SEG_E:** `display:SEG_E`, `re:1`
- **SEG_LED_E:** `re:2`, `digit:E`
- **SEG_F:** `display:SEG_F`, `rf:1`
- **SEG_LED_F:** `rf:2`, `digit:F`
- **SEG_G:** `display:SEG_G`, `rg:1`
- **SEG_LED_G:** `rg:2`, `digit:G`

## Views and physical-layout status

The BB400 layout maps the CD4026BE and SC56-11EWA pin by pin. Both display cathodes share the return. The decimal point and the driver’s three unused outputs have isolated holes. Display enable is tied high and clock inhibit is tied low. The 10 kΩ resistors set the ideal segment current to 0.30 mA per lit segment. Actual brightness requires hardware characterization.

The 76 × 48 mm two-layer PCB routes each of the seven segment resistors to the SC56-11EWA. J1 is +5 V, J2 is clock, and J3 is active-high reset, each with a return pin. The PCB export verifies board fit, continuity, and copper clearance. Independent package fit review and hardware characterization remain pending.

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