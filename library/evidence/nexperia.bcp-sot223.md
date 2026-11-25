# Nexperia BCP SOT223 bipolar transistor ordering evidence

The manufacturer lists these nine SOT223 order codes as active. Each type contributes one order code. The symbols map base to terminal 1, collector to terminals 2 and 4, and emitter to terminal 3. The footprint assets record the manufacturer copper lands. Native PCB placement, simulation validation and independent review are pending.

- [BCP51](https://www.nexperia.com/products/bipolar-transistors/general-purpose-and-low-vcesat-bipolar-transistors/single-bipolar-transistors/single-bipolar-transistors-100-v/series/BCP51-BCX51-BC51PA.html)
- [BCP55](https://www.nexperia.com/products/bipolar-transistors/general-purpose-and-low-vcesat-bipolar-transistors/single-bipolar-transistors/single-bipolar-transistors-100-v/serie/bcp55-series)
- [BCP56](https://www.nexperia.com/products/bipolar-transistors/general-purpose-and-low-vcesat-bipolar-transistors/single-bipolar-transistors/single-bipolar-transistors-100-v/serie/bcp56-series)

| Order code | 12NC | Family |
| --- | --- | --- |
| BCP51,115 | 933917270115 | BCP51 |
| BCP51-10,135 | 933917280135 | BCP51 |
| BCP51-16,115 | 933917290115 | BCP51 |
| BCP55,115 | 933917210115 | BCP55 |
| BCP55-10,115 | 933917220115 | BCP55 |
| BCP55-16,115 | 933917230115 | BCP55 |
| BCP56,115 | 933917240115 | BCP56 |
| BCP56-10,115 | 933917250115 | BCP56 |
| BCP56-16,115 | 933917260115 | BCP56 |

- [Nexperia BCP51 series datasheet](https://assets.nexperia.com/documents/data-sheet/BCP51_BCX51_BC51PA.pdf)
- [Nexperia BCP55 series datasheet](https://assets.nexperia.com/documents/data-sheet/BCP55_SER.pdf)
- [Nexperia BCP56 series datasheet](https://assets.nexperia.com/documents/data-sheet/BCP56_SER.pdf)
- [Nexperia SOT223 package drawing and reflow land pattern](https://assets.nexperia.com/documents/package-information/SOT223.pdf)

Figure 2 (sot223_fr) specifies 1.3 × 1.3 mm copper pads for pins 1–3 and a 3.6 × 1.3 mm copper pad for the collector tab. The lower row has 2.3 mm pitch, and the rows are 6.1 mm apart center to center. The split in the tab stencil is a paste feature. [NXP rendering of the same drawing](https://www.nxp.com/docs/en/package-information/SOT223.pdf).

A native PCB test fixture checks all nine footprints in the board preview and fabrication export. Both collector pads share a routed net, and removing the route blocks export. The fixture constructs the board directly. Catalogue placement and breadboard adapter validation remain pending.
