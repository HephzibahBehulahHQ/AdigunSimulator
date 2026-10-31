const EPSILON = 0.001;
const pointDistance = (a, b) => Math.hypot(a[0] - b.xMm, a[1] - b.yMm);
const onNet = (project, netId, instanceId, pin) => Boolean(project.nets.find((net) => net.id === netId)?.endpoints.includes(instanceId + ":" + pin));
const componentByRef = (project, ref) => project.components.find((item) => item.reference === ref);
const padByPin = (project, ref, pin) => project.pcbFabrication?.pads?.find((pad) => pad.reference === ref && pad.pin === pin);

export function reviewAudioAmplifierPcb(project) {
  const checks = [];
  const check = (id, pass, detail) => checks.push({ id, status: pass ? "pass" : "fail", detail });
  const fab = project?.pcbFabrication;
  if (!fab) return { status: "failed", checks: [{ id: "fabrication-data", status: "fail", detail: "PCB fabrication data is missing." }] };

  const classes = new Map((fab.netClasses ?? []).map((item) => [item.id, item]));
  const routeByNet = new Map((fab.routes ?? []).map((route) => [route.netId, route]));
  const routeNetIds = (fab.routes ?? []).map((route) => route.netId);
  const declaredClassNets = (fab.netClasses ?? []).flatMap((item) => item.netIds ?? []);
  check("net-class-coverage", new Set(declaredClassNets).size === declaredClassNets.length && [...new Set(routeNetIds)].every((id) => declaredClassNets.includes(id)) && declaredClassNets.every((id) => routeNetIds.includes(id)), "Each routed net is covered exactly once by a declared class.");
  check("route-class-widths", (fab.routes ?? []).every((route) => {
    const cls = classes.get(route.netClassId);
    return Boolean(cls && cls.netIds.includes(route.netId) && route.widthMm >= cls.traceWidthMm);
  }), "Every route uses its net class and meets its declared minimum width.");

  const groundRoute = routeByNet.get("GND");
  const star = fab.groundRoutingReview?.starPointMm;
  check("star-point", Array.isArray(star) && groundRoute?.pointsMm?.some((point) => Math.hypot(point[0] - star[0], point[1] - star[1]) <= EPSILON), "Declared star point occurs on the ground route.");
  check("ground-review-checklist", fab.groundRoutingReview?.checklist?.length === 5 && fab.groundRoutingReview.checklist.every((item) => item.status === "pass"), "All five grounding and routing review items pass.");

  const requiredGround = [["V1","-"],["V2","-"],["U1","GND"],["U1","MINUS_INPUT"],["C1","-"],["C2","1"],["C5","-"],["C7","2"],["J1","GND"],["J2","SPK-"]];
  check("ground-return-net", requiredGround.every(([ref,pin]) => {
    const part = componentByRef(project, ref);
    return Boolean(part && onNet(project, "GND", part.instanceId, pin));
  }), "Supply, input, amplifier, decoupling, Zobel and speaker returns share GND.");

  const lm = componentByRef(project, "U1");
  const expectedPins = ["GAIN1","MINUS_INPUT","PLUS_INPUT","GND","VOUT","VS","BYPASS","GAIN2"];
  check("lm386-pin-map", expectedPins.every((pin, index) => {
    const pad = padByPin(project, "U1", pin);
    return Boolean(pad && String(pad.number) === String(index + 1));
  }), "LM386 DIP pin numbering matches the TI device pin map.");

  const c2 = componentByRef(project, "C2");
  const c2Gnd = padByPin(project, "C2", "1");
  const c2Vcc = padByPin(project, "C2", "2");
  const vs = padByPin(project, "U1", "VS");
  const ampGnd = padByPin(project, "U1", "GND");
  check("supply-decoupling-placement", Boolean(c2 && c2Gnd && c2Vcc && vs && ampGnd &&
    onNet(project, "GND", c2.instanceId, "1") && onNet(project, "VCC", c2.instanceId, "2") &&
    pointDistance([c2Vcc.xMm,c2Vcc.yMm], vs) <= 2.5 && pointDistance([c2Gnd.xMm,c2Gnd.yMm], ampGnd) <= 5), "C2 polarity-independent terminals connect VCC/GND and sit near U1 supply and ground pins.");

  const c6 = componentByRef(project, "C6");
  const speaker = componentByRef(project, "J2");
  const r1 = componentByRef(project, "R1");
  const c7 = componentByRef(project, "C7");
  check("output-coupling-and-speaker", Boolean(c6 && speaker &&
    onNet(project, "AMP_OUT", c6.instanceId, "+") &&
    onNet(project, "SPK_POS", c6.instanceId, "-") &&
    onNet(project, "SPK_POS", speaker.instanceId, "SPK+") &&
    onNet(project, "GND", speaker.instanceId, "SPK-")), "Output coupling capacitor separates the amplifier output from the speaker terminal.");
  check("zobel-network", Boolean(r1 && c7 &&
    onNet(project, "AMP_OUT", r1.instanceId, "1") &&
    onNet(project, "ZOBEL", r1.instanceId, "2") &&
    onNet(project, "ZOBEL", c7.instanceId, "1") &&
    onNet(project, "GND", c7.instanceId, "2")), "Series Zobel resistor/capacitor returns to GND.");

  const failed = checks.some((item) => item.status !== "pass");
  return {
    status: failed ? "failed" : "passed",
    checks,
    disclaimer: "Grounding and routing review checklist only; no waveform, gain, clipping, THD, speaker-power, thermal, EMC, manufacturing or production qualification is performed."
  };
}

export function createGroundingChecklistReport(project) {
  const result = reviewAudioAmplifierPcb(project);
  const rows = [["Check","Status","Detail"], ...result.checks.map((item) => [item.id,item.status,item.detail])];
  rows.push(["Scope","informational",result.disclaimer]);
  return rows.map((row) => row.map((value) => '"' + String(value).replaceAll('"','""') + '"').join(",")).join("\r\n") + "\r\n";
}
