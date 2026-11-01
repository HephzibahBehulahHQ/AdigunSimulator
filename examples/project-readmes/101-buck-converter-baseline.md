# 101 — Buck converter baseline

## Purpose

Estimate an asynchronous buck converter steady state at 12 V input, 50% duty, 100 kHz, 100 µH, 100 µF and 24 Ω; verify CCM, output, ripple, diode loss, power balance, line/load movement and unsupported DCM blocking.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| CFG1 | `input.buck-operating-point-fixture` | Duty 50%; Frequency 100 kHz; MaxDuty 85%; MaxInput 60 V |
| U1 | `active.buck-average-controller` | Mode asynchronous; MaxDuty 85%; MaxInput 60 V |
| L1 | `passive.inductor` | 100 µH |
| D1 | `diode.schottky` | Vf 0.5 V |
| C1 | `passive.capacitor` | 100 µF |
| RLOAD | `passive.resistor` | 24 Ω |
| SCOPE1 | `output.buck-converter-report` | Average CCM report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VIN:** `source:+`, `controller:VIN`, `fixture:VCC`
- **GND:** `source:-`, `fixture:GND`, `controller:GND`, `diode:A`, `capacitor:2`, `load:2`, `report:GND`, `ground:0`
- **CTRL:** `fixture:CTRL`, `controller:CTRL`
- **SWITCH:** `controller:SW`, `inductor:1`, `diode:K`
- **VOUT:** `inductor:2`, `capacitor:1`, `load:1`, `controller:VOUT`, `report:VOUT`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-buck-converter-baseline`
- Engine: Asynchronous buck CCM average and triangular-ripple estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-asynchronous-buck-ccm-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41186919065

Recorded expected result:

```json
{
  "kind": "buck-converter",
  "inputVoltageV": 12,
  "dutyCyclePercent": 50,
  "switchingFrequencyHz": 100000,
  "diodeForwardVoltageV": 0.5,
  "inductanceH": 0.0001,
  "capacitanceF": 0.0001,
  "loadResistanceOhm": 24,
  "outputVoltageV": 5.75,
  "loadCurrentA": 0.23958333333333334,
  "inductorRipplePpA": 0.3125,
  "outputRipplePpV": 0.00390625,
  "conductionMode": "CCM",
  "inputCurrentA": 0.11979166666666667,
  "inputPowerW": 1.4375,
  "outputPowerW": 1.3776041666666667,
  "diodeLossW": 0.059895833333333336,
  "estimatedEfficiencyPercent": 95.83333333333334,
  "powerBalanceW": 0,
  "controllerHardwareModeled": false
}
```

## Safety and model limits

Bounded steady-state asynchronous CCM estimate only. It excludes switching transients, controller-loop stability, inductor saturation/core loss, capacitor ESR, MOSFET loss, thermal effects, tolerances, component ratings, and hardware validation.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/101-buck-converter-baseline.adigun.json`.