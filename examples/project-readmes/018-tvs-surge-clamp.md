# 018 — TVS surge clamp

## Purpose

Apply one 24 V, 1 ms rectangular pulse through a 10 Ω source resistor to a 1 kΩ load and an 18 V ideal TVS; verify output clamping and power/energy-limit warnings.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V idle; 24 V pulse, 1 ms |
| R1 | `passive.resistor` | 10 Ω |
| RLOAD | `passive.resistor` | 1 kΩ |
| DTVS1 | `protection.tvs-ideal` | Vclamp 18 V; Pmax 12 W; Emax 0.01 J |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VIN:** `source-1:+`, `series-resistor-1:1`
- **VOUT:** `series-resistor-1:2`, `load-resistor-1:1`, `tvs-1:K`
- **GND:** `source-1:-`, `load-resistor-1:2`, `tvs-1:A`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-tvs-surge-clamp`
- Engine: Analytical ideal TVS pulse-clamp estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `tvs-single-pulse-clamp-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41168154294

Recorded expected result:

```json
{
  "idleVoltage": 12,
  "pulseVoltage": 24,
  "pulseWidthS": 0.001,
  "clampVoltage": 18,
  "loadPeakBelowUnclamped": true,
  "tvsPulsePowerW": 10.476,
  "pulseEnergyJ": 0.010476,
  "energyLimitWarning": true
}
```

## Safety and model limits

Single ideal low-voltage pulse estimate only. It omits rise time, parasitic inductance, dynamic clamp impedance, thermal transients, pulse repetition, verified component ratings, mains safety, and hardware qualification.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/018-tvs-surge-clamp.adigun.json`.