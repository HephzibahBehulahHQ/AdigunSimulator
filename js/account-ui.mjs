export function createAccountUi({ document, account, translate, getLocale, onCloudSave = () => {}, onCloudManage = () => {}, onAccountState = () => {} }) {
  const button = document.querySelector("#account-status");
  const dialog = document.querySelector("#account-dialog");
  const form = document.querySelector("#account-form");
  const email = document.querySelector("#account-email");
  const password = document.querySelector("#account-password");
  const passwordRow = document.querySelector("#account-password-row");
  const confirmRow = document.querySelector("#account-password-confirm-row");
  const confirmPassword = document.querySelector("#account-password-confirm");
  const codeRow = document.querySelector("#account-code-row");
  const code = document.querySelector("#account-code");
  const submit = document.querySelector("#account-submit");
  const modeToggle = document.querySelector("#account-mode-toggle");
  const forgot = document.querySelector("#account-forgot");
  const sessionPanel = document.querySelector("#account-session");
  const sessionEmail = document.querySelector("#account-session-email");
  const signOut = document.querySelector("#account-sign-out");
  const cloudSave = document.querySelector("#account-cloud-save");
  const cloudManage = document.querySelector("#account-cloud-manage");
  const message = document.querySelector("#account-message");
  let mode = "sign-in";
  let busy = false;
  let awaitingCode = false;

  const t = key => translate(getLocale(), key);
  const setMessage = value => { message.textContent = value; };

  function renderMode() {
    const recovery = mode === "recovery";
    const signUp = mode === "sign-up";
    email.disabled = awaitingCode;
    passwordRow.hidden = awaitingCode;
    confirmRow.hidden = awaitingCode || (!signUp && !recovery);
    confirmPassword.required = !confirmRow.hidden;
    password.required = !awaitingCode;
    password.minLength = 12;
    password.autocomplete = signUp || recovery ? "new-password" : "current-password";
    codeRow.hidden = !awaitingCode;
    code.required = awaitingCode;
    submit.textContent = t(awaitingCode ? "accountVerifyCode" : recovery ? "accountSubmitReset" : signUp ? "accountSubmitSignUp" : "accountSubmitSignIn");
    modeToggle.textContent = t(awaitingCode || signUp || recovery ? "accountBackToSignIn" : "accountModeSignUp");
    forgot.hidden = awaitingCode || signUp || recovery;
  }

  function selectMode(next) {
    mode = next;
    awaitingCode = false;
    password.value = "";
    confirmPassword.value = "";
    code.value = "";
    setMessage("");
    renderMode();
  }

  function renderSession(state) {
    const signedIn = state.status === "signed-in";
    const guest = state.status === "guest";
    button.dataset.authState = signedIn ? "signed-in" : guest ? "guest" : state.status;
    button.setAttribute("aria-label", t(signedIn ? "accountSignedInAria" : "accountGuestAria"));
    button.title = t(signedIn ? "accountSignedInTooltip" : "accountGuestTooltip");
    sessionPanel.hidden = !signedIn;
    form.hidden = signedIn;
    if (signedIn) {
      sessionEmail.textContent = state.user.email ?? "";
      setMessage("");
    } else if (state.status === "unavailable") {
      setMessage(t("accountUnavailable"));
    }
    cloudSave.hidden = state.status !== "signed-in";
    cloudManage.hidden = state.status !== "signed-in";
    onAccountState(state);
  }

  function renderState(state) { renderSession(state); }

  button.addEventListener("click", () => {
    selectMode("sign-in");
    renderSession(account.state);
    dialog.showModal();
    if (account.state.status !== "signed-in") email.focus();
  });
  dialog.querySelector("[data-account-close]").addEventListener("click", () => dialog.close());
  modeToggle.addEventListener("click", () => {
    selectMode(awaitingCode || mode !== "sign-in" ? "sign-in" : "sign-up");
    email.focus();
  });
  forgot.addEventListener("click", () => {
    selectMode("recovery");
    email.focus();
  });
  signOut.addEventListener("click", async () => {
    setBusy(true);
    try {
      await account.signOut();
      selectMode("sign-in");
      setMessage(t("accountSignedOut"));
    } catch (error) { setMessage(error.message || t("accountAuthError")); }
    finally { setBusy(false); }
  });
  cloudSave.addEventListener("click", () => onCloudSave());
  cloudManage.addEventListener("click", () => onCloudManage());
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    const passwordValue = password.value;
    if (!awaitingCode && mode !== "sign-in" && passwordValue !== confirmPassword.value) {
      setMessage(t("accountPasswordsMismatch"));
      confirmPassword.focus();
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (awaitingCode) {
        const result = await account.verify(code.value);
        selectMode("sign-in");
        if (result === "signed-in") renderSession(account.state);
        else {
          setMessage(t(result === "registered" ? "accountRegistrationVerified" : "accountPasswordUpdated"));
          password.focus();
        }
      } else {
        const intent = mode === "sign-up" ? "register" : mode === "recovery" ? "reset-password" : "sign-in";
        await account.begin(intent, email.value, passwordValue);
        awaitingCode = true;
        password.value = "";
        confirmPassword.value = "";
        renderMode();
        setMessage(t("accountCodeSent"));
        code.focus();
      }
    } catch (error) {
      const messageKey = {
        "invalid-or-expired-email-code": "accountInvalidCode",
        "invalid-product-credentials": "accountInvalidCredentials",
        "wait-and-retry": "accountRetryLater"
      }[error.message];
      setMessage(t(messageKey || "accountAuthError"));
    }
    finally { setBusy(false); }
  });

  function setBusy(value) {
    busy = value;
    submit.disabled = value;
    signOut.disabled = value;
    modeToggle.disabled = value;
    forgot.disabled = value;
    button.disabled = value;
  }

  renderMode();
  renderState(account.state);
  return Object.freeze({
    renderState,
    refreshLocale: renderMode,
    dispose() {
      account.dispose();
    }
  });
}
