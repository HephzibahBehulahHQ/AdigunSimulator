import { runSupportedAnalysis } from "./core.mjs";

const MIN_RESISTANCE_OHMS = 0.01;
const MAX_RESISTANCE_OHMS = 1e9;
const MAX_SWEEP_POINTS = 101;

export function runParameterSweep(project) {
  const config = project?.parameterSweep;
  if (!config || config.kind !== "resistor-sweep" || !Array.isArray(config.values)) {
    return { state: "blocked", engine: "Adigun parameter sweep", errors: [{ code: "SWEEP_CONFIGURATION", message: "A resistor sweep with explicit numeric values is required." }], warnings: [] };
  }
  const resistor = project.components?.find(component => component.reference === config.reference && component.libraryId === "passive.resistor");
  if (!resistor) return { state: "blocked", engine: "Adigun parameter sweep", errors: [{ code: "SWEEP_COMPONENT", message: "The configured resistor reference was not found." }], warnings: [] };
  if (config.values.length < 3 || config.values.length > MAX_SWEEP_POINTS || config.values.some(value => !Number.isFinite(value) || value < MIN_RESISTANCE_OHMS || value > MAX_RESISTANCE_OHMS) || new Set(config.values).size !== config.values.length) {
    return { state: "blocked", engine: "Adigun parameter sweep", errors: [{ code: "SWEEP_VALUES", message: "Choose 3 to 101 unique, finite resistance values from 0.01 Ω to 1 GΩ." }], warnings: [] };
  }
  const points = [];
  for (const resistanceOhms of config.values) {
    const trial = JSON.parse(JSON.stringify(project));
    const trialResistor = trial.components.find(component => component.reference === config.reference);
    trialResistor.value = `${resistanceOhms} Ω`;
    const analysis = runSupportedAnalysis(trial);
    if (analysis.state !== "complete" || analysis.result?.kind !== "led-current-limiter") {
      return { state: "blocked", engine: "Adigun parameter sweep", errors: [{ code: "SWEEP_TRIAL_UNSUPPORTED", message: `Trial at ${resistanceOhms} Ω could not be analyzed as an LED current limiter.` }], warnings: analysis.warnings ?? [] };
    }
    points.push({ resistanceOhms, currentA: analysis.result.currentA, resistorPowerW: analysis.result.resistorPowerW, ledOn: analysis.result.ledOn });
  }
  return {
    state: "complete",
    engine: "Bounded analytical LED resistor sweep",
    errors: [],
    warnings: [{ code: "IDEAL_MODEL", message: "Ideal DC LED and resistor assumptions are used; tolerances, temperature drift, transient behavior, and device limits are not modeled." }],
    result: { kind: "parameter-sweep", parameterReference: config.reference, metricKey: "currentA", metricUnit: "A", sampleCount: points.length, points }
  };
}
