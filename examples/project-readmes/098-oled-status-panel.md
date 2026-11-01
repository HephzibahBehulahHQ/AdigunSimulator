# 098 — OLED sensor status panel

## Purpose

Format bounded temperature, humidity, and pressure fixture values into a 16×2 status display and show a clear missing-sensor message when any required channel is absent.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| SNS1 | `input.status-sensor-fixture` | TemperatureC 23.5; HumidityPct 48; PressureHpa 1013; Present T,H,P |
| U1 | `active.oled-status-controller-ideal` | Program status; Required T,H,P; Columns 16; Rows 2 |
| OLED1 | `output.oled-status-panel` | Columns 16; Rows 2 |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `sensors:VCC`, `controller:VCC`, `panel:VCC`
- **GND:** `source:-`, `sensors:GND`, `controller:GND`, `panel:GND`, `ground:0`
- **TEMPERATURE:** `sensors:T`, `controller:T`
- **HUMIDITY:** `sensors:H`, `controller:H`
- **PRESSURE:** `sensors:P`, `controller:P`
- **DISPLAY_DATA:** `controller:DATA`, `panel:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-oled-status-panel`
- Engine: Ideal MCU OLED status formatting and sensor-range check
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-16x2-oled-sensor-status-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41186275332

Recorded expected result:

```json
{
  "kind": "oled-status-panel",
  "displayColumns": 16,
  "displayRows": 2,
  "displayLines": [
    "T:23.5C RH:48%",
    "P:1013hPa READY"
  ],
  "displayState": "ready",
  "missingSensors": [],
  "overflowLines": [],
  "temperatureC": 23.5,
  "humidityPct": 48,
  "pressureHpa": 1013,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal sensor-fixture and status-formatting model only. Sensor accuracy, I²C timing, OLED controller commands, display rendering, firmware execution, and hardware behavior are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/098-oled-status-panel.adigun.json`.