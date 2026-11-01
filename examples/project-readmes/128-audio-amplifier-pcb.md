# 128 — Low-voltage LM386 audio amplifier PCB

## Purpose

Review LM386 audio-input, gain, bypass, supply-decoupling, speaker-output and Zobel wiring; verify PCB grounding/routing checklist, bounded DRC, BOM and placement exports.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 9 V |
| V2 | `power.ac-source` | 0.1 V; 1 kHz |
| U1 | `active.lm386-classab` | TI LM386N-1; 9 V supply; gain capacitor fitted |
| J1 | `connector.audio-input-2` | Audio signal, GND |
| J2 | `connector.speaker-terminal-2` | Speaker +, GND; 8 Ω nominal |
| C1 | `passive.electrolytic-capacitor` | 100 µF; 16 V |
| C2 | `passive.capacitor` | 100 nF |
| C3 | `passive.electrolytic-capacitor` | 10 µF; 16 V input coupling |
| C4 | `passive.electrolytic-capacitor` | 10 µF; 16 V gain setting |
| C5 | `passive.electrolytic-capacitor` | 10 µF; 16 V bypass |
| C6 | `passive.electrolytic-capacitor` | 220 µF; 16 V output coupling |
| R1 | `passive.resistor` | 10 Ω |
| C7 | `passive.capacitor` | 47 nF |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `amp:VS`, `c-bulk:+`, `c-hf:2`
- **GND:** `supply:-`, `audio-source:-`, `amp:GND`, `amp:MINUS_INPUT`, `c-bulk:-`, `c-bypass:-`, `zobel-c:2`, `j-in:GND`, `j-spk:SPK-`, `ground:0`, `c-hf:1`
- **AUDIO_IN:** `audio-source:+`, `j-in:IN`, `c-in:-`
- **AMP_IN:** `c-in:+`, `amp:PLUS_INPUT`
- **GAIN1:** `amp:GAIN1`, `c-gain:+`
- **GAIN2:** `amp:GAIN2`, `c-gain:-`
- **BYPASS:** `amp:BYPASS`, `c-bypass:+`
- **AMP_OUT:** `amp:VOUT`, `c-out:+`, `zobel-r:1`
- **SPK_POS:** `c-out:-`, `j-spk:SPK+`
- **ZOBEL:** `zobel-r:2`, `zobel-c:1`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

Stored PCB board and fabrication preview data are present (54 × 32 mm). This does not certify design-rule compliance or manufacturability.

## Acceptance test and expected result

- Stable test ID: `core-audio-amplifier-pcb`
- Engine: Bounded LM386 topology checker, PCB DRC, grounding/routing checklist, and reproducible exports
- Engine version: `adigun-simulator@0.1.0`
- Model version: `lm386-classab-low-voltage-pcb-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41197388281

Recorded expected result:

```json
{
  "kind": "lm386-audio-amplifier-topology",
  "device": "LM386N-1",
  "supplyVoltageV": 9,
  "manufacturerPinMapValid": true,
  "groundRoutingReview": "passed",
  "pcbDrc": "passed",
  "artifacts": [
    "BOM.csv",
    "Placement.csv",
    "Grounding-Routing-Review.csv",
    "board-F_Cu.gbr",
    "board-Edge_Cuts.gbr",
    "board-PTH.drl"
  ],
  "audioGainSimulation": false,
  "hardwareManufacturingQualified": false
}
```

## Safety and model limits

Educational 9 V topology and PCB template only. Audio gain, clipping, THD, thermal behavior, speaker power, EMC, production tolerances, and manufacturing safety are not simulated or qualified. Verify the selected parts, footprints and layout before fabrication.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/128-audio-amplifier-pcb.adigun.json`.