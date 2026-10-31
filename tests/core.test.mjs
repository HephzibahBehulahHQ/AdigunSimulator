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
  assert.equal(getExampleCoverage(registry).total, 27);
  assert.equal(getExampleCoverage(registry).released, 16);
  assert.equal(getExampleCoverage(registry).supplemental, 10);
  assert.equal(getExampleCoverage(registry).remaining, 184);
  const catalogue = registry.examples.filter((item) => item.status === "released" && item.scope === "catalogue");
  assert.deepEqual(catalogue.map((item) => item.catalogueIndex), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
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

