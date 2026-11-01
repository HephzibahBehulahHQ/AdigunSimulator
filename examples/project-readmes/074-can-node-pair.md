# 074 — CAN node pair with ACK

## Purpose

Transfer an ideal standard CAN frame between two configured nodes, verify the receiver filter, acknowledge the frame, and validate the combined end termination.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SIG1 | `input.can-frame-fixture` | Identifier 0x123; DLC 2; Data DE AD; Bitrate 500000 |
| U1 | `active.can-node-ideal` | Role transmit; FilterId 0x123 |
| XCVR1 | `active.can-transceiver-ideal` | Mode normal |
| U2 | `active.can-node-ideal` | Role receive; FilterId 0x123 |
| XCVR2 | `active.can-transceiver-ideal` | Mode normal |
| RT1 | `passive.can-termination` | 120 Ω |
| RT2 | `passive.can-termination` | 120 Ω |
| DISP1 | `output.can-frame-display` | CAN frame and ACK status |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `tx-node:VCC`, `rx-node:VCC`, `tx-xcvr:VCC`, `rx-xcvr:VCC`, `display:VCC`
- **GND:** `supply:-`, `frame:GND`, `tx-node:GND`, `rx-node:GND`, `tx-xcvr:GND`, `rx-xcvr:GND`, `display:GND`, `ground:0`
- **FRAME_IN:** `frame:OUT`, `tx-node:FRAME`
- **TX1:** `tx-node:TX`, `tx-xcvr:TXD`
- **RX1:** `tx-xcvr:RXD`, `tx-node:RX`
- **TX2:** `rx-node:TX`, `rx-xcvr:TXD`
- **RX2:** `rx-xcvr:RXD`, `rx-node:RX`, `display:DATA`
- **CAN_H:** `tx-xcvr:CANH`, `rx-xcvr:CANH`, `term-a:1`, `term-b:1`
- **CAN_L:** `tx-xcvr:CANL`, `rx-xcvr:CANL`, `term-a:2`, `term-b:2`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-can-node-pair`
- Engine: Ideal two-node CAN frame and ACK model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-can-node-ack-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41180381442

Recorded expected result:

```json
{
  "identifier": "0x123",
  "dlc": 2,
  "dataBytes": [
    "DE",
    "AD"
  ],
  "bitrate": 500000,
  "transmitted": true,
  "received": true,
  "acknowledged": true,
  "terminationResistorsOhm": [
    120,
    120
  ],
  "busTerminationOhm": 60,
  "firmwareExecuted": false
}
```

## Safety and model limits

Deterministic logical model only. Arbitration, bit stuffing, CRC faults, analog edges, bus faults, transceiver electrical limits, and MCU firmware are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/074-can-node-pair.adigun.json`.