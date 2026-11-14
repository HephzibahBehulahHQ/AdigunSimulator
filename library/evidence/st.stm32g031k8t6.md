# STMicroelectronics STM32G031K8T6 evidence record

Review state: candidate; not verified  
Evidence checked: 2026-11-14

## Primary manufacturer sources

- [STM32G031K8 product page](https://www.st.com/en/microcontrollers-microprocessors/stm32g031k8.html)
- [STM32G031x4/x6/x8 datasheet, DS12992 Rev. 4](https://www.st.com/resource/en/datasheet/stm32g031k8.pdf)

The selected order code is STM32G031K8T6. ST identifies the STM32G031K8 in LQFP32. This record covers the MCU silicon only. It does not describe a NUCLEO-G031K8 board, module headers, onboard regulator, debugger, or board-to-header mapping.

For the LQFP32 device, ST's Port A alternate-function table maps PA0 to TIM2_CH1_ETR on AF2. The datasheet sets the AHB and APB domain clocks to a maximum of 64 MHz. The ideal timer example uses that 64 MHz input with prescaler 63, auto-reload 999, and compare 499 to calculate 1 kHz at 49.9% duty. The simulator does not configure or execute the device clock tree or firmware.

The example `070-stm32-timer-pwm.adigun.json` uses `active.stm32-timer-ideal`, an ideal three-pin behavioral component. That example is not evidence of an STM32G031 pin-level or electrical model.

## Verification still required

- Retrieve canonical datasheet bytes and record a reproducible SHA-256 checksum.
- Transcribe and independently check the remaining 31 pin numbers, alternate functions, and electrical roles against the datasheet; only PA0's alternate-function mapping is currently recorded.
- Create separately licensed schematic and LQFP32 footprint assets with reviewed pin and pad maps.
- Record voltage, clock, memory, package dimensions, thermal limits, and safe-use notes from primary sources.
- Keep the device-level model explicitly unimplemented until source, rights, fixtures, and accuracy limits are reviewed.
- Obtain an independent human review before changing the verification status.

The ST datasheet download timed out during this evidence pass. No checksum or full pin map is claimed. The record remains a candidate and is excluded from the verified-part count.
