# 049 — Traffic-light state machine

## Purpose

Cycle through north/south green, north/south yellow, all red, east/west green, east/west yellow, all red; test all lamp vectors and ensure opposing directions are never green simultaneously.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CLK | `power.dc-source` | 0 V |
| RESET_N | `power.dc-source` | 0 V |
| U1 | `active.logic-traffic-fsm-ideal` | Six-phase traffic-light FSM |
| R-NS_R | `passive.resistor` | 330 Ω |
| R-NS_Y | `passive.resistor` | 330 Ω |
| R-NS_G | `passive.resistor` | 330 Ω |
| R-EW_R | `passive.resistor` | 330 Ω |
| R-EW_Y | `passive.resistor` | 330 Ω |
| R-EW_G | `passive.resistor` | 330 Ω |
| LED-NS_R | `diode.led-red` | Vf 2 V |
| LED-NS_Y | `diode.led-red` | Vf 2 V |
| LED-NS_G | `diode.led-red` | Vf 2 V |
| LED-EW_R | `diode.led-red` | Vf 2 V |
| LED-EW_Y | `diode.led-red` | Vf 2 V |
| LED-EW_G | `diode.led-red` | Vf 2 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `fsm:VCC`
- **GND:** `supply:-`, `clock-input:-`, `reset-input:-`, `fsm:GND`, `ground:0`, `led-NS_R:K`, `led-NS_Y:K`, `led-NS_G:K`, `led-EW_R:K`, `led-EW_Y:K`, `led-EW_G:K`
- **CLOCK:** `clock-input:+`, `fsm:CLK`
- **RESET_N:** `reset-input:+`, `fsm:RESET_N`
- **LAMP_NS_R:** `fsm:NS_R`, `r-NS_R:1`
- **LED_NS_R:** `r-NS_R:2`, `led-NS_R:A`
- **LAMP_NS_Y:** `fsm:NS_Y`, `r-NS_Y:1`
- **LED_NS_Y:** `r-NS_Y:2`, `led-NS_Y:A`
- **LAMP_NS_G:** `fsm:NS_G`, `r-NS_G:1`
- **LED_NS_G:** `r-NS_G:2`, `led-NS_G:A`
- **LAMP_EW_R:** `fsm:EW_R`, `r-EW_R:1`
- **LED_EW_R:** `r-EW_R:2`, `led-EW_R:A`
- **LAMP_EW_Y:** `fsm:EW_Y`, `r-EW_Y:1`
- **LED_EW_Y:** `r-EW_Y:2`, `led-EW_Y:A`
- **LAMP_EW_G:** `fsm:EW_G`, `r-EW_G:1`
- **LED_EW_G:** `r-EW_G:2`, `led-EW_G:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-traffic-light-fsm`
- Engine: Ideal six-phase traffic-light finite-state machine
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-six-phase-traffic-fsm-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41174259998

Recorded expected result:

```json
{
  "phaseLampVectors": [
    [
      false,
      false,
      true,
      true,
      false,
      false
    ],
    [
      false,
      true,
      false,
      true,
      false,
      false
    ],
    [
      true,
      false,
      false,
      true,
      false,
      false
    ],
    [
      true,
      false,
      false,
      false,
      false,
      true
    ],
    [
      true,
      false,
      false,
      false,
      true,
      false
    ],
    [
      true,
      false,
      false,
      true,
      false,
      false
    ]
  ],
  "repeatsAfterSixPhases": true,
  "opposingGreenInvariant": true,
  "onePhasePerRisingEdge": true
}
```

## Safety and model limits

Generic educational six-phase static FSM. It advances once per rising edge and omits real-time duration, pedestrian control, sensor inputs, certified traffic-signal interlocks, propagation delay, and regulatory behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/049-traffic-light-fsm.adigun.json`.