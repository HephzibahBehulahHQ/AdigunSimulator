import { createClient } from "./vendor/supabase-sdk.mjs";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase-public-config.mjs";

const trialMarker = "adigun-simulator.guest-started.v1";
const maximumGuestMs = 240_000;

export function createAccountClient({
  create = createClient,
  url = SUPABASE_URL,
  publishableKey = SUPABASE_PUBLISHABLE_KEY
} = {}) {
  if (!url || !publishableKey) throw new Error("Account authentication is not configured.");
  return create(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: "pkce",
      persistSession: true,
      storageKey: "adigun-simulator.auth.v1"
    }
  });
}

export function createAccountSession(client, {
  onState = () => {},
  fetchImpl = globalThis.fetch,
  storage = globalThis.localStorage
} = {}) {
  let current = { status: "loading", user: null, event: "INITIAL_SESSION" };
  let subscription;
  let initializePromise;
  let revision = 0;
  let initializing = true;
  let guestTimer;

  const publish = (event, status, user = null) => {
    clearTimeout(guestTimer);
    current = { status, user, event };
    onState(current);
    return current;
  };
  const requireData = ({ data, error }) => {
    if (error) throw error;
    return data;
  };

  async function publishSession(event, session) {
    const request = ++revision;
    try {
      const user = session?.user;
      if (!user) return publish(event, "account-required");
      if (user.is_anonymous) return publish(event, "account-required");
      const verified = requireData(await client.rpc("adigun_simulator_has_verified_product_session")) === true;
      if (request !== revision) return current;
      if (!verified) return publish(event, "account-required");
      storage?.setItem(trialMarker, "1");
      return publish(event, "signed-in", user);
    } catch {
      return request === revision ? publish("ERROR", "unavailable") : current;
    }
  }

  async function initializeSession() {
    const { session } = requireData(await client.auth.getSession());
    if (session) return publishSession("INITIAL_SESSION", session);
    const remembered = Boolean(storage?.getItem(trialMarker));
    const started = performance.now();
    const trial = await accountRequest({ step:"guest", allowStart:!remembered });
    if (trial.step !== "guest" || !Number.isInteger(trial.remainingMs) || trial.remainingMs < 0 || trial.remainingMs > maximumGuestMs) {
      throw new Error("Invalid guest trial");
    }
    storage?.setItem(trialMarker, "1");
    const remaining = trial.remainingMs - (performance.now() - started);
    if (remaining <= 0) return publish("INITIAL_SESSION", "guest-expired");
    const state = publish("INITIAL_SESSION", "guest");
    guestTimer = setTimeout(() => publish("GUEST_EXPIRED", "guest-expired"), remaining);
    return state;
  }

  async function accountRequest(payload) {
    const response = await fetchImpl("/api/account", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "account-unavailable");
    return result;
  }

  return Object.freeze({
    get state() { return current; },
    initialize() {
      if (initializePromise) return initializePromise;
      subscription = client.auth.onAuthStateChange((event, session) => {
        if (initializing || event === "INITIAL_SESSION") return;
        // Supabase Auth holds its session lock while it invokes this callback.
        setTimeout(() => { if (subscription) void publishSession(event, session); }, 0);
      }).data?.subscription;
      initializePromise = initializeSession()
        .catch(() => publish("ERROR", "unavailable"))
        .finally(() => { initializing = false; });
      return initializePromise;
    },

    async begin(mode, email, password) {
      const result = await accountRequest({ step: "begin", mode, email: email.trim(), password });
      if (result.step !== "verify") throw new Error("account-unavailable");
    },

    async verify(code) {
      const result = await accountRequest({ step: "verify", code: code.trim() });
      if (result.step === "signed-in") {
        const data = requireData(await client.auth.setSession(result.session));
        const state = await publishSession("SIGNED_IN", data.session);
        if (state.status !== "signed-in") throw new Error("account-unavailable");
      } else if (result.step !== "registered" && result.step !== "password-reset") {
        throw new Error("account-unavailable");
      }
      return result.step;
    },

    async signOut() {
      ++revision;
      requireData(await client.auth.signOut({ scope: "local" }));
      publish("SIGNED_OUT", "account-required");
    },

    dispose() {
      ++revision;
      clearTimeout(guestTimer);
      subscription?.unsubscribe?.();
      subscription = null;
    }
  });
}
