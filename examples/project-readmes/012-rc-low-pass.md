# 012 — RC low-pass frequency response

## Purpose

Calculate the ideal sinusoidal steady-state response of a 1 kΩ / 100 µF RC low-pass filter at 0.1×, 1×, and 10× cutoff and verify 1/√2 gain at cutoff.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.ac-source` | 1 V |
| R1 | `passive.resistor` | 1 kΩ |
| C1 | `passive.capacitor` | 100 µF |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **AC_IN:** `source-1:+`, `resistor-1:1`
- **FILTER_OUT:** `resistor-1:2`, `capacitor-1:1`
- **GND:** `capacitor-1:2`, `source-1:-`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-rc-low-pass`
- Engine: Analytical first-order RC low-pass frequency response
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-rc-lowpass-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41149323903

Recorded expected result:

```json
{
  "cutoffHz": 1.5915494309189535,
  "gainAt0_1Cutoff": 0.9950371902,
  "gainAtCutoff": 0.7071067812,
  "gainAt10Cutoff": 0.099503719
}
```

## Safety and model limits

Ideal educational frequency-domain model only. Generic components have no verified physical ratings, tolerances, parasitics, exact manufacturer BOM, hole-level breadboard mapping, or PCB footprints. It is not hardware or manufacturing guidance.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/012-rc-low-pass.adigun.json`.