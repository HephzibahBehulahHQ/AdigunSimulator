# 036 — Four-switch H-bridge DC motor driver

## Purpose

Use two generic P-channel high-side switches and two generic N-channel low-side switches to drive a 390 Ω + 100 mH motor electrical equivalent from 12 V; test forward and reverse static vectors, coast, MOSFET gate bounds, and same-leg shoot-through interlock.

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
| RM | `passive.resistor` | 390 Ω |
| LM | `passive.inductor` | 100 mH |
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

The BB400 assembly uses IRF9540NPBF high-side switches and FQP30N06L low-side switches. The 390 Ω resistor and Würth 7447471104 100 mH inductor form a static test load. The ideal 30.8 mA current stays below the inductor rating of 50 mA. Set the gate levels before energizing a 12 V supply limited to 40 mA and keep the drain tabs isolated.

The 76 × 58 mm two-layer PCB has 26 plated pads. J1 is the supply. J2 through J5 accept LH, LL, RH and RL gate voltages, respectively. Pin 2 on each connector is ground. The scope reports settled modeled levels and excludes the floating motor nodes in coast. Disconnect the supply and let load current decay before changing the gate vector. The board has not been bench-tested.

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
  "motorCurrentA": 0.030753459764223477,
  "motorVoltageV": 11.993849308047157,
  "leftOutputVoltageV": 11.996924654023578,
  "rightOutputVoltageV": 0.0030753459764223477,
  "shootThrough": false
}
```

## Safety and model limits

Ideal static educational switch model only. It uses 0.1 Ω on-resistance per conducting MOSFET and represents the motor as a series resistance and inductance. It checks same-leg overlap but omits motor back EMF, speed/torque, switching dead time, body-diode commutation, transient current decay, thermal behavior, manufacturer-specific ratings, and safe physical direction reversal.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/036-hbridge-dc-motor.adigun.json`.