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

### PCB remediation target (researched; implementation and acceptance still open)

The present nine-part project is an ideal average-model exercise, not a physical buck-regulator circuit. In particular, `CFG1` is a simulation input, `SCOPE1` is a report model, and `active.buck-average-controller` exposes an ideal `VOUT` pin that a real asynchronous regulator does not have. Its current `controller:VOUT` net must not be copied to a PCB.

TI's adjustable LM2596 application circuit is a source-backed physical topology to evaluate for a hardware version: a five-pin regulator (VIN, switch output, GND, FB, ON/OFF), with the switch output feeding the inductor, a Schottky catch diode from ground to the switch node, and an output-feedback divider. The TI datasheet specifies a 1.23 V reference and `VOUT = VREF × (1 + R2/R1)`; a 1.00 kΩ lower resistor and 3.67 kΩ upper resistor calculate to 5.7441 V. Its reference circuit lists 470 µF / 50 V input capacitance, 220 µF / 35 V output capacitance, a 1N5825 catch diode, and a 68 µH inductor. These are a design investigation starting point, not a verified replacement BOM or a claim that the current model predicts LM2596 switching behavior.

Before this example can pass PCB acceptance, replace the ideal controller and simulation-only fixture/report with a physically coherent design, add the real feedback connections and external input/output terminals, record manufacturer identities and sourced package/pad geometry for every placed part, then calculate and review the layout, copper, clearances, and exports. The current 12 V, 24 Ω operating point and old 100 kHz ideal estimate must be recalculated against the selected hardware and a stated model; do not carry its old result over as hardware evidence.

Manufacturer source: [TI LM2596 datasheet, adjustable-output application circuit and design procedure](https://www.ti.com/lit/ds/symlink/lm2596.pdf), Figure 9-13 and sections 9.2.2.1–9.2.2.2. The datasheet describes the LM2596 family as a 150 kHz regulator and lists its five-pin TO-220 package.

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

