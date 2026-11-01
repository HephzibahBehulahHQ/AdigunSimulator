# 094 — Two-source weighted audio mixer

## Purpose

Combine two bounded non-negative source levels at a shared summing node through explicit resistors, then buffer the resistor-weighted average and reject output rail clipping.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SIG1 | `input.audio-mixer-two-source` | V1 1 V; V2 2 V |
| R1 | `passive.resistor` | 10 kΩ |
| R2 | `passive.resistor` | 10 kΩ |
| U1 | `active.audio-summing-buffer-ideal` | Mode unity buffer; Gain 1 |
| SCOPE1 | `output.audio-mixer-report` | Mixer report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `buffer:VCC`, `report:VCC`
- **GND:** `source:-`, `fixture:GND`, `buffer:GND`, `report:GND`, `ground:0`
- **SOURCE_1:** `fixture:IN1`, `r1:1`
- **SOURCE_2:** `fixture:IN2`, `r2:1`
- **SUM:** `r1:2`, `r2:2`, `buffer:IN`
- **MIX_OUT:** `buffer:OUT`, `report:IN`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-audio-summing-mixer`
- Engine: Two-source resistive weighted mixer and ideal unity buffer
- Engine version: `adigun-simulator@0.1.0`
- Model version: `two-source-resistive-weighted-mixer-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41185585767

Recorded expected result:

```json
{
  "kind": "audio-summing-mixer",
  "input1V": 1,
  "input2V": 2,
  "resistor1Ohm": 10000,
  "resistor2Ohm": 10000,
  "weight1": 0.5,
  "weight2": 0.5,
  "sumNodeV": 1.5,
  "outputV": 1.5,
  "clipped": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

Passive resistive weighted-average mixer with an ideal unity buffer only. It is not an inverting active mixer; source output impedance, noise, frequency response, amplifier limits, firmware, and hardware are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/094-simple-audio-mixer.adigun.json`.