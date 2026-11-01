# 059 — SPI display byte transfer

## Purpose

Deliver a configured byte MSB-first to an ideal SPI display endpoint in mode 0 and verify chip-select, sample edge, byte value, and transfer duration.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| BUS1 | `input.spi-transfer-source` | Mode 0; Byte 0xA5; Baud 1000000; CS active |
| U1 | `active.spi-display-ideal` | Mode 0 display |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `display:VCC`
- **GND:** `supply:-`, `transfer:GND`, `display:GND`, `ground:0`
- **SCK:** `transfer:SCK`, `display:SCK`
- **MOSI:** `transfer:MOSI`, `display:MOSI`
- **CS:** `transfer:CS`, `display:CS`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

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
  "bits": [1, 0, 1, 0, 0, 1, 0, 1],
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