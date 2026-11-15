# 008 — USB-powered LED with PTC overload warning

## Purpose

Estimate the current and power of a 5 V USB LED branch including the configured cold-state PTC resistance, and flag when estimated current exceeds its 0.5 A hold rating; test normal and overload paths.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| USB1 | `power.usb-source` | 5 V |
| J1 | `connector.usb-led-power-input-2` | 5 V USB breakout; pin 1 VUSB, pin 2 GND |
| F1 | `protection.ptc-polyfuse` | Littelfuse RXEF050; Ihold 0.5 A; Rcold 0.77 Ω (datasheet max at 20 °C) |
| R1 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Lite-On LTL-307E-002A; Vf model 2.0 V typical |
| GND | `ground.signal` | 0 V |

The native project records exact physical sources for J1, F1, R1, and D1. USB1 is the idealized analytical supply; the physical supply connects through the two-pin J1 header. The input is a USB-powered 5 V breakout, not a USB receptacle or data interface.

## Net connections

- **USB_VBUS:** `usb-1:+`, `fuse-1:1`, `usb-input-1:VUSB`
- **FUSED_5V:** `fuse-1:2`, `resistor-1:1`
- **LED_A:** `resistor-1:2`, `led-1:A`
- **GND:** `led-1:K`, `usb-1:-`, `ground-1:0`, `usb-input-1:GND`

## Views and physical-layout status

The project stores a BB400 hole-by-hole assembly for J1, F1, R1, and D1, including the four jumper connections. USB1 and the schematic ground marker are declared nonphysical; the supply wires terminate at J1. The 22 AWG pigtail source and package identities are recorded.

The PCB contains four mapped through-hole parts, eight pin-mapped pads, and routed USB_VBUS, FUSED_5V, LED_A, and GND nets. The analytical USB source and ground symbol are explicitly virtual. Geometric DRC and Gerber, drill, edge, and BOM export are checked by the acceptance test.

## Acceptance test and expected result

- Stable test ID: `core-usb-powered-led-ptc`
- Physical-view acceptance: `tests/example-bank.test.mjs` checks BB400 placement, all-view reconciliation, PCB DRC and export; `tests/regulated-supply-scope.test.mjs` checks the completed DC scope recording.
- Engine: Analytical USB LED and cold-state PTC estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `usb-led-ptc-cold-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41154023579

Recorded expected result:

```json
{
  "sourceVoltage": 5,
  "ledVf": 2,
  "resistance": 330,
  "holdCurrentA": 0.5,
  "coldResistance": 0.77,
  "currentA": 0.009069746349427095,
  "fuseVoltageDrop": 0.006983704689058863,
  "holdCurrentExceeded": false,
  "overloadWarning": false,
  "fuseTripPredicted": false,
  "resistorPowerW": 0.02714589861817222,
  "fusePowerW": 0.00006334043010906852,
  "ledPowerW": 0.01813949269885419,
  "sourcePowerW": 0.045348731747135475,
  "powerBalanceW": 0,
  "normal5V": {
    "sourceVoltage": 5,
    "ledVf": 2,
    "seriesResistance": 330,
    "ptcHoldCurrentA": 0.5,
    "ptcColdResistance": 0.77,
    "currentA": 0.009069746349427095,
    "holdCurrentExceeded": false,
    "overloadWarning": false,
    "fuseTripPredicted": false,
    "resistorPowerW": 0.02714589861817222,
    "fusePowerW": 0.00006334043010906852,
    "ledPowerW": 0.01813949269885419,
    "sourcePowerW": 0.045348731747135475,
    "powerBalanceW": 0
  },
  "overloadR1Ohm": {
    "sourceVoltage": 5,
    "ledVf": 2,
    "seriesResistance": 1,
    "ptcHoldCurrentA": 0.5,
    "currentA": 1.694915254237288,
    "holdCurrentExceeded": true,
    "overloadWarning": true,
    "fuseTripPredicted": false
  }
}
```

## Safety and model limits

Educational cold-state estimate only. The chosen RXEF050 is a 0.5 A hold part with 0.50–0.77 Ω initial resistance at 20 °C; this model uses the 0.77 Ω maximum. Exceeding hold current is an overload warning, not a predicted fuse trip. PTC thermal/time behavior, reset, USB host protection, USB data/negotiation, tolerance, thermal effects, and hardware safety are not modeled. J1 is an unshrouded 2-pin low-voltage input header; observe its marked polarity.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/008-usb-powered-led.adigun.json`.
