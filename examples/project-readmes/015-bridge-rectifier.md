# 015 — Full-wave bridge rectifier

## Purpose

Generate a sampled 12 V RMS, 50 Hz bridge output across a resistive load, including two conducting diode drops; verify the output repeats at twice the input frequency and has no smoothing capacitor.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| VAC1 | `power.ac-source` | 12 V RMS, 50 Hz |
| BR1 | `diode.bridge-ideal` | 0.7 V |
| RLOAD | `passive.resistor` | 1 kΩ |
| GND | `ground.signal` | 0 V |

The physical layout uses a Samtec TSW-102-07-T-S input header, Vishay W04G-E4/51 bridge and Vishay MRS25000C1001FCT00 load resistor. The bridge model uses a fixed 0.7 V drop per conducting diode.

## Net connections

- **AC1:** `source-1:+`, `bridge-1:AC1`
- **AC2:** `source-1:-`, `bridge-1:AC2`
- **RECT_POS:** `bridge-1:POS`, `load-1:1`
- **RECT_NEG:** `bridge-1:NEG`, `load-1:2`, `ground-1:0`

## Views and physical-layout status

Connect an isolated 12 V RMS, 50 Hz AC source across BB400 A3 and A6. Connect the bridge through insulated pigtails to A11 (POS), A13 (AC1), A15 (AC2), and A17 (NEG). Place RLOAD across F21 and F25. Jumper A3–A13, A6–A15, A11–F21 and A17–F25. Verify the terminal marks on the purchased bridge.

The project stores a 58 × 30 mm single-sided routed PCB. J1 pins 1 and 2 are the two floating AC inputs. Measure the rectified output across RLOAD with an isolated differential probe or a battery-powered meter. Keep both input terminals separate from the rectifier return. Verify the purchased parts and fabrication rules before ordering.

## Acceptance test and expected result

- Stable test ID: `core-bridge-rectifier`
- Engine: Analytical sampled full-wave bridge rectifier
- Engine version: `adigun-simulator@0.1.0`
- Model version: `bridge-rectifier-full-wave-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41155142214

Recorded expected result:

```json
{
  "inputFrequencyHz": 50,
  "rectifiedFrequencyHz": 100,
  "rippleFrequencyHz": 100,
  "inputRmsVoltage": 12,
  "peakOutputVoltage": 15.57056274847714,
  "diodeDropPerConductingDiode": 0.7,
  "smoothingCapacitor": false
}
```

## Safety and model limits

Ideal low-voltage waveform model only. It has fixed diode drops and no transformer, smoothing capacitor, reverse recovery, source impedance, thermal, rating, mains safety, or hardware qualification.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/015-bridge-rectifier.adigun.json`.
