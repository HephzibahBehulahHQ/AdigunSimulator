import test from "node:test";
import assert from "node:assert/strict";
import { createAccountUi } from "../js/account-ui.mjs";

class Element {
  constructor() { this.hidden = false; this.disabled = false; this.required = false; this.dataset = {}; this.listeners = {}; }
  addEventListener(type, listener) { this.listeners[type] = listener; }
  setAttribute(name, value) { this[name] = value; }
  focus() { this.focused = true; }
  click() { this.listeners.click?.({ preventDefault() {} }); }
  showModal() { this.open = true; }
  close() { this.open = false; }
}

test("opening the account panel refreshes its session and cloud controls from the current auth state", async () => {
  const selectors = [
    "#account-status", "#account-dialog", "#account-form", "#account-email", "#account-password",
    "#account-password-row", "#account-password-confirm-row", "#account-password-confirm", "#account-code-row", "#account-code", "#account-submit",
    "#account-mode-toggle", "#account-forgot", "#account-session", "#account-session-email",
    "#account-sign-out", "#account-cloud-save", "#account-cloud-manage", "#account-message"
  ];
  const elements = new Map(selectors.map(selector => [selector, new Element()]));
  const close = new Element();
  elements.get("#account-dialog").querySelector = selector => selector === "[data-account-close]" ? close : null;
  const document = { querySelector: selector => elements.get(selector) };
  let current = { status: "guest", user: null };
  const requests = [];
  const account = {
    get state() { return current; },
    async begin(...args) { requests.push(args); },
    async verify(code) { requests.push(code); return "registered"; }
  };

  createAccountUi({ document, account, translate: (_locale, key) => key, getLocale: () => "en" });
  elements.get("#account-status").click();
  elements.get("#account-mode-toggle").click();
  elements.get("#account-email").value = "owner@example.test";
  elements.get("#account-password").value = "correct horse battery staple";
  elements.get("#account-password-confirm").value = "correct horse battery staple";
  const submit = elements.get("#account-form").listeners.submit;
  await submit({ preventDefault() {} });
  assert.equal(requests[0][0], "register");
  assert.equal(elements.get("#account-code-row").hidden, false);
  assert.equal(elements.get("#account-password").value, "");
  elements.get("#account-code").value = "12345678";
  await submit({ preventDefault() {} });
  assert.equal(requests[1], "12345678");
  assert.equal(elements.get("#account-code-row").hidden, true);
  assert.equal(elements.get("#account-message").textContent, "accountRegistrationVerified");
  elements.get("#account-dialog").close();

  current = { status: "signed-in", user: { email: "owner@example.test" } };
  elements.get("#account-status").click();

  assert.equal(elements.get("#account-status").dataset.authState, "signed-in");
  assert.equal(elements.get("#account-session").hidden, false);
  assert.equal(elements.get("#account-session-email").textContent, "owner@example.test");
  assert.equal(elements.get("#account-form").hidden, true);
  assert.equal(elements.get("#account-cloud-save").hidden, false);
  assert.equal(elements.get("#account-cloud-manage").hidden, false);
});
