import test from "node:test";
import assert from "node:assert/strict";
import { createAccountClient, createAccountSession } from "../js/account-auth.mjs";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../js/supabase-public-config.mjs";

function mockClient({ session = null, getSessionError = null } = {}) {
  const calls = [];
  const auth = {
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe: () => calls.push(["unsubscribe"]) } } };
    },
    async getSession() {
      return { data: { session }, error: getSessionError };
    },
    async setSession(tokens) { calls.push(["setSession", tokens]); return { data: { session: { user: { email: "owner@example.test" } } }, error: null }; },
    async signOut() { calls.push(["signOut"]); return { data: {}, error: null }; }
  };
  return { client: { auth, rpc: async () => ({ data: false, error: null }) }, calls };
}

test("account client uses PKCE, persisted sessions, and only the configured publishable key", () => {
  assert.match(SUPABASE_URL, /^https:\/\/[a-z0-9]+\.supabase\.co$/);
  assert.match(SUPABASE_PUBLISHABLE_KEY, /^sb_publishable_/);
  let arguments_;
  const client = createAccountClient({
    url: "https://project.example.test",
    publishableKey: "sb_publishable_test",
    create: (...args) => { arguments_ = args; return { configured: true }; }
  });
  assert.deepEqual(client, { configured: true });
  assert.equal(arguments_[0], "https://project.example.test");
  assert.equal(arguments_[1], "sb_publishable_test");
  assert.deepEqual(arguments_[2].auth, {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "pkce",
    persistSession: true,
    storageKey: "adigun-simulator.auth.v1"
  });
  assert.throws(() => createAccountClient({ url: "", publishableKey: "" }), /not configured/);
});

test("the committed browser SDK bundle exposes Supabase Auth without runtime package resolution", () => {
  const client = createAccountClient();
  assert.equal(typeof client.auth.signUp, "function");
  assert.equal(typeof client.auth.signInWithPassword, "function");
  assert.equal(typeof client.auth.resetPasswordForEmail, "function");
  client.auth.stopAutoRefresh();
});

test("a provider session alone cannot open Simulator cloud access", async () => {
  const mock = mockClient({ session: { user: { email: "owner@example.test" } } });
  const account = createAccountSession(mock.client);
  assert.equal((await account.initialize()).status, "account-required");
  account.dispose();
  assert.deepEqual(mock.calls.at(-1), ["unsubscribe"]);
});

test("Simulator only exposes account state after the Worker completes a fresh OTP challenge", async () => {
  const mock = mockClient();
  const requests = [];
  mock.client.rpc = async name => ({ data: name === "adigun_simulator_has_verified_product_session", error: null });
  const account = createAccountSession(mock.client, { storage: { getItem: () => "1", setItem() {} }, fetchImpl: async (url, options) => {
    assert.equal(url, "/api/account");
    assert.equal(options.credentials, "same-origin");
    const body = JSON.parse(options.body);
    requests.push(body);
    return Response.json(body.step === "begin" ? { step: "verify" } : { step: "signed-in", session: { access_token: "test", refresh_token: "test" } });
  } });
  await account.initialize();
  await account.begin("sign-in", " owner@example.test ", "correct horse battery staple");
  assert.equal(account.state.status, "account-required");
  assert.equal(await account.verify("12345678"), "signed-in");
  assert.equal(account.state.user.email, "owner@example.test");
  assert.equal("access_token" in account.state, false);
  assert.deepEqual(requests.map(request => request.step), ["begin", "verify"]);
  await account.signOut();
  assert.equal(account.state.status, "account-required");
});

test("a local session read failure leaves account auth unavailable without blocking guest projects", async () => {
  const mock = mockClient({ getSessionError: new Error("storage blocked") });
  const account = createAccountSession(mock.client);
  assert.equal((await account.initialize()).status, "unavailable");
});

test("anonymous sessions lock at the server deadline and cannot restart after sign-out", async () => {
  const mock = mockClient();
  let marker;
  const storage = { getItem: () => marker, setItem: (_key, value) => { marker = value; } };
  let starts = 0;
  mock.client.auth.signInAnonymously = async () => {
    starts++;
    return { data: { session: { user: { is_anonymous: true } } }, error: null };
  };
  mock.client.rpc = async name => {
    assert.equal(name, "adigun_simulator_ensure_guest_trial");
    return { data: [{ expires_at: "2026-11-22T12:04:00.000Z", server_now: "2026-11-22T12:03:59.980Z" }], error: null };
  };
  let expire;
  const expired = new Promise(resolve => { expire = resolve; });
  const account = createAccountSession(mock.client, { storage, onState: state => {
    if (state.status === "guest-expired") expire();
  } });
  assert.equal((await account.initialize()).status, "guest");
  await expired;
  assert.equal(account.state.status, "guest-expired");
  await account.signOut();
  account.dispose();
  const next = createAccountSession(mock.client, { storage });
  assert.equal((await next.initialize()).status, "account-required");
  assert.equal(starts, 1);
  next.dispose();
});
