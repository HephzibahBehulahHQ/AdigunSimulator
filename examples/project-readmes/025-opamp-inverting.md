# 025 — Op-amp inverting amplifier

## Purpose

Model inverting midband voltage gain as -Rf/Rin and verify the output magnitude and 180-degree phase reversal.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| V2 | `power.dc-source` | 12 V |
| VIN | `power.ac-source` | 0.1 V |
| U1 | `active.opamp-ideal` | Ideal op-amp, ±12 V supplies |
| RIN | `passive.resistor` | 10 kΩ |
| RF | `passive.resistor` | 20 kΩ |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VPLUS:** `vplus:+`, `opamp:VCC`
- **VMINUS:** `vminus:-`, `opamp:VEE`
- **INPUT:** `signal:+`, `rin:1`
- **SUMMING:** `opamp:-`, `rin:2`, `rf:1`
- **OUTPUT:** `opamp:OUT`, `rf:2`
- **GND:** `vplus:-`, `vminus:+`, `signal:-`, `opamp:+`, `ground:0`

## Views and physical-layout status

The BB400 assembly uses a Texas Instruments TL071CP with pin 1 at F13. Leave pins 1, 5, and 8 isolated. RIN is the Vishay MRS25000C1002FCT00 (10 kΩ) and RF is the MRS25000C2002FCT00 (20 kΩ). Tie pin 3 to the common 0 V rail. Apply a zero-offset 100 mV peak sine and use isolated, current-limited dual supplies. [TL071CP pinout](https://www.ti.com/lit/ds/symlink/tl071.pdf) · [Vishay MRS25 resistor data](https://www.vishay.com/docs/28724/mrs16m25.pdf)

The 58 × 47 mm PCB uses both copper layers and three Samtec input headers. J1 carries +12 V and 0 V, J2 carries 0 V and −12 V, and J3 carries the input and 0 V. Probe RF pin 2 for the output. The fabrication exporter checks routed connectivity and clearance and generates copper Gerbers, board outline, plated drill data, and a BOM. Hardware characterization remains pending.

The scope displays a 200 mV peak output inverted relative to the 100 mV peak input. The ideal midband display uses a 1 kHz reference.

## Acceptance test and expected result

- Stable test ID: `core-opamp-inverting`
- Engine: Ideal op-amp closed-loop midband gain estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-opamp-inverting-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41169565670

Recorded expected result:

```json
{
  "gainVPerV": -2,
  "inputAmplitudeV": 0.1,
  "outputAmplitudeV": 0.2,
  "phaseShiftDeg": -180,
  "positiveSupplyV": 12,
  "negativeSupplyV": -12
}
```

## Safety and model limits

Ideal educational midband model only. It omits frequency response, slew rate, input/output limits, offset, noise, loading and device-specific behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/025-opamp-inverting.adigun.json`.
