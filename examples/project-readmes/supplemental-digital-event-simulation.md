# Two-input AND digital event simulation

This supplemental native project demonstrates the bounded ideal digital event engine with a wired two-input AND gate, two DC sources used as digital inputs, one shared 5 V gate supply, and three ideal non-loading logic probes.

## Run

1. Open the project in AdigunSimulator.
2. Choose **Digital event simulation** in Simulation Control.
3. Review the 400 ns stop time, input events, and selected A, B, and Y probe nets.
4. Run the analysis and compare the transition table with the expected sequence below.

| Time | A | B | Y = A AND B |
|---:|---:|---:|---:|
| 0 ns | 0 | 0 | 0 |
| 100 ns | 1 | 0 | 0 |
| 200 ns | 1 | 1 | 1 |
| 300 ns | 0 | 1 | 0 |

## Model boundary

This is a deterministic, zero-delay model of ideal AND logic and ideal DC logic inputs. Simultaneous changes are applied atomically. It does not model propagation delay, glitches, metastability, loading, noise, a logic family, firmware, sequential logic, or physical device limits. This supplemental example is planned until repository CI records its acceptance evidence.
