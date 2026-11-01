# 078 — NFC UID safe display

## Purpose

Display a readable NFC tag UID through an ideal reader and controller, and block output when the tag read reports an error.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| TAG1 | `sensor.nfc-tag-ideal` | UID 04A1B2C3; ReadStatus ok |
| NFC1 | `active.nfc-reader-ideal` | Mode UID-only; Band 13.56 MHz |
| U1 | `active.nfc-display-controller-ideal` | Program Display UID; Mode UID-display-only |
| OLED1 | `output.nfc-uid-display` | UID only |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `reader:VCC`, `controller:VCC`, `display:VCC`
- **GND:** `supply:-`, `tag:GND`, `reader:GND`, `controller:GND`, `display:GND`, `ground:0`
- **TAG_UID:** `tag:UID`, `reader:TAG`
- **READER_DATA:** `reader:DATA`, `controller:RX`
- **DISPLAY:** `controller:DISPLAY`, `display:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-nfc-uid-display`
- Engine: Ideal NFC UID read-and-display model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-nfc-uid-display-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41181366699

Recorded expected result:

```json
{
  "uid": "04A1B2C3",
  "readStatus": "ok",
  "displayText": "Tag UID: 04A1B2C3",
  "uidIsAuthentication": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

A UID is an identifier, not proof of identity or a secret credential. RF coupling, anti-collision, secure card authentication, firmware, and physical NFC behavior are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/078-nfc-uid-display.adigun.json`.