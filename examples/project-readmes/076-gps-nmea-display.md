# 076 — GPS NMEA coordinate display

## Purpose

Validate a known NMEA RMC sentence checksum and active-fix state, convert coordinates to decimal degrees, and display them.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| GPS1 | `sensor.gnss-nmea-ideal` | Sentence $GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A |
| U1 | `active.gnss-nmea-parser-ideal` | SentenceType RMC |
| DISP1 | `output.gnss-position-display` | Latitude and longitude |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `gnss:VCC`, `parser:VCC`, `display:VCC`
- **GND:** `supply:-`, `gnss:GND`, `parser:GND`, `display:GND`, `ground:0`
- **UART_RX:** `gnss:TX`, `parser:RX`
- **DISPLAY:** `parser:DISPLAY`, `display:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-gps-rmc-display`
- Engine: Ideal NMEA RMC sentence parser model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-nmea-rmc-coordinate-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41180992351

Recorded expected result:

```json
{
  "sentenceType": "GPRMC",
  "checksum": "6A",
  "checksumValid": true,
  "fixStatus": "active",
  "latitude": 48.1173,
  "longitude": 11.516666666666667,
  "speedKnots": 22.4,
  "displayText": "48.11730, 11.51667",
  "firmwareExecuted": false
}
```

## Safety and model limits

Deterministic sentence parsing model only. It does not model GNSS reception, satellite geometry, MCU firmware, UART framing, or position accuracy.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/076-gps-nmea-display.adigun.json`.