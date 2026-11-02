# 053 — Two-to-four decoder-controlled LEDs

## Purpose

Decode every two-bit address into exactly one active-high output and light only the corresponding current-limited LED.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| A0 | `power.dc-source` | 0 V |
| A1 | `power.dc-source` | 0 V |
| U1 | `active.logic-decoder-2to4-ideal` | Ideal active-high 2:4 decoder |
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

- **VCC:** `supply:+`, `decoder:VCC`
- **GND:** `supply:-`, `address-0:-`, `address-1:-`, `decoder:GND`, `ground:0`, `led0:K`, `led1:K`, `led2:K`, `led3:K`
- **A0:** `address-0:+`, `decoder:A0`
- **A1:** `address-1:+`, `decoder:A1`
- **Y0:** `decoder:Y0`, `r0:1`
- **LED0:** `r0:2`, `led0:A`
- **Y1:** `decoder:Y1`, `r1:1`
- **LED1:** `r1:2`, `led1:A`
- **Y2:** `decoder:Y2`, `r2:1`
- **LED2:** `r2:2`, `led2:A`
- **Y3:** `decoder:Y3`, `r3:1`
- **LED3:** `r3:2`, `led3:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-decoder-controlled-leds`
- Engine: Ideal active-high two-to-four decoder
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-2to4-decoder-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41174755037

Recorded expected result:

```json
{
  "kind": "decoder-2to4",
  "supplyVoltage": 5,
  "logicThresholdV": 2.5,
  "addressBits": [false, false],
  "address": 0,
  "outputsHigh": [true, false, false, false],
  "outputCurrents": [0.00909090909090909, 0, 0, 0],
  "oneHot": true,
  "addresses": [
    0,
    1,
    2,
    3
  ],
  "outputVectors": [
    [
      true,
      false,
      false,
      false
    ],
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
    ]
  ],
  "oneHotEachAddress": true,
  "invalidVoltage": "blocked"
}
```

## Safety and model limits

Generic ideal static active-high decoder. It omits propagation delay, output drive limits, leakage, noise, enable inputs, and device-specific logic thresholds.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/053-decoder-controlled-leds.adigun.json`.