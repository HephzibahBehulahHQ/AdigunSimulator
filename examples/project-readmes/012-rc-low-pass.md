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

The physical layout uses a Samtec TSW-102-07-T-S input header, Vishay MRS25000C1001FCT00 resistor, and [Nichicon UES1E101MPM](https://www.nichicon.co.jp/english/series_items/catalog_pdf/e-ues.pdf) 100 µF, 25 V bipolar radial capacitor. The capacitor has 5 mm lead spacing and 0.6 mm leads. Use the bipolar part for the zero-offset AC input.

## Net connections

- **AC_IN:** `source-1:+`, `resistor-1:1`
- **FILTER_OUT:** `resistor-1:2`, `capacitor-1:1`
- **GND:** `capacitor-1:2`, `source-1:-`, `ground-1:0`

## Views and physical-layout status

On the BB400, connect generator signal to TP2 and return to BM2. Place R1 across A6 and A10 and C1 across F19 and F21. Add jumpers TP2–A6, A10–F19 and F21–BM21. Verify that C1’s 5 mm leads fit the 5.08 mm hole spacing without force.

The project stores a 52 × 30 mm single-sided routed PCB and generates BOM, Gerber and drill files. Connect the function generator to J1 pin 1 with return to pin 2. Set 1 V peak, zero DC offset, and amplitude for a high-impedance load. Probe FILTER_OUT at C1 pad 1 relative to GND using a high-impedance probe. Verify part fit and fabrication rules before ordering.

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
