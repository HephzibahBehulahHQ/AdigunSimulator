# 027 — Comparator threshold indicator

## Purpose

Use a 5 V dual-input comparator and a 10 kΩ/10 kΩ divider to switch an LED at a 2.5 V threshold; test rising and falling input states.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| VIN | `power.dc-source` | 2.4 V |
| U1 | `active.comparator-dual-ideal` | Ideal dual-input comparator |
| R1 | `passive.resistor` | 10 kΩ |
| R2 | `passive.resistor` | 10 kΩ |
| R3 | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `comparator:VCC`, `rtop:1`
- **THRESHOLD:** `rtop:2`, `rbottom:1`, `comparator:IN-`
- **SIGNAL:** `signal:+`, `comparator:IN+`
- **CMP_OUT:** `comparator:OUT`, `rled:1`
- **LED:** `rled:2`, `led:A`
- **GND:** `supply:-`, `signal:-`, `comparator:GND`, `rbottom:2`, `led:K`, `ground:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-comparator-threshold`
- Engine: Ideal dual-input comparator threshold analysis
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-comparator-threshold-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41169915760

Recorded expected result:

```json
{
  "supplyVoltage": 5,
  "inputVoltage": 2.6,
  "thresholdVoltage": 2.5,
  "outputState": "high",
  "ledOn": true,
  "ledCurrentA": 0.00909090909090909
}
```

## Safety and model limits

Ideal educational comparator model only. It omits propagation delay, hysteresis, offset, input bias, output saturation, noise, loading, and device-specific limits.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/027-comparator-threshold.adigun.json`.