# 063 — Uno-class potentiometer PWM dimmer

## Purpose

Map a potentiometer position to a rounded 10-bit A0 ADC count and D9 PWM duty, then estimate current through a low-side MOSFET and protected LED.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.atmega328p-pwm-dimmer` | Program PWM dimmer; ADC A0; PWM D9; Frequency 490 |
| RV1 | `input.bourns-3296w-adc` | Position 50%; Resolution 10 bit |
| Q1 | `active.2n7000-d74z` | onsemi 2N7000-D74Z, ideal model threshold 2.0 V |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2 V |
| R2 | `passive.resistor` | 100 kΩ gate pulldown |
| R7 | `passive.resistor` | 10 kΩ reset pull-up |
| C1–C3 | `passive.capacitor` | 100 nF each |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`, `pot:VCC`, `resistor:1`, `mcu:AVCC`, `reset-pullup:1`, `vcc-bypass:1`, `avcc-bypass:1`
- **GND:** `supply:-`, `mcu:GND`, `pot:GND`, `mosfet:S`, `ground:0`, `mcu:AGND`, `gate-pulldown:2`, `vcc-bypass:2`, `avcc-bypass:2`, `aref-bypass:2`
- **ADC:** `pot:OUT`, `mcu:A0`
- **PWM:** `mcu:D9`, `mosfet:G`, `gate-pulldown:1`
- **LED_RES:** `resistor:2`, `led:A`
- **LED_MOSFET:** `led:K`, `mosfet:D`
- **AREF:** `mcu:AREF`, `aref-bypass:1`
- **MCU_RESET_N:** `mcu:MCU_RESET_N`, `reset-pullup:2`

## Views and physical-layout status

The mapped BB400 assembly seats U1 with pin 1 at F10. RV1 is the 10 kΩ Bourns trimmer. Individual insulated pigtails connect the lead-formed MOSFET to the breadboard. The [onsemi data sheet](https://www.onsemi.com/download/data-sheet/pdf/nds7002a-d.pdf) identifies Q1 pins 1–3 as source, gate and drain.

The routed 65 × 49 mm PCB uses two copper layers and a 0.35 mm clearance. J1 is 5 V and return. The data includes Q1's formed-lead footprint and an AREF capacitor to ground. The validator checks connectivity and generates copper, outline, drill and BOM exports.

## Firmware and oscilloscope

The [AVR firmware](../063-arduino-pwm-dimmer/main.c) reads PC0/ADC0 with AVCC as the reference and drives PB1/OC1A using Timer1. With the internal clock set to 8 MHz without division, the nominal PWM rate is about 490 Hz. The firmware uses the ADC reading to select duty and holds D9 low at zero.

The scope shows ideal D9 logic timing for the simulated duty cycle. PCB operation, ADC accuracy, LED current and switching edges require bench characterization.

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