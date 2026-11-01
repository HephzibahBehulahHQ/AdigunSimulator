# 033 — NMOS low-side inductive-load driver

## Purpose

Drive a 24 Ω, 100 mH coil from 12 V with a 5 V gate signal; test off/on VDS, current, flyback clamp, and turn-off decay.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| VG | `power.dc-source` | 5 V |
| Q1 | `active.nmos-switch` | Vth 2 V; RdsOn 0.1 Ω |
| RCOIL | `passive.resistor` | 24 Ω |
| L1 | `passive.inductor` | 100 mH |
| D1 | `diode.schottky` | Vf 0.3 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `coil-r:1`, `flyback:K`
- **COIL:** `coil-r:2`, `coil-l:1`
- **DRAIN:** `coil-l:2`, `mosfet:D`, `flyback:A`
- **GATE:** `gate-drive:+`, `mosfet:G`
- **GND:** `supply:-`, `gate-drive:-`, `mosfet:S`, `ground:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-nmos-low-side-switch`
- Engine: Ideal low-side MOSFET and flyback-coil estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-nmos-low-side-coil-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41170976771

Recorded expected result:

```json
{
  "supplyVoltage": 12,
  "gateVoltage": 5,
  "gateThresholdV": 2,
  "switchOn": true
}
```

## Safety and model limits

Idealized 2 V threshold, 0.1 Ω MOSFET switch, and constant-drop diode model only. It omits switching edges, capacitance, recovery, avalanche, thermal effects, and component ratings.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/033-nmos-low-side-switch.adigun.json`.