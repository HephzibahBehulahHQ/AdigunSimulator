# Coilcraft POExxPR ordering evidence

[Coilcraft’s POExxPR specification tables](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-over-ethernet/poexxpr/) list six flyback and six forward-mode surface-mount transformer order codes with the ED suffix. The tables link to schematics and separate the two topologies.

## Schematic and PCB assets

The [Coilcraft winding diagram](https://www.coilcraft.com/getattachment/14c8f61f-dedf-4d1c-9313-ff376d9d811b/poexxprs.gif) identifies starts 1, 4, 9 and 10 and ends 3, 5, 6 and 7, respectively. Pins 2 and 8 have lands without a shown winding connection. The [Coilcraft mechanical drawing](https://www.coilcraft.com/getattachment/3088521d-e701-4817-86a8-5495b6b2d8ed/poexxprd.gif) places pin 1 at the lower left and specifies 1.55 × 1.27 mm rectangular lands on 2.50 mm pitch. The 14.99 mm gap between inner land edges yields 16.54 mm between row centers. A documented breakout is required for breadboard use. Native transformer analysis and board-level isolation validation remain pending.
