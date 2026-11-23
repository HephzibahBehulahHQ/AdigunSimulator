# KEMET C1210C C0G ordering evidence

[KEMET C1003_C0G](https://content.kemet.com/datasheets/kem_c1003_c0g_smd.pdf), dated 20 February 2025, lists the 10–91 pF E24 range in Table 1B. That row lists the FB thickness code across all seven voltage columns for C1210C and specifies five percentage tolerances. The order codes combine those selections with standard C0G, matte tin termination and the TU unmarked 7-inch reel.

Run `node scripts/source-kemet-c0g.mjs` to add missing records, then regenerate the public inventories. The ordering matrix establishes candidate codes. Individual lifecycle, native mapping, model checks, datasheet checksum and independent review are pending.

Table 1B lists a separate 1.0–9.1 pF E24 row for C1210C, also with the FB thickness code in all seven voltage columns. Its capacitance codes end in 9 and allow B, C and D tolerances in pF. Those codes use the same TU reel option.

The higher-capacitance batch uses Table 1B's 110–910 pF entries and its individually listed 1,000–3,900 pF values. Each selected C1210C row allows the five percentage tolerances across all seven voltages. The 100 pF value is outside the rows used for this batch.

Page 8 lists the remaining C1210C values from 4,300 pF through 0.22 µF. The populated voltage columns stop at 250 V through 47,000 pF, 100 V from 56,000 to 100,000 pF, 50 V at 0.12 and 0.15 µF, and 25 V at 0.18 and 0.22 µF. Use the individually listed capacitance rows and their five percentage tolerances.
