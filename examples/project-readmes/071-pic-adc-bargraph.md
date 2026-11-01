# 071 — PIC-class ADC LED bargraph

## Purpose

Map a 0–100% potentiometer input through an ideal 10-bit PIC-class ADC and illuminate the corresponding count on a ten-segment LED bargraph.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| RV1 | `input.potentiometer-adc-ideal` | Position 50%; Resolution 10 bit |
| U1 | `active.pic-adc-bargraph-ideal` | Program ADC bargraph; ADC AN0; Resolution 10 bit; Channels 10 |
| LED1 | `output.led-bargraph-10seg-ideal` | Segments 10; Mode bar |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VDD:** `supply:+`, `pot:VCC`, `pic:VDD`, `bargraph:VCC`
- **GND:** `supply:-`, `pot:GND`, `pic:VSS`, `bargraph:GND`, `ground:0`
- **ADC_IN:** `pot:OUT`, `pic:AN0`
- **BAR_0:** `pic:BAR0`, `bargraph:IN0`
- **BAR_1:** `pic:BAR1`, `bargraph:IN1`
- **BAR_2:** `pic:BAR2`, `bargraph:IN2`
- **BAR_3:** `pic:BAR3`, `bargraph:IN3`
- **BAR_4:** `pic:BAR4`, `bargraph:IN4`
- **BAR_5:** `pic:BAR5`, `bargraph:IN5`
- **BAR_6:** `pic:BAR6`, `bargraph:IN6`
- **BAR_7:** `pic:BAR7`, `bargraph:IN7`
- **BAR_8:** `pic:BAR8`, `bargraph:IN8`
- **BAR_9:** `pic:BAR9`, `bargraph:IN9`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-pic-adc-bargraph`
- Engine: Ideal PIC-class 10-bit ADC bargraph model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-pic-adc-bargraph-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41178728021

Recorded expected result:

```json
{
  "adcResolutionBits": 10,
  "positions": [
    {
      "positionPercent": 0,
      "adcCount": 0,
      "illuminatedSegments": 0
    },
    {
      "positionPercent": 25,
      "adcCount": 256,
      "illuminatedSegments": 2
    },
    {
      "positionPercent": 50,
      "adcCount": 512,
      "illuminatedSegments": 5
    },
    {
      "positionPercent": 75,
      "adcCount": 767,
      "illuminatedSegments": 7
    },
    {
      "positionPercent": 100,
      "adcCount": 1023,
      "illuminatedSegments": 10
    }
  ],
  "firmwareExecuted": false,
  "physicalLedCurrent": "not modeled"
}
```

## Safety and model limits

Logical ADC and display behavior model only. PIC firmware, analog input noise, LED current limiting, device-specific pin assignment, and physical bargraph ratings are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/071-pic-adc-bargraph.adigun.json`.