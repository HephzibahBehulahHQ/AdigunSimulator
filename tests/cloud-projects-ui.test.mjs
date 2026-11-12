import test from "node:test";
import assert from "node:assert/strict";
import { createCloudProjectsUi } from "../js/cloud-projects-ui.mjs";

class Element {
  constructor() { this.hidden = false; this.disabled = false; this.open = false; this.value = ""; this.textContent = ""; this.dataset = {}; this.listeners = new Map(); this.options = []; }
  addEventListener(type, callback) { const callbacks = this.listeners.get(type) ?? []; callbacks.push(callback); this.listeners.set(type, callbacks); }
  async fire(type) { for (const callback of this.listeners.get(type) ?? []) await callback({ preventDefault() {} }); }
  showModal() { this.open = true; }
  close() { this.open = false; }
  replaceChildren(...items) { this.options = items; this.value = items[0]?.value ?? ""; }
  append(item) { this.options.push(item); if (this.options.length === 1) this.value = item.value; }
  get selectedOptions() { return this.options.filter(option => option.value === this.value); }
}

const sleepTurn = () => new Promise(resolve => setTimeout(resolve, 0));

test("cloud UI requires sign-in, makes each upload explicit, loads versions, and confirms deletion", async () => {
  const ids = ["#account-cloud-save", "#account-cloud-manage", "#cloud-save-dialog", "#cloud-save-name", "#cloud-save-message", "#cloud-save-confirm", "#cloud-projects-dialog", "#cloud-project-picker", "#cloud-revision-picker", "#cloud-projects-message", "#cloud-open-current", "#cloud-open-revision", "#cloud-delete-project", "#cloud-delete-dialog", "#cloud-delete-name", "#cloud-delete-confirm", "#cloud-refresh"];
  const elements = new Map(ids.map(id => [id, new Element()]));
  const close = new Element();
  const document = { querySelector: selector => elements.get(selector), querySelectorAll: () => [close], createElement: () => new Element() };
  let session = { status: "guest" };
  const project = { id: "local-1", metadata: { name: "Local circuit" } };
  const calls = [];
  const store = {
    async list() { calls.push("list"); return [{ id: "cloud-1", name: "Saved circuit", version: 3, updated_at: "2026-11-12T12:00:00Z" }]; },
    async revisions() { calls.push("revisions"); return [{ id: "revision-1", version: 2, data: { id: "cloud-1", version: 2 } }]; },
    async get() { return { data: { id: "cloud-1", version: 3 }, version: 3 }; },
    async save(value) { calls.push(["save", value]); return { id: value.id }; },
    async remove(id) { calls.push(["remove", id]); return { id }; }
  };
  const opened = [];
  const saved = [];
  const ui = createCloudProjectsUi({
    document, account: { get state() { return session; } }, store,
    translate: (_locale, key) => key, getLocale: () => "en", getProject: () => project,
    onSaved: value => saved.push(value), onOpenDocument: async (data, meta) => opened.push({ data, meta })
  });

  ui.openSaveDialog();
  assert.equal(elements.get("#cloud-save-dialog").open, false);
  assert.equal(calls.length, 0);
  session = { status: "signed-in", user: { id: "owner-1" } };
  ui.openSaveDialog();
  assert.equal(elements.get("#cloud-save-name").textContent, "Local circuit");
  await elements.get("#cloud-save-confirm").fire("click");
  assert.equal(calls[0][0], "save");
  assert.equal(saved.length, 1);

  ui.openManager();
  await sleepTurn();
  const picker = elements.get("#cloud-project-picker");
  assert.deepEqual(picker.options.map(option => option.textContent.startsWith("Saved circuit") ? "project" : "placeholder"), ["placeholder", "project"]);
  picker.value = "cloud-1";
  await picker.fire("change");
  await sleepTurn();
  assert.ok(calls.includes("revisions"));
  assert.equal(elements.get("#cloud-open-current").disabled, false);
  assert.equal(elements.get("#cloud-open-revision").disabled, false);
  await elements.get("#cloud-open-current").fire("click");
  assert.equal(opened[0].meta.source, "cloud");
  elements.get("#cloud-revision-picker").value = "revision-1";
  await elements.get("#cloud-revision-picker").fire("change");
  await elements.get("#cloud-open-revision").fire("click");
  assert.equal(opened[1].meta.source, "cloud-revision");

  await elements.get("#cloud-delete-project").fire("click");
  assert.equal(elements.get("#cloud-delete-dialog").open, true);
  await elements.get("#cloud-delete-confirm").fire("click");
  assert.ok(calls.some(call => Array.isArray(call) && call[0] === "remove" && call[1] === "cloud-1"));
  assert.equal(elements.get("#cloud-delete-dialog").open, false);

  ui.renderState({ status: "guest" });
  assert.equal(elements.get("#cloud-projects-dialog").open, false);
  ui.dispose();
});

test("cloud project results from a previous account cannot replace the current account list", async () => {
  const ids = ["#account-cloud-save", "#account-cloud-manage", "#cloud-save-dialog", "#cloud-save-name", "#cloud-save-message", "#cloud-save-confirm", "#cloud-projects-dialog", "#cloud-project-picker", "#cloud-revision-picker", "#cloud-projects-message", "#cloud-open-current", "#cloud-open-revision", "#cloud-delete-project", "#cloud-delete-dialog", "#cloud-delete-name", "#cloud-delete-confirm", "#cloud-refresh"];
  const elements = new Map(ids.map(id => [id, new Element()]));
  const document = { querySelector: selector => elements.get(selector), querySelectorAll: () => [], createElement: () => new Element() };
  let session = { status: "signed-in", user: { id: "owner-a" } };
  const pendingLists = [];
  const store = { list: () => new Promise(resolve => pendingLists.push(resolve)) };
  const ui = createCloudProjectsUi({
    document, account: { get state() { return session; } }, store,
    translate: (_locale, key) => key, getLocale: () => "en", getProject: () => null,
    onOpenDocument: async () => {}
  });

  ui.openManager();
  assert.equal(pendingLists.length, 1);
  ui.renderState({ status: "guest" });
  session = { status: "signed-in", user: { id: "owner-b" } };
  ui.renderState(session);
  ui.openManager();
  assert.equal(pendingLists.length, 2);

  pendingLists[1]([{ id: "project-b", name: "Account B project", version: 1, updated_at: "2026-11-13T12:00:00Z" }]);
  await sleepTurn();
  const picker = elements.get("#cloud-project-picker");
  assert.ok(picker.options.some(option => option.textContent.startsWith("Account B project")));

  pendingLists[0]([{ id: "project-a", name: "Account A project", version: 1, updated_at: "2026-11-13T11:00:00Z" }]);
  await sleepTurn();
  assert.ok(picker.options.some(option => option.textContent.startsWith("Account B project")));
  assert.ok(!picker.options.some(option => option.textContent.startsWith("Account A project")));
  ui.dispose();
});
