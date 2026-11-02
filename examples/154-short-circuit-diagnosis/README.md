# Example 154 — Short-circuit diagnosis

## Fixture
The example intentionally joins a DC source positive and return terminal on net SHORT. The preflight detects this same-net condition and blocks before circuit simulation.

## Expected behavior
The application identifies the source and net, selects the net for inspection, and suggests separating the rails and tracing the wiring. No simulated current or power result is generated.

## Limits
This bounded check detects a direct same-net source short only. It does not cover indirect fault paths, current limiting, fuse behavior, overcurrent protection, thermal effects, or physical safety. Do not energize hardware based only on this check.

## Direct circuit result

The base 5 V, 330 Ω, 2 V LED topology has an ideal estimated current of 9.09 mA and resistor dissipation of 27.27 mW. The short-circuit guard is a separate diagnostic for altered or invalid wiring.

## Run and verify
Open the example and select **Run**. Automated acceptance is in `tests/core.test.mjs` under “catalogue short-circuit fixture blocks before simulation with no fabricated current”.
