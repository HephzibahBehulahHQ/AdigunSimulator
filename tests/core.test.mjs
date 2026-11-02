Warning: truncated output (original token count: 80530)
Total output lines: 4795

import { movePcbFootprint } from "../js/pcb-edit.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { addComponent, connectPins, createEmptyProject, createProject, createVoltageDividerProject, disconnectPin, getViewReconciliationIssues, moveComponent, parseProject, removeComponent, runSupportedAnalysis, STARTER_LIBRARY, serializeProject, updateComponent, validateProject } from "../js/core.mjs";
import { getLedgerCoverage, getLibraryCoverage, getPartVerificationReadiness, validateComponentTypes, validatePartsManifest, validatePartLedger, validatePartRecord } from "../js/part-ledger.mjs";
import { getExampleCoverage, validateExampleRegistry } from "../js/example-registry.mjs";
import { exportPcbFabrication, validatePcbFabrication } from "../js/pcb-export.mjs";
import { createPcbPlacementReport } from "../js/pcb-placement-report.mjs";
import { createGroundingChecklistReport, reviewAudioAmplifierPcb } from "../js/audio-pcb-review.mjs";
import { createPowerLayoutReport, reviewBuckPowerLayout } from "../js/buck-converter-review.mjs";
import { createLayerStackupReport, reviewFourLayerMcuBoard } from "../js/mcu-board-plan.mjs";
import { createDifferentialPairReport, reviewDifferentialPair } from "../js/differential-pair-review.mjs";
import { createQfnFootprintReport, reviewQfnFootprint } from "../js/qfn-footprint-review.mjs";
import { createBgaEscapeReport, reviewBgaEscapeConcept } from "../js/bga-escape-review.mjs";
import { createPanelMountMechanicalReport, reviewPanelMountMechanicals } from "../js/panel-mount-mechanical-review.mjs";
import { createTestPointCoverageReport, reviewTestPointCoverage } from "../js/test-point-coverage.mjs";
import { TRANSLATIONS, UI_KEYS, UI_LOCALES, translate } from "../js/i18n.mjs";
import { runParameterSweep } from "../js/parameter-sweep.mjs";
import { runMonteCarloTolerance } from "../js/monte-carlo-tolerance.mjs";
import { analyzeThermalWarningBoundary } from "../js/thermal-warning-boundary.mjs";
import { analyzeConvergenceStudy } from "../js/convergence-study.mjs";
import { diagnoseFloatingNode } from "../js/floating-node-diagnosis.mjs";
import { diagnoseSupplyShort } from "../js/short-circuit-diagnosis.mjs";
import { diagnoseMissingGround } from "../js/missing-ground-diagnosis.mjs";
import { reportUnavailableModel } from "../js/model-unavailable-diagnosis.mjs";
import { runNetCrossProbe } from "../js/net-cross-probe.mjs";
import { validateComponentProperty } from "../js/component-property-audit.mjs";
import { createSimulationReport } from "../js/simulation-report.mjs";
import { createSimulationLockfile, verifySimulationLockfile } from "../js/simulation-lockfile.mjs";
import { runPlcStartStopSequence } from "../js/plc-start-stop-sequence.mjs";
import { runTrafficLightSequence } from "../js/traffic-light-sequence.mjs";
import { runTankLevelController } from "../js/tank-level-controller.mjs";
import { runConveyorCounter } from "../js/conveyor-counter.mjs";
import { runStarDeltaStarter } from "../js/star-delta-starter.mjs";
import { runForwardReverseInterlock } from "../js/forward-reverse-interlock.mjs";
import { runEmergencyStopConcept } from "../js/emergency-stop-concept.mjs";
import { runDoorInterlockConcept } from "../js/door-interlock-concept.mjs";
import { runTemperatureAlarm } from "../js/temperature-alarm.mjs";
import { runWaterLeakAlarm } from "../js/water-leak-alarm.mjs";
import { runFanThermostat } from "../js/fan-thermostat.mjs";
import { runPwmFanController } from "../js/pwm-fan-controller.mjs";
import { runAutomaticNightLight } from "../js/automatic-night-light.mjs";
import { runSmartIrrigation } from "../js/smart-irrigation.mjs";
import { runGarageDoorConcept } from "../js/garage-door-concept.mjs";
import { runElevatorCallQueue } from "../js/elevator-call-queue.mjs";
import { runFireAlarmZone } from "../js/fire-alarm-zone.mjs";
import { runAccessStrikeLock } from "../js/access-strike-lock.mjs";
import { runWarehouseBeacon } from "../js/warehouse-beacon.mjs";
import { runMachineFaultAnnunciator } from "../js/machine-fault-annunciator.mjs";
import { runBreadboardSchematicSync } from "../js/breadboard-schematic-sync.mjs";
import { runSchematicPcbSync } from "../js/schematic-pcb-sync.mjs";
import { runThreeViewLedHistory } from "../js/three-view-led-history.mjs";
import { projectComponentsForView, runUnsupportedBreadboardPackage } from "../js/view-projection.mjs";
import { runMissingFootprintWorkflow } from "../js/pcb-update-resolution.mjs";
import { cancelPartSubstitutionPreview, createPartSubstitutionPreview, runPinIncompatibleSubstitution } from "../js/pin-substitution-preview.mjs";
import { convertEngineeringUnit, runUnitConversionCalculator } from "../js/unit-conversion-calculator.mjs";
import { readResistorBands, runResistorColorCodeReader } from "../js/resistor-color-code.mjs";
import { calculateLedSeriesResistor, runLedResistorCalculator } from "../js/led-resistor-calculator.mjs";
import { calculateVoltageDivider, runVoltageDividerCalculator } from "../js/voltage-divider-calculator.mjs";
import { calculateRcTiming, runRcTimingCalculator } from "../js/rc-timing-calculator.mjs";
import { calculateOpAmpGain, runOpAmpGainCalculator } from "../js/op-amp-gain-calculator.mjs";
import { calculatePcbTraceWidth, runPcbTraceWidthAdvisor } from "../js/pcb-trace-width-advisor.mjs";
import { buildBomReport, exportBomCsv, runBomExportPlaceholder } from "../js/bom-report.mjs";
import { explainComponent, runBotComponentExplainer } from "../js/bot-component-explainer.mjs";
import { applyBotFloatingNodeRepairPreview, buildBotFloatingNodeRepairPreview, runBotFloatingNodeRepair } from "../js/bot-floating-node-repair.mjs";
import { applyBotCircuitProposal, buildBotCircuitProposal, runBotCircuitProposal } from "../js/bot-circuit-proposal.mjs";
import { auditUiSource, runFourLanguageUiSweep } from "../js/locale-ui-sweep.mjs";
import { runOfflineRecoveryScenario } from "../js/offline-recovery-scenario.mjs";
import { runReleaseCandidateE2EFixtures } from "../js/release-candidate-e2e.mjs";

function assertResultMatches(actual, expected, path) {
  if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), `${path} must be an array when recorded as one`);
    assert.equal(actual.length, expected.length, `${path} length`);
    return expected.reduce((count, value, index) => count + assertResultMatches(actual[index], value, `${path}[${index}]`), 0);
  }
  if (expected && typeof expected === "object") {
    assert.ok(actual && typeof actual === "object" && !Array.isArray(actual), `${path} must be an object when recorded as one`);
    let comparedFields = 0;
    for (const [key, value] of Object.entries(expected)) {
      // Registry `kind` labels identify the project scenario; analysis engines may report their own result kind.
      if (key !== "kind" && Object.hasOwn(actual, key)) comparedFields += assertResultMatches(actual[key], value, `${path}.${key}`);
    }
    return comparedFields;
  }
  assert.equal(typeof actual, typeof expected, `${path} type`);
  if (typeof expected === "number") {
    const tolerance = Math.max(1e-12, Math.abs(expected) * 1e-6);
    assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance, `${path} differs by more than ${tolerance}`);
  } else {
    assert.equal(actual, expected, path);
  }
  return 1;
}

const assertTextSnapshot = (actual, expected, name) => assert.equal(actual.replaceAll("\r\n", "\n"), expected.replaceAll("\r\n", "\n"), name);

