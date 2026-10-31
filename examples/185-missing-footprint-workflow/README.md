# Example 185 — Missing-footprint workflow

## Objective
Attempt a PCB update for the valid NE555 astable schematic and produce a required resolution report for components with no verified PCB view mapping.

## Run and expected result
The schematic validates and its bounded analytical 555 estimate completes. PCB update remains blocked because the starter NE555 and other generic parts have no verified footprint mappings. The report lists every blocked reference and offers three review paths. The project is unchanged; no automatic substitution or footprint assignment occurs.

## Limits
This workflow does not verify a package drawing, footprint, pad numbering, layout geometry, DRC, or manufacturing output. A user must resolve a mapping using authoritative package data before a PCB update can proceed.
