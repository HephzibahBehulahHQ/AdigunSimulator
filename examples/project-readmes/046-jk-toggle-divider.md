# 046 — JK flip-flop toggle divider

## Purpose

Use J=K=1 so Q toggles on each rising clock edge; assert asynchronous active-low clear initializes Q and the output frequency ratio is one half of the clock rate in ideal toggle mode.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| J | `power.dc-source` | 5 V |
| K | `power.dc-source` | 5 V |
| CLK | `power.dc-source` | 0 V |
| CLR | `power.dc-source` | 0 V |
| U1 | `active.logic-jk-ideal` | Ideal positive-edge JK flip-flop |
| RQ | `passive.resistor` | 330 Ω |
| DQ | `diode.led-red` | Vf 2 V |
| ground | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `jk-ff:VCC`, `jk-ff:PRE`
- **GND:** `supply:-`, `j-input:-`, `k-input:-`, `clock-input:-`, `clear-input:-`, `jk-ff:GND`, `q-led:K`, `ground:0`
- **J:** `j-input:+`, `jk-ff:J`
- **K:** `k-input:+`, `jk-ff:K`
- **CLOCK:** `clock-input:+`, `jk-ff:CLK`
- **CLEAR:** `clear-input:+`, `jk-ff:CLR`
- **Q:** `jk-ff:Q`, `q-resistor:1`
- **Q_LED:** `q-resistor:2`, `q-led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-jk-toggle-divider`
- Engine: Ideal positive-edge JK flip-flop with asynchronous clear
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-jk-toggle-divider-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41173789608

Recorded expected result:

```json
{
  "mode": "asynchronous clear",
  "q": false,
  "risingEdge": false,
  "initializedClear": {
    "mode": "asynchronous clear",
    "q": false
  },
  "firstRisingEdge": {
    "risingEdge": true,
    "mode": "toggle",
    "q": true,
    "risingEdgeCount": 1,
    "outputToClockFrequencyRatio": 0.5
  },
  "fallingEdge": {
    "risingEdge": false,
    "q": true
  },
  "secondRisingEdge": {
    "risingEdge": true,
    "mode": "toggle",
    "q": false,
    "risingEdgeCount": 2
  },
  "invalidClockAboveSupply": "blocked"
}
```

## Safety and model limits

Generic ideal positive-edge static model. Setup/hold timing, propagation delay, metastability, clock waveform quality, physical frequency behavior, and device-specific limits are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/046-jk-toggle-divider.adigun.json`.