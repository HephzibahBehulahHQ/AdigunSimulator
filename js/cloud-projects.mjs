import { parseProject, serializeProject } from "./core.mjs";

export const CLOUD_PROJECT_LIMIT_BYTES = 1_400_000;
export const CLOUD_REVISION_LIMIT = 5;
export const CLOUD_PROJECT_LIMIT = 10;

const PROJECTS = "adigun_simulator_cloud_projects";
const REVISIONS = "adigun_simulator_cloud_revisions";

function requireUserId(getUserId) {
  const userId = getUserId();
  if (typeof userId !== "string" || !userId) throw new Error("Sign in before using cloud projects.");
  return userId;
}

function safeError(error) {
  if (error?.code === "23514" || error?.code === "54000") return new Error("This project exceeds the cloud save size limit.");
  if (error?.code === "P0001") return new Error("This account has reached the cloud project limit (10).");
  if (error?.code === "42501") return new Error("Cloud project access was denied. Sign in again and retry.");
  if (error?.code === "23505") return new Error("This project could not be saved because its cloud ID is already in use.");
  return new Error("Cloud project request failed. Your local project remains available.");
}

function checkedProject(project) {
  const document = parseProject(serializeProject(project));
  const bytes = new TextEncoder().encode(JSON.stringify(document)).byteLength;
  if (bytes > CLOUD_PROJECT_LIMIT_BYTES) throw new Error("This project exceeds the cloud save size limit.");
  const name = String(document.metadata?.name ?? "").trim();
  if (!name || name.length > 100) throw new Error("Cloud project names must contain 1 to 100 characters.");
  return { document, name };
}

export function createCloudProjectStore(client, { getUserId, projectLimit = CLOUD_PROJECT_LIMIT } = {}) {
  if (!client?.from) throw new TypeError("A Supabase database client is required.");

  async function result(promise) {
    const response = await promise;
    if (response.error) throw safeError(response.error);
    return response.data;
  }

  return Object.freeze({
    async list() {
      requireUserId(getUserId);
      return result(client.from(PROJECTS).select("id,name,version,created_at,updated_at")
        .order("updated_at", { ascending: false }).limit(projectLimit));
    },

    async get(id) {
      requireUserId(getUserId);
      return result(client.from(PROJECTS).select("id,name,data,version,created_at,updated_at")
        .eq("id", id).maybeSingle());
    },

    async revisions(projectId) {
      requireUserId(getUserId);
      return result(client.from(REVISIONS).select("id,project_id,version,name,data,created_at")
        .eq("project_id", projectId).order("version", { ascending: false }).limit(CLOUD_REVISION_LIMIT));
    },

    async save(project) {
      const userId = requireUserId(getUserId);
      const { document, name } = checkedProject(project);
      const existing = await result(client.from(PROJECTS).select("id,version").eq("document_id", document.id).maybeSingle());
      if (existing) {
        return result(client.from(PROJECTS).update({ name, data: document })
          .eq("id", existing.id).select("id,name,version,updated_at").single());
      }
      return result(client.from(PROJECTS).insert({ user_id: userId, document_id: document.id, name, data: document, version: 1 })
        .select("id,name,version,updated_at").single());
    },

    async remove(projectId) {
      requireUserId(getUserId);
      const removed = await result(client.from(PROJECTS).delete().eq("id", projectId).select("id").maybeSingle());
      if (!removed) throw new Error("Cloud project was not found. Refresh the list and retry.");
      return removed;
    }
  });
}
