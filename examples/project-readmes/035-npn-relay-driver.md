# 035 — NPN relay-coil driver with flyback

## Purpose

Drive a generic relay coil represented by 24 Ω in series with 100 mH from a 12 V supply using an NPN transistor and 5 V base drive; calculate coil current, assumed pull-in threshold, transistor saturation, stored energy, and flyback release decay.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 12 V |
| VIN | `power.dc-source` | 5 V |
| Q1 | `active.npn-small-signal` | β 100; VBE 0.7 V; VCEsat 0.2 V |
| RB | `passive.resistor` | 220 Ω |
| RCOIL | `passive.resistor` | 24 Ω |
| LCOIL | `passive.inductor` | 100 mH |
| D1 | `diode.schottky` | Vf 0.3 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `coil-resistor:1`, `flyback:K`
- **CONTROL:** `control:+`, `base-resistor:1`
- **BASE:** `base-resistor:2`, `npn:B`
- **COIL_MID:** `coil-resistor:2`, `coil-inductor:1`
- **COLLECTOR:** `coil-inductor:2`, `npn:C`, `flyback:A`
- **GND:** `supply:-`, `control:-`, `npn:E`, `ground:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-npn-relay-driver`
- Engine: Generic NPN relay-coil and flyback estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-npn-relay-driver-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41171584960

Recorded expected result:

```json
{
  "supplyVoltage": 12,
  "controlVoltage": 5,
  "baseCurrentA": 0.019545454545454543,
  "coilCurrentA": 0.49166666666666664,
  "transistorSaturated": true,
  "collectorVoltageV": 0.2,
  "relayPullInThresholdA": 0.4,
  "relayEnergizedEstimate": true,
  "flybackClampVoltageV": 12.3,
  "coilStoredEnergyJ": 0.012086805555555555,
  "timeConstantS": 0.004166666666666667,
  "turnOffCurrentAtOneTimeConstantA": 0.17297255159060215,
  "turnOffCurrentAtThreeTimeConstantsA": 0.012600980302131396
}
```

## Safety and model limits

Educational generic model only: β=100, VBE=0.7 V, VCE(sat)=0.2 V, 20 mA base-current bound, 0.4 A assumed pull-in threshold, and constant 0.3 V flyback drop. The coil is an R-L equivalent; actual relay pull-in/drop-out characteristics, contact behavior, component ratings, transients beyond the first-order clamp estimate, thermal effects, and physical hardware qualification are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/035-npn-relay-driver.adigun.json`.