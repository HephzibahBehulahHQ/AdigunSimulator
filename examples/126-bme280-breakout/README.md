# Example 126: BME280 I²C sensor breakout

## Circuit

The board accepts 5 V at J1.VIN and uses a TI TLV70033DDC (SOT-23-5) to provide 3.3 V. A Bosch BME280 is wired for I²C at address 0x76: CSB is tied high, SDO is low, and SDA/SCL have separate 4.7 kΩ pull-ups to 3.3 V. The LDO has 1 µF input/output capacitors; the sensor supply pins each have a 100 nF bypass capacitor. J1 exposes VIN, GND, SDA and SCL.

The model records the Bosch BME280's 8-pad assignments and supply ranges, and the TI regulator's five-pin mapping. See the [Bosch BME280 datasheet](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf) and [TI TLV700 datasheet](https://www.ti.com/lit/ds/symlink/tlv700.pdf).

## Checks and exports

Tests run the native project pin/ERC subset, a bounded topology check, single-sided PCB DRC and byte-matching output snapshots. BOM and placement report must include every physical board component:

- `BOM.csv`
- `Placement.csv`
- `board-F_Cu.gbr`
- `board-Edge_Cuts.gbr`
- `board-PTH.drl`

## Limits

This project verifies declared connectivity and selected component values; it does not simulate BME280 readings, I²C transactions, regulator thermal behavior, sensor accuracy, controlled impedance, complete copper crossings or manufacturer-specific fabrication rules. The displayed BME280 land pattern is a generic template and must be checked against the official package drawing before fabrication. Confirm VIN source limits, TLV700 dissipation, capacitor ratings, bus pull-up loading, assembly orientation and actual parts. It is not a production-certified module.
