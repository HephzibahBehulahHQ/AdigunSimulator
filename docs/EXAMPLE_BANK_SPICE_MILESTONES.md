# Example-bank and model upgrade

Approved follow-up, 2026-11-10. Preserve the existing Example menu and native project format.

| Milestone | Completion evidence | State |
| --- | --- | --- |
| Example coverage audit | Every shipped project checked for schema, executable analysis, PCB data, missing model/package/pin mappings; machine-readable report | Pending |
| Example navigation | Search plus Type, Level and Category filters inside the existing Example menu; keyboard/mobile tests | Pending |
| PCB coverage | Correct mapped footprints and pad nets displayed for supported physical parts; explicit, actionable mapping requirements for unmapped parts | Pending |
| SPICE integration | Licensed reproducible engine build; worker adapter, model provenance, convergence/cancellation and reference-deck tests | Pending |
| Comparator realism | Identified manufacturer part/model; documented and tested hysteresis, bias/offset, delay, output loading, supply limits, temperature and tolerances within model coverage | Pending |
| Battery realism | Separate sourced chemistry/state-of-charge/temperature model and validation, not an implied comparator feature | Pending |
| Scalable circuit bank | Indexed, deduplicated native projects with sources/licenses, individually meaningful assertions and recorded model limits | Pending |

The requested target is 1,000,000+ distinct advanced circuits. Current counts must be reported from the actual registry; parameter permutations and generated duplicates do not constitute validated projects. No claim of reaching this target is made.

The existing comparator text describes model limitations, not a solver failure. Keep that disclosure until a replacement is validated. SPICE alone does not guarantee that every device or battery parameter is modeled. Ladder instructions, instruments, grounds and test sources do not have inherent PCB packages; do not invent physical footprints or claim every conceptual example is a fabrication-ready board.

Complete and publish the already implemented ladder/canvas milestone before these follow-ups, preserving the deployed oscilloscope repair.
