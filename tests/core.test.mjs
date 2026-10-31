import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { addComponent, connectPins, createEmptyProject, createProject, createVoltageDividerProject, disconnectPin, getViewReconciliationIssues, moveComponent, parseProject, removeComponent, runSupportedAnalysis, STARTER_LIBRARY, serializeProject, updateComponent, validateProject } from "../js/core.mjs";
import { getLedgerCoverage, validatePartLedger, validatePartRecord } from "../js/part-ledger.mjs";
import { getExampleCoverage, validateExampleRegistry } from "../js/example-registry.mjs";
import { TRANSLATIONS, UI_KEYS, UI_LOCALES, translate } from "../js/i18n.mjs";

test("starter project validates and produces a bounded analytical DC result", () => {
  const result = runSupportedAnalysis(createProject());
  assert.equal(result.state, "complete");
  assert.equal(result.result.ledOn, true);
  assert.ok(Math.abs(result.result.currentA - 0.00909) < 0.0001);
});

test("a new project starts blank and remains a valid native document", () => {
  const project = createEmptyProject({ locale: "de" });
  assert.equal(project.components.length, 0);
  assert.equal(project.nets.length, 0);
  assert.equal(project.metadata.locale, "de");
  assert.equal(validateProject(project).valid, true);
  assert.equal(runSupportedAnalysis(project).state, "unsupported");
});

test("invalid resistance blocks the supported analysis", () => {
  const project = updateComponent(createProject(), "resistor-1", { value: "0 Ω" });
  assert.equal(runSupportedAnalysis(project).state, "blocked");
});

test("DC analysis parses SI prefixes with case-sensitive milli and mega units", () => {
  const milli = updateComponent(createProject(), "resistor-1", { value: "1 mΩ" });
  const mega = updateComponent(createProject(), "resistor-1", { value: "1 MΩ" });
  assert.equal(runSupportedAnalysis(milli).state, "complete");
  assert.ok(Math.abs(runSupportedAnalysis(milli).result.resistance - 0.001) < 1e-12);
  assert.ok(Math.abs(runSupportedAnalysis(mega).result.resistance - 1e6) < 1e-6);
  assert.equal(runSupportedAnalysis(updateComponent(createProject(), "resistor-1", { value: "330 bananas" })).state, "blocked");
});

test("a documented voltage divider produces bounded DC values", () => {
  const result = runSupportedAnalysis(createVoltageDividerProject());
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "voltage-divider");
  assert.equal(result.result.outputVoltage, 6);
  assert.equal(result.result.currentA, 0.003);
});

test("linear DC nodal analysis solves a resistor branch network", () => {
  const project = createVoltageDividerProject({ sourceValue: "5 V", upperResistanceValue: "1 kΩ", lowerResistanceValue: "1 kΩ" });
  project.components.push({ instanceId: "resistor-branch-1", libraryId: "passive.resistor", reference: "R3", value: "1 kΩ", position: { breadboard: [520, 140], schematic: [520, 140], pcb: [520, 140] } });
  project.nets = [
    { id: "VCC", endpoints: ["source-1:+", "resistor-top-1:1"] },
    { id: "MID", endpoints: ["resistor-top-1:2", "resistor-bottom-1:1", "resistor-branch-1:1"] },
    { id: "GND", endpoints: ["resistor-bottom-1:2", "resistor-branch-1:2", "source-1:-", "ground-1:0"] }
  ];
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "resistive-network");
  assert.ok(Math.abs(result.result.nodeVoltages.MID - (5 / 3)) < 1e-9);
  assert.ok(Math.abs(result.result.sourceCurrentA - (5 / 1500)) < 1e-9);
  assert.equal(result.result.resistors.length, 3);
});

test("parallel resistor load example has a reproducible DC operating point", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/004-parallel-resistor-load.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "resistive-network");
  assert.ok(Math.abs(result.result.nodeVoltages.MID - (5 / 3)) < 1e-9);
  assert.ok(Math.abs(result.result.sourceCurrentA - (5 / 1500)) < 1e-9);
  assert.equal(result.result.resistors.length, 3);
});

test("RC high-pass response attenuates below cutoff and passes above it", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/013-rc-high-pass.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "rc-high-pass");
  assert.ok(Math.abs(result.result.cutoffHz - 1 / (2 * Math.PI * 0.1)) < 1e-12);
  const [below, cutoff, above] = result.result.samples;
  assert.ok(Math.abs(cutoff.gain - Math.SQRT1_2) < 1e-12);
  assert.ok(below.gain < cutoff.gain && cutoff.gain < above.gain);
  assert.ok(Math.abs(below.gain - 1 / Math.sqrt(101)) < 1e-12);
  assert.ok(Math.abs(above.gain - 10 / Math.sqrt(101)) < 1e-12);

  const broken = structuredClone(project);
  broken.nets[1].endpoints = ["capacitor-1:2"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
  const invalid = updateComponent(project, "resistor-1", { value: "0 Ω" });
  assert.equal(runSupportedAnalysis(invalid).state, "blocked");
});

test("RL low-pass response uses the calculated cutoff and attenuates above it", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/supplemental-rl-low-pass.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "rl-low-pass");
  assert.ok(Math.abs(result.result.timeConstantS - 0.0001) < 1e-15);
  assert.ok(Math.abs(result.result.cutoffHz - 1000 / (2 * Math.PI * 0.1)) < 1e-9);
  const [below, cutoff, above] = result.result.samples;
  assert.ok(Math.abs(cutoff.gain - Math.SQRT1_2) < 1e-12);
  assert.ok(Math.abs(cutoff.outputAmplitudeV - Math.SQRT1_2) < 1e-12);
  assert.ok(below.gain > cutoff.gain && cutoff.gain > above.gain);
  assert.ok(Math.abs(above.gain - 1 / Math.sqrt(101)) < 1e-12);

  const broken = structuredClone(project);
  broken.nets[1].endpoints = ["resistor-1:2"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
  const invalid = updateComponent(project, "inductor-1", { value: "0 H" });
  assert.equal(runSupportedAnalysis(invalid).state, "blocked");
  const tinyResistance = updateComponent(project, "resistor-1", { value: "1e-300 Ω" });
  const extreme = updateComponent(tinyResistance, "inductor-1", { value: "1e300 H" });
  assert.equal(runSupportedAnalysis(extreme).state, "blocked");
});

test("RC low-pass response uses the calculated cutoff and attenuates above it", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/012-rc-low-pass.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "rc-low-pass");
  assert.ok(Math.abs(result.result.cutoffHz - 1 / (2 * Math.PI * 0.1)) < 1e-12);
  const [below, cutoff, above] = result.result.samples;
  assert.ok(Math.abs(cutoff.gain - Math.SQRT1_2) < 1e-12);
  assert.ok(Math.abs(cutoff.outputAmplitudeV - Math.SQRT1_2) < 1e-12);
  assert.ok(below.gain > cutoff.gain && cutoff.gain > above.gain);
  assert.ok(Math.abs(above.gain - 1 / Math.sqrt(101)) < 1e-12);

  const broken = structuredClone(project);
  broken.nets[1].endpoints = ["resistor-1:2"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
  const invalid = updateComponent(project, "capacitor-1", { value: "0 F" });
  assert.equal(runSupportedAnalysis(invalid).state, "blocked");
  const underflow = updateComponent(project, "capacitor-1", { value: "1e-300 F" });
  const tinyResistance = updateComponent(underflow, "resistor-1", { value: "1e-300 Ω" });
  assert.equal(runSupportedAnalysis(tinyResistance).state, "blocked");
});

test("single-pole RC step response reports time constant and analytic samples", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/005-rc-step-response.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "rc-step-response");
  assert.ok(Math.abs(result.result.timeConstantS - 0.1) < 1e-12);
  assert.ok(Math.abs(result.result.samples[1].capacitorVoltage - 5 * (1 - Math.exp(-1))) < 1e-12);
  assert.ok(Math.abs(result.result.samples[1].currentA - (5 / 1000) * Math.exp(-1)) < 1e-12);
  const broken = structuredClone(project);
  broken.nets[1].endpoints = ["resistor-1:2"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
  const overflow = structuredClone(project);
  overflow.components.find((item) => item.instanceId === "resistor-1").value = "1e300 Ω";
  overflow.components.find((item) => item.instanceId === "capacitor-1").value = "1e300 F";
  assert.equal(runSupportedAnalysis(overflow).state, "blocked");
});

test("SPDT RC example calculates charging and discharging at one time constant", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/011-rc-charge-discharge.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const charge = runSupportedAnalysis(project);
  assert.equal(charge.state, "complete");
  assert.equal(charge.result.kind, "rc-charge-discharge");
  assert.equal(charge.result.mode, "charge");
  assert.ok(Math.abs(charge.result.timeConstantS - 0.1) < 1e-12);
  assert.ok(Math.abs(charge.result.samples[1].capacitorVoltage / 5 - (1 - Math.exp(-1))) < 1e-12);
  assert.ok(Math.abs(charge.result.samples[1].capacitorVoltage / 5 - 0.6321205588) < 1e-10);

  const dischargeProject = updateComponent(project, "switch-1", { value: "Discharge (B)" });
  const discharge = runSupportedAnalysis(dischargeProject);
  assert.equal(discharge.state, "complete");
  assert.equal(discharge.result.mode, "discharge");
  assert.ok(Math.abs(discharge.result.samples[1].capacitorVoltage / 5 - Math.exp(-1)) < 1e-12);
  assert.ok(Math.abs(discharge.result.samples[1].capacitorVoltage / 5 - 0.3678794412) < 1e-10);

  const wrongPosition = updateComponent(project, "switch-1", { value: "Center" });
  assert.equal(runSupportedAnalysis(wrongPosition).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "SW_COM").endpoints = ["switch-1:COM"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
  const underflow = updateComponent(project, "capacitor-1", { value: "1e-300 F" });
  const tinyResistance = updateComponent(underflow, "resistor-1", { value: "1e-300 Ω" });
  assert.equal(runSupportedAnalysis(tinyResistance).state, "blocked");
});

test("single-pole RL step response reports current rise and inductor voltage", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/006-rl-step-response.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "rl-step-response");
  assert.ok(Math.abs(result.result.timeConstantS - 0.001) < 1e-12);
  assert.ok(Math.abs(result.result.samples[1].currentA - 0.05 * (1 - Math.exp(-1))) < 1e-12);
  assert.ok(Math.abs(result.result.samples[1].inductorVoltage - 5 * Math.exp(-1)) < 1e-12);
  const broken = structuredClone(project);
  broken.nets[1].endpoints = ["resistor-1:2"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("multiple DC voltage sources solve by modified nodal analysis and enforce power balance", () => {
  const project = createEmptyProject();
  const positions = {
    "source-1": { breadboard: [80, 80], schematic: [80, 80], pcb: [80, 80] },
    "source-2": { breadboard: [240, 80], schematic: [240, 80], pcb: [240, 80] },
    "resistor-1": { breadboard: [400, 80], schematic: [400, 80], pcb: [400, 80] },
    "ground-1": { breadboard: [560, 80], schematic: [560, 80], pcb: [560, 80] }
  };
  project.components = [
    { instanceId: "source-1", libraryId: "power.dc-source", reference: "V1", value: "5 V", position: positions["source-1"] },
    { instanceId: "source-2", libraryId: "power.dc-source", reference: "V2", value: "3 V", position: positions["source-2"] },
    { instanceId: "resistor-1", libraryId: "passive.resistor", reference: "R1", value: "1 kΩ", position: positions["resistor-1"] },
    { instanceId: "ground-1", libraryId: "ground.signal", reference: "GND", value: "0 V", position: positions["ground-1"] }
  ];
  project.nets = [
    { id: "GND", endpoints: ["source-1:-", "resistor-1:2", "ground-1:0"] },
    { id: "MID", endpoints: ["source-1:+", "source-2:-"] },
    { id: "VOUT", endpoints: ["source-2:+", "resistor-1:1"] }
  ];
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "multi-source-resistive-network");
  assert.ok(Math.abs(result.result.nodeVoltages.MID - 5) < 1e-12);
  assert.ok(Math.abs(result.result.nodeVoltages.VOUT - 8) < 1e-12);
  assert.ok(Math.abs(result.result.resistors[0].currentA - 0.008) < 1e-12);
  assert.ok(Math.abs(result.result.sources[0].deliveredCurrentA - 0.008) < 1e-12);
  assert.ok(Math.abs(result.result.sources[1].deliveredCurrentA - 0.008) < 1e-12);
  assert.ok(Math.abs(result.result.powerBalanceW) < 1e-12);

  const contradictory = structuredClone(project);
  contradictory.nets = [
    { id: "VOUT", endpoints: ["source-1:+", "source-2:+", "resistor-1:1"] },
    { id: "GND", endpoints: ["source-1:-", "source-2:-", "resistor-1:2", "ground-1:0"] }
  ];
  contradictory.components.find((item) => item.instanceId === "source-2").value = "3 V";
  assert.equal(runSupportedAnalysis(contradictory).state, "blocked");
});

test("ideal DC current source drives a resistor and balances power", () => {
  const project = createEmptyProject();
  const positions = {
    "current-1": { breadboard: [120, 80], schematic: [120, 80], pcb: [120, 80] },
    "resistor-1": { breadboard: [320, 80], schematic: [320, 80], pcb: [320, 80] },
    "ground-1": { breadboard: [520, 80], schematic: [520, 80], pcb: [520, 80] }
  };
  project.components = [
    { instanceId: "current-1", libraryId: "power.dc-current-source", reference: "I1", value: "1 mA", position: positions["current-1"] },
    { instanceId: "resistor-1", libraryId: "passive.resistor", reference: "R1", value: "1 kΩ", position: positions["resistor-1"] },
    { instanceId: "ground-1", libraryId: "ground.signal", reference: "GND", value: "0 V", position: positions["ground-1"] }
  ];
  project.nets = [
    { id: "LOAD", endpoints: ["current-1:+", "resistor-1:1"] },
    { id: "GND", endpoints: ["current-1:-", "resistor-1:2", "ground-1:0"] }
  ];
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "linear-dc-mna-network");
  assert.ok(Math.abs(result.result.nodeVoltages.LOAD - 1) < 1e-12);
  assert.ok(Math.abs(result.result.resistors[0].currentA - 0.001) < 1e-12);
  assert.ok(Math.abs(result.result.currentSources[0].outputCurrentA - 0.001) < 1e-12);
  assert.ok(Math.abs(result.result.powerBalanceW) < 1e-12);

  const mixed = structuredClone(project);
  mixed.components.push({
    instanceId: "voltage-1", libraryId: "power.dc-source", reference: "V1", value: "5 V",
    position: { breadboard: [120, 180], schematic: [120, 180], pcb: [120, 180] }
  });
  mixed.nets[0].endpoints.push("voltage-1:+");
  mixed.nets[1].endpoints.push("voltage-1:-");
  const mixedResult = runSupportedAnalysis(mixed);
  assert.equal(mixedResult.state, "complete");
  assert.ok(Math.abs(mixedResult.result.nodeVoltages.LOAD - 5) < 1e-12);
  assert.ok(Math.abs(mixedResult.result.sources[0].deliveredCurrentA - 0.004) < 1e-12);
  assert.ok(Math.abs(mixedResult.result.currentSources[0].powerDeliveredW - 0.005) < 1e-12);
  assert.ok(Math.abs(mixedResult.result.powerBalanceW) < 1e-12);

  const malformed = structuredClone(project);
  malformed.components[0].value = "1 mV";
  assert.equal(runSupportedAnalysis(malformed).state, "blocked");
});

