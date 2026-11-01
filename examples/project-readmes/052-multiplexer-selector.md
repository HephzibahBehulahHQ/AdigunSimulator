# 052 — Four-to-one multiplexer selector

## Purpose

Select exactly one of four digital data inputs using two select bits and assert that output equals the selected input for all 16 data vectors and four select combinations.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| I0 | `power.dc-source` | 0 V |
| I1 | `power.dc-source` | 5 V |
| I2 | `power.dc-source` | 0 V |
| I3 | `power.dc-source` | 5 V |
| S0 | `power.dc-source` | 5 V |
| S1 | `power.dc-source` | 0 V |
| U1 | `active.logic-mux4-ideal` | Ideal 4:1 mux |
| RY | `passive.resistor` | 330 Ω |
| DY | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mux:VCC`
- **GND:** `supply:-`, `input-0:-`, `input-1:-`, `input-2:-`, `input-3:-`, `select-0:-`, `select-1:-`, `mux:GND`, `led:K`, `ground:0`
- **I0:** `input-0:+`, `mux:I0`
- **I1:** `input-1:+`, `mux:I1`
- **I2:** `input-2:+`, `mux:I2`
- **I3:** `input-3:+`, `mux:I3`
- **S0:** `select-0:+`, `mux:S0`
- **S1:** `select-1:+`, `mux:S1`
- **Y:** `mux:Y`, `resistor:1`
- **LED_Y:** `resistor:2`, `led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-multiplexer-selector`
- Engine: Ideal four-to-one static multiplexer
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-four-to-one-mux-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41174622647

Recorded expected result:

```json
{
  "dataVectorsTested": 16,
  "selectVectorsPerData": 4,
  "totalCombinations": 64,
  "selectionRule": "selectedIndex = 2*S1 + S0",
  "selectedOutputMatchesSelectedInput": true,
  "invalidSelectVoltage": "blocked"
}
```

## Safety and model limits

Generic ideal static mux. It uses a 50% supply logic threshold and ideal rail-to-rail output; propagation delay, input loading, leakage, noise and real logic-family specifications are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/052-multiplexer-selector.adigun.json`.