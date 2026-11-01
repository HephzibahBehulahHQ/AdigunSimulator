# 010 — 5 V supercapacitor hold-up

## Purpose

Calculate the exponential voltage/current decay of a 1 F supercapacitor feeding a 100 Ω load after a 5 V supply interruption, isolated by a Schottky diode; report time to a 3 V minimum and compare samples.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| D1 | `diode.schottky` | Vf 0.3 V |
| C1 | `passive.supercapacitor` | C 1 F; Vstart 4.7 V; Vmin 3 V; Vmax 5 V |
| RLOAD | `passive.resistor` | 100 Ω |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **SUPPLY:** `source-1:+`, `diode-1:A`
- **CAP_LOAD:** `diode-1:K`, `cap-1:+`, `load-1:1`
- **GND:** `source-1:-`, `cap-1:-`, `load-1:2`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-supercapacitor-hold-up`
- Engine: Analytical supercapacitor RC power-interruption response
- Engine version: `adigun-simulator@0.1.0`
- Model version: `supercap-hold-up-rc-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41154570174

Recorded expected result:

```json
{
  "oneFaradHundredOhm": {
    "sourceVoltage": 5,
    "diodeVf": 0.3,
    "chargeVoltage": 4.7,
    "capacitanceF": 1,
    "initialVoltage": 4.7,
    "minimumVoltage": 3,
    "loadResistanceOhm": 100,
    "timeConstantS": 100,
    "holdUpTimeS": 44.89502200479032,
    "initialCurrentA": 0.047,
    "initialStoredEnergyJ": 11.045000000000002,
    "voltageAtThresholdV": 3
  }
}
```

## Safety and model limits

Ideal RC educational model only. It assumes prior charging to the configured voltage and input removal at time zero; no capacitor balancing, ESR, leakage, recharge, temperature, ratings, or hardware safety is modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/010-supercapacitor-hold-up.adigun.json`.