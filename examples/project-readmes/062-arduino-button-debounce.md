# 062 — Uno-class debounced button toggle

## Purpose

Reject short digital bounce sequences and toggle the D13 output only after each three-sample stable press.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.atmega328p-button-toggle` | Program Button debounce; Input D2; Output D13; Mode Toggle; Stable 3 |
| SW1 | `input.b3f-1000-sample-sequence` | Samples 0,1,0,1,1,1,0,0,0,1,1,1; Rate 1000 Hz |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2 V |
| R2 | `passive.resistor` | 10 kΩ D2 pulldown |
| R7 | `passive.resistor` | 10 kΩ reset pull-up |
| C1, C2 | `passive.capacitor` | 100 nF supply bypass each |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`, `mcu:AVCC`, `button:VCC`, `reset-pullup:1`, `vcc-bypass:1`, `avcc-bypass:1`
- **GND:** `supply:-`, `mcu:GND`, `mcu:AGND`, `led:K`, `ground:0`, `button-pulldown:2`, `vcc-bypass:2`, `avcc-bypass:2`
- **BUTTON:** `button:OUT`, `mcu:D2`, `button-pulldown:1`
- **D13:** `mcu:D13`, `resistor:1`
- **LED:** `resistor:2`, `led:A`
- **MCU_RESET_N:** `mcu:MCU_RESET_N`, `reset-pullup:2`

## Views and physical-layout status

The BB400 assembly seats U1 with pin 1 at F10. The off-board Omron tactile switch connects 5 V to PD2 (Arduino D2). R2 pulls PD2 low on release. PB5 (Arduino D13) drives D1.

The routed 61 × 43 mm board uses two copper layers with 0.35 mm minimum clearance. J1 supplies 5 V and return. SW1 uses the four-pin Omron B3F-1000 footprint with both terminals of each internally connected pair mapped. The PCB validator checks connectivity and generates copper, outline, drill and BOM exports.

## Firmware and oscilloscope

The [AVR firmware](../062-arduino-button-debounce/main.c) uses Timer0 to sample PD2 at nominal 1 kHz. Three successive samples establish a stable level. Only a change to stable pressed toggles PB5. Program the internal 8 MHz oscillator without clock division before insertion.

The scope plots the configured digital button samples and the modeled output. The physical switch may bounce for longer than the example's three-sample threshold. Bench characterization is required to qualify that threshold for a given switch and operating condition.

## Acceptance test and expected result

- Stable test ID: `core-arduino-button-debounce`
- Engine: Ideal Uno-class sampled button debounce model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-button-debounce-toggle-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41176694806

Recorded expected result:

```json
{
  "stableSamples": 3,
  "sampleRateHz": 1000,
  "acceptedPresses": 2,
  "toggleCount": 2,
  "finalOutput": "off",
  "firmwareExecuted": false
}
```

## Safety and model limits

Configured sampled digital behavior only; it does not execute Arduino C++ or model switch contacts, analog RC behavior, CPU scheduling, or electrical noise.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/062-arduino-button-debounce.adigun.json`.