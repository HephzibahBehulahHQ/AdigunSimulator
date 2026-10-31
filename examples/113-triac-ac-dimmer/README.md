# Example 113 — TRIAC AC dimmer concept

This bounded concept estimates how a symmetric phase angle changes a resistive lamp's RMS voltage and current. The 120 V RMS, 60 Hz source is a mathematical input. The fixture can vary firing angle and inject a zero-cross sync-loss fault.

## Expected behavior
- At 0° phase angle, the RMS factor is 1 (full conduction).
- At 90°, the RMS factor is approximately 0.707 for the ideal resistive waveform.
- At 120°, lamp RMS voltage is lower than at 90°.
- A sync-loss fault or disabled command inhibits firing and reports zero modeled lamp output.

This is a low-detail educational RMS estimator. It does not simulate AC switching waveforms, TRIAC latching/holding current, optotriac isolation, gate timing, snubbers, EMI, thermal behavior, mains clearances, fusing, physical terminal assignments, or hardware safety. The displayed AC voltage is conceptual and is not an instruction or approval for mains construction.
