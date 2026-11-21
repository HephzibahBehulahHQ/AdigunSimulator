# 022 — 555 monostable LED pulse

## Purpose

Model a 5 V ideal NE555 monostable with a normally-open active-low trigger, 100 kΩ timing resistor, and 10 µF capacitor; verify one output pulse of approximately 1.1 seconds per trigger.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| U1 | `active.ne555` | NE555 monostable ideal model |
| R1 | `passive.resistor` | 100 kΩ |
| C1 | `passive.capacitor` | 10 µF |
| R2 | `passive.resistor` | 10 kΩ |
| SW1 | `input.pushbutton` | Normally open |
| RLED | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| CCTRL | `passive.capacitor` | 10 nF |
| CBYP | `passive.capacitor` | 100 nF |
| GND | `ground.signal` | 0 V |

The physical circuit uses a TI NE555P, an Omron B3F-1000 normally-open switch, a polarized Panasonic EEUFR1H100 timing capacitor, Vishay MRS25 resistors, TDK film capacitors, and a Lite-On red indicator.

## Net connections

- **VCC:** `source-1:+`, `timer-1:8`, `timer-1:4`, `timing-resistor-1:1`, `pullup-resistor-1:1`, `bypass-1:1`
- **TIMING:** `timer-1:6`, `timer-1:7`, `timing-resistor-1:2`, `timing-capacitor-1:1`
- **TRIGGER:** `timer-1:2`, `pullup-resistor-1:2`, `trigger-1:1`
- **OUT:** `timer-1:3`, `led-resistor-1:1`
- **LED_A:** `led-resistor-1:2`, `led-1:A`
- **CONTROL:** `timer-1:5`, `control-capacitor-1:1`
- **GND:** `source-1:-`, `timer-1:1`, `timing-capacitor-1:2`, `trigger-1:2`, `led-1:K`, `control-capacitor-1:2`, `bypass-1:2`, `ground-1:0`

## Views and physical-layout status

The BB400 assembly puts U1 pin 1 at F12. C1 positive and negative pigtails go to A26 and A27. Connect SW1 across G9 and BM10 with insulated pigtails. Leave the switch open at startup and verify all polarity and jumper mappings before applying regulated, current-limited 5 V.

The native project stores a routed two-layer PCB. The B3F-1000 terminals form two internally common pairs. Both TRIGGER pads and both GND pads are routed, with the pairs separated until the switch closes. Release the button before the nominal pulse expires. The ideal trigger model omits contact bounce, long presses, and retriggering.

## Acceptance test and expected result

- Stable test ID: `core-555-monostable`
- Engine: Analytical ideal 555 monostable pulse-width estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ne555-monostable-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41168755297

Recorded expected result:

```json
{
  "timingResistanceOhm": 100000,
  "timingCapacitanceF": 0.00001,
  "pulseWidthS": 1.1,
  "triggeredPressProducesOnePulse": true,
  "normalOpenProducesNoPulse": true
}
```

## Safety and model limits

Ideal timer equation and event-count estimate only. It does not simulate elapsed time, retriggering, timer tolerances, startup, output saturation, or physical hardware behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/022-555-monostable.adigun.json`.
