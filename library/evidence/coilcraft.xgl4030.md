# Coilcraft XGL4030 ordering evidence

The [Coilcraft series specification](https://www.coilcraft.com/en-us/products/power/high-voltage-inductors/xgl/xgl4030/) and [short-form catalog](https://www.coilcraft.com/getmedia/d46871f9-0aed-4757-ae22-69277909da05/ShortFormCatalog.pdf) list the 19 MEC order codes added here, from 0.045 to 12 µH, with ±20% inductance tolerance. These use standard termination and the 7-inch reel. The package drawing is referenced by the [series datasheet](https://www.coilcraft.com/getmedia/032d9c73-4222-482f-b6bc-7808590e27c9/xgl4030.pdf). Lifecycle, native view mapping, simulation validation and independent review are pending.

## XGL4030-102MEC native mapping

The [manufacturer drawing](https://www.coilcraft.com/getattachment/7914338e-f23b-45de-aa1d-e782ba7e954b/xgl4030d.gif?lang=en-US) specifies 0.98 × 3.40 mm lands on 2.37 mm centers. Local pad 1 follows the winding-start stripe. The native RL fixture checks the rotated pad position, intended net, DRC, PCB preview, front-copper Gerber aperture, BOM order code and ideal RL scope output. Physical breadboard placement requires a documented breakout. Manufacturer-specific loss and saturation validation and independent review remain pending.
