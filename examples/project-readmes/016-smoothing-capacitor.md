# 016 — Rectifier smoothing capacitor

## Purpose

Compare the sampled full-wave bridge waveform with and without a 1,000 µF reservoir capacitor across a 1 kΩ load; verify ripple decreases after startup and retain the 100 Hz ripple cadence.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| VAC1 | `power.ac-source` | 12 V RMS, 50 Hz |
| BR1 | `diode.bridge-ideal` | 0.7 V |
| RLOAD | `passive.resistor` | 1 kΩ |
| C1 | `passive.capacitor` | 1000 µF |
| GND | `ground.signal` | 0 V |

The stored physical layout uses a Vishay W04G-E4/51 bridge, Panasonic EEUFR1V102B 1,000 µF / 35 V polarized capacitor, Vishay MRS25000C1001FCT00 resistor, and Samtec TSW-102-07-T-S input header.

## Net connections

- **AC1:** `source-1:+`, `bridge-1:AC1`
- **AC2:** `source-1:-`, `bridge-1:AC2`
- **RECT_POS:** `bridge-1:POS`, `load-1:1`, `capacitor-1:1`
- **RECT_NEG:** `bridge-1:NEG`, `load-1:2`, `capacitor-1:2`, `ground-1:0`

## Views and physical-layout status

Connect an isolated, current-limited 12 V RMS, 50 Hz source to A3/A6. Bridge pigtails reach A11 (positive), A13 (AC1), A15 (AC2), and A17 (negative). Connect C1 positive to A23 and negative to A26 with insulated pigtails. RLOAD spans F21/F25. Fit jumpers A3–A13, A6–A15, A11–F21, A17–F25, A11–A23, and A17–A26.

The project includes a routed 67 × 30 mm single-sided PCB. J1 accepts the floating AC source. C1 pin 1 goes to RECT_POS and pin 2 to RECT_NEG. Verify bridge markings, capacitor polarity, and package fit before energizing. Measure with an isolated differential probe or battery-powered meter. Disconnect the source and verify C1 has discharged before handling.

## Acceptance test and expected result

- Stable test ID: `core-smoothing-capacitor`
- Engine: Analytical bridge plus ideal-capacitor sampled transient estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `bridge-smoothing-capacitor-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41155438499

Recorded expected result:

```json
{
  "inputFrequencyHz": 50,
  "rippleFrequencyHz": 100,
  "capacitanceF": 0.001,
  "loadResistanceOhm": 1000,
  "capacitorDischargedAtStart": true,
  "rippleReducedAgainstUnfilteredBridge": true
}
```

## Safety and model limits

Ideal educational transient estimate. The capacitor starts discharged and the bridge has zero source impedance; ESR, charging surge, transformer behavior, diode recovery, part ratings, thermal effects, mains safety, and hardware qualification are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/016-smoothing-capacitor.adigun.json`.
