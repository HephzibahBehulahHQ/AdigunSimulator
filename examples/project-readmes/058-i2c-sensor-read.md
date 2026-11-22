# 058 — I²C sensor register read

## Purpose

Model a bounded I²C single-register read using an ideal transaction fixture and register-mapped sensor; report address ACK/NACK, register match, and returned byte.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| BUS1 | `input.i2c-read-transaction` | Address 0x48; Register 0x00; Baud 100000; ACK yes |
| U1 | `active.tc74a0-3v3vat` | Address 0x48; Register 0x00=0x2A |
| R1 | `passive.resistor` | 4.7 kΩ |
| R2 | `passive.resistor` | 4.7 kΩ |
| C1 | `passive.capacitor` | 100 nF supply bypass |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `sensor:VCC`, `pullup-sda:1`, `pullup-scl:1`, `vcc-bypass:1`
- **GND:** `supply:-`, `transaction:GND`, `sensor:GND`, `ground:0`, `vcc-bypass:2`
- **SDA:** `transaction:SDA`, `sensor:SDA`, `pullup-sda:2`
- **SCL:** `transaction:SCL`, `sensor:SCL`, `pullup-scl:2`

## Views and physical-layout status

The BB400 assembly uses individually insulated pigtails from the TC74's 1.70 mm lead pitch to the 2.54 mm breadboard grid. Leave pin 1 isolated and support the package on an insulated mount. The [Microchip datasheet](https://ww1.microchip.com/downloads/en/DeviceDoc/21462D.pdf) specifies SDA on pin 2, GND on pin 3 and the tab, SCL on pin 4, and supply on pin 5.

The routed 53 × 39 mm PCB uses two copper layers and a 0.20 mm minimum clearance. J1 supplies 3.3 V and return. BUS1 is a [Samtec three-pin header](https://www.samtec.com/products/tsw-103-07-t-s) for SDA, SCL and common return, in order. The fabrication validator checks pad connectivity and exports copper, outline, plated drill, and BOM files.

## Hardware read and oscilloscope

Connect a 3.3 V open-drain master and use a 10–100 kHz bus clock. After the device reports its first conversion ready, read one byte from register 0x00 at 7-bit address 0x48 using a repeated START. Interpret the physical byte as signed whole degrees Celsius. The shipped simulation fixture uses 0x2A as a configured sample. It does not read a connected sensor.

The scope shows modeled levels for a supported register read or an address NACK. Register 0x01 is the physical device's configuration register and remains outside this example's one-register model.

## Acceptance test and expected result

- Stable test ID: `core-i2c-sensor-read`
- Engine: Ideal I²C register-read transaction model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-i2c-register-read-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41175904531

Recorded expected result:

```json
{
  "address": 72,
  "register": 0,
  "receivedByte": 42,
  "receivedHex": "0x2A",
  "baud": 100000,
  "addressMatch": true,
  "registerMatch": true,
  "sensorAck": true,
  "readComplete": true,
  "addressNack": "complete with sensorAck=false and no data",
  "absentRegister": "ACK with no returned data",
  "pullUps": "one 4.7 kΩ resistor on each bus line"
}
```

## Safety and model limits

Digital transaction-level model with ideal open-drain pull-up checking. Clock stretching, arbitration, analog rise time, bus capacitance, noise, and physical device timing are omitted.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/058-i2c-sensor-read.adigun.json`.