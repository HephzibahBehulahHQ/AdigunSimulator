# Damped series RLC pulse response

## Goal

Simulate a 5 V step through 10 Ω, 10 mH and 100 µF in series, plot capacitor voltage, and report underdamped ringing and sample resolution.

## Run

Open the example and select Run. The dashboard shows the transient curve, damping ratio, peak voltage, damped frequency, and any timestep-resolution warning.

## Acceptance

Automated checks verify underdamped ringing, overshoot, a dense no-warning trace, a coarse-step warning, and blocking when the series topology is broken.

## Limits

This is a closed-form ideal RLC step model, not a general SPICE engine. Component tolerance, source resistance, parasitics, saturation and protection are not modeled. The timestep warning describes plotting resolution, not numerical solver stability.
