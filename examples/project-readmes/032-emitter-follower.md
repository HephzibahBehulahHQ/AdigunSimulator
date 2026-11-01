# 032 — NPN emitter follower

## Purpose

Sweep a 5 V emitter-follower input from cutoff to the supply limit and verify the output follows about 0.7 V below the base voltage.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| VIN | `power.dc-source` | 2.5 V |
| Q1 | `active.npn-small-signal` | β 100; VBE 0.7 V; VCEsat 0.2 V |
| RL | `passive.resistor` | 1 kΩ |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `q1:C`
- **INPUT:** `input:+`, `q1:B`
- **OUTPUT:** `q1:E`, `load:1`
- **GND:** `supply:-`, `input:-`, `load:2`, `ground:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-npn-emitter-follower`
- Engine: Ideal NPN emitter-follower DC estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-npn-emitter-follower-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41170765504

Recorded expected result:

```json
{
  "supplyVoltage": 5,
  "inputVoltage": 2.5,
  "vbeV": 0.7,
  "outputVoltage": 1.8,
  "loadResistanceOhm": 1000
}
```

## Safety and model limits

Ideal fixed-VBE educational estimate with ideal base drive. It omits beta-dependent base current, output resistance, device curves, temperature, and physical ratings.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/032-emitter-follower.adigun.json`.