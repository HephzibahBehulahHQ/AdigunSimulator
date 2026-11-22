# 070 — STM32 timer PWM LED load

The ST NUCLEO-G031K8 drives an external red LED through a 330 Ω resistor. PA0, on CN4 pin 12, uses AF2 for TIM2 channel 1. The ideal model uses a 64 MHz timer clock, PSC 63, ARR 999, and CCR1 499, giving 1 kHz and 49.9% duty. The scope displays the modeled PA0 waveform. [STM32G031 datasheet](https://www.st.com/resource/en/datasheet/stm32g031k8.pdf).

| Reference | Assembly |
| --- | --- |
| J1 | Regulated 3.3 V and common return |
| U1 | ST NUCLEO-G031K8, MB1455 |
| R1 | Vishay MRS25 330 Ω through-hole resistor |
| D1 | Lite-On red 5 mm LED, anode toward R1 |

CN4 pin 2 is ground, pin 12 is PA0, and pin 14 is +3V3. On the BB400, align CN3 with row E and CN4 with row I. The 65 × 37 mm carrier PCB fits the two 15-pin Nucleo headers at 2.54 mm pitch with 15.24 mm row spacing. Fit two Samtec SSQ-115-01-T-S receptacles. The other 27 mating positions have no carrier nets. The native project stores the physical mappings and generates educational copper, outline, drill and BOM output. [ST board manual](https://www.st.com/resource/en/user_manual/um2591-.pdf), [Samtec sockets](https://www.samtec.com/products/ssq-115-01-t-s).

Program the board over its ST-LINK USB connection before switching power modes. Disconnect USB for the external 3.3 V wiring shown in the project. For that mode, follow the board-revision instructions in UM2591 §6.4.2 and §6.7, including opening SB2 and SB3. ST documents SB11 as the regulator-output disconnect. The ST-LINK is unpowered in external 3.3 V mode. [ST board manual](https://www.st.com/resource/en/user_manual/um2591-.pdf).

The [Arduino sketch](../070-stm32-timer-pwm/070-stm32-timer-pwm.ino) configures TIM2 from the timer clock reported by STM32duino. It divides to a 1 MHz timebase and uses 1000 counts per frame with 499 high counts. The model estimates LED current from fixed forward voltage and resistance. Physical GPIO drive, PWM timing, LED current and manufacturing suitability require bench verification.
