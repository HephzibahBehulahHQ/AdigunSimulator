# Vishay CRCW e3 resistor ordering evidence

[Vishay datasheet 20035](https://www.vishay.com/docs/20035/dcrcwe3.pdf), revision 14 April 2026, gives the 5% E24 range for each selected package on page 2 and the global part number format and reel codes on page 3. The batch uses the full 1 Ω to 10 MΩ E24 range and one reel option per size (ED for 0402 and EA for 0603, 0805 and 1206). The exact order codes are derived from those ordering tables. Stock and per-code lifecycle have not been confirmed.

Run `node scripts/source-vishay-crcw-e24.mjs` to add any missing records, then regenerate the public inventory. Candidates require independent review, native view mapping and model validation.

## CRCW0603100RJNEA mapping evidence

Page 11 specifies a 0.75 mm inner gap and two 0.75 mm by 1.00 mm reflow lands. Centering the pattern puts the pads at −0.75 mm and +0.75 mm along the long axis. The symbol's terminal numbers identify those pads by convention for this nonpolar resistor. A documented breakout is needed for breadboard placement. These assets are available for review. A native RC test fixture exercises schematic and PCB projection, PCB preview, DRC, the front-copper Gerber aperture, RC scope data, and the breadboard adapter diagnostic for this order code. Browser print review, physical breakout mapping, and independent release review remain pending.

## SchmalzTech ST-0603-4 breadboard adapter candidate

The [manufacturer ordering page](https://www.schmalztech.com/products/0603-smd-to-dip-adapter) identifies ST-0603-4. Page 2 of the [SchmalzTech datasheet](https://media.schmalztech.com/products/ST-0603-4/ST-0603-4%20Datasheet.pdf) maps each surface-mount land to its nearest through-hole connection. Viewed from the top with the 0603 marking at lower left, mount the resistor on the topmost pad pair. The locally numbered left and right terminals then connect to the top hole in the left and right columns, respectively. The 2.54 mm pitch applies to adjacent holes along a column. An actual project still needs the installed header, row spacing and breadboard-hole coordinates checked before it can claim a physical placement.