test("core-led-current-limiter: catalogue 001 produces its recorded analytical result", async () => {
  const project = createProject();
  const result = runSupportedAnalysis(project);
  assert.equal(result.state, "complete");
  assert.equal(result.engine, "Analytical DC LED demonstration");
  const registry = JSON.parse(await readFile(new URL("../examples/manifest.json", import.meta.url)));
  const example = registry.examples.find((item) => item.id === "001-led-current-limiter");
  assert.ok(example);
  assert.deepEqual(result.result, example.verification.expectedResult);
  const readme = await readFile(new URL(`../${example.readmeFile}`, import.meta.url), "utf8");
  assert.match(readme, /Bill of materials/i);
  assert.match(readme, /9\.09 mA/);
  assert.match(readme, /model limitations/i);
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

test("part ledger preserves candidate status until complete real-part evidence is reviewed", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url)));
  const taxonomy = JSON.parse(await readFile(new URL("../library/component-types.json", import.meta.url)));
  const manifest = JSON.parse(await readFile(new URL("../library/parts-manifest.json", import.meta.url)));
  const coverageFile = JSON.parse(await readFile(new URL("../library/parts-coverage.json", import.meta.url)));
  assert.equal(validateComponentTypes(taxonomy).valid, true);
  assert.equal(validatePartLedger(ledger, taxonomy).valid, true);
  assert.equal(validatePartsManifest(manifest, taxonomy, ledger).valid, true);
  const coverage = getLedgerCoverage(ledger);
  assert.equal(coverage.total, 9);
  assert.equal(coverage.verified, 0);
  assert.equal(coverage.byStatus.candidate, 9);
  assert.equal(coverage.remaining, 1000);
  assert.deepEqual(getLibraryCoverage(ledger, taxonomy), coverageFile);
  assert.equal(coverageFile.taxonomy.totalTypes, 565);
  assert.equal(coverageFile.taxonomy.categories.length, 15);
  assert.equal(coverageFile.ledger.total, 9);
  assert.equal(coverageFile.ledger.verified, 0);
  assert.equal(coverageFile.ledger.byStatus.candidate, 9);
  const readiness = getPartVerificationReadiness(ledger.records[0]);
  assert.equal(readiness.currentStatus, "candidate");
  assert.equal(readiness.verified, false);
  assert.equal(readiness.readyForHumanReview, false);
  assert.equal(readiness.requiresHumanReview, true);
  assert.ok(readiness.missingEvidenceCodes.includes("DATASHEET_CHECKSUM"));
  assert.equal(coverageFile.reviewQueue.length, 9);
  assert.ok(coverageFile.reviewQueue.every(item => !item.readyForHumanReview));
});

test("verified parts require complete datasheet, package, pin, model, license, safety, and translation evidence", () => {
  const record = {
    id: "fixture.part",
    manufacturer: "Fixture Manufacturer",
    manufacturerPartNumber: "FIXTURE-2",
    category: "Test",
    type: "small-signal diode",
    typeCode: "C01",
    lifecycle: "active",
    verificationStatus: "verified",
    package: "DIP-2",
    packageEvidence: { sourceUrl: "https://manufacturer.example/package" },
    ratings: [{ name: "reverse voltage", maximum: 100, unit: "V" }],
    symbolPinMap: { "1": "Anode", "2": "Cathode" },
    footprintPadMap: { "1": "pad-1", "2": "pad-2" },
    pinElectricalTypes: { "1": "passive", "2": "passive" },
    symbolAsset: { sourceUrl: "https://manufacturer.example/symbol", sha256: "b".repeat(64), licenseId: "CC0-1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
    footprintAsset: { sourceUrl: "https://manufacturer.example/footprint", sha256: "c".repeat(64), licenseId: "CC0-1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
    modelStatus: "not-modelled",
    simulationModel: { status: "not-modelled", reason: "No validated model is supplied for this example record." },
    breadboard: { compatible: true, adapter: "Direct DIP-2 placement", operatingLimits: ["Observe rated reverse voltage."] },
    warnings: [],
    alternates: [],
    translations: {
      en: { name: "Fixture diode", description: "Two-pin test part." },
      de: { name: "Testdiode", description: "Zweipoliges Testbauteil." },
      yo: { name: "Díóòdì ìdánwò", description: "Ẹ̀yà ìdánwò ẹsẹ̀ méjì." },
      pcm: { name: "Test diode", description: "Two-pin test part." }
    },
    lifecycleEvidence: { sourceUrl: "https://manufacturer.example/lifecycle" },
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
  assert.ok(validatePartRecord({ ...record, symbolAsset: { ...record.symbolAsset, licenseId: "" } }).some((issue) => issue.code === "SYMBOL_ASSET_EVIDENCE"));
  assert.ok(validatePartRecord({ ...record, translations: { en: record.translations.en } }).some((issue) => issue.code === "TRANSLATIONS"));
  assert.ok(validatePartRecord({ ...record, ratings: [{ name: "voltage", maximum: 5 }] }).some((issue) => issue.code === "RATINGS_UNITS"));
});

test("a verified record cannot bypass checksum, mapping, model, and human-review evidence", () => {
  const errors = validatePartRecord({ id: "unsafe.example", manufacturer: "Example", manufacturerPartNumber: "X1", category: "Test", type: "test", lifecycle: "active", verificationStatus: "verified", datasheet: { title: "Source", url: "https://example.invalid", accessedAt: "2026-10-30" } });
  assert.ok(errors.some((error) => error.code === "DATASHEET_CHECKSUM"));
  assert.ok(errors.some((error) => error.code === "VERIFIED_EVIDENCE"));
  assert.ok(errors.some((error) => error.code === "MODEL_PROVENANCE"));
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
  assert.equal(nominal.result.kind, "zener-shunt-regulat…50530 tokens truncated…sult.points[2].currentA-(3/470))<1e-12);
  assert.ok(result.result.points[0].currentA>result.result.points[1].currentA);
  assert.ok(result.result.points[1].currentA>result.result.points[2].currentA);
  const duplicate=JSON.parse(JSON.stringify(project));duplicate.parameterSweep.values=[220,330,330];
  assert.equal(runParameterSweep(duplicate).state,"blocked");
  const tooFew=JSON.parse(JSON.stringify(project));tooFew.parameterSweep.values=[220,330];
  assert.equal(runParameterSweep(tooFew).state,"blocked");
});

test("catalogue Monte Carlo tolerance study is seeded, reproducible, and bounded", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/150-monte-carlo-tolerance-plan.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  assert.equal(runSupportedAnalysis(project).state,"complete");
  const first=runMonteCarloTolerance(project), repeat=runMonteCarloTolerance(project);
  assert.equal(first.state,"complete");assert.deepEqual(first,repeat);
  assert.equal(first.result.sampleCount,1000);assert.equal(first.result.seed,20261031);
  assert.equal(first.result.histogram.reduce((sum,bin)=>sum+bin.count,0),1000);
  assert.ok(first.result.minimum>=3/(330*1.05));assert.ok(first.result.maximum<=3/(330*0.95));
  assert.ok(first.result.minimum<first.result.mean);assert.ok(first.result.mean<first.result.maximum);
  const invalid=JSON.parse(JSON.stringify(project));invalid.monteCarloTolerance.seed=0;
  assert.equal(runMonteCarloTolerance(invalid).state,"blocked");
});

test("catalogue thermal boundary reports dissipation without claiming a thermal model", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/151-thermal-warning-boundary.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  assert.equal(runSupportedAnalysis(project).state,"complete");
  const result=analyzeThermalWarningBoundary(project);
  assert.equal(result.state,"complete");
  assert.equal(result.result.kind,"thermal-warning-boundary");
  assert.ok(Math.abs(result.result.resistorDissipationW-1.190082644628099)<1e-12);
  assert.equal(result.result.ratingConcern,true);
  assert.equal(result.result.thermalModel,"not-modeled");
  assert.equal(result.result.temperatureRiseC,null);
  assert.ok(result.warnings.some(warning=>warning.code==="THERMAL_MODEL_NOT_MODELED"));
  assert.ok(result.warnings.some(warning=>warning.code==="POWER_RATING_EXCEEDED"));
  const invalid=JSON.parse(JSON.stringify(project));invalid.thermalBoundary.ratedPowerW=0;
  assert.equal(analyzeThermalWarningBoundary(invalid).state,"blocked");
});

test("catalogue convergence study returns actionable limits without fabricating solver output", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/152-convergence-failure-study.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const result=analyzeConvergenceStudy(project);
  assert.equal(result.state,"blocked");
  assert.equal(result.result,null);
  assert.equal(result.diagnostics.solverIterations,null);
  assert.equal(result.diagnostics.reportedElectricalResult,null);
  assert.ok(result.errors.some(error=>error.code==="SPICE_SOLVER_UNAVAILABLE"));
  assert.ok(result.errors.some(error=>error.code==="CONVERGENCE_NOT_ATTEMPTED"));
  assert.match(result.errors[0].message,/SPICE operating-point solver/);
  assert.ok(result.diagnostics.actions.some(action=>/series resistance/.test(action)));
  const invalid=JSON.parse(JSON.stringify(project));invalid.convergenceStudy.fixture="unknown";
  assert.equal(analyzeConvergenceStudy(invalid).state,"blocked");
  assert.equal(analyzeConvergenceStudy(invalid).errors[0].code,"CONVERGENCE_FIXTURE_UNKNOWN");
});

test("catalogue floating-node diagnosis identifies the object to inspect", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/153-floating-node-diagnosis.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const result=diagnoseFloatingNode(project);
  assert.equal(result.state,"blocked");
  assert.equal(result.result,null);
  assert.equal(result.errors[0].code,"FLOATING_DC_NODE");
  assert.equal(result.diagnostics.netId,"FLOATING");
  assert.deepEqual(result.diagnostics.jumpTarget,{instanceId:"capacitor-floating",netId:"FLOATING"});
  assert.ok(result.diagnostics.suggestions.some(item=>/bias or bleed resistor/.test(item)));
  const missing=JSON.parse(JSON.stringify(project));missing.nets=missing.nets.filter(net=>net.id!=="FLOATING");
  assert.equal(diagnoseFloatingNode(missing).errors[0].code,"FLOATING_NODE_TARGET_MISSING");
});

