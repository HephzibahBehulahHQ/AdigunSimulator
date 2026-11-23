# Component bank sourcing

The inventory separates placeable definitions, PLC instructions, taxonomy types, and manufacturer ledger records. Generate both public exports with `node scripts/export-component-inventory.mjs` and validate the ledger with `node scripts/validate-part-ledger.mjs`.

The baseline audit recorded 364 placeable definitions, including 25 ladder instructions, 565 taxonomy types across 15 categories, and 18 manufacturer records. Two were in review and none were verified. The first sourcing batch adds Vishay TSOP38438 as a candidate.

The sourcing target is 11,400 distinct orderable manufacturer entries across the twenty families in the component-bank directive. The ledger separately tracks its existing 1,000 verified-record target. An authored symbol, educational footprint, or example mapping is evidence for the corresponding view. Count independently approved parts and validated simulation models separately as those checks finish.

Continue in source-backed batches. Attach exact pin and package evidence, retain the existing verification gates, and validate native placement and analysis before reporting an entry ready for those uses.
