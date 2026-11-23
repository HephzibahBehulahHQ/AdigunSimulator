# Vishay CRCW e3 resistor ordering evidence

[Vishay datasheet 20035](https://www.vishay.com/docs/20035/dcrcwe3.pdf), revision 14 April 2026, gives the 5% E24 range for each selected package on page 2 and the global part number format and reel codes on page 3. The batch uses the full 1 Ω to 10 MΩ E24 range and one reel option per size (ED for 0402 and EA for 0603, 0805 and 1206). The exact order codes are derived from those ordering tables. Stock and per-code lifecycle have not been confirmed.

Run `node scripts/source-vishay-crcw-e24.mjs` to add any missing records, then regenerate the public inventory. Candidates require independent review, native view mapping and model validation.

## CRCW0603100RJNEA mapping evidence

Page 11 specifies a 0.75 mm inner gap and two 0.75 mm by 1.00 mm reflow lands. Centering the pattern puts the pads at −0.75 mm and +0.75 mm along the long axis. The symbol's terminal numbers identify those pads by convention for this nonpolar resistor. A documented breakout is needed for breadboard placement. These assets are available for review. Native placement, DRC, fabrication exports, and analysis of a project using this order code remain pending.
