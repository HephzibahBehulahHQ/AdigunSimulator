# Coilcraft XAL7030, XAL7070 and XAL8080 ordering evidence

The manufacturer tables list the selected order codes with ±20% inductance tolerance. The batch preserves the reel suffix from each table.

| Series | Selected codes | Inductance range |
| --- | ---: | ---: |
| [XAL7030](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xal/xal7030/) | 13 MEC | 0.16–10 µH |
| [XAL7070](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xal/xal7070/) | 20 MEC | 0.16–47 µH |
| [XAL8080](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xal/xal8080/) | 13 MED | 0.68–47 µH |

Lifecycle evidence, native mapping, model validation and independent review remain pending.

## PCB and symbol evidence

All 46 candidates have checksummed symbols and PCB footprints. The XAL7030 drawing gives a 2.94 mm inner gap, 6.50 mm pad length and dash-code widths of 1.78 or 1.58 mm. The resulting center spacings are 4.72 and 4.52 mm respectively. XAL7070 uses 1.92 × 6.50 mm lands on 4.82 mm centers. XAL8080 uses 1.78 × 7.00 mm lands on 5.16 mm centers. Local pad 1 follows the winding-start stripe.

Native RL fixtures exercise both XAL7030 variants and one order code each from XAL7070 and XAL8080. They check winding-start routing, DRC, Gerber, BOM identity, ideal scope output, and the breadboard breakout diagnostic.
