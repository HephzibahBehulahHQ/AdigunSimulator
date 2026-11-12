export function createCloudProjectsUi({ document, account, store, translate, getLocale, getProject, onOpenDocument, onSaved = () => {} }) {
  const saveButton = document.querySelector("#account-cloud-save");
  const manageButton = document.querySelector("#account-cloud-manage");
  const saveDialog = document.querySelector("#cloud-save-dialog");
  const saveName = document.querySelector("#cloud-save-name");
  const saveMessage = document.querySelector("#cloud-save-message");
  const saveConfirm = document.querySelector("#cloud-save-confirm");
  const manager = document.querySelector("#cloud-projects-dialog");
  const projectPicker = document.querySelector("#cloud-project-picker");
  const revisionPicker = document.querySelector("#cloud-revision-picker");
  const managerMessage = document.querySelector("#cloud-projects-message");
  const openCurrentButton = document.querySelector("#cloud-open-current");
  const openRevisionButton = document.querySelector("#cloud-open-revision");
  const deleteButton = document.querySelector("#cloud-delete-project");
  const deleteDialog = document.querySelector("#cloud-delete-dialog");
  const deleteName = document.querySelector("#cloud-delete-name");
  const deleteConfirm = document.querySelector("#cloud-delete-confirm");
  const closeButtons = [...document.querySelectorAll("[data-cloud-close]")];
  let selectedProject = null;
  let selectedRevision = null;
  let pendingDelete = null;
  let busy = false;

  const t = key => translate(getLocale(), key);
  const signedIn = () => account.state.status === "signed-in";
  const setBusy = value => {
    busy = value;
    saveConfirm.disabled = value;
    openCurrentButton.disabled = value || !selectedProject;
    openRevisionButton.disabled = value || !selectedRevision;
    deleteButton.disabled = value || !selectedProject;
    deleteConfirm.disabled = value;
  };
  const setMessage = (node, key) => { node.textContent = t(key); };
  const ensureSignedIn = () => {
    if (!signedIn()) throw new Error(t("cloudSignInRequired"));
  };
  const closeDialogs = () => {
    for (const dialog of [saveDialog, manager, deleteDialog]) if (dialog.open) dialog.close();
  };

  function renderProjectOptions(records) {
    projectPicker.replaceChildren();
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = t(records.length ? "cloudChooseProject" : "cloudNoProjects");
    projectPicker.append(empty);
    for (const record of records) {
      const option = document.createElement("option");
      option.value = record.id;
      option.textContent = `${record.name} · v${record.version} · ${new Date(record.updated_at).toLocaleString()}`;
      option.dataset.name = record.name;
      projectPicker.append(option);
    }
    selectedProject = null;
    selectedRevision = null;
    revisionPicker.replaceChildren();
    openCurrentButton.disabled = true;
    openRevisionButton.disabled = true;
    deleteButton.disabled = true;
  }

  async function refresh() {
    ensureSignedIn();
    setBusy(true);
    setMessage(managerMessage, "cloudLoading");
    try {
      const records = await store.list();
      renderProjectOptions(records);
      setMessage(managerMessage, records.length ? "cloudProjectsLoaded" : "cloudNoProjects");
    } catch { setMessage(managerMessage, "cloudRequestFailed"); }
    finally { setBusy(false); }
  }

  async function chooseProject() {
    selectedProject = projectPicker.value || null;
    selectedRevision = null;
    revisionPicker.replaceChildren();
    openCurrentButton.disabled = busy || !selectedProject;
    openRevisionButton.disabled = true;
    deleteButton.disabled = busy || !selectedProject;
    if (!selectedProject) return;
    setBusy(true);
    try {
      const revisions = await store.revisions(selectedProject);
      for (const revision of revisions) {
        const option = document.createElement("option");
        option.value = revision.id;
        option.textContent = `v${revision.version} · ${new Date(revision.created_at).toLocaleString()}`;
        revisionPicker.append(option);
      }
      selectedRevision = revisionPicker.value || null;
      setMessage(managerMessage, revisions.length ? "cloudVersionsLoaded" : "cloudNoRevisions");
    } catch { setMessage(managerMessage, "cloudRequestFailed"); }
    finally { setBusy(false); openCurrentButton.disabled = !selectedProject; openRevisionButton.disabled = !selectedRevision; deleteButton.disabled = !selectedProject; }
  }

  function openSaveDialog() {
    try { ensureSignedIn(); }
    catch { setMessage(saveMessage, "cloudSignInRequired"); return; }
    saveMessage.textContent = "";
    saveName.textContent = String(getProject()?.metadata?.name ?? "");
    saveDialog.showModal();
  }

  saveConfirm.addEventListener("click", async event => {
    event.preventDefault();
    if (busy) return;
    try {
      ensureSignedIn();
      setBusy(true);
      const saved = await store.save(getProject());
      onSaved(saved);
      setMessage(saveMessage, "cloudProjectSaved");
    } catch (error) {
      saveMessage.textContent = error?.message === "This project exceeds the cloud save size limit."
        ? t("cloudSizeLimit")
        : error?.message === "Cloud project names must contain 1 to 100 characters."
          ? t("cloudNameLimit")
          : error?.message?.includes("project limit")
            ? t("cloudProjectLimit")
            : t("cloudRequestFailed");
    } finally { setBusy(false); }
  });

  function openManager() {
    try { ensureSignedIn(); }
    catch { setMessage(managerMessage, "cloudSignInRequired"); return; }
    renderProjectOptions([]);
    setMessage(managerMessage, "cloudLoading");
    manager.showModal();
    void refresh();
  }
  saveButton.addEventListener("click", openSaveDialog);
  manageButton.addEventListener("click", openManager);

  document.querySelector("#cloud-refresh").addEventListener("click", () => { void refresh(); });
  projectPicker.addEventListener("change", () => { void chooseProject(); });
  revisionPicker.addEventListener("change", () => {
    selectedRevision = revisionPicker.value || null;
    openRevisionButton.disabled = busy || !selectedRevision;
  });

  openCurrentButton.addEventListener("click", async () => {
    if (!selectedProject || busy) return;
    setBusy(true);
    try {
      ensureSignedIn();
      const record = await store.get(selectedProject);
      if (!record) return setMessage(managerMessage, "cloudProjectMissing");
      await onOpenDocument(record.data, { source: "cloud", version: record.version });
    } catch { setMessage(managerMessage, "cloudRequestFailed"); }
    finally { setBusy(false); }
  });

  openRevisionButton.addEventListener("click", async () => {
    if (!selectedProject || !selectedRevision || busy) return;
    setBusy(true);
    try {
      ensureSignedIn();
      const versions = await store.revisions(selectedProject);
      const record = versions.find(item => item.id === selectedRevision);
      if (!record) return setMessage(managerMessage, "cloudProjectMissing");
      await onOpenDocument(record.data, { source: "cloud-revision", version: record.version });
    } catch { setMessage(managerMessage, "cloudRequestFailed"); }
    finally { setBusy(false); }
  });

  deleteButton.addEventListener("click", () => {
    if (!selectedProject) return;
    pendingDelete = selectedProject;
    deleteName.textContent = projectPicker.selectedOptions?.[0]?.dataset?.name ?? "";
    deleteDialog.showModal();
  });

  deleteConfirm.addEventListener("click", async event => {
    event.preventDefault();
    if (!pendingDelete || busy) return;
    setBusy(true);
    try {
      ensureSignedIn();
      await store.remove(pendingDelete);
      pendingDelete = null;
      if (deleteDialog.open) deleteDialog.close();
      setMessage(managerMessage, "cloudProjectDeleted");
      await refresh();
    } catch { setMessage(managerMessage, "cloudRequestFailed"); }
    finally { setBusy(false); }
  });

  for (const button of closeButtons) button.addEventListener("click", () => button.closest("dialog")?.close());

  return Object.freeze({
    openSaveDialog,
    openManager,
    renderState(state) {
      if (state.status !== "signed-in") closeDialogs();
    },
    dispose() {
      closeDialogs();
    }
  });
}
