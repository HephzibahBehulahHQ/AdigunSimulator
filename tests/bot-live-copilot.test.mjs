import test from "node:test";
import assert from "node:assert/strict";
import { addComponent, connectPins, createEmptyProject } from "../js/core.mjs";
import { analyzeBotCanvas, applyBotSuggestionPreview, buildBotSuggestionPreview, createBotLiveCopilot, explainComponentWiring } from "../js/bot-live-copilot.mjs";

function gateProject() {
  let project = createEmptyProject({ name: "Live co-pilot test" });
  for (const id of ["power.dc-source", "ground.signal", "active.logic-and-ideal"]) project = addComponent(project, id);
  const [source, ground, gate] = project.components;
  project = connectPins(project, `${source.instanceId}:+`, `${gate.instanceId}:A`);
  project = connectPins(project, `${source.instanceId}:+`, `${gate.instanceId}:VCC`);
  project = connectPins(project, `${source.instanceId}:-`, `${gate.instanceId}:GND`);
  project = connectPins(project, `${source.instanceId}:-`, `${ground.instanceId}:0`);
  return project;
}

function fakeScheduler() {
  let id = 0, time = 0;
  const jobs = new Map();
  return {
    now: () => time,
    schedule(fn, delay) { const key = ++id; jobs.set(key, { fn, at: time + delay }); return key; },
    cancel(key) { jobs.delete(key); },
    advance(ms) { time += ms; for (const [key, job] of [...jobs]) if (job.at <= time) { jobs.delete(key); job.fn(); } },
    get pending() { return jobs.size; }
  };
}

test("live analyzer grounds missing gate input and disconnected output findings in actual nets", () => {
  const project = gateProject();
  const findings = analyzeBotCanvas(project, { goal: "two-input logic demonstration" });
  assert.ok(findings.some((item) => item.kind === "missing-gate-input" && item.reference === "U1" && item.pin === "B"));
  assert.ok(findings.some((item) => item.kind === "unobserved-gate-output" && item.reference === "U1" && item.pin === "Y"));
  assert.ok(!findings.some((item) => item.kind === "missing-gate-rails"));
});

test("live analyzer reports open VCC/GND pins on non-gate parts from the checked-in library", () => {
  const project = createEmptyProject({ name: "Unpowered comparator" });
  const withComparator = addComponent(project, "active.comparator-ideal");
  const finding = analyzeBotCanvas(withComparator).find((item) => item.kind === "missing-supply-pins");
  assert.equal(finding.reference, "U1");
  assert.equal(finding.pins, "VCC and GND");
  assert.equal(finding.action, null);
  assert.match(finding.detail, /cannot choose a supply voltage or infer a ground connection/);
});

test("ambiguous circuit asks for the project goal and uses an explicitly supplied goal", () => {
  const project = gateProject();
  assert.ok(analyzeBotCanvas(project).some((item) => item.kind === "goal-question"));
  assert.ok(!analyzeBotCanvas(project, { goal: "Check whether both inputs are high" }).some((item) => item.kind === "goal-question"));
});

test("hover explanation names the component's current connected peers and open pins", () => {
  const project = gateProject();
  const result = explainComponentWiring(project, "U1");
  assert.equal(result.ok, true);
  assert.match(result.answer, /A → N/);
  assert.match(result.answer, /Unconnected pins: B, Y/);
});

test("accepted suggestion requires preview confirmation, validates, and leaves stale failures unchanged", () => {
  const project = gateProject();
  const finding = analyzeBotCanvas(project, { goal: "logic demo" }).find((item) => item.kind === "missing-gate-input");
  const preview = buildBotSuggestionPreview(project, finding);
  assert.equal(preview.ok, true, preview.error);
  assert.equal(project.components.length, 3);
  assert.equal(preview.candidate.components.length, 4);
  assert.equal(applyBotSuggestionPreview(project, preview).applied, false);
  const applied = applyBotSuggestionPreview(project, preview, { confirmed: true });
  assert.equal(applied.applied, true, applied.message);
  assert.equal(applied.project.nets.find((net) => net.endpoints.includes(`${project.components[2].instanceId}:B`)).endpoints.length, 2);
  const stale = applyBotSuggestionPreview({ ...project, metadata: { ...project.metadata, name: "Changed" } }, preview, { confirmed: true });
  assert.equal(stale.applied, false);
  assert.equal(stale.project.metadata.name, "Changed");
  const invalidPreview = { ...preview, candidate: { ...preview.candidate, nets: null } };
  const failed = applyBotSuggestionPreview(project, invalidPreview, { confirmed: true });
  assert.equal(failed.applied, false);
  assert.equal(failed.project, project);
});

test("live co-pilot debounces, pauses while dragging or typing, and rate-limits suggestions", () => {
  const clock = fakeScheduler(), notices = [];
  const bot = createBotLiveCopilot({ debounceMs: 10, rateLimitMs: 100, now: clock.now, schedule: clock.schedule, cancel: clock.cancel, onSuggestion: (item) => notices.push(item) });
  const project = gateProject();
  bot.notify(project, { dragging: true });
  clock.advance(20);
  assert.equal(notices.length, 0);
  bot.notify(project, { typing: true });
  clock.advance(20);
  assert.equal(notices.length, 0);
  bot.notify(project);
  clock.advance(10);
  assert.equal(notices.length, 1);
  const firstId = notices[0].id;
  bot.dismiss(notices[0].id);
  clock.advance(99);
  assert.equal(notices.length, 1);
  clock.advance(1);
  assert.equal(notices.length, 2);
  assert.notEqual(notices[1].id, firstId);
  bot.setGoal("two-input AND gate");
  assert.equal(bot.getGoal(), "two-input AND gate");
  bot.setEnabled(false);
  assert.equal(notices.at(-1), null);
  assert.equal(clock.pending, 0);
  bot.dispose();
});
