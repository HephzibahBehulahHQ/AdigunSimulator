# 046 — JK flip-flop toggle divider

## Purpose

Use J=K=1 so Q toggles on each rising clock edge; assert asynchronous active-high clear initializes Q and the output frequency ratio is one half of the clock rate in ideal toggle mode.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| J | `power.dc-source` | 5 V |
| K | `power.dc-source` | 5 V |
| CLK | `power.dc-source` | 0 V |
| CLR | `power.dc-source` | 5 V |
| U1 | `active.cd4027be-toggle` | CD4027BE |
| C1 | `passive.capacitor` | 100 nF |
| RQ | `passive.resistor` | 10 kΩ |
| DQ | `diode.led-red` | Vf 2 V |
| ground | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `jk-ff:VCC`, `bypass:1`
- **GND:** `supply:-`, `j-input:-`, `k-input:-`, `clock-input:-`, `clear-input:-`, `jk-ff:GND`, `q-led:K`, `ground:0`, `jk-ff:PRE`, `jk-ff:2CLK`, `jk-ff:2CLR`, `jk-ff:2K`, `jk-ff:2J`, `jk-ff:2PRE`, `bypass:2`
- **J:** `j-input:+`, `jk-ff:J`
- **K:** `k-input:+`, `jk-ff:K`
- **CLOCK:** `clock-input:+`, `jk-ff:CLK`
- **CLEAR:** `clear-input:+`, `jk-ff:CLR`
- **Q:** `jk-ff:Q`, `q-resistor:1`
- **Q_LED:** `q-resistor:2`, `q-led:A`

## Views and physical-layout status

The BB400 assembly places the TI CD4027BE with pin 1 at F12. SET1 and the unused channel inputs are grounded. C1 bypasses the supply. The 10 kΩ indicator load draws an ideal 0.30 mA with the modeled LED drop. Actual output voltage and LED visibility require bench verification. See the [TI datasheet](https://www.ti.com/lit/ds/symlink/cd4027b.pdf), pin functions, static output characteristics, and N-PDIP drawing.

The 49 × 47 mm two-layer PCB uses the CD4027BE N-PDIP pin map. J1 supplies +5 V. J2 through J5 connect J, K, CLOCK and RESET with individual common-return pins. The fabrication export checks connectivity, clearance and board fit. The pad and drill pattern uses project-selected dimensions and awaits independent physical fit review.

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