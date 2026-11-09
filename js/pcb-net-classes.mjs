const label = value => typeof value === "string" && value.trim().length > 0 && value.length <= 64 && !/[\x00-\x1f\x7f]/.test(value);
const pairKey = (a,b) => JSON.stringify([a,b].sort());

// Accept both checked-in legacy formats. Identity is stable; names are display labels.
export function readPcbNetClasses(pcb, netIds) {
  const errors = [], classes = [], rules = [], aliases = new Map();
  const sourceClasses = pcb?.netClasses === undefined ? [] : pcb.netClasses, sourceRules = pcb?.netClassRules === undefined ? [] : pcb.netClassRules;
  if (!Array.isArray(sourceClasses) || !Array.isArray(sourceRules) || sourceClasses.length > 64 || sourceRules.length > 2080) return { errors: ["At most 64 net classes and 2080 class-pair rules are supported."], classes, rules };
  for (const source of sourceClasses) {
    const id = source?.id ?? source?.name, name = source?.name ?? source?.id;
    if (!label(id) || !label(name) || !Array.isArray(source.netIds) || source.netIds.some(net => typeof net !== "string" || !net || net === "NC" || netIds && !netIds.has(net)) || new Set(source.netIds).size !== source.netIds.length) { errors.push("Net classes need valid identifiers, labels and unique declared net IDs."); continue; }
    const width = source.minimumWidthMm ?? source.traceWidthMm;
    const clearance = source.minimumClearanceMm ?? source.clearanceMm;
    for (const key of ["minimumWidthMm", "traceWidthMm", "minimumClearanceMm", "clearanceMm"]) {
      if (Object.hasOwn(source,key) && (!Number.isFinite(source[key]) || (key.includes("Width") ? source[key] <= 0 : source[key] < 0))) errors.push(`Net class ${id} has an invalid ${key}.`);
    }
    for (const alias of new Set([id,name])) {
      if (aliases.has(alias)) errors.push(`Net class identity/label ${alias} is ambiguous.`);
      else aliases.set(alias,id);
    }
    classes.push({ id, name, netIds: [...source.netIds], minimumWidthMm: width, minimumClearanceMm: clearance, source });
  }
  const seen = new Set();
  for (const source of sourceRules) {
    const a = aliases.get(source?.classA), b = aliases.get(source?.classB), clearance = source?.minimumClearanceMm ?? source?.clearanceMm;
    if (!a || !b || !Number.isFinite(clearance) || clearance < 0) { errors.push("Class-pair rules must name existing classes and a nonnegative millimetre clearance."); continue; }
    for (const key of ["minimumClearanceMm", "clearanceMm"]) if (Object.hasOwn(source,key) && (!Number.isFinite(source[key]) || source[key] < 0)) errors.push("Class-pair clearance values must be finite and nonnegative.");
    const key = pairKey(a,b);
    if (seen.has(key)) errors.push(`Class-pair rule ${a}/${b} is duplicated.`);
    seen.add(key); rules.push({ classA: a, classB: b, minimumClearanceMm: clearance, source });
  }
  return { classes, rules, errors };
}

function context(project) {
  const pcb = project?.pcbFabrication;
  if (!pcb?.board || !Array.isArray(project.nets) || !Array.isArray(pcb.routes)) return { errors: ["Create a board before editing net classes."] };
  return { pcb, ...readPcbNetClasses(pcb,new Set(project.nets.map(net=>net.id))) };
}
function finish(project, classes, rules) {
  const next = structuredClone(project), pcb = next.pcbFabrication;
  pcb.netClasses = classes; pcb.netClassRules = rules;
  const checked = readPcbNetClasses(pcb,new Set(next.nets.map(net=>net.id)));
  if (checked.errors.length) return { status: "blocked", errors: checked.errors };
  // Informational route tags follow membership; copper and native net identity do not change.
  for (const route of pcb.routes) {
    const member = checked.classes.find(item=>item.netIds.includes(route.netId));
    if (member) route.netClassId = member.id; else delete route.netClassId;
  }
  if (JSON.stringify(pcb) === JSON.stringify(project.pcbFabrication)) return { status: "unchanged", project };
  next.metadata = { ...next.metadata, updatedAt: new Date().toISOString() };
  return { status: "complete", project: next };
}

