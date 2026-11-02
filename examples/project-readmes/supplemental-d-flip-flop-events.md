# Positive-edge D flip-flop event simulation

This supplemental native project runs the ideal positive-edge D flip-flop through the digital event engine. The initial Q state is explicit, and the schematic connects PRE and CLR to VCC so both asynchronous controls remain inactive-high.

## Run

1. Open the project in AdigunSimulator and choose **Digital event simulation**.
2. Review `{"U1":false}` under Initial D flip-flop states.
3. Review the D and CLK transitions and selected D, CLK, Q, and QBAR probes.
4. Run the analysis and compare the trace with the expected transitions.

| Time | D | CLK | Q | QBAR |
|---:|---:|---:|---:|---:|
| 0 ns | 0 | 0 | 0 | 1 |
| 100 ns | 1 | 0 | 0 | 1 |
| 200 ns | 1 | 1 | 1 | 0 |
| 250 ns | 0 | 1 | 1 | 0 |
| 300 ns | 0 | 0 | 1 | 0 |
| 350 ns | 0 | 1 | 0 | 1 |

## Model boundary

This is a zero-delay positive-edge state model with an explicit initial Q value. It requires preset and clear to remain inactive-high. It does not model asynchronous controls, setup/hold time, propagation delay, metastability, loading, or device-specific timing. This supplemental example remains planned until repository CI records its acceptance evidence.
