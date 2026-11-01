# 079 — EEPROM circular data logger

## Purpose

Record periodic temperature fixture samples into a bounded EEPROM ring buffer and replay the newest entries chronologically after wrap.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| SIG1 | `input.data-log-samples` | Samples 10,20,30,40,50; PeriodMs 100; Unit C |
| U1 | `active.data-logger-controller-ideal` | SamplePeriodMs 100; Mode circular logger |
| MEM1 | `active.eeprom-ring-buffer-ideal` | Capacity 3; WriteCycleMs 5; Mode circular |
| R1 | `passive.resistor` | 4.7 kΩ |
| R2 | `passive.resistor` | 4.7 kΩ |
| DISP1 | `output.data-log-display` | Newest retained samples |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `controller:VCC`, `eeprom:VCC`, `pull-sda:1`, `pull-scl:1`, `display:VCC`
- **GND:** `supply:-`, `fixture:GND`, `controller:GND`, `eeprom:GND`, `display:GND`, `ground:0`
- **SAMPLES:** `fixture:DATA`, `controller:SENSOR`
- **SDA:** `controller:SDA`, `eeprom:SDA`, `pull-sda:2`
- **SCL:** `controller:SCL`, `eeprom:SCL`, `pull-scl:2`
- **DISPLAY:** `controller:DISPLAY`, `display:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-eeprom-ring-logger`
- Engine: Ideal EEPROM circular sample-buffer model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-eeprom-ring-buffer-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41181542805

Recorded expected result:

```json
{
  "samplePeriodMs": 100,
  "writeCycleMs": 5,
  "capacity": 3,
  "recordedSamples": 5,
  "overwrittenRecords": 2,
  "bufferWrapped": true,
  "replayValues": [
    30,
    40,
    50
  ],
  "replayTimesMs": [
    200,
    300,
    400
  ],
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal deterministic ring-buffer model only. MCU firmware, EEPROM page behavior, write endurance, power-loss recovery, I²C timing, and sensor accuracy are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/079-eeprom-data-logger.adigun.json`.