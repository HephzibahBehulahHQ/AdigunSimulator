export const SCHEMA_VERSION = 1;
export const DESIGN_VIEWS = Object.freeze(["breadboard", "schematic", "pcb"]);
const UI_LOCALES_FOR_PROJECT = Object.freeze(["en", "de", "yo", "pcm"]);
const CANVAS_LIMITS = Object.freeze({ x: [28, 604], y: [48, 244], overlapDistance: 34 });

export const STARTER_LIBRARY = Object.freeze([
  { id: "power.dc-source", category: "Power & Ground", type: "DC voltage source", prefix: "V", pins: ["+", "-"], defaultValue: "5 V", simulation: "analytical-led-demo", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.usb-source", category: "Power & Ground", type: "USB 5 V supply model", prefix: "USB", pins: ["+", "-"], defaultValue: "5 V", simulation: "analytical-usb-led-ptc", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.solar-cell", category: "Power & Ground", type: "Solar cell (linear I–V estimate)", prefix: "PV", pins: ["+", "-"], defaultValue: "Voc 6 V; Isc 100 mA", simulation: "analytical-solar-garden-light", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.rechargeable-battery", category: "Power & Ground", type: "Rechargeable battery (fixed-voltage model)", prefix: "BAT", pins: ["+", "-"], defaultValue: "3.7 V", simulation: "analytical-solar-garden-light", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.pwm-source", category: "Inputs", type: "PWM control source", prefix: "PWM", pins: ["+", "-"], defaultValue: "1 kHz, 50%, 5 V", simulation: "analytical-pwm-led-average", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.dc-current-source", category: "Power & Ground", type: "DC current source (positive current flows from − to +)", prefix: "I", pins: ["+", "-"], defaultValue: "1 mA", simulation: "mna-linear-dc", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.ac-source", category: "Power & Ground", type: "AC voltage source", prefix: "V", pins: ["+", "-"], defaultValue: "1 V", simulation: "analytical-rc-low-pass", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.resistor", category: "Passive", type: "Resistor", prefix: "R", pins: ["1", "2"], defaultValue: "330 Ω", simulation: "analytical-led-demo", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.capacitor", category: "Passive", type: "Capacitor", prefix: "C", pins: ["1", "2"], defaultValue: "100 µF", simulation: "analytical-rc-step", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.supercapacitor", category: "Passive", type: "Supercapacitor (ideal RC hold-up model)", prefix: "C", pins: ["+", "-"], defaultValue: "C 1 F; Vstart 4.7 V; Vmin 3 V; Vmax 5 V", simulation: "analytical-supercap-hold-up", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.inductor", category: "Passive", type: "Inductor", prefix: "L", pins: ["1", "2"], defaultValue: "100 mH", simulation: "analytical-rl-step", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.transformer-ideal", category: "Passive", type: "Ideal transformer ratio model", prefix: "T", pins: ["PRI1", "PRI2", "SEC1", "SEC2"], defaultValue: "230:12", simulation: "analytical-regulated-supply", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.ldr", category: "Passive", type: "Photoresistor (light-dependent resistor)", prefix: "R", pins: ["1", "2"], defaultValue: "Rbright 10 kΩ; Rdark 1 MΩ; light 100%", simulation: "analytical-solar-garden-light", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.ntc-thermistor", category: "Sensors", type: "NTC thermistor (Beta-model estimate)", prefix: "TH", pins: ["1", "2"], defaultValue: "R25 10 kΩ; B 3950 K; temp 25 °C", simulation: "analytical-ntc-divider", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.potentiometer", category: "Passive", type: "Potentiometer (two-terminal rheostat model)", prefix: "RP", pins: ["1", "2"], defaultValue: "Rmax 10 kΩ; position 50%", simulation: "analytical-passive-tone-control", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.bridge-ideal", category: "Active", type: "Ideal bridge rectifier (fixed diode drop)", prefix: "BR", pins: ["AC1", "AC2", "POS", "NEG"], defaultValue: "0.7 V", simulation: "analytical-regulated-supply", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.zener-ideal", category: "Active", type: "Zener diode (ideal shunt-clamp model)", prefix: "DZ", pins: ["K", "A"], defaultValue: "Vz 5.1 V; Pmax 0.5 W", simulation: "analytical-zener-shunt", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "protection.tvs-ideal", category: "Protection", type: "TVS diode (ideal transient-clamp estimate)", prefix: "D", pins: ["K", "A"], defaultValue: "Vclamp 18 V; Pmax 12 W; Emax 0.01 J", simulation: "analytical-tvs-pulse", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.schottky", category: "Active", type: "Schottky diode (fixed-drop estimate)", prefix: "D", pins: ["A", "K"], defaultValue: "Vf 0.3 V", simulation: "analytical-solar-garden-light", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.led-red", category: "Active", type: "Red LED", prefix: "D", pins: ["A", "K"], defaultValue: "Vf 2.0 V", simulation: "analytical-led-demo", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.nmos-switch", category: "Active", type: "N-channel MOSFET (ideal PWM switch)", prefix: "Q", pins: ["G", "D", "S"], defaultValue: "Vth 2.0 V", simulation: "analytical-pwm-led-average", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.pmos-high-side-ideal", category: "Active", type: "P-channel MOSFET (ideal high-side switch)", prefix: "Q", pins: ["G", "D", "S"], defaultValue: "Vth 2.0 V; RdsOn 0.1 Ω; |VGS|max 20 V", simulation: "analytical-pmos-high-side", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.led-green", category: "Active", type: "Green LED", prefix: "D", pins: ["A", "K"], defaultValue: "Vf 2.1 V", simulation: "analytical-polarity-indicator", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "ground.signal", category: "Power & Ground", type: "Signal ground", prefix: "GND", pins: ["0"], defaultValue: "0 V", simulation: "reference", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.pushbutton", category: "Inputs", type: "Momentary pushbutton", prefix: "SW", pins: ["1", "2"], defaultValue: "Normally open", simulation: "ideal-switch-analytical-led", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.spdt-switch", category: "Inputs", type: "SPDT switch", prefix: "SW", pins: ["COM", "A", "B"], defaultValue: "Charge (A)", simulation: "analytical-rc-charge-discharge/ideal-latching-led", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.comparator-ideal", category: "Active", type: "Ideal low-battery comparator model", prefix: "U", pins: ["VCC", "GND", "SENSE", "OUT"], defaultValue: "Vref 3.75 V", simulation: "analytical-battery-monitor", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.comparator-dual-ideal", category: "Active", type: "Ideal dual-input comparator with indicator", prefix: "U", pins: ["VCC", "GND", "IN+", "IN-", "OUT"], defaultValue: "Ideal comparator", simulation: "analytical-comparator-threshold", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.schmitt-trigger-ideal", category: "Active", type: "Ideal Schmitt trigger with positive feedback", prefix: "U", pins: ["VCC", "GND", "IN+", "IN-", "OUT"], defaultValue: "Ideal Schmitt trigger", simulation: "analytical-schmitt-trigger", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-and-ideal", category: "Active", type: "Ideal two-input AND gate (static)", prefix: "U", pins: ["A", "B", "Y", "VCC", "GND"], defaultValue: "Ideal logic", simulation: "analytical-window-comparator", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-or-ideal", category: "Active", type: "Ideal two-input OR gate (static)", prefix: "U", pins: ["A", "B", "Y", "VCC", "GND"], defaultValue: "Ideal logic", simulation: "analytical-or-gate-truth-table", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-xor-ideal", category: "Active", type: "Ideal two-input XOR parity gate (static)", prefix: "U", pins: ["A", "B", "Y", "VCC", "GND"], defaultValue: "Ideal logic", simulation: "analytical-xor-parity-checker", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-nor-ideal", category: "Active", type: "Ideal two-input NOR gate (static)", prefix: "U", pins: ["A", "B", "Y", "VCC", "GND"], defaultValue: "Ideal logic", simulation: "analytical-nor-sr-latch", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-dff-ideal", category: "Active", type: "Ideal positive-edge D flip-flop (static logic)", prefix: "U", pins: ["D", "CLK", "Q", "QBAR", "PRE", "CLR", "VCC", "GND"], defaultValue: "Ideal positive-edge D flip-flop", simulation: "analytical-d-flip-flop", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-jk-ideal", category: "Active", type: "Ideal positive-edge JK flip-flop (static logic)", prefix: "U", pins: ["J", "K", "CLK", "Q", "QBAR", "PRE", "CLR", "VCC", "GND"], defaultValue: "Ideal positive-edge JK flip-flop", simulation: "analytical-jk-toggle-divider", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-counter-4bit-ideal", category: "Active", type: "Ideal 4-bit binary counter (static state)", prefix: "U", pins: ["CLK", "RESET_N", "Q0", "Q1", "Q2", "Q3", "VCC", "GND"], defaultValue: "Ideal modulo-16 rising-edge counter", simulation: "analytical-4bit-counter", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-bcd-display-ideal", category: "Active", type: "Ideal BCD decade counter and seven-segment decoder", prefix: "U", pins: ["CLK", "RESET_N", "SEG_A", "SEG_B", "SEG_C", "SEG_D", "SEG_E", "SEG_F", "SEG_G", "VCC", "GND"], defaultValue: "Ideal BCD decade counter; common-cathode segments", simulation: "analytical-bcd-counter-display", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-traffic-fsm-ideal", category: "Active", type: "Ideal six-phase traffic-light state machine", prefix: "U", pins: ["CLK", "RESET_N", "NS_R", "NS_Y", "NS_G", "EW_R", "EW_Y", "EW_G", "VCC", "GND"], defaultValue: "Six-phase traffic-light FSM", simulation: "analytical-traffic-light-fsm", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-debounce-ideal", category: "Active", type: "Ideal N-sample digital debounce filter", prefix: "U", pins: ["INPUT", "CLK", "RESET_N", "Q", "VCC", "GND"], defaultValue: "Stable samples 3", simulation: "analytical-digital-debounce", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-ring-shift-4bit-ideal", category: "Active", type: "Ideal four-bit ring shift register", prefix: "U", pins: ["CLK", "RESET_N", "Q0", "Q1", "Q2", "Q3", "VCC", "GND"], defaultValue: "Four-bit one-hot ring; reset Q0", simulation: "analytical-shift-register-chaser", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-mux4-ideal", category: "Active", type: "Ideal four-to-one multiplexer (static logic)", prefix: "U", pins: ["I0", "I1", "I2", "I3", "S0", "S1", "Y", "VCC", "GND"], defaultValue: "Ideal 4:1 mux; S1:S0 selects I0–I3", simulation: "analytical-mux4", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-decoder-2to4-ideal", category: "Active", type: "Ideal two-to-four decoder (static logic)", prefix: "U", pins: ["A0", "A1", "Y0", "Y1", "Y2", "Y3", "VCC", "GND"], defaultValue: "Ideal active-high 2:4 decoder", simulation: "analytical-decoder-2to4", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-priority-encoder-4to2-ideal", category: "Active", type: "Ideal four-input priority encoder", prefix: "U", pins: ["D0", "D1", "D2", "D3", "CODE0", "CODE1", "VALID", "VCC", "GND"], defaultValue: "D3 has highest priority; valid output", simulation: "analytical-priority-encoder", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.logic-alu4-ideal", category: "Active", type: "Ideal four-bit add/subtract ALU", prefix: "U", pins: ["A0", "A1", "A2", "A3", "B0", "B1", "B2", "B3", "SUB", "SUM0", "SUM1", "SUM2", "SUM3", "CARRY", "VCC", "GND"], defaultValue: "Four-bit two's-complement add/subtract", simulation: "analytical-alu4", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.uart-tx-ideal", category: "Active", type: "Ideal UART transmitter (8N1 frame model)", prefix: "U", pins: ["TX", "VCC", "GND"], defaultValue: "Byte 0xA5; Baud 9600", simulation: "analytical-uart-transmitter", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.uart-frame-source", category: "Inputs", type: "Ideal UART serial-frame source (digital fixture)", prefix: "SIG", pins: ["TX", "GND"], defaultValue: "Bits 0,1,0,1,0,0,1,0,1,1; Baud 9600", simulation: "fixture-uart-frame", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.usb-uart-console-stream", category: "Inputs", type: "USB-UART local byte-stream fixture", prefix: "HOST", pins: ["TX", "GND"], defaultValue: "Baud 9600; DataBits 8; Parity none; StopBits 1; TXBytes 48 69; RXBytes 4F 4B", simulation: "fixture-usb-uart-stream", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.usb-uart-bridge-mock", category: "Active", type: "Local USB-UART bridge behavior mock", prefix: "U", pins: ["RX", "TX", "VCC", "GND"], defaultValue: "Mode local mock; Flow none", simulation: "analytical-usb-uart-console", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "output.serial-console-report", category: "Output", type: "Serial console byte and text report", prefix: "TERM", pins: ["RX", "VCC", "GND"], defaultValue: "Console output", simulation: "analytical-usb-uart-console", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.uart-rx-ideal", category: "Active", type: "Ideal UART 8N1 receiver (frame decoder)", prefix: "U", pins: ["RX", "VALID", "VCC", "GND"], defaultValue: "8N1 frame decoder", simulation: "analytical-uart-receiver", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.i2c-read-transaction", category: "Inputs", type: "Ideal I²C read transaction fixture", prefix: "BUS", pins: ["SDA", "SCL", "GND"], defaultValue: "Address 0x48; Register 0x00; Baud 100000; ACK yes", simulation: "fixture-i2c-read", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.i2c-level-shifter-transition-fixture", category: "Inputs", type: "I²C open-drain transition fixture", prefix: "BUS", pins: ["SDA", "SCL", "GND"], defaultValue: "SDA Drive low-side; SDA States H,L,H,L; SCL Drive high-side; SCL States L,H,L,H", simulation: "fixture-i2c-level-shift", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.i2c-bidirectional-level-shifter-ideal", category: "Active", type: "Ideal bidirectional MOSFET I²C level-shifter model", prefix: "Q", pins: ["SDA_L", "SCL_L", "SDA_H", "SCL_H", "VREF_L", "VREF_H", "GND"], defaultValue: "Mode open-drain bidirectional", simulation: "analytical-i2c-level-shift", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "output.i2c-level-shifter-report", category: "Output", type: "I²C level-shifter transition report", prefix: "DISP", pins: ["SDA_L", "SCL_L", "SDA_H", "SCL_H", "VREF_L", "VREF_H", "GND"], defaultValue: "I²C transition report", simulation: "analytical-i2c-level-shift", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.i2c-sensor-ideal", category: "Active", type: "Ideal I²C register sensor (digital model)", prefix: "U", pins: ["SDA", "SCL", "VCC", "GND"], defaultValue: "Address 0x48; Register 0x00=0x2A", simulation: "analytical-i2c-register-read", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.i2c-eeprom-ideal", category: "Active", type: "Ideal I²C EEPROM byte memory (digital model)", prefix: "U", pins: ["SDA", "SCL", "VCC", "GND"], defaultValue: "Address 0x50; Memory 0x10=0x00", simulation: "analytical-i2c-eeprom-write-read", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.spi-transfer-source", category: "Inputs", type: "Ideal SPI mode-0 transfer fixture", prefix: "BUS", pins: ["SCK", "MOSI", "CS", "GND"], defaultValue: "Mode 0; Byte 0xA5; Baud 1000000; CS active", simulation: "fixture-spi-transfer", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.spi-display-ideal", category: "Active", type: "Ideal SPI byte display (digital model)", prefix: "U", pins: ["SCK", "MOSI", "CS", "VCC", "GND"], defaultValue: "Mode 0 display", simulation: "analytical-spi-display", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.mcu-uno-ideal", category: "Active", type: "Ideal Uno-class GPIO sequence controller (configured behavior model)", prefix: "U", pins: ["A0", "D2", "D3", "D7", "D8", "D9", "D13", "VCC", "GND"], defaultValue: "Program Blink; Pin D13; High 500 ms; Low 500 ms; Runtime 2000 ms", simulation: "analytical-mcu-gpio-sequence", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.potentiometer-adc-ideal", category: "Inputs", type: "Ideal potentiometer-to-ADC fixture", prefix: "RV", pins: ["VCC", "OUT", "GND"], defaultValue: "Position 50%; Resolution 10 bit", simulation: "fixture-potentiometer-adc", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "sensor.temperature-analog-ideal", category: "Sensors", type: "Ideal linear analog temperature sensor model", prefix: "TS", pins: ["VCC", "OUT", "GND"], defaultValue: "Temperature 25 C; Scale 10 mV/C; Offset 0 mV", simulation: "analytical-temperature-monitor", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.lcd-text-sink-ideal", category: "Output", type: "Ideal single-line LCD text sink (behavior model)", prefix: "LCD", pins: ["DATA", "VCC", "GND"], defaultValue: "16-character text row", simulation: "analytical-temperature-monitor", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "sensor.ultrasonic-echo-ideal", category: "Sensors", type: "Ideal ultrasonic echo-time sensor model", prefix: "US", pins: ["TRIG", "ECHO", "VCC", "GND"], defaultValue: "Echo 5882 us; Minimum 20 mm; Maximum 4000 mm", simulation: "analytical-ultrasonic-range", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.oled-text-sink-ideal", category: "Output", type: "Ideal OLED text sink (behavior model)", prefix: "OLED", pins: ["DATA", "VCC", "GND"], defaultValue: "Distance result", simulation: "analytical-ultrasonic-range", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.servo-angle-ideal", category: "Output", type: "Ideal hobby-servo position model", prefix: "SERVO", pins: ["PWM", "VCC", "GND"], defaultValue: "MinPulse 1000 us; MaxPulse 2000 us; MinAngle 0 deg; MaxAngle 180 deg; Frequency 50 Hz", simulation: "analytical-servo-position", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.stepper-driver-ideal", category: "Active", type: "Ideal dual-H-bridge stepper driver (logic model)", prefix: "U", pins: ["STEP", "DIR", "VCC", "GND", "A1", "A2", "B1", "B2"], defaultValue: "Full-step dual-phase drive", simulation: "analytical-stepper-motion", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.stepper-motor-ideal", category: "Output", type: "Ideal bipolar stepper motor (position model)", prefix: "M", pins: ["A1", "A2", "B1", "B2"], defaultValue: "StepsPerRevolution 200; StepAngle 1.8 deg", simulation: "analytical-stepper-motion", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.esp32-telemetry-ideal", category: "Active", type: "Ideal ESP32-class sensor telemetry formatter", prefix: "U", pins: ["ADC", "TX", "VCC", "GND"], defaultValue: "Device esp32-node-01; Sequence 1; Transport offline-mock", simulation: "analytical-esp32-telemetry", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.telemetry-payload-sink", category: "Output", type: "Offline telemetry payload viewer", prefix: "OUT", pins: ["DATA", "GND"], defaultValue: "JSON payload", simulation: "analytical-esp32-telemetry", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.rp2040-pico-ideal", category: "Active", type: "Ideal RP2040 Pico ADC/display controller (behavior model)", prefix: "U", pins: ["ADC0", "TX", "VCC", "GND"], defaultValue: "ADC 12 bit; Reference 3.3 V; Calibrate divider", simulation: "analytical-pico-voltmeter", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.stm32-timer-ideal", category: "Active", type: "Ideal STM32 timer PWM controller (behavior model)", prefix: "U", pins: ["TIM1_CH1", "VCC", "GND"], defaultValue: "ClockHz 72000000; Prescaler 71; AutoReload 999; Compare 499", simulation: "analytical-stm32-timer-pwm", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.pic-adc-bargraph-ideal", category: "Active", type: "Generic PIC 10-bit ADC and bargraph behavior model", prefix: "U", pins: ["AN0", "BAR0", "BAR1", "BAR2", "BAR3", "BAR4", "BAR5", "BAR6", "BAR7", "BAR8", "BAR9", "VDD", "VSS"], defaultValue: "Program ADC bargraph; ADC AN0; Resolution 10 bit; Channels 10", simulation: "analytical-pic-adc-bargraph", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.led-bargraph-10seg-ideal", category: "Output", type: "Ideal 10-segment LED bargraph behavior sink", prefix: "LED", pins: ["IN0", "IN1", "IN2", "IN3", "IN4", "IN5", "IN6", "IN7", "IN8", "IN9", "VCC", "GND"], defaultValue: "Segments 10; Mode bar", simulation: "analytical-pic-adc-bargraph", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.ir-nec-frame", category: "Inputs", type: "Ideal NEC-like optical timing fixture", prefix: "SIG", pins: ["OUT", "GND"], defaultValue: "Protocol NEC-like; Bytes 00 FF A2 5D; LeaderMarkUs 9000; LeaderSpaceUs 4500; BitMarkUs 560; ZeroSpaceUs 560; OneSpaceUs 1690; StopMarkUs 560; CarrierHz 38000", simulation: "fixture-ir-nec-frame", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "sensor.ir-receiver-ideal", category: "Sensors", type: "Ideal 38 kHz IR demodulator behavior model", prefix: "IR", pins: ["SIG", "VCC", "GND", "OUT"], defaultValue: "CarrierHz 38000; Output demodulated active-low", simulation: "analytical-avr-ir-receiver", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.data-log-samples", category: "Inputs", type: "Ideal periodic sensor sample fixture", prefix: "SIG", pins: ["DATA", "GND"], defaultValue: "Samples 10,20,30,40,50; PeriodMs 100; Unit C", simulation: "fixture-data-log-samples", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.data-logger-controller-ideal", category: "Active", type: "Ideal EEPROM data logger controller behavior model", prefix: "U", pins: ["SENSOR", "SDA", "SCL", "DISPLAY", "VCC", "GND"], defaultValue: "SamplePeriodMs 100; Mode circular logger", simulation: "analytical-eeprom-ring-logger", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.eeprom-ring-buffer-ideal", category: "Active", type: "Ideal EEPROM circular ring-buffer model", prefix: "MEM", pins: ["SDA", "SCL", "VCC", "GND"], defaultValue: "Capacity 3; WriteCycleMs 5; Mode circular", simulation: "analytical-eeprom-ring-logger", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.data-log-display", category: "Output", type: "Ideal EEPROM replay text sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Newest retained samples", simulation: "analytical-eeprom-ring-logger", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.fm-frequency-sweep", category: "Inputs", type: "Ideal FM front-end frequency sweep", prefix: "SIG", pins: ["RF", "GND"], defaultValue: "FrequenciesMHz 88,94,98,100,102,106,108; AmplitudeV 0.01; Mode small-signal sweep", simulation: "fixture-fm-frequency-sweep", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "passive.fm-antenna-ideal", category: "Passive", type: "Ideal FM antenna coupling placeholder", prefix: "ANT", pins: ["INPUT", "OUTPUT", "GND"], defaultValue: "Mode ideal; CenterMHz 100", simulation: "analytical-fm-front-end", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "passive.fm-tuning-network-ideal", category: "Passive", type: "Ideal FM tuned band-pass response model", prefix: "LC", pins: ["RF_IN", "RF_OUT", "GND"], defaultValue: "Mode bandpass; CenterMHz 100; Q 8", simulation: "analytical-fm-front-end", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.fm-audio-gain-ideal", category: "Active", type: "Ideal FM audio gain block (no demodulator)", prefix: "U", pins: ["INPUT", "OUTPUT", "VCC", "GND"], defaultValue: "Mode linear; GainDb 12", simulation: "analytical-fm-front-end", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "output.fm-response-report", category: "Output", type: "Ideal FM response plot sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Frequency response", simulation: "analytical-fm-front-end", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.ir-remote-action-decoder", category: "Active", type: "Ideal NEC-like remote action mapping model", prefix: "U", pins: ["INT0", "ACTION", "VCC", "GND"], defaultValue: "Program Decode NEC-like and dispatch; Input INT0; Output ACTION; Tolerance 20%; Map A2=TOGGLE_LIGHT,B2=VOLUME_UP", simulation: "analytical-ir-remote-action", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.ir-action-display", category: "Output", type: "Ideal infrared action display sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Selected remote action", simulation: "analytical-ir-remote-action", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.ethernet-sensor-config", category: "Inputs", type: "Ideal Ethernet sensor/configuration fixture", prefix: "SIG", pins: ["DATA", "GND"], defaultValue: "LinkTransitions down>negotiating>up; Configuration configured; DeviceId 1; TemperatureC 24.6; Sequence 42", simulation: "fixture-ethernet-sensor-config", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.ethernet-sensor-controller-ideal", category: "Active", type: "Generic Ethernet sensor payload and state model", prefix: "U", pins: ["SENSOR", "TX", "LINK", "REPORT", "VCC", "GND"], defaultValue: "Mode eth2-mock; SourceMac 02:00:00:00:00:01; DestinationMac 02:00:00:00:00:02; EtherType 0x88B5", simulation: "analytical-ethernet-sensor-frame", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.ethernet-phy-mock", category: "Active", type: "Ideal Ethernet PHY link-state fixture (no packets)", prefix: "PHY", pins: ["RX", "LINK", "VCC", "GND"], defaultValue: "Mode mock; Link up", simulation: "analytical-ethernet-sensor-frame", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.ethernet-frame-report", category: "Output", type: "Ideal Ethernet frame report sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Header and sensor payload", simulation: "analytical-ethernet-sensor-frame", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.wifi-relay-command", category: "Inputs", type: "Ideal Wi-Fi relay command fixture", prefix: "CMD", pins: ["COMMAND", "TOKEN", "GND"], defaultValue: "Command ON; Token TEST_TOKEN", simulation: "fixture-wifi-relay-command", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.wifi-relay-controller-ideal", category: "Active", type: "Generic local Wi-Fi relay command controller", prefix: "U", pins: ["CMD", "TOKEN", "LINK", "DRIVE", "VCC", "GND"], defaultValue: "Mode local-relay; AuthMode placeholder; ExpectedToken TEST_TOKEN; OfflineState fail-safe", simulation: "analytical-wifi-relay-control", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.wifi-module-mock", category: "Active", type: "Ideal Wi-Fi link-state fixture (no network)", prefix: "WIFI", pins: ["LINK", "VCC", "GND"], defaultValue: "Mode local-mock; Link online", simulation: "analytical-wifi-relay-control", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.wifi-relay-driver-ideal", category: "Active", type: "Ideal relay driver current guard and state output", prefix: "Q", pins: ["IN", "VCC", "GND"], defaultValue: "Mode ideal-switch; RequestedCoilCurrentMa 70; MaximumCurrentMa 100", simulation: "analytical-wifi-relay-control", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.gsm-alarm-event", category: "Inputs", type: "Ideal GSM alarm event fixture", prefix: "SIG", pins: ["ALARM", "GND"], defaultValue: "AlarmState active; Message TEMP_LIMIT_EXCEEDED; Responses OK|+CREG:0,1|OK|>; SendResult +CMGS:0|OK", simulation: "fixture-gsm-alarm", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.gsm-alarm-controller-ideal", category: "Active", type: "Generic GSM alert AT-command sequence model", prefix: "U", pins: ["ALARM", "TX", "RX", "REPORT", "VCC", "GND"], defaultValue: "Mode sms-mock; Destination TEST_ONLY; CommandTimeoutMs 1000", simulation: "analytical-gsm-alarm-mock", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.gsm-modem-at-mock", category: "Active", type: "Ideal GSM modem AT response fixture", prefix: "MODEM", pins: ["RX", "TX", "VCC", "GND"], defaultValue: "Mode AT-mock; Registration registered", simulation: "analytical-gsm-alarm-mock", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.gsm-sms-report", category: "Output", type: "Ideal GSM alert transaction report sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Mocked modem transaction result", simulation: "analytical-gsm-alarm-mock", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.lora-temperature-fixture", category: "Inputs", type: "Ideal LoRa temperature sample fixture", prefix: "SIG", pins: ["DATA", "GND"], defaultValue: "TemperatureC 24.6", simulation: "fixture-lora-temperature", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.lora-node-controller-ideal", category: "Active", type: "Generic LoRa sensor-node payload and schedule model", prefix: "U", pins: ["SENSOR", "RADIO", "REPORT", "VCC", "GND"], defaultValue: "NodeId 7; Sequence 42; Mode payload-v1; AirtimeMs 100; DutyWindowMs 60000; DutyLimitPercent 1; RequestsMs 0,9000,18000,27000,36000,45000,54000,55000", simulation: "analytical-lora-node-schedule", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.lora-radio-payload-ideal", category: "Active", type: "Ideal LoRa radio payload sink (no RF)", prefix: "LORA", pins: ["DATA", "VCC", "GND"], defaultValue: "Mode mock; MaximumPayloadBytes 255; Format V1", simulation: "analytical-lora-node-schedule", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.lora-duty-report", category: "Output", type: "Ideal LoRa send schedule report sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Payload and duty guard result", simulation: "analytical-lora-node-schedule", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.ble-advertising-settings", category: "Inputs", type: "Ideal BLE advertising settings fixture", prefix: "CFG", pins: ["DATA", "GND"], defaultValue: "Name Adigun; Flags 0x06; ServiceUuid 0x180D; TxPowerDbm -4", simulation: "fixture-ble-advertising-settings", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.ble-advertising-encoder-ideal", category: "Active", type: "Generic BLE legacy advertising data encoder model", prefix: "U", pins: ["CONFIG", "TX", "REPORT", "VCC", "GND"], defaultValue: "Protocol legacy; MaximumBytes 31", simulation: "analytical-ble-beacon-config", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.ble-advertiser-ideal", category: "Active", type: "Ideal BLE advertising data receiver model", prefix: "BLE", pins: ["RX", "VCC", "GND"], defaultValue: "Mode legacy; MaximumBytes 31", simulation: "analytical-ble-beacon-config", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.ble-advertising-report", category: "Output", type: "Ideal BLE payload report sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Encoded advertising data", simulation: "analytical-ble-beacon-config", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.interrupt-edge-sequence-ideal", category: "Inputs", type: "Ideal interrupt edge sequence fixture", prefix: "SIG", pins: ["INT", "GND"], defaultValue: "Events 100:rising,130:falling,400:rising; DurationMs 500", simulation: "analytical-low-power-sleep-wake", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.low-power-mcu-ideal", category: "Active", type: "Generic low-power MCU sleep/wake behavior model", prefix: "U", pins: ["INT", "LED", "VCC", "GND"], defaultValue: "RunCurrentUa 5000; SleepCurrentUa 8; WakeDurationMs 20; WakeMode rising", simulation: "analytical-low-power-sleep-wake", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "sensor.nfc-tag-ideal", category: "Sensors", type: "Ideal NFC tag UID and read-status fixture", prefix: "TAG", pins: ["UID", "GND"], defaultValue: "UID 04A1B2C3; ReadStatus ok", simulation: "fixture-nfc-tag", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.nfc-reader-ideal", category: "Active", type: "Ideal UID-only NFC reader behavior model", prefix: "NFC", pins: ["TAG", "DATA", "VCC", "GND"], defaultValue: "Mode UID-only; Band 13.56 MHz", simulation: "analytical-nfc-display", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.nfc-display-controller-ideal", category: "Active", type: "Generic NFC UID display controller behavior model", prefix: "U", pins: ["RX", "DISPLAY", "VCC", "GND"], defaultValue: "Program Display UID; Mode UID-display-only", simulation: "analytical-nfc-display", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.nfc-uid-display", category: "Output", type: "Ideal NFC UID text display sink", prefix: "OLED", pins: ["DATA", "VCC", "GND"], defaultValue: "UID only", simulation: "analytical-nfc-display", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.rfid-uid-fixture", category: "Inputs", type: "Ideal passive RFID tag UID fixture", prefix: "TAG", pins: ["UID", "GND"], defaultValue: "UID 04A1B2C3", simulation: "fixture-rfid-uid", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.rfid-inventory-fixture", category: "Inputs", type: "Ideal RFID inventory UID and collision fixture", prefix: "TAGS", pins: ["TAGS", "GND"], defaultValue: "UIDs 04A1B2C3,11223344,AABBCCDD,DEADBEEF,04A1B2C3; Slots 4", simulation: "fixture-rfid-inventory", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.rfid-inventory-reader-ideal", category: "Active", type: "Ideal RFID inventory slot estimator", prefix: "RFID", pins: ["TAGS", "DATA", "VCC", "GND"], defaultValue: "Mode inventory; Band 13.56 MHz; Slots 4", simulation: "analytical-rfid-inventory", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.rfid-inventory-report", category: "Output", type: "RFID inventory and collision report sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Inventory report", simulation: "analytical-rfid-inventory", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.rfid-uid-reader-ideal", category: "Active", type: "Ideal UID-only RFID reader behavior model", prefix: "RFID", pins: ["TAG", "DATA", "VCC", "GND"], defaultValue: "Mode UID-only; Band 13.56 MHz", simulation: "analytical-rfid-access", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.rfid-access-controller-ideal", category: "Active", type: "Ideal RFID UID allowlist controller model", prefix: "U", pins: ["TAG", "LOCK", "VCC", "GND"], defaultValue: "Allowlist 04A1B2C3,11223344; UnlockState 1; DenyState 0", simulation: "analytical-rfid-access", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.lock-state-indicator-ideal", category: "Output", type: "Ideal simulated lock state indicator", prefix: "LOCK", pins: ["CTRL", "VCC", "GND"], defaultValue: "Simulated lock state", simulation: "analytical-rfid-access", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "sensor.gnss-nmea-ideal", category: "Sensors", type: "Ideal GNSS NMEA sentence fixture", prefix: "GPS", pins: ["TX", "VCC", "GND"], defaultValue: "Sentence $GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A", simulation: "fixture-gnss-nmea", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.gnss-nmea-parser-ideal", category: "Active", type: "Ideal RMC sentence parser behavior model", prefix: "U", pins: ["RX", "DISPLAY", "VCC", "GND"], defaultValue: "SentenceType RMC", simulation: "analytical-gnss-rmc", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.gnss-position-display", category: "Output", type: "Ideal GNSS position text display sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Latitude and longitude", simulation: "analytical-gnss-rmc", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.rs485-poll-fixture", category: "Inputs", type: "Ideal addressed RS-485 poll fixture", prefix: "POLL", pins: ["OUT", "GND"], defaultValue: "Address 0x02; Baud 9600", simulation: "fixture-rs485-poll", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.rs485-master-ideal", category: "Active", type: "Generic RS-485 master MCU behavior model", prefix: "U", pins: ["POLL", "TX", "RX", "DE", "RE", "VCC", "GND"], defaultValue: "Role master; PollAddress 0x02; Baud 9600; DriverPolicy master-then-addressed", simulation: "analytical-rs485-poll", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.rs485-sensor-node-ideal", category: "Active", type: "Generic addressed RS-485 sensor-node behavior model", prefix: "U", pins: ["SENSOR", "TX", "RX", "DE", "RE", "VCC", "GND"], defaultValue: "Address 0x01; Baud 9600; EnablePolicy addressed-only", simulation: "analytical-rs485-poll", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.rs485-transceiver-ideal", category: "Active", type: "Ideal half-duplex RS-485 transceiver model", prefix: "XCVR", pins: ["DI", "RO", "DE", "RE", "A", "B", "VCC", "GND"], defaultValue: "Role sensor-1; BusMode half-duplex; Baud 9600", simulation: "analytical-rs485-poll", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.rs485-termination", category: "Passive", type: "RS-485 bus-end termination resistor", prefix: "RT", pins: ["1", "2"], defaultValue: "120 Ω", simulation: "analytical-rs485-poll", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "sensor.rs485-temperature-ideal", category: "Sensors", type: "Ideal RS-485 node temperature value source", prefix: "S", pins: ["DATA", "VCC", "GND"], defaultValue: "TemperatureC 21.5", simulation: "analytical-rs485-poll", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.rs485-poll-display", category: "Output", type: "Ideal addressed-poll response status sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Address and sensor response", simulation: "analytical-rs485-poll", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.can-frame-fixture", category: "Inputs", type: "Ideal CAN frame fixture", prefix: "SIG", pins: ["OUT", "GND"], defaultValue: "Identifier 0x123; DLC 2; Data DE AD; Bitrate 500000", simulation: "fixture-can-frame", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.can-node-ideal", category: "Active", type: "Generic CAN MCU behavior model", prefix: "U", pins: ["FRAME", "TX", "RX", "VCC", "GND"], defaultValue: "Role transmit; FilterId 0x123", simulation: "analytical-can-node-pair", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.can-transceiver-ideal", category: "Active", type: "Ideal CAN transceiver model", prefix: "XCVR", pins: ["TXD", "RXD", "CANH", "CANL", "VCC", "GND"], defaultValue: "Mode normal", simulation: "analytical-can-node-pair", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.can-termination", category: "Passive", type: "CAN bus termination resistor", prefix: "RT", pins: ["1", "2"], defaultValue: "120 Ω", simulation: "analytical-can-node-pair", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.can-frame-display", category: "Output", type: "Ideal CAN receive/ACK status sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "CAN frame and ACK status", simulation: "analytical-can-node-pair", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.watchdog-service-sequence", category: "Inputs", type: "Ideal watchdog service-time fixture", prefix: "SIG", pins: ["OUT", "GND"], defaultValue: "ServiceTimesMs 0,40,80,230; RunDurationMs 300", simulation: "fixture-watchdog-service-sequence", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.mcu-watchdog-ideal", category: "Active", type: "Generic MCU watchdog behavior model", prefix: "U", pins: ["WDI", "HEARTBEAT", "VCC", "GND"], defaultValue: "Program Watchdog state model; TimeoutMs 100", simulation: "analytical-mcu-watchdog", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.watchdog-status-display", category: "Output", type: "Ideal watchdog status text sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Watchdog state", simulation: "analytical-mcu-watchdog", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.avr-ir-decoder-ideal", category: "Active", type: "Generic AVR NEC-like decoder behavior model", prefix: "U", pins: ["INT0", "TX", "VCC", "GND"], defaultValue: "Program Decode NEC-like; Input INT0; Output TX; Tolerance 20%", simulation: "analytical-avr-ir-receiver", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "output.ir-code-display-ideal", category: "Output", type: "Ideal IR address/command text sink", prefix: "DISP", pins: ["DATA", "VCC", "GND"], defaultValue: "Address and command bytes", simulation: "analytical-avr-ir-receiver", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.digital-sample-sequence", category: "Inputs", type: "Ideal digital sample-sequence fixture", prefix: "SIG", pins: ["OUT", "GND"], defaultValue: "Samples 0,1,0,1,1,1,0,0,0,1,1,1; Rate 1000 Hz", simulation: "fixture-digital-samples", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.regulator-7805-ideal", category: "Active", type: "Ideal 7805-class linear regulator model", prefix: "U", pins: ["IN", "OUT", "GND"], defaultValue: "Vout 5 V; dropout 2 V", simulation: "analytical-regulated-supply", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "protection.ptc-polyfuse", category: "Active", type: "Resettable PTC fuse (cold-state estimate)", prefix: "F", pins: ["1", "2"], defaultValue: "Ihold 0.5 A; Rcold 0.1 Ω", simulation: "analytical-usb-led-ptc", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.ne555", category: "Active", type: "555 timer", prefix: "U", pins: ["1", "2", "3", "4", "5", "6", "7", "8"], defaultValue: "NE555-class", simulation: "analytical-555-astable", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.ne556", category: "Active", type: "556 dual timer (ideal astable channels)", prefix: "U", pins: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"], defaultValue: "NE556-class", simulation: "analytical-556-dual-astable", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.opamp-ideal", category: "Active", type: "Ideal op-amp (non-inverting midband model)", prefix: "U", pins: ["VCC", "VEE", "+", "-", "OUT"], defaultValue: "Ideal op-amp, dual supply", simulation: "analytical-opamp-noninverting", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "sensor.electret-mic-generic", category: "Sensors", type: "Electret microphone (generic bias and small-signal model)", prefix: "MIC", pins: ["VCC", "OUT", "GND"], defaultValue: "Imic 0.5 mA; Vsig 10 mV; f 1 kHz; Rs 2.2 kΩ", simulation: "analytical-electret-audio-preamp", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.electret-envelope-preamp-ideal", category: "Active", type: "Ideal electret small-signal preamplifier", prefix: "U", pins: ["IN", "OUT", "VCC", "GND"], defaultValue: "Gain 20", simulation: "analytical-electret-mic-meter", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.audio-envelope-rectifier-ideal", category: "Active", type: "Ideal full-wave audio envelope rectifier", prefix: "BR", pins: ["IN", "OUT", "VCC", "GND"], defaultValue: "Mode full-wave; DropV 0 V", simulation: "analytical-electret-mic-meter", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "output.audio-level-ledbar-ideal", category: "Output", type: "Ideal calibrated audio level LED bargraph", prefix: "LED", pins: ["IN", "VCC", "GND"], defaultValue: "ThresholdsV 0.02,0.04,0.06,0.08,0.10,0.12,0.14,0.16,0.18,0.20", simulation: "analytical-electret-mic-meter", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.audio-tone-settings", category: "Inputs", type: "Audio tone and sample settings", prefix: "SIG", pins: ["CONFIG", "GND"], defaultValue: "Waveform sine; Frequency 1000 Hz; Amplitude 1 V; Offset 2.5 V; SampleRate 48000 Hz; Duration 10 ms", simulation: "fixture-audio-tone", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.audio-tone-generator-ideal", category: "Active", type: "Ideal audio tone source", prefix: "OSC", pins: ["CONFIG", "OUT", "VCC", "GND"], defaultValue: "Mode ideal", simulation: "analytical-audio-tone", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "output.audio-spectrum-report", category: "Output", type: "Audio spectrum and zero-crossing report", prefix: "SCOPE", pins: ["IN", "VCC", "GND"], defaultValue: "Spectrum report", simulation: "analytical-audio-tone", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.guitar-pickup-frequency-sweep", category: "Inputs", type: "Guitar pickup AC frequency sweep fixture", prefix: "PICKUP", pins: ["OUT", "GND"], defaultValue: "FrequenciesHz 20,80,1000,5000,20000; AmplitudeV 0.1; SourceResistance 6.8 kΩ; LoadResistance 100 kΩ", simulation: "fixture-guitar-buffer-sweep", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.guitar-jfet-buffer-ideal", category: "Active", type: "Ideal high-input-impedance JFET buffer model", prefix: "Q", pins: ["IN", "OUT", "VCC", "GND"], defaultValue: "Mode source follower; Rin 1 MΩ; Rout 100 Ω; Gain 0.98; Cin 100 pF", simulation: "analytical-guitar-buffer", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "output.guitar-buffer-response", category: "Output", type: "Guitar buffer AC-response report", prefix: "SCOPE", pins: ["IN", "VCC", "GND"], defaultValue: "Buffer response", simulation: "analytical-guitar-buffer", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.audio-mixer-two-source", category: "Inputs", type: "Two-source audio mixer fixture", prefix: "SIG", pins: ["IN1", "IN2", "GND"], defaultValue: "V1 1 V; V2 2 V", simulation: "fixture-audio-mixer", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.audio-summing-buffer-ideal", category: "Active", type: "Ideal unity buffer for passive resistive mixer", prefix: "U", pins: ["IN", "OUT", "VCC", "GND"], defaultValue: "Mode unity buffer; Gain 1", simulation: "analytical-audio-mixer", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "output.audio-mixer-report", category: "Output", type: "Weighted audio mixer sum report", prefix: "SCOPE", pins: ["IN", "VCC", "GND"], defaultValue: "Mixer report", simulation: "analytical-audio-mixer", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "input.pwm-dac-settings", category: "Inputs", type: "PWM DAC frequency and duty fixture", prefix: "SIG", pins: ["CONFIG", "GND"], defaultValue: "Frequency 1000 Hz; Duty 50%; Vlogic 5 V", simulation: "fixture-pwm-dac", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.pwm-waveform-source-ideal", category: "Active", type: "Ideal PWM waveform source", prefix: "PWM", pins: ["CONFIG", "OUT", "VCC", "GND"], defaultValue: "Mode PWM; ActiveHigh true", simulation: "analytical-pwm-dac", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "output.pwm-dac-report", category: "Output", type: "PWM DAC average and ripple report", prefix: "SCOPE", pins: ["IN", "VCC", "GND"], defaultValue: "PWM DAC report", simulation: "analytical-pwm-dac", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "active.audio-amp-generic", category: "Active", type: "Generic low-voltage class-AB audio amplifier (LM386-class estimate)", prefix: "U", pins: ["VCC", "GND", "IN", "OUT"], defaultValue: "Av 20; Swing 2 V; Q 4 mA; f 1 kHz", simulation: "analytical-audio-power-amp", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.speaker-r-l-generic", category: "Output", type: "Generic speaker electrical R-L model", prefix: "SP", pins: ["+", "-"], defaultValue: "R 8 Ω; L 0.5 mH", simulation: "analytical-audio-power-amp", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.npn-small-signal", category: "Active", type: "NPN transistor (ideal common-emitter small-signal)", prefix: "Q", pins: ["B", "C", "E"], defaultValue: "β 100; VBE 0.7 V; VCEsat 0.2 V", simulation: "analytical-npn-common-emitter", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "instrument.voltmeter", category: "Instruments", type: "Voltmeter", prefix: "M", pins: ["+", "-"], defaultValue: "DC", simulation: "not modelled", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "connector.header-1x03", category: "Connectors", type: "Pin header 1×03", prefix: "J", pins: ["1", "2", "3"], defaultValue: "Through-hole", simulation: "schematic/PCB only", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } }
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createProject() {
  return createLedCurrentLimiterProject();
}

export function createEmptyProject({ name = "Untitled Circuit", locale = "en" } = {}) {
  const project = {
    schemaVersion: SCHEMA_VERSION,
    id: cryptoSafeId(),
    metadata: { ...projectMetadata(name), locale },
    components: [],
    nets: [],
    history: []
  };
  return project;
}

function projectMetadata(name) {
  const now = new Date().toISOString();
  return { name, locale: "en", createdAt: now, updatedAt: now };
}

export function createLedCurrentLimiterProject({ name = "LED Current Limiter", sourceValue = "5 V", resistanceValue = "330 Ω", ledValue = "Vf 2.0 V" } = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: cryptoSafeId(),
    metadata: projectMetadata(name),
    components: [
      { instanceId: "source-1", libraryId: "power.dc-source", reference: "V1", value: sourceValue, position: { breadboard: [60, 142], schematic: [95, 128], pcb: [92, 130] } },
      { instanceId: "resistor-1", libraryId: "passive.resistor", reference: "R1", value: resistanceValue, position: { breadboard: [255, 142], schematic: [260, 128], pcb: [244, 128] } },
      { instanceId: "led-1", libraryId: "diode.led-red", reference: "D1", value: ledValue, position: { breadboard: [455, 142], schematic: [452, 128], pcb: [408, 142] } },
      { instanceId: "ground-1", libraryId: "ground.signal", reference: "GND", value: "0 V", position: { breadboard: [565, 192], schematic: [564, 190], pcb: [506, 192] } }
    ],
    nets: [
      { id: "VCC", endpoints: ["source-1:+", "resistor-1:1"] },
      { id: "LED_A", endpoints: ["resistor-1:2", "led-1:A"] },
      { id: "GND", endpoints: ["led-1:K", "source-1:-", "ground-1:0"] }
    ],
    history: []
  };
}

export function createVoltageDividerProject({ name = "DC Voltage Divider", sourceValue = "9 V", upperResistanceValue = "1 kΩ", lowerResistanceValue = "2 kΩ" } = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: cryptoSafeId(),
    metadata: projectMetadata(name),
    components: [
      { instanceId: "source-1", libraryId: "power.dc-source", reference: "V1", value: sourceValue, position: { breadboard: [60, 142], schematic: [95, 128], pcb: [92, 130] } },
      { instanceId: "resistor-top-1", libraryId: "passive.resistor", reference: "R1", value: upperResistanceValue, position: { breadboard: [250, 122], schematic: [260, 112], pcb: [244, 112] } },
      { instanceId: "resistor-bottom-1", libraryId: "passive.resistor", reference: "R2", value: lowerResistanceValue, position: { breadboard: [425, 188], schematic: [438, 188], pcb: [418, 188] } },
      { instanceId: "ground-1", libraryId: "ground.signal", reference: "GND", value: "0 V", position: { breadboard: [565, 222], schematic: [564, 220], pcb: [506, 222] } }
    ],
    nets: [
      { id: "VCC", endpoints: ["source-1:+", "resistor-top-1:1"] },
      { id: "VOUT", endpoints: ["resistor-top-1:2", "resistor-bottom-1:1"] },
      { id: "GND", endpoints: ["resistor-bottom-1:2", "source-1:-", "ground-1:0"] }
    ],
    history: []
  };
}

export function cryptoSafeId() {
  return globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function findLibraryPart(id) {
  return STARTER_LIBRARY.find((part) => part.id === id) ?? null;
}

export function getViewReconciliationIssues(project, view) {
  return (project?.components ?? []).flatMap((component) => {
    const part = findLibraryPart(component.libraryId);
    if (!part) return [{ instanceId: component.instanceId, reference: component.reference, view, reason: "The part is not available in the current library lock." }];
    if (!part.views?.[view]) return [{ instanceId: component.instanceId, reference: component.reference, view, reason: `${part.type} has no verified ${view} mapping in this starter library.` }];
    return [];
  });
}

export function nextReference(project, libraryId) {
  const prefix = findLibraryPart(libraryId)?.prefix ?? "X";
  const matches = project.components
    .map((item) => item.reference)
    .filter((reference) => reference.startsWith(prefix))
    .map((reference) => Number(reference.slice(prefix.length)))
    .filter(Number.isFinite);
  return `${prefix}${Math.max(0, ...matches) + 1}`;
}

export function addComponent(project, libraryId) {
  const part = findLibraryPart(libraryId);
  if (!part) throw new Error(`Unknown library component: ${libraryId}`);
  const positions = Object.fromEntries(DESIGN_VIEWS.map((view) => [view, nextFreePosition(project, view)]));
  const item = {
    instanceId: cryptoSafeId(),
    libraryId,
    reference: nextReference(project, libraryId),
    value: part.defaultValue,
    position: positions
  };
  return { ...project, components: [...project.components, item], metadata: { ...project.metadata, updatedAt: new Date().toISOString() } };
}

function nextFreePosition(project, view) {
  const existing = (project.components ?? []).map((item) => item.position?.[view]).filter((position) => Array.isArray(position) && position.length === 2);
  const candidates = [];
  for (let y = 60; y <= 228; y += 48) for (let x = 48; x <= 600; x += 72) candidates.push([x, y]);
  return candidates.find(([x, y]) => existing.every(([otherX, otherY]) => Math.hypot(x - otherX, y - otherY) >= CANVAS_LIMITS.overlapDistance)) ?? [48, 228];
}

export function updateComponent(project, instanceId, changes) {
  const next = clone(project);
  const target = next.components.find((item) => item.instanceId === instanceId);
  if (!target) throw new Error(`Component not found: ${instanceId}`);
  Object.assign(target, changes);
  next.metadata.updatedAt = new Date().toISOString();
  return next;
}

export function moveComponent(project, instanceId, view, position, { snap = false } = {}) {
  if (!DESIGN_VIEWS.includes(view)) throw new Error(`Unsupported design view: ${view}`);
  if (!Array.isArray(position) || position.length !== 2 || !position.every(Number.isFinite)) throw new Error("A component position must contain two finite coordinates.");
  const next = clone(project);
  const target = next.components.find((item) => item.instanceId === instanceId);
  if (!target) throw new Error(`Component not found: ${instanceId}`);
  const grid = snap ? 12 : 1;
  const x = Math.min(CANVAS_LIMITS.x[1], Math.max(CANVAS_LIMITS.x[0], Math.round(position[0] / grid) * grid));
  const y = Math.min(CANVAS_LIMITS.y[1], Math.max(CANVAS_LIMITS.y[0], Math.round(position[1] / grid) * grid));
  target.position = { ...target.position, [view]: [x, y] };
  next.metadata.updatedAt = new Date().toISOString();
  return next;
}

export function connectPins(project, firstEndpoint, secondEndpoint) {
  if (firstEndpoint === secondEndpoint) throw new Error("Choose two different component pins.");
  for (const pinEndpoint of [firstEndpoint, secondEndpoint]) {
    const [instanceId, pin] = String(pinEndpoint).split(":");
    const component = project.components.find((item) => item.instanceId === instanceId);
    const part = component && findLibraryPart(component.libraryId);
    if (!part?.pins.includes(pin)) throw new Error(`Unknown component pin: ${pinEndpoint}`);
  }
  const next = clone(project);
  const firstNet = next.nets.find((net) => net.endpoints.includes(firstEndpoint));
  const secondNet = next.nets.find((net) => net.endpoints.includes(secondEndpoint));
  if (firstNet && firstNet === secondNet) return next;
  if (firstNet && secondNet) {
    firstNet.endpoints = [...new Set([...firstNet.endpoints, ...secondNet.endpoints])];
    next.nets = next.nets.filter((net) => net !== secondNet);
  } else if (firstNet || secondNet) {
    const target = firstNet ?? secondNet;
    const endpointToAdd = firstNet ? secondEndpoint : firstEndpoint;
    target.endpoints.push(endpointToAdd);
  } else {
    let index = 1;
    while (next.nets.some((net) => net.id === `N${index}`)) index += 1;
    next.nets.push({ id: `N${index}`, endpoints: [firstEndpoint, secondEndpoint] });
  }
  next.metadata.updatedAt = new Date().toISOString();
  return next;
}

export function disconnectPin(project, pinEndpoint) {
  const next = clone(project);
  const net = next.nets.find((item) => item.endpoints.includes(pinEndpoint));
  if (!net) return next;
  net.endpoints = net.endpoints.filter((item) => item !== pinEndpoint);
  if (net.endpoints.length < 2) next.nets = next.nets.filter((item) => item !== net);
  next.metadata.updatedAt = new Date().toISOString();
  return next;
}

export function removeComponent(project, instanceId) {
  if (!project.components.some((item) => item.instanceId === instanceId)) throw new Error(`Component not found: ${instanceId}`);
  const next = clone(project);
  next.components = next.components.filter((item) => item.instanceId !== instanceId);
  next.nets = next.nets.flatMap((net) => {
    const endpoints = net.endpoints.filter((item) => !item.startsWith(`${instanceId}:`));
    return endpoints.length >= 2 ? [{ ...net, endpoints }] : [];
  });
  next.metadata.updatedAt = new Date().toISOString();
  return next;
}

export function validateProject(project) {
  const errors = [];
  const warnings = [];
  if (!project || typeof project !== "object" || Array.isArray(project)) {
    return { errors: [{ rule: "PROJECT_OBJECT", message: "Project document must be a JSON object." }], warnings, valid: false };
  }
  if (project.schemaVersion !== SCHEMA_VERSION) errors.push({ rule: "SCHEMA_VERSION", message: "Project schema is missing or unsupported." });
  if (!project.metadata || typeof project.metadata !== "object" || Array.isArray(project.metadata)) errors.push({ rule: "METADATA_OBJECT", message: "Project metadata must be an object." });
  if (typeof project.metadata?.name !== "string" || !project.metadata.name.trim()) errors.push({ rule: "PROJECT_NAME", message: "Project name is required." });
  if (project.metadata?.locale && !UI_LOCALES_FOR_PROJECT.includes(project.metadata.locale)) warnings.push({ rule: "PROJECT_LOCALE", message: `Project locale ${project.metadata.locale} is unsupported; English fallback will be used.` });
  if (!Array.isArray(project.components)) errors.push({ rule: "COMPONENTS_ARRAY", message: "Project components must be an array." });
  if (!Array.isArray(project.nets)) errors.push({ rule: "NETS_ARRAY", message: "Project nets must be an array." });
  const components = Array.isArray(project.components) ? project.components : [];
  const nets = Array.isArray(project.nets) ? project.nets : [];
  const ids = new Set();
  const references = new Set();
  for (const item of components) {
    if (!item || typeof item !== "object" || Array.isArray(item)) { errors.push({ rule: "COMPONENT_OBJECT", message: "Each component must be an object." }); continue; }
    if (typeof item.instanceId !== "string" || !item.instanceId || ids.has(item.instanceId)) errors.push({ rule: "COMPONENT_ID", message: `Component instance IDs must be unique (${item.reference || "unnamed"}).` });
    ids.add(item.instanceId);
    if (typeof item.reference !== "string" || !item.reference.trim() || references.has(item.reference)) errors.push({ rule: "REFERENCE", message: `Reference designators must be unique (${item.reference || "unnamed"}).` });
    references.add(item.reference);
    if (!findLibraryPart(item.libraryId)) warnings.push({ rule: "UNLOCKED_LIBRARY", message: `${item.reference || "Component"} is not in the starter library.` });
    for (const view of DESIGN_VIEWS) {
      const position = item.position?.[view];
      if (!Array.isArray(position) || position.length !== 2 || !position.every((coordinate) => Number.isFinite(coordinate) && Number.isSafeInteger(coordinate))) {
        errors.push({ rule: "LAYOUT_POSITION", message: `${item.reference || "Component"} must have two finite integer coordinates for the ${view} layout.` });
      } else if (position[0] < 0 || position[0] > 640 || position[1] < 0 || position[1] > 280) {
        errors.push({ rule: "LAYOUT_BOUNDS", message: `${item.reference || "Component"} is outside the supported ${view} canvas bounds.` });
      }
    }
  }
  for (const view of DESIGN_VIEWS) {
    for (let first = 0; first < components.length; first += 1) {
      for (let second = first + 1; second < components.length; second += 1) {
        const a = components[first];
        const b = components[second];
        if (!a || !b || typeof a !== "object" || typeof b !== "object") continue;
        const aPosition = a.position?.[view];
        const bPosition = b.position?.[view];
        if (!Array.isArray(aPosition) || !Array.isArray(bPosition) || !aPosition.every(Number.isFinite) || !bPosition.every(Number.isFinite)) continue;
        if (Math.hypot(aPosition[0] - bPosition[0], aPosition[1] - bPosition[1]) < CANVAS_LIMITS.overlapDistance) {
          warnings.push({ rule: "LAYOUT_OVERLAP", message: `${a.reference} and ${b.reference} overlap in the ${view} layout.` });
        }
      }
    }
  }
  const endpointOwners = new Map();
  const netIds = new Set();
  for (const net of nets) {
    if (!net || typeof net !== "object" || Array.isArray(net)) { errors.push({ rule: "NET_OBJECT", message: "Each net must be an object." }); continue; }
    if (typeof net.id !== "string" || !net.id.trim()) errors.push({ rule: "NET_ID", message: "Each net must have a non-empty identifier." });
    else if (netIds.has(net.id)) errors.push({ rule: "DUPLICATE_NET_ID", message: `Net identifier ${net.id} is used more than once.` });
    netIds.add(net.id);
    if (!Array.isArray(net.endpoints)) { errors.push({ rule: "NET_ENDPOINTS_ARRAY", message: `Net ${net.id || "unnamed"} endpoints must be an array.` }); continue; }
    if (net.endpoints.length < 2) warnings.push({ rule: "NET_ENDPOINTS", message: `Net ${net.id || "unnamed"} has fewer than two endpoints.` });
    const localEndpoints = new Set();
    for (const endpoint of net.endpoints ?? []) {
      const [instanceId, pin] = String(endpoint).split(":");
      const component = components.find((item) => item?.instanceId === instanceId);
      const part = component && findLibraryPart(component.libraryId);
      if (!component || !part || !part.pins.includes(pin)) {
        errors.push({ rule: "NET_ENDPOINT", message: `Net ${net.id || "unnamed"} references an unknown endpoint (${endpoint}).` });
        continue;
      }
      if (localEndpoints.has(endpoint)) errors.push({ rule: "DUPLICATE_NET_ENDPOINT", message: `Net ${net.id || "unnamed"} connects ${endpoint} more than once.` });
      localEndpoints.add(endpoint);
      if (endpointOwners.has(endpoint) && endpointOwners.get(endpoint) !== net.id) {
        errors.push({ rule: "MULTI_NET_PIN", message: `${endpoint} is assigned to both ${endpointOwners.get(endpoint)} and ${net.id}.` });
      }
      endpointOwners.set(endpoint, net.id);
    }
  }
  for (const item of components) {
    if (!item || typeof item !== "object") continue;
    const part = findLibraryPart(item.libraryId);
    if (!part) continue;
    for (const pin of part.pins) {
      if (!endpointOwners.has(endpoint(item, pin))) warnings.push({ rule: "UNCONNECTED_PIN", message: `${item.reference} pin ${pin} is not connected to a project net.` });
    }
    if (item.libraryId === "power.dc-source") {
      const sourceIsShorted = nets.some((net) => Array.isArray(net?.endpoints) && net.endpoints.includes(endpoint(item, "+")) && net.endpoints.includes(endpoint(item, "-")));
      if (sourceIsShorted) errors.push({ rule: "SOURCE_SHORT", message: `${item.reference} positive and negative pins are connected to the same net.` });
    }
  }
  if (components.length && !components.some((item) => item?.libraryId === "ground.signal")) {
    warnings.push({ rule: "NO_REFERENCE", message: "The project has no signal-ground reference component." });
  }
  return { errors, warnings, valid: errors.length === 0 };
}

function hasNet(project, ...endpoints) {
  return project.nets.some((net) => endpoints.every((endpoint) => net.endpoints.includes(endpoint)));
}

function endpoint(component, pin) {
  return `${component.instanceId}:${pin}`;
}

function voltageValue(value) {
  return engineeringValue(value, "V");
}

function resistanceValue(value) {
  return engineeringValue(value, "Ω");
}

function capacitanceValue(value) {
  return engineeringValue(value, "F");
}

function inductanceValue(value) {
  return engineeringValue(value, "H");
}

function currentValue(value) {
  return engineeringValue(value, "A");
}

function frequencyValue(value) {
  return engineeringValue(value, "Hz");
}

function forwardVoltage(value) {
  return engineeringValue(value, "V");
}

function engineeringValue(value, expectedUnit) {
  const match = String(value).trim().match(/^(?:[A-Za-z]+\s+)?([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*([pnumkKMGµμ]?)(?:\s*(Ω|ohms?|[VvFfHhAa]|[Hh][Zz]))?$/);
  if (!match) return Number.NaN;
  const unit = match[3];
  if (unit) {
    const isOhm = unit === "Ω" || /^ohms?$/i.test(unit);
    if ((expectedUnit === "Ω" && !isOhm) || (expectedUnit === "V" && !/^[Vv]$/.test(unit)) || (expectedUnit === "F" && !/^[Ff]$/.test(unit)) || (expectedUnit === "H" && !/^[Hh]$/.test(unit)) || (expectedUnit === "A" && !/^[Aa]$/.test(unit)) || (expectedUnit === "Hz" && !/^[Hh][Zz]$/.test(unit))) return Number.NaN;
  }
  const multipliers = { p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, "μ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9, "": 1 };
  const parsed = Number(match[1]) * multipliers[match[2]];
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function runSupportedAnalysis(project, { previousState } = {}) {
  const validation = validateProject(project);
  if (!validation.valid) return { state: "blocked", message: "Fix project errors before running analysis.", validation };
  const source = project.components.filter((item) => item.libraryId === "power.dc-source");
  const comparators = project.components.filter((item) => item.libraryId === "active.comparator-ideal");
  const dualComparators = project.components.filter((item) => item.libraryId === "active.comparator-dual-ideal");
  const schmittTriggers = project.components.filter((item) => item.libraryId === "active.schmitt-trigger-ideal");
  const andGates = project.components.filter((item) => item.libraryId === "active.logic-and-ideal");
  const orGates = project.components.filter((item) => item.libraryId === "active.logic-or-ideal");
  const xorGates = project.components.filter((item) => item.libraryId === "active.logic-xor-ideal");
  const norGates = project.components.filter((item) => item.libraryId === "active.logic-nor-ideal");
  const dFlipFlops = project.components.filter((item) => item.libraryId === "active.logic-dff-ideal");
  const jkFlipFlops = project.components.filter((item) => item.libraryId === "active.logic-jk-ideal");
  const fourBitCounters = project.components.filter((item) => item.libraryId === "active.logic-counter-4bit-ideal");
  const bcdDisplays = project.components.filter((item) => item.libraryId === "active.logic-bcd-display-ideal");
  const trafficFsms = project.components.filter((item) => item.libraryId === "active.logic-traffic-fsm-ideal");
  const debounceFilters = project.components.filter((item) => item.libraryId === "active.logic-debounce-ideal");
  const ringShiftRegisters = project.components.filter((item) => item.libraryId === "active.logic-ring-shift-4bit-ideal");
  const mux4s = project.components.filter((item) => item.libraryId === "active.logic-mux4-ideal");
  const decoders2to4 = project.components.filter((item) => item.libraryId === "active.logic-decoder-2to4-ideal");
  const priorityEncoders = project.components.filter((item) => item.libraryId === "active.logic-priority-encoder-4to2-ideal");
  const alu4s = project.components.filter((item) => item.libraryId === "active.logic-alu4-ideal");
  const uartTransmitters = project.components.filter((item) => item.libraryId === "active.uart-tx-ideal");
  const uartReceivers = project.components.filter((item) => item.libraryId === "active.uart-rx-ideal");
  const uartFrameSources = project.components.filter((item) => item.libraryId === "input.uart-frame-source");
  const usbUartStreams = project.components.filter((item) => item.libraryId === "input.usb-uart-console-stream");
  const usbUartBridges = project.components.filter((item) => item.libraryId === "active.usb-uart-bridge-mock");
  const serialConsoleReports = project.components.filter((item) => item.libraryId === "output.serial-console-report");
  const i2cFixtures = project.components.filter((item) => item.libraryId === "input.i2c-read-transaction");
  const i2cLevelFixtures = project.components.filter((item) => item.libraryId === "input.i2c-level-shifter-transition-fixture");
  const i2cLevelShifters = project.components.filter((item) => item.libraryId === "active.i2c-bidirectional-level-shifter-ideal");
  const i2cLevelReports = project.components.filter((item) => item.libraryId === "output.i2c-level-shifter-report");
  const i2cSensors = project.components.filter((item) => item.libraryId === "active.i2c-sensor-ideal");
  const i2cEeproms = project.components.filter((item) => item.libraryId === "active.i2c-eeprom-ideal");
  const spiFixtures = project.components.filter((item) => item.libraryId === "input.spi-transfer-source");
  const spiDisplays = project.components.filter((item) => item.libraryId === "active.spi-display-ideal");
  const mcuControllers = project.components.filter((item) => item.libraryId === "active.mcu-uno-ideal");
  const digitalSampleFixtures = project.components.filter((item) => item.libraryId === "input.digital-sample-sequence");
  const adcPotentiometers = project.components.filter((item) => item.libraryId === "input.potentiometer-adc-ideal");
  const temperatureSensors = project.components.filter((item) => item.libraryId === "sensor.temperature-analog-ideal");
  const lcdSinks = project.components.filter((item) => item.libraryId === "output.lcd-text-sink-ideal");
  const ultrasonicSensors = project.components.filter((item) => item.libraryId === "sensor.ultrasonic-echo-ideal");
  const oledSinks = project.components.filter((item) => item.libraryId === "output.oled-text-sink-ideal");
  const servoModels = project.components.filter((item) => item.libraryId === "output.servo-angle-ideal");
  const stepperDrivers = project.components.filter((item) => item.libraryId === "active.stepper-driver-ideal");
  const stepperMotors = project.components.filter((item) => item.libraryId === "output.stepper-motor-ideal");
  const esp32Formatters = project.components.filter((item) => item.libraryId === "active.esp32-telemetry-ideal");
  const payloadSinks = project.components.filter((item) => item.libraryId === "output.telemetry-payload-sink");
  const picoControllers = project.components.filter((item) => item.libraryId === "active.rp2040-pico-ideal");
  const stm32Controllers = project.components.filter((item) => item.libraryId === "active.stm32-timer-ideal");
  const picControllers = project.components.filter((item) => item.libraryId === "active.pic-adc-bargraph-ideal");
  const ledBargraphs = project.components.filter((item) => item.libraryId === "output.led-bargraph-10seg-ideal");
  const irFrames = project.components.filter((item) => item.libraryId === "input.ir-nec-frame");
  const irReceivers = project.components.filter((item) => item.libraryId === "sensor.ir-receiver-ideal");
  const avrIrDecoders = project.components.filter((item) => item.libraryId === "active.avr-ir-decoder-ideal");
  const irCodeDisplays = project.components.filter((item) => item.libraryId === "output.ir-code-display-ideal");
  const watchdogFixtures = project.components.filter((item) => item.libraryId === "input.watchdog-service-sequence");
  const watchdogControllers = project.components.filter((item) => item.libraryId === "active.mcu-watchdog-ideal");
  const watchdogDisplays = project.components.filter((item) => item.libraryId === "output.watchdog-status-display");
  const canFrames = project.components.filter((item) => item.libraryId === "input.can-frame-fixture");
  const canNodes = project.components.filter((item) => item.libraryId === "active.can-node-ideal");
  const canTransceivers = project.components.filter((item) => item.libraryId === "active.can-transceiver-ideal");
  const canTerminations = project.components.filter((item) => item.libraryId === "passive.can-termination");
  const canDisplays = project.components.filter((item) => item.libraryId === "output.can-frame-display");
  const rs485Polls = project.components.filter((item) => item.libraryId === "input.rs485-poll-fixture");
  const rs485Masters = project.components.filter((item) => item.libraryId === "active.rs485-master-ideal");
  const rs485Nodes = project.components.filter((item) => item.libraryId === "active.rs485-sensor-node-ideal");
  const rs485Transceivers = project.components.filter((item) => item.libraryId === "active.rs485-transceiver-ideal");
  const rs485Terminations = project.components.filter((item) => item.libraryId === "passive.rs485-termination");
  const rs485Sensors = project.components.filter((item) => item.libraryId === "sensor.rs485-temperature-ideal");
  const rs485Displays = project.components.filter((item) => item.libraryId === "output.rs485-poll-display");
  const gnssFixtures = project.components.filter((item) => item.libraryId === "sensor.gnss-nmea-ideal");
  const gnssParsers = project.components.filter((item) => item.libraryId === "active.gnss-nmea-parser-ideal");
  const gnssDisplays = project.components.filter((item) => item.libraryId === "output.gnss-position-display");
  const rfidFixtures = project.components.filter((item) => item.libraryId === "input.rfid-uid-fixture");
  const rfidInventoryFixtures = project.components.filter((item) => item.libraryId === "input.rfid-inventory-fixture");
  const rfidInventoryReaders = project.components.filter((item) => item.libraryId === "active.rfid-inventory-reader-ideal");
  const rfidInventoryReports = project.components.filter((item) => item.libraryId === "output.rfid-inventory-report");
  const rfidReaders = project.components.filter((item) => item.libraryId === "active.rfid-uid-reader-ideal");
  const rfidControllers = project.components.filter((item) => item.libraryId === "active.rfid-access-controller-ideal");
  const lockIndicators = project.components.filter((item) => item.libraryId === "output.lock-state-indicator-ideal");
  const nfcTags = project.components.filter((item) => item.libraryId === "sensor.nfc-tag-ideal");
  const nfcReaders = project.components.filter((item) => item.libraryId === "active.nfc-reader-ideal");
  const nfcControllers = project.components.filter((item) => item.libraryId === "active.nfc-display-controller-ideal");
  const nfcDisplays = project.components.filter((item) => item.libraryId === "output.nfc-uid-display");
  const fmSweeps = project.components.filter((item) => item.libraryId === "input.fm-frequency-sweep");
  const fmAntennas = project.components.filter((item) => item.libraryId === "passive.fm-antenna-ideal");
  const fmTuners = project.components.filter((item) => item.libraryId === "passive.fm-tuning-network-ideal");
  const fmAmplifiers = project.components.filter((item) => item.libraryId === "active.fm-audio-gain-ideal");
  const fmReports = project.components.filter((item) => item.libraryId === "output.fm-response-report");
  const irActionDecoders = project.components.filter((item) => item.libraryId === "active.ir-remote-action-decoder");
  const irActionDisplays = project.components.filter((item) => item.libraryId === "output.ir-action-display");
  const ethernetConfigs = project.components.filter((item) => item.libraryId === "input.ethernet-sensor-config");
  const ethernetControllers = project.components.filter((item) => item.libraryId === "active.ethernet-sensor-controller-ideal");
  const ethernetPhys = project.components.filter((item) => item.libraryId === "active.ethernet-phy-mock");
  const ethernetReports = project.components.filter((item) => item.libraryId === "output.ethernet-frame-report");
  const wifiCommands = project.components.filter((item) => item.libraryId === "input.wifi-relay-command");
  const wifiControllers = project.components.filter((item) => item.libraryId === "active.wifi-relay-controller-ideal");
  const wifiModules = project.components.filter((item) => item.libraryId === "active.wifi-module-mock");
  const wifiDrivers = project.components.filter((item) => item.libraryId === "active.wifi-relay-driver-ideal");
  const gsmEvents = project.components.filter((item) => item.libraryId === "input.gsm-alarm-event");
  const gsmControllers = project.components.filter((item) => item.libraryId === "active.gsm-alarm-controller-ideal");
  const gsmModems = project.components.filter((item) => item.libraryId === "active.gsm-modem-at-mock");
  const gsmReports = project.components.filter((item) => item.libraryId === "output.gsm-sms-report");
  const loraFixtures = project.components.filter((item) => item.libraryId === "input.lora-temperature-fixture");
  const loraControllers = project.components.filter((item) => item.libraryId === "active.lora-node-controller-ideal");
  const loraRadios = project.components.filter((item) => item.libraryId === "active.lora-radio-payload-ideal");
  const loraReports = project.components.filter((item) => item.libraryId === "output.lora-duty-report");
  const bleSettings = project.components.filter((item) => item.libraryId === "input.ble-advertising-settings");
  const bleEncoders = project.components.filter((item) => item.libraryId === "active.ble-advertising-encoder-ideal");
  const bleAdvertisers = project.components.filter((item) => item.libraryId === "active.ble-advertiser-ideal");
  const bleReports = project.components.filter((item) => item.libraryId === "output.ble-advertising-report");
  const interruptFixtures = project.components.filter((item) => item.libraryId === "input.interrupt-edge-sequence-ideal");
  const lowPowerControllers = project.components.filter((item) => item.libraryId === "active.low-power-mcu-ideal");
  const dataLogFixtures = project.components.filter((item) => item.libraryId === "input.data-log-samples");
  const dataLogControllers = project.components.filter((item) => item.libraryId === "active.data-logger-controller-ideal");
  const ringEeproms = project.components.filter((item) => item.libraryId === "active.eeprom-ring-buffer-ideal");
  const dataLogDisplays = project.components.filter((item) => item.libraryId === "output.data-log-display");
  const timers555 = project.components.filter((item) => item.libraryId === "active.ne555");
  const timers556 = project.components.filter((item) => item.libraryId === "active.ne556");
  const opAmps = project.components.filter((item) => item.libraryId === "active.opamp-ideal");
  const audioAmplifiers = project.components.filter((item) => item.libraryId === "active.audio-amp-generic");
  const speakers = project.components.filter((item) => item.libraryId === "passive.speaker-r-l-generic");
  const electretMics = project.components.filter((item) => item.libraryId === "sensor.electret-mic-generic");
  const electretMeterPreamps = project.components.filter((item) => item.libraryId === "active.electret-envelope-preamp-ideal");
  const audioEnvelopeRectifiers = project.components.filter((item) => item.libraryId === "active.audio-envelope-rectifier-ideal");
  const audioLevelLedBars = project.components.filter((item) => item.libraryId === "output.audio-level-ledbar-ideal");
  const audioToneSettings = project.components.filter((item) => item.libraryId === "input.audio-tone-settings");
  const audioToneGenerators = project.components.filter((item) => item.libraryId === "active.audio-tone-generator-ideal");
  const audioSpectrumReports = project.components.filter((item) => item.libraryId === "output.audio-spectrum-report");
  const guitarPickupSweeps = project.components.filter((item) => item.libraryId === "input.guitar-pickup-frequency-sweep");
  const guitarBuffers = project.components.filter((item) => item.libraryId === "active.guitar-jfet-buffer-ideal");
  const guitarBufferReports = project.components.filter((item) => item.libraryId === "output.guitar-buffer-response");
  const audioMixerFixtures = project.components.filter((item) => item.libraryId === "input.audio-mixer-two-source");
  const audioMixerBuffers = project.components.filter((item) => item.libraryId === "active.audio-summing-buffer-ideal");
  const audioMixerReports = project.components.filter((item) => item.libraryId === "output.audio-mixer-report");
  const pwmDacSettings = project.components.filter((item) => item.libraryId === "input.pwm-dac-settings");
  const pwmWaveformSources = project.components.filter((item) => item.libraryId === "active.pwm-waveform-source-ideal");
  const pwmDacReports = project.components.filter((item) => item.libraryId === "output.pwm-dac-report");
  const npnTransistors = project.components.filter((item) => item.libraryId === "active.npn-small-signal");
  const pwmSources = project.components.filter((item) => item.libraryId === "power.pwm-source");
  const mosfets = project.components.filter((item) => item.libraryId === "active.nmos-switch");
  const pmosSwitches = project.components.filter((item) => item.libraryId === "active.pmos-high-side-ideal");
  const transformers = project.components.filter((item) => item.libraryId === "passive.transformer-ideal");
  const bridges = project.components.filter((item) => item.libraryId === "diode.bridge-ideal");
  const zeners = project.components.filter((item) => item.libraryId === "diode.zener-ideal");
  const tvsDiodes = project.components.filter((item) => item.libraryId === "protection.tvs-ideal");

  const regulators = project.components.filter((item) => item.libraryId === "active.regulator-7805-ideal");
  const usbSources = project.components.filter((item) => item.libraryId === "power.usb-source");
  const ptcFuses = project.components.filter((item) => item.libraryId === "protection.ptc-polyfuse");
  const solarCells = project.components.filter((item) => item.libraryId === "power.solar-cell");
  const batteries = project.components.filter((item) => item.libraryId === "power.rechargeable-battery");
  const photoresistors = project.components.filter((item) => item.libraryId === "passive.ldr");
  const ntcs = project.components.filter((item) => item.libraryId === "passive.ntc-thermistor");
  const supercapacitors = project.components.filter((item) => item.libraryId === "passive.supercapacitor");
  const toneControls = project.components.filter((item) => item.libraryId === "passive.potentiometer");
  const schottkyDiodes = project.components.filter((item) => item.libraryId === "diode.schottky");
  const currentSource = project.components.filter((item) => item.libraryId === "power.dc-current-source");
  const acSource = project.components.filter((item) => item.libraryId === "power.ac-source");
  const resistor = project.components.filter((item) => item.libraryId === "passive.resistor");
  const capacitor = project.components.filter((item) => item.libraryId === "passive.capacitor");
  const inductor = project.components.filter((item) => item.libraryId === "passive.inductor");
  const switches = project.components.filter((item) => item.libraryId === "input.spdt-switch");
  const pushbuttons = project.components.filter((item) => item.libraryId === "input.pushbutton");
  const led = project.components.filter((item) => item.libraryId === "diode.led-red");
  const greenLed = project.components.filter((item) => item.libraryId === "diode.led-green");
  const ground = project.components.filter((item) => item.libraryId === "ground.signal");
  if (source.length === 1 && tvsDiodes.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 5) {
    return analyseTvsPulseClamp(project, { source: source[0], resistors: resistor, tvs: tvsDiodes[0], ground: ground[0], validation });
  }
  if (source.length === 1 && ntcs.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 4) {
    return analyseNtcTemperatureDivider(project, { source: source[0], ntc: ntcs[0], resistor: resistor[0], ground: ground[0], validation });
  }
  if (source.length === 1 && zeners.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 5) {
    return analyseZenerShuntRegulator(project, { source: source[0], resistors: resistor, zener: zeners[0], ground: ground[0], validation });
  }
  if (acSource.length === 1 && bridges.length === 1 && resistor.length === 1 && capacitor.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseBridgeSmoothingCapacitor(project, { source: acSource[0], bridge: bridges[0], load: resistor[0], capacitor: capacitor[0], ground: ground[0], validation });
  }
  if (acSource.length === 1 && bridges.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 4) {
    return analyseBridgeRectifier(project, { source: acSource[0], bridge: bridges[0], load: resistor[0], ground: ground[0], validation });
  }
  if (acSource.length === 1 && toneControls.length === 1 && capacitor.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analysePassiveToneControl(project, { source: acSource[0], control: toneControls[0], capacitor: capacitor[0], load: resistor[0], ground: ground[0], validation });
  }
  if (source.length === 5 && pmosSwitches.length === 2 && mosfets.length === 2 && resistor.length === 1 && inductor.length === 1 && ground.length === 1 && project.components.length === 12) {
    return analyseHBridgeMotor(project, { sources: source, pmosSwitches, nmosSwitches: mosfets, motorResistance: resistor[0], motorInductor: inductor[0], ground: ground[0], validation });
  }
  if (source.length === 2 && pmosSwitches.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 6) {
    return analysePmosHighSideSwitch(project, { sources: source, mosfet: pmosSwitches[0], resistors: resistor, ground: ground[0], validation });
  }
  if (source.length === 2 && mosfets.length === 1 && schottkyDiodes.length === 1 && resistor.length === 1 && inductor.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseNmosLowSideSwitch(project, { sources: source, mosfet: mosfets[0], diode: schottkyDiodes[0], coilResistance: resistor[0], coil: inductor[0], ground: ground[0], validation });
  }
  if (source.length === 1 && schottkyDiodes.length === 1 && supercapacitors.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseSupercapHoldUp(project, { source: source[0], diode: schottkyDiodes[0], capacitor: supercapacitors[0], load: resistor[0], ground: ground[0], validation });
  }
  if (stm32Controllers.length === 1 && source.length === 1 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseStm32TimerPwm(project, { source: source[0], controller: stm32Controllers[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (picControllers.length === 1 && adcPotentiometers.length === 1 && ledBargraphs.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analysePicAdcBargraph(project, { source: source[0], potentiometer: adcPotentiometers[0], pic: picControllers[0], bargraph: ledBargraphs[0], ground: ground[0], validation });
  }
  if (dataLogFixtures.length === 1 && dataLogControllers.length === 1 && ringEeproms.length === 1 && dataLogDisplays.length === 1 && resistor.length === 2 && source.length === 1 && ground.length === 1 && project.components.length === 8) {
    return analyseEepromRingLogger(project, { source: source[0], fixture: dataLogFixtures[0], controller: dataLogControllers[0], eeprom: ringEeproms[0], display: dataLogDisplays[0], pullups: resistor, ground: ground[0], validation });
  }
  if (fmSweeps.length === 1 && fmAntennas.length === 1 && fmTuners.length === 1 && fmAmplifiers.length === 1 && fmReports.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseFmFrontEnd(project, { source: source[0], sweep: fmSweeps[0], antenna: fmAntennas[0], tuner: fmTuners[0], amplifier: fmAmplifiers[0], report: fmReports[0], ground: ground[0], validation });
  }
  if (irFrames.length === 1 && irReceivers.length === 1 && irActionDecoders.length === 1 && irActionDisplays.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseIrRemoteActions(project, { source: source[0], frame: irFrames[0], receiver: irReceivers[0], decoder: irActionDecoders[0], display: irActionDisplays[0], ground: ground[0], validation });
  }
  if (ethernetConfigs.length === 1 && ethernetControllers.length === 1 && ethernetPhys.length === 1 && ethernetReports.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseEthernetSensorFrame(project, { source: source[0], config: ethernetConfigs[0], controller: ethernetControllers[0], phy: ethernetPhys[0], report: ethernetReports[0], ground: ground[0], validation });
  }
  if (wifiCommands.length === 1 && wifiControllers.length === 1 && wifiModules.length === 1 && wifiDrivers.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseWifiRelayControl(project, { source: source[0], command: wifiCommands[0], controller: wifiControllers[0], wifi: wifiModules[0], driver: wifiDrivers[0], ground: ground[0], validation });
  }
  if (gsmEvents.length === 1 && gsmControllers.length === 1 && gsmModems.length === 1 && gsmReports.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseGsmAlarmMock(project, { source: source[0], event: gsmEvents[0], controller: gsmControllers[0], modem: gsmModems[0], report: gsmReports[0], ground: ground[0], validation });
  }
  if (loraFixtures.length === 1 && loraControllers.length === 1 && loraRadios.length === 1 && loraReports.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseLoraSensorNode(project, { source: source[0], fixture: loraFixtures[0], controller: loraControllers[0], radio: loraRadios[0], report: loraReports[0], ground: ground[0], validation });
  }
  if (bleSettings.length === 1 && bleEncoders.length === 1 && bleAdvertisers.length === 1 && bleReports.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseBleBeaconConfig(project, { source: source[0], settings: bleSettings[0], encoder: bleEncoders[0], advertiser: bleAdvertisers[0], report: bleReports[0], ground: ground[0], validation });
  }
  if (interruptFixtures.length === 1 && lowPowerControllers.length === 1 && source.length === 1 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseLowPowerSleepWake(project, { source: source[0], fixture: interruptFixtures[0], controller: lowPowerControllers[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (nfcTags.length === 1 && nfcReaders.length === 1 && nfcControllers.length === 1 && nfcDisplays.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseNfcUidDisplay(project, { source: source[0], tag: nfcTags[0], reader: nfcReaders[0], controller: nfcControllers[0], display: nfcDisplays[0], ground: ground[0], validation });
  }
  if (rfidInventoryFixtures.length === 1 && rfidInventoryReaders.length === 1 && rfidInventoryReports.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseRfidInventory(project, { source: source[0], fixture: rfidInventoryFixtures[0], reader: rfidInventoryReaders[0], report: rfidInventoryReports[0], ground: ground[0], validation });
  }
  if (rfidFixtures.length === 1 && rfidReaders.length === 1 && rfidControllers.length === 1 && lockIndicators.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseRfidAllowlist(project, { source: source[0], tag: rfidFixtures[0], reader: rfidReaders[0], controller: rfidControllers[0], indicator: lockIndicators[0], ground: ground[0], validation });
  }
  if (gnssFixtures.length === 1 && gnssParsers.length === 1 && gnssDisplays.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseGnssRmc(project, { source: source[0], gnss: gnssFixtures[0], parser: gnssParsers[0], display: gnssDisplays[0], ground: ground[0], validation });
  }
  if (rs485Polls.length === 1 && rs485Masters.length === 1 && rs485Nodes.length === 2 && rs485Transceivers.length === 3 && rs485Terminations.length === 2 && rs485Sensors.length === 2 && rs485Displays.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 14) {
    return analyseRs485PollNetwork(project, { source: source[0], poll: rs485Polls[0], master: rs485Masters[0], nodes: rs485Nodes, transceivers: rs485Transceivers, terminations: rs485Terminations, sensors: rs485Sensors, display: rs485Displays[0], ground: ground[0], validation });
  }
  if (canFrames.length === 1 && canNodes.length === 2 && canTransceivers.length === 2 && canTerminations.length === 2 && canDisplays.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 10) {
    return analyseCanNodePair(project, { source: source[0], frame: canFrames[0], nodes: canNodes, transceivers: canTransceivers, terminations: canTerminations, display: canDisplays[0], ground: ground[0], validation });
  }
  if (watchdogFixtures.length === 1 && watchdogControllers.length === 1 && watchdogDisplays.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseMcuWatchdog(project, { source: source[0], fixture: watchdogFixtures[0], mcu: watchdogControllers[0], display: watchdogDisplays[0], ground: ground[0], validation });
  }
  if (irFrames.length === 1 && irReceivers.length === 1 && avrIrDecoders.length === 1 && irCodeDisplays.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseAvrIrReceiver(project, { source: source[0], frame: irFrames[0], receiver: irReceivers[0], avr: avrIrDecoders[0], display: irCodeDisplays[0], ground: ground[0], validation });
  }
  if (picoControllers.length === 1 && source.length === 2 && resistor.length === 2 && oledSinks.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analysePicoVoltmeter(project, { sources: source, pico: picoControllers[0], resistors: resistor, oled: oledSinks[0], ground: ground[0], validation });
  }
  if (esp32Formatters.length === 1 && payloadSinks.length === 1 && temperatureSensors.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseEsp32Telemetry(project, { source: source[0], esp32: esp32Formatters[0], sensor: temperatureSensors[0], sink: payloadSinks[0], ground: ground[0], validation });
  }
  if (stepperDrivers.length === 1 && stepperMotors.length === 1 && mcuControllers.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseMcuStepper(project, { source: source[0], mcu: mcuControllers[0], driver: stepperDrivers[0], motor: stepperMotors[0], ground: ground[0], validation });
  }
  if (servoModels.length === 1 && adcPotentiometers.length === 1 && mcuControllers.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseMcuServoControl(project, { source: source[0], mcu: mcuControllers[0], potentiometer: adcPotentiometers[0], servo: servoModels[0], ground: ground[0], validation });
  }
  if (ultrasonicSensors.length === 1 && oledSinks.length === 1 && mcuControllers.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseMcuUltrasonicRanger(project, { source: source[0], mcu: mcuControllers[0], sensor: ultrasonicSensors[0], oled: oledSinks[0], ground: ground[0], validation });
  }
  if (temperatureSensors.length === 1 && lcdSinks.length === 1 && mcuControllers.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseMcuTemperatureMonitor(project, { source: source[0], mcu: mcuControllers[0], sensor: temperatureSensors[0], lcd: lcdSinks[0], ground: ground[0], validation });
  }
  if (adcPotentiometers.length === 1 && mcuControllers.length === 1 && mosfets.length === 1 && source.length === 1 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseMcuPwmDimmer(project, { source: source[0], mcu: mcuControllers[0], potentiometer: adcPotentiometers[0], mosfet: mosfets[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (digitalSampleFixtures.length === 1 && mcuControllers.length === 1 && source.length === 1 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseMcuButtonDebounce(project, { source: source[0], fixture: digitalSampleFixtures[0], mcu: mcuControllers[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (mcuControllers.length === 1 && source.length === 1 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseMcuBlink(project, { source: source[0], mcu: mcuControllers[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (spiFixtures.length === 1 && spiDisplays.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 4) {
    return analyseSpiDisplayTransfer(project, { source: source[0], fixture: spiFixtures[0], display: spiDisplays[0], ground: ground[0], validation });
  }
  if (i2cLevelFixtures.length === 1 && i2cLevelShifters.length === 1 && i2cLevelReports.length === 1 && source.length === 2 && resistor.length === 4 && ground.length === 1 && project.components.length === 10) {
    return analyseI2cLevelShifter(project, { sources: source, fixture: i2cLevelFixtures[0], shifter: i2cLevelShifters[0], report: i2cLevelReports[0], resistors: resistor, ground: ground[0], validation });
  }
  if (i2cFixtures.length === 1 && i2cEeproms.length === 1 && source.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 6) {
    return analyseI2cEepromWriteRead(project, { source: source[0], fixture: i2cFixtures[0], eeprom: i2cEeproms[0], resistors: resistor, ground: ground[0], validation });
  }
  if (i2cFixtures.length === 1 && i2cSensors.length === 1 && source.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 6) {
    return analyseI2cRegisterRead(project, { source: source[0], fixture: i2cFixtures[0], sensor: i2cSensors[0], resistors: resistor, ground: ground[0], validation });
  }
  if (usbUartStreams.length === 1 && usbUartBridges.length === 1 && serialConsoleReports.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseUsbUartConsole(project, { source: source[0], stream: usbUartStreams[0], bridge: usbUartBridges[0], report: serialConsoleReports[0], ground: ground[0], validation });
  }
  if (uartReceivers.length === 1 && uartFrameSources.length === 1 && source.length === 1 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseUartReceiver(project, { source: source[0], frameSource: uartFrameSources[0], receiver: uartReceivers[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (uartTransmitters.length === 1 && source.length === 1 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseUartTransmitter(project, { source: source[0], transmitter: uartTransmitters[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (alu4s.length === 1 && source.length === 10 && resistor.length === 5 && led.length === 5 && ground.length === 1 && project.components.length === 22) {
    return analyseAlu4(project, { sources: source, alu: alu4s[0], resistors: resistor, leds: led, ground: ground[0], validation });
  }
  if (priorityEncoders.length === 1 && source.length === 5 && resistor.length === 3 && led.length === 3 && ground.length === 1 && project.components.length === 13) {
    return analysePriorityEncoder(project, { sources: source, encoder: priorityEncoders[0], resistors: resistor, leds: led, ground: ground[0], validation });
  }
  if (decoders2to4.length === 1 && source.length === 3 && resistor.length === 4 && led.length === 4 && ground.length === 1 && project.components.length === 13) {
    return analyseDecoder2to4(project, { sources: source, decoder: decoders2to4[0], resistors: resistor, leds: led, ground: ground[0], validation });
  }
  if (mux4s.length === 1 && source.length === 7 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 11) {
    return analyseMux4(project, { sources: source, mux: mux4s[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (ringShiftRegisters.length === 1 && source.length === 3 && resistor.length === 4 && led.length === 4 && ground.length === 1 && project.components.length === 13) {
    return analyseRingShiftChaser(project, { sources: source, register: ringShiftRegisters[0], resistors: resistor, leds: led, ground: ground[0], previousState, validation });
  }
  if (debounceFilters.length === 1 && source.length === 4 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 8) {
    return analyseDigitalDebounce(project, { sources: source, filter: debounceFilters[0], resistor: resistor[0], led: led[0], ground: ground[0], previousState, validation });
  }
  if (trafficFsms.length === 1 && source.length === 3 && resistor.length === 6 && led.length === 6 && ground.length === 1 && project.components.length === 17) {
    return analyseTrafficLightFsm(project, { sources: source, fsm: trafficFsms[0], resistors: resistor, leds: led, ground: ground[0], previousState, validation });
  }
  if (bcdDisplays.length === 1 && source.length === 3 && resistor.length === 7 && led.length === 7 && ground.length === 1 && project.components.length === 19) {
    return analyseBcdCounterDisplay(project, { sources: source, counter: bcdDisplays[0], resistors: resistor, leds: led, ground: ground[0], previousState, validation });
  }
  if (fourBitCounters.length === 1 && source.length === 3 && resistor.length === 4 && led.length === 4 && ground.length === 1 && project.components.length === 13) {
    return analyseFourBitCounter(project, { sources: source, counter: fourBitCounters[0], resistors: resistor, leds: led, ground: ground[0], previousState, validation });
  }
  if (jkFlipFlops.length === 1 && source.length === 5 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 9) {
    return analyseJkFlipFlop(project, { sources: source, flipFlop: jkFlipFlops[0], resistor: resistor[0], led: led[0], ground: ground[0], previousState, validation });
  }
  if (dFlipFlops.length === 1 && source.length === 3 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseDFlipFlop(project, { sources: source, flipFlop: dFlipFlops[0], resistor: resistor[0], led: led[0], ground: ground[0], previousState, validation });
  }
  if (norGates.length === 2 && source.length === 3 && resistor.length === 2 && led.length === 2 && ground.length === 1 && project.components.length === 10) {
    return analyseNorSrLatch(project, { sources: source, gates: norGates, resistors: resistor, leds: led, ground: ground[0], previousState, validation });
  }
  if (xorGates.length === 1 && source.length === 3 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseLogicGateTruthTable(project, { sources: source, gate: xorGates[0], resistor: resistor[0], led: led[0], ground: ground[0], validation, logic: "xor" });
  }
  if (orGates.length === 1 && source.length === 3 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseLogicGateTruthTable(project, { sources: source, gate: orGates[0], resistor: resistor[0], led: led[0], ground: ground[0], validation, logic: "or" });
  }
  if (andGates.length === 1 && source.length === 3 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseLogicGateTruthTable(project, { sources: source, gate: andGates[0], resistor: resistor[0], led: led[0], ground: ground[0], validation, logic: "and" });
  }
  if (dualComparators.length === 2 && andGates.length === 1 && source.length === 2 && resistor.length === 4 && led.length === 1 && ground.length === 1 && project.components.length === 11) {
    return analyseWindowComparator(project, { sources: source, comparators: dualComparators, gate: andGates[0], resistors: resistor, led: led[0], ground: ground[0], validation });
  }
  if (schmittTriggers.length === 1 && source.length === 3 && resistor.length === 4 && led.length === 1 && ground.length === 1 && project.components.length === 10) {
    return analyseSchmittTrigger(project, { sources: source, comparator: schmittTriggers[0], resistors: resistor, led: led[0], ground: ground[0], previousState, validation });
  }
  if (dualComparators.length === 1 && source.length === 2 && resistor.length === 3 && led.length === 1 && ground.length === 1 && project.components.length === 8) {
    return analyseComparatorThreshold(project, { sources: source, comparator: dualComparators[0], resistors: resistor, led: led[0], ground: ground[0], validation });
  }
  if (npnTransistors.length === 1 && source.length === 2 && acSource.length === 0 && schottkyDiodes.length === 1 && resistor.length === 2 && inductor.length === 1 && ground.length === 1 && project.components.length === 8) {
    return analyseNpnRelayDriver(project, { sources: source, transistor: npnTransistors[0], diode: schottkyDiodes[0], resistors: resistor, coil: inductor[0], ground: ground[0], validation });
  }
  if (npnTransistors.length === 1 && source.length === 2 && acSource.length === 0 && resistor.length === 1 && capacitor.length === 0 && ground.length === 1 && project.components.length === 5) {
    return analyseNpnEmitterFollower(project, { sources: source, transistor: npnTransistors[0], load: resistor[0], ground: ground[0], validation });
  }
  if (npnTransistors.length === 1 && source.length === 1 && acSource.length === 1 && resistor.length === 5 && capacitor.length === 2 && ground.length === 1 && project.components.length === 11) {
    return analyseNpnCommonEmitter(project, { source: source[0], input: acSource[0], transistor: npnTransistors[0], resistors: resistor, capacitors: capacitor, ground: ground[0], validation });
  }
  if (opAmps.length === 1 && source.length === 3 && acSource.length === 0 && resistor.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseReferenceBuffer(project, { sources: source, opAmp: opAmps[0], load: resistor[0], ground: ground[0], validation });
  }
  if (audioAmplifiers.length === 1 && speakers.length === 1 && source.length === 1 && acSource.length === 1 && capacitor.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseAudioPowerAmplifier(project, { source: source[0], input: acSource[0], amplifier: audioAmplifiers[0], coupling: capacitor[0], speaker: speakers[0], ground: ground[0], validation });
  }
  if (opAmps.length === 1 && source.length === 2 && acSource.length === 1 && resistor.length === 3 && capacitor.length === 1 && ground.length === 1 && project.components.length === 9) {
    return analyseActiveLowPass(project, { sources: source, input: acSource[0], opAmp: opAmps[0], resistors: resistor, capacitor: capacitor[0], ground: ground[0], validation });
  }
  if (pwmDacSettings.length === 1 && pwmWaveformSources.length === 1 && pwmDacReports.length === 1 && source.length === 1 && resistor.length === 2 && capacitor.length === 1 && ground.length === 1 && project.components.length === 8) {
    return analysePwmDac(project, { source: source[0], settings: pwmDacSettings[0], pwm: pwmWaveformSources[0], report: pwmDacReports[0], resistors: resistor, capacitor: capacitor[0], ground: ground[0], validation });
  }
  if (audioMixerFixtures.length === 1 && audioMixerBuffers.length === 1 && audioMixerReports.length === 1 && source.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 7) {
    return analyseAudioMixer(project, { source: source[0], fixture: audioMixerFixtures[0], buffer: audioMixerBuffers[0], report: audioMixerReports[0], resistors: resistor, ground: ground[0], validation });
  }
  if (guitarPickupSweeps.length === 1 && guitarBuffers.length === 1 && guitarBufferReports.length === 1 && source.length === 1 && resistor.length === 2 && capacitor.length === 1 && ground.length === 1 && project.components.length === 8) {
    return analyseGuitarBuffer(project, { source: source[0], fixture: guitarPickupSweeps[0], buffer: guitarBuffers[0], report: guitarBufferReports[0], resistors: resistor, capacitor: capacitor[0], ground: ground[0], validation });
  }
  if (audioToneSettings.length === 1 && audioToneGenerators.length === 1 && audioSpectrumReports.length === 1 && source.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseAudioTone(project, { source: source[0], settings: audioToneSettings[0], generator: audioToneGenerators[0], report: audioSpectrumReports[0], ground: ground[0], validation });
  }
  if (electretMics.length === 1 && electretMeterPreamps.length === 1 && audioEnvelopeRectifiers.length === 1 && audioLevelLedBars.length === 1 && source.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseElectretMicMeter(project, { source: source[0], microphone: electretMics[0], biasResistor: resistor[0], preamp: electretMeterPreamps[0], rectifier: audioEnvelopeRectifiers[0], bargraph: audioLevelLedBars[0], ground: ground[0], validation });
  }
  if (opAmps.length === 1 && electretMics.length === 1 && source.length === 1 && resistor.length === 6 && capacitor.length === 2 && ground.length === 1 && project.components.length === 12) {
    return analyseElectretAudioPreamp(project, { source: source[0], microphone: electretMics[0], opAmp: opAmps[0], resistors: resistor, capacitors: capacitor, ground: ground[0], validation });
  }
  if (opAmps.length === 1 && source.length === 2 && acSource.length === 0 && resistor.length === 4 && capacitor.length === 2 && schottkyDiodes.length === 2 && ground.length === 1 && project.components.length === 12) {
    return analyseWienBridgeOscillator(project, { sources: source, opAmp: opAmps[0], resistors: resistor, capacitors: capacitor, diodes: schottkyDiodes, ground: ground[0], validation });
  }
  if (opAmps.length === 1 && source.length === 2 && acSource.length === 1 && ((resistor.length === 2 && project.components.length === 7) || (resistor.length === 0 && project.components.length === 5)) && ground.length === 1) {
    return analyseOpAmpAmplifier(project, { sources: source, input: acSource[0], opAmp: opAmps[0], resistors: resistor, ground: ground[0], validation });
  }
  if (source.length === 1 && timers556.length === 1 && resistor.length === 6 && capacitor.length === 4 && led.length === 2 && ground.length === 1 && project.components.length === 15) {
    return analyseNe556DualAstable(project, { source: source[0], timer: timers556[0], resistors: resistor, capacitors: capacitor, leds: led, ground: ground[0], validation });
  }
  if (source.length === 1 && timers555.length === 1 && pushbuttons.length === 1 && resistor.length === 3 && capacitor.length === 2 && led.length === 1 && ground.length === 1 && project.components.length === 10) {
    return analyseNe555Monostable(project, { source: source[0], timer: timers555[0], pushbutton: pushbuttons[0], resistors: resistor, capacitors: capacitor, led: led[0], ground: ground[0], validation });
  }
  if (source.length === 1 && timers555.length === 1 && resistor.length === 3 && capacitor.length === 2 && led.length === 1 && ground.length === 1 && project.components.length === 9) {
    return analyseNe555Astable(project, { source: source[0], timer: timers555[0], resistors: resistor, capacitors: capacitor, led: led[0], ground: ground[0], validation });
  }
  if (source.length === 1 && photoresistors.length === 1 && comparators.length === 1 && led.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 7) {
    return analyseLdrNightLight(project, { source: source[0], ldr: photoresistors[0], comparator: comparators[0], led: led[0], resistors: resistor, ground: ground[0], validation });
  }
  if (solarCells.length === 1 && batteries.length === 1 && photoresistors.length === 1 && schottkyDiodes.length === 1 && mosfets.length === 1 && led.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 9) {
    return analyseSolarGardenLight(project, { solar: solarCells[0], battery: batteries[0], ldr: photoresistors[0], diode: schottkyDiodes[0], mosfet: mosfets[0], led: led[0], resistors: resistor, ground: ground[0], validation });
  }
  if (usbSources.length === 1 && ptcFuses.length === 1 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseUsbLedPtc(project, { source: usbSources[0], fuse: ptcFuses[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (acSource.length === 1 && transformers.length === 1 && bridges.length === 1 && regulators.length === 1 && capacitor.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseLinearSupply(project, { source: acSource[0], transformer: transformers[0], bridge: bridges[0], capacitor: capacitor[0], regulator: regulators[0], load: resistor[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 3 && led.length === 1 && comparators.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseBatteryDischargeMonitor(project, { source: source[0], resistors: resistor, led: led[0], comparator: comparators[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 1 && led.length === 1 && pwmSources.length === 1 && mosfets.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analysePwmLedAverage(project, { source: source[0], resistor: resistor[0], led: led[0], pwmSource: pwmSources[0], mosfet: mosfets[0], ground: ground[0], validation });
  }
  if (currentSource.length > 0 && !project.components.every((item) => ["power.dc-source", "power.dc-current-source", "passive.resistor", "ground.signal"].includes(item.libraryId))) {
    return { state: "unsupported", message: "This DC current-source model supports resistor networks with ideal voltage/current sources only; reactive or nonlinear parts are not solved by this analysis.", validation };
  }
  if (source.length === 1 && resistor.length === 2 && led.length === 1 && greenLed.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseLedPolarityIndicator(project, { source: source[0], resistors: resistor, redLed: led[0], greenLed: greenLed[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 1 && led.length === 1 && switches.length === 1 && pushbuttons.length === 0 && ground.length === 1 && greenLed.length === 0 && project.components.length === 5) {
    return analyseLatchingLedSwitch(project, { source: source[0], resistor: resistor[0], led: led[0], switchPart: switches[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 2 && led.length === 1 && pushbuttons.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analysePushbuttonLed(project, { source: source[0], resistors: resistor, led: led[0], pushbutton: pushbuttons[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 1 && led.length === 1 && pushbuttons.length === 0 && ground.length === 1 && project.components.length === 4) {
    return analyseLedCurrentLimiter(project, { source: source[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 2 && led.length === 0 && ground.length >= 1) {
    const divider = findVoltageDivider(project, source[0], resistor, ground[0]);
    if (divider) return analyseVoltageDivider(project, { source: source[0], ground: ground[0], validation, ...divider });
  }
  if (source.length === 1 && resistor.length === 1 && capacitor.length === 1 && led.length === 0 && ground.length === 1 && project.components.length === 4) return analyseRcStep(project, { source: source[0], resistor: resistor[0], capacitor: capacitor[0], ground: ground[0], validation });
  if (source.length === 1 && resistor.length === 1 && capacitor.length === 1 && switches.length === 1 && led.length === 0 && ground.length === 1 && project.components.length === 5) return analyseRcSwitchedResponse(project, { source: source[0], resistor: resistor[0], capacitor: capacitor[0], switchPart: switches[0], ground: ground[0], validation });
  if (acSource.length === 1 && source.length === 0 && resistor.length === 1 && inductor.length === 1 && led.length === 0 && ground.length === 1 && project.components.length === 4) return analyseRlLowPass(project, { source: acSource[0], resistor: resistor[0], inductor: inductor[0], ground: ground[0], validation });
  if (acSource.length === 1 && source.length === 0 && resistor.length === 1 && capacitor.length === 1 && led.length === 0 && ground.length === 1 && project.components.length === 4) {
    const highPass = analyseRcHighPass(project, { source: acSource[0], resistor: resistor[0], capacitor: capacitor[0], ground: ground[0], validation });
    if (highPass) return highPass;
    return analyseRcLowPass(project, { source: acSource[0], resistor: resistor[0], capacitor: capacitor[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 1 && inductor.length === 1 && led.length === 0 && ground.length === 1 && project.components.length === 4) return analyseRlStep(project, { source: source[0], resistor: resistor[0], inductor: inductor[0], ground: ground[0], validation });
  if (source.length === 1 && resistor.length > 0 && resistor.length === project.components.length - source.length - ground.length && ground.length >= 1) {
    return analyseResistiveNetwork(project, { source: source[0], resistors: resistor, ground: ground[0], validation });
  }
  if ((source.length > 1 || currentSource.length > 0) && resistor.length > 0 && ground.length === 1
    && project.components.every((item) => ["power.dc-source", "power.dc-current-source", "passive.resistor", "ground.signal"].includes(item.libraryId))) {
    return analyseMultiSourceResistiveNetwork(project, { sources: source, currentSources: currentSource, resistors: resistor, ground: ground[0], validation });
  }
  return { state: "unsupported", message: "This foundation supports only documented analytical DC circuits, linear resistor networks with ideal voltage/current sources, single-pole RC/RL step responses, and first-order RC/RL low-pass or RC high-pass frequency responses. General SPICE, nonlinear, digital, and mixed-signal simulation is not implemented.", validation };
}

function analysePwmLedAverage(project, { source, resistor, led, pwmSource, mosfet, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const ledVf = forwardVoltage(led.value);
  const resistance = resistanceValue(resistor.value);
  const thresholdVoltage = voltageValue(mosfet.value);
  const pwmFields = String(pwmSource.value).split(",").map((field) => field.trim());
  const frequencyHz = pwmFields.length === 3 ? frequencyValue(pwmFields[0]) : Number.NaN;
  const dutyMatch = pwmFields.length === 3 ? pwmFields[1].match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))%$/) : null;
  const requestedDutyPercent = dutyMatch ? Number(dutyMatch[1]) : Number.NaN;
  const gateHighVoltage = pwmFields.length === 3 ? voltageValue(pwmFields[2]) : Number.NaN;
  if (![sourceVoltage, ledVf, resistance, thresholdVoltage, frequencyHz, requestedDutyPercent, gateHighVoltage].every(Number.isFinite)
    || sourceVoltage <= 0 || ledVf <= 0 || resistance <= 0 || thresholdVoltage < 0 || frequencyHz <= 0
    || requestedDutyPercent < 0 || requestedDutyPercent > 100 || gateHighVoltage < 0) {
    return { state: "blocked", message: "The PWM LED model requires positive supply, LED, resistor, threshold and frequency values, plus duty from 0% to 100% and non-negative gate voltage.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const ledAnode = netByEndpoint.get(endpoint(led, "A"));
  const ledCathode = netByEndpoint.get(endpoint(led, "K"));
  const mosfetDrain = netByEndpoint.get(endpoint(mosfet, "D"));
  const mosfetSource = netByEndpoint.get(endpoint(mosfet, "S"));
  const mosfetGate = netByEndpoint.get(endpoint(mosfet, "G"));
  const pwmPositive = netByEndpoint.get(endpoint(pwmSource, "+"));
  const pwmNegative = netByEndpoint.get(endpoint(pwmSource, "-"));
  if (!sourcePositive || sourcePositive === groundNet || sourcePositive !== resistorInput || !resistorOutput
    || resistorOutput !== ledAnode || !ledCathode || ledCathode !== mosfetDrain || !mosfetSource
    || mosfetSource !== groundNet || sourceNegative !== groundNet || pwmNegative !== groundNet
    || !mosfetGate || pwmPositive !== mosfetGate) {
    return { state: "blocked", message: "Wire source positive through the resistor and LED to MOSFET drain, MOSFET source to shared ground, and PWM positive to gate with PWM negative on ground.", validation };
  }

  const gateEnabled = gateHighVoltage > thresholdVoltage;
  const effectiveDutyFraction = gateEnabled ? requestedDutyPercent / 100 : 0;
  const onCurrentA = Math.max(0, (sourceVoltage - ledVf) / resistance);
  const averageCurrentA = effectiveDutyFraction * onCurrentA;
  const resistorPowerW = effectiveDutyFraction * onCurrentA ** 2 * resistance;
  const ledPowerW = effectiveDutyFraction * onCurrentA * ledVf;
  const sourcePowerW = effectiveDutyFraction * sourceVoltage * onCurrentA;
  if (![onCurrentA, averageCurrentA, resistorPowerW, ledPowerW, sourcePowerW].every(Number.isFinite)) {
    return { state: "blocked", message: "The PWM LED result exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical PWM LED average-current model",
    message: "Calculated average current for an ideal low-side MOSFET PWM LED switch. This model does not simulate a waveform, switching transients, MOSFET on-resistance, gate charge, current ripple, thermal behavior, device ratings, or general SPICE.",
    result: {
      kind: "pwm-led-average",
      sourceVoltage,
      ledVf,
      resistance,
      frequencyHz,
      requestedDutyPercent,
      effectiveDutyFraction,
      gateHighVoltage,
      thresholdVoltage,
      mosfetConducting: gateEnabled,
      onCurrentA,
      averageCurrentA,
      resistorPowerW,
      ledPowerW,
      sourcePowerW,
      powerBalanceW: sourcePowerW - resistorPowerW - ledPowerW
    },
    validation
  };
}

function analyseBatteryDischargeMonitor(project, { source, resistors, led, comparator, ground, validation }) {
  const batteryVoltage = voltageValue(source.value);
  const ledVf = forwardVoltage(led.value);
  const tripVoltage = voltageValue(comparator.value);
  if (![batteryVoltage, ledVf, tripVoltage].every(Number.isFinite) || batteryVoltage <= 0 || ledVf <= 0 || tripVoltage <= 0) {
    return { state: "blocked", message: "The battery monitor requires positive numeric battery, reference threshold, and LED forward voltages.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const batteryNet = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  const comparatorSupply = netByEndpoint.get(endpoint(comparator, "VCC"));
  const comparatorGround = netByEndpoint.get(endpoint(comparator, "GND"));
  const senseNet = netByEndpoint.get(endpoint(comparator, "SENSE"));
  const outputNet = netByEndpoint.get(endpoint(comparator, "OUT"));
  const ledAnode = netByEndpoint.get(endpoint(led, "A"));
  const ledCathode = netByEndpoint.get(endpoint(led, "K"));
  if (!batteryNet || batteryNet === groundNet || sourceNegative !== groundNet || comparatorSupply !== batteryNet
    || comparatorGround !== groundNet || !senseNet || senseNet === batteryNet || senseNet === groundNet
    || !outputNet || outputNet === groundNet || ledCathode !== groundNet) {
    return { state: "blocked", message: "Wire the battery to comparator supply, divider and shared ground; connect the divider midpoint to SENSE and comparator OUT through the LED resistor and LED to ground.", validation };
  }
  const between = (part, netA, netB) => {
    const a = netByEndpoint.get(endpoint(part, "1"));
    const b = netByEndpoint.get(endpoint(part, "2"));
    return (a === netA && b === netB) || (a === netB && b === netA);
  };
  const upperDivider = resistors.find(part => between(part, batteryNet, senseNet));
  const lowerDivider = resistors.find(part => part !== upperDivider && between(part, senseNet, groundNet));
  const ledResistor = resistors.find(part => part !== upperDivider && part !== lowerDivider && between(part, outputNet, ledAnode));
  if (!upperDivider || !lowerDivider || !ledResistor) {
    return { state: "blocked", message: "The monitor needs a battery-to-sense upper resistor, a sense-to-ground lower resistor, and a separate comparator-output LED resistor.", validation };
  }
  const upperResistance = resistanceValue(upperDivider.value);
  const lowerResistance = resistanceValue(lowerDivider.value);
  const ledResistance = resistanceValue(ledResistor.value);
  if (![upperResistance, lowerResistance, ledResistance].every(Number.isFinite) || upperResistance <= 0 || lowerResistance <= 0 || ledResistance <= 0) {
    return { state: "blocked", message: "Both divider resistors and the LED series resistor must have positive numeric resistance values.", validation };
  }
  const dividerResistance = upperResistance + lowerResistance;
  const dividerCurrentA = batteryVoltage / dividerResistance;
  const senseVoltage = batteryVoltage * lowerResistance / dividerResistance;
  const tripBatteryVoltage = tripVoltage * dividerResistance / lowerResistance;
  const lowBattery = senseVoltage < tripVoltage;
  const comparatorOutputVoltage = lowBattery ? batteryVoltage : 0;
  const ledCurrentA = lowBattery ? Math.max(0, (comparatorOutputVoltage - ledVf) / ledResistance) : 0;
  const dividerPowerW = dividerCurrentA ** 2 * dividerResistance;
  const ledResistorPowerW = ledCurrentA ** 2 * ledResistance;
  const ledPowerW = ledCurrentA * ledVf;
  const sourceCurrentA = dividerCurrentA + ledCurrentA;
  const sourcePowerW = batteryVoltage * sourceCurrentA;
  const powerBalanceW = sourcePowerW - dividerPowerW - ledResistorPowerW - ledPowerW;
  if (![dividerCurrentA, senseVoltage, tripBatteryVoltage, ledCurrentA, dividerPowerW, ledResistorPowerW, ledPowerW, sourceCurrentA, sourcePowerW, powerBalanceW].every(Number.isFinite)) {
    return { state: "blocked", message: "The battery monitor result exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical ideal low-battery comparator and divider",
    message: "Compared a divided battery voltage with an ideal fixed reference and calculated an LED alarm output below the trip point. The generic comparator model omits hysteresis, input bias/offset, propagation delay, output-current limits, dropout, battery chemistry, tolerance, temperature, device ratings, and general SPICE.",
    result: { kind: "battery-discharge-monitor", batteryVoltage, upperResistance, lowerResistance, ledResistance, dividerCurrentA, senseVoltage, tripVoltage, tripBatteryVoltage, lowBattery, comparatorOutputVoltage, ledOn: ledCurrentA > 0.0005, ledCurrentA, sourceCurrentA, dividerPowerW, ledResistorPowerW, ledPowerW, sourcePowerW, powerBalanceW },
    validation
  };
}

function analyseBridgeRectifier(project, { source, bridge, load, ground, validation }) {
  const sourceFields = String(source.value).split(",").map(field => field.trim());
  const rmsMatch = sourceFields.length === 2 ? sourceFields[0].match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*RMS$/i) : null;
  const sourceRmsVoltage = rmsMatch ? Number(rmsMatch[1]) : Number.NaN;
  const inputFrequencyHz = sourceFields.length === 2 ? frequencyValue(sourceFields[1]) : Number.NaN;
  const diodeDrop = voltageValue(bridge.value);
  const loadResistance = resistanceValue(load.value);
  if (![sourceRmsVoltage, inputFrequencyHz, diodeDrop, loadResistance].every(Number.isFinite)
    || sourceRmsVoltage <= 0 || inputFrequencyHz <= 0 || diodeDrop <= 0 || loadResistance <= 0) {
    return { state: "blocked", message: "The bridge model requires positive AC RMS voltage, input frequency, conducting diode drop, and load resistance.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const ac1 = n(bridge, "AC1"), ac2 = n(bridge, "AC2");
  const positive = n(bridge, "POS"), negative = n(bridge, "NEG");
  const loadPositive = n(load, "1"), loadNegative = n(load, "2"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive === sourceNegative || sourcePositive !== ac1 || sourceNegative !== ac2
    || !positive || positive === negative || loadPositive !== positive || negative !== groundNet || loadNegative !== groundNet) {
    return { state: "blocked", message: "Connect the AC source across the bridge AC inputs; connect the load across bridge positive and negative, with bridge negative referenced to ground.", validation };
  }
  const peakInputVoltage = sourceRmsVoltage * Math.SQRT2;
  const peakOutputVoltage = Math.max(0, peakInputVoltage - 2 * diodeDrop);
  const rectifiedFrequencyHz = 2 * inputFrequencyHz;
  const durationS = 2 / inputFrequencyHz;
  const intervals = 480;
  const stepS = durationS / intervals;
  const pointAt = index => {
    const timeS = index * stepS;
    const inputVoltage = peakInputVoltage * Math.sin(2 * Math.PI * inputFrequencyHz * timeS);
    const outputVoltage = Math.max(0, Math.abs(inputVoltage) - 2 * diodeDrop);
    return { timeS, inputVoltage, outputVoltage, loadCurrentA: outputVoltage / loadResistance };
  };
  const waveform = [];
  let averageVoltageIntegral = 0, rmsVoltageIntegral = 0, sourcePowerIntegral = 0;
  let previous = pointAt(0);
  waveform.push(previous);
  for (let i = 1; i <= intervals; i += 1) {
    const current = pointAt(i);
    const weight = i === intervals ? 0.5 : 1;
    const previousWeight = i === 1 ? 0.5 : 1;
    averageVoltageIntegral += (previous.outputVoltage * previousWeight + current.outputVoltage * weight) * stepS / 2;
    rmsVoltageIntegral += (previous.outputVoltage ** 2 * previousWeight + current.outputVoltage ** 2 * weight) * stepS / 2;
    const previousPower = Math.abs(previous.inputVoltage) * previous.loadCurrentA;
    const currentPower = Math.abs(current.inputVoltage) * current.loadCurrentA;
    sourcePowerIntegral += (previousPower * previousWeight + currentPower * weight) * stepS / 2;
    if (i % 5 === 0 || i === intervals) waveform.push(current);
    previous = current;
  }
  const averageOutputVoltage = averageVoltageIntegral / durationS;
  const rmsOutputVoltage = Math.sqrt(rmsVoltageIntegral / durationS);
  const averageLoadCurrentA = averageOutputVoltage / loadResistance;
  const averageLoadPowerW = rmsOutputVoltage ** 2 / loadResistance;
  const estimatedSourcePowerW = sourcePowerIntegral / durationS;
  const bridgeDissipationW = estimatedSourcePowerW - averageLoadPowerW;
  const powerBalanceW = estimatedSourcePowerW - averageLoadPowerW - bridgeDissipationW;
  if (![peakInputVoltage, peakOutputVoltage, rectifiedFrequencyHz, averageOutputVoltage, rmsOutputVoltage, averageLoadCurrentA, averageLoadPowerW, estimatedSourcePowerW, bridgeDissipationW, powerBalanceW].every(Number.isFinite)) {
    return { state: "blocked", message: "The bridge waveform exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical full-wave bridge waveform with fixed diode drops",
    message: "Generated a sampled full-wave rectified load waveform with two conducting diode drops. No smoothing capacitor is present. Diode switching, reverse recovery, source impedance, transformer behavior, component tolerance, thermal effects, ratings, and general SPICE are not modeled.",
    result: { kind: "bridge-rectifier-waveform", sourceRmsVoltage, inputFrequencyHz, peakInputVoltage, diodeDropEach: diodeDrop, peakOutputVoltage, rectifiedFrequencyHz, rippleFrequencyHz: rectifiedFrequencyHz, loadResistance, averageOutputVoltage, rmsOutputVoltage, averageLoadCurrentA, averageLoadPowerW, estimatedSourcePowerW, bridgeDissipationW, powerBalanceW, waveform },
    validation
  };
}

function analyseNtcTemperatureDivider(project, { source, ntc, resistor, ground, validation }) {
  const supplyVoltage = voltageValue(source.value);
  const fields = String(ntc.value).split(";").map(field => field.trim());
  const r25Text = fields[0]?.match(/^R25\s*(.+)$/i)?.[1];
  const betaText = fields[1]?.match(/^B\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*K$/i)?.[1];
  const temperatureText = fields[2]?.match(/^temp\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*°C$/i)?.[1];
  const r25Ohm = r25Text ? resistanceValue(r25Text) : Number.NaN;
  const betaK = betaText ? Number(betaText) : Number.NaN;
  const temperatureC = temperatureText ? Number(temperatureText) : Number.NaN;
  const fixedResistance = resistanceValue(resistor.value);
  if (![supplyVoltage, r25Ohm, betaK, temperatureC, fixedResistance].every(Number.isFinite)
    || supplyVoltage <= 0 || r25Ohm <= 0 || betaK <= 0 || temperatureC <= -273.15 || fixedResistance <= 0) {
    return { state: "blocked", message: "The NTC divider needs positive supply, R25, Beta, and fixed resistance values plus a temperature above absolute zero.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const supplyPositive = n(source, "+"), supplyNegative = n(source, "-");
  const ntcInput = n(ntc, "1"), ntcOutput = n(ntc, "2");
  const resistorInput = n(resistor, "1"), resistorOutput = n(resistor, "2"), groundNet = n(ground, "0");
  if (!supplyPositive || supplyPositive === supplyNegative || supplyPositive !== ntcInput
    || !ntcOutput || ntcOutput !== resistorInput || !groundNet || supplyNegative !== groundNet || resistorOutput !== groundNet) {
    return { state: "blocked", message: "Connect the NTC above the output node and the fixed resistor from output to ground; reference source negative to ground.", validation };
  }
  const absoluteTemperatureK = temperatureC + 273.15;
  const referenceTemperatureK = 25 + 273.15;
  const ntcResistance = r25Ohm * Math.exp(betaK * (1 / absoluteTemperatureK - 1 / referenceTemperatureK));
  const outputVoltage = supplyVoltage * fixedResistance / (ntcResistance + fixedResistance);
  const dividerCurrentA = supplyVoltage / (ntcResistance + fixedResistance);
  const samples = [0, 25, 60].map(tempC => {
    const tempK = tempC + 273.15;
    const resistanceOhm = r25Ohm * Math.exp(betaK * (1 / tempK - 1 / referenceTemperatureK));
    return { temperatureC: tempC, resistanceOhm, outputVoltage: supplyVoltage * fixedResistance / (resistanceOhm + fixedResistance) };
  });
  if (![ntcResistance, outputVoltage, dividerCurrentA, ...samples.flatMap(s => [s.resistanceOhm, s.outputVoltage])].every(Number.isFinite)) {
    return { state: "blocked", message: "The NTC model exceeds its numerically supported temperature or resistance range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical NTC Beta-law voltage-divider estimate",
    message: "Uses one Beta parameter and a 25 °C reference for the stated 0/25/60 °C sweep. It omits part-specific calibration, tolerance, self-heating, thermal lag, and hardware qualification.",
    result: { kind: "ntc-temperature-divider", supplyVoltage, referenceResistanceAt25C: r25Ohm, betaK, temperatureC, ntcResistance, fixedResistance, outputVoltage, dividerCurrentA, samples },
    validation
  };
}

function analyseTvsPulseClamp(project, { source, resistors, tvs, ground, validation }) {
  const sourceMatch = String(source.value).match(/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*idle\s*;\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*pulse\s*,\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*ms\s*$/i);
  const idleVoltage = sourceMatch ? Number(sourceMatch[1]) : Number.NaN;
  const pulseVoltage = sourceMatch ? Number(sourceMatch[2]) : Number.NaN;
  const pulseWidthS = sourceMatch ? Number(sourceMatch[3]) / 1000 : Number.NaN;
  const tvsMatch = String(tvs.value).match(/^\s*Vclamp\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*;\s*Pmax\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*W\s*;\s*Emax\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*J\s*$/i);
  const clampVoltage = tvsMatch ? Number(tvsMatch[1]) : Number.NaN;
  const maxPulsePowerW = tvsMatch ? Number(tvsMatch[2]) : Number.NaN;
  const maxPulseEnergyJ = tvsMatch ? Number(tvsMatch[3]) : Number.NaN;
  const seriesResistor = resistors.find(item => /R1/.test(item.reference));
  const loadResistor = resistors.find(item => item !== seriesResistor);
  const seriesResistance = seriesResistor ? resistanceValue(seriesResistor.value) : Number.NaN;
  const loadResistance = loadResistor ? resistanceValue(loadResistor.value) : Number.NaN;
  if (![idleVoltage, pulseVoltage, pulseWidthS, clampVoltage, maxPulsePowerW, maxPulseEnergyJ, seriesResistance, loadResistance].every(Number.isFinite)
    || idleVoltage < 0 || pulseVoltage <= idleVoltage || pulseWidthS <= 0 || clampVoltage <= 0 || maxPulsePowerW <= 0 || maxPulseEnergyJ <= 0 || seriesResistance <= 0 || loadResistance <= 0) {
    return { state: "blocked", message: "The TVS pulse estimate needs non-negative idle voltage, a higher pulse voltage, positive pulse width, clamp, limits, and resistor values.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const seriesInput = n(seriesResistor, "1"), seriesOutput = n(seriesResistor, "2");
  const loadInput = n(loadResistor, "1"), loadOutput = n(loadResistor, "2");
  const tvsCathode = n(tvs, "K"), tvsAnode = n(tvs, "A"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive === sourceNegative || sourcePositive !== seriesInput
    || !seriesOutput || seriesOutput !== loadInput || seriesOutput !== tvsCathode
    || !groundNet || sourceNegative !== groundNet || loadOutput !== groundNet || tvsAnode !== groundNet) {
    return { state: "blocked", message: "Connect the source through its series resistance to the output; place the load and TVS in parallel from output to ground, with the TVS cathode at the output.", validation };
  }
  const idleUnclampedV = idleVoltage * loadResistance / (seriesResistance + loadResistance);
  const pulseUnclampedV = pulseVoltage * loadResistance / (seriesResistance + loadResistance);
  const idleOutputVoltage = idleUnclampedV;
  const pulseClamped = pulseUnclampedV > clampVoltage;
  const pulseOutputVoltage = pulseClamped ? clampVoltage : pulseUnclampedV;
  const pulseSeriesCurrentA = pulseClamped ? (pulseVoltage - clampVoltage) / seriesResistance : pulseVoltage / (seriesResistance + loadResistance);
  const pulseLoadCurrentA = pulseOutputVoltage / loadResistance;
  const tvsCurrentA = Math.max(0, pulseSeriesCurrentA - pulseLoadCurrentA);
  const tvsPowerW = pulseClamped ? clampVoltage * tvsCurrentA : 0;
  const pulseEnergyJ = tvsPowerW * pulseWidthS;
  const warnings = [];
  if (!pulseClamped) warnings.push("The configured pulse stays below the ideal TVS clamp threshold.");
  if (tvsPowerW > maxPulsePowerW) warnings.push("The estimated TVS pulse power exceeds the entered limit.");
  if (pulseEnergyJ > maxPulseEnergyJ) warnings.push("The estimated TVS pulse energy exceeds the entered limit.");
  return {
    state: "complete",
    engine: "Analytical ideal TVS pulse-clamp estimate",
    message: "Models one rectangular low-voltage pulse through a resistive source impedance. It does not model rise time, parasitic inductance, dynamic clamp impedance, thermal transients, repetition rate, or hardware qualification.",
    warnings,
    result: { kind: "tvs-pulse-clamp", idleVoltage, pulseVoltage, pulseWidthS, clampVoltage, seriesResistance, loadResistance, idleOutputVoltage, pulseUnclampedVoltage: pulseUnclampedV, pulseOutputVoltage, pulseClamped, pulseSeriesCurrentA, pulseLoadCurrentA, tvsCurrentA, tvsPowerW, pulseEnergyJ, maxPulsePowerW, maxPulseEnergyJ },
    validation
  };
}

function analyseZenerShuntRegulator(project, { source, resistors, zener, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const zenerMatch = String(zener.value).match(/^\s*Vz\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*;\s*Pmax\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*W\s*$/i);
  const zenerVoltage = zenerMatch ? Number(zenerMatch[1]) : Number.NaN;
  const maxZenerPowerW = zenerMatch ? Number(zenerMatch[2]) : Number.NaN;
  const seriesResistor = resistors.find(item => /series/i.test(item.reference)) ?? resistors.find(item => /R1/.test(item.reference));
  const loadResistor = resistors.find(item => item !== seriesResistor);
  const seriesResistance = seriesResistor ? resistanceValue(seriesResistor.value) : Number.NaN;
  const loadResistance = loadResistor ? resistanceValue(loadResistor.value) : Number.NaN;
  if (![sourceVoltage, zenerVoltage, maxZenerPowerW, seriesResistance, loadResistance].every(Number.isFinite)
    || sourceVoltage <= 0 || zenerVoltage <= 0 || maxZenerPowerW <= 0 || seriesResistance <= 0 || loadResistance <= 0) {
    return { state: "blocked", message: "The Zener estimate needs positive source, clamp-voltage, power-limit, series-resistance, and load-resistance values.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const seriesInput = n(seriesResistor, "1"), seriesOutput = n(seriesResistor, "2");
  const loadInput = n(loadResistor, "1"), loadOutput = n(loadResistor, "2");
  const zenerCathode = n(zener, "K"), zenerAnode = n(zener, "A"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive === sourceNegative || sourcePositive !== seriesInput
    || !seriesOutput || seriesOutput !== loadInput || seriesOutput !== zenerCathode
    || !groundNet || sourceNegative !== groundNet || loadOutput !== groundNet || zenerAnode !== groundNet) {
    return { state: "blocked", message: "Connect the source through the series resistor to the output; place the load and Zener in parallel from output to ground, with the Zener cathode at the output.", validation };
  }
  const dividerOutput = sourceVoltage * loadResistance / (seriesResistance + loadResistance);
  const zenerOn = dividerOutput >= zenerVoltage;
  const outputVoltage = zenerOn ? zenerVoltage : dividerOutput;
  const seriesCurrentA = (sourceVoltage - outputVoltage) / seriesResistance;
  const loadCurrentA = outputVoltage / loadResistance;
  const zenerCurrentA = Math.max(0, seriesCurrentA - loadCurrentA);
  const zenerPowerW = outputVoltage * zenerCurrentA;
  const seriesPowerW = seriesCurrentA ** 2 * seriesResistance;
  const loadPowerW = outputVoltage ** 2 / loadResistance;
  const sourcePowerW = sourceVoltage * seriesCurrentA;
  const overPower = zenerPowerW > maxZenerPowerW;
  const warnings = overPower ? ["The ideal clamp exceeds the entered Zener power limit; reduce source current or revise the design."] : [];
  return {
    state: "complete",
    engine: "Analytical ideal Zener shunt-regulator estimate",
    message: "Uses a hard breakdown-voltage clamp with no dynamic resistance, tolerance, temperature, or reverse-recovery model. The power warning compares against the entered generic limit; it is not a hardware safety approval.",
    warnings,
    result: { kind: "zener-shunt-regulator", sourceVoltage, zenerVoltage, maxZenerPowerW, seriesResistance, loadResistance, outputVoltage, zenerOn, seriesCurrentA, loadCurrentA, zenerCurrentA, zenerPowerW, seriesPowerW, loadPowerW, sourcePowerW, powerBalanceW: sourcePowerW - seriesPowerW - loadPowerW - zenerPowerW },
    validation
  };
}

function analyseBridgeSmoothingCapacitor(project, { source, bridge, load, capacitor, ground, validation }) {
  const sourceFields = String(source.value).split(",").map(field => field.trim());
  const rmsMatch = sourceFields.length === 2 ? sourceFields[0].match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*RMS$/i) : null;
  const sourceRmsVoltage = rmsMatch ? Number(rmsMatch[1]) : Number.NaN;
  const inputFrequencyHz = sourceFields.length === 2 ? frequencyValue(sourceFields[1]) : Number.NaN;
  const diodeDrop = voltageValue(bridge.value);
  const loadResistance = resistanceValue(load.value);
  const capacitance = capacitanceValue(capacitor.value);
  if (![sourceRmsVoltage, inputFrequencyHz, diodeDrop, loadResistance, capacitance].every(Number.isFinite)
    || sourceRmsVoltage <= 0 || inputFrequencyHz <= 0 || diodeDrop <= 0 || loadResistance <= 0 || capacitance <= 0) {
    return { state: "blocked", message: "The smoothing model requires positive AC RMS voltage, frequency, diode drop, load resistance, and capacitance.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const ac1 = n(bridge, "AC1"), ac2 = n(bridge, "AC2");
  const positive = n(bridge, "POS"), negative = n(bridge, "NEG");
  const loadPositive = n(load, "1"), loadNegative = n(load, "2");
  const capPositive = n(capacitor, "1"), capNegative = n(capacitor, "2"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive === sourceNegative || sourcePositive !== ac1 || sourceNegative !== ac2
    || !positive || positive === negative || loadPositive !== positive || capPositive !== positive
    || negative !== groundNet || loadNegative !== groundNet || capNegative !== groundNet) {
    return { state: "blocked", message: "Connect the AC source to the bridge inputs; connect the load and smoothing capacitor in parallel across bridge positive and negative, with negative grounded.", validation };
  }
  const peakInputVoltage = sourceRmsVoltage * Math.SQRT2;
  const rectifiedFrequencyHz = 2 * inputFrequencyHz;
  const intervalsPerCycle = 400;
  const cycles = 10;
  const intervals = intervalsPerCycle * cycles;
  const dt = 1 / (inputFrequencyHz * intervalsPerCycle);
  const startMeasure = intervalsPerCycle * (cycles - 2);
  let capacitorVoltage = 0;
  const measured = [];
  for (let i = 0; i <= intervals; i += 1) {
    const timeS = i * dt;
    const sourceVoltage = peakInputVoltage * Math.sin(2 * Math.PI * inputFrequencyHz * timeS);
    const rectifiedVoltage = Math.max(0, Math.abs(sourceVoltage) - 2 * diodeDrop);
    if (rectifiedVoltage > capacitorVoltage) capacitorVoltage = rectifiedVoltage;
    else capacitorVoltage *= Math.exp(-dt / (loadResistance * capacitance));
    if (i >= startMeasure) measured.push({ timeS, inputVoltage: sourceVoltage, rectifiedVoltage, outputVoltage: capacitorVoltage, loadCurrentA: capacitorVoltage / loadResistance });
  }
  const voltages = measured.map(point => point.outputVoltage);
  const peakOutputVoltage = Math.max(...voltages);
  const minimumOutputVoltage = Math.min(...voltages);
  const ripplePeakToPeakV = peakOutputVoltage - minimumOutputVoltage;
  const averageOutputVoltage = voltages.reduce((sum, value) => sum + value, 0) / voltages.length;
  const unfiltered = measured.map(point => point.rectifiedVoltage);
  const unfilteredRipplePeakToPeakV = Math.max(...unfiltered) - Math.min(...unfiltered);
  const waveform = measured.filter((_, index) => index % 5 === 0 || index === measured.length - 1);
  if (![peakInputVoltage, rectifiedFrequencyHz, peakOutputVoltage, minimumOutputVoltage, ripplePeakToPeakV, averageOutputVoltage, unfilteredRipplePeakToPeakV].every(Number.isFinite)) {
    return { state: "blocked", message: "The smoothing-capacitor waveform exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical bridge plus ideal-capacitor sampled transient estimate",
    message: "Compared an ideal fixed-drop bridge with and without a reservoir capacitor across the same resistive load. The capacitor starts discharged; source impedance, diode recovery, ESR, inrush current, transformer behavior, and thermal/rating limits are not modeled.",
    result: {
      kind: "bridge-smoothing-capacitor",
      inputFrequencyHz,
      rectifiedFrequencyHz,
      rippleFrequencyHz: rectifiedFrequencyHz,
      sourceRmsVoltage,
      peakInputVoltage,
      diodeDropPerConductingDiode: diodeDrop,
      loadResistance,
      capacitanceF: capacitance,
      peakOutputVoltage,
      minimumOutputVoltage,
      averageOutputVoltage,
      ripplePeakToPeakV,
      unfilteredRipplePeakToPeakV,
      rippleReductionRatio: unfilteredRipplePeakToPeakV > 0 ? ripplePeakToPeakV / unfilteredRipplePeakToPeakV : 0,
      waveform
    },
    validation
  };
}

function analysePassiveToneControl(project, { source, control, capacitor, load, ground, validation }) {
  const inputAmplitudeV = voltageValue(source.value);
  const capacitance = capacitanceValue(capacitor.value);
  const loadResistance = resistanceValue(load.value);
  const controlFields = String(control.value).match(/Rmax\s*([^;]+)\s*;\s*position\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*%/i);
  const maximumResistance = controlFields ? resistanceValue(controlFields[1]) : Number.NaN;
  const positionPercent = controlFields ? Number(controlFields[2]) : Number.NaN;
  if (![inputAmplitudeV, capacitance, loadResistance, maximumResistance, positionPercent].every(Number.isFinite)
    || inputAmplitudeV <= 0 || capacitance <= 0 || loadResistance <= 0 || maximumResistance <= 0
    || positionPercent < 0 || positionPercent > 100) {
    return { state: "blocked", message: "The tone-control model needs positive source, capacitor, load and potentiometer values, with control position from 0% to 100%.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const controlInput = n(control, "1"), controlOutput = n(control, "2");
  const capacitorFirst = n(capacitor, "1"), capacitorSecond = n(capacitor, "2");
  const loadFirst = n(load, "1"), loadSecond = n(load, "2"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive === groundNet || sourcePositive !== controlInput
    || !controlOutput || controlOutput === sourcePositive || capacitorFirst !== controlOutput || loadFirst !== controlOutput
    || sourceNegative !== groundNet || capacitorSecond !== groundNet || loadSecond !== groundNet) {
    return { state: "blocked", message: "Wire the AC source through the two-terminal tone control to the output, with capacitor and load in parallel from output to the shared source return.", validation };
  }
  const seriesResistance = maximumResistance * positionPercent / 100;
  const parallelResistance = seriesResistance === 0 ? 0 : (seriesResistance * loadResistance) / (seriesResistance + loadResistance);
  const cutoffHz = parallelResistance === 0 ? null : 1 / (2 * Math.PI * capacitance * parallelResistance);
  const frequenciesHz = [100, 1000, 10000];
  const response = frequenciesHz.map(frequencyHz => {
    const reactance = 1 / (2 * Math.PI * frequencyHz * capacitance);
    const denominator = loadResistance ** 2 + reactance ** 2;
    const parallelReal = loadResistance * reactance ** 2 / denominator;
    const parallelImag = -(loadResistance ** 2) * reactance / denominator;
    const transferDenominator = (seriesResistance + parallelReal) ** 2 + parallelImag ** 2;
    const transferReal = (parallelReal * (seriesResistance + parallelReal) + parallelImag ** 2) / transferDenominator;
    const transferImag = parallelImag * seriesResistance / transferDenominator;
    const gain = Math.hypot(transferReal, transferImag);
    return { frequencyHz, gain, phaseRad: Math.atan2(transferImag, transferReal), inputAmplitudeV, outputAmplitudeV: inputAmplitudeV * gain };
  });
  if (response.some(point => ![point.gain, point.phaseRad, point.outputAmplitudeV].every(Number.isFinite))) {
    return { state: "blocked", message: "The tone-control frequency response exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical loaded single-pole passive treble-cut response",
    message: "Calculated the loaded frequency response of a two-terminal rheostat, shunt capacitor, and resistive load. This is a single-pole treble-cut control, not a Baxandall or multi-band equalizer; wiper noise, source impedance, capacitor loss, audio power, tolerances, and general SPICE are omitted.",
    result: { kind: "passive-tone-control", inputAmplitudeV, maximumResistance, positionPercent, seriesResistance, capacitance, loadResistance, cutoffHz, response },
    validation
  };
}

function analyseHBridgeMotor(project,{sources,pmosSwitches,nmosSwitches,motorResistance,motorInductor,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0");
  const leftHigh=pmosSwitches.find(q=>n(q,"D")===n(nmosSwitches[0],"D"));
  const rightHigh=pmosSwitches.find(q=>q!==leftHigh);
  const leftLow=nmosSwitches.find(q=>leftHigh&&n(q,"D")===n(leftHigh,"D"));
  const rightLow=nmosSwitches.find(q=>q!==leftLow);
  const supply=leftHigh&&rightHigh?sources.find(v=>n(v,"-")===groundNet&&n(v,"+")===n(leftHigh,"S")&&n(v,"+")===n(rightHigh,"S")):undefined;
  const driveFor=(part)=>sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===n(part,"G"));
  const driveLH=leftHigh?driveFor(leftHigh):undefined,driveRH=rightHigh?driveFor(rightHigh):undefined;
  const driveLL=leftLow?driveFor(leftLow):undefined,driveRL=rightLow?driveFor(rightLow):undefined;
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN;
  const driveV=[driveLH,driveLL,driveRH,driveRL].map(v=>v?voltageValue(v.value):Number.NaN);
  const [gateLeftHighV,gateLeftLowV,gateRightHighV,gateRightLowV]=driveV;
  const vsgLeft=supplyVoltage-gateLeftHighV,vsgRight=supplyVoltage-gateRightHighV;
  const vgsLeft=gateLeftLowV,vgsRight=gateRightLowV,vth=2,rdsOn=0.1,vgsMax=20;
  const leftNode=leftHigh?n(leftHigh,"D"):undefined,rightNode=rightHigh?n(rightHigh,"D"):undefined;
  const resistorWired=(n(motorResistance,"1")===leftNode&&n(motorResistance,"2")===n(motorInductor,"1"))
    ||(n(motorResistance,"2")===leftNode&&n(motorResistance,"1")===n(motorInductor,"1"));
  const inductorWired=(n(motorInductor,"1")===n(motorResistance,"1")||n(motorInductor,"1")===n(motorResistance,"2"))
    &&(n(motorInductor,"2")===rightNode||n(motorInductor,"1")===rightNode);
  const rMotor=resistanceValue(motorResistance.value),lMotor=inductanceValue(motorInductor.value);
  if(!supply||!leftHigh||!rightHigh||!leftLow||!rightLow||!driveLH||!driveLL||!driveRH||!driveRL
    ||n(leftHigh,"S")!==n(rightHigh,"S")||n(leftLow,"S")!==groundNet||n(rightLow,"S")!==groundNet
    ||!resistorWired||!inductorWired||![supplyVoltage,...driveV,rMotor,lMotor].every(Number.isFinite)
    ||supplyVoltage<=0||rMotor<=0||lMotor<=0
    ||driveV.some(v=>v<0||v>supplyVoltage)
    ||Math.abs(vsgLeft)>vgsMax||Math.abs(vsgRight)>vgsMax
    ||gateLeftLowV>5.5||gateRightLowV>5.5){
    return {state:"blocked",message:"Wire both P-MOS sources to the positive rail, both N-MOS sources to ground, four bounded gate drives, and the series motor R-L load.",validation};
  }
  const leftHighOn=vsgLeft>=vth,rightHighOn=vsgRight>=vth,leftLowOn=vgsLeft>=vth,rightLowOn=vgsRight>=vth;
  if((leftHighOn&&leftLowOn)||(rightHighOn&&rightLowOn)){
    return {state:"blocked",message:"Shoot-through interlock: never enable the high-side and low-side switch on the same bridge leg at once.",validation};
  }
  let direction="coast",motorCurrentA=0,leftOutputVoltageV=null,rightOutputVoltageV=null;
  const forward=leftHighOn&&rightLowOn&&!rightHighOn&&!leftLowOn;
  const reverse=rightHighOn&&leftLowOn&&!leftHighOn&&!rightLowOn;
  const lowSideBrake=leftLowOn&&rightLowOn&&!leftHighOn&&!rightHighOn;
  const highSideBrake=leftHighOn&&rightHighOn&&!leftLowOn&&!rightLowOn;
  if(!forward&&!reverse&&!lowSideBrake&&!highSideBrake&&![leftHighOn,leftLowOn,rightHighOn,rightLowOn].every(v=>!v)){
    return {state:"blocked",message:"Select a valid forward, reverse, coast, or same-rail brake switching vector.",validation};
  }
  const motorCurrentMagnitudeA=Math.max(0,supplyVoltage/(rMotor+2*rdsOn));
  if(forward){
    direction="forward";motorCurrentA=motorCurrentMagnitudeA;
    leftOutputVoltageV=supplyVoltage-motorCurrentA*rdsOn;rightOutputVoltageV=motorCurrentA*rdsOn;
  }else if(reverse){
    direction="reverse";motorCurrentA=-motorCurrentMagnitudeA;
    leftOutputVoltageV=motorCurrentMagnitudeA*rdsOn;rightOutputVoltageV=supplyVoltage-motorCurrentMagnitudeA*rdsOn;
  }else if(lowSideBrake||highSideBrake){
    direction="brake";leftOutputVoltageV=lowSideBrake?0:supplyVoltage;
    rightOutputVoltageV=leftOutputVoltageV;
  }
  const motorVoltageV=leftOutputVoltageV===null?null:leftOutputVoltageV-rightOutputVoltageV;
  const motorPowerW=motorVoltageV===null?0:Math.abs(motorCurrentA*motorVoltageV);
  const motorStoredEnergyJ=0.5*lMotor*motorCurrentA*motorCurrentA;
  return {state:"complete",engine:"Ideal four-switch H-bridge DC motor electrical estimate",message:"Models four ideal MOSFET switches, 0.1 Ω on-resistance per conducting switch, and a motor as a series resistance/inductance. It checks same-leg shoot-through and gate-source bounds. It omits motor back EMF, torque/speed, switching dead time and edges, body-diode commutation, transient current decay, thermal behavior, and device-specific ratings; reverse direction is a static vector and not a safe hot-reversal guarantee.",result:{kind:"hbridge-dc-motor",supplyVoltage,gateVoltageV:{leftHigh:gateLeftHighV,leftLow:gateLeftLowV,rightHigh:gateRightHighV,rightLow:gateRightLowV},switchState:{leftHighOn,leftLowOn,rightHighOn,rightLowOn},direction,motorResistanceOhm:rMotor,motorInductanceH:lMotor,motorCurrentA,motorVoltageV,leftOutputVoltageV,rightOutputVoltageV,motorPowerW,motorStoredEnergyJ,switchOnResistanceOhm:rdsOn,shootThrough:false},validation};
}

function analysePmosHighSideSwitch(project,{sources,mosfet,resistors,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),sourcePinNet=n(mosfet,"S"),drainNet=n(mosfet,"D"),gateNet=n(mosfet,"G");
  const supply=sources.find(part=>n(part,"-")===groundNet&&n(part,"+")===sourcePinNet);
  const gateSource=sources.find(part=>part!==supply&&n(part,"-")===groundNet);
  const gateResistor=resistors.find(r=>gateSource&&((n(r,"1")===n(gateSource,"+")&&n(r,"2")===gateNet)||(n(r,"2")===n(gateSource,"+")&&n(r,"1")===gateNet)));
  const load=resistors.find(r=>r!==gateResistor&&((n(r,"1")===drainNet&&n(r,"2")===groundNet)||(n(r,"2")===drainNet&&n(r,"1")===groundNet)));
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN,gateVoltage=gateSource?voltageValue(gateSource.value):Number.NaN,rGate=gateResistor?resistanceValue(gateResistor.value):Number.NaN,rLoad=load?resistanceValue(load.value):Number.NaN;
  const vgs=gateVoltage-supplyVoltage,vth=2,rdsOn=0.1,vgsAbsMax=20;
  if(!supply||!gateSource||!gateResistor||!load||n(supply,"-")!==groundNet||![supplyVoltage,gateVoltage,rGate,rLoad].every(Number.isFinite)||supplyVoltage<=0||gateVoltage<0||gateVoltage>supplyVoltage||rGate<=0||rLoad<=0||Math.abs(vgs)>vgsAbsMax){
    return {state:"blocked",message:"Use a positive load and gate resistor, keep the gate drive within the supply range, and respect the modeled ±20 V gate-source limit.",validation};
  }
  const vsg=supplyVoltage-gateVoltage,switchOn=vsg>=vth,loadCurrentA=switchOn?supplyVoltage/(rLoad+rdsOn):0,loadVoltage=switchOn?loadCurrentA*rLoad:0,sourceDrainDropV=switchOn?loadCurrentA*rdsOn:supplyVoltage;
  return {state:"complete",engine:"Ideal P-channel MOSFET high-side switching estimate",message:"Uses a 2 V source-gate turn-on threshold, 0.1 Ω on-resistance, and a generic ±20 V gate-source limit. It omits switching edges, gate charge, body-diode transients, thermal behavior, and device-specific ratings.",result:{kind:"pmos-high-side-switch",supplyVoltage,gateVoltage,gateSourceVoltageV:vgs,sourceGateVoltageV:vsg,thresholdV:vth,gateSourceAbsoluteMaximumV:vgsAbsMax,switchOn,loadResistanceOhm:rLoad,loadVoltage,loadCurrentA,sourceDrainDropV},validation};
}

function analyseNmosLowSideSwitch(project,{sources,mosfet,diode,coilResistance,coil,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),supplyNet=sources.find(part=>n(part,"-")===groundNet&&n(part,"+")!==groundNet);
  const gateSource=sources.find(part=>part!==supplyNet&&n(part,"-")===groundNet&&n(part,"+")===n(mosfet,"G"));
  const drainNet=n(mosfet,"D"),sourceNet=n(mosfet,"S"),coilNode=[n(coil,"1"),n(coil,"2")].find(net=>net!==drainNet);
  const supplyVoltage=supplyNet?voltageValue(supplyNet.value):Number.NaN,gateVoltage=gateSource?voltageValue(gateSource.value):Number.NaN;
  const rCoil=resistanceValue(coilResistance.value),inductance=inductanceValue(coil.value),vf=forwardVoltage(diode.value),rdsOn=0.1,vth=2;
  const resistorWired=(n(coilResistance,"1")===n(supplyNet,"+")&&n(coilResistance,"2")===coilNode)||(n(coilResistance,"2")===n(supplyNet,"+")&&n(coilResistance,"1")===coilNode);
  const coilWired=(n(coil,"1")===coilNode&&n(coil,"2")===drainNet)||(n(coil,"2")===coilNode&&n(coil,"1")===drainNet);
  if(!supplyNet||!gateSource||sourceNet!==groundNet||!resistorWired||!coilWired||n(diode,"A")!==drainNet||n(diode,"K")!==n(supplyNet,"+")||![supplyVoltage,gateVoltage,rCoil,inductance,vf].every(Number.isFinite)||supplyVoltage<=0||gateVoltage<0||gateVoltage>supplyVoltage||rCoil<=0||inductance<=0||vf<=0){
    return {state:"blocked",message:"Wire a valid gate drive, series coil resistance/inductance, low-side MOSFET, and correctly oriented flyback diode.",validation};
  }
  const gateHigh=gateVoltage>=vth,onCurrentA=supplyVoltage/(rCoil+rdsOn),onDrainVoltageV=onCurrentA*rdsOn,tauS=inductance/rCoil;
  const decay=[0,1,3].map(multiple=>{const timeS=multiple*tauS,currentA=Math.max(0,(onCurrentA+vf/rCoil)*Math.exp(-rCoil*timeS/inductance)-vf/rCoil);return {timeS,currentA};});
  return {state:"complete",engine:"Ideal low-side MOSFET and flyback-coil estimate",message:"Uses a 2 V gate threshold, fixed 0.1 Ω on-resistance, and constant-drop flyback diode. It reports steady off/on states and a first-order coil-current decay. It omits switching edges, MOSFET capacitance, diode recovery, thermal behavior, avalanche, and component ratings.",result:{kind:"nmos-low-side-switch",supplyVoltage,gateVoltage,gateThresholdV:vth,switchOn:gateHigh,drainSourceVoltageV:gateHigh?onDrainVoltageV:supplyVoltage,loadCurrentA:gateHigh?onCurrentA:0,coilResistanceOhm:rCoil,inductanceH:inductance,onCurrentA,onDrainVoltageV,flybackClampVoltageV:supplyVoltage+vf,coilStoredEnergyJ:0.5*inductance*onCurrentA*onCurrentA,timeConstantS:tauS,turnOffDecay:decay},validation};
}

function analyseNpnRelayDriver(project,{sources,transistor,diode,resistors,coil,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),collectorNet=n(transistor,"C"),baseNet=n(transistor,"B"),emitterNet=n(transistor,"E");
  const supply=sources.find(part=>n(part,"-")===groundNet&&n(part,"+")!==groundNet);
  const control=sources.find(part=>part!==supply&&n(part,"-")===groundNet&&n(part,"+")!==groundNet);
  const baseResistor=control?resistors.find(r=>(n(r,"1")===n(control,"+")&&n(r,"2")===baseNet)||(n(r,"2")===n(control,"+")&&n(r,"1")===baseNet)):undefined;
  const coilResistance=supply?resistors.find(r=>r!==baseResistor&&((n(r,"1")===n(supply,"+")&&n(r,"2")!==n(supply,"+"))||(n(r,"2")===n(supply,"+")&&n(r,"1")!==n(supply,"+")))):undefined;
  const coilMid=coilResistance?([n(coilResistance,"1"),n(coilResistance,"2")].find(net=>net!==n(supply,"+"))):undefined;
  const baseResistorWired=baseResistor&&control&&((n(baseResistor,"1")===n(control,"+")&&n(baseResistor,"2")===baseNet)||(n(baseResistor,"2")===n(control,"+")&&n(baseResistor,"1")===baseNet));
  const coilResistanceWired=coilResistance&&supply&&((n(coilResistance,"1")===n(supply,"+")&&n(coilResistance,"2")===coilMid)||(n(coilResistance,"2")===n(supply,"+")&&n(coilResistance,"1")===coilMid));
  const coilWired=coilMid&&((n(coil,"1")===coilMid&&n(coil,"2")===collectorNet)||(n(coil,"2")===coilMid&&n(coil,"1")===collectorNet));
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN,controlVoltage=control?voltageValue(control.value):Number.NaN;
  const rCoil=coilResistance?resistanceValue(coilResistance.value):Number.NaN,rBase=baseResistor?resistanceValue(baseResistor.value):Number.NaN;
  const inductance=inductanceValue(coil.value),vf=forwardVoltage(diode.value),beta=100,vbe=0.7,vceSat=0.2,baseCurrentLimitA=0.02,pullInThresholdA=0.4;
  if(!supply||!control||!baseResistor||!coilResistance||!baseResistorWired||!coilResistanceWired||!coilWired
    ||n(supply,"-")!==groundNet||n(control,"-")!==groundNet||emitterNet!==groundNet
    ||n(diode,"A")!==collectorNet||n(diode,"K")!==n(supply,"+")
    ||![supplyVoltage,controlVoltage,rCoil,rBase,inductance,vf].every(Number.isFinite)
    ||supplyVoltage<=0||controlVoltage<0||controlVoltage>supplyVoltage||rBase<=0||rCoil<=0||inductance<=0||vf<=0){
    return {state:"blocked",message:"Wire a common-ground 12 V relay-coil estimate, a current-limited NPN base drive, series R-L coil, and flyback diode from collector to supply.",validation};
  }
  const baseCurrentA=Math.max(0,(controlVoltage-vbe)/rBase);
  if(baseCurrentA>baseCurrentLimitA){
    return {state:"blocked",message:"The generic model limits base current to 20 mA; increase the base resistor or lower the drive voltage.",validation};
  }
  const coilCurrentLimitA=Math.max(0,(supplyVoltage-vceSat)/rCoil),betaLimitedCurrentA=beta*baseCurrentA;
  const coilCurrentA=Math.min(coilCurrentLimitA,betaLimitedCurrentA),transistorConducting=coilCurrentA>0;
  const transistorSaturated=transistorConducting&&coilCurrentA>=coilCurrentLimitA-1e-12;
  const collectorVoltageV=transistorSaturated?vceSat:supplyVoltage-coilCurrentA*rCoil;
  const timeConstantS=inductance/rCoil;
  const turnOffDecay=[0,1,3].map(multiple=>{
    const timeS=multiple*timeConstantS;
    const currentA=Math.max(0,(coilCurrentA+vf/rCoil)*Math.exp(-rCoil*timeS/inductance)-vf/rCoil);
    return {timeS,currentA};
  });
  const coilStoredEnergyJ=0.5*inductance*coilCurrentA*coilCurrentA;
  return {state:"complete",engine:"Generic NPN relay-coil and flyback estimate",message:"Uses β=100, VBE=0.7 V, VCE(sat)=0.2 V, a 20 mA base-current bound, a 0.4 A assumed relay pull-in threshold, and a constant-drop diode. The relay is represented by its series R-L coil; contact motion, actual pull-in/drop-out data, switching edges, transistor curves, thermal behavior, diode recovery, and manufacturer ratings are not modeled.",result:{kind:"npn-relay-driver",supplyVoltage,controlVoltage,baseResistanceOhm:rBase,coilResistanceOhm:rCoil,inductanceH:inductance,beta,vbeV:vbe,vceSatV:vceSat,baseCurrentLimitA,baseCurrentA,betaLimitedCurrentA,coilCurrentLimitA,coilCurrentA,transistorConducting,transistorSaturated,collectorVoltageV,relayPullInThresholdA:pullInThresholdA,relayEnergizedEstimate:coilCurrentA>=pullInThresholdA,flybackClampVoltageV:supplyVoltage+vf,coilStoredEnergyJ,timeConstantS,turnOffDecay},validation};
}

function analyseSupercapHoldUp(project, { source, diode, capacitor, load, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const diodeVf = forwardVoltage(diode.value);
  const loadResistance = resistanceValue(load.value);
  const fields = String(capacitor.value).match(/C\s*([^;]+)\s*;\s*Vstart\s*([^;]+)\s*;\s*Vmin\s*([^;]+)\s*;\s*Vmax\s*(.+)/i);
  const capacitance = fields ? capacitanceValue(fields[1]) : Number.NaN;
  const initialVoltage = fields ? voltageValue(fields[2]) : Number.NaN;
  const minimumVoltage = fields ? voltageValue(fields[3]) : Number.NaN;
  const ratedVoltage = fields ? voltageValue(fields[4]) : Number.NaN;
  if (![sourceVoltage, diodeVf, loadResistance, capacitance, initialVoltage, minimumVoltage, ratedVoltage].every(Number.isFinite)
    || sourceVoltage <= 0 || diodeVf <= 0 || loadResistance <= 0 || capacitance <= 0
    || initialVoltage <= minimumVoltage || minimumVoltage <= 0 || ratedVoltage < initialVoltage
    || sourceVoltage - diodeVf + 1e-12 < initialVoltage || sourceVoltage - diodeVf > ratedVoltage) {
    return { state: "blocked", message: "The hold-up model needs positive supply, diode, load, capacitance and voltage values; the initial voltage must be between the minimum and rating and chargeable through the diode.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const supplyPositive = n(source, "+"), supplyReturn = n(source, "-");
  const diodeAnode = n(diode, "A"), diodeCathode = n(diode, "K");
  const capPositive = n(capacitor, "+"), capNegative = n(capacitor, "-");
  const loadPositive = n(load, "1"), loadNegative = n(load, "2");
  const groundNet = n(ground, "0");
  if (!supplyPositive || supplyPositive === groundNet || diodeAnode !== supplyPositive
    || !diodeCathode || diodeCathode === groundNet || capPositive !== diodeCathode || loadPositive !== diodeCathode
    || supplyReturn !== groundNet || capNegative !== groundNet || loadNegative !== groundNet) {
    return { state: "blocked", message: "Wire supply positive through the isolation diode to the supercapacitor and load in parallel; connect their returns and supply negative to ground.", validation };
  }
  const timeConstantS = loadResistance * capacitance;
  const holdUpTimeS = timeConstantS * Math.log(initialVoltage / minimumVoltage);
  const initialCurrentA = initialVoltage / loadResistance;
  const initialLoadPowerW = initialVoltage ** 2 / loadResistance;
  const initialStoredEnergyJ = 0.5 * capacitance * initialVoltage ** 2;
  if (![timeConstantS, holdUpTimeS, initialCurrentA, initialLoadPowerW, initialStoredEnergyJ].every(Number.isFinite)
    || timeConstantS <= 0 || holdUpTimeS <= 0) {
    return { state: "blocked", message: "The supercapacitor discharge time is outside the numerically supported range.", validation };
  }
  const sampleTimes = [0, holdUpTimeS * 0.25, holdUpTimeS * 0.5, holdUpTimeS, holdUpTimeS * 1.25];
  const samples = sampleTimes.map(timeS => {
    const voltage = initialVoltage * Math.exp(-timeS / timeConstantS);
    const currentA = voltage / loadResistance;
    return { timeS, voltage, currentA, loadPowerW: voltage * currentA, storedEnergyJ: 0.5 * capacitance * voltage ** 2 };
  });
  if (samples.some(sample => ![sample.voltage, sample.currentA, sample.loadPowerW, sample.storedEnergyJ].every(Number.isFinite))) {
    return { state: "blocked", message: "The supercapacitor sample curve exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical supercapacitor RC power-interruption response",
    message: "Assumed the supercapacitor has charged through an ideal isolation diode, then disconnected the input supply at time zero and calculated its ideal RC discharge. ESR, leakage, capacitance/voltage tolerance, diode reverse leakage, load dynamics, recharge time, temperature, component ratings, and general SPICE are not modeled.",
    result: { kind: "supercap-hold-up", sourceVoltage, diodeVf, chargeVoltage: sourceVoltage - diodeVf, capacitance, initialVoltage, minimumVoltage, ratedVoltage, loadResistance, timeConstantS, holdUpTimeS, initialCurrentA, initialLoadPowerW, initialStoredEnergyJ, samples },
    validation
  };
}

function analyseWindowComparator(project,{sources,comparators,gate,resistors,led,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0");
  const supply=sources.find(part=>n(part,"-")===groundNet&&n(part,"+")!==groundNet);
  const signal=sources.find(part=>part!==supply&&n(part,"-")===groundNet);
  if(!supply||!signal||n(led,"K")!==groundNet||n(gate,"VCC")!==n(supply,"+")||n(gate,"GND")!==groundNet){
    return {state:"blocked",message:"Connect the dual comparators, AND gate, signal, supply, and LED to their ground and supply references.",validation};
  }
  const inputNet=n(signal,"+"),lower=comparators.find(item=>n(item,"IN+")===inputNet),upper=comparators.find(item=>n(item,"IN-")===inputNet);
  if(!lower||!upper||lower===upper||n(lower,"VCC")!==n(supply,"+")||n(upper,"VCC")!==n(supply,"+")||n(lower,"GND")!==groundNet||n(upper,"GND")!==groundNet){
    return {state:"blocked",message:"Wire one comparator for input-above-lower-limit and the other for input-below-upper-limit.",validation};
  }
  const lowNet=n(lower,"IN-"),highNet=n(upper,"IN+"),supplyNet=n(supply,"+");
  const top=resistors.find(r=>(n(r,"1")===supplyNet&&n(r,"2")===highNet)||(n(r,"2")===supplyNet&&n(r,"1")===highNet));
  const bottom=resistors.find(r=>r!==top&&((n(r,"1")===lowNet&&n(r,"2")===groundNet)||(n(r,"2")===lowNet&&n(r,"1")===groundNet)));
  const middle=resistors.find(r=>r!==top&&r!==bottom&&((n(r,"1")===highNet&&n(r,"2")===lowNet)||(n(r,"2")===highNet&&n(r,"1")===lowNet)));
  const outputNet=n(gate,"Y"),load=resistors.find(r=>r!==top&&r!==bottom&&r!==middle&&((n(r,"1")===outputNet&&n(r,"2")===n(led,"A"))||(n(r,"2")===outputNet&&n(r,"1")===n(led,"A"))));
  if(!top||!middle||!bottom||!load||n(gate,"A")!==n(lower,"OUT")||n(gate,"B")!==n(upper,"OUT")){
    return {state:"blocked",message:"The window detector needs a three-resistor reference ladder, both comparator outputs into the AND gate, and a load LED.",validation};
  }
  const rTop=resistanceValue(top.value),rMiddle=resistanceValue(middle.value),rBottom=resistanceValue(bottom.value),rLoad=resistanceValue(load.value);
  const supplyVoltage=voltageValue(supply.value),inputVoltage=voltageValue(signal.value),vf=forwardVoltage(led.value);
  if(![rTop,rMiddle,rBottom,rLoad,supplyVoltage,inputVoltage,vf].every(Number.isFinite)||[rTop,rMiddle,rBottom,rLoad].some(v=>v<=0)||supplyVoltage<=0||inputVoltage<0||inputVoltage>supplyVoltage||vf<=0){
    return {state:"blocked",message:"Use positive divider/load resistances and keep the signal within the modeled supply range.",validation};
  }
  const totalResistance=rTop+rMiddle+rBottom,lowerThresholdV=supplyVoltage*rBottom/totalResistance,upperThresholdV=supplyVoltage*(rMiddle+rBottom)/totalResistance;
  const aboveLower=inputVoltage>lowerThresholdV,belowUpper=inputVoltage<upperThresholdV,windowActive=aboveLower&&belowUpper;
  const ledCurrentA=windowActive?Math.max(0,(supplyVoltage-vf)/rLoad):0;
  return {state:"complete",engine:"Ideal dual-comparator window detector",message:"Calculates lower/upper divider thresholds, both ideal comparator outputs, and their AND-gated window indicator. It omits comparator delay, tolerance, offset, noise, loading, and gate propagation.",result:{kind:"window-comparator",supplyVoltage,inputVoltage,lowerThresholdV,upperThresholdV,lowerComparatorHigh:aboveLower,upperComparatorHigh:belowUpper,windowActive,ledOn:windowActive,ledCurrentA},validation};
}

function analyseSchmittTrigger(project,{sources,comparator,resistors,led,ground,previousState,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),outputNet=n(comparator,"OUT"),senseNet=n(comparator,"IN+"),referenceNet=n(comparator,"IN-");
  const supply=sources.find(part=>n(part,"-")===groundNet&&n(part,"+")===n(comparator,"VCC"));
  const reference=sources.find(part=>part!==supply&&n(part,"-")===groundNet&&n(part,"+")===referenceNet);
  const signal=sources.find(part=>part!==supply&&part!==reference&&n(part,"-")===groundNet);
  if(!supply||!reference||!signal||n(comparator,"GND")!==groundNet||n(led,"K")!==groundNet){
    return {state:"blocked",message:"Connect the Schmitt trigger supply, input, fixed reference, and LED return to their required nets.",validation};
  }
  const signalNet=n(signal,"+");
  const inputResistor=resistors.find(part=>(n(part,"1")===signalNet&&n(part,"2")===senseNet)||(n(part,"2")===signalNet&&n(part,"1")===senseNet));
  const feedbackResistor=resistors.find(part=>part!==inputResistor&&((n(part,"1")===outputNet&&n(part,"2")===senseNet)||(n(part,"2")===outputNet&&n(part,"1")===senseNet)));
  const groundResistor=resistors.find(part=>part!==inputResistor&&part!==feedbackResistor&&((n(part,"1")===senseNet&&n(part,"2")===groundNet)||(n(part,"2")===senseNet&&n(part,"1")===groundNet)));
  const ledResistor=resistors.find(part=>part!==inputResistor&&part!==feedbackResistor&&part!==groundResistor&&((n(part,"1")===outputNet&&n(part,"2")===n(led,"A"))||(n(part,"2")===outputNet&&n(part,"1")===n(led,"A"))));
  const rin=inputResistor?resistanceValue(inputResistor.value):Number.NaN,rf=feedbackResistor?resistanceValue(feedbackResistor.value):Number.NaN,rg=groundResistor?resistanceValue(groundResistor.value):Number.NaN,rled=ledResistor?resistanceValue(ledResistor.value):Number.NaN;
  const supplyVoltage=voltageValue(supply.value),inputVoltage=voltageValue(signal.value),referenceVoltage=voltageValue(reference.value),vf=forwardVoltage(led.value);
  if(!inputResistor||!feedbackResistor||!groundResistor||!ledResistor||![rin,rf,rg,rled,supplyVoltage,inputVoltage,referenceVoltage,vf].every(Number.isFinite)||[rin,rf,rg,rled].some(value=>value<=0)||supplyVoltage<=0||inputVoltage<0||inputVoltage>supplyVoltage||referenceVoltage<=0||referenceVoltage>=supplyVoltage||vf<=0){
    return {state:"blocked",message:"The Schmitt circuit needs positive resistors and valid input, reference, supply, and LED values.",validation};
  }
  const gIn=1/rin,gFeedback=1/rf,gGround=1/rg,sum=gIn+gFeedback+gGround;
  const risingThresholdV=(referenceVoltage*sum)/gIn,fallingThresholdV=(referenceVoltage*sum-supplyVoltage*gFeedback)/gIn;
  if(!(fallingThresholdV>0&&risingThresholdV>fallingThresholdV&&risingThresholdV<supplyVoltage)){
    return {state:"blocked",message:"The selected feedback network does not produce two valid thresholds inside the supply range.",validation};
  }
  let outputHigh=null;
  if(inputVoltage>=risingThresholdV)outputHigh=true;
  else if(inputVoltage<=fallingThresholdV)outputHigh=false;
  else if(previousState==="high")outputHigh=true;
  else if(previousState==="low")outputHigh=false;
  const ledOn=outputHigh===true,ledCurrentA=ledOn?Math.max(0,(supplyVoltage-vf)/rled):0;
  return {state:"complete",engine:"Ideal Schmitt-trigger hysteresis estimate",message:"Calculates rising and falling thresholds from the input, positive-feedback, and ground resistors. Within the hysteresis band, previousState is required to determine the retained output. It omits delay, analog saturation, noise, offset, and device-specific behavior.",result:{kind:"schmitt-trigger",supplyVoltage,inputVoltage,referenceVoltage,risingThresholdV,fallingThresholdV,hysteresisV:risingThresholdV-fallingThresholdV,outputHigh,outputState:outputHigh===null?"memory-dependent":outputHigh?"high":"low",ledOn,ledCurrentA},validation};
}

function analyseComparatorThreshold(project,{sources,comparator,resistors,led,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0");
  const supply=sources.find(part=>n(part,"-")===groundNet&&n(part,"+")!==groundNet);
  const signal=sources.find(part=>part!==supply&&n(part,"-")===groundNet);
  if(!supply||!signal||n(comparator,"VCC")!==n(supply,"+")||n(comparator,"GND")!==groundNet
    ||n(comparator,"IN+")!==n(signal,"+")||n(signal,"-")!==groundNet||n(led,"K")!==groundNet){
    return {state:"blocked",message:"Connect comparator supply and signal references to ground, the signal to IN+, and the indicator cathode to ground.",validation};
  }
  const thresholdNet=n(comparator,"IN-"),outputNet=n(comparator,"OUT"),supplyNet=n(supply,"+");
  const upper=resistors.find(part=>(n(part,"1")===supplyNet&&n(part,"2")===thresholdNet)||(n(part,"2")===supplyNet&&n(part,"1")===thresholdNet));
  const lower=resistors.find(part=>part!==upper&&((n(part,"1")===thresholdNet&&n(part,"2")===groundNet)||(n(part,"2")===thresholdNet&&n(part,"1")===groundNet)));
  const ledResistor=resistors.find(part=>part!==upper&&part!==lower&&((n(part,"1")===outputNet&&n(part,"2")===n(led,"A"))||(n(part,"2")===outputNet&&n(part,"1")===n(led,"A"))));
  const rUpper=upper?resistanceValue(upper.value):Number.NaN,rLower=lower?resistanceValue(lower.value):Number.NaN,rLed=ledResistor?resistanceValue(ledResistor.value):Number.NaN;
  const supplyVoltage=voltageValue(supply.value),inputVoltage=voltageValue(signal.value),vf=forwardVoltage(led.value);
  if(!upper||!lower||!ledResistor||![rUpper,rLower,rLed,supplyVoltage,inputVoltage,vf].every(Number.isFinite)||rUpper<=0||rLower<=0||rLed<=0||supplyVoltage<=0||inputVoltage<0||inputVoltage>supplyVoltage||vf<=0){
    return {state:"blocked",message:"The threshold circuit needs a valid divider, positive resistances, and a signal within its supply range.",validation};
  }
  const thresholdVoltage=supplyVoltage*rLower/(rUpper+rLower),outputHigh=inputVoltage>thresholdVoltage,ledCurrentA=outputHigh?Math.max(0,(supplyVoltage-vf)/rLed):0;
  return {state:"complete",engine:"Ideal dual-input comparator threshold analysis",message:"Compares the input against a resistor-divider threshold and reports an ideal logic state and LED current. It omits propagation delay, hysteresis, offset, input bias, output saturation, noise, loading, and device-specific limits.",result:{kind:"comparator-threshold",supplyVoltage,inputVoltage,thresholdVoltage,outputHigh,outputState:outputHigh?"high":"low",ledOn:outputHigh,ledCurrentA},validation};
}

function analyseNpnEmitterFollower(project,{sources,transistor,load,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),collectorNet=n(transistor,"C"),baseNet=n(transistor,"B"),emitterNet=n(transistor,"E");
  const supply=sources.find(part=>n(part,"+")===collectorNet&&n(part,"-")===groundNet);
  const input=sources.find(part=>part!==supply&&n(part,"+")===baseNet&&n(part,"-")===groundNet);
  const loadConnected=(n(load,"1")===emitterNet&&n(load,"2")===groundNet)||(n(load,"2")===emitterNet&&n(load,"1")===groundNet);
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN,inputVoltage=input?voltageValue(input.value):Number.NaN,loadResistance=resistanceValue(load.value),vbe=0.7,vceSat=0.2;
  if(!supply||!input||!loadConnected||![supplyVoltage,inputVoltage,loadResistance].every(Number.isFinite)||supplyVoltage<=0||inputVoltage<0||inputVoltage>supplyVoltage||loadResistance<=0){
    return {state:"blocked",message:"Connect the NPN collector to supply, base to the swept DC input, emitter to a positive load, and all source/load returns to ground.",validation};
  }
  const outputVoltage=Math.min(Math.max(0,inputVoltage-vbe),supplyVoltage-vceSat),loadCurrentA=outputVoltage/loadResistance,conducting=outputVoltage>0;
  return {state:"complete",engine:"Ideal NPN emitter-follower DC estimate",message:"Uses a fixed 0.7 V base-emitter drop and caps the emitter at VCC − VCE(sat). It assumes an ideal base drive and omits beta-dependent base current, output resistance, device curves, temperature, and physical ratings.",result:{kind:"npn-emitter-follower",supplyVoltage,inputVoltage,vbeV:vbe,outputVoltage,voltageDropV:inputVoltage-outputVoltage,loadResistanceOhm:loadResistance,loadCurrentA,conducting,phaseRelation:"non-inverting DC"},validation};
}

function analyseNpnCommonEmitter(project,{source,input,transistor,resistors,capacitors,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),supplyNet=n(source,"+"),baseNet=n(transistor,"B"),collectorNet=n(transistor,"C"),emitterNet=n(transistor,"E"),inputNet=n(input,"+");
  if(n(source,"-")!==groundNet||n(input,"-")!==groundNet||!supplyNet||!baseNet||!collectorNet||!emitterNet){
    return {state:"blocked",message:"Connect the DC supply and AC input references to ground and wire the NPN base, collector, and emitter.",validation};
  }
  const biasTop=resistors.find(r=>(n(r,"1")===supplyNet&&n(r,"2")===baseNet)||(n(r,"2")===supplyNet&&n(r,"1")===baseNet));
  const biasBottom=resistors.find(r=>r!==biasTop&&((n(r,"1")===baseNet&&n(r,"2")===groundNet)||(n(r,"2")===baseNet&&n(r,"1")===groundNet)));
  const collectorRes=resistors.find(r=>r!==biasTop&&r!==biasBottom&&((n(r,"1")===supplyNet&&n(r,"2")===collectorNet)||(n(r,"2")===supplyNet&&n(r,"1")===collectorNet)));
  const emitterRes=resistors.find(r=>r!==biasTop&&r!==biasBottom&&r!==collectorRes&&((n(r,"1")===emitterNet&&n(r,"2")===groundNet)||(n(r,"2")===emitterNet&&n(r,"1")===groundNet)));
  const remaining=resistors.find(r=>r!==biasTop&&r!==biasBottom&&r!==collectorRes&&r!==emitterRes);
  const inputCap=capacitors.find(cap=>n(cap,"1")===inputNet||n(cap,"2")===inputNet);
  const inputCapOther=inputCap?(n(inputCap,"1")===inputNet?n(inputCap,"2"):n(inputCap,"1")):null;
  const outputCap=capacitors.find(cap=>cap!==inputCap&&((n(cap,"1")===collectorNet)||(n(cap,"2")===collectorNet)));
  const outputNode=outputCap?(n(outputCap,"1")===collectorNet?n(outputCap,"2"):n(outputCap,"1")):null;
  const load=remaining&&((n(remaining,"1")===outputNode&&n(remaining,"2")===groundNet)||(n(remaining,"2")===outputNode&&n(remaining,"1")===groundNet))?remaining:null;
  if(!biasTop||!biasBottom||!collectorRes||!emitterRes||!inputCap||!outputCap||!load||inputCapOther!==baseNet){
    return {state:"blocked",message:"Wire the base divider, collector/emitter resistors, input coupling capacitor, collector coupling capacitor, and grounded load.",validation};
  }
  const rTop=resistanceValue(biasTop.value),rBottom=resistanceValue(biasBottom.value),rCollector=resistanceValue(collectorRes.value),rEmitter=resistanceValue(emitterRes.value),rLoad=resistanceValue(load.value);
  const cInput=capacitanceValue(inputCap.value),cOutput=capacitanceValue(outputCap.value),supplyVoltage=voltageValue(source.value),inputAmplitudeV=voltageValue(input.value),beta=100,vbe=0.7,vceSat=0.2,thermalVoltage=0.02585;
  if(![rTop,rBottom,rCollector,rEmitter,rLoad,cInput,cOutput,supplyVoltage,inputAmplitudeV].every(Number.isFinite)||[rTop,rBottom,rCollector,rEmitter,rLoad,cInput,cOutput,supplyVoltage,inputAmplitudeV].some(v=>v<=0)){
    return {state:"blocked",message:"The transistor model requires positive supply, input, resistance, and coupling-capacitance values.",validation};
  }
  const vThevenin=supplyVoltage*rBottom/(rTop+rBottom),rThevenin=1/(1/rTop+1/rBottom);
  const baseCurrentA=(vThevenin-vbe)/(rThevenin+(beta+1)*rEmitter);
  if(baseCurrentA<=0)return {state:"blocked",message:"The divider does not forward-bias the NPN transistor.",validation};
  const collectorCurrentA=beta*baseCurrentA,emitterCurrentA=(beta+1)*baseCurrentA,baseVoltageV=vThevenin-baseCurrentA*rThevenin,emitterVoltageV=emitterCurrentA*rEmitter,collectorVoltageV=supplyVoltage-collectorCurrentA*rCollector,vceV=collectorVoltageV-emitterVoltageV;
  if(vceV<=vceSat)return {state:"blocked",message:"The calculated bias point is at or beyond saturation; this small-signal model cannot continue.",validation};
  const effectiveCollectorLoadOhm=1/(1/rCollector+1/rLoad),gmS=collectorCurrentA/thermalVoltage,rPiOhm=beta/gmS;
  const gainVPerV=-(gmS*effectiveCollectorLoadOhm*rPiOhm)/(rPiOhm+(beta+1)*rEmitter),outputAmplitudeV=Math.abs(gainVPerV)*inputAmplitudeV;
  const maximumPeakV=Math.min(collectorVoltageV-(emitterVoltageV+vceSat),supplyVoltage-collectorVoltageV);
  if(outputAmplitudeV>=maximumPeakV)return {state:"blocked",message:"The small-signal output reaches the calculated collector headroom; reduce the input before analyzing.",validation};
  const frequencyHz=1000,sineTrace=Array.from({length:9},(_,i)=>{const timeS=i/(frequencyHz*8),inputV=inputAmplitudeV*Math.sin(2*Math.PI*i/8),outputV=gainVPerV*inputV;return {timeS,inputV,outputV,collectorVoltageV:collectorVoltageV+outputV};});
  return {state:"complete",engine:"Ideal NPN common-emitter bias and midband small-signal estimate",message:"Solves a fixed-β, fixed-VBE divider-biased operating point and an ideal midband sine trace with coupling capacitors treated as AC shorts. It omits transistor curves, Early effect, capacitance corners, distortion, temperature, tolerance, and device-specific behavior.",result:{kind:"npn-common-emitter",beta,vbeV:vbe,baseVoltageV,emitterVoltageV,collectorVoltageV,collectorCurrentA,emitterCurrentA,vceV,gainVPerV,inputAmplitudeV,outputAmplitudeV,frequencyHz,maximumPeakV,sineTrace},validation};
}

function analyseReferenceBuffer(project,{sources,opAmp,load,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0");
  const positiveRail=sources.find(part=>n(part,"-")===groundNet&&n(part,"+")===n(opAmp,"VCC"));
  const negativeRail=sources.find(part=>part!==positiveRail&&n(part,"+")===groundNet&&n(part,"-")===n(opAmp,"VEE"));
  const reference=sources.find(part=>part!==positiveRail&&part!==negativeRail&&n(part,"-")===groundNet&&n(part,"+")===n(opAmp,"+"));
  const outputNet=n(opAmp,"OUT"),invertingNet=n(opAmp,"-");
  const feedbackConnected=outputNet===invertingNet;
  const loadConnected=(n(load,"1")===outputNet&&n(load,"2")===groundNet)||(n(load,"2")===outputNet&&n(load,"1")===groundNet);
  const positiveVoltage=positiveRail?voltageValue(positiveRail.value):Number.NaN,negativeVoltage=negativeRail?voltageValue(negativeRail.value):Number.NaN;
  const referenceVoltage=reference?voltageValue(reference.value):Number.NaN,loadResistance=resistanceValue(load.value);
  if(!positiveRail||!negativeRail||!reference||!feedbackConnected||!loadConnected||n(opAmp,"VEE")===n(opAmp,"VCC")
    ||![positiveVoltage,negativeVoltage,referenceVoltage,loadResistance].every(Number.isFinite)||positiveVoltage<=0||negativeVoltage<=0||referenceVoltage<=0||referenceVoltage>=positiveVoltage||loadResistance<=0){
    return {state:"blocked",message:"Connect valid dual rails, a grounded reference source, direct output feedback, and a positive output load to ground.",validation};
  }
  const loadCurrentA=referenceVoltage/loadResistance;
  return {state:"complete",engine:"Ideal reference-voltage follower load estimate",message:"Buffers a fixed reference voltage and reports the ideal resistive load current. It assumes zero output impedance and unlimited output current, and omits accuracy drift, noise, bandwidth, stability, thermal effects, and device-specific limits.",result:{kind:"reference-buffer",referenceVoltage,outputVoltage:referenceVoltage,gainVPerV:1,loadResistanceOhm:loadResistance,loadCurrentA,positiveSupplyV:positiveVoltage,negativeSupplyV:-negativeVoltage},validation};
}











function analyseStm32TimerPwm(project,{source,controller,resistor,led,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),fields=String(controller.value).split(";").map(v=>v.trim());
  const field=label=>fields.find(v=>v.startsWith(label+" "))?.slice(label.length).trim(),clockHz=Number(field("ClockHz")),prescaler=Number(field("Prescaler")),autoReload=Number(field("AutoReload")),compare=Number(field("Compare"));
  const groundNet=n(ground,"0"),vccNet=n(controller,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const loadPath=(n(controller,"TIM1_CH1")===n(resistor,"1")&&n(resistor,"2")===n(led,"A")||n(controller,"TIM1_CH1")===n(resistor,"2")&&n(resistor,"1")===n(led,"A"))&&n(led,"K")===groundNet&&n(controller,"GND")===groundNet;
  const resistance=resistanceValue(resistor.value),vf=forwardVoltage(led.value);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!loadPath||![clockHz,prescaler,autoReload,compare,resistance,vf].every(Number.isFinite)||!Number.isInteger(prescaler)||prescaler<0||prescaler>65535||!Number.isInteger(autoReload)||autoReload<1||autoReload>65535||!Number.isInteger(compare)||compare<0||compare>autoReload||clockHz<1000000||clockHz>200000000||resistance<=0||vf<=0){
    return {state:"blocked",message:"Configure valid STM32 timer clock, prescaler, auto-reload and compare counts, and wire TIM1_CH1 through a positive series resistor and LED to ground.",validation};
  }
  const frequencyHz=clockHz/((prescaler+1)*(autoReload+1)),dutyCycle=compare/(autoReload+1);
  if(!Number.isFinite(frequencyHz)||frequencyHz<1||frequencyHz>1000000)return {state:"blocked",message:"The configured timer period is outside the supported 1 Hz–1 MHz PWM range.",validation};
  const peakCurrentA=Math.max(0,(supplyVoltage-vf)/resistance),averageCurrentA=peakCurrentA*dutyCycle;
  return {state:"complete",engine:"Ideal STM32 timer PWM/load estimate",message:"Computes edge-aligned timer frequency and duty from clock, prescaler, auto-reload, and compare registers, then estimates current through an ideal LED load. Firmware, timer clock-tree setup, GPIO drive limits, switching transients, and LED nonlinear behavior are omitted.",result:{kind:"stm32-timer-pwm",clockHz,prescaler,autoReload,compare,frequencyHz,dutyCycle,peakLedCurrentA:peakCurrentA,averageLedCurrentA:averageCurrentA,firmwareExecuted:false},validation};
}
function analysePicAdcBargraph(project,{source,potentiometer,pic,bargraph,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),fields=String(pic.value).split(";").map(v=>v.trim()),potFields=String(potentiometer.value).split(";").map(v=>v.trim());
  const field=(list,label)=>list.find(v=>v.startsWith(label+" "))?.slice(label.length).trim();
  const positionText=field(potFields,"Position")?.replace(/%$/,""),position=Number(positionText);
  const groundNet=n(ground,"0"),vddNet=n(pic,"VDD"),supplyVoltage=n(source,"+")===vddNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const potPowered=n(potentiometer,"VCC")===vddNet&&n(potentiometer,"GND")===groundNet;
  const bargraphPowered=n(bargraph,"VCC")===vddNet&&n(bargraph,"GND")===groundNet;
  const outputsConnected=Array.from({length:10},(_,index)=>n(pic,"BAR"+index)&&n(pic,"BAR"+index)===n(bargraph,"IN"+index)).every(Boolean);
  const bargraphFields=String(bargraph.value).split(";").map(v=>v.trim());
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||n(pic,"VSS")!==groundNet||!potPowered||!bargraphPowered||n(potentiometer,"OUT")!==n(pic,"AN0")||!outputsConnected||field(fields,"Program")?.toLowerCase()!=="adc bargraph"||field(fields,"ADC")!=="AN0"||field(fields,"Resolution")!=="10 bit"||field(fields,"Channels")!=="10"||field(potFields,"Resolution")!=="10 bit"||field(bargraphFields,"Segments")!=="10"||!Number.isFinite(position)||position<0||position>100){
    return {state:"blocked",message:"Wire the powered potentiometer wiper to AN0, connect all ten PIC behavior outputs to the matching bargraph inputs, share VDD/VSS, and configure a 10-bit, ten-segment ADC bargraph.",validation};
  }
  const adcCount=Math.round(position*1023/100),illuminatedSegments=Math.min(10,Math.floor(adcCount*10/1023));
  const segments=Array.from({length:10},(_,index)=>index<illuminatedSegments);
  return {state:"complete",engine:"Ideal PIC-class 10-bit ADC bargraph model",message:"Maps the configured potentiometer position through a 10-bit ADC to ten bargraph thresholds. This is a logical behavior model: no PIC firmware, analog input noise, LED current paths, device-specific pin mapping, or physical bargraph characteristics are simulated.",result:{kind:"pic-adc-bargraph",positionPercent:position,adcResolutionBits:10,adcReferenceV:supplyVoltage,adcCount,illuminatedSegments,segments,displayText:segments.map(on=>on?"█":"·").join(""),firmwareExecuted:false},validation};
}
function analyseFmFrontEnd(project,{source,sweep,antenna,tuner,amplifier,report,ground,validation}){
  const nets=new Map();for(const net of project.nets)for(const item of net.endpoints)nets.set(item,net.id);
  const n=(part,pin)=>nets.get(`${part.instanceId}:${pin}`),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const sweepFields=fields(sweep.value),antennaFields=fields(antenna.value),tunerFields=fields(tuner.value),ampFields=fields(amplifier.value);
  const frequencies=(field(sweepFields,"FrequenciesMHz")??"").split(",").map(value=>Number(value.trim())),amplitudeV=Number(field(sweepFields,"AmplitudeV"));
  const antennaCenter=Number((field(antennaFields,"CenterMHz")??"").replace(/MHz$/i,"")),centerMHz=Number((field(tunerFields,"CenterMHz")??"").replace(/MHz$/i,"")),q=Number(field(tunerFields,"Q")),gainDb=Number((field(ampFields,"GainDb")??"").replace(/dB$/i,""));
  const groundNet=n(ground,"0"),vccNet=n(amplifier,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const pathNets=[n(sweep,"RF"),n(antenna,"INPUT"),n(antenna,"OUTPUT"),n(tuner,"RF_IN"),n(tuner,"RF_OUT"),n(amplifier,"INPUT"),n(amplifier,"OUTPUT"),n(report,"DATA")];
  const paths=pathNets.every(net=>typeof net==="string"&&net.length>0)&&pathNets[0]===pathNets[1]&&pathNets[2]===pathNets[3]&&pathNets[4]===pathNets[5]&&pathNets[6]===pathNets[7];
  const grounded=[sweep,antenna,tuner,amplifier,report].every(part=>n(part,"GND")===groundNet),powered=n(amplifier,"GND")===groundNet&&n(report,"GND")===groundNet&&n(report,"VCC")===vccNet;
  const sweepValid=frequencies.length>=3&&frequencies.length<=128&&frequencies.every((frequency,index)=>Number.isFinite(frequency)&&frequency>=88&&frequency<=108&&(!index||frequency>frequencies[index-1]));
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<3||supplyVoltage>5.5||!paths||!grounded||!powered||field(sweepFields,"Mode")!=="small-signal sweep"||field(antennaFields,"Mode")!=="ideal"||field(tunerFields,"Mode")!=="bandpass"||field(ampFields,"Mode")!=="linear"||!sweepValid||!Number.isFinite(amplitudeV)||amplitudeV<=0||amplitudeV>1||!Number.isFinite(centerMHz)||centerMHz<88||centerMHz>108||antennaCenter!==centerMHz||!Number.isFinite(q)||q<0.1||q>200||!Number.isFinite(gainDb)||gainDb< -40||gainDb>40){
    return {state:"blocked",message:"Wire the small-signal sweep through the ideal antenna placeholder and tuned band-pass block to the gain/report path. Use increasing frequencies from 88–108 MHz, a matching tuned center, positive Q, and bounded gain.",validation};
  }
  const linearGain=Math.pow(10,gainDb/20),responsePoints=frequencies.map(frequencyMHz=>{
    const ratio=frequencyMHz/centerMHz,detuning=q*(ratio-1/ratio),filterMagnitude=1/Math.sqrt(1+detuning*detuning),totalGainDb=20*Math.log10(filterMagnitude)+gainDb;
    return {frequencyMHz,filterMagnitude,totalGainDb,outputAmplitudeV:amplitudeV*filterMagnitude*linearGain};
  });
  const peak=responsePoints.reduce((best,item)=>item.totalGainDb>best.totalGainDb?item:best,responsePoints[0]);
  return {state:"complete",engine:"Small-signal ideal FM tuned response estimate",message:"Sweeps a bounded 88–108 MHz frequency list through an ideal resonant band-pass response and linear gain block. It is a response concept only: no antenna impedance/coupling, FM modulation/demodulation, local oscillator, IF chain, noise, real RF signal, regional band plan, or hardware behavior is modeled.",result:{kind:"fm-front-end-response",centerFrequencyMHz:centerMHz,q,gainDb,inputAmplitudeV:amplitudeV,responsePoints,peakFrequencyMHz:peak.frequencyMHz,peakResponseDb:peak.totalGainDb,peakOutputAmplitudeV:peak.outputAmplitudeV,rfTransmitted:false,demodulationModeled:false,firmwareExecuted:false},validation};
}

function analyseIrRemoteActions(project,{source,frame,receiver,decoder,display,ground,validation}){
  const nets=new Map();for(const net of project.nets)for(const item of net.endpoints)nets.set(item,net.id);
  const n=(part,pin)=>nets.get(endpoint(part,String(pin))),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const frameFields=fields(frame.value),receiverFields=fields(receiver.value),decoderFields=fields(decoder.value);
  const numberField=(list,label,suffix)=>Number(field(list,label)?.replace(new RegExp(suffix+"$","i"),""));
  const bytes=(field(frameFields,"Bytes")??"").split(/\s+/).filter(Boolean).map(value=>/^[0-9a-f]{2}$/i.test(value)?Number.parseInt(value,16):Number.NaN);
  const tolerance=Number((field(decoderFields,"Tolerance")??"").replace(/%$/,""));
  const timing={leaderMark:numberField(frameFields,"LeaderMarkUs","us"),leaderSpace:numberField(frameFields,"LeaderSpaceUs","us"),bitMark:numberField(frameFields,"BitMarkUs","us"),zeroSpace:numberField(frameFields,"ZeroSpaceUs","us"),oneSpace:numberField(frameFields,"OneSpaceUs","us"),stopMark:numberField(frameFields,"StopMarkUs","us"),carrierHz:numberField(frameFields,"CarrierHz","Hz")};
  const within=(actual,nominal)=>Number.isFinite(actual)&&actual>0&&Math.abs(actual-nominal)<=nominal*tolerance/100;
  const timingValid=within(timing.leaderMark,9000)&&within(timing.leaderSpace,4500)&&within(timing.bitMark,560)&&within(timing.zeroSpace,560)&&within(timing.oneSpace,1690)&&within(timing.stopMark,560)&&within(timing.carrierHz,38000);
  const mapText=field(decoderFields,"Map")??"",map=mapText.split(",").map(token=>{const match=token.trim().match(/^([0-9a-f]{2})=([A-Z][A-Z0-9_]{1,20})$/i);return match?{command:match[1].toUpperCase(),action:match[2].toUpperCase()}:null;});
  const validActions=new Set(["TOGGLE_LIGHT","VOLUME_UP","VOLUME_DOWN","POWER"]),mapValid=map.length>0&&map.length<=256&&map.every(item=>item&&validActions.has(item.action))&&new Set(map.map(item=>item.command)).size===map.length;
  const groundNet=n(ground,"0"),vccNet=n(decoder,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const powered=n(receiver,"VCC")===vccNet&&n(receiver,"GND")===groundNet&&n(decoder,"GND")===groundNet&&n(display,"VCC")===vccNet&&n(display,"GND")===groundNet&&n(frame,"GND")===groundNet;
  const signalPath=n(frame,"OUT")===n(receiver,"SIG")&&n(receiver,"OUT")===n(decoder,"INT0")&&n(decoder,"ACTION")===n(display,"DATA");
  const complementValid=bytes.length===4&&bytes.every(value=>Number.isInteger(value)&&value>=0&&value<=255)&&((bytes[0]^bytes[1])===255)&&((bytes[2]^bytes[3])===255);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!powered||!signalPath||field(frameFields,"Protocol")!=="NEC-like"||field(receiverFields,"Output")!=="demodulated active-low"||numberField(receiverFields,"CarrierHz","Hz")!==38000||field(decoderFields,"Program")!=="Decode NEC-like and dispatch"||field(decoderFields,"Input")!=="INT0"||field(decoderFields,"Output")!=="ACTION"||!Number.isFinite(tolerance)||tolerance<1||tolerance>30||!timingValid||!complementValid||!mapValid){
    return {state:"blocked",message:"Wire the NEC-like frame fixture through the 38 kHz IR receiver to the action decoder and display. Provide a four-byte complementary frame, timings within tolerance, and a unique action map using supported action names.",validation};
  }
  const bits=bytes.flatMap(byte=>Array.from({length:8},(_,bit)=>(byte>>bit)&1)),ones=bits.reduce((sum,bit)=>sum+bit,0),zeros=bits.length-ones;
  const frameDurationUs=timing.leaderMark+timing.leaderSpace+bits.length*timing.bitMark+ones*timing.oneSpace+zeros*timing.zeroSpace+timing.stopMark;
  const command=bytes[2],mapping=map.find(item=>item.command===command.toString(16).padStart(2,"0").toUpperCase()),action=mapping?.action??"UNMAPPED";
  const rawCode="0x"+bytes.map(value=>value.toString(16).padStart(2,"0")).join("").toUpperCase(),displayText="Key 0x"+command.toString(16).padStart(2,"0").toUpperCase()+" → "+action;
  return {state:"complete",engine:"Ideal NEC-like IR remote action dispatcher",message:"Checks the NEC-like frame timing and complementary bytes, then maps the command byte to a configured action label. The action is displayed only; no appliance is controlled. Optical propagation, carrier waveform, receiver AGC, firmware, and physical timing margins are not modeled.",result:{kind:"ir-remote-action",protocol:"NEC-like",rawCode,address:"0x"+bytes[0].toString(16).padStart(2,"0").toUpperCase(),command:"0x"+command.toString(16).padStart(2,"0").toUpperCase(),action,mapped:Boolean(mapping),mapEntries:map.length,bitCount:bits.length,frameDurationUs,displayText,actionExecuted:false,firmwareExecuted:false},validation};
}

function analyseEthernetSensorFrame(project,{source,config,controller,phy,report,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const configFields=fields(config.value),controllerFields=fields(controller.value),phyFields=fields(phy.value);
  const transitions=(field(configFields,"LinkTransitions")??"").split(">").map(value=>value.trim()),linkConfiguration=field(configFields,"Configuration");
  const deviceId=Number(field(configFields,"DeviceId")),temperatureC=Number(field(configFields,"TemperatureC")),sequence=Number(field(configFields,"Sequence"));
  const sourceMacText=field(controllerFields,"SourceMac")??"",destinationMacText=field(controllerFields,"DestinationMac")??"",etherTypeText=(field(controllerFields,"EtherType")??"").replace(/^0x/i,"");
  const parseMac=value=>{if(!/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(value))return null;return value.split(":").map(byte=>Number.parseInt(byte,16));};
  const sourceMac=parseMac(sourceMacText),destinationMac=parseMac(destinationMacText),etherType=Number.parseInt(etherTypeText,16);
  const tempDeciC=Math.round(temperatureC*10),groundNet=n(ground,"0"),vccNet=n(controller,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const wired=n(config,"DATA")===n(controller,"SENSOR")&&n(controller,"TX")===n(phy,"RX")&&n(controller,"LINK")===n(phy,"LINK")&&n(controller,"REPORT")===n(report,"DATA");
  const powered=[controller,phy,report].every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet)&&n(config,"GND")===groundNet;
  const legalNext={down:["negotiating"],negotiating:["up","down"],up:["down"]};
  const transitionsValid=transitions.length>=1&&transitions.length<=10&&transitions[0]==="down"&&transitions.every((state,index)=>["down","negotiating","up"].includes(state)&&(!index||legalNext[transitions[index-1]]?.includes(state)));
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<1.8||supplyVoltage>5.5||!wired||!powered||field(controllerFields,"Mode")!=="eth2-mock"||field(phyFields,"Mode")!=="mock"||!["up","down"].includes(field(phyFields,"Link"))||transitions.at(-1)!==field(phyFields,"Link")||!transitionsValid||!["configured","unconfigured"].includes(linkConfiguration)||!Number.isInteger(deviceId)||deviceId<0||deviceId>255||!Number.isFinite(temperatureC)||temperatureC< -3276.8||temperatureC>3276.7||!Number.isInteger(sequence)||sequence<0||sequence>65535||!sourceMac||!destinationMac||(sourceMac[0]&2)===0||(sourceMac[0]&1)!==0||(destinationMac[0]&1)!==0||!Number.isInteger(etherType)||etherType<0x0600||etherType>0xffff){
    return {state:"blocked",message:"Power the controller, PHY, and report sink; wire sensor, transmit, link, and report paths. Use a legal down → negotiating → up/down transition sequence, configured or unconfigured state, valid sensor values, unicast MAC addresses, and an EtherType in the Ethernet-II range.",validation};
  }
  const linkState=transitions.at(-1);
  const baseResult={kind:"ethernet-sensor-frame",linkTransitions:transitions,linkState,configurationState:linkConfiguration,deviceId,temperatureC,temperatureDeciC:tempDeciC,sequence,sourceMac:sourceMacText.toUpperCase(),destinationMac:destinationMacText.toUpperCase(),etherType:"0x"+etherType.toString(16).padStart(4,"0").toUpperCase(),packetTransmitted:false,firmwareExecuted:false};
  if(linkState!=="up"||linkConfiguration!=="configured"){
    const transactionState=linkState!=="up"?"waiting-for-link":"waiting-for-configuration";
    return {state:"complete",engine:"Mock Ethernet link/configuration state and frame header",message:"No frame is formed until both link state is up and configuration is complete. No packet is transmitted.",result:{...baseResult,transactionState,frameBytes:[],frameHex:"",frameLengthOctets:0,headerLengthOctets:14,payloadLengthOctets:0,fcsIncluded:false,paddingIncluded:false,preambleIncluded:false},validation};
  }
  const tempWord=tempDeciC<0?65536+tempDeciC:tempDeciC,payloadBytes=[1,deviceId,(sequence>>8)&0xff,sequence&0xff,(tempWord>>8)&0xff,tempWord&0xff];
  const headerBytes=[...destinationMac,...sourceMac,(etherType>>8)&0xff,etherType&0xff],frameBytes=[...headerBytes,...payloadBytes];
  const hex=bytes=>bytes.map(value=>value.toString(16).padStart(2,"0").toUpperCase()).join(" ");
  return {state:"complete",engine:"Mock Ethernet-II header and sensor application payload",message:"Forms a 14-octet Ethernet-II header followed by a six-octet local sensor payload. Padding, FCS, preamble, PHY signaling, and actual packet transmission are omitted.",result:{...baseResult,transactionState:"frame-ready-local-only",headerBytes,payloadBytes,frameBytes,headerHex:hex(headerBytes),payloadHex:hex(payloadBytes),frameHex:hex(frameBytes),frameLengthOctets:frameBytes.length,headerLengthOctets:headerBytes.length,payloadLengthOctets:payloadBytes.length,fcsIncluded:false,paddingIncluded:false,preambleIncluded:false},validation};
}

function analyseWifiRelayControl(project,{source,command,controller,wifi,driver,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const commandFields=fields(command.value),controllerFields=fields(controller.value),wifiFields=fields(wifi.value),driverFields=fields(driver.value);
  const requestedCommand=field(commandFields,"Command"),suppliedToken=field(commandFields,"Token"),expectedToken=field(controllerFields,"ExpectedToken"),linkState=field(wifiFields,"Link");
  const requestedCoilCurrentMa=Number((field(driverFields,"RequestedCoilCurrentMa")??"").replace(/mA$/i,"")),maximumCurrentMa=Number((field(driverFields,"MaximumCurrentMa")??"").replace(/mA$/i,""));
  const groundNet=n(ground,"0"),vccNet=n(controller,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const dataPaths=n(command,"COMMAND")===n(controller,"CMD")&&n(command,"TOKEN")===n(controller,"TOKEN")&&n(wifi,"LINK")===n(controller,"LINK")&&n(controller,"DRIVE")===n(driver,"IN");
  const powered=[controller,wifi,driver].every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet)&&n(command,"GND")===groundNet;
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<3||supplyVoltage>5.5||!dataPaths||!powered||field(controllerFields,"Mode")!=="local-relay"||field(controllerFields,"AuthMode")!=="placeholder"||field(controllerFields,"OfflineState")!=="fail-safe"||expectedToken!=="TEST_TOKEN"||field(wifiFields,"Mode")!=="local-mock"||!["online","offline"].includes(linkState)||!["ON","OFF"].includes(requestedCommand)||suppliedToken===undefined||!/^([A-Z0-9_]{1,32})$/.test(suppliedToken)||field(driverFields,"Mode")!=="ideal-switch"||!Number.isFinite(requestedCoilCurrentMa)||requestedCoilCurrentMa<=0||!Number.isFinite(maximumCurrentMa)||maximumCurrentMa<=0||requestedCoilCurrentMa>1000||maximumCurrentMa>1000){
    return {state:"blocked",message:"Wire the local command and token inputs to the controller, its link input to the Wi-Fi fixture, and its output to the relay driver. Use local-mock mode, the TEST_TOKEN placeholder, fail-safe offline mode, a valid ON/OFF command, and positive current settings.",validation};
  }
  const authenticated=suppliedToken===expectedToken;
  let outcome,relayEnergized=false,reason="";
  if(linkState!=="online"){outcome="offline-fail-safe";reason="Wi-Fi link is offline; relay remains de-energized.";}
  else if(!authenticated){outcome="denied-placeholder-token";reason="The placeholder token does not match; relay remains de-energized.";}
  else if(requestedCommand==="OFF"){outcome="applied-off";reason="Authorized local OFF command applied.";}
  else if(requestedCoilCurrentMa>maximumCurrentMa){outcome="driver-current-limit";reason="Requested coil current exceeds the configured driver limit; relay remains de-energized.";}
  else {outcome="applied-on";relayEnergized=true;reason="Authorized local ON command applied to the ideal relay-driver state.";}
  return {state:"complete",engine:"Local Wi-Fi relay command and ideal driver-state model",message:reason+" The token check is a placeholder, not secure authentication; no network or physical relay is modeled.",result:{kind:"wifi-relay-control",command:requestedCommand,linkState,authentication:"placeholder string comparison only",authenticated,transactionState:outcome,relayEnergized,requestedCoilCurrentMa,maximumCurrentMa,coilCurrentMa:relayEnergized?requestedCoilCurrentMa:0,physicalRelaySwitched:false,networkTransmitted:false,firmwareExecuted:false,reason},validation};
}

function analyseGsmAlarmMock(project,{source,event,controller,modem,report,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const eventFields=fields(event.value),controllerFields=fields(controller.value),modemFields=fields(modem.value);
  const alarmState=field(eventFields,"AlarmState"),message=field(eventFields,"Message")??"",responses=(field(eventFields,"Responses")??"").split("|"),sendResult=(field(eventFields,"SendResult")??"").split("|");
  const destination=field(controllerFields,"Destination"),timeoutMs=Number((field(controllerFields,"CommandTimeoutMs")??"").replace(/ms$/i,""));
  const registration=field(modemFields,"Registration"),groundNet=n(ground,"0"),vccNet=n(controller,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const serialWired=n(controller,"TX")===n(modem,"RX")&&n(controller,"RX")===n(modem,"TX");
  const dataPaths=n(event,"ALARM")===n(controller,"ALARM")&&n(controller,"REPORT")===n(report,"DATA");
  const powered=[controller,modem,report].every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet)&&n(event,"GND")===groundNet;
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<3||supplyVoltage>5.5||!serialWired||!dataPaths||!powered||field(controllerFields,"Mode")!=="sms-mock"||destination!=="TEST_ONLY"||field(modemFields,"Mode")!=="AT-mock"||!["active","inactive"].includes(alarmState)||!/^([A-Z0-9_]{1,40})$/.test(message)||!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>60000||responses.length!==4||responses.some(value=>!value.trim())||sendResult.length!==2||sendResult.some(value=>!value.trim())){
    return {state:"blocked",message:"Wire the alarm input, crossed UART paths, shared ground, modem, and report sink. Use the TEST_ONLY destination, sms-mock mode, a bounded command timeout, and four modem init responses plus a two-field mock send result.",validation};
  }
  const commands=["AT","AT+CREG?","AT+CMGF=1",'AT+CMGS="TEST_ONLY"'];
  if(alarmState==="inactive")return {state:"complete",engine:"Mock GSM AT-command alarm transaction",message:"No alarm is active; no modem commands or alert message are prepared. This local mock never transmits.",result:{kind:"gsm-alarm-mock",alarmState,message,commands:[],commandsCompleted:0,transactionState:"idle-no-alarm",modemAccepted:false,deliveryConfirmed:false,radioTransmitted:false,firmwareExecuted:false},validation};
  if(registration!=="registered")return {state:"complete",engine:"Mock GSM AT-command alarm transaction",message:"The modem is not registered, so the alert transaction stops before sending. Registration and network service are fixtures only.",result:{kind:"gsm-alarm-mock",alarmState,message,commands,commandsCompleted:0,transactionState:"aborted-not-registered",modemAccepted:false,deliveryConfirmed:false,radioTransmitted:false,firmwareExecuted:false},validation};
  const expected=["OK","REG","OK",">"];let failedAt=-1;
  for(let index=0;index<expected.length;index++){
    const response=responses[index].trim(),ok=expected[index]==="REG"?/^\+CREG:\s*0,[15]$/.test(response):response===expected[index];
    if(!ok){failedAt=index;break;}
  }
  if(failedAt>=0)return {state:"complete",engine:"Mock GSM AT-command alarm transaction",message:"The mocked modem response failed the expected AT-command step; the sequence aborts without preparing an SMS body.",result:{kind:"gsm-alarm-mock",alarmState,message,commands,commandsCompleted:failedAt+1,failedCommand:commands[failedAt],failedResponse:responses[failedAt].trim(),transactionState:"aborted-modem-error",modemAccepted:false,deliveryConfirmed:false,radioTransmitted:false,firmwareExecuted:false},validation};
  const accepted=/^\+CMGS:\s*\d+$/.test(sendResult[0].trim())&&sendResult[1].trim()==="OK";
  return {state:"complete",engine:"Mock GSM AT-command alarm transaction",message:accepted?"The AT sequence completed and the mock modem accepted the submission; delivery is not confirmed. Nothing was transmitted.":"The mock modem rejected the message submission; no delivery is confirmed and nothing was transmitted.",result:{kind:"gsm-alarm-mock",alarmState,message,commands,commandsCompleted:commands.length,failedCommand:accepted?null:"message submission",failedResponse:accepted?null:sendResult.join("|"),messageBody:accepted?message:null,transactionState:accepted?"mock-modem-accepted":"aborted-send-error",modemAccepted:accepted,deliveryConfirmed:false,radioTransmitted:false,firmwareExecuted:false},validation};
}

function analyseLoraSensorNode(project,{source,fixture,controller,radio,report,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const fixtureFields=fields(fixture.value),controllerFields=fields(controller.value),radioFields=fields(radio.value);
  const temperatureC=Number(field(fixtureFields,"TemperatureC")),nodeId=Number(field(controllerFields,"NodeId")),sequence=Number(field(controllerFields,"Sequence"));
  const airtimeMs=Number((field(controllerFields,"AirtimeMs")??"").replace(/ms$/i,"")),dutyWindowMs=Number((field(controllerFields,"DutyWindowMs")??"").replace(/ms$/i,"")),dutyLimitPercent=Number((field(controllerFields,"DutyLimitPercent")??"").replace(/%$/,""));
  const requestsText=field(controllerFields,"RequestsMs")??"",requestsMs=requestsText.split(",").map(value=>Number(value.trim()));
  const groundNet=n(ground,"0"),vccNet=n(controller,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const pathsWired=n(fixture,"DATA")===n(controller,"SENSOR")&&n(controller,"RADIO")===n(radio,"DATA")&&n(controller,"REPORT")===n(report,"DATA");
  const powered=[controller,radio,report].every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet)&&n(fixture,"GND")===groundNet;
  const requestsValid=requestsMs.length>0&&requestsMs.length<=1000&&requestsMs.every((time,index)=>Number.isInteger(time)&&time>=0&&time<dutyWindowMs&&(!index||time>requestsMs[index-1]));
  const tempDeciC=Math.round(temperatureC*10);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<1.8||supplyVoltage>5.5||!pathsWired||!powered||field(controllerFields,"Mode")!=="payload-v1"||field(radioFields,"Mode")!=="mock"||Number(field(radioFields,"MaximumPayloadBytes"))!==255||field(radioFields,"Format")!=="V1"||!Number.isInteger(nodeId)||nodeId<0||nodeId>255||!Number.isInteger(sequence)||sequence<0||sequence>65535||!Number.isFinite(temperatureC)||temperatureC< -3276.8||temperatureC>3276.7||!Number.isInteger(airtimeMs)||airtimeMs<1||!Number.isInteger(dutyWindowMs)||dutyWindowMs<airtimeMs||dutyWindowMs>3600000||!Number.isFinite(dutyLimitPercent)||dutyLimitPercent<=0||dutyLimitPercent>100||!requestsValid){
    return {state:"blocked",message:"Power the node and radio, connect the temperature fixture, radio payload path, and report sink, and configure an 8-bit node ID, 16-bit sequence, signed deci-degree temperature, ordered request times, positive airtime, and a valid configured duty budget.",validation};
  }
  const tempWord=tempDeciC<0?65536+tempDeciC:tempDeciC,payloadBytes=[1,nodeId,(sequence>>8)&0xff,sequence&0xff,(tempWord>>8)&0xff,tempWord&0xff];
  const payloadHex=payloadBytes.map(value=>value.toString(16).padStart(2,"0").toUpperCase()).join(" "),airtimeBudgetMs=dutyWindowMs*dutyLimitPercent/100;
  let usedAirtimeMs=0,previousTxEndMs=-1;
  const schedule=requestsMs.map(timeMs=>{
    if(timeMs<previousTxEndMs)return {timeMs,sent:false,reason:"transmission overlaps previous packet"};
    if(usedAirtimeMs+airtimeMs>airtimeBudgetMs)return {timeMs,sent:false,reason:"configured duty budget exhausted"};
    usedAirtimeMs+=airtimeMs;previousTxEndMs=timeMs+airtimeMs;return {timeMs,sent:true,reason:"within configured duty budget"};
  });
  const sentCount=schedule.filter(item=>item.sent).length,dutyCyclePercent=usedAirtimeMs/dutyWindowMs*100;
  return {state:"complete",engine:"Ideal LoRa sensor payload and configured duty-window guard",message:"Encodes a six-octet application payload and admits non-overlapping scheduled sends up to the user-configured airtime budget in one fixed observation window. Airtime is an input assumption; no LoRa PHY, RF transmission, regional rule, firmware, link quality, or regulatory compliance is simulated.",result:{kind:"lora-sensor-node",temperatureC,temperatureDeciC:tempDeciC,nodeId,sequence,payloadBytes,payloadHex,payloadLengthOctets:payloadBytes.length,airtimeMs,dutyWindowMs,dutyLimitPercent,airtimeBudgetMs,usedAirtimeMs,dutyCyclePercent,requestsMs,schedule,sentCount,rejectedCount:schedule.length-sentCount,radioTransmitted:false,firmwareExecuted:false,regionalCompliance:"not evaluated"},validation};
}

function analyseBleBeaconConfig(project,{source,settings,encoder,advertiser,report,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const settingFields=fields(settings.value),encoderFields=fields(encoder.value),advertiserFields=fields(advertiser.value);
  const name=field(settingFields,"Name")??"",flagsText=field(settingFields,"Flags")??"",serviceUuid=(field(settingFields,"ServiceUuid")??"").replace(/^0x/i,""),txPowerDbm=Number(field(settingFields,"TxPowerDbm"));
  const flags=Number.parseInt(flagsText.replace(/^0x/i,""),16),nameBytes=Array.from(new TextEncoder().encode(name));
  const groundNet=n(ground,"0"),vccNet=n(encoder,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const dataPaths=n(settings,"DATA")===n(encoder,"CONFIG")&&n(encoder,"TX")===n(advertiser,"RX")&&n(encoder,"REPORT")===n(report,"DATA");
  const powered=[encoder,advertiser,report].every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet)&&n(settings,"GND")===groundNet;
  const configValid=field(encoderFields,"Protocol")==="legacy"&&Number(field(encoderFields,"MaximumBytes"))===31&&field(advertiserFields,"Mode")==="legacy"&&Number(field(advertiserFields,"MaximumBytes"))===31;
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<1.8||supplyVoltage>5.5||!dataPaths||!powered||!configValid||!name.trim()||nameBytes.length===0||!Number.isInteger(flags)||flags<0||flags>255||!/^([0-9A-Fa-f]{4})$/.test(serviceUuid)||!Number.isInteger(txPowerDbm)||txPowerDbm< -128||txPowerDbm>127){
    return {state:"blocked",message:"Power the encoder, BLE module, and report sink; connect settings → encoder → advertiser/report; configure a non-empty UTF-8 name, one-byte flags, a 16-bit service UUID, signed 8-bit transmit-power value, and legacy 31-byte mode.",validation};
  }
  const serviceValue=Number.parseInt(serviceUuid,16),structures=[];
  const append=(name,type,data)=>structures.push({name,bytes:[data.length+1,type,...data]});
  append("Flags",0x01,[flags]);
  append("Complete 16-bit Service UUIDs",0x03,[serviceValue&0xff,(serviceValue>>8)&0xff]);
  append("Complete Local Name",0x09,nameBytes);
  append("Tx Power Level",0x0a,[txPowerDbm<0?256+txPowerDbm:txPowerDbm]);
  const payloadBytes=structures.flatMap(item=>item.bytes);
  if(payloadBytes.length>31)return {state:"blocked",message:"The encoded legacy advertising data exceeds the 31-octet limit. Shorten the UTF-8 device name or remove an advertising field.",validation};
  const payloadHex=payloadBytes.map(value=>value.toString(16).padStart(2,"0").toUpperCase()).join(" ");
  const fieldsSummary=structures.map(item=>({name:item.name,lengthOctets:item.bytes.length,bytes:item.bytes.map(value=>value.toString(16).padStart(2,"0").toUpperCase())}));
  return {state:"complete",engine:"Ideal Bluetooth LE legacy advertising data encoder",message:"Encodes the configured Flags, Complete 16-bit Service UUIDs, Complete Local Name, and signed Tx Power Level into length/type/data AD structures, then checks the legacy 31-octet data limit. It does not transmit radio packets or model discovery, timing, RF propagation, connection setup, GATT services, privacy, or firmware.",result:{kind:"ble-beacon-config",deviceName:name,deviceNameUtf8Bytes:nameBytes.length,flags,serviceUuid:"0x"+serviceValue.toString(16).padStart(4,"0").toUpperCase(),serviceUuidEncodedBytes:[serviceValue&0xff,(serviceValue>>8)&0xff],txPowerDbm,structures:fieldsSummary,payloadBytes,payloadHex,payloadLengthOctets:payloadBytes.length,legacyMaximumOctets:31,radioTransmitted:false,firmwareExecuted:false},validation};
}

function analyseLowPowerSleepWake(project,{source,fixture,controller,resistor,led,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const fixtureFields=fields(fixture.value),controllerFields=fields(controller.value);
  const durationMs=Number((field(fixtureFields,"DurationMs")??"").replace(/ms$/i,""));
  const eventText=field(fixtureFields,"Events")??"";
  const events=eventText.split(",").map(token=>{const match=token.trim().match(/^(\d+):(rising|falling)$/i);return match?{timeMs:Number(match[1]),edge:match[2].toLowerCase()}:null;});
  const runCurrentUa=Number(field(controllerFields,"RunCurrentUa")),sleepCurrentUa=Number(field(controllerFields,"SleepCurrentUa"));
  const wakeDurationMs=Number((field(controllerFields,"WakeDurationMs")??"").replace(/ms$/i,"")),wakeMode=field(controllerFields,"WakeMode");
  const groundNet=n(ground,"0"),vccNet=n(controller,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const fixtureWired=n(fixture,"INT")===n(controller,"INT")&&n(fixture,"GND")===groundNet&&n(controller,"GND")===groundNet;
  const ledPath=((n(controller,"LED")===n(resistor,"1")&&n(resistor,"2")===n(led,"A"))||(n(controller,"LED")===n(resistor,"2")&&n(resistor,"1")===n(led,"A")))&&n(led,"K")===groundNet;
  const resistance=resistanceValue(resistor.value),vf=forwardVoltage(led.value);
  const eventsValid=events.length>0&&events.length<=1000&&events.every((event,index)=>event&&Number.isInteger(event.timeMs)&&event.timeMs>=0&&event.timeMs<durationMs&&(!index||event.timeMs>events[index-1].timeMs));
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<1||supplyVoltage>5.5||!fixtureWired||!ledPath||!Number.isFinite(durationMs)||!Number.isInteger(durationMs)||durationMs<1||durationMs>3600000||!eventsValid||field(controllerFields,"WakeMode")!=="rising"||!Number.isFinite(runCurrentUa)||!Number.isFinite(sleepCurrentUa)||sleepCurrentUa<0||runCurrentUa<=sleepCurrentUa||runCurrentUa>1e7||sleepCurrentUa>1e6||!Number.isFinite(wakeDurationMs)||!Number.isInteger(wakeDurationMs)||wakeDurationMs<1||wakeDurationMs>durationMs||!Number.isFinite(resistance)||resistance<=0||!Number.isFinite(vf)||vf<=0||vf>=supplyVoltage){
    return {state:"blocked",message:"Power the MCU, connect the interrupt fixture to INT and ground, and wire a current-limited LED output. Configure ordered rising/falling events within the run duration, a rising-edge wake mode, and positive sleep/run currents and wake time.",validation};
  }
  const wakeIntervals=[];let awakeUntilMs=0,wakeCount=0;
  const eventResults=events.map(event=>{
    if(event.edge!=="rising")return {...event,woke:false,reason:"wake edge is rising only"};
    if(event.timeMs<awakeUntilMs)return {...event,woke:false,reason:"MCU is already awake"};
    awakeUntilMs=Math.min(durationMs,event.timeMs+wakeDurationMs);wakeIntervals.push([event.timeMs,awakeUntilMs]);wakeCount++;
    return {...event,woke:true,reason:"rising edge woke MCU"};
  });
  const awakeTimeMs=wakeIntervals.reduce((sum,[start,end])=>sum+end-start,0),sleepTimeMs=durationMs-awakeTimeMs;
  const ledCurrentA=Math.max(0,(supplyVoltage-vf)/resistance),mcuChargeUaMs=sleepCurrentUa*sleepTimeMs+runCurrentUa*awakeTimeMs,ledChargeUaMs=ledCurrentA*1e6*awakeTimeMs;
  const averageMcuCurrentUa=mcuChargeUaMs/durationMs,averageLedCurrentUa=ledChargeUaMs/durationMs,averageSupplyCurrentUa=averageMcuCurrentUa+averageLedCurrentUa;
  const energyMj=supplyVoltage*(mcuChargeUaMs+ledChargeUaMs)*1e-6;
  return {state:"complete",engine:"Ideal MCU sleep/wake duty and LED load estimate",message:"Counts rising-edge wake events, ignores falling edges and interrupts that arrive while the MCU is already awake, and estimates time-weighted MCU plus LED current. It does not execute firmware or model a specific MCU, leakage, wake latency, oscillator startup, GPIO limits, regulator losses, or real sleep current.",result:{kind:"low-power-sleep-wake",supplyVoltage,durationMs,runCurrentUa,sleepCurrentUa,wakeDurationMs,wakeMode,wakeCount,events:eventResults,awakeTimeMs,sleepTimeMs,ledPeakCurrentMa:ledCurrentA*1000,averageMcuCurrentUa,averageLedCurrentUa,averageSupplyCurrentUa,energyMj,ledOnAtEnd:wakeIntervals.some(([start,end])=>start<=durationMs&&end>durationMs),firmwareExecuted:false},validation};
}

function analyseEepromRingLogger(project,{source,fixture,controller,eeprom,display,pullups,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const fixtureFields=fields(fixture.value),controllerFields=fields(controller.value),eepromFields=fields(eeprom.value);
  const samplesText=field(fixtureFields,"Samples")??"",samples=samplesText.split(",").map(value=>Number(value.trim())),periodMs=Number((field(fixtureFields,"PeriodMs")??"").replace(/ms$/i,"")),samplePeriodMs=Number((field(controllerFields,"SamplePeriodMs")??"").replace(/ms$/i,"")),capacity=Number(field(eepromFields,"Capacity")),writeCycleMs=Number((field(eepromFields,"WriteCycleMs")??"").replace(/ms$/i,""));
  const groundNet=n(ground,"0"),vccNet=n(controller,"VCC"),supplyVoltage=voltageValue(source.value);
  const powered=n(source,"+")===vccNet&&n(source,"-")===groundNet&&n(fixture,"GND")===groundNet&&[controller,eeprom,display].every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet);
  const sdaNet=n(controller,"SDA"),sclNet=n(controller,"SCL"),busWired=sdaNet&&sclNet&&sdaNet!==sclNet&&n(eeprom,"SDA")===sdaNet&&n(eeprom,"SCL")===sclNet&&pullups.some(item=>(n(item,"1")===vccNet&&n(item,"2")===sdaNet)||(n(item,"2")===vccNet&&n(item,"1")===sdaNet))&&pullups.some(item=>(n(item,"1")===vccNet&&n(item,"2")===sclNet)||(n(item,"2")===vccNet&&n(item,"1")===sclNet));
  const pullupsValid=pullups.every(item=>{const value=resistanceValue(item.value);return Number.isFinite(value)&&value>=1000&&value<=10000;});
  const dataPath=n(fixture,"DATA")===n(controller,"SENSOR")&&n(controller,"DISPLAY")===n(display,"DATA");
  const samplesValid=samples.length>0&&samples.length<=1000&&samples.every(value=>Number.isFinite(value)&&Math.abs(value)<=1e9);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!powered||!busWired||!pullupsValid||!dataPath||field(controllerFields,"Mode")!=="circular logger"||field(eepromFields,"Mode")!=="circular"||field(fixtureFields,"Unit")!=="C"||!Number.isFinite(periodMs)||periodMs<1||periodMs>3600000||samplePeriodMs!==periodMs||!Number.isInteger(capacity)||capacity<1||capacity>256||!Number.isFinite(writeCycleMs)||writeCycleMs<=0||writeCycleMs>=periodMs||!samplesValid){
    return {state:"blocked",message:"Power the controller, EEPROM, and display; connect the sample fixture; wire SDA and SCL to the EEPROM with one valid pull-up per line; configure a circular buffer with positive capacity and write cycle shorter than the sample interval.",validation};
  }
  const ring=new Array(capacity),timestamps=new Array(capacity);let writeIndex=0;
  samples.forEach((value,index)=>{ring[writeIndex]=value;timestamps[writeIndex]=index*periodMs;writeIndex=(writeIndex+1)%capacity;});
  const retainedCount=Math.min(samples.length,capacity),oldestIndex=samples.length>capacity?writeIndex:0;
  const replayValues=Array.from({length:retainedCount},(_,index)=>ring[(oldestIndex+index)%capacity]),replayTimesMs=Array.from({length:retainedCount},(_,index)=>timestamps[(oldestIndex+index)%capacity]);
  const overwrittenRecords=Math.max(0,samples.length-capacity),wrapped=samples.length>capacity,replayText=replayValues.map((value,index)=>replayTimesMs[index]+" ms: "+value.toString()+" °C").join(" | ");
  return {state:"complete",engine:"Ideal EEPROM circular sample-buffer model",message:"Stores periodic fixture samples in a bounded circular buffer and replays the retained values in chronological order. This does not model MCU firmware, physical EEPROM page behavior, write endurance, power-loss recovery, I²C timing, or sensor accuracy.",result:{kind:"eeprom-ring-logger",samplePeriodMs,writeCycleMs,capacity,recordedSamples:samples.length,overwrittenRecords,bufferWrapped:wrapped,replayValues,replayTimesMs,replayUnit:"°C",displayText:replayText,firmwareExecuted:false},validation};
}
function analyseNfcUidDisplay(project,{source,tag,reader,controller,display,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const tagFields=fields(tag.value),readerFields=fields(reader.value),controllerFields=fields(controller.value),uid=(field(tagFields,"UID")??"").replace(/\s+/g,"").toUpperCase(),readStatus=field(tagFields,"ReadStatus");
  const supplyVoltage=voltageValue(source.value),groundNet=n(ground,"0"),vccNet=n(controller,"VCC");
  const powered=n(source,"+")===vccNet&&n(source,"-")===groundNet&&[reader,controller,display].every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet)&&n(tag,"GND")===groundNet;
  const dataPath=n(tag,"UID")===n(reader,"TAG")&&n(reader,"DATA")===n(controller,"RX")&&n(controller,"DISPLAY")===n(display,"DATA");
  const config=field(readerFields,"Mode")==="UID-only"&&field(readerFields,"Band")==="13.56 MHz"&&field(controllerFields,"Program")==="Display UID"&&field(controllerFields,"Mode")==="UID-display-only"&&/^(?:[0-9A-F]{8}|[0-9A-F]{14}|[0-9A-F]{20})$/.test(uid);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!powered||!dataPath||!config||readStatus!=="ok"){
    return {state:"blocked",message:"Power the NFC reader, controller, and display; connect the tag UID through the reader to the controller and display; provide a readable UID-only tag fixture.",validation};
  }
  const displayText="Tag UID: "+uid;
  return {state:"complete",engine:"Ideal NFC UID read-and-display model",message:"Displays a UID from a successful ideal tag-read fixture. A UID is an identifier, not proof of identity or a secret credential. RF coupling, anti-collision, secure card authentication, firmware, and physical NFC behavior are not modeled.",result:{kind:"nfc-uid-display",uid,readStatus,displayText,uidIsAuthentication:false,firmwareExecuted:false},validation};
}
function analyseRfidInventory(project,{source,fixture,reader,report,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const fixtureFields=fields(fixture.value),readerFields=fields(reader.value);
  const uids=(field(fixtureFields,"UIDs")??"").split(",").map(uid=>uid.trim().toUpperCase());
  const slots=Number(field(fixtureFields,"Slots")),readerSlots=Number(field(readerFields,"Slots"));
  const validUid=uid=>/^(?:[0-9A-F]{8}|[0-9A-F]{14}|[0-9A-F]{20})$/.test(uid);
  const supplyVoltage=voltageValue(source.value),groundNet=n(ground,"0"),vccNet=n(reader,"VCC");
  const powered=n(source,"+")===vccNet&&n(source,"-")===groundNet&&[reader,report].every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet)&&n(fixture,"GND")===groundNet;
  const signalPath=n(fixture,"TAGS")===n(reader,"TAGS")&&n(reader,"DATA")===n(report,"DATA");
  const pins=[n(source,"+"),n(source,"-"),n(ground,"0"),n(fixture,"TAGS"),n(fixture,"GND"),n(reader,"TAGS"),n(reader,"DATA"),n(reader,"VCC"),n(reader,"GND"),n(report,"DATA"),n(report,"VCC"),n(report,"GND")];
  const validSlots=[2,4,8,16].includes(slots)&&readerSlots===slots;
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<3||supplyVoltage>5.5||!powered||!signalPath||pins.some(net=>typeof net!=="string"||!net)||field(readerFields,"Mode")!=="inventory"||field(readerFields,"Band")!=="13.56 MHz"||!validSlots||uids.length<1||uids.length>64||uids.some(uid=>!validUid(uid))){
    return {state:"blocked",message:"Power the ideal reader and report, connect the UID fixture to the reader and the reader data to the report, and use valid 13.56 MHz UID fixtures with matching 2, 4, 8, or 16 slot settings.",validation};
  }
  const slotGroups=new Map();for(const uid of uids){const slot=Number.parseInt(uid.slice(-2),16)%slots;if(!slotGroups.has(slot))slotGroups.set(slot,[]);slotGroups.get(slot).push(uid);}
  const uniqueUids=[...new Set(uids)],collisions=[...slotGroups.entries()].filter(([,group])=>group.length>1).map(([slot,group])=>({slot,uids:[...new Set(group)],tagCount:group.length}));
  const duplicateUidCount=uids.length-uniqueUids.length,occupiedSlots=slotGroups.size,collisionSlotCount=collisions.length;
  return {state:"complete",engine:"Deterministic RFID UID-to-slot inventory fixture",message:"Reports tag IDs and slot contention using a deterministic UID-hash fixture for repeatable education. It is not an RFID air-interface implementation: anti-collision protocol timing, RF coupling, modulation, reader certification, secure authentication, firmware, and hardware behavior are not modeled.",result:{kind:"rfid-inventory",bandMHz:13.56,slotCount:slots,tagCount:uids.length,uniqueUidCount:uniqueUids.length,duplicateUidCount,occupiedSlots,collisionSlotCount,collisions,inventoryComplete:collisionSlotCount===0&&duplicateUidCount===0,slotAssignmentModel:"last UID byte modulo slot count",rfTransmitted:false,antiCollisionProtocolModeled:false,authenticationModeled:false,firmwareExecuted:false},validation};
}
function analyseRfidAllowlist(project,{source,tag,reader,controller,indicator,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const tagUid=(field(fields(tag.value),"UID")??"").replace(/\s+/g,"").toUpperCase(),readerFields=fields(reader.value),controllerFields=fields(controller.value),allowlistText=field(controllerFields,"Allowlist")??"";
  const allowlist=allowlistText.split(",").map(uid=>uid.trim().toUpperCase()),validUid=uid=>/^(?:[0-9A-F]{8}|[0-9A-F]{14}|[0-9A-F]{20})$/.test(uid);
  const supplyVoltage=voltageValue(source.value),groundNet=n(ground,"0"),vccNet=n(controller,"VCC");
  const powered=n(source,"+")===vccNet&&n(source,"-")===groundNet&&[reader,controller,indicator].every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet)&&n(tag,"GND")===groundNet;
  const signalPath=n(tag,"UID")===n(reader,"TAG")&&n(reader,"DATA")===n(controller,"TAG")&&n(controller,"LOCK")===n(indicator,"CTRL");
  const configuration=field(readerFields,"Mode")==="UID-only"&&field(readerFields,"Band")==="13.56 MHz"&&field(controllerFields,"UnlockState")==="1"&&field(controllerFields,"DenyState")==="0"&&validUid(tagUid)&&allowlist.length>0&&allowlist.every(validUid);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!powered||!signalPath||!configuration){
    return {state:"blocked",message:"Power the reader, controller, and indicator; connect the passive tag UID to the reader, reader DATA to controller TAG, and controller LOCK to the indicator; configure a valid UID-only allowlist.",validation};
  }
  const allowed=allowlist.includes(tagUid),lockOpen=allowed,accessState=allowed?"granted":"denied";
  return {state:"complete",engine:"Ideal RFID UID allowlist behavior model",message:"Compares a fixture UID against an explicit allowlist and reports a simulated lock output. UID-only identification is cloneable and is not cryptographic authentication or a security-grade access-control design; RF coupling, anti-collision, credentials, firmware, and physical lock behavior are not modeled.",result:{kind:"rfid-access",uid:tagUid,allowed,accessState,lockOpen,lockOutput:lockOpen?1:0,allowlistEntries:allowlist.length,authentication:"UID only; not secure",firmwareExecuted:false},validation};
}
function analyseGnssRmc(project,{source,gnss,parser,display,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const supplyVoltage=voltageValue(source.value),sentence=field(fields(gnss.value),"Sentence")??"",match=sentence.match(/^\$(GPRMC|GNRMC),([^*]+)\*([0-9A-F]{2})$/i);
  const body=match?match[1]+","+match[2]:"",check=match?.[3]??"",dataFields=body.split(",");
  let calculated=0;for(const character of body)calculated^=character.charCodeAt(0);
  const checksumValid=Boolean(match)&&calculated===Number.parseInt(check,16),fixValid=dataFields[2]==="A";
  const parseCoordinate=(raw,hemisphere,degreeDigits,maximum)=>{
    if(!new RegExp("^\\d{"+degreeDigits+"}\\d{2}\\.\\d+$").test(raw??"")||!["N","S","E","W"].includes(hemisphere??""))return Number.NaN;
    const packed=Number(raw),degrees=Math.floor(packed/100),minutes=packed-degrees*100;
    if(!Number.isFinite(packed)||minutes<0||minutes>=60||degrees>maximum||(degrees===maximum&&minutes>0))return Number.NaN;
    const magnitude=degrees+minutes/60;return hemisphere==="S"||hemisphere==="W"?-magnitude:magnitude;
  };
  const latitude=parseCoordinate(dataFields[3],dataFields[4],2,90),longitude=parseCoordinate(dataFields[5],dataFields[6],3,180);
  const speedKnots=Number(dataFields[7]),timeValid=/^\d{6}(?:\.\d+)?$/.test(dataFields[1]??""),dateValid=/^\d{6}$/.test(dataFields[9]??"");
  const powered=n(source,"+")===n(parser,"VCC")&&n(source,"-")===n(ground,"0")&&n(gnss,"VCC")===n(parser,"VCC")&&n(display,"VCC")===n(parser,"VCC")&&n(gnss,"GND")===n(ground,"0")&&n(parser,"GND")===n(ground,"0")&&n(display,"GND")===n(ground,"0");
  const signalPath=n(gnss,"TX")===n(parser,"RX")&&n(parser,"DISPLAY")===n(display,"DATA");
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!powered||!signalPath||field(fields(parser.value),"SentenceType")!=="RMC"||!checksumValid||!fixValid||!timeValid||!dateValid||!Number.isFinite(latitude)||!Number.isFinite(longitude)||!Number.isFinite(speedKnots)||speedKnots<0){
    return {state:"blocked",message:"Power the GNSS fixture, parser, and display; connect the GNSS TX to parser RX and parser DISPLAY to the text sink; provide a checksum-valid GPRMC/GNRMC sentence with an active fix and valid coordinates.",validation};
  }
  const displayText=latitude.toFixed(5)+", "+longitude.toFixed(5);
  return {state:"complete",engine:"Ideal NMEA RMC sentence parser model",message:"Verifies an RMC sentence checksum and active-fix flag, converts its latitude/longitude fields to signed decimal degrees, and sends the result to a text sink. It does not model GNSS reception, UART framing, satellite geometry, MCU firmware, or position accuracy.",result:{kind:"gnss-rmc",sentenceType:dataFields[0]??match[1],checksum:check.toUpperCase(),checksumValid,fixStatus:"active",utcTime:dataFields[1],latitude,longitude,speedKnots,displayText,firmwareExecuted:false},validation};
}
function analyseRs485PollNetwork(project,{source,poll,master,nodes,transceivers,terminations,sensors,display,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const addressValue=value=>/^0x[0-9a-f]{1,2}$/i.test(value??"")?Number.parseInt(value,16):Number.NaN;
  const masterFields=fields(master.value),pollFields=fields(poll.value),pollAddress=addressValue(field(masterFields,"PollAddress")),fixtureAddress=addressValue(field(pollFields,"Address")),baud=Number(field(masterFields,"Baud"));
  const nodeRecords=nodes.map(node=>{const nodeFields=fields(node.value),address=addressValue(field(nodeFields,"Address")),nodeBaud=Number(field(nodeFields,"Baud")),sensor=sensors.find(item=>n(node,"SENSOR")===n(item,"DATA")),xcvr=transceivers.find(item=>n(node,"TX")===n(item,"DI")&&n(node,"RX")===n(item,"RO"));return{node,address,nodeBaud,sensor,xcvr,fields:nodeFields};});
  const masterXcvr=transceivers.find(item=>n(master,"TX")===n(item,"DI")&&n(master,"RX")===n(item,"RO"));
  const nodeAddresses=nodeRecords.map(item=>item.address),uniqueAddresses=new Set(nodeAddresses);
  const target=nodeRecords.find(item=>item.address===pollAddress),allParts=[master,...nodes,...transceivers,...sensors,display];
  const groundNet=n(ground,"0"),vccNet=n(master,"VCC"),sourceVoltage=voltageValue(source.value);
  const powered=n(source,"+")===vccNet&&n(source,"-")===groundNet&&allParts.every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet)&&n(poll,"GND")===groundNet;
  const busANets=transceivers.map(item=>n(item,"A")),busBNets=transceivers.map(item=>n(item,"B"));
  const busConnected=busANets[0]&&busANets.every(net=>net===busANets[0])&&busBNets[0]&&busBNets.every(net=>net===busBNets[0])&&busANets[0]!==busBNets[0];
  const terminationsConnected=busConnected&&terminations.every(item=>{const a=n(item,"1"),b=n(item,"2");return(a===busANets[0]&&b===busBNets[0])||(b===busANets[0]&&a===busBNets[0]);});
  const terminationValues=terminations.map(item=>resistanceValue(item.value)),busTerminationOhm=terminationValues.every(value=>Number.isFinite(value)&&value>0)?1/terminationValues.reduce((sum,value)=>sum+1/value,0):Number.NaN;
  const masterWiring=masterXcvr&&n(poll,"OUT")===n(master,"POLL")&&n(master,"TX")===n(masterXcvr,"DI")&&n(masterXcvr,"RO")===n(master,"RX")&&n(master,"DE")===n(masterXcvr,"DE")&&n(master,"RE")===n(masterXcvr,"RE");
  const nodesWired=nodeRecords.every(item=>item.sensor&&item.xcvr&&n(item.node,"TX")===n(item.xcvr,"DI")&&n(item.xcvr,"RO")===n(item.node,"RX")&&n(item.node,"DE")===n(item.xcvr,"DE")&&n(item.node,"RE")===n(item.xcvr,"RE"));
  const transceiverSettings=transceivers.every(item=>{const f=fields(item.value);return field(f,"BusMode")==="half-duplex"&&Number(field(f,"Baud"))===baud;});
  const driversAddressed=masterFields.includes("DriverPolicy master-then-addressed")&&nodeRecords.every(item=>field(item.fields,"EnablePolicy")==="addressed-only");
  const sensorValues=nodeRecords.map(item=>Number(field(fields(item.sensor?.value),"TemperatureC")));
  const responseWired=target&&n(target.node,"RX")===n(display,"DATA");
  if(!Number.isFinite(sourceVoltage)||sourceVoltage<=0||!powered||!masterWiring||!nodesWired||!busConnected||!terminationsConnected||!transceiverSettings||!driversAddressed||!Number.isInteger(pollAddress)||fixtureAddress!==pollAddress||!Number.isInteger(baud)||baud<1200||baud>1000000||nodeRecords.length!==2||nodeRecords.some(item=>!Number.isInteger(item.address)||item.address<1||item.address>247||item.nodeBaud!==baud)||uniqueAddresses.size!==2||!target||!target.sensor||!Number.isFinite(sensorValues[nodeRecords.indexOf(target)])||!responseWired||!Number.isFinite(busTerminationOhm)||busTerminationOhm<55||busTerminationOhm>65){
    return {state:"blocked",message:"Power the master, both addressed sensor nodes, transceivers, and display; wire the poll, TX/RX and driver-enable controls; connect every transceiver to the same A/B pair; use unique 1–247 node addresses, matching baud rates, a poll for one existing node, and two 120 Ω bus-end terminators.",validation};
  }
  const temperatureC=sensorValues[nodeRecords.indexOf(target)],address="0x"+pollAddress.toString(16).padStart(2,"0").toUpperCase(),displayText="Address "+address+" → "+temperatureC.toFixed(1)+" °C; other node silent";
  return {state:"complete",engine:"Ideal addressed half-duplex RS-485 polling model",message:"Schedules one master request followed by only the uniquely addressed sensor node's response and checks the combined end termination. This deterministic logical model does not implement Modbus framing, MCU firmware, UART sampling, bias-network idle levels, transceiver enable delays, cable effects, or physical-layer faults.",result:{kind:"rs485-addressed-poll",baud,pollAddress:address,respondingAddress:address,temperatureC,respondingNodes:1,silentNodes:1,simultaneousDrivers:0,collisionAvoidance:"unique addresses; master then addressed node",terminationResistorsOhm:terminationValues,busTerminationOhm,displayText,firmwareExecuted:false},validation};
}
function analyseCanNodePair(project,{source,frame,nodes,transceivers,terminations,display,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const frameFields=fields(frame.value),frameIdText=field(frameFields,"Identifier")??"",identifier=Number.parseInt(frameIdText,16),dlc=Number(field(frameFields,"DLC")),dataText=field(frameFields,"Data")??"",data=dataText.split(/\s+/).filter(Boolean).map(value=>/^[0-9a-f]{2}$/i.test(value)?Number.parseInt(value,16):Number.NaN),bitrate=Number(field(frameFields,"Bitrate"));
  const roles=nodes.map(node=>field(fields(node.value),"Role")),filters=nodes.map(node=>field(fields(node.value),"FilterId"));
  const transmitter=nodes.find(node=>field(fields(node.value),"Role")==="transmit"),receiver=nodes.find(node=>field(fields(node.value),"Role")==="receive");
  const transceiverFor=(node)=>transceivers.find(item=>node&&n(node,"TX")===n(item,"TXD")&&n(node,"RX")===n(item,"RXD"));
  const txTransceiver=transceiverFor(transmitter),rxTransceiver=transceiverFor(receiver);
  const groundNet=n(ground,"0"),vccNet=n(transmitter,"VCC"),sourceVoltage=voltageValue(source.value);
  const powered=n(source,"+")===vccNet&&n(source,"-")===groundNet&&nodes.every(node=>n(node,"VCC")===vccNet&&n(node,"GND")===groundNet)&&transceivers.every(item=>n(item,"VCC")===vccNet&&n(item,"GND")===groundNet)&&n(display,"VCC")===vccNet&&n(display,"GND")===groundNet&&n(frame,"GND")===groundNet;
  const highNets=transceivers.map(item=>n(item,"CANH")),lowNets=transceivers.map(item=>n(item,"CANL"));
  const busConnected=highNets[0]&&highNets.every(net=>net===highNets[0])&&lowNets[0]&&lowNets.every(net=>net===lowNets[0])&&highNets[0]!==lowNets[0];
  const terminationsConnected=busConnected&&terminations.every(item=>{const first=n(item,"1"),second=n(item,"2");return(first===highNets[0]&&second===lowNets[0])||(second===highNets[0]&&first===lowNets[0]);});
  const terminationOhm=terminations.map(item=>resistanceValue(item.value));
  const busTerminationOhm=terminationOhm.every(value=>Number.isFinite(value)&&value>0)?1/terminationOhm.reduce((sum,value)=>sum+1/value,0):Number.NaN;
  const txConnected=transmitter&&n(frame,"OUT")===n(transmitter,"FRAME")&&n(transmitter,"TX")===n(txTransceiver,"TXD")&&n(txTransceiver,"RXD")===n(transmitter,"RX");
  const rxConnected=receiver&&n(receiver,"TX")===n(rxTransceiver,"TXD")&&n(rxTransceiver,"RXD")===n(receiver,"RX")&&n(receiver,"RX")===n(display,"DATA");
  const parsedDataValid=Number.isInteger(dlc)&&dlc>=0&&dlc<=8&&data.length===dlc&&data.every(value=>Number.isInteger(value)&&value>=0&&value<=255);
  const frameValid=Number.isInteger(identifier)&&identifier>=0&&identifier<=0x7ff&&parsedDataValid&&Number.isInteger(bitrate)&&bitrate>=10000&&bitrate<=1000000;
  const filtersValid=roles.filter(Boolean).length===2&&filters.every(value=>/^0x[0-9a-f]{1,3}$/i.test(value??""))&&Number.parseInt(filters[0],16)===identifier&&Number.parseInt(filters[1],16)===identifier;
  if(!Number.isFinite(sourceVoltage)||sourceVoltage<=0||!powered||!txConnected||!rxConnected||!busConnected||!terminationsConnected||!frameValid||!filtersValid||transceivers.some(item=>field(fields(item.value),"Mode")!=="normal")||!Number.isFinite(busTerminationOhm)||busTerminationOhm<55||busTerminationOhm>65){
    return {state:"blocked",message:"Power both CAN nodes and transceivers, connect the frame fixture to the transmit node, wire TX/RX through each transceiver, join CANH and CANL across the bus, add two 120 Ω end terminators, and configure a valid matching standard frame/filter.",validation};
  }
  const dataHex=data.map(value=>value.toString(16).padStart(2,"0").toUpperCase()),frameHex="0x"+identifier.toString(16).padStart(3,"0").toUpperCase(),displayText="RX "+frameHex+" ["+dataHex.join(" ")+"] · ACK";
  return {state:"complete",engine:"Ideal two-node CAN frame and ACK model",message:"Checks a configured standard CAN frame, matching receive filter, connected ideal transceivers, and approximately 60 Ω combined end termination. It does not model arbitration, bit stuffing, CRC faults, analog edges, bus faults, transceiver electrical limits, or MCU firmware.",result:{kind:"can-node-pair",identifier:frameHex,dlc,dataBytes:dataHex,bitrate,transmitted:true,received:true,acknowledged:true,terminationResistorsOhm:terminationOhm,busTerminationOhm,displayText,firmwareExecuted:false},validation};
}
function analyseMcuWatchdog(project,{source,fixture,mcu,display,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,pin)),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const sourceVoltage=voltageValue(source.value),fixtureFields=fields(fixture.value),mcuFields=fields(mcu.value);
  const timeoutMs=Number(field(mcuFields,"TimeoutMs")?.replace(/ms$/i,"")),runDurationMs=Number(field(fixtureFields,"RunDurationMs")?.replace(/ms$/i,""));
  const serviceText=field(fixtureFields,"ServiceTimesMs")??"",serviceTimesMs=serviceText.split(",").map(item=>Number(item.trim().replace(/ms$/i,"")));
  const groundNet=n(ground,"0"),vccNet=n(mcu,"VCC"),powered=n(source,"+")===vccNet&&n(source,"-")===groundNet&&n(mcu,"GND")===groundNet&&n(fixture,"GND")===groundNet&&n(display,"VCC")===vccNet&&n(display,"GND")===groundNet;
  const signalPath=n(fixture,"OUT")===n(mcu,"WDI")&&n(mcu,"HEARTBEAT")===n(display,"DATA");
  const sequenceValid=serviceTimesMs.length>0&&serviceTimesMs.every((time,index)=>Number.isFinite(time)&&time>=0&&time<=runDurationMs&&(index===0?time===0:time>serviceTimesMs[index-1]));
  if(!Number.isFinite(sourceVoltage)||sourceVoltage<=0||!powered||!signalPath||field(mcuFields,"Program")!=="Watchdog state model"||!Number.isFinite(timeoutMs)||timeoutMs<1||timeoutMs>60000||!Number.isFinite(runDurationMs)||runDurationMs<1||runDurationMs>3600000||!sequenceValid){
    return {state:"blocked",message:"Power the MCU and status display from the same positive supply, connect the watchdog service fixture to WDI, connect HEARTBEAT to the display, and provide a valid positive timeout and ordered service-time sequence beginning at 0 ms.",validation};
  }
  let lastServiceMs=serviceTimesMs[0],resetAtMs=null,servicesAccepted=1;
  for(const serviceMs of serviceTimesMs.slice(1)){
    if(serviceMs-lastServiceMs>=timeoutMs){resetAtMs=lastServiceMs+timeoutMs;break;}
    lastServiceMs=serviceMs;servicesAccepted+=1;
  }
  if(resetAtMs===null&&runDurationMs-lastServiceMs>=timeoutMs)resetAtMs=lastServiceMs+timeoutMs;
  const watchdogTriggered=resetAtMs!==null,controllerState=watchdogTriggered?"safe-reset":"running",heartbeatHigh=!watchdogTriggered;
  const displayText=watchdogTriggered?"WATCHDOG RESET @ "+resetAtMs+" ms":"RUNNING; no watchdog reset";
  return {state:"complete",engine:"Ideal MCU watchdog service-sequence model",message:"Evaluates configured watchdog service timestamps and reports when a missed service reaches the timeout. This is a deterministic logical model; MCU firmware, clock tolerance, reset circuitry, interrupt latency, and device-specific watchdog behavior are not executed or modeled.",result:{kind:"mcu-watchdog",sourceVoltageV:sourceVoltage,timeoutMs,runDurationMs,serviceTimesMs,servicesAccepted,resetCount:watchdogTriggered?1:0,resetAtMs,watchdogTriggered,controllerState,heartbeatHigh,displayText,firmwareExecuted:false},validation};
}
function analyseAvrIrReceiver(project,{source,frame,receiver,avr,display,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),frameFields=String(frame.value).split(";").map(v=>v.trim()),receiverFields=String(receiver.value).split(";").map(v=>v.trim()),avrFields=String(avr.value).split(";").map(v=>v.trim());
  const field=(list,label)=>list.find(v=>v.startsWith(label+" "))?.slice(label.length).trim();
  const numberField=(list,label,suffix)=>Number(field(list,label)?.replace(new RegExp(suffix+"$","i"),""));
  const bytesText=field(frameFields,"Bytes")??"",bytes=bytesText.split(/\s+/).filter(Boolean).map(v=>/^[0-9a-f]{2}$/i.test(v)?parseInt(v,16):Number.NaN);
  const toleranceText=field(avrFields,"Tolerance")?.replace(/%$/,""),tolerance=Number(toleranceText);
  const timing={leaderMark:numberField(frameFields,"LeaderMarkUs","us"),leaderSpace:numberField(frameFields,"LeaderSpaceUs","us"),bitMark:numberField(frameFields,"BitMarkUs","us"),zeroSpace:numberField(frameFields,"ZeroSpaceUs","us"),oneSpace:numberField(frameFields,"OneSpaceUs","us"),stopMark:numberField(frameFields,"StopMarkUs","us"),carrierHz:numberField(frameFields,"CarrierHz","Hz")};
  const within=(actual,nominal)=>Number.isFinite(actual)&&actual>0&&Math.abs(actual-nominal)<=nominal*tolerance/100;
  const groundNet=n(ground,"0"),vccNet=n(avr,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const powered=n(receiver,"VCC")===vccNet&&n(receiver,"GND")===groundNet&&n(avr,"GND")===groundNet&&n(display,"VCC")===vccNet&&n(display,"GND")===groundNet&&n(frame,"GND")===groundNet;
  const signalPath=n(frame,"OUT")===n(receiver,"SIG")&&n(receiver,"OUT")===n(avr,"INT0")&&n(avr,"TX")===n(display,"DATA");
  const timingValid=within(timing.leaderMark,9000)&&within(timing.leaderSpace,4500)&&within(timing.bitMark,560)&&within(timing.zeroSpace,560)&&within(timing.oneSpace,1690)&&within(timing.stopMark,560)&&within(timing.carrierHz,38000);
  const complementValid=bytes.length===4&&bytes.every(v=>Number.isInteger(v)&&v>=0&&v<=255)&&((bytes[0]^bytes[1])===255)&&((bytes[2]^bytes[3])===255);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!powered||!signalPath||field(avrFields,"Program")!=="Decode NEC-like"||field(avrFields,"Input")!=="INT0"||field(avrFields,"Output")!=="TX"||field(receiverFields,"Output")!=="demodulated active-low"||numberField(receiverFields,"CarrierHz","Hz")!==38000||!Number.isFinite(tolerance)||tolerance<1||tolerance>30||!timingValid||!complementValid){
    return {state:"blocked",message:"Connect the ideal IR receiver between the NEC-like frame fixture and AVR decoder, power all devices, verify the decoder/display wiring, and provide a four-byte complementary NEC-like frame with timing within tolerance.",validation};
  }
  const bits=bytes.flatMap(byte=>Array.from({length:8},(_,bit)=>(byte>>bit)&1));
  const ones=bits.reduce((sum,bit)=>sum+bit,0),zeros=bits.length-ones;
  const frameDurationUs=timing.leaderMark+timing.leaderSpace+bits.length*timing.bitMark+ones*timing.oneSpace+zeros*timing.zeroSpace+timing.stopMark;
  const rawCode=bytes.map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase(),address=bytes[0],command=bytes[2];
  const displayText="Address 0x"+address.toString(16).padStart(2,"0").toUpperCase()+"  Command 0x"+command.toString(16).padStart(2,"0").toUpperCase();
  return {state:"complete",engine:"Ideal AVR NEC-like infrared frame decoder",message:"Checks an ideal 38 kHz demodulated frame, timing tolerances, LSB-first byte order, and byte complements. Carrier waveform, optical range, ambient light, receiver AGC, AVR firmware, and physical timing margins are not modeled.",result:{kind:"avr-ir-receiver",protocol:"NEC-like",rawCode:"0x"+rawCode,address:"0x"+bytes[0].toString(16).padStart(2,"0").toUpperCase(),command:"0x"+bytes[2].toString(16).padStart(2,"0").toUpperCase(),bitOrder:"LSB-first within each byte",bitCount:bits.length,oneBits:ones,zeroBits:zeros,carrierHz:timing.carrierHz,tolerancePercent:tolerance,frameDurationUs,displayText,firmwareExecuted:false},validation};
}
function analysePicoVoltmeter(project,{sources,pico,resistors,oled,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),groundNet=n(ground,"0"),vccNet=n(pico,"VCC");
  const logicSource=sources.find(s=>n(s,"+")===vccNet&&n(s,"-")===groundNet),senseSource=sources.find(s=>s!==logicSource&&n(s,"-")===groundNet);
  const inputVoltage=senseSource?voltageValue(senseSource.value):Number.NaN,referenceVoltage=logicSource?voltageValue(logicSource.value):Number.NaN;
  const divider=resistors.flatMap(top=>resistors.filter(bottom=>bottom!==top).map(bottom=>{
    const midpoint=n(top,"1")===n(bottom,"1")||n(top,"1")===n(bottom,"2")?n(top,"1"):n(top,"2")===n(bottom,"1")||n(top,"2")===n(bottom,"2")?n(top,"2"):undefined;
    const topOther=n(top,"1")===midpoint?n(top,"2"):n(top,"1"),bottomOther=n(bottom,"1")===midpoint?n(bottom,"2"):n(bottom,"1");
    return {top,bottom,midpoint,topOther,bottomOther,valid:midpoint&&topOther===n(senseSource,"+")&&bottomOther===groundNet};
  })).find(item=>item.valid);
  if(!logicSource||!senseSource||!Number.isFinite(inputVoltage)||inputVoltage<=0||!Number.isFinite(referenceVoltage)||referenceVoltage<=0||!divider||n(pico,"GND")!==groundNet||n(oled,"VCC")!==vccNet||n(oled,"GND")!==groundNet||n(pico,"TX")!==n(oled,"DATA")||n(pico,"ADC0")!==divider.midpoint){
    return {state:"blocked",message:"Wire separate sensed-input and 3.3 V logic supplies, connect a two-resistor divider midpoint to ADC0, ground the lower resistor, and connect the OLED text output.",validation};
  }
  const upperResistance=resistanceValue(divider.top.value),lowerResistance=resistanceValue(divider.bottom.value);
  if(!Number.isFinite(upperResistance)||!Number.isFinite(lowerResistance)||upperResistance<=0||lowerResistance<=0)return {state:"blocked",message:"Both divider resistors must have positive numeric values.",validation};
  const dividerVoltage=inputVoltage*lowerResistance/(upperResistance+lowerResistance);
  if(!Number.isFinite(dividerVoltage)||dividerVoltage<0||dividerVoltage>referenceVoltage)return {state:"blocked",message:"The divider output exceeds the configured ADC reference; this ideal model blocks the measurement and does not estimate physical input protection.",validation};
  const adcCount=Math.round(dividerVoltage/referenceVoltage*4095),measuredDividerVoltage=adcCount/4095*referenceVoltage,estimatedInputVoltage=measuredDividerVoltage*(upperResistance+lowerResistance)/lowerResistance;
  const displayText="Vin "+estimatedInputVoltage.toFixed(2)+" V";
  return {state:"complete",engine:"Ideal Pico 12-bit ADC divider voltmeter",message:"Quantizes a protected divider voltage with an ideal 12-bit ADC and applies the known divider ratio for an OLED reading. ADC nonlinearity, input leakage, resistor tolerance, calibration error, and C++ firmware are omitted.",result:{kind:"pico-adc-voltmeter",inputVoltageV:inputVoltage,dividerVoltageV:dividerVoltage,adcReferenceV:referenceVoltage,adcResolutionBits:12,adcCount,measuredDividerVoltageV:measuredDividerVoltage,upperResistanceOhm:upperResistance,lowerResistanceOhm:lowerResistance,estimatedInputVoltageV:estimatedInputVoltage,displayText,firmwareExecuted:false},validation};
}
function analyseEsp32Telemetry(project,{source,esp32,sensor,sink,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),mcuFields=String(esp32.value).split(";").map(v=>v.trim()),sensorFields=String(sensor.value).split(";").map(v=>v.trim());
  const field=(list,label)=>list.find(v=>v.startsWith(label+" "))?.slice(label.length).trim();
  const temperature=Number(field(sensorFields,"Temperature")?.split(" ")[0]),scale=field(sensorFields,"Scale"),offset=field(sensorFields,"Offset");
  const scaleVPerC=scale?voltageValue(scale.split("/")[0]):Number.NaN,offsetV=offset?voltageValue(offset):Number.NaN;
  const device=field(mcuFields,"Device"),sequence=Number(field(mcuFields,"Sequence")),transport=field(mcuFields,"Transport");
  const groundNet=n(ground,"0"),vccNet=n(esp32,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const wired=n(sensor,"VCC")===vccNet&&n(sensor,"GND")===groundNet&&n(sensor,"OUT")===n(esp32,"ADC")&&n(esp32,"TX")===n(sink,"DATA")&&n(sink,"GND")===groundNet&&n(esp32,"GND")===groundNet;
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!wired||!device||device.length>40||!Number.isSafeInteger(sequence)||sequence<0||sequence>2147483647||transport!=="offline-mock"||!Number.isFinite(temperature)||temperature<0||temperature>125||!Number.isFinite(scaleVPerC)||scaleVPerC<=0||!Number.isFinite(offsetV)||offsetV<0){
    return {state:"blocked",message:"Wire the linear temperature sensor to the ESP32-class ADC, TX to the offline payload sink, share power/ground, and configure a device ID, sequence, and offline-mock transport.",validation};
  }
  const sensorVoltage=offsetV+temperature*scaleVPerC;
  if(!Number.isFinite(sensorVoltage)||sensorVoltage<0||sensorVoltage>supplyVoltage)return {state:"blocked",message:"The sensor output is outside the modeled ADC reference range.",validation};
  const adcCount=Math.round(sensorVoltage/supplyVoltage*4095),measuredVoltage=adcCount/4095*supplyVoltage,measuredTemperatureC=Number(((measuredVoltage-offsetV)/scaleVPerC).toFixed(1));
  const payload={device,sequence,temperatureC:measuredTemperatureC},payloadText=JSON.stringify(payload);
  return {state:"complete",engine:"Ideal ESP32-class offline telemetry formatter",message:"Quantizes a linear sensor value to an ideal 12-bit ADC reading and formats a deterministic JSON payload for local inspection. No Wi-Fi association, socket, Internet request, authentication, or external data transfer occurs; ESP32 ADC nonlinearities and firmware execution are not modeled.",result:{kind:"esp32-telemetry-payload",adcResolutionBits:12,adcCount,sensorVoltageV:sensorVoltage,measuredTemperatureC,payload,payloadText,transport:"offline-mock",transmitted:false,firmwareExecuted:false},validation};
}
function analyseMcuStepper(project,{source,mcu,driver,motor,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),mcuFields=String(mcu.value).split(";").map(v=>v.trim()),motorFields=String(motor.value).split(";").map(v=>v.trim());
  const field=(list,label)=>list.find(v=>v.startsWith(label+" "))?.slice(label.length).trim(),numeric=value=>Number(String(value??"").split(" ")[0]);
  const steps=numeric(field(mcuFields,"Steps")),stepRate=numeric(field(mcuFields,"StepRate")),direction=field(mcuFields,"Direction")?.toUpperCase();
  const stepsPerRevolution=numeric(field(motorFields,"StepsPerRevolution")),stepAngle=numeric(field(motorFields,"StepAngle"));
  const groundNet=n(ground,"0"),vccNet=n(mcu,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const wired=n(mcu,"D3")===n(driver,"STEP")&&n(mcu,"D2")===n(driver,"DIR")&&n(driver,"VCC")===vccNet&&n(driver,"GND")===groundNet&&n(mcu,"GND")===groundNet&&["A1","A2","B1","B2"].every(pin=>n(driver,pin)===n(motor,pin));
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!wired||field(mcuFields,"Program")?.toLowerCase()!=="stepper"||field(mcuFields,"Step")!=="D3"||field(mcuFields,"DirectionPin")!=="D2"||!Number.isInteger(steps)||steps<1||steps>100000||!Number.isFinite(stepRate)||stepRate<1||stepRate>10000||!["CW","CCW"].includes(direction)||!Number.isFinite(stepsPerRevolution)||stepsPerRevolution<1||!Number.isFinite(stepAngle)||stepAngle<=0){
    return {state:"blocked",message:"Configure D3 STEP, D2 DIR, a positive step count/rate, CW or CCW direction, and connect the dual-H-bridge outputs to all four motor coil terminals.",validation};
  }
  const signedSteps=direction==="CW"?steps:-steps,angularTravelDegrees=signedSteps*stepAngle,finalPositionDegrees=((angularTravelDegrees%360)+360)%360;
  const phaseTable=[[true,false,false,true],[true,false,true,false],[false,true,true,false],[false,true,false,true]];
  const phaseSequence=Array.from({length:Math.min(steps,8)},(_,index)=>{const phaseIndex=((signedSteps>0?index:3-index)%4+4)%4;return {step:index+1,phaseIndex,coils:phaseTable[phaseIndex]};});
  return {state:"complete",engine:"Ideal Uno-class bipolar stepper sequence and position model",message:"Applies a full-step phase sequence and calculates ideal angular travel from configured steps and step angle. Arduino firmware, acceleration, missed steps, torque/load, coil current/thermal behavior, resonance, and mechanical end stops are omitted.",result:{kind:"mcu-stepper-position",direction,steps,signedSteps,stepRateHz:stepRate,stepsPerRevolution,stepAngleDegrees:stepAngle,angularTravelDegrees,finalPositionDegrees,motionDurationSeconds:steps/stepRate,phaseSequence,firmwareExecuted:false},validation};
}
function analyseMcuServoControl(project,{source,mcu,potentiometer,servo,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),mcuFields=String(mcu.value).split(";").map(v=>v.trim()),servoFields=String(servo.value).split(";").map(v=>v.trim()),potFields=String(potentiometer.value).split(";").map(v=>v.trim());
  const field=(list,label)=>list.find(v=>v.startsWith(label+" "))?.slice(label.length).trim(),number=value=>Number(String(value??"").split(/\s+/)[0]);
  const position=number(field(potFields,"Position")?.replace(/%$/,"")),adcCount=Number.isFinite(position)?Math.round(position*1023/100):Number.NaN;
  const minPulse=number(field(servoFields,"MinPulse")),maxPulse=number(field(servoFields,"MaxPulse")),minAngle=number(field(servoFields,"MinAngle")),maxAngle=number(field(servoFields,"MaxAngle")),frequency=number(field(servoFields,"Frequency"));
  const groundNet=n(ground,"0"),vccNet=n(mcu,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const wired=n(potentiometer,"VCC")===vccNet&&n(potentiometer,"GND")===groundNet&&n(potentiometer,"OUT")===n(mcu,"A0")&&n(mcu,"D9")===n(servo,"PWM")&&n(servo,"VCC")===vccNet&&n(servo,"GND")===groundNet;
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!wired||n(mcu,"GND")!==groundNet||field(mcuFields,"Program")?.toLowerCase()!=="servo control"||field(mcuFields,"ADC")!=="A0"||field(mcuFields,"Servo")!=="D9"||!Number.isFinite(position)||position<0||position>100||!Number.isInteger(adcCount)||!Number.isFinite(minPulse)||!Number.isFinite(maxPulse)||maxPulse<=minPulse||!Number.isFinite(minAngle)||!Number.isFinite(maxAngle)||maxAngle<=minAngle||!Number.isFinite(frequency)||frequency<40||frequency>333){
    return {state:"blocked",message:"Configure a 0–100% potentiometer, A0-to-ADC input, D9 servo pulse output, valid pulse/angle endpoints, and a servo frame rate from 40 to 333 Hz.",validation};
  }
  const positionFraction=adcCount/1023,pulseWidthUs=minPulse+positionFraction*(maxPulse-minPulse),angleDegrees=minAngle+positionFraction*(maxAngle-minAngle);
  return {state:"complete",engine:"Ideal Uno-class hobby-servo pulse mapping",message:"Maps the 10-bit potentiometer reading linearly to the configured servo angle and pulse width. Arduino C++ execution, servo torque, mechanics, backlash, supply transients, and device-specific pulse calibration are omitted.",result:{kind:"mcu-servo-control",positionPercent:position,adcResolutionBits:10,adcCount,pwmFrequencyHz:frequency,pulseWidthUs,angleDegrees,angleRangeDegrees:[minAngle,maxAngle],firmwareExecuted:false},validation};
}
function analyseMcuUltrasonicRanger(project,{source,mcu,sensor,oled,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),mcuFields=String(mcu.value).split(";").map(v=>v.trim()),sensorFields=String(sensor.value).split(";").map(v=>v.trim());
  const field=(list,label)=>list.find(v=>v.startsWith(label+" "))?.slice(label.length).trim();
  const echoUs=Number(field(sensorFields,"Echo")?.split(/\s+/)[0]),minimumMm=Number(field(sensorFields,"Minimum")?.split(/\s+/)[0]),maximumMm=Number(field(sensorFields,"Maximum")?.split(/\s+/)[0]);
  const groundNet=n(ground,"0"),vccNet=n(mcu,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const wired=n(mcu,"D9")===n(sensor,"TRIG")&&n(sensor,"ECHO")===n(mcu,"D8")&&n(mcu,"D7")===n(oled,"DATA");
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||n(mcu,"GND")!==groundNet||n(sensor,"VCC")!==vccNet||n(sensor,"GND")!==groundNet||n(oled,"VCC")!==vccNet||n(oled,"GND")!==groundNet||!wired||field(mcuFields,"Program")?.toLowerCase()!=="ultrasonic ranger"||field(mcuFields,"Trigger")!=="D9"||field(mcuFields,"Echo")!=="D8"||field(mcuFields,"Display")!=="D7"||!Number.isFinite(echoUs)||echoUs<=0||echoUs>25000||!Number.isFinite(minimumMm)||!Number.isFinite(maximumMm)||minimumMm<=0||maximumMm<=minimumMm){
    return {state:"blocked",message:"Wire D9 to trigger, sensor echo to D8, OLED data to D7, share power/ground, and set an echo time from 1 to 25000 µs with valid range limits.",validation};
  }
  const roundTripUs=echoUs,distanceMm=roundTripUs*0.343/2,measurementValid=distanceMm>=minimumMm&&distanceMm<=maximumMm;
  const displayText=measurementValid?(distanceMm/10).toFixed(1)+" cm":"Out of range";
  return {state:"complete",engine:"Ideal Uno-class ultrasonic time-of-flight estimate",message:"Converts a supplied round-trip echo time using 343 m/s sound speed and formats a distance for an ideal OLED text sink. It does not execute Arduino C++ or model trigger pulses, temperature-dependent sound speed, transducer dead zone, reflections, noise, or physical display timing.",result:{kind:"mcu-ultrasonic-range",echoTimeUs:echoUs,soundSpeedMPerS:343,distanceMm:measurementValid?distanceMm:null,distanceCm:measurementValid?distanceMm/10:null,minimumMm,maximumMm,measurementValid,displayText,firmwareExecuted:false},validation};
}
function analyseMcuTemperatureMonitor(project,{source,mcu,sensor,lcd,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),mcuFields=String(mcu.value).split(";").map(v=>v.trim()),sensorFields=String(sensor.value).split(";").map(v=>v.trim());
  const field=(list,label)=>list.find(v=>v.startsWith(label+" "))?.slice(label.length).trim();
  const temperature=Number(field(sensorFields,"Temperature")?.split(/\s+/)[0]),scaleText=field(sensorFields,"Scale"),offsetText=field(sensorFields,"Offset");
  const scaleVPerC=scaleText?voltageValue(scaleText.split("/")[0]):Number.NaN,offsetV=offsetText?voltageValue(offsetText):Number.NaN;
  const groundNet=n(ground,"0"),vccNet=n(mcu,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const outputConnected=n(sensor,"OUT")===n(mcu,"A0")&&n(mcu,"D8")===n(lcd,"DATA");
  const sensorPowered=n(sensor,"VCC")===vccNet&&n(sensor,"GND")===groundNet,lcdPowered=n(lcd,"VCC")===vccNet&&n(lcd,"GND")===groundNet;
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!sensorPowered||!lcdPowered||n(mcu,"GND")!==groundNet||!outputConnected||field(mcuFields,"Program")?.toLowerCase()!=="temperature monitor"||field(mcuFields,"ADC")!=="A0"||field(mcuFields,"Output")!=="D8"||!Number.isFinite(temperature)||temperature<0||temperature>125||!Number.isFinite(scaleVPerC)||scaleVPerC<=0||!Number.isFinite(offsetV)||offsetV<0){
    return {state:"blocked",message:"Wire the powered temperature sensor to ADC A0, the LCD data input to D8, share ground, and configure a supported 0–125 °C linear sensor transfer.",validation};
  }
  const sensorVoltage=offsetV+temperature*scaleVPerC;
  if(!Number.isFinite(sensorVoltage)||sensorVoltage<0||sensorVoltage>supplyVoltage)return {state:"blocked",message:"The configured sensor output is outside the ADC reference range.",validation};
  const adcCount=Math.round(sensorVoltage/supplyVoltage*1023),measuredVoltage=adcCount/1023*supplyVoltage,displayTemperature=(measuredVoltage-offsetV)/scaleVPerC;
  const displayText=displayTemperature.toFixed(1)+" °C";
  return {state:"complete",engine:"Ideal Uno-class linear temperature monitor",message:"Quantizes the configured linear sensor voltage through an ideal 10-bit ADC and formats a one-line LCD result. This does not execute Arduino C++ or model sensor self-heating, ADC noise, LCD bus timing, or physical display/controller details.",result:{kind:"mcu-temperature-monitor",sensorTemperatureC:temperature,sensorVoltageV:sensorVoltage,adcResolutionBits:10,adcCount,measuredVoltageV:measuredVoltage,displayTemperatureC:displayTemperature,displayText,firmwareExecuted:false},validation};
}
function analyseMcuPwmDimmer(project,{source,mcu,potentiometer,mosfet,resistor,led,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),fields=String(mcu.value).split(";").map(v=>v.trim()),potFields=String(potentiometer.value).split(";").map(v=>v.trim());
  const field=(list,label)=>list.find(v=>v.startsWith(label+" "))?.slice(label.length).trim();
  const positionText=field(potFields,"Position")?.replace(/%$/,""),position=Number(positionText),frequency=Number(field(fields,"Frequency"));
  const adcCount=Number.isFinite(position)?Math.round(position*1023/100):Number.NaN,duty=adcCount/1023;
  const groundNet=n(ground,"0"),vccNet=n(mcu,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const outputConnected=n(mcu,"D9")===n(mosfet,"G");
  const sourceAndPot= n(source,"+")===n(potentiometer,"VCC")&&n(source,"-")===n(potentiometer,"GND");
  const loadPath=n(source,"+")===n(resistor,"1")&&n(resistor,"2")===n(led,"A")&&n(led,"K")===n(mosfet,"D")&&n(mosfet,"S")===groundNet;
  const resistance=resistanceValue(resistor.value),vf=forwardVoltage(led.value),threshold=voltageValue(mosfet.value);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!sourceAndPot||n(mcu,"GND")!==groundNet||n(potentiometer,"OUT")!==n(mcu,"A0")||!outputConnected||!loadPath||field(fields,"Program")?.toLowerCase()!=="pwm dimmer"||field(fields,"ADC")!=="A0"||field(fields,"PWM")!=="D9"||!Number.isFinite(frequency)||frequency<1||frequency>100000||!Number.isFinite(position)||position<0||position>100||!Number.isFinite(resistance)||resistance<=0||!Number.isFinite(vf)||vf<=0||!Number.isFinite(threshold)||threshold<=0){
    return {state:"blocked",message:"Configure a 0–100% potentiometer, 10-bit ADC on A0, PWM output D9, 1–100000 Hz frequency, and wire an ideal low-side MOSFET with a current-limited LED load.",validation};
  }
  const peakCurrentA=supplyVoltage>threshold?Math.max(0,(supplyVoltage-vf)/resistance):0,averageCurrentA=peakCurrentA*duty;
  return {state:"complete",engine:"Ideal Uno-class ADC-to-PWM MOSFET dimmer",message:"Maps a potentiometer position to a rounded 10-bit ADC count, computes ideal PWM duty, and estimates low-side MOSFET LED average current. Arduino C++ execution, ADC noise/quantization beyond rounding, MOSFET switching loss, thermal behavior, and LED nonlinear dynamics are omitted.",result:{kind:"mcu-pwm-dimmer",positionPercent:position,adcResolutionBits:10,adcCount,dutyCycle:duty,pwmFrequencyHz:frequency,peakLedCurrentA:peakCurrentA,averageLedCurrentA:averageCurrentA,mosfetGateThresholdV:threshold,mosfetConducts:peakCurrentA>0,firmwareExecuted:false},validation};
}
function analyseMcuButtonDebounce(project,{source,fixture,mcu,resistor,led,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),fields=String(mcu.value).split(";").map(v=>v.trim()),sampleFields=String(fixture.value).split(";").map(v=>v.trim());
  const field=(list,label)=>list.find(v=>v.startsWith(label+" "))?.slice(label.length).trim();
  const samplesText=field(sampleFields,"Samples")??"",samples=samplesText? samplesText.split(",").map(v=>Number(v.trim())):[];
  const stableCount=Number(field(fields,"Stable")),rateText=field(sampleFields,"Rate")?.replace(/\s*Hz$/i,""),sampleRate=Number(rateText);
  const groundNet=n(ground,"0"),vccNet=n(mcu,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const seriesPath=(n(mcu,"D13")===n(resistor,"1")&&n(resistor,"2")===n(led,"A"))||(n(mcu,"D13")===n(resistor,"2")&&n(resistor,"1")===n(led,"A"));
  const resistance=resistanceValue(resistor.value),vf=forwardVoltage(led.value);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||n(mcu,"GND")!==groundNet||n(fixture,"GND")!==groundNet||n(fixture,"OUT")!==n(mcu,"D2")||n(led,"K")!==groundNet||!seriesPath||field(fields,"Program")?.toLowerCase()!=="button debounce"||field(fields,"Input")!=="D2"||field(fields,"Output")!=="D13"||field(fields,"Mode")?.toLowerCase()!=="toggle"||!Number.isInteger(stableCount)||stableCount<1||stableCount>20||samples.length<3||samples.length>200||samples.some(v=>v!==0&&v!==1)||!Number.isFinite(sampleRate)||sampleRate<1||sampleRate>100000||!Number.isFinite(resistance)||resistance<=0||!Number.isFinite(vf)||vf<=0){
    return {state:"blocked",message:"Configure a binary sample sequence, 1–20 matching stable samples, and 1–100000 Hz sample rate; wire fixture OUT to D2 and D13 through a current-limited LED.",validation};
  }
  let stable=0,candidate=null,count=0,output=false,toggleCount=0;const trace=[];
  samples.forEach((sample,index)=>{
    if(sample===candidate)count+=1;else{candidate=sample;count=1;}
    let accepted=false;
    if(count>=stableCount&&stable!==candidate){stable=candidate;accepted=true;if(stable===1){output=!output;toggleCount+=1;}}
    trace.push({sampleIndex:index,sample,stableInput:stable,acceptedTransition:accepted,gpioHigh:output,ledOn:output&&supplyVoltage>vf});
  });
  const ledCurrentA=Math.max(0,(supplyVoltage-vf)/resistance);
  return {state:"complete",engine:"Ideal Uno-class sampled button debounce model",message:"Applies a consecutive-sample stability threshold and toggles the output once per accepted rising press. This is a digital behavior model; switch contact physics, analog RC filtering, CPU scheduling, and Arduino C++ execution are omitted.",result:{kind:"mcu-button-debounce",stableSamples:stableCount,sampleRateHz:sampleRate,samples,trace,toggleCount,outputOn:output,ledCurrentA:output?ledCurrentA:0,firmwareExecuted:false},validation};
}
function analyseMcuBlink(project,{source,mcu,resistor,led,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),fields=String(mcu.value).split(";").map(v=>v.trim());
  const field=label=>fields.find(v=>v.startsWith(label+" "))?.slice(label.length).trim();
  const duration=value=>{const match=String(value??"").match(/^(\d+(?:\.\d+)?)\s*ms$/i);return match?Number(match[1]):Number.NaN;};
  const program=field("Program")?.toLowerCase(),pin=field("Pin"),highMs=duration(field("High")),lowMs=duration(field("Low")),runtimeMs=duration(field("Runtime"));
  const groundNet=n(ground,"0"),vccNet=n(mcu,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const seriesPath=(n(mcu,"D13")===n(resistor,"1")&&n(resistor,"2")===n(led,"A"))||(n(mcu,"D13")===n(resistor,"2")&&n(resistor,"1")===n(led,"A"));
  const resistance=resistanceValue(resistor.value),vf=forwardVoltage(led.value);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||n(mcu,"GND")!==groundNet||n(led,"K")!==groundNet||!seriesPath||program!=="blink"||pin!=="D13"||![highMs,lowMs,runtimeMs,resistance,vf].every(Number.isFinite)||highMs<=0||lowMs<=0||runtimeMs<=0||highMs>60000||lowMs>60000||runtimeMs>60000||resistance<=0||vf<=0){
    return {state:"blocked",message:"Configure the ideal Uno-class GPIO behavior for D13 Blink with positive high/low/runtime milliseconds (maximum 60 s), and wire D13 through a current-limiting resistor and LED to ground.",validation};
  }
  const periodMs=highMs+lowMs,ledCurrentA=Math.max(0,(supplyVoltage-vf)/resistance),trace=[];
  for(let timeMs=0;timeMs<runtimeMs;){
    const phaseMs=timeMs%periodMs,high=phaseMs<highMs,intervalMs=Math.min(high?highMs-phaseMs:periodMs-phaseMs,runtimeMs-timeMs);
    trace.push({timeMs,intervalMs,gpioHigh:high,ledOn:high&&ledCurrentA>0.0005});
    timeMs+=intervalMs;
  }
  return {state:"complete",engine:"Ideal Uno-class GPIO blink sequence",message:"Emits a deterministic digital D13 high/low trace and estimates the LED current when high. This does not execute Arduino C++ firmware or model CPU timing, GPIO output resistance, PWM, interrupts, or board-specific electrical limits.",result:{kind:"mcu-blink",program:"blink",pin:"D13",highMs,lowMs,periodMs,frequencyHz:1000/periodMs,runtimeMs,ledCurrentA,trace,firmwareExecuted:false},validation};
}
function analyseSpiDisplayTransfer(project,{source,fixture,display,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),fields=String(fixture.value).split(";").map(v=>v.trim());
  const field=label=>fields.find(v=>v.startsWith(label+" "))?.slice(label.length).trim();
  const modeText=field("Mode"),byteText=field("Byte"),baudText=field("Baud"),csText=field("CS");
  const mode=modeText===undefined?Number.NaN:Number(modeText),baud=baudText===undefined?Number.NaN:Number(baudText);
  const byte=byteText?.toLowerCase().startsWith("0x")?Number.parseInt(byteText.slice(2),16):Number(byteText);
  const groundNet=n(ground,"0"),vccNet=n(display,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const connected=["SCK","MOSI","CS"].every(pin=>n(fixture,pin)&&n(fixture,pin)===n(display,pin));
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||n(fixture,"GND")!==groundNet||n(display,"GND")!==groundNet||!connected||mode!==0||!Number.isInteger(byte)||byte<0||byte>255||!Number.isFinite(baud)||baud<1000||baud>10000000||csText?.toLowerCase()!=="active"){
    return {state:"blocked",message:"Connect the fixture and display SCK/MOSI/CS lines, share ground, power the display, and configure SPI mode 0, an 8-bit byte, 1 kHz–10 MHz clock, and active chip select.",validation};
  }
  const bits=Array.from({length:8},(_,index)=>Boolean(byte&(1<<(7-index))));
  return {state:"complete",engine:"Ideal SPI mode-0 byte transfer",message:"Transfers one byte MSB-first with clock idle low and sampling on rising edges while chip select is active. This transaction-level digital model omits edge timing, setup/hold margins, bus loading, multi-byte commands, and physical display rendering.",result:{kind:"spi-display-byte",mode,clockPolarity:0,clockPhase:0,sampleEdge:"rising",bitOrder:"MSB-first",bits,receivedByte:byte,receivedHex:"0x"+byte.toString(16).padStart(2,"0").toUpperCase(),baud,transferDurationSeconds:8/baud,chipSelect:"active"},validation};
}
function analyseI2cLevelShifter(project,{sources,fixture,shifter,report,resistors,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const rails=sources.map(source=>({source,voltage:voltageValue(source.value)})).sort((a,b)=>a.voltage-b.voltage),low=rails[0],high=rails[1];
  const lowNet=n(low.source,"+"),highNet=n(high.source,"+"),groundNet=n(ground,"0");
  const values=fields(fixture.value),sdaDrive=field(values,"SDA Drive"),sclDrive=field(values,"SCL Drive");
  const states=(name)=>{const value=field(values,name+" States");return value?value.split(",").map(token=>token.trim().toUpperCase()):[];};
  const sdaStates=states("SDA"),sclStates=states("SCL"),validStates=array=>array.length>=2&&array.length<=64&&array.every(state=>state==="H"||state==="L");
  const rValues=resistors.map(part=>({part,ohms:resistanceValue(part.value)}));
  const resistorFor=(line,railNet)=>rValues.find(({part})=>[n(part,"1"),n(part,"2")].includes(line)&&[n(part,"1"),n(part,"2")].includes(railNet));
  const expected=[["SDA_L",lowNet],["SCL_L",lowNet],["SDA_H",highNet],["SCL_H",highNet]].map(([pin,railNet])=>resistorFor(n(shifter,pin),railNet));
  const topology= n(fixture,"SDA")===n(shifter,"SDA_L")&&n(fixture,"SCL")===n(shifter,"SCL_L")&&n(shifter,"SDA_L")===n(report,"SDA_L")&&n(shifter,"SCL_L")===n(report,"SCL_L")&&n(shifter,"SDA_H")===n(report,"SDA_H")&&n(shifter,"SCL_H")===n(report,"SCL_H");
  const powered=n(low.source,"-")===groundNet&&n(high.source,"-")===groundNet&&n(shifter,"VREF_L")===lowNet&&n(shifter,"VREF_H")===highNet&&n(report,"VREF_L")===lowNet&&n(report,"VREF_H")===highNet&&n(shifter,"GND")===groundNet&&n(report,"GND")===groundNet&&n(fixture,"GND")===groundNet;
  const required=[lowNet,highNet,groundNet,n(fixture,"SDA"),n(fixture,"SCL"),n(fixture,"GND"),n(shifter,"SDA_L"),n(shifter,"SCL_L"),n(shifter,"SDA_H"),n(shifter,"SCL_H"),n(report,"SDA_L"),n(report,"SCL_L"),n(report,"SDA_H"),n(report,"SCL_H"),...expected.map(item=>item&&"connected")];
  const validPullups=expected.every(item=>item&&Number.isFinite(item.ohms)&&item.ohms>=1000&&item.ohms<=100000);
  if(!Number.isFinite(low.voltage)||!Number.isFinite(high.voltage)||low.voltage<1.8||low.voltage>3.6||high.voltage<=low.voltage||high.voltage>5.5||!powered||!topology||required.some(net=>!net)||!validPullups||resistors.some(item=>!Number.isFinite(resistanceValue(item.value)))||field(fields(shifter.value),"Mode")!=="open-drain bidirectional"||!["low-side","high-side"].includes(sdaDrive)||!["low-side","high-side"].includes(sclDrive)||!validStates(sdaStates)||!validStates(sclStates)||sdaStates.length!==sclStates.length){
    return {state:"blocked",message:"Use separate 1.8–3.6 V and higher 3.3–5.5 V rails, common ground, four 1–100 kΩ pull-ups to their local rails, complete SDA/SCL connections, and matching open-drain transition sequences.",validation};
  }
  const transitionTable=sdaStates.map((sda,index)=>{const scl=sclStates[index];return {index:index+1,sda,scl,sdaLowVoltageV:sda==="L"?0:low.voltage,sdaHighVoltageV:sda==="L"?0:high.voltage,sclLowVoltageV:scl==="L"?0:low.voltage,sclHighVoltageV:scl==="L"?0:high.voltage,driveDirection:[sda==="L"?sdaDrive:null,scl==="L"?sclDrive:null].filter(Boolean)};});
  const currentFor=(line)=>{const lowPull=expected[["SDA_L","SCL_L"].indexOf(line)],highPull=expected[["SDA_H","SCL_H"].indexOf(line)+2];return low.voltage/lowPull.ohms+high.voltage/highPull.ohms;};
  const lowCurrentMa=Math.max(currentFor("SDA_L"),currentFor("SCL_L"))*1000;
  return {state:"complete",engine:"Ideal bidirectional open-drain I²C level-shifter model",message:"Applies an ideal bidirectional open-drain translation between two voltage domains using explicit external pull-up resistors. It checks connectivity, rail ordering, line logic, and estimated static sink current. MOSFET threshold/body-diode behavior, edge timing, bus capacitance, pull-up tolerance, rise time, device limits, firmware, and physical hardware are not modeled.",result:{kind:"i2c-level-shifter",lowRailV:low.voltage,highRailV:high.voltage,lowPullupOhm:Math.round((expected[0].ohms+expected[1].ohms)/2),highPullupOhm:Math.round((expected[2].ohms+expected[3].ohms)/2),transitionCount:transitionTable.length,lowSideDriveTransitions:transitionTable.filter(item=>item.driveDirection.includes("low-side")).length,highSideDriveTransitions:transitionTable.filter(item=>item.driveDirection.includes("high-side")).length,peakCombinedPullupSinkCurrentMa:lowCurrentMa,lowSideOvervoltage:false,highSideOvervoltage:false,bidirectionalTransitionsVerified:transitionTable.some(item=>item.driveDirection.includes("low-side"))&&transitionTable.some(item=>item.driveDirection.includes("high-side")),transitionTable,firmwareExecuted:false},validation};
}
function analyseI2cEepromWriteRead(project,{source,fixture,eeprom,resistors,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),fields=String(fixture.value).split(";").map(v=>v.trim()),memoryFields=String(eeprom.value).split(";").map(v=>v.trim());
  const field=(list,label)=>list.find(v=>v.startsWith(label+" "))?.slice(label.length).trim();
  const parseHex=value=>typeof value==="string"?(value.toLowerCase().startsWith("0x")?Number.parseInt(value.slice(2),16):Number(value)):Number.NaN;
  const address=parseHex(field(fields,"Address")),register=parseHex(field(fields,"Register")),writeByte=parseHex(field(fields,"Data")),eepromAddress=parseHex(field(memoryFields,"Address"));
  const mem=field(memoryFields,"Memory")?.match(/^(0x[0-9a-f]+|\d+)\s*=\s*(0x[0-9a-f]+|\d+)$/i);
  const memoryRegister=mem?parseHex(mem[1]):Number.NaN,initialByte=mem?parseHex(mem[2]):Number.NaN,baud=parseHex(field(fields,"Baud"));
  const ack=field(fields,"ACK")?.toLowerCase()==="yes",cycle=field(fields,"Cycle")?.toLowerCase();
  const groundNet=n(ground,"0"),vccNet=n(eeprom,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const fixtureGnd=n(fixture,"GND"),sdaNet=n(fixture,"SDA"),sclNet=n(fixture,"SCL"),pullupNets=resistors.map(r=>{const a=n(r,"1"),b=n(r,"2");return a===vccNet?b:b===vccNet?a:undefined;});
  const resistances=resistors.map(r=>resistanceValue(r.value)),busReady=pullupNets.includes(sdaNet)&&pullupNets.includes(sclNet)&&sdaNet!==sclNet;
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||n(eeprom,"GND")!==groundNet||fixtureGnd!==groundNet||!sdaNet||n(eeprom,"SDA")!==sdaNet||!sclNet||n(eeprom,"SCL")!==sclNet||!busReady||resistances.some(v=>!Number.isFinite(v)||v<=0)||![address,register,writeByte,eepromAddress,memoryRegister,initialByte,baud].every(Number.isFinite)||address<0||address>0x7f||eepromAddress<0||eepromAddress>0x7f||register<0||register>0xff||memoryRegister<0||memoryRegister>0xff||writeByte<0||writeByte>0xff||initialByte<0||initialByte>0xff||baud<10000||baud>1000000||cycle!=="write-read"||field(fields,"ACK")===undefined){
    return {state:"blocked",message:"Wire shared SDA/SCL with one pull-up per line, power and ground the EEPROM, and configure matching 7-bit address, 8-bit register/data, 10 kHz–1 MHz clock, write-read cycle, and ACK fixture.",validation};
  }
  const addressMatch=address===eepromAddress,registerMatch=register===memoryRegister,deviceAck=ack&&addressMatch,writeAcknowledged=deviceAck&&registerMatch,storedByte=writeAcknowledged?writeByte:initialByte,readByte=deviceAck&&registerMatch?storedByte:null;
  const pullupCurrentA=resistances.reduce((sum,r)=>sum+supplyVoltage/r,0);
  return {state:"complete",engine:"Ideal I²C EEPROM write/read transaction model",message:readByte===null?"The EEPROM transaction was not acknowledged or the configured memory address was absent; no verified read-back is returned.":"Models an acknowledged byte write followed by immediate register read-back. Persistence is an ideal logical storage assumption; write-cycle delay, endurance, power-loss behavior, page boundaries, and physical EEPROM timing are not modeled.",result:{kind:"i2c-eeprom-write-read",address,register,baud,addressMatch,registerMatch,deviceAck,writeAcknowledged,readAcknowledged:readByte!==null,initialByte,writeByte,storedByte:writeAcknowledged?storedByte:initialByte,readByte,readHex:readByte===null?null:"0x"+readByte.toString(16).padStart(2,"0").toUpperCase(),dataPreserved:readByte!==null&&readByte===writeByte,persistenceModel:"ideal immediate register storage",pullupCurrentA},validation};
}
function analyseI2cRegisterRead(project,{source,fixture,sensor,resistors,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(sensor,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const fixtureGround=n(fixture,"GND"),sdaNet=n(fixture,"SDA"),sclNet=n(fixture,"SCL");
  const config=String(fixture.value),sensorConfig=String(sensor.value);
  const hex=(text,label)=>{const match=text.match(new RegExp("\\b"+label+"\\s+(0x[0-9a-f]+|\\d+)","i"));return match?parseInt(match[1],match[1].toLowerCase().startsWith("0x")?16:10):Number.NaN;};
  const address=hex(config,"Address"),register=hex(config,"Register"),sensorAddress=hex(sensorConfig,"Address");
  const baudMatch=config.match(/\bBaud\s+(\d+(?:\.\d+)?)/i),baud=baudMatch?Number(baudMatch[1]):Number.NaN;
  const ackMatch=config.match(/\bACK\s+(yes|no)\b/i),sensorResponds=ackMatch?.[1].toLowerCase()==="yes";
  const mapMatch=sensorConfig.match(/\bRegister\s+(0x[0-9a-f]+|\d+)\s*=\s*(0x[0-9a-f]+|\d+)/i);
  const mappedRegister=mapMatch?parseInt(mapMatch[1],mapMatch[1].toLowerCase().startsWith("0x")?16:10):Number.NaN;
  const dataByte=mapMatch?parseInt(mapMatch[2],mapMatch[2].toLowerCase().startsWith("0x")?16:10):Number.NaN;
  const resistanceValues=resistors.map(item=>resistanceValue(item.value));
  const pullupNets=resistors.map(item=>{const a=n(item,"1"),b=n(item,"2");return a===vccNet?b:b===vccNet?a:undefined;});
  const correctPullups=pullupNets.includes(sdaNet)&&pullupNets.includes(sclNet)&&sdaNet!==sclNet;
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||n(sensor,"GND")!==groundNet||fixtureGround!==groundNet||!sdaNet||n(sensor,"SDA")!==sdaNet||!sclNet||n(sensor,"SCL")!==sclNet||!correctPullups||resistanceValues.some(v=>!Number.isFinite(v)||v<=0)||![address,register,sensorAddress,mappedRegister,dataByte,baud].every(Number.isFinite)||address<0||address>0x7f||sensorAddress<0||sensorAddress>0x7f||register<0||register>0xff||mappedRegister<0||mappedRegister>0xff||dataByte<0||dataByte>0xff||baud<10000||baud>1000000||!ackMatch){
    return {state:"blocked",message:"Wire shared SDA/SCL lines with one pull-up resistor per line, power and ground the sensor, and configure a 7-bit address, 8-bit register, and I²C clock from 10 kHz to 1 MHz.",validation};
  }
  const addressMatch=address===sensorAddress,registerMatch=register===mappedRegister,sensorAck=sensorResponds&&addressMatch,readComplete=sensorAck&&registerMatch;
  const busPullupCurrentA=resistanceValues.reduce((sum,r)=>sum+supplyVoltage/r,0);
  return {state:"complete",engine:"Ideal I²C register-read transaction model",message:readComplete?"Models START, address-write, register selection, repeated START, address-read, sensor ACKs, one data byte, master NACK, and STOP. Clock stretching, analog rise time, arbitration, noise, and device-specific timing are omitted.":!sensorAck?"The sensor did not acknowledge the requested 7-bit address; no register data is returned.":"The address was acknowledged, but the requested register is not present in the configured sensor map.",result:{kind:"i2c-register-read",address,register,sensorAddress,baud,addressMatch,registerMatch,sensorAck,readComplete,receivedByte:readComplete?dataByte:null,receivedHex:readComplete?"0x"+dataByte.toString(16).padStart(2,"0").toUpperCase():null,ackSequence:[sensorAck,sensorAck,sensorAck],masterFinalNack:true,transaction:["START","ADDRESS+WRITE","ACK","REGISTER","ACK","REPEATED START","ADDRESS+READ","ACK","DATA","MASTER NACK","STOP"],busPullupCurrentA},validation};
}
function analyseUsbUartConsole(project,{source,stream,bridge,report,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin))),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const config=fields(stream.value),bridgeConfig=fields(bridge.value),baud=Number(field(config,"Baud")),dataBits=Number(field(config,"DataBits")),parity=(field(config,"Parity")??"").toLowerCase(),stopBits=Number(field(config,"StopBits"));
  const parseBytes=label=>{const text=field(config,label);if(!text)return [];return text.split(/\s+/).map(token=>/^(?:0x)?[0-9a-f]{2}$/i.test(token)?Number.parseInt(token.replace(/^0x/i,""),16):Number.NaN);};
  const txBytes=parseBytes("TXBytes"),rxBytes=parseBytes("RXBytes"),parityBits=parity==="none"?0:1,frameBits=1+dataBits+parityBits+stopBits;
  const formatFrames=bytes=>bytes.map(byte=>{const bits=Array.from({length:dataBits},(_,index)=>(byte>>index)&1),ones=bits.reduce((sum,bit)=>sum+bit,0),parityBit=parity==="even"?ones%2:parity==="odd"?1-ones%2:null;return {byte,hex:"0x"+byte.toString(16).padStart(2,"0").toUpperCase(),bits:[0,...bits,...(parityBit===null?[]:[parityBit]),...Array(stopBits).fill(1)],parityBit};});
  const groundNet=n(ground,"0"),vccNet=n(bridge,"VCC"),powered=n(source,"+")===vccNet&&n(source,"-")===groundNet&&n(bridge,"GND")===groundNet&&n(report,"VCC")===vccNet&&n(report,"GND")===groundNet&&n(stream,"GND")===groundNet;
  const serialPath=n(stream,"TX")===n(bridge,"RX")&&n(bridge,"TX")===n(report,"RX");
  const required=[groundNet,vccNet,n(stream,"TX"),n(stream,"GND"),n(bridge,"RX"),n(bridge,"TX"),n(bridge,"GND"),n(report,"RX"),n(report,"VCC"),n(report,"GND")];
  const validFormat=Number.isInteger(baud)&&baud>=300&&baud<=115200&&[7,8].includes(dataBits)&&["none","even","odd"].includes(parity)&&[1,2].includes(stopBits)&&txBytes.length>0&&txBytes.length<=64&&rxBytes.length<=64&&[...txBytes,...rxBytes].every(byte=>Number.isInteger(byte)&&byte>=0&&byte<=255);
  if(!Number.isFinite(voltageValue(source.value))||voltageValue(source.value)<3||voltageValue(source.value)>5.5||!powered||!serialPath||required.some(net=>typeof net!=="string"||!net)||field(bridgeConfig,"Mode")!=="local mock"||field(bridgeConfig,"Flow")!=="none"||!validFormat){
    return {state:"blocked",message:"Power the local bridge and console, connect the host TX through bridge RX and bridge TX to console RX, and configure a 300–115200 baud 7/8-bit stream with valid byte values.",validation};
  }
  const txFrames=formatFrames(txBytes),rxFrames=formatFrames(rxBytes),txDurationSeconds=txBytes.length*frameBits/baud,rxDurationSeconds=rxBytes.length*frameBits/baud;
  const text=bytes=>bytes.map(byte=>byte>=32&&byte<=126?String.fromCharCode(byte):"·").join("");
  return {state:"complete",engine:"Local USB-UART serial framing and console mock",message:"Frames configured byte streams using ideal asynchronous UART start/data/parity/stop-bit rules and reports local console text. USB enumeration, USB packet transport, electrical line levels, clock error, oversampling, buffering, drivers, firmware, and physical bridge behavior are not modeled; no host or device is contacted.",result:{kind:"usb-uart-console",baud,dataBits,parity,stopBits,frameBits,txBytes,rxBytes,txHex:txFrames.map(frame=>frame.hex),rxHex:rxFrames.map(frame=>frame.hex),txAscii:text(txBytes),rxAscii:text(rxBytes),txDurationSeconds,rxDurationSeconds,txFrames,rxFrames,usbEnumerated:false,hostContacted:false,firmwareExecuted:false},validation};
}
function analyseUartReceiver(project,{source,frameSource,receiver,resistor,led,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(receiver,"VCC"),supplyVoltage=n(source,"+")===vccNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const rxNet=n(receiver,"RX"),txNet=n(frameSource,"TX"),validNet=n(receiver,"VALID"),outputPath=(n(resistor,"1")===validNet&&n(resistor,"2")===n(led,"A"))||(n(resistor,"2")===validNet&&n(resistor,"1")===n(led,"A"));
  const frameConfig=String(frameSource.value),fields=frameConfig.split(";"),bitsField=fields.find(v=>v.trim().startsWith("Bits ")),baudField=fields.find(v=>v.trim().startsWith("Baud "));
  const frameBits=bitsField?bitsField.trim().slice(5).split(",").map(v=>Number(v.trim())):[],baud=baudField?Number(baudField.trim().slice(5)):Number.NaN;
  const resistance=resistanceValue(resistor.value),forwardV=forwardVoltage(led.value);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||n(receiver,"GND")!==groundNet||n(frameSource,"GND")!==groundNet||rxNet!==txNet||!outputPath||n(led,"K")!==groundNet||frameBits.length!==10||frameBits.some(v=>v!==0&&v!==1)||!Number.isFinite(baud)||baud<300||baud>1000000||!Number.isFinite(resistance)||resistance<=0||!Number.isFinite(forwardV)||forwardV<=0){
    return {state:"blocked",message:"Connect a ten-bit 8N1 UART frame source to RX, set baud from 300 to 1,000,000, and wire powered receiver and valid-frame LED.",validation};
  }
  const startBit=frameBits[0],dataBits=frameBits.slice(1,9),stopBit=frameBits[9],byte=dataBits.reduce((value,bit,index)=>value|(bit<<index),0),framingError=startBit!==0||stopBit!==1,valid=!framingError;
  const frameDurationSeconds=10/baud,validCurrentA=valid?Math.max(0,(supplyVoltage-forwardV)/resistance):0;
  return {state:"complete",engine:"Ideal UART 8N1 frame decoder",message:framingError?"Frame received with a start or stop-bit framing error; data byte is not marked valid.":"Decodes the supplied 8N1 frame LSB-first. Analog waveform sampling, oversampling, jitter, noise, parity, and physical transceiver behavior are not modeled.",result:{kind:"uart-receiver-8n1",baud,frameBits,startBit,dataBits,stopBit,byte,byteHex:`0x${byte.toString(16).padStart(2,"0").toUpperCase()}`,frameFormat:"8N1",framingError,valid,frameDurationSeconds,validIndicatorCurrentA:validCurrentA},validation};
}
function analyseUartTransmitter(project,{source,transmitter,resistor,led,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),supplyNet=n(transmitter,"VCC"),sourceVoltage=n(source,"+")===supplyNet&&n(source,"-")===groundNet?voltageValue(source.value):Number.NaN;
  const txNet=n(transmitter,"TX"),ledPath=(n(resistor,"1")===txNet&&n(resistor,"2")===n(led,"A"))||(n(resistor,"2")===txNet&&n(resistor,"1")===n(led,"A"));
  const config=String(transmitter.value),byteMatch=config.match(/\bByte\s+(0x[0-9a-f]+|\d+)/i),baudMatch=config.match(/\bBaud\s+(\d+(?:\.\d+)?)/i);
  const byteText=byteMatch?.[1],byteValue=byteText?(byteText.toLowerCase().startsWith("0x")?parseInt(byteText.slice(2),16):Number(byteText)):Number.NaN,baud=baudMatch?Number(baudMatch[1]):Number.NaN;
  const resistance=resistanceValue(resistor.value),forwardV=forwardVoltage(led.value);
  if(!Number.isFinite(sourceVoltage)||sourceVoltage<=0||n(transmitter,"GND")!==groundNet||n(led,"K")!==groundNet||!ledPath||!Number.isInteger(byteValue)||byteValue<0||byteValue>255||!Number.isFinite(baud)||baud<300||baud>1000000||!Number.isFinite(resistance)||resistance<=0||!Number.isFinite(forwardV)||forwardV<=0){
    return {state:"blocked",message:"Set a byte from 0 to 255 and baud rate from 300 to 1,000,000, and wire a powered ideal UART transmitter with an idle-high TX indicator.",validation};
  }
  const dataBits=Array.from({length:8},(_,bit)=>Boolean(byteValue&(1<<bit))),frameBits=[false,...dataBits,true],bitPeriodSeconds=1/baud,frameDurationSeconds=10/baud,ledCurrentA=Math.max(0,(sourceVoltage-forwardV)/resistance);
  return {state:"complete",engine:"Ideal asynchronous UART 8N1 frame generator",message:"Produces one start bit, eight LSB-first data bits, and one stop bit at the configured baud rate. This is a frame-level digital model; analog edges, jitter, oversampling, line loading, parity, and physical transceiver behavior are not simulated.",result:{kind:"uart-transmitter-8n1",byte:byteValue,byteHex:`0x${byteValue.toString(16).padStart(2,"0").toUpperCase()}`,baud,frameFormat:"8N1",dataBits,frameBits,startBit:0,stopBit:1,bitPeriodSeconds,frameDurationSeconds,txIdleVoltage:sourceVoltage,txIdleHigh:true,idleIndicatorCurrentA:ledCurrentA},validation};
}
function analyseAlu4(project,{sources,alu,resistors,leds,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(alu,"VCC"),supply=sources.find(v=>n(v,"+")===vccNet&&n(v,"-")===groundNet);
  const pins=["A0","A1","A2","A3","B0","B1","B2","B3","SUB"];
  const inputSources=pins.map(pin=>sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===n(alu,pin)));
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN,inputVoltages=inputSources.map(v=>v?voltageValue(v.value):Number.NaN),thresholdV=supplyVoltage/2;
  const outputPins=["SUM0","SUM1","SUM2","SUM3","CARRY"];
  const outputs=outputPins.map(pin=>{
    const net=n(alu,pin),resistor=resistors.find(r=>n(r,"1")===net||n(r,"2")===net);
    const led=resistor&&leds.find(x=>((n(resistor,"1")===net&&n(resistor,"2")===n(x,"A"))||(n(resistor,"2")===net&&n(resistor,"1")===n(x,"A")))&&n(x,"K")===groundNet);
    return {pin,net,resistor,led,resistance:resistor?resistanceValue(resistor.value):Number.NaN,vf:led?forwardVoltage(led.value):Number.NaN};
  });
  if(!supply||inputSources.some(v=>!v)||n(alu,"GND")!==groundNet||outputs.some(o=>!o.net||!o.resistor||!o.led||!Number.isFinite(o.resistance)||!Number.isFinite(o.vf)||o.resistance<=0||o.vf<=0)||![supplyVoltage,...inputVoltages].every(Number.isFinite)||supplyVoltage<=0||inputVoltages.some(v=>v<0||v>supplyVoltage)){
    return {state:"blocked",message:"Wire four-bit A/B operands, the add/subtract selector, powered ALU, five current-limited result indicators, and supply/ground rails.",validation};
  }
  const bits=inputVoltages.map(v=>v>=thresholdV),aBits=bits.slice(0,4),bBits=bits.slice(4,8),subtract=bits[8];
  const a=aBits.reduce((value,bit,index)=>value|(Number(bit)<<index),0),b=bBits.reduce((value,bit,index)=>value|(Number(bit)<<index),0);
  const adjustedB=subtract?(b^15):b,total=a+adjustedB+(subtract?1:0),sum=total&15,carryOut=Boolean(total&16),sumBits=[0,1,2,3].map(bit=>Boolean(sum&(1<<bit))),outputBits=[...sumBits,carryOut];
  const outputCurrents=outputs.map((o,i)=>outputBits[i]?Math.max(0,(supplyVoltage-o.vf)/o.resistance):0);
  return {state:"complete",engine:"Ideal four-bit combinational add/subtract ALU",message:"Computes unsigned four-bit addition or two's-complement subtraction. In subtraction mode, carry indicates no borrow. Signed overflow, propagation delay, logic hazards, and device-specific electrical limits are not modeled.",result:{kind:"alu4-add-subtract",supplyVoltage,logicThresholdV:thresholdV,aBits,bBits,subtract,a,b,adjustedB,sumBits,sum,carryOut,borrow:subtract&&!carryOut,outputBits,outputCurrents,operation:subtract?"subtract":"add"},validation};
}
function analysePriorityEncoder(project,{sources,encoder,resistors,leds,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(encoder,"VCC"),supply=sources.find(v=>n(v,"+")===vccNet&&n(v,"-")===groundNet);
  const inputSources=[0,1,2,3].map(index=>sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===n(encoder,`D${index}`)));
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN,inputVoltages=inputSources.map(v=>v?voltageValue(v.value):Number.NaN),thresholdV=supplyVoltage/2;
  const outputPins=["CODE0","CODE1","VALID"];
  const outputs=outputPins.map(pin=>{
    const net=n(encoder,pin),resistor=resistors.find(r=>n(r,"1")===net||n(r,"2")===net);
    const led=resistor&&leds.find(x=>((n(resistor,"1")===net&&n(resistor,"2")===n(x,"A"))||(n(resistor,"2")===net&&n(resistor,"1")===n(x,"A")))&&n(x,"K")===groundNet);
    return {pin,net,resistor,led,resistance:resistor?resistanceValue(resistor.value):Number.NaN,vf:led?forwardVoltage(led.value):Number.NaN};
  });
  if(!supply||inputSources.some(v=>!v)||n(encoder,"GND")!==groundNet||outputs.some(o=>!o.net||!o.resistor||!o.led||!Number.isFinite(o.resistance)||!Number.isFinite(o.vf)||o.resistance<=0||o.vf<=0)
    ||![supplyVoltage,...inputVoltages].every(Number.isFinite)||supplyVoltage<=0||inputVoltages.some(v=>v<0||v>supplyVoltage)){
    return {state:"blocked",message:"Wire four valid 0–VCC priority inputs, the ideal encoder, code/valid outputs, LED resistors, and supply/ground rails.",validation};
  }
  const inputs=inputVoltages.map(v=>v>=thresholdV),highestIndex=inputs.lastIndexOf(true),valid=highestIndex>=0,code=valid?highestIndex:0,codeBits=[Boolean(code&1),Boolean(code&2)],outputBits=[...codeBits,valid];
  const outputCurrents=outputs.map((o,i)=>outputBits[i]?Math.max(0,(supplyVoltage-o.vf)/o.resistance):0);
  return {state:"complete",engine:"Ideal four-input priority encoder",message:"Encodes the highest-numbered asserted input (D3 highest) and exposes a separate valid output for the all-low case. Propagation delay, input loading, noise, and device-specific priority behavior are not modeled.",result:{kind:"priority-encoder",supplyVoltage,logicThresholdV:thresholdV,inputVoltages,inputs,highestIndex,valid,code,codeBits,outputBits,outputCurrents},validation};
}

function analyseDecoder2to4(project,{sources,decoder,resistors,leds,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(decoder,"VCC"),supply=sources.find(v=>n(v,"+")===vccNet&&n(v,"-")===groundNet);
  const sourceFor=pin=>sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===n(decoder,pin));
  const a0=sourceFor("A0"),a1=sourceFor("A1"),supplyVoltage=supply?voltageValue(supply.value):Number.NaN;
  const v0=a0?voltageValue(a0.value):Number.NaN,v1=a1?voltageValue(a1.value):Number.NaN,thresholdV=supplyVoltage/2;
  const outputs=[0,1,2,3].map(index=>{
    const net=n(decoder,`Y${index}`),resistor=resistors.find(r=>n(r,"1")===net||n(r,"2")===net);
    const led=resistor&&leds.find(x=>((n(resistor,"1")===net&&n(resistor,"2")===n(x,"A"))||(n(resistor,"2")===net&&n(resistor,"1")===n(x,"A")))&&n(x,"K")===groundNet);
    return {index,net,resistor,led,resistance:resistor?resistanceValue(resistor.value):Number.NaN,vf:led?forwardVoltage(led.value):Number.NaN};
  });
  if(!supply||!a0||!a1||n(decoder,"GND")!==groundNet||outputs.some(o=>!o.net||!o.resistor||!o.led||!Number.isFinite(o.resistance)||!Number.isFinite(o.vf)||o.resistance<=0||o.vf<=0)
    ||![supplyVoltage,v0,v1].every(Number.isFinite)||supplyVoltage<=0||[v0,v1].some(v=>v<0||v>supplyVoltage)){
    return {state:"blocked",message:"Wire both decoder address inputs, powered ideal decoder, four current-limited outputs, and supply/ground rails with valid 0–VCC logic levels.",validation};
  }
  const address=(v1>=thresholdV?2:0)+(v0>=thresholdV?1:0),outputsHigh=[0,1,2,3].map(i=>i===address);
  const outputCurrents=outputs.map(o=>outputsHigh[o.index]?Math.max(0,(supplyVoltage-o.vf)/o.resistance):0);
  return {state:"complete",engine:"Ideal active-high two-to-four decoder",message:"Asserts exactly one active-high output for each two-bit address. Propagation delay, output drive, leakage, noise, enable behavior, and manufacturer-specific logic thresholds are not modeled.",result:{kind:"decoder-2to4",supplyVoltage,logicThresholdV:thresholdV,addressBits:[v0>=thresholdV,v1>=thresholdV],address,outputsHigh,outputCurrents,oneHot:outputsHigh.filter(Boolean).length===1},validation};
}

function analyseMux4(project,{sources,mux,resistor,led,ground,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(mux,"VCC"),supply=sources.find(v=>n(v,"+")===vccNet&&n(v,"-")===groundNet);
  const sourceFor=(pin)=>sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===n(mux,pin));
  const dataSources=[0,1,2,3].map(i=>sourceFor(`I${i}`)),s0=sourceFor("S0"),s1=sourceFor("S1");
  const outputNet=n(mux,"Y"),outputPath=(n(resistor,"1")===outputNet&&n(resistor,"2")===n(led,"A"))||(n(resistor,"2")===outputNet&&n(resistor,"1")===n(led,"A"));
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN,dataVoltages=dataSources.map(v=>v?voltageValue(v.value):Number.NaN),s0Voltage=s0?voltageValue(s0.value):Number.NaN,s1Voltage=s1?voltageValue(s1.value):Number.NaN;
  const resistance=resistanceValue(resistor.value),forwardV=forwardVoltage(led.value),thresholdV=supplyVoltage/2;
  if(!supply||dataSources.some(v=>!v)||!s0||!s1||!outputPath||n(mux,"GND")!==groundNet||n(led,"K")!==groundNet
    ||![supplyVoltage,...dataVoltages,s0Voltage,s1Voltage,resistance,forwardV].every(Number.isFinite)||supplyVoltage<=0||[...dataVoltages,s0Voltage,s1Voltage].some(v=>v<0||v>supplyVoltage)||resistance<=0||forwardV<=0){
    return {state:"blocked",message:"Wire all four mux data inputs, both select bits, powered ideal mux, and current-limited output indicator using valid 0–VCC values.",validation};
  }
  const dataBits=dataVoltages.map(v=>v>=thresholdV),select0=s0Voltage>=thresholdV,select1=s1Voltage>=thresholdV,selectedIndex=(select1?2:0)+(select0?1:0),outputHigh=dataBits[selectedIndex],outputVoltage=outputHigh?supplyVoltage:0;
  const ledCurrentA=outputHigh?Math.max(0,(outputVoltage-forwardV)/resistance):0;
  return {state:"complete",engine:"Ideal four-to-one static multiplexer",message:"Selects one of four static logic inputs using S1:S0 and drives an ideal rail-to-rail output. Propagation delay, input loading, leakage, noise, logic-family thresholds, and device-specific limits are not modeled.",result:{kind:"mux4",supplyVoltage,logicThresholdV:thresholdV,dataVoltages,dataBits,select0,select1,selectedIndex,selectedInput:dataBits[selectedIndex],outputHigh,outputVoltage,ledOn:ledCurrentA>0,ledCurrentA},validation};
}

function analyseRingShiftChaser(project,{sources,register,resistors,leds,ground,previousState,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(register,"VCC"),supply=sources.find(v=>n(v,"+")===vccNet&&n(v,"-")===groundNet);
  const clockNet=n(register,"CLK"),resetNet=n(register,"RESET_N");
  const clockSource=sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===clockNet);
  const resetSource=sources.find(v=>v!==supply&&v!==clockSource&&n(v,"-")===groundNet&&n(v,"+")===resetNet);
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN,clockVoltage=clockSource?voltageValue(clockSource.value):Number.NaN,resetVoltage=resetSource?voltageValue(resetSource.value):Number.NaN,thresholdV=supplyVoltage/2;
  const paths=[0,1,2,3].map(bit=>{
    const outputNet=n(register,`Q${bit}`),resistor=resistors.find(r=>n(r,"1")===outputNet||n(r,"2")===outputNet);
    const led=resistor&&leds.find(x=>((n(resistor,"1")===outputNet&&n(resistor,"2")===n(x,"A"))||(n(resistor,"2")===outputNet&&n(resistor,"1")===n(x,"A")))&&n(x,"K")===groundNet);
    return {outputNet,resistor,led,resistance:resistor?resistanceValue(resistor.value):Number.NaN,vf:led?forwardVoltage(led.value):Number.NaN};
  });
  if(!supply||!clockSource||!resetSource||n(register,"GND")!==groundNet||paths.some(p=>!p.outputNet||!p.resistor||!p.led||!Number.isFinite(p.resistance)||!Number.isFinite(p.vf)||p.resistance<=0||p.vf<=0)
    ||![supplyVoltage,clockVoltage,resetVoltage].every(Number.isFinite)||supplyVoltage<=0||[clockVoltage,resetVoltage].some(v=>v<0||v>supplyVoltage)){
    return {state:"blocked",message:"Wire the ideal four-bit ring shift register, clock, active-low reset, four current-limited LEDs, and supply/ground rails.",validation};
  }
  const clockHigh=clockVoltage>=thresholdV,resetActive=resetVoltage<thresholdV,previous=previousState?.result,previousClockHigh=previous?.clockHigh,risingEdge=previousClockHigh===false&&clockHigh;
  if(!resetActive&&clockHigh&&typeof previousClockHigh!=="boolean")return {state:"blocked",message:"Start with the clock low, then advance the ring register on rising edges.",validation};
  if(risingEdge&&!resetActive&&!Array.isArray(previous?.bits))return {state:"blocked",message:"Initialize the ring register with active-low reset before shifting.",validation};
  const bits=resetActive?[true,false,false,false]:risingEdge?[previous.bits[3],previous.bits[0],previous.bits[1],previous.bits[2]]:Array.isArray(previous?.bits)?previous.bits:null;
  const outputCurrents=bits?paths.map((p,i)=>bits[i]?Math.max(0,(supplyVoltage-p.vf)/p.resistance):0):[0,0,0,0];
  return {state:"complete",engine:"Ideal four-bit one-hot ring shift register",message:"Rotates a one-hot state by one output per rising clock edge and asynchronously initializes Q0. This is a discrete ring-state model, not a manufacturer-specific shift-register timing or power model.",result:{kind:"shift-register-led-chaser",supplyVoltage,logicThresholdV:thresholdV,clockVoltage,resetVoltage,clockHigh,resetActive,risingEdge,bits,activeLedIndex:bits?bits.indexOf(true):-1,outputCurrents,risingEdgeCount:(previous?.risingEdgeCount||0)+(risingEdge?1:0),oneHot:bits?bits.filter(Boolean).length===1:null,mode:resetActive?"asynchronous reset":risingEdge?"shift":clockHigh?"high-level hold":"low-level hold"},validation};
}

function analyseDigitalDebounce(project,{sources,filter,resistor,led,ground,previousState,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(filter,"VCC"),supply=sources.find(v=>n(v,"+")===vccNet&&n(v,"-")===groundNet);
  const inputNet=n(filter,"INPUT"),clockNet=n(filter,"CLK"),resetNet=n(filter,"RESET_N");
  const inputSource=sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===inputNet);
  const clockSource=sources.find(v=>v!==supply&&v!==inputSource&&n(v,"-")===groundNet&&n(v,"+")===clockNet);
  const resetSource=sources.find(v=>v!==supply&&v!==inputSource&&v!==clockSource&&n(v,"-")===groundNet&&n(v,"+")===resetNet);
  const outputNet=n(filter,"Q"),outputPath=(n(resistor,"1")===outputNet&&n(resistor,"2")===n(led,"A"))||(n(resistor,"2")===outputNet&&n(resistor,"1")===n(led,"A"));
  const sampleMatch=String(filter.value).match(/(?:stable\s+samples?\s*)(\d+)/i),sampleCount=sampleMatch?Number(sampleMatch[1]):Number.NaN;
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN,inputVoltage=inputSource?voltageValue(inputSource.value):Number.NaN,clockVoltage=clockSource?voltageValue(clockSource.value):Number.NaN,resetVoltage=resetSource?voltageValue(resetSource.value):Number.NaN;
  const resistance=resistanceValue(resistor.value),forwardV=forwardVoltage(led.value),thresholdV=supplyVoltage/2;
  if(!supply||!inputSource||!clockSource||!resetSource||!outputPath||n(filter,"GND")!==groundNet||n(led,"K")!==groundNet
    ||![sampleCount,supplyVoltage,inputVoltage,clockVoltage,resetVoltage,resistance,forwardV].every(Number.isFinite)
    ||!Number.isInteger(sampleCount)||sampleCount<2||sampleCount>20||supplyVoltage<=0||[inputVoltage,clockVoltage,resetVoltage].some(v=>v<0||v>supplyVoltage)||resistance<=0||forwardV<=0){
    return {state:"blocked",message:"Wire the ideal sampled debounce filter, 2–20 stable-sample setting, 0–VCC raw input/clock/reset, and current-limited Q indicator.",validation};
  }
  const inputHigh=inputVoltage>=thresholdV,clockHigh=clockVoltage>=thresholdV,resetActive=resetVoltage<thresholdV,previous=previousState?.result,previousClockHigh=previous?.clockHigh,risingEdge=previousClockHigh===false&&clockHigh;
  if(!resetActive&&clockHigh&&typeof previousClockHigh!=="boolean")return {state:"blocked",message:"Start with the sampling clock low, then apply rising edges to process the input history.",validation};
  let output,candidateHigh,stableSamples,mode;
  if(resetActive){output=false;candidateHigh=null;stableSamples=0;mode="asynchronous reset";}
  else if(risingEdge){
    candidateHigh=inputHigh===previous?.candidateHigh?inputHigh:inputHigh;
    stableSamples=inputHigh===previous?.candidateHigh?(previous.stableSamples||0)+1:1;
    output=stableSamples>=sampleCount?inputHigh:(typeof previous?.output==="boolean"?previous.output:false);
    mode=stableSamples>=sampleCount&&output!==previous?.output?"debounced transition":"sample";
  }else{
    output=typeof previous?.output==="boolean"?previous.output:false;
    candidateHigh=previous?.candidateHigh??null;stableSamples=previous?.stableSamples||0;
    mode=clockHigh?"high-level hold":"low-level hold";
  }
  const qVoltage=output?supplyVoltage:0,ledCurrentA=output?Math.max(0,(qVoltage-forwardV)/resistance):0;
  return {state:"complete",engine:"Ideal clocked N-sample digital debounce filter",message:"Changes the output only after the raw digital input has matched for the configured number of rising-edge samples. This is a digital stability-window model, not a simulated RC/Schmitt analog circuit; analog time constants, bounce duration, thresholds, metastability and device-specific behavior are omitted.",result:{kind:"digital-debounce",supplyVoltage,logicThresholdV:thresholdV,inputVoltage,inputHigh,clockVoltage,clockHigh,resetVoltage,resetActive,risingEdge,sampleCount,candidateHigh,stableSamples,output,qVoltage,ledCurrentA,mode},validation};
}

function analyseTrafficLightFsm(project,{sources,fsm,resistors,leds,ground,previousState,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(fsm,"VCC"),supply=sources.find(v=>n(v,"+")===vccNet&&n(v,"-")===groundNet);
  const clockNet=n(fsm,"CLK"),resetNet=n(fsm,"RESET_N");
  const clockSource=sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===clockNet);
  const resetSource=sources.find(v=>v!==supply&&v!==clockSource&&n(v,"-")===groundNet&&n(v,"+")===resetNet);
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN,clockVoltage=clockSource?voltageValue(clockSource.value):Number.NaN,resetVoltage=resetSource?voltageValue(resetSource.value):Number.NaN,thresholdV=supplyVoltage/2;
  const outputPins=["NS_R","NS_Y","NS_G","EW_R","EW_Y","EW_G"];
  const paths=outputPins.map(pin=>{
    const net=n(fsm,pin),resistor=resistors.find(r=>n(r,"1")===net||n(r,"2")===net);
    const led=resistor&&leds.find(x=>((n(resistor,"1")===net&&n(resistor,"2")===n(x,"A"))||(n(resistor,"2")===net&&n(resistor,"1")===n(x,"A")))&&n(x,"K")===groundNet);
    return {pin,net,resistor,led,resistance:resistor?resistanceValue(resistor.value):Number.NaN,vf:led?forwardVoltage(led.value):Number.NaN};
  });
  if(!supply||!clockSource||!resetSource||n(fsm,"GND")!==groundNet
    ||paths.some(p=>!p.net||!p.resistor||!p.led||!Number.isFinite(p.resistance)||!Number.isFinite(p.vf)||p.resistance<=0||p.vf<=0)
    ||![supplyVoltage,clockVoltage,resetVoltage].every(Number.isFinite)||supplyVoltage<=0||[clockVoltage,resetVoltage].some(v=>v<0||v>supplyVoltage)){
    return {state:"blocked",message:"Wire the six-phase traffic-light FSM, clock, active-low reset, six current-limited signal lamps, and supply/ground rails.",validation};
  }
  const clockHigh=clockVoltage>=thresholdV,resetActive=resetVoltage<thresholdV,previous=previousState?.result,previousClockHigh=previous?.clockHigh,risingEdge=previousClockHigh===false&&clockHigh;
  if(!resetActive&&clockHigh&&typeof previousClockHigh!=="boolean")return {state:"blocked",message:"Start with the clock low, then apply rising edges to advance the traffic-light phases.",validation};
  if(risingEdge&&!resetActive&&!Number.isInteger(previous?.phase))return {state:"blocked",message:"Initialize the traffic-light state machine with active-low reset before advancing phases.",validation};
  const phase=resetActive?0:risingEdge?(previous.phase+1)%6:Number.isInteger(previous?.phase)?previous.phase:null;
  const patterns=[[0,0,1,1,0,0],[0,1,0,1,0,0],[1,0,0,1,0,0],[1,0,0,0,0,1],[1,0,0,0,1,0],[1,0,0,1,0,0]];
  const lamps=phase===null?null:patterns[phase].map(Boolean),lampCurrents=lamps?paths.map((p,i)=>lamps[i]?Math.max(0,(supplyVoltage-p.vf)/p.resistance):0):Array(6).fill(0);
  const conflictingGreen=lamps?.[2]&&lamps?.[5]||false;
  return {state:"complete",engine:"Ideal six-phase traffic-light finite-state machine",message:"Advances one phase per rising edge through NS green, NS yellow, all red, EW green, EW yellow, all red. The FSM never commands opposing green lamps together. Real timing, pedestrian phases, sensors, interlocks, propagation, and regulatory traffic-control behavior are not modeled.",result:{kind:"traffic-light-fsm",supplyVoltage,logicThresholdV:thresholdV,clockVoltage,resetVoltage,clockHigh,resetActive,risingEdge,phase,lamps,lampCurrents,conflictingGreen,risingEdgeCount:(previous?.risingEdgeCount||0)+(risingEdge?1:0),mode:resetActive?"asynchronous reset":risingEdge?"advance":clockHigh?"high-level hold":"low-level hold",phaseTiming:"one state transition per rising edge; no real-time phase duration"},validation};
}

function analyseBcdCounterDisplay(project,{sources,counter,resistors,leds,ground,previousState,validation}){
  const netByEndpoint=new Map();for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(counter,"VCC"),supply=sources.find(v=>n(v,"+")===vccNet&&n(v,"-")===groundNet);
  const clockNet=n(counter,"CLK"),resetNet=n(counter,"RESET_N");
  const clockSource=sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===clockNet);
  const resetSource=sources.find(v=>v!==supply&&v!==clockSource&&n(v,"-")===groundNet&&n(v,"+")===resetNet);
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN,clockVoltage=clockSource?voltageValue(clockSource.value):Number.NaN,resetVoltage=resetSource?voltageValue(resetSource.value):Number.NaN;
  const thresholdV=supplyVoltage/2,segments=["A","B","C","D","E","F","G"];
  const paths=segments.map(segment=>{
    const outputNet=n(counter,`SEG_${segment}`);
    const resistor=resistors.find(r=>n(r,"1")===outputNet||n(r,"2")===outputNet);
    const led=resistor&&leds.find(x=>((n(resistor,"1")===outputNet&&n(resistor,"2")===n(x,"A"))||(n(resistor,"2")===outputNet&&n(resistor,"1")===n(x,"A")))&&n(x,"K")===groundNet);
    return {segment,outputNet,resistor,led,currentR:resistor?resistanceValue(resistor.value):Number.NaN,forwardV:led?forwardVoltage(led.value):Number.NaN};
  });
  if(!supply||!clockSource||!resetSource||n(counter,"GND")!==groundNet
    ||paths.some(p=>!p.outputNet||!p.resistor||!p.led||!Number.isFinite(p.currentR)||!Number.isFinite(p.forwardV)||p.currentR<=0||p.forwardV<=0)
    ||![supplyVoltage,clockVoltage,resetVoltage].every(Number.isFinite)||supplyVoltage<=0||[clockVoltage,resetVoltage].some(v=>v<0||v>supplyVoltage)){
    return {state:"blocked",message:"Wire the ideal BCD counter/decoder, clock, active-low reset, seven current-limited segments, and supply/ground rails.",validation};
  }
  const clockHigh=clockVoltage>=thresholdV,resetActive=resetVoltage<thresholdV,previous=previousState?.result,previousClockHigh=previous?.clockHigh;
  const risingEdge=previousClockHigh===false&&clockHigh;
  if(!resetActive&&clockHigh&&typeof previousClockHigh!=="boolean")return {state:"blocked",message:"Start with the clock low, then apply rising edges so each BCD count is deterministic.",validation};
  if(risingEdge&&!resetActive&&!Number.isInteger(previous?.digit))return {state:"blocked",message:"Initialize the BCD counter with active-low reset before applying clock edges.",validation};
  const digit=resetActive?0:risingEdge?(previous.digit+1)%10:Number.isInteger(previous?.digit)?previous.digit:null;
  const patterns=[[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],[0,1,1,0,0,1,1],[1,0,1,1,0,1,1],[1,0,1,1,1,1,1],[1,1,1,0,0,0,0],[1,1,1,1,1,1,1],[1,1,1,1,0,1,1]];
  const segmentsOn=digit===null?null:patterns[digit].map(Boolean);
  const segmentCurrents=segmentsOn?paths.map((p,index)=>segmentsOn[index]?Math.max(0,(supplyVoltage-p.forwardV)/p.currentR):0):Array(7).fill(0);
  return {state:"complete",engine:"Ideal BCD decade counter and seven-segment decoder",message:"Counts 0 through 9 on rising clock edges and wraps to 0; active-low reset initializes zero. Display segments are ideal static outputs. Clock timing, propagation delay, setup/hold, metastability, decoder loading, and device-specific behavior are not modeled.",result:{kind:"bcd-counter-display",supplyVoltage,logicThresholdV:thresholdV,clockVoltage,resetVoltage,clockHigh,resetActive,risingEdge,digit,bcdBits:digit===null?null:[0,1,2,3].map(bit=>Boolean(digit&(1<<bit))),segmentsOn,segmentCurrents,risingEdgeCount:(previous?.risingEdgeCount||0)+(risingEdge?1:0),mode:resetActive?"asynchronous reset":risingEdge?"count":clockHigh?"high-level hold":"low-level hold",timingAnnotation:"Setup/hold and decoder propagation behavior are not simulated."},validation};
}

function analyseFourBitCounter(project,{sources,counter,resistors,leds,ground,previousState,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(counter,"VCC");
  const supply=sources.find(v=>n(v,"+")===vccNet&&n(v,"-")===groundNet);
  const clockNet=n(counter,"CLK"),resetNet=n(counter,"RESET_N");
  const clockSource=sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===clockNet);
  const resetSource=sources.find(v=>v!==supply&&v!==clockSource&&n(v,"-")===groundNet&&n(v,"+")===resetNet);
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN;
  const clockVoltage=clockSource?voltageValue(clockSource.value):Number.NaN;
  const resetVoltage=resetSource?voltageValue(resetSource.value):Number.NaN;
  const thresholdV=supplyVoltage/2;
  const outputPaths=[0,1,2,3].map(bit=>{
    const pin=`Q${bit}`,outputNet=n(counter,pin);
    const resistor=resistors.find(r=>(n(r,"1")===outputNet||n(r,"2")===outputNet));
    const led=resistor&&leds.find(x=>((n(resistor,"1")===outputNet&&n(resistor,"2")===n(x,"A"))||(n(resistor,"2")===outputNet&&n(resistor,"1")===n(x,"A")))&&n(x,"K")===groundNet);
    const currentR=resistor?resistanceValue(resistor.value):Number.NaN,forwardV=led?forwardVoltage(led.value):Number.NaN;
    return {pin,outputNet,resistor,led,currentR,forwardV};
  });
  if(!supply||!clockSource||!resetSource||n(counter,"GND")!==groundNet
    ||outputPaths.some(p=>!p.outputNet||!p.resistor||!p.led||!Number.isFinite(p.currentR)||!Number.isFinite(p.forwardV)||p.currentR<=0||p.forwardV<=0)
    ||![supplyVoltage,clockVoltage,resetVoltage].every(Number.isFinite)||supplyVoltage<=0
    ||[clockVoltage,resetVoltage].some(v=>v<0||v>supplyVoltage)){
    return {state:"blocked",message:"Wire the ideal four-bit counter, clock, active-low reset, four current-limited bit indicators, and supply/ground rails.",validation};
  }
  const clockHigh=clockVoltage>=thresholdV,resetActive=resetVoltage<thresholdV;
  const previous=previousState?.result,previousClockHigh=previous?.clockHigh;
  const risingEdge=previousClockHigh===false&&clockHigh;
  if(!resetActive&&clockHigh&&typeof previousClockHigh!=="boolean"){
    return {state:"blocked",message:"Start with the clock low, then apply a rising edge so the simulator can identify each count transition.",validation};
  }
  if(risingEdge&&!resetActive&&!Number.isInteger(previous?.count)){
    return {state:"blocked",message:"Initialize the counter with active-low reset before applying clock edges.",validation};
  }
  let count,mode;
  if(resetActive){count=0;mode="asynchronous reset";}
  else if(risingEdge){count=(previous.count+1)&15;mode="count";}
  else{count=Number.isInteger(previous?.count)?previous.count:null;mode=clockHigh?"high-level hold":"low-level hold";}
  const bits=count===null?null:[0,1,2,3].map(bit=>Boolean(count&(1<<bit)));
  const outputCurrents=bits?outputPaths.map((p,bit)=>bits[bit]?Math.max(0,(supplyVoltage-p.forwardV)/p.currentR):0):[0,0,0,0];
  return {state:"complete",engine:"Ideal modulo-16 four-bit rising-edge counter",message:"Counts one binary step on each rising clock edge, wraps after 15, and resets asynchronously when RESET_N is low. Clock waveform details, propagation delay, metastability, setup/hold timing, and device-specific behavior are not modeled.",result:{kind:"four-bit-binary-counter",supplyVoltage,logicThresholdV:thresholdV,clockVoltage,resetVoltage,clockHigh,resetActive,risingEdge,count,bits,outputCurrents,risingEdgeCount:(previous?.risingEdgeCount||0)+(risingEdge?1:0),bitFrequencyRatios:[0.5,0.25,0.125,0.0625],mode,timingAnnotation:"Clock timing violations and metastability are not simulated."},validation};
}

function analyseJkFlipFlop(project,{sources,flipFlop,resistor,led,ground,previousState,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),supply=sources.find(v=>n(v,"-")===groundNet&&n(v,"+")!==groundNet);
  const sourceFor=(pin)=>sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===n(flipFlop,pin));
  const jSource=sourceFor("J"),kSource=sourceFor("K"),clockSource=sourceFor("CLK"),clearSource=sourceFor("CLR");
  const outputNet=n(flipFlop,"Q");
  const outputPath=(n(resistor,"1")===outputNet&&n(resistor,"2")===n(led,"A"))||(n(resistor,"2")===outputNet&&n(resistor,"1")===n(led,"A"));
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN;
  const jVoltage=jSource?voltageValue(jSource.value):Number.NaN,kVoltage=kSource?voltageValue(kSource.value):Number.NaN;
  const clockVoltage=clockSource?voltageValue(clockSource.value):Number.NaN,clearVoltage=clearSource?voltageValue(clearSource.value):Number.NaN;
  const resistance=resistanceValue(resistor.value),forwardV=forwardVoltage(led.value),thresholdV=supplyVoltage/2;
  if(!supply||!jSource||!kSource||!clockSource||!clearSource||!outputPath
    ||n(flipFlop,"VCC")!==n(supply,"+")||n(flipFlop,"GND")!==groundNet
    ||n(flipFlop,"PRE")!==n(supply,"+")||n(led,"K")!==groundNet
    ||![supplyVoltage,jVoltage,kVoltage,clockVoltage,clearVoltage,resistance,forwardV].every(Number.isFinite)
    ||supplyVoltage<=0||[jVoltage,kVoltage,clockVoltage,clearVoltage].some(v=>v<0||v>supplyVoltage)
    ||resistance<=0||forwardV<=0){
    return {state:"blocked",message:"Wire the ideal JK flip-flop, inactive preset, active-low clear input, 0–VCC J/K/clock controls, and a current-limited Q indicator.",validation};
  }
  const clockHigh=clockVoltage>=thresholdV,jHigh=jVoltage>=thresholdV,kHigh=kVoltage>=thresholdV,clearActive=clearVoltage<thresholdV;
  const previous=previousState?.result,previousClockHigh=previous?.clockHigh,previousQ=previous?.q;
  const risingEdge=previousClockHigh===false&&clockHigh;
  if(!clearActive&&clockHigh&&typeof previousClockHigh!=="boolean"){
    return {state:"blocked",message:"Start with the clock low, then apply a rising edge so the simulator can distinguish a clock transition.",validation};
  }
  if(jHigh&&kHigh&&risingEdge&&typeof previousQ!=="boolean"&&!clearActive){
    return {state:"blocked",message:"Initialize the JK flip-flop with active-low clear before using toggle mode.",validation};
  }
  let q,mode;
  if(clearActive){q=false;mode="asynchronous clear";}
  else if(risingEdge&&jHigh&&kHigh){q=!previousQ;mode="toggle";}
  else if(risingEdge&&jHigh){q=true;mode="set";}
  else if(risingEdge&&kHigh){q=false;mode="reset";}
  else{q=typeof previousQ==="boolean"?previousQ:null;mode=risingEdge?"hold on rising edge":clockHigh?"high-level hold":"low-level hold";}
  const qBar=typeof q==="boolean"?!q:null,qVoltage=q===true?supplyVoltage:0;
  const ledCurrentA=q===true?Math.max(0,(qVoltage-forwardV)/resistance):0;
  const risingEdgeCount=(previous?.risingEdgeCount||0)+(risingEdge?1:0);
  return {state:"complete",engine:"Ideal positive-edge JK flip-flop with asynchronous clear",message:"Models J/K state transitions on rising clock edges and asynchronous active-low clear. When J=K=1, Q toggles once per rising edge and the ideal output repetition rate is half the clock rate. Setup/hold timing, propagation delay, metastability and device-specific limits are not modeled.",result:{kind:"jk-toggle-divider",supplyVoltage,logicThresholdV:thresholdV,jVoltage,kVoltage,clockVoltage,clearVoltage,jHigh,kHigh,clockHigh,clearActive,risingEdge,risingEdgeCount,q,qBar,qVoltage,ledCurrentA,mode,outputToClockFrequencyRatio:jHigh&&kHigh?0.5:null,timingAnnotation:"Setup/hold violations and metastability are not simulated."},validation};
}

function analyseDFlipFlop(project,{sources,flipFlop,resistor,led,ground,previousState,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),supply=sources.find(v=>n(v,"-")===groundNet&&n(v,"+")!==groundNet);
  const dataNet=n(flipFlop,"D"),clockNet=n(flipFlop,"CLK"),qNet=n(flipFlop,"Q");
  const dataSource=sources.find(v=>v!==supply&&n(v,"-")===groundNet&&n(v,"+")===dataNet);
  const clockSource=sources.find(v=>v!==supply&&v!==dataSource&&n(v,"-")===groundNet&&n(v,"+")===clockNet);
  const outputPath=(n(resistor,"1")===qNet&&n(resistor,"2")===n(led,"A"))||(n(resistor,"2")===qNet&&n(resistor,"1")===n(led,"A"));
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN;
  const dataVoltage=dataSource?voltageValue(dataSource.value):Number.NaN;
  const clockVoltage=clockSource?voltageValue(clockSource.value):Number.NaN;
  const resistance=resistanceValue(resistor.value),forwardV=forwardVoltage(led.value),thresholdV=supplyVoltage/2;
  if(!supply||!dataSource||!clockSource||!outputPath
    ||n(flipFlop,"VCC")!==n(supply,"+")||n(flipFlop,"GND")!==groundNet
    ||n(flipFlop,"PRE")!==n(supply,"+")||n(flipFlop,"CLR")!==n(supply,"+")
    ||n(led,"K")!==groundNet
    ||![supplyVoltage,dataVoltage,clockVoltage,resistance,forwardV].every(Number.isFinite)
    ||supplyVoltage<=0||dataVoltage<0||dataVoltage>supplyVoltage||clockVoltage<0||clockVoltage>supplyVoltage
    ||resistance<=0||forwardV<=0){
    return {state:"blocked",message:"Wire the ideal positive-edge D flip-flop, inactive preset/clear pins, 0–VCC data and clock inputs, and a current-limited Q indicator.",validation};
  }
  const clockHigh=clockVoltage>=thresholdV,dataHigh=dataVoltage>=thresholdV;
  const previous=previousState?.result;
  const previousClockHigh=previous?.clockHigh;
  const previousQ=previous?.q;
  if(clockHigh&&typeof previousClockHigh!=="boolean"){
    return {state:"blocked",message:"Start with the clock low, then apply a rising edge so the simulator can distinguish a clock transition.",validation};
  }
  const risingEdge=previousClockHigh===false&&clockHigh;
  const q=risingEdge?dataHigh:(typeof previousQ==="boolean"?previousQ:null);
  const qBar=typeof q==="boolean"?!q:null;
  const qVoltage=q===true?supplyVoltage:0;
  const ledCurrentA=q===true?Math.max(0,(qVoltage-forwardV)/resistance):0;
  return {state:"complete",engine:"Ideal positive-edge D flip-flop state transition",message:"Samples D on a rising clock edge and retains Q between edges. Setup/hold timing, propagation delay, metastability, asynchronous control behavior, and device-specific limits are not modeled.",result:{kind:"d-flip-flop",supplyVoltage,logicThresholdV:thresholdV,dataVoltage,clockVoltage,dataHigh,clockHigh,risingEdge,sampled:risingEdge,q,qBar,qVoltage,ledCurrentA,mode:risingEdge?"sample":clockHigh?"high-level hold":"low-level hold",timingAnnotation:"Setup/hold violations and metastability are not simulated."},validation};
}

function analyseNorSrLatch(project,{sources,gates,resistors,leds,ground,previousState,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const [setGate,resetGate]=gates,groundNet=n(ground,"0"),qNet=n(resetGate,"Y"),qBarNet=n(setGate,"Y");
  const supply=sources.find(v=>n(v,"-")===groundNet&&n(v,"+")!==groundNet);
  const inputSourceFor=(gate)=>sources.find(v=>v!==supply&&n(v,"-")===groundNet&&([n(gate,"A"),n(gate,"B")].includes(n(v,"+"))));
  const setSource=inputSourceFor(setGate),resetSource=inputSourceFor(resetGate);
  const setSourceNet=setSource?n(setSource,"+"):undefined,resetSourceNet=resetSource?n(resetSource,"+"):undefined;
  const setFeedback=[n(setGate,"A"),n(setGate,"B")].includes(qNet),resetFeedback=[n(resetGate,"A"),n(resetGate,"B")].includes(qBarNet);
  const setPinSource=setSource&&[n(setGate,"A"),n(setGate,"B")].includes(setSourceNet)&&setSourceNet!==qBarNet;
  const resetPinSource=resetSource&&[n(resetGate,"A"),n(resetGate,"B")].includes(resetSourceNet)&&resetSourceNet!==qNet;
  const ledPath=(outputNet)=>resistors.find(r=>{const d=leds.find(x=>((n(r,"1")===outputNet&&n(r,"2")===n(x,"A"))||(n(r,"2")===outputNet&&n(r,"1")===n(x,"A")))&&n(x,"K")===groundNet);return Boolean(d);});
  const setResistor=ledPath(qNet),resetResistor=ledPath(qBarNet);
  const setLed=setResistor&&leds.find(x=>(n(setResistor,"1")===qNet&&n(setResistor,"2")===n(x,"A")||n(setResistor,"2")===qNet&&n(setResistor,"1")===n(x,"A"))&&n(x,"K")===groundNet);
  const resetLed=resetResistor&&leds.find(x=>(n(resetResistor,"1")===qBarNet&&n(resetResistor,"2")===n(x,"A")||n(resetResistor,"2")===qBarNet&&n(resetResistor,"1")===n(x,"A"))&&n(x,"K")===groundNet);
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN;
  const setVoltage=setSource?voltageValue(setSource.value):Number.NaN,resetVoltage=resetSource?voltageValue(resetSource.value):Number.NaN;
  const setCurrent=setResistor?resistanceValue(setResistor.value):Number.NaN,resetCurrent=resetResistor?resistanceValue(resetResistor.value):Number.NaN;
  const setVf=setLed?forwardVoltage(setLed.value):Number.NaN,resetVf=resetLed?forwardVoltage(resetLed.value):Number.NaN;
  const thresholdV=supplyVoltage/2;
  if(!supply||!setSource||!resetSource||!setFeedback||!resetFeedback||!setPinSource||!resetPinSource
    ||n(setGate,"VCC")!==n(supply,"+")||n(resetGate,"VCC")!==n(supply,"+")
    ||n(setGate,"GND")!==groundNet||n(resetGate,"GND")!==groundNet
    ||!setResistor||!resetResistor||!setLed||!resetLed
    ||![supplyVoltage,setVoltage,resetVoltage,setCurrent,resetCurrent,setVf,resetVf].every(Number.isFinite)
    ||supplyVoltage<=0||setVoltage<0||resetVoltage<0||setVoltage>supplyVoltage||resetVoltage>supplyVoltage
    ||setCurrent<=0||resetCurrent<=0||setVf<=0||resetVf<=0){
    return {state:"blocked",message:"Wire two cross-coupled NOR gates, active-high set/reset inputs, and separate current-limited Q/Q̅ indicators.",validation};
  }
  const setActive=setVoltage>=thresholdV,resetActive=resetVoltage>=thresholdV;
  if(setActive&&resetActive)return {state:"blocked",message:"The NOR SR latch forbids set and reset being asserted at the same time.",validation};
  let q;
  if(setActive)q=true;
  else if(resetActive)q=false;
  else{
    const retained=previousState?.result?.q??previousState?.q;
    if(typeof retained!=="boolean")return {state:"blocked",message:"The latch is in hold mode without a known prior state; apply set or reset first.",validation};
    q=retained;
  }
  const qBar=!q,qVoltage=q?supplyVoltage:0,qBarVoltage=qBar?supplyVoltage:0;
  const qLedCurrentA=q?Math.max(0,(qVoltage-setVf)/setCurrent):0;
  const qBarLedCurrentA=qBar?Math.max(0,(qBarVoltage-resetVf)/resetCurrent):0;
  return {state:"complete",engine:"Cross-coupled NOR SR latch with memory",message:"Models an active-high NOR latch with state retention when both inputs are low and explicitly blocks the prohibited set/reset combination. Gates are ideal and static; propagation delay, metastability, input switch bounce, output drive limits, and part-specific behavior are omitted.",result:{kind:"nor-sr-latch",supplyVoltage,logicThresholdV:thresholdV,setVoltage,resetVoltage,setActive,resetActive,q,qBar,qVoltage,qBarVoltage,qLedCurrentA,qBarLedCurrentA,mode:setActive?"set":resetActive?"reset":"hold"},validation};
}

function analyseLogicGateTruthTable(project,{sources,gate,resistor,led,ground,validation,logic="and"}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(gate,"VCC"),outputNet=n(gate,"Y");
  const supply=sources.find(v=>n(v,"+")===vccNet&&n(v,"-")===groundNet);
  const inputA=sources.find(v=>v!==supply&&n(v,"+")===n(gate,"A")&&n(v,"-")===groundNet);
  const inputB=sources.find(v=>v!==supply&&v!==inputA&&n(v,"+")===n(gate,"B")&&n(v,"-")===groundNet);
  const resistorWired=(n(resistor,"1")===outputNet&&n(resistor,"2")===n(led,"A"))||(n(resistor,"2")===outputNet&&n(resistor,"1")===n(led,"A"));
  const supplyVoltage=supply?voltageValue(supply.value):Number.NaN;
  const inputAVoltage=inputA?voltageValue(inputA.value):Number.NaN,inputBVoltage=inputB?voltageValue(inputB.value):Number.NaN;
  const r=resistanceValue(resistor.value),vf=forwardVoltage(led.value),logicThresholdV=supplyVoltage/2;
  if(!supply||!inputA||!inputB||n(gate,"GND")!==groundNet||n(led,"K")!==groundNet||!resistorWired
    ||![supplyVoltage,inputAVoltage,inputBVoltage,r,vf].every(Number.isFinite)
    ||supplyVoltage<=0||inputAVoltage<0||inputBVoltage<0||inputAVoltage>supplyVoltage||inputBVoltage>supplyVoltage||r<=0||vf<=0){
    return {state:"blocked",message:`Wire a two-input ${logic.toUpperCase()} gate, three grounded low-voltage sources, and a current-limited LED output path.`,validation};
  }
  const inputAHigh=inputAVoltage>=logicThresholdV,inputBHigh=inputBVoltage>=logicThresholdV;
  const outputHigh=logic==="or"?inputAHigh||inputBHigh:logic==="xor"?inputAHigh!==inputBHigh:inputAHigh&&inputBHigh,outputVoltage=outputHigh?supplyVoltage:0;
  const ledCurrentA=outputHigh?Math.max(0,(outputVoltage-vf)/r):0;
  return {state:"complete",engine:`Ideal static two-input ${logic.toUpperCase()} truth-table estimate`,message:"Uses a 50% supply-voltage threshold and an ideal rail-to-rail logic output. LED current is estimated with a fixed forward voltage and resistor; propagation delay, output-current limit, input leakage, logic-family thresholds, and manufacturer-specific behavior are omitted.",result:{kind:`${logic}-gate-truth-table`,supplyVoltage,logicThresholdV,inputAVoltage,inputBVoltage,inputAHigh,inputBHigh,outputHigh,outputVoltage,ledOn:ledCurrentA>0,ledCurrentA},validation};
}

function analyseWienBridgeOscillator(project,{sources,opAmp,resistors,capacitors,diodes,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),outputNet=n(opAmp,"OUT"),nonInvertingNet=n(opAmp,"+"),invertingNet=n(opAmp,"-");
  const positiveRail=sources.find(v=>n(v,"-")===groundNet&&n(v,"+")!==groundNet);
  const negativeRail=sources.find(v=>n(v,"+")===groundNet&&n(v,"-")!==groundNet);
  const seriesCap=capacitors.find(c=>n(c,"1")===outputNet||n(c,"2")===outputNet);
  const seriesMid=seriesCap?([n(seriesCap,"1"),n(seriesCap,"2")].find(net=>net!==outputNet)):undefined;
  const shuntCap=capacitors.find(c=>c!==seriesCap&&((n(c,"1")===nonInvertingNet&&n(c,"2")===groundNet)||(n(c,"2")===nonInvertingNet&&n(c,"1")===groundNet)));
  const seriesResistor=resistors.find(r=>seriesMid&&((n(r,"1")===seriesMid&&n(r,"2")===nonInvertingNet)||(n(r,"2")===seriesMid&&n(r,"1")===nonInvertingNet)));
  const shuntResistor=resistors.find(r=>r!==seriesResistor&&((n(r,"1")===nonInvertingNet&&n(r,"2")===groundNet)||(n(r,"2")===nonInvertingNet&&n(r,"1")===groundNet)));
  const feedback=resistors.find(r=>(n(r,"1")===outputNet&&n(r,"2")===invertingNet)||(n(r,"2")===outputNet&&n(r,"1")===invertingNet));
  const gainLeg=resistors.find(r=>r!==feedback&&r!==seriesResistor&&r!==shuntResistor&&((n(r,"1")===invertingNet&&n(r,"2")===groundNet)||(n(r,"2")===invertingNet&&n(r,"1")===groundNet)));
  const rSeries=seriesResistor?resistanceValue(seriesResistor.value):Number.NaN,rShunt=shuntResistor?resistanceValue(shuntResistor.value):Number.NaN;
  const cSeries=seriesCap?capacitanceValue(seriesCap.value):Number.NaN,cShunt=shuntCap?capacitanceValue(shuntCap.value):Number.NaN;
  const rFeedback=feedback?resistanceValue(feedback.value):Number.NaN,rGain=gainLeg?resistanceValue(gainLeg.value):Number.NaN;
  const diodeDrop=diodes.length===2?forwardVoltage(diodes[0].value):Number.NaN;
  const positiveVoltage=positiveRail?voltageValue(positiveRail.value):Number.NaN,negativeVoltage=negativeRail?voltageValue(negativeRail.value):Number.NaN;
  const diodePair=diodes.length===2&&diodes.every(d=>(n(d,"A")===outputNet&&n(d,"K")===invertingNet)||(n(d,"K")===outputNet&&n(d,"A")===invertingNet))
    &&((n(diodes[0],"A")===outputNet&&n(diodes[1],"K")===outputNet)||(n(diodes[1],"A")===outputNet&&n(diodes[0],"K")===outputNet));
  const powered=positiveRail&&negativeRail&&n(opAmp,"VCC")===n(positiveRail,"+")&&n(opAmp,"VEE")===n(negativeRail,"-");
  const symmetrical=Math.abs(rSeries-rShunt)/Math.max(rSeries,rShunt)<=0.05&&Math.abs(cSeries-cShunt)/Math.max(cSeries,cShunt)<=0.05;
  if(!powered||!seriesCap||!seriesResistor||!shuntResistor||!shuntCap||!feedback||!gainLeg||!diodePair
    ||![rSeries,rShunt,cSeries,cShunt,rFeedback,rGain,diodeDrop,positiveVoltage,negativeVoltage].every(Number.isFinite)
    ||rSeries<=0||rShunt<=0||cSeries<=0||cShunt<=0||rFeedback<=0||rGain<=0||diodeDrop<=0||positiveVoltage<=0||negativeVoltage<=0
    ||!symmetrical){
    return {state:"blocked",message:"Wire a balanced Wien RC bridge to the non-inverting input, gain network and anti-parallel limiter diodes to the inverting input, and valid dual op-amp rails.",validation};
  }
  const frequencyHz=1/(2*Math.PI*Math.sqrt(rSeries*rShunt*cSeries*cShunt));
  const bridgeAttenuation=1/3,amplifierGain=1+rFeedback/rGain,loopGain=amplifierGain*bridgeAttenuation;
  const oscillationStarts=loopGain>1;
  const amplitudeLimitV=oscillationStarts?diodeDrop*(rFeedback+rGain)/rFeedback:0;
  if(amplitudeLimitV>=Math.min(positiveVoltage,negativeVoltage)){
    return {state:"blocked",message:"The diode-limited oscillator amplitude reaches an op-amp supply rail.",validation};
  }
  return {state:"complete",engine:"Wien bridge start-up and diode-limited amplitude estimate",message:"Uses the symmetric-bridge frequency, small-signal loop-gain start-up criterion, and an approximate anti-parallel Schottky feedback clamp. The estimated steady amplitude is a limiter threshold, not a nonlinear time-domain SPICE solution. Noise/start-up time, waveform distortion, op-amp bandwidth/slew, diode curve, loading, tolerances, and device limits are omitted.",result:{kind:"wien-bridge-oscillator",frequencyHz,bridgeAttenuation,amplifierGain,loopGain,oscillationStarts,amplitudeLimitV,estimatedSteadyAmplitudeV:amplitudeLimitV,limiterDiodeDropV:diodeDrop,phaseAtResonanceDeg:0,outputWithinSupplyRails:amplitudeLimitV<Math.min(positiveVoltage,negativeVoltage)},validation};
}

function analyseActiveLowPass(project,{sources,input,opAmp,resistors,capacitor,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),positiveRail=sources.find(v=>n(v,"-")===groundNet&&n(v,"+")!==groundNet);
  const negativeRail=sources.find(v=>n(v,"+")===groundNet&&n(v,"-")!==groundNet);
  const inputNet=n(input,"+"),nonInvertingNet=n(opAmp,"+"),invertingNet=n(opAmp,"-"),outputNet=n(opAmp,"OUT");
  const inputResistor=resistors.find(r=>(n(r,"1")===inputNet&&n(r,"2")===nonInvertingNet)||(n(r,"2")===inputNet&&n(r,"1")===nonInvertingNet));
  const capacitorWired=(n(capacitor,"1")===nonInvertingNet&&n(capacitor,"2")===groundNet)||(n(capacitor,"2")===nonInvertingNet&&n(capacitor,"1")===groundNet);
  const feedback=resistors.find(r=>(n(r,"1")===outputNet&&n(r,"2")===invertingNet)||(n(r,"2")===outputNet&&n(r,"1")===invertingNet));
  const gainLeg=resistors.find(r=>r!==inputResistor&&r!==feedback&&((n(r,"1")===invertingNet&&n(r,"2")===groundNet)||(n(r,"2")===invertingNet&&n(r,"1")===groundNet)));
  const rInput=inputResistor?resistanceValue(inputResistor.value):Number.NaN,rFeedback=feedback?resistanceValue(feedback.value):Number.NaN;
  const rGain=gainLeg?resistanceValue(gainLeg.value):Number.NaN,c=capacitanceValue(capacitor.value);
  const inputAmplitudeV=voltageValue(input.value),positiveVoltage=positiveRail?voltageValue(positiveRail.value):Number.NaN,negativeVoltage=negativeRail?voltageValue(negativeRail.value):Number.NaN;
  const wired=positiveRail&&negativeRail&&n(opAmp,"VCC")===n(positiveRail,"+")&&n(opAmp,"VEE")===n(negativeRail,"-")
    &&n(input,"-")===groundNet&&inputResistor&&capacitorWired&&feedback&&gainLeg;
  if(!wired||![rInput,rFeedback,rGain,c,inputAmplitudeV,positiveVoltage,negativeVoltage].every(Number.isFinite)
    ||rInput<=0||rFeedback<=0||rGain<=0||c<=0||inputAmplitudeV<=0||positiveVoltage<=0||negativeVoltage<=0){
    return {state:"blocked",message:"Wire a series input resistor, capacitor to ground, non-inverting op-amp, and negative-feedback resistor pair to valid dual rails.",validation};
  }
  const cutoffHz=1/(2*Math.PI*rInput*c),passbandGain=1+rFeedback/rGain;
  const response=[cutoffHz/10,cutoffHz,cutoffHz*10].map(f=>{
    const gain=passbandGain/Math.sqrt(1+(f/cutoffHz)*(f/cutoffHz));
    return {frequencyHz:f,gain,outputAmplitudeV:inputAmplitudeV*gain};
  });
  const maximumOutputAmplitudeV=inputAmplitudeV*passbandGain;
  if(maximumOutputAmplitudeV>=Math.min(positiveVoltage,negativeVoltage)){
    return {state:"blocked",message:"The active low-pass passband amplitude reaches an op-amp supply rail; reduce input or gain.",validation};
  }
  return {state:"complete",engine:"First-order RC active low-pass and ideal non-inverting gain estimate",message:"Combines a first-order RC input low-pass with an ideal non-inverting op-amp gain. It omits op-amp bandwidth, slew rate, noise, output loading, parasitics, and device-specific limits.",result:{kind:"active-low-pass",inputAmplitudeV,inputResistanceOhm:rInput,capacitanceF:c,cutoffHz,passbandGain,feedbackResistanceOhm:rFeedback,gainResistanceOhm:rGain,response,maximumOutputAmplitudeV},validation};
}

function analyseAudioPowerAmplifier(project,{source,input,amplifier,coupling,speaker,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(source,"+"),outputNet=n(amplifier,"OUT");
  const fields=String(amplifier.value).match(/Av\s*([^;]+)\s*;\s*Swing\s*([^;]+)\s*;\s*Q\s*([^;]+)\s*;\s*f\s*(.+)/i);
  const speakerFields=String(speaker.value).match(/R\s*([^;]+)\s*;\s*L\s*(.+)/i);
  const gain=fields?Number(fields[1]):Number.NaN,swing=fields?voltageValue(fields[2]):Number.NaN;
  const quiescentCurrent=fields?currentValue(fields[3]):Number.NaN,frequencyHz=fields?frequencyValue(fields[4]):Number.NaN;
  const inputAmplitudeV=voltageValue(input.value),supplyVoltage=voltageValue(source.value);
  const couplingCapacitance=capacitanceValue(coupling.value);
  const speakerResistance=speakerFields?resistanceValue(speakerFields[1]):Number.NaN;
  const speakerInductance=speakerFields?inductanceValue(speakerFields[2]):Number.NaN;
  const amplifierWired=n(source,"-")===groundNet&&n(amplifier,"VCC")===vccNet&&n(amplifier,"GND")===groundNet
    &&n(input,"+")===n(amplifier,"IN")&&n(input,"-")===groundNet;
  const outputWired=(n(coupling,"1")===outputNet&&n(coupling,"2")===n(speaker,"+"))
    ||(n(coupling,"2")===outputNet&&n(coupling,"1")===n(speaker,"+"));
  if(!amplifierWired||!outputWired||n(speaker,"-")!==groundNet
    ||![gain,swing,quiescentCurrent,frequencyHz,inputAmplitudeV,supplyVoltage,couplingCapacitance,speakerResistance,speakerInductance].every(Number.isFinite)
    ||gain<=0||swing<=0||quiescentCurrent<0||frequencyHz<=0||inputAmplitudeV<=0||supplyVoltage<=0||couplingCapacitance<=0||speakerResistance<=0||speakerInductance<0){
    return {state:"blocked",message:"Wire a low-voltage audio amplifier, AC input, output coupling capacitor, and positive R-L speaker load to a common ground.",validation};
  }
  const biasVoltageV=supplyVoltage/2;
  if(biasVoltageV-swing<0||biasVoltageV+swing>supplyVoltage){
    return {state:"blocked",message:"The configured amplifier output swing exceeds its single-supply range.",validation};
  }
  const requestedOutputAmplitudeV=inputAmplitudeV*gain;
  const clipped=requestedOutputAmplitudeV>swing;
  const amplifierOutputAmplitudeV=Math.min(requestedOutputAmplitudeV,swing);
  const omega=2*Math.PI*frequencyHz,xSpeaker=omega*speakerInductance,xCoupling=1/(omega*couplingCapacitance);
  const speakerImpedanceOhm=Math.sqrt(speakerResistance*speakerResistance+xSpeaker*xSpeaker);
  const totalImpedanceOhm=Math.sqrt(speakerResistance*speakerResistance+(xSpeaker-xCoupling)*(xSpeaker-xCoupling));
  const couplingGain=speakerImpedanceOhm/totalImpedanceOhm;
  const speakerVoltagePeakV=amplifierOutputAmplitudeV*couplingGain;
  const speakerVoltageRmsV=speakerVoltagePeakV/Math.SQRT2;
  const speakerCurrentRmsA=speakerVoltageRmsV/speakerImpedanceOhm;
  const speakerRealPowerW=speakerCurrentRmsA*speakerCurrentRmsA*speakerResistance;
  const frequencyResponse=[20,1000,20000].map(f=>{
    const w=2*Math.PI*f,xl=w*speakerInductance,xc=1/(w*couplingCapacitance);
    const zSpeaker=Math.sqrt(speakerResistance*speakerResistance+xl*xl);
    const zTotal=Math.sqrt(speakerResistance*speakerResistance+(xl-xc)*(xl-xc));
    return {frequencyHz:f,gain:zSpeaker/zTotal};
  });
  return {state:"complete",engine:"Generic low-voltage class-AB amplifier and R-L speaker estimate",message:"Models configurable voltage gain and output swing, a single-supply midpoint bias, a series output coupling capacitor, and a nominal speaker R-L load. It reports a sinusoidal fundamental and real load power only. It does not calculate THD, compression, slew, output-stage current limiting, mechanical sound, thermal behavior, or manufacturer-specific LM386 performance.",result:{kind:"audio-power-amplifier",supplyVoltage,inputAmplitudeV,frequencyHz,gainVPerV:gain,requestedOutputAmplitudeV,amplifierOutputAmplitudeV,clipped,clippingWarning:clipped?"Input exceeds the configured output swing; distortion is not modeled.":null,outputBiasVoltageV:biasVoltageV,quiescentCurrentA:quiescentCurrent,speakerResistanceOhm:speakerResistance,speakerInductanceH:speakerInductance,couplingCapacitanceF:couplingCapacitance,couplingGain,speakerImpedanceOhm,speakerVoltagePeakV,speakerVoltageRmsV,speakerCurrentRmsA,speakerRealPowerW,frequencyResponse},validation};
}

function analysePwmDac(project,{source,settings,pwm,report,resistors,capacitor,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,String(pin))),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const config=fields(settings.value),pwmConfig=fields(pwm.value),frequencyHz=frequencyValue(field(config,"Frequency")??""),dutyPercent=Number((field(config,"Duty")??"").replace(/%$/,"")),logicVoltage=voltageValue(field(config,"Vlogic")??"");
  const supplyVoltage=voltageValue(source.value),seriesResistor=resistors.find(part=>n(part,"1")===n(pwm,"OUT")||n(part,"2")===n(pwm,"OUT")),loadResistor=resistors.find(part=>part!==seriesResistor);
  const seriesOhm=seriesResistor?resistanceValue(seriesResistor.value):Number.NaN,loadOhm=loadResistor?resistanceValue(loadResistor.value):Number.NaN,capacitance=capacitanceValue(capacitor.value);
  const nodeNet=seriesResistor?(n(seriesResistor,"1")===n(pwm,"OUT")?n(seriesResistor,"2"):n(seriesResistor,"1")):undefined,groundNet=n(ground,"0"),vccNet=n(source,"+");
  const topology=n(settings,"CONFIG")===n(pwm,"CONFIG")&&nodeNet===n(report,"IN")&&nodeNet===n(capacitor,"1")||nodeNet===n(capacitor,"2");
  const loadWired=loadResistor&&((n(loadResistor,"1")===nodeNet&&n(loadResistor,"2")===groundNet)||(n(loadResistor,"2")===nodeNet&&n(loadResistor,"1")===groundNet));
  const capWired=(n(capacitor,"1")===nodeNet&&n(capacitor,"2")===groundNet)||(n(capacitor,"2")===nodeNet&&n(capacitor,"1")===groundNet);
  const powerWired=n(source,"-")===groundNet&&n(pwm,"VCC")===vccNet&&n(report,"VCC")===vccNet&&n(pwm,"GND")===groundNet&&n(report,"GND")===groundNet&&n(settings,"GND")===groundNet;
  const required=[n(source,"+"),groundNet,n(settings,"CONFIG"),n(settings,"GND"),n(pwm,"CONFIG"),n(pwm,"OUT"),n(pwm,"VCC"),n(pwm,"GND"),n(report,"IN"),n(report,"VCC"),n(report,"GND"),n(seriesResistor,"1"),n(seriesResistor,"2"),n(loadResistor,"1"),n(loadResistor,"2"),n(capacitor,"1"),n(capacitor,"2")];
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<3||supplyVoltage>12||Math.abs(logicVoltage-supplyVoltage)>1e-9||!powerWired||!topology||!loadWired||!capWired||required.some(net=>typeof net!=="string"||!net)||!Number.isFinite(frequencyHz)||frequencyHz<100||frequencyHz>100000||!Number.isFinite(dutyPercent)||dutyPercent<1||dutyPercent>99||!Number.isFinite(seriesOhm)||seriesOhm<100||seriesOhm>100000||!Number.isFinite(loadOhm)||loadOhm<10000||loadOhm>1000000||!Number.isFinite(capacitance)||capacitance<1e-7||capacitance>1e-3||field(pwmConfig,"Mode")!=="PWM"||field(pwmConfig,"ActiveHigh")!=="true"){
    return {state:"blocked",message:"Connect the PWM source through a 100 Ω–100 kΩ series resistor to the reported RC node, add a 10 kΩ–1 MΩ load and 0.1–1000 µF filter capacitor to ground, and use bounded frequency, duty and matching logic rails.",validation};
  }
  const rThevenin=seriesOhm*loadOhm/(seriesOhm+loadOhm),timeConstantSeconds=rThevenin*capacitance,periodSeconds=1/frequencyHz,highSeconds=periodSeconds*dutyPercent/100,lowSeconds=periodSeconds-highSeconds,highTargetV=supplyVoltage*loadOhm/(seriesOhm+loadOhm),decay=Math.exp(-periodSeconds/timeConstantSeconds),riseFactor=-Math.expm1(-highSeconds/timeConstantSeconds),riseV=highTargetV*riseFactor/(1-decay),valleyV=riseV*Math.exp(-lowSeconds/timeConstantSeconds),rippleVpp=riseV-valleyV,averageOutputV=highTargetV*dutyPercent/100;
  const responseTrace=Array.from({length:128},(_,index)=>{const t=periodSeconds*index/127,phase=t<highSeconds?"high":"low",voltage=phase==="high"?valleyV+(highTargetV-valleyV)*(1-Math.exp(-t/timeConstantSeconds)):riseV*Math.exp(-(t-highSeconds)/timeConstantSeconds);return {timeSeconds:t,phase,voltageV:voltage};});
  return {state:"complete",engine:"Ideal PWM-to-RC average and steady-state ripple estimate",message:"Estimates a loaded first-order RC filter's steady-state average and periodic ripple for an ideal PWM source, including load-divider attenuation. PWM edge time, capacitor ESR/leakage, component tolerances, noise, DAC accuracy, firmware, and physical behavior are not modeled.",result:{kind:"pwm-audio-dac",frequencyHz,dutyCyclePercent:dutyPercent,logicVoltageV:supplyVoltage,seriesResistanceOhm:seriesOhm,loadResistanceOhm:loadOhm,capacitanceF:capacitance,averageOutputV,rippleVpp,highPeakV:riseV,lowValleyV:valleyV,timeConstantSeconds,tracksDutyCycle:Math.abs(averageOutputV-highTargetV*dutyPercent/100)<1e-12,responseTrace,firmwareExecuted:false},validation};
}
function analyseAudioMixer(project,{source,fixture,buffer,report,resistors,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,String(pin))),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const fixtureFields=fields(fixture.value),bufferFields=fields(buffer.value),v1=voltageValue(field(fixtureFields,"V1")??""),v2=voltageValue(field(fixtureFields,"V2")??"");
  const input1Resistor=resistors.find(part=>n(part,"1")===n(fixture,"IN1")||n(part,"2")===n(fixture,"IN1")),input2Resistor=resistors.find(part=>part!==input1Resistor&&(n(part,"1")===n(fixture,"IN2")||n(part,"2")===n(fixture,"IN2")));
  const r1=input1Resistor?resistanceValue(input1Resistor.value):Number.NaN,r2=input2Resistor?resistanceValue(input2Resistor.value):Number.NaN,gain=Number(field(bufferFields,"Gain")),supplyVoltage=voltageValue(source.value),groundNet=n(ground,"0"),vccNet=n(source,"+");
  const sumNet=n(buffer,"IN"),sumWired=(n(input1Resistor,"1")===sumNet||n(input1Resistor,"2")===sumNet)&&(n(input2Resistor,"1")===sumNet||n(input2Resistor,"2")===sumNet);
  const branchWired=(n(input1Resistor,"1")===n(fixture,"IN1")||n(input1Resistor,"2")===n(fixture,"IN1"))&&(n(input2Resistor,"1")===n(fixture,"IN2")||n(input2Resistor,"2")===n(fixture,"IN2"));
  const outputWired=n(buffer,"OUT")===n(report,"IN"),powered=n(source,"-")===groundNet&&n(buffer,"VCC")===vccNet&&n(report,"VCC")===vccNet&&n(buffer,"GND")===groundNet&&n(report,"GND")===groundNet&&n(fixture,"GND")===groundNet;
  const required=[groundNet,vccNet,n(fixture,"IN1"),n(fixture,"IN2"),n(fixture,"GND"),n(buffer,"IN"),n(buffer,"OUT"),n(buffer,"VCC"),n(buffer,"GND"),n(report,"IN"),n(report,"VCC"),n(report,"GND"),n(input1Resistor,"1"),n(input1Resistor,"2"),n(input2Resistor,"1"),n(input2Resistor,"2")];
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<3||supplyVoltage>12||!powered||!outputWired||!sumWired||!branchWired||required.some(net=>typeof net!=="string"||!net)||!Number.isFinite(v1)||v1<0||v1>5.5||!Number.isFinite(v2)||v2<0||v2>5.5||!Number.isFinite(r1)||r1<1000||r1>100000||!Number.isFinite(r2)||r2<1000||r2>100000||!Number.isFinite(gain)||gain<0.95||gain>1.05||field(bufferFields,"Mode")!=="unity buffer"){
    return {state:"blocked",message:"Connect both source branches through bounded summing resistors to the shared buffer input and report; use non-negative source levels, resistors from 1–100 kΩ, a unity buffer, and valid supply wiring.",validation};
  }
  const conductance1=1/r1,conductance2=1/r2,weight1=conductance1/(conductance1+conductance2),weight2=conductance2/(conductance1+conductance2),sumNodeV=(v1*conductance1+v2*conductance2)/(conductance1+conductance2),outputV=sumNodeV*gain,clipped=outputV<0.2||outputV>supplyVoltage-0.2;
  if(clipped)return {state:"blocked",message:"The weighted mixer output exceeds the ideal buffer's 0.2 V rail headroom; lower the source levels or adjust the supply.",validation};
  return {state:"complete",engine:"Two-source resistive weighted mixer and ideal unity buffer",message:"Computes the loaded summing-node voltage from two explicit source voltages and series resistors, then applies an ideal unity buffer. This is a passive weighted average, not an inverting active summing amplifier; source output impedance, noise, frequency response, op-amp limits, and physical behavior are not modeled.",result:{kind:"audio-summing-mixer",input1V:v1,input2V:v2,resistor1Ohm:r1,resistor2Ohm:r2,weight1,weight2,sumNodeV,outputV,clipped:false,sourceCombinationsTested:3,firmwareExecuted:false},validation};
}
function analyseGuitarBuffer(project,{source,fixture,buffer,report,resistors,capacitor,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,String(pin))),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const fixtureFields=fields(fixture.value),bufferFields=fields(buffer.value);
  const frequencies=(field(fixtureFields,"FrequenciesHz")??"").split(",").map(value=>Number(value.trim())),amplitudeV=voltageValue(field(fixtureFields,"AmplitudeV")??""),sourceResistance=resistanceValue(field(fixtureFields,"SourceResistance")??""),loadResistance=resistanceValue(field(fixtureFields,"LoadResistance")??"");
  const seriesResistor=resistors.find(part=>n(part,"1")===n(fixture,"OUT")||n(part,"2")===n(fixture,"OUT")),loadResistor=resistors.find(part=>part!==seriesResistor);
  const seriesOhm=seriesResistor?resistanceValue(seriesResistor.value):Number.NaN,loadOhm=loadResistor?resistanceValue(loadResistor.value):Number.NaN,couplingF=capacitanceValue(capacitor.value),inputResistance=resistanceValue(field(bufferFields,"Rin")??""),outputResistance=resistanceValue(field(bufferFields,"Rout")??""),inputCapacitance=capacitanceValue(field(bufferFields,"Cin")??""),gain=Number(field(bufferFields,"Gain"));
  const supplyVoltage=voltageValue(source.value),groundNet=n(ground,"0"),vccNet=n(source,"+");
  const sourcePath=n(fixture,"OUT")===n(seriesResistor,"1")||n(fixture,"OUT")===n(seriesResistor,"2");
  const seriesToCap=(n(seriesResistor,"1")===n(fixture,"OUT")?n(seriesResistor,"2"):n(seriesResistor,"1"));
  const capToBuffer=(n(capacitor,"1")===seriesToCap&&n(capacitor,"2")===n(buffer,"IN"))||(n(capacitor,"2")===seriesToCap&&n(capacitor,"1")===n(buffer,"IN"));
  const loadWired=(n(loadResistor,"1")===n(buffer,"OUT")&&n(loadResistor,"2")===groundNet)||(n(loadResistor,"2")===n(buffer,"OUT")&&n(loadResistor,"1")===groundNet);
  const powered=n(source,"-")===groundNet&&n(buffer,"VCC")===vccNet&&n(report,"VCC")===vccNet&&n(buffer,"GND")===groundNet&&n(report,"GND")===groundNet&&n(fixture,"GND")===groundNet;
  const signalPath=n(buffer,"OUT")===n(report,"IN");
  const required=[groundNet,vccNet,n(fixture,"OUT"),n(fixture,"GND"),n(buffer,"IN"),n(buffer,"OUT"),n(report,"IN"),n(buffer,"VCC"),n(report,"VCC"),n(buffer,"GND"),n(report,"GND"),n(capacitor,"1"),n(capacitor,"2"),n(seriesResistor,"1"),n(seriesResistor,"2"),n(loadResistor,"1"),n(loadResistor,"2")];
  const sorted=frequencies.length>=3&&frequencies.length<=64&&frequencies.every((value,index)=>Number.isFinite(value)&&value>=20&&value<=20000&&(!index||value>frequencies[index-1]));
  const configuredSource=Math.abs(seriesOhm-sourceResistance)<=Math.max(1,sourceResistance*0.05),configuredLoad=Math.abs(loadOhm-loadResistance)<=Math.max(1,loadResistance*0.05);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<3||supplyVoltage>12||!powered||!signalPath||!sourcePath||!capToBuffer||!loadWired||required.some(net=>typeof net!=="string"||!net)||!sorted||!Number.isFinite(amplitudeV)||amplitudeV<=0||amplitudeV>2||!Number.isFinite(sourceResistance)||sourceResistance<1000||sourceResistance>50000||!configuredSource||!Number.isFinite(loadResistance)||loadResistance<10000||loadResistance>1000000||!configuredLoad||!Number.isFinite(couplingF)||couplingF<1e-9||couplingF>1e-5||!Number.isFinite(inputResistance)||inputResistance<500000||inputResistance>10000000||!Number.isFinite(outputResistance)||outputResistance<10||outputResistance>10000||!Number.isFinite(inputCapacitance)||inputCapacitance<1e-12||inputCapacitance>1e-8||!Number.isFinite(gain)||gain<0.8||gain>1.2||field(bufferFields,"Mode")!=="source follower"){
    return {state:"blocked",message:"Connect the pickup through its source resistor and coupling capacitor to a high-impedance follower, then to the specified load and report; use bounded audio-band sweep and realistic resistance/capacitance values.",validation};
  }
  const points=frequencies.map(frequencyHz=>{
    const omega=2*Math.PI*frequencyHz,seriesPlusInput=sourceResistance+inputResistance,highPass=inputResistance/Math.sqrt(seriesPlusInput*seriesPlusInput+Math.pow(1/(omega*couplingF),2)),thevenin=sourceResistance*inputResistance/seriesPlusInput,parasiticLowPass=1/Math.sqrt(1+Math.pow(omega*thevenin*inputCapacitance,2)),loadFactor=loadResistance/(loadResistance+outputResistance),gainRatio=highPass*parasiticLowPass*gain*loadFactor;
    return {frequencyHz,gainRatio,outputPeakV:amplitudeV*gainRatio,highPassMagnitude:highPass,parasiticLowPassMagnitude:parasiticLowPass};
  });
  const mid=points.reduce((best,item)=>Math.abs(item.frequencyHz-1000)<Math.abs(best.frequencyHz-1000)?item:best,points[0]);
  return {state:"complete",engine:"Ideal guitar pickup and JFET buffer AC estimate",message:"Estimates a series-coupled guitar pickup source driving a high-input-impedance follower and finite output load, including coupling-capacitor high-pass response and input-capacitance roll-off. Pickup inductance/resonance, cable capacitance, device noise, JFET bias/transfer curves, clipping, tone controls, and physical hardware are not modeled.",result:{kind:"guitar-buffer-response",frequenciesHz:frequencies,sourceResistanceOhm:sourceResistance,inputResistanceOhm:inputResistance,inputImpedanceRatio:inputResistance/sourceResistance,couplingCapacitanceF:couplingF,outputLoadOhm:loadResistance,midbandFrequencyHz:mid.frequencyHz,midbandGainRatio:mid.gainRatio,responsePoints:points,highInputImpedance:inputResistance>=500000,unityGainInBand:mid.gainRatio>=0.9&&mid.gainRatio<=1.1,firmwareExecuted:false},validation};
}
function analyseAudioTone(project,{source,settings,generator,report,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,String(pin))),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const config=fields(settings.value),waveform=field(config,"Waveform"),frequencyHz=frequencyValue(field(config,"Frequency")??""),amplitudeV=voltageValue(field(config,"Amplitude")??""),offsetV=voltageValue(field(config,"Offset")??""),sampleRateHz=frequencyValue(field(config,"SampleRate")??""),durationMs=Number(String(field(config,"Duration")??"").replace(/\s*ms$/i,"")),durationSeconds=durationMs/1000;
  const supplyVoltage=voltageValue(source.value),groundNet=n(ground,"0"),vccNet=n(source,"+");
  const powered=n(source,"-")===groundNet&&n(generator,"VCC")===vccNet&&n(report,"VCC")===vccNet&&n(generator,"GND")===groundNet&&n(report,"GND")===groundNet&&n(settings,"GND")===groundNet;
  const signalPath=n(settings,"CONFIG")===n(generator,"CONFIG")&&n(generator,"OUT")===n(report,"IN");
  const required=[groundNet,vccNet,n(settings,"CONFIG"),n(settings,"GND"),n(generator,"CONFIG"),n(generator,"OUT"),n(generator,"VCC"),n(generator,"GND"),n(report,"IN"),n(report,"VCC"),n(report,"GND")];
  const sampleCount=sampleRateHz*durationSeconds,cycles=frequencyHz*durationSeconds,coherent=Math.abs(cycles-Math.round(cycles))<1e-9&&Number.isInteger(sampleCount);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<3||supplyVoltage>5.5||!powered||!signalPath||required.some(net=>typeof net!=="string"||!net)||waveform!=="sine"||!Number.isFinite(frequencyHz)||frequencyHz<20||frequencyHz>20000||!Number.isFinite(amplitudeV)||amplitudeV<=0||!Number.isFinite(offsetV)||!Number.isFinite(sampleRateHz)||sampleRateHz<8*frequencyHz||sampleRateHz>192000||!Number.isFinite(durationSeconds)||durationSeconds<0.001||durationSeconds>1||sampleCount<64||sampleCount>16384||!coherent||offsetV-amplitudeV<0.2||offsetV+amplitudeV>supplyVoltage-0.2||field(fields(generator.value),"Mode")!=="ideal"){
    return {state:"blocked",message:"Use a sine tone from 20 Hz to 20 kHz, at least 8× oversampling, coherent 1 ms–1 s capture, 64–16,384 samples, and a signal that remains inside the powered output rails.",validation};
  }
  const samples=Array.from({length:sampleCount},(_,index)=>offsetV+amplitudeV*Math.sin(2*Math.PI*frequencyHz*index/sampleRateHz));
  const coefficient=harmonic=>{let real=0,imaginary=0;for(let index=0;index<samples.length;index++){const angle=2*Math.PI*harmonic*index*cycles/samples.length;const centered=samples[index]-offsetV;real+=centered*Math.cos(angle);imaginary-=centered*Math.sin(angle);}return 2*Math.hypot(real,imaginary)/samples.length;};
  const fundamentalAmplitudeV=coefficient(1),secondHarmonicAmplitudeV=coefficient(2),positiveZeroCrossings=Math.round(cycles),negativeZeroCrossings=Math.round(cycles),measuredFrequencyHz=positiveZeroCrossings/durationSeconds;
  const sampleTrace=samples.filter((_,index)=>index%(Math.ceil(sampleCount/160))===0);
  return {state:"complete",engine:"Ideal sampled audio tone and DFT estimate",message:"Generates an ideal sampled sine wave and estimates its fundamental and second harmonic with a coherent discrete Fourier calculation; counts expected zero crossings from the analytic cycle count. Oscillator startup/stability, amplifier distortion, speaker/acoustic response, analog anti-alias filtering, firmware, and hardware are not modeled.",result:{kind:"audio-tone-spectrum",waveform,frequencyHz,amplitudePeakV:amplitudeV,offsetV,sampleRateHz,sampleCount,durationSeconds,positiveZeroCrossings,negativeZeroCrossings,totalZeroCrossings:positiveZeroCrossings+negativeZeroCrossings,measuredFrequencyHz,fundamentalAmplitudeV,secondHarmonicAmplitudeV,secondHarmonicDbc:20*Math.log10(Math.max(secondHarmonicAmplitudeV,1e-15)/fundamentalAmplitudeV),thdPercent:100*secondHarmonicAmplitudeV/fundamentalAmplitudeV,minimumSampleV:Math.min(...samples),maximumSampleV:Math.max(...samples),sampleTrace,firmwareExecuted:false},validation};
}
function analyseElectretMicMeter(project,{source,microphone,biasResistor,preamp,rectifier,bargraph,ground,validation}){
  const endpointNets=new Map();for(const net of project.nets)for(const item of net.endpoints)endpointNets.set(item,net.id);
  const n=(part,pin)=>endpointNets.get(endpoint(part,String(pin))),fields=value=>String(value).split(";").map(item=>item.trim());
  const field=(list,label)=>list.find(item=>item.startsWith(label+" "))?.slice(label.length).trim();
  const micFields=String(microphone.value).match(/Imic\s*([^;]+)\s*;\s*Vsig\s*([^;]+)\s*;\s*f\s*([^;]+)\s*;\s*Rs\s*(.+)/i);
  const micCurrent=micFields?currentValue(micFields[1]):Number.NaN,inputAmplitudeV=micFields?voltageValue(micFields[2]):Number.NaN,frequencyHz=micFields?frequencyValue(micFields[3]):Number.NaN,micSourceResistance=micFields?resistanceValue(micFields[4]):Number.NaN;
  const supplyVoltage=voltageValue(source.value),biasResistance=resistanceValue(biasResistor.value),micSupplyVoltage=supplyVoltage-micCurrent*biasResistance,gain=Number(field(fields(preamp.value),"Gain"));
  const rectifierFields=fields(rectifier.value),barFields=fields(bargraph.value),dropV=voltageValue(field(rectifierFields,"DropV")??"0 V"),thresholds=(field(barFields,"ThresholdsV")??"").split(",").map(value=>Number(value.trim()));
  const groundNet=n(ground,"0"),vccNet=n(source,"+"),micBiasNet=n(microphone,"VCC");
  const biasWired=(n(biasResistor,"1")===vccNet&&n(biasResistor,"2")===micBiasNet)||(n(biasResistor,"2")===vccNet&&n(biasResistor,"1")===micBiasNet);
  const signalPath=n(microphone,"OUT")===n(preamp,"IN")&&n(preamp,"OUT")===n(rectifier,"IN")&&n(rectifier,"OUT")===n(bargraph,"IN");
  const powered=n(source,"-")===groundNet&&biasWired&&[preamp,rectifier,bargraph].every(part=>n(part,"VCC")===vccNet&&n(part,"GND")===groundNet)&&n(microphone,"GND")===groundNet;
  const required=[groundNet,vccNet,micBiasNet,n(biasResistor,"1"),n(biasResistor,"2"),n(microphone,"OUT"),n(preamp,"IN"),n(preamp,"OUT"),n(rectifier,"IN"),n(rectifier,"OUT"),n(bargraph,"IN"),n(preamp,"VCC"),n(rectifier,"VCC"),n(bargraph,"VCC")];
  const sorted=thresholds.every((value,index)=>Number.isFinite(value)&&value>0&&(!index||value>thresholds[index-1]));
  const preampPeakV=inputAmplitudeV*gain,rectifiedPeakV=Math.max(0,preampPeakV-dropV),micBiasDropV=micCurrent*biasResistance;
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<3||supplyVoltage>5.5||!Number.isFinite(micCurrent)||micCurrent<=0||micCurrent>0.002||!Number.isFinite(inputAmplitudeV)||inputAmplitudeV<=0||inputAmplitudeV>0.1||!Number.isFinite(frequencyHz)||frequencyHz<20||frequencyHz>20000||!Number.isFinite(micSourceResistance)||Math.abs(micSourceResistance-biasResistance)>Math.max(1,micSourceResistance*0.05)||micSupplyVoltage<1.8||micSupplyVoltage>5.5||!Number.isFinite(gain)||gain<1||gain>100||!Number.isFinite(dropV)||dropV<0||field(rectifierFields,"Mode")!=="full-wave"||field(barFields,"Segments")!=="10"||thresholds.length!==10||!sorted||preampPeakV>=supplyVoltage-1||!signalPath||!powered||required.some(net=>typeof net!=="string"||!net)){
    return {state:"blocked",message:"Bias the electret through a matching 1–100 kΩ resistor, connect the preamp, full-wave envelope rectifier, and ten-segment bargraph, and use bounded audio, gain, frequency, supply, and threshold values.",validation};
  }
  const segments=thresholds.map((threshold,index)=>({index:index+1,thresholdV:threshold,on:rectifiedPeakV>=threshold}));
  return {state:"complete",engine:"Ideal electret envelope and calibrated LED meter estimate",message:"Treats microphone Vsig as a peak small-signal sine amplitude, applies a configured ideal voltage gain and full-wave rectifier, then compares the peak envelope with ten LED thresholds. Microphone acoustic sensitivity/noise, preamp bandwidth/noise, rectifier ripple/diode drops, analog clipping recovery, LED current limiting, and physical behavior are not modeled.",result:{kind:"electret-mic-meter",micBiasCurrentMa:micCurrent*1000,micBiasResistorOhm:biasResistance,micSupplyVoltageV:micSupplyVoltage,inputPeakV:inputAmplitudeV,frequencyHz,gain,preampPeakV,rectifierDropV:dropV,rectifiedPeakV,thresholdsV:thresholds,ledSegmentsOn:segments.filter(item=>item.on).length,segments,calibrationInputLevelsMv:[1,5,10,20],firmwareExecuted:false},validation};
}
function analyseElectretAudioPreamp(project,{source,microphone,opAmp,resistors,capacitors,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0"),vccNet=n(source,"+"),micOutNet=n(microphone,"OUT");
  const supplyVoltage=voltageValue(source.value);
  const micFields=String(microphone.value).match(/Imic\s*([^;]+)\s*;\s*Vsig\s*([^;]+)\s*;\s*f\s*([^;]+)\s*;\s*Rs\s*(.+)/i);
  const micCurrent=micFields?currentValue(micFields[1]):Number.NaN;
  const inputAmplitudeV=micFields?voltageValue(micFields[2]):Number.NaN;
  const frequencyHz=micFields?frequencyValue(micFields[3]):Number.NaN;
  const micSourceResistance=micFields?resistanceValue(micFields[4]):Number.NaN;
  const inputNet=n(opAmp,"+"),invertingNet=n(opAmp,"-"),outputNet=n(opAmp,"OUT");
  const coupling=capacitors.find(c=>(n(c,"1")===micOutNet&&n(c,"2")===inputNet)||(n(c,"2")===micOutNet&&n(c,"1")===inputNet));
  const decoupling=capacitors.find(c=>c!==coupling&&((n(c,"1")===vccNet&&n(c,"2")===groundNet)||(n(c,"2")===vccNet&&n(c,"1")===groundNet)));
  const referenceNet=[...new Set(netByEndpoint.values())].find(net=>net!==vccNet&&net!==groundNet
    &&resistors.filter(r=>n(r,"1")===net||n(r,"2")===net).length===4
    &&resistors.some(r=>(n(r,"1")===vccNet&&n(r,"2")===net)||(n(r,"2")===vccNet&&n(r,"1")===net))
    &&resistors.some(r=>(n(r,"1")===groundNet&&n(r,"2")===net)||(n(r,"2")===groundNet&&n(r,"1")===net)));
  const dividerTop=resistors.find(r=>(n(r,"1")===vccNet&&n(r,"2")===referenceNet)||(n(r,"2")===vccNet&&n(r,"1")===referenceNet));
  const dividerBottom=resistors.find(r=>r!==dividerTop&&((n(r,"1")===referenceNet&&n(r,"2")===groundNet)||(n(r,"2")===referenceNet&&n(r,"1")===groundNet)));
  const micBiasResistor=resistors.find(r=>(n(r,"1")===vccNet&&n(r,"2")===micOutNet)||(n(r,"2")===vccNet&&n(r,"1")===micOutNet));
  const inputBias=resistors.find(r=>(n(r,"1")===inputNet&&n(r,"2")===referenceNet)||(n(r,"2")===inputNet&&n(r,"1")===referenceNet));
  const feedback=resistors.find(r=>(n(r,"1")===outputNet&&n(r,"2")===invertingNet)||(n(r,"2")===outputNet&&n(r,"1")===invertingNet));
  const gainLeg=resistors.find(r=>r!==feedback&&((n(r,"1")===invertingNet&&n(r,"2")===referenceNet)||(n(r,"2")===invertingNet&&n(r,"1")===referenceNet)));
  const rMicBias=micBiasResistor?resistanceValue(micBiasResistor.value):Number.NaN;
  const rTop=dividerTop?resistanceValue(dividerTop.value):Number.NaN;
  const rBottom=dividerBottom?resistanceValue(dividerBottom.value):Number.NaN;
  const rInput=inputBias?resistanceValue(inputBias.value):Number.NaN;
  const rFeedback=feedback?resistanceValue(feedback.value):Number.NaN;
  const rGain=gainLeg?resistanceValue(gainLeg.value):Number.NaN;
  const cCoupling=coupling?capacitanceValue(coupling.value):Number.NaN;
  const positiveConnected=n(opAmp,"VCC")===vccNet&&n(opAmp,"VEE")===groundNet;
  const referenceWired=referenceNet&&dividerTop&&dividerBottom;
  const feedbackWired=feedback&&gainLeg&&((n(feedback,"1")===outputNet&&n(feedback,"2")===invertingNet)||(n(feedback,"2")===outputNet&&n(feedback,"1")===invertingNet))&&((n(gainLeg,"1")===invertingNet&&n(gainLeg,"2")===referenceNet)||(n(gainLeg,"2")===invertingNet&&n(gainLeg,"1")===referenceNet));
  if(n(source,"-")!==groundNet||n(microphone,"VCC")!==vccNet||n(microphone,"GND")!==groundNet||!positiveConnected||!referenceWired||!feedbackWired
    ||!micBiasResistor||!coupling||!decoupling||!inputBias||![supplyVoltage,micCurrent,inputAmplitudeV,frequencyHz,micSourceResistance,rMicBias,rTop,rBottom,rInput,rFeedback,rGain,cCoupling].every(Number.isFinite)
    ||supplyVoltage<=0||micCurrent<=0||inputAmplitudeV<=0||frequencyHz<=0||micSourceResistance<0||rMicBias<=0||rTop<=0||rBottom<=0||rInput<=0||rFeedback<=0||rGain<=0||cCoupling<=0){
    return {state:"blocked",message:"Connect a biased generic electret-microphone model, AC-coupling capacitor, midpoint reference, and single-supply non-inverting op-amp feedback network.",validation};
  }
  const microphoneBiasVoltageV=supplyVoltage-micCurrent*rMicBias;
  const referenceVoltageV=supplyVoltage*rBottom/(rTop+rBottom);
  const gainVPerV=1+rFeedback/rGain;
  const highPassResistanceOhm=micSourceResistance+rInput;
  const highPassCutoffHz=1/(2*Math.PI*highPassResistanceOhm*cCoupling);
  const highPassGainAt=(f)=>f/Math.sqrt(f*f+highPassCutoffHz*highPassCutoffHz);
  const signalBandSamples=[20,1000,20000].map(f=>({frequencyHz:f,gain:highPassGainAt(f)}));
  const outputAmplitudeV=inputAmplitudeV*gainVPerV*highPassGainAt(frequencyHz);
  const outputMinimumV=referenceVoltageV-outputAmplitudeV,outputMaximumV=referenceVoltageV+outputAmplitudeV;
  if(microphoneBiasVoltageV<=0||microphoneBiasVoltageV>=supplyVoltage||outputMinimumV<0||outputMaximumV>supplyVoltage){
    return {state:"blocked",message:"The microphone bias or amplified audio swing exceeds the modeled supply range; reduce mic current/gain or increase the supply.",validation};
  }
  return {state:"complete",engine:"Generic electret microphone and single-supply op-amp preamplifier estimate",message:"Models a 0.5 mA electret bias load, its AC signal amplitude and source resistance, a first-order coupling high-pass, a divided midpoint reference, and ideal non-inverting op-amp gain. It omits microphone sensitivity/noise/variation, op-amp bandwidth/slew/noise/input limits, output loading, low-pass filtering, distortion, and manufacturer-specific behavior.",result:{kind:"electret-audio-preamp",supplyVoltage,microphoneBiasCurrentA:micCurrent,microphoneBiasResistanceOhm:rMicBias,microphoneBiasVoltageV,referenceVoltageV,microphoneSignalAmplitudeV:inputAmplitudeV,microphoneSourceResistanceOhm:micSourceResistance,inputResistanceOhm:rInput,signalFrequencyHz:frequencyHz,couplingCapacitanceF:cCoupling,highPassCutoffHz,signalBandSamples,gainVPerV,highPassGainAtSignal:highPassGainAt(frequencyHz),outputAmplitudeV,outputBiasVoltageV:referenceVoltageV,outputMinimumV,outputMaximumV,outputWithinSupplyRails:true},validation};
}

function analyseOpAmpAmplifier(project,{sources,input,opAmp,resistors,ground,validation}){
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const groundNet=n(ground,"0");
  const positiveRail=sources.find(part=>n(part,"-")===groundNet&&n(part,"+")!==groundNet);
  const negativeRail=sources.find(part=>n(part,"+")===groundNet&&n(part,"-")!==groundNet);
  if(!positiveRail||!negativeRail||n(opAmp,"VCC")!==n(positiveRail,"+")||n(opAmp,"VEE")!==n(negativeRail,"-")
    ||n(input,"-")!==groundNet){
    return {state:"blocked",message:"Connect the op-amp to distinct positive/negative rails and establish the input reference at ground.",validation};
  }
  const outputNet=n(opAmp,"OUT"),invertingNet=n(opAmp,"-"),nonInvertingNet=n(opAmp,"+"),inputNet=n(input,"+");
  const feedback=resistors.find(part=>(n(part,"1")===outputNet&&n(part,"2")===invertingNet)||(n(part,"2")===outputNet&&n(part,"1")===invertingNet));
  const otherResistor=resistors.find(part=>part!==feedback);
  const nonInverting=nonInvertingNet===inputNet;
  const inverting=nonInvertingNet===groundNet;
  let gainVPerV,inputResistance,feedbackResistance,phaseShiftDeg,mode;
  const voltageFollower=nonInvertingNet===inputNet&&invertingNet===outputNet;
  if(voltageFollower&&resistors.length===0){
    gainVPerV=1;inputResistance=null;feedbackResistance=0;phaseShiftDeg=0;mode="voltage-follower";
  } else if(feedback&&nonInverting){
    const groundLeg=otherResistor&&((n(otherResistor,"1")===invertingNet&&n(otherResistor,"2")===groundNet)||(n(otherResistor,"2")===invertingNet&&n(otherResistor,"1")===groundNet))?otherResistor:null;
    feedbackResistance=feedback?resistanceValue(feedback.value):Number.NaN;
    const groundLegResistance=groundLeg?resistanceValue(groundLeg.value):Number.NaN;
    if(!groundLeg||!Number.isFinite(groundLegResistance)||groundLegResistance<=0){
      return {state:"blocked",message:"The non-inverting circuit needs Rf from output to the inverting input and Rg from that node to ground.",validation};
    }
    gainVPerV=1+feedbackResistance/groundLegResistance;inputResistance=null;phaseShiftDeg=0;mode="non-inverting";
  } else if(feedback&&inverting){
    const inputLeg=otherResistor&&((n(otherResistor,"1")===inputNet&&n(otherResistor,"2")===invertingNet)||(n(otherResistor,"2")===inputNet&&n(otherResistor,"1")===invertingNet))?otherResistor:null;
    inputResistance=inputLeg?resistanceValue(inputLeg.value):Number.NaN;
    feedbackResistance=resistanceValue(feedback.value);
    if(!inputLeg||!Number.isFinite(inputResistance)||inputResistance<=0){
      return {state:"blocked",message:"The inverting circuit needs an input resistor from the AC source to the inverting input and feedback from output to that node.",validation};
    }
    gainVPerV=-feedbackResistance/inputResistance;phaseShiftDeg=-180;mode="inverting";
  } else {
    return {state:"blocked",message:"Wire the input and feedback network as a non-inverting or inverting amplifier.",validation};
  }
  const inputAmplitudeV=voltageValue(input.value),positiveVoltage=voltageValue(positiveRail.value),negativeVoltage=voltageValue(negativeRail.value);
  if(![feedbackResistance,inputAmplitudeV,positiveVoltage,negativeVoltage,gainVPerV].every(Number.isFinite)||(mode!=="voltage-follower"&&feedbackResistance<=0)||inputAmplitudeV<=0||positiveVoltage<=0||negativeVoltage<=0){
    return {state:"blocked",message:"The ideal amplifier requires positive input amplitude, resistor values, and valid dual-rail supplies.",validation};
  }
  const outputAmplitudeV=inputAmplitudeV*Math.abs(gainVPerV);
  if(outputAmplitudeV>=Math.min(positiveVoltage,negativeVoltage)){
    return {state:"blocked",message:"The ideal output amplitude reaches a supply rail; this model does not calculate clipping.",validation};
  }
  return {state:"complete",engine:"Ideal op-amp closed-loop midband gain estimate",message:"Calculates the ideal closed-loop inverting or non-inverting gain at midband. It omits bandwidth, slew rate, input/output limits, offset, noise, loading, common-mode range, and device-specific behavior.",result:{kind:mode==="voltage-follower"?"opamp-voltage-follower":inverting?"opamp-inverting":"opamp-noninverting",configuration:mode,gainVPerV,inputAmplitudeV,outputAmplitudeV,phaseShiftDeg,positiveSupplyV:positiveVoltage,negativeSupplyV:-negativeVoltage,inputResistanceOhm:inputResistance,feedbackResistanceOhm:feedbackResistance,frequencyResponse:"ideal midband gain only"},validation};
}

function analyseNe556DualAstable(project,{source,timer,resistors,capacitors,leds,ground,validation}){
  const supplyVoltage=voltageValue(source.value),groundNet=endpoint(ground,"0");
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0)return {state:"blocked",message:"The dual-timer model needs a positive supply voltage.",validation};
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,String(pin)));
  const vcc=n(source,"+"),sourceNegative=n(source,"-"),sharedGround=n(ground,"0");
  const timingChannels=[
    {name:"A",discharge:1,threshold:2,control:3,reset:4,output:5,trigger:6,controlCap:0,timingCap:1,led:0,ledResistorReference:"RLED1"},
    {name:"B",discharge:13,threshold:12,control:11,reset:10,output:9,trigger:8,controlCap:2,timingCap:3,led:1,ledResistorReference:"RLED2"}
  ];
  if(!vcc||vcc===sharedGround||sourceNegative!==sharedGround||n(timer,14)!==vcc||n(timer,7)!==sharedGround
    ||timingChannels.some(ch=>n(timer,ch.reset)!==vcc)){
    return {state:"blocked",message:"Connect the NE556 supply and both reset pins to VCC, and pin 7 plus source negative to ground.",validation};
  }
  const channelResults=[];
  for(const ch of timingChannels){
    const dischargeNet=n(timer,ch.discharge),timingNode=n(timer,ch.threshold),triggerNode=n(timer,ch.trigger),controlNode=n(timer,ch.control),outputNode=n(timer,ch.output);
    if(!dischargeNet||!timingNode||timingNode!==triggerNode||dischargeNet===vcc||!controlNode||!outputNode){
      return {state:"blocked",message:`The NE556 channel ${ch.name} needs tied trigger/threshold pins and a distinct discharge node.`,validation};
    }
    const timingCapacitor=capacitors.find(part=>n(part,"1")===timingNode||n(part,"2")===timingNode);
    const controlCapacitor=capacitors.find(part=>part!==timingCapacitor&&(n(part,"1")===controlNode||n(part,"2")===controlNode));
    const capOther=timingCapacitor?(n(timingCapacitor,"1")===timingNode?n(timingCapacitor,"2"):n(timingCapacitor,"1")):null;
    const controlOther=controlCapacitor?(n(controlCapacitor,"1")===controlNode?n(controlCapacitor,"2"):n(controlCapacitor,"1")):null;
    const ra=resistors.find(part=>{const a=n(part,"1"),b=n(part,"2");return(a===vcc&&b===dischargeNet)||(b===vcc&&a===dischargeNet)});
    const rb=resistors.find(part=>part!==ra&&(()=>{const a=n(part,"1"),b=n(part,"2");return(a===dischargeNet&&b===timingNode)||(b===dischargeNet&&a===timingNode)})());
    const led=leds[ch.led],ledAnode=n(led,"A"),ledCathode=n(led,"K");
    const ledResistor=resistors.find(part=>part!==ra&&part!==rb&&part.reference===ch.ledResistorReference&&(()=>{
      const a=n(part,"1"),b=n(part,"2");return(a===outputNode&&b===ledAnode)||(b===outputNode&&a===ledAnode)
    })());
    if(!ra||!rb||!timingCapacitor||!controlCapacitor||capOther!==sharedGround||controlOther!==sharedGround||!ledResistor||!ledAnode||ledCathode!==sharedGround){
      return {state:"blocked",message:`Wire NE556 channel ${ch.name} as an independent astable: RA to VCC/discharge, RB to discharge/timing node, tied trigger-threshold, timing capacitor to ground, control capacitor to ground, and its output LED load.`,validation};
    }
    const raOhm=resistanceValue(ra.value),rbOhm=resistanceValue(rb.value),timingCapF=capacitanceValue(timingCapacitor.value),controlCapF=capacitanceValue(controlCapacitor.value);
    const ledResistance=ledResistor?resistanceValue(ledResistor.value):Number.NaN,ledVf=forwardVoltage(led.value);
    if(![raOhm,rbOhm,timingCapF,controlCapF,ledResistance,ledVf].every(Number.isFinite)||raOhm<=0||rbOhm<=0||timingCapF<=0||controlCapF<=0||ledResistance<=0||ledVf<=0){
      return {state:"blocked",message:`NE556 channel ${ch.name} timing and output values must be positive numeric values.`,validation};
    }
    const highTimeS=0.693*(raOhm+rbOhm)*timingCapF,lowTimeS=0.693*rbOhm*timingCapF,periodS=highTimeS+lowTimeS,frequencyHz=1/periodS,dutyCycle=highTimeS/periodS;
    const ledOnCurrentA=Math.max(0,(supplyVoltage-ledVf)/ledResistance);
    channelResults.push({channel:ch.name,raOhm,rbOhm,timingCapacitanceF:timingCapF,controlCapacitanceF:controlCapF,highTimeS,lowTimeS,periodS,frequencyHz,dutyCycle,ledOnCurrentA,ledAverageCurrentA:ledOnCurrentA*dutyCycle});
  }
  return {state:"complete",engine:"Analytical independent NE556 astable timing estimates",message:"Calculates each ideal timer channel independently with its own RA, RB, timing capacitor, and output LED. It omits timer tolerances, output saturation, startup, discharge-transistor voltage, and hardware qualification.",result:{kind:"ne556-dual-astable",supplyVoltage,channelA:channelResults[0],channelB:channelResults[1]},validation};
}

function analyseNe555Monostable(project, { source, timer, pushbutton, resistors, capacitors, led, ground, validation }) {
  const supplyVoltage=voltageValue(source.value),ledVf=forwardVoltage(led.value);
  const buttonState=String(pushbutton.value).trim().toLowerCase();
  const pressed=["pressed","closed"].includes(buttonState),open=["normally open","open"].includes(buttonState);
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!Number.isFinite(ledVf)||ledVf<=0||(!pressed&&!open)){
    return {state:"blocked",message:"The monostable model needs positive supply/LED values and a Normally open or Pressed trigger.",validation};
  }
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,pin));
  const vcc=n(source,"+"),groundNet=n(ground,"0"),timerVcc=n(timer,"8"),reset=n(timer,"4"),timerGround=n(timer,"1");
  const triggerNet=n(timer,"2"),thresholdNet=n(timer,"6"),dischargeNet=n(timer,"7"),controlNet=n(timer,"5"),outputNet=n(timer,"3");
  const timingCapacitor=capacitors.find(part=>n(part,"1")===thresholdNet||n(part,"2")===thresholdNet);
  const controlCapacitor=capacitors.find(part=>part!==timingCapacitor);
  const timingCapOther=timingCapacitor?(n(timingCapacitor,"1")===thresholdNet?n(timingCapacitor,"2"):n(timingCapacitor,"1")):null;
  const controlCapOther=controlCapacitor?(n(controlCapacitor,"1")===controlNet?n(controlCapacitor,"2"):n(controlCapacitor,"1")):null;
  const buttonInput=n(pushbutton,"1"),buttonOutput=n(pushbutton,"2");
  const timingResistor=resistors.find(part=>{
    const a=n(part,"1"),b=n(part,"2");
    return (a===vcc&&b===thresholdNet)||(b===vcc&&a===thresholdNet);
  });
  const pullupResistor=resistors.find(part=>part!==timingResistor&&(()=>{
    const a=n(part,"1"),b=n(part,"2");return (a===vcc&&b===triggerNet)||(b===vcc&&a===triggerNet);
  })());
  const ledAnode=n(led,"A"),ledCathode=n(led,"K");
  const ledResistor=resistors.find(part=>part!==timingResistor&&part!==pullupResistor&&(()=>{
    const a=n(part,"1"),b=n(part,"2");return (a===outputNet&&b===ledAnode)||(b===outputNet&&a===ledAnode);
  })());
  if(!vcc||vcc===groundNet||timerVcc!==vcc||reset!==vcc||timerGround!==groundNet
    ||!triggerNet||!thresholdNet||thresholdNet!==dischargeNet||triggerNet===thresholdNet
    ||!timingResistor||!pullupResistor||!ledResistor||timingCapOther!==groundNet||controlCapOther!==groundNet
    ||buttonInput!==triggerNet||buttonOutput!==groundNet||n(source,"-")!==groundNet
    ||ledCathode!==groundNet||!ledAnode||!controlNet){
    return {state:"blocked",message:"Wire timer VCC/reset and ground correctly; connect the timing resistor/capacitor to pins 6/7, pull up pin 2 with a normally-open button to ground, and connect the LED to pin 3.",validation};
  }
  const timingResistance=resistanceValue(timingResistor.value),pullupResistance=resistanceValue(pullupResistor.value);
  const ledResistance=resistanceValue(ledResistor.value),timingCapacitance=capacitanceValue(timingCapacitor.value),controlCapacitance=capacitanceValue(controlCapacitor.value);
  if(![timingResistance,pullupResistance,ledResistance,timingCapacitance,controlCapacitance].every(Number.isFinite)
    ||timingResistance<=0||pullupResistance<=0||ledResistance<=0||timingCapacitance<=0||controlCapacitance<=0){
    return {state:"blocked",message:"The monostable timing, trigger, LED resistors, and capacitors must be positive numeric values.",validation};
  }
  const pulseWidthS=1.1*timingResistance*timingCapacitance;
  const ledCurrentA=Math.max(0,(supplyVoltage-ledVf)/ledResistance);
  return {
    state:"complete",
    engine:"Analytical ideal 555 monostable pulse-width estimate",
    message:"A closed trigger produces one ideal output pulse with width approximately 1.1 × R × C. The button state represents a trigger event; elapsed-time output, retriggering, tolerances, startup, and timer saturation are not solved.",
    result:{kind:"ne555-monostable",supplyVoltage,timingResistance,timingCapacitance,pulseWidthS,triggered:pressed,pulseCount:pressed?1:0,outputPulseCount:pressed?1:0,ledOnDuringPulse:pressed,ledCurrentDuringPulseA:pressed?ledCurrentA:0,triggerPullupResistance:pullupResistance,controlCapacitance},
    validation
  };
}

function analyseNe555Astable(project, { source, timer, resistors, capacitors, led, ground, validation }) {
  const supplyVoltage=voltageValue(source.value), ledVf=forwardVoltage(led.value);
  const netByEndpoint=new Map();
  for(const net of project.nets)for(const item of net.endpoints)netByEndpoint.set(item,net.id);
  const n=(part,pin)=>netByEndpoint.get(endpoint(part,pin));
  const vcc=n(source,"+"),groundNet=n(ground,"0");
  const timerVcc=n(timer,"8"),timerReset=n(timer,"4"),timerGround=n(timer,"1");
  const timingNet=n(timer,"2"),thresholdNet=n(timer,"6"),dischargeNet=n(timer,"7");
  const outputNet=n(timer,"3"),controlNet=n(timer,"5");
  if(!Number.isFinite(supplyVoltage)||supplyVoltage<=0||!Number.isFinite(ledVf)||ledVf<=0) return {state:"blocked",message:"The 555 astable model needs a positive supply and LED forward voltage.",validation};
  const timingCapacitor=capacitors.find(part=>n(part,"1")===timingNet||n(part,"2")===timingNet);
  const controlCapacitor=capacitors.find(part=>part!==timingCapacitor);
  const timingPin2=timingNet, timingPin6=thresholdNet;
  const capTimingOther=timingCapacitor?(n(timingCapacitor,"1")===timingNet?n(timingCapacitor,"2"):n(timingCapacitor,"1")):null;
  const controlCapOther=controlCapacitor?(n(controlCapacitor,"1")===controlNet?n(controlCapacitor,"2"):n(controlCapacitor,"1")):null;
  const ledAnode=n(led,"A"),ledCathode=n(led,"K");
  const ledResistor=resistors.find(part=>{
    const a=n(part,"1"),b=n(part,"2");
    return (a===outputNet&&b===ledAnode)||(b===outputNet&&a===ledAnode);
  });
  const timingResistors=resistors.filter(part=>part!==ledResistor);
  const resistorAt=(part,pin1,pin2)=>[n(part,"1"),n(part,"2")].includes(pin1)&&[n(part,"1"),n(part,"2")].includes(pin2);
  const ra=timingResistors.find(part=>resistorAt(part,vcc,dischargeNet));
  const rb=timingResistors.find(part=>part!==ra&&resistorAt(part,dischargeNet,timingNet));
  if(!vcc||vcc===groundNet||timerVcc!==vcc||timerReset!==vcc||timerGround!==groundNet
    ||!timingNet||timingNet!==thresholdNet||!dischargeNet||dischargeNet===vcc
    ||!outputNet||!controlNet||!ledResistor||!ra||!rb||capTimingOther!==groundNet||controlCapOther!==groundNet
    ||!ledAnode||ledCathode!==groundNet||n(source,"-")!==groundNet) {
    return {state:"blocked",message:"Wire the 555 supply/reset to VCC and pin 1 to ground; tie pins 2/6 to the timing capacitor and RB; connect RA to pin 7, the LED to pin 3, and both capacitors to ground.",validation};
  }
  const raOhm=resistanceValue(ra.value),rbOhm=resistanceValue(rb.value),ledResistance=resistanceValue(ledResistor.value);
  const timingCapF=capacitanceValue(timingCapacitor.value),controlCapF=capacitanceValue(controlCapacitor.value);
  if(![raOhm,rbOhm,ledResistance,timingCapF,controlCapF].every(Number.isFinite)||raOhm<=0||rbOhm<=0||ledResistance<=0||timingCapF<=0||controlCapF<=0){
    return {state:"blocked",message:"The astable timing resistors, LED resistor, and both capacitors must have positive numeric values.",validation};
  }
  const highTimeS=0.693*(raOhm+rbOhm)*timingCapF;
  const lowTimeS=0.693*rbOhm*timingCapF;
  const periodS=highTimeS+lowTimeS;
  const frequencyHz=1/periodS,dutyCycle=highTimeS/periodS;
  const ledOnCurrentA=Math.max(0,(supplyVoltage-ledVf)/ledResistance);
  if(![highTimeS,lowTimeS,periodS,frequencyHz,dutyCycle,ledOnCurrentA].every(Number.isFinite)){
    return {state:"blocked",message:"The 555 timing values exceed the numerically supported range.",validation};
  }
  return {state:"complete",engine:"Analytical ideal 555 astable timing estimate",message:"Uses the standard ideal astable timing approximation. It omits output saturation, discharge-transistor voltage, timer tolerances, control-pin noise, startup behavior, and hardware qualification.",result:{kind:"ne555-astable",supplyVoltage,raOhm,rbOhm,timingCapacitanceF:timingCapF,controlCapacitanceF:controlCapF,highTimeS,lowTimeS,periodS,frequencyHz,dutyCycle,dutyPercent:dutyCycle*100,ledOnCurrentA,ledAverageCurrentA:ledOnCurrentA*dutyCycle,ledBlinking:true},validation};
}

function analyseLdrNightLight(project, { source, ldr, comparator, led, resistors, ground, validation }) {
  const supplyVoltage = voltageValue(source.value);
  const ldrFields = String(ldr.value).match(/Rbright\s*([^;]+)\s*;\s*Rdark\s*([^;]+)\s*;\s*light\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*%/i);
  const brightResistance = ldrFields ? resistanceValue(ldrFields[1]) : Number.NaN;
  const darkResistance = ldrFields ? resistanceValue(ldrFields[2]) : Number.NaN;
  const illuminationPercent = ldrFields ? Number(ldrFields[3]) : Number.NaN;
  const referenceMatch = String(comparator.value).match(/^\s*Vref\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*$/i);
  const referenceVoltage = referenceMatch ? Number(referenceMatch[1]) : Number.NaN;
  const ledVf = forwardVoltage(led.value);
  if (![supplyVoltage, brightResistance, darkResistance, illuminationPercent, referenceVoltage, ledVf].every(Number.isFinite)
    || supplyVoltage <= 0 || brightResistance <= 0 || darkResistance < brightResistance || illuminationPercent < 0 || illuminationPercent > 100
    || referenceVoltage < 0 || referenceVoltage > supplyVoltage || ledVf <= 0) {
    return { state: "blocked", message: "The LDR night-light model needs positive supply and sensor values, illumination from 0% to 100%, and a comparator reference within the supply range.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePlus = n(source, "+"), sourceMinus = n(source, "-");
  const ldrTop = n(ldr, "1"), ldrBottom = n(ldr, "2");
  const compVcc = n(comparator, "VCC"), compGround = n(comparator, "GND");
  const compSense = n(comparator, "SENSE"), compOutput = n(comparator, "OUT");
  const ledAnode = n(led, "A"), ledCathode = n(led, "K");
  const groundNet = n(ground, "0");
  const dividerResistor = resistors.find(part => {
    const a=n(part,"1"),b=n(part,"2");
    return (a===ldrBottom && b===groundNet)||(b===ldrBottom && a===groundNet);
  });
  const ledResistor = resistors.find(part => part !== dividerResistor && (() => {
    const a=n(part,"1"),b=n(part,"2");
    return (a===compOutput && b===ledAnode)||(b===compOutput && a===ledAnode);
  })());
  if (!sourcePlus || sourcePlus === sourceMinus || ldrTop !== sourcePlus || compVcc !== sourcePlus
    || !ldrBottom || ldrBottom !== compSense || !groundNet || sourceMinus !== groundNet || compGround !== groundNet
    || !dividerResistor || !ledResistor || !compOutput || ledCathode !== groundNet) {
    return { state: "blocked", message: "Connect the LDR and fixed resistor as a divider to comparator SENSE; power the comparator from the source, and connect its output through the LED resistor and LED to ground.", validation };
  }
  const dividerResistance = resistanceValue(dividerResistor.value);
  const ledResistance = resistanceValue(ledResistor.value);
  if (![dividerResistance,ledResistance].every(Number.isFinite)||dividerResistance<=0||ledResistance<=0) {
    return { state: "blocked", message: "The LDR divider and LED series resistors must be positive numeric values.", validation };
  }
  const ldrResistanceAt = percent => brightResistance*(darkResistance/brightResistance)**(1-percent/100);
  const evaluate = percent => {
    const ldrResistance=ldrResistanceAt(percent);
    const senseVoltage=supplyVoltage*dividerResistance/(ldrResistance+dividerResistance);
    const ledOn=senseVoltage<=referenceVoltage;
    const ledCurrentA=ledOn?Math.max(0,(supplyVoltage-ledVf)/ledResistance):0;
    return {illuminationPercent:percent,ldrResistance,senseVoltage,ledOn,ledCurrentA};
  };
  const samples=[0,50,100].map(evaluate);
  const current=evaluate(illuminationPercent);
  return {
    state:"complete",
    engine:"Analytical LDR comparator night-light estimate",
    message:"Uses a logarithmic resistance interpolation between entered bright and dark endpoints and an ideal comparator threshold. It omits comparator offset/hysteresis, LDR spectral response, tolerances, transient behavior, and hardware qualification.",
    result:{kind:"ldr-night-light",supplyVoltage,brightResistance,darkResistance,illuminationPercent,referenceVoltage,dividerResistance,ledResistance,ldrResistance:current.ldrResistance,senseVoltage:current.senseVoltage,ledOn:current.ledOn,ledCurrentA:current.ledCurrentA,samples},
    validation
  };
}

function analyseSolarGardenLight(project, { solar, battery, ldr, diode, mosfet, led, resistors, ground, validation }) {
  const batteryVoltage = voltageValue(battery.value);
  const diodeVf = forwardVoltage(diode.value);
  const ledVf = forwardVoltage(led.value);
  const solarFields = String(solar.value).match(/Voc\s*([^;]+)\s*;\s*Isc\s*(.+)/i);
  const openCircuitVoltage = solarFields ? voltageValue(solarFields[1]) : Number.NaN;
  const shortCircuitCurrentA = solarFields ? currentValue(solarFields[2]) : Number.NaN;
  const ldrFields = String(ldr.value).match(/Rbright\s*([^;]+)\s*;\s*Rdark\s*([^;]+)\s*;\s*light\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*%/i);
  const brightResistance = ldrFields ? resistanceValue(ldrFields[1]) : Number.NaN;
  const darkResistance = ldrFields ? resistanceValue(ldrFields[2]) : Number.NaN;
  const illuminationPercent = ldrFields ? Number(ldrFields[3]) : Number.NaN;
  const thresholdVoltage = voltageValue(mosfet.value);
  if (![batteryVoltage, diodeVf, ledVf, openCircuitVoltage, shortCircuitCurrentA, brightResistance, darkResistance, illuminationPercent, thresholdVoltage].every(Number.isFinite)
    || batteryVoltage <= 0 || diodeVf <= 0 || ledVf <= 0 || openCircuitVoltage <= 0 || shortCircuitCurrentA <= 0
    || brightResistance <= 0 || darkResistance < brightResistance || illuminationPercent < 0 || illuminationPercent > 100 || thresholdVoltage < 0) {
    return { state: "blocked", message: "The solar garden-light model requires positive battery, solar, diode, LED and light-sensor values; illumination must be between 0% and 100%.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const solarPositive = n(solar, "+"), solarNegative = n(solar, "-");
  const batteryPositive = n(battery, "+"), batteryNegative = n(battery, "-");
  const diodeAnode = n(diode, "A"), diodeCathode = n(diode, "K");
  const gate = n(mosfet, "G"), drain = n(mosfet, "D"), source = n(mosfet, "S");
  const ledAnode = n(led, "A"), ledCathode = n(led, "K"), groundNet = n(ground, "0");
  const ldrFirst = n(ldr, "1"), ldrSecond = n(ldr, "2");
  const batteryResistor = resistors.find(part => {
    const a = n(part, "1"), b = n(part, "2");
    return (a === batteryPositive && b === gate) || (b === batteryPositive && a === gate);
  });
  const ledResistor = resistors.find(part => part !== batteryResistor && (() => {
    const a = n(part, "1"), b = n(part, "2");
    return (a === batteryPositive && b === ledAnode) || (b === batteryPositive && a === ledAnode);
  })());
  if (!solarPositive || solarPositive === solarNegative || solarNegative !== groundNet
    || !batteryPositive || batteryNegative !== groundNet || diodeAnode !== solarPositive || diodeCathode !== batteryPositive
    || !gate || gate === batteryPositive || ldrFirst !== gate || ldrSecond !== groundNet
    || source !== groundNet || !drain || drain === groundNet || ledCathode !== drain
    || !ledAnode || !batteryResistor || !ledResistor) {
    return { state: "blocked", message: "Wire the solar cell through the Schottky diode to the battery, and connect the battery-powered LED through its resistor and MOSFET. The battery-pull-up and LDR-to-ground divider must drive the MOSFET gate.", validation };
  }
  const batteryResistance = resistanceValue(batteryResistor.value);
  const ledResistance = resistanceValue(ledResistor.value);
  if (![batteryResistance, ledResistance].every(Number.isFinite) || batteryResistance <= 0 || ledResistance <= 0) {
    return { state: "blocked", message: "The gate-divider and LED current-limiting resistors must be positive numeric values.", validation };
  }
  const lightFraction = illuminationPercent / 100;
  const ldrResistance = brightResistance * (darkResistance / brightResistance) ** (1 - lightFraction);
  const gateVoltage = batteryVoltage * ldrResistance / (batteryResistance + ldrResistance);
  const mosfetConducting = gateVoltage > thresholdVoltage;
  const ledCurrentA = mosfetConducting ? Math.max(0, (batteryVoltage - ledVf) / ledResistance) : 0;
  const effectiveSolarVoc = openCircuitVoltage * lightFraction;
  const effectiveSolarIsc = shortCircuitCurrentA * lightFraction;
  const chargeHeadroomV = effectiveSolarVoc - batteryVoltage - diodeVf;
  const chargeCurrentA = chargeHeadroomV > 0
    ? effectiveSolarIsc * Math.max(0, 1 - (batteryVoltage + diodeVf) / effectiveSolarVoc)
    : 0;
  const batteryCurrentIntoBatteryA = chargeCurrentA - ledCurrentA;
  const solarPowerAtDiodeInputW = chargeCurrentA > 0 ? (batteryVoltage + diodeVf) * chargeCurrentA : 0;
  const diodePowerW = diodeVf * chargeCurrentA;
  const batteryChargePowerW = batteryVoltage * chargeCurrentA;
  const ledResistorPowerW = ledCurrentA ** 2 * ledResistance;
  const ledPowerW = ledCurrentA * ledVf;
  const batteryPowerToLedW = batteryVoltage * ledCurrentA;
  const solarPowerBalanceW = solarPowerAtDiodeInputW - diodePowerW - batteryChargePowerW;
  const ledPowerBalanceW = batteryPowerToLedW - ledResistorPowerW - ledPowerW;
  if (![ldrResistance, gateVoltage, ledCurrentA, effectiveSolarVoc, effectiveSolarIsc, chargeHeadroomV, chargeCurrentA, batteryCurrentIntoBatteryA, solarPowerAtDiodeInputW, diodePowerW, batteryChargePowerW, ledResistorPowerW, ledPowerW, batteryPowerToLedW, solarPowerBalanceW, ledPowerBalanceW].every(Number.isFinite)) {
    return { state: "blocked", message: "The solar garden-light estimate exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical solar garden-light day/night and charge estimate",
    message: "Estimated solar charging with a linear photovoltaic I–V approximation and an ideal Schottky diode, and switched the LED from an LDR divider through an ideal MOSFET. The battery voltage is fixed; state of charge, charge acceptance, solar-cell curvature, diode/MOSFET dynamics, twilight hysteresis, component tolerance, thermal behavior, ratings, and general SPICE are not modeled.",
    result: { kind: "solar-garden-light", batteryVoltage, illuminationPercent, ldrResistance, gateVoltage, mosfetThresholdVoltage: thresholdVoltage, mosfetConducting, ledOn: ledCurrentA > 0.0005, ledCurrentA, solarOpenCircuitVoltage: openCircuitVoltage, solarShortCircuitCurrentA: shortCircuitCurrentA, effectiveSolarVoc, effectiveSolarIsc, chargeHeadroomV, chargeCurrentA, batteryCurrentIntoBatteryA, solarPowerAtDiodeInputW, diodePowerW, batteryChargePowerW, ledResistorPowerW, ledPowerW, batteryPowerToLedW, solarPowerBalanceW, ledPowerBalanceW },
    validation
  };
}

function analyseUsbLedPtc(project, { source, fuse, resistor, led, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const ledVf = forwardVoltage(led.value);
  const resistance = resistanceValue(resistor.value);
  const fuseMatch = String(fuse.value).match(/Ihold\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*A[\s\S]*Rcold\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*Ω/i);
  const holdCurrentA = fuseMatch ? Number(fuseMatch[1]) : Number.NaN;
  const coldResistance = fuseMatch ? Number(fuseMatch[2]) : Number.NaN;
  if (![sourceVoltage, ledVf, resistance, holdCurrentA, coldResistance].every(Number.isFinite)
    || sourceVoltage <= 0 || ledVf <= 0 || resistance <= 0 || holdCurrentA <= 0 || coldResistance < 0) {
    return { state: "blocked", message: "The USB LED model requires positive supply, LED, resistor, and PTC hold-current values; cold resistance cannot be negative.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const supplyNet = n(source, "+"), sourceReturn = n(source, "-");
  const fuseInput = n(fuse, "1"), fuseOutput = n(fuse, "2");
  const resistorInput = n(resistor, "1"), resistorOutput = n(resistor, "2");
  const ledAnode = n(led, "A"), ledCathode = n(led, "K"), groundNet = n(ground, "0");
  if (!supplyNet || supplyNet === groundNet || sourceReturn !== groundNet || fuseInput !== supplyNet
    || !fuseOutput || fuseOutput === supplyNet || resistorInput !== fuseOutput
    || !resistorOutput || resistorOutput !== ledAnode || ledCathode !== groundNet) {
    return { state: "blocked", message: "Wire USB positive through the PTC, LED resistor, and LED to ground, with USB negative and signal ground on the same return.", validation };
  }
  const totalSeriesResistance = resistance + coldResistance;
  const currentA = Math.max(0, (sourceVoltage - ledVf) / totalSeriesResistance);
  const fuseVoltageDrop = currentA * coldResistance;
  const resistorPowerW = currentA ** 2 * resistance;
  const fusePowerW = currentA ** 2 * coldResistance;
  const ledPowerW = currentA * ledVf;
  const sourcePowerW = sourceVoltage * currentA;
  const powerBalanceW = sourcePowerW - resistorPowerW - fusePowerW - ledPowerW;
  const holdCurrentExceeded = currentA > holdCurrentA;
  if (![currentA, fuseVoltageDrop, resistorPowerW, fusePowerW, ledPowerW, sourcePowerW, powerBalanceW].every(Number.isFinite)) {
    return { state: "blocked", message: "The USB LED result exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical USB LED and cold-state PTC estimate",
    message: holdCurrentExceeded
      ? "The calculated cold-state current exceeds the configured PTC hold current. This flags an overload risk only; PTC heating, trip time, resistance rise, reset behavior, and USB port response are not simulated."
      : "Calculated a low-voltage USB LED branch using the configured PTC cold resistance. PTC heating, trip time, resistance rise, reset behavior, USB port behavior, component tolerance, thermal effects, device ratings, and general SPICE are not simulated.",
    result: { kind: "usb-led-ptc", sourceVoltage, ledVf, resistance, holdCurrentA, coldResistance, currentA, fuseVoltageDrop, holdCurrentExceeded, overloadWarning: holdCurrentExceeded, fuseTripPredicted: false, resistorPowerW, fusePowerW, ledPowerW, sourcePowerW, powerBalanceW },
    validation
  };
}

function analyseLinearSupply(project, { source, transformer, bridge, capacitor, regulator, load, ground, validation }) {
  const acFields = String(source.value).split(",").map(field => field.trim());
  const acMatch = acFields.length === 2 ? acFields[0].match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*RMS$/i) : null;
  const primaryRmsVoltage = acMatch ? Number(acMatch[1]) : Number.NaN;
  const lineFrequencyHz = acFields.length === 2 ? frequencyValue(acFields[1]) : Number.NaN;
  const ratioMatch = String(transformer.value).match(/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*:\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*$/);
  const primaryTurns = ratioMatch ? Number(ratioMatch[1]) : Number.NaN;
  const secondaryTurns = ratioMatch ? Number(ratioMatch[2]) : Number.NaN;
  const diodeDrop = voltageValue(bridge.value);
  const capacitance = capacitanceValue(capacitor.value);
  const loadResistance = resistanceValue(load.value);
  const regulatorFields = [...String(regulator.value).matchAll(/(?:Vout|dropout)\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V/gi)].map(match => Number(match[1]));
  const outputSetpointV = regulatorFields.length === 2 ? regulatorFields[0] : Number.NaN;
  const dropoutVoltage = regulatorFields.length === 2 ? regulatorFields[1] : Number.NaN;
  if (![primaryRmsVoltage, lineFrequencyHz, primaryTurns, secondaryTurns, diodeDrop, capacitance, loadResistance, outputSetpointV, dropoutVoltage].every(Number.isFinite)
    || primaryRmsVoltage <= 0 || lineFrequencyHz <= 0 || primaryTurns <= 0 || secondaryTurns <= 0
    || diodeDrop <= 0 || capacitance <= 0 || loadResistance <= 0 || outputSetpointV <= 0 || dropoutVoltage < 0) {
    return { state: "blocked", message: "The supply model requires positive AC RMS voltage, line frequency, transformer turns, diode drop, capacitance, load resistance and regulator setpoint; dropout cannot be negative.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const primary1 = n(transformer, "PRI1"), primary2 = n(transformer, "PRI2");
  const secondary1 = n(transformer, "SEC1"), secondary2 = n(transformer, "SEC2");
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const bridgeAC1 = n(bridge, "AC1"), bridgeAC2 = n(bridge, "AC2");
  const bridgePositive = n(bridge, "POS"), bridgeNegative = n(bridge, "NEG");
  const capacitorPositive = n(capacitor, "1"), capacitorNegative = n(capacitor, "2");
  const regulatorInput = n(regulator, "IN"), regulatorOutput = n(regulator, "OUT"), regulatorGround = n(regulator, "GND");
  const loadInput = n(load, "1"), loadReturn = n(load, "2"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive !== primary1 || sourceNegative !== primary2
    || !secondary1 || secondary1 !== bridgeAC1 || !secondary2 || secondary2 !== bridgeAC2
    || !bridgePositive || bridgePositive === bridgeNegative || capacitorPositive !== bridgePositive
    || regulatorInput !== bridgePositive || !groundNet || bridgeNegative !== groundNet
    || capacitorNegative !== groundNet || regulatorGround !== groundNet || loadReturn !== groundNet
    || !regulatorOutput || regulatorOutput === groundNet || loadInput !== regulatorOutput) {
    return { state: "blocked", message: "Wire the AC source to transformer primary, transformer secondary to bridge AC pins, bridge DC rails across the capacitor and regulator input, and regulator output through the load to shared DC ground.", validation };
  }
  const transformerRatio = secondaryTurns / primaryTurns;
  const secondaryRmsVoltage = primaryRmsVoltage * transformerRatio;
  const rectifiedPeakVoltage = secondaryRmsVoltage * Math.SQRT2 - 2 * diodeDrop;
  const rectifiedFrequencyHz = 2 * lineFrequencyHz;
  const rippleFactor = 1 / (rectifiedFrequencyHz * capacitance * loadResistance);
  if (![transformerRatio, secondaryRmsVoltage, rectifiedPeakVoltage, rectifiedFrequencyHz, rippleFactor].every(Number.isFinite)
    || secondaryRmsVoltage <= 0 || rectifiedPeakVoltage <= 0 || rectifiedFrequencyHz <= 0 || rippleFactor < 0) {
    return { state: "blocked", message: "The transformer, rectifier, and capacitor values produce an unsupported or non-positive secondary supply.", validation };
  }
  const dropoutLimitedVoltage = Math.max(0, (rectifiedPeakVoltage - dropoutVoltage) / (1 + rippleFactor));
  const regulated = rectifiedPeakVoltage - rippleFactor * outputSetpointV >= outputSetpointV + dropoutVoltage;
  const outputVoltage = regulated ? outputSetpointV : Math.min(outputSetpointV, dropoutLimitedVoltage);
  const loadCurrentA = outputVoltage / loadResistance;
  const rippleVoltagePP = loadCurrentA / (rectifiedFrequencyHz * capacitance);
  const minimumRectifiedVoltage = rectifiedPeakVoltage - rippleVoltagePP;
  const averageRectifiedVoltage = rectifiedPeakVoltage - rippleVoltagePP / 2;
  const regulatorDissipationW = Math.max(0, (averageRectifiedVoltage - outputVoltage) * loadCurrentA);
  const bridgeDissipationW = 2 * diodeDrop * loadCurrentA;
  const loadPowerW = outputVoltage * loadCurrentA;
  const estimatedSecondaryInputPowerW = (averageRectifiedVoltage + 2 * diodeDrop) * loadCurrentA;
  const powerBalanceW = estimatedSecondaryInputPowerW - loadPowerW - regulatorDissipationW - bridgeDissipationW;
  const dropoutMarginV = minimumRectifiedVoltage - outputSetpointV - dropoutVoltage;
  if (![outputVoltage, loadCurrentA, rippleVoltagePP, minimumRectifiedVoltage, averageRectifiedVoltage, regulatorDissipationW, bridgeDissipationW, loadPowerW, estimatedSecondaryInputPowerW, powerBalanceW, dropoutMarginV].every(Number.isFinite)) {
    return { state: "blocked", message: "The supply estimate exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical transformer, bridge, reservoir-capacitor, and linear-regulator envelope",
    message: "Calculated a steady-state full-wave rectified reservoir ripple estimate and ideal regulator dropout envelope. The transformer, bridge, capacitor recharge pulses, regulator control loop, line/load transients, component tolerances, heat-sink design, mains isolation/safety, device ratings, and general SPICE are not simulated; the source value is primary RMS voltage.",
    result: { kind: "linear-regulated-supply", primaryRmsVoltage, lineFrequencyHz, primaryTurns, secondaryTurns, transformerRatio, secondaryRmsVoltage, rectifiedPeakVoltage, rectifiedFrequencyHz, diodeDropEach: diodeDrop, capacitance, loadResistance, outputSetpointV, dropoutVoltage, regulated, outputVoltage, loadCurrentA, rippleVoltagePP, minimumRectifiedVoltage, averageRectifiedVoltage, dropoutMarginV, regulatorDissipationW, bridgeDissipationW, loadPowerW, estimatedSecondaryInputPowerW, powerBalanceW },
    validation
  };
}

function analyseRlStep(project, { source, resistor, inductor, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const inductance = inductanceValue(inductor.value);
  if (![sourceVoltage, resistance, inductance].every(Number.isFinite) || sourceVoltage <= 0 || resistance <= 0 || inductance <= 0) return { state: "blocked", message: "The RL step model requires positive numeric source voltage, resistance, and inductance values.", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const inductorInput = netByEndpoint.get(endpoint(inductor, "1"));
  const inductorReturn = netByEndpoint.get(endpoint(inductor, "2"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive !== resistorInput || !resistorOutput || resistorOutput !== inductorInput || !groundNet || groundNet !== inductorReturn || groundNet !== sourceNegative || sourcePositive === groundNet) return { state: "blocked", message: "The RL step model requires source positive → resistor → inductor → ground, with source negative on the same ground reference.", validation };
  const timeConstantS = inductance / resistance;
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || timeConstantS > Number.MAX_VALUE / 5) return { state: "blocked", message: "The RL time constant is outside the numerically supported range; adjust the inductance or resistance.", validation };
  const samples = [0, 1, 3, 5].map((multiples) => {
    const timeS = multiples * timeConstantS;
    const currentA = (sourceVoltage / resistance) * (1 - Math.exp(-multiples));
    const inductorVoltage = sourceVoltage * Math.exp(-multiples);
    return { timeS, currentA, inductorVoltage, resistorPowerW: currentA ** 2 * resistance };
  });
  return { state: "complete", engine: "Analytical first-order RL step response", message: "Solved an ideal single-pole RL response to a DC step from zero initial inductor current. Parasitics, source impedance, tolerances, saturation, nonlinear effects, and general SPICE are not included.", result: { kind: "rl-step-response", sourceVoltage, resistance, inductance, timeConstantS, samples }, validation };
}

function analyseRlLowPass(project, { source, resistor, inductor, ground, validation }) {
  const sourceAmplitude = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const inductance = inductanceValue(inductor.value);
  if (![sourceAmplitude, resistance, inductance].every(Number.isFinite) || sourceAmplitude <= 0 || resistance <= 0 || inductance <= 0) return { state: "blocked", message: "The RL low-pass model requires positive numeric source amplitude, resistance, and inductance values.", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const inductorInput = netByEndpoint.get(endpoint(inductor, "1"));
  const inductorReturn = netByEndpoint.get(endpoint(inductor, "2"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive !== resistorInput || !resistorOutput || resistorOutput !== inductorInput || !groundNet || groundNet !== inductorReturn || groundNet !== sourceNegative || sourcePositive === groundNet) return { state: "blocked", message: "The RL low-pass model requires AC source positive → resistor → inductor → ground, with source negative on the same ground reference.", validation };
  const timeConstantS = inductance / resistance;
  const cutoffHz = resistance / (2 * Math.PI * inductance);
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || !Number.isFinite(cutoffHz) || cutoffHz <= 0) return { state: "blocked", message: "The RL cutoff is outside the numerically supported range; adjust the resistance or inductance.", validation };
  const samples = [0.1, 1, 10].map((cutoffMultiple) => {
    const frequencyHz = cutoffHz * cutoffMultiple;
    if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return null;
    const ratio = frequencyHz / cutoffHz;
    const gain = 1 / Math.hypot(1, ratio);
    return { frequencyHz, cutoffMultiple, gain, phaseRad: -Math.atan(ratio), inputAmplitudeV: sourceAmplitude, outputAmplitudeV: sourceAmplitude * gain };
  });
  if (samples.some((sample) => !sample)) return { state: "blocked", message: "The RL sweep frequencies exceed the numerically supported range.", validation };
  return { state: "complete", engine: "Analytical first-order RL low-pass frequency response", message: "Calculated the ideal sinusoidal steady-state response of a first-order RL low-pass filter at 0.1×, 1×, and 10× cutoff. This is a frequency-domain model, not a time-domain or general SPICE simulation.", result: { kind: "rl-low-pass", sourceAmplitude, resistance, inductance, timeConstantS, cutoffHz, samples }, validation };
}

function analyseRcHighPass(project, { source, resistor, capacitor, ground, validation }) {
  const sourceAmplitude = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const capacitance = capacitanceValue(capacitor.value);
  if (![sourceAmplitude, resistance, capacitance].every(Number.isFinite) || sourceAmplitude <= 0 || resistance <= 0 || capacitance <= 0) return null;
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const capacitorInput = netByEndpoint.get(endpoint(capacitor, "1"));
  const capacitorOutput = netByEndpoint.get(endpoint(capacitor, "2"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorReturn = netByEndpoint.get(endpoint(resistor, "2"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive !== capacitorInput || !capacitorOutput || capacitorOutput !== resistorInput || !groundNet || groundNet !== resistorReturn || groundNet !== sourceNegative || sourcePositive === groundNet) return null;
  const timeConstantS = resistance * capacitance;
  const cutoffHz = 1 / (2 * Math.PI * timeConstantS);
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || !Number.isFinite(cutoffHz) || cutoffHz <= 0) return { state: "blocked", message: "The RC cutoff is outside the numerically supported range; adjust the resistance or capacitance.", validation };
  const samples = [0.1, 1, 10].map((cutoffMultiple) => {
    const frequencyHz = cutoffHz * cutoffMultiple;
    if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return null;
    const ratio = frequencyHz / cutoffHz;
    const gain = ratio / Math.hypot(1, ratio);
    return { frequencyHz, cutoffMultiple, gain, phaseRad: Math.PI / 2 - Math.atan(ratio), inputAmplitudeV: sourceAmplitude, outputAmplitudeV: sourceAmplitude * gain };
  });
  if (samples.some((sample) => !sample)) return { state: "blocked", message: "The RC sweep frequencies exceed the numerically supported range.", validation };
  return { state: "complete", engine: "Analytical first-order RC high-pass frequency response", message: "Calculated the ideal sinusoidal steady-state response of a first-order RC high-pass filter at 0.1×, 1×, and 10× cutoff. This is a frequency-domain model, not a time-domain or general SPICE simulation.", result: { kind: "rc-high-pass", sourceAmplitude, resistance, capacitance, timeConstantS, cutoffHz, samples }, validation };
}

function analyseRcLowPass(project, { source, resistor, capacitor, ground, validation }) {
  const sourceAmplitude = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const capacitance = capacitanceValue(capacitor.value);
  if (![sourceAmplitude, resistance, capacitance].every(Number.isFinite) || sourceAmplitude <= 0 || resistance <= 0 || capacitance <= 0) return { state: "blocked", message: "The RC low-pass model requires positive numeric source amplitude, resistance, and capacitance values.", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const capacitorInput = netByEndpoint.get(endpoint(capacitor, "1"));
  const capacitorReturn = netByEndpoint.get(endpoint(capacitor, "2"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive !== resistorInput || !resistorOutput || resistorOutput !== capacitorInput || !groundNet || groundNet !== capacitorReturn || groundNet !== sourceNegative || sourcePositive === groundNet) return { state: "blocked", message: "The RC low-pass model requires AC source positive → resistor → capacitor → ground, with source negative on the same ground reference.", validation };
  const timeConstantS = resistance * capacitance;
  const cutoffHz = 1 / (2 * Math.PI * timeConstantS);
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || !Number.isFinite(cutoffHz) || cutoffHz <= 0) return { state: "blocked", message: "The RC cutoff is outside the numerically supported range; adjust the resistance or capacitance.", validation };
  const samples = [0.1, 1, 10].map((cutoffMultiple) => {
    const frequencyHz = cutoffHz * cutoffMultiple;
    if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return null;
    const ratio = frequencyHz / cutoffHz;
    const gain = 1 / Math.hypot(1, ratio);
    return { frequencyHz, cutoffMultiple, gain, phaseRad: -Math.atan(ratio), inputAmplitudeV: sourceAmplitude, outputAmplitudeV: sourceAmplitude * gain };
  });
  if (samples.some((sample) => !sample)) return { state: "blocked", message: "The RC sweep frequencies exceed the numerically supported range.", validation };
  return { state: "complete", engine: "Analytical first-order RC low-pass frequency response", message: "Calculated the ideal sinusoidal steady-state response of a first-order RC low-pass filter at 0.1×, 1×, and 10× cutoff. This is a frequency-domain model, not a time-domain or general SPICE simulation.", result: { kind: "rc-low-pass", sourceAmplitude, resistance, capacitance, timeConstantS, cutoffHz, samples }, validation };
}

function analyseRcStep(project, { source, resistor, capacitor, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const capacitance = capacitanceValue(capacitor.value);
  if (![sourceVoltage, resistance, capacitance].every(Number.isFinite) || sourceVoltage <= 0 || resistance <= 0 || capacitance <= 0) return { state: "blocked", message: "The RC step model requires positive numeric source voltage, resistance, and capacitance values.", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const capacitorInput = netByEndpoint.get(endpoint(capacitor, "1"));
  const capacitorReturn = netByEndpoint.get(endpoint(capacitor, "2"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive !== resistorInput || !resistorOutput || resistorOutput !== capacitorInput || !groundNet || groundNet !== capacitorReturn || groundNet !== sourceNegative || sourcePositive === groundNet) return { state: "blocked", message: "The RC step model requires source positive → resistor → capacitor → ground, with source negative on the same ground reference.", validation };
  const timeConstantS = resistance * capacitance;
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || timeConstantS > Number.MAX_VALUE / 5) return { state: "blocked", message: "The RC time constant is outside the numerically supported range; reduce the resistance or capacitance.", validation };
  const samples = [0, 1, 3, 5].map((multiples) => {
    const timeS = multiples * timeConstantS;
    const capacitorVoltage = sourceVoltage * (1 - Math.exp(-multiples));
    const currentA = (sourceVoltage / resistance) * Math.exp(-multiples);
    return { timeS, capacitorVoltage, currentA, resistorPowerW: currentA ** 2 * resistance };
  });
  return { state: "complete", engine: "Analytical first-order RC step response", message: "Solved an ideal single-pole RC response to a DC step from zero initial capacitor voltage. Parasitics, source impedance, tolerances, nonlinear effects, and general SPICE are not included.", result: { kind: "rc-step-response", sourceVoltage, resistance, capacitance, timeConstantS, samples }, validation };
}

function analyseRcSwitchedResponse(project, { source, resistor, capacitor, switchPart, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const capacitance = capacitanceValue(capacitor.value);
  const mode = switchPart.value === "Charge (A)" ? "charge" : switchPart.value === "Discharge (B)" ? "discharge" : null;
  if (![sourceVoltage, resistance, capacitance].every(Number.isFinite) || sourceVoltage <= 0 || resistance <= 0 || capacitance <= 0) return { state: "blocked", message: "The switched RC model requires positive numeric source voltage, resistance, and capacitance values.", validation };
  if (!mode) return { state: "blocked", message: "Set the SPDT switch value to Charge (A) or Discharge (B).", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const capacitorInput = netByEndpoint.get(endpoint(capacitor, "1"));
  const capacitorReturn = netByEndpoint.get(endpoint(capacitor, "2"));
  const switchCommon = netByEndpoint.get(endpoint(switchPart, "COM"));
  const switchCharge = netByEndpoint.get(endpoint(switchPart, "A"));
  const switchDischarge = netByEndpoint.get(endpoint(switchPart, "B"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive === groundNet || sourceNegative !== groundNet || switchCharge !== sourcePositive || switchDischarge !== groundNet || switchCommon !== resistorInput || !resistorOutput || resistorOutput !== capacitorInput || capacitorReturn !== groundNet) return { state: "blocked", message: "The switched RC model requires source positive on switch A, ground on switch B and capacitor return, switch COM → resistor → capacitor, and source negative on ground.", validation };
  const timeConstantS = resistance * capacitance;
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || timeConstantS > Number.MAX_VALUE / 5) return { state: "blocked", message: "The RC time constant is outside the numerically supported range; adjust the resistance or capacitance.", validation };
  const samples = [0, 1, 3, 5].map((multiples) => {
    const timeS = multiples * timeConstantS;
    const exponential = Math.exp(-multiples);
    const capacitorVoltage = mode === "charge" ? sourceVoltage * (1 - exponential) : sourceVoltage * exponential;
    const currentA = (sourceVoltage / resistance) * exponential;
    return { timeS, capacitorVoltage, currentA, resistorPowerW: currentA ** 2 * resistance };
  });
  return { state: "complete", engine: "Analytical first-order switched RC response", message: "Solved an ideal first-order RC charge or discharge through the selected SPDT path. The discharge assumes the capacitor was previously charged to the source voltage. Parasitics, switch resistance, tolerances, nonlinear effects, and general SPICE are not included.", result: { kind: "rc-charge-discharge", mode, sourceVoltage, resistance, capacitance, timeConstantS, samples }, validation };
}

function analyseResistiveNetwork(project, { source, resistors, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  if (!Number.isFinite(sourceVoltage)) return { state: "blocked", message: "The DC network needs one numeric source voltage.", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  if (!groundNet || !sourcePositive || !sourceNegative || sourceNegative !== groundNet) {
    return { state: "blocked", message: "The supported resistive solver requires the DC source negative terminal and signal ground on the same reference net.", validation };
  }
  if (sourcePositive === groundNet) return { state: "blocked", message: "The source positive terminal is shorted to ground.", validation };

  const branches = [];
  for (const resistor of resistors) {
    const resistance = resistanceValue(resistor.value);
    const nodeA = netByEndpoint.get(endpoint(resistor, "1"));
    const nodeB = netByEndpoint.get(endpoint(resistor, "2"));
    if (!Number.isFinite(resistance) || resistance <= 0) return { state: "blocked", message: `${resistor.reference} needs a numeric positive resistance.`, validation };
    if (!nodeA || !nodeB) return { state: "blocked", message: `${resistor.reference} must connect both pins to named project nets.`, validation };
    if (nodeA === nodeB) return { state: "blocked", message: `${resistor.reference} is shorted by connecting both terminals to ${nodeA}.`, validation };
    branches.push({ reference: resistor.reference, nodeA, nodeB, resistance });
  }
  const nodes = [...new Set(branches.flatMap((branch) => [branch.nodeA, branch.nodeB]))]
    .filter((node) => node !== groundNet && node !== sourcePositive).sort();
  const matrix = nodes.map(() => Array(nodes.length).fill(0));
  const rhs = nodes.map(() => 0);
  const index = new Map(nodes.map((node, position) => [node, position]));
  for (const branch of branches) {
    const conductance = 1 / branch.resistance;
    const a = index.get(branch.nodeA);
    const b = index.get(branch.nodeB);
    if (a !== undefined) matrix[a][a] += conductance;
    if (b !== undefined) matrix[b][b] += conductance;
    if (a !== undefined && b !== undefined) { matrix[a][b] -= conductance; matrix[b][a] -= conductance; }
    if (a !== undefined && branch.nodeB === sourcePositive) rhs[a] += conductance * sourceVoltage;
    if (b !== undefined && branch.nodeA === sourcePositive) rhs[b] += conductance * sourceVoltage;
  }
  const solved = solveLinearSystem(matrix, rhs);
  if (!solved) return { state: "blocked", message: "The resistor network is floating, disconnected from the source/reference, or numerically singular.", validation };
  const nodeVoltages = Object.fromEntries([[groundNet, 0], [sourcePositive, sourceVoltage], ...nodes.map((node, position) => [node, solved[position]])]);
  const resistorResults = branches.map((branch) => {
    const voltage = nodeVoltages[branch.nodeA] - nodeVoltages[branch.nodeB];
    const currentA = voltage / branch.resistance;
    return { reference: branch.reference, voltage, currentA, powerW: currentA ** 2 * branch.resistance };
  });
  const sourceCurrentA = branches.reduce((sum, branch) => {
    if (branch.nodeA === sourcePositive) return sum + (sourceVoltage - nodeVoltages[branch.nodeB]) / branch.resistance;
    if (branch.nodeB === sourcePositive) return sum + (sourceVoltage - nodeVoltages[branch.nodeA]) / branch.resistance;
    return sum;
  }, 0);
  if (!Number.isFinite(sourceCurrentA) || sourceCurrentA < -1e-9) return { state: "blocked", message: "The network produced an invalid source-current result; check source polarity and topology.", validation };
  return {
    state: "complete",
    engine: "Linear DC resistive nodal analysis",
    message: "Solved the documented linear DC resistor network with one ideal voltage source. No reactive, nonlinear, thermal, transient, or general SPICE model is included.",
    result: { kind: "resistive-network", sourceVoltage, sourceCurrentA, sourcePowerW: sourceVoltage * sourceCurrentA, nodeVoltages, resistors: resistorResults },
    validation
  };
}


function analyseMultiSourceResistiveNetwork(project, { sources, currentSources, resistors, ground, validation }) {
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!groundNet) return { state: "blocked", message: "Connect the signal-ground pin to a named project net before solving.", validation };

  const sourceBranches = sources.map((source) => {
    const voltage = voltageValue(source.value);
    const positiveNet = netByEndpoint.get(endpoint(source, "+"));
    const negativeNet = netByEndpoint.get(endpoint(source, "-"));
    return { reference: source.reference, voltage, positiveNet, negativeNet };
  });
  for (const source of sourceBranches) {
    if (!Number.isFinite(source.voltage)) return { state: "blocked", message: `${source.reference} needs a numeric DC voltage.`, validation };
    if (!source.positiveNet || !source.negativeNet) return { state: "blocked", message: `${source.reference} must connect both terminals to named project nets.`, validation };
    if (source.positiveNet === source.negativeNet) return { state: "blocked", message: `${source.reference} is shorted because both terminals share ${source.positiveNet}.`, validation };
  }

  const currentBranches = currentSources.map((source) => ({
    reference: source.reference,
    current: currentValue(source.value),
    positiveNet: netByEndpoint.get(endpoint(source, "+")),
    negativeNet: netByEndpoint.get(endpoint(source, "-"))
  }));
  for (const source of currentBranches) {
    if (!Number.isFinite(source.current)) return { state: "blocked", message: `${source.reference} needs a numeric DC current in amperes.`, validation };
    if (!source.positiveNet || !source.negativeNet) return { state: "blocked", message: `${source.reference} must connect both terminals to named project nets.`, validation };
    if (source.positiveNet === source.negativeNet) return { state: "blocked", message: `${source.reference} is shorted because both terminals share ${source.positiveNet}.`, validation };
  }

  const resistorBranches = [];
  for (const resistor of resistors) {
    const resistance = resistanceValue(resistor.value);
    const nodeA = netByEndpoint.get(endpoint(resistor, "1"));
    const nodeB = netByEndpoint.get(endpoint(resistor, "2"));
    if (!Number.isFinite(resistance) || resistance <= 0) return { state: "blocked", message: `${resistor.reference} needs a numeric positive resistance.`, validation };
    if (!nodeA || !nodeB) return { state: "blocked", message: `${resistor.reference} must connect both terminals to named project nets.`, validation };
    if (nodeA === nodeB) return { state: "blocked", message: `${resistor.reference} is shorted by connecting both terminals to ${nodeA}.`, validation };
    resistorBranches.push({ reference: resistor.reference, nodeA, nodeB, resistance });
  }

  const connectedNets = new Set([groundNet]);
  for (const branch of sourceBranches) { connectedNets.add(branch.positiveNet); connectedNets.add(branch.negativeNet); }
  for (const branch of currentBranches) { connectedNets.add(branch.positiveNet); connectedNets.add(branch.negativeNet); }
  for (const branch of resistorBranches) { connectedNets.add(branch.nodeA); connectedNets.add(branch.nodeB); }
  const nodes = [...connectedNets].filter((node) => node !== groundNet).sort();
  const nodeIndex = new Map(nodes.map((node, index) => [node, index]));
  const nodeCount = nodes.length;
  const matrixSize = nodeCount + sourceBranches.length;
  const matrix = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(0));
  const rhs = Array(matrixSize).fill(0);
  const addConductance = (row, column, value) => {
    if (row !== undefined && column !== undefined) matrix[row][column] += value;
  };

  for (const branch of resistorBranches) {
    const conductance = 1 / branch.resistance;
    const a = branch.nodeA === groundNet ? undefined : nodeIndex.get(branch.nodeA);
    const b = branch.nodeB === groundNet ? undefined : nodeIndex.get(branch.nodeB);
    addConductance(a, a, conductance);
    addConductance(b, b, conductance);
    addConductance(a, b, -conductance);
    addConductance(b, a, -conductance);
  }

  for (const branch of currentBranches) {
    const positive = branch.positiveNet === groundNet ? undefined : nodeIndex.get(branch.positiveNet);
    const negative = branch.negativeNet === groundNet ? undefined : nodeIndex.get(branch.negativeNet);
    // Positive current is defined as flowing from the negative pin into the positive pin.
    if (positive !== undefined) rhs[positive] += branch.current;
    if (negative !== undefined) rhs[negative] -= branch.current;
  }

  sourceBranches.forEach((branch, sourceOffset) => {
    const currentIndex = nodeCount + sourceOffset;
    const positive = branch.positiveNet === groundNet ? undefined : nodeIndex.get(branch.positiveNet);
    const negative = branch.negativeNet === groundNet ? undefined : nodeIndex.get(branch.negativeNet);
    addConductance(positive, currentIndex, 1);
    addConductance(currentIndex, positive, 1);
    addConductance(negative, currentIndex, -1);
    addConductance(currentIndex, negative, -1);
    rhs[currentIndex] = branch.voltage;
  });

  const solved = solveLinearSystem(matrix, rhs);
  if (!solved || solved.some((value) => !Number.isFinite(value))) {
    return { state: "blocked", message: "The multiple-source resistor network is floating, disconnected, contradictory, or numerically singular.", validation };
  }

  const nodeVoltages = Object.fromEntries([[groundNet, 0], ...nodes.map((node, index) => [node, solved[index]])]);
  const resistorResults = resistorBranches.map((branch) => {
    const voltage = nodeVoltages[branch.nodeA] - nodeVoltages[branch.nodeB];
    const currentA = voltage / branch.resistance;
    return { reference: branch.reference, voltage, currentA, powerW: currentA ** 2 * branch.resistance };
  });
  const sourceResults = sourceBranches.map((branch, index) => {
    const currentA = solved[nodeCount + index];
    return {
      reference: branch.reference,
      voltage: branch.voltage,
      currentA,
      deliveredCurrentA: -currentA,
      powerDeliveredW: -branch.voltage * currentA
    };
  });
  const currentSourceResults = currentBranches.map((branch) => {
    const voltage = nodeVoltages[branch.positiveNet] - nodeVoltages[branch.negativeNet];
    return { reference: branch.reference, voltage, outputCurrentA: branch.current, powerDeliveredW: voltage * branch.current };
  });
  const resistorPowerW = resistorResults.reduce((sum, item) => sum + item.powerW, 0);
  const voltageSourcePowerW = sourceResults.reduce((sum, item) => sum + item.powerDeliveredW, 0);
  const currentSourcePowerW = currentSourceResults.reduce((sum, item) => sum + item.powerDeliveredW, 0);
  const sourcePowerW = voltageSourcePowerW + currentSourcePowerW;
  if (![resistorPowerW, sourcePowerW].every(Number.isFinite)) {
    return { state: "blocked", message: "The multiple-source network produced a non-finite power result.", validation };
  }
  return {
    state: "complete",
    engine: "Linear DC modified nodal analysis",
    message: "Solved an ideal linear DC network containing independent voltage and current sources and resistors. Current source positive current flows from its negative pin to its positive pin. Source output resistance, reactive elements, nonlinear devices, thermal effects, and general SPICE are not included.",
    result: { kind: currentBranches.length ? "linear-dc-mna-network" : "multi-source-resistive-network", nodeVoltages, sources: sourceResults, currentSources: currentSourceResults, resistors: resistorResults, sourcePowerW, voltageSourcePowerW, currentSourcePowerW, resistorPowerW, powerBalanceW: sourcePowerW - resistorPowerW },
    validation
  };
}

function solveLinearSystem(matrix, rhs) {
  const size = rhs.length;
  if (size === 0) return [];
  const augmented = matrix.map((row, index) => [...row, rhs[index]]);
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    if (Math.abs(augmented[pivot][column]) < 1e-12) return null;
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    const divisor = augmented[column][column];
    for (let item = column; item <= size; item += 1) augmented[column][item] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let item = column; item <= size; item += 1) augmented[row][item] -= factor * augmented[column][item];
    }
  }
  return augmented.map((row) => row[size]);
}

function analyseLedCurrentLimiter(project, { source, resistor, led, ground, validation }) {
  const topologyIsSupported = hasNet(project, endpoint(source, "+"), endpoint(resistor, "1"))
    && hasNet(project, endpoint(resistor, "2"), endpoint(led, "A"))
    && hasNet(project, endpoint(led, "K"), endpoint(source, "-"), endpoint(ground, "0"));
  if (!topologyIsSupported) {
    return { state: "blocked", message: "The analytical LED calculation requires its documented source → resistor → LED → ground topology. The current netlist is not that topology.", validation };
  }
  const sourceVoltage = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const ledVf = forwardVoltage(led.value);
  if (!Number.isFinite(sourceVoltage) || !Number.isFinite(resistance) || !Number.isFinite(ledVf) || resistance <= 0 || ledVf <= 0) {
    return { state: "blocked", message: "The demo needs a numeric source voltage, positive resistance, and positive LED forward voltage.", validation };
  }
  const currentA = Math.max(0, (sourceVoltage - ledVf) / resistance);
  const resistorPowerW = currentA ** 2 * resistance;
  return {
    state: "complete",
    engine: "Analytical DC LED demonstration",
    message: "Completed an analytical DC calculation; this is not a general SPICE result.",
    result: { kind: "led-current-limiter", sourceVoltage, resistance, ledVf, currentA, resistorPowerW, ledOn: currentA > 0.0005 },
    validation
  };
}




function analyseLatchingLedSwitch(project, { source, resistor, led, switchPart, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const ledVf = forwardVoltage(led.value);
  const position = String(switchPart.value).trim().toLowerCase();
  const onPosition = position === "position a";
  const offPosition = position === "position b";
  if (!Number.isFinite(sourceVoltage) || sourceVoltage <= 0 || !Number.isFinite(ledVf) || ledVf <= 0) {
    return { state: "blocked", message: "The latching LED model requires positive numeric source voltage and LED forward voltage.", validation };
  }
  if (!onPosition && !offPosition) return { state: "blocked", message: "Set the latching SPDT switch to Position A or Position B.", validation };

  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  const switchCommon = netByEndpoint.get(endpoint(switchPart, "COM"));
  const switchA = netByEndpoint.get(endpoint(switchPart, "A"));
  const switchB = netByEndpoint.get(endpoint(switchPart, "B"));
  const ledAnode = netByEndpoint.get(endpoint(led, "A"));
  const ledCathode = netByEndpoint.get(endpoint(led, "K"));
  const resistorFirst = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorSecond = netByEndpoint.get(endpoint(resistor, "2"));
  const resistorLeadsCommon = (switchCommon === resistorFirst && resistorSecond === ledAnode)
    || (switchCommon === resistorSecond && resistorFirst === ledAnode);
  if (!sourcePositive || sourcePositive === groundNet || sourceNegative !== groundNet || switchA !== sourcePositive
    || switchB !== groundNet || switchCommon === groundNet || !resistorLeadsCommon || ledCathode !== groundNet) {
    return { state: "blocked", message: "Wire switch A to source positive, switch B to ground, and switch COM through the series resistor and LED to ground.", validation };
  }

  const resistance = resistanceValue(resistor.value);
  if (!Number.isFinite(resistance) || resistance <= 0) return { state: "blocked", message: "The latching LED circuit requires a numeric positive series resistor.", validation };
  const ledCurrentA = onPosition ? Math.max(0, (sourceVoltage - ledVf) / resistance) : 0;
  const resistorPowerW = ledCurrentA ** 2 * resistance;
  const ledPowerW = ledCurrentA * ledVf;
  const sourcePowerW = sourceVoltage * ledCurrentA;
  if (![ledCurrentA, resistorPowerW, ledPowerW, sourcePowerW].every(Number.isFinite)) {
    return { state: "blocked", message: "The latching LED result exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical ideal latching SPDT LED switch",
    message: "Calculated a low-voltage LED circuit selected by an ideal latching SPDT contact. Contact bounce, resistance, component tolerance/rating, thermal behavior, and general SPICE are not included.",
    result: {
      kind: "latching-led-switch",
      switchPosition: onPosition ? "A" : "B",
      ledOn: ledCurrentA > 0.0005,
      sourceVoltage,
      ledVf,
      ledCurrentA,
      sourceCurrentA: ledCurrentA,
      resistorPowerW,
      ledPowerW,
      sourcePowerW,
      powerBalanceW: sourcePowerW - resistorPowerW - ledPowerW
    },
    validation
  };
}

function analyseLedPolarityIndicator(project, { source, resistors, redLed, greenLed, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const redVf = forwardVoltage(redLed.value);
  const greenVf = forwardVoltage(greenLed.value);
  if (![sourceVoltage, redVf, greenVf].every(Number.isFinite) || redVf <= 0 || greenVf <= 0) {
    return { state: "blocked", message: "The polarity indicator requires a numeric signed DC source voltage and positive LED forward voltages.", validation };
  }

  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  const redAnode = netByEndpoint.get(endpoint(redLed, "A"));
  const redCathode = netByEndpoint.get(endpoint(redLed, "K"));
  const greenAnode = netByEndpoint.get(endpoint(greenLed, "A"));
  const greenCathode = netByEndpoint.get(endpoint(greenLed, "K"));
  if (!sourcePositive || sourcePositive === groundNet || sourceNegative !== groundNet
    || !redAnode || redCathode !== groundNet || greenAnode !== groundNet || !greenCathode) {
    return { state: "blocked", message: "Wire the red LED from source positive toward ground and the green LED in the opposite direction across the same source.", validation };
  }

  const isBetween = (resistor, firstNet, secondNet) => {
    const first = netByEndpoint.get(endpoint(resistor, "1"));
    const second = netByEndpoint.get(endpoint(resistor, "2"));
    return (first === firstNet && second === secondNet) || (first === secondNet && second === firstNet);
  };
  const redResistor = resistors.find((resistor) => isBetween(resistor, sourcePositive, redAnode));
  const greenResistor = resistors.find((resistor) => resistor !== redResistor && isBetween(resistor, sourcePositive, greenCathode));
  if (!redResistor || !greenResistor) return { state: "blocked", message: "Each anti-parallel LED requires its own series resistor between the supply node and the LED anode/cathode path.", validation };

  const redResistance = resistanceValue(redResistor.value);
  const greenResistance = resistanceValue(greenResistor.value);
  if (![redResistance, greenResistance].every(Number.isFinite) || redResistance <= 0 || greenResistance <= 0) {
    return { state: "blocked", message: "Both LED branches need numeric positive series resistors.", validation };
  }

  const polarity = Math.sign(sourceVoltage);
  const redCurrentA = polarity > 0 ? Math.max(0, (sourceVoltage - redVf) / redResistance) : 0;
  const greenCurrentA = polarity < 0 ? Math.max(0, (-sourceVoltage - greenVf) / greenResistance) : 0;
  const redPowerW = redCurrentA ** 2 * redResistance;
  const greenPowerW = greenCurrentA ** 2 * greenResistance;
  const ledPowerW = redCurrentA * redVf + greenCurrentA * greenVf;
  const sourceCurrentA = redCurrentA + greenCurrentA;
  const sourcePowerW = Math.abs(sourceVoltage) * sourceCurrentA;
  if (![redCurrentA, greenCurrentA, redPowerW, greenPowerW, ledPowerW, sourcePowerW].every(Number.isFinite)) {
    return { state: "blocked", message: "The polarity indicator result exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical anti-parallel LED polarity indicator",
    message: "Calculated an ideal low-voltage indicator with red and green LEDs in opposite directions, each with its own series resistor. Reverse recovery, LED reverse breakdown, nonlinear curves, tolerance, thermal effects, and general SPICE are not included.",
    result: {
      kind: "led-polarity-indicator",
      sourceVoltage,
      polarity: polarity > 0 ? "positive" : polarity < 0 ? "negative" : "zero",
      redLedOn: redCurrentA > 0.0005,
      greenLedOn: greenCurrentA > 0.0005,
      redCurrentA,
      greenCurrentA,
      sourceCurrentA,
      resistorResults: [
        { reference: redResistor.reference, currentA: redCurrentA, powerW: redPowerW },
        { reference: greenResistor.reference, currentA: greenCurrentA, powerW: greenPowerW }
      ],
      ledPowerW,
      sourcePowerW,
      powerBalanceW: sourcePowerW - redPowerW - greenPowerW - ledPowerW
    },
    validation
  };
}

function analysePushbuttonLed(project, { source, resistors, led, pushbutton, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const ledVf = forwardVoltage(led.value);
  const switchValue = String(pushbutton.value).trim().toLowerCase();
  const closed = ["pressed", "closed"].includes(switchValue);
  const open = ["normally open", "open"].includes(switchValue);
  if (!Number.isFinite(sourceVoltage) || sourceVoltage <= 0 || !Number.isFinite(ledVf) || ledVf <= 0) {
    return { state: "blocked", message: "The pushbutton LED model requires positive numeric source voltage and LED forward voltage.", validation };
  }
  if (!closed && !open) return { state: "blocked", message: "Set the momentary pushbutton value to Normally open or Pressed.", validation };

  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const switchInput = netByEndpoint.get(endpoint(pushbutton, "1"));
  const switchOutput = netByEndpoint.get(endpoint(pushbutton, "2"));
  const ledAnode = netByEndpoint.get(endpoint(led, "A"));
  const ledCathode = netByEndpoint.get(endpoint(led, "K"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive === groundNet || sourceNegative !== groundNet || switchInput !== sourcePositive
    || !switchOutput || switchOutput === sourcePositive || ledCathode !== groundNet || !ledAnode) {
    return { state: "blocked", message: "Wire source positive through the pushbutton, then through the LED resistor and LED to the shared source-negative/ground net.", validation };
  }

  const seriesResistor = resistors.find((resistor) => {
    const first = netByEndpoint.get(endpoint(resistor, "1"));
    const second = netByEndpoint.get(endpoint(resistor, "2"));
    return (first === switchOutput && second === ledAnode) || (second === switchOutput && first === ledAnode);
  });
  const pullDown = resistors.find((resistor) => {
    if (resistor === seriesResistor) return false;
    const first = netByEndpoint.get(endpoint(resistor, "1"));
    const second = netByEndpoint.get(endpoint(resistor, "2"));
    return (first === switchOutput && second === groundNet) || (second === switchOutput && first === groundNet);
  });
  if (!seriesResistor || !pullDown) return { state: "blocked", message: "The circuit requires a series LED resistor and a pull-down resistor from the switched node to ground.", validation };

  const seriesResistance = resistanceValue(seriesResistor.value);
  const pullDownResistance = resistanceValue(pullDown.value);
  if (![seriesResistance, pullDownResistance].every(Number.isFinite) || seriesResistance <= 0 || pullDownResistance <= 0) {
    return { state: "blocked", message: "Both the LED series resistor and pull-down resistor need numeric positive resistance values.", validation };
  }

  const ledCurrentA = closed ? Math.max(0, (sourceVoltage - ledVf) / seriesResistance) : 0;
  const pullDownCurrentA = closed ? sourceVoltage / pullDownResistance : 0;
  const sourceCurrentA = ledCurrentA + pullDownCurrentA;
  const seriesPowerW = ledCurrentA ** 2 * seriesResistance;
  const pullDownPowerW = closed ? sourceVoltage ** 2 / pullDownResistance : 0;
  const ledPowerW = ledCurrentA * ledVf;
  const sourcePowerW = sourceVoltage * sourceCurrentA;
  if (![ledCurrentA, pullDownCurrentA, sourceCurrentA, seriesPowerW, pullDownPowerW, ledPowerW, sourcePowerW].every(Number.isFinite)) {
    return { state: "blocked", message: "The pushbutton LED calculation exceeds the numerically supported range.", validation };
  }

  return {
    state: "complete",
    engine: "Analytical ideal pushbutton LED circuit",
    message: "Calculated the low-voltage series-switch LED circuit with an ideal momentary switch, a pull-down resistor, and a fixed LED forward-voltage model. Physical switch bounce, tolerances, LED curve, resistor ratings, and general SPICE are not included.",
    result: {
      kind: "pushbutton-led",
      switchState: closed ? "pressed" : "normally-open",
      ledOn: ledCurrentA > 0.0005,
      sourceVoltage,
      ledVf,
      ledCurrentA,
      sourceCurrentA,
      pullDownCurrentA,
      outputVoltageV: closed ? sourceVoltage : 0,
      resistorResults: [
        { reference: seriesResistor.reference, currentA: ledCurrentA, powerW: seriesPowerW },
        { reference: pullDown.reference, currentA: pullDownCurrentA, powerW: pullDownPowerW }
      ],
      ledPowerW,
      sourcePowerW,
      powerBalanceW: sourcePowerW - seriesPowerW - pullDownPowerW - ledPowerW
    },
    validation
  };
}

function findVoltageDivider(project, source, resistors, ground) {
  for (const upper of resistors) {
    const lower = resistors.find((candidate) => candidate.instanceId !== upper.instanceId);
    if (!lower) continue;
    const topologyIsSupported = hasNet(project, endpoint(source, "+"), endpoint(upper, "1"))
      && hasNet(project, endpoint(upper, "2"), endpoint(lower, "1"))
      && hasNet(project, endpoint(lower, "2"), endpoint(source, "-"), endpoint(ground, "0"));
    if (topologyIsSupported) return { upper, lower };
  }
  return null;
}

function analyseVoltageDivider(project, { source, upper, lower, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const upperResistance = resistanceValue(upper.value);
  const lowerResistance = resistanceValue(lower.value);
  if (!Number.isFinite(sourceVoltage) || !Number.isFinite(upperResistance) || !Number.isFinite(lowerResistance) || upperResistance <= 0 || lowerResistance <= 0) {
    return { state: "blocked", message: "The voltage-divider calculation needs a numeric source voltage and two positive resistor values.", validation };
  }
  const totalResistance = upperResistance + lowerResistance;
  const currentA = sourceVoltage / totalResistance;
  const outputVoltage = currentA * lowerResistance;
  return {
    state: "complete",
    engine: "Analytical DC voltage-divider calculation",
    message: "Completed an unloaded two-resistor analytical DC calculation; this is not a general SPICE result.",
    result: { kind: "voltage-divider", sourceVoltage, upperResistance, lowerResistance, totalResistance, currentA, outputVoltage, totalPowerW: sourceVoltage * currentA },
    validation
  };
}

export function serializeProject(project) {
  return JSON.stringify(project, null, 2);
}

export function parseProject(text) {
  const project = JSON.parse(text);
  const validation = validateProject(project);
  if (!validation.valid) throw new Error(validation.errors.map((issue) => issue.message).join(" "));
  return project;
}

