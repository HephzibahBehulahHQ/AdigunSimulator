# KEMET C0603C C0G ordering evidence

[KEMET C1003_C0G](https://content.kemet.com/datasheets/kem_c1003_c0g_smd.pdf), dated 20 February 2025, lists all seven voltage columns for the selected C0603C E24 rows and 1,000 pF row in Table 1A on pages 5 and 6. The 1.0–9.1 pF codes use B/C/D absolute tolerances. The 10–1,000 pF codes use F/G/J/K/M percentage tolerances. All selected codes use the standard C0G series, matte tin termination and TU unmarked 7-inch reel.

Run `node scripts/source-kemet-c0g.mjs` to add missing records. Individual lifecycle, datasheet checksum, native mapping, model validation and independent review remain pending.
