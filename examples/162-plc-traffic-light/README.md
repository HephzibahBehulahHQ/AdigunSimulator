# Example 162 — PLC traffic light

## Sequence
Two logical cycles use explicit startup, opposing green/yellow, and all-red transfer/boundary phases. The analyzer expands each phase into one-second state samples and blocks any phase that commands both approaches green.

## Run and verify
Select **Run**. Review the phase table, total duration, and conflict indicator. The test confirms 14 phases across two cycles, 100 seconds total, all-red startup, and zero simultaneous opposing greens.

## Limits
This concept does not model a physical controller, vehicle/pedestrian detectors, pedestrian timing, clearance engineering, local traffic code, field wiring, or safety certification.
