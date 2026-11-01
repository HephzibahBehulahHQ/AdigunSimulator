# 008 — USB-powered LED with PTC overload warning

## Purpose

Estimate the current and power of a 5 V USB LED branch including the configured cold-state PTC resistance, and flag when estimated current exceeds its 0.5 A hold rating; test normal and overload paths.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| USB1 | `power.usb-source` | 5 V |
| F1 | `protection.ptc-polyfuse` | Ihold 0.5 A; Rcold 0.1 Ω |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **USB_VBUS:** `usb-1:+`, `fuse-1:1`
- **FUSED_5V:** `fuse-1:2`, `resistor-1:1`
- **LED_A:** `resistor-1:2`, `led-1:A`
- **GND:** `led-1:K`, `usb-1:-`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-usb-powered-led-ptc`
- Engine: Analytical USB LED and cold-state PTC estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `usb-led-ptc-cold-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41154023579

Recorded expected result:

```json
{
  "normal5V": {
    "sourceVoltage": 5,
    "ledVf": 2,
    "seriesResistance": 330,
    "ptcHoldCurrentA": 0.5,
    "ptcColdResistance": 0.1,
    "currentA": 0.009088155104513784,
    "holdCurrentExceeded": false,
    "overloadWarning": false,
    "fuseTripPredicted": false,
    "resistorPowerW": 0.027256205857220984,
    "fusePowerW": 0.000008259456320369994,
    "ledPowerW": 0.018176310209027567,
    "sourcePowerW": 0.04544077552256892,
    "powerBalanceW": 0
  },
  "overloadR1Ohm": {
    "sourceVoltage": 5,
    "ledVf": 2,
    "seriesResistance": 1,
    "ptcHoldCurrentA": 0.5,
    "currentA": 2.727272727272727,
    "holdCurrentExceeded": true,
    "overloadWarning": true,
    "fuseTripPredicted": false
  }
}
```

## Safety and model limits

Educational cold-state estimate only. Exceeding hold current is an overload warning, not a predicted fuse trip. PTC thermal/time behavior, reset, USB host protection, tolerance, thermal effects, ratings, and hardware safety are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/008-usb-powered-led.adigun.json`.