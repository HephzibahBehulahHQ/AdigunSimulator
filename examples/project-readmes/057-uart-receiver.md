# 057 — UART receiver and framing-error detector

## Purpose

Decode a supplied ten-bit 8N1 frame LSB-first, return the byte when start/stop bits are valid, and flag framing errors for invalid start or stop bits.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SIG1 | `input.uart-frame-source` | Bits 0,1,0,1,0,0,1,0,1,1; Baud 9600 |
| U1 | `active.uart-rx-ideal` | 8N1 frame decoder |
| RVALID | `passive.resistor` | 330 Ω |
| DVALID | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `receiver:VCC`
- **GND:** `supply:-`, `serial-frame:GND`, `receiver:GND`, `led:K`, `ground:0`
- **RX:** `serial-frame:TX`, `receiver:RX`
- **VALID:** `receiver:VALID`, `resistor:1`
- **VALID_LED:** `resistor:2`, `led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-uart-receiver`
- Engine: Ideal UART 8N1 frame decoder
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-uart-8n1-frame-decoder-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41175624855

Recorded expected result:

```json
{
  "validByte": "0xA5",
  "baud": 9600,
  "frameBits": "start low + 8 LSB-first data + stop high",
  "frameDurationSeconds": "10/9600",
  "invalidStartStop": "framing error; valid=false",
  "invalidFrameLength": "blocked"
}
```

## Safety and model limits

Ideal frame-level digital decoder. Oversampling, clock recovery, analog waveform quality, jitter, noise, parity, and physical transceiver behavior are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/057-uart-receiver.adigun.json`.