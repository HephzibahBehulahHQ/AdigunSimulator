# 014 — Single-pole passive treble-cut control

## Purpose

Calculate a loaded 100 Hz, 1 kHz, and 10 kHz response for an audio source, adjustable series rheostat, shunt capacitor, and load; test that increased control resistance attenuates treble more than bass.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| VAC1 | `power.ac-source` | 1 V |
| RP1 | `passive.potentiometer` | Rmax 10 kΩ; position 50% |
| C1 | `passive.capacitor` | 100 nF |
| RLOAD | `passive.resistor` | 10 kΩ |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **INPUT:** `source-1:+`, `pot-1:1`
- **OUTPUT:** `pot-1:2`, `cap-1:1`, `load-1:1`
- **GND:** `source-1:-`, `cap-1:2`, `load-1:2`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-passive-tone-control`
- Engine: Analytical loaded single-pole passive treble-cut response
- Engine version: `adigun-simulator@0.1.0`
- Model version: `passive-tone-cut-loaded-rc-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41154851881

Recorded expected result:

```json
{
  "defaultPosition50Percent": {
    "cutoffHz": 477.46482927568604,
    "response": [
      {
        "frequencyHz": 100,
        "gain": 0.6525091286378826,
        "phaseRad": -0.20645531758085955
      },
      {
        "frequencyHz": 1000,
        "gain": 0.287247182748001,
        "phaseRad": -1.1253388328842984
      },
      {
        "frequencyHz": 10000,
        "gain": 0.03179476756097162,
        "phaseRad": -1.523086077295077
      }
    ]
  },
  "position0Percent": {
    "controlResistanceOhm": 0,
    "highFrequencyGain": 1
  },
  "position100Percent": {
    "controlResistanceOhm": 10000,
    "highFrequencyGain": 0.015907437547469306
  }
}
```

## Safety and model limits

Small-signal ideal educational model only. It implements a single-pole treble-cut network, not a multi-band equalizer or audio power amplifier. Component tolerances, wiper noise, power limits, and hardware safety are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/014-passive-tone-control.adigun.json`.