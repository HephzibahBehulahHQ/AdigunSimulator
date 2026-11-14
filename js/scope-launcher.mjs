export function hasCurrentScopeAnalysis(state) {
  return Boolean(state?.lastAnalysis && state.lastAnalysisProjectKey && state.lastAnalysisProjectKey === JSON.stringify(state.project));
}

export function createScopeLauncher({ document, canvas, onOpen }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "scope-launcher";
  button.hidden = true;
  button.setAttribute("aria-label", "Open oscilloscope");
  button.title = "Open oscilloscope";
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h4l2-7 4 14 3-9 2 4h5" /></svg>';
  button.addEventListener("pointerdown", (event) => event.stopPropagation());
  button.addEventListener("click", (event) => { event.stopPropagation(); onOpen(); });
  canvas.append(button);
  return {
    update(state, label) {
      button.hidden = !hasCurrentScopeAnalysis(state);
      button.setAttribute("aria-label", label);
      button.title = label;
    },
    remove() { button.remove(); }
  };
}
