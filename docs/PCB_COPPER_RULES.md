# Bounded copper checks and plated vias

The PCB exporter now rejects same-layer trace crossings and insufficient trace-to-pad or trace-to-trace clearance. No-connect pads remain physical obstacles. Distance checks use round traces, circular through-hole pads and axis-aligned rectangular top-side SMD pads. Different copper layers are electrically separate except where a plated pad or via joins them.

## Rules

- Required spacing is the maximum of board clearance, the two nets' class clearances and their explicit class-pair rule. Rules apply symmetrically to that pair; an unrelated class rule does not affect it.
- Existing `id`, `clearanceMm`, `traceWidthMm` class fields and editor `name`, `minimumClearanceMm`, `minimumWidthMm` fields are supported. Edited routes retain their declared class ID.
- Export checks pad spacing, trace spacing, declared endpoint/net mappings, keep-outs and physical copper continuity. Covering all pads with separate islands is insufficient.
- Invalid geometry and a work estimate above 2,000,000 for `(segments + pads + vias)²` block export. This is a bounded check, not a general CAD kernel.
- Gerber/Excellon/BOM generation returns no files when validation fails.

## Stored vias

`pcbFabrication.vias` is an optional array. Each via has a unique `id`, a declared `netId`, and finite millimetre fields `xMm`, `yMm`, `diameterMm`, `drillMm`. Drill diameter must be positive and smaller than copper diameter. Copper must remain inside the board outline. At most 256 vias are supported; they span F.Cu and B.Cu on a declared two-layer board.

Vias are copper objects, not component instances or schematic pins. They are drawn on both copper Gerbers, included in the plated drill file and excluded from the BOM. Their routing endpoint is `@via:<id>`. The preview exposes each via as a labeled keyboard target. Enter/Space selects a pad or via while routing; Escape cancels routing. The UI can route to stored vias, but cannot yet create or reposition them.

Example 125 now uses ten 0.4 mm copper / 0.2 mm drill vias to route power and ground on B.Cu. Its signal/CC traces remain on F.Cu. Connector pad coordinates and component pin maps are unchanged. The other repaired examples retain their existing layer stacks, pad coordinates, native nets and declared trace widths.

## Evidence and limits

Regression tests cover crossing/touching/collinear geometry, rectangular pads, NC obstacles, layer separation, class-pair spacing, invalid/resource-heavy inputs, missing or invalid vias, separate copper islands, both-layer via output and drill count, and all nine repaired example exports. Existing numerical, pin-map, BOM, placement and export snapshot tests remain required. The buck review now checks every branch's width, and the audio review searches all ground branches for its declared reference point.

These checks do not verify exact manufacturer land patterns, annular-ring production limits, solder mask/paste, thermal/current capacity, impedance, high-speed behavior, regulatory isolation, assembly or fabrication readiness. Independent electrical and manufacturer review remain release requirements. General autorouting, blind/buried vias, bottom-side SMD pads and additional copper layers are unavailable.
