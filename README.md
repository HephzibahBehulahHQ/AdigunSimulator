# AdigunSimulator

AdigunSimulator is a local-first electrical and electronics design workspace for breadboard prototyping, schematic capture, PCB design, and technically honest circuit analysis.

## Current implementation status

The current implementation establishes a dependency-free browser foundation: a responsive engineering workspace, a versioned native project document, local save/export/import, a small explicitly labelled starter library, shared component identity and project-net layouts across views, view-specific move/snap controls, overlap/unconnected-pin/source-short checks, four interface locales, bounded DC results for the LED-resistor and unloaded voltage-divider topologies, an anti-parallel LED polarity indicator, an ideal pushbutton LED circuit with pull-down, an ideal latching SPDT LED switch, ideal PWM LED average-current and low-battery comparator models, an ideal transformer/rectifier/regulator ripple envelope, a USB LED cold-state PTC warning, a solar garden-light day/night estimate, an ideal supercapacitor hold-up curve, a loaded passive treble-cut tone control, a sampled full-wave bridge rectifier and reservoir-capacitor ripple estimate, ideal Zener shunt regulation and a single-pulse TVS clamp estimate, and linear resistor networks with ideal voltage and current sources, and ideal first-order RC/RL responses including selectable RC charge/discharge and RC low-pass and high-pass plus RL low-pass frequency responses. Eighteen of the 200 catalogue projects are released and tested; ten supplemental analytical studies are also available.

It does **not** yet claim a 1,000 verified-part library, general SPICE simulation, arbitrary nonlinear or multi-element reactive/transient analysis, PCB manufacturing readiness, physical hardware safety, cloud accounts, or an AI service. Unsupported actions are disclosed in the interface rather than simulated.

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

