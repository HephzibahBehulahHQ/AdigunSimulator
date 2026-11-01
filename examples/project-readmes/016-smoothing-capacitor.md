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

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **AC1:** `source-1:+`, `bridge-1:AC1`
- **AC2:** `source-1:-`, `bridge-1:AC2`
- **RECT_POS:** `bridge-1:POS`, `load-1:1`, `capacitor-1:1`
- **RECT_NEG:** `bridge-1:NEG`, `load-1:2`, `capacitor-1:2`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

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