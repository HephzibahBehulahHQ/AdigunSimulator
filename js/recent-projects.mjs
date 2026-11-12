export const MAX_RECENT_PROJECTS = 8;

export function sortRecentProjects(projects, limit = MAX_RECENT_PROJECTS) {
  return [...projects]
    .sort((a, b) => b.savedAt - a.savedAt || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function createRecentProjectStore(indexedDBRef = globalThis.indexedDB) {
  let databasePromise;
  function database() {
    if (!indexedDBRef) return Promise.reject(new Error("Recent projects are unavailable in this browser."));
    if (!databasePromise) {
      const pending = new Promise((resolve, reject) => {
        const request = indexedDBRef.open("adigun-simulator-recent-projects", 1);
        request.onupgradeneeded = () => request.result.createObjectStore("projects", { keyPath: "id" });
        request.onsuccess = () => {
          request.result.onversionchange = () => request.result.close();
          resolve(request.result);
        };
        request.onerror = () => reject(request.error ?? new Error("Recent project storage could not be opened."));
        request.onblocked = () => reject(new Error("Recent project storage is blocked by another open tab."));
      });
      databasePromise = pending.catch((error) => { databasePromise = null; throw error; });
    }
    return databasePromise;
  }

  return Object.freeze({
    async save(project, serialized, savedAt = Date.now()) {
      if (!project?.id || typeof serialized !== "string") throw new TypeError("A project ID and serialized project are required.");
      const name = String(project.metadata?.name || project.id);
      const db = await database();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction("projects", "readwrite");
        const store = transaction.objectStore("projects");
        store.put({ id: project.id, name, savedAt, serialized });
        const request = store.getAll();
        request.onsuccess = () => sortRecentProjects(request.result, request.result.length).slice(MAX_RECENT_PROJECTS).forEach((item) => store.delete(item.id));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error("Recent project could not be saved."));
        transaction.onabort = () => reject(transaction.error ?? new Error("Recent project save was cancelled."));
      });
    },
    async list() {
      const db = await database();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction("projects", "readonly");
        const request = transaction.objectStore("projects").getAll();
        request.onsuccess = () => resolve(sortRecentProjects(request.result));
        request.onerror = () => reject(request.error ?? new Error("Recent projects could not be read."));
      });
    },
    async get(id) {
      const db = await database();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction("projects", "readonly");
        const request = transaction.objectStore("projects").get(id);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error ?? new Error("Recent project could not be read."));
      });
    }
  });
}
