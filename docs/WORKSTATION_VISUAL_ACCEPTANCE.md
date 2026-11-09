# Workstation layout and schematic alignment — 2026-11-09

The three mandatory reference PNGs remain the visual acceptance target. This change corrects the oversized shell and obscured work area observed in the production comparison; it does not establish final visual acceptance.

The owner subsequently supplied the sidebar, interaction and live-property requirements. Sidebar reopening and pointer-click selection fixes are included in this checkpoint; see `INTERACTION_DELIVERY.md` for completed evidence and remaining stages.

- The official corporate logo remains unchanged. Product identity, menus and compact account/language controls share a compact header; project commands and the example picker occupy the next row.
- At desktop widths above 1120 px and heights of at least 700 px, library, inspector, canvas and output fit within the viewport. Library, inspector and diagnostics scroll independently. Smaller screens retain normal page flow and bounded inspector/BOT content.
- The starter library is grouped into keyboard-accessible category disclosures with actual component symbols, search and category filters. Component selection still exposes values/model details and enables the existing Add operation. Manufacturer evidence remains a separate mode.
- Adigun BOT starts minimized and expands inside the inspector rail, with accessible expanded state and its own scrolling content. It no longer covers the drawing, properties or simulation output.
- The miniature schematic now shares one 680 × 300 transform for symbols and wires. The STM32 timer behavior block has sufficient space for its three named pins; native identities, pin names, values and connectivity are unchanged. It remains labelled as an ideal model, not a physical STM32 package or firmware simulation. Selected symbol outlines no longer shift the connection geometry.

## Observed browser evidence

At 1586 × 992, the desktop document fits the viewport, with canvas, simulation results and footer visible together. Expanded BOT stays inside the inspector. English, German, Yoruba and Pidgin × 1280/375 px × three views passed 24 layout checks: no horizontal page overflow, header-control collisions or desktop output clipping. Six mobile menus × four locales passed 24 popup-bound checks and Escape dismissal.

All three timer pin stubs coincide with their wire terminals in both main and miniature schematics within 0.001 rendered pixels. Search/selection enables Add, category disclosures operate by keyboard, BOT expanded state changes correctly, and no browser console errors were observed. Temporary viewport override was reset. Automated evidence and the exact GitHub release are recorded in the corresponding PR.

## Still required

The PWM example still lacks native PCB footprint/pad/route data and its breadboard lacks a controller body. Board/package detail, secondary diagram composition, remaining reference typography and the broader master-spec engineering/verification requirements remain open. This release must not be described as matching all three target images.
