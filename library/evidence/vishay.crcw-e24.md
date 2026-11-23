# Vishay CRCW e3 resistor ordering evidence

[Vishay datasheet 20035](https://www.vishay.com/docs/20035/dcrcwe3.pdf), revision 14 April 2026, gives the 5% E24 range for each selected package on page 2 and the global part number format and reel codes on page 3. The batch uses the 100–910 Ω decade and one reel option per size (ED for 0402 and EA for 0603, 0805 and 1206). The exact order codes are derived from those ordering tables. Stock and per-code lifecycle have not been confirmed.

Run `node scripts/source-vishay-crcw-e24.mjs` to add any missing records, then regenerate the public inventory. Candidates require independent review, native view mapping and model validation.
