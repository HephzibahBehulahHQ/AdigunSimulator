import test from "node:test";
import assert from "node:assert/strict";
import { createAccountClient, createAccountSession } from "../js/account-auth.mjs";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../js/supabase-public-config.mjs";

function mockClient({ session = null, getSessionError = null } = {}) {
  const calls = [];
  let authListener;
  const auth = {
    onAuthStateChange(callback) {
      authListener = callback;
      return { data: { subscription: { unsubscribe: () => calls.push(["unsubscribe"]) } } };
    },
    async getSession() {
      return { data: { session }, error: getSessionError };
    },
    async signUp(args) { calls.push(["signUp", args]); return { data: { user: { email: args.email }, session: null }, error: null }; },
    async signInWithPassword(args) { calls.push(["signInWithPassword", args]); return { data: { user: { email: args.email }, session: { user: { email: args.email } } }, error: null }; },
    async signOut() { calls.push(["signOut"]); return { data: {}, error: null }; },
    async resetPasswordForEmail(email, options) { calls.push(["resetPasswordForEmail", email, options]); return { data: {}, error: null }; },
    async updateUser(args) { calls.push(["updateUser", args]); return { data: { user: { email: "owner@example.test" } }, error: null }; }
  };
  return { client: { auth }, calls, emit: (event, nextSession) => authListener(event, nextSession) };
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
    detectSessionInUrl: true,
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

test("account session reports guest and signed-in states without exposing tokens", async () => {
  const mock = mockClient();
  const states = [];
  const account = createAccountSession(mock.client, { onState: state => states.push(state) });
  assert.equal((await account.initialize()).status, "guest");
  const user = await account.signIn(" owner@example.test ", "correct horse battery staple");
  assert.equal(user.email, "owner@example.test");
  assert.equal(account.state.status, "signed-in");
  assert.equal("access_token" in account.state, false);
  mock.emit("SIGNED_OUT", null);
  assert.equal(states.at(-1).status, "guest");
  await account.signOut();
  account.dispose();
  assert.deepEqual(mock.calls.at(-1), ["unsubscribe"]);
});

test("signup and password recovery redirect only to the configured application origin", async () => {
  const mock = mockClient();
  const account = createAccountSession(mock.client, { getRedirectUrl: () => "https://adigunsimulator.example.test/" });
  const signup = await account.signUp(" owner@example.test ", "secret");
  assert.equal(signup.confirmationRequired, true);
  assert.equal(mock.calls[0][1].email, "owner@example.test");
  assert.equal(mock.calls[0][1].options.emailRedirectTo, "https://adigunsimulator.example.test/");
  await account.requestPasswordReset(" owner@example.test ");
  assert.deepEqual(mock.calls[1], ["resetPasswordForEmail", "owner@example.test", { redirectTo: "https://adigunsimulator.example.test/" }]);
});

test("a local session read failure leaves account auth unavailable without blocking guest projects", async () => {
  const mock = mockClient({ getSessionError: new Error("storage blocked") });
  const account = createAccountSession(mock.client);
  assert.equal((await account.initialize()).status, "unavailable");
});
