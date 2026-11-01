# 060 — I²C EEPROM sample write and read-back

## Purpose

Write one configured sample byte to a matching ideal I²C EEPROM address/register and verify immediate register read-back; report ACK, NACK, and data preservation.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| BUS1 | `input.i2c-read-transaction` | Address 0x50; Register 0x10; Data 0x5A; Baud 100000; Cycle write-read; ACK yes |
| U1 | `active.i2c-eeprom-ideal` | Address 0x50; Memory 0x10=0x00 |
| R1 | `passive.resistor` | 4.7 kΩ |
| R2 | `passive.resistor` | 4.7 kΩ |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `eeprom:VCC`, `pullup-sda:1`, `pullup-scl:1`
- **GND:** `supply:-`, `transaction:GND`, `eeprom:GND`, `ground:0`
- **SDA:** `transaction:SDA`, `eeprom:SDA`, `pullup-sda:2`
- **SCL:** `transaction:SCL`, `eeprom:SCL`, `pullup-scl:2`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-eeprom-data-logger`
- Engine: Ideal I²C EEPROM write/read transaction model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-i2c-eeprom-write-read-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41176264872

Recorded expected result:

```json
{
  "address": "0x50",
  "register": "0x10",
  "writeByte": "0x5A",
  "readBack": "0x5A",
  "writeAndReadAck": true,
  "immediateStorage": "ideal logical register storage",
  "physicalEnduranceAndPowerLoss": "not modeled"
}
```

## Safety and model limits

Digital transaction and ideal immediate-storage model only. Physical EEPROM write-cycle delay, endurance, power loss, page boundaries, bus timing, and MCU firmware are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/060-eeprom-data-logger.adigun.json`.