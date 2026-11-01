# 090 — USB-UART console known byte stream

## Purpose

Frame bounded transmit and receive byte streams using configurable baud, data width, parity and stop bits; show expected hex, printable text and ideal wire-time estimates in a local console model.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| HOST1 | `input.usb-uart-console-stream` | Baud 9600; DataBits 8; Parity none; StopBits 1; TXBytes 48 69; RXBytes 4F 4B |
| U1 | `active.usb-uart-bridge-mock` | Mode local mock; Flow none |
| TERM1 | `output.serial-console-report` | Console output |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `bridge:VCC`, `report:VCC`
- **GND:** `source:-`, `stream:GND`, `bridge:GND`, `report:GND`, `ground:0`
- **TX_HOST:** `stream:TX`, `bridge:RX`
- **TX_BRIDGE:** `bridge:TX`, `report:RX`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-usb-uart-console`
- Engine: Local USB-UART serial framing and console mock
- Engine version: `adigun-simulator@0.1.0`
- Model version: `local-usb-uart-byte-stream-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41184629990

Recorded expected result:

```json
{
  "kind": "usb-uart-console",
  "baud": 9600,
  "dataBits": 8,
  "parity": "none",
  "stopBits": 1,
  "frameBits": 10,
  "txHex": [
    "0x48",
    "0x69"
  ],
  "rxHex": [
    "0x4F",
    "0x4B"
  ],
  "txAscii": "Hi",
  "rxAscii": "OK",
  "txDurationSeconds": 0.0020833333333333333,
  "rxDurationSeconds": 0.0020833333333333333,
  "usbEnumerated": false,
  "hostContacted": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

Local UART framing and byte-stream mock only. USB enumeration and packet transport, host contact, electrical line levels, clock error, oversampling, buffering, drivers, firmware, and physical bridge behavior are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/090-usb-uart-console.adigun.json`.