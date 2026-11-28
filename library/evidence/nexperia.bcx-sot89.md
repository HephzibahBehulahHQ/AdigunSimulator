# Nexperia BCX SOT89 bipolar transistor ordering evidence

The manufacturer tables list these 12 SOT89 order codes as active. Each selected type contributes one order code. The schematic symbols use the pinning from Table 2 of each datasheet. Native PCB placement, simulation validation and independent review remain pending.

- [BCX51](https://www.nexperia.com/products/bipolar-transistors/general-purpose-and-low-vcesat-bipolar-transistors/single-bipolar-transistors/serie/bcx51-series)
- [BCX53](https://www.nexperia.com/products/bipolar-transistors/general-purpose-and-low-vcesat-bipolar-transistors/single-bipolar-transistors/serie/bcx53-series)
- [BCX56-Q](https://www.nexperia.com/products/bipolar-transistors/general-purpose-and-low-vcesat-bipolar-transistors/single-bipolar-transistors/serie/bcx56-series)
- [BCX51-Q](https://www.nexperia.com/products/bipolar-transistors/general-purpose-and-low-vcesat-bipolar-transistors/single-bipolar-transistors/serie/bcx51-q-series-general)

| Order code | 12NC | Family |
| --- | --- | --- |
| BCX51,115 | 933272280115 | BCX51 |
| BCX51-10,115 | 933663040115 | BCX51 |
| BCX51-16,115 | 933674710115 | BCX51 |
| BCX53,115 | 933272300115 | BCX53 |
| BCX53-10,115 | 933663060115 | BCX53 |
| BCX53-16,115 | 933674730115 | BCX53 |
| BCX56-10-QX | 934664466115 | BCX56-Q |
| BCX56-16-QX | 934664784115 | BCX56-Q |
| BCX56-QX | 934664787115 | BCX56-Q |
| BCX51-10-QX | 934666366115 | BCX51-Q |
| BCX51-16-QX | 934666367115 | BCX51-Q |
| BCX51-QX | 934666361115 | BCX51-Q |

- [Nexperia BCX51 series datasheet](https://assets.nexperia.com/documents/data-sheet/BCX51_SER.pdf)
- [Nexperia BCX53 series datasheet](https://assets.nexperia.com/documents/data-sheet/BCX53_SER.pdf)
- [Nexperia BCX56-Q series datasheet](https://assets.nexperia.com/documents/data-sheet/BCX56-Q_SER.pdf)
- [Nexperia BCX51-Q series datasheet](https://assets.nexperia.com/documents/data-sheet/BCX51-Q_SER.pdf)

Figure 2 of the [Nexperia SOT89 package drawing](https://assets.nexperia.com/documents/package-information/SOT89.pdf) shows the stepped collector solder land. Native PCB pads currently use a single rectangle per SMD terminal. A native mapping requires composite copper geometry carried through rendering, clearance checks and Gerber export.

The reflow copper diagram was cross-checked against [NXP’s SOT89 drawing](https://www.nxp.com/docs/en/package-information/SOT89.pdf), Figure 2. With the centerline at x = 0 and the top copper edge at y = 0, the two outer copper lands are centered at x = ±1.5 mm and y = 4.05 mm. Each measures 0.7 × 1.1 mm. Pad 2 is continuous copper made of a 2.0 × 2.75 mm upper section and a centered 0.7 × 1.85 mm lower stem. The sections meet at y = 2.75 mm. The 4.6 mm height and the 0.5 mm step offset are copper dimensions. Separate hatch patterns identify paste and mask features. The package outline shows the exposed underside, so its lead order is mirrored from the top-view device pinning diagrams. The footprint assets encode both copper sections as one collector terminal. Native placement remains pending composite copper support.
