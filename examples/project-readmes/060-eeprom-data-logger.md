# 060 — I²C EEPROM sample write and read-back

## Purpose

Write one configured sample byte to a matching ideal I²C EEPROM address/register and verify immediate register read-back; report ACK, NACK, and data preservation.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| BUS1 | `input.i2c-read-transaction` | Address 0x50; Register 0x10; Data 0x5A; Baud 100000; Cycle write-read; ACK yes |
| U1 | `active.24lc02b-ip` | Address 0x50; Memory 0x10=0x00 |
| R1 | `passive.resistor` | 4.7 kΩ |
| R2 | `passive.resistor` | 4.7 kΩ |
| C1 | `passive.capacitor` | 100 nF supply bypass |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `eeprom:VCC`, `pullup-sda:1`, `pullup-scl:1`, `vcc-bypass:1`
- **GND:** `supply:-`, `transaction:GND`, `eeprom:GND`, `eeprom:WP`, `ground:0`, `vcc-bypass:2`
- **SDA:** `transaction:SDA`, `eeprom:SDA`, `pullup-sda:2`
- **SCL:** `transaction:SCL`, `eeprom:SCL`, `pullup-scl:2`

## Views and physical-layout status

The BB400 assembly seats U1 with pin 1 at F21. Pins 1–3 are internally unconnected and occupy isolated strips. WP (pin 7) is grounded to allow writes.

The 53 × 39 mm two-layer PCB uses 0.35 mm minimum copper clearance. J1 takes 3.3 V and common return. BUS1 pins 1–3 carry SDA, SCL and common return, the same order as A3–A5 on the BB400 assembly. The PCB validator checks connectivity and exports copper, outline, drill and BOM files.

## Hardware write and oscilloscope

Use an external 3.3 V open-drain master at 100 kHz. Send address 0x50 for write, word address 0x10, byte 0x5A and STOP. Wait at least 5 ms or use ACK polling before issuing a random read of word address 0x10. The [Microchip data sheet](https://ww1.microchip.com/downloads/aemDocuments/documents/MPD/ProductDocuments/DataSheets/24AA02-24LC02B-24FC02-2Kbit-I2C-Serial-EEPROM-DS20001709.pdf) describes the pin connections, busy behavior and readback protocol.

The scope shows the ideal bus transaction with a 5 ms host idle interval. The simulator updates its logical byte immediately and does not predict the device's internal write timing or persistence through a power interruption.

## Acceptance test and expected result

- Stable test ID: `core-eeprom-data-logger`
- Engine: Ideal I²C EEPROM write/read transaction model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-i2c-eeprom-write-read-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41176264872

Recorded expected result:

```json
{
  "address": 80,
  "register": 16,
  "writeByte": 90,
  "readByte": 90,
  "readHex": "0x5A",
  "addressMatch": true,
  "registerMatch": true,
  "deviceAck": true,
  "writeAcknowledged": true,
  "readAcknowledged": true,
  "dataPreserved": true,
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