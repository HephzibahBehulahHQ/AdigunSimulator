# Example 159 — Simulation report export

## Goal
Run the known first-order 5 V RC step-response circuit and export its report as JSON.

## Report contents
The file records project identity, component values, net endpoints, analysis settings, engine/model version, the full computed response, warnings, and model limitations. Reports use the application’s bounded analytical model and carry an explicit schema version and generation timestamp.

## Run and verify
Open the example and select **Run**. The **Export Report** button becomes available after a successful analysis. Download the JSON and verify it identifies `first-order-rc-step-v1`, includes RC response samples and warnings, and records the 1 kΩ resistor and 100 µF capacitor.

## Limits
The report documents this supported analytical model; it is not a general SPICE output, manufacturer validation, or safety certification.
