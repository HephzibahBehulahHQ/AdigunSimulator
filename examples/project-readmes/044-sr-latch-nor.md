# 044 — Cross-coupled NOR SR latch

## Purpose

Build a two-NOR active-high SR latch with Q/Q̅ LED indicators; verify set, reset, state retention in the hold condition, and rejection of simultaneous set and reset.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SET | `power.dc-source` | 5 V |
| RESET | `power.dc-source` | 0 V |
| U1 | `active.logic-nor-ideal` | Ideal NOR gate |
| U2 | `active.logic-nor-ideal` | Ideal NOR gate |
| RQ | `passive.resistor` | 330 Ω |
| RQB | `passive.resistor` | 330 Ω |
| DQ | `diode.led-red` | Vf 2 V |
| DQB | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `set-gate:VCC`, `reset-gate:VCC`
- **GND:** `supply:-`, `set-input:-`, `reset-input:-`, `set-gate:GND`, `reset-gate:GND`, `q-led:K`, `qbar-led:K`, `ground:0`
- **SET:** `set-input:+`, `set-gate:A`
- **RESET:** `reset-input:+`, `reset-gate:A`
- **Q:** `reset-gate:Y`, `set-gate:B`, `q-resistor:1`
- **QBAR:** `set-gate:Y`, `reset-gate:B`, `qbar-resistor:1`
- **Q_LED:** `q-resistor:2`, `q-led:A`
- **QBAR_LED:** `qbar-resistor:2`, `qbar-led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-sr-latch-nor`
- Engine: Cross-coupled NOR SR latch with memory
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-nor-sr-latch-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41173369419

Recorded expected result:

```json
{
  "mode": "set",
  "q": true,
  "qBar": false,
  "qVoltage": 5,
  "qBarVoltage": 0,
  "qLedCurrentA": 0.00909090909090909,
  "qBarLedCurrentA": 0,
  "set": {
    "mode": "set",
    "q": true,
    "qBar": false,
    "qVoltage": 5,
    "qBarVoltage": 0,
    "qLedCurrentA": 0.00909090909090909,
    "qBarLedCurrentA": 0
  },
  "reset": {
    "mode": "reset",
    "q": false,
    "qBar": true,
    "qVoltage": 0,
    "qBarVoltage": 5,
    "qLedCurrentA": 0,
    "qBarLedCurrentA": 0.00909090909090909
  },
  "holdAfterSet": {
    "mode": "hold",
    "q": true,
    "qBar": false
  },
  "holdAfterReset": {
    "mode": "hold",
    "q": false,
    "qBar": true
  },
  "simultaneousSetAndReset": "blocked"
}
```

## Safety and model limits

Generic ideal static NOR latch. State retention is passed explicitly between analyses. It omits gate propagation delay, metastability, switch bounce, output loading beyond the LED resistor, and manufacturer-specific behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/044-sr-latch-nor.adigun.json`.