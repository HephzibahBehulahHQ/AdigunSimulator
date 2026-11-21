# 017 — Zener shunt regulator

## Purpose

Model a 9 V source feeding a 5.1 V ideal Zener through a 330 Ω series resistor with a 1 kΩ load; verify clamp current, branch power, and a warning when the entered Zener power limit is exceeded.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 9 V |
| R1 | `passive.resistor` | 330 Ω |
| RLOAD | `passive.resistor` | 1 kΩ |
| DZ1 | `diode.zener-ideal` | Vz 5.1 V; Pmax 0.5 W |
| GND | `ground.signal` | 0 V |

The physical layout uses a Vishay BZX55C5V1-TAP Zener, Vishay MRS25 resistors, and a Samtec TSW-102-07-T-S input header. Vishay specifies 4.8–5.4 V at 5 mA. The analytical model uses an ideal 5.1 V clamp.

## Net connections

- **VIN:** `source-1:+`, `series-resistor-1:1`
- **VOUT:** `series-resistor-1:2`, `load-resistor-1:1`, `zener-1:K`
- **GND:** `source-1:-`, `load-resistor-1:2`, `zener-1:A`, `ground-1:0`

## Views and physical-layout status

Connect a regulated, current-limited 9 V source at TP2/BM2. R1 spans A6–A10 and RLOAD spans D14–D18. Place DZ1’s unbanded anode in F14 and banded cathode in F18. Fit jumpers TP2–A6, A10–D14, D14–F18, D18–BM18 and F14–BM14.

The native project stores a 52 × 30 mm single-sided routed PCB. J1 pin 1 takes VIN and pin 2 takes GND. Orient DZ1 with its marked cathode on VOUT. Verify the purchased parts, polarity and fabricator rules before ordering or powering the board.

## Acceptance test and expected result

- Stable test ID: `core-zener-shunt-regulator`
- Engine: Analytical ideal Zener shunt-regulator estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `zener-shunt-clamp-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41167935879

Recorded expected result:

```json
{
  "sourceVoltage": 9,
  "zenerVoltage": 5.1,
  "seriesResistanceOhm": 330,
  "loadResistanceOhm": 1000,
  "regulated": true,
  "zenerPowerBelowEnteredLimit": true,
  "overloadInputProducesWarning": true
}
```

## Safety and model limits

Ideal educational clamp model only. It omits dynamic resistance, voltage tolerance, temperature, reverse recovery, thermal coupling, and hardware qualification. The entered power limit is a generic scenario input, not a verified part rating.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/017-zener-shunt-regulator.adigun.json`.
