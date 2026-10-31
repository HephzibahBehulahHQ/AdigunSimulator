# Example 152 — Convergence failure study

## What it demonstrates
This fixture represents an intentionally difficult nonlinear diode loop that would require a SPICE operating-point solver. AdigunSimulator's bounded supported-analysis engine does not implement that solver, so the run is blocked with an explicit diagnostic and practical next steps.

## Expected output
- Solver unavailable / analysis not attempted.
- No fabricated iteration count, convergence state, node voltages, or circuit result.
- Suggested checks: use a SPICE-capable engine, inspect the diode model, add physically justified series resistance/current limiting, and check floating nodes, ideal-source conflicts, and DC paths.

## Run and verify
Open the example and select **Run**. Confirm the blocked state, actionable diagnostic, and empty result. Automated acceptance is in `tests/core.test.mjs` under “catalogue convergence study returns actionable limits without fabricating solver output”.
