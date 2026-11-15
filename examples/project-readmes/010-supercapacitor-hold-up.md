# 010 — 5 V supercapacitor hold-up

## Purpose

Calculate the exponential voltage/current decay of a 1 F supercapacitor feeding a 100 Ω load after a 5 V supply interruption, isolated by a Schottky diode; report time to a 3 V minimum and compare samples.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| D1 | `diode.schottky` | Vf 0.3 V |
| C1 | `passive.supercapacitor` | C 1 F; Vstart 4.7 V; Vmin 3 V; Vmax 5.5 V |
| RLOAD | `passive.resistor` | 100 Ω |
| GND | `ground.signal` | 0 V |

The native project stores exact component records and source-backed physical mappings. The simulation remains an ideal RC model; these physical mappings do not make the analytical result a hardware validation.

## Net connections

- **SUPPLY:** `source-1:+`, `diode-1:A`
- **CAP_LOAD:** `diode-1:K`, `cap-1:+`, `load-1:1`
- **GND:** `source-1:-`, `cap-1:-`, `load-1:2`, `ground-1:0`

## Breadboard assembly

The native project maps the circuit to a BB400 board: V1+→TP2, V1−→BM2, D1 A→A6 and K→A10, C1+→F14 and C1−→F18 through 22 AWG pigtails, and RLOAD pins 1/2→D4/D8. Jumpers connect TP2→A6, A10→F14 and D4, D8→BM8, and F18→BM18. The C1 lead spacing is 10.2 mm while F14–F18 hole centers are 10.16 mm; use pigtails to avoid forcing the thick capacitor leads into the board.

## PCB and sourced parts

The project includes a routed 75 × 50 mm single-sided PCB with a two-pin external supply connector, Vishay 1N5819-E3/54 DO-41 diode, Ohmite LP055105A 1 F / 5.5 V radial supercapacitor, and Vishay MRS25 100 Ω load resistor. The BOM, Gerber and drill exports are generated from the stored pads and routes.

The capacitor manufacturer lists a maximum charge current of 1.5 mA. This board has no internal current limiter: charge only from a regulated 5 V supply with a hard current limit of 1.5 mA or less, then disable or disconnect the input to begin the hold-up interval. The public capacitor specification omits PC-pin diameter, so its 1.5 mm PCB drills are layout choices; verify them against the purchased part's 2D CAD before fabrication. Check all footprints, polarity, clearances and fabricator rules before ordering.

## Acceptance test and expected result

- Stable test ID: `core-supercapacitor-hold-up`
- Engine: Analytical supercapacitor RC power-interruption response
- Engine version: `adigun-simulator@0.1.0`
- Model version: `supercap-hold-up-rc-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41154570174

Recorded expected result:

```json
{
  "sourceVoltage": 5,
  "diodeVf": 0.3,
  "chargeVoltage": 4.7,
  "capacitance": 1,
  "initialVoltage": 4.7,
  "minimumVoltage": 3,
  "ratedVoltage": 5.5,
  "loadResistance": 100,
  "timeConstantS": 100,
  "holdUpTimeS": 44.89502200479032,
  "initialCurrentA": 0.047,
  "initialLoadPowerW": 0.2209,
  "initialStoredEnergyJ": 11.045000000000002,
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

Ideal RC educational model only. It assumes prior charging to the configured voltage and input removal at time zero; it omits capacitor ESR, leakage, tolerance, recharge behavior, temperature and load dynamics. The real LP055105A has 7 Ω ESR at 1 kHz, so its waveform will differ from the ideal analysis.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/010-supercapacitor-hold-up.adigun.json`.
