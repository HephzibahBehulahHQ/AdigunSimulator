# Coilcraft XFL40xx ordering evidence

The [XFL4012](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xfl/xfl4012/), [XFL4015](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xfl/xfl4015/), [XFL4020](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xfl/xfl4020/), and [XFL4030](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xfl/xfl4030/) manufacturer tables support four, five, ten, and five selected MEC order codes respectively. The records use the published nominal inductance and ±20% tolerance. Lifecycle, native mapping, model validation, and independent review remain pending.

## Symbol and PCB mapping

All four drawings specify 0.98 × 3.40 mm lands on 2.37 mm centers. Maximum heights for XFL4012, XFL4015, XFL4020 and XFL4030 are 1.20, 1.60, 2.10 and 3.10 mm respectively. Local pad 1 follows the winding-start stripe. The XFL4030 drawing notes that parts manufactured before 2011 may lack that stripe.

All 24 candidates have checksummed symbols and footprints. One native RL fixture per series checks winding-start routing, DRC, Gerber and BOM exports, ideal scope output, and the breadboard breakout diagnostic.
