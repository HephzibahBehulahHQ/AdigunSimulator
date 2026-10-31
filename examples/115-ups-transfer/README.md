# Example 115 — Battery-powered UPS

Models a low-voltage charger input, battery reserve, ideal-diode source selection, and a 24 Ω resistive load. In the default case the load draws 6 W from a 12 V output. The fixture can toggle mains availability and set battery capacity, state of charge, minimum reserve, and requested hold-up time.

## Expected behavior
- With mains present, output is maintained and the battery charge-current estimate respects the configured charger limit.
- With mains lost, the ideal-diode model transfers the output to the battery while state of charge is above reserve.
- At 80% state of charge with a 20% reserve, estimated energy supports the 10-minute request.
- At 23%, output remains enabled but the estimated hold-up is below the 10-minute request.
- At the reserve threshold, the modeled battery output is disabled.

Transfer timing, chemistry, aging, cell balancing/protection, charge algorithm, inverter conversion, inrush, thermal behavior, runtime tolerance, and hardware safety are not modeled. This is not a product runtime guarantee or an AC mains design.
