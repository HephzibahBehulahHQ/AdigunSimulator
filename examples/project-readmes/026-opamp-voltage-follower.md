# 026 — Op-amp voltage follower

## Purpose

Verify an ideal voltage follower tracks an AC input-amplitude sweep with unity gain and blocks output amplitudes at the supply rails.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| V2 | `power.dc-source` | 12 V |
| VIN | `power.ac-source` | 0.2 V |
| U1 | `active.opamp-ideal` | Ideal op-amp, ±12 V supplies |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VPLUS:** `vplus:+`, `opamp:VCC`
- **VMINUS:** `vminus:-`, `opamp:VEE`
- **INPUT:** `signal:+`, `opamp:+`
- **OUTPUT:** `opamp:OUT`, `opamp:-`
- **GND:** `vplus:-`, `vminus:+`, `signal:-`, `ground:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-opamp-voltage-follower`
- Engine: Ideal op-amp closed-loop midband gain estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-opamp-voltage-follower-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41169723538

Recorded expected result:

```json
{
  "gainVPerV": 1,
  "inputAmplitudeV": 0.2,
  "outputAmplitudeV": 0.2,
  "phaseShiftDeg": 0,
  "positiveSupplyV": 12,
  "negativeSupplyV": -12
}
```

## Safety and model limits

Ideal educational midband model only. It omits bandwidth, slew rate, input/output limits, offset, noise, loading and device-specific behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/026-opamp-voltage-follower.adigun.json`.