# AdigunSimulator

AdigunSimulator is a local-first electrical and electronics design workspace for breadboard prototyping, schematic capture, PCB design, and technically honest circuit analysis.

## Current implementation status

The current implementation establishes a dependency-free browser foundation: a responsive engineering workspace, a versioned native project document, local save/export/import, a small explicitly labelled starter library, shared component identity and project-net layouts across views, view-specific move/snap controls, overlap/unconnected-pin/source-short checks, four interface locales, and bounded analytical DC results for the supplied LED-resistor and unloaded two-resistor voltage-divider topologies. Three native example projects are released and tested.

It does **not** yet claim a 1,000 verified-part library, general SPICE simulation, PCB manufacturing readiness, physical hardware safety, cloud accounts, or an AI service. Unsupported actions are disclosed in the interface rather than simulated.

## Run locally

Open `index.html` in a modern browser, or serve the folder with any static web server. No install is required.

## Checks

```text
npm test
npm run check
npm run validate:library
```

## Project data

Projects are stored locally in browser storage and can be exported as a native JSON document. The data model and validation rules live in `js/core.mjs`.

The part evidence gate is implemented in `js/part-ledger.mjs`. Run `npm run validate:library` to validate the ledger and report truthful candidate/in-review/verified coverage; only verified records count toward the 1,000-part target.

## Ownership

Hephzibah Behulah → HB Elektroniker → AdigunSimulator.

