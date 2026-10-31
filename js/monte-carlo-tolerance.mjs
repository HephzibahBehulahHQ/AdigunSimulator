import { runSupportedAnalysis } from "./core.mjs";

const MAX_SAMPLES = 5000;
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
}
export function runMonteCarloTolerance(project) {
  const plan = project?.monteCarloTolerance;
  if (!plan || plan.kind !== "resistor-tolerance" || !Number.isSafeInteger(plan.seed) || plan.seed <= 0 || !Number.isInteger(plan.sampleCount) || plan.sampleCount < 10 || plan.sampleCount > MAX_SAMPLES || !Number.isFinite(plan.tolerancePct) || plan.tolerancePct <= 0 || plan.tolerancePct > 20) return { state: "blocked", engine: "Seeded resistor-tolerance Monte Carlo", errors: [{ code: "MONTE_CARLO_CONFIGURATION", message: "Set a positive integer seed, 10–5000 trials, and tolerance above 0% through 20%." }], warnings: [] };
  const resistor = project.components?.find(component => component.reference === plan.reference && component.libraryId === "passive.resistor");
  const nominalOhms = Number.parseFloat(String(resistor?.value ?? "").replaceAll(",", ""));
  if (!resistor || !Number.isFinite(nominalOhms) || nominalOhms <= 0) return { state: "blocked", engine: "Seeded resistor-tolerance Monte Carlo", errors: [{ code: "MONTE_CARLO_COMPONENT", message: "The configured resistor reference must exist with a positive nominal resistance." }], warnings: [] };
  const random = makeRandom(plan.seed), values = [];
  for (let index = 0; index < plan.sampleCount; index += 1) {
    const factor = 1 + ((random() * 2) - 1) * plan.tolerancePct / 100;
    const trial = JSON.parse(JSON.stringify(project));
    trial.components.find(component => component.reference === plan.reference).value = `${nominalOhms * factor} Ω`;
    delete trial.monteCarloTolerance;
    const analysis = runSupportedAnalysis(trial);
    if (analysis.state !== "complete" || analysis.result?.kind !== "led-current-limiter") return { state: "blocked", engine: "Seeded resistor-tolerance Monte Carlo", errors: [{ code: "MONTE_CARLO_TRIAL_UNSUPPORTED", message: "The supported LED current limiter model could not analyze a randomized trial." }], warnings: analysis.warnings ?? [] };
    values.push(analysis.result.currentA);
  }
  const sorted = [...values].sort((left, right) => left - right), mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const standardDeviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
  const bins = Array.from({ length: 10 }, (_, index) => ({ index, count: 0 })), range = sorted.at(-1) - sorted[0];
  for (const value of values) bins[range === 0 ? 0 : Math.min(9, Math.floor(((value - sorted[0]) / range) * 10))].count += 1;
  return { state: "complete", engine: "Seeded analytical resistor-tolerance Monte Carlo", errors: [], warnings: [{ code: "MODEL_SCOPE", message: "Only the stated resistor tolerance is sampled. The ideal LED forward drop, temperature, aging, capacitor tolerance, and production yield are not modeled." }], result: { kind: "monte-carlo-tolerance", parameterReference: plan.reference, nominalOhms, tolerancePct: plan.tolerancePct, seed: plan.seed, sampleCount: values.length, metricKey: "currentA", metricUnit: "A", minimum: sorted[0], maximum: sorted.at(-1), mean, standardDeviation, median: sorted[Math.floor(sorted.length / 2)], histogram: bins } };
}
