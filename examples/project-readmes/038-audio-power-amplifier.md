# 038 — Generic low-voltage class-AB audio amplifier

## Purpose

Drive a nominal 8 Ω + 0.5 mH speaker model from a 9 V, gain-20 low-voltage class-AB amplifier using a 220 µF output coupling capacitor; test audio-band response, speaker RMS current/power, and configured output clipping.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 9 V |
| VIN | `power.ac-source` | 80 mV |
| U1 | `active.lm386n1-gain20` | Av 20; Swing 2 V; Q 4 mA; f 1 kHz |
| COUT | `passive.capacitor` | 220 µF |
| SP1 | `passive.speaker-r-l-generic` | R 8 Ω; L 0.5 mH |
| CDEC | `passive.capacitor` | 100 nF |
| CBYP | `passive.capacitor` | 10 µF |
| RZ | `passive.resistor` | 10 Ω |
| CZ | `passive.capacitor` | 47 nF |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `amplifier:VCC`, `decoupling:1`
- **GND:** `supply:-`, `input:-`, `amplifier:GND`, `amplifier:IN-`, `speaker:-`, `decoupling:2`, `bypass:2`, `zobel-capacitor:2`, `ground:0`
- **AUDIO_IN:** `input:+`, `amplifier:IN`
- **AMP_OUT:** `amplifier:OUT`, `coupling:1`, `zobel-resistor:1`
- **SPEAKER_PLUS:** `coupling:2`, `speaker:+`
- **BYPASS:** `amplifier:BYPASS`, `bypass:1`
- **ZOBEL:** `zobel-resistor:2`, `zobel-capacitor:1`

## Views and physical-layout status

The circuit specifies the TI LM386N-1 with pins 1 and 8 open for gain 20. It includes pin 7 bypass, supply decoupling and the output Zobel network. The intended physical load is PUI's AS04008CO-WR-R. Its nominal impedance is 8 Ω. The model's 0.5 mH inductance remains a generic assumption. The scope displays the modeled unclipped fundamental. Clipping produces a diagnostic without a reconstructed waveform. [TI LM386 datasheet](https://www.ti.com/lit/ds/symlink/lm386.pdf) · [PUI speaker datasheet](https://api.puiaudio.com/file/431f38ab-0adc-4d2d-84f8-d71513c655a3.pdf)

The BB400 stores the LM386N-1 pin and jumper map. Seat pin 1 at F11 and leave pins 1 and 8 isolated. Connect the speaker off board with insulated leads. COUT positive faces pin 5, and CBYP positive faces pin 7. [Panasonic output capacitor data](https://industrial.panasonic.com/sa/products/pt/aluminum-cap-lead/models/EEUFR1C221) · [TDK Zobel capacitor data](https://product.tdk.com/en/search/capacitor/film/rfi_general/info?part_no=B32529C1473J289)

The 64 × 46 mm PCB uses 24 plated pads and two copper layers. J1 pin 1 accepts a current-limited 9 V supply and J2 pin 1 accepts the grounded signal generator. Both pin 2 terminals are ground. Mount the speaker off board and solder insulated wires to the SP1 pads. The fabrication exporter produces both copper Gerbers, the board outline, plated-drill data, and a BOM. Acoustic and bench characterization remain pending.

## Acceptance test and expected result

- Stable test ID: `core-audio-power-amplifier`
- Engine: Generic low-voltage class-AB amplifier and R-L speaker estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-audio-power-amp-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41172329608

Recorded expected result:

```json
{
  "supplyVoltage": 9,
  "inputAmplitudeV": 0.08,
  "frequencyHz": 1000,
  "gainVPerV": 20,
  "requestedOutputAmplitudeV": 1.6,
  "clipped": false,
  "outputBiasVoltageV": 4.5,
  "speakerVoltageRmsV": 1.163489393852444,
  "speakerCurrentRmsA": 0.1353722172005118,
  "speakerRealPowerW": 0.1466050975182603
}
```

## Safety and model limits

Generic ideal LM386-class estimate, not a manufacturer-specific LM386 model. It uses a 9 V supply, gain 20, 2 V peak output swing, 4 mA quiescent-current parameter, and an 8 Ω + 0.5 mH nominal speaker model. THD, actual output-stage current limits, mechanical sound, thermal behavior, supply decoupling parasitics, and device-specific ratings are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/038-audio-power-amplifier.adigun.json`.
