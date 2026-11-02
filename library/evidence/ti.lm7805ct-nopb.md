# Texas Instruments LM7805CT/NOPB evidence review

Review state: candidate; not verified  
Evidence checked: 2026-11-02

## Primary manufacturer evidence

- [LM7805CT/NOPB orderable page](https://www.ti.com/product/LM7800/part-details/LM7805CT/NOPB)
- [LM340/LM7805 family datasheet, revision L](https://www.ti.com/lit/ds/symlink/lm7800.pdf)

The TI orderable page identifies the exact order code. The family datasheet's three-pin TO-220 pin-function table maps pin 1 to INPUT, pin 2 to GND, and pin 3 to OUTPUT. It is a fixed 5 V regulator, but this entry is not a validated device simulation.

TI lists a 7.5 V to 20 V input range for the 5 V output electrical characteristics and a 35 V maximum input rating. The 1.5 A output-current family rating depends on thermal and electrical conditions. Treat these as device limits and conditions, not a promise of breadboard-safe output power.

## Package asset

`library/assets/footprints/ti.lm7805ct-nopb/footprint.json` maps the three leads in-line at the 2.54 mm and 5.08 mm pitches shown on TI's NDG0003F TO-220 drawing. The body, tab, and lead dimensions are recorded from the drawing. The 3.5 mm copper pads and 2.0 mm drills are AdigunSimulator educational defaults, not TI recommendations. The generated footprint needs physical-fit and board-rule review.

## Verification still required

- Independently inspect the generated footprint against the exact package drawing and physical part, including pin and tab relationship.
- Review heat dissipation, capacitors, input source, load current, and mounting conditions for the intended circuit.

The record remains a candidate and is excluded from the verified-part count until an identified human reviewer signs off.

