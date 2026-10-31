# 128 — Low-voltage LM386 audio amplifier PCB

This educational 9 V design uses a TI LM386N-1 class-AB amplifier, audio input header, output coupling capacitor, speaker terminal, supply decoupling, gain-setting capacitor and output Zobel network. The PCB is a generic single-layer through-hole/SMD template for topology and export checks.

The project runs a bounded topology check, PCB DRC, BOM and placement export, plus an explicit grounding/routing review checklist. The review confirms the declared ground return, star point, LM386 pin mapping, local supply bypass, class widths and speaker/Zobel connections.

**Limitations:** the app does not simulate audio gain, frequency response, clipping, THD, thermal behavior, speaker power, listening quality, EMC, production tolerances, or manufacturing readiness. Footprints and routes are educational templates; verify the exact datasheets, footprints, clearances, grounding and fabrication rules before building. The DRC is bounded and is not an independent manufacturing sign-off.

Manufacturer reference: [Texas Instruments LM386 datasheet](https://www.ti.com/lit/ds/symlink/lm386.pdf), Rev. D, August 2023.
