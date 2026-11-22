# 059 — SPI display byte transfer

## Purpose

Deliver a configured byte MSB-first to an eight-LED SPI display in mode 0 and verify chip-select, sample edge, byte value, and transfer duration.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| BUS1 | `input.spi-transfer-source` | Mode 0; Byte 0xA5; Baud 1000000; CS active |
| U1 | `active.atmega328p-spi-display` | ATmega328P-PU, mode 0 LED byte display |
| R1–R8 | `passive.resistor` | 1 kΩ, one per LED |
| D0–D7 | `diode.led-red` | Red LEDs, least to most significant bit |
| R9 | `passive.resistor` | 10 kΩ reset pull-up |
| C1, C2 | `passive.capacitor` | 100 nF supply bypass each |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `display:VCC`, `display:AVCC`, `reset-pullup:1`, `vcc-bypass:1`, `avcc-bypass:1`
- **GND:** `supply:-`, `transfer:GND`, `display:GND`, `display:AGND`, `ground:0`, `vcc-bypass:2`, `avcc-bypass:2`, and all eight LED cathodes
- **SCK:** `transfer:SCK`, `display:SCK`
- **MOSI:** `transfer:MOSI`, `display:MOSI`
- **CS:** `transfer:CS`, `display:CS`
- **MCU_RESET_N:** `display:MCU_RESET_N`, `reset-pullup:2`
- **BIT0–BIT7:** Each PD0–PD7 output drives its corresponding LED anode through its own resistor.

## Views and physical-layout status

The mapped BB400 assembly seats U1 with pin 1 at F1. Connect a 3.3 V SPI master at BUS1, with SCK, MOSI, active-low chip select and return on C27–C30 respectively. The schematic uses the same netlist.

The routed 83 × 70 mm PCB has two copper layers and a 0.35 mm minimum clearance. J1 supplies 3.3 V and return. BUS1 is a [Samtec four-pin header](https://www.samtec.com/products/tsw-104-07-t-s) with the same signal order. The fabrication validator checks connectivity and exports copper, outline, plated drill and BOM files.

## Firmware and oscilloscope

The [AVR firmware](../059-spi-display/main.c) enables the SPI peripheral as a mode-0 slave, with hardware select on PB2, data on PB3, and clock on PB5. After each received byte it writes PORTD to drive D0–D7. The firmware enables the internal select pull-up so the display stays deselected without an attached master. Program the MCU for the internal 8 MHz clock without division. Use the example's SPI clock limit of 1 MHz, assert select low for one complete byte, and leave clock low while idle.

The scope displays ideal SCK, MOSI, and CS levels for one selected byte. Actual LED brightness, oscillator accuracy and electrical timing margins require bench verification.

## Acceptance test and expected result

- Stable test ID: `core-spi-display`
- Engine: Ideal SPI mode-0 byte transfer
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-spi-mode0-byte-transfer-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41176074687

Recorded expected result:

```json
{
  "testByte": "0xA5",
  "mode": 0,
  "bitOrder": "MSB-first",
  "sampleEdge": "rising",
  "clockBaud": 1000000,
  "baud": 1000000,
  "bits": [true, false, true, false, false, true, false, true],
  "receivedByte": 165,
  "receivedHex": "0xA5",
  "transferDurationSeconds": 0.000008,
  "chipSelect": "active",
  "invalidModeByteChipSelect": "blocked"
}
```

## Safety and model limits

Ideal transaction-level digital fixture. Display command sets, pixel rendering, signal integrity, setup/hold timing margins, and physical device limits are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/059-spi-display.adigun.json`.