test("linear DC nodal analysis blocks a floating resistor island", () => {
  const project = createVoltageDividerProject();
  project.nets = [
    { id: "VCC", endpoints: ["source-1:+"] },
    { id: "UPPER", endpoints: ["resistor-top-1:1", "resistor-top-1:2"] },
    { id: "LOWER", endpoints: ["resistor-bottom-1:1", "resistor-bottom-1:2"] },
    { id: "GND", endpoints: ["source-1:-", "ground-1:0"] }
  ];
  assert.equal(runSupportedAnalysis(project).state, "blocked");
});

test("a voltage divider with a broken netlist is blocked rather than guessed", () => {
  const project = createVoltageDividerProject();
  project.nets = [];
  assert.equal(runSupportedAnalysis(project).state, "blocked");
});

test("invalid net endpoints are rejected before analysis", () => {
  const project = createProject();
  project.nets[0].endpoints.push("resistor-1:9");
  const validation = validateProject(project);
  assert.equal(validation.valid, false);
  assert.equal(runSupportedAnalysis(project).state, "blocked");
});

test("duplicate net identifiers and invalid LED forward voltage are blocked", () => {
  const duplicate = createProject();
  duplicate.nets[1].id = duplicate.nets[0].id;
  assert.ok(validateProject(duplicate).errors.some((issue) => issue.rule === "DUPLICATE_NET_ID"));
  const invalidLed = updateComponent(createProject(), "led-1", { value: "Vf -2.0 V" });
  assert.equal(runSupportedAnalysis(invalidLed).state, "blocked");
});

test("electrical-rule validation warns about unconnected pins and blocks a source short", () => {
  const incomplete = addComponent(createProject(), "input.pushbutton");
  assert.ok(validateProject(incomplete).warnings.some((issue) => issue.rule === "UNCONNECTED_PIN"));
  const shorted = createProject();
  shorted.nets[0].endpoints.push("source-1:-");
  const validation = validateProject(shorted);
  assert.ok(validation.errors.some((issue) => issue.rule === "SOURCE_SHORT"));
  assert.equal(runSupportedAnalysis(shorted).state, "blocked");
});

test("a disconnected LED demo is not presented as a supported calculation", () => {
  const project = createProject();
  project.nets = [];
  assert.equal(runSupportedAnalysis(project).state, "blocked");
});

test("views report missing mappings instead of fabricating a representation", () => {
  const project = addComponent(createProject(), "instrument.voltmeter");
  assert.equal(getViewReconciliationIssues(project, "schematic").length, 0);
  assert.equal(getViewReconciliationIssues(project, "breadboard").at(-1).reference, "M1");
  assert.equal(getViewReconciliationIssues(project, "pcb").length, project.components.length);
});

test("component insertion assigns a unique reference and retains project validity", () => {
  const project = addComponent(createProject(), "input.pushbutton");
  assert.equal(project.components.at(-1).reference, "SW1");
  assert.equal(validateProject(project).valid, true);
});

test("added components use open canvas positions in each representation", () => {
  let project = createEmptyProject();
  for (let index = 0; index < 12; index += 1) project = addComponent(project, "passive.resistor");
  const overlaps = validateProject(project).warnings.filter((issue) => issue.rule === "LAYOUT_OVERLAP");
  assert.deepEqual(overlaps, []);
  for (const view of ["breadboard", "schematic", "pcb"]) {
    const coordinates = project.components.map((item) => item.position[view]);
    assert.equal(new Set(coordinates.map((position) => position.join(","))).size, coordinates.length);
  }
});

test("component movement is view-specific, bounded, and may snap to the grid", () => {
  const moved = moveComponent(createProject(), "resistor-1", "schematic", [300, 147], { snap: true });
  const resistor = moved.components.find((component) => component.instanceId === "resistor-1");
  assert.deepEqual(resistor.position.schematic, [300, 144]);
  assert.deepEqual(resistor.position.breadboard, [255, 142]);
  const bounded = moveComponent(moved, "resistor-1", "breadboard", [-400, 900]);
  assert.deepEqual(bounded.components.find((component) => component.instanceId === "resistor-1").position.breadboard, [28, 244]);
});

test("pin wiring merges existing nets and disconnection preserves remaining nets", () => {
  const project = createProject();
  const connected = connectPins(project, "source-1:+", "led-1:A");
  assert.equal(connected.nets.length, 2);
  assert.ok(connected.nets.some((net) => net.endpoints.includes("source-1:+") && net.endpoints.includes("resistor-1:1") && net.endpoints.includes("led-1:A")));
  assert.equal(validateProject(connected).valid, true);
  const disconnected = disconnectPin(connected, "led-1:A");
  assert.ok(!disconnected.nets.some((net) => net.endpoints.includes("led-1:A")));
  assert.equal(validateProject(disconnected).valid, true);
  assert.throws(() => connectPins(project, "missing:1", "led-1:A"));
});

test("component removal cleans its pins from nets and leaves project valid", () => {
  const removed = removeComponent(createProject(), "led-1");
  assert.ok(!removed.components.some((item) => item.instanceId === "led-1"));
  assert.ok(removed.nets.every((net) => net.endpoints.every((item) => !item.startsWith("led-1:"))));
  assert.equal(validateProject(removed).valid, true);
  assert.throws(() => removeComponent(removed, "missing"));
});

test("all starter library entries have a visible category and explicit view mappings", () => {
  for (const part of STARTER_LIBRARY) {
    assert.ok(part.category);
    assert.equal(typeof part.views.breadboard, "boolean");
    assert.equal(typeof part.views.schematic, "boolean");
    assert.equal(typeof part.views.pcb, "boolean");
  }
});

test("native project serialization round-trips", () => {
  const project = createProject();
  assert.deepEqual(parseProject(serializeProject(project)), project);
});

test("malformed imported project shapes return validation errors instead of throwing", () => {
  for (const value of [null, [], {}, { schemaVersion: 1, metadata: { name: "Broken" }, components: [], nets: [null] }, { schemaVersion: 1, metadata: { name: "Broken" }, components: [], nets: [{ id: "NET" }] }]) {
    assert.doesNotThrow(() => validateProject(value));
    assert.equal(validateProject(value).valid, false);
  }
  assert.throws(() => parseProject(JSON.stringify({ schemaVersion: 1, metadata: { name: "Broken" }, components: [], nets: [{ id: "NET" }] })));
});

test("layout positions must be numeric, safe, and within canvas bounds", () => {
  const malformed = createProject();
  malformed.components[0].position.schematic = ['0" onmouseover="alert(1)', 120];
  assert.ok(validateProject(malformed).errors.some((issue) => issue.rule === "LAYOUT_POSITION"));
  assert.throws(() => parseProject(JSON.stringify(malformed)));
  const outside = createProject();
  outside.components[0].position.pcb = [5000, 120];
  assert.ok(validateProject(outside).errors.some((issue) => issue.rule === "LAYOUT_BOUNDS"));
});

test("part ledger records authoritative candidate sources without counting candidates as verified", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url)));
  assert.equal(validatePartLedger(ledger).valid, true);
  const coverage = getLedgerCoverage(ledger);
  assert.equal(coverage.total, 4);
  assert.equal(coverage.verified, 0);
  assert.equal(coverage.remaining, 1000);
});

test("verified parts require valid checksums, aligned unique pin maps, reviewer, and dates", () => {
  const record = {
    id: "fixture.part",
    manufacturer: "Fixture Manufacturer",
    manufacturerPartNumber: "FIXTURE-2",
    category: "Test",
    type: "two-pin fixture",
    lifecycle: "active",
    verificationStatus: "verified",
    package: "DIP-2",
    symbolPinMap: { "1": "Anode", "2": "Cathode" },
    footprintPadMap: { "1": "pad-1", "2": "pad-2" },
    modelStatus: "not-modelled",
    lastReviewedAt: "2026-10-31",
    reviewedBy: "Fixture Reviewer",
    datasheet: {
      title: "Fixture datasheet",
      url: "https://manufacturer.example/datasheet.pdf",
      accessedAt: "2026-10-31",
      sha256: "a".repeat(64)
    }
  };
  assert.deepEqual(validatePartRecord(record), []);
  assert.ok(validatePartRecord({ ...record, datasheet: { ...record.datasheet, sha256: "not-a-checksum" } }).some((issue) => issue.code === "DATASHEET_CHECKSUM"));
  assert.ok(validatePartRecord({ ...record, footprintPadMap: { "1": "pad-1", "3": "pad-2" } }).some((issue) => issue.code === "PIN_MAP_ALIGNMENT"));
  assert.ok(validatePartRecord({ ...record, footprintPadMap: { "1": "pad-1", "2": "pad-1" } }).some((issue) => issue.code === "PIN_MAP_ALIGNMENT"));
  assert.ok(validatePartRecord({ ...record, lastReviewedAt: "2026-02-31" }).some((issue) => issue.code === "REVIEW_DATE"));
  assert.ok(validatePartRecord({ ...record, reviewedBy: "TBD" }).some((issue) => issue.code === "REVIEWER_IDENTITY"));
  assert.ok(validatePartRecord({ ...record, symbolPinMap: { "1": null, "2": "Cathode" } }).some((issue) => issue.code === "SYMBOL_PIN_MAP"));
});

test("a verified record cannot bypass checksum, mapping, model, and human-review evidence", () => {
  const errors = validatePartRecord({ id: "unsafe.example", manufacturer: "Example", manufacturerPartNumber: "X1", category: "Test", type: "test", lifecycle: "active", verificationStatus: "verified", datasheet: { title: "Source", url: "https://example.invalid", accessedAt: "2026-10-30" } });
  assert.ok(errors.some((error) => error.code === "DATASHEET_CHECKSUM"));
  assert.ok(errors.some((error) => error.code === "VERIFIED_EVIDENCE"));
});

test("catalogue latching SPDT switch selects a defined LED state", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/004-latching-led-switch.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const on = runSupportedAnalysis(project);
  assert.equal(on.state, "complete");
  assert.equal(on.result.kind, "latching-led-switch");
  assert.equal(on.result.switchPosition, "A");
  assert.equal(on.result.ledOn, true);
  assert.ok(Math.abs(on.result.ledCurrentA - (5 - 2) / 330) < 1e-12);
  assert.ok(Math.abs(on.result.powerBalanceW) < 1e-12);

  const off = runSupportedAnalysis(updateComponent(project, "switch-1", { value: "Position B" }));
  assert.equal(off.state, "complete");
  assert.equal(off.result.switchPosition, "B");
  assert.equal(off.result.ledOn, false);
  assert.equal(off.result.ledCurrentA, 0);
  assert.equal(off.result.sourceCurrentA, 0);
  assert.equal(runSupportedAnalysis(updateComponent(project, "switch-1", { value: "Between positions" })).state, "blocked");

  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "VCC").endpoints = ["source-1:+"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue anti-parallel LEDs change with source polarity", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/002-two-led-polarity-indicator.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const positive = runSupportedAnalysis(project);
  assert.equal(positive.state, "complete");
  assert.equal(positive.result.kind, "led-polarity-indicator");
  assert.equal(positive.result.redLedOn, true);
  assert.equal(positive.result.greenLedOn, false);
  assert.ok(Math.abs(positive.result.redCurrentA - (5 - 2) / 330) < 1e-12);
  assert.equal(positive.result.greenCurrentA, 0);
  assert.ok(Math.abs(positive.result.powerBalanceW) < 1e-12);

  const reversed = updateComponent(project, "source-1", { value: "-5 V" });
  const negative = runSupportedAnalysis(reversed);
  assert.equal(negative.state, "complete");
  assert.equal(negative.result.redLedOn, false);
  assert.equal(negative.result.greenLedOn, true);
  assert.equal(negative.result.redCurrentA, 0);
  assert.ok(Math.abs(negative.result.greenCurrentA - (5 - 2.1) / 330) < 1e-12);
  assert.ok(Math.abs(negative.result.powerBalanceW) < 1e-12);

  const zero = runSupportedAnalysis(updateComponent(project, "source-1", { value: "0 V" }));
  assert.equal(zero.state, "complete");
  assert.equal(zero.result.redLedOn, false);
  assert.equal(zero.result.greenLedOn, false);
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "GREEN_K").endpoints = ["led-green:K"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue pushbutton LED stays off until pressed and includes its pull-down", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/003-pushbutton-led.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(validateProject(project).warnings.some((issue) => issue.rule === "UNCONNECTED_PIN"), false);

  const open = runSupportedAnalysis(project);
  assert.equal(open.state, "complete");
  assert.equal(open.result.kind, "pushbutton-led");
  assert.equal(open.result.switchState, "normally-open");
  assert.equal(open.result.ledOn, false);
  assert.equal(open.result.ledCurrentA, 0);
  assert.equal(open.result.sourceCurrentA, 0);

  const pressedProject = updateComponent(project, "switch-1", { value: "Pressed" });
  const pressed = runSupportedAnalysis(pressedProject);
  assert.equal(pressed.state, "complete");
  assert.equal(pressed.result.switchState, "pressed");
  assert.equal(pressed.result.ledOn, true);
  assert.ok(Math.abs(pressed.result.ledCurrentA - (5 - 2) / 330) < 1e-12);
  assert.ok(Math.abs(pressed.result.pullDownCurrentA - 5 / 10000) < 1e-12);
  assert.ok(Math.abs(pressed.result.powerBalanceW) < 1e-12);

  const invalidState = updateComponent(project, "switch-1", { value: "Half pressed" });
  assert.equal(runSupportedAnalysis(invalidState).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "VCC").endpoints = ["source-1:+"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue P-MOS high-side switch drives load and blocks gate-source overvoltage",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/034-pmos-high-side-switch.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const on=runSupportedAnalysis(project);
  assert.equal(on.state,"complete");
  assert.equal(on.result.kind,"pmos-high-side-switch");
  assert.equal(on.result.switchOn,true);
  assert.ok(on.result.loadVoltage>11.9);
  assert.ok(on.result.loadCurrentA>0.09);
  const off=runSupportedAnalysis(updateComponent(project,"gate-drive",{value:"12 V"}));
  assert.equal(off.result.switchOn,false);
  assert.equal(off.result.loadCurrentA,0);
  assert.equal(off.result.loadVoltage,0);
  assert.equal(runSupportedAnalysis(updateComponent(project,"gate-drive",{value:"-9 V"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"gate-drive",{value:"13 V"})).state,"blocked");
});

test("catalogue NMOS low-side driver switches coil and clamps turn-off with a flyback diode",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/033-nmos-low-side-switch.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const on=runSupportedAnalysis(project);
  assert.equal(on.state,"complete");
  assert.equal(on.result.kind,"nmos-low-side-switch");
  assert.equal(on.result.switchOn,true);
  assert.ok(on.result.loadCurrentA>0.49);
  assert.ok(on.result.drainSourceVoltageV<0.1);
  assert.ok(on.result.coilStoredEnergyJ>0);
  const off=runSupportedAnalysis(updateComponent(project,"gate-drive",{value:"0 V"}));
  assert.equal(off.result.switchOn,false);
  assert.equal(off.result.loadCurrentA,0);
  assert.equal(off.result.drainSourceVoltageV,12);
  assert.equal(off.result.flybackClampVoltageV,12.3);
  assert.ok(off.result.turnOffDecay[0].currentA>off.result.turnOffDecay[1].currentA);
  assert.ok(off.result.turnOffDecay[1].currentA>off.result.turnOffDecay[2].currentA);
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="VCC").endpoints=["supply:+","coil-r:1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue NPN emitter follower tracks a DC sweep one VBE below input",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/032-emitter-follower.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const expected=[[0.5,0],[1.5,0.8],[2.5,1.8],[3.5,2.8],[5,4.3]];
  for(const [inputV,outputV] of expected){
    const result=runSupportedAnalysis(updateComponent(project,"input",{value:`${inputV} V`}));
    assert.equal(result.state,"complete");
    assert.equal(result.result.kind,"npn-emitter-follower");
    assert.equal(result.result.outputVoltage,outputV);
    if(inputV>0.7)assert.ok(Math.abs(result.result.voltageDropV-0.7)<1e-12);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"input",{value:"5.1 V"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"load",{value:"0 Ω"})).state,"blocked");
});