test("catalogue short-circuit fixture blocks before simulation with no fabricated current", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/154-short-circuit-diagnosis.adigun.json",import.meta.url)));
  const validation=validateProject(project);assert.equal(validation.valid,false);
  assert.ok(validation.errors.some(error=>error.rule==="SOURCE_SHORT"));
  const result=diagnoseSupplyShort(project);
  assert.equal(result.state,"blocked");assert.equal(result.result,null);
  assert.equal(result.diagnostics.analysisAttempted,false);
  assert.equal(result.errors[0].code,"SUPPLY_SHORT_CIRCUIT");
  assert.equal(result.diagnostics.netId,"SHORT");
  assert.ok(result.diagnostics.suggestions.some(item=>/before energizing/.test(item)));
  const safe=JSON.parse(JSON.stringify(project));safe.nets[0].endpoints=["source-1:+"];
  assert.equal(diagnoseSupplyShort(safe).result.directSupplyShort,false);
});

test("catalogue missing-ground diagnosis blocks and identifies the reference rule", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/155-missing-ground-diagnosis.adigun.json",import.meta.url)));
  const validation=validateProject(project);
  assert.equal(validation.valid,true);
  assert.ok(validation.warnings.some(warning=>warning.rule==="NO_REFERENCE"));
  const result=diagnoseMissingGround(project);
  assert.equal(result.state,"blocked");assert.equal(result.result,null);
  assert.equal(result.diagnostics.ruleId,"NO_REFERENCE");
  assert.equal(result.errors[0].code,"MISSING_GROUND_REFERENCE");
  assert.ok(result.diagnostics.suggestions.length>=2);
  const grounded=JSON.parse(JSON.stringify(project));grounded.components.push({instanceId:"ground-restored",libraryId:"ground.signal",reference:"GND2",value:"0 V"});
  assert.equal(diagnoseMissingGround(grounded).result.referencePresent,true);
});

test("catalogue unavailable-model fixture is schematic-only and never simulates a fake model", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/156-model-unavailable-diagnosis.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=reportUnavailableModel(project);
  assert.equal(result.state,"blocked");assert.equal(result.result,null);
  assert.equal(result.diagnostics.analysisAttempted,false);
  assert.equal(result.diagnostics.status,"unavailable");
  assert.equal(result.diagnostics.displayMode,"schematic-only");
  assert.equal(result.errors[0].code,"COMPONENT_MODEL_UNAVAILABLE");
  assert.match(result.message,/shown in the schematic/);
});

test("catalogue net cross-probe preserves the same net ID across all design views", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/157-net-probe-cross-probe.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  assert.equal(runSupportedAnalysis(project).state,"complete");
  const result=runNetCrossProbe(project);
  assert.equal(result.state,"complete");assert.equal(result.result.kind,"net-cross-probe");
  assert.equal(result.result.netId,"LED_A");assert.equal(result.result.sharedNetId,true);
  assert.deepEqual(result.result.views,["breadboard","schematic","pcb"]);
  assert.equal(result.result.endpointCount,2);
  assert.equal(result.diagnostics.jumpTarget.netId,"LED_A");
  const missing=JSON.parse(JSON.stringify(project));missing.crossProbe.netId="MISSING";
  assert.equal(runNetCrossProbe(missing).state,"blocked");
});

test("catalogue component property audit accepts valid resistor edits and rejects unsafe ranges before history mutation", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/158-component-property-audit.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  assert.equal(runSupportedAnalysis(project).state,"complete");
  const resistor=project.components.find(component=>component.reference==="R1");
  assert.equal(validateComponentProperty(resistor,"220 Ω").valid,true);
  assert.equal(validateComponentProperty(resistor,"1 kΩ").resistanceOhms,1000);
  assert.equal(validateComponentProperty(resistor,"0 Ω").valid,false);
  assert.equal(validateComponentProperty(resistor,"1e15 Ω").valid,false);
  assert.equal(validateComponentProperty(resistor,"not a value").valid,false);
  const app=await readFile(new URL("../app.js",import.meta.url),"utf8");
  const submit=app.slice(app.indexOf('$("#component-form").addEventListener("submit"'),app.indexOf('$("#remove-component").addEventListener'));
  assert.ok(submit.indexOf("validateComponentProperty")<submit.indexOf("captureHistory()"));
  assert.ok(submit.indexOf("captureHistory()")<submit.indexOf("updateComponent("));
  assert.match(app,/function undo\(/);assert.match(app,/function redo\(/);
});

test("catalogue simulation report exports reproducible RC settings, model version, results, and warnings", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/005-rc-step-response.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const analysis=runSupportedAnalysis(project);
  assert.equal(analysis.state,"complete");
  const report=createSimulationReport(project,analysis,{generatedAt:"2026-10-31T00:00:00.000Z"});
  assert.equal(report.schema,"adigun-simulation-report/1");
  assert.equal(report.simulation.settings.analysisKind,"rc-step-response");
  assert.equal(report.simulation.modelVersion,"first-order-rc-step-v1");
  assert.ok(report.simulation.settings.sampleCount>0);
  assert.equal(report.result.kind,"rc-step-response");
  assert.deepEqual(report.warnings,analysis.warnings??[]);
  assert.ok(report.project.components.some(component=>component.reference==="R1"&&component.value==="1 kΩ"));
  const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/id="export-simulation-report"/);
});

test("catalogue run lockfile selects the same RC model and detects project drift", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/160-reproducible-run-lockfile.adigun.json",import.meta.url)));
  const manifest=JSON.parse(await readFile(new URL("../examples/manifest.json",import.meta.url)));
  const entry=manifest.examples.find(example=>example.id==="160-reproducible-run-lockfile");
  assert.equal(entry.lockfileFile,"examples/160-reproducible-run-lockfile/simulation.lock.json");
  const lock=JSON.parse(await readFile(new URL("../examples/160-reproducible-run-lockfile/simulation.lock.json",import.meta.url)));
  assert.deepEqual(createSimulationLockfile(project),lock);
  const verified=verifySimulationLockfile(project,lock);
  assert.equal(verified.matched,true);assert.equal(verified.actual.modelSelection.modelVersion,"first-order-rc-step-v1");
  const drift=JSON.parse(JSON.stringify(project));drift.components.find(component=>component.reference==="R1").value="1.1 kΩ";
  assert.equal(verifySimulationLockfile(drift,lock).matched,false);
  assert.equal(verifySimulationLockfile(drift,lock).errors[0].code,"RUN_LOCK_MISMATCH");
  const html=await readFile(new URL("../index.html",import.meta.url),"utf8");assert.match(html,/data-action="verify-run-lock"/);
});

