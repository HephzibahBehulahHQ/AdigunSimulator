const round = (value) => Number(value).toFixed(6).replace(/0+$/,"").replace(/\\.$/,"");
const gerberCoord = (value) => String(Math.round(value * 1_000_000)).padStart(10,"0");
const pointEqual = (a,b) => Math.hypot(a.xMm-b[0],a.yMm-b[1]) <= 0.001;

export function validatePcbFabrication(project) {
  const errors = [];
  const warnings = [];
  const pcb = project?.pcbFabrication;
  if (!pcb || typeof pcb !== "object") return { status:"blocked", errors:["Project has no PCB fabrication data."], warnings };
  const { board, parts, pads, routes } = pcb;
  if (!board || !Number.isFinite(board.widthMm) || !Number.isFinite(board.heightMm) || board.widthMm <= 0 || board.heightMm <= 0) errors.push("Board dimensions must be positive millimetres.");
  if (!Array.isArray(board?.copperLayers) || board.copperLayers.length !== 1 || board.copperLayers[0] !== "F.Cu") errors.push("This exporter supports a single F.Cu copper layer only.");
  if (!Array.isArray(parts) || !Array.isArray(pads) || !Array.isArray(routes)) return { status:"blocked", errors:[...errors,"Parts, pads, and routes must be arrays."], warnings };
  const components = new Map((project.components ?? []).map((component) => [component.instanceId,component]));
  const knownNets = new Map((project.nets ?? []).map((net) => [net.id,new Set(net.endpoints ?? [])]));
  const partIds = new Set();
  for (const part of parts) {
    if (!components.has(part.instanceId)) errors.push(`PCB part ${part.reference ?? part.instanceId} has no matching project component.`);
    if (partIds.has(part.instanceId)) errors.push(`PCB component ${part.reference ?? part.instanceId} is listed more than once.`);
    partIds.add(part.instanceId);
    if (!part.footprint || !["through-hole","smd"].includes(part.technology)) errors.push(`PCB part ${part.reference ?? part.instanceId} needs a package and supported technology.`);
  }
  const padKeys = new Set();
  for (const pad of pads) {
    const key = `${pad.instanceId}:${pad.pin}`;
    if (!components.has(pad.instanceId) || !partIds.has(pad.instanceId)) errors.push(`Pad ${pad.reference ?? key} has no listed PCB component.`);
    if (padKeys.has(key)) errors.push(`Pad ${pad.reference ?? key} is duplicated.`);
    padKeys.add(key);
    if (!knownNets.get(pad.netId)?.has(key)) errors.push(`Pad ${pad.reference ?? key} is not attached to declared net ${pad.netId}.`);
    if (![pad.xMm,pad.yMm].every(Number.isFinite) || pad.xMm < 0 || pad.yMm < 0 || pad.xMm > board.widthMm || pad.yMm > board.heightMm) errors.push(`Pad ${pad.reference ?? key} is outside the board outline.`);
    if (pad.technology === "through-hole" && (!Number.isFinite(pad.drillMm) || pad.drillMm <= 0 || pad.drillMm >= pad.diameterMm)) errors.push(`Through-hole pad ${pad.reference ?? key} needs a valid drill diameter.`);
    if (pad.technology === "smd" && (![pad.widthMm,pad.heightMm].every(Number.isFinite) || pad.widthMm <= 0 || pad.heightMm <= 0)) errors.push(`SMD pad ${pad.reference ?? key} needs positive width and height.`);
  }
  for (const component of project.components ?? []) {
    const isPhysical = partIds.has(component.instanceId);
    if (isPhysical) for (const pin of (project.nets ?? []).flatMap((net) => net.endpoints ?? []).filter((endpoint) => endpoint.startsWith(component.instanceId + ":")).map((endpoint) => endpoint.split(":")[1])) {
      if (!padKeys.has(`${component.instanceId}:${pin}`)) errors.push(`PCB footprint for ${component.reference} is missing electrical pin ${pin}.`);
    }
  }
  const clearance = Number(board.minimumClearanceMm);
  if (!Number.isFinite(clearance) || clearance <= 0) errors.push("Minimum copper clearance must be a positive millimetre value.");
  const padRadius = (pad) => pad.technology === "through-hole" ? pad.diameterMm/2 : Math.hypot(pad.widthMm/2,pad.heightMm/2);
  for (let i=0;i<pads.length;i++) for (let j=i+1;j<pads.length;j++) {
    const a=pads[i],b=pads[j];
    if (a.netId===b.netId) continue;
    const spacing=Math.hypot(a.xMm-b.xMm,a.yMm-b.yMm)-padRadius(a)-padRadius(b);
    if (spacing + 1e-9 < clearance) errors.push(`Copper pads ${a.reference}.${a.number} and ${b.reference}.${b.number} violate ${round(clearance)} mm clearance.`);
  }
  for (const route of routes) {
    if (!knownNets.has(route.netId) || !Array.isArray(route.pointsMm) || route.pointsMm.length < 2 || !Number.isFinite(route.widthMm) || route.widthMm <= 0) { errors.push(`Route for ${route.netId ?? "unknown net"} is incomplete.`); continue; }
    if (route.layer !== "F.Cu") errors.push(`Route ${route.netId} is not on the supported F.Cu layer.`);
    for (const [x,y] of route.pointsMm) if (![x,y].every(Number.isFinite) || x < 0 || y < 0 || x > board.widthMm || y > board.heightMm) errors.push(`Route ${route.netId} leaves the board outline.`);
    const endpoints = pads.filter((pad) => pad.netId===route.netId);
    if (!endpoints.some((pad) => pointEqual(pad,route.pointsMm[0])) || !endpoints.some((pad) => pointEqual(pad,route.pointsMm.at(-1)))) errors.push(`Route ${route.netId} must terminate on pads belonging to that net.`);
  }
  if (!routes.length) errors.push("At least one routed copper net is required.");
  return { status:errors.length ? "failed" : "passed", errors, warnings, checks:["board bounds","single copper layer","declared net-to-pad mapping","connected routed endpoints","inter-net pad clearance","through-hole drill dimensions"] };
}

