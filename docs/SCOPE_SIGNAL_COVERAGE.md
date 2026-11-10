# Oscilloscope signal coverage correction

The LED current limiter is DC: its source is 5 V and its LED anode is 2 V in the existing fixed-drop model. A horizontal trace is the expected result, not an oscillation. The floating scope now explains this in all four interface languages.

The unconfigured RC step, RL step and switched RC examples already computed first-order results but had no scope recording adapter. Their successful model is now evaluated at 501 display timestamps over the existing result duration. Original checkpoints, initial conditions and native pin/net identities are preserved. These remain ideal analytical curves, not general SPICE or measured hardware waveforms. The explicit linear RLC solver is unchanged.

The scope distinguishes not-yet-run, stopped, failed and completed calculations without a voltage recording. Failed calculations include their actual reason; unsupported models do not receive fabricated waveforms. Whole-viewport dragging and native save/load flows are unchanged.

Validation: targeted tests cover LED VCC/LED_A/GND constant traces, original RC/RL numerical checkpoints, discharge initial conditions and switch common, rejected net mappings, stale/blocked calculations, scope playback and four-language explanations. Release and browser evidence is recorded in the pull request.
