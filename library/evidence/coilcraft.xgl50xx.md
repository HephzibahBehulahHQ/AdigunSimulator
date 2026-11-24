# Coilcraft XGL5030 and XGL5050 ordering evidence

The [XGL5030 manufacturer table](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl5030/) lists 24 MEC codes from 0.055 to 22 µH. The [XGL5050 manufacturer table](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xgl/xgl5050/) lists 23 MEC codes from 0.16 to 33 µH. This batch uses the listed nominal inductances and ±20% tolerances. Lifecycle, native mappings, model validation and independent review are pending.

## Symbol and PCB mapping

Both drawings specify 1.18 × 4.70 mm lands on 3.31 mm centers and identify the winding-start stripe. Local pad 1 follows that stripe. The [XGL5030 drawing](https://www.coilcraft.com/getattachment/e86c5bb4-0f92-4a0b-b413-3aa80ed05c9d/xgl5030d.gif?lang=en-US) gives 3.2 mm maximum height for eight dash codes and 3.1 mm for the other listed codes. The [XGL5050 drawing](https://www.coilcraft.com/getattachment/4c56b418-bd36-431c-88a5-dd680ae7e09d/xgl5050d.gif?lang=en-US) gives 5.1 mm for standard termination.

The native RL fixture covers XGL5030-181MEC and XGL5050-103MEC. It checks the winding-start net, breakout diagnostic, PCB DRC, Gerber aperture, BOM identity and ideal RL scope data. Manufacturer loss and saturation models and physical breakout placement remain unvalidated.
