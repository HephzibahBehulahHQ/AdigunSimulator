# Example 178 — Access-control strike-lock mock

## Objective
Use a mock RFID credential allowlist to request a bounded strike-unlock command and record a mock grant/deny audit event.

## Run and expected result
The allowlist contains CARD-A100 and the unlock duration is 3000 ms. Events at 0, 500, 2999, 3000, and 4000 ms should produce grant, deny, deny, deny, grant. A denied credential never extends a previously granted interval; the strike is locked at exactly 3000 ms.

## Scope
Mock IDs and an in-memory result only. No real RFID reader, cryptographic credential, physical lock, secure audit storage, network, egress behavior, or access-control security assurance is modeled.
