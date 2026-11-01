# 102 — Boost converter baseline

## Purpose

Estimate an asynchronous boost converter operating point from a 5 V source at 50% duty, 100 kHz, 100 µH, 100 µF and 100 Ω; test step-up output, ripple, CCM bounds, duty limit, load response and broken topology.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CFG1 | `input.boost-operating-point-fixture` | Duty 50%; Frequency 100 kHz; MaxDuty 85%; MaxInput 60 V |
| U1 | `active.boost-average-controller` | Mode asynchronous; MaxDuty 85%; MaxInput 60 V |
| L1 | `passive.inductor` | 100 µH |
| D1 | `diode.schottky` | Vf 0.5 V |
| C1 | `passive.capacitor` | 100 µF |
| RLOAD | `passive.resistor` | 100 Ω |
| SCOPE1 | `output.boost-converter-report` | Average CCM report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VIN:** `source:+`, `inductor:1`, `controller:VIN`, `fixture:VCC`
- **GND:** `source:-`, `fixture:GND`, `controller:GND`, `capacitor:2`, `load:2`, `report:GND`, `ground:0`
- **CTRL:** `fixture:CTRL`, `controller:CTRL`
- **SWITCH:** `inductor:2`, `controller:SW`, `diode:A`
- **VOUT:** `diode:K`, `capacitor:1`, `load:1`, `controller:VOUT`, `report:VOUT`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-boost-converter-baseline`
- Engine: Asynchronous boost CCM average and triangular-ripple estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-asynchronous-boost-ccm-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41187198444

Recorded expected result:

```json
{
  "kind": "boost-converter",
  "inputVoltageV": 5,
  "dutyCyclePercent": 50,
  "switchingFrequencyHz": 100000,
  "diodeForwardVoltageV": 0.5,
  "inductanceH": 0.0001,
  "capacitanceF": 0.0001,
  "loadResistanceOhm": 100,
  "outputVoltageV": 9.5,
  "loadCurrentA": 0.095,
  "inputCurrentA": 0.19,
  "inductorRipplePpA": 0.25,
  "outputRipplePpV": 0.00475,
  "conductionMode": "CCM",
  "inputPowerW": 0.95,
  "outputPowerW": 0.9025,
  "diodeLossW": 0.0475,
  "estimatedEfficiencyPercent": 95,
  "powerBalanceW": 0,
  "controllerHardwareModeled": false
}
```

## Safety and model limits

Bounded steady-state asynchronous CCM estimate only. It excludes switching transients, controller-loop stability, inductor saturation/core loss, capacitor ESR, MOSFET loss, thermal effects, tolerances, component ratings, and hardware validation.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/102-boost-converter-baseline.adigun.json`.