const EVENT_MESSAGES = Object.freeze({
  "suggestion-dismissed": (id) => `[BOT] Dismissed suggestion ${id}; it is temporarily suppressed.`,
  "preview-prepared": (id, action) => `[BOT] Prepared a ${action} preview for ${id}; the project is unchanged.`,
  "preview-blocked": (id, action) => `[BOT] Could not prepare a ${action} preview for ${id}; the project is unchanged.`,
  "preview-cancelled": (id, action) => `[BOT] Cancelled the ${action} preview for ${id}; the project is unchanged.`,
  "preview-apply-blocked": (id, action) => `[BOT] Did not apply the ${action} preview for ${id}; the project is unchanged.`,
  "preview-applied": (id, action) => `[BOT] Applied the reviewed ${action} preview for ${id}; changes remain local and unsaved.`
});

function safeAuditValue(value, fallback) {
  const text = String(value ?? "").replace(/[^a-z0-9_.:-]/gi, "").slice(0, 120);
  return text || fallback;
}

export function formatBotAuditEvent({ type, findingId, action } = {}) {
  const format = EVENT_MESSAGES[type];
  if (!format) return null;
  return format(safeAuditValue(findingId, "unknown-finding"), safeAuditValue(action, "unknown-action"));
}

