# 001 — LED current limiter

## Purpose

Estimate current and resistor dissipation for a low-voltage red LED load. The native project uses the application's generic educational library models.

## Bill of materials

| Reference | Generic model | Project value |
|---|---|---|
| V1 | Ideal DC source | 5 V |
| R1 | Resistor | 330 Ω |
| D1 | Red LED with fixed forward-drop model | 2.0 V |
| GND | Signal ground | 0 V |

These are model descriptions, not manufacturer-qualified orderable part numbers.

## Connections

- V1 positive → R1 pin 1 (`VCC`)
- R1 pin 2 → D1 anode (`LED_A`)
- D1 cathode → V1 negative and signal ground (`GND`)

The breadboard positions and jumper data are stored in the native project. The schematic and PCB views use the same component identities and nets. This project has no stored PCB copper, footprint assignment, or manufacturing geometry.

## Expected analytical result

The bounded DC model uses a constant LED forward drop:

- Current: `(5 V − 2 V) / 330 Ω = 9.09 mA`
- Resistor dissipation: `I² × 330 Ω ≈ 27.27 mW`
- LED model state: on

The stable acceptance test is `core-led-current-limiter`. CI checks that the result exactly matches the result record in `examples/manifest.json`.

## Model limitations and safety

This is an ideal educational estimate. It does not model LED I–V curves, source impedance, resistor tolerance, temperature, optical output, transient behavior, component ratings, or firmware. Select real parts from manufacturer datasheets and review their operating conditions before building hardware. The result is not a thermal, safety, or regulatory approval.
