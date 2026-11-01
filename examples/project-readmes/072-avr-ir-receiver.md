# 072 — AVR NEC-like IR receiver

## Purpose

Decode a known four-byte NEC-like IR frame through an ideal 38 kHz receiver model, verify byte complements and timing tolerances, and display the address and command.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SIG1 | `input.ir-nec-frame` | Protocol NEC-like; Bytes 00 FF A2 5D; LeaderMarkUs 9000; LeaderSpaceUs 4500; BitMarkUs 560; ZeroSpaceUs 560; OneSpaceUs 1690; StopMarkUs 560; CarrierHz 38000 |
| IR1 | `sensor.ir-receiver-ideal` | CarrierHz 38000; Output demodulated active-low |
| U1 | `active.avr-ir-decoder-ideal` | Program Decode NEC-like; Input INT0; Output TX; Tolerance 20% |
| DISP1 | `output.ir-code-display-ideal` | Address and command bytes |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `receiver:VCC`, `avr:VCC`, `display:VCC`
- **GND:** `supply:-`, `frame:GND`, `receiver:GND`, `avr:GND`, `display:GND`, `ground:0`
- **OPTICAL_FRAME:** `frame:OUT`, `receiver:SIG`
- **IR_RX:** `receiver:OUT`, `avr:INT0`
- **DECODED_TEXT:** `avr:TX`, `display:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-avr-ir-receiver`
- Engine: Ideal AVR NEC-like infrared frame decoder
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-avr-nec-like-ir-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41179186525

Recorded expected result:

```json
{
  "protocol": "NEC-like",
  "rawCode": "0x00FFA25D",
  "address": "0x00",
  "command": "0xA2",
  "bitOrder": "LSB-first within each byte",
  "carrierHz": 38000,
  "frameDurationUs": 67980,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal demodulated timing and byte-decoder model only. It omits optical propagation, carrier waveform, receiver AGC, AVR firmware, ambient-light effects, and physical timing margins.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/072-avr-ir-receiver.adigun.json`.