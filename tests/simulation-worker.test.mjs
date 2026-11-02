import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createProject, runSupportedAnalysis } from "../js/core.mjs";
import { handleSimulationWorkerMessage } from "../js/simulation-worker.mjs";
import { createSimulationWorkerRun, MAX_SIMULATION_PROJECT_BYTES } from "../js/simulation-worker-client.mjs";

class FakeWorker {
  static autoReply = true;
  static instances = [];
  listeners = new Map();
  constructor(url, options) { this.url = url; this.options = options; FakeWorker.instances.push(this); }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  postMessage(message) {
    this.request = message;
    if (FakeWorker.autoReply) queueMicrotask(() => this.emit("message", { data: handleSimulationWorkerMessage(message) }));
  }
  emit(type, event) { this.listeners.get(type)?.(event); }
  terminate() { this.terminated = true; }
}

test("worker message handler returns the same supported result and rejects invalid requests", () => {
  const project = createProject();
  const message = handleSimulationWorkerMessage({ type: "run", requestId: 1, project });
  assert.equal(message.type, "result");
  assert.equal(message.requestId, 1);
  assert.deepEqual(message.result, runSupportedAnalysis(project));
  assert.deepEqual(handleSimulationWorkerMessage({ type: "run", requestId: -1, project }), {
    type: "error", requestId: -1, error: { code: "INVALID_REQUEST", message: "The simulation worker received an invalid request." }
  });
});

test("worker dispatcher reaches each released analysis fixture's recorded complete or blocked state", async () => {
  const registry = JSON.parse(await readFile(new URL("../examples/manifest.json", import.meta.url), "utf8"));
  const fixtures = registry.examples.filter((example) => example.id !== "200-release-candidate-e2e");
  assert.equal(fixtures.length, 209);
  for (const [index, example] of fixtures.entries()) {
    const project = JSON.parse(await readFile(new URL(`../${example.projectFile}`, import.meta.url), "utf8"));
    const expectedState = example.verification.expectedState ?? example.verification.expectedResult?.state ?? "complete";
    const response = handleSimulationWorkerMessage({ type: "run", requestId: index + 1, project });
    assert.equal(response.type, "result", example.id);
    assert.equal(response.result.state, expectedState, example.id);
    assert.equal(typeof response.result.engine, "string", example.id);
  }
});

test("worker client runs module worker analysis and terminates after a result", async () => {
  FakeWorker.autoReply = true;
  const project = createProject();
  const expected = runSupportedAnalysis(project);
  const run = createSimulationWorkerRun(project, { WorkerClass: FakeWorker });
  assert.deepEqual(await run.promise, expected);
  const worker = FakeWorker.instances.at(-1);
  assert.equal(worker.options.type, "module");
  assert.equal(worker.request.type, "run");
  assert.equal(worker.terminated, true);
});

test("worker client cancellation terminates the run without returning a result", async () => {
  FakeWorker.autoReply = false;
  const run = createSimulationWorkerRun(createProject(), { WorkerClass: FakeWorker });
  run.cancel();
  assert.equal((await run.promise).state, "cancelled");
  assert.equal(FakeWorker.instances.at(-1).terminated, true);
  FakeWorker.autoReply = true;
});

test("worker client rejects malformed results and preserves worker error messages", async () => {
  class MalformedWorker extends FakeWorker {
    postMessage(message) { queueMicrotask(() => this.emit("message", { data: { type: "result", requestId: message.requestId } })); }
  }
  const malformed = await createSimulationWorkerRun(createProject(), { WorkerClass: MalformedWorker }).promise;
  assert.equal(malformed.state, "blocked");
  assert.match(malformed.message, /invalid result/);

  class ErrorWorker extends FakeWorker {
    postMessage(message) { queueMicrotask(() => this.emit("message", { data: { type: "error", requestId: message.requestId, error: { code: "ANALYSIS_EXCEPTION", message: "test failure" } } })); }
  }
  const error = await createSimulationWorkerRun(createProject(), { WorkerClass: ErrorWorker }).promise;
  assert.equal(error.errors[0].code, "ANALYSIS_EXCEPTION");
  assert.equal(error.message, "test failure");
});

test("worker client applies its configured timeout and reports unavailable workers honestly", async () => {
  FakeWorker.autoReply = false;
  const run = createSimulationWorkerRun(createProject(), { WorkerClass: FakeWorker, timeoutMs: 5 });
  const result = await run.promise;
  assert.equal(result.state, "blocked");
  assert.match(result.message, /5 ms worker limit/);
  assert.equal(FakeWorker.instances.at(-1).terminated, true);
  const unavailable = await createSimulationWorkerRun(createProject(), { WorkerClass: null }).promise;
  assert.equal(unavailable.state, "unavailable");
  assert.match(unavailable.message, /not support module workers/);
  FakeWorker.autoReply = true;
});

test("worker client bounds serialized project size before creating a worker", async () => {
  const workerCount = FakeWorker.instances.length;
  const project = { oversized: "x".repeat(MAX_SIMULATION_PROJECT_BYTES) };
  const result = await createSimulationWorkerRun(project, { WorkerClass: FakeWorker }).promise;
  assert.equal(result.state, "blocked");
  assert.match(result.message, /worker input limit/);
  assert.equal(FakeWorker.instances.length, workerCount);

  const circular = {};
  circular.self = circular;
  const serialization = await createSimulationWorkerRun(circular, { WorkerClass: FakeWorker }).promise;
  assert.equal(serialization.state, "blocked");
  assert.match(serialization.message, /not serializable/);
  assert.equal(FakeWorker.instances.length, workerCount);
});
