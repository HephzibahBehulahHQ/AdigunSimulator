# Example 173 — Automatic night light

## Objective
Switch a logical LED output based on synthetic illuminance samples and a configured lux threshold.

## Run and expected result
With a 20 lux threshold, samples [0, 5, 19, 20, 1000, 18] produce [on, on, on, off, off, on]. Values below 20 lux are treated as dark; the threshold itself is off.

## Scope
Synthetic lux values and a Boolean LED command only. No LDR response, spectral behavior, sensor placement, comparator electronics, real light output, or dimming circuit is modeled.
