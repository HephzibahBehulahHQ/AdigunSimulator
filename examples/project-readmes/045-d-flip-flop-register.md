# 045 — Positive-edge D flip-flop register

## Purpose

Sample a digital data switch on each rising clock edge and retain Q through a falling edge and while the clock level remains high or low.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| D | `power.dc-source` | 0 V |
| CLK | `power.dc-source` | 0 V |
| U1 | `active.sn74hc74n-register` | SN74HC74N |
| C1 | `passive.capacitor` | 100 nF |
| RQ | `passive.resistor` | 2.2 kΩ |
| DQ | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `dff:VCC`, `dff:PRE`, `dff:CLR`, `dff:2PRE`, `dff:2CLR`, `bypass:1`
- **GND:** `supply:-`, `data-input:-`, `clock-input:-`, `dff:GND`, `q-led:K`, `ground:0`, `dff:2CLK`, `dff:2D`, `bypass:2`
- **DATA:** `data-input:+`, `dff:D`
- **CLOCK:** `clock-input:+`, `dff:CLK`
- **Q:** `dff:Q`, `q-resistor:1`
- **Q_LED:** `q-resistor:2`, `q-led:A`

## Views and physical-layout status

The BB400 assembly places the SN74HC74N with pin 1 at F12. Both active-low preset and clear pairs are held high. The spare clock and data inputs are grounded, and outputs 6, 8, and 9 remain isolated. C1 bypasses the local supply.

The 55 × 41 mm two-layer layout routes the SN74HC74N and its 2.2 kΩ LED load. J1 supplies +5 V, J2 drives DATA, and J3 drives CLOCK. All three headers include a return pin. The project fabrication export checks connectivity, clearance, and board fit. Independent package review and bench characterization remain pending.

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
    "ledCurrentA": 0.0013636363636363637
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