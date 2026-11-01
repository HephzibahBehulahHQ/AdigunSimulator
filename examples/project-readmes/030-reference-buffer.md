# 030 — Precision reference buffer

## Purpose

Buffer a 2.5 V reference with an ideal op amp and verify the output remains 2.5 V while load current changes over a 1 kΩ to 100 kΩ sweep.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| V2 | `power.dc-source` | 12 V |
| VREF | `power.dc-source` | 2.5 V |
| U1 | `active.opamp-ideal` | Ideal op-amp, ±12 V supplies |
| RLOAD | `passive.resistor` | 10 kΩ |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VPLUS:** `vplus:+`, `opamp:VCC`
- **VMINUS:** `vminus:-`, `opamp:VEE`
- **REFERENCE:** `reference:+`, `opamp:+`
- **OUTPUT:** `opamp:OUT`, `opamp:-`, `load:1`
- **GND:** `vplus:-`, `vminus:+`, `reference:-`, `load:2`, `ground:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-reference-buffer`
- Engine: Ideal reference-voltage follower load estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-reference-buffer-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41170435953

Recorded expected result:

```json
{
  "referenceVoltage": 2.5,
  "outputVoltage": 2.5,
  "gainVPerV": 1,
  "loadResistanceOhm": 10000,
  "loadCurrentA": 0.00025
}
```

## Safety and model limits

Ideal educational model assumes unlimited output current and zero output impedance. It omits reference accuracy, drift, noise, bandwidth, stability, thermal effects, and device-specific limits.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/030-reference-buffer.adigun.json`.