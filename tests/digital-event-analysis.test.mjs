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
  ]) {
    if (libraryId === "active.logic-not-ideal" && second === pin("U1", "B")) continue;
    project = connectPins(project, first, second);
  }
  const probes = ["VA:+", "VB:+", "U1:Y"].map((endpoint) => project.nets.find((net) => net.endpoints.includes(pin(...endpoint.split(":")))).id);
  return { ...project, digitalEventSimulation: { stopTimeNs: 500, events: [], probeNets: probes } };
}

function makeDFlipFlopCircuit() {
  let project = createEmptyProject({ name: "Sequential digital event verification" });
  for (const part of ["power.dc-source", "power.dc-source", "power.dc-source", "active.logic-dff-ideal", "ground.signal", "instrument.logic-probe", "instrument.logic-probe", "instrument.logic-probe", "instrument.logic-probe"]) project = addComponent(project, part);
  project = {
    ...project,
    components: project.components.map((part, index) => ({ ...part, reference: ["VCC", "D", "CLK", "U1", "GND", "PD", "PC", "PQ", "PQB"][index], value: index === 0 ? "5 V" : "0 V" }))
  };
  const pin = (reference, name) => `${project.components.find((part) => part.reference === reference).instanceId}:${name}`;
  for (const [first, second] of [
    [pin("VCC", "+"), pin("U1", "VCC")],
    [pin("VCC", "+"), pin("U1", "PRE")],
    [pin("VCC", "+"), pin("U1", "CLR")],
    [pin("VCC", "-"), pin("D", "-")],
    [pin("VCC", "-"), pin("CLK", "-")],
    [pin("VCC", "-"), pin("U1", "GND")],
    [pin("VCC", "-"), pin("GND", "0")],
    [pin("D", "+"), pin("U1", "D")],
    [pin("CLK", "+"), pin("U1", "CLK")],
    [pin("D", "+"), pin("PD", "IN")],
    [pin("CLK", "+"), pin("PC", "IN")],
    [pin("U1", "Q"), pin("PQ", "IN")],
    [pin("U1", "QBAR"), pin("PQB", "IN")]
  ]) project = connectPins(project, first, second);
  const probeNets = ["D:+", "CLK:+", "U1:Q", "U1:QBAR"].map((endpoint) => {
    const [reference, terminal] = endpoint.split(":");
    return project.nets.find((net) => net.endpoints.includes(pin(reference, terminal))).id;
  });
  return { ...project, digitalEventSimulation: { stopTimeNs: 400, events: [], probeNets, initialStates: { U1: false } } };
}

function makeDecoderCircuit() {
  let project = createEmptyProject({ name: "Two-to-four decoder event verification" });
  for (const part of ["power.dc-source", "power.dc-source", "power.dc-source", "active.logic-decoder-2to4-ideal", "ground.signal", ...Array(6).fill("instrument.logic-probe")]) project = addComponent(project, part);
  project = {
    ...project,
    components: project.components.map((part, index) => ({ ...part, reference: ["VCC", "A0", "A1", "U1", "GND", "PA0", "PA1", "PY0", "PY1", "PY2", "PY3"][index], value: index === 0 ? "5 V" : "0 V" }))
  };
  const pin = (reference, name) => `${project.components.find((part) => part.reference === reference).instanceId}:${name}`;
  const connections = [
    [pin("VCC", "+"), pin("U1", "VCC")],
    [pin("VCC", "-"), pin("A0", "-")],
    [pin("VCC", "-"), pin("A1", "-")],
    [pin("VCC", "-"), pin("U1", "GND")],
    [pin("VCC", "-"), pin("GND", "0")],
    [pin("A0", "+"), pin("U1", "A0")],
    [pin("A1", "+"), pin("U1", "A1")],
    [pin("A0", "+"), pin("PA0", "IN")],
    [pin("A1", "+"), pin("PA1", "IN")]
  ];
  for (let index = 0; index < 4; index += 1) connections.push([pin("U1", `Y${index}`), pin(`PY${index}`, "IN")]);
  for (const [first, second] of connections) project = connectPins(project, first, second);
  const probeNets = ["A0:+", "A1:+", "U1:Y0", "U1:Y1", "U1:Y2", "U1:Y3"].map((endpoint) => {
    const [reference, terminal] = endpoint.split(":");
    return project.nets.find((net) => net.endpoints.includes(pin(reference, terminal))).id;
  });
  return { ...project, digitalEventSimulation: { stopTimeNs: 40, events: [], probeNets } };
}

