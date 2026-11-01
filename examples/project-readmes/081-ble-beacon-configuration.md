# 081 — BLE beacon advertising data configuration

## Purpose

Encode configured Flags, a complete 16-bit service UUID, a complete local name, and signed transmit-power field into Bluetooth LE legacy advertising data and enforce the 31-octet limit.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| CFG1 | `input.ble-advertising-settings` | Name Adigun; Flags 0x06; ServiceUuid 0x180D; TxPowerDbm -4 |
| U1 | `active.ble-advertising-encoder-ideal` | Protocol legacy; MaximumBytes 31 |
| BLE1 | `active.ble-advertiser-ideal` | Mode legacy; MaximumBytes 31 |
| DISP1 | `output.ble-advertising-report` | Encoded advertising data |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `encoder:VCC`, `advertiser:VCC`, `report:VCC`
- **GND:** `supply:-`, `settings:GND`, `encoder:GND`, `advertiser:GND`, `report:GND`, `ground:0`
- **CONFIG:** `settings:DATA`, `encoder:CONFIG`
- **RADIO_DATA:** `encoder:TX`, `advertiser:RX`
- **REPORT:** `encoder:REPORT`, `report:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-ble-beacon-config`
- Engine: Ideal Bluetooth LE legacy advertising data encoder
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-ble-legacy-advertising-data-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41182326724

Recorded expected result:

```json
{
  "deviceName": "Adigun",
  "deviceNameUtf8Bytes": 6,
  "flags": 6,
  "serviceUuid": "0x180D",
  "serviceUuidEncodedBytes": [
    13,
    24
  ],
  "txPowerDbm": -4,
  "structures": [
    {
      "name": "Flags",
      "lengthOctets": 3,
      "bytes": [
        "02",
        "01",
        "06"
      ]
    },
    {
      "name": "Complete 16-bit Service UUIDs",
      "lengthOctets": 4,
      "bytes": [
        "03",
        "03",
        "0D",
        "18"
      ]
    },
    {
      "name": "Complete Local Name",
      "lengthOctets": 8,
      "bytes": [
        "07",
        "09",
        "41",
        "64",
        "69",
        "67",
        "75",
        "6E"
      ]
    },
    {
      "name": "Tx Power Level",
      "lengthOctets": 3,
      "bytes": [
        "02",
        "0A",
        "FC"
      ]
    }
  ],
  "payloadBytes": [
    2,
    1,
    6,
    3,
    3,
    13,
    24,
    7,
    9,
    65,
    100,
    105,
    103,
    117,
    110,
    2,
    10,
    252
  ],
  "payloadHex": "02 01 06 03 03 0D 18 07 09 41 64 69 67 75 6E 02 0A FC",
  "payloadLengthOctets": 18,
  "legacyMaximumOctets": 31,
  "radioTransmitted": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

This is a deterministic payload-encoding exercise only. It does not transmit radio packets or model advertising schedules, discovery, RF propagation, connections, GATT services, privacy, or firmware; the legacy advertising payload limit and field encoding are not a hardware radio validation.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/081-ble-beacon-configuration.adigun.json`.