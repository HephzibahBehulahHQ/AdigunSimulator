# 055 — Four-bit ALU add/subtract

## Purpose

Compute unsigned four-bit addition or two's-complement subtraction, display the result and carry/no-borrow flag, and test all 512 operand/operation combinations.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| VCC | `power.dc-source` | 5 V |
| A0 | `power.dc-source` | 0 V |
| A1 | `power.dc-source` | 0 V |
| A2 | `power.dc-source` | 0 V |
| A3 | `power.dc-source` | 0 V |
| B0 | `power.dc-source` | 0 V |
| B1 | `power.dc-source` | 0 V |
| B2 | `power.dc-source` | 0 V |
| B3 | `power.dc-source` | 0 V |
| SUB | `power.dc-source` | 0 V |
| U1 | `active.logic-alu4-ideal` | Four-bit add/subtract |
| R0 | `passive.resistor` | 330 Ω |
| R1 | `passive.resistor` | 330 Ω |
| R2 | `passive.resistor` | 330 Ω |
| R3 | `passive.resistor` | 330 Ω |
| R4 | `passive.resistor` | 330 Ω |
| D0 | `diode.led-red` | Vf 2 V |
| D1 | `diode.led-red` | Vf 2 V |
| D2 | `diode.led-red` | Vf 2 V |
| D3 | `diode.led-red` | Vf 2 V |
| D4 | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `alu:VCC`
- **GND:** `supply:-`, `alu:GND`, `ground:0`, `a0:-`, `a1:-`, `a2:-`, `a3:-`, `b0:-`, `b1:-`, `b2:-`, `b3:-`, `subtract:-`, `led0:K`, `led1:K`, `led2:K`, `led3:K`, `led4:K`
- **A0:** `a0:+`, `alu:A0`
- **B0:** `b0:+`, `alu:B0`
- **A1:** `a1:+`, `alu:A1`
- **B1:** `b1:+`, `alu:B1`
- **A2:** `a2:+`, `alu:A2`
- **B2:** `b2:+`, `alu:B2`
- **A3:** `a3:+`, `alu:A3`
- **B3:** `b3:+`, `alu:B3`
- **SUB:** `subtract:+`, `alu:SUB`
- **SUM0:** `alu:SUM0`, `r0:1`
- **LED_SUM0:** `r0:2`, `led0:A`
- **SUM1:** `alu:SUM1`, `r1:1`
- **LED_SUM1:** `r1:2`, `led1:A`
- **SUM2:** `alu:SUM2`, `r2:1`
- **LED_SUM2:** `r2:2`, `led2:A`
- **SUM3:** `alu:SUM3`, `r3:1`
- **LED_SUM3:** `r3:2`, `led3:A`
- **CARRY:** `alu:CARRY`, `r4:1`
- **LED_CARRY:** `r4:2`, `led4:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-alu-add-subtract`
- Engine: Ideal four-bit combinational add/subtract ALU
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-four-bit-alu-add-subtract-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41175277951

Recorded expected result:

```json
{
  "kind": "alu4-add-subtract",
  "supplyVoltage": 5,
  "logicThresholdV": 2.5,
  "aBits": [false, false, false, false],
  "bBits": [false, false, false, false],
  "subtract": false,
  "a": 0,
  "b": 0,
  "adjustedB": 0,
  "sumBits": [false, false, false, false],
  "sum": 0,
  "carryOut": false,
  "borrow": false,
  "outputBits": [false, false, false, false, false],
  "outputCurrents": [0, 0, 0, 0, 0],
  "operation": "add",
  "operandBits": 4,
  "operationModes": [
    "add",
    "subtract"
  ],
  "exhaustiveVectors": 512,
  "carryInAdd": "unsigned carry out",
  "carryInSubtract": "no-borrow indicator",
  "signedOverflow": "not modeled"
}
```

## Safety and model limits

Generic ideal combinational arithmetic model. Signed overflow, propagation delay, logic hazards, real gates, and device-specific electrical limits are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/055-alu-add-subtract.adigun.json`.