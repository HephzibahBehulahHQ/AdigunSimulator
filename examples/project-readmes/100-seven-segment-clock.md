# 100 — Seven-segment clock

## Purpose

Advance a validated 24-hour display from 23:59:58 by three rising-edge ticks, wrap across midnight, and format the resulting six digits as common-cathode segment vectors.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| RTC1 | `input.clock-tick-fixture` | Start 23:59:58; Ticks 3; TickHz 1; Mode rising-edge |
| U1 | `active.seven-segment-clock-ideal` | Mode 24h; Digits 6; Common cathode |
| DISP1 | `output.seven-segment-display` | Digits 6; Segments a,b,c,d,e,f,g; Common cathode |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `fixture:VCC`, `clock:VCC`, `display:VCC`
- **GND:** `source:-`, `fixture:GND`, `clock:GND`, `display:GND`, `ground:0`
- **RTC_TIME:** `fixture:TIME`, `clock:RTC`
- **SEGMENTS:** `clock:SEG`, `display:SEG`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-seven-segment-clock`
- Engine: Ideal 24-hour clock tick and seven-segment formatter
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-seven-segment-clock-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41186702729

Recorded expected result:

```json
{
  "kind": "seven-segment-clock",
  "initialTime": "23:59:58",
  "ticks": 3,
  "tickHz": 1,
  "outputTime": "00:00:01",
  "digitValues": [
    0,
    0,
    0,
    0,
    0,
    1
  ],
  "midnightRollovers": 1,
  "displayDigits": 6,
  "displayType": "common-cathode",
  "firmwareExecuted": false,
  "displayDriven": false
}
```

## Safety and model limits

Ideal deterministic clock and display formatter only. RTC accuracy, multiplex timing, segment current, driver circuitry, optical behavior, firmware, and hardware are not modeled or validated.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/100-seven-segment-clock.adigun.json`.