# AdigunSimulator

AdigunSimulator is a local-first electrical and electronics design workspace for breadboard prototyping, schematic capture, PCB design, and technically honest circuit analysis.

**Project:** [adigunsimulator.hephzibahbehulah.com](https://adigunsimulator.hephzibahbehulah.com/)

## Current implementation status

The current implementation establishes a dependency-free browser foundation: a responsive engineering workspace, a versioned native project document, local save/export/import, a small explicitly labelled starter library, shared component identity and project-net layouts across views, view-specific move/snap controls, overlap/unconnected-pin/source-short checks, four interface locales, bounded DC results for the LED-resistor and unloaded voltage-divider topologies, an anti-parallel LED polarity indicator, an ideal pushbutton LED circuit with pull-down, an ideal latching SPDT LED switch, ideal PWM LED average-current and low-battery comparator models, an ideal transformer/rectifier/regulator ripple envelope, a USB LED cold-state PTC warning, a solar garden-light day/night estimate, an ideal supercapacitor hold-up curve, a loaded passive treble-cut tone control, a sampled full-wave bridge rectifier and reservoir-capacitor ripple estimate, ideal Zener shunt regulation a single-pulse TVS clamp estimate, NTC Beta-law temperature-divider and LDR comparator night-light and ideal NE555 astable and monostable timing analyses plus independent NE556 dual-astable timing and ideal inverting and non-inverting op-amp midband gain plus unity-gain voltage-follower sweeps and ideal comparator threshold, Schmitt hysteresis, and dual-comparator window switching and reference-buffer load sweeps and ideal NPN common-emitter bias/sine estimates and emitter-follower DC sweeps and NMOS flyback-coil estimates, ideal P-MOS high-side switching, and generic NPN relay-coil/flyback release-decay estimates, and static four-switch H-bridge motor estimates, and generic electret-microphone audio preamplifier estimates, and generic class-AB audio amplifier/speaker estimates, and active low-pass frequency responses, and Wien bridge startup/amplitude estimates, and ideal AND/OR/XOR gate truth tables, XOR odd-parity checking, and a cross-coupled NOR SR latch with explicit set/reset/hold state, and ideal positive-edge D flip-flop sampling and hold with timing limits disclosed, and ideal JK toggle/divide-by-two edge behavior with asynchronous clear, and a four-bit modulo-16 rising-edge counter with asynchronous reset, and a BCD decade counter with tested seven-segment digit vectors, and a six-phase traffic-light FSM that blocks opposing greens, and a tested three-sample digital input debounce model that rejects short bounce sequences, and a one-hot four-bit shift-register LED chaser, plus an exhaustive 4:1 multiplexer model that tests 64 data/select vectors, and a 2:4 decoder that asserts exactly one LED for each address, plus a four-input priority encoder with D3-first precedence and a valid flag, and a four-bit ALU tested across all 512 unsigned add/subtract cases, plus an 8N1 UART frame generator with baud and byte validation, a UART 8N1 receiver that decodes supplied frames and flags start/stop errors, an ideal I²C register-read transaction model that checks address ACK/NACK and pull-up topology, an SPI mode-0 byte transfer model that verifies MSB-first sampling and chip-select state, an ideal I²C EEPROM byte write/read-back with address/register ACK checks, an Uno-class D13 GPIO blink sequence model with a bounded time trace and LED-current estimate, a sampled button-debounce model that rejects bounce and toggles once per stable press, a 10-bit potentiometer-to-PWM dimmer model driving an ideal low-side MOSFET LED load, a linear temperature sensor/10-bit ADC model that formats a one-line LCD result, an ultrasonic echo-time distance estimate with range checks and OLED text output, an ideal 10-bit potentiometer-to-servo PWM pulse and position mapping, a bipolar stepper full-step sequence with signed angular travel and duration estimates, an offline ESP32-class 12-bit ADC temperature telemetry payload mock with no network transmission, and an RP2040/Pico 12-bit ADC voltmeter with a resistor-divider ratio check and OLED text output, an ideal STM32 timer PWM frequency/duty and LED-load estimate, a PIC-class 10-bit ADC-to-ten-segment LED bargraph model, an ideal AVR NEC-like IR frame decoder, and linear resistor networks with ideal voltage and current sources, and ideal first-order RC/RL responses including selectable RC charge/discharge and RC low-pass and high-pass plus RL low-pass frequency responses. All 200 catalogue projects are released and tested; ten supplemental analytical studies are also available.

PCB projects with stored board, footprint, pad, and net data support footprint moves, interactive F.Cu routing between same-net pads, and B.Cu routing between plated through-hole pads on a declared two-layer board. The route tool enforces the stored board bounds, net-class trace width, pad/track clearance, and keep-outs. Bounded PCB checks and educational Gerber/Excellon/BOM export are available for mapped projects; they are not a standards-complete DRC or manufacturing release. Autorouting, vias, bottom-side SMD routing, and manufacturer-specific production checks are unavailable.

The supported circuit-analysis dispatcher runs in a cancelable module worker with a 10-second job limit and 4 MiB serialized-project input cap. The input cap bounds payload size but is not a hard browser heap limit. The release-candidate test harness remains a separate asynchronous UI workflow. Worker isolation does not add new simulation models.

The surge-protected-input example estimates one source-resistance-limited pulse, ideal TVS energy, fuse I²t warning/trip, and an RC-filtered output. It is not a standardized surge test or production qualification.

It does **not** yet claim a 1,000 verified-part library, general SPICE simulation, arbitrary nonlinear or multi-element reactive/transient analysis, PCB manufacturing readiness, physical hardware safety, cloud project synchronization, or an AI service. Unsupported actions are disclosed in the interface rather than simulated.

Optional email sign-in is provided by Supabase Auth. Guest editing and browser-local project saves remain available without an account. Signing in alone never uploads a project. A signed-in user can explicitly save the current native project to the AdigunSimulator cloud or open a saved project/version from the Account dialog.

Cloud saves use AdigunSimulator-specific Supabase tables with owner-only row-level security. A project is uploaded only after the user confirms **Save project to cloud**; later edits remain local until saved again. Each account can store up to 10 cloud projects, each document is limited to 1.4 MB, and the latest 5 previous versions are retained. Cloud documents remain until the owner deletes them; deleting a project also deletes its versions. The browser-local copy is unaffected. Auth account deletion cascades to cloud documents. The feature adds no AI processing or paid-plan change; it shares the existing Supabase Free project quota.

## Run locally

With Node.js 22 or later, run `npm run dev` from this repository and open `http://127.0.0.1:4176/`. No dependency install is required. Use `npm run dev -- --port=4177` if that port is busy. The server prints the product name and source directory, binds only to loopback, and serves this checkout regardless of the shell's working directory.

Use HTTP rather than opening `index.html` as a file: the application loads JavaScript modules, workers and JSON examples. The preview server explicitly serves `.js` and `.mjs` as JavaScript. On Windows, Python's generic static server may inherit a registry MIME mapping of `text/plain` for `.mjs`; browsers then reject module loading and leave an empty workspace. A rendered header alone is not evidence that the application has started. Confirm the component list, example canvas, and current-year footer populate.

## Checks

```text
npm test
npm run check
npm run validate:library
```

## Project data

Projects are stored locally in browser storage and can be exported as a native JSON document. The data model and validation rules live in `js/core.mjs`.

The part evidence gate is implemented in `js/part-ledger.mjs`. Run `npm run validate:library` to validate the ledger and report truthful candidate/in-review/verified coverage; only verified records count toward the 1,000-part target.

## Ownership

Hephzibah Behulah → HB Elektroniker → AdigunSimulator.

