# Coilcraft XGL3014, XGL3020, XGL3512 and XGL3515 ordering evidence

The manufacturer’s series tables list the following MEC candidates with ±20% nominal inductance tolerance.

| Series | Codes added | Selected inductance range |
| --- | ---: | ---: |
| [XGL3014](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl3014/) | 10 | 0.082–1.8 µH |
| [XGL3020](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl3020/) | 13 | 0.10–4.5 µH |
| [XGL3512](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl3512/) | 11 | 0.082–1.2 µH |
| [XGL3515](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl3515/) | 14 | 0.09–2.2 µH |

Lifecycle evidence, native mapping, model validation and independent review remain pending.

## Symbol and PCB mapping

The XGL3014 and XGL3020 drawings specify 0.86 × 3.00 mm lands on 1.63 mm centers. The XGL3512 and XGL3515 drawings specify 0.81 × 3.20 mm lands on 1.80 mm centers. The footprints record each series' individual maximum height. Local pad 1 follows the winding-start stripe.

All 48 candidates have checksummed symbols and footprints. Native RL fixtures exercise the 1 µH code from each series and check routing, PCB DRC, Gerber, BOM identity, ideal scope output and the breakout diagnostic. Physical breakout placement and manufacturer-specific model validation remain pending.
