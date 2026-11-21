# 028 — Comparator Schmitt trigger

## Purpose

Calculate separate 2.5 V falling and 3.0 V rising thresholds and verify state retention inside the hysteresis band.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| VIN | `power.dc-source` | 2.4 V |
| VREF | `power.dc-source` | 2.5 V |
| U1 | `active.schmitt-trigger-ideal` | Ideal Schmitt trigger |
| RIN | `passive.resistor` | 10 kΩ |
| RF | `passive.resistor` | 100 kΩ |
| RG | `passive.resistor` | 100 kΩ |
| RLED | `passive.resistor` | 2.2 kΩ |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `schmitt:VCC`
- **INPUT:** `signal:+`, `rin:1`
- **SENSE_PLUS:** `rin:2`, `feedback:1`, `groundleg:1`, `schmitt:IN+`
- **REFERENCE:** `reference:+`, `schmitt:IN-`
- **OUT:** `schmitt:OUT`, `feedback:2`, `rled:1`
- **LED:** `rled:2`, `led:A`
- **GND:** `supply:-`, `signal:-`, `reference:-`, `schmitt:GND`, `groundleg:2`, `led:K`, `ground:0`

## Views and physical-layout status

The BB400 assembly uses the Microchip MCP6541-E/P push-pull comparator. Seat pin 1 at F13 and leave pins 1, 5, and 8 isolated. Tie the 5 V supply, adjustable input, and fixed 2.5 V reference to a shared return. RLED is 2.2 kΩ to keep the modeled LED current below the 2 mA output test point. [Microchip comparator datasheet](https://ww1.microchip.com/downloads/en/DeviceDoc/MCP6541%20Output%20SubMicroamp%20Comparators%2020001696K.pdf)

The 58 × 49 mm plated-through PCB routes the supply, sense, reference, output, and LED connections on two copper layers. J1 is the 5 V supply, J2 the adjustable input, and J3 the 2.5 V reference. Pin 2 of each connector is ground. The PCB export generates copper Gerbers, outline, plated drill data, and a BOM. Hardware characterization remains pending.

The floating scope shows ideal settled levels. Inside the hysteresis band, a run without a prior state displays the known input, reference, and rails and omits the undetermined output.

## Acceptance test and expected result

- Stable test ID: `core-schmitt-trigger`
- Engine: Ideal Schmitt-trigger hysteresis estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-schmitt-trigger-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41170103403

Recorded expected result:

```json
{
  "supplyVoltage": 5,
  "referenceVoltage": 2.5,
  "fallingThresholdV": 2.5,
  "risingThresholdV": 3,
  "hysteresisV": 0.5
}
```

## Safety and model limits

Ideal static educational comparator model only. It omits propagation delay, output saturation, noise, offset, component tolerances, and device-specific behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/028-schmitt-trigger.adigun.json`.
