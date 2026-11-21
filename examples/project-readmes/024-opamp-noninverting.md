# 024 — Op-amp non-inverting amplifier

## Purpose

Calculate closed-loop non-inverting midband gain as 1 + Rf/Rg and verify output amplitude against the ideal supply rails.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| V2 | `power.dc-source` | 12 V |
| VIN | `power.ac-source` | 0.1 V |
| U1 | `active.opamp-ideal` | Ideal op-amp, ±12 V supplies |
| RF | `passive.resistor` | 10 kΩ |
| RG | `passive.resistor` | 10 kΩ |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VPLUS:** `vplus:+`, `opamp:VCC`
- **VMINUS:** `vminus:-`, `opamp:VEE`
- **INPUT:** `signal:+`, `opamp:+`
- **FEEDBACK:** `opamp:-`, `rf:1`, `rg:1`
- **OUTPUT:** `opamp:OUT`, `rf:2`
- **GND:** `vplus:-`, `vminus:+`, `signal:-`, `rg:2`, `ground:0`

## Views and physical-layout status

The BB400 assembly uses a Texas Instruments TL071CP in a PDIP-8 package and two Vishay MRS25000C1002FCT00 resistors. Seat U1 with pin 1 at F13. Leave offset trim pins 1 and 5 and unused pin 8 isolated. Use current-limited isolated dual supplies and connect the generator return to their common 0 V node. [TL071CP pinout and package](https://www.ti.com/lit/ds/symlink/tl071.pdf)

The 58 × 47 mm PCB uses 18 plated pads, both copper layers, and three Samtec TSW-102-07-T-S headers. J1 carries +12 V and 0 V, J2 carries 0 V and −12 V, and J3 carries the input and 0 V. Probe the output at RF pin 2. The fabrication exporter produces the two copper Gerbers, outline, plated drill file, and BOM. Hardware characterization remains pending.

The floating scope displays 100 mV peak at the input and 200 mV peak at the output, in phase. It uses a 1 kHz display reference for the ideal midband gain. The analysis reports a wiring or rail diagnostic when it cannot produce a supported estimate.

## Acceptance test and expected result

- Stable test ID: `core-opamp-noninverting`
- Engine: Ideal op-amp non-inverting midband gain estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-opamp-noninverting-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41169362777

Recorded expected result:

```json
{
  "gainVPerV": 2,
  "inputAmplitudeV": 0.1,
  "outputAmplitudeV": 0.2,
  "phaseShiftDeg": 0,
  "positiveSupplyV": 12,
  "negativeSupplyV": -12
}
```

## Safety and model limits

Ideal educational midband model only. It omits frequency response, slew rate, input/output limits, offset, noise, loading and device-specific behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/024-opamp-noninverting.adigun.json`.
