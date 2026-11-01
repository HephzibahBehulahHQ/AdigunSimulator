# 089 — Bidirectional I²C bus level shifter

## Purpose

Translate bounded open-drain SDA and SCL transitions between 3.3 V and 5 V domains, using four explicit rail-side pull-ups and report both logic levels, drive directions, rail safety and static sink current.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| V2 | `power.dc-source` | 5 V |
| BUS1 | `input.i2c-level-shifter-transition-fixture` | SDA Drive low-side; SDA States H,L,H,L; SCL Drive high-side; SCL States L,H,L,H |
| Q1 | `active.i2c-bidirectional-level-shifter-ideal` | Mode open-drain bidirectional |
| DISP1 | `output.i2c-level-shifter-report` | I²C transition report |
| R1 | `passive.resistor` | 4.7 kΩ |
| R2 | `passive.resistor` | 4.7 kΩ |
| R3 | `passive.resistor` | 4.7 kΩ |
| R4 | `passive.resistor` | 4.7 kΩ |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VREF_L:** `source-low:+`, `shifter:VREF_L`, `report:VREF_L`, `r-pull-sda-low:2`, `r-pull-scl-low:2`
- **VREF_H:** `source-high:+`, `shifter:VREF_H`, `report:VREF_H`, `r-pull-sda-high:2`, `r-pull-scl-high:2`
- **GND:** `source-low:-`, `source-high:-`, `fixture:GND`, `shifter:GND`, `report:GND`, `ground:0`
- **SDA_LOW:** `fixture:SDA`, `shifter:SDA_L`, `report:SDA_L`, `r-pull-sda-low:1`
- **SCL_LOW:** `fixture:SCL`, `shifter:SCL_L`, `report:SCL_L`, `r-pull-scl-low:1`
- **SDA_HIGH:** `shifter:SDA_H`, `report:SDA_H`, `r-pull-sda-high:1`
- **SCL_HIGH:** `shifter:SCL_H`, `report:SCL_H`, `r-pull-scl-high:1`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-i2c-level-shifter`
- Engine: Ideal bidirectional open-drain I²C level-shifter model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-i2c-open-drain-level-shift-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41184474626

Recorded expected result:

```json
{
  "kind": "i2c-level-shifter",
  "lowRailV": 3.3,
  "highRailV": 5,
  "lowPullupOhm": 4700,
  "highPullupOhm": 4700,
  "transitionCount": 4,
  "lowSideDriveTransitions": 2,
  "highSideDriveTransitions": 2,
  "peakCombinedPullupSinkCurrentMa": 1.7659574468085106,
  "lowSideOvervoltage": false,
  "highSideOvervoltage": false,
  "bidirectionalTransitionsVerified": true,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal bidirectional open-drain logic model only. MOSFET threshold/body-diode behavior, edge timing, bus capacitance, pull-up tolerances, rise time, actual device limits, firmware, and hardware are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/089-i2c-level-shifter.adigun.json`.