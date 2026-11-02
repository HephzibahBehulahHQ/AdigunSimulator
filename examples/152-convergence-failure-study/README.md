# Example 152 — Convergence failure study

## What it demonstrates
This fixture represents an intentionally difficult nonlinear diode loop that would require a SPICE operating-point solver. AdigunSimulator's bounded supported-analysis engine does not implement that solver, so the run is blocked with an explicit diagnostic and practical next steps.

## Expected output
- Solver unavailable / analysis not attempted.
- No fabricated iteration count, convergence state, node voltages, or circuit result.
- Suggested checks: use a SPICE-capable engine, inspect the diode model, add physically justified series resistance/current limiting, and check floating nodes, ideal-source conflicts, and DC paths.

## Direct circuit result

The base 5 V, 330 Ω, 2 V LED topology has a bounded DC analytical estimate of 9.09 mA and 27.27 mW resistor dissipation. The convergence study is a separate diagnostic, not a general SPICE solve.

## Run and verify
Open the example and select **Run**. Confirm the blocked state, actionable diagnostic, and empty result. Automated acceptance is in `tests/core.test.mjs` under “catalogue convergence study returns actionable limits without fabricating solver output”.
