import { runProjectAnalysis } from "./analysis-dispatch.mjs";

export function handleSimulationWorkerMessage(message) {
  if (!message || message.type !== "run" || !Number.isSafeInteger(message.requestId) || message.requestId < 1 || !message.project) {
    return { type: "error", requestId: message?.requestId ?? null, error: { code: "INVALID_REQUEST", message: "The simulation worker received an invalid request." } };
  }
  try {
    return { type: "result", requestId: message.requestId, result: runProjectAnalysis(message.project) };
  } catch (error) {
    return { type: "error", requestId: message.requestId, error: { code: "ANALYSIS_EXCEPTION", message: error instanceof Error ? error.message : "The analysis could not be completed." } };
  }
}

if (typeof self !== "undefined" && typeof self.addEventListener === "function") {
  self.addEventListener("message", (event) => self.postMessage(handleSimulationWorkerMessage(event.data)));
}
