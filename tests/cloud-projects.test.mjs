import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createEmptyProject } from "../js/core.mjs";
import { CLOUD_PROJECT_LIMIT, CLOUD_PROJECT_LIMIT_BYTES, CLOUD_REVISION_LIMIT, createCloudProjectStore } from "../js/cloud-projects.mjs";

function createClient(responder = async query => ({ data: query.operation === "select" ? null : { id: query.filters.id ?? "cloud-row-1", ...query.payload }, error: null })) {
  const queries = [];
  class Query {
    constructor(table) { Object.assign(this, { table, operation: "select", filters: {} }); queries.push(this); }
    select(columns) { this.columns = columns; return this; }
    insert(payload) { this.operation = "insert"; this.payload = payload; return this; }
    update(payload) { this.operation = "update"; this.payload = payload; return this; }
    delete() { this.operation = "delete"; return this; }
    eq(key, value) { this.filters[key] = value; return this; }
    order(column, options) { this.ordering = { column, ...options }; return this; }
    limit(value) { this.limitValue = value; return this; }
    maybeSingle() { return responder(this); }
    single() { return responder(this); }
    then(resolve, reject) { return responder(this).then(resolve, reject); }
  }
  return { client: { from: table => new Query(table) }, queries };
}

test("cloud project access requires a signed-in user before any database request", async () => {
  const { client, queries } = createClient();
  const store = createCloudProjectStore(client, { getUserId: () => null });
  await assert.rejects(store.list(), /Sign in/);
  assert.equal(queries.length, 0);
});

test("list and revision reads use isolated tables, bounded results, and owner RLS", async () => {
  const { client, queries } = createClient(async query => ({ data: [], error: null }));
  const store = createCloudProjectStore(client, { getUserId: () => "owner-1" });
  assert.deepEqual(await store.list(), []);
  assert.deepEqual(await store.revisions("project-1"), []);
  assert.equal(queries[0].table, "adigun_simulator_cloud_projects");
  assert.deepEqual(queries[0].ordering, { column: "updated_at", ascending: false });
  assert.equal(queries[0].limitValue, CLOUD_PROJECT_LIMIT);
  assert.equal(queries[1].table, "adigun_simulator_cloud_revisions");
  assert.equal(queries[1].filters.project_id, "project-1");
  assert.equal(queries[1].limitValue, CLOUD_REVISION_LIMIT);
});

test("the first explicit save inserts only the owner and a validated native document", async () => {
  const { client, queries } = createClient(async query => ({ data: query.operation === "select" ? null : { id: "cloud-row-1", version: 1 }, error: null }));
  const store = createCloudProjectStore(client, { getUserId: () => "owner-1" });
  const project = createEmptyProject({ name: "Private circuit" });
  const saved = await store.save(project);
  assert.equal(saved.version, 1);
  assert.equal(queries[0].table, "adigun_simulator_cloud_projects");
  assert.equal(queries[0].filters.document_id, project.id);
  assert.equal(queries[1].operation, "insert");
  assert.equal(queries[1].payload.user_id, "owner-1");
  assert.equal(queries[1].payload.document_id, project.id);
  assert.equal("id" in queries[1].payload, false);
  assert.equal(queries[1].payload.version, 1);
  assert.deepEqual(queries[1].payload.data, project);
});

test("cloud row IDs stay valid when a browser native project uses its fallback ID", async () => {
  const { client, queries } = createClient(async query => ({ data: query.operation === "select" ? null : { id: "cloud-row-1", version: 1 }, error: null }));
  const store = createCloudProjectStore(client, { getUserId: () => "owner-1" });
  const project = { ...createEmptyProject({ name: "Fallback ID" }), id: "project-1731400000000-a1b2c3" };
  assert.equal((await store.save(project)).id, "cloud-row-1");
  assert.equal(queries[1].payload.document_id, project.id);
});

test("saving an existing cloud document updates it and lets the database create its revision", async () => {
  const existing = { id: "cloud-row-1", version: 4 };
  const { client, queries } = createClient(async query => ({ data: query === queries[0] ? existing : { id: "cloud-row-1", version: 5 }, error: null }));
  const store = createCloudProjectStore(client, { getUserId: () => "owner-1" });
  const project = { ...createEmptyProject({ name: "Revised" }), id: "native-existing" };
  const saved = await store.save(project);
  assert.equal(saved.version, 5);
  assert.equal(queries[1].operation, "update");
  assert.equal(queries[0].filters.document_id, "native-existing");
  assert.equal(queries[1].filters.id, "cloud-row-1");
  assert.deepEqual(Object.keys(queries[1].payload).sort(), ["data", "name"]);
  assert.equal(queries[1].payload.name, "Revised");
});

test("cloud saves reject oversized or invalid documents before sending project data", async () => {
  const { client, queries } = createClient();
  const store = createCloudProjectStore(client, { getUserId: () => "owner-1" });
  const oversized = createEmptyProject({ name: "Large" });
  oversized.metadata.notes = "x".repeat(CLOUD_PROJECT_LIMIT_BYTES);
  await assert.rejects(store.save(oversized), /size limit/);
  const invalidName = createEmptyProject({ name: "N".repeat(101) });
  await assert.rejects(store.save(invalidName), /1 to 100/);
  assert.equal(queries.length, 0);
});

test("project deletion is confirmed by the returned row and missing projects are reported", async () => {
  const { client, queries } = createClient(async query => ({ data: query.operation === "delete" ? { id: "project-1" } : null, error: null }));
  const store = createCloudProjectStore(client, { getUserId: () => "owner-1" });
  assert.deepEqual(await store.remove("project-1"), { id: "project-1" });
  assert.equal(queries[0].operation, "delete");
  assert.equal(queries[0].filters.id, "project-1");

  const missing = createCloudProjectStore(createClient(async () => ({ data: null, error: null })).client, { getUserId: () => "owner-1" });
  await assert.rejects(missing.remove("missing"), /not found/);
});

test("the repository never exposes raw Postgres errors to the interface", async () => {
  const { client } = createClient(async () => ({ data: null, error: { code: "42501", message: "internal policy details" } }));
  const store = createCloudProjectStore(client, { getUserId: () => "owner-1" });
  await assert.rejects(store.list(), error => error.message.includes("access was denied") && !error.message.includes("internal"));
});

test("the migration isolates simulator documents and enforces owner access, deletion, and bounded history", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20261112221500_opt_in_cloud_projects.sql", import.meta.url), "utf8");
  assert.match(migration, /create table if not exists public\.adigun_simulator_cloud_projects/);
  assert.match(migration, /create table if not exists public\.adigun_simulator_cloud_revisions/);
  assert.match(migration, /references auth\.users \(id\) on delete cascade/);
  assert.match(migration, /references public\.adigun_simulator_cloud_projects \(id\) on delete cascade/);
  assert.match(migration, /octet_length\(data::text\) <= 1500000/);
  assert.match(migration, /project_count >= 10/);
  assert.match(migration, /offset 5/);
  assert.match(migration, /alter table public\.adigun_simulator_cloud_projects enable row level security/);
  assert.match(migration, /alter table public\.adigun_simulator_cloud_revisions enable row level security/);
  assert.match(migration, /adigun_simulator_cloud_projects_delete_owner[\s\S]*?for delete to authenticated[\s\S]*?auth\.uid\(\)[\s\S]*?user_id/);
  assert.match(migration, /revoke all on table public\.adigun_simulator_cloud_projects from anon, authenticated/);
  assert.match(migration, /grant select on table public\.adigun_simulator_cloud_revisions to authenticated/);
});