function makeMuxCircuit(dataBits, address = 0) {
  let project = createEmptyProject({ name: "Four-to-one multiplexer event verification" });
  for (const part of [...Array(7).fill("power.dc-source"), "active.logic-mux4-ideal", "ground.signal", "instrument.logic-probe"]) project = addComponent(project, part);
  const references = ["VCC", "D0", "D1", "D2", "D3", "S0", "S1", "U1", "GND", "PY"];
  project = {
    ...project,
    components: project.components.map((part, index) => ({ ...part, reference: references[index], value: index === 0 ? "5 V" : index >= 1 && index <= 4 ? (dataBits[index - 1] ? "5 V" : "0 V") : index === 5 ? (address & 1 ? "5 V" : "0 V") : index === 6 ? (address & 2 ? "5 V" : "0 V") : "0 V" }))
  };
  const pin = (reference, name) => `${project.components.find((part) => part.reference === reference).instanceId}:${name}`;
  const connections = [
    [pin("VCC", "+"), pin("U1", "VCC")],
    [pin("VCC", "-"), pin("U1", "GND")],
    [pin("VCC", "-"), pin("GND", "0")],
    [pin("S0", "+"), pin("U1", "S0")],
    [pin("S1", "+"), pin("U1", "S1")],
    [pin("U1", "Y"), pin("PY", "IN")]
  ];
  for (let index = 0; index < 4; index += 1) {
    connections.push([pin("VCC", "-"), pin(`D${index}`, "-")]);
    connections.push([pin(`D${index}`, "+"), pin("U1", `I${index}`)]);
  }
  for (const selector of ["S0", "S1"]) connections.push([pin("VCC", "-"), pin(selector, "-")]);
  for (const [first, second] of connections) project = connectPins(project, first, second);
  const probeNet = project.nets.find((net) => net.endpoints.includes(pin("U1", "Y"))).id;
  return { ...project, digitalEventSimulation: { stopTimeNs: 40, events: [], probeNets: [probeNet] } };
}

