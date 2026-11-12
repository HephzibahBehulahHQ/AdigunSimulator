import { createClient } from "./vendor/supabase-sdk.mjs";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase-public-config.mjs";

const ERROR_STATE = Object.freeze({ status: "unavailable", user: null, event: "ERROR" });

export function createAccountClient({
  create = createClient,
  url = SUPABASE_URL,
  publishableKey = SUPABASE_PUBLISHABLE_KEY
} = {}) {
  if (!url || !publishableKey) throw new Error("Account authentication is not configured.");
  return create(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      persistSession: true,
      storageKey: "adigun-simulator.auth.v1"
    }
  });
}

export function createAccountSession(client, {
  onState = () => {},
  getRedirectUrl = () => `${globalThis.location.origin}${globalThis.location.pathname}`
} = {}) {
  let current = { status: "loading", user: null, event: "INITIAL_SESSION" };
  let subscription = null;
  let initializePromise = null;

  const publish = (event, session, error = null) => {
    current = error
      ? ERROR_STATE
      : { status: session?.user ? "signed-in" : "guest", user: session?.user ?? null, event };
    onState(current);
    return current;
  };

  const ensureOk = ({ data, error }) => {
    if (error) throw error;
    return data;
  };

  return Object.freeze({
    get state() { return current; },

    initialize() {
      if (initializePromise) return initializePromise;
      subscription = client.auth.onAuthStateChange((event, session) => publish(event, session)).data?.subscription ?? null;
      initializePromise = client.auth.getSession()
        .then(result => publish("INITIAL_SESSION", ensureOk(result).session))
        .catch(error => publish("ERROR", null, error));
      return initializePromise;
    },

    async signUp(email, password) {
      const data = ensureOk(await client.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: getRedirectUrl() }
      }));
      return { user: data.user ?? null, confirmationRequired: !data.session };
    },

    async signIn(email, password) {
      const data = ensureOk(await client.auth.signInWithPassword({ email: email.trim(), password }));
      publish("SIGNED_IN", data.session);
      return data.user;
    },

    async signOut() {
      ensureOk(await client.auth.signOut());
      publish("SIGNED_OUT", null);
    },

    async requestPasswordReset(email) {
      ensureOk(await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: getRedirectUrl() }));
    },

    async updatePassword(password) {
      const data = ensureOk(await client.auth.updateUser({ password }));
      publish("USER_UPDATED", { user: data.user });
      return data.user;
    },

    dispose() {
      subscription?.unsubscribe?.();
      subscription = null;
    }
  });
}
