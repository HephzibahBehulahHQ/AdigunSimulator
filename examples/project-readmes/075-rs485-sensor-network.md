# 075 — Addressed RS-485 sensor network

## Purpose

Poll a selected sensor node over an ideal half-duplex RS-485 bus and confirm other nodes remain silent without driver collisions.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| POLL1 | `input.rs485-poll-fixture` | Address 0x02; Baud 9600 |
| U1 | `active.rs485-master-ideal` | Role master; PollAddress 0x02; Baud 9600; DriverPolicy master-then-addressed |
| XCVR1 | `active.rs485-transceiver-ideal` | Role master; BusMode half-duplex; Baud 9600 |
| U2 | `active.rs485-sensor-node-ideal` | Address 0x01; Baud 9600; EnablePolicy addressed-only |
| XCVR2 | `active.rs485-transceiver-ideal` | Role sensor-1; BusMode half-duplex; Baud 9600 |
| S1 | `sensor.rs485-temperature-ideal` | TemperatureC 21.5 |
| U3 | `active.rs485-sensor-node-ideal` | Address 0x02; Baud 9600; EnablePolicy addressed-only |
| XCVR3 | `active.rs485-transceiver-ideal` | Role sensor-2; BusMode half-duplex; Baud 9600 |
| S2 | `sensor.rs485-temperature-ideal` | TemperatureC 24.6 |
| RT1 | `passive.rs485-termination` | 120 Ω |
| RT2 | `passive.rs485-termination` | 120 Ω |
| DISP1 | `output.rs485-poll-display` | Addressed poll response |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `master:VCC`, `node-1:VCC`, `node-2:VCC`, `master-xcvr:VCC`, `xcvr-1:VCC`, `xcvr-2:VCC`, `sensor-1:VCC`, `sensor-2:VCC`, `display:VCC`
- **GND:** `supply:-`, `poll:GND`, `master:GND`, `node-1:GND`, `node-2:GND`, `master-xcvr:GND`, `xcvr-1:GND`, `xcvr-2:GND`, `sensor-1:GND`, `sensor-2:GND`, `display:GND`, `ground:0`
- **POLL:** `poll:OUT`, `master:POLL`
- **M_TX:** `master:TX`, `master-xcvr:DI`
- **M_RX:** `master-xcvr:RO`, `master:RX`
- **M_DE:** `master:DE`, `master-xcvr:DE`
- **M_RE:** `master:RE`, `master-xcvr:RE`
- **N1_SENSOR:** `node-1:SENSOR`, `sensor-1:DATA`
- **N1_TX:** `node-1:TX`, `xcvr-1:DI`
- **N1_RX:** `xcvr-1:RO`, `node-1:RX`
- **N1_DE:** `node-1:DE`, `xcvr-1:DE`
- **N1_RE:** `node-1:RE`, `xcvr-1:RE`
- **N2_SENSOR:** `node-2:SENSOR`, `sensor-2:DATA`
- **N2_TX:** `node-2:TX`, `xcvr-2:DI`
- **N2_RX:** `xcvr-2:RO`, `node-2:RX`, `display:DATA`
- **N2_DE:** `node-2:DE`, `xcvr-2:DE`
- **N2_RE:** `node-2:RE`, `xcvr-2:RE`
- **RS485_A:** `master-xcvr:A`, `xcvr-1:A`, `xcvr-2:A`, `term-1:1`, `term-2:1`
- **RS485_B:** `master-xcvr:B`, `xcvr-1:B`, `xcvr-2:B`, `term-1:2`, `term-2:2`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-rs485-addressed-poll`
- Engine: Ideal addressed half-duplex RS-485 polling model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-rs485-addressed-poll-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41180619051

Recorded expected result:

```json
{
  "pollAddress": "0x02",
  "respondingAddress": "0x02",
  "temperatureC": 24.6,
  "respondingNodes": 1,
  "silentNodes": 1,
  "simultaneousDrivers": 0,
  "terminationResistorsOhm": [
    120,
    120
  ],
  "busTerminationOhm": 60,
  "firmwareExecuted": false
}
```

## Safety and model limits

Deterministic logical model only. It is not a Modbus implementation and omits firmware, UART sampling, bias-network idle levels, transceiver enable delays, cable effects, and physical-layer faults.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/075-rs485-sensor-network.adigun.json`.