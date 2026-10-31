# Example 011 — RC charge and discharge

## Purpose

Show the ideal first-order voltage response of a 100 µF capacitor through a 1 kΩ resistor when an SPDT switch selects a 5 V charge path or a ground discharge path.

## Topology

```text
V1 +5 V ── SW1 A
             SW1 COM ── R1 1 kΩ ── C1 100 µF ── GND
GND ────── SW1 B
V1 negative ──────────────────────────────────── GND
```

The switch part uses three separate net pins. Select **Charge (A)** to connect COM to A, or **Discharge (B)** to connect COM to B. Change SW1's component value in the Properties panel, apply it, then run the calculation. Each run calculates one selected mode.

## Generic model BOM

| Ref | Generic model | Value | Model scope |
|---|---|---:|---|
| V1 | Ideal DC voltage source | 5 V | Fixed ideal source |
| SW1 | Ideal SPDT switch | Charge (A) / Discharge (B) | Selects one throw; contact resistance and bounce omitted |
| R1 | Ideal resistor | 1 kΩ | No tolerance or power rating modeled |
| C1 | Ideal capacitor | 100 µF | No leakage, ESR, dielectric, or voltage rating modeled |
| GND | Signal reference | 0 V | Solver reference only |

These are generic simulation models, not manufacturer part numbers or a purchasing BOM. The example does not include a verified hole-by-hole breadboard placement or PCB footprint and is not ready to manufacture or energize.

## Expected results

The time constant is **τ = R × C = 0.1 s**. Samples are evaluated at 0, 1, 3, and 5 time constants.

| Mode | Capacitor initial condition | Capacitor voltage at 1τ | Current magnitude at 1τ |
|---|---:|---:|---:|
| Charge (A) | 0 V | 3.160602794 V (63.2121% of 5 V) | 1.839397 mA |
| Discharge (B) | 5 V, assumed previously charged | 1.839397206 V (36.7879% remains) | 1.839397 mA |

The discharge run assumes the capacitor was charged to the 5 V source before the switch moved. The engine does not simulate switch movement or carry capacitor state between separate runs.

## Acceptance test

Run `npm test`. The test checks the charge and discharge equations at 1τ, the supported topology, invalid switch state handling, broken wiring, and time-constant underflow rejection.

## Safety and limitations

Educational ideal low-voltage calculations only. The generic values do not establish physical component ratings, tolerances, wiring, thermal behavior, or compliance. Review real component datasheets and independently verify any hardware before use.
