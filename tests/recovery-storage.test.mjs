import test from "node:test";
import assert from "node:assert/strict";
import { createProject } from "../js/core.mjs";
import { clearRecoveryDraft, RECOVERY_ENVELOPE_VERSION, readRecoveryDraft, writeRecoveryDraft } from "../js/recovery-storage.mjs";

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
}

test("recovery drafts round-trip a validated project in a versioned envelope", () => {
  const storage = createMemoryStorage();
  const project = createProject();
  assert.equal(writeRecoveryDraft(storage, "draft", project, "2026-10-31T00:00:00.000Z"), true);
  const envelope = JSON.parse(storage.getItem("draft"));
  assert.equal(envelope.schemaVersion, RECOVERY_ENVELOPE_VERSION);
  const recovered = readRecoveryDraft(storage, "draft");
  assert.equal(recovered.savedAt, "2026-10-31T00:00:00.000Z");
  assert.deepEqual(recovered.project, project);
});

test("invalid or unsupported recovery envelopes are discarded safely", () => {
  const storage = createMemoryStorage();
  storage.setItem("draft", JSON.stringify({ schemaVersion: 99, savedAt: "now", project: {} }));
  assert.equal(readRecoveryDraft(storage, "draft"), null);
  assert.equal(storage.getItem("draft"), null);
});

test("saving the native project can clear its recovery draft", () => {
  const storage = createMemoryStorage();
  writeRecoveryDraft(storage, "draft", createProject());
  clearRecoveryDraft(storage, "draft");
  assert.equal(readRecoveryDraft(storage, "draft"), null);
});

test("unavailable browser storage does not crash draft recovery or persistence", () => {
  const unavailable = {
    getItem() { throw new Error("Storage is blocked"); },
    setItem() { throw new Error("Storage is full"); },
    removeItem() { throw new Error("Storage is read-only"); }
  };
  assert.equal(readRecoveryDraft(unavailable, "draft"), null);
  assert.equal(writeRecoveryDraft(unavailable, "draft", createProject()), false);
  assert.equal(clearRecoveryDraft(unavailable, "draft"), false);
});
