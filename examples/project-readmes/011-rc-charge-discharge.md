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

The ideal 5 V source is represented on the PCB by a Samtec TSW-102-07-T-S supply header. SW1 is an E-Switch EG1218, R1 is a Vishay MRS25000C1001FCT00, and polarized C1 is a Panasonic ECA1VMH101I rated at 35 V. The native project records the part sources and package mappings.

## Net connections

- **VCC:** `source-1:+`, `switch-1:A`
- **GND:** `source-1:-`, `switch-1:B`, `capacitor-1:2`, `ground-1:0`
- **SW_COM:** `switch-1:COM`, `resistor-1:1`
- **RC_NODE:** `resistor-1:2`, `capacitor-1:1`

## Views and physical-layout status

On the BB400, connect the supply leads to TP2 and BM2. Insert SW1 A, COM and B at A10, A11 and A12. Place R1 across D11–D15 and C1 positive and negative at F20 and F21. Add jumpers TP2–A10, A12–BM12, D15–F20 and F21–BM21. Verify the switch and capacitor leads fit the BB400 hole pitch without force.

The native project stores a 58 × 34 mm single-sided PCB and generates BOM, Gerber and drill outputs from the routed layout. J1 pin 1 takes regulated, current-limited 5 V and pin 2 is the common return. SW1 pin 2 selects charge through R1 in position A and discharge through R1 in position B. Check the purchased parts, polarity and fabrication rules before assembly.

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
