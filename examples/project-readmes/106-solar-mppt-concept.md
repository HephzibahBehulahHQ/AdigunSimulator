# 106 — Solar MPPT concept

## Purpose

Sweep a synthetic piecewise-linear solar I-V curve from short circuit to open circuit, identify the highest sampled power point, and apply an explicit conversion-efficiency assumption across irradiance settings.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| PV1 | `input.solar-iv-curve-fixture` | Voc 10 V; Isc 1 A; Vmp 8 V; Imp 0.9 A; Irradiance 100%; Mode piecewise-linear |
| U1 | `active.solar-mpp-sweep-ideal` | Mode sweep; Samples 20; Efficiency 95%; MaxVoc 24 V; MaxCurrent 5 A |
| SCOPE1 | `output.solar-mpp-report` | Maximum-power report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `fixture:VCC`, `controller:VCC`, `report:VCC`
- **GND:** `source:-`, `fixture:GND`, `controller:GND`, `report:GND`, `ground:0`
- **PV_POS:** `fixture:PV+`, `controller:PV+`
- **PV_NEG:** `fixture:PV-`, `controller:PV-`
- **REPORT:** `controller:REPORT`, `report:REPORT`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-solar-mpp-sweep`
- Engine: Piecewise-linear solar I-V sweep and sampled maximum-power estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `synthetic-solar-iv-static-sweep-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41188244953

Recorded expected result:

```json
{
  "kind": "solar-mpp-sweep",
  "openCircuitVoltageV": 10,
  "shortCircuitCurrentA": 1,
  "configuredMppVoltageV": 8,
  "configuredMppCurrentA": 0.9,
  "configuredMppPowerW": 7.2,
  "irradiancePercent": 100,
  "sampleCount": 21,
  "sweepStepV": 0.5,
  "maximumPowerPoint": {
    "voltageV": 8,
    "currentA": 0.9,
    "powerW": 7.2
  },
  "conversionOutputPowerW": 6.84,
  "assumedEfficiencyPercent": 95,
  "trackingAlgorithmModeled": false,
  "converterHardwareModeled": false
}
```

## Safety and model limits

Static synthetic I-V sweep only. It is not a perturb-and-observe tracker, dynamic converter, irradiance-dependent open-circuit-voltage model, physical solar panel, or hardware MPPT validation.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/106-solar-mppt-concept.adigun.json`.