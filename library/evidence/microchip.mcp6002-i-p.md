# Microchip MCP6002-I/P evidence review

Review state: candidate; not verified  
Evidence checked: 2026-11-02

## Primary manufacturer evidence

- [Microchip MCP6002 product page](https://www.microchip.com/en-us/product/MCP6002)
- [MCP6001/1R/1U/2/4 family datasheet](https://ww1.microchip.com/downloads/aemDocuments/documents/MSLD/ProductDocuments/DataSheets/MCP6001-1R-1U-2-4-1-MHz-Low-Power-Op-Amp-DS20001733L.pdf)
- [Datasheet checksum capture](datasheet-checksums-2026-11-02.md)

Microchip lists the exact MCP6002-I/P in production, in 8-lead PDIP, with an operating supply range of 1.8 V to 6 V and the `I` temperature range of −40 °C to +85 °C. The datasheet's MCP6002 pin-function table maps:

| Pin | Signal | Logical electrical type |
|---:|---|---|
| 1 | OUTA | analog |
| 2 | INA− | analog |
| 3 | INA+ | analog |
| 4 | VSS | power-in |
| 5 | INB+ | analog |
| 6 | INB− | analog |
| 7 | OUTB | analog |
| 8 | VDD | power-in |

The canonical PDF was downloaded from Microchip's official URL on 2026-11-02 (931,340 bytes). Its SHA-256 is `4f879ab31115ecfa149dfefa62073c9efdbc4beccbdc3a8d7e10281f3877f8fb`.

## Verification still required

- Add licensed symbol and PDIP-8 footprint assets and independently validate pad mapping and geometry.
- Attach and validate an approved model or keep the explicit not-modelled limit.
- Complete remaining warnings/alternates, breadboard, and four-locale review metadata.
- Obtain named independent human review and date.

The part remains a candidate and is excluded from the verified-part count.

