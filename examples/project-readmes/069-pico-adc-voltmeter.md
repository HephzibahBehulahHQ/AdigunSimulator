# 069 — Pico ADC divider voltmeter with OLED

## Purpose

Estimate an input voltage from a calibrated two-resistor divider and 12-bit Pico ADC reading; display calibrated values across the supported range.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| VIN | `power.dc-source` | 12 V |
| VLOGIC | `power.dc-source` | 3.3 V |
| U1 | `active.rp2040-pico-ideal` | ADC 12 bit; Reference 3.3 V; Calibrate divider |
| R1 | `passive.resistor` | 30 kΩ |
| R2 | `passive.resistor` | 10 kΩ |
| OLED1 | `output.oled-text-sink-ideal` | Voltage result |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VIN_HI:** `vin:+`, `upper:1`
- **ADC_MID:** `upper:2`, `lower:1`, `pico:ADC0`
- **VCC:** `logic:+`, `pico:VCC`, `oled:VCC`
- **GROUND:** `vin:-`, `logic:-`, `pico:GND`, `lower:2`, `oled:GND`, `ground:0`
- **OLED_DATA:** `pico:TX`, `oled:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-pico-adc-voltmeter`
- Engine: Ideal Pico 12-bit ADC divider voltmeter
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-pico-adc-divider-voltmeter-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41177993277

Recorded expected result:

```json
{
  "inputVoltageSamplesV": [
    6,
    12,
    13
  ],
  "dividerRatio": "1/4",
  "dividerResistorsOhm": [
    30000,
    10000
  ],
  "adcReferenceV": 3.3,
  "adcResolutionBits": 12,
  "aboveReference": "blocked",
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal ADC/divider model; blocks divider outputs over 3.3 V. ADC nonlinearity, leakage, resistor tolerance, physical overvoltage protection, and Pico firmware are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/069-pico-adc-voltmeter.adigun.json`.