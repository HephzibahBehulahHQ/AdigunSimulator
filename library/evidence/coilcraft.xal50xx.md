# Coilcraft XAL50xx ordering evidence

[Coilcraft document 908](https://www.coilcraft.com/getmedia/49bc46c8-4b2c-45b9-9b6c-2eaa235ea698/xal50xx.pdf), revised 26 February 2026, lists nine XAL5030 and seven XAL5050 inductance codes. Specify standard E termination and C packaging for the 7-inch reel. Preserve the package distinction for the two 4.7 µH order codes.

The datasheet provides package drawings and land patterns, plus inductance, DCR, saturation current and thermal-rise test conditions. These records have not yet been mapped to native footprints or models. Lifecycle, datasheet checksum and independent review are pending.

Run `node scripts/source-coilcraft-xal50xx.mjs` to add missing records.

## XAL5030-102MEC native mapping evidence

The [exact order-code page](https://www.coilcraft.com/en-us/products/power/high-voltage-inductors/xal/xal50xx/xal5030-102/) links Coilcraft's drawing. The two 1.18 × 4.70 mm lands have centers 3.31 mm apart. Local pad 1 follows the winding-start stripe in the top view. The native RL test fixture rotates the package 180 degrees, places the start on the RL node, and checks PCB DRC, front-copper Gerber, preview and ideal RL scope data. The ideal analysis does not validate a manufacturer-specific saturation or loss model. Physical breakout placement, browser print review and independent verification remain pending.

## Shared XAL50xx land pattern

The exact-order pages for XAL5030 and XAL5050 link the same manufacturer drawing. All 16 candidates now have distinct, checksummed symbol and land assets based on that drawing. XAL5030 uses the drawing's 3.1 mm height limit. XAL5050 uses 5.1 mm for the unambiguous dash codes. The XAL5050-472 record omits maximum height because the shared table has only one -472 entry without separating the two series. The native RL fixture now covers XAL5030-102MEC and XAL5050-103MEC. Fabrication BOM exports retain the recorded manufacturer, exact order code and source URL when a project supplies that evidence.
