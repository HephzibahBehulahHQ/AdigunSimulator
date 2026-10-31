# 200-project acceptance catalogue

This is the authoritative scope catalogue for the 200 required examples. A row specifies a project, expected behaviour and acceptance criterion; it is **not** evidence that the project has been implemented or passed.

The release registry is `examples/manifest.json`. It may mark an example as `released` only when a native project file, an automated acceptance test, a safety note and recorded passing evidence exist. As of this revision, the registry has eighty-six released catalogue examples (rows 1–86) and ten supplemental studies; 114 catalogue entries remain planned until their release requirements are met. Catalogue row 44, “SR latch,” is implemented as a generic cross-coupled NOR model with active-high set/reset, explicit prior-state retention in hold mode, and blocking of simultaneous set/reset. The other released studies do not occupy catalogue rows and cannot be counted toward the 200-project target. Catalogue row 22, “555 monostable,” estimates one ideal 1.1RC pulse per pressed trigger.

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
| 45 | D flip-flop register | Ideal positive-edge D FF, clock and data switches | Q samples D only on a rising edge and retains state between edges; timing annotations disclose that setup/hold, metastability and propagation are not modeled. Test rising, falling and steady-clock cases. |
| 46 | JK toggle divider | Ideal positive-edge JK FF, J/K inputs, clock, active-low clear | With J=K=1, Q toggles at each rising edge after clear initializes the state; test edge count and the ideal 1:2 output-to-clock frequency ratio. |
| 47 | Four-bit binary counter | Ideal modulo-16 counter, clock, active-low reset, four LED outputs | Counts rising edges from 0 through 15 and wraps to 0; test all 16 transitions, asynchronous reset and bit-frequency ratios. |
| 48 | BCD counter display | Ideal decade counter/decoder and seven current-limited LED segments | Displays the correct A–G segment vector for digits 0–9, wraps to zero, and resets asynchronously; test each digit vector and wrap. |
| 49 | Traffic-light FSM | Ideal six-phase state machine, clock, six current-limited lamps | NS/EW green/yellow/all-red phases repeat, one per rising edge; test every lamp vector and ensure opposing green outputs are never simultaneously active. |
| 50 | Debounced digital input | Ideal three-sample digital stability filter, raw input, sample clock | Rejects brief alternating samples and accepts a new state only after three matching rising-edge samples; test bounce rejection and stable press. This is a digital sampled model, not analog RC/Schmitt behavior. |
| 51 | Shift-register LED chaser | Ideal four-bit one-hot ring register, clock, active-low reset, four LEDs | Single high bit rotates Q0→Q1→Q2→Q3→Q0 on rising edges; test one-hot state and full sequence. |
| 52 | Multiplexer selector | Ideal 4:1 mux, four data sources, two select switches, current-limited LED | Output matches the input selected by S1:S0 for all 16 data words and four select states; test all 64 combinations. |
| 53 | Decoder-controlled LEDs | Ideal active-high 2:4 decoder, two address inputs, four current-limited LEDs | Exactly one matching output is active for addresses 00–11; test all four one-hot vectors. |
| 54 | Priority encoder | Ideal four-input encoder, four switches, two code outputs and valid indicator | The highest asserted input wins (D3 highest); all-low gives valid=0. Test single and simultaneous inputs. |
| 55 | ALU add/subtract | Ideal four-bit add/subtract model, A/B inputs, SUB selector | Produces the low four result bits and carry/no-borrow flag; exhaustively test all 512 operand and operation combinations. |
| 56 | UART transmitter model | Ideal configurable UART 8N1 frame source | Emits low start, eight LSB-first data bits, and high stop at the selected baud rate; test byte decoding and frame duration. Analog signal integrity is out of scope. |
| 57 | UART receiver and framing-error detector | Ideal ten-bit 8N1 frame source, powered receiver, valid-frame LED | Decode the eight data bits LSB-first and assert valid only for low start/high stop bits; test valid 0xA5, bad start, bad stop, invalid frame length, and broken RX wiring. Digital frame-level model; waveform sampling, oversampling, jitter, and physical transceiver behavior are omitted. |
| 58 | I²C sensor register read | Ideal transaction fixture, register-mapped sensor, one pull-up per bus line | At 100 kHz, read register 0x00 from address 0x48 and return 0x2A; test address NACK, absent register, explicit no-ACK fixture, invalid clock, and broken SDA wiring. Digital transaction-level model; firmware execution, clock stretching, arbitration, analog rise time, and physical device timing are omitted. |
| 59 | SPI mode-0 display byte transfer | Ideal byte fixture and powered digital display endpoint | Transfers 0xA5 MSB-first with clock idle low, rising-edge sampling, active chip select, and an 8/baud duration; test mode, byte bounds, CS state, and disconnected wiring. Digital transaction-level model; display command sets, pixel rendering, analog timing margins, and physical device behavior are omitted. |
| 60 | I²C EEPROM sample write and read-back | Ideal I²C transaction fixture, EEPROM byte-memory model, two pull-ups | Write 0x5A to address 0x50/register 0x10 and verify the ideal immediate read-back; test address NACK, invalid byte, and cycle configuration. Physical endurance, write-cycle delay, power-loss persistence, page handling, and MCU firmware are not modeled. |
| 61 | Uno-class D13 blink behavior | Ideal GPIO sequence controller, series resistor, LED | Produce HIGH/LOW/HIGH/LOW over a 2 s run with 500 ms intervals and estimate current while high; test trace timing and broken output path. This is configured ideal GPIO behavior; Arduino C++ firmware is not executed. |
| 62 | Uno-class debounced button toggle | Digital sample fixture, D2/D13 controller, series LED path | Reject 1- and 2-sample bounce bursts; accept each 3-sample stable press once and toggle D13; test two presses and broken input wiring. Ideal sampled digital behavior; no C++ firmware or analog contact/RC behavior is simulated. |
| 63 | Uno-class potentiometer PWM dimmer | 10-bit ADC fixture, ideal PWM controller, low-side MOSFET, current-limited LED | Map 0%, 50%, and 100% potentiometer positions to ADC counts 0, 512, and 1023 and corresponding PWM duty; test bounds and disconnected gate. Configured ideal behavior; no Arduino C++ execution, ADC noise, MOSFET thermal loss, or analog pot tolerance. |
| 64 | Uno-class temperature monitor with LCD output | Linear analog sensor model, 10-bit ADC behavior, single-line LCD text sink | Convert 0 °C, 25 °C, and 100 °C samples within ±0.5 °C after ADC quantization; test out-of-range sensor and broken A0/LCD wiring. Sensor is a linear generic model; firmware, analog noise, self-heating, LCD bus timing, and physical accuracy are omitted. |
| 65 | Uno-class ultrasonic ranger and OLED result | Echo-time sensor model, configured MCU trigger/echo pins, OLED text sink | Convert 117 µs, 5,882 µs, and 23,323 µs into valid 20–4,000 mm ranges; report 25,000 µs as out of range. Uses 343 m/s sound speed. Firmware, acoustic reflections, temperature correction, and physical timing are omitted. |
| 66 | Uno-class potentiometer servo sweep | 10-bit ADC fixture, configured MCU behavior, calibrated ideal servo position model | Map 0%, 50%, and 100% to 1–2 ms pulses and 0–180° positions at 50 Hz; test signal, calibration bounds, and input wiring. Ideal angle mapping only; firmware, torque, mechanical loading, and device calibration are omitted. |
| 67 | Uno-class bipolar stepper driver | Configured D3/D2 controller, dual-H-bridge driver, 200-step/rev motor model | Verify a 200-step CW command yields 360° travel in 1 s at 200 step/s and a 50-step CCW command yields −90° at 100 step/s; test phase direction and broken coil wiring. Ideal position model; firmware, torque, missed steps, thermal effects, and mechanical limits are omitted. |
| 68 | ESP32 temperature telemetry payload mock | Ideal 12-bit ADC formatter, linear temperature sensor, offline payload viewer | Form deterministic JSON with device ID, sequence, and quantized temperature for 0 °C, 25 °C, and 80 °C; verify malformed/out-of-range input blocks. This is an offline formatting mock: no Wi-Fi or network transmission occurs. |
| 69 | Pico ADC divider voltmeter with OLED | Separate 3.3 V logic rail, 30 kΩ/10 kΩ divider, ideal 12-bit Pico ADC, OLED text sink | Reconstruct 6 V, 12 V, and 13 V inputs within 0.01 V using the calibrated divider; block 14 V because the divider output exceeds 3.3 V. This ideal calculation does not verify physical input protection, ADC nonlinearity, or firmware. |
| 70 | STM32 timer PWM LED load | STM32-class timer, 3.3 V supply, resistor, red LED | At 72 MHz, prescaler 71, ARR 999, and compare 499, calculate 1 kHz and 49.9% duty and estimate ideal average LED current; reject invalid compare and broken load wiring. |
| 71 | PIC-class ADC LED bargraph | Generic PIC-class 10-bit ADC behavior model, potentiometer fixture, ten-segment bargraph sink | Positions 0%, 25%, 50%, 75%, and 100% map to ADC counts 0, 256, 512, 767, and 1023 and bar counts 0, 2, 5, 7, and 10; reject 101% and broken segment wiring. Firmware, physical pin mapping, and LED current are not modeled. |
| 72 | AVR NEC-like IR receiver | Ideal timing fixture, 38 kHz demodulator, AVR-class decoder, text sink | Decode 0x00FFA25D LSB-first to address 0x00/command 0xA2 in 67,980 µs; reject out-of-tolerance leader and broken byte complement/wiring. Optical path and firmware are omitted. |
| 73 | Microcontroller watchdog reset recovery | 3.3 V supply, ideal MCU watchdog behavior model, ordered service-time fixture, status display | Healthy 40 ms service intervals stay below a 100 ms timeout; fixture services at 0, 40, 80, then 230 ms trigger a safe reset at 180 ms; test healthy service, invalid timeout, and broken WDI wiring. Firmware, MCU clock tolerance, reset circuitry, and hardware behavior are not modeled. |
| 74 | CAN node pair with ACK | Two CAN-capable MCU behavior models, two ideal transceivers, 500 kbit/s frame fixture, two 120 Ω end terminators, status display | Transfer standard ID 0x123 with two bytes DE AD; matching receiver filter accepts and ACKs the frame; parallel end terminators measure 60 Ω. Block mismatched filters, invalid bitrate, wrong termination, and broken CANH. Arbitration, CRC/bit stuffing, analog signaling, bus faults, transceiver limits, and firmware are omitted. |
| 75 | Addressed RS-485 sensor network | Master MCU behavior model, two uniquely addressed sensor nodes, half-duplex transceivers, two 120 Ω bus-end terminators | Poll address 0x02 at 9,600 baud; only node 0x02 returns 24.6 °C while node 0x01 stays silent; confirm zero simultaneous drivers and 60 Ω combined termination. Reject duplicate addresses, unmatched polls, wrong termination, and broken A wiring. This is not Modbus and omits firmware, bias-network levels, enable delays, cable effects, and physical faults. |
| 76 | GPS NMEA coordinate display | 3.3 V source, GNSS RMC sentence fixture, ideal parser, text display | Validate the checksum on a known GPRMC sentence, require an active fix, convert 48°07.038′ N / 011°31.000′ E to 48.11730° / 11.51667°, and display the coordinates. Reject checksum failure, no-fix state, malformed fields, and broken UART wiring. GNSS reception, firmware, and position accuracy are not modeled. |
| 77 | RFID UID allowlist lock demonstration | 3.3 V source, ideal passive UID fixture, UID-only reader, allowlist controller, simulated lock indicator | UID 04A1B2C3 is granted and opens the simulated lock; unknown UID DEADBEEF is denied and leaves it locked. Test invalid allowlist and broken reader wiring. UID-only identification is cloneable and is not cryptographic authentication; RF coupling, anti-collision, firmware, and physical lock behavior are omitted. |
| 78 | NFC UID safe display | 3.3 V source, passive NFC UID/read-status fixture, ideal reader, controller, OLED text sink | Display UID 04A1B2C3 after an `ok` read and block display when the fixture reports a read error. Verify the tag-to-reader, reader-to-controller, and controller-to-OLED paths. UID is an identifier, not authentication; RF coupling, anti-collision, secure-card features, firmware, and physical NFC behavior are omitted. |
| 79 | EEPROM circular data logger | 3.3 V source, periodic temperature fixture, logger controller, EEPROM ring buffer, 4.7 kΩ SDA/SCL pull-ups, replay display | Record five 100 ms samples into a capacity-three circular buffer; verify the newest samples [30, 40, 50] replay in timestamp order and two older records are overwritten. Reject invalid sample values, zero capacity, and broken SDA. Physical EEPROM page behavior, endurance, power-loss recovery, firmware, and sensor accuracy are omitted. |
| 80 | Low-power sleep and interrupt wake | 3.3 V source, generic MCU behavior model, ordered interrupt-edge fixture, 1 kΩ LED resistor, red LED | For a 500 ms run, configured 8 µA sleep / 5 mA run current, 20 ms wake window and edges at 100 ms rising, 130 ms falling, and 400 ms rising, count two wakes, ignore the falling edge, estimate 40 ms awake and 460 ms asleep, and calculate 511.36 µA average supply current including the LED load. Reject malformed/out-of-range events, inconsistent current settings, and broken interrupt wiring. Currents are assumptions, not verified device data; firmware, specific MCU leakage, wake latency, oscillator startup, GPIO limits, and regulator losses are omitted. |
| 81 | BLE beacon advertising data configuration | 3.3 V source, advertising settings fixture, generic MCU behavior encoder, BLE advertiser model, payload report sink | Encode Flags 0x06, complete 16-bit Service UUID 0x180D, UTF-8 name “Adigun,” and signed Tx Power Level −4 dBm as separate length/type/data AD structures; assert exact bytes `02 01 06 03 03 0D 18 07 09 41 64 69 67 75 6E 02 0A FC`, 18-octet length, and the 31-octet legacy limit. Reject invalid fields, over-limit payloads, and broken data paths. This forms data only; it does not transmit or model radio behavior, discovery, timing, connection setup, GATT, privacy, or firmware. |
| 82 | LoRa temperature sensor node | 3.3 V source, temperature fixture, generic node controller, mock LoRa radio payload sink, send schedule report | Encode version 1, node 7, sequence 42, and signed temperature 24.6 °C in deci-degrees as `01 07 00 2A 00 F6`. In a 60,000 ms window with assumed 100 ms airtime and a configured 1% budget, accept six requests (600 ms total) and reject later requests after the budget is exhausted. Reject invalid settings and broken data paths. The fixed-window guard is not a regional duty-cycle rule or compliance evaluation; PHY, actual airtime, RF, firmware, and link quality are not modeled. |
| 83 | GSM alarm notifier mock | 3.3 V source, alarm event fixture, MCU AT-sequence behavior model, GSM modem response fixture, transaction report | For an active alarm, verify the `AT`, `AT+CREG?`, `AT+CMGF=1`, and `AT+CMGS="TEST_ONLY"` sequence, then record a mocked `+CMGS`/`OK` response. Inject an `ERROR` to confirm abort before message preparation; also test send rejection, no registration, and inactive alarm. The explicit TEST_ONLY mock never sends a message; modem acceptance is not delivery confirmation. |
| 84 | Local Wi-Fi relay controller fail-safe mock | 5 V source, local command/token fixture, generic controller, mock link-state module, ideal relay driver | Apply a local ON command when link is online, the placeholder token matches, and the requested 70 mA coil current is below the configured 100 mA guard. Verify OFF behavior, mismatched-token denial, offline fail-safe de-energization, overcurrent rejection, and broken-wire blocking. The token is not secure authentication; Wi-Fi traffic, remote access, physical relay contacts, coil dynamics, and firmware are not modeled. |
| 85 | Ethernet sensor node link and frame mock | 3.3 V source, sensor/configuration fixture, generic controller, mock PHY link state, report sink | Display `down → negotiating → up`; once configured and up, build a local 14-octet Ethernet-II header plus a six-octet sensor payload using the local experimental EtherType `0x88B5`. Assert exact bytes, no-frame behavior while down or unconfigured, invalid transition rejection, and broken-path blocking. Padding, FCS, preamble, PHY signaling, IP, switching, and actual packet transmission are omitted. |
| 86 | NEC-like IR remote action decoder | 5 V source, NEC-like timing fixture, ideal 38 kHz demodulator, action-map decoder, display sink | Decode command `0xA2` from `00 FF A2 5D` and select `TOGGLE_LIGHT`; verify another mapped command, an unmapped valid key, invalid pulse timing, broken byte complements, invalid actions, and broken wiring. The action is displayed only and does not operate an appliance. Optical behavior and firmware are omitted. |
| 87 | FM radio front-end response concept | ideal antenna placeholder, tuned band-pass response, linear gain | A bounded 88–108 MHz small-signal sweep peaks at the configured 100 MHz center and reports the ideal response; test rejects out-of-band and disconnected-path cases. No RF transmission or demodulation. |
| 88 | RFID inventory and slot collision fixture | ideal UID fixtures, deterministic slot estimator, report sink | Test valid UID parsing, duplicate UIDs, occupied slots, a deterministic collision slot, mismatched slot counts and disconnected report wiring. This is a bounded fixture, not an RF anti-collision protocol. |
| 89 | Bidirectional I²C bus level shifter | 3.3 V/5 V rails, four pull-ups, open-drain transition fixture, ideal translator | Test high/low propagation in both drive directions, rail ordering, pull-up range/current, overvoltage assertions and disconnected-line failures. Ideal logic only; no transistor edge or rise-time model. |
| 90 | USB-UART console known byte stream | local serial fixture, bridge mock, console report | Test a known bidirectional byte stream, framing, hex/text output, baud limit and wire-time estimate. USB enumeration, USB transport and physical line behavior are not modeled. |
| 91 | Electret microphone audio level meter | biased generic mic fixture, ideal preamp, envelope rectifier, ten-threshold LED bar | Test calibrated 1/5/10/20 mV peak inputs, frequency and gain bounds, mic bias voltage, thresholds, and disconnected paths. Acoustic sensitivity, noise, ripple and LED current are not modeled. |
| 92 | Audio tone generator and spectrum check | ideal sine source, sampled spectrum report | Verify 1 kHz frequency from coherent zero crossings, fundamental amplitude, second-harmonic bound, sample-rate constraints and rail clipping. This is an ideal electrical source; no speaker/acoustic model. |
| 93 | Guitar pickup high-impedance buffer | pickup sweep, source resistor, coupling capacitor, ideal JFET follower, finite output load | Test 20 Hz roll-off, 80 Hz response, near-unity 1 kHz gain, input impedance, component bounds and disconnected paths. Pickup inductance/resonance and cable behavior are not modeled. |
| 94 | Two-source weighted audio mixer | two level fixtures, explicit summing resistors, ideal unity buffer | Verify equal/unequal weighted output, several source combinations, headroom clipping block and open summing-node handling. This is a passive weighted average, not an inverting active mixer. |
| 95 | PWM audio DAC RC filter concept | PWM source fixture, series resistor, capacitor, finite load, report | Test duty-tracking average, calculated steady-state ripple, frequency/ripple trend, duty/frequency bounds and broken RC-node wiring. Switching edges and component non-idealities are excluded. |
| 96 | Digital potentiometer audio volume control | bounded sine fixture, loaded linear digital pot, output report | Verify all 11 command steps are monotonic under source/wiper/load resistance, plus invalid commands and disconnected output. No specific IC protocol or audio taper is modeled. |
| 97 | RGB LED PWM colour controller | 8-bit command fixture, ideal PWM outputs, common-cathode RGB LED, three current-limit resistors | Test orange/white/red colour vectors, exact PWM duties, per-channel average current, 20 mA peak limits and broken channel wiring. Optical/gamma calibration is excluded. |
| 98 | OLED sensor status panel | three sensor fixtures, ideal MCU formatter, 16×2 OLED sink | Test formatted values, all required ranges, explicit missing-sensor guidance, line bounds and broken data wiring. Sensor precision, bus timing, OLED commands and firmware are not modeled. |
| 99 | E-paper display updater | changed-tile fixture, ideal refresh controller, e-paper panel report | Test partial/full selection, 20% changed-area limit, partial-refresh counter reset, sleep/wake sequencing, panel-power blocking, busy timeout, and disconnected data path. Panel waveform physics and hardware execution are excluded. |
| 100 | Seven-segment clock | 24-hour time/tick fixture, ideal clock formatter, six-digit common-cathode segment report | Test the 23:59:58 + 3 rising-edge ticks midnight rollover to 00:00:01, all six digit vectors, invalid times/tick counts, unsupported mode, and broken segment wiring. RTC accuracy, multiplex timing, current drive, firmware, and hardware are excluded. |
| 101 | Buck converter baseline | 12 V source, configured controller, switch node, Schottky freewheel diode, inductor, output capacitor, resistive load, report sink | Test nominal 5.75 V CCM estimate, inductor/output ripple, diode loss, power balance, input-line and load changes, duty/input bounds, DCM rejection, and a broken switch-node path. This is a steady-state average model; switching transients and loop stability are excluded. |
| 102 | Boost converter baseline | 5 V source, configured controller, series inductor, switch node, Schottky output path, capacitor, load, report sink | Test 9.5 V step-up CCM estimate, inductor/output ripple, diode loss, power balance, input-line and load movement, duty bounds, DCM rejection, and a broken output path. Steady-state average model only; switching/control-loop behavior is excluded. |
| 103 | Buck-boost supply | source, target fixture, ideal four-switch average controller, inductor, output capacitor, load, report sink | Test buck operation (12 V to 9 V), boost operation (5 V to 9 V), crossover at equal rails, CCM and ripple bounds, current limit, invalid target, and broken inductor/output path. Efficiency is an explicit assumption; switch waveforms and control dynamics are excluded. |
| 104 | Li-ion charger concept | 5 V input, cell/temperature fixture, ideal CC/CV state model, phase report | Test constant-current, voltage-taper and termination states, no-cell, overvoltage, temperature inhibit, insufficient input headroom, setting mismatch, and broken status wiring. It is an ideal state estimate, not a charger IC or battery safety model. |
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




### Bluetooth references for example 81

- [Bluetooth Core Specification, GAP advertising and scan response data format](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-62/out/en/host/generic-access-profile.html) defines each AD structure as a one-octet length followed by data beginning with an AD type.
- [Bluetooth SIG Assigned Numbers](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Assigned_Numbers/out/en/Assigned_Numbers.pdf?v=1741583420176) lists the Common Data Type identifiers used here: Flags `0x01`, Complete List of 16-bit Service UUIDs `0x03`, Complete Local Name `0x09`, and Tx Power Level `0x0A`.
- [Bluetooth LE Primer](https://www.bluetooth.com/bluetooth-le-primer/) describes the 31-octet payload limit for legacy advertising packets. The example checks payload formatting and length locally; it does not validate a transmitter or over-the-air behavior.


### Ethernet reference for example 85

- [IANA IEEE 802 Numbers](https://www.iana.org/assignments/ieee-802-numbers) lists EtherType `0x88B5` as the IEEE local experimental value. The project uses it for a local mock only; it does not claim a production protocol assignment.
