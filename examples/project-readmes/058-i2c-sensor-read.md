# 058 — I²C sensor register read

## Purpose

Model a bounded I²C single-register read using an ideal transaction fixture and register-mapped sensor; report address ACK/NACK, register match, and returned byte.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| BUS1 | `input.i2c-read-transaction` | Address 0x48; Register 0x00; Baud 100000; ACK yes |
| U1 | `active.i2c-sensor-ideal` | Address 0x48; Register 0x00=0x2A |
| R1 | `passive.resistor` | 4.7 kΩ |
| R2 | `passive.resistor` | 4.7 kΩ |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `sensor:VCC`, `pullup-sda:1`, `pullup-scl:1`
- **GND:** `supply:-`, `transaction:GND`, `sensor:GND`, `ground:0`
- **SDA:** `transaction:SDA`, `sensor:SDA`, `pullup-sda:2`
- **SCL:** `transaction:SCL`, `sensor:SCL`, `pullup-scl:2`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-i2c-sensor-read`
- Engine: Ideal I²C register-read transaction model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-i2c-register-read-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41175904531

Recorded expected result:

```json
{
  "address": "0x48",
  "register": "0x00",
  "receivedByte": "0x2A",
  "baud": 100000,
  "addressNack": "complete with sensorAck=false and no data",
  "absentRegister": "ACK with no returned data",
  "pullUps": "one 4.7 kΩ resistor on each bus line"
}
```

## Safety and model limits

Digital transaction-level model with ideal open-drain pull-up checking. Clock stretching, arbitration, analog rise time, bus capacitance, noise, and physical device timing are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/058-i2c-sensor-read.adigun.json`.