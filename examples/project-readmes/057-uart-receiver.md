# 057 — UART receiver and framing-error detector

## Purpose

Decode a supplied ten-bit 8N1 frame LSB-first, return the byte when start/stop bits are valid, and flag framing errors for invalid start or stop bits.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SIG1 | `input.uart-frame-source` | Bits 0,1,0,1,0,0,1,0,1,1; Baud 9600 |
| U1 | `active.atmega328p-uart-rx` | ATmega328P-PU, 8N1 frame decoder |
| RVALID | `passive.resistor` | 330 Ω |
| DVALID | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |
| R7 | `passive.resistor` | 10 kΩ reset pull-up |
| C1, C2 | `passive.capacitor` | 100 nF each |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `receiver:VCC`, `receiver:AVCC`, `reset-pullup:1`, `vcc-bypass:1`, `avcc-bypass:1`
- **GND:** `supply:-`, `serial-frame:GND`, `receiver:GND`, `led:K`, `ground:0`, `receiver:AGND`, `vcc-bypass:2`, `avcc-bypass:2`
- **RX:** `serial-frame:TX`, `receiver:RX`
- **VALID:** `receiver:VALID`, `resistor:1`
- **VALID_LED:** `resistor:2`, `led:A`
- **MCU_RESET_N:** `receiver:MCU_RESET_N`, `reset-pullup:2`

## Views and physical-layout status

The BB400 layout seats U1 with pin 1 at F10. SIG1 is a Samtec two-pin input header. Connect an idle-high, 5 V logic UART source at A8 and common return at A9. U1 PD0/RXD receives the signal and PB0 drives DVALID through RVALID.

The routed 56 × 43 mm PCB uses two copper layers and a 0.35 mm minimum clearance. J1 supplies 5 V and return. On SIG1, pin 1 is the external serial input and pin 2 is return. The external generator itself sits off the board.

## Firmware and oscilloscope

The [AVR firmware](../057-uart-receiver/main.c) listens at nominal 9600 baud, 8N1. Program the internal 8 MHz clock without division before inserting U1 and verify actual baud against the sender tolerance. DVALID indicates whether the most recent received character passed the hardware framing and overrun checks. The USART ignores an absent start transition. The ideal decoder can separately flag an explicitly supplied high start bit.

The scope displays the supplied RX logic bits, including an invalid stop bit when present. It does not simulate analog input thresholds, oscillator drift, or hardware sampling.

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
  "byte": 165,
  "byteHex": "0xA5",
  "baud": 9600,
  "frameBits": [0, 1, 0, 1, 0, 0, 1, 0, 1, 1],
  "frameFormat": "8N1",
  "framingError": false,
  "valid": true,
  "frameDurationSeconds": 0.0010416666666666667,
  "invalidStartStop": "framing error; valid=false",
  "invalidFrameLength": "blocked"
}
```

## Safety and model limits

Ideal frame-level digital decoder. Oversampling, clock recovery, analog waveform quality, jitter, noise, parity, and physical transceiver behavior are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/057-uart-receiver.adigun.json`.