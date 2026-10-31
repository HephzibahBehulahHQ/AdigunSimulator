# Logic analyser capture

## Goal

Capture a four-bit synchronous counter on labelled Q0–Q3 channels, decode counts 0 through 15, and trigger on the first rising edge of Q1.

## Run

Open the example and select Run. The output dashboard reports trigger state, channel labels, sample count and decoded count sequence.

## Acceptance

Tests verify every decoded state, the exact Q1 edge trigger sample/time, a labelled state snapshot and rejection of an unknown trigger channel.

## Limits

The model samples ideal synchronous states. It does not model asynchronous metastability, real input thresholds, glitches, channel skew, analog noise, or hardware-specific logic analyser limits.
