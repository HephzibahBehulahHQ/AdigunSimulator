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

The BB400 uses an Infineon IRF9540NPBF and a Vishay AC05000001200JAC00 120 Ω, 5 W wirewound load. Keep the load off the plastic breadboard with insulated pigtails. The ideal load dissipates about 1.2 W when on. Keep the MOSFET drain tab isolated. Drive VG actively from a grounded 0–12 V bench source, with 0 V on and 12 V off. [Infineon MOSFET datasheet](https://www.infineon.com/assets/row/public/documents/24/49/infineon-irf9540n-datasheet-en.pdf) · [Vishay load resistor datasheet](https://www.vishay.com/docs/28730/ac_ac-at_ac-ni.pdf)

The 66 × 43 mm PCB has 11 plated pads and routed front and back copper. J1 pin 1 accepts the current-limited 12 V supply. J2 pin 1 accepts the gate control. Pin 2 of both headers is ground. Mount RL above the PCB on formed leads. The fabrication export provides both copper Gerbers, board outline, plated drills, and a BOM. Thermal and electrical bench characterization remains pending.

The scope displays the modeled settled gate and load voltages. Gate charging and switching edges are outside the ideal model.

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
