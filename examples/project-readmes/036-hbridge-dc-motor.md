# 036 — Four-switch H-bridge DC motor driver

## Purpose

Use two generic P-channel high-side switches and two generic N-channel low-side switches to drive a 6 Ω + 10 mH motor electrical equivalent from 12 V; test forward and reverse static vectors, coast, MOSFET gate bounds, and same-leg shoot-through interlock.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| VGLH | `power.dc-source` | 0 V |
| VGLL | `power.dc-source` | 0 V |
| VGRH | `power.dc-source` | 12 V |
| VGRL | `power.dc-source` | 5 V |
| Q1 | `active.pmos-high-side-ideal` | Vth 2 V; RdsOn 0.1 Ω; |VGS|max 20 V |
| Q2 | `active.nmos-switch` | Vth 2 V; RdsOn 0.1 Ω |
| Q3 | `active.pmos-high-side-ideal` | Vth 2 V; RdsOn 0.1 Ω; |VGS|max 20 V |
| Q4 | `active.nmos-switch` | Vth 2 V; RdsOn 0.1 Ω |
| RM | `passive.resistor` | 6 Ω |
| LM | `passive.inductor` | 10 mH |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `pmos-left:S`, `pmos-right:S`
- **GND:** `supply:-`, `gate-lh:-`, `gate-ll:-`, `gate-rh:-`, `gate-rl:-`, `nmos-left:S`, `nmos-right:S`, `ground:0`
- **GATE_LH:** `gate-lh:+`, `pmos-left:G`
- **GATE_LL:** `gate-ll:+`, `nmos-left:G`
- **GATE_RH:** `gate-rh:+`, `pmos-right:G`
- **GATE_RL:** `gate-rl:+`, `nmos-right:G`
- **MOTOR_A:** `pmos-left:D`, `nmos-left:D`, `motor-resistance:1`
- **MOTOR_MID:** `motor-resistance:2`, `motor-inductance:1`
- **MOTOR_B:** `motor-inductance:2`, `pmos-right:D`, `nmos-right:D`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-hbridge-dc-motor`
- Engine: Ideal four-switch H-bridge DC motor electrical estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-hbridge-dc-motor-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41171857367

Recorded expected result:

```json
{
  "supplyVoltage": 12,
  "direction": "forward",
  "motorCurrentA": 1.9354838709677418,
  "motorVoltageV": 11.61290322580645,
  "leftOutputVoltageV": 11.806451612903226,
  "rightOutputVoltageV": 0.1935483870967742,
  "shootThrough": false
}
```

## Safety and model limits

Ideal static educational switch model only. It uses 0.1 Ω on-resistance per conducting MOSFET and represents the motor as a series resistance and inductance. It checks same-leg overlap but omits motor back EMF, speed/torque, switching dead time, body-diode commutation, transient current decay, thermal behavior, manufacturer-specific ratings, and safe physical direction reversal.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/036-hbridge-dc-motor.adigun.json`.