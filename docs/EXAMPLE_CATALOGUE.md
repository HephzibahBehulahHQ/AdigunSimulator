# 200-project acceptance catalogue

This is the authoritative scope catalogue for the 200 required examples. A row specifies a project, expected behaviour and acceptance criterion; it is **not** evidence that the project has been implemented or passed.

The release registry is `examples/manifest.json`. It may mark an example as `released` only when a native project file, an automated acceptance test, a safety note and recorded passing evidence exist. As of this revision, the registry has fourteen released analytical catalogue examples (rows 1–14) and ten supplemental studies; 186 catalogue entries remain planned until their release requirements are met. The other released studies do not occupy catalogue rows and cannot be counted toward the 200-project target. Catalogue row 14, “Passive tone control,” remains planned.

## 12. Catalogue of 200 individually specified, testable example projects

For every example, deliver a native project file, readme, schematic, breadboard layout where physically appropriate, PCB layout where applicable, BOM with exact part versions, expected outputs, safety note, automated/reference test, and recorded result. The table below defines the required starting catalogue. `Test` is the acceptance criterion; it is not a claim the test has already passed.

| # | Project | Core parts / circuit | Expected behaviour and acceptance test |
|---:|---|---|---|
| 1 | LED current limiter | 5 V source, red LED, 330 Ω resistor | LED current is within calculated tolerance; test compares simulated current to V/R-based expected range. |
| 2 | Two-LED polarity indicator | DC source, anti-parallel red/green LEDs, resistors | Reversing polarity switches the lit LED; test both source polarities. |
| 3 | Pushbutton LED | 5 V, switch, pull-down, LED | LED changes only while pressed; test no floating input warning. |
| 4 | Latching LED switch | SPDT switch, LED, resistor | Each switch position holds one defined state; test continuity/net state. |
| 5 | PWM LED dimmer | MOSFET, PWM source, LED load | Duty-cycle sweep changes average LED current monotonically; test 10/50/90%. |
| 6 | Battery discharge monitor | 9 V battery model, divider, comparator, LED | LED asserts below threshold; test threshold crossing ± tolerance. |
| 7 | 5 V linear supply | transformer, bridge, capacitor, 7805-class regulator | Output regulates near 5 V within load range; test ripple and dropout warning. |
| 8 | USB-powered LED | USB 5 V, LED, resistor, polyfuse | LED works with protected input; test normal and overload warning paths. |
| 9 | Solar garden light model | solar cell, battery, diode, LDR, LED | LED turns on at low light and charges in light; test day/night stimuli. |
| 10 | Supercapacitor hold-up | supply, diode, supercapacitor, load | Load voltage decays according to C/load; test hold-up duration range. |
| 11 | RC charge/discharge | 5 V, R, C, switch | Capacitor follows exponential charge/discharge; test time at 63.2%. |
| 12 | RC low-pass filter | sine source, R, C | Output amplitude drops above cutoff; test calculated cutoff ± tolerance. |
| 13 | RC high-pass filter | sine source, R, C | Output attenuates below cutoff; test Bode points. |
| 14 | Passive tone control | R/C network, audio source/load | Low/high response changes with control; test response plots. |
| 15 | Bridge rectifier | AC source, bridge, load | Output is full-wave rectified; test ripple frequency is 2× input. |
| 16 | Smoothing capacitor | rectifier, capacitor, load | Reservoir capacitor reduces ripple; compare with/without C. |
| 17 | Zener shunt regulator | DC source, resistor, Zener, load | Clamp remains near rated Zener voltage; test safe current range. |
| 18 | TVS surge clamp | pulse source, TVS, load | Load peak stays below clamp limit; test pulse and dissipation warning. |
| 19 | NTC temperature divider | NTC, resistor, source | Output changes monotonically with temperature; test 0/25/60 °C. |
| 20 | LDR night light | LDR divider, comparator, LED | Light state changes at set threshold; test light-level sweep. |
| 21 | 555 astable blinker | NE555, R, C, LED | Oscillation frequency/duty match calculation; test waveform periods. |
| 22 | 555 monostable | NE555, trigger switch, R, C | One output pulse per trigger; test pulse width tolerance. |
| 23 | 556 dual timer | NE556, two R/C networks | Two independent oscillations operate; test frequencies separately. |
| 24 | Op-amp non-inverting amplifier | op amp, feedback resistors | Gain matches 1 + Rf/Rg; test AC gain at midband. |
| 25 | Op-amp inverting amplifier | op amp, R input/feedback | Gain polarity and magnitude match design; test phase and gain. |
| 26 | Voltage follower | op amp | Output tracks input within model limitations; test sweep and saturation. |
| 27 | Comparator threshold | comparator, divider, LED | Output flips at defined threshold; test rising/falling input. |
| 28 | Schmitt trigger | comparator, positive feedback | Separate thresholds show hysteresis; test both transition levels. |
| 29 | Window comparator | dual comparator, divider | Indicator is active only within window; test three voltage regions. |
| 30 | Precision reference buffer | reference, op amp, load | Buffered output is stable under stated load; test load sweep. |
| 31 | Transistor common-emitter amp | NPN, bias network, coupling capacitors | Inverted voltage gain occurs without clipping; test bias point and sine trace. |
| 32 | Emitter follower | NPN, load | Output follows input about VBE lower; test DC sweep. |
| 33 | MOSFET low-side switch | logic MOSFET, load, flyback diode | Load switches with valid gate drive; test off/on VDS and coil turn-off. |
| 34 | P-MOS high-side switch | P-MOS, gate network, load | Load gets supply when enabled; test gate/source limits. |
| 35 | Relay driver | NPN, relay, flyback diode | Relay energizes without excessive transistor voltage; test coil current and release transient. |
| 36 | H-bridge DC motor driver | H-bridge, motor model | Direction reverses safely; test both states and shoot-through interlock. |
| 37 | Audio preamp | electret mic, bias, op amp | Small input is amplified in band; test gain and bias. |
| 38 | LM386-class audio amp | audio amp, speaker model | Audio source drives output without clipping at target level; test THD/model warning. |
| 39 | Active low-pass filter | op amp, R/C | Response meets designed cutoff/order; test Bode sample points. |
| 40 | Wien bridge oscillator | op amp, RC bridge | Stable sinusoid begins under model conditions; test frequency and amplitude limit. |
| 41 | AND gate truth table | 74xx AND, switches, LEDs | All four input cases match truth table; automated vector test. |
| 42 | OR gate truth table | 74xx OR, switches, LEDs | All four cases match truth table; automated vector test. |
| 43 | XOR parity checker | XOR gates, switches, LED | LED flags odd parity; test all input combinations. |
| 44 | SR latch | NOR/NAND latch, switches | Set/reset/hold behavior is correct; test prohibited input warning. |
| 45 | D flip-flop register | D FF, clock, data switches | Q samples D at active clock; test setup/hold annotations. |
| 46 | JK toggle divider | JK FF, clock source | Q frequency is half clock in toggle mode; test edge count. |
| 47 | Four-bit binary counter | counter IC, clock, LEDs | Counts 0–15 then wraps; test 16 clock vectors. |
| 48 | BCD counter display | decade counter, 7-seg decoder | Display cycles 0–9; test reset/wrap. |
| 49 | Traffic-light FSM | gates/FFs, LEDs, clock | Legal light sequence repeats; test no conflicting green state. |
| 50 | Debounced digital input | button, RC/Schmitt trigger | One logical edge per press; test bounce waveform. |
| 51 | Shift-register LED chaser | serial shift register, clock, LEDs | Single bit moves per clock; test state sequence. |
| 52 | Multiplexer selector | 4:1 mux, switches, LED | Output equals selected input; test all select vectors. |
| 53 | Decoder-controlled LEDs | 2:4 decoder, switches | Exactly one output active; test all addresses. |
| 54 | Priority encoder | encoder, switches | Highest-priority asserted input encodes; test multiple inputs. |
| 55 | ALU add/subtract | adders, XOR controls | Correct sum/difference and carry; test vector suite. |
| 56 | UART transmitter model | MCU/digital source, UART monitor | Frame start/data/stop timing correct; test decoded bytes. |
| 57 | UART receiver model | serial source, MCU/digital logic | Valid frame decodes, framing error flags; test valid/invalid frames. |
| 58 | I²C sensor bus | MCU model, I²C sensor, pull-ups | Address/read transaction succeeds; test ACK/NACK. |
| 59 | SPI display bus | MCU model, SPI display | Bytes reach display model in mode 0; test timing/CS sequence. |
| 60 | EEPROM data logger logic | MCU model, serial EEPROM | Write/read preserves sample data; test power-cycle persistence model. |
| 61 | Arduino blink | Uno-class MCU, LED, resistor | Firmware toggles LED at configured interval; test simulated GPIO trace. |
| 62 | Arduino button debounce | Uno-class MCU, button, LED | One state toggle per debounced press; test bounce input. |
| 63 | Arduino PWM dimmer | Uno-class MCU, pot, MOSFET, LED | ADC maps to PWM duty; test min/mid/max. |
| 64 | Arduino temperature monitor | Uno-class MCU, temperature sensor, LCD | LCD shows valid converted value; test three sensor values. |
| 65 | Arduino ultrasonic ranger | Uno-class MCU, ultrasonic sensor, OLED | Range value updates for supplied echo times; test boundaries. |
| 66 | Arduino servo control | Uno-class MCU, pot, servo | Servo command sweeps 0–180°; test PWM width. |
| 67 | Arduino stepper driver | Uno-class MCU, driver, stepper | Steps/direction produce expected motion model; test sequence. |
| 68 | ESP32 Wi-Fi telemetry mock | ESP32-class MCU, temp sensor | Encoded telemetry payload forms correctly; test offline simulated transport. |
| 69 | Pico ADC voltmeter | Pico-class MCU, divider, OLED | Displayed voltage matches calibrated input; test calibration points. |
| 70 | STM32 timer PWM | STM32-class MCU, LED/load | Timer output frequency/duty meet configuration; test waveform. |
| 71 | PIC ADC bargraph | PIC MCU, potentiometer, LED bar | ADC threshold drives bar count; test input sweep. |
| 72 | AVR IR receiver | AVR MCU, IR receiver | Known NEC-like code decodes; test timing vectors. |
| 73 | Microcontroller watchdog | MCU, watchdog model, LED | Failed service resets controller state; test induced stall. |
| 74 | CAN node pair | two MCU models, CAN transceivers | Valid frame passes and ACKs; test bus termination state. |
| 75 | RS-485 sensor network | MCU, transceivers, sensors | Addressed polling returns only intended node; test collision avoidance. |
| 76 | GPS display interface | MCU, GNSS model, LCD | Valid NMEA sentence parses; test checksum failure. |
| 77 | RFID access reader | MCU, RFID module, servo/LED | Allowlisted tag opens simulated lock; test unknown tag rejection. |
| 78 | NFC tag reader | MCU, NFC module, OLED | UID is displayed safely; test read error. |
| 79 | Data logger to EEPROM | MCU, sensor, EEPROM | Periodic samples persist/replay; test full buffer wrap. |
| 80 | Low-power sleep/wake | MCU, interrupt switch, LED | Sleep current model/status and interrupt wake are correct; test wake edge. |
| 81 | BLE beacon configuration | BLE module, MCU | Advertising payload is formed from settings; test field encoding. |
| 82 | LoRa sensor node | LoRa module, temp sensor, MCU | Payload and duty-cycle guard are correct; test send schedule. |
| 83 | GSM alarm notifier mock | LTE/GSM modem, MCU, sensor | Alert command sequence is valid; test modem error handling. |
| 84 | Wi-Fi relay controller | Wi-Fi MCU, relay driver | Valid local command changes relay; test authentication placeholder/offline fail safe. |
| 85 | Ethernet sensor node | Ethernet PHY, MCU, sensor | Link/configuration state transitions are visible; test packet framing mock. |
| 86 | IR remote decoder | IR receiver, MCU, display | Remote key code selects action; test invalid pulse rejection. |
| 87 | FM radio front-end concept | antenna, RF/tuning blocks, audio amp | Tuned response peaks at set frequency; test model-limited Bode response. |
| 88 | RFID inventory concept | RFID reader, tag models | Identifiers are enumerated by test scenario; test duplicate/read collision response. |
| 89 | I²C bus level shifter | two voltage rails, bidirectional shifter | Both sides communicate without overvoltage; test high/low transitions. |
| 90 | USB-UART console | USB-UART bridge, MCU | Text transmits/receives at set baud; test known byte stream. |
| 91 | Electret microphone meter | mic preamp, rectifier, LED bar | Bar level follows input amplitude; test calibrated sine levels. |
| 92 | Audio tone generator | oscillator, amp, speaker | Frequency is within design tolerance; test spectrum/zero crossings. |
| 93 | Guitar pedal buffer | JFET/op-amp buffer | Input impedance high, unity gain in band; test AC response. |
| 94 | Simple mixer | two sources, summing op amp | Output equals weighted sum without clipping; test source combinations. |
| 95 | PWM audio DAC concept | PWM source, low-pass, load | Filtered output tracks duty average; test ripple limit. |
| 96 | Digital volume control | digital pot, audio source | Gain follows command steps; test monotonic response. |
| 97 | Colour LED controller | RGB LED, MCU/PWM | Requested RGB values produce correct channel duty; test colour vectors. |
| 98 | OLED status panel | MCU, OLED, sensors | Values update and bounds are handled; test missing-sensor message. |
| 99 | E-paper display updater | MCU, e-paper model | Partial/full refresh request meets state sequence; test power-state handling. |
| 100 | Seven-segment clock | RTC, MCU, display | Time increments and rollover works; test 23:59:59. |
| 101 | Buck converter baseline | switch, diode/synchronous model, L/C, controller | Output regulates at setpoint; test line/load steps. |
| 102 | Boost converter baseline | inductor, switch, diode, C, controller | Output exceeds input under valid load; test duty limit. |
| 103 | Buck-boost supply | controller, L/C, source/load | Output regulates above/below input; test crossover. |
| 104 | Li-ion charger concept | charger IC model, cell | Charge phases respect model limits; test no-cell/fault state. |
| 105 | BMS cell monitor | cell stack, monitor, balancing loads | Flags over/under-voltage; test each threshold. |
| 106 | Solar MPPT concept | solar source, converter/controller | Operating point moves near configured maximum; test irradiance sweep. |
| 107 | USB-C sink concept | USB-C connector, PD controller, load | Negotiation state follows approved profile model; test fallback 5 V. |
| 108 | USB-C source concept | PD source controller, load model | Advertised profile constraints are respected; test overcurrent response. |
| 109 | PoE powered-device input | RJ45/PoE model, rectifier, DC/DC | Correct polarity bridge/power path; test alternative feed states. |
| 110 | Constant-current LED driver | driver, LED string, sense resistor | Current remains regulated across load range; test open LED warning. |
| 111 | MOSFET half-bridge | high/low MOSFETs, driver | Complementary gates include dead time; test no overlap. |
| 112 | IGBT inverter leg | IGBT pair, driver, load | Switching state respects gate logic; test fault interlock. |
| 113 | TRIAC AC dimmer concept | AC source, optotriac, triac, lamp | Phase angle changes RMS load model; test zero-cross sync. |
| 114 | SSR AC load switch | opto/SSR, AC load | Load state follows isolated control; test off leakage model. |
| 115 | Battery-powered UPS | charger, battery, ideal diode, load | Transfer maintains output within hold-up window; test mains loss. |
| 116 | Inverter waveform concept | DC bus, H-bridge, PWM filter | Output waveform meets chosen model target; test RMS/frequency. |
| 117 | Electronic load | MOSFET, op amp, shunt | Draws commanded current within tolerance; test current steps. |
| 118 | Hot-swap input protection | hot-swap controller, MOSFET, load C | Inrush limiting operates; test overload trip. |
| 119 | Reverse-polarity protection | ideal-diode/MOSFET circuit | Correct polarity powers load; reverse polarity blocks; test both. |
| 120 | Surge-protected input | fuse, MOV/TVS, filter | Surge clamp/fuse warning occur as modeled; test transient. |
| 121 | Single-sided LED PCB | LED circuit, through-hole/SMD footprints | ERC/DRC clean; export Gerber/drill/BOM and compare expected files. |
| 122 | 555 timer PCB | NE555 circuit, DIP footprint | Schematic-to-PCB mapping complete; test no un-routed nets. |
| 123 | Op-amp filter PCB | active filter, SOIC/headers | Design rules and footprint pins match; test netlist equivalence. |
| 124 | Arduino shield | headers, sensors, LEDs | Board mates with declared header map; test keep-outs and DRC. |
| 125 | USB-C breakout | USB-C connector, CC resistors | Footprint/pin map verified; test DRC and connector pin report. |
| 126 | Sensor breakout board | sensor, regulator, I²C header | BOM/placement export contains all parts; test ERC/DRC. |
| 127 | Relay module PCB | relay, transistor, diode, terminal blocks | Clearance/net class rules pass; test coil/load isolation annotations. |
| 128 | Audio amplifier PCB | amp IC, electrolytics, speaker terminal | Grounding/routing review checklist passes; test DRC and BOM. |
| 129 | Buck converter PCB | switcher, inductor, diode, caps | High-current net rules assigned; test DRC and layout checklist. |
| 130 | Four-layer MCU board plan | MCU, decouplers, connector | Stack-up/return-path rules documented; test no missing power pins. |
| 131 | Differential pair demo | USB/data connector, transceiver | Pair constraint report exists; test only if engine supports rules, otherwise blocking limitation. |
| 132 | QFN footprint validation | QFN IC, exposed pad | Pad map and stencil/courtyard data validate; test footprint checker. |
| 133 | BGA escape concept | BGA, vias, board | Reports capability/limitations truthfully; test no false manufacturability claim. |
| 134 | Panel-mount controller | PCB, terminal blocks, mounting holes | Mechanical holes/cut-outs documented; test dimensions/DRC. |
| 135 | Test-point rich board | MCU board, test pads | Required nets have accessible test points; test net coverage report. |
| 136 | Manufacturing export pack | completed simple PCB | Gerber, drill, BOM, placement, PDF files generated and checksum-listed. |
| 137 | Assembly variant board | optional LEDs/sensors, variants | Variant BOM excludes DNP correctly; test two generated BOMs. |
| 138 | Net-class rule demo | power/signal nets | Width/clearance violations are found; test deliberate violation fixture. |
| 139 | Copper zone demo | ground plane, thermal reliefs | Zone connects permitted pads only; test refill/DRC. |
| 140 | PCB-to-schematic reconciliation | edited footprint/net | Reconciliation item appears and needs choice; test no silent source change. |
| 141 | DC voltmeter use | source, divider, meter | Instrument reports expected voltage/units; test known references. |
| 142 | DC ammeter use | source, resistor, meter | Series current matches Ohm’s law; test placement error detection. |
| 143 | Oscilloscope trigger | pulse source, scope | Trigger locks at configured edge/level; test trace metadata. |
| 144 | Two-channel phase measurement | sine sources, scope | Reports phase offset within tolerance; test 90° input. |
| 145 | Logic analyser capture | digital counter, analyser | Captures labelled channels/states; test decoded count sequence. |
| 146 | Frequency counter | oscillator, counter | Frequency reading matches period; test multiple frequencies. |
| 147 | Bode plot of RC filter | RC network, AC analysis | Plot includes magnitude/phase/unit labels; test cutoff marker. |
| 148 | Transient pulse response | RLC network, pulse | Damping/ringing shown; test stable timestep warning. |
| 149 | Parameter sweep | resistor range, LED/amp | Results track parameter values; test three points. |
| 150 | Monte Carlo tolerance plan | resistor/cap tolerance model | Runs only if implemented; test seeded repeatability and report distribution. |
| 151 | Thermal warning boundary | power resistor, load | Warns that no thermal model/certification is implied unless implemented; test message. |
| 152 | Convergence failure study | intentionally difficult SPICE circuit | Error is specific/actionable; test no fabricated result. |
| 153 | Floating-node diagnosis | invalid analog circuit | ERC/simulation identifies floating node; test jump-to-object. |
| 154 | Short-circuit diagnosis | supply short fixture | Reports error before run; test safe blocking. |
| 155 | Missing-ground diagnosis | source/load no reference | Run is blocked/explained; test rule ID. |
| 156 | Model-unavailable diagnosis | schematic-only component | UI marks unavailable, does not run fake model; test status. |
| 157 | Net probe cross-probe | schematic/PCB/breadboard circuit | Selecting net highlights same ID in all views; test assertion. |
| 158 | Component property audit | resistor/footprint/model | Inspector edits valid value and validates invalid range; test undo/redo. |
| 159 | Simulation report export | known RC circuit | Report carries settings, model/version, result and warnings; test required fields. |
| 160 | Reproducible run lockfile | known circuit/library lock | Same lockfile produces same expected model selection; test manifest compare. |
| 161 | PLC start/stop motor concept | generic PLC, start/stop, relay/motor model | Seal-in logic operates; test stop/emergency break condition. |
| 162 | PLC traffic light | generic PLC I/O, lamps, timers | Safe timed sequence repeats; test timing state table. |
| 163 | Tank level controller | PLC, level sensors, pump | Pump follows low/high hysteresis; test simulated levels. |
| 164 | Conveyor counter | PLC, photoeye, motor | Counts objects and stops at target; test event sequence. |
| 165 | Star-delta starter concept | contactors, timer, motor model | Interlocks prevent overlap; test all transition states. |
| 166 | Forward/reverse motor concept | contactors, buttons, motor | Electrical interlock prevents simultaneous drive; test conflict request. |
| 167 | Emergency-stop safety concept | E-stop, safety relay, load | Unsafe reset is rejected in model; test E-stop/restart sequence. |
| 168 | Door interlock concept | limit switch, relay, indicator | Load enabled only with closed guard; test open guard. |
| 169 | Temperature alarm | sensor, comparator/PLC, buzzer | Alarm trips/latches at threshold; test reset policy. |
| 170 | Water leak alarm | moisture sensor, buzzer/relay | Alarm triggers under wet stimulus; test dry recovery. |
| 171 | Fan thermostat | NTC, controller, fan | Fan switches with hysteresis; test temperature sweep. |
| 172 | PWM fan controller | MCU/driver, fan | Duty tracks temperature curve; test curve knots. |
| 173 | Automatic night light | LDR, controller, LED | Light responds to lux threshold; test day/night. |
| 174 | Smart irrigation model | moisture sensor, pump/valve | Waters only when dry and permitted; test sensor fault. |
| 175 | Garage-door concept | limit switches, motor relay | Open/close stops at limits; test conflicting commands. |
| 176 | Elevator call logic concept | buttons, indicators, controller | Deterministic state model meets request queue; test scenario table. |
| 177 | Fire-alarm zone concept | detectors, panel/buzzer | Zone alarm and fault distinguish; test open/short inputs. |
| 178 | Access-control strike lock | RFID, controller, lock relay | Allowlist opens strike briefly; test audit event mock. |
| 179 | Warehouse beacon concept | sensor, LEDs/buzzer | Status indication follows occupancy state; test state transitions. |
| 180 | Machine fault annunciator | inputs, lamps/buzzer, acknowledge | Fault latches until acknowledged and cleared; test sequence. |
| 181 | Breadboard-to-schematic sync | LED circuit in breadboard and schematic | Net/component IDs remain identical after valid breadboard wiring; test structural diff. |
| 182 | Schematic-to-PCB sync | 555 circuit schematic and PCB | Footprints/netlist transfer without loss; test pin/pad map. |
| 183 | Three-view LED project | LED circuit in all views | One component edit propagates/reconciles correctly; test history/undo. |
| 184 | Unsupported breadboard package | BGA/board-only part | System creates reconciliation item; test no bogus breadboard placement. |
| 185 | Missing-footprint workflow | valid schematic-only part | PCB update blocks and offers resolution; test required report. |
| 186 | Pin-incompatible substitution | two similar but incompatible parts | Substitution is blocked/previewed; test unchanged original after cancel. |
| 187 | Unit conversion calculator | resistor/power/length values | Correct SI conversions/rounding; test known inputs. |
| 188 | Resistor colour-code reader | resistor values/tolerance | Displays valid bands and rejects invalid combination; test vectors. |
| 189 | LED resistor calculator | source, LED Vf/current | Recommends/calculates resistor with power warning; test reference cases. |
| 190 | Voltage-divider calculator | Vin/R1/R2 | Computes output/loading warning; test analytical values. |
| 191 | RC timing calculator | R/C | Computes tau/cutoff; test decimal prefixes. |
| 192 | Op-amp gain calculator | resistor values | Computes inverting/non-inverting gain; test zero/invalid safeguards. |
| 193 | PCB trace-width assistant | current/copper/rise input | Produces advisory with standards/source limitation; test input validation. |
| 194 | BOM export and costing placeholder | project BOM | Exports verified BOM fields without fabricated prices; test no price when source absent. |
| 195 | Adigun BOT explain component | verified resistor/LED record | BOT cites project/library fields and admits unknowns; test grounded response fixture. |
| 196 | Adigun BOT diagnose error | floating-node project | BOT proposes validated repair preview, not direct edit; test confirmation gate. |
| 197 | Adigun BOT circuit proposal | 12 V LED request | Produces schema-valid preview with calculated resistor assumptions; test user rejection leaves project unchanged. |
| 198 | Four-language UI sweep | representative project | All four locales show no missing IDs/overflow; automated visual/a11y test. |
| 199 | Local offline recovery | edited project, simulated storage interruption | Unsaved recovery/export guidance works; test no silent loss. |
| 200 | Release candidate end-to-end | example 1/122/182/195 mix | Build, import, edit, simulate, ERC/DRC, export and BOT-preview evidence all pass in CI. |


