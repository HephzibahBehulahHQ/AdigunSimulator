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

The BB400 assembly uses a Texas Instruments TL071CP with pin 1 at F13 and a Vishay MRS25000C1002FCT00 10 kΩ load. Leave pins 1, 5 and 8 isolated. Connect a regulated 2.5 V reference, ±12 V supplies, and the load return to the common 0 V node as shown. [TL071CP datasheet](https://www.ti.com/lit/ds/symlink/tl071.pdf)

The 58 × 47 mm PCB uses 16 plated pads and two copper layers. J1 supplies +12 V and 0 V, J2 supplies 0 V and −12 V, and J3 accepts the regulated reference and 0 V. Probe RLOAD pin 1 for the buffered output. The exporter generates both copper Gerbers, board outline, plated drills, and a BOM. Hardware accuracy and stability remain uncharacterized.

The floating scope displays steady 2.5 V readings for the input reference and buffered output. Changing the load changes the modeled current.

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
