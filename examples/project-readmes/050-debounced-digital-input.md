# 050 — Debounced digital input

## Purpose

Reject short alternating bounce samples and change the logical output only after three matching samples at rising clock edges; test reset, bounce and stable press.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| RAW | `power.dc-source` | 0 V |
| SAMPLE_CLK | `power.dc-source` | 0 V |
| RESET_N | `power.dc-source` | 0 V |
| U1 | `active.logic-debounce-ideal` | Stable samples 3 |
| RQ | `passive.resistor` | 330 Ω |
| DQ | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `debounce:VCC`
- **GND:** `supply:-`, `raw-input:-`, `clock-input:-`, `reset-input:-`, `debounce:GND`, `q-led:K`, `ground:0`
- **RAW:** `raw-input:+`, `debounce:INPUT`
- **CLOCK:** `clock-input:+`, `debounce:CLK`
- **RESET_N:** `reset-input:+`, `debounce:RESET_N`
- **Q:** `debounce:Q`, `q-resistor:1`
- **Q_LED:** `q-resistor:2`, `q-led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-debounced-digital-input`
- Engine: Ideal clocked N-sample digital debounce filter
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-digital-debounce-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41174382431

Recorded expected result:

```json
{
  "samplesRequired": 3,
  "sampleCount": 3,
  "output": false,
  "bounceSequenceRejected": [
    5,
    0,
    5,
    0,
    5,
    0
  ],
  "stableHighSequence": [
    5,
    5,
    5
  ],
  "outputAfterTwoStableHighSamples": false,
  "outputAfterThreeStableHighSamples": true,
  "invalidVoltage": "blocked"
}
```

## Safety and model limits

Ideal sampled digital stability-window model, not an analog RC/Schmitt circuit. It omits actual bounce timing, analog time constants, thresholds, metastability, noise coupling, and component-specific behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/050-debounced-digital-input.adigun.json`.