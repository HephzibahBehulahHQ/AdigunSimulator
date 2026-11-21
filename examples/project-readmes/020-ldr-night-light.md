# 020 — LDR comparator night light

## Purpose

Use a 5 V supply, 10 kΩ/1 MΩ light-dependent resistor endpoints, a 10 kΩ divider, a 0.2 V ideal comparator threshold, and a red LED; verify LED on in darkness and off in bright light.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| R_LDR | `passive.ldr` | Rbright 10 kΩ; Rdark 1 MΩ; light 0% |
| R1 | `passive.resistor` | 10 kΩ |
| U1 | `active.comparator-dual-ideal` | External reference |
| RREF1 | `passive.resistor` | 240 kΩ |
| RREF2 | `passive.resistor` | 10 kΩ |
| C1 | `passive.capacitor` | 100 nF |
| RLED | `passive.resistor` | 2.2 kΩ |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

The physical circuit uses an Advanced Photonix PDV-P9002 photocell and a Microchip MCP6541-I/P comparator. The 2.2 kΩ LED resistor keeps the nominal output current near 1.36 mA. The photocell is a CdS part. The nominal simulation endpoints do not calibrate the circuit to lux.

## Net connections

- **VCC:** `source-1:+`, `ldr-1:1`, `comparator-1:VCC`, `reference-high-1:1`, `bypass-1:1`
- **SENSE:** `ldr-1:2`, `divider-resistor-1:1`, `comparator-1:IN-`
- **VREF:** `reference-high-1:2`, `reference-low-1:1`, `comparator-1:IN+`
- **OUT:** `comparator-1:OUT`, `led-resistor-1:1`
- **LED_A:** `led-resistor-1:2`, `led-1:A`
- **GND:** `source-1:-`, `divider-resistor-1:2`, `comparator-1:GND`, `led-1:K`, `reference-low-1:2`, `bypass-1:2`, `ground-1:0`

## Views and physical-layout status

The BB400 layout puts U1 across the center trench with its pin-1 mark to the left. Keep F12–J12, A15–E15 and A12–E12 isolated for terminals 1, 5 and 8. Keep the LED out of the photocell’s line of sight.

The native project stores a routed two-layer PCB and generates BOM, Gerber and drill files. Connect a regulated 5 V bench supply to J1. Measure VREF and the photocell divider before comparing the hardware behavior with the nominal model.

## Acceptance test and expected result

- Stable test ID: `core-ldr-night-light`
- Engine: Analytical LDR comparator night-light estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ldr-comparator-nightlight-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41168467607

Expected result for the explicit reference-divider revision. The CI link above records the earlier implicit-reference revision.

```json
{
  "supplyVoltage": 5,
  "referenceVoltage": 0.2,
  "brightLightPercent": 100,
  "darkLightPercent": 0,
  "brightLedOn": false,
  "darkLedOn": true,
  "darkLedCurrentA": 0.0013636363636363637
}
```

## Safety and model limits

Generic logarithmic LDR interpolation and ideal comparator model only. It omits comparator offset/hysteresis, LDR spectrum and tolerance, transient behavior, component ratings, and hardware qualification.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/020-ldr-night-light.adigun.json`.