export function savePcbNetClass(project, input = {}) {
  const current = context(project);
  if (current.errors.length) return { status: "blocked", errors: current.errors };
  const existing = input.id ? current.classes.find(item=>item.id===input.id) : null;
  if (input.id && !existing) return { status: "blocked", errors: ["The selected class no longer exists."] };
  if (!label(input.name) || !Array.isArray(input.netIds) || !Number.isFinite(input.minimumWidthMm) || input.minimumWidthMm <= 0 || !Number.isFinite(input.minimumClearanceMm) || input.minimumClearanceMm < 0) return { status: "blocked", errors: ["Enter a class name, net membership, positive width and nonnegative clearance."] };
  const occupied = new Set(current.classes.flatMap(item=>[item.id,item.name]));
  let n=1; while (occupied.has(`class-${n}`)) n++;
  const id = existing?.id ?? `class-${n}`;
  const value = { ...existing?.source, id, name: input.name.trim(), netIds: [...input.netIds], minimumWidthMm: input.minimumWidthMm, minimumClearanceMm: input.minimumClearanceMm };
  if (Object.hasOwn(value,"traceWidthMm")) value.traceWidthMm = input.minimumWidthMm;
  if (Object.hasOwn(value,"clearanceMm")) value.clearanceMm = input.minimumClearanceMm;
  const classes = current.classes.map(item=>item.id===id ? value : { ...item.source, netIds: item.netIds.filter(net=>!input.netIds.includes(net)) });
  if (!existing) classes.push(value);
  // Normalize pair references before a display-name rename can invalidate an old alias.
  const rules = current.rules.map(rule=>({ ...rule.source, classA: rule.classA, classB: rule.classB }));
  const result = finish(project,classes,rules);
  return { ...result, classId: id };
}

export function removePcbNetClass(project, id) {
  const current = context(project);
  if (current.errors.length) return { status: "blocked", errors: current.errors };
  if (!current.classes.some(item=>item.id===id)) return { status: "blocked", errors: ["Select an existing class to remove."] };
  return finish(project,current.classes.filter(item=>item.id!==id).map(item=>item.source),current.rules.filter(rule=>rule.classA!==id && rule.classB!==id).map(rule=>({ ...rule.source, classA: rule.classA, classB: rule.classB })));
}

export function savePcbClassClearance(project, { classA, classB, minimumClearanceMm } = {}) {
  const current = context(project);
  if (current.errors.length) return { status: "blocked", errors: current.errors };
  if (![classA,classB].every(id=>current.classes.some(item=>item.id===id)) || !Number.isFinite(minimumClearanceMm) || minimumClearanceMm < 0) return { status: "blocked", errors: ["Choose two existing classes and a nonnegative millimetre clearance."] };
  const existing = current.rules.find(rule=>pairKey(rule.classA,rule.classB)===pairKey(classA,classB));
  const value = { ...existing?.source, classA: existing?.classA ?? classA, classB: existing?.classB ?? classB, minimumClearanceMm };
  if (Object.hasOwn(value,"clearanceMm")) value.clearanceMm = minimumClearanceMm;
  const rules = current.rules.map(rule=>rule===existing ? value : { ...rule.source, classA: rule.classA, classB: rule.classB });
  if (!existing) rules.push(value);
  return finish(project,current.classes.map(item=>item.source),rules);
}

export function removePcbClassClearance(project, { classA, classB } = {}) {
  const current = context(project);
  if (current.errors.length) return { status: "blocked", errors: current.errors };
  const rules = current.rules.filter(rule=>pairKey(rule.classA,rule.classB)!==pairKey(classA,classB));
  if (rules.length===current.rules.length) return { status: "unchanged", project };
  return finish(project,current.classes.map(item=>item.source),rules.map(rule=>({ ...rule.source, classA: rule.classA, classB: rule.classB })));
}
