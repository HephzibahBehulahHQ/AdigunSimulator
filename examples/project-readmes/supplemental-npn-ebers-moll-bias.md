# Supplemental — Generic NPN bias using Ebers–Moll

## Purpose

Run a generic common-emitter DC operating point with the selectable bounded nonlinear MNA/Newton solver. The example is explicitly supplemental to the 200-entry acceptance catalogue.

## Circuit

| Reference | Library ID | Value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| RB | `passive.resistor` | 220 kΩ |
| RC | `passive.resistor` | 1 kΩ |
| Q1 | `active.npn-ebers-moll-generic` | Is=1e-14 A; alphaF=0.99; alphaR=0.5 |
| GND | `ground.signal` | 0 V |

The native project stores the exact VCC, BASE, COLLECTOR, and GND connections and selects nonlinear DC at 25 °C for Automatic analysis. It has no physical breadboard hole map or fabricated PCB mapping.

## Acceptance

- Solver: `adigun-nonlinear-dc-mna` 1.1.0.
- Expected operating point: VBE about 0.668 V, base current about 19.69 µA, collector current about 1.949 mA, and collector voltage about 3.051 V.
- Expected normalized nonlinear KCL/constraint residual below 1e-8 and power balance magnitude below 1e-7 W.
- Values are results of the generic ideal Ebers–Moll equations; they are not measured, manufacturer-specific, or hardware-qualified.

## Model limits

The model omits high injection, Early effect, base and collector resistance, secondary breakdown, junction capacitance, temperature-dependent saturation current, and self-heating. It is not general SPICE. Confirm the model disclosures before applying the circuit to hardware.
