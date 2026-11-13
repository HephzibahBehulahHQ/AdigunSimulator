# Part library evidence workflow

`library/parts-ledger.json` is the part evidence source of record. A manufacturer candidate remains unverified until its datasheet, exact package, ratings, pin data, licensed/checksummed assets, model limitations, breadboard limits, translations, and human review evidence satisfy `js/part-ledger.mjs`.

The generator creates original connection-block schematic symbols from the sourced pin maps:

```sh
npm run generate:part-symbols
```

Generated SVG symbols and footprint candidates are released under CC0 1.0 and recorded with SHA-256 digests. They do not claim manufacturer symbol artwork or a device simulation model. The repository includes source-grounded educational through-hole candidates and a BSS138BK SOT23 reflow-footprint reconstruction; each remains unverified until its source bytes, pad geometry, and independent human review are complete.

The app's **Manufacturer evidence** catalogue lets users search the ledger and inspect each record's lifecycle, package, model status, datasheet, and evidence blockers. It is read-only: candidates cannot be inserted into projects or used as simulated device models. The ordinary starter library remains separate and is labeled as generic.

Recompute the coverage report and validate evidence after changes:

```sh
npm run validate:library
npm test
```

Keep candidate/in-review counts separate from verified parts. The target of 1,000 does not justify promoting a record while evidence or independent human review is missing.

`candidate` means source evidence is still being assembled. `in-review` means the evidence gate is complete and the record is queued for independent human review; it does not mean that review has happened. Only `verified` records with a named reviewer and dated review count toward the target or become insertable manufacturer parts.

