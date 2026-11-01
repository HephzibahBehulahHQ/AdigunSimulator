# 011 — RC charge and discharge

## Purpose

Calculate the ideal 5 V, 1 kΩ, 100 µF response with an SPDT switch selecting charge or discharge; report the 0.1 s time constant and voltage at one time constant.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| SW1 | `input.spdt-switch` | Charge (A) |
| R1 | `passive.resistor` | 1 kΩ |
| C1 | `passive.capacitor` | 100 µF |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source-1:+`, `switch-1:A`
- **GND:** `source-1:-`, `switch-1:B`, `capacitor-1:2`, `ground-1:0`
- **SW_COM:** `switch-1:COM`, `resistor-1:1`
- **RC_NODE:** `resistor-1:2`, `capacitor-1:1`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-rc-charge-discharge`
- Engine: Analytical first-order switched RC response
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-spdt-rc-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41148910995

Recorded expected result:

```json
{
  "timeConstantS": 0.1,
  "chargeVoltageAtTauV": 3.160602794,
  "dischargeVoltageAtTauV": 1.839397206
}
```

## Safety and model limits

Ideal low-voltage educational model only. Generic components, switch resistance, tolerances, leakage, ratings, physical breadboard layout, and PCB footprints are not verified. Discharge assumes a previously charged capacitor at the source voltage.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/011-rc-charge-discharge.adigun.json`.