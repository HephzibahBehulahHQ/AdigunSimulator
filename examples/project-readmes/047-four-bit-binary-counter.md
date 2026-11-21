# 047 — Four-bit binary counter

## Purpose

Count modulo-16 rising clock edges into a four-bit output, initialize with active-low reset, and expose bit outputs with current-limited LEDs.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CLK | `power.dc-source` | 0 V |
| RESET_N | `power.dc-source` | 0 V |
| U1 | `active.sn74hc161n-counter` | SN74HC161N |
| C1 | `passive.capacitor` | 100 nF |
| R0 | `passive.resistor` | 2.2 kΩ |
| R1 | `passive.resistor` | 2.2 kΩ |
| R2 | `passive.resistor` | 2.2 kΩ |
| R3 | `passive.resistor` | 2.2 kΩ |
| D0 | `diode.led-red` | Vf 2 V |
| D1 | `diode.led-red` | Vf 2 V |
| D2 | `diode.led-red` | Vf 2 V |
| D3 | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `counter:VCC`, `counter:ENP`, `counter:ENT`, `counter:LOAD_N`, `bypass:1`
- **GND:** `supply:-`, `clock-input:-`, `reset-input:-`, `counter:GND`, `led0:K`, `led1:K`, `led2:K`, `led3:K`, `ground:0`, `counter:A`, `counter:B`, `counter:C`, `counter:D`, `bypass:2`
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

The BB400 assembly uses the [TI SN74HC161N PDIP pinout](https://www.ti.com/lit/ds/symlink/sn74hc161.pdf). Pin 1 sits at F12. ENP, ENT, and LOAD_N are high, A–D are low, and RCO is isolated. C1 provides local supply bypass. Four 2.2 kΩ indicator paths show QA through QD.

The 53 × 54 mm two-layer PCB routes all four bit indicators. J1 supplies +5 V, J2 connects CLOCK, and J3 connects RESET_N. Each header includes a return. The project fabrication export checks board fit, connectivity, and copper clearance. Package fit and electrical behavior on assembled hardware await independent review.

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