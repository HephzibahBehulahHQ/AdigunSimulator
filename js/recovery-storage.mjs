import { parseProject, serializeProject } from "./core.mjs";

export const RECOVERY_ENVELOPE_VERSION = 1;

export function readRecoveryDraft(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    const envelope = JSON.parse(raw);
    if (envelope?.schemaVersion !== RECOVERY_ENVELOPE_VERSION || typeof envelope.savedAt !== "string") throw new Error("Unsupported recovery draft.");
    return { project: parseProject(JSON.stringify(envelope.project)), savedAt: envelope.savedAt };
  } catch {
    try { storage.removeItem(key); } catch { /* Storage may be unavailable or read-only. */ }
    return null;
  }
}

export function writeRecoveryDraft(storage, key, project, now = new Date().toISOString()) {
  try {
    const envelope = { schemaVersion: RECOVERY_ENVELOPE_VERSION, savedAt: now, project: JSON.parse(serializeProject(project)) };
    storage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

export function clearRecoveryDraft(storage, key) {
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
