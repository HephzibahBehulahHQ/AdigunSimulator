# Shared canvas camera acceptance — 2026-11-09

This record covers the main breadboard, schematic and PCB canvas, using the USB-C USB 2.0 breakout fixture in the local preview. It does not accept the complete editor, visual target or production release.

## Defects and changes

- Zoom previously changed its label and individual HTML components without scaling the PCB board, copper or other SVG geometry. A single isotropic transform now fits the 680 × 300 workspace and applies zoom/pan to its entire scene. Zoom is bounded to 25–800%; Fit view restores the centered workspace at 100%. Resizing reapplies the fit scale. Camera changes do not edit the native project or history.
- Pointer movement and route waypoints now convert through the transformed scene/SVG rectangle. Pan works over components, is bounded to keep part of the workspace reachable, and restores its start position when canceled.
- A later minimum-width rule and the schematic button border displaced symbol terminals from their net endpoints. The main schematic now keeps the original 56 × 58 symbol geometry without a layout-affecting border.
- Empty board clicks were ignored because the PCB SVG had pointer events disabled. Board outlines now accept waypoint clicks while routing is active. Other passive SVG elements remain passive.
- A fractional PCB move wrote fractional display coordinates, violating the native document's integer position schema and breaking Redo/export parsing. Only the display-position cache is rounded; physical pad and attached route coordinates retain millimetre precision. Undo/Redo validates the destination snapshot before changing either history stack, preserving the current project and history if a snapshot is invalid.

## Verified evidence

| Check | Result |
| --- | --- |
| Original zoom defect | 100% → 110% left the rendered PCB board at approximately 404.522 × 192.111 px. |
| Shared zoom | Six browser cases: three views × 390/1280 px. 100% → 125% scaled measured geometry by 1.25 in both axes, without page overflow. |
| Pan and Fit | A PCB pointer drag moved the board 60 px horizontally and 20 px vertically. Fit restored centered 100% zoom. |
| Schematic alignment | Before correction, the measured resistor terminal offset was approximately 5.18 px horizontally and 0.62 px vertically. After correction, symbol/endpoint centers agreed within 0.0001 px at 100% and 125%. |
| Schematic drag/history | At 125%, R1 moved from display coordinates (260, 90) to the snapped (288, 96). Undo restored (260, 90), Redo restored (288, 96), and a final Undo restored the fixture. |
| PCB keyboard/history | A 0.5 mm R1 nudge moved the first pad x coordinate 17 → 17.5; Undo/Redo/Undo returned 17 → 17.5 → 17. Export after Redo parsed through the actual native parser, with nets/vias preserved and only the corresponding attached route anchors moved. |
| PCB pointer/history | At underlying zoom 1.5625 (displayed 156%), a 30 px drag snapped the R1 pad x coordinate 17 → 19 mm. Undo/Redo/Undo passed. |
| Board waypoint | At 125%, B.Cu routing from stored via `@via:J1-A4` accepted a click at the board center. The draft ended at world (340, 150), corresponding to board (21, 10) mm. Escape removed the draft; no new route was committed. |
| Localization/responsiveness | Eight Fit cases: English, German, Yoruba and Pidgin × 320/1280 px. Fit returned 100%, retained the translated accessible name and caused no page overflow. |
| Browser health | No new captured console errors after the final fixes. All geometry edits were undone, drafts canceled, English restored and temporary viewport overrides reset. |
| Automated checks | 393/393 tests passed, plus syntax and library validation. New tests execute the actual camera UI, waypoint and history handlers, exercise coordinate conversion/limits, and parse a fractional physical move through native serialization. |

The first full suite found one additional legacy expectation for fractional display coordinates in `tests/core.test.mjs`. It was corrected to the schema-valid rounded display position; the physical pad/route assertions were preserved. The subsequent full suite passed. Library validation still reports 15 candidates, 565 taxonomy types and zero verified parts; this milestone adds no verified parts.

## Reproduction and limits

1. Run `npm run dev -- --port=4177` and load example 125, USB-C USB 2.0 breakout. Use Zoom, Pan and Fit in each view; inspect schematic terminal alignment.
2. In PCB Select mode, move R1 with an arrow key or pointer, then Undo/Redo and export the native document. Physical nets remain unchanged; moving copper can still create clearance failures and requires PCB checks before fabrication export.
3. In B.Cu Route mode, activate via J1-A4, click empty board space and press Escape. A draft waypoint appears and cancels without committing a route.
4. Run `npm test`, `npm run check` and `npm run validate:library`. PR #505 records the final commit identity and matching-head CI.

Fit means the fixed workspace extent, not dynamic bounds of arbitrary outlying components. Wheel/pinch zoom, keyboard pan, minimap camera behavior, real touch, additional browsers and assistive technologies remain unaccepted. This fixture does not establish physical breadboard mapping or manufacturing validity. Production promotion remains subject to `DEPLOYMENT_RUNBOOK.md` and `DELIVERY_GATES.md`.

Temporary QA logs are outside the repository. Native QA exports in Downloads, including the pre-fix invalid snapshot, are preserved and excluded from the commit. No secrets, caches or unrelated project files are included.
