# Microchip PDIP I²C EEPROM ordering evidence

The four order codes are listed in the respective product identification sections. Microchip lists the device types as In Production. Each selected code specifies the industrial temperature grade and 300 mil eight-lead PDIP. Native mappings, model qualification and independent review are pending.

| Order code | Density | Manufacturer evidence |
| --- | --- | --- |
| 24LC02B-I/P | 2 Kbit | [Ordering section](https://ww1.microchip.com/downloads/en/DeviceDoc/21709G.pdf) · [Lifecycle](https://www.microchip.com/en-us/product/24LC02B) |
| 24LC32A-I/P | 32 Kbit | [Ordering section](https://ww1.microchip.com/downloads/en/DeviceDoc/21713L.pdf) · [Lifecycle](https://www.microchip.com/en-us/product/24LC32A) |
| 24LC64-I/P | 64 Kbit | [Ordering section](https://ww1.microchip.com/downloads/en/DeviceDoc/21189S.pdf) · [Lifecycle](https://www.microchip.com/en-us/product/24LC64) |
| 24FC256-I/P | 256 Kbit | [Ordering section](https://ww1.microchip.com/downloads/en/DeviceDoc/21203R.pdf) · [Lifecycle](https://www.microchip.com/en-us/product/24FC256) |

All four PDIP symbols map VSS to pin 4, SDA to 5, SCL to 6, WP to 7, and VCC to 8. Pins 1–3 on 24LC02B are marked as no-connects because the device does not use the marked A0–A2 terminals. The 24LC32A, 24LC64 and 24FC256 symbols show the same three leads as address inputs. The SDA pin is bidirectional and uses an open-drain bus.

The 300 mil PDIP body designation and eight-lead ordering evidence are backed by each device datasheet. Microchip drawing C04-018-P gives a 2.54 mm lead pitch and maximum lower lead dimensions of 0.5588 mm wide by 0.381 mm thick. The drawing separately specifies the package shoulder width and free lead spread. The 300 mil designation alone does not prescribe either PCB drill centers or finished-hole diameter. PCB and breadboard placement require instance-level mounting geometry. [Microchip PDIP outline, C04-018-P](https://ww1.microchip.com/downloads/aemDocuments/documents/MPD/ProductDocuments/DataSheets/24AA64-24FC64-24LC64-64-Kbit-I2C-Serial-EEPROM-DS20001189.pdf)

The four educational footprint assets use the [KiCad Libraries DIP-8_W7.62mm design](https://github.com/KiCad/kicad-footprints/blob/master/Package_DIP.pretty/DIP-8_W7.62mm.kicad_mod) under the [KiCad library licence](https://www.kicad.org/libraries/license/). Each asset keeps eight numbered 0.8 mm drilled holes at 2.54 mm pitch and 7.62 mm row spacing. Pad 1 has 1.60 mm square copper, and the other pads have 1.60 mm circular copper. The asset is a generic land-pattern candidate with a separate Microchip package-outline source. It needs finished-hole and assembly verification. Native placement is pending support for square through-hole copper.
