# Example 150 — Monte Carlo resistor tolerance plan

## Goal
Use a reproducible seeded sample to estimate how a uniform ±5% resistance tolerance changes LED current.

## Model
The analyzer samples 1,000 resistor values uniformly from 313.5 Ω to 346.5 Ω using seed 20261031. Each trial reruns the application's bounded analytical DC LED current model. The report shows min/max, mean, median, population standard deviation, and a 10-bin histogram. The same seed and inputs produce identical results.

## Limits
Only the series resistor tolerance is sampled. LED forward drop remains ideal and fixed; temperature, aging, capacitor tolerance, device spread, manufacturing yield, transients, and thermal limits are outside this model. This is educational, not production qualification.

## Direct circuit result

At nominal 5 V, 330 Ω, and 2 V LED forward drop, the bounded DC analyzer estimates 9.09 mA LED current and 27.27 mW resistor dissipation. The Monte Carlo plan explores tolerance variation around that nominal case.

## Run and verify
Open the example and select **Run**. Automated acceptance is in `tests/core.test.mjs` under “catalogue Monte Carlo tolerance study is seeded, reproducible, and bounded”.
