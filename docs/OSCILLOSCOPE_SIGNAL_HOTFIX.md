# Oscilloscope signal and screen movement correction

2026-11-10. Supersedes the canvas-only movement boundary in `WIRE_PALETTE_SCOPE_ACCEPTANCE.md`, following the owner's explicit request to allow movement over menus and side panels.

The reported circuit was example 185, a 555 circuit whose Run action produces a PCB footprint-resolution report. That report had no voltage samples, so the former scope could only show its empty state. The workflow report remains available. A successful supported electrical calculation now accompanies relevant PCB workflow reports and supplies the scope.

The scope records actual output timing from successful existing ideal 555 astable/monostable and STM32 PWM calculations, using the model's period, duty, trigger state and connected supply. The output net is selected automatically. Records include both sides of ideal transitions, remain below 2,000 samples, and follow existing Run/Pause/Step/Stop playback. The window identifies these traces as **ideal output timing**, not measured hardware behavior. Saturation, startup, tolerances and physical edge dynamics remain outside those analytical models. Unsupported or blocked models do not receive an invented trace.

Movement and resizing now use the entire browser viewport. The scope can overlap headers, menus and side panels as requested; its close and drag controls remain onscreen. Opening it no longer scrolls the canvas or resets an already visible window. Mobile resize clamps it to the screen, not the central work area.

Verification: the exact reported example produced a 0–5 V waveform in the browser; pointer dragging moved its top-left to approximately (15, 28), above the menus; a 360 px viewport retained the window inside x=4…356. No browser console errors. Automated tests cover report preservation, actual sample/playback mapping, 555/STM32 period/duty/supply, monostable/unsupported cases and whole-screen boundaries. Final required-check and deployment evidence is recorded on the release PR.

The ongoing ladder/component-bank and optional canvas-animation changes are preserved separately and are excluded from this urgent release.
