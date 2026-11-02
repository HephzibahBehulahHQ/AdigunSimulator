# Example 194 — BOM export and cost placeholder

## Objective
Create a grouped bill of materials from project components and export it as CSV using checked-in library descriptions and project values.

## Expected result
The supplied LED project contains four component instances and produces a BOM grouped by verified library ID and value. The CSV includes references, quantity, library ID, description and value. Manufacturer, MPN, price, currency, source and date remain empty when the checked-in record supplies no such evidence. In particular, an absent price is `null` in the report and a blank CSV cell, never a fabricated zero or market estimate.

A price is included only when the component carries a numeric unit cost, ISO currency code, HTTPS source URL and date. A total is shown only when every row has a sourced price in the same currency.

## Limits
This is a project-data export aid, not a supplier quote, purchasing commitment, inventory check, tax/shipping estimate or price database. Verify part identity and sourcing before procurement.

## Direct circuit analysis result

The base 5 V, 330 Ω, 2 V LED circuit has a bounded DC estimate of 9.09 mA and 27.27 mW resistor dissipation. This calculator/advisor output is a separate analytical tool result.
