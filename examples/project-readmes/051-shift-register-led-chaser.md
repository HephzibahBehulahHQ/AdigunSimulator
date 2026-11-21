# 051 — Four-bit shift-register LED chaser

## Purpose

Initialize a one-hot Q0 state and move it through Q1, Q2, Q3, then back to Q0 on successive rising clock edges; assert exactly one LED is active.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CLK | `power.dc-source` | 0 V |
| RESET_N | `power.dc-source` | 0 V |
| U1 | `active.sn74hc74n-ring-pair` | SN74HC74N |
| U2 | `active.sn74hc74n-ring-pair` | SN74HC74N |
| R0 | `passive.resistor` | 2.2 kΩ |
| R1 | `passive.resistor` | 2.2 kΩ |
| R2 | `passive.resistor` | 2.2 kΩ |
| R3 | `passive.resistor` | 2.2 kΩ |
| D0 | `diode.led-red` | Vf 2 V |
| D1 | `diode.led-red` | Vf 2 V |
| D2 | `diode.led-red` | Vf 2 V |
| D3 | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |
| C1 | `passive.capacitor` | 100 nF |
| C2 | `passive.capacitor` | 100 nF |

## Net connections

- **VCC:** `supply:+`, `register:VCC`, `register-b:VCC`, `register:CLR1`, `register:PRE2`, `register-b:PRE1`, `register-b:PRE2`, `bypass-a:1`, `bypass-b:1`
- **GND:** `supply:-`, `clock-input:-`, `reset-input:-`, `register:GND`, `ground:0`, `led0:K`, `led1:K`, `led2:K`, `led3:K`, `register-b:GND`, `bypass-a:2`, `bypass-b:2`
- **CLOCK:** `clock-input:+`, `register:CLK1`, `register:CLK2`, `register-b:CLK1`, `register-b:CLK2`
- **RESET_N:** `reset-input:+`, `register:PRE1`, `register:CLR2`, `register-b:CLR1`, `register-b:CLR2`
- **Q0:** `register:Q1`, `register:D2`, `r0:1`
- **LED0:** `r0:2`, `led0:A`
- **Q1:** `register:Q2`, `register-b:D1`, `r1:1`
- **LED1:** `r1:2`, `led1:A`
- **Q2:** `register-b:Q1`, `register-b:D2`, `r2:1`
- **LED2:** `r2:2`, `led2:A`
- **Q3:** `register-b:Q2`, `register:D1`, `r3:1`
- **LED3:** `r3:2`, `led3:A`

## Views and physical-layout status

The BB400 assembly uses two [TI SN74HC74N dual D flip-flops](https://www.ti.com/lit/ds/symlink/sn74hc74.pdf), with pin 1 at F8 and F17. Each Q feeds the next D. Active-low reset presets Q0 and clears the other three stages. Two local bypass capacitors and four 2.2 kΩ LED resistors are included.

The 72 × 51 mm two-layer PCB routes the four D-to-Q connections, clock, reset, four LED paths, and both local bypass capacitors. J1 supplies +5 V, J2 connects CLOCK, and J3 connects active-low RESET_N. All three have a return pin. The project fabrication export checks copper clearance, board fit, and connectivity. Independent package fit and hardware timing review remain pending.

## Acceptance test and expected result

- Stable test ID: `core-shift-register-led-chaser`
- Engine: Ideal four-bit one-hot ring shift register
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-four-bit-ring-shift-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41174509417

Recorded expected result:

```json
{
  "bits": [true, false, false, false],
  "oneHot": true,
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