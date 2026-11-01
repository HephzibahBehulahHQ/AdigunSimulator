# 082 — LoRa temperature sensor node

## Purpose

Encode a versioned application payload with node ID, sequence number, and signed deci-degree temperature, then admit scheduled sends only while within a configured airtime budget for one fixed window.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| SIG1 | `input.lora-temperature-fixture` | TemperatureC 24.6 |
| U1 | `active.lora-node-controller-ideal` | NodeId 7; Sequence 42; Mode payload-v1; AirtimeMs 100; DutyWindowMs 60000; DutyLimitPercent 1; RequestsMs 0,9000,18000,27000,36000,45000,54000,55000 |
| LORA1 | `active.lora-radio-payload-ideal` | Mode mock; MaximumPayloadBytes 255; Format V1 |
| DISP1 | `output.lora-duty-report` | Payload and duty guard result |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `controller:VCC`, `radio:VCC`, `report:VCC`
- **GND:** `supply:-`, `temperature:GND`, `controller:GND`, `radio:GND`, `report:GND`, `ground:0`
- **SENSOR:** `temperature:DATA`, `controller:SENSOR`
- **RADIO_DATA:** `controller:RADIO`, `radio:DATA`
- **REPORT:** `controller:REPORT`, `report:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-lora-sensor-node`
- Engine: Ideal LoRa sensor payload and configured duty-window guard
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-lora-payload-duty-window-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41182529899

Recorded expected result:

```json
{
  "temperatureC": 24.6,
  "temperatureDeciC": 246,
  "nodeId": 7,
  "sequence": 42,
  "payloadBytes": [
    1,
    7,
    0,
    42,
    0,
    246
  ],
  "payloadHex": "01 07 00 2A 00 F6",
  "payloadLengthOctets": 6,
  "airtimeMs": 100,
  "dutyWindowMs": 60000,
  "dutyLimitPercent": 1,
  "airtimeBudgetMs": 600,
  "usedAirtimeMs": 600,
  "dutyCyclePercent": 1,
  "sentCount": 6,
  "rejectedCount": 2,
  "rejectedTimesMs": [
    54000,
    55000
  ],
  "radioTransmitted": false,
  "firmwareExecuted": false,
  "regionalCompliance": "not evaluated"
}
```

## Safety and model limits

A deterministic application-payload and configured fixed-window guard only. Airtime and duty percentage are inputs, not radio measurements or regional limits. No LoRa PHY, RF transmission, firmware, link quality, regulatory mapping, or compliance decision is modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/082-lora-sensor-node.adigun.json`.