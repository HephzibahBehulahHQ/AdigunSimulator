# 056 — UART transmitter 8N1 frame model

## Purpose

Serialize a configured byte as one low start bit, eight LSB-first data bits, and one high stop bit at the selected baud rate; test byte, frame duration, and format.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.uart-tx-ideal` | Byte 0xA5; Baud 9600 |
| RTX | `passive.resistor` | 330 Ω |
| DTX | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `uart:VCC`
- **GND:** `supply:-`, `uart:GND`, `led:K`, `ground:0`
- **TX:** `uart:TX`, `resistor:1`
- **TX_LED:** `resistor:2`, `led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-uart-transmitter`
- Engine: Ideal asynchronous UART 8N1 frame generator
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-uart-8n1-frame-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41175432292

Recorded expected result:

```json
{
  "testBytes": [
    "0x00",
    "0xA5",
    "0xFF"
  ],
  "bauds": [
    9600,
    115200
  ],
  "frameBits": 10,
  "frameDescription": "start low + 8 LSB-first data + stop high",
  "frameDurations": [
    "10/9600 s",
    "10/115200 s"
  ],
  "invalidByteAndBaud": "blocked"
}
```

## Safety and model limits

Ideal frame-level digital model. Analog edge shape, jitter, parity, oversampling, line loading, and physical transceiver behavior are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/056-uart-transmitter.adigun.json`.