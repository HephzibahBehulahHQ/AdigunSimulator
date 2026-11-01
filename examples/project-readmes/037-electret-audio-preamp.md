# 037 — Electret microphone single-supply audio preamp

## Purpose

Bias a generic electret microphone from 5 V, AC-couple its 10 mV 1 kHz signal into a midpoint-biased non-inverting op-amp preamplifier, and test microphone bias, gain, high-pass response, and output headroom.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| MIC1 | `sensor.electret-mic-generic` | Imic 0.5 mA; Vsig 10 mV; f 1 kHz; Rs 2.2 kΩ |
| U1 | `active.opamp-ideal` | Ideal single-supply op-amp; input 0 to 5 V |
| GND | `ground.signal` | 0 V |
| RB1 | `passive.resistor` | 2.2 kΩ |
| R1 | `passive.resistor` | 100 kΩ |
| R2 | `passive.resistor` | 100 kΩ |
| RIN | `passive.resistor` | 15 kΩ |
| RF | `passive.resistor` | 99 kΩ |
| RG | `passive.resistor` | 1 kΩ |
| CIN | `passive.capacitor` | 10 µF |
| CDEC | `passive.capacitor` | 100 nF |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `microphone:VCC`, `opamp:VCC`, `mic-bias:1`, `reference-top:1`, `decoupling-capacitor:1`
- **GND:** `supply:-`, `microphone:GND`, `opamp:VEE`, `reference-bottom:2`, `decoupling-capacitor:2`, `ground:0`
- **MIC_OUT:** `microphone:OUT`, `mic-bias:2`, `coupling-capacitor:1`
- **AMP_IN:** `coupling-capacitor:2`, `opamp:+`, `input-bias:1`
- **VREF:** `reference-top:2`, `reference-bottom:1`, `input-bias:2`, `gain-leg:2`
- **INVERTING:** `opamp:-`, `feedback:2`, `gain-leg:1`
- **OUTPUT:** `opamp:OUT`, `feedback:1`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-electret-audio-preamp`
- Engine: Generic electret microphone and single-supply op-amp preamplifier estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-electret-audio-preamp-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41172104277

Recorded expected result:

```json
{
  "supplyVoltage": 5,
  "microphoneBiasCurrentA": 0.0005,
  "microphoneBiasVoltageV": 3.9,
  "referenceVoltageV": 2.5,
  "gainVPerV": 100,
  "highPassCutoffHz": 0.9253194365807869,
  "signalFrequencyHz": 1000,
  "outputAmplitudeV": 0.9999995718922451,
  "outputMinimumV": 1.5000004281077548,
  "outputMaximumV": 3.4999995718922454,
  "outputWithinSupplyRails": true
}
```

## Safety and model limits

Generic microphone and ideal op-amp analytical estimate. The mic uses a specified 0.5 mA bias current, 10 mV signal amplitude, and 2.2 kΩ source resistance; the op-amp is ideal and single-supply. No specific manufacturer part is implied. Noise, sensitivity spread, frequency-dependent microphone behavior, op-amp bandwidth/slew/input limits, output load, distortion, thermal effects, and physical validation are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/037-electret-audio-preamp.adigun.json`.