# 049 — Traffic-light state machine

## Purpose

Cycle through north/south green, north/south yellow, all red, east/west green, east/west yellow, all red; test all lamp vectors and ensure opposing directions are never green simultaneously.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CLK | `power.dc-source` | 0 V |
| RESET_N | `power.dc-source` | 0 V |
| U1 | `active.atmega328p-traffic-demo` | ATmega328P-PU |
| R-NS_R | `passive.resistor` | 1 kΩ |
| R-NS_Y | `passive.resistor` | 1 kΩ |
| R-NS_G | `passive.resistor` | 1 kΩ |
| R-EW_R | `passive.resistor` | 1 kΩ |
| R-EW_Y | `passive.resistor` | 1 kΩ |
| R-EW_G | `passive.resistor` | 1 kΩ |
| LED-NS_R | `diode.led-red` | Vf 2 V |
| LED-NS_Y | `diode.led-yellow` | Vf 2 V |
| LED-NS_G | `diode.led-green` | Vf 2 V |
| LED-EW_R | `diode.led-red` | Vf 2 V |
| LED-EW_Y | `diode.led-yellow` | Vf 2 V |
| LED-EW_G | `diode.led-green` | Vf 2 V |
| GND | `ground.signal` | 0 V |
| R7 | `passive.resistor` | 10 kΩ |
| C1 | `passive.capacitor` | 100 nF |
| C2 | `passive.capacitor` | 100 nF |

## Net connections

- **VCC:** `supply:+`, `fsm:VCC`, `fsm:AVCC`, `reset-pullup:1`, `vcc-bypass:1`, `avcc-bypass:1`
- **GND:** `supply:-`, `clock-input:-`, `reset-input:-`, `fsm:GND`, `ground:0`, `led-NS_R:K`, `led-NS_Y:K`, `led-NS_G:K`, `led-EW_R:K`, `led-EW_Y:K`, `led-EW_G:K`, `fsm:AGND`, `vcc-bypass:2`, `avcc-bypass:2`
- **CLOCK:** `clock-input:+`, `fsm:CLK`
- **RESET_N:** `reset-input:+`, `fsm:RESET_N`
- **LAMP_NS_R:** `fsm:NS_R`, `r-NS_R:1`
- **LED_NS_R:** `r-NS_R:2`, `led-NS_R:A`
- **LAMP_NS_Y:** `fsm:NS_Y`, `r-NS_Y:1`
- **LED_NS_Y:** `r-NS_Y:2`, `led-NS_Y:A`
- **LAMP_NS_G:** `fsm:NS_G`, `r-NS_G:1`
- **LED_NS_G:** `r-NS_G:2`, `led-NS_G:A`
- **LAMP_EW_R:** `fsm:EW_R`, `r-EW_R:1`
- **LED_EW_R:** `r-EW_R:2`, `led-EW_R:A`
- **LAMP_EW_Y:** `fsm:EW_Y`, `r-EW_Y:1`
- **LED_EW_Y:** `r-EW_Y:2`, `led-EW_Y:A`
- **LAMP_EW_G:** `fsm:EW_G`, `r-EW_G:1`
- **LED_EW_G:** `r-EW_G:2`, `led-EW_G:A`
- **MCU_RESET_N:** `fsm:MCU_RESET_N`, `reset-pullup:2`

## Firmware

The [AVR C source](../049-traffic-light-fsm/main.c) uses PD2 for the phase clock and PD3 for active-low phase reset. PC0 through PC5 drive the six lamps in the order shown above. Pin 1 is the separate MCU hardware reset. Use a known ATmega328P-PU configuration with its internal oscillator and program it before insertion, or use an external programming fixture. Supply common-reference 0 V and 5 V inputs and hold the phase clock low during initialization.

Build with AVR-GCC and AVR Libc using `avr-gcc -mmcu=atmega328p -std=c11 -Os main.c -o main.elf`, then use `avr-objcopy -O ihex -R .eeprom main.elf main.hex`. The local acceptance check compares the firmware’s lamp masks with the simulator’s six phase vectors. The AVR firmware CI workflow compiles the source and checks the generated HEX file. Execution and timing remain to be verified on hardware.

## Views and physical-layout status

The BB400 assembly seats the ATmega328P-PU with pin 1 at F10. The six LED paths use red, yellow, and green lamps with individual 1 kΩ resistors. Both supply pins are bypassed, hardware reset is pulled high, and unused package terminals have isolated strips.

The 83 × 55 mm two-layer PCB routes the ATmega328P-PU and all six lamp paths. J1 supplies +5 V, J2 connects the phase clock, and J3 connects active-low phase reset. Each provides a common return. The PCB export passes connectivity, board-fit, and copper-clearance checks. Independent package fit and electrical bench tests remain pending.

## Acceptance test and expected result

- Stable test ID: `core-traffic-light-fsm`
- Engine: Ideal six-phase traffic-light finite-state machine
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-six-phase-traffic-fsm-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41174259998

Recorded expected result:

```json
{
  "phase": 0,
  "lamps": [false, false, true, true, false, false],
  "phaseLampVectors": [
    [
      false,
      false,
      true,
      true,
      false,
      false
    ],
    [
      false,
      true,
      false,
      true,
      false,
      false
    ],
    [
      true,
      false,
      false,
      true,
      false,
      false
    ],
    [
      true,
      false,
      false,
      false,
      false,
      true
    ],
    [
      true,
      false,
      false,
      false,
      true,
      false
    ],
    [
      true,
      false,
      false,
      true,
      false,
      false
    ]
  ],
  "repeatsAfterSixPhases": true,
  "opposingGreenInvariant": true,
  "onePhasePerRisingEdge": true
}
```

## Safety and model limits

Generic educational six-phase static FSM. It advances once per rising edge and omits real-time duration, pedestrian control, sensor inputs, certified traffic-signal interlocks, propagation delay, and regulatory behavior.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/049-traffic-light-fsm.adigun.json`.