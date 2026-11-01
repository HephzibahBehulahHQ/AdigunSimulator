# 085 — Ethernet sensor node link and frame mock

## Purpose

Show Ethernet link and configuration state changes, then form a local Ethernet-II header plus versioned temperature payload when the link is up and configured.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| SIG1 | `input.ethernet-sensor-config` | LinkTransitions down>negotiating>up; Configuration configured; DeviceId 1; TemperatureC 24.6; Sequence 42 |
| U1 | `active.ethernet-sensor-controller-ideal` | Mode eth2-mock; SourceMac 02:00:00:00:00:01; DestinationMac 02:00:00:00:00:02; EtherType 0x88B5 |
| PHY1 | `active.ethernet-phy-mock` | Mode mock; Link up |
| DISP1 | `output.ethernet-frame-report` | Header and sensor payload |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `controller:VCC`, `phy:VCC`, `report:VCC`
- **GND:** `supply:-`, `config:GND`, `controller:GND`, `phy:GND`, `report:GND`, `ground:0`
- **SENSOR:** `config:DATA`, `controller:SENSOR`
- **TX:** `controller:TX`, `phy:RX`
- **LINK:** `controller:LINK`, `phy:LINK`
- **REPORT:** `controller:REPORT`, `report:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-ethernet-sensor-frame`
- Engine: Mock Ethernet-II header and sensor application payload
- Engine version: `adigun-simulator@0.1.0`
- Model version: `mock-ethernet2-sensor-header-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41183123048

Recorded expected result:

```json
{
  "linkTransitions": [
    "down",
    "negotiating",
    "up"
  ],
  "linkState": "up",
  "configurationState": "configured",
  "deviceId": 1,
  "temperatureC": 24.6,
  "temperatureDeciC": 246,
  "sequence": 42,
  "sourceMac": "02:00:00:00:00:01",
  "destinationMac": "02:00:00:00:00:02",
  "etherType": "0x88B5",
  "headerBytes": [
    2,
    0,
    0,
    0,
    0,
    2,
    2,
    0,
    0,
    0,
    0,
    1,
    136,
    181
  ],
  "payloadBytes": [
    1,
    1,
    0,
    42,
    0,
    246
  ],
  "frameBytes": [
    2,
    0,
    0,
    0,
    0,
    2,
    2,
    0,
    0,
    0,
    0,
    1,
    136,
    181,
    1,
    1,
    0,
    42,
    0,
    246
  ],
  "frameLengthOctets": 20,
  "paddingIncluded": false,
  "fcsIncluded": false,
  "packetTransmitted": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

Local frame-format and state mock only. EtherType 0x88B5 is the IEEE local experimental value; this project is not a production protocol assignment or network implementation. It omits padding, FCS, preamble, PHY signaling, IP, switching, firmware, and packet transmission.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/085-ethernet-sensor-node.adigun.json`.