# 007 — 230 V to 5 V linear supply model

## Purpose

Estimate secondary voltage, full-wave reservoir ripple, regulator dropout margin, output and dissipation for a 230:12 transformer feeding a bridge, 1000 µF capacitor and 100 Ω load; test nominal regulation and low-line dropout.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| VAC1 | `power.ac-source` | 230 V RMS, 50 Hz |
| T1 | `passive.transformer-ideal` | 230:12 |
| BR1 | `diode.bridge-ideal` | 0.7 V |
| C1 | `passive.capacitor` | 1000 µF |
| U1 | `active.regulator-7805-ideal` | Vout 5 V; dropout 2 V |
| RLOAD | `passive.resistor` | 100 Ω |
| GND | `ground.signal` | 0 V |
| J1 | `connector.linear-supply-ac-input-2` | Isolated 12 V AC secondary interface; Samtec TSW-102-07-T-S |
| J2 | `connector.linear-supply-dc-output-2` | Regulated 5 V output; Samtec TSW-102-07-T-S |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **PRI1:** `source-1:+`, `transformer-1:PRI1`
- **PRI2:** `source-1:-`, `transformer-1:PRI2`
- **SEC1:** `transformer-1:SEC1`, `bridge-1:AC1`, `isolated-input-1:AC1`
- **SEC2:** `transformer-1:SEC2`, `bridge-1:AC2`, `isolated-input-1:AC2`
- **DC_RAW:** `bridge-1:POS`, `capacitor-1:1`, `regulator-1:IN`
- **DC_GND:** `bridge-1:NEG`, `capacitor-1:2`, `regulator-1:GND`, `load-1:2`, `ground-1:0`, `output-header-1:GND`
- **DC_5V:** `regulator-1:OUT`, `load-1:1`, `output-header-1:VOUT`

## Views and physical-layout status

The BB400 pin-hole map and source-backed assembly are stored and validated. VAC1 and T1 are analytical-only; the breadboard drawing excludes both and is restricted to the isolated low-voltage secondary. It must never be connected to mains. The bridge, capacitor, regulator, and load use source-backed packages and documented 22 AWG pigtails where their leads exceed the BB400 insertion range.

The PCB maps six physical parts (J1, BR1, C1, U1, RLOAD, and J2), 15 pads and routed copper. It covers the isolated 12 V AC secondary and 5 V DC output only; VAC1 and T1 are deliberately simulation-only. The stored two-layer board passes the project's geometric DRC and exports Gerber, drill, edge and BOM files. This is not independent manufacturing, thermal, isolation, regulatory, or mains-safety approval.

## Acceptance test and expected result

- Stable test ID: `core-linear-regulated-supply`
- Physical-view acceptance: `tests/example-bank.test.mjs` verifies the BB400 pin/jumper and package map, PCB DRC/export, view reconciliation, and the project remains scope-capable.
- Engine: Analytical transformer, bridge, reservoir-capacitor, and linear-regulator envelope
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-linear-supply-envelope-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41153786104

Recorded expected result:

```json
{
  "primaryRmsVoltage": 230,
  "lineFrequencyHz": 50,
  "secondaryRmsVoltage": 12,
  "rectifiedFrequencyHz": 100,
  "rectifiedPeakVoltage": 15.570562748477142,
  "outputSetpointV": 5,
  "outputVoltage": 5,
  "regulated": true,
  "loadCurrentA": 0.05,
  "rippleVoltagePP": 0.5,
  "minimumRectifiedVoltage": 15.070562748477142,
  "averageRectifiedVoltage": 15.320562748477142,
  "dropoutMarginV": 8.070562748477142,
  "regulatorDissipationW": 0.5160281374238571,
  "bridgeDissipationW": 0.07,
  "loadPowerW": 0.25,
  "estimatedSecondaryInputPowerW": 0.8360281374238572,
  "nominal230VRms": {
    "secondaryRmsVoltage": 12,
    "rectifiedFrequencyHz": 100,
    "rectifiedPeakVoltage": 15.570562748477142,
    "outputVoltage": 5,
    "regulated": true,
    "loadCurrentA": 0.05,
    "rippleVoltagePP": 0.5,
    "minimumRectifiedVoltage": 15.070562748477142,
    "averageRectifiedVoltage": 15.320562748477142,
    "dropoutMarginV": 8.070562748477142,
    "regulatorDissipationW": 0.5160281374238571,
    "bridgeDissipationW": 0.07,
    "loadPowerW": 0.25,
    "estimatedSecondaryInputPowerW": 0.8360281374238572
  },
  "lowLine120VRms": {
    "secondaryRmsVoltage": 6.260869565217392,
    "regulated": false,
    "outputVoltage": 4.958369683072162,
    "rippleVoltagePP": 0.4958369683072162,
    "minimumRectifiedVoltage": 6.958369683072162,
    "dropoutMarginV": 0
  }
}
```

## Safety and model limits

The 230 V source and 230:12 transformer exist only in the analytical model. Never connect mains voltage to J1, the PCB, or the BB400. The physical board input is for an externally isolated low-voltage 12 V AC secondary. No transformer or primary-side circuit is included. The ideal bridge and regulator are not exact simulations of the cited orderable devices; the electrical calculation does not establish isolation qualification, charging pulses, control-loop behavior, tolerances, thermal design, device ratings, or construction safety.

The physical map and exported files are educational layout data. The TO-220 pad pattern includes simulator-selected drill and copper sizes. Review exact manufacturer documentation, component ratings, thermal limits, board rules, isolation requirements and independent engineering checks before manufacturing or connecting hardware. A passing test or DRC does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/007-linear-regulated-supply.adigun.json`.
