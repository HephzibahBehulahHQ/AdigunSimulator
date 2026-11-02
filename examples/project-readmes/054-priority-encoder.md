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
| U1 | `active.logic-priority-encoder-4to2-ideal` | D3 highest priority |
| R0 | `passive.resistor` | 330 Ω |
| R1 | `passive.resistor` | 330 Ω |
| R2 | `passive.resistor` | 330 Ω |
| DCODE0 | `diode.led-red` | Vf 2 V |
| DCODE1 | `diode.led-red` | Vf 2 V |
| DVALID | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `encoder:VCC`
- **GND:** `supply:-`, `encoder:GND`, `ground:0`, `led0:K`, `led1:K`, `led2:K`, `input-0:-`, `input-1:-`, `input-2:-`, `input-3:-`
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

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

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