function gerberFile(pcb, { outline=false }={}) {
  const apertures = new Map();
  const apertureCode = (key, definition) => { if (!apertures.has(key)) apertures.set(key,{code:10+apertures.size,definition}); return apertures.get(key).code; };
  const padDraws = outline ? [] : pcb.pads.map((pad) => {
    const key=pad.technology==="through-hole" ? `C:${round(pad.diameterMm)}` : `R:${round(pad.widthMm)}x${round(pad.heightMm)}`;
    const definition=pad.technology==="through-hole" ? `C,${round(pad.diameterMm)}` : `R,${round(pad.widthMm)}X${round(pad.heightMm)}`;
    return { pad, code:apertureCode(key,definition) };
  });
  const traceDraws = outline ? [] : pcb.routes.map((route) => ({route,code:apertureCode(`C:${round(route.widthMm)}`,`C,${round(route.widthMm)}`)}));
  const outlineCode = outline ? apertureCode("C:0.100","C,0.100") : null;
  const lines=["G04 AdigunSimulator single-sided educational output; verify before manufacture*","%FSLAX46Y46*%","%MOMM*%","%IPPOS*%"];
  for (const {code,definition} of apertures.values()) lines.push(`%ADD${code}${definition}*%`);
  if (outline) {
    lines.push(`D${outlineCode}*`,`X0000000000Y0000000000D02*`,`X${gerberCoord(pcb.board.widthMm)}Y0000000000D01*`,`X${gerberCoord(pcb.board.widthMm)}Y${gerberCoord(pcb.board.heightMm)}D01*`,`X0000000000Y${gerberCoord(pcb.board.heightMm)}D01*`,`X0000000000Y0000000000D01*`);
  } else {
    for (const {route,code} of traceDraws) {
      lines.push(`D${code}*`);
      route.pointsMm.forEach(([x,y],index)=>lines.push(`X${gerberCoord(x)}Y${gerberCoord(y)}D${index===0?"02":"01"}*`));
    }
    for (const {pad,code} of padDraws) lines.push(`D${code}*`,`X${gerberCoord(pad.xMm)}Y${gerberCoord(pad.yMm)}D03*`);
  }
  lines.push("M02*");
  return lines.join("\n")+"\n";
}

function drillFile(pcb) {
  const holes=pcb.pads.filter((pad)=>pad.technology==="through-hole").sort((a,b)=>a.drillMm-b.drillMm||a.reference.localeCompare(b.reference)||String(a.number).localeCompare(String(b.number)));
  const sizes=[...new Set(holes.map((pad)=>pad.drillMm))];
  const lines=["M48","; AdigunSimulator educational Excellon drill output","METRIC,TZ"];
  sizes.forEach((size,index)=>lines.push(`T${String(index+1).padStart(2,"0")}C${round(size)}`));
  lines.push("%");
  holes.forEach((pad)=>lines.push(`T${String(sizes.indexOf(pad.drillMm)+1).padStart(2,"0")}`,`X${gerberCoord(pad.xMm)}Y${gerberCoord(pad.yMm)}`));
  lines.push("M30");
  return lines.join("\n")+"\n";
}

function bomFile(project, pcb) {
  const rows=[["Designator","Quantity","Value","Footprint","Technology","Status"]];
  for(const part of [...pcb.parts].sort((a,b)=>a.reference.localeCompare(b.reference))){
    const component=project.components.find((item)=>item.instanceId===part.instanceId);
    rows.push([part.reference,"1",component.value,part.footprint,part.technology,"Generic footprint; verify selected real part"]);
  }
  return rows.map((row)=>row.map((cell)=>`"${String(cell).replaceAll('"','""')}"`).join(",")).join("\r\n")+"\r\n";
}

export function exportPcbFabrication(project) {
  const drc=validatePcbFabrication(project);
  if(drc.status!=="passed")return {status:"blocked",drc,files:{}};
  const pcb=project.pcbFabrication;
  return {status:"passed",drc,files:{
    "board-F_Cu.gbr":gerberFile(pcb),
    "board-Edge_Cuts.gbr":gerberFile(pcb,{outline:true}),
    "board-PTH.drl":drillFile(pcb),
    "BOM.csv":bomFile(project,pcb)
  }};
}
