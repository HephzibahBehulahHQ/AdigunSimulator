# 061 — Uno-class D13 blink behavior

## Purpose

Produce a deterministic configured D13 high/low trace and estimate the series LED current for a 500 ms/500 ms blink cycle.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.atmega328p-blink` | Program Blink; Pin D13; High 500 ms; Low 500 ms; Runtime 2000 ms |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2 V |
| R7 | `passive.resistor` | 10 kΩ reset pull-up |
| C1, C2 | `passive.capacitor` | 100 nF each |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`, `mcu:AVCC`, `reset-pullup:1`, `vcc-bypass:1`, `avcc-bypass:1`
- **GND:** `supply:-`, `mcu:GND`, `mcu:AGND`, `led:K`, `ground:0`, `vcc-bypass:2`, `avcc-bypass:2`
- **D13:** `mcu:D13`, `resistor:1`
- **LED:** `resistor:2`, `led:A`
- **MCU_RESET_N:** `mcu:MCU_RESET_N`, `reset-pullup:2`

## Views and physical-layout status

The BB400 assembly seats the standalone ATmega328P-PU with pin 1 at F10. PB5 is the Arduino D13 signal. Its pin 19 connects to R1 and D1. Probe D13 at hole D19 relative to the ground rail.

The 56 × 43 mm two-layer PCB uses 0.35 mm minimum clearance. J1 supplies 5 V and return. Probe D13 at R1 pin 1. The fabrication validator checks copper connectivity and generates copper, outline, plated drill and BOM files.

## Firmware and oscilloscope

The [AVR firmware](../061-arduino-blink/main.c) drives PB5 high for 500 ms and low for 500 ms in a continuous loop. Program U1 for the internal 8 MHz clock without division before insertion. The firmware uses a standalone ATmega328P-PU, the microcontroller underlying the Uno-class example.

The scope shows the modeled D13 logic levels for the configured runtime. Changing the simulated intervals does not change the firmware, and physical timing and LED brightness require bench checks.

## Acceptance test and expected result

- Stable test ID: `core-arduino-blink`
- Engine: Ideal Uno-class GPIO blink sequence
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-uno-gpio-blink-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41176513029

Recorded expected result:

```json
{
  "pin": "D13",
  "highMs": 500,
  "lowMs": 500,
  "runtimeMs": 2000,
  "traceLabels": ["HIGH", "LOW", "HIGH", "LOW"],
  "periodMs": 1000,
  "trace": [
    {"timeMs": 0, "intervalMs": 500, "gpioHigh": true, "ledOn": true},
    {"timeMs": 500, "intervalMs": 500, "gpioHigh": false, "ledOn": false},
    {"timeMs": 1000, "intervalMs": 500, "gpioHigh": true, "ledOn": true},
    {"timeMs": 1500, "intervalMs": 500, "gpioHigh": false, "ledOn": false}
  ],
  "frequencyHz": 1,
  "firmwareExecuted": false
}
```

## Safety and model limits

Configured ideal GPIO behavior model; Arduino C++ is not executed. CPU timing, output resistance, PWM, interrupts, and board-specific limits are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/061-arduino-blink.adigun.json`.