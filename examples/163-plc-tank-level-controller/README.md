# Example 163 — PLC tank-level controller

## Objective
Exercise a two-threshold pump-command state model. The pump command starts at or below 30% and stops at or above 80%; it retains its previous state inside the hysteresis band.

## Run and expected result
Open `examples/163-plc-tank-level-controller.adigun.json` and run the deterministic analysis. Ten synthetic samples should produce eight pump-on samples: start at 20%, retain through 79%, stop at 80%, remain stopped through 35%, then start again at 29%.

## Scope
This is a PLC logic concept using synthetic inputs. The base electrical solver does not model the project and must report unsupported. No physical tank, sensor, pump, wiring, overflow/dry-run protection, PLC scan timing, or safety certification is represented.
