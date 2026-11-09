# Board setup and shared PCB rules — 2026-11-09

## Implemented behavior

PCB → Board Setup creates a rectangular empty board or edits an existing supported board. The localized modal exposes width, height, thickness, F.Cu or F.Cu+B.Cu, minimum trace width and minimum copper clearance, all in millimetres. Values must be positive and finite. Defaults for an existing board preserve its declared values; a previously undeclared minimum width defaults to its narrowest stored trace. New-board defaults are editable design assumptions, not manufacturer requirements.

Applying a change creates one native undo step, marks the project unsaved, cancels incomplete routing/via drafts and displays the PCB view. Cancel, Escape, unchanged values and rejected edits create no history entries. Stale dialogs cannot replace a newer project. Native import/export preserves the board fields and exact copper positions. Dimensions change the outline only; nets, components, other view positions, pads, routes and vias are not rescaled or relocated.

The editor rejects copper that would extend outside the new outline, using full pad/via size and trace half-width. It also checks keep-out/zone bounds, mounting-hole edge allowances and declared edge-cutout positions. Removing B.Cu is blocked while it contains routes, zones or spanning plated vias. Existing multilayer/detailed stackup plans and nonrectangular outlines are preserved rather than converted by this editor.

The board width rule is a floor: routing uses the maximum of the board minimum and every matching class's minimum trace width (or its declared trace width when no explicit minimum is present). A lower class value cannot relax the board rule. Legacy projects without a declared board floor remain compatible; new interactive routes still default to 0.25 mm when neither board nor class specifies a width. A malformed declared width blocks routing/export.

Stricter width/clearance rules can be applied to existing copper even if that reveals violations. The editor reports the bounded PCB check result; fabrication remains blocked until the violations are fixed or the rule change is undone. The existing clearance audit already takes the strictest board, class and class-pair clearance. DRC/export now also checks board/class width floors and full copper extent at the outline. The manufacturing manifest records dimensions, thickness, layers and declared board rules, and correctly describes one/two-layer export scope.

## Verification

Ten new automated tests cover empty-board creation, native round trips, immutable and no-op edits, net/layout preservation, copper/obstacle/mechanical bounds, layer changes, unsupported multilayer plans, invalid numeric/shape inputs, strictest width selection, fabrication rejection, manifest fields and controller history/cancellation/staleness. The full suite passed **432/432**; syntax, library and staged whitespace checks also passed. Final commit/equality/CI evidence is recorded on PR #505.

Browser verification in the local preview:

- Created a 60 × 40 mm two-layer empty board. The outline appeared, status became unsaved, Undo removed the board and Redo restored it. Fabrication remained blocked for an unrouted empty board.
- Loaded USB-C example 125. A single-layer conversion was rejected because bottom copper and vias remained. Shrinking width to 30 mm was rejected; the original 42 × 20 mm board remained intact.
- Applied 50 × 26 mm and 2 mm thickness. Four stored footprints and ten vias were retained, and bounded PCB checks passed.
- Raised the minimum trace width to 1 mm. Existing narrow routes blocked fabrication. Undo restored passing checks.
- Tested the form at 1280 × 800 and 375 × 800 in English, German, Yoruba and Pidgin: dialogs and fields fit horizontally, action buttons did not overlap, width received focus, and cancellation worked. Escape also closed the English modal. Viewport override was reset.
- Exported `usb-c-usb-2-0-breakout.adigun (6).json`; native parsing confirmed the 50 × 26 × 2 mm board, declared width/clearance rules, five native components and ten vias, with passing bounded checks. No new console errors were captured. The QA download and logs remain outside the repository and are excluded from commits; no manually saved project was overwritten.

## Remaining scope

This is a rectangular one/two-layer editor, not a full board/stackup system. Polygonal outlines, layer ordering/materials/copper weights, inner-layer routing, stackup impedance, a net-class editor, via drill/annular-ring rule editing, mechanical feature editing and automatic repair remain outstanding. There is no manufacturer-specific board qualification or certified DRC. Thickness is retained as declared metadata; no electromagnetic or mechanical solver is implied. Existing manufacturing-feature limitations remain in force.

No production deployment was performed. Independent electrical/release review, broader browser acceptance and the protected release process remain required by `DELIVERY_GATES.md` and `DEPLOYMENT_RUNBOOK.md`.
