# Coilcraft XGL4018, XGL4025, XGL4040 and XGL5020 ordering evidence

The manufacturer tables list these MEC order codes with ±20% nominal inductance tolerance.

| Series | Codes added | Selected inductance range |
| --- | ---: | ---: |
| [XGL4018](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl4018/) | 13 | 0.12–4.7 µH |
| [XGL4025](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl4025/) | 20 | 0.13–12 µH |
| [XGL4040](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl4040/) | 14 | 0.15–22 µH |
| [XGL5020](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl5020/) | 18 | 0.05–8.2 µH |

Lifecycle evidence, native mapping, model validation and independent review remain pending.

## PCB and symbol evidence

All 65 records have checksummed assets. The XGL4018, XGL4025, and XGL4040 drawings specify 0.98 × 3.40 mm lands on 2.37 mm centers. The XGL5020 drawing specifies 1.18 × 4.70 mm lands on 3.31 mm centers. Pad 1 follows the winding-start stripe. Each footprint records its series drawing and maximum height.

One 1 µH native RL fixture per series checks winding-start routing, PCB DRC, Gerber, BOM identity, ideal scope output and the breakout diagnostic.