test("catalogue PLC motor seal-in holds on start and drops on stop or emergency stop", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/161-plc-start-stop-motor-concept.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runPlcStartStopSequence(project);
  assert.equal(result.state,"complete");assert.equal(result.result.kind,"plc-start-stop-sequence");
  assert.equal(result.result.frames[0].contactorEnergized,false);
  assert.equal(result.result.frames[1].contactorEnergized,true);
  assert.equal(result.result.frames[2].contactorEnergized,true);
  assert.equal(result.result.frames[3].contactorEnergized,false);
  assert.equal(result.result.frames[5].contactorEnergized,false);
  assert.equal(result.result.sealInRetained,true);assert.equal(result.result.emergencyStopDropsOutput,true);
  const invalid=JSON.parse(JSON.stringify(project));invalid.plcMotorSequence.frames[0].startPressed="false";
  assert.equal(runPlcStartStopSequence(invalid).state,"blocked");
});

test("catalogue traffic-light sequence repeats safe timed states without opposing green", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/162-plc-traffic-light.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runTrafficLightSequence(project);
  assert.equal(result.state,"complete");assert.equal(result.result.kind,"traffic-light-fsm-sequence");
  assert.equal(result.result.cycleCount,2);assert.equal(result.result.phaseCount,14);
  assert.equal(result.result.totalDurationS,100);assert.equal(result.result.phases[0].northSouth,"red");
  assert.ok(result.result.states.every(state=>!(state.northSouth==="green"&&state.eastWest==="green")));
  assert.equal(result.result.opposingGreenConflict,false);
  const unsafe=JSON.parse(JSON.stringify(project));unsafe.trafficLight.phases[0]={name:"unsafe",northSouth:"green",eastWest:"green",durationS:5};
  assert.equal(runTrafficLightSequence(unsafe).state,"blocked");
});

test("catalogue tank controller applies low/high hysteresis across synthetic levels", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/163-plc-tank-level-controller.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runTankLevelController(project);assert.equal(result.state,"complete");
  assert.equal(result.result.kind,"tank-level-hysteresis");assert.equal(result.result.sampleCount,10);assert.equal(result.result.pumpOnSamples,7);
  assert.deepEqual(result.result.frames.map(frame=>frame.pumpOn),[true,true,true,true,true,false,false,false,true,true]);
  const invalid=structuredClone(project);invalid.tankLevelController.highLevelPct=20;
  assert.equal(runTankLevelController(invalid).state,"blocked");
  const outOfRange=structuredClone(project);outOfRange.tankLevelController.levelSamples[0]=101;
  assert.equal(runTankLevelController(outOfRange).state,"blocked");
});

test("catalogue conveyor counter counts rising photoeye edges and stops at target", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/164-plc-conveyor-counter.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runConveyorCounter(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"conveyor-edge-counter");
  assert.equal(result.result.finalCount,3);assert.equal(result.result.stoppedAtEvent,7);assert.equal(result.result.motorStopped,true);
  assert.deepEqual(result.result.frames.map(frame=>frame.count),[0,1,1,1,2,2,3,3,3,3]);
  assert.deepEqual(result.result.frames.map(frame=>frame.risingEdge),[false,true,false,false,true,false,true,false,false,false]);
  assert.deepEqual(result.result.frames.map(frame=>frame.motorRunning),[true,true,true,true,true,true,false,false,false,false]);
  const invalid=structuredClone(project);invalid.conveyorCounter.targetCount=0;assert.equal(runConveyorCounter(invalid).state,"blocked");
  const invalidSignal=structuredClone(project);invalidSignal.conveyorCounter.photoeyeEvents[0]=1;assert.equal(runConveyorCounter(invalidSignal).state,"blocked");
});

test("catalogue star-delta starter moves through exclusive outputs and transition dead time", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/165-star-delta-starter-concept.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runStarDeltaStarter(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"star-delta-transition-sequence");
  assert.deepEqual(result.result.frames.map(frame=>frame.mode),["star","star","transition","transition","delta","delta","stopped","star"]);
  assert.equal(result.result.noOverlap,true);assert.ok(result.result.frames.every(frame=>!(frame.starEnergized&&frame.deltaEnergized)));
  const invalid=structuredClone(project);invalid.starDeltaStarter.deadTimeMs=0;assert.equal(runStarDeltaStarter(invalid).state,"blocked");
  const unordered=structuredClone(project);unordered.starDeltaStarter.events[2].atMs=10;assert.equal(runStarDeltaStarter(unordered).state,"blocked");
});

test("catalogue forward/reverse logic rejects an opposite-direction request until stopped", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/166-forward-reverse-motor-concept.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runForwardReverseInterlock(project);assert.equal(result.state,"complete");
  assert.deepEqual(result.result.frames.map(frame=>frame.direction),["forward","forward","forward","stopped","reverse","reverse","stopped"]);
  assert.deepEqual(result.result.frames.map(frame=>frame.conflictRejected),[false,false,true,false,false,true,false]);
  assert.equal(result.result.conflictRequestsRejected,2);assert.equal(result.result.noOverlap,true);
  assert.ok(result.result.frames.every(frame=>!(frame.forwardEnergized&&frame.reverseEnergized)));
  const invalid=structuredClone(project);invalid.forwardReverseMotor.events[0].request="both";assert.equal(runForwardReverseInterlock(invalid).state,"blocked");
});

test("catalogue E-stop latch rejects reset while tripped and needs separate restart", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/167-emergency-stop-safety-concept.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runEmergencyStopConcept(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"emergency-stop-latched-sequence");
  assert.deepEqual(result.result.frames.map(frame=>frame.loadEnabled),[true,false,false,false,false,true,false]);
  assert.equal(result.result.frames[2].resetRejected,true);assert.equal(result.result.frames[4].latched,false);
  assert.equal(result.result.unsafeResetRejected,true);assert.equal(result.result.restartRequiresNewStart,true);
  const invalid=structuredClone(project);invalid.emergencyStopConcept.events[0].action="auto-restart";assert.equal(runEmergencyStopConcept(invalid).state,"blocked");
});

test("catalogue door interlock latches load off on guard opening", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/168-door-interlock-concept.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runDoorInterlockConcept(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"door-interlock-sequence");
  assert.deepEqual(result.result.frames.map(frame=>frame.loadEnabled),[true,false,false,false,false,true,false]);
  assert.equal(result.result.frames[2].resetRejected,true);assert.equal(result.result.loadAlwaysDisabledWhenOpen,true);
  assert.equal(result.result.resetRejectedWhenOpen,true);
  const invalid=structuredClone(project);invalid.doorInterlock.events[0].action="bypass";assert.equal(runDoorInterlockConcept(invalid).state,"blocked");
});

test("catalogue temperature alarm latches at threshold and applies safe reset policy", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/169-temperature-alarm.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runTemperatureAlarm(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"latched-temperature-alarm");
  assert.deepEqual(result.result.frames.map(frame=>frame.alarmLatched),[false,true,true,true,true,false,true]);
  assert.equal(result.result.frames[3].resetRejected,true);assert.equal(result.result.resetRejected,true);
  const invalid=structuredClone(project);invalid.temperatureAlarm.thresholdC=251;assert.equal(runTemperatureAlarm(invalid).state,"blocked");
  const invalidSample=structuredClone(project);invalidSample.temperatureAlarm.samples[0].tempC=Infinity;assert.equal(runTemperatureAlarm(invalidSample).state,"blocked");
});

test("catalogue water leak alarm triggers on wet input and recovers on dry input", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/170-water-leak-alarm.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runWaterLeakAlarm(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"water-leak-alarm-sequence");
  assert.deepEqual(result.result.frames.map(frame=>frame.alarmOn),[false,true,true,false,false,true,false]);
  assert.equal(result.result.alarmEpisodes,2);assert.equal(result.result.dryRecoveryObserved,true);
  const invalid=structuredClone(project);invalid.waterLeakAlarm.wetSamples[0]="wet";assert.equal(runWaterLeakAlarm(invalid).state,"blocked");
});

test("catalogue fan thermostat switches at hysteresis thresholds and retains state between them", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/171-fan-thermostat.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runFanThermostat(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"fan-thermostat-hysteresis");
  assert.deepEqual(result.result.frames.map(frame=>frame.fanOn),[false,true,true,false,false,true,false]);
  assert.equal(result.result.fanOnSamples,3);
  const invalid=structuredClone(project);invalid.fanThermostat.fanOffC=31;assert.equal(runFanThermostat(invalid).state,"blocked");
  const invalidSample=structuredClone(project);invalidSample.fanThermostat.samples[0]=151;assert.equal(runFanThermostat(invalidSample).state,"blocked");
});

