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

The stored layout uses a TDK B57891M0103J000 thermistor, Vishay MRS25000C1002FCT00 resistor, and Samtec TSW-102-07-T-S input header. TDK specifies 10 kΩ at 25 °C with ±5% tolerance and a B25/100 of 3950 K with ±3% tolerance.

## Net connections

- **VCC:** `source-1:+`, `ntc-1:1`
- **VOUT:** `ntc-1:2`, `fixed-resistor-1:1`
- **GND:** `fixed-resistor-1:2`, `source-1:-`, `ground-1:0`

## Views and physical-layout status

On the BB400, place TH1 across A8/A9 and R1 across D14/D18. Connect the regulated 5 V source to TP2/BM2. Fit jumpers TP2–A8, A9–D14 and D18–BM18. Probe VOUT at D14 relative to the return rail. Verify lead fit without bending the sensor leads at the body.

The 52 × 30 mm single-sided PCB connects J1 pin 1 to 5 V and pin 2 to GND. Probe VOUT at TH1 pad 2 or R1 pad 1. Allow airflow around TH1 and let the sensor settle before reading. The single-Beta calculation omits self-heating, part tolerances and probe loading.

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
