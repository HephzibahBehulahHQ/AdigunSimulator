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

The BB400 assembly uses the onsemi 2N3904BU. Form the TO-92 leads gently to the BB400 pitch and place emitter, base, and collector at I11, I12, and I13. The positive lead of CIN goes to BASE and the positive lead of COUT goes to COLLECTOR. Both Panasonic EEUFR1H100 capacitors use insulated pigtails for their 2 mm lead spacing. [onsemi transistor datasheet](https://www.onsemi.com/pdf/datasheet/2n3904-d.pdf)

The 74 × 47 mm PCB routes the amplifier on both copper layers. Form Q1's leads to the 2.54 mm PCB spacing. Observe capacitor polarity: CIN pad 2 and COUT pad 1 are positive. J1 is the 12 V supply and J2 is the grounded signal input. Probe RL pin 1 for the AC output. The exporter checks connectivity and clearance and produces copper Gerbers, outline, plated drill data, and a BOM. Hardware characterization remains pending.

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
