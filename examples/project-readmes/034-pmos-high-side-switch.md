# 034 — P-channel MOSFET high-side switch

## Purpose

Switch a 120 Ω load from a 12 V supply with a P-MOS source-referenced gate network; test enabled/disabled load voltage and gate-source limits.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| VG | `power.dc-source` | 0 V |
| Q1 | `active.pmos-high-side-ideal` | Vth 2 V; RdsOn 0.1 Ω; |VGS|max 20 V |
| RG | `passive.resistor` | 100 kΩ |
| RL | `passive.resistor` | 120 Ω |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `pmos:S`
- **GATE:** `gate-resistor:2`, `pmos:G`
- **LOAD:** `pmos:D`, `load:1`
- **GND:** `supply:-`, `gate-drive:-`, `load:2`, `ground:0`
- **CONTROL:** `gate-drive:+`, `gate-resistor:1`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-pmos-high-side-switch`
- Engine: Ideal P-channel MOSFET high-side switching estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-pmos-high-side-switch-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41171207122

Recorded expected result:

```json
{
  "supplyVoltage": 12,
  "gateVoltage": 0,
  "gateSourceVoltageV": -12,
  "switchOn": true
}
```

## Safety and model limits

Generic ideal P-MOS model uses a 2 V threshold, 0.1 Ω on-resistance, and ±20 V gate-source bound. It omits switching, thermal, transient, and manufacturer-specific behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/034-pmos-high-side-switch.adigun.json`.