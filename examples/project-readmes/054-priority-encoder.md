# 054 — Four-input priority encoder

## Purpose

Encode the highest-numbered active input into a two-bit output, expose a valid signal for no active inputs, and verify precedence for simultaneous assertions.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| D0 | `power.dc-source` | 0 V |
| D1 | `power.dc-source` | 0 V |
| D2 | `power.dc-source` | 0 V |
| D3 | `power.dc-source` | 0 V |
| U1 | `active.cd4532be-encoder` | CD4532BE |
| R0 | `passive.resistor` | 10 kΩ |
| R1 | `passive.resistor` | 10 kΩ |
| R2 | `passive.resistor` | 10 kΩ |
| DCODE0 | `diode.led-red` | Vf 2 V |
| DCODE1 | `diode.led-red` | Vf 2 V |
| DVALID | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |
| C1 | `passive.capacitor` | 100 nF |

## Net connections

- **VCC:** `supply:+`, `encoder:VCC`, `encoder:EI`, `bypass:1`
- **GND:** `supply:-`, `encoder:GND`, `ground:0`, `led0:K`, `led1:K`, `led2:K`, `input-0:-`, `input-1:-`, `input-2:-`, `input-3:-`, `encoder:D4`, `encoder:D5`, `encoder:D6`, `encoder:D7`, `bypass:2`
- **D0:** `input-0:+`, `encoder:D0`
- **D1:** `input-1:+`, `encoder:D1`
- **D2:** `input-2:+`, `encoder:D2`
- **D3:** `input-3:+`, `encoder:D3`
- **CODE0:** `encoder:CODE0`, `r0:1`
- **LED_CODE0:** `r0:2`, `led0:A`
- **CODE1:** `encoder:CODE1`, `r1:1`
- **LED_CODE1:** `r1:2`, `led1:A`
- **VALID:** `encoder:VALID`, `r2:1`
- **LED_VALID:** `r2:2`, `led2:A`

## Views and physical-layout status

The BB400 uses the [CD4532BE pinout](https://www.ti.com/lit/ds/symlink/cd4532b.pdf) with pin 1 at F12. EI is high, D4 through D7 are grounded, and code bit 2 and EO are isolated. GS drives the valid indicator. Each lit 10 kΩ indicator path draws an ideal 0.30 mA.

The 66 × 46 mm two-layer PCB routes the same connections. J1 provides +5 V. J2 through J5 take D0 through D3. Each connector includes a return pin. The fabrication export checks connectivity, clearance, and board fit. Independent package fit and LED brightness remain to be verified.

## Acceptance test and expected result

- Stable test ID: `core-priority-encoder`
- Engine: Ideal four-input priority encoder
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-four-input-priority-encoder-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41175118038

Recorded expected result:

```json
{
  "kind": "priority-encoder",
  "supplyVoltage": 5,
  "logicThresholdV": 2.5,
  "inputVoltages": [0, 0, 0, 0],
  "inputs": [false, false, false, false],
  "highestIndex": -1,
  "valid": false,
  "code": 0,
  "codeBits": [false, false],
  "outputBits": [false, false, false],
  "outputCurrents": [0, 0, 0],
  "noActiveInput": {
    "valid": false,
    "code": 0
  },
  "singleInputs": {
    "D0": 0,
    "D1": 1,
    "D2": 2,
    "D3": 3
  },
  "multipleInputs": {
    "D0AndD2": 2,
    "D1AndD3": 3,
    "allInputs": 3
  },
  "highestPriority": "D3",
  "invalidInput": "blocked"
}
```

## Safety and model limits

Generic ideal static four-input priority encoder with D3 highest. It omits propagation delay, input loading, noise, and specific device behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/054-priority-encoder.adigun.json`.