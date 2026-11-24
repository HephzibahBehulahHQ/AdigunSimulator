# Coilcraft XEL4020, XEL4030, XEL5020 and XEL5030 ordering evidence

The manufacturer tables list these MEC order codes with ±20% nominal inductance tolerance.

| Series | Codes added | Selected inductance range |
| --- | ---: | ---: |
| [XEL4020](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xel/xel4020/) | 10 | 0.08–2.2 µH |
| [XEL4030](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xel/xel4030/) | 13 | 0.1–6.8 µH |
| [XEL5020](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xel/xel5020/) | 6 | 0.1–1 µH |
| [XEL5030](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xel/xel5030/) | 10 | 0.13–4.7 µH |

Lifecycle evidence, native mapping, model validation and independent review remain pending.

## Symbol and PCB mapping

All 39 candidates have checksummed assets. The XEL4020 and XEL4030 drawings specify 0.98 × 3.40 mm lands on 2.37 mm centers. The XEL5020 and XEL5030 drawings specify 1.18 × 4.70 mm lands on 3.31 mm centers. The series drawings identify dash-code height exceptions and the winding-start stripe. Local pad 1 follows that stripe.

The native fixtures exercise one height-exception code per series and check PCB DRC, Gerber and BOM output, ideal RL scope data, and the breadboard breakout diagnostic. Physical breakout placement, manufacturer-specific model validation, and independent review remain pending.
