# 013 — RC high-pass frequency response

## Purpose

Calculate the ideal sinusoidal steady-state response of a 1 kΩ / 100 µF RC high-pass filter at 0.1×, 1×, and 10× cutoff and verify 1/√2 gain at cutoff.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.ac-source` | 1 V |
| C1 | `passive.capacitor` | 100 µF |
| R1 | `passive.resistor` | 1 kΩ |
| GND | `ground.signal` | 0 V |

The physical layout uses a Samtec TSW-102-07-T-S input header, Vishay MRS25000C1001FCT00 resistor and Nichicon UES1E101MPM bipolar capacitor. Use the bipolar capacitor for the zero-offset sine input.

## Net connections

- **AC_IN:** `source-1:+`, `capacitor-1:1`
- **HP_OUT:** `capacitor-1:2`, `resistor-1:1`
- **GND:** `resistor-1:2`, `source-1:-`, `ground-1:0`

## Views and physical-layout status

On the BB400, use TP2 and BM2 for generator signal and return. Insert C1 at F9 and F11 and R1 at D15 and D19. Jumper TP2–F9, F11–D15 and D19–BM19. Verify the 5 mm capacitor lead fit without forcing the pins.

The project stores a 52 × 30 mm single-sided routed PCB and generates BOM, Gerber and drill files. Feed a 1 V peak, zero-offset sine at J1 pin 1 with return at pin 2. Set the generator for a high-impedance load and probe HP_OUT at R1 pad 1 relative to GND. Verify part fit and fabricator rules.

## Acceptance test and expected result

- Stable test ID: `core-rc-high-pass`
- Engine: Analytical first-order RC high-pass frequency response
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-rc-highpass-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41149669214

Recorded expected result:

```json
{
  "cutoffHz": 1.5915494309189535,
  "gainAt0_1Cutoff": 0.099503719,
  "gainAtCutoff": 0.7071067812,
  "gainAt10Cutoff": 0.9950371902
}
```

## Safety and model limits

Ideal educational frequency-domain model only. Generic components have no verified physical ratings, tolerances, parasitics, exact manufacturer BOM, hole-level breadboard mapping, or PCB footprints. It is not hardware or manufacturing guidance.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/013-rc-high-pass.adigun.json`.