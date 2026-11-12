# Plated via editing acceptance — 2026-11-09

This checkpoint adds working via creation, movement, resizing, removal and coordinate picking to the main PCB workspace. It advances the PCB editor requirement; it does not accept the complete PCB editor or production release.

## Operation and invariants

- PCB menu/toolbar → New via opens the inspector. Choose a declared net, X/Y coordinates, copper diameter and drill diameter, then Save via. Defaults of 0.6/0.3 mm are generic starting values, not manufacturer-approved rules. Existing vias can be selected from the picker or with mouse/Enter/Space on the canvas in Select mode.
- Pick board position fills a draft coordinate using the shared transformed canvas. Snap rounds it to 0.5 mm when enabled. Save is a separate action; picking and Escape do not mutate the project or create history.
- Vias require exactly the supported F.Cu/B.Cu stack. The existing 256-via limit, known-net requirement, finite positive dimensions, drill smaller than copper and full-copper board bounds apply. A via's net cannot be reassigned while editing; use an explicitly reviewed removal/new-via operation to change that intent.
- Saving checks both-layer copper conflicts, other-net/NC pad spacing, applicable class clearance and mechanical keep-outs. Malformed or resource-heavy copper and existing copper-audit violations block the edit. Drill overlap with another via or through-hole pad is rejected even on the same net. This does not establish annular-ring or drill-spacing manufacturing qualification.
- A via placed on an existing same-net trace centerline inserts a vertex within the existing 0.001 mm attachment tolerance. Moving a via moves its attached vertices on either copper layer, including materializing an anchor on a trace interior. Copper overlap away from a centerline is not an inferred routing anchor. Unrelated copper, components and canonical nets remain unchanged.
- Removing a via retains copper, so connectivity must be rechecked. A newly isolated via is editable, but fabrication export stays blocked until connectivity is repaired or the via is removed. New via IDs are unique, generated locally, and remain copper objects rather than schematic component identities.
- Successful edits capture one native history snapshot. Rejected/unchanged operations do not add history. Selecting a via clears the component selection. Delete/Backspace on a focused via removes only that via, preventing accidental component deletion. Arrow keys nudge a focused via by 0.5 mm with Snap on or 0.1 mm with Snap off; each accepted step is independently undoable and reuses the guarded via editor.

## Verified evidence

| Check | Observed result |
| --- | --- |
| Browser create/edit | On USB-C example 125, VBUS via-1 was created at (25,17) mm with 0.6/0.3 mm copper/drill, moved to (26,17) and resized to 0.7 mm copper. Native via count increased 10 → 11. |
| History and rejection | Undo/Redo restored X 26 → 25 → 26. X=0 was rejected as copper beyond the board. Remove/Undo/Redo changed the added-via count 1 → 0 → 1 → 0; rejected edits retained native geometry. |
| Connectivity gate | The isolated via blocked Gerber/drill/BOM export with an unreached pad and disconnected VBUS groups. |
| Routing integration | A B.Cu route connected the new via to J2 VBUS using waypoints (39,16.5), (40,16.5), (40,3) mm. Moving the via to (27,17) moved the attached route start. Browser bounded PCB checks then passed. |
| Coordinate picking | At 125% zoom, a board-center click filled (21,10) mm without creating a via. Enter on J1-A4 selected that stored via for editing. |
| Keyboard safety | With J1-A4 focused, Delete changed the via count 10 → 9 while all four component footprints remained. Undo restored ten vias; the component inspector had cleared selection before deletion. |
| Keyboard nudge | Controller tests verify right/down movement at 0.5 mm and 0.1 mm, one history entry per accepted move, retained canonical nets, focus restoration, and no movement while PCB routing owns the arrow keys. Browser verification remains open. |
| Localization/responsiveness | Eight cases: English, German, Yoruba and Pidgin × 320/1280 px. No page overflow or clipped via fields/buttons; translated Save controls remained visible. |
| Browser cleanup | Test geometry was undone, the original ten vias restored, English restored, Fit returned to 100% and viewport overrides were reset. No new captured console errors appeared. |
| Automated integrity/export | Tests cover immutable create/edit/delete, native round trips, two-layer trace anchors, pad/NC/class/keep-out conflicts, drill overlap, unsupported stacks/counts and real controller history behavior. A created/routed/moved via passes DRC, appears at (27,17) in both copper Gerbers and the plated drill file, and stays out of the BOM. |
| Required checks | 412/412 tests passed, with syntax/library validation and whitespace checks. An existing action-source contract was updated for the delegated controller, and explicit diameter/drill input labels resolved the full-suite accessibility audit failure. |

## Keyboard nudge follow-up — 2026-11-12

Focused vias now support arrow-key nudging through the guarded native via editor: 0.5 mm per step with Snap enabled and 0.1 mm with Snap disabled. Nudges reuse `savePcbVia` and its board/copper guards; controller tests verify one undo snapshot per accepted move, unchanged canonical nets, retained keyboard focus, and handoff to the PCB route tool. The four-language via hint exposes these increments. The updated local suite passes 557/557 tests; `npm run check`, `npm run validate:library`, and `git diff --check` pass. Browser verification of the new arrow-key path remains open.

## Direct via drag follow-up — 2026-11-12

In PCB Select mode, primary-pointer dragging moves a via through the guarded `savePcbVia` path. The canvas previews only accepted coordinates; a completed move creates one history entry, while Escape/pointer cancellation and blocked board/copper/keep-out drops restore the original project. Click selection remains available, pointer capture keeps an active drag attached to the canvas, and `touch-action:none` prevents the browser from taking over via gestures. Snap rounds positions to 0.5 mm; with Snap off, coordinates are rounded to 0.001 mm. Controller tests cover preview, one-entry history, unchanged nets, cancellation, and blocked drops. Browser verification remains open.

Small vias retain their electrical copper and drill dimensions while rendering a transparent 12 px minimum pointer target. Hover and keyboard focus reveal a cyan halo for that target to make the drag affordance easier to find.

## Reproduction and remaining work

1. Run `npm run dev -- --port=4177`, load example 125 and open PCB → New via. Use the values above to create, resize, move and remove a via; exercise Undo/Redo.
2. Run PCB checks before and after routing the new via to J2 VBUS on B.Cu. Attempt fabrication export while isolated to verify rejection.
3. Use Pick board position at a changed zoom, then cancel or save deliberately. Select a via with Enter, verify arrow-key nudges with Snap on and off, drag it to valid and rejected positions, and cancel a drag with Escape; then use Delete/Undo and confirm component footprints remain intact.
4. Run `npm test`, `npm run check` and `npm run validate:library`. PR #505 records the final commit, local/remote equality and matching-head CI.

Blind/buried or multilayer vias, automatic layer-transition routing, manufacturer drill/annular-ring tolerances, solder mask/paste, thermal/current capacity and impedance remain unaccepted. Keyboard nudging and direct pointer dragging are covered by controller tests but still need browser verification. The coordinate inspector and picker do not constitute a complete board/layer/rule setup editor. Production remains gated by independent electrical/release review and the documented protected Pages process. QA logs are outside the repository and excluded; no credentials or unrelated project files are included.
