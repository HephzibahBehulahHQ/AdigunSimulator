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

The BB400 assembly uses a Texas Instruments TL071CP with pin 1 at F13. Leave pins 1, 5, and 8 isolated. The jumper from D15 to G14 closes the feedback loop between output pin 6 and inverting input pin 2. Probe B15 against the shared 0 V rail. [TL071CP pinout and package](https://www.ti.com/lit/ds/symlink/tl071.pdf)

The 58 × 47 mm PCB uses 14 plated pads on two copper layers. J1 carries +12 V and 0 V, J2 carries 0 V and −12 V, and J3 carries the input and 0 V. Probe U1 pin 6 for the output. The exporter checks connectivity and clearance and produces both copper Gerbers, outline, plated drill data, and a BOM. Hardware characterization remains pending.

The input and output scope traces overlap at 200 mV peak. The ideal midband display uses a 1 kHz reference.

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