test("catalogue PWM fan controller interpolates curve knots and clamps endpoints", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/172-pwm-fan-controller.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runPwmFanController(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"pwm-fan-duty-curve");
  assert.deepEqual(result.result.frames.map(frame=>frame.dutyPercent),[0,0,20,40,70,100,100]);
  const invalid=structuredClone(project);invalid.pwmFanController.curve[1].tempC=19;assert.equal(runPwmFanController(invalid).state,"blocked");
  const invalidDuty=structuredClone(project);invalidDuty.pwmFanController.curve[1].dutyPercent=101;assert.equal(runPwmFanController(invalidDuty).state,"blocked");
});

test("catalogue night light switches the LED below its lux threshold", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/173-automatic-night-light.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runAutomaticNightLight(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"night-light-lux-threshold");
  assert.deepEqual(result.result.frames.map(frame=>frame.ledOn),[true,true,true,false,false,true]);
  assert.equal(result.result.ledOnSamples,4);
  const invalid=structuredClone(project);invalid.automaticNightLight.luxSamples[0]=-1;assert.equal(runAutomaticNightLight(invalid).state,"blocked");
});

test("catalogue irrigation waters only when dry and permitted and fails off on sensor fault", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/174-smart-irrigation-model.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runSmartIrrigation(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"smart-irrigation-decision-sequence");
  assert.deepEqual(result.result.frames.map(frame=>frame.watering),[true,false,false,false,false,true]);
  assert.equal(result.result.faultsFailOff,true);assert.equal(result.result.sensorFaults,1);
  const invalid=structuredClone(project);invalid.smartIrrigation.samples[3].sensorFault=false;assert.equal(runSmartIrrigation(invalid).state,"blocked");
});

test("catalogue garage door limit switches stop motion and reject opposite-direction commands", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/175-garage-door-concept.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runGarageDoorConcept(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"garage-door-limit-sequence");
  assert.deepEqual(result.result.frames.map(frame=>frame.mode),["opening","stopped","closing","closing","stopped","stopped","opening"]);
  assert.equal(result.result.frames[3].conflictRejected,true);assert.equal(result.result.conflictingRequestsRejected,1);
  assert.equal(result.result.noDriveOverlap,true);
  const invalid=structuredClone(project);invalid.garageDoorConcept.events[0].action="reverse";assert.equal(runGarageDoorConcept(invalid).state,"blocked");
});

test("catalogue elevator scheduler preserves FIFO calls and ignores duplicate pending floor", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/176-elevator-call-queue.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runElevatorCallQueue(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"elevator-fifo-call-queue");
  assert.deepEqual(result.result.frames.map(frame=>frame.queue),[[3],[3,2],[3,2],[2],[],[]]);
  assert.deepEqual(result.result.dispatchedTargets,[3,2]);assert.equal(result.result.duplicateCallsIgnored,1);
  const invalid=structuredClone(project);invalid.elevatorCallQueue.events[0].floor=6;assert.equal(runElevatorCallQueue(invalid).state,"blocked");
});

test("catalogue fire-alarm zone keeps alarm distinct from open/short trouble inputs", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/177-fire-alarm-zone-concept.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runFireAlarmZone(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"fire-alarm-zone-sequence");
  assert.deepEqual(result.result.frames.map(frame=>[frame.fireAlarm,frame.troubleType]),[[false,null],[true,null],[false,"open-circuit"],[false,"short-circuit"],[false,null]]);
  assert.equal(result.result.alarmSamples,1);assert.equal(result.result.openFaults,1);assert.equal(result.result.shortFaults,1);
  const invalid=structuredClone(project);invalid.fireAlarmZone.samples[0].condition="unknown";assert.equal(runFireAlarmZone(invalid).state,"blocked");
});

test("catalogue access strike mock grants allowlisted IDs briefly and audits denials", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/178-access-control-strike-lock.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runAccessStrikeLock(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"access-strike-allowlist-sequence");
  assert.deepEqual(result.result.frames.map(frame=>frame.decision),["granted","denied","denied","denied","granted"]);
  assert.deepEqual(result.result.frames.map(frame=>frame.strikeUnlocked),[true,true,true,false,true]);
  assert.equal(result.result.frames[1].unlockUntilMs,3000);assert.equal(result.result.mockAuditEvents.length,5);
  const invalid=structuredClone(project);invalid.accessStrikeLock.unlockDurationMs=70000;assert.equal(runAccessStrikeLock(invalid).state,"blocked");
});

test("catalogue warehouse beacon maps occupancy and fault transitions to distinct outputs", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/179-warehouse-beacon-concept.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runWarehouseBeacon(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"warehouse-beacon-state-sequence");
  assert.deepEqual(result.result.frames.map(frame=>[frame.greenOn,frame.redOn,frame.amberOn,frame.buzzerOn]),[[true,false,false,false],[false,true,false,false],[false,false,true,true],[true,false,false,false]]);
  assert.equal(result.result.transitionCount,3);assert.equal(result.result.oneStatusPerFrame,true);
  const invalid=structuredClone(project);invalid.warehouseBeacon.samples[0]="unknown";assert.equal(runWarehouseBeacon(invalid).state,"blocked");
});

test("catalogue fault annunciator clears only after acknowledgement and inactive input", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/180-machine-fault-annunciator.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"unsupported");
  const result=runMachineFaultAnnunciator(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"machine-fault-latched-sequence");
  assert.deepEqual(result.result.frames.map(frame=>frame.latchedFaults),[["F1"],["F1"],[],["F2"],["F2"],[]]);
  assert.deepEqual(result.result.frames.map(frame=>frame.buzzerOn),[true,false,false,true,true,false]);
  assert.equal(result.result.frames[4].faultLampOn,true);assert.equal(result.result.frames[5].healthyLampOn,true);
  const invalid=structuredClone(project);invalid.machineFaultAnnunciator.events[0].activeFaults=["bad id"];assert.equal(runMachineFaultAnnunciator(invalid).state,"blocked");
});

test("catalogue breadboard wiring synchronizes component and net identities into schematic projection", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/181-breadboard-schematic-sync.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const componentIds=project.components.map(item=>item.instanceId).sort();
  const breadboardEdit=disconnectPin(project,"resistor-1:2");
  const wired=connectPins(breadboardEdit,"resistor-1:2","led-1:A");
  assert.equal(validateProject(wired).valid,true);
  const result=runBreadboardSchematicSync(wired);assert.equal(result.state,"complete");assert.equal(result.result.kind,"breadboard-schematic-structural-sync");
  assert.equal(result.result.structurallyEqual,true);assert.deepEqual(result.result.componentIds,componentIds);
  assert.ok(result.result.netIds.includes("N1"));assert.ok(result.result.netIds.includes("VCC"));assert.ok(result.result.netIds.includes("GND"));
  assert.deepEqual(result.result.breadboard,result.result.schematic);
});

