# Manufacturer datasheet checksum capture

Captured 2026-11-02 by downloading the PDF from each listed official manufacturer HTTPS URL and hashing the downloaded file bytes with PowerShell `Get-FileHash -Algorithm SHA256`. Temporary PDF copies were removed after hashing and were not committed.

| Part | Official source | Downloaded bytes | SHA-256 |
|---|---|---:|---|
| TI LM555P | [LM555 datasheet](https://www.ti.com/lit/ds/symlink/lm555.pdf) | 1,221,961 | `0bb44c3df8e5254bd887333faf4303a86722e1e1c4c7c2f038200ff8f540d99d` |
| TI SN74HC00N | [SNx4HC00 datasheet](https://www.ti.com/lit/ds/symlink/sn74hc00.pdf) | 2,135,969 | `3d3bdace13c7ebeb542e516ae670fc9d7b0b551f9d5222579294e330af38c111` |
| TI LM7805CT/NOPB | [LM7800/LM7805 family datasheet](https://www.ti.com/lit/ds/symlink/lm7800.pdf) | 2,712,955 | `49391342cf3b05f89ae94607257ef03f678ae9f1a3bdd388252adb8b00da043d` |
| Microchip MCP6002-I/P | [MCP600x family datasheet](https://ww1.microchip.com/downloads/aemDocuments/documents/MSLD/ProductDocuments/DataSheets/MCP6001-1R-1U-2-4-1-MHz-Low-Power-Op-Amp-DS20001733L.pdf) | 931,340 | `4f879ab31115ecfa149dfefa62073c9efdbc4beccbdc3a8d7e10281f3877f8fb` |

These checksums establish the identity of the downloaded datasheet bytes at capture time. They do not establish licensing for symbol, footprint, or simulation-model assets and do not replace a human technical review.

