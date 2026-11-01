# 103 — Buck-boost supply

## Purpose

Regulate a non-inverting four-switch converter target across buck, boost, and input/output crossover cases; test the target, duty, current limit, ripple estimates, power balance, and broken energy path.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| CFG1 | `input.buckboost-target-fixture` | Target 9 V; MaxInput 24 V; MaxCurrent 2 A; Efficiency 95%; Frequency 100 kHz |
| U1 | `active.buckboost-four-switch-average` | Mode non-inverting four-switch; MaxInput 24 V; MaxCurrent 2 A; Efficiency 95%; Frequency 100 kHz |
| L1 | `passive.inductor` | 100 µH |
| C1 | `passive.capacitor` | 100 µF |
| RLOAD | `passive.resistor` | 18 Ω |
| SCOPE1 | `output.buckboost-converter-report` | Average CCM report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VIN:** `source:+`, `controller:VIN`, `fixture:VCC`
- **GND:** `source:-`, `fixture:GND`, `controller:GND`, `capacitor:2`, `load:2`, `report:GND`, `ground:0`
- **SET:** `fixture:SET`, `controller:SET`
- **ENERGY_PATH:** `controller:L1`, `inductor:1`
- **INDUCTOR_OUT:** `inductor:2`, `controller:L2`, `capacitor:1`, `load:1`, `report:VOUT`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-buckboost-supply`
- Engine: Ideal four-switch non-inverting buck-boost steady-state CCM estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-four-switch-buckboost-average-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41187593122

Recorded expected result:

```json
{
  "kind": "buckboost-converter",
  "mode": "buck",
  "inputVoltageV": 12,
  "outputTargetV": 9,
  "outputVoltageV": 9,
  "dutyCyclePercent": 75,
  "switchingFrequencyHz": 100000,
  "inductanceH": 0.0001,
  "capacitanceF": 0.0001,
  "loadResistanceOhm": 18,
  "loadCurrentA": 0.5,
  "inputCurrentA": 0.3947368421052632,
  "inductorAverageA": 0.5,
  "inductorRipplePpA": 0.225,
  "outputRipplePpV": 0.0028125,
  "conductionMode": "CCM",
  "inputPowerW": 4.736842105263158,
  "outputPowerW": 4.5,
  "converterLossW": 0.2368421052631584,
  "powerBalanceW": 0,
  "assumedEfficiencyPercent": 95,
  "controllerWaveformsModeled": false
}
```

## Safety and model limits

Ideal four-switch average model with a user-specified efficiency assumption. It does not simulate switch waveforms, dead time, control dynamics, component tolerances, thermal behavior, or physical hardware.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/103-buck-boost-supply.adigun.json`.