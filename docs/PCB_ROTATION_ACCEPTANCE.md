# PCB quarter-turn placement acceptance — 2026-11-09

The PCB inspector now provides Rotate 90° left/right for a selected stored footprint. This completes a bounded placement-edit checkpoint under product milestone 4; the professional PCB editor and production release remain incomplete.

## Geometry and document contract

- The pivot is the arithmetic centroid of the footprint's pad centers. Positive rotation is clockwise in the existing board coordinate system: x right, y down. Only multiples of 90° are supported, keeping rectangular SMD pads axis-aligned for the existing renderer, copper checks and Gerber output.
- A turn moves each owned pad center and swaps SMD width/height on odd quarter-turns. Circular through-hole pad and drill diameters stay unchanged. A pad's pin number, net, identity and technology do not change.
- Route vertices within the existing 0.001 mm attachment tolerance of an original pad center move only on that pad's net. Other vertices, vias, parts, canonical nets and breadboard/schematic positions stay unchanged. Attached segments stretch; this is not an autorouter and can introduce shorts or clearance failures.
- The native `pcbFabrication.parts[].rotationDeg` field records the cumulative quarter-turn from the initial stored layout, normalized to 0/90/180/270. Older documents without the field retain their existing zero-relative baseline. `Placement.csv` now reports this value in its existing `Rotation_deg` column instead of hard-coding zero. This is a relative layout rotation, **not a verified machine-placement angle or manufacturer package-zero convention**.
- Full pad extents must stay within the rectangular board. Unsupported turns, malformed pad/route geometry or invalid stored orientation are rejected before creating history or modifying the document. Successful turns create one undoable edit and clear an unfinished route draft. Native export/recovery retains the orientation field.
- Invalid stored orientation blocks placement/fabrication export. A geometrically valid rotation can still fail copper DRC; fabrication export retains the existing rejection gate.

## Evidence

| Check | Verified result |
| --- | --- |
| SMD geometry | USB-C fixture R1, +90°: pads (17,9)/(19,9) → (18,8)/(18,10) mm; 1 × 0.7 mm pads become 0.7 × 1 mm. Native identity/nets, other parts/vias and other-view positions are unchanged. |
| Through-hole / inverse operations | Four successive turns restore pad and attached route coordinates within 1e-8 mm, with unchanged pad/drill diameters. Inverse SMD turns restore original geometry. The through-hole header is first moved clear of the edge for this automated test. |
| Browser history | Right rotation, Undo and Redo passed. The inspector selects another component after history replacement, so R1 was reselected before checking its restored 90° value. Left rotation restored (17,9)/(19,9) mm; final Undo operations restored the original fixture. |
| Browser board bounds | Rotating J2 at its original near-edge position was rejected with “That footprint would extend beyond the board edge.” |
| Copper/export guard | Rotated R1 introduced two USB_DM clearance failures. Browser Run PCB checks reported both, and Gerber/drill/BOM export displayed “PCB export blocked”. The automated regression also confirms the blocked result contains no generated files. |
| Native export | The browser's exported project parsed through the actual native parser. R1 retained 90° and its placement CSV row reported centroid (18.000,9.000), rotation 90. |
| Localization and layout | Eight cases: English, German, Yoruba and Pidgin × 320/1280 px. Both controls had translated visible names, fit their available width and caused no page overflow. |
| Browser health | No new captured console errors. Fixture geometry was restored, English restored and temporary viewport overrides reset. |
| Required local checks | 400/400 tests passed; syntax, library validation and whitespace checks passed. The initial full run exposed a test expectation mismatch (`undefined` versus the export API's empty files object); correcting that expectation preserved the rejection requirement. |

## Reproduction and remaining scope

1. Run `npm run dev -- --port=4177`, load example 125 and select PCB → R1. Rotate right, use Undo/Redo and reselect R1 to inspect its orientation. Run PCB checks and attempt fabrication export to observe the introduced collision gate.
2. Use Rotate left to restore the pad arrangement. Undo the test edits. Select J2 at its original position and attempt rotation to inspect the board-edge rejection.
3. Run `npm test`, `npm run check` and `npm run validate:library`. PR #505 records the final commit and exact-head CI result.

This operation rotates the stored pad geometry and attached trace vertices. It does not supply arbitrary-angle placement, mirroring, side changes, courtyard/fab/silkscreen transforms, 3D geometry or a verified pick-and-place origin. Rotation of real package/assembly assets remains required before claiming a complete placement system. The relative-angle convention must be translated and reviewed before any machine-placement use.

Production promotion remains gated by `DEPLOYMENT_RUNBOOK.md` and `DELIVERY_GATES.md`; no deployment is claimed. The native QA export in Downloads and QA logs outside the repository are preserved and excluded from delivery. No new parts are promoted to verified.
