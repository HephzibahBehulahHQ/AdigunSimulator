# 130 — Four-layer STM32G031K8 MCU board plan

This board plan uses the ST STM32G031K8T6 in LQFP32, a four-pin SWD header, a 100 nF local VDD/VDDA bypass, a 4.7 µF bulk capacitor, and a reset pull-up/filter option. It maps all 32 package pads and explicitly checks VDD/VDDA pin 4 and VSS/VSSA pin 5.

## Planned stack-up

1. F.Cu: components and short local signals, referenced to In1.Cu.
2. In1.Cu: continuous solid GND reference plane.
3. In2.Cu: VDD33 distribution and low-speed signals.
4. B.Cu: secondary signals, referenced to In1.Cu.

Keep the return plane continuous under signal paths. Avoid plane splits under fast or SWD signals. If a signal changes layers, plan a nearby ground stitching via. This entry checks the stated stack-up, required power pins, decouplers, and SWD assignments.

**Limitations:** this is a layer and connectivity plan. The current exporter supports single-layer F.Cu boards, so this fixture has no completed routing or manufacturing DRC. Firmware, signal/power integrity, EMC, thermal behavior, and manufacturing readiness are not simulated or qualified. Check the chosen package land pattern and every pin against the latest device documentation before layout.

Manufacturer reference: [ST STM32G031x4/x6/x8 datasheet](https://www.st.com/resource/en/datasheet/stm32g031k8.pdf), DS12992.
