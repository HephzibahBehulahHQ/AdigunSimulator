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

These nine records can be added from Manufacturer evidence using Add to project. The native schematic uses all four numbered terminals. Separate nets assigned to the internally connected collector terminals fail validation. Breadboard and PCB show instance-specific mapping diagnostics until physical placements are available. Simulation remains unsupported.

Adding one of these parts now places its four copper lands on a clear PCB position when the board permits. PCB pad identities and declared schematic nets are retained. The placement check leaves the schematic instance visible and reports a diagnostic when automatic placement is unavailable. Copper routing remains explicit, and fabrication validation blocks incomplete routes. Breadboard adapter and simulation validation remain pending.

The [Proto Advantage PA0174C](https://www.proto-advantage.com/store/product_info.php?products_id=4600221) has a 2.3 mm SOT223-4 footprint and a DIP-4 interface. Its [datasheet](https://www.chipquik.com/datasheets/PA0174C.pdf) specifies a 7.62 mm row span, 2.54 mm pin pitch and 0.46 mm pin diameter. The 0.46 mm pins are within the documented BB400 insertion diameter range. The adapter pin map uses 1 and 2 on the left and 4 and 3 on the right in top view. Direct SOT223 insertion remains unsupported. Native adapter-to-hole placement and continuity validation are pending.

On the BB400, native PA0174C placement uses E(n), E(n+1), F(n+1), F(n) for pins 1 through 4. The topology model joins the two collector terminals internally and still treats the bare center gap as isolated. The placement is a documented assembly model. Physical bench continuity and simulation validation remain pending.

For device model qualification, compare hFE = IC/IB at 25 °C, |VCE| = 2 V and |IC| = 150 mA. The test is pulsed at up to 300 µs and 2% duty cycle. The base grades allow 63–250, the -10 grades 63–160, and the -16 grades 100–250. Use negative VCE and IC for BCP51 and positive values for BCP55/56. These limits anchor a gain check at one operating point. A model also needs evidence outside that point before its operating range can be specified. [BCP51 quick reference](https://assets.nexperia.com/documents/data-sheet/BCP51_SER.pdf)

The characteristics tables add three checks at 25 °C under the same pulse constraints. At |IC| = 500 mA and |VCE| = 2 V, require hFE ≥ 40 and |VBE| ≤ 1 V. At |IC| = 500 mA and |IB| = 50 mA, require |VCE(sat)| ≤ 0.5 V. Apply the transistor polarity to the test stimulus. These are qualification limits for a future model, and no solver status has been changed.
