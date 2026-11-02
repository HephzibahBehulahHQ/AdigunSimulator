import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createEmptyProject, addComponent, connectPins } from "../js/core.mjs";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { handleSimulationWorkerMessage } from "../js/simulation-worker.mjs";
import { buildBomReport } from "../js/bom-report.mjs";

function makeAndCircuit(libraryId = "active.logic-and-ideal") {
  let project = createEmptyProject({ name: "Digital event verification" });
  for (const part of ["power.dc-source", "power.dc-source", "power.dc-source", libraryId, "ground.signal", "instrument.logic-probe", "instrument.logic-probe", "instrument.logic-probe"]) project = addComponent(project, part);
  project = {
    ...project,
    components: project.components.map((part, index) => ({ ...part, reference: ["VCC", "VA", "VB", "U1", "GND", "PA", "PB", "PY"][index], value: index === 0 ? "5 V" : "0 V" }))
  };
  const pin = (reference, name) => `${project.components.find((part) => part.reference === reference).instanceId}:${name}`;
  for (const [first, second] of [
    [pin("VCC", "+"), pin("U1", "VCC")],
    [pin("VCC", "-"), pin("VA", "-")],
    [pin("VCC", "-"), pin("VB", "-")],
    [pin("VCC", "-"), pin("U1", "GND")],
    [pin("VCC", "-"), pin("GND", "0")],
    [pin("VA", "+"), pin("U1", "A")],
    [pin("VB", "+"), pin("U1", "B")],
    [pin("VA", "+"), pin("PA", "IN")],
    [pin("VB", "+"), pin("PB", "IN")],
    [pin("U1", "Y"), pin("PY", "IN")]
  ]) project = connectPins(project, first, second);
  const probes = ["VA:+", "VB:+", "U1:Y"].map((endpoint) => project.nets.find((net) => net.endpoints.includes(pin(...endpoint.split(":")))).id);
  return { ...project, digitalEventSimulation: { stopTimeNs: 500, events: [], probeNets: probes } };
}

test("digital event engine evaluates full truth tables for AND, OR, XOR and NOR gates", () => {
  const operations = [
    ["active.logic-and-ideal", (a, b) => a && b],
    ["active.logic-or-ideal", (a, b) => a || b],
    ["active.logic-xor-ideal", (a, b) => a !== b],
    ["active.logic-nor-ideal", (a, b) => !a && !b]
  ];
  for (const [libraryId, truth] of operations) {
    for (const [a, b] of [[false, false], [false, true], [true, false], [true, true]]) {
      const project = makeAndCircuit(libraryId);
      project.digitalEventSimulation.events = [
        { timeNs: 10, sourceReference: "VA", high: a },
        { timeNs: 10, sourceReference: "VB", high: b }
      ];
      const result = runProjectAnalysis(project);
      assert.equal(result.state, "complete", `${libraryId}: ${result.message}`);
      assert.equal(result.result.trace[project.digitalEventSimulation.probeNets[2]].at(-1).high, truth(a, b), libraryId);
      assert.equal(result.analysisSettings.timingModel, "zero-delay; simultaneous events atomic");
    }
  }
});

test("digital event queue sorts inputs and records only settled probe transitions", () => {
  const project = makeAndCircuit();
  project.digitalEventSimulation.events = [
    { timeNs: 300, sourceReference: "VA", high: false },
    { timeNs: 200, sourceReference: "VB", high: true },
    { timeNs: 100, sourceReference: "VA", high: true }
  ];
  const [netA, netB, netY] = project.digitalEventSimulation.probeNets;
  const result = runProjectAnalysis(project);
  assert.equal(result.state, "complete", result.message);
  assert.deepEqual(result.result.trace[netA], [{ timeNs: 0, high: false }, { timeNs: 100, high: true }, { timeNs: 300, high: false }]);
  assert.deepEqual(result.result.trace[netB], [{ timeNs: 0, high: false }, { timeNs: 200, high: true }]);
  assert.deepEqual(result.result.trace[netY], [{ timeNs: 0, high: false }, { timeNs: 200, high: true }, { timeNs: 300, high: false }]);
});

test("digital engine refuses ambiguous voltages, duplicate simultaneous inputs, missing probes, and unsupported models", () => {
  const ambiguous = makeAndCircuit();
  ambiguous.components = ambiguous.components.map((part) => part.reference === "VA" ? { ...part, value: "2.5 V" } : part);
  assert.equal(runProjectAnalysis(ambiguous).state, "blocked");

  const duplicate = makeAndCircuit();
  duplicate.digitalEventSimulation.events = [
    { timeNs: 10, sourceReference: "VA", high: false },
    { timeNs: 10, sourceReference: "VA", high: true }
  ];
  assert.equal(runProjectAnalysis(duplicate).state, "blocked");

  const missingProbe = makeAndCircuit();
  missingProbe.digitalEventSimulation.probeNets = ["NO_SUCH_NET"];
  assert.equal(runProjectAnalysis(missingProbe).state, "blocked");

  const unsupported = addComponent(makeAndCircuit(), "passive.resistor");
  unsupported.digitalEventSimulation = makeAndCircuit().digitalEventSimulation;
  assert.equal(runProjectAnalysis(unsupported).state, "unsupported");
});

test("digital event mode is available through the simulation worker", () => {
  const response = handleSimulationWorkerMessage({ type: "run", requestId: 7, project: makeAndCircuit() });
  assert.equal(response.type, "result");
  assert.equal(response.requestId, 7);
  assert.equal(response.result.state, "complete");
  assert.equal(response.result.result.kind, "digital-event-simulation");
});

test("supplemental native AND-event project produces its specified probe timeline", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/supplemental-digital-event-simulation.adigun.json", import.meta.url), "utf8"));
  const result = runProjectAnalysis(project);
  assert.equal(result.state, "complete", result.message);
  assert.deepEqual(project.digitalEventSimulation.probeNets.map((net) => result.result.trace[net]), [
    [{ timeNs: 0, high: false }, { timeNs: 100, high: true }, { timeNs: 300, high: false }],
    [{ timeNs: 0, high: false }, { timeNs: 200, high: true }],
    [{ timeNs: 0, high: false }, { timeNs: 200, high: true }, { timeNs: 300, high: false }]
  ]);
});

test("ideal non-loading logic probes stay out of the physical BOM", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/supplemental-digital-event-simulation.adigun.json", import.meta.url), "utf8"));
  const report = buildBomReport(project);
  assert.equal(report.ok, true);
  assert.equal(report.rows.some((row) => row.libraryId === "instrument.logic-probe"), false);
});
