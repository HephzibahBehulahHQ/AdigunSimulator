import assert from "node:assert/strict";
import test from "node:test";
import { createRecentProjectStore, MAX_RECENT_PROJECTS, sortRecentProjects } from "../js/recent-projects.mjs";

function createFakeIndexedDB() {
  const records = new Map();
  const database = {
    createObjectStore: () => ({}),
    transaction: () => {
      let pending = 0;
      const tx = { objectStore: () => ({
        put: (value) => request(() => records.set(value.id, value)),
        get: (id) => request(() => records.get(id)),
        getAll: () => request(() => [...records.values()]),
        delete: (id) => request(() => records.delete(id))
      }) };
      function request(run) {
        pending++;
        const result = {};
        queueMicrotask(() => {
          result.result = run();
          result.onsuccess?.();
          pending--;
          if (pending === 0) queueMicrotask(() => tx.oncomplete?.());
        });
        return result;
      }
      return tx;
    },
    close() {}
  };
  return { open() { const result = { result: database }; queueMicrotask(() => { result.onupgradeneeded?.(); result.onsuccess?.(); }); return result; } };
}

test("recent projects are newest first with stable names as a timestamp tie-break", () => {
  const projects = [
    { id: "c", name: "Gamma", savedAt: 5 },
    { id: "b", name: "Beta", savedAt: 5 },
    { id: "a", name: "Alpha", savedAt: 9 }
  ];
  assert.deepEqual(sortRecentProjects(projects).map(({ id }) => id), ["a", "b", "c"]);
  assert.equal(projects[0].id, "c");
});

test("recent project list is capped to the supported history length", () => {
  const projects = Array.from({ length: MAX_RECENT_PROJECTS + 2 }, (_, index) => ({ id: String(index), name: `Project ${index}`, savedAt: index }));
  assert.equal(sortRecentProjects(projects).length, MAX_RECENT_PROJECTS);
  assert.equal(sortRecentProjects(projects)[0].id, String(MAX_RECENT_PROJECTS + 1));
});

test("recent project storage reports unavailable IndexedDB and rejects invalid snapshots", async () => {
  const store = createRecentProjectStore(undefined);
  await assert.rejects(store.list(), /unavailable in this browser/);
  await assert.rejects(store.save({}, "{}"), /project ID and serialized project are required/);
});

test("recent project storage reopens snapshots and retains only the newest eight", async () => {
  const store = createRecentProjectStore(createFakeIndexedDB());
  for (let index = 0; index < MAX_RECENT_PROJECTS + 2; index++) {
    const project = { id: `project-${index}`, metadata: { name: `Project ${index}` } };
    await store.save(project, JSON.stringify(project), index + 1);
  }
  const recent = await store.list();
  assert.equal(recent.length, MAX_RECENT_PROJECTS);
  assert.equal(recent[0].id, `project-${MAX_RECENT_PROJECTS + 1}`);
  assert.equal(await store.get("project-0"), null);
  assert.equal(JSON.parse((await store.get("project-9")).serialized).id, "project-9");
});
