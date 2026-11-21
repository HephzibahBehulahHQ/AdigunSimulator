# 044 — Cross-coupled NOR SR latch

## Purpose

Build a two-NOR active-high SR latch with Q/Q̅ LED indicators; verify set, reset, state retention in the hold condition, and rejection of simultaneous set and reset.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SET | `power.dc-source` | 5 V |
| RESET | `power.dc-source` | 0 V |
| U1 | `active.sn74hc02n-latch` | SN74HC02N, gates 1 and 2 |
| C1 | `passive.capacitor` | 100 nF |
| RQ | `passive.resistor` | 2.2 kΩ |
| RQB | `passive.resistor` | 2.2 kΩ |
| DQ | `diode.led-red` | Vf 2 V |
| DQB | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `latch:VCC`, `bypass:1`
- **GND:** `supply:-`, `set-input:-`, `reset-input:-`, `latch:GND`, `q-led:K`, `qbar-led:K`, `ground:0`, `bypass:2`, `latch:3A`, `latch:3B`, `latch:4A`, `latch:4B`
- **SET:** `set-input:+`, `latch:1A`
- **RESET:** `reset-input:+`, `latch:2A`
- **Q:** `latch:2Y`, `latch:1B`, `q-resistor:1`
- **QBAR:** `latch:1Y`, `latch:2B`, `qbar-resistor:1`
- **Q_LED:** `q-resistor:2`, `q-led:A`
- **QBAR_LED:** `qbar-resistor:2`, `qbar-led:A`

## Views and physical-layout status

The BB400 assembly places one SN74HC02N with pin 1 at F12. C1 bypasses VCC to ground. Unused inputs 8, 9, 11 and 12 are grounded, and outputs 10 and 13 remain isolated. Both 2.2 kΩ indicator paths use the same common return. Hardware characterization is pending.

The 51 × 44 mm two-layer PCB routes both cross-coupled feedback paths and both indicators. J1 supplies +5 V, J2 sets the latch, and J3 resets it. Each header includes a common return. The fabrication export checks pad connectivity, clearance, and board fit. Independent package review and bench characterization are pending.

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
  "qLedCurrentA": 0.0013636363636363637,
  "qBarLedCurrentA": 0,
  "set": {
    "mode": "set",
    "q": true,
    "qBar": false,
    "qVoltage": 5,
    "qBarVoltage": 0,
    "qLedCurrentA": 0.0013636363636363637,
    "qBarLedCurrentA": 0
  },
  "reset": {
    "mode": "reset",
    "q": false,
    "qBar": true,
    "qVoltage": 0,
    "qBarVoltage": 5,
    "qLedCurrentA": 0,
    "qBarLedCurrentA": 0.0013636363636363637
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