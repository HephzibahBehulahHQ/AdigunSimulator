# 047 — Four-bit binary counter

## Purpose

Count modulo-16 rising clock edges into a four-bit output, initialize with active-low reset, and expose bit outputs with current-limited LEDs.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CLK | `power.dc-source` | 0 V |
| RESET_N | `power.dc-source` | 0 V |
| U1 | `active.logic-counter-4bit-ideal` | Ideal modulo-16 counter |
| R0 | `passive.resistor` | 330 Ω |
| R1 | `passive.resistor` | 330 Ω |
| R2 | `passive.resistor` | 330 Ω |
| R3 | `passive.resistor` | 330 Ω |
| D0 | `diode.led-red` | Vf 2 V |
| D1 | `diode.led-red` | Vf 2 V |
| D2 | `diode.led-red` | Vf 2 V |
| D3 | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `counter:VCC`
- **GND:** `supply:-`, `clock-input:-`, `reset-input:-`, `counter:GND`, `led0:K`, `led1:K`, `led2:K`, `led3:K`, `ground:0`
- **CLOCK:** `clock-input:+`, `counter:CLK`
- **RESET_N:** `reset-input:+`, `counter:RESET_N`
- **BIT0:** `counter:Q0`, `r0:1`
- **LED0:** `r0:2`, `led0:A`
- **BIT1:** `counter:Q1`, `r1:1`
- **LED1:** `r1:2`, `led1:A`
- **BIT2:** `counter:Q2`, `r2:1`
- **LED2:** `r2:2`, `led2:A`
- **BIT3:** `counter:Q3`, `r3:1`
- **LED3:** `r3:2`, `led3:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-four-bit-binary-counter`
- Engine: Ideal modulo-16 four-bit rising-edge counter
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-four-bit-counter-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41173932421

Recorded expected result:

```json
{
  "reset": {
    "count": 0,
    "bits": [
      false,
      false,
      false,
      false
    ]
  },
  "countSequence": [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    0
  ],
  "risingEdges": 16,
  "fallingEdgesDoNotCount": true,
  "bitFrequencyRatios": [
    0.5,
    0.25,
    0.125,
    0.0625
  ],
  "invalidClockAboveSupply": "blocked"
}
```

## Safety and model limits

Generic ideal modulo-16 counter state model. It omits clock waveform quality, propagation delay, setup/hold timing, metastability, output loading beyond LED resistors, and device-specific behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/047-four-bit-binary-counter.adigun.json`.