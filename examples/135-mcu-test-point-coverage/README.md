# 135 — STM32 MCU board test-point coverage

The fixture extends the STM32G031 four-layer planning board with five top-side SMD test pads mapped to VDD33, GND, NRST, SWDIO and SWCLK. The report checks the required-net map, matching native net endpoints, F.Cu placement, minimum pad size, separation and clearance from other declared pads.

Coverage is netlist and declared-layout metadata only. The board plan has no routed copper geometry, so the checker cannot prove electrical continuity, probe contact after assembly, test-fixture access, signal integrity or manufacturing qualification.
