# 056 — UART transmitter 8N1 frame model

## Purpose

Serialize a configured byte as one low start bit, eight LSB-first data bits, and one high stop bit at the selected baud rate; test byte, frame duration, and format.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.atmega328p-uart-tx` | ATmega328P-PU, byte 0xA5 at 9600 baud |
| RTX | `passive.resistor` | 330 Ω |
| DTX | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |
| R7 | `passive.resistor` | 10 kΩ reset pull-up |
| C1, C2 | `passive.capacitor` | 100 nF supply bypass, each |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `uart:VCC`, `uart:AVCC`, `reset-pullup:1`, `vcc-bypass:1`, `avcc-bypass:1`
- **GND:** `supply:-`, `uart:GND`, `uart:AGND`, `led:K`, `ground:0`, `vcc-bypass:2`, `avcc-bypass:2`
- **TX:** `uart:TX`, `resistor:1`
- **TX_LED:** `resistor:2`, `led:A`
- **MCU_RESET_N:** `uart:MCU_RESET_N`, `reset-pullup:2`

## Views and physical-layout status

The BB400 assembly seats U1 with pin 1 at F10. PD1/TXD is package pin 3 and can be probed at J12 relative to the ground rail. The schematic uses the same native netlist.

The routed 56 × 43 mm PCB uses two copper layers and a 0.35 mm minimum clearance. J1 takes 5 V on pin 1 and return on pin 2. On the PCB, probe TX at the RTX pin 1 pad relative to return. The fabrication validator checks pad connectivity and exports copper, outline, plated drill, and BOM files.

## Firmware and oscilloscope

The [AVR firmware](../056-uart-transmitter/main.c) sends 0xA5 at nominal 9600 baud, 8N1, approximately every 100 ms. Before insertion, program U1 for its internal 8 MHz oscillator without clock division. Verify the measured baud against the receiver tolerance. Use a common return and a probe or input rated for 5 V logic.

In the simulator, the oscilloscope shows the selected byte's ten modeled logic bits at the configured bit period. Editing the simulated byte or baud does not reprogram the MCU. The scope trace omits oscillator error and analog voltage edges.

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
  "byte": 165,
  "baud": 9600,
  "dataBits": [true, false, true, false, false, true, false, true],
  "frameBits": [false, true, false, true, false, false, true, false, true, true],
  "frameFormat": "8N1",
  "frameDurationSeconds": 0.0010416666666666667,
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