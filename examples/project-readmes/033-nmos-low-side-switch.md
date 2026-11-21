# 033 — NMOS low-side inductive-load driver

## Purpose

Drive a series 390 Ω and 100 mH load from 12 V with a 5 V gate signal. Test off/on VDS, current, flyback clamp, and turn-off decay.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| VG | `power.dc-source` | 5 V |
| Q1 | `active.nmos-switch` | Vth 2 V; RdsOn 0.1 Ω |
| RCOIL | `passive.resistor` | 390 Ω |
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

The BB400 assembly uses the onsemi FQP30N06L, Vishay 1N5819-E3/54, and Würth 7447471104. Use insulated TO-220 pigtails, keep the drain tab isolated, and connect the diode's cathode stripe to VCC. Drive the gate actively at 0 V or 5 V with a shared supply return. The 390 Ω resistor limits the ideal on-current to approximately 30.8 mA and ideal resistor dissipation to about 0.37 W. The selected 100 mH inductor is rated for 50 mA and has approximately 115 Ω typical winding resistance, which the ideal model omits. [onsemi MOSFET datasheet](https://www.onsemi.com/pdf/datasheet/fqp30n06l-d.pdf) · [Würth inductor datasheet](https://media.digikey.com/pdf/Data%20Sheets/Wurth%20Electronics%20PDFs/7447471104.pdf)

The 64 × 43 mm two-layer PCB uses 13 plated pads. J1 is the current-limited 12 V supply and J2 is the actively driven gate input. Pin 2 of both connectors is ground. The fabrication exporter checks connectivity and clearance and provides copper Gerbers, outline, plated drill data, and a BOM. Hardware characterization remains pending.

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
