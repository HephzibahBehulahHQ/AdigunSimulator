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

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **PRI1:** `source-1:+`, `transformer-1:PRI1`
- **PRI2:** `source-1:-`, `transformer-1:PRI2`
- **SEC1:** `transformer-1:SEC1`, `bridge-1:AC1`
- **SEC2:** `transformer-1:SEC2`, `bridge-1:AC2`
- **DC_RAW:** `bridge-1:POS`, `capacitor-1:1`, `regulator-1:IN`
- **DC_GND:** `bridge-1:NEG`, `capacitor-1:2`, `regulator-1:GND`, `load-1:2`, `ground-1:0`
- **DC_5V:** `regulator-1:OUT`, `load-1:1`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-linear-regulated-supply`
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

Simulation only. The 230 V primary is not a construction or mains-safety instruction. Ideal transformer, bridge, ripple-envelope and regulator models omit isolation qualification, pulse currents, control-loop behavior, tolerance, thermal design, and device ratings.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/007-linear-regulated-supply.adigun.json`.