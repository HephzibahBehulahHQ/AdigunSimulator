# 020 — LDR comparator night light

## Purpose

Use a 5 V supply, 10 kΩ/1 MΩ light-dependent resistor endpoints, a 10 kΩ divider, a 0.2 V ideal comparator threshold, and a red LED; verify LED on in darkness and off in bright light.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| R_LDR | `passive.ldr` | Rbright 10 kΩ; Rdark 1 MΩ; light 0% |
| R1 | `passive.resistor` | 10 kΩ |
| U1 | `active.comparator-ideal` | Vref 0.2 V |
| RLED | `passive.resistor` | 330 Ω |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source-1:+`, `ldr-1:1`, `comparator-1:VCC`
- **SENSE:** `ldr-1:2`, `divider-resistor-1:1`, `comparator-1:SENSE`
- **OUT:** `comparator-1:OUT`, `led-resistor-1:1`
- **LED_A:** `led-resistor-1:2`, `led-1:A`
- **GND:** `source-1:-`, `divider-resistor-1:2`, `comparator-1:GND`, `led-1:K`, `ground-1:0`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-ldr-night-light`
- Engine: Analytical LDR comparator night-light estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ldr-comparator-nightlight-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41168467607

Recorded expected result:

```json
{
  "supplyVoltage": 5,
  "referenceVoltage": 0.2,
  "brightLightPercent": 100,
  "darkLightPercent": 0,
  "brightLedOn": false,
  "darkLedOn": true,
  "darkLedCurrentA": 0.00909090909090909
}
```

## Safety and model limits

Generic logarithmic LDR interpolation and ideal comparator model only. It omits comparator offset/hysteresis, LDR spectrum and tolerance, transient behavior, component ratings, and hardware qualification.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/020-ldr-night-light.adigun.json`.