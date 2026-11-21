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

The stored BB400 map covers 25 pins, including the external dual supply connections. U1 uses the [TL071CP PDIP pinout](https://www.ti.com/lit/ds/symlink/tl071.pdf). R1, R2, RF and RG use [Vishay MRS25 axial resistors](https://www.vishay.com/docs/28724/mrs16m25.pdf), with RF using the 22 kΩ ordering code MRS25000C2202FCT00. C1 and C2 use [TDK B32529C1103J189](https://www.tdk-electronics.tdk.com/inf/20/20/db/fc_2009/B32520_529.pdf). The [Vishay 1N5819-E3/54 diodes](https://www.vishay.com/docs/88525/1n5817.pdf) have cathode bands at A28 (D1) and E24 (D2). The assembly and topology checks pass. Hardware characterization is pending.

The stored 64 × 45 mm two-layer PCB maps the same nets onto through-hole pads and passes the fabrication export checks. J1 connects +9 V and return, and J2 connects return and −9 V. Probe the output at C1 pin 1. The three print views document the assembly. Use the fabrication export for Gerber, drill and BOM data.

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

The analytical model reports startup and the approximate limiter threshold. It supplies no time-domain waveform for the oscilloscope. Use a bench oscilloscope to measure the waveform and startup time on assembled hardware. Noise, waveform distortion, op-amp bandwidth and slew, diode curves, loading, tolerances, and physical part ratings are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/040-wien-bridge-oscillator.adigun.json`.
