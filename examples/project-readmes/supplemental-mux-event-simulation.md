# Four-to-one multiplexer event simulation

This planned supplemental project connects four ideal data inputs to the generic 4:1 multiplexer and changes both select lines over a 40 ns event timeline. Three ideal non-loading probes record S0, S1, and Y.

## Run

1. Open `examples/supplemental-mux-event-simulation.adigun.json`.
2. Choose **Digital event simulation** in Simulation Control.
3. Review the 40 ns stop time, four selector events, and S0, S1, and Y probes.
4. Run the analysis and compare the output trace with the expected transitions.

| Time | S1:S0 | Selected input | Y |
|---:|:---:|:---:|:---:|
| 0 ns | 00 | D0 = 0 | 0 |
| 10 ns | 01 | D1 = 1 | 1 |
| 20 ns | 11 | D3 = 1 | 1 |
| 30 ns | 10 | D2 = 0 | 0 |
| 40 ns | 00 | D0 = 0 | 0 |

## Model boundary

This is an ideal zero-delay multiplexer. It does not model propagation delay, glitches, metastability, electrical loading, device-specific thresholds, analog voltage waveforms, or a manufacturer-specific part. The example remains planned until its acceptance evidence is recorded in CI.
