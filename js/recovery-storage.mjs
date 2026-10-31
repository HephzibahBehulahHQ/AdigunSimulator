import { parseProject, serializeProject } from "./core.mjs";

export const RECOVERY_ENVELOPE_VERSION = 1;

export function readRecoveryDraft(storage, key) {
  const raw = storage.getItem(key);
  if (raw === null) return null;
  try {
    const envelope = JSON.parse(raw);
    if (envelope?.schemaVersion !== RECOVERY_ENVELOPE_VERSION || typeof envelope.savedAt !== "string") throw new Error("Unsupported recovery draft.");
    return { project: parseProject(JSON.stringify(envelope.project)), savedAt: envelope.savedAt };
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function writeRecoveryDraft(storage, key, project, now = new Date().toISOString()) {
  const envelope = { schemaVersion: RECOVERY_ENVELOPE_VERSION, savedAt: now, project: JSON.parse(serializeProject(project)) };
  try {
    storage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

export function clearRecoveryDraft(storage, key) {
  storage.removeItem(key);
}