test("catalogue schematic-to-PCB projection preserves every 555 net endpoint in an illustrative pad map", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/182-schematic-pcb-sync.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"complete");
  const result=runSchematicPcbSync(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"schematic-pcb-netlist-pad-sync");
  assert.equal(result.result.mappingStatus,"illustrative-unverified");assert.equal(result.result.componentCount,9);assert.equal(result.result.netCount,7);
  assert.equal(result.result.sourceEndpointCount,result.result.padEndpointCount);assert.equal(result.result.netlistPreserved,true);
  const missing=structuredClone(project);missing.schematicPcbSync.padMap.pop();assert.equal(runSchematicPcbSync(missing).state,"blocked");
  const duplicate=structuredClone(project);duplicate.schematicPcbSync.padMap[1].pad="1";assert.equal(runSchematicPcbSync(duplicate).state,"blocked");
});
test("catalogue three-view LED edit shares component identity and restores undo/redo snapshots", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/183-three-view-led-project.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  assert.deepEqual(getViewReconciliationIssues(project,"breadboard"),[]);assert.deepEqual(getViewReconciliationIssues(project,"schematic"),[]);
  const pcbIssues=getViewReconciliationIssues(project,"pcb");assert.equal(pcbIssues.length,4);assert.ok(pcbIssues.some(issue=>issue.instanceId==="resistor-1"));
  const result=runThreeViewLedHistory(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"three-view-led-sync-history");
  assert.deepEqual(result.result.availableViews,["breadboard","schematic","pcb"]);assert.deepEqual(result.result.reconciliationByView,{breadboard:0,schematic:0,pcb:4});assert.equal(result.result.pcbReconciliation.length,4);
  assert.equal(result.result.identitiesPreserved,true);assert.equal(result.result.sharedIdentity,true);assert.equal(result.result.historyRestored,true);assert.equal(result.result.redoRestored,true);
  assert.equal(result.result.originalValue,"330 Ω");assert.equal(result.result.editedValue,"470 Ω");assert.equal(result.result.undoValue,"330 Ω");assert.equal(result.result.redoValue,"470 Ω");
  const invalid=structuredClone(project);invalid.threeViewLedHistory.instanceId="missing";assert.equal(runThreeViewLedHistory(invalid).state,"blocked");
});
test("catalogue unsupported BGA package becomes a breadboard reconciliation item without placement", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/184-unsupported-breadboard-package.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);
  const board=projectComponentsForView(project,"breadboard");assert.deepEqual(board.components,[]);assert.equal(board.reconciliationItems.length,1);assert.equal(board.reconciliationItems[0].instanceId,"bga");
  const schematic=projectComponentsForView(project,"schematic");assert.equal(schematic.components.length,1);assert.deepEqual(schematic.reconciliationItems,[]);
  const pcb=projectComponentsForView(project,"pcb");assert.equal(pcb.components.length,1);assert.deepEqual(pcb.reconciliationItems,[]);
  const result=runUnsupportedBreadboardPackage(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"unsupported-breadboard-package-reconciliation");assert.equal(result.result.breadboardPlaced,false);
  assert.equal(result.result.schematicPlaced,true);assert.equal(result.result.pcbPlaced,true);assert.equal(result.result.fabricationQualified,false);assert.equal(result.result.claimsManufacturable,false);
  const invalid=structuredClone(project);invalid.unsupportedBreadboardPackage.instanceId="missing";assert.equal(runUnsupportedBreadboardPackage(invalid).state,"blocked");
});
test("catalogue missing-footprint workflow blocks PCB update and returns required resolution report", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/185-missing-footprint-workflow.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);assert.equal(runSupportedAnalysis(project).state,"complete");
  const before=serializeProject(project),result=runMissingFootprintWorkflow(project);assert.equal(result.state,"complete");
  assert.equal(result.result.kind,"missing-footprint-resolution-report");assert.equal(result.result.pcbUpdateBlocked,true);assert.equal(result.result.projectUnchanged,true);assert.equal(serializeProject(project),before);
  assert.equal(result.result.missingFootprintCount,project.components.length);assert.equal(result.result.placedComponentCount,0);assert.equal(result.result.requiredReport.status,"required");
  assert.ok(result.result.missingFootprints.some(item=>item.reference==="U1"&&item.part==="active.ne555"));assert.equal(result.result.requiredReport.blockedReferences.length,project.components.length);
  assert.equal(result.result.requiredReport.resolutionOptions.length,3);assert.equal(result.result.automaticSubstitution,false);assert.equal(result.result.unverifiedFootprintsAssigned,false);
  const invalid=structuredClone(project);invalid.missingFootprintWorkflow.targetView="breadboard";assert.equal(runMissingFootprintWorkflow(invalid).state,"blocked");
});
test("catalogue pin-incompatible substitution is previewed, blocked, and canceled without changing original", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/186-pin-incompatible-substitution.adigun.json",import.meta.url)));
  assert.equal(validateProject(project).valid,true);const before=serializeProject(project);
  const preview=createPartSubstitutionPreview(project);assert.equal(preview.state,"complete");assert.equal(preview.blocked,true);assert.equal(preview.sourcePart.pins.length,8);assert.equal(preview.candidate.pins.length,8);
  assert.deepEqual(preview.sharedPinNames,[]);assert.equal(preview.unmappedUsedPins.length,8);assert.ok(preview.affectedNets.includes("TIMING"));
  const canceled=cancelPartSubstitutionPreview(preview);assert.equal(canceled.cancelled,true);assert.equal(serializeProject(canceled.project),before);assert.equal(serializeProject(project),before);
  const result=runPinIncompatibleSubstitution(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"pin-incompatible-substitution-preview");assert.equal(result.result.substitutionBlocked,true);assert.equal(result.result.previewCancelled,true);assert.equal(result.result.projectUnchanged,true);
  assert.equal(result.result.originalLibraryId,"active.ne555");assert.equal(result.result.candidateLibraryId,"active.lm386-classab");assert.equal(result.result.unmappedUsedPins.length,8);
});
test("catalogue SI unit converter returns resistor, power, length, and rounded results", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/187-unit-conversion-calculator.adigun.json",import.meta.url)));
  const result=runUnitConversionCalculator(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"si-unit-conversion-cases");
  assert.deepEqual(result.result.results.map(item=>item.convertedValue),[4700,0.25,0.125,1.23457]);
  assert.deepEqual(result.result.results.map(item=>item.dimension),["resistance","power","length","resistance"]);
  assert.deepEqual(convertEngineeringUnit(2.2,"kΩ","Ω"),{ok:true,value:2200,dimension:"resistance",fromUnit:"kΩ",toUnit:"Ω",precision:6});
  assert.equal(convertEngineeringUnit(1,"kΩ","mW").ok,false);assert.equal(convertEngineeringUnit(Infinity,"mm","m").ok,false);assert.equal(convertEngineeringUnit(1,"m","m",13).ok,false);
  const invalid=structuredClone(project);invalid.unitConversionCalculator.cases[0].fromUnit="mW";assert.equal(runUnitConversionCalculator(invalid).state,"blocked");
});
test("catalogue resistor color-code reader decodes four/five-band values and rejects invalid bands", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/188-resistor-color-code-reader.adigun.json",import.meta.url)));
  const result=runResistorColorCodeReader(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"resistor-color-code-cases");assert.equal(result.result.validCount,2);assert.equal(result.result.rejectedCount,2);
  assert.equal(result.result.results[0].reading.resistanceOhms,4700);assert.equal(result.result.results[0].reading.tolerancePercent,5);
  assert.equal(result.result.results[1].reading.resistanceOhms,1000);assert.equal(result.result.results[1].reading.tolerancePercent,1);
  assert.equal(readResistorBands(["gold","brown","red","gold"]).valid,false);assert.equal(readResistorBands(["brown","black","pink","gold"]).valid,false);
  assert.equal(readResistorBands(["yellow","violet","red","gold"]).formattedResistance,"4.7 kΩ");assert.equal(readResistorBands(["brown","black","black","brown","brown"]).formattedResistance,"1 kΩ");
  const invalid=structuredClone(project);invalid.resistorColorCodeReader.cases=[];assert.equal(runResistorColorCodeReader(invalid).state,"blocked");
});
test("catalogue LED resistor calculator rounds upward to E12 and warns on resistor power", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/189-led-resistor-calculator.adigun.json",import.meta.url)));
  const result=runLedResistorCalculator(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"led-series-resistor-cases");
  const [red,blue,power]=result.result.results;assert.ok(Math.abs(red.requiredResistanceOhms-130)<1e-9);assert.equal(red.recommendedResistanceOhms,150);assert.ok(red.estimatedCurrentmA<=red.targetCurrentmA);
  assert.equal(blue.recommendedResistanceOhms,150);assert.ok(blue.estimatedCurrentmA<=blue.targetCurrentmA);
  assert.equal(power.recommendedResistanceOhms,560);assert.ok(power.warnings.some(warning=>warning.code==="RESISTOR_POWER_EXCEEDED"));assert.equal(result.result.powerWarningCount,1);
  assert.equal(calculateLedSeriesResistor({supplyVoltageV:2,ledForwardVoltageV:2,targetCurrentmA:10,resistorPowerRatingW:0.125}).ok,false);
  const invalid=structuredClone(project);invalid.ledResistorCalculator.cases[0].targetCurrentmA=0;assert.equal(runLedResistorCalculator(invalid).state,"blocked");
});
test("catalogue voltage-divider calculator reports unloaded ratio and load-shift warning", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/190-voltage-divider-calculator.adigun.json",import.meta.url)));
  const result=runVoltageDividerCalculator(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"voltage-divider-cases");assert.equal(result.result.loadingWarningCount,1);
  const [open,light,heavy]=result.result.results;assert.equal(open.unloadedOutputV,6);assert.equal(open.loadedOutputV,6);assert.equal(open.loadingChangePercent,0);
  assert.ok(Math.abs(light.loadedOutputV-5.714285714285714)<1e-9);assert.ok(light.loadingChangePercent<5);
  assert.equal(heavy.loadedOutputV,4);assert.ok(heavy.loadingChangePercent>30);assert.ok(heavy.warnings.some(warning=>warning.code==="DIVIDER_LOADING"));
  assert.equal(calculateVoltageDivider({inputVoltageV:12,resistanceTopOhms:0,resistanceBottomOhms:10000}).ok,false);
  assert.equal(calculateVoltageDivider({inputVoltageV:12,resistanceTopOhms:10000,resistanceBottomOhms:10000,loadResistanceOhms:0}).ok,false);
  const invalid=structuredClone(project);invalid.voltageDividerCalculator.cases[0].inputVoltageV=0;assert.equal(runVoltageDividerCalculator(invalid).state,"blocked");
});
test("catalogue RC timing calculator handles decimal resistance and capacitance prefixes", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/191-rc-timing-calculator.adigun.json",import.meta.url)));
  const result=runRcTimingCalculator(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"rc-timing-cases");
  const [a,b,c]=result.result.results;assert.ok(Math.abs(a.timeConstantSeconds-0.001)<1e-12);assert.ok(Math.abs(a.cutoffFrequencyHz-159.1549430919)<1e-8);
  assert.ok(Math.abs(b.timeConstantSeconds-0.047)<1e-12);assert.ok(Math.abs(b.cutoffFrequencyHz-3.3862753849)<1e-8);
  assert.ok(Math.abs(c.timeConstantSeconds-2.2e-6)<1e-15);assert.ok(Math.abs(c.cutoffFrequencyHz-72343.1559509)<1e-5);
  assert.equal(calculateRcTiming({resistanceValue:0,resistanceUnit:"kΩ",capacitanceValue:1,capacitanceUnit:"µF"}).ok,false);
  assert.equal(calculateRcTiming({resistanceValue:1,resistanceUnit:"kΩ",capacitanceValue:1,capacitanceUnit:"mΩ"}).ok,false);
  const invalid=structuredClone(project);invalid.rcTimingCalculator.cases[0].capacitanceValue=-1;assert.equal(runRcTimingCalculator(invalid).state,"blocked");
});
test("catalogue op-amp gain calculator covers both topologies and rejects zero or invalid resistors", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/192-op-amp-gain-calculator.adigun.json",import.meta.url)));
  const result=runOpAmpGainCalculator(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"op-amp-gain-cases");
  assert.deepEqual(result.result.results.map(item=>item.gain),[-10,10,2]);assert.equal(result.result.results[0].phaseInverted,true);assert.equal(result.result.results[1].phaseInverted,false);
  assert.equal(calculateOpAmpGain({configuration:"inverting",inputResistanceOhms:0,feedbackResistanceOhms:10000}).ok,false);
  assert.equal(calculateOpAmpGain({configuration:"non-inverting",feedbackResistanceOhms:-1,groundResistanceOhms:10000}).ok,false);
  assert.equal(calculateOpAmpGain({configuration:"buffer",feedbackResistanceOhms:10000,groundResistanceOhms:10000}).ok,false);
  const invalid=structuredClone(project);invalid.opAmpGainCalculator.cases[0].feedbackResistanceOhms=0;assert.equal(runOpAmpGainCalculator(invalid).state,"blocked");
});
test("catalogue PCB trace-width advisor provides scoped external/internal estimates and rejects invalid inputs", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/193-pcb-trace-width-advisor.adigun.json",import.meta.url)));
  const result=runPcbTraceWidthAdvisor(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"pcb-trace-width-advisory");assert.match(result.result.standardLimitation,/IPC-2152/);
  const [external,internal]=result.result.results;assert.ok(Math.abs(external.widthMm-0.7814374629)<1e-9);assert.ok(Math.abs(internal.widthMm-2.0328625490)<1e-9);assert.ok(internal.widthMm>external.widthMm);
  assert.equal(calculatePcbTraceWidth({currentA:0,copperThicknessUm:35,temperatureRiseC:10,layerType:"external"}).ok,false);
  assert.equal(calculatePcbTraceWidth({currentA:1,copperThicknessUm:-1,temperatureRiseC:10,layerType:"external"}).ok,false);
  assert.equal(calculatePcbTraceWidth({currentA:1,copperThicknessUm:35,temperatureRiseC:10,layerType:"unknown"}).ok,false);
  const invalid=structuredClone(project);invalid.pcbTraceWidthAdvisor.cases[0].temperatureRiseC=0;assert.equal(runPcbTraceWidthAdvisor(invalid).state,"blocked");
});

