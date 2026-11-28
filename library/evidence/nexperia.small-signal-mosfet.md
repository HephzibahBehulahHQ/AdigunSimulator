# Nexperia small-signal MOSFET ordering evidence

Each product page lists Production status. The manufacturer chemical content table supplies the exact order code and 12NC. One code per type is included. The schematic assets follow Table 2 of the manufacturer datasheets. The footprint assets follow manufacturer reflow copper. Native placement, simulation and independent review are pending.

| Order code | 12NC | Package | Evidence |
| --- | --- | --- | --- |
| 2N7002,215 | 934003470215 | SOT23 | [Product](https://www.nexperia.com/product/2N7002) · [Order code](https://www.nexperia.com/chemical-content/2N7002.html) |
| BSS138BKW,115 | 934065731115 | SOT323 | [Product](https://www.nexperia.com/product/BSS138BKW) · [Order code](https://www.nexperia.com/chemical-content/BSS138BKW.html) |
| BSS138BKS,115 | 934065728115 | SOT363 | [Product](https://www.nexperia.com/product/BSS138BKS) · [Order code](https://www.nexperia.com/chemical-content/BSS138BKS.html) |

- [Nexperia 2N7002 datasheet](https://assets.nexperia.com/documents/data-sheet/2N7002.pdf)
- [Nexperia BSS138BKW datasheet](https://assets.nexperia.com/documents/data-sheet/BSS138BKW.pdf)
- [Nexperia BSS138BKS datasheet](https://assets.nexperia.com/documents/data-sheet/BSS138BKS.pdf)

The SOT23 pattern reuses the existing Nexperia copper geometry. SOT323 has 0.55 × 0.60 mm lands, 1.85 mm between rows, and 1.30 mm between pins 1 and 2. SOT363 has 0.60 mm square outer lands and 0.40 × 0.60 mm center lands in the stored orientation. Its row spacing is 1.80 mm and outer centers are 1.50 mm apart within each row. The numbered package outline sets the top-view orientation. [SOT323 drawing](https://www.nxp.com/docs/en/package-information/SOT323.pdf) · [SOT363 drawing](https://www.nxp.com/docs/en/package-information/SOT363.pdf)

All three parts now place from the manufacturer catalogue in Schematic and PCB. The dual BSS138BKS keeps its six numbered terminals, with separate symbols for the two channels. Breadboard shows the breakout requirement and analysis reports the missing device model.
