# 037 — Electret microphone single-supply audio preamp

## Purpose

Bias a generic electret microphone from 5 V, AC-couple its 10 mV 1 kHz signal into a midpoint-biased non-inverting op-amp preamplifier, and test microphone bias, gain, high-pass response, and output headroom.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| MIC1 | `sensor.electret-two-terminal` | Imic 0.5 mA; Vsig 10 mV; f 1 kHz; Rs 2.2 kΩ |
| U1 | `active.opamp-ideal` | Ideal single-supply op-amp; input 0 to 5 V |
| GND | `ground.signal` | 0 V |
| RB1 | `passive.resistor` | 2.2 kΩ |
| R1 | `passive.resistor` | 100 kΩ |
| R2 | `passive.resistor` | 100 kΩ |
| RIN | `passive.resistor` | 15 kΩ |
| RF | `passive.resistor` | 100 kΩ |
| RG | `passive.resistor` | 1 kΩ |
| CIN | `passive.capacitor` | 10 µF |
| CDEC | `passive.capacitor` | 100 nF |
| CREF | `passive.capacitor` | 10 µF |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `opamp:VCC`, `mic-bias:1`, `reference-top:1`, `decoupling-capacitor:1`
- **GND:** `supply:-`, `microphone:GND`, `opamp:VEE`, `reference-bottom:2`, `decoupling-capacitor:2`, `reference-bypass:2`, `ground:0`
- **MIC_OUT:** `microphone:OUT`, `mic-bias:2`, `coupling-capacitor:1`
- **AMP_IN:** `coupling-capacitor:2`, `opamp:+`, `input-bias:1`
- **VREF:** `reference-top:2`, `reference-bottom:1`, `input-bias:2`, `gain-leg:2`, `reference-bypass:1`
- **INVERTING:** `opamp:-`, `feedback:2`, `gain-leg:1`
- **OUTPUT:** `opamp:OUT`, `feedback:1`

## Views and physical-layout status

The BB400 assembly uses a PUI AOM-4544P-2-R two-terminal capsule and a Microchip MCP601-I/P. The ideal model accounts for the 2.2 kΩ effective source resistance, the coupling capacitor, and the loaded bypassed midpoint. With the specified 10 mV input at 1 kHz, it yields roughly 0.881 V peak around 2.5 V. [PUI microphone drawing](https://api.puiaudio.com/filename/AOM-4544P-2-R.pdf) · [Microchip op-amp datasheet](https://ww1.microchip.com/downloads/aemDocuments/documents/APID/ProductDocuments/DataSheets/MCP601-1R-2-3-4-2.7V-to-6.0V-Single-Supply-CMOS-Op-Amps-DS20001314.pdf)

Use insulated microphone pigtails and observe polarity. Seat U1 with pin 1 at F11. CIN positive faces MIC_OUT, and CREF positive faces VREF.

The 76 × 57 mm PCB contains 30 plated pads and routed front and back copper. J1 pin 1 accepts regulated 5 V and pin 2 is ground. MIC1 uses 2.50 mm pin spacing. Its terminal 1 is the biased output and terminal 2 is ground. Probe RF pin 1 for the output. The fabrication exporter provides both copper Gerbers, board outline, plated drills, and a BOM. Acoustic gain, noise, bandwidth, and hardware behavior remain uncharacterized.

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
  "gainVPerV": 101,
  "highPassCutoffHz": 0.925319436580787,
  "signalFrequencyHz": 1000,
  "outputAmplitudeV": 0.8807009067761352,
  "outputMinimumV": 1.619299093223865,
  "outputMaximumV": 3.380700906776135,
  "outputWithinSupplyRails": true
}
```

## Safety and model limits

Generic microphone and ideal op-amp analytical estimate. The mic uses a specified 0.5 mA bias current, 10 mV signal amplitude, and 2.2 kΩ source resistance; the op-amp is ideal and single-supply. No specific manufacturer part is implied. Noise, sensitivity spread, frequency-dependent microphone behavior, op-amp bandwidth/slew/input limits, output load, distortion, thermal effects, and physical validation are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/037-electret-audio-preamp.adigun.json`.
