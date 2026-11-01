# 051 — Four-bit shift-register LED chaser

## Purpose

Initialize a one-hot Q0 state and move it through Q1, Q2, Q3, then back to Q0 on successive rising clock edges; assert exactly one LED is active.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CLK | `power.dc-source` | 0 V |
| RESET_N | `power.dc-source` | 0 V |
| U1 | `active.logic-ring-shift-4bit-ideal` | Four-bit one-hot ring; reset Q0 |
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

- **VCC:** `supply:+`, `register:VCC`
- **GND:** `supply:-`, `clock-input:-`, `reset-input:-`, `register:GND`, `ground:0`, `led0:K`, `led1:K`, `led2:K`, `led3:K`
- **CLOCK:** `clock-input:+`, `register:CLK`
- **RESET_N:** `reset-input:+`, `register:RESET_N`
- **Q0:** `register:Q0`, `r0:1`
- **LED0:** `r0:2`, `led0:A`
- **Q1:** `register:Q1`, `r1:1`
- **LED1:** `r1:2`, `led1:A`
- **Q2:** `register:Q2`, `r2:1`
- **LED2:** `r2:2`, `led2:A`
- **Q3:** `register:Q3`, `r3:1`
- **LED3:** `r3:2`, `led3:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-shift-register-led-chaser`
- Engine: Ideal four-bit one-hot ring shift register
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-four-bit-ring-shift-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41174509417

Recorded expected result:

```json
{
  "resetBits": [
    true,
    false,
    false,
    false
  ],
  "risingEdgeSequence": [
    [
      false,
      true,
      false,
      false
    ],
    [
      false,
      false,
      true,
      false
    ],
    [
      false,
      false,
      false,
      true
    ],
    [
      true,
      false,
      false,
      false
    ]
  ],
  "oneHotEveryState": true,
  "repeatsAfterFourEdges": true,
  "invalidClockAboveSupply": "blocked"
}
```

## Safety and model limits

Generic ideal discrete ring shift-register model. It omits part-specific timing, clock quality, power-up state, propagation delay, setup/hold, and metastability.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/051-shift-register-led-chaser.adigun.json`.