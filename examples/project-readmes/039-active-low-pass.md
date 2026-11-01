# 039 — First-order active low-pass filter

## Purpose

Combine a 10 kΩ input resistor and 10 nF shunt capacitor with a non-inverting op-amp stage of gain 2 on ±9 V rails; test calculated cutoff, below/at/above-cutoff response, and output rail limits.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| VCC | `power.dc-source` | 9 V |
| VEE | `power.dc-source` | 9 V |
| VIN | `power.ac-source` | 1 V |
| U1 | `active.opamp-ideal` | Ideal op-amp, ±9 V rails |
| RIN | `passive.resistor` | 10 kΩ |
| RF | `passive.resistor` | 10 kΩ |
| RG | `passive.resistor` | 10 kΩ |
| C1 | `passive.capacitor` | 10 nF |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `positive-rail:+`, `opamp:VCC`
- **VEE:** `negative-rail:-`, `opamp:VEE`
- **GND:** `positive-rail:-`, `negative-rail:+`, `input:-`, `gain-leg:2`, `capacitor:2`, `ground:0`
- **INPUT:** `input:+`, `input-resistor:1`
- **FILTERED_INPUT:** `input-resistor:2`, `opamp:+`, `capacitor:1`
- **INVERTING:** `opamp:-`, `feedback:2`, `gain-leg:1`
- **OUTPUT:** `opamp:OUT`, `feedback:1`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-active-low-pass`
- Engine: First-order RC active low-pass and ideal non-inverting gain estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-active-low-pass-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41172495332

Recorded expected result:

```json
{
  "cutoffHz": 1591.5494309189535,
  "passbandGain": 2,
  "response": [
    {
      "frequencyHz": 159.15494309189535,
      "gain": 1.9900743804199783
    },
    {
      "frequencyHz": 1591.5494309189535,
      "gain": 1.414213562373095
    },
    {
      "frequencyHz": 15915.494309189535,
      "gain": 0.19900743804199783
    }
  ],
  "maximumOutputAmplitudeV": 2
}
```

## Safety and model limits

Ideal first-order RC and op-amp estimate. It omits op-amp finite bandwidth/slew/noise, capacitor/resistor tolerance and parasitics, loading, and manufacturer-specific behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/039-active-low-pass.adigun.json`.