test("catalogue BOM export groups verified fields and leaves unsourced cost blank", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/194-bom-export-cost-placeholder.adigun.json",import.meta.url)));
  const result=runBomExportPlaceholder(project);
  assert.equal(result.state,"complete");assert.equal(result.result.kind,"bom-cost-placeholder");
  assert.equal(result.result.itemCount,4);assert.equal(result.result.rowCount,4);assert.equal(result.result.totalCost,null);
  assert.ok(result.result.rows.every(row=>row.unitCost===null&&row.extendedCost===null));
  const csv=exportBomCsv(buildBomReport(project));assert.equal(csv.ok,true);
  assert.match(csv.csv,/"Unit Cost","Extended Cost","Currency","Price Source","Price As Of"/);
  assert.ok(csv.csv.split("\r\n").filter(Boolean).every(line=>!line.includes("$0")&&!line.includes("\"0\"")));
  const grouped=structuredClone(project);grouped.components.push({...structuredClone(project.components[1]),instanceId:"resistor-2",reference:"R, \"2\""});
  const groupedReport=buildBomReport(grouped);const resistorRow=groupedReport.rows.find(row=>row.libraryId==="passive.resistor");
  assert.equal(resistorRow.quantity,2);assert.equal(resistorRow.references,"R, \"2\", R1");
  assert.match(exportBomCsv(groupedReport).csv,/"R, ""2"", R1"/);
  const priced=structuredClone(project);priced.components[1].verifiedPrice={unitCost:0.12,currency:"EUR",source:"https://example.com/parts/resistor",asOf:"2026-10-30"};
  const pricedReport=buildBomReport(priced);assert.equal(pricedReport.rows.find(row=>row.libraryId==="passive.resistor").extendedCost,0.12);assert.equal(pricedReport.totalCost,null);
  const invalid=structuredClone(project);invalid.components[0].libraryId="unknown.part";assert.equal(runBomExportPlaceholder(invalid).state,"blocked");
});
test("catalogue Adigun BOT component explainer cites source fields and discloses unknowns", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/195-bot-explain-component.adigun.json",import.meta.url)));
  const result=runBotComponentExplainer(project);
  assert.equal(result.state,"complete");assert.equal(result.result.kind,"bot-grounded-component-explanation");assert.equal(result.result.reference,"R1");
  assert.ok(result.result.known.some(item=>item.field==="Configured value"&&item.value==="330 Ω"&&item.source==="Native project"));
  assert.ok(result.result.known.some(item=>item.field==="Library description"&&item.source==="Checked-in component library"));
  assert.match(result.result.answer,/Sources: Native project and Checked-in component library/);
  assert.ok(result.result.unknown.some(item=>/Manufacturer is not recorded/.test(item)));
  assert.ok(result.result.unknown.some(item=>item.includes("Manufacturer part number (MPN) is not recorded.")));
  assert.ok(result.result.unknown.some(item=>/datasheet link is not recorded/.test(item)));
  assert.match(result.message,/no external AI or web lookup/i);
  assert.equal(explainComponent(project,"missing-reference").ok,false);
  const unsupported=structuredClone(project);unsupported.components[1].libraryId="unverified.part";assert.equal(explainComponent(unsupported,"R1").ok,false);
});
test("catalogue BOT floating-node repair preview validates separately and requires confirmation", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/196-bot-floating-node-repair-preview.adigun.json",import.meta.url)));
  const before=JSON.stringify(project);const result=runBotFloatingNodeRepair(project);
  assert.equal(result.state,"complete");assert.equal(result.result.kind,"bot-floating-node-repair-preview");assert.equal(result.result.validationValid,true);assert.equal(result.result.applied,false);
  assert.equal(JSON.stringify(project),before);assert.equal(result.preview.candidate.components.length,project.components.length+1);
  assert.equal(result.preview.proposal.value,"1 MΩ");assert.equal(result.preview.proposal.from,"FLOATING");assert.equal(result.preview.proposal.to,"GND");
  assert.equal(applyBotFloatingNodeRepairPreview(project,result.preview,{confirmed:false}).applied,false);assert.equal(JSON.stringify(project),before);
  const accepted=applyBotFloatingNodeRepairPreview(project,result.preview,{confirmed:true});assert.equal(accepted.applied,true);assert.equal(accepted.project.components.length,project.components.length+1);
  const changed=structuredClone(project);changed.metadata.name+=" edited";const stale=applyBotFloatingNodeRepairPreview(changed,result.preview,{confirmed:true});assert.equal(stale.applied,false);assert.equal(stale.project,changed);
  assert.equal(validateProject(accepted.project).valid,true);
});
test("catalogue BOT 12 V LED proposal validates separately and rejection preserves the project", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/197-bot-circuit-proposal.adigun.json",import.meta.url)));
  const before=JSON.stringify(project);const result=runBotCircuitProposal(project);
  assert.equal(result.state,"complete");assert.equal(result.result.kind,"bot-12v-led-circuit-proposal");assert.equal(result.result.applied,false);
  assert.equal(result.preview.proposal.source,"12 V");assert.equal(result.preview.proposal.resistor,"1000 Ω");
  assert.ok(Math.abs(result.preview.proposal.estimatedCurrentA-0.01)<1e-12);assert.ok(Math.abs(result.preview.proposal.resistorDissipationW-0.1)<1e-12);
  assert.equal(validateProject(result.preview.candidate).valid,true);assert.equal(runSupportedAnalysis(result.preview.candidate).state,"complete");
  assert.equal(JSON.stringify(project),before);
  const rejected=applyBotCircuitProposal(project,result.preview,{confirmed:false});assert.equal(rejected.applied,false);assert.equal(rejected.project,project);assert.equal(JSON.stringify(project),before);
  const stale=structuredClone(project);stale.metadata.name+=" changed";assert.equal(applyBotCircuitProposal(stale,result.preview,{confirmed:true}).applied,false);
  const accepted=applyBotCircuitProposal(project,result.preview,{confirmed:true});assert.equal(accepted.applied,true);assert.equal(accepted.project.components.find(item=>item.libraryId==="power.dc-source").value,"12 V");
});
test("catalogue four-language UI sweep covers translations, accessible names, and responsive overflow guards", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/198-four-language-ui-sweep.adigun.json",import.meta.url)));
  const result=runFourLanguageUiSweep(project);assert.equal(result.state,"complete");assert.equal(result.result.kind,"four-language-ui-sweep");assert.equal(result.result.localeCount,4);assert.equal(result.result.missingTranslations,0);
  const html=await readFile(new URL("../index.html",import.meta.url),"utf8");const css=await readFile(new URL("../styles.css",import.meta.url),"utf8");
  const audit=auditUiSource(html,css);assert.equal(audit.passed,true,JSON.stringify(audit));assert.equal(audit.missingTranslations.length,0);assert.equal(audit.undeclaredKeys.length,0);assert.deepEqual(audit.unlabeledButtons,[]);assert.deepEqual(audit.unlabeledControls,[]);assert.deepEqual(audit.unlabeledImages,[]);assert.deepEqual(audit.failedGuards,[]);assert.equal(audit.renderedPixelCheck,false);
});
test("catalogue offline recovery restores the unsaved edit and preserves a manual export on storage failure", async () => {
  const project=JSON.parse(await readFile(new URL("../examples/199-local-offline-recovery.adigun.json",import.meta.url)));
  const original=serializeProject(project);const result=runOfflineRecoveryScenario(project);
  assert.equal(result.state,"complete",result.message);assert.equal(result.result.kind,"offline-recovery-scenario");
  assert.equal(result.result.editedValue,"470 Ω");assert.equal(result.result.draftSaved,true);assert.equal(result.result.storageFallbackAvailable,true);assert.equal(result.result.silentLoss,false);
  assert.equal(serializeProject(project),original);
});
test("catalogue release candidate passes build, import, edit, simulation, ERC/DRC, export, sync and BOT-preview gates", async () => {
  const candidate=JSON.parse(await readFile(new URL("../examples/200-release-candidate-e2e.adigun.json",import.meta.url)));
  const ids=["001-led-current-limiter","122-555-timer-pcb","182-schematic-pcb-sync","195-bot-explain-component"];
  const projects=Object.fromEntries(await Promise.all(ids.map(async id=>[id,JSON.parse(await readFile(new URL("../examples/"+id+".adigun.json",import.meta.url)))])));
  const result=runReleaseCandidateE2EFixtures({candidate,projects});
  assert.equal(result.state,"complete",result.message);assert.equal(result.result.kind,"release-candidate-e2e");
  assert.deepEqual(result.result.checks,{build:true,import:true,edit:true,simulation:true,erc:true,drc:true,export:true,schematicPcbSync:true,botPreview:true});
  assert.equal(result.result.fixtureCount,4);assert.equal(result.result.pcbDrc,"passed");assert.equal(result.result.botMutation,false);
});

