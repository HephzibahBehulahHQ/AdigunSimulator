# 093 — Guitar pickup high-impedance buffer

## Purpose

Estimate a guitar pickup's AC transfer through a source resistor and coupling capacitor into an ideal high-input-impedance JFET follower and finite load, including low-frequency roll-off and midband gain.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 9 V |
| PICKUP1 | `input.guitar-pickup-frequency-sweep` | FrequenciesHz 20,80,1000,5000,20000; AmplitudeV 0.1; SourceResistance 6.8 kΩ; LoadResistance 100 kΩ |
| R1 | `passive.resistor` | 6.8 kΩ |
| C1 | `passive.capacitor` | 10 nF |
| Q1 | `active.guitar-jfet-buffer-ideal` | Mode source follower; Rin 1 MΩ; Rout 100 Ω; Gain 0.98; Cin 100 pF |
| R2 | `passive.resistor` | 100 kΩ |
| SCOPE1 | `output.guitar-buffer-response` | Buffer response |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `buffer:VCC`, `report:VCC`
- **GND:** `source:-`, `fixture:GND`, `buffer:GND`, `report:GND`, `load:2`, `ground:0`
- **PICKUP_OUT:** `fixture:OUT`, `source-resistance:1`
- **COUPLING_IN:** `source-resistance:2`, `coupling-capacitor:1`
- **BUFFER_IN:** `coupling-capacitor:2`, `buffer:IN`
- **BUFFER_OUT:** `buffer:OUT`, `report:IN`, `load:1`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-guitar-buffer-response`
- Engine: Ideal guitar pickup and JFET buffer AC estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-guitar-pickup-jfet-buffer-ac-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41185401544

Recorded expected result:

```json
{
  "kind": "guitar-buffer-response",
  "sourceResistanceOhm": 6800,
  "inputResistanceOhm": 1000000,
  "inputImpedanceRatio": 147.05882352941177,
  "couplingCapacitanceF": 1e-8,
  "outputLoadOhm": 100000,
  "lowFrequencyGainBelow": 0.9,
  "midbandGainMinimum": 0.95,
  "midbandGainMaximum": 1,
  "highInputImpedance": true,
  "unityGainInBand": true,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal pickup and buffer AC estimate only. Pickup inductance/resonance, cable effects, device noise and transfer curves, clipping, tone controls, firmware, and physical hardware are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/093-guitar-pedal-buffer.adigun.json`.