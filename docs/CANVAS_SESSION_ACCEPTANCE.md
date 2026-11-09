# Empty canvas and unsaved work — 2026-11-09

## Behavior and migration

- App startup creates an empty native project. It does not read a previous job, recovery draft or starter example into the canvas. A generic blank breadboard background is still shown.
- New Project and File → Close Project share the session reset. Both skip confirmation when clean; dirty projects open a localized modal with Keep editing focused. Escape cancels. Canvas shortcuts do not act behind the modal.
- Reset clears components/nets/stored board data, selection, undo/redo, zoom/pan, tools, drawing drafts, output and validation, project association and BOT project goal. It cancels an active simulation and invalidates pending imports/example results. The UI locale is retained for an in-app reset.
- Imports and explicit example loads are unsaved. Existing editor mutations continue marking the working copy dirty. Only a successful local Save or native project export clears that flag; BOM, report and fabrication exports are partial artifacts and do not save the native project.
- Save retains the existing single browser-local slot, `adigun-simulator.project.v1`. File → Open saved project explicitly reads and validates that slot. File → Open continues importing native JSON. No saved-project collection or account service is introduced.
- Native export is considered successful when its download is handed to the browser. The web page cannot determine whether a user later cancels the browser download or whether the filesystem write succeeds; the UI log tells the user to check Downloads. Synchronous export or storage failures leave work dirty.
- `beforeunload` prevents navigation and assigns `returnValue` only when dirty. It never deletes data. `pagehide` clears the legacy transient recovery key and invalidates pending work after actual departure. No cleanup runs on an ordinary hidden-tab visibility change. A BFCache restoration resets to an empty session.
- The app no longer writes recovery snapshots. Legacy `adigun-simulator.recovery.v1` is cleared on boot, reset/save and actual departure. Manual saves and unrelated preferences are preserved. There are no app-owned IndexedDB, sessionStorage or persisted current-project-ID keys to clear; the loaded project association is in memory.
- Lifecycle installation returns an explicit disposer; listeners are removed on non-BFCache departure. The app also disconnects its canvas observer on departure. The optional storage recovery example remains an isolated, explicitly loaded test fixture, and its displayed explanation now says so.

## Verification

The full local suite passed **422/422** tests; syntax, library validation and whitespace checks passed. Automated tests execute the session controller and actual Save/export/import/keyboard handlers. They cover dirty versus clean unload, cancellation without cleanup, confirmed departure, BFCache, repeated empty reset, history/camera/selection/draft clearing, active-worker cancellation, inaccessible storage, preserved manual saves/preferences, stale loads after edits/save/reset/reopen, modal cancellation, and failed Save/export. Existing component, wire, footprint/via and history regressions remain part of the full suite.

Browser checks in the local preview passed:

1. Empty startup showed no placed component nodes and 100% zoom.
2. Explicit STM32 example load became dirty. New → Keep editing retained its components and 125% zoom; New → Discard cleared them, restored 100%, cleared the example choice and emptied Undo. A second clean New skipped confirmation.
3. USB-C example 125 imported through the native file chooser became dirty. Local Save showed Saved locally. Refresh returned immediately to an empty canvas; File → Open saved project restored four footprints and ten vias with clean status.
4. Modal layout and Escape cancellation passed at 1280 × 800 and 375 × 800 in English, German, Yoruba and Pidgin. Dialogs fit the viewport, buttons did not overlap and Keep editing received focus.
5. Native export downloaded `usb-c-usb-2-0-breakout.adigun (5).json`, showed Project exported and allowed clean Close Project without confirmation. The downloaded document passed native parsing.
6. Closing the clean tab and opening the preview again started empty; explicit reopening still found the saved project. Clean New returned to an empty project. No new captured console errors were observed. The temporary browser viewport override was reset.

The Save test used a separate localhost origin after its Open saved project command confirmed that no previous save existed; the prior 127.0.0.1-origin saved project was not overwritten. QA downloads and logs are kept outside the repository and excluded from commits.

## Remaining acceptance and release limits

The automation did not expose a native `beforeunload` dialog. Two dirty-refresh attempts retained the current project rather than navigating. The handler's dirty-only behavior and cancellation/departure ordering are verified in event tests, but native prompt display, Leave confirmation and dirty-tab closure still need representative real-browser acceptance. Mobile process termination may not deliver unload/pagehide; boot remains empty regardless because there is no hydration.

This checkpoint does not establish zero defects, full browser/accessibility acceptance or whole-product completion. PR #505 remains draft pending the documented electrical/release review and protected deployment gates; no production deployment is claimed. Matching-head CI and synchronization evidence are recorded on the PR.
