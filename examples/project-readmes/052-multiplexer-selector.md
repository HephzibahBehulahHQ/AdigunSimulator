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
| U1 | `active.sn74hc153n-mux` | SN74HC153N |
| RY | `passive.resistor` | 2.2 kΩ |
| DY | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |
| C1 | `passive.capacitor` | 100 nF |

## Net connections

- **VCC:** `supply:+`, `mux:VCC`, `mux:2G`, `bypass:1`
- **GND:** `supply:-`, `input-0:-`, `input-1:-`, `input-2:-`, `input-3:-`, `select-0:-`, `select-1:-`, `mux:GND`, `led:K`, `ground:0`, `mux:1G`, `mux:2C0`, `mux:2C1`, `mux:2C2`, `mux:2C3`, `bypass:2`
- **I0:** `input-0:+`, `mux:I0`
- **I1:** `input-1:+`, `mux:I1`
- **I2:** `input-2:+`, `mux:I2`
- **I3:** `input-3:+`, `mux:I3`
- **S0:** `select-0:+`, `mux:S0`
- **S1:** `select-1:+`, `mux:S1`
- **Y:** `mux:Y`, `resistor:1`
- **LED_Y:** `resistor:2`, `led:A`

## Views and physical-layout status

The BB400 uses the [SN74HC153N pinout](https://www.ti.com/lit/ds/symlink/sn74hc153.pdf) with pin 1 at F12. S0 is TI select A and S1 is select B. Ground 1G, tie 2G high, ground the unused data inputs, and keep 2Y isolated. C1 bypasses VCC and the LED uses a 2.2 kΩ resistor.

The 62 × 52 mm two-layer PCB routes the same channel-1 pin map. J1 supplies +5 V, J2 through J5 connect I0 through I3, and J6 and J7 connect S0 and S1. Each header includes a return. The fabrication export checks continuity, copper clearance, and board fit. Independent package fit and hardware timing review remain pending.

## Acceptance test and expected result

- Stable test ID: `core-multiplexer-selector`
- Engine: Ideal four-to-one static multiplexer
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-four-to-one-mux-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41174622647

Recorded expected result:

```json
{
  "kind": "mux4",
  "supplyVoltage": 5,
  "logicThresholdV": 2.5,
  "dataVoltages": [0, 5, 0, 5],
  "dataBits": [false, true, false, true],
  "select0": true,
  "select1": false,
  "selectedIndex": 1,
  "selectedInput": true,
  "outputHigh": true,
  "outputVoltage": 5,
  "ledOn": true,
  "ledCurrentA": 0.0013636363636363637,
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