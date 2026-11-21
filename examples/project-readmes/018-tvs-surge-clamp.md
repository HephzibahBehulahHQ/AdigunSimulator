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

The physical layout uses a Vishay 1.5KE18A-E3/54 TVS, Vishay AC05000001009JAC00 10 Ω wirewound resistor, Vishay MRS25000C1001FCT00 load, and a Samtec TSW-102-07-T-S input header.

## Net connections

- **VIN:** `source-1:+`, `series-resistor-1:1`
- **VOUT:** `series-resistor-1:2`, `load-resistor-1:1`, `tvs-1:K`
- **GND:** `source-1:-`, `load-resistor-1:2`, `tvs-1:A`, `ground-1:0`

## Views and physical-layout status

Connect the current-limited pulse source to TP2/BM2. Use insulated pigtails for the off-board R1 at A5/A13 and for the TVS anode at F18 and banded cathode at F24. Place RLOAD across D18/D22. Jumper TP2–A5, A13–D18, D18–F24, D22–BM22 and F18–BM18.

The project stores a routed 70 × 37 mm single-sided PCB. J1 pin 1 takes the bench pulse input and pin 2 is GND. Verify part fit, source and pulse limits, and thermal behavior before use. Vishay specifies the TVS breakdown as 17.1–18.9 V at 1 mA and the 25.2 V maximum clamp at 59.5 A for a 10/1000 µs pulse. Neither specification establishes an 18 V rectangular plateau for this circuit.

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
