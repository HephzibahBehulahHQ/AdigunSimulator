export function createAccountUi({ document, account, translate, getLocale, onCloudSave = () => {}, onCloudManage = () => {}, onAccountState = () => {} }) {
  const button = document.querySelector("#account-status");
  const dialog = document.querySelector("#account-dialog");
  const form = document.querySelector("#account-form");
  const email = document.querySelector("#account-email");
  const password = document.querySelector("#account-password");
  const passwordRow = document.querySelector("#account-password-row");
  const confirmRow = document.querySelector("#account-password-confirm-row");
  const confirmPassword = document.querySelector("#account-password-confirm");
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

  const t = key => translate(getLocale(), key);
  const setMessage = value => { message.textContent = value; };

  function renderMode() {
    const recovery = mode === "recovery";
    const passwordUpdate = mode === "password-recovery";
    const signUp = mode === "sign-up";
    passwordRow.hidden = recovery;
    confirmRow.hidden = !(signUp || passwordUpdate);
    confirmPassword.required = signUp || passwordUpdate;
    password.required = !recovery;
    password.autocomplete = passwordUpdate ? "new-password" : signUp ? "new-password" : "current-password";
    submit.textContent = t(passwordUpdate ? "accountSubmitUpdate" : recovery ? "accountSubmitReset" : signUp ? "accountSubmitSignUp" : "accountSubmitSignIn");
    modeToggle.hidden = passwordUpdate;
    modeToggle.textContent = t(signUp || recovery ? "accountBackToSignIn" : "accountModeSignUp");
    forgot.hidden = signUp || recovery || passwordUpdate;
    email.disabled = passwordUpdate;
    if (passwordUpdate) email.value = account.state.user?.email ?? email.value;
  }

  function renderSession(state) {
    const passwordUpdate = mode === "password-recovery";
    const signedIn = state.status === "signed-in" && !passwordUpdate;
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

  function renderState(state) {
    if (state.event === "PASSWORD_RECOVERY") mode = "password-recovery";
    renderSession(state);
    if (mode !== "password-recovery" || state.status !== "signed-in") return;
    sessionPanel.hidden = true;
    form.hidden = false;
    email.disabled = true;
    if (!dialog.open) dialog.showModal();
    renderMode();
    password.focus();
  }

  button.addEventListener("click", () => {
    setMessage("");
    mode = "sign-in";
    renderMode();
    renderSession(account.state);
    dialog.showModal();
    if (account.state.status !== "signed-in") email.focus();
  });
  dialog.querySelector("[data-account-close]").addEventListener("click", () => dialog.close());
  modeToggle.addEventListener("click", () => {
    mode = mode === "sign-up" || mode === "recovery" ? "sign-in" : "sign-up";
    setMessage("");
    renderMode();
    if (mode === "sign-in") password.focus(); else email.focus();
  });
  forgot.addEventListener("click", () => {
    mode = "recovery";
    setMessage("");
    renderMode();
    email.focus();
  });
  signOut.addEventListener("click", async () => {
    setBusy(true);
    try {
      await account.signOut();
      mode = "sign-in";
      setMessage(t("accountSignedOut"));
      renderMode();
    } catch (error) { setMessage(error.message || t("accountAuthError")); }
    finally { setBusy(false); }
  });
  cloudSave.addEventListener("click", () => onCloudSave());
  cloudManage.addEventListener("click", () => onCloudManage());
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    const emailValue = email.value.trim();
    const passwordValue = password.value;
    const confirmation = confirmPassword.value;
    if ((mode === "sign-up" || mode === "password-recovery") && passwordValue !== confirmation) {
      setMessage(t("accountPasswordsMismatch"));
      confirmPassword.focus();
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (mode === "sign-up") {
        const result = await account.signUp(emailValue, passwordValue);
        setMessage(result.confirmationRequired ? t("accountCheckEmail") : t("accountSignedIn").replace("{email}", result.user?.email ?? emailValue));
        if (result.confirmationRequired) form.reset();
      } else if (mode === "recovery") {
        await account.requestPasswordReset(emailValue);
        setMessage(t("accountResetEmailSent"));
      } else if (mode === "password-recovery") {
        await account.updatePassword(passwordValue);
        mode = "sign-in";
        setMessage(t("accountPasswordUpdated"));
        form.reset();
        renderMode();
      } else {
        const user = await account.signIn(emailValue, passwordValue);
        setMessage(t("accountSignedIn").replace("{email}", user?.email ?? emailValue));
      }
    } catch (error) { setMessage(error.message || t("accountAuthError")); }
    finally { setBusy(false); }
  });

  function setBusy(value) {
    busy = value;
    submit.disabled = value;
    signOut.disabled = value;
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
