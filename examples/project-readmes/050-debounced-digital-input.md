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
| U1 | `active.atmega328p-debounce` | ATmega328P-PU; Stable samples 3 |
| RQ | `passive.resistor` | 1 kΩ |
| DQ | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |
| R7 | `passive.resistor` | 10 kΩ |
| C1 | `passive.capacitor` | 100 nF |
| C2 | `passive.capacitor` | 100 nF |

## Net connections

- **VCC:** `supply:+`, `debounce:VCC`, `debounce:AVCC`, `reset-pullup:1`, `vcc-bypass:1`, `avcc-bypass:1`
- **GND:** `supply:-`, `raw-input:-`, `clock-input:-`, `reset-input:-`, `debounce:GND`, `q-led:K`, `ground:0`, `debounce:AGND`, `vcc-bypass:2`, `avcc-bypass:2`
- **RAW:** `raw-input:+`, `debounce:INPUT`
- **CLOCK:** `clock-input:+`, `debounce:CLK`
- **RESET_N:** `reset-input:+`, `debounce:RESET_N`
- **Q:** `debounce:Q`, `q-resistor:1`
- **Q_LED:** `q-resistor:2`, `q-led:A`
- **MCU_RESET_N:** `debounce:MCU_RESET_N`, `reset-pullup:2`

## Firmware

The [AVR C source](../050-debounced-digital-input/main.c) samples PD4 on rising edges at PD2 and drives the indicator on PC0. PD3 is the active-low state reset. MCU pin 1 is a separate hardware reset held high by a pull-up. Program the chip before insertion using a fixture, and use a known internal-oscillator configuration. Keep the external clock slow enough for polling and hold each raw input value stable while sampling.

The example uses three matching samples. The AVR workflow compiles the source and checks the generated HEX file. Hardware timing and execution remain to be verified.

## Views and physical-layout status

The BB400 map seats the programmed ATmega328P-PU with pin 1 at F10. Both power pins have bypass capacitors and the hardware reset pin has a 10 kΩ pull-up. The Q indicator uses a 1 kΩ series resistor.

The 64 × 48 mm two-layer PCB routes the same connections. J1 supplies +5 V, J2 is RAW, J3 is CLOCK, and J4 is active-low state reset. All four include common return. The fabrication export checks board fit, continuity and copper clearance. Independent package fit and hardware timing review remain pending.

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