import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { findLibraryPart, validateProject } from "../js/core.mjs";
import { validateBreadboardTopology } from "../js/breadboard-topology.mjs";
import { renderBreadboardAssemblySvg, validateBreadboardAssembly } from "../js/breadboard-assembly.mjs";
import { exportPcbFabrication, validatePcbFabrication } from "../js/pcb-export.mjs";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";

const exampleUrl = new URL("../examples/101-buck-converter-baseline.adigun.json", import.meta.url);
const getPartPins = libraryId => findLibraryPart(libraryId)?.pins ?? [];
const readExample = async () => JSON.parse(await readFile(exampleUrl, "utf8"));

test("Example 101 BB400 assembly maps every package pin and renders each source-backed part once", async () => {
  const project = await readExample();
  const topology = validateBreadboardTopology(project, { getPartPins });
  const assembly = validateBreadboardAssembly(project, { getPartPins });
  const svg = renderBreadboardAssemblySvg(project);

  assert.equal(topology.state, "complete", JSON.stringify(topology.errors));
  assert.equal(assembly.state, "complete", JSON.stringify(assembly.errors));
  assert.equal(assembly.packageCount, 9);
  assert.equal(assembly.pigtailCount, 21);
  for (const pkg of project.breadboard.assembly.packages) {
    assert.equal(svg.split(`data-instance-id="${pkg.instanceId}"`).length - 1, 1, pkg.reference);
  }
  assert.equal(validateProject(project).errors.some(error => error.rule === "BREADBOARD_ASSEMBLY"), false);
});

test("Example 101 blocks a stale package hole and exposes a corrective validation diagnostic", async () => {
  const project = await readExample();
  project.breadboard.assembly.packages.find(pkg => pkg.instanceId === "rfb-top").pins[0].hole = "B19";
  const assembly = validateBreadboardAssembly(project, { getPartPins });
  const validation = validateProject(project);
  assert.ok(assembly.errors.some(error => error.code === "BREADBOARD_ASSEMBLY_TERMINAL"));
  const diagnostic = validation.errors.find(error => error.rule === "BREADBOARD_ASSEMBLY");
  assert.match(diagnostic.fix, /lead-to-hole mapping/);
});

test("Example 101 blocks scope capture when a physical package terminal no longer matches its mapped hole", async () => {
  const project = await readExample();
  project.breadboard.assembly.packages.find(pkg => pkg.instanceId === "rfb-top").pins[0].hole = "B19";
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "blocked");
  const physical = analysis.validation.errors.find(error => error.rule === "BREADBOARD_ASSEMBLY");
  assert.match(physical.fix, /lead-to-hole mapping/);
  assert.equal(analysis.scopeRecording, undefined);
});

test("Example 101 PCB clears DRC and exports copper, outline, drill, and BOM files", async () => {
  const project = await readExample();
  const drc = validatePcbFabrication(project);
  const output = exportPcbFabrication(project);
  assert.equal(drc.status, "passed", JSON.stringify(drc.errors));
  assert.equal(output.status, "passed");
  assert.ok(output.files["board-F_Cu.gbr"]);
  assert.ok(output.files["board-B_Cu.gbr"]);
  assert.ok(output.files["board-Edge_Cuts.gbr"]);
  assert.ok(output.files["board-PTH.drl"]);
  assert.ok(output.files["BOM.csv"]);
});
