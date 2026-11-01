# 019 — NTC temperature divider

## Purpose

Use an NTC thermistor with R25 10 kΩ and Beta 3950 K above a 10 kΩ fixed resistor on a 5 V supply; verify resistance decreases and output increases at 0, 25, and 60 °C.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| TH1 | `passive.ntc-thermistor` | R25 10 kΩ; B 3950 K; temp 25 °C |
| R1 | `passive.resistor` | 10 kΩ |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source-1:+`, `ntc-1:1`
- **VOUT:** `ntc-1:2`, `fixed-resistor-1:1`
- **GND:** `fixed-resistor-1:2`, `source-1:-`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-ntc-temperature-divider`
- Engine: Analytical NTC Beta-law voltage-divider estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ntc-beta-divider-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41168327016

Recorded expected result:

```json
{
  "supplyVoltage": 5,
  "referenceResistanceAt25C": 10000,
  "betaK": 3950,
  "fixedResistance": 10000,
  "sweepCelsius": [
    0,
    25,
    60
  ],
  "resistanceDecreasesWithTemperature": true,
  "outputIncreasesWithTemperature": true,
  "outputAt25C": 2.5
}
```

## Safety and model limits

Generic Beta-law educational model only. It is not a verified thermistor part model and omits tolerance, self-heating, thermal lag, calibration, and hardware qualification.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/019-ntc-temperature-divider.adigun.json`.