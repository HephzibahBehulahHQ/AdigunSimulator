# 086 — NEC-like IR remote action decoder

## Purpose

Validate a NEC-like IR frame and map a decoded command byte to an explicit supported action label, leaving unrecognized valid keys unmapped.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SIG1 | `input.ir-nec-frame` | Protocol NEC-like; Bytes 00 FF A2 5D; LeaderMarkUs 9000; LeaderSpaceUs 4500; BitMarkUs 560; ZeroSpaceUs 560; OneSpaceUs 1690; StopMarkUs 560; CarrierHz 38000 |
| IR1 | `sensor.ir-receiver-ideal` | CarrierHz 38000; Output demodulated active-low |
| U1 | `active.ir-remote-action-decoder` | Program Decode NEC-like and dispatch; Input INT0; Output ACTION; Tolerance 20%; Map A2=TOGGLE_LIGHT,B2=VOLUME_UP |
| DISP1 | `output.ir-action-display` | Selected remote action |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `receiver:VCC`, `decoder:VCC`, `display:VCC`
- **GND:** `supply:-`, `frame:GND`, `receiver:GND`, `decoder:GND`, `display:GND`, `ground:0`
- **OPTICAL_FRAME:** `frame:OUT`, `receiver:SIG`
- **DEMODULATED:** `receiver:OUT`, `decoder:INT0`
- **ACTION:** `decoder:ACTION`, `display:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-ir-remote-action`
- Engine: Ideal NEC-like IR remote action dispatcher
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-nec-like-ir-action-map-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41183322664

Recorded expected result:

```json
{
  "protocol": "NEC-like",
  "rawCode": "0x00FFA25D",
  "address": "0x00",
  "command": "0xA2",
  "action": "TOGGLE_LIGHT",
  "mapped": true,
  "bitCount": 32,
  "frameDurationUs": 67980,
  "actionExecuted": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal timing and command-map model only. It displays an action label and does not control an appliance. Optical propagation, carrier waveform, receiver AGC, MCU firmware, and physical timing margins are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/086-ir-remote-actions.adigun.json`.