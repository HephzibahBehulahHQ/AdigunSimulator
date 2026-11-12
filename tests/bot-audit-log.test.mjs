import assert from "node:assert/strict";
import test from "node:test";
import { formatBotAuditEvent } from "../js/bot-audit-log.mjs";

test("BOT audit entries distinguish each reviewed preview outcome", () => {
  const common = { findingId: "missing-gate-input:U1:B", action: "add-input-switch" };
  assert.match(formatBotAuditEvent({ ...common, type: "preview-prepared" }), /project is unchanged/);
  assert.match(formatBotAuditEvent({ ...common, type: "preview-cancelled" }), /Cancelled/);
  assert.match(formatBotAuditEvent({ ...common, type: "preview-apply-blocked" }), /Did not apply.*project is unchanged/);
  assert.match(formatBotAuditEvent({ ...common, type: "preview-applied" }), /local and unsaved/);
  assert.match(formatBotAuditEvent({ ...common, type: "suggestion-dismissed" }), /temporarily suppressed/);
});

test("BOT audit entries reject unknown events and sanitize identifiers", () => {
  assert.equal(formatBotAuditEvent({ type: "project-uploaded", findingId: "U1" }), null);
  const entry = formatBotAuditEvent({ type: "preview-blocked", findingId: "U1\n[spoof]", action: "bad action\n" });
  assert.match(entry, /U1spoof/);
  assert.match(entry, /badaction/);
  assert.doesNotMatch(entry, /[\r\n]/);
});