function makeProject() {
 return {
  metadata:{updatedAt:"2026-01-01T00:00:00.000Z"},
  components:[{instanceId:"r1",position:{pcb:[100,100],schematic:[120,120]}},{instanceId:"d1",position:{pcb:[300,100]}}],
  pcbFabrication:{
   board:{widthMm:40,heightMm:20},
   parts:[{instanceId:"r1",reference:"R1",footprint:"R_0603"},{instanceId:"d1",reference:"D1",footprint:"D_SOD-123"}],
   pads:[
    {instanceId:"r1",number:"1",netId:"VCC",xMm:5,yMm:5,technology:"through-hole",diameterMm:1},
    {instanceId:"r1",number:"2",netId:"SIG",xMm:10,yMm:5,technology:"smd",widthMm:1,heightMm:1},
    {instanceId:"d1",number:"1",netId:"SIG",xMm:20,yMm:10,technology:"through-hole",diameterMm:1}
   ],
   routes:[
    {netId:"VCC",widthMm:.25,pointsMm:[[5,5],[6,5]]},
    {netId:"SIG",widthMm:.25,pointsMm:[[10,5],[15,5],[20,10]]},
    {netId:"GND",widthMm:.25,pointsMm:[[2,2],[2,3]]}
   ]
  }
 };
}
test("PCB footprint movement keeps pad anchors and attached route endpoints together",()=>{
 const project=makeProject(),before=structuredClone(project),result=movePcbFootprint(project,"r1",{x:2,y:-1});
 assert.equal(result.status,"complete");assert.equal(result.movedPadCount,2);assert.equal(result.updatedRoutePoints,2);
 assert.deepEqual(result.project.pcbFabrication.pads.slice(0,2).map(p=>[p.xMm,p.yMm]),[[7,4],[12,4]]);
 assert.deepEqual(result.project.pcbFabrication.routes.map(r=>r.pointsMm),[[[7,4],[6,5]],[[12,4],[15,5],[20,10]],[[2,2],[2,3]]]);
 assert.deepEqual(result.project.components[0].position,{pcb:[120.8,89.6],schematic:[120,120]});
 assert.deepEqual(project,before,"the operation must not mutate the source project");
});
test("PCB footprint movement rejects board-edge overflow without changing the source",()=>{
 const project=makeProject(),before=structuredClone(project),result=movePcbFootprint(project,"r1",{x:31,y:0});
 assert.deepEqual(result,{status:"blocked",code:"OUT_OF_BOUNDS"});assert.deepEqual(project,before);
});
test("PCB footprint movement rejects invalid geometry and unknown footprints",()=>{
 const project=makeProject();
 assert.deepEqual(movePcbFootprint(project,"missing",{x:1,y:0}),{status:"blocked",code:"UNKNOWN_FOOTPRINT"});
 assert.deepEqual(movePcbFootprint(project,"d1",{x:Number.NaN,y:0}),{status:"blocked",code:"INVALID_DELTA"});
 project.pcbFabrication.pads.find(p=>p.instanceId==="r1").xMm=Number.NaN;
 assert.deepEqual(movePcbFootprint(project,"r1",{x:1,y:0}),{status:"blocked",code:"INVALID_FOOTPRINT_GEOMETRY"});
});
test("PCB footprint movement reports unchanged for a zero delta",()=>{
 const project=makeProject(),result=movePcbFootprint(project,"r1",{x:0,y:0});
 assert.equal(result.status,"unchanged");assert.equal(result.project,project);
});

