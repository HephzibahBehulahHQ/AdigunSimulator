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

The physical assembly uses a Samtec TSW-102-07-T-S input header, Bourns 3296W-1-103LF trimmer, TDK B32529C1104K189 film capacitor, and Vishay MRS25000C1002FCT00 load resistor.

## Net connections

- **INPUT:** `source-1:+`, `pot-1:1`
- **OUTPUT:** `pot-1:2`, `cap-1:1`, `load-1:1`
- **GND:** `source-1:-`, `cap-1:2`, `load-1:2`, `ground-1:0`

## Views and physical-layout status

On the BB400, RP1 terminals 1, 2 (wiper) and 3 occupy F7, F8 and F9. Keep the F9–J9 strip isolated. Place C1 across F18/F20 and RLOAD across D18/D22. Jumper TP2–F7, F8–F18, F18–D18, F20–BM20 and D22–BM22. Connect generator signal to TP2 and return to BM2.

The 52 × 30 mm single-sided PCB includes an isolated drill pad for RP1 terminal 3. Set the trimmer to approximately 5 kΩ across terminals 1 and 2 with the generator disconnected. Apply a 1 V peak zero-offset sine to J1 and probe OUTPUT relative to GND with a high-impedance probe. Check the purchased parts and fabricator rules before ordering.

## Acceptance test and expected result

- Stable test ID: `core-passive-tone-control`
- Engine: Analytical loaded single-pole passive treble-cut response
- Engine version: `adigun-simulator@0.1.0`
- Model version: `passive-tone-cut-loaded-rc-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41154851881

Recorded expected result:

```json
{
  "inputAmplitudeV": 1,
  "maximumResistance": 10000,
  "positionPercent": 50,
  "seriesResistance": 5000,
  "capacitance": 1e-7,
  "loadResistance": 10000,
  "cutoffHz": 477.46482927568604,
  "response": [
    {"frequencyHz": 100, "gain": 0.6525091286378826, "phaseRad": -0.20645531758085955},
    {"frequencyHz": 1000, "gain": 0.287247182748001, "phaseRad": -1.1253388328842984},
    {"frequencyHz": 10000, "gain": 0.03179476756097162, "phaseRad": -1.523086077295077}
  ],
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