# Oscilloscope trigger

## Goal

Capture an ideal 0–5 V PWM trace and lock the scope to the configured 2.5 V rising edge. The capture reports edge, threshold, trigger time, period, pulse width and sample metadata.

## Run

Open the example and select Run. The output dashboard displays trigger settings and trace metadata; the event log reports when the trigger locks.

## Acceptance

Tests check rising and falling edge times, threshold lock, 101 trace samples, and rejection of a threshold outside the signal range.

## Limits

This is an ideal rectangular pulse model. It does not model probe loading, analog bandwidth, edge slew, noise, aliasing, scope input limits or calibration.
