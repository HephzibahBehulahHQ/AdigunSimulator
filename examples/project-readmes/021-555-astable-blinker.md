# 021 — 555 astable LED blinker

## Purpose

Model an ideal NE555 astable using RA=10 kΩ, RB=10 kΩ, and CT=100 µF; verify the calculated frequency, high/low times, duty cycle, and LED average current.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.ne555` | NE555 astable ideal model |
| RA | `passive.resistor` | 10 kΩ |
| RB | `passive.resistor` | 10 kΩ |
| CT | `passive.capacitor` | 100 µF |
| CCTRL | `passive.capacitor` | 10 nF |
| CBYP | `passive.capacitor` | 100 nF |
| RLED | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

The layout uses a Texas Instruments NE555P in PDIP-8, Vishay MRS25 resistors, a Panasonic ECA1VMH101I polarized timing capacitor, TDK film capacitors, and a Lite-On red indicator.

## Net connections

- **VCC:** `source-1:+`, `timer-1:8`, `timer-1:4`, `ra-1:1`, `bypass-1:1`
- **DISCHARGE:** `timer-1:7`, `ra-1:2`, `rb-1:1`
- **TIMING:** `timer-1:2`, `timer-1:6`, `rb-1:2`, `timing-capacitor-1:1`
- **OUTPUT:** `timer-1:3`, `led-resistor-1:1`
- **LED_A:** `led-resistor-1:2`, `led-1:A`
- **CONTROL:** `timer-1:5`, `control-capacitor-1:1`
- **GND:** `source-1:-`, `timer-1:1`, `timing-capacitor-1:2`, `control-capacitor-1:2`, `bypass-1:2`, `led-1:K`, `ground-1:0`

## Views and physical-layout status

The BB400 layout puts U1 across the center trench with pin 1 at F12 and pin 8 at E12. CT positive is at A26 and negative at A27. CCTRL spans A8/A10 and CBYP spans C4/C6. Follow the stored jumper map and verify diode and capacitor polarity before powering from a regulated, current-limited 5 V source.

The project stores a routed 72 × 50 mm two-layer PCB and generates BOM, Gerber and drill outputs. J1 accepts the 5 V source. Check part fit, polarity, and fabricator rules before ordering. Timing is a nominal estimate, and real output amplitude and duty cycle vary with component tolerances and timer behavior.

## Acceptance test and expected result

- Stable test ID: `core-555-astable-blinker`
- Engine: Analytical ideal 555 astable timing estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ne555-astable-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41168597440

Recorded expected result:

```json
{
  "raOhm": 10000,
  "rbOhm": 10000,
  "timingCapacitanceF": 0.0001,
  "frequencyHz": 0.481000481000481,
  "dutyCycle": 0.6666666666666666,
  "ledBlinking": true
}
```

## Safety and model limits

Ideal timer equation and output model only. It omits timer saturation, tolerances, startup, control-pin noise, component ratings, thermal effects, and hardware qualification.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/021-555-astable-blinker.adigun.json`.
