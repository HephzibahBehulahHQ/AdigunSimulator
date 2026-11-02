# Part library evidence workflow

`library/parts-ledger.json` is the part evidence source of record. A manufacturer candidate remains unverified until its datasheet, exact package, ratings, pin data, licensed/checksummed assets, model limitations, breadboard limits, translations, and human review evidence satisfy `js/part-ledger.mjs`.

The generator creates original connection-block schematic symbols from the sourced pin maps:

```sh
npm run generate:part-symbols
```

These generated SVGs are released under CC0 1.0, recorded with SHA-256 digests, and do not claim manufacturer artwork or a device simulation model. No footprint asset is generated automatically: exact geometry and pad numbering require package evidence and review.

Recompute the coverage report and validate evidence after changes:

```sh
npm run validate:library
npm test
```

Keep candidate/in-review counts separate from verified parts. The target of 1,000 does not justify promoting a record while evidence or independent human review is missing.

