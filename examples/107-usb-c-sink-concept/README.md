# Example 107 — USB-C sink profile concept

## Objective
Select a supported fixed USB-C Power Delivery profile from a source fixture, respect the sink voltage/current limits, estimate a resistive load, and fall back to the 5 V default when the preferred profile is unavailable.

## Circuit and model
The source fixture offers 5 V, 9 V, and 12 V. The sink prefers 12 V, allows up to 20 V and 1.5 A, and drives a 10 Ω illustrative load. The control rail only powers the analytical model.

## Acceptance cases
- Offered 12 V profile is selected: 12 V, 1.2 A, 14.4 W.
- Preferred 15 V profile is absent: fallback state selects 5 V, 0.5 A, 2.5 W.
- An open CC fault reports the 5 V default only and makes no PD contract.
- Invalid profile sets, missing CC wiring, broken load path, or a load above the current limit block the result.

## Boundaries and safety
This educational policy estimator does not implement USB-PD signaling, cable/e-marker behavior, timing, protection circuits, or standards compliance. It is not a charger, power adapter, or hardware qualification. Do not connect real USB-C equipment based on this model.
