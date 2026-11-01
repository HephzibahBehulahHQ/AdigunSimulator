# 031 — NPN common-emitter amplifier

## Purpose

Solve an NPN divider-biased operating point and estimate an inverted 1 kHz small-signal output without exceeding collector headroom.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| VIN | `power.ac-source` | 0.01 V |
| Q1 | `active.npn-small-signal` | β 100; VBE 0.7 V; VCEsat 0.2 V |
| R1 | `passive.resistor` | 100 kΩ |
| R2 | `passive.resistor` | 18 kΩ |
| RC | `passive.resistor` | 4.7 kΩ |
| RE | `passive.resistor` | 1 kΩ |
| RL | `passive.resistor` | 10 kΩ |
| CIN | `passive.capacitor` | 10 µF |
| COUT | `passive.capacitor` | 10 µF |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `rbias-top:1`, `rc:1`
- **BASE:** `rbias-top:2`, `rbias-bottom:1`, `q1:B`, `cin:2`
- **INPUT_AC:** `signal:+`, `cin:1`
- **COLLECTOR:** `rc:2`, `q1:C`, `cout:1`
- **EMITTER:** `q1:E`, `re:1`
- **OUTPUT_AC:** `cout:2`, `rload:1`
- **GND:** `supply:-`, `signal:-`, `rbias-bottom:2`, `re:2`, `rload:2`, `ground:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-npn-common-emitter`
- Engine: Ideal NPN common-emitter bias and midband small-signal estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-npn-common-emitter-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41170602245

Recorded expected result:

```json
{
  "kind": "npn-common-emitter",
  "frequencyHz": 1000,
  "inverting": true,
  "activeBiasPoint": true
}
```

## Safety and model limits

Fixed-β, fixed-VBE educational midband estimate only. It omits device curves, Early effect, capacitor corner behavior, distortion, temperature, tolerance, and hardware qualification.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/031-transistor-common-emitter.adigun.json`.