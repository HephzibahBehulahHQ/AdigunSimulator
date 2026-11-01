# 068 — ESP32 temperature telemetry payload mock

## Purpose

Quantize a configured temperature sensor sample into an ideal 12-bit ADC result and form a deterministic JSON telemetry payload for offline inspection.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| U1 | `active.esp32-telemetry-ideal` | Device esp32-node-01; Sequence 1; Transport offline-mock |
| TS1 | `sensor.temperature-analog-ideal` | Temperature 25 C; Scale 10 mV/C; Offset 0 mV |
| OUT1 | `output.telemetry-payload-sink` | JSON payload |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `esp32:VCC`, `sensor:VCC`
- **GND:** `supply:-`, `esp32:GND`, `sensor:GND`, `payload:GND`, `ground:0`
- **ADC:** `sensor:OUT`, `esp32:ADC`
- **TX:** `esp32:TX`, `payload:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-esp32-telemetry-mock`
- Engine: Ideal ESP32-class offline telemetry formatter
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-esp32-telemetry-json-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41177822704

Recorded expected result:

```json
{
  "adcResolutionBits": 12,
  "temperatureSamplesC": [
    0,
    25,
    80
  ],
  "payloadFields": [
    "device",
    "sequence",
    "temperatureC"
  ],
  "transport": "offline-mock",
  "transmitted": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

Offline payload-formatting mock; no Wi-Fi, network, authentication, Internet transfer, ESP32 firmware, ADC nonlinearity, or sensor accuracy is modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/068-esp32-telemetry-mock.adigun.json`.