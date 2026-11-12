import { addComponent, connectPins, findLibraryPart, validateProject } from "./core.mjs";
import { LOGIC_GATES as GATE_DEFINITIONS } from "./logic-gates.mjs";

const LOGIC_GATES = new Set(Object.keys(GATE_DEFINITIONS));
const LOGIC_OUTPUTS = new Set(["Y", "Q", "QBAR", "OUT"]);

function projectFingerprint(project) {
  return JSON.stringify(project);
}

function endpointIndex(project) {
  const index = new Map();
  for (const net of project?.nets ?? []) for (const endpoint of net.endpoints ?? []) index.set(endpoint, net.id);
  return index;
}

export function explainComponentWiring(project, target) {
  const component = (project?.components ?? []).find((item) => item.instanceId === target || item.reference === target);
  if (!component) return { ok: false, error: "Select or hover over a component in the current project first." };
  const part = findLibraryPart(component.libraryId);
  if (!part) return { ok: false, error: "This part is not in the checked-in library; its identity and wiring cannot be verified." };
  const endpointNets = endpointIndex(project);
  const wiring = part.pins.map((pin) => {
    const netId = endpointNets.get(`${component.instanceId}:${pin}`);
    const net = (project.nets ?? []).find((item) => item.id === netId);
    const peers = (net?.endpoints ?? []).filter((endpoint) => !endpoint.startsWith(`${component.instanceId}:`)).map((endpoint) => {
      const [instanceId, peerPin] = endpoint.split(":");
      const peer = project.components.find((item) => item.instanceId === instanceId);
      return peer ? `${peer.reference}.${peerPin}` : endpoint;
    });
    return { pin, netId: netId ?? null, peers };
  });
  const connected = wiring.filter((item) => item.netId).map((item) => `${item.pin} → ${item.netId}${item.peers.length ? ` (${item.peers.join(", ")})` : " (no other endpoint)"}`);
  const open = wiring.filter((item) => !item.netId).map((item) => item.pin);
  return { ok: true, reference: component.reference, type: part.type, configuredValue: component.value || "Not set", wiring, answer: `${component.reference} is a ${part.type}${component.value ? ` configured as ${component.value}` : ""}. ${connected.length ? `Connected pins: ${connected.join("; ")}.` : "No pins are connected."} ${open.length ? `Unconnected pins: ${open.join(", ")}.` : "All library pins are connected."}`, scope: "Current native project nets and checked-in component library only." };
}

export function analyzeBotCanvas(project, { goal = "", now = Date.now(), unconnectedSince = {} } = {}) {
  if (!project || !Array.isArray(project.components) || !Array.isArray(project.nets)) return [];
  const endpointNets = endpointIndex(project);
  const findings = [];
  for (const component of project.components) {
    const part = findLibraryPart(component.libraryId);
    if (!part) continue;
    const connectedPins = part.pins.filter((pin) => endpointNets.has(`${component.instanceId}:${pin}`));
    const missingRails = ["VCC", "GND"].filter((pin) => part.pins.includes(pin) && !endpointNets.has(`${component.instanceId}:${pin}`));
    if (missingRails.length) findings.push({ id: `missing-supply-pins:${component.instanceId}`, kind: "missing-supply-pins", reference: component.reference, pins: missingRails.join(" and "), action: null, priority: 80, title: `${component.reference} has unconnected supply pins`, message: `The native project has no net on ${missingRails.join(" and ")}. What supply and ground did you intend?`, detail: "The Bot cannot choose a supply voltage or infer a ground connection. Use the component wiring controls, then validate the project." });
    if (LOGIC_GATES.has(component.libraryId)) {
      const inputPins = ["A", "B"].filter((pin) => part.pins.includes(pin));
      const openInputs = inputPins.filter((pin) => !endpointNets.has(`${component.instanceId}:${pin}`));
      if (openInputs.length === 1 && inputPins.length === 2) {
        findings.push({ id: `missing-gate-input:${component.instanceId}:${openInputs[0]}`, kind: "missing-gate-input", reference: component.reference, pin: openInputs[0], action: "add-input-switch", priority: 90, title: `${component.reference} has an open ${openInputs[0]} input`, message: `One input of this two-input gate is wired and ${openInputs[0]} is open. Add a pushbutton at that input?`, detail: "The preview will add a pushbutton and connect one terminal to the selected gate input. Its other terminal remains open so you can choose the intended signal source; no logic level or circuit purpose is guessed." });
      }
      const outputPins = part.pins.filter((pin) => LOGIC_OUTPUTS.has(pin));
      for (const pin of outputPins.filter((name) => !endpointNets.has(`${component.instanceId}:${name}`))) {
        findings.push({ id: `unobserved-gate-output:${component.instanceId}:${pin}`, kind: "unobserved-gate-output", reference: component.reference, pin, action: "add-logic-probe", priority: 70, title: `${component.reference}.${pin} has no connected net`, message: `This gate output is not connected to another pin. Add a logic probe to observe it?`, detail: "An unloaded logic output is not automatically an electrical fault. The suggested probe only makes the output observable; it does not add a load or drive the net." });
      }
    }
    const placedAt = Number(unconnectedSince[component.instanceId]);
    if (connectedPins.length === 0 && Number.isFinite(placedAt) && now - placedAt >= 5000) {
      findings.push({ id: `unwired-component:${component.instanceId}`, kind: "unwired-component", reference: component.reference, action: null, priority: 40, title: `${component.reference} is still unwired`, message: `This part has had no connected pins for at least five seconds. What should it connect to?`, detail: "This is based on the part's current native-project net endpoints and the local placement timer. No circuit intent is inferred." });
    }
  }
  for (const net of project.nets) {
    const drivers = net.endpoints.map((endpoint) => {
      const [instanceId, pin] = endpoint.split(":");
      const component = project.components.find((item) => item.instanceId === instanceId);
      return component && LOGIC_GATES.has(component.libraryId) && LOGIC_OUTPUTS.has(pin) ? `${component.reference}.${pin}` : null;
    }).filter(Boolean);
    if (drivers.length > 1) findings.push({ id: `multiple-logic-drivers:${net.id}`, kind: "driver-conflict", net: net.id, drivers: drivers.join(" and "), action: null, priority: 100, title: `Net ${net.id} has multiple gate outputs`, message: `${drivers.join(" and ")} share one net. Review this possible output-driver conflict.`, detail: "The analyzer found more than one recognized logic-gate output pin on this exact native net. It does not infer whether the outputs are tri-stated." });
  }
  if (!goal.trim() && project.components.length >= 2) {
    const hasInputOutputChain = project.nets.some((net) => net.endpoints.length >= 2 && net.endpoints.some((endpoint) => endpoint.endsWith(":Y")) && net.endpoints.some((endpoint) => endpoint.endsWith(":IN")));
    if (!hasInputOutputChain) findings.push({ id: "project-goal-unclear", kind: "goal-question", action: "ask-goal", priority: 10, title: "What are you trying to build?", message: "I cannot identify a clear input-to-output path in the current wiring. What should this project do?", detail: "Your answer is kept only for this browser session and helps rank later grounded suggestions." });
  }
  return findings.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
}

export function buildBotSuggestionPreview(project, finding) {
  if (!finding?.id || !["add-input-switch", "add-logic-probe"].includes(finding.action)) return { ok: false, error: "This finding has no safe, supported canvas preview." };
  try {
    const baseFingerprint = projectFingerprint(project);
    let candidate;
    if (finding.action === "add-input-switch") {
      const target = project.components.find((item) => item.instanceId === finding.reference || item.reference === finding.reference);
      if (!target || !LOGIC_GATES.has(target.libraryId) || !["A", "B"].includes(finding.pin) || project.nets.some((net) => net.endpoints.includes(`${target.instanceId}:${finding.pin}`))) return { ok: false, error: "The target gate input is no longer open; refresh the live analysis." };
      candidate = addComponent(project, "input.pushbutton");
      const button = candidate.components.at(-1);
      candidate = connectPins(candidate, `${button.instanceId}:1`, `${target.instanceId}:${finding.pin}`);
    } else {
      const target = project.components.find((item) => item.reference === finding.reference);
      if (!target || !LOGIC_GATES.has(target.libraryId) || !LOGIC_OUTPUTS.has(finding.pin) || project.nets.some((net) => net.endpoints.includes(`${target.instanceId}:${finding.pin}`))) return { ok: false, error: "The target output changed; refresh the live analysis." };
      candidate = addComponent(project, "instrument.logic-probe");
      const probe = candidate.components.at(-1);
      candidate = connectPins(candidate, `${target.instanceId}:${finding.pin}`, `${probe.instanceId}:IN`);
    }
    const validation = validateProject(candidate);
    if (!validation.valid) return { ok: false, error: "The candidate did not pass native project validation.", validation };
    return { ok: true, findingId: finding.id, baseFingerprint, candidate, validation, summary: finding.action === "add-input-switch" ? "Adds a pushbutton wired to the previously open gate input; the other pushbutton terminal remains intentionally open." : "Adds a logic probe to the recognized gate output without attaching a load." };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "A preview could not be created." };
  }
}

export function applyBotSuggestionPreview(project, preview, { confirmed = false } = {}) {
  if (!confirmed) return { ok: false, applied: false, project, message: "No change made; explicit confirmation is required." };
  if (!preview?.ok || preview.baseFingerprint !== projectFingerprint(project)) return { ok: false, applied: false, project, message: "The preview is stale or invalid. The project was left unchanged." };
  const validation = validateProject(preview.candidate);
  if (!validation.valid) return { ok: false, applied: false, project, message: "The candidate no longer passes validation. The project was left unchanged.", validation };
  return { ok: true, applied: true, project: preview.candidate, message: "The reviewed preview was applied locally." };
}

export function createBotLiveCopilot({ onSuggestion, debounceMs = 650, rateLimitMs = 25000, dismissedMs = 90000, now = () => Date.now(), schedule = setTimeout, cancel = clearTimeout } = {}) {
  let enabled = true, timer = null, pending = null, goal = "", lastNoticeAt = -Infinity;
  const dismissed = new Map();
  function clear() { if (timer !== null) cancel(timer); timer = null; }
  function process() {
    timer = null;
    if (!enabled || !pending || pending.busy || pending.typing || pending.dragging) return;
    const current = now();
    for (const [id, expires] of dismissed) if (expires <= current) dismissed.delete(id);
    const findings = analyzeBotCanvas(pending.project, { goal, now: current, unconnectedSince: pending.unconnectedSince });
    const finding = findings.find((item) => !dismissed.has(item.id));
    if (!finding) { onSuggestion?.(null); return; }
    const delay = Math.max(0, rateLimitMs - (current - lastNoticeAt));
    if (delay > 0) { timer = schedule(process, delay); return; }
    lastNoticeAt = current;
    onSuggestion?.(finding);
  }
  function notify(project, context = {}) {
    pending = { project, busy: Boolean(context.busy), typing: Boolean(context.typing), dragging: Boolean(context.dragging), unconnectedSince: context.unconnectedSince ?? {} };
    clear();
    if (enabled && !pending.busy && !pending.typing && !pending.dragging) timer = schedule(process, debounceMs);
  }
  return {
    notify,
    setEnabled(value) { enabled = Boolean(value); clear(); if (!enabled) onSuggestion?.(null); else if (pending) notify(pending.project, pending); },
    setGoal(value) { goal = String(value ?? "").trim(); if (pending) notify(pending.project, pending); },
    dismiss(id) { if (id) dismissed.set(id, now() + dismissedMs); if (pending) notify(pending.project, pending); },
    getGoal() { return goal; },
    dispose() { clear(); pending = null; onSuggestion?.(null); }
  };
}
