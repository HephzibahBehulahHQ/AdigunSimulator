# 064 — Uno-class temperature monitor with LCD output

## Purpose

Convert three in-range linear analog temperature sensor samples through a 10-bit ADC and format the measured temperature for a one-line LCD output.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.mcu-uno-ideal` | Program Temperature monitor; ADC A0; Output D8; Format 0.0 C |
| TS1 | `sensor.temperature-analog-ideal` | Temperature 25 C; Scale 10 mV/C; Offset 0 mV |
| LCD1 | `output.lcd-text-sink-ideal` | 16-character text row |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`, `sensor:VCC`, `lcd:VCC`
- **GND:** `supply:-`, `mcu:GND`, `sensor:GND`, `lcd:GND`, `ground:0`
- **SENSOR_OUT:** `sensor:OUT`, `mcu:A0`
- **LCD_DATA:** `mcu:D8`, `lcd:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-arduino-temperature-monitor`
- Engine: Ideal Uno-class linear temperature monitor
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-uno-temperature-monitor-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41177077186

Recorded expected result:

```json
{
  "sensorSamplesC": [
    0,
    25,
    100
  ],
  "adcResolutionBits": 10,
  "displayToleranceC": 0.5,
  "displayOutput": "one-line °C text",
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal linear sensor, ADC quantization, and LCD text-sink model only; firmware, sensor self-heating, analog noise, display bus timing, and physical sensor accuracy are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/064-arduino-temperature-monitor.adigun.json`.