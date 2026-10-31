# AdigunSimulator

AdigunSimulator is a local-first electrical and electronics design workspace for breadboard prototyping, schematic capture, PCB design, and technically honest circuit analysis.

## Current implementation status

The current implementation establishes a dependency-free browser foundation: a responsive engineering workspace, a versioned native project document, local save/export/import, a small explicitly labelled starter library, shared component identity and project-net layouts across views, view-specific move/snap controls, overlap/unconnected-pin/source-short checks, four interface locales, bounded DC results for the LED-resistor and unloaded voltage-divider topologies, an anti-parallel LED polarity indicator, an ideal pushbutton LED circuit with pull-down, an ideal latching SPDT LED switch, ideal PWM LED average-current and low-battery comparator models, an ideal transformer/rectifier/regulator ripple envelope, a USB LED cold-state PTC warning, a solar garden-light day/night estimate, an ideal supercapacitor hold-up curve, a loaded passive treble-cut tone control, a sampled full-wave bridge rectifier and reservoir-capacitor ripple estimate, ideal Zener shunt regulation a single-pulse TVS clamp estimate, NTC Beta-law temperature-divider and LDR comparator night-light and ideal NE555 astable and monostable timing analyses plus independent NE556 dual-astable timing and ideal inverting and non-inverting op-amp midband gain plus unity-gain voltage-follower sweeps and ideal comparator threshold, Schmitt hysteresis, and dual-comparator window switching and reference-buffer load sweeps and ideal NPN common-emitter bias/sine estimates and emitter-follower DC sweeps and NMOS flyback-coil estimates, ideal P-MOS high-side switching, and generic NPN relay-coil/flyback release-decay estimates, and static four-switch H-bridge motor estimates, and generic electret-microphone audio preamplifier estimates, and generic class-AB audio amplifier/speaker estimates, and active low-pass frequency responses, and Wien bridge startup/amplitude estimates, and ideal AND/OR gate truth tables and XOR odd-parity checking, and linear resistor networks with ideal voltage and current sources, and ideal first-order RC/RL responses including selectable RC charge/discharge and RC low-pass and high-pass plus RL low-pass frequency responses. Forty-three of the 200 catalogue projects are released and tested; ten supplemental analytical studies are also available.

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