test("catalogue common-emitter amplifier solves active bias and inverted sine trace",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/031-transistor-common-emitter.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete");
  assert.equal(result.result.kind,"npn-common-emitter");
  assert.ok(result.result.collectorCurrentA>0);
  assert.ok(result.result.vceV>0.2);
  assert.ok(result.result.collectorVoltageV>result.result.emitterVoltageV);
  assert.ok(result.result.gainVPerV<0);
  assert.ok(result.result.outputAmplitudeV>0);
  assert.ok(result.result.maximumPeakV>result.result.outputAmplitudeV);
  assert.equal(result.result.sineTrace.length,9);
  assert.ok(result.result.sineTrace[2].inputV>0&&result.result.sineTrace[2].outputV<0);
  assert.ok(result.result.sineTrace[6].inputV<0&&result.result.sineTrace[6].outputV>0);
  assert.equal(runSupportedAnalysis(updateComponent(project,"signal",{value:"3 V"})).state,"blocked");
});

test("catalogue reference buffer holds its ideal output across a load sweep",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/030-reference-buffer.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  for(const [loadOhm,expectedCurrent] of [[100000,0.000025],[10000,0.00025],[1000,0.0025]]){
    const result=runSupportedAnalysis(updateComponent(project,"load",{value:`${loadOhm} Ω`}));
    assert.equal(result.state,"complete");
    assert.equal(result.result.kind,"reference-buffer");
    assert.equal(result.result.outputVoltage,2.5);
    assert.equal(result.result.loadCurrentA,expectedCurrent);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"load",{value:"0 Ω"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="OUTPUT").endpoints=["opamp:OUT","load:1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue window comparator lights only between the two divider thresholds",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/029-window-comparator.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const middle=runSupportedAnalysis(project);
  assert.equal(middle.state,"complete");
  assert.equal(middle.result.kind,"window-comparator");
  assert.ok(Math.abs(middle.result.lowerThresholdV-5/3)<1e-12);
  assert.ok(Math.abs(middle.result.upperThresholdV-10/3)<1e-12);
  assert.equal(middle.result.windowActive,true);
  assert.equal(middle.result.ledOn,true);
  assert.equal(runSupportedAnalysis(updateComponent(project,"signal",{value:"1 V"})).result.windowActive,false);
  assert.equal(runSupportedAnalysis(updateComponent(project,"signal",{value:"4 V"})).result.windowActive,false);
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="LOWER_OK").endpoints=["lower:OUT"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue Schmitt trigger has distinct thresholds and retains state inside the hysteresis band",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/028-schmitt-trigger.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const below=runSupportedAnalysis(project);
  assert.equal(below.state,"complete");
  assert.equal(below.result.kind,"schmitt-trigger");
  assert.equal(below.result.fallingThresholdV,2.5);
  assert.equal(below.result.risingThresholdV,3);
  assert.equal(below.result.hysteresisV,0.5);
  assert.equal(below.result.outputState,"low");
  const above=runSupportedAnalysis(updateComponent(project,"signal",{value:"3.1 V"}));
  assert.equal(above.result.outputState,"high");
  assert.equal(runSupportedAnalysis(updateComponent(project,"signal",{value:"2.7 V"}),{previousState:"low"}).result.outputState,"low");
  assert.equal(runSupportedAnalysis(updateComponent(project,"signal",{value:"2.7 V"}),{previousState:"high"}).result.outputState,"high");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="OUT").endpoints=["schmitt:OUT","rled:1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue comparator threshold switches on rising input and off below threshold",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/027-comparator-threshold.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const below=runSupportedAnalysis(project);
  assert.equal(below.state,"complete");
  assert.equal(below.result.kind,"comparator-threshold");
  assert.equal(below.result.thresholdVoltage,2.5);
  assert.equal(below.result.outputState,"low");
  assert.equal(below.result.ledOn,false);
  const above=runSupportedAnalysis(updateComponent(project,"signal",{value:"2.6 V"}));
  assert.equal(above.result.outputState,"high");
  assert.equal(above.result.ledOn,true);
  assert.ok(above.result.ledCurrentA>0);
  assert.equal(runSupportedAnalysis(updateComponent(project,"signal",{value:"2.4 V"})).result.ledOn,false);
  assert.equal(runSupportedAnalysis(updateComponent(project,"signal",{value:"6 V"})).state,"blocked");
});

test("catalogue op-amp voltage follower tracks input amplitude and blocks rail overdrive",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/026-opamp-voltage-follower.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  for(const inputV of [0.1,0.2,0.5,3]){
    const result=runSupportedAnalysis(updateComponent(project,"signal",{value:`${inputV} V`}));
    assert.equal(result.state,"complete");
    assert.equal(result.result.kind,"opamp-voltage-follower");
    assert.equal(result.result.gainVPerV,1);
    assert.equal(result.result.outputAmplitudeV,inputV);
    assert.equal(result.result.phaseShiftDeg,0);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"signal",{value:"12 V"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="OUTPUT").endpoints=["opamp:OUT"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue inverting op-amp reports negative gain and phase reversal",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/025-opamp-inverting.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete");
  assert.equal(result.result.kind,"opamp-inverting");
  assert.equal(result.result.gainVPerV,-2);
  assert.equal(result.result.outputAmplitudeV,0.2);
  assert.equal(result.result.phaseShiftDeg,-180);
  assert.equal(runSupportedAnalysis(updateComponent(project,"rin",{value:"0 Ω"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="OUTPUT").endpoints=["opamp:OUT"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue non-inverting op-amp reports midband gain and rejects clipping or broken feedback",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/024-opamp-noninverting.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete");
  assert.equal(result.result.kind,"opamp-noninverting");
  assert.equal(result.result.gainVPerV,2);
  assert.equal(result.result.inputAmplitudeV,0.1);
  assert.equal(result.result.outputAmplitudeV,0.2);
  assert.equal(result.result.phaseShiftDeg,0);
  assert.equal(runSupportedAnalysis(updateComponent(project,"rf",{value:"0 Ω"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="OUTPUT").endpoints=["opamp:OUT"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
  const clipped=updateComponent(project,"rf",{value:"2 MΩ"});
  assert.equal(runSupportedAnalysis(clipped).state,"blocked");
});

test("catalogue 556 dual timer reports independent astable frequencies",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/023-556-dual-timer.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete");
  assert.equal(result.result.kind,"ne556-dual-astable");
  assert.ok(Math.abs(result.result.channelA.frequencyHz-1/(0.693*(10000+2*10000)*0.0001))<1e-12);
  assert.ok(Math.abs(result.result.channelB.frequencyHz-1/(0.693*(10000+2*10000)*0.00001))<1e-12);
  assert.notEqual(result.result.channelA.frequencyHz,result.result.channelB.frequencyHz);
  assert.ok(result.result.channelA.ledAverageCurrentA>0&&result.result.channelB.ledAverageCurrentA>0);
  assert.equal(runSupportedAnalysis(updateComponent(project,"ct-B",{value:"0 F"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="B_TIMING").endpoints=["timer-1:12","ct-B:1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue 555 monostable produces one pulse of approximately 1.1 RC", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/022-555-monostable.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const idle=runSupportedAnalysis(project);
  assert.equal(idle.state,"complete");
  assert.equal(idle.result.kind,"ne555-monostable");
  assert.equal(idle.result.triggered,false);
  assert.equal(idle.result.outputPulseCount,0);
  const triggered=runSupportedAnalysis(updateComponent(project,"trigger-1",{value:"Pressed"}));
  assert.equal(triggered.state,"complete");
  assert.equal(triggered.result.triggered,true);
  assert.equal(triggered.result.outputPulseCount,1);
  assert.ok(Math.abs(triggered.result.pulseWidthS-1.1)<1e-12);
  assert.ok(triggered.result.ledCurrentDuringPulseA>0);
  assert.equal(runSupportedAnalysis(updateComponent(project,"timing-capacitor-1",{value:"0 F"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="TIMING").endpoints=["timer-1:6","timing-capacitor-1:1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue 555 astable blinker reports timing and duty from R/C values", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/021-555-astable-blinker.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete");
  assert.equal(result.result.kind,"ne555-astable");
  assert.ok(Math.abs(result.result.frequencyHz-(1/(0.693*(10000+2*10000)*0.0001)))<1e-12);
  assert.ok(Math.abs(result.result.dutyCycle-2/3)<1e-12);
  assert.ok(result.result.ledBlinking);
  assert.ok(result.result.ledAverageCurrentA>0);
  assert.equal(runSupportedAnalysis(updateComponent(project,"timing-capacitor-1",{value:"0 F"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="TIMING").endpoints=["timer-1:2","timing-capacitor-1:1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue LDR night light switches on in darkness and off in bright light", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/020-ldr-night-light.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const night = runSupportedAnalysis(project);
  assert.equal(night.state, "complete");
  assert.equal(night.result.kind, "ldr-night-light");
  assert.equal(night.result.ledOn, true);
  assert.ok(night.result.ledCurrentA > 0);
  const day = runSupportedAnalysis(updateComponent(project, "ldr-1", { value: "Rbright 10 kΩ; Rdark 1 MΩ; light 100%" }));
  assert.equal(day.result.ledOn, false);
  assert.equal(day.result.ledCurrentA, 0);
  assert.ok(night.result.samples[0].ledOn && !night.result.samples[2].ledOn);

  assert.equal(runSupportedAnalysis(updateComponent(project, "comparator-1", { value: "Vref 6 V" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find(net => net.id === "SENSE").endpoints = ["ldr-1:2"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue NTC divider resistance and output vary monotonically from 0 to 60 C", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/019-ntc-temperature-divider.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "ntc-temperature-divider");
  const [cold, room, hot] = result.result.samples;
  assert.ok(cold.resistanceOhm > room.resistanceOhm && room.resistanceOhm > hot.resistanceOhm);
  assert.ok(cold.outputVoltage < room.outputVoltage && room.outputVoltage < hot.outputVoltage);
  assert.ok(Math.abs(room.resistanceOhm - 10000) < 1e-8);
  assert.equal(room.outputVoltage, 2.5);

  assert.equal(runSupportedAnalysis(updateComponent(project, "ntc-1", { value: "R25 10 kΩ; B 3950 K; temp -300 °C" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find(net => net.id === "VOUT").endpoints = ["ntc-1:2"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue TVS clamp holds a pulse below the entered power and energy limits", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/018-tvs-surge-clamp.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "tvs-pulse-clamp");
  assert.equal(result.result.pulseClamped, true);
  assert.equal(result.result.pulseOutputVoltage, 18);
  assert.ok(result.result.pulseEnergyJ > 0.01);
  assert.ok(result.warnings.some(message => /energy exceeds/.test(message)));
  assert.ok(result.result.pulseOutputVoltage < result.result.pulseUnclampedVoltage);

  const invalid = updateComponent(project, "source-1", { value: "12 V" });
  assert.equal(runSupportedAnalysis(invalid).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find(net => net.id === "VOUT").endpoints = ["series-resistor-1:2", "load-resistor-1:1"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue Zener shunt regulator clamps within power and reports overload", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/017-zener-shunt-regulator.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const nominal = runSupportedAnalysis(project);
  assert.equal(nominal.state, "complete");
  assert.equal(nominal.result.kind, "zener-shunt-regulator");
  assert.equal(nominal.result.outputVoltage, 5.1);
  assert.ok(nominal.result.zenerCurrentA > 0);
  assert.ok(nominal.result.zenerPowerW < nominal.result.maxZenerPowerW);
  assert.deepEqual(nominal.warnings, []);

  const overloaded = updateComponent(project, "source-1", { value: "12 V" });
  const highCurrent = updateComponent(overloaded, "series-resistor-1", { value: "10 Ω" });
  const overloadResult = runSupportedAnalysis(highCurrent);
  assert.equal(overloadResult.state, "complete");
  assert.ok(overloadResult.warnings.length > 0);
  assert.ok(overloadResult.result.zenerPowerW > overloadResult.result.maxZenerPowerW);

  assert.equal(runSupportedAnalysis(updateComponent(project, "zener-1", { value: "5.1 V" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find(net => net.id === "VOUT").endpoints = ["series-resistor-1:2", "load-resistor-1:1"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue smoothing capacitor reduces bridge ripple after startup", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/016-smoothing-capacitor.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "bridge-smoothing-capacitor");
  assert.equal(result.result.rippleFrequencyHz, 100);
  assert.ok(result.result.ripplePeakToPeakV < result.result.unfilteredRipplePeakToPeakV);
  assert.ok(result.result.averageOutputVoltage > result.result.minimumOutputVoltage);
  assert.ok(result.result.waveform.length > 10);

  const invalid = updateComponent(project, "capacitor-1", { value: "0 F" });
  assert.equal(runSupportedAnalysis(invalid).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "RECT_POS").endpoints = ["bridge-1:POS", "load-1:1"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue bridge rectifier generates full-wave output at twice line frequency", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/015-bridge-rectifier.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(validateProject(project).warnings.some((issue) => issue.rule === "UNCONNECTED_PIN"), false);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "bridge-rectifier-waveform");
  assert.equal(result.result.inputFrequencyHz, 50);
  assert.equal(result.result.rectifiedFrequencyHz, 100);
  assert.equal(result.result.rippleFrequencyHz, 100);
  assert.ok(Math.abs(result.result.peakOutputVoltage - (12 * Math.SQRT2 - 1.4)) < 1e-12);
  assert.equal(result.result.waveform[0].outputVoltage, 0);
  assert.ok(result.result.waveform.some(point => point.outputVoltage > 0));
  assert.ok(result.result.averageOutputVoltage > 0);
  assert.ok(Math.abs(result.result.powerBalanceW) < 1e-12);

  assert.equal(runSupportedAnalysis(updateComponent(project, "source-1", { value: "12 V RMS, 0 Hz" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "AC2").endpoints = ["source-1:-"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue passive tone control reduces treble as the rheostat increases", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/014-passive-tone-control.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(validateProject(project).warnings.some((issue) => issue.rule === "UNCONNECTED_PIN"), false);
  const middle = runSupportedAnalysis(project);
  assert.equal(middle.state, "complete");
  assert.equal(middle.result.kind, "passive-tone-control");
  assert.equal(middle.result.positionPercent, 50);
  assert.equal(middle.result.response.length, 3);
  assert.ok(middle.result.response[0].gain > middle.result.response[2].gain);
  const minimum = runSupportedAnalysis(updateComponent(project, "pot-1", { value: "Rmax 10 kΩ; position 0%" }));
  const maximum = runSupportedAnalysis(updateComponent(project, "pot-1", { value: "Rmax 10 kΩ; position 100%" }));
  assert.equal(minimum.state, "complete");
  assert.ok(Math.abs(minimum.result.response[2].gain - 1) < 1e-12);
  assert.ok(maximum.result.response[2].gain < middle.result.response[2].gain);
  assert.ok(maximum.result.response[0].gain > maximum.result.response[2].gain);
  assert.equal(runSupportedAnalysis(updateComponent(project, "pot-1", { value: "Rmax 10 kΩ; position 120%" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "OUTPUT").endpoints = ["cap-1:1"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue supercapacitor hold-up follows an exponential discharge curve", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/010-supercapacitor-hold-up.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(validateProject(project).warnings.some((issue) => issue.rule === "UNCONNECTED_PIN"), false);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "supercap-hold-up");
  assert.equal(result.result.timeConstantS, 100);
  assert.ok(Math.abs(result.result.holdUpTimeS - 100 * Math.log(4.7 / 3)) < 1e-12);
  assert.equal(result.result.samples[0].voltage, 4.7);
  assert.ok(Math.abs(result.result.samples[3].voltage - 3) < 1e-12);
  assert.ok(result.result.samples[1].voltage > result.result.samples[2].voltage);
  assert.equal(result.result.initialStoredEnergyJ, 0.5 * 4.7 ** 2);

  assert.equal(runSupportedAnalysis(updateComponent(project, "cap-1", { value: "C 1 F; Vstart 4.7 V; Vmin 3 V; Vmax 4 V" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "CAP_LOAD").endpoints = ["diode-1:K"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue solar garden light charges in daylight and lights at night", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/009-solar-garden-light.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(validateProject(project).warnings.some((issue) => issue.rule === "UNCONNECTED_PIN"), false);
  const day = runSupportedAnalysis(project);
  assert.equal(day.state, "complete");
  assert.equal(day.result.kind, "solar-garden-light");
  assert.equal(day.result.illuminationPercent, 100);
  assert.equal(day.result.mosfetConducting, false);
  assert.equal(day.result.ledOn, false);
  assert.ok(Math.abs(day.result.chargeCurrentA - 0.1 * (1 - 4 / 6)) < 1e-12);
  assert.ok(Math.abs(day.result.solarPowerBalanceW) < 1e-12);

  const nightProject = updateComponent(project, "ldr-1", { value: "Rbright 10 kΩ; Rdark 1 MΩ; light 0%" });
  const night = runSupportedAnalysis(nightProject);
  assert.equal(night.state, "complete");
  assert.equal(night.result.illuminationPercent, 0);
  assert.equal(night.result.chargeCurrentA, 0);
  assert.equal(night.result.mosfetConducting, true);
  assert.equal(night.result.ledOn, true);
  assert.ok(Math.abs(night.result.ledCurrentA - (3.7 - 2) / 330) < 1e-12);
  assert.ok(night.result.batteryCurrentIntoBatteryA < 0);
  assert.ok(Math.abs(night.result.ledPowerBalanceW) < 1e-12);

  assert.equal(runSupportedAnalysis(updateComponent(project, "ldr-1", { value: "light 110%" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "GATE").endpoints = ["ldr-1:1"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue USB LED estimates normal current and flags a PTC hold-current overload", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/008-usb-powered-led.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(validateProject(project).warnings.some((issue) => issue.rule === "UNCONNECTED_PIN"), false);
  const normal = runSupportedAnalysis(project);
  assert.equal(normal.state, "complete");
  assert.equal(normal.result.kind, "usb-led-ptc");
  assert.equal(normal.result.holdCurrentExceeded, false);
  assert.equal(normal.result.overloadWarning, false);
  assert.equal(normal.result.fuseTripPredicted, false);
  assert.ok(Math.abs(normal.result.currentA - 3 / 330.1) < 1e-12);
  assert.ok(Math.abs(normal.result.powerBalanceW) < 1e-12);

  const overload = runSupportedAnalysis(updateComponent(project, "resistor-1", { value: "1 Ω" }));
  assert.equal(overload.state, "complete");
  assert.equal(overload.result.holdCurrentExceeded, true);
  assert.equal(overload.result.overloadWarning, true);
  assert.equal(overload.result.fuseTripPredicted, false);
  assert.match(overload.message, /exceeds the configured PTC hold current/);
  assert.ok(Math.abs(overload.result.powerBalanceW) < 1e-12);

  assert.equal(runSupportedAnalysis(updateComponent(project, "fuse-1", { value: "invalid" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "FUSED_5V").endpoints = ["fuse-1:2"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue 5 V linear supply estimates ripple and regulator dropout", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/007-linear-regulated-supply.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(validateProject(project).warnings.some((issue) => issue.rule === "UNCONNECTED_PIN"), false);
  const nominal = runSupportedAnalysis(project);
  assert.equal(nominal.state, "complete");
  assert.equal(nominal.result.kind, "linear-regulated-supply");
  assert.equal(nominal.result.secondaryRmsVoltage, 12);
  assert.equal(nominal.result.rectifiedFrequencyHz, 100);
  assert.equal(nominal.result.regulated, true);
  assert.equal(nominal.result.outputVoltage, 5);
  assert.ok(Math.abs(nominal.result.rippleVoltagePP - 0.5) < 1e-12);
  assert.ok(nominal.result.dropoutMarginV > 0);
  assert.ok(Math.abs(nominal.result.powerBalanceW) < 1e-12);
  const lowLine = runSupportedAnalysis(updateComponent(project, "source-1", { value: "120 V RMS, 50 Hz" }));
  assert.equal(lowLine.state, "complete");
  assert.equal(lowLine.result.regulated, false);
  assert.ok(lowLine.result.outputVoltage > 4.9 && lowLine.result.outputVoltage < 5);
  assert.ok(Math.abs(lowLine.result.minimumRectifiedVoltage - lowLine.result.outputVoltage - 2) < 1e-12);
  assert.equal(runSupportedAnalysis(updateComponent(project, "source-1", { value: "230 V RMS, 0 Hz" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "DC_RAW").endpoints = ["bridge-1:POS"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue battery discharge monitor asserts across the divider threshold", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/006-battery-discharge-monitor.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(validateProject(project).warnings.some((issue) => issue.rule === "UNCONNECTED_PIN"), false);
  const nominal = runSupportedAnalysis(project);
  assert.equal(nominal.state, "complete");
  assert.equal(nominal.result.kind, "battery-discharge-monitor");
  assert.equal(nominal.result.tripBatteryVoltage, 7.5);
  assert.equal(nominal.result.lowBattery, false);
  assert.equal(nominal.result.ledOn, false);
  assert.ok(Math.abs(nominal.result.dividerCurrentA - 9 / 20000) < 1e-12);

  const above = runSupportedAnalysis(updateComponent(project, "battery-1", { value: "7.6 V" }));
  assert.equal(above.state, "complete");
  assert.equal(above.result.lowBattery, false);
  const below = runSupportedAnalysis(updateComponent(project, "battery-1", { value: "7.4 V" }));
  assert.equal(below.state, "complete");
  assert.equal(below.result.lowBattery, true);
  assert.equal(below.result.ledOn, true);
  assert.ok(Math.abs(below.result.ledCurrentA - (7.4 - 2) / 1000) < 1e-12);
  assert.ok(Math.abs(below.result.powerBalanceW) < 1e-12);

  assert.equal(runSupportedAnalysis(updateComponent(project, "comparator-1", { value: "bad threshold" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "SENSE").endpoints = ["upper-1:2"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue PWM LED dimmer reports a bounded average-current duty sweep", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/005-pwm-led-dimmer.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(validateProject(project).warnings.some((issue) => issue.rule === "UNCONNECTED_PIN"), false);
  const measured = [];
  for (const duty of [10, 50, 90]) {
    const candidate = updateComponent(project, "pwm-1", { value: `1 kHz, ${duty}%, 5 V` });
    const result = runSupportedAnalysis(candidate);
    assert.equal(result.state, "complete");
    assert.equal(result.result.kind, "pwm-led-average");
    assert.equal(result.result.frequencyHz, 1000);
    assert.equal(result.result.requestedDutyPercent, duty);
    assert.ok(Math.abs(result.result.averageCurrentA - ((5 - 2) / 330) * duty / 100) < 1e-12);
    assert.ok(Math.abs(result.result.powerBalanceW) < 1e-12);
    measured.push(result.result.averageCurrentA);
  }
  assert.ok(measured[0] < measured[1] && measured[1] < measured[2]);

  const gateLow = updateComponent(project, "pwm-1", { value: "1 kHz, 90%, 1 V" });
  assert.equal(runSupportedAnalysis(gateLow).result.averageCurrentA, 0);
  assert.equal(runSupportedAnalysis(updateComponent(project, "pwm-1", { value: "1 kHz, 110%, 5 V" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "GATE").endpoints = ["pwm-1:+"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("12 V LED limiter example calculates the documented current", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/007-led-current-limiter-12v.adigun.json", import.meta.url)));
  const result = runSupportedAnalysis(project);
  assert.equal(validateProject(project).valid, true);
  assert.equal(result.state, "complete");
  assert.ok(Math.abs(result.result.currentA - (10 / 2200)) < 1e-12);
});

test("3.3 V LED limiter example calculates the documented current", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/008-led-current-limiter-3v3.adigun.json", import.meta.url)));
  const result = runSupportedAnalysis(project);
  assert.equal(validateProject(project).valid, true);
  assert.equal(result.state, "complete");
  assert.ok(Math.abs(result.result.currentA - (1.3 / 150)) < 1e-12);
});

test("3 kΩ / 1 kΩ divider example calculates output voltage", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/009-dc-voltage-divider-3k-1k.adigun.json", import.meta.url)));
  const result = runSupportedAnalysis(project);
  assert.equal(validateProject(project).valid, true);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "voltage-divider");
  assert.equal(result.result.outputVoltage, 2.25);
});

test("12 V parallel load example solves its midpoint and source current", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/010-parallel-load-12v.adigun.json", import.meta.url)));
  const result = runSupportedAnalysis(project);
  assert.equal(validateProject(project).valid, true);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "resistive-network");
  assert.ok(Math.abs(result.result.nodeVoltages.MID - (12 * 6 / 11)) < 1e-9);
  assert.ok(Math.abs(result.result.sourceCurrentA - (12 / 2200)) < 1e-12);
});

test("released examples carry a native project, acceptance test, safety scope, and supported result", async () => {
  const registry = JSON.parse(await readFile(new URL("../examples/manifest.json", import.meta.url)));
  assert.equal(validateExampleRegistry(registry).valid, true);
  for (const item of registry.examples.filter((example) => example.status === "released")) {
    const example = JSON.parse(await readFile(new URL(`../${item.projectFile}`, import.meta.url)));
    assert.equal(validateProject(example).valid, true, item.id);
    assert.equal(runSupportedAnalysis(example).state, "complete", item.id);
  }
  assert.equal(getExampleCoverage(registry).total, 93);
  assert.equal(getExampleCoverage(registry).released, 83);
  assert.equal(getExampleCoverage(registry).supplemental, 10);
  assert.equal(getExampleCoverage(registry).remaining, 117);
  const catalogue = registry.examples.filter((item) => item.status === "released" && item.scope === "catalogue");
  assert.deepEqual(catalogue.map((item) => item.catalogueIndex), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83]);
  const supplemental = registry.examples.filter((item) => item.status === "released" && item.scope === "supplemental");
  assert.equal(supplemental.length, 10);
  assert.equal(supplemental[0].catalogueIndex, undefined);
});

test("released example status cannot be asserted without passing CI evidence", () => {
  const entry = { id: "x", title: "x", status: "released", objective: "x", acceptanceTest: "x", safetyNote: "x", testId: "x", projectFile: "examples/x.json" };
  assert.ok(validateExampleRegistry({ schemaVersion: 1, examples: [entry] }).errors.some((issue) => issue.code === "RELEASE_RESULT"));
  assert.ok(validateExampleRegistry({ schemaVersion: 1, examples: [null] }).errors.some((issue) => issue.code === "EXAMPLE_OBJECT"));
});

test("all supported UI locales contain every declared interface key", () => {
  for (const locale of UI_LOCALES) {
    for (const key of UI_KEYS) assert.ok(TRANSLATIONS[locale][key], `${locale} is missing ${key}`);
  }
  assert.equal(translate("unsupported-locale", "newProject"), "New Project");
});

test("catalogue NPN relay driver estimates coil pull-in and flyback release current", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/035-npn-relay-driver.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const on = runSupportedAnalysis(project);
  assert.equal(on.state, "complete");
  assert.equal(on.result.kind, "npn-relay-driver");
  assert.equal(on.result.transistorSaturated, true);
  assert.equal(on.result.relayEnergizedEstimate, true);
  assert.ok(Math.abs(on.result.baseCurrentA - (5 - 0.7) / 220) < 1e-12);
  assert.ok(Math.abs(on.result.coilCurrentA - (12 - 0.2) / 24) < 1e-12);
  assert.ok(Math.abs(on.result.collectorVoltageV - 0.2) < 1e-12);
  assert.ok(Math.abs(on.result.coilStoredEnergyJ - 0.5 * 0.1 * on.result.coilCurrentA ** 2) < 1e-12);
  assert.equal(on.result.turnOffDecay.length, 3);
  assert.ok(Math.abs(on.result.turnOffDecay[0].currentA - on.result.coilCurrentA) < 1e-12);
  assert.ok(on.result.turnOffDecay[1].currentA > 0);
  assert.ok(on.result.turnOffDecay[2].currentA < on.result.turnOffDecay[1].currentA);
  assert.equal(on.result.flybackClampVoltageV, 12.3);

  const offProject = updateComponent(project, "control", { value: "0 V" });
  const off = runSupportedAnalysis(offProject);
  assert.equal(off.state, "complete");
  assert.equal(off.result.transistorConducting, false);
  assert.equal(off.result.coilCurrentA, 0);
  assert.equal(off.result.relayEnergizedEstimate, false);

  const weakDrive = runSupportedAnalysis(updateComponent(project, "control", { value: "1 V" }));
  assert.equal(weakDrive.state, "complete");
  assert.equal(weakDrive.result.transistorSaturated, false);
  assert.ok(Math.abs(weakDrive.result.coilCurrentA - 100 * (1 - 0.7) / 220) < 1e-12);
  assert.equal(weakDrive.result.relayEnergizedEstimate, false);

  const reversedDiode = structuredClone(project);
  reversedDiode.nets.find((net) => net.id === "VCC").endpoints = ["supply:+", "coil-resistor:1", "flyback:A"];
  reversedDiode.nets.find((net) => net.id === "COLLECTOR").endpoints = ["coil-inductor:2", "npn:C", "flyback:K"];
  assert.equal(runSupportedAnalysis(reversedDiode).state, "blocked");

  const excessiveBaseDrive = updateComponent(project, "base-resistor", { value: "10 Ω" });
  assert.equal(runSupportedAnalysis(excessiveBaseDrive).state, "blocked");
});

test("catalogue H-bridge reverses the motor model and blocks same-leg shoot-through", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/036-hbridge-dc-motor.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const forward = runSupportedAnalysis(project);
  assert.equal(forward.state, "complete");
  assert.equal(forward.result.kind, "hbridge-dc-motor");
  assert.equal(forward.result.direction, "forward");
  assert.equal(forward.result.shootThrough, false);
  assert.equal(forward.result.switchState.leftHighOn, true);
  assert.equal(forward.result.switchState.rightLowOn, true);
  assert.ok(Math.abs(forward.result.motorCurrentA - 12 / 6.2) < 1e-12);
  assert.ok(Math.abs(forward.result.motorVoltageV - forward.result.motorCurrentA * 6) < 1e-12);
  assert.ok(forward.result.motorPowerW > 0);

  let reverseProject = updateComponent(project, "gate-lh", { value: "12 V" });
  reverseProject = updateComponent(reverseProject, "gate-ll", { value: "5 V" });
  reverseProject = updateComponent(reverseProject, "gate-rh", { value: "0 V" });
  reverseProject = updateComponent(reverseProject, "gate-rl", { value: "0 V" });
  const reverse = runSupportedAnalysis(reverseProject);
  assert.equal(reverse.state, "complete");
  assert.equal(reverse.result.direction, "reverse");
  assert.ok(reverse.result.motorCurrentA < 0);
  assert.ok(reverse.result.motorVoltageV < 0);
  assert.equal(reverse.result.shootThrough, false);

  let coastProject = updateComponent(project, "gate-lh", { value: "12 V" });
  coastProject = updateComponent(coastProject, "gate-rh", { value: "12 V" });
  coastProject = updateComponent(coastProject, "gate-rl", { value: "0 V" });
  const coast = runSupportedAnalysis(coastProject);
  assert.equal(coast.state, "complete");
  assert.equal(coast.result.direction, "coast");
  assert.equal(coast.result.motorVoltageV, null);
  assert.equal(coast.result.motorPowerW, 0);

  const shootThrough = runSupportedAnalysis(updateComponent(project, "gate-ll", { value: "5 V" }));
  assert.equal(shootThrough.state, "blocked");
  assert.match(shootThrough.message, /Shoot-through interlock/);

  const overvoltage = runSupportedAnalysis(updateComponent(project, "gate-lh", { value: "21 V" }));
  assert.equal(overvoltage.state, "blocked");
});

test("catalogue electret audio preamp calculates mic bias, midband gain, and coupling response", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/037-electret-audio-preamp.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "electret-audio-preamp");
  assert.equal(result.result.microphoneBiasVoltageV, 3.9);
  assert.equal(result.result.referenceVoltageV, 2.5);
  assert.equal(result.result.gainVPerV, 100);
  assert.ok(Math.abs(result.result.highPassCutoffHz - 1 / (2 * Math.PI * 17200 * 10e-6)) < 1e-12);
  assert.ok(result.result.signalBandSamples[0].gain < result.result.signalBandSamples[1].gain);
  assert.ok(result.result.signalBandSamples[1].gain < result.result.signalBandSamples[2].gain);
  assert.ok(Math.abs(result.result.outputAmplitudeV - 1) < 1e-4);
  assert.equal(result.result.outputWithinSupplyRails, true);
  assert.ok(result.result.outputMinimumV > 0 && result.result.outputMaximumV < 5);

  const overbiased = updateComponent(project, "microphone", { value: "Imic 3 mA; Vsig 10 mV; f 1 kHz; Rs 2.2 kΩ" });
  assert.equal(runSupportedAnalysis(overbiased).state, "blocked");
  const overdriven = updateComponent(project, "microphone", { value: "Imic 0.5 mA; Vsig 40 mV; f 1 kHz; Rs 2.2 kΩ" });
  assert.equal(runSupportedAnalysis(overdriven).state, "blocked");

  const brokenCoupling = structuredClone(project);
  brokenCoupling.nets.find((net) => net.id === "MIC_OUT").endpoints = ["microphone:OUT", "mic-bias:2"];
  assert.equal(runSupportedAnalysis(brokenCoupling).state, "blocked");
});

test("catalogue class-AB audio amplifier reports speaker power and clipping warning", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/038-audio-power-amplifier.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "audio-power-amplifier");
  assert.equal(result.result.clipped, false);
  assert.equal(result.result.outputBiasVoltageV, 4.5);
  assert.ok(Math.abs(result.result.requestedOutputAmplitudeV - 1.6) < 1e-12);
  assert.ok(result.result.speakerVoltageRmsV > 0);
  assert.ok(result.result.speakerCurrentRmsA > 0);
  assert.ok(result.result.speakerRealPowerW > 0);
  assert.ok(result.result.frequencyResponse[0].gain < result.result.frequencyResponse[1].gain);
  assert.ok(result.result.frequencyResponse[0].gain < result.result.frequencyResponse[2].gain);
  assert.equal(result.result.clippingWarning, null);
  assert.match(result.message, /does not calculate THD/);

  const overdriven = runSupportedAnalysis(updateComponent(project, "input", { value: "200 mV" }));
  assert.equal(overdriven.state, "complete");
  assert.equal(overdriven.result.clipped, true);
  assert.equal(overdriven.result.amplifierOutputAmplitudeV, 2);
  assert.match(overdriven.result.clippingWarning, /distortion is not modeled/);

  const brokenOutput = structuredClone(project);
  brokenOutput.nets.find((net) => net.id === "SPEAKER_PLUS").endpoints = ["speaker:+"];
  assert.equal(runSupportedAnalysis(brokenOutput).state, "blocked");
});

test("catalogue active low-pass filter matches its designed cutoff and gain", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/039-active-low-pass.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "active-low-pass");
  assert.ok(Math.abs(result.result.cutoffHz - 1 / (2 * Math.PI * 10000 * 10e-9)) < 1e-12);
  assert.equal(result.result.passbandGain, 2);
  const [below, cutoff, above] = result.result.response;
  assert.ok(Math.abs(below.gain - (2 / Math.sqrt(1.01))) < 1e-12);
  assert.ok(Math.abs(cutoff.gain - 2 / Math.sqrt(2)) < 1e-12);
  assert.ok(Math.abs(above.gain - (2 / Math.sqrt(101))) < 1e-12);
  assert.ok(below.gain > cutoff.gain && cutoff.gain > above.gain);
  assert.equal(result.result.maximumOutputAmplitudeV, 2);

  const overload = runSupportedAnalysis(updateComponent(project, "input", { value: "10 V" }));
  assert.equal(overload.state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "FILTERED_INPUT").endpoints = ["input-resistor:2", "opamp:+"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue Wien bridge oscillator starts above unity loop gain and limits amplitude", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/040-wien-bridge-oscillator.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.result.kind, "wien-bridge-oscillator");
  assert.ok(Math.abs(result.result.frequencyHz - 1 / (2 * Math.PI * 10e3 * 10e-9)) < 1e-12);
  assert.equal(result.result.amplifierGain, 3.2);
  assert.ok(result.result.loopGain > 1);
  assert.equal(result.result.oscillationStarts, true);
  assert.ok(Math.abs(result.result.estimatedSteadyAmplitudeV - (0.3 * 32 / 22)) < 1e-12);
  assert.equal(result.result.outputWithinSupplyRails, true);

  const belowStartup = runSupportedAnalysis(updateComponent(project, "feedback", { value: "18 kΩ" }));
  assert.equal(belowStartup.state, "complete");
  assert.equal(belowStartup.result.oscillationStarts, false);
  assert.equal(belowStartup.result.estimatedSteadyAmplitudeV, 0);

  const unbalancedBridge = runSupportedAnalysis(updateComponent(project, "shunt-resistor", { value: "12 kΩ" }));
  assert.equal(unbalancedBridge.state, "blocked");

  const sameDirectionDiodes = structuredClone(project);
  sameDirectionDiodes.nets.find((net) => net.id === "OUTPUT").endpoints = ["opamp:OUT", "series-capacitor:1", "feedback:1", "limiter-1:A", "limiter-2:A"];
  sameDirectionDiodes.nets.find((net) => net.id === "INVERTING").endpoints = ["opamp:-", "feedback:2", "gain-leg:1", "limiter-1:K", "limiter-2:K"];
  assert.equal(runSupportedAnalysis(sameDirectionDiodes).state, "blocked");
});

test("catalogue AND gate matches all input vectors and drives a current-limited LED", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/041-and-gate-truth-table.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const vectors = [[0, 0, false], [0, 5, false], [5, 0, false], [5, 5, true]];
  for (const [a, b, expected] of vectors) {
    let vector = updateComponent(project, "input-a", { value: `${a} V` });
    vector = updateComponent(vector, "input-b", { value: `${b} V` });
    const result = runSupportedAnalysis(vector);
    assert.equal(result.state, "complete");
    assert.equal(result.result.outputHigh, expected);
    assert.equal(result.result.ledOn, expected);
    assert.equal(result.result.ledCurrentA, expected ? (5 - 2) / 330 : 0);
  }
  let threshold = updateComponent(project, "input-a", { value: "2.5 V" });
  threshold = updateComponent(threshold, "input-b", { value: "5 V" });
  assert.equal(runSupportedAnalysis(threshold).result.outputHigh, true);
  assert.equal(runSupportedAnalysis(updateComponent(project, "input-a", { value: "6 V" })).state, "blocked");

  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "LED_A").endpoints = ["led:A"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue OR gate matches all input vectors and drives the LED for either high input", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/042-or-gate-truth-table.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-or-ideal"), true);
  const vectors = [[0, 0, false], [0, 5, true], [5, 0, true], [5, 5, true]];
  for (const [a, b, expected] of vectors) {
    let vector = updateComponent(project, "input-a", { value: `${a} V` });
    vector = updateComponent(vector, "input-b", { value: `${b} V` });
    const result = runSupportedAnalysis(vector);
    assert.equal(result.state, "complete");
    assert.equal(result.result.kind, "or-gate-truth-table");
    assert.equal(result.result.outputHigh, expected);
    assert.equal(result.result.ledOn, expected);
    assert.equal(result.result.ledCurrentA, expected ? (5 - 2) / 330 : 0);
  }
  const invalid = updateComponent(project, "input-b", { value: "6 V" });
  assert.equal(runSupportedAnalysis(invalid).state, "blocked");
});

test("catalogue XOR parity checker asserts for odd parity only", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/043-xor-parity-checker.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-xor-ideal"), true);
  const vectors = [[0, 0, false], [0, 5, true], [5, 0, true], [5, 5, false]];
  for (const [a, b, expected] of vectors) {
    let vector = updateComponent(project, "input-a", { value: `${a} V` });
    vector = updateComponent(vector, "input-b", { value: `${b} V` });
    const result = runSupportedAnalysis(vector);
    assert.equal(result.state, "complete");
    assert.equal(result.result.kind, "xor-gate-truth-table");
    assert.equal(result.result.outputHigh, expected);
    assert.equal(result.result.ledOn, expected);
    assert.equal(result.result.ledCurrentA, expected ? (5 - 2) / 330 : 0);
  }
});

test("catalogue NOR SR latch sets, resets, holds state, and blocks forbidden inputs", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/044-sr-latch-nor.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  const set = runSupportedAnalysis(project);
  assert.equal(set.state, "complete");
  assert.equal(set.result.kind, "nor-sr-latch");
  assert.equal(set.result.q, true);
  assert.equal(set.result.qBar, false);
  assert.equal(set.result.mode, "set");
  assert.ok(Math.abs(set.result.qLedCurrentA - (5 - 2) / 330) < 1e-12);

  let holdProject = updateComponent(project, "set-input", { value: "0 V" });
  holdProject = updateComponent(holdProject, "reset-input", { value: "0 V" });
  const heldSet = runSupportedAnalysis(holdProject, { previousState: set });
  assert.equal(heldSet.state, "complete");
  assert.equal(heldSet.result.mode, "hold");
  assert.equal(heldSet.result.q, true);
  assert.equal(heldSet.result.qBar, false);

  let resetProject = updateComponent(project, "set-input", { value: "0 V" });
  resetProject = updateComponent(resetProject, "reset-input", { value: "5 V" });
  const reset = runSupportedAnalysis(resetProject);
  assert.equal(reset.state, "complete");
  assert.equal(reset.result.mode, "reset");
  assert.equal(reset.result.q, false);
  assert.equal(reset.result.qBar, true);
  const heldReset = runSupportedAnalysis(holdProject, { previousState: reset });
  assert.equal(heldReset.result.q, false);
  assert.equal(heldReset.result.qBar, true);

  let forbidden = updateComponent(project, "set-input", { value: "5 V" });
  forbidden = updateComponent(forbidden, "reset-input", { value: "5 V" });
  assert.equal(runSupportedAnalysis(forbidden).state, "blocked");
  assert.equal(runSupportedAnalysis(holdProject).state, "blocked");
});

test("catalogue D flip-flop samples data only on rising edges and annotates timing limits", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/045-d-flip-flop-register.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-dff-ideal"), true);

  const initial = runSupportedAnalysis(project);
  assert.equal(initial.state, "complete");
  assert.equal(initial.result.kind, "d-flip-flop");
  assert.equal(initial.result.q, null);
  assert.equal(initial.result.mode, "low-level hold");
  assert.match(initial.result.timingAnnotation, /not simulated/);

  let rising = updateComponent(project, "data-input", { value: "5 V" });
  rising = updateComponent(rising, "clock-input", { value: "5 V" });
  const sampledOne = runSupportedAnalysis(rising, { previousState: initial });
  assert.equal(sampledOne.state, "complete");
  assert.equal(sampledOne.result.risingEdge, true);
  assert.equal(sampledOne.result.sampled, true);
  assert.equal(sampledOne.result.q, true);
  assert.ok(Math.abs(sampledOne.result.ledCurrentA - (5 - 2) / 330) < 1e-12);

  let highLevel = updateComponent(rising, "data-input", { value: "0 V" });
  const heldHigh = runSupportedAnalysis(highLevel, { previousState: sampledOne });
  assert.equal(heldHigh.result.risingEdge, false);
  assert.equal(heldHigh.result.q, true);

  let falling = updateComponent(highLevel, "clock-input", { value: "0 V" });
  const afterFalling = runSupportedAnalysis(falling, { previousState: heldHigh });
  assert.equal(afterFalling.result.risingEdge, false);
  assert.equal(afterFalling.result.q, true);

  let secondRising = updateComponent(falling, "clock-input", { value: "5 V" });
  const sampledZero = runSupportedAnalysis(secondRising, { previousState: afterFalling });
  assert.equal(sampledZero.result.risingEdge, true);
  assert.equal(sampledZero.result.q, false);
  assert.equal(sampledZero.result.qBar, true);
  assert.equal(sampledZero.result.ledCurrentA, 0);

  assert.equal(runSupportedAnalysis(updateComponent(project, "clock-input", { value: "5 V" })).state, "blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project, "data-input", { value: "6 V" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "DATA").endpoints = ["data-input:+"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});


test("catalogue JK toggle divider toggles on each rising edge and clears asynchronously", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/046-jk-toggle-divider.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-jk-ideal"), true);

  const cleared = runSupportedAnalysis(project);
  assert.equal(cleared.state, "complete");
  assert.equal(cleared.result.kind, "jk-toggle-divider");
  assert.equal(cleared.result.mode, "asynchronous clear");
  assert.equal(cleared.result.q, false);

  let released = updateComponent(project, "clear-input", { value: "5 V" });
  const lowClock = runSupportedAnalysis(released, { previousState: cleared });
  assert.equal(lowClock.result.mode, "low-level hold");
  assert.equal(lowClock.result.q, false);

  let firstEdge = updateComponent(released, "clock-input", { value: "5 V" });
  const first = runSupportedAnalysis(firstEdge, { previousState: lowClock });
  assert.equal(first.result.risingEdge, true);
  assert.equal(first.result.mode, "toggle");
  assert.equal(first.result.q, true);
  assert.equal(first.result.risingEdgeCount, 1);
  assert.equal(first.result.outputToClockFrequencyRatio, 0.5);

  let fallingProject = updateComponent(firstEdge, "clock-input", { value: "0 V" });
  const falling = runSupportedAnalysis(fallingProject, { previousState: first });
  assert.equal(falling.result.risingEdge, false);
  assert.equal(falling.result.q, true);
  let secondEdge = updateComponent(fallingProject, "clock-input", { value: "5 V" });
  const second = runSupportedAnalysis(secondEdge, { previousState: falling });
  assert.equal(second.result.q, false);
  assert.equal(second.result.risingEdgeCount, 2);

  const clearedAgain = runSupportedAnalysis(updateComponent(secondEdge, "clear-input", { value: "0 V" }), { previousState: second });
  assert.equal(clearedAgain.result.q, false);
  assert.equal(clearedAgain.result.mode, "asynchronous clear");
  assert.equal(runSupportedAnalysis(updateComponent(project, "clock-input", { value: "6 V" })).state, "blocked");

  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "J").endpoints = ["j-input:+"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});


test("catalogue four-bit counter counts rising edges through 15 and wraps to zero", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/047-four-bit-binary-counter.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-counter-4bit-ideal"), true);
  const reset = runSupportedAnalysis(project);
  assert.equal(reset.state, "complete");
  assert.equal(reset.result.count, 0);
  assert.deepEqual(reset.result.bits, [false, false, false, false]);
  assert.equal(reset.result.mode, "asynchronous reset");

  let stateProject = updateComponent(project, "reset-input", { value: "5 V" });
  let state = runSupportedAnalysis(stateProject, { previousState: reset });
  assert.equal(state.result.count, 0);
  for (let expected = 1; expected <= 16; expected++) {
    stateProject = updateComponent(stateProject, "clock-input", { value: "5 V" });
    state = runSupportedAnalysis(stateProject, { previousState: state });
    assert.equal(state.state, "complete");
    assert.equal(state.result.count, expected & 15);
    assert.equal(state.result.risingEdge, true);
    assert.equal(state.result.risingEdgeCount, expected);
    stateProject = updateComponent(stateProject, "clock-input", { value: "0 V" });
    state = runSupportedAnalysis(stateProject, { previousState: state });
    assert.equal(state.result.count, expected & 15);
    assert.equal(state.result.risingEdge, false);
  }
  assert.equal(state.result.bitFrequencyRatios[0], 0.5);
  assert.equal(state.result.bitFrequencyRatios[3], 0.0625);
  const invalid = updateComponent(project, "clock-input", { value: "6 V" });
  assert.equal(runSupportedAnalysis(invalid).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "BIT3").endpoints = ["counter:Q3"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});


test("catalogue BCD counter displays 0 through 9 and wraps with correct segments", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/048-bcd-counter-display.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-bcd-display-ideal"), true);
  const reset = runSupportedAnalysis(project);
  assert.equal(reset.state, "complete");
  assert.equal(reset.result.digit, 0);
  assert.deepEqual(reset.result.segmentsOn, [true, true, true, true, true, true, false]);
  let stateProject = updateComponent(project, "reset-input", { value: "5 V" });
  let state = runSupportedAnalysis(stateProject, { previousState: reset });
  const expected = [
    [1,0,1,1,0,0,0,0],[2,1,1,0,1,1,0,1],[3,1,1,1,1,0,0,1],[4,0,1,1,0,0,1,1],
    [5,1,0,1,1,0,1,1],[6,1,0,1,1,1,1,1],[7,1,1,1,0,0,0,0],[8,1,1,1,1,1,1,1],[9,1,1,1,1,0,1,1]
  ];
  for (const [digit,...pattern] of expected) {
    stateProject = updateComponent(stateProject, "clock-input", { value: "5 V" });
    state = runSupportedAnalysis(stateProject, { previousState: state });
    assert.equal(state.result.digit, digit);
    assert.deepEqual(state.result.segmentsOn, pattern.map(Boolean));
    assert.equal(state.result.risingEdge, true);
    stateProject = updateComponent(stateProject, "clock-input", { value: "0 V" });
    state = runSupportedAnalysis(stateProject, { previousState: state });
    assert.equal(state.result.digit, digit);
  }
  stateProject = updateComponent(stateProject, "clock-input", { value: "5 V" });
  state = runSupportedAnalysis(stateProject, { previousState: state });
  assert.equal(state.result.digit, 0);
  assert.deepEqual(state.result.segmentsOn, [true, true, true, true, true, true, false]);
  assert.equal(runSupportedAnalysis(updateComponent(project, "clock-input", { value: "6 V" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "SEG_G").endpoints = ["display:SEG_G"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});


test("catalogue traffic-light FSM cycles safe six-phase states without opposing green", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/049-traffic-light-fsm.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-traffic-fsm-ideal"), true);
  const expected = [
    [false,false,true,true,false,false],
    [false,true,false,true,false,false],
    [true,false,false,true,false,false],
    [true,false,false,false,false,true],
    [true,false,false,false,true,false],
    [true,false,false,true,false,false]
  ];
  let state = runSupportedAnalysis(project);
  assert.equal(state.state, "complete");
  assert.equal(state.result.phase, 0);
  assert.deepEqual(state.result.lamps, expected[0]);
  let stateProject = updateComponent(project, "reset-input", { value: "5 V" });
  state = runSupportedAnalysis(stateProject, { previousState: state });
  for (let step = 1; step <= 6; step++) {
    stateProject = updateComponent(stateProject, "clock-input", { value: "5 V" });
    state = runSupportedAnalysis(stateProject, { previousState: state });
    const phase = step % 6;
    assert.equal(state.result.phase, phase);
    assert.deepEqual(state.result.lamps, expected[phase]);
    assert.equal(state.result.conflictingGreen, false);
    stateProject = updateComponent(stateProject, "clock-input", { value: "0 V" });
    state = runSupportedAnalysis(stateProject, { previousState: state });
    assert.equal(state.result.phase, phase);
    assert.equal(state.result.risingEdge, false);
  }
  const invalid = updateComponent(project, "clock-input", { value: "6 V" });
  assert.equal(runSupportedAnalysis(invalid).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "LAMP_EW_G").endpoints = ["fsm:EW_G"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});


test("catalogue digital debouncer rejects short bounce and accepts stable samples", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/050-debounced-digital-input.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-debounce-ideal"), true);
  const reset = runSupportedAnalysis(project);
  assert.equal(reset.state, "complete");
  assert.equal(reset.result.output, false);
  let p = updateComponent(project, "reset-input", { value: "5 V" });
  let state = runSupportedAnalysis(p, { previousState: reset });
  const bounce = [5, 0, 5, 0, 5, 0];
  for (const voltage of bounce) {
    p = updateComponent(p, "raw-input", { value: `${voltage} V` });
    p = updateComponent(p, "clock-input", { value: "5 V" });
    state = runSupportedAnalysis(p, { previousState: state });
    assert.equal(state.state, "complete");
    assert.equal(state.result.output, false);
    p = updateComponent(p, "clock-input", { value: "0 V" });
    state = runSupportedAnalysis(p, { previousState: state });
  }
  for (let sample = 1; sample <= 3; sample++) {
    p = updateComponent(p, "raw-input", { value: "5 V" });
    p = updateComponent(p, "clock-input", { value: "5 V" });
    state = runSupportedAnalysis(p, { previousState: state });
    assert.equal(state.state, "complete");
    assert.equal(state.result.stableSamples, sample);
    assert.equal(state.result.output, sample === 3);
    p = updateComponent(p, "clock-input", { value: "0 V" });
    state = runSupportedAnalysis(p, { previousState: state });
  }
  assert.equal(state.result.output, true);
  assert.match(state.message, /not a simulated RC\/Schmitt analog circuit/);
  assert.equal(runSupportedAnalysis(updateComponent(project, "raw-input", { value: "6 V" })).state, "blocked");
  const invalidCount = updateComponent(project, "debounce", { value: "Stable samples 1" });
  assert.equal(runSupportedAnalysis(invalidCount).state, "blocked");
});


test("catalogue four-bit ring shift register moves one LED per rising edge", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/051-shift-register-led-chaser.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-ring-shift-4bit-ideal"), true);
  const reset = runSupportedAnalysis(project);
  assert.equal(reset.state, "complete");
  assert.deepEqual(reset.result.bits, [true,false,false,false]);
  const expected = [[false,true,false,false],[false,false,true,false],[false,false,false,true],[true,false,false,false]];
  let p = updateComponent(project, "reset-input", { value: "5 V" });
  let state = runSupportedAnalysis(p, { previousState: reset });
  for (const bits of expected) {
    p = updateComponent(p, "clock-input", { value: "5 V" });
    state = runSupportedAnalysis(p, { previousState: state });
    assert.equal(state.state, "complete");
    assert.deepEqual(state.result.bits, bits);
    assert.equal(state.result.oneHot, true);
    assert.equal(state.result.activeLedIndex, bits.indexOf(true));
    p = updateComponent(p, "clock-input", { value: "0 V" });
    state = runSupportedAnalysis(p, { previousState: state });
  }
  assert.equal(runSupportedAnalysis(updateComponent(project, "clock-input", { value: "6 V" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "LED3").endpoints = ["led3:A"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});


test("catalogue four-to-one multiplexer selects each input for all data vectors", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/052-multiplexer-selector.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-mux4-ideal"), true);
  for (let data = 0; data < 16; data++) {
    let vector = project;
    for (let bit = 0; bit < 4; bit++) vector = updateComponent(vector, `input-${bit}`, { value: data & (1 << bit) ? "5 V" : "0 V" });
    for (let selected = 0; selected < 4; selected++) {
      let selection = updateComponent(vector, "select-0", { value: selected & 1 ? "5 V" : "0 V" });
      selection = updateComponent(selection, "select-1", { value: selected & 2 ? "5 V" : "0 V" });
      const result = runSupportedAnalysis(selection);
      assert.equal(result.state, "complete");
      assert.equal(result.result.selectedIndex, selected);
      assert.equal(result.result.outputHigh, Boolean(data & (1 << selected)));
    }
  }
  assert.equal(runSupportedAnalysis(updateComponent(project, "select-0", { value: "6 V" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "I3").endpoints = ["input-3:+"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});


test("catalogue two-to-four decoder asserts exactly one matching output", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/053-decoder-controlled-leds.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-decoder-2to4-ideal"), true);
  for (let address = 0; address < 4; address++) {
    let vector = updateComponent(project, "address-0", { value: address & 1 ? "5 V" : "0 V" });
    vector = updateComponent(vector, "address-1", { value: address & 2 ? "5 V" : "0 V" });
    const result = runSupportedAnalysis(vector);
    assert.equal(result.state, "complete");
    assert.equal(result.result.address, address);
    assert.deepEqual(result.result.outputsHigh, [0,1,2,3].map(i=>i===address));
    assert.equal(result.result.oneHot, true);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project, "address-1", { value: "6 V" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "Y3").endpoints = ["decoder:Y3"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});


test("catalogue priority encoder reports the highest asserted input", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/054-priority-encoder.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-priority-encoder-4to2-ideal"), true);
  const vectors = [
    [0,0,0,0,false,0,-1],[1,0,0,0,true,0,0],[0,1,0,0,true,1,1],[0,0,1,0,true,2,2],[0,0,0,1,true,3,3],
    [1,0,1,0,true,2,2],[0,1,0,1,true,3,3],[1,1,1,1,true,3,3]
  ];
  for (const [d0,d1,d2,d3,valid,code,highest] of vectors) {
    let vector=project;
    for(const [index,value] of [d0,d1,d2,d3].entries())vector=updateComponent(vector,`input-${index}`,{value:value?"5 V":"0 V"});
    const result=runSupportedAnalysis(vector);
    assert.equal(result.state,"complete",result.message);
    assert.equal(result.result.valid,valid);
    assert.equal(result.result.code,code);
    assert.equal(result.result.highestIndex,highest);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"input-3",{value:"6 V"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="D3").endpoints=["input-3:+"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue four-bit ALU matches exhaustive unsigned add/subtract vectors", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/055-alu-add-subtract.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.logic-alu4-ideal"), true);
  let vectors = 0;
  for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b++) for (const subtract of [false, true]) {
    let vector = project;
    for (let bit = 0; bit < 4; bit++) {
      vector = updateComponent(vector, `a${bit}`, { value: a & (1 << bit) ? "5 V" : "0 V" });
      vector = updateComponent(vector, `b${bit}`, { value: b & (1 << bit) ? "5 V" : "0 V" });
    }
    vector = updateComponent(vector, "subtract", { value: subtract ? "5 V" : "0 V" });
    const result = runSupportedAnalysis(vector);
    assert.equal(result.state, "complete", result.message);
    const expectedFull = subtract ? a + ((b ^ 15) + 1) : a + b;
    assert.equal(result.result.sum, expectedFull & 15, `a=${a}, b=${b}, subtract=${subtract}`);
    assert.equal(result.result.carryOut, Boolean(expectedFull & 16), `carry a=${a}, b=${b}, subtract=${subtract}`);
    assert.equal(result.result.borrow, subtract && a < b);
    vectors++;
  }
  assert.equal(vectors, 512);
  assert.equal(runSupportedAnalysis(updateComponent(project, "a0", { value: "6 V" })).state, "blocked");
  const broken = structuredClone(project);
  broken.nets.find((net) => net.id === "B3").endpoints = ["b3:+"];
  assert.equal(runSupportedAnalysis(broken).state, "blocked");
});

test("catalogue UART transmitter emits valid 8N1 frames LSB-first", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/056-uart-transmitter.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.uart-tx-ideal"), true);
  for (const [byte, baud] of [[0x00,9600],[0xA5,9600],[0xFF,115200]]) {
    const configured = updateComponent(project, "uart", { value: `Byte 0x${byte.toString(16)}; Baud ${baud}` });
    const result = runSupportedAnalysis(configured);
    assert.equal(result.state, "complete", result.message);
    assert.equal(result.result.byte, byte);
    assert.equal(result.result.baud, baud);
    assert.deepEqual(result.result.dataBits, Array.from({length:8},(_,bit)=>Boolean(byte&(1<<bit))));
    assert.deepEqual(result.result.frameBits, [false,...result.result.dataBits,true]);
    assert.equal(result.result.frameDurationSeconds, 10/baud);
    assert.equal(result.result.frameFormat, "8N1");
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"uart",{value:"Byte 256; Baud 9600"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"uart",{value:"Byte 42; Baud 100"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="TX").endpoints=["uart:TX"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue UART receiver decodes valid frames and flags start/stop errors", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/057-uart-receiver.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "input.uart-frame-source"), true);
  assert.equal(STARTER_LIBRARY.some((part) => part.id === "active.uart-rx-ideal"), true);
  const valid = runSupportedAnalysis(project);
  assert.equal(valid.state, "complete");
  assert.equal(valid.result.byte, 0xA5);
  assert.equal(valid.result.byteHex, "0xA5");
  assert.equal(valid.result.valid, true);
  assert.equal(valid.result.framingError, false);
  assert.equal(valid.result.frameDurationSeconds, 10/9600);

  const badStart=updateComponent(project,"serial-frame",{value:"Bits 1,1,0,1,0,0,1,0,1,1; Baud 9600"});
  const startError=runSupportedAnalysis(badStart);
  assert.equal(startError.state,"complete");
  assert.equal(startError.result.framingError,true);
  assert.equal(startError.result.valid,false);
  const badStop=updateComponent(project,"serial-frame",{value:"Bits 0,1,0,1,0,0,1,0,1,0; Baud 9600"});
  assert.equal(runSupportedAnalysis(badStop).result.framingError,true);
  const badLength=updateComponent(project,"serial-frame",{value:"Bits 0,1,0; Baud 9600"});
  assert.equal(runSupportedAnalysis(badLength).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="RX").endpoints=["receiver:RX"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});



test("catalogue I2C register sensor acknowledges and returns configured data", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/058-i2c-sensor-read.adigun.json", import.meta.url)));
  assert.equal(validateProject(project).valid, true);
  assert.equal(STARTER_LIBRARY.some((part)=>part.id==="input.i2c-read-transaction"),true);
  assert.equal(STARTER_LIBRARY.some((part)=>part.id==="active.i2c-sensor-ideal"),true);
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.addressMatch,true);
  assert.equal(result.result.sensorAck,true);
  assert.equal(result.result.receivedByte,0x2A);
  assert.equal(result.result.receivedHex,"0x2A");
  assert.equal(result.result.masterFinalNack,true);
  const nack=runSupportedAnalysis(updateComponent(project,"transaction",{value:"Address 0x49; Register 0x00; Baud 100000; ACK yes"}));
  assert.equal(nack.state,"complete");
  assert.equal(nack.result.sensorAck,false);
  assert.equal(nack.result.receivedByte,null);
  const absent=runSupportedAnalysis(updateComponent(project,"transaction",{value:"Address 0x48; Register 0x01; Baud 100000; ACK yes"}));
  assert.equal(absent.result.sensorAck,true);
  assert.equal(absent.result.registerMatch,false);
  assert.equal(absent.result.receivedByte,null);
  assert.equal(runSupportedAnalysis(updateComponent(project,"transaction",{value:"Address 0x48; Register 0x00; Baud 100000; ACK no"})).result.sensorAck,false);
  assert.equal(runSupportedAnalysis(updateComponent(project,"transaction",{value:"Address 0x48; Register 0x00; Baud 1000; ACK yes"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="SDA").endpoints=["transaction:SDA","sensor:SDA"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue SPI display receives mode-0 bytes MSB-first", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/059-spi-display.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.receivedByte,0xA5);
  assert.deepEqual(result.result.bits,[true,false,true,false,false,true,false,true]);
  assert.equal(result.result.sampleEdge,"rising");
  assert.equal(result.result.transferDurationSeconds,8/1000000);
  assert.equal(runSupportedAnalysis(updateComponent(project,"transfer",{value:"Mode 3; Byte 0xA5; Baud 1000000; CS active"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"transfer",{value:"Mode 0; Byte 0x100; Baud 1000000; CS active"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"transfer",{value:"Mode 0; Byte 0xA5; Baud 1000000; CS inactive"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="MOSI").endpoints=["transfer:MOSI"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue EEPROM logger preserves a written byte in its ideal register model", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/060-eeprom-data-logger.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.deviceAck,true);
  assert.equal(result.result.writeAcknowledged,true);
  assert.equal(result.result.readByte,0x5A);
  assert.equal(result.result.readHex,"0x5A");
  assert.equal(result.result.dataPreserved,true);
  const nack=runSupportedAnalysis(updateComponent(project,"transaction",{value:"Address 0x51; Register 0x10; Data 0x5A; Baud 100000; Cycle write-read; ACK yes"}));
  assert.equal(nack.result.deviceAck,false);
  assert.equal(nack.result.readByte,null);
  assert.equal(runSupportedAnalysis(updateComponent(project,"transaction",{value:"Address 0x50; Register 0x10; Data 0x100; Baud 100000; Cycle write-read; ACK yes"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"transaction",{value:"Address 0x50; Register 0x10; Data 0x5A; Baud 100000; Cycle read-only; ACK yes"})).state,"blocked");
});


test("catalogue Arduino blink produces a bounded D13 LED GPIO trace",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/061-arduino-blink.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.firmwareExecuted,false);
  assert.equal(result.result.frequencyHz,1);
  assert.deepEqual(result.result.trace.map(v=>v.gpioHigh),[true,false,true,false]);
  assert.equal(result.result.trace[0].intervalMs,500);
  assert.equal(result.result.ledCurrentA,0.00909090909090909);
  assert.equal(runSupportedAnalysis(updateComponent(project,"mcu",{value:"Program Blink; Pin D13; High 0 ms; Low 500 ms; Runtime 2000 ms"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="D13").endpoints=["mcu:D13"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue Arduino button debounce rejects bounce and toggles once per stable press",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/062-arduino-button-debounce.adigun.json",import.meta.url)));
  const result=runSupportedAnalysis(project);
  assert.equal(validateProject(project).valid,true);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.firmwareExecuted,false);
  assert.equal(result.result.toggleCount,2);
  assert.deepEqual(result.result.trace.map(x=>x.acceptedTransition&&x.stableInput===1?x.sampleIndex:null).filter(x=>x!==null),[5,11]);
  assert.equal(result.result.outputOn,false);
  assert.equal(runSupportedAnalysis(updateComponent(project,"mcu",{value:"Program Button debounce; Input D2; Output D13; Mode Toggle; Stable 21"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(n=>n.id==="BUTTON").endpoints=["button:OUT"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue Arduino PWM dimmer maps potentiometer ADC to MOSFET LED average current",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/063-arduino-pwm-dimmer.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  for(const [position,count,duty] of [[0,0,0],[50,512,512/1023],[100,1023,1]]){
    const configured=updateComponent(project,"pot",{value:`Position ${position}%; Resolution 10 bit`});
    const result=runSupportedAnalysis(configured);
    assert.equal(result.state,"complete",result.message);
    assert.equal(result.result.adcCount,count);
    assert.equal(result.result.dutyCycle,duty);
    assert.equal(result.result.firmwareExecuted,false);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"pot",{value:"Position 101%; Resolution 10 bit"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(n=>n.id==="PWM").endpoints=["mcu:D9"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue Arduino temperature monitor converts sensor samples for an LCD result",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/064-arduino-temperature-monitor.adigun.json",import.meta.url)));
  for(const celsius of [0,25,100]){
    const configured=updateComponent(project,"sensor",{value:`Temperature ${celsius} C; Scale 10 mV/C; Offset 0 mV`});
    const result=runSupportedAnalysis(configured);
    assert.equal(result.state,"complete",result.message);
    assert.equal(result.result.firmwareExecuted,false);
    assert.ok(Math.abs(result.result.displayTemperatureC-celsius)<0.5);
    assert.match(result.result.displayText,/°C$/);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"sensor",{value:"Temperature 130 C; Scale 10 mV/C; Offset 0 mV"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(n=>n.id==="SENSOR_OUT").endpoints=["sensor:OUT"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue ultrasonic ranger converts echo time and reports measurement boundaries",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/065-arduino-ultrasonic-ranger.adigun.json",import.meta.url)));
  for(const [echoUs,expectedValid] of [[117,true],[5882,true],[23323,true],[25000,false]]){
    const configured=updateComponent(project,"sensor",{value:`Echo ${echoUs} us; Minimum 20 mm; Maximum 4000 mm`});
    const result=runSupportedAnalysis(configured);
    assert.equal(result.state,"complete",result.message);
    assert.equal(result.result.measurementValid,expectedValid);
    if(expectedValid)assert.match(result.result.displayText,/cm$/);
    else assert.equal(result.result.displayText,"Out of range");
    assert.equal(result.result.firmwareExecuted,false);
  }
  const broken=structuredClone(project);
  broken.nets.find(n=>n.id==="ECHO").endpoints=["sensor:ECHO"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue Arduino servo maps potentiometer endpoints to pulse and angle",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/066-arduino-servo-control.adigun.json",import.meta.url)));
  for(const [position,angle] of [[0,0],[50,90.08797653958944],[100,180]]){
    const result=runSupportedAnalysis(updateComponent(project,"pot",{value:`Position ${position}%; Resolution 10 bit`}));
    assert.equal(result.state,"complete",result.message);
    assert.ok(Math.abs(result.result.angleDegrees-angle)<1e-10);
    assert.equal(result.result.firmwareExecuted,false);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"pot",{value:"Position 101%; Resolution 10 bit"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(n=>n.id==="SERVO_PWM").endpoints=["mcu:D9"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue Arduino stepper driver sequence maps CW/CCW pulses to motion",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/067-arduino-stepper-driver.adigun.json",import.meta.url)));
  const run=value=>runSupportedAnalysis(updateComponent(project,"mcu",{value}));
  const cw=run("Program Stepper; Step D3; DirectionPin D2; Steps 200; Direction CW; StepRate 200");
  assert.equal(cw.state,"complete",cw.message);
  assert.equal(cw.result.angularTravelDegrees,360);
  assert.equal(cw.result.finalPositionDegrees,0);
  assert.equal(cw.result.motionDurationSeconds,1);
  const ccw=run("Program Stepper; Step D3; DirectionPin D2; Steps 50; Direction CCW; StepRate 100");
  assert.equal(ccw.result.signedSteps,-50);
  assert.equal(ccw.result.angularTravelDegrees,-90);
  assert.deepEqual(ccw.result.phaseSequence[0].coils,[false,true,false,true]);
  assert.equal(run("Program Stepper; Step D3; DirectionPin D2; Steps 200; Direction CW; StepRate 0").state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(n=>n.id==="MOTOR_A1").endpoints=["driver:A1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue ESP32 telemetry mock forms JSON locally without network transmission",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/068-esp32-telemetry-mock.adigun.json",import.meta.url)));
  for(const celsius of [0,25,80]){
    const configured=updateComponent(project,"sensor",{value:`Temperature ${celsius} C; Scale 10 mV/C; Offset 0 mV`});
    const result=runSupportedAnalysis(configured);
    assert.equal(result.state,"complete",result.message);
    assert.equal(result.result.adcResolutionBits,12);
    assert.equal(result.result.transmitted,false);
    assert.equal(result.result.firmwareExecuted,false);
    assert.deepEqual(JSON.parse(result.result.payloadText),result.result.payload);
    assert.equal(result.result.payload.device,"esp32-node-01");
    assert.equal(result.result.payload.sequence,1);
    assert.ok(Math.abs(result.result.payload.temperatureC-celsius)<0.1);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"sensor",{value:"Temperature 130 C; Scale 10 mV/C; Offset 0 mV"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(n=>n.id==="TX").endpoints=["esp32:TX"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue Pico voltmeter estimates calibrated divider input at three points",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/069-pico-adc-voltmeter.adigun.json",import.meta.url)));
  for(const voltage of [6,12,13]){
    const result=runSupportedAnalysis(updateComponent(project,"vin",{value:`${voltage} V`}));
    assert.equal(result.state,"complete",result.message);
    assert.ok(Math.abs(result.result.estimatedInputVoltageV-voltage)<0.01);
    assert.equal(result.result.adcResolutionBits,12);
    assert.equal(result.result.firmwareExecuted,false);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"vin",{value:"14 V"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(n=>n.id==="ADC_MID").endpoints=["upper:2","lower:1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue STM32 timer PWM computes frequency, duty, and LED load estimate",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/070-stm32-timer-pwm.adigun.json",import.meta.url)));
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.frequencyHz,1000);
  assert.equal(result.result.dutyCycle,0.499);
  assert.ok(Math.abs(result.result.averageLedCurrentA-(1.3/330*0.499))<1e-12);
  assert.equal(result.result.firmwareExecuted,false);
  assert.equal(runSupportedAnalysis(updateComponent(project,"timer",{value:"ClockHz 72000000; Prescaler 71; AutoReload 999; Compare 1000"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"timer",{value:"ClockHz 72000000; Prescaler 71; AutoReload 999; Compare 499"})).result.frequencyHz,1000);
  const broken=structuredClone(project);
  broken.nets.find(n=>n.id==="PWM_LED").endpoints=["timer:TIM1_CH1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue PIC ADC bargraph maps 10-bit readings to LED count",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/071-pic-adc-bargraph.adigun.json",import.meta.url)));
  for(const [position,expectedCount] of [[0,0],[25,2],[50,5],[75,7],[100,10]]){
    const result=runSupportedAnalysis(updateComponent(project,"pot",{value:"Position "+position+"%; Resolution 10 bit"}));
    assert.equal(result.state,"complete",result.message);
    assert.equal(result.result.adcResolutionBits,10);
    assert.equal(result.result.illuminatedSegments,expectedCount);
    assert.equal(result.result.segments.filter(Boolean).length,expectedCount);
    assert.equal(result.result.firmwareExecuted,false);
  }
  assert.equal(runSupportedAnalysis(updateComponent(project,"pot",{value:"Position 101%; Resolution 10 bit"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="BAR_9").endpoints=["pic:BAR9"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue AVR IR receiver decodes NEC-like timing and flags invalid frames",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/072-avr-ir-receiver.adigun.json",import.meta.url)));
  const valid=runSupportedAnalysis(project);
  assert.equal(valid.state,"complete",valid.message);
  assert.equal(valid.result.rawCode,"0x00FFA25D");
  assert.equal(valid.result.address,"0x00");
  assert.equal(valid.result.command,"0xA2");
  assert.equal(valid.result.bitOrder,"LSB-first within each byte");
  assert.equal(valid.result.frameDurationUs,67980);
  assert.equal(valid.result.firmwareExecuted,false);
  const badTiming=updateComponent(project,"frame",{value:"Protocol NEC-like; Bytes 00 FF A2 5D; LeaderMarkUs 7000; LeaderSpaceUs 4500; BitMarkUs 560; ZeroSpaceUs 560; OneSpaceUs 1690; StopMarkUs 560; CarrierHz 38000"});
  assert.equal(runSupportedAnalysis(badTiming).state,"blocked");
  const badComplement=updateComponent(project,"frame",{value:"Protocol NEC-like; Bytes 00 00 A2 5D; LeaderMarkUs 9000; LeaderSpaceUs 4500; BitMarkUs 560; ZeroSpaceUs 560; OneSpaceUs 1690; StopMarkUs 560; CarrierHz 38000"});
  assert.equal(runSupportedAnalysis(badComplement).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="IR_RX").endpoints=["receiver:OUT"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("workspace matches the approved simulator layout references",async()=>{
  const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
  const app=await readFile(new URL("../app.js",import.meta.url),"utf8");
  const styles=await readFile(new URL("../styles.css",import.meta.url),"utf8");
  assert.match(html,/<details class="app-menu"/);
  assert.match(html,/id="example-picker"/);
  assert.match(html,/data-view="pcb"/);
  assert.match(html,/id="result-dashboard"/);
  assert.match(html,/data-mini-view="schematic"/);
  assert.match(app,/function renderResultDashboard/);
  assert.match(app,/examples\/070-stm32-timer-pwm\.adigun\.json/);
  assert.match(styles,/canvas-area\.has-overview/);
  assert.match(styles,/PCB placement preview/);
});


test("catalogue MCU watchdog resets to a safe state after an induced service stall",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/073-mcu-watchdog.adigun.json",import.meta.url)));
  const valid=runSupportedAnalysis(project);
  assert.equal(valid.state,"complete",valid.message);
  assert.equal(valid.result.kind,"mcu-watchdog");
  assert.equal(valid.result.timeoutMs,100);
  assert.equal(valid.result.servicesAccepted,3);
  assert.equal(valid.result.resetCount,1);
  assert.equal(valid.result.resetAtMs,180);
  assert.equal(valid.result.controllerState,"safe-reset");
  assert.equal(valid.result.heartbeatHigh,false);
  assert.equal(valid.result.displayText,"WATCHDOG RESET @ 180 ms");
  assert.equal(valid.result.firmwareExecuted,false);

  const healthy=updateComponent(project,"fixture",{value:"ServiceTimesMs 0,40,80,120,160,200,240; RunDurationMs 300"});
  const healthyResult=runSupportedAnalysis(healthy);
  assert.equal(healthyResult.state,"complete",healthyResult.message);
  assert.equal(healthyResult.result.resetCount,0);
  assert.equal(healthyResult.result.controllerState,"running");
  assert.equal(healthyResult.result.heartbeatHigh,true);

  assert.equal(runSupportedAnalysis(updateComponent(project,"mcu",{value:"Program Watchdog state model; TimeoutMs 0"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="WDI").endpoints=["fixture:OUT"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue CAN node pair transfers a matching frame and verifies 60 ohm end termination",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/074-can-node-pair.adigun.json",import.meta.url)));
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.kind,"can-node-pair");
  assert.equal(result.result.identifier,"0x123");
  assert.equal(result.result.dlc,2);
  assert.deepEqual(result.result.dataBytes,["DE","AD"]);
  assert.equal(result.result.bitrate,500000);
  assert.equal(result.result.received,true);
  assert.equal(result.result.acknowledged,true);
  assert.equal(result.result.busTerminationOhm,60);
  assert.equal(result.result.displayText,"RX 0x123 [DE AD] · ACK");
  assert.equal(result.result.firmwareExecuted,false);
  assert.equal(runSupportedAnalysis(updateComponent(project,"rx-node",{value:"Role receive; FilterId 0x456"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"term-b",{value:"240 Ω"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"frame",{value:"Identifier 0x123; DLC 2; Data DE AD; Bitrate 0"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="CAN_H").endpoints=["tx-xcvr:CANH","term-a:1","term-b:1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue RS-485 polling returns only the addressed sensor and prevents collisions",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/075-rs485-sensor-network.adigun.json",import.meta.url)));
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.kind,"rs485-addressed-poll");
  assert.equal(result.result.pollAddress,"0x02");
  assert.equal(result.result.respondingAddress,"0x02");
  assert.equal(result.result.temperatureC,24.6);
  assert.equal(result.result.respondingNodes,1);
  assert.equal(result.result.silentNodes,1);
  assert.equal(result.result.simultaneousDrivers,0);
  assert.equal(result.result.busTerminationOhm,60);
  assert.match(result.result.displayText,/other node silent/);
  assert.equal(result.result.firmwareExecuted,false);
  assert.equal(runSupportedAnalysis(updateComponent(project,"node-1",{value:"Address 0x02; Baud 9600; EnablePolicy addressed-only"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"term-2",{value:"240 Ω"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"poll",{value:"Address 0x03; Baud 9600"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="RS485_A").endpoints=["master-xcvr:A","xcvr-1:A","term-1:1","term-2:1"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue GPS RMC example validates NMEA checksum and displays decimal coordinates",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/076-gps-nmea-display.adigun.json",import.meta.url)));
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.kind,"gnss-rmc");
  assert.equal(result.result.sentenceType,"GPRMC");
  assert.equal(result.result.checksum,"6A");
  assert.equal(result.result.checksumValid,true);
  assert.equal(result.result.fixStatus,"active");
  assert.ok(Math.abs(result.result.latitude-48.1173)<1e-9);
  assert.ok(Math.abs(result.result.longitude-11.516666666666667)<1e-9);
  assert.equal(result.result.displayText,"48.11730, 11.51667");
  assert.equal(result.result.firmwareExecuted,false);
  const badChecksum=updateComponent(project,"gnss",{value:"Sentence $GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*00"});
  assert.equal(runSupportedAnalysis(badChecksum).state,"blocked");
  const noFix=updateComponent(project,"gnss",{value:"Sentence $GPRMC,123519,V,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*7D"});
  assert.equal(runSupportedAnalysis(noFix).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="UART_RX").endpoints=["gnss:TX"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue RFID reader grants allowlisted UID and denies unknown tags",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/077-rfid-access-reader.adigun.json",import.meta.url)));
  const granted=runSupportedAnalysis(project);
  assert.equal(granted.state,"complete",granted.message);
  assert.equal(granted.result.kind,"rfid-access");
  assert.equal(granted.result.uid,"04A1B2C3");
  assert.equal(granted.result.allowed,true);
  assert.equal(granted.result.accessState,"granted");
  assert.equal(granted.result.lockOpen,true);
  assert.equal(granted.result.lockOutput,1);
  assert.equal(granted.result.authentication,"UID only; not secure");
  assert.equal(granted.result.firmwareExecuted,false);
  const unknown=runSupportedAnalysis(updateComponent(project,"tag",{value:"UID DEADBEEF"}));
  assert.equal(unknown.state,"complete");
  assert.equal(unknown.result.allowed,false);
  assert.equal(unknown.result.accessState,"denied");
  assert.equal(unknown.result.lockOpen,false);
  assert.equal(unknown.result.lockOutput,0);
  assert.equal(runSupportedAnalysis(updateComponent(project,"controller",{value:"Allowlist invalid; UnlockState 1; DenyState 0"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="UID_DATA").endpoints=["reader:DATA"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue NFC example displays a successful UID read and blocks read errors",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/078-nfc-uid-display.adigun.json",import.meta.url)));
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.kind,"nfc-uid-display");
  assert.equal(result.result.uid,"04A1B2C3");
  assert.equal(result.result.displayText,"Tag UID: 04A1B2C3");
  assert.equal(result.result.uidIsAuthentication,false);
  assert.equal(result.result.firmwareExecuted,false);
  assert.equal(runSupportedAnalysis(updateComponent(project,"tag",{value:"UID 04A1B2C3; ReadStatus error"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="READER_DATA").endpoints=["reader:DATA"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});


test("catalogue EEPROM data logger wraps a full ring buffer and replays retained samples",async()=>{
  const project=JSON.parse(await readFile(new URL("../examples/079-eeprom-data-logger.adigun.json",import.meta.url)));
  const result=runSupportedAnalysis(project);
  assert.equal(result.state,"complete",result.message);
  assert.equal(result.result.kind,"eeprom-ring-logger");
  assert.equal(result.result.samplePeriodMs,100);
  assert.equal(result.result.writeCycleMs,5);
  assert.equal(result.result.capacity,3);
  assert.equal(result.result.recordedSamples,5);
  assert.equal(result.result.overwrittenRecords,2);
  assert.equal(result.result.bufferWrapped,true);
  assert.deepEqual(result.result.replayValues,[30,40,50]);
  assert.deepEqual(result.result.replayTimesMs,[200,300,400]);
  assert.match(result.result.displayText,/200 ms: 30 °C.*400 ms: 50 °C/);
  assert.equal(result.result.firmwareExecuted,false);
  assert.equal(runSupportedAnalysis(updateComponent(project,"eeprom",{value:"Capacity 0; WriteCycleMs 5; Mode circular"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"fixture",{value:"Samples 10,broken,30; PeriodMs 100; Unit C"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="SDA").endpoints=["controller:SDA","pull-sda:2"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue low-power MCU sleeps between rising-edge interrupts and estimates supply current", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/080-low-power-sleep-wake.adigun.json",import.meta.url)));
  const analysis=runSupportedAnalysis(project);
  assert.equal(analysis.state,"complete",analysis.message);
  assert.equal(analysis.result.kind,"low-power-sleep-wake");
  assert.equal(analysis.result.durationMs,500);
  assert.equal(analysis.result.wakeCount,2);
  assert.deepEqual(analysis.result.events.map(event=>[event.timeMs,event.edge,event.woke]),[[100,"rising",true],[130,"falling",false],[400,"rising",true]]);
  assert.equal(analysis.result.awakeTimeMs,40);
  assert.equal(analysis.result.sleepTimeMs,460);
  assert.equal(analysis.result.sleepCurrentUa,8);
  assert.equal(analysis.result.runCurrentUa,5000);
  assert.ok(Math.abs(analysis.result.averageSupplyCurrentUa-511.36)<1e-9);
  assert.ok(Math.abs(analysis.result.energyMj-0.843744)<1e-9);
  assert.equal(analysis.result.firmwareExecuted,false);
  const noWake=runSupportedAnalysis(updateComponent(project,"interrupts",{value:"Events 100:falling; DurationMs 500"}));
  assert.equal(noWake.state,"complete",noWake.message);
  assert.equal(noWake.result.wakeCount,0);
  assert.equal(noWake.result.averageSupplyCurrentUa,8);
  assert.equal(runSupportedAnalysis(updateComponent(project,"interrupts",{value:"Events 100:rise; DurationMs 500"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"mcu",{value:"RunCurrentUa 4; SleepCurrentUa 8; WakeDurationMs 20; WakeMode rising"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="INT").endpoints=["interrupts:INT"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue BLE beacon encodes standard legacy advertising data fields", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/081-ble-beacon-configuration.adigun.json",import.meta.url)));
  const analysis=runSupportedAnalysis(project);
  assert.equal(analysis.state,"complete",analysis.message);
  assert.equal(analysis.result.kind,"ble-beacon-config");
  assert.equal(analysis.result.deviceNameUtf8Bytes,6);
  assert.equal(analysis.result.flags,6);
  assert.equal(analysis.result.serviceUuid,"0x180D");
  assert.deepEqual(analysis.result.serviceUuidEncodedBytes,[0x0D,0x18]);
  assert.equal(analysis.result.txPowerDbm,-4);
  assert.deepEqual(analysis.result.payloadBytes,[0x02,0x01,0x06,0x03,0x03,0x0D,0x18,0x07,0x09,0x41,0x64,0x69,0x67,0x75,0x6E,0x02,0x0A,0xFC]);
  assert.equal(analysis.result.payloadHex,"02 01 06 03 03 0D 18 07 09 41 64 69 67 75 6E 02 0A FC");
  assert.equal(analysis.result.payloadLengthOctets,18);
  assert.equal(analysis.result.legacyMaximumOctets,31);
  assert.equal(analysis.result.radioTransmitted,false);
  assert.equal(analysis.result.firmwareExecuted,false);
  assert.equal(runSupportedAnalysis(updateComponent(project,"settings",{value:"Name Adigun12345678901234; Flags 0x06; ServiceUuid 0x180D; TxPowerDbm -4"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"settings",{value:"Name Adigun; Flags 0x100; ServiceUuid 0x180D; TxPowerDbm -4"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"settings",{value:"Name Adigun; Flags 0x06; ServiceUuid 180G; TxPowerDbm -4"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"settings",{value:"Name Adigun; Flags 0x06; ServiceUuid 0x180D; TxPowerDbm 200"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="RADIO_DATA").endpoints=["encoder:TX"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue LoRa sensor encodes its payload and blocks sends over the configured duty budget", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/082-lora-sensor-node.adigun.json",import.meta.url)));
  const analysis=runSupportedAnalysis(project);
  assert.equal(analysis.state,"complete",analysis.message);
  assert.equal(analysis.result.kind,"lora-sensor-node");
  assert.equal(analysis.result.temperatureDeciC,246);
  assert.deepEqual(analysis.result.payloadBytes,[1,7,0,42,0,246]);
  assert.equal(analysis.result.payloadHex,"01 07 00 2A 00 F6");
  assert.equal(analysis.result.payloadLengthOctets,6);
  assert.equal(analysis.result.airtimeBudgetMs,600);
  assert.equal(analysis.result.usedAirtimeMs,600);
  assert.equal(analysis.result.dutyCyclePercent,1);
  assert.equal(analysis.result.sentCount,6);
  assert.equal(analysis.result.rejectedCount,2);
  assert.deepEqual(analysis.result.schedule.map(item=>item.sent),[true,true,true,true,true,true,false,false]);
  assert.equal(analysis.result.schedule[6].reason,"configured duty budget exhausted");
  assert.equal(analysis.result.radioTransmitted,false);
  assert.equal(analysis.result.regionalCompliance,"not evaluated");
  assert.equal(runSupportedAnalysis(updateComponent(project,"controller",{value:"NodeId 7; Sequence 42; Mode payload-v1; AirtimeMs 100; DutyWindowMs 60000; DutyLimitPercent 101; RequestsMs 0,9000"})).state,"blocked");
  assert.equal(runSupportedAnalysis(updateComponent(project,"controller",{value:"NodeId 7; Sequence 42; Mode payload-v1; AirtimeMs -1; DutyWindowMs 60000; DutyLimitPercent 1; RequestsMs 0,9000"})).state,"blocked");
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="RADIO_DATA").endpoints=["controller:RADIO"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});

test("catalogue GSM alarm notifier follows mocked AT steps and aborts on modem errors", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/083-gsm-alarm-notifier.adigun.json",import.meta.url)));
  const success=runSupportedAnalysis(project);
  assert.equal(success.state,"complete",success.message);
  assert.equal(success.result.kind,"gsm-alarm-mock");
  assert.deepEqual(success.result.commands,["AT","AT+CREG?","AT+CMGF=1",'AT+CMGS="TEST_ONLY"']);
  assert.equal(success.result.commandsCompleted,4);
  assert.equal(success.result.transactionState,"mock-modem-accepted");
  assert.equal(success.result.messageBody,"TEMP_LIMIT_EXCEEDED");
  assert.equal(success.result.modemAccepted,true);
  assert.equal(success.result.deliveryConfirmed,false);
  assert.equal(success.result.radioTransmitted,false);
  const modemError=runSupportedAnalysis(updateComponent(project,"event",{value:"AlarmState active; Message TEMP_LIMIT_EXCEEDED; Responses OK|+CREG:0,1|ERROR|>; SendResult +CMGS:0|OK"}));
  assert.equal(modemError.state,"complete");
  assert.equal(modemError.result.transactionState,"aborted-modem-error");
  assert.equal(modemError.result.failedCommand,"AT+CMGF=1");
  assert.equal(modemError.result.messageBody,undefined);
  assert.equal(modemError.result.radioTransmitted,false);
  const sendError=runSupportedAnalysis(updateComponent(project,"event",{value:"AlarmState active; Message TEMP_LIMIT_EXCEEDED; Responses OK|+CREG:0,1|OK|>; SendResult ERROR|ERROR"}));
  assert.equal(sendError.result.transactionState,"aborted-send-error");
  const notRegistered=runSupportedAnalysis(updateComponent(project,"modem",{value:"Mode AT-mock; Registration searching"}));
  assert.equal(notRegistered.result.transactionState,"aborted-not-registered");
  const inactive=runSupportedAnalysis(updateComponent(project,"event",{value:"AlarmState inactive; Message TEMP_LIMIT_EXCEEDED; Responses OK|+CREG:0,1|OK|>; SendResult +CMGS:0|OK"}));
  assert.equal(inactive.result.transactionState,"idle-no-alarm");
  assert.equal(inactive.result.commands.length,0);
  const broken=structuredClone(project);
  broken.nets.find(net=>net.id==="UART_TX").endpoints=["controller:TX"];
  assert.equal(runSupportedAnalysis(broken).state,"blocked");
});