test("digital event engine evaluates complete truth tables for all seven Boolean gates", () => {
  const operations = [
    ["active.logic-and-ideal", (a, b) => a && b],
    ["active.logic-or-ideal", (a, b) => a || b],
    ["active.logic-xor-ideal", (a, b) => a !== b],
    ["active.logic-nor-ideal", (a, b) => !a && !b],
    ["active.logic-nand-ideal", (a, b) => !(a && b)],
    ["active.logic-not-ideal", a => !a],
    ["active.logic-xnor-ideal", (a, b) => a === b]
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

test("digital event engine decodes all two-bit addresses with exactly one active-high output", () => {
  const project = makeDecoderCircuit();
  project.digitalEventSimulation.events = [
    { timeNs: 10, sourceReference: "A0", high: true },
    { timeNs: 20, sourceReference: "A1", high: true },
    { timeNs: 30, sourceReference: "A0", high: false },
    { timeNs: 40, sourceReference: "A1", high: false }
  ];
  const response = handleSimulationWorkerMessage({ type: "run", requestId: 91, project });
  assert.equal(response.type, "result");
  assert.equal(response.requestId, 91);
  const result = response.result;
  assert.equal(result.state, "complete", result.message);
  assert.ok(result.modelIds.includes("ideal-digital-decoder-2to4-v1"));
  assert.match(result.message, /zero-delay.*active-high two-to-four decoder/i);
  const traces = project.digitalEventSimulation.probeNets.map((net) => result.result.trace[net]);
  assert.deepEqual(traces, [
    [{ timeNs: 0, high: false }, { timeNs: 10, high: true }, { timeNs: 30, high: false }],
    [{ timeNs: 0, high: false }, { timeNs: 20, high: true }, { timeNs: 40, high: false }],
    [{ timeNs: 0, high: true }, { timeNs: 10, high: false }, { timeNs: 40, high: true }],
    [{ timeNs: 0, high: false }, { timeNs: 10, high: true }, { timeNs: 20, high: false }],
    [{ timeNs: 0, high: false }, { timeNs: 30, high: true }, { timeNs: 40, high: false }],
    [{ timeNs: 0, high: false }, { timeNs: 20, high: true }, { timeNs: 30, high: false }]
  ]);
  for (const timeNs of [0, 10, 20, 30, 40]) {
    const activeOutputs = traces.slice(2).filter((series) => series.filter((event) => event.timeNs <= timeNs).at(-1).high);
    assert.equal(activeOutputs.length, 1, `one-hot output at ${timeNs} ns`);
  }
});

test("digital event engine multiplexer matches all 64 data and selector vectors", () => {
  for (let dataMask = 0; dataMask < 16; dataMask += 1) {
    const dataBits = [0, 1, 2, 3].map((bit) => Boolean(dataMask & (1 << bit)));
    for (let address = 0; address < 4; address += 1) {
      const project = makeMuxCircuit(dataBits, address);
      const result = runProjectAnalysis(project);
      assert.equal(result.state, "complete", result.message);
      assert.equal(result.result.trace[project.digitalEventSimulation.probeNets[0]].at(-1).high, dataBits[address], `data=${dataMask.toString(2)} select=${address}`);
      assert.ok(result.modelIds.includes("ideal-digital-mux4-v1"));
    }
  }
});

test("digital event engine records multiplexer output changes as address inputs change", () => {
  const project = makeMuxCircuit([false, true, false, true]);
  project.digitalEventSimulation.events = [
    { timeNs: 10, sourceReference: "S0", high: true },
    { timeNs: 20, sourceReference: "S1", high: true },
    { timeNs: 30, sourceReference: "S0", high: false },
    { timeNs: 40, sourceReference: "S1", high: false }
  ];
  const result = runProjectAnalysis(project);
  assert.equal(result.state, "complete", result.message);
  assert.deepEqual(result.result.trace[project.digitalEventSimulation.probeNets[0]], [
    { timeNs: 0, high: false },
    { timeNs: 10, high: true },
    { timeNs: 30, high: false }
  ]);
});

test("supplemental native mux-event project matches its specified probe timeline", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/supplemental-mux-event-simulation.adigun.json", import.meta.url), "utf8"));
  const registry = JSON.parse(await readFile(new URL("../examples/manifest.json", import.meta.url), "utf8"));
  const example = registry.examples.find((item) => item.id === "supplemental-mux-event-simulation");
  assert.equal(example.status, "planned");
  assert.equal(example.acceptanceTest, "tests/digital-event-analysis.test.mjs: supplemental native mux-event project matches its specified probe timeline");
  const response = handleSimulationWorkerMessage({ type: "run", requestId: 92, project });
  assert.equal(response.type, "result");
  assert.equal(response.requestId, 92);
  const result = response.result;
  assert.equal(result.state, "complete", result.message);
  assert.equal(result.result.stopTimeNs, example.verification.expectedResult.stopTimeNs);
  const observed = Object.fromEntries(project.digitalEventSimulation.probeNets.map((net, index) => {
    const name = ["S0", "S1", "Y"][index];
    return [name, result.result.trace[net].map(({ timeNs, high }) => [timeNs, high])];
  }));
  assert.deepEqual(observed, example.verification.expectedResult.transitions);
  const readme = await readFile(new URL("../examples/project-readmes/supplemental-mux-event-simulation.md", import.meta.url), "utf8");
  assert.match(readme, /Model boundary/);
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

test("positive-edge D flip-flop samples D, retains state between edges, and exposes Q-bar", () => {
  const project = makeDFlipFlopCircuit();
  project.digitalEventSimulation.events = [
    { timeNs: 100, sourceReference: "D", high: true },
    { timeNs: 200, sourceReference: "CLK", high: true },
    { timeNs: 250, sourceReference: "D", high: false },
    { timeNs: 300, sourceReference: "CLK", high: false },
    { timeNs: 350, sourceReference: "CLK", high: true }
  ];
  const [dataNet, clockNet, qNet, qBarNet] = project.digitalEventSimulation.probeNets;
  const result = runProjectAnalysis(project);
  assert.equal(result.state, "complete", result.message);
  assert.deepEqual(result.result.trace[dataNet], [{ timeNs: 0, high: false }, { timeNs: 100, high: true }, { timeNs: 250, high: false }]);
  assert.deepEqual(result.result.trace[clockNet], [{ timeNs: 0, high: false }, { timeNs: 200, high: true }, { timeNs: 300, high: false }, { timeNs: 350, high: true }]);
  assert.deepEqual(result.result.trace[qNet], [{ timeNs: 0, high: false }, { timeNs: 200, high: true }, { timeNs: 350, high: false }]);
  assert.deepEqual(result.result.trace[qBarNet], [{ timeNs: 0, high: true }, { timeNs: 200, high: false }, { timeNs: 350, high: true }]);
  assert.ok(result.modelIds.includes("ideal-positive-edge-d-flip-flop-v1"));
});

test("supplemental native D flip-flop example matches its explicit initial-state timeline", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/supplemental-d-flip-flop-events.adigun.json", import.meta.url), "utf8"));
  const result = runProjectAnalysis(project);
  assert.equal(result.state, "complete", result.message);
  assert.deepEqual(project.digitalEventSimulation.probeNets.map((net) => result.result.trace[net]), [
    [{ timeNs: 0, high: false }, { timeNs: 100, high: true }, { timeNs: 250, high: false }],
    [{ timeNs: 0, high: false }, { timeNs: 200, high: true }, { timeNs: 300, high: false }, { timeNs: 350, high: true }],
    [{ timeNs: 0, high: false }, { timeNs: 200, high: true }, { timeNs: 350, high: false }],
    [{ timeNs: 0, high: true }, { timeNs: 200, high: false }, { timeNs: 350, high: true }]
  ]);
});

test("D flip-flops require explicit initial state and inactive-high asynchronous control pins", () => {
  const missingInitial = makeDFlipFlopCircuit();
  delete missingInitial.digitalEventSimulation.initialStates;
  assert.equal(runProjectAnalysis(missingInitial).state, "blocked");

  const activeClear = makeDFlipFlopCircuit();
  activeClear.digitalEventSimulation.events = [{ timeNs: 10, sourceReference: "D", high: true }];
  activeClear.nets = activeClear.nets.map((net) => net.id === "VCC" ? { ...net, endpoints: net.endpoints.filter((endpoint) => endpoint !== `${activeClear.components.find((part) => part.reference === "U1").instanceId}:CLR`) } : net);
  activeClear.nets.push({ id: "CLR_N", endpoints: [`${activeClear.components.find((part) => part.reference === "U1").instanceId}:CLR`, `${activeClear.components.find((part) => part.reference === "D").instanceId}:+`] });
  activeClear.digitalEventSimulation.events.push({ timeNs: 20, sourceReference: "D", high: false });
  assert.notEqual(runProjectAnalysis(activeClear).state, "complete");
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

