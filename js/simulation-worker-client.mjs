let nextRequestId = 1;
export const MAX_SIMULATION_PROJECT_BYTES = 4 * 1024 * 1024;

export function createSimulationWorkerRun(project, { WorkerClass = globalThis.Worker, timeoutMs = 10000 } = {}) {
  const unavailable = (message) => ({ state: "unavailable", engine: "Worker-isolated bounded analysis", message });
  let projectBytes;
  try {
    projectBytes = new TextEncoder().encode(JSON.stringify(project)).byteLength;
  } catch {
    return { promise: Promise.resolve({ state: "blocked", engine: "Worker-isolated bounded analysis", message: "The project is not serializable; analysis was not attempted." }), cancel() {} };
  }
  if (projectBytes > MAX_SIMULATION_PROJECT_BYTES) {
    return { promise: Promise.resolve({ state: "blocked", engine: "Worker-isolated bounded analysis", message: `The serialized project exceeds the ${MAX_SIMULATION_PROJECT_BYTES}-byte worker input limit; analysis was not attempted.` }), cancel() {} };
  }
  if (typeof WorkerClass !== "function") return { promise: Promise.resolve(unavailable("This browser does not support module workers; analysis was not attempted.")), cancel() {} };

  let worker;
  try {
    worker = new WorkerClass(new URL("./simulation-worker.mjs", import.meta.url), { type: "module" });
  } catch (error) {
    return { promise: Promise.resolve(unavailable(error instanceof Error ? error.message : "The simulation worker could not start; analysis was not attempted.")), cancel() {} };
  }

  const requestId = nextRequestId++;
  let settled = false;
  let resolveRun;
  let timeout;
  const promise = new Promise((resolve) => { resolveRun = resolve; });
  const finish = (result) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    worker.terminate();
    resolveRun(result);
  };

  worker.addEventListener("message", (event) => {
    const message = event.data;
    if (message?.requestId !== requestId) return;
    if (message.type === "result") {
      if (!message.result || typeof message.result.state !== "string") {
        finish({ state: "blocked", engine: "Worker-isolated bounded analysis", message: "The analysis worker returned an invalid result." });
        return;
      }
      finish(message.result);
    }
    else if (message.type === "error") finish({ state: "blocked", engine: "Worker-isolated bounded analysis", message: message.error?.message ?? "The analysis worker returned an error.", errors: [{ code: message.error?.code ?? "WORKER_ERROR", message: message.error?.message ?? "The analysis worker returned an error." }] });
  });
  worker.addEventListener("error", (event) => finish({ state: "blocked", engine: "Worker-isolated bounded analysis", message: event.message || "The analysis worker failed to load." }));
  timeout = setTimeout(() => finish({ state: "blocked", engine: "Worker-isolated bounded analysis", message: `The analysis exceeded its ${timeoutMs} ms worker limit and was stopped.` }), timeoutMs);
  try {
    worker.postMessage({ type: "run", requestId, project });
  } catch (error) {
    finish({ state: "blocked", engine: "Worker-isolated bounded analysis", message: error instanceof Error ? error.message : "The project could not be transferred to the analysis worker." });
  }

  return {
    promise,
    cancel() { finish({ state: "cancelled", engine: "Worker-isolated bounded analysis", message: "The analysis was cancelled." }); }
  };
}
