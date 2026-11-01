# 083 — GSM alarm notifier mock

## Purpose

Check a local SMS-style AT command sequence for an active alarm and stop on modem errors, while distinguishing mock modem acceptance from confirmed delivery.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| SIG1 | `input.gsm-alarm-event` | AlarmState active; Message TEMP_LIMIT_EXCEEDED; Responses OK|+CREG:0,1|OK|>; SendResult +CMGS:0|OK |
| U1 | `active.gsm-alarm-controller-ideal` | Mode sms-mock; Destination TEST_ONLY; CommandTimeoutMs 1000 |
| MODEM1 | `active.gsm-modem-at-mock` | Mode AT-mock; Registration registered |
| DISP1 | `output.gsm-sms-report` | Mocked modem transaction result |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `controller:VCC`, `modem:VCC`, `report:VCC`
- **GND:** `supply:-`, `event:GND`, `controller:GND`, `modem:GND`, `report:GND`, `ground:0`
- **ALARM:** `event:ALARM`, `controller:ALARM`
- **UART_TX:** `controller:TX`, `modem:RX`
- **UART_RX:** `modem:TX`, `controller:RX`
- **REPORT:** `controller:REPORT`, `report:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-gsm-alarm-mock`
- Engine: Mock GSM AT-command alarm transaction
- Engine version: `adigun-simulator@0.1.0`
- Model version: `mock-gsm-sms-at-transaction-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41182702171

Recorded expected result:

```json
{
  "alarmState": "active",
  "destination": "TEST_ONLY",
  "commands": [
    "AT",
    "AT+CREG?",
    "AT+CMGF=1",
    "AT+CMGS=\"TEST_ONLY\""
  ],
  "responses": [
    "OK",
    "+CREG:0,1",
    "OK",
    ">"
  ],
  "sendResult": [
    "+CMGS:0",
    "OK"
  ],
  "commandsCompleted": 4,
  "transactionState": "mock-modem-accepted",
  "messageBody": "TEMP_LIMIT_EXCEEDED",
  "modemAccepted": true,
  "deliveryConfirmed": false,
  "radioTransmitted": false,
  "firmwareExecuted": false,
  "errorHandling": "stop at first unexpected modem response"
}
```

## Safety and model limits

Local TEST_ONLY transaction simulation only. It never contacts a mobile network or sends an SMS. Registration and modem responses are fixtures; modem firmware, SIM state, network service, RF behavior, and delivery are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/083-gsm-alarm-notifier.adigun.json`.