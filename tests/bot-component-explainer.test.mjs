import assert from "node:assert/strict";
import test from "node:test";
import { addComponent, createEmptyProject } from "../js/core.mjs";
import { explainComponent, runBotComponentExplainer } from "../js/bot-component-explainer.mjs";

function projectWithPart(libraryId) {
  const project = addComponent(createEmptyProject(), libraryId);
  return { project, component: project.components[0] };
}

test("component explanation reports generic model limits and does not invent manufacturer identity", () => {
  const { project, component } = projectWithPart("active.logic-nand-ideal");
  const explanation = explainComponent(project, component.instanceId);
  const values = new Map(explanation.known.map((field) => [field.field, field]));

  assert.equal(explanation.ok, true);
  assert.equal(values.get("Manufacturer").value, "Not recorded");
  assert.equal(values.get("Manufacturer part number").value, "Not recorded");
  assert.equal(values.get("Evidence review status").value, "Not recorded");
  assert.equal(values.get("Library status").value, "generic educational model; not a manufacturer part");
  assert.equal(values.get("Simulation model").value, "bounded-digital-event");
  assert.match(explanation.answer, /generic educational model; not a manufacturer part/);
  assert.match(explanation.answer, /Manufacturer evidence: not recorded/);
  assert.match(explanation.answer, /No manufacturer datasheet URL is recorded/);
});

test("component explanation discloses missing evidence for generic library parts", () => {
  const { project, component } = projectWithPart("passive.resistor");
  const explanation = explainComponent(project, component.reference);

  assert.equal(explanation.ok, true);
  assert.equal(explanation.known.find((field) => field.field === "Manufacturer part number").value, "Not recorded");
  assert.ok(explanation.unknown.some((message) => message.includes("No manufacturer evidence record")));
  assert.ok(explanation.unknown.some((message) => message.includes("MPN")));
});

test("component explanation action carries unknown ledger fields into diagnostics", () => {
  const { project, component } = projectWithPart("passive.resistor");
  const result = runBotComponentExplainer({
    ...project,
    botExplainComponent: { kind: "grounded-component-explanation", target: component.instanceId }
  });

  assert.equal(result.state, "complete");
  assert.ok(result.warnings.some((warning) => warning.code === "BOT_FIELD_UNKNOWN"));
  assert.equal(result.result.kind, "bot-grounded-component-explanation");
});
