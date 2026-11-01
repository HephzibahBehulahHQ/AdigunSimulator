# 023 — 556 dual timer

## Purpose

Model both NE556 astable channels from independent RA/RB/timing-capacitor networks; verify each frequency separately and ensure changing channel B's capacitor leaves channel A unchanged.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.ne556` | NE556 independent astable channels |
| RA1 | `passive.resistor` | 10 kΩ |
| RB1 | `passive.resistor` | 10 kΩ |
| CT1 | `passive.capacitor` | 100 µF |
| CC1 | `passive.capacitor` | 10 nF |
| RA2 | `passive.resistor` | 10 kΩ |
| RB2 | `passive.resistor` | 10 kΩ |
| CT2 | `passive.capacitor` | 10 µF |
| CC2 | `passive.capacitor` | 10 nF |
| RLED1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| RLED2 | `passive.resistor` | 330 Ω |
| D2 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source-1:+`, `timer-1:14`, `timer-1:4`, `timer-1:10`, `ra-A:1`, `ra-B:1`
- **A_DISCHARGE:** `timer-1:1`, `ra-A:2`, `rb-A:1`
- **A_TIMING:** `timer-1:2`, `timer-1:6`, `rb-A:2`, `ct-A:1`
- **A_CONTROL:** `timer-1:3`, `cc-A:1`
- **A_OUTPUT:** `timer-1:5`, `rled-A:1`
- **A_LED:** `rled-A:2`, `led-A:A`
- **B_DISCHARGE:** `timer-1:13`, `ra-B:2`, `rb-B:1`
- **B_TIMING:** `timer-1:12`, `timer-1:8`, `rb-B:2`, `ct-B:1`
- **B_CONTROL:** `timer-1:11`, `cc-B:1`
- **B_OUTPUT:** `timer-1:9`, `rled-B:1`
- **B_LED:** `rled-B:2`, `led-B:A`
- **GND:** `source-1:-`, `timer-1:7`, `ct-A:2`, `cc-A:2`, `ct-B:2`, `cc-B:2`, `led-A:K`, `led-B:K`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-556-dual-astable`
- Engine: Analytical independent NE556 astable timing estimates
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-ne556-dual-astable-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41169003725

Recorded expected result:

```json
{
  "channelA": {
    "frequencyHz": 4.809043771043771,
    "dutyCycle": 0.6666666666666666,
    "highTimeS": 1.386,
    "lowTimeS": 0.693
  },
  "channelB": {
    "frequencyHz": 48.09043771043771,
    "dutyCycle": 0.6666666666666666,
    "highTimeS": 0.1386,
    "lowTimeS": 0.0693
  }
}
```

## Safety and model limits

Ideal analytical timer equations only. The generic model omits chip-specific tolerances, output saturation, startup, crosstalk, ratings, and hardware qualification.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/023-556-dual-timer.adigun.json`.