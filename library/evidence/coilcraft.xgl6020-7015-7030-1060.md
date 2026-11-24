# Coilcraft XGL6020, XGL7015, XGL7030 and XGL1060 ordering evidence

The manufacturer series tables list the selected MEC order codes and their nominal inductances. These candidates use the listed ±20% tolerance.

| Manufacturer series | Codes added | Inductance range |
| --- | ---: | ---: |
| [XGL6020](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl6020/) | 14 | 0.055–10 µH |
| [XGL7015](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl7015/) | 7 | 0.20–2.2 µH |
| [XGL7030](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl7030/) | 14 | 0.24–18 µH |
| [XGL1060](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl1060/) | 11 | 1–10 µH |

Lifecycle evidence, native mapping, model validation and independent review remain pending.

## PCB mapping

All 46 records have checksummed symbols and footprints derived from their linked series drawings. XGL6020 uses 1.43 × 5.50 mm lands at 4.04 mm pitch, XGL7015 and XGL7030 use 1.78 × 6.50 mm at 4.72 mm pitch, and XGL1060 uses 2.38 × 8.50 mm at 6.65 mm pitch. Local pad 1 identifies the winding start. Native RL fixtures exercise the 1 µH code from each series. These fixtures check PCB DRC, Gerber, BOM, ideal scope data and the breakout diagnostic. Physical breakout placement and manufacturer-specific models remain pending.
