# 045 — Positive-edge D flip-flop register

## Purpose

Sample a digital data switch on each rising clock edge and retain Q through a falling edge and while the clock level remains high or low.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| D | `power.dc-source` | 0 V |
| CLK | `power.dc-source` | 0 V |
| U1 | `active.logic-dff-ideal` | Ideal positive-edge D flip-flop |
| RQ | `passive.resistor` | 330 Ω |
| DQ | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `dff:VCC`, `dff:PRE`, `dff:CLR`
- **GND:** `supply:-`, `data-input:-`, `clock-input:-`, `dff:GND`, `q-led:K`, `ground:0`
- **DATA:** `data-input:+`, `dff:D`
- **CLOCK:** `clock-input:+`, `dff:CLK`
- **Q:** `dff:Q`, `q-resistor:1`
- **Q_LED:** `q-resistor:2`, `q-led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-d-flip-flop-register`
- Engine: Ideal positive-edge D flip-flop state transition
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-d-flip-flop-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41173640571

Recorded expected result:

```json
{
  "clockHigh": false,
  "risingEdge": false,
  "q": null,
  "qBar": null,
  "mode": "low-level hold",
  "ledCurrentA": 0,
  "initialClockLow": {
    "clockHigh": false,
    "risingEdge": false,
    "q": null
  },
  "risingEdgeWithDHigh": {
    "dataHigh": true,
    "risingEdge": true,
    "sampled": true,
    "q": true,
    "qBar": false,
    "ledCurrentA": 0.00909090909090909
  },
  "dataChangesWhileClockHigh": {
    "risingEdge": false,
    "q": true
  },
  "fallingEdge": {
    "risingEdge": false,
    "q": true
  },
  "nextRisingEdgeWithDLow": {
    "dataHigh": false,
    "risingEdge": true,
    "sampled": true,
    "q": false,
    "qBar": true,
    "ledCurrentA": 0
  },
  "clockHighWithoutPriorLow": "blocked"
}
```

## Safety and model limits

Generic ideal positive-edge static model. Setup/hold timing, metastability, propagation delay, asynchronous preset/clear behavior, output loading beyond the LED resistor, and device-specific limits are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/045-d-flip-flop-register.adigun.json`.