# 040 — Diode-limited Wien bridge oscillator

## Purpose

Build a symmetric 10 kΩ/10 nF Wien RC bridge around a non-inverting op-amp gain stage and anti-parallel Schottky limiter diodes; test resonance frequency, loop-gain start-up condition, and bounded estimated amplitude.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| VCC | `power.dc-source` | 9 V |
| VEE | `power.dc-source` | 9 V |
| U1 | `active.opamp-ideal` | Ideal op-amp ±9 V |
| R1 | `passive.resistor` | 10 kΩ |
| R2 | `passive.resistor` | 10 kΩ |
| RF | `passive.resistor` | 22 kΩ |
| RG | `passive.resistor` | 10 kΩ |
| C1 | `passive.capacitor` | 10 nF |
| C2 | `passive.capacitor` | 10 nF |
| D1 | `diode.schottky` | Vf 0.3 V |
| D2 | `diode.schottky` | Vf 0.3 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `positive-rail:+`, `opamp:VCC`
- **VEE:** `negative-rail:-`, `opamp:VEE`
- **GND:** `positive-rail:-`, `negative-rail:+`, `gain-leg:2`, `shunt-resistor:2`, `shunt-capacitor:2`, `ground:0`
- **OUTPUT:** `opamp:OUT`, `series-capacitor:1`, `feedback:1`, `limiter-1:A`, `limiter-2:K`
- **SERIES_MID:** `series-capacitor:2`, `series-resistor:1`
- **NONINVERTING:** `series-resistor:2`, `shunt-resistor:1`, `shunt-capacitor:1`, `opamp:+`
- **INVERTING:** `opamp:-`, `feedback:2`, `gain-leg:1`, `limiter-1:K`, `limiter-2:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-wien-bridge-oscillator`
- Engine: Wien bridge start-up and diode-limited amplitude estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-wien-bridge-oscillator-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41172677446

Recorded expected result:

```json
{
  "frequencyHz": 1591.5494309189535,
  "bridgeAttenuation": 0.3333333333333333,
  "amplifierGain": 3.2,
  "loopGain": 1.0666666666666667,
  "oscillationStarts": true,
  "estimatedSteadyAmplitudeV": 0.43636363636363634,
  "limiterDiodeDropV": 0.3,
  "outputWithinSupplyRails": true
}
```

## Safety and model limits

Analytical start-up and diode-threshold estimate, not nonlinear time-domain SPICE. The estimated amplitude is an approximate limiter threshold. Noise/start-up time, waveform distortion, op-amp bandwidth/slew, diode curves, loading, tolerances, and physical part ratings are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/040-wien-bridge-oscillator.adigun.json`.