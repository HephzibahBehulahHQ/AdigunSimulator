import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { addComponent, createProject, parseProject, runSupportedAnalysis, serializeProject, updateComponent, validateProject } from "../js/core.mjs";
import { getLedgerCoverage, validatePartLedger, validatePartRecord } from "../js/part-ledger.mjs";
import { getExampleCoverage, validateExampleRegistry } from "../js/example-registry.mjs";

test("starter project validates and produces a bounded analytical DC result", () => {
  const result = runSupportedAnalysis(createProject());
  assert.equal(result.state, "complete");
  assert.equal(result.result.ledOn, true);
  assert.ok(Math.abs(result.result.currentA - 0.00909) < 0.0001);
});

test("invalid resistance blocks the supported analysis", () => {
  const project = updateComponent(createProject(), "resistor-1", { value: "0 Ω" });
  assert.equal(runSupportedAnalysis(project).state, "blocked");
});

test("invalid net endpoints are rejected before analysis", () => {
  const project = createProject();
  project.nets[0].endpoints.push("resistor-1:9");
  const validation = validateProject(project);
  assert.equal(validation.valid, false);
  assert.equal(runSupportedAnalysis(project).state, "blocked");
});

test("a disconnected LED demo is not presented as a supported calculation", () => {
  const project = createProject();
  project.nets = [];
  assert.equal(runSupportedAnalysis(project).state, "blocked");
});

test("component insertion assigns a unique reference and retains project validity", () => {
  const project = addComponent(createProject(), "input.pushbutton");
  assert.equal(project.components.at(-1).reference, "SW1");
  assert.equal(validateProject(project).valid, true);
});

test("native project serialization round-trips", () => {
  const project = createProject();
  assert.deepEqual(parseProject(serializeProject(project)), project);
});

test("part ledger records authoritative candidate sources without counting candidates as verified", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url)));
  assert.equal(validatePartLedger(ledger).valid, true);
  const coverage = getLedgerCoverage(ledger);
  assert.equal(coverage.total, 4);
  assert.equal(coverage.verified, 0);
  assert.equal(coverage.remaining, 1000);
});

test("a verified record cannot bypass checksum, mapping, model, and human-review evidence", () => {
  const errors = validatePartRecord({ id: "unsafe.example", manufacturer: "Example", manufacturerPartNumber: "X1", category: "Test", type: "test", lifecycle: "active", verificationStatus: "verified", datasheet: { title: "Source", url: "https://example.invalid", accessedAt: "2026-10-30" } });
  assert.ok(errors.some((error) => error.code === "DATASHEET_CHECKSUM"));
  assert.ok(errors.some((error) => error.code === "VERIFIED_EVIDENCE"));
});

test("released examples carry a native project, acceptance test, and safety scope", async () => {
  const registry = JSON.parse(await readFile(new URL("../examples/manifest.json", import.meta.url)));
  const example = JSON.parse(await readFile(new URL("../examples/001-led-current-limiter.adigun.json", import.meta.url)));
  assert.equal(validateExampleRegistry(registry).valid, true);
  assert.equal(validateProject(example).valid, true);
  assert.equal(runSupportedAnalysis(example).state, "complete");
  assert.equal(getExampleCoverage(registry).released, 1);
  assert.equal(getExampleCoverage(registry).remaining, 199);
});

