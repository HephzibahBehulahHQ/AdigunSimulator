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

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **AC1:** `source-1:+`, `bridge-1:AC1`
- **AC2:** `source-1:-`, `bridge-1:AC2`
- **RECT_POS:** `bridge-1:POS`, `load-1:1`
- **RECT_NEG:** `bridge-1:NEG`, `load-1:2`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

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