# Responsive workspace acceptance — 2026-11-09

## Scope and observed failures

This is a bounded browser acceptance record for product milestones 1 and 8, using the local application and the USB-C USB 2.0 breakout project. It is not a full visual-reference, accessibility, electrical or production release sign-off.

Before the fixes, the 1280 px workspace had horizontal overflow, narrow inspector selects clipped their content, mobile category rows hid library access, and route instructions stretched the toolbar into a narrow text column. The mobile Help popup extended to about 428 px in a 305 px client area and was clipped by its menu container. At a nominal 320 px viewport, a fixed 320 px body minimum also overflowed the space left by the vertical scrollbar. Hidden mobile labels left tabs and tools with glyph-only accessible names. Reconciliation messages covered the drawing, and a CSS-generated PCB caption incorrectly called stored routed copper "unrouted".

The toolbar now wraps controls and gives instructions a separate full-width row. Inspector fields and component rows stay within their panels. Mobile library content scrolls vertically, with a separate horizontal category strip. Menus fit within the command region, open exclusively and close with Escape while returning focus to their summary. Canvas capability notices and expandable mapping warnings live above the drawing. Tabs and tools retain translated accessible names when visual labels are hidden.

Browser work also exposed an asynchronous starter-loader race. A starter result could arrive after the user chose a different example. The loader now rechecks interaction, unsaved edits, saved-project presence, project identity and picker selection after the worker completes before replacing anything.

## Evidence

| Check | Observed result |
| --- | --- |
| Three-view shell layout | 60 cases: English, German, Yoruba and Pidgin × 320, 390, 768, 1024 and 1440 px × breadboard, schematic and PCB. No page overflow, header/tool overlap, tool clipping, inspector clipping or unnamed compact toolbar buttons in those checks. |
| Mobile menus | 24 cases: six menus × four locales at 320 px. Exactly one open menu, popup inside the client width, no clipping ancestor and no page overflow. Help → Implementation status opened its dialog; Close returned to the workspace. |
| Expanded search | 12 cases: four locales × 320, 1024 and 1440 px. Header/tool bounds passed; Escape closed search and returned focus to its button. |
| Component library | 20 cases: four locales × the five widths. Panel and list stayed within their horizontal bounds. Mobile search for STM32 returned two matching entries; clearing it restored the list. Category and library scroll regions remained accessible. |
| Keyboard controls | Enter expanded the mapping disclosure without covering the drawing. Enter on `@via:J1-A4` in B.Cu routing selected the VBUS endpoint; Escape exited routing. No route was committed by this test. |
| Guest indicator | Guest state, gray dot (`rgb(137, 148, 163)`) and "Account · Guest (sign-in unavailable)" tooltip were observed. Signed-in behavior was not tested; authentication is not enabled. |
| Browser health | No captured console errors during these checks. Desktop and mobile screenshots were inspected; the temporary viewport override was reset, with an additional passing check at the default 1280 px width. |
| Automated regressions | 384/384 tests passed, plus syntax and library validation. New execution tests cover delayed starter completion, review-disclosure escaping/state, and menu Escape/focus behavior; compact control localization is covered by the UI contract. |

The first full run exposed an old source-contract assertion that required the misleading CSS PCB caption. It now requires DOM-based preview disclosures and rejects that generated caption. The test name no longer claims a source-text check establishes visual-reference acceptance. The corrected targeted check and subsequent full suite passed.

## Reproduction and remaining work

1. Run `npm run dev -- --port=4177` and load the USB-C USB 2.0 breakout example. Inspect all three views at the widths/locales above, including expanded search and each menu.
2. Use Enter/Escape on the mapping disclosure, menus and a plated via in B.Cu routing. Check that the route-start hint appears, Escape cancels, and notices remain outside the drawing.
3. Run `npm test`, `npm run check` and `npm run validate:library`. Consult PR #505 for the pushed commit and matching GitHub Actions result.

Remaining acceptance includes real touch gestures, additional browsers and assistive technologies, broader project edit/import/export/recovery workflows, complete reference-image comparison and independent electrical/release review. These checks do not establish physical breadboard mapping for this USB-C fixture or manufacturing validity. The current example picker is a load choice and can differ from a recovered project's identity; recovery-selection presentation needs a separate follow-up. No new production deployment is claimed. QA logs remain outside the repository and are excluded from the commit.
