import { BREADBOARD_MODEL, breadboardConnectionGroup, breadboardHolePoint, normalizeBreadboardHole } from "./breadboard-topology.mjs";

const esc = value => String(value ?? "").replace(/[&<>\"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[char]);
const positive = value => Number.isFinite(value) && value > 0;
const unusedTerminalHoles = pkg => [
  ...(pkg.noConnectHole ? [pkg.noConnectHole] : []),
  ...(Array.isArray(pkg.noConnectHoles) ? pkg.noConnectHoles : [])
];

export function validateBreadboardAssembly(project, { getPartPins } = {}) {
  const assembly = project?.breadboard?.assembly;
  const errors = [], warnings = [];
  if (!assembly || !Array.isArray(assembly.packages)) {
    return { state: "incomplete", errors, warnings: [{ code: "BREADBOARD_ASSEMBLY_MISSING", message: "No source-backed package and lead-extension plan is stored for the breadboard layout." }], packageCount: 0, pigtailCount: 0 };
  }
  const wire = assembly.wire;
  const wireValid = wire?.manufacturer === "Belden" && wire?.partNumber === "8530" && wire?.gaugeAwg === 22 && wire?.conductorDiameterMm >= BREADBOARD_MODEL.insertionWireDiameterMinMm && wire?.conductorDiameterMm <= BREADBOARD_MODEL.insertionWireDiameterMaxMm && typeof wire?.sourceUrl === "string" && wire.sourceUrl.includes("belden.com");
  if (!wireValid) errors.push({ code: "BREADBOARD_ASSEMBLY_WIRE", message: "Use the recorded source-backed Belden 8530 solid 22 AWG pigtail wire for this BB400 assembly." });
  const parts = new Map((project.components ?? []).map(component => [component.instanceId, component]));
  const virtual = new Set((project.breadboard?.nonPhysicalItems ?? []).map(item => item.instanceId));
  const packages = new Map();
  const origin = breadboardHolePoint("A1"), nextX = breadboardHolePoint("A2"), nextY = breadboardHolePoint("B1");
  const scaleX = (nextX.x - origin.x) / BREADBOARD_MODEL.holePitchMm;
  const scaleY = (nextY.y - origin.y) / BREADBOARD_MODEL.holePitchMm;
  const bodyBounds = [];
  const occupiedGroups = new Set([
    ...Object.values(project.breadboard.pinHoles ?? {}),
    ...(Array.isArray(project.breadboard.jumpers) ? project.breadboard.jumpers : []).flatMap(jumper => [jumper?.from, jumper?.to])
  ].map(hole => breadboardConnectionGroup(hole)));
  let pigtailCount = 0;
  for (const pkg of assembly.packages) {
    const component = parts.get(pkg?.instanceId);
    if (!component || packages.has(pkg.instanceId)) {
      errors.push({ code: "BREADBOARD_ASSEMBLY_INSTANCE", instanceId: pkg?.instanceId, message: "Each assembly package must refer to one unique project component." });
      continue;
    }
    packages.set(pkg.instanceId, pkg);
    const allowedKinds = ["to220", "to92", "external-relay", "external-speaker", "radial-microphone", "axial-diode", "axial-led", "slide-switch", "trimmer", "bridge-rectifier", "radial-inductor", "radial-capacitor", "box-capacitor", "radial-ptc", "radial-ntc", "photoresistor", "pdip", "seven-segment-display", "axial-resistor", "external-axial-resistor", "terminal-header", "through-hole-header", "external-pushbutton", "external-supply"];
    const externalSupply = pkg.kind === "external-supply";
    const externalRelay = pkg.kind === "external-relay";
    const externalSpeaker = pkg.kind === "external-speaker";
    const offBoard = externalSupply || externalRelay || externalSpeaker || pkg.kind === "external-axial-resistor" || pkg.kind === "external-pushbutton";
    if (!allowedKinds.includes(pkg.kind) || (!externalSupply && (!positive(pkg.bodyMm?.width) || !positive(pkg.bodyMm?.height))) || !Array.isArray(pkg.positionPx) || pkg.positionPx.length !== 2 || !pkg.positionPx.every(Number.isFinite)) {
      errors.push({ code: "BREADBOARD_ASSEMBLY_GEOMETRY", instanceId: pkg.instanceId, message: `${component.reference} is missing a supported package shape, dimensions, or canvas position.` });
    }
    if (pkg.kind === "external-axial-resistor" && pkg.mounting !== "off-board") errors.push({ code: "BREADBOARD_ASSEMBLY_MOUNTING", instanceId: pkg.instanceId, message: `${component.reference} is a power load and must be shown as an off-board package on this BB400 assembly.` });
    if (pkg.kind === "external-pushbutton" && pkg.mounting !== "off-board") errors.push({ code: "BREADBOARD_ASSEMBLY_MOUNTING", instanceId: pkg.instanceId, message: `${component.reference} must be identified as an off-board pushbutton when its terminals use pigtails.` });
    if (externalRelay && (pkg.mounting !== "off-board" || pkg.pins?.some(pin => pin.connection !== "pigtail"))) errors.push({ code: "BREADBOARD_ASSEMBLY_MOUNTING", instanceId: pkg.instanceId, message: `${component.reference} requires an off-board mount with insulated coil pigtails.` });
    if (externalSpeaker && (pkg.mounting !== "off-board" || pkg.pins?.some(pin => pin.connection !== "pigtail"))) errors.push({ code: "BREADBOARD_ASSEMBLY_MOUNTING", instanceId: pkg.instanceId, message: `${component.reference} requires off-board mounting and insulated speaker leads.` });
    if (!externalSupply && (!pkg.manufacturer || !pkg.manufacturerPartNumber || !/^https:\/\//.test(pkg.sourceUrl ?? ""))) {
      errors.push({ code: "BREADBOARD_ASSEMBLY_PROVENANCE", instanceId: pkg.instanceId, message: `${component.reference} needs manufacturer identity and a package-dimension source.` });
    }
    const pcbPart = project.pcbFabrication?.parts?.find(part => part.instanceId === pkg.instanceId);
    if (!externalSupply && pcbPart && (pkg.manufacturer !== pcbPart.manufacturer || pkg.manufacturerPartNumber !== pcbPart.manufacturerPartNumber || pkg.sourceUrl !== pcbPart.sourceUrl)) {
      errors.push({ code: "BREADBOARD_ASSEMBLY_IDENTITY", instanceId: pkg.instanceId, message: `${component.reference} breadboard package identity must match its source-backed PCB part record.` });
    }
    if (!externalSupply && positive(pkg.bodyMm?.width) && positive(pkg.bodyMm?.height) && Array.isArray(pkg.positionPx) && pkg.positionPx.length === 2) {
      const displayScale = assemblyPackageDisplayScale(pkg);
      const bounds = { instanceId: pkg.instanceId, left: pkg.positionPx[0] - pkg.bodyMm.width * scaleX * displayScale / 2, right: pkg.positionPx[0] + pkg.bodyMm.width * scaleX * displayScale / 2, top: pkg.positionPx[1] - pkg.bodyMm.height * scaleY * displayScale / 2, bottom: pkg.positionPx[1] + pkg.bodyMm.height * scaleY * displayScale / 2 };
      if (offBoard ? bounds.left < 0 || bounds.right > 680 || bounds.top < 0 || bounds.bottom > 300 : bounds.left < 34 || bounds.right > 646 || bounds.top < 38 || bounds.bottom > 262) errors.push({ code: offBoard ? "BREADBOARD_ASSEMBLY_SCENE_FIT" : "BREADBOARD_ASSEMBLY_BOARD_FIT", instanceId: pkg.instanceId, message: offBoard ? `${component.reference} off-board package extends beyond the printed breadboard scene.` : `${component.reference} package body extends beyond the BB400 board area.` });
      for (const other of bodyBounds) if (bounds.left < other.right + 2 && bounds.right > other.left - 2 && bounds.top < other.bottom + 2 && bounds.bottom > other.top - 2) errors.push({ code: "BREADBOARD_ASSEMBLY_OVERLAP", instanceId: pkg.instanceId, otherInstanceId: other.instanceId, message: `${component.reference} package body overlaps ${parts.get(other.instanceId)?.reference ?? other.instanceId}.` });
      bodyBounds.push(bounds);
    }
    const expectedPins = getPartPins?.(component.libraryId) ?? [];
    for (const hole of unusedTerminalHoles(pkg)) {
      const group = breadboardConnectionGroup(hole);
      if (!group || occupiedGroups.has(group)) {
        errors.push({ code: "BREADBOARD_ASSEMBLY_NO_CONNECT", instanceId: pkg.instanceId, message: `${component.reference} requires an isolated strip for its unused terminal at ${hole}.` });
      }
      occupiedGroups.add(group);
    }
    const pins = Array.isArray(pkg.pins) ? pkg.pins : [];
    const byName = new Map(pins.map(pin => [pin.pin, pin]));
    if (byName.size !== expectedPins.length || expectedPins.some(pin => !byName.has(pin))) {
      errors.push({ code: "BREADBOARD_ASSEMBLY_PIN_MAP", instanceId: pkg.instanceId, message: `${component.reference} package terminals do not cover its exact library pin list.` });
      continue;
    }
    for (const item of pins) {
      const endpoint = `${pkg.instanceId}:${item.pin}`;
      const hole = normalizeBreadboardHole(project.breadboard?.pinHoles?.[endpoint]);
      if (!hole || normalizeBreadboardHole(item.hole) !== hole || !Array.isArray(item.offsetMm) || item.offsetMm.length !== 2 || !item.offsetMm.every(Number.isFinite)) {
        errors.push({ code: "BREADBOARD_ASSEMBLY_TERMINAL", endpoint, message: `${component.reference}.${item.pin} must have a real BB400 hole and a source-backed terminal location.` });
        continue;
      }
      if (item.connection === "pigtail") {
        pigtailCount++;
        if (!wireValid || wire.gaugeAwg < 21 || wire.gaugeAwg > 26) errors.push({ code: "BREADBOARD_ASSEMBLY_PIGTAIL_FIT", endpoint, message: "The pigtail conductor gauge is outside the BB400 21–26 AWG insertion range." });
      } else if (item.connection === "direct") {
        if (!positive(item.leadDiameterMm) || item.leadDiameterMm < BREADBOARD_MODEL.insertionWireDiameterMinMm || item.leadDiameterMm > BREADBOARD_MODEL.insertionWireDiameterMaxMm) {
          errors.push({ code: "BREADBOARD_ASSEMBLY_DIRECT_FIT", endpoint, message: `${component.reference}.${item.pin} lead diameter is outside the BB400 direct-contact range.` });
        }
        const point = breadboardHolePoint(hole);
        const terminal = { x: pkg.positionPx[0] + item.offsetMm[0] * scaleX, y: pkg.positionPx[1] + item.offsetMm[1] * scaleY };
        if (Math.hypot(point.x - terminal.x, point.y - terminal.y) > 1) errors.push({ code: "BREADBOARD_ASSEMBLY_DIRECT_POSITION", endpoint, message: `${component.reference}.${item.pin} direct lead does not align with its assigned BB400 hole.` });
      } else errors.push({ code: "BREADBOARD_ASSEMBLY_CONNECTION", endpoint, message: "Each package pin must declare direct insertion or a sourced pigtail connection." });
    }
  }
  for (const component of project.components ?? []) {
    if (!virtual.has(component.instanceId) && !packages.has(component.instanceId)) errors.push({ code: "BREADBOARD_ASSEMBLY_PACKAGE_MISSING", instanceId: component.instanceId, message: `${component.reference} has no source-backed breadboard assembly package.` });
  }
  const state = errors.length ? "blocked" : warnings.length ? "incomplete" : "complete";
  return { state, errors, warnings, packageCount: packages.size, pigtailCount };
}

function packageBody(pkg, scaleX, scaleY) {
  if (pkg.kind === "external-supply") return `<text class="breadboard-external-supply-label" x="0" y="9">off-board supply leads</text>`;
  const width = pkg.bodyMm.width * scaleX, height = pkg.bodyMm.height * scaleY;
  if (pkg.kind === "external-pushbutton") return `<rect class="breadboard-pushbutton-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="${Math.min(width,height) * .2}"/><circle class="breadboard-pushbutton-cap" cx="0" cy="0" r="${Math.min(width,height) * .28}"/>`;
  if (pkg.kind === "slide-switch") return `<rect class="breadboard-switch-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="${Math.min(width,height) * .16}"/><path class="breadboard-switch-track" d="M${-width * .2} 0 H${width * .2}"/><rect class="breadboard-switch-cap" x="${-width * .04}" y="${-height * .24}" width="${width * .18}" height="${height * .48}" rx="2"/>`;
  if (pkg.kind === "axial-led") return `<ellipse class="breadboard-led-body" cx="0" cy="0" rx="${width / 2}" ry="${height / 2}"/><path class="breadboard-led-cathode" d="M${width * .28} ${-height / 2} V${height / 2}"/>`;
  if (pkg.kind === "radial-capacitor") return `<ellipse class="capacitor-body" cx="0" cy="0" rx="${width / 2}" ry="${height / 2}"/><path class="capacitor-top" d="M${-width * .32} 0 H${width * .32}"/>`;
  if (pkg.kind === "radial-microphone") return `<ellipse class="breadboard-bridge-body" cx="0" cy="0" rx="${width / 2}" ry="${height / 2}"/><ellipse class="breadboard-to220-hole" cx="0" cy="0" rx="${width * .31}" ry="${height * .31}"/>`;
  if (pkg.kind === "box-capacitor") return `<rect class="capacitor-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="1"/>`;
  if (pkg.kind === "trimmer") return `<rect class="capacitor-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="1"/><circle class="breadboard-terminal-screw" cx="0" cy="0" r="${height * .22}"/><path class="capacitor-top" d="M${-height * .16} 0 H${height * .16}"/>`;
  if (pkg.kind === "radial-ptc") return `<rect class="breadboard-ptc-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="${Math.min(width,height) * .28}"/><path class="breadboard-ptc-seam" d="M${-width * .26} ${-height * .34} H${width * .26}"/>`;
  if (pkg.kind === "radial-ntc" || pkg.kind === "photoresistor") return `<ellipse class="breadboard-ptc-body" cx="0" cy="0" rx="${width / 2}" ry="${height / 2}"/>`;
  if (pkg.kind === "pdip") return `<rect class="breadboard-bridge-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="2"/><path class="breadboard-ptc-seam" d="M${-width / 2} ${-height * .16} a${height * .16} ${height * .16} 0 0 1 0 ${height * .32}"/>`;
  if (pkg.kind === "seven-segment-display") {
    const segmentX = width * .24, segmentY = height * .34, gap = height * .04;
    const horizontals = [-segmentY, 0, segmentY].map(y => `M${-segmentX + gap} ${y}H${segmentX - gap}`);
    const verticals = [-segmentX, segmentX].flatMap(x => [`M${x} ${-segmentY + gap}V${-gap}`, `M${x} ${gap}V${segmentY - gap}`]);
    return `<rect class="breadboard-bridge-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="2"/><path d="${[...horizontals, ...verticals].join(" ")}" fill="none" stroke="#92969b" stroke-width="${gap}" stroke-linecap="round"/><circle cx="${width * .35}" cy="${segmentY}" r="${gap / 2}" fill="#92969b"/>`;
  }
  if (pkg.kind === "to92") return `<path class="breadboard-bridge-body" d="M${-width / 2} ${height / 2} V0 Q${-width / 2} ${-height / 2} 0 ${-height / 2} T${width / 2} 0 V${height / 2} Z"/>`;
  if (pkg.kind === "external-relay") return `<rect class="breadboard-bridge-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="2"/>`;
  if (pkg.kind === "external-speaker") return `<rect class="breadboard-bridge-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="4"/><ellipse class="breadboard-to220-hole" cx="0" cy="0" rx="${width * .38}" ry="${height * .38}"/><text class="breadboard-external-supply-label" x="0" y="4">off-board speaker</text>`;
  if (pkg.kind === "radial-inductor") return `<rect class="breadboard-inductor-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="${Math.min(width, height) * .38}"/><path class="breadboard-inductor-seam" d="M${-width * .32} ${-height / 2} V${height / 2} M${width * .32} ${-height / 2} V${height / 2}"/>`;
  if (pkg.kind === "axial-diode") return `<rect class="axial-diode-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="${height / 2}"/><path class="diode-cathode-band" d="M${width * .22} ${-height / 2} V${height / 2}"/>`;
  if (pkg.kind === "bridge-rectifier") return `<rect class="breadboard-bridge-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="2"/><text class="breadboard-bridge-mark" x="${-width * .29}" y="${-height * .12}">+</text><text class="breadboard-bridge-mark" x="${width * .29}" y="${-height * .12}">~</text><text class="breadboard-bridge-mark" x="${-width * .29}" y="${height * .39}">~</text><text class="breadboard-bridge-mark" x="${width * .29}" y="${height * .39}">−</text>`;
  if (pkg.kind === "axial-resistor") return `<rect class="resistor-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="${height * .42}"/><path class="resistor-band" d="M${-width * .23} ${-height / 2} V${height / 2} M0 ${-height / 2} V${height / 2} M${width * .23} ${-height / 2} V${height / 2}"/>`;
  if (pkg.kind === "external-axial-resistor") return `<rect class="resistor-body breadboard-external-load-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="${height * .34}"/><path class="resistor-band" d="M${-width * .25} ${-height / 2} V${height / 2} M${-width * .08} ${-height / 2} V${height / 2} M${width * .08} ${-height / 2} V${height / 2} M${width * .25} ${-height / 2} V${height / 2}"/>`;
  if (pkg.kind === "to220") return `<rect class="breadboard-to220-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="2"/><circle class="breadboard-to220-hole" cx="0" cy="${-height * .27}" r="${Math.max(1.8, height * .12)}"/>`;
  if (pkg.kind === "terminal-header") return `<rect class="breadboard-terminal-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="2"/><circle class="breadboard-terminal-screw" cx="${-width * .22}" cy="${-height * .18}" r="${Math.max(1.5, height * .12)}"/><circle class="breadboard-terminal-screw" cx="${width * .22}" cy="${-height * .18}" r="${Math.max(1.5, height * .12)}"/>`;
  if (pkg.kind === "through-hole-header") return `<rect class="breadboard-header-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="1"/><path class="breadboard-header-divider" d="M${-width / 2 + width / 2} ${-height / 2} V${height / 2}"/>`;
  return `<rect class="breadboard-external-body" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="3"/>`;
}

// Show the off-board speaker at reduced scale so the icon leaves the board accessible.
function assemblyPackageDisplayScale(pkg) {
  return pkg.kind === "external-speaker" ? 0.35 : 1;
}

export function renderBreadboardAssemblySvg(project) {
  const assembly = project?.breadboard?.assembly;
  if (!Array.isArray(assembly?.packages)) return "";
  const componentById = new Map((project.components ?? []).map(component => [component.instanceId, component]));
  const netByEndpoint = new Map();
  for (const net of project.nets ?? []) for (const endpoint of net.endpoints ?? []) netByEndpoint.set(endpoint, net.id);
  const origin = breadboardHolePoint("A1"), nextX = breadboardHolePoint("A2"), nextY = breadboardHolePoint("B1");
  const scaleX = (nextX.x - origin.x) / BREADBOARD_MODEL.holePitchMm;
  const scaleY = (nextY.y - origin.y) / BREADBOARD_MODEL.holePitchMm;
  const paths = [], bodies = [];
  for (const pkg of assembly.packages) {
    const component = componentById.get(pkg.instanceId);
    if (!component || !Array.isArray(pkg.positionPx) || !Array.isArray(pkg.pins)) continue;
    const displayScale = assemblyPackageDisplayScale(pkg), packageScaleX = scaleX * displayScale, packageScaleY = scaleY * displayScale;
    const [cx, cy] = pkg.positionPx, h = (pkg.bodyMm?.height ?? 0) * packageScaleY;
    const label = esc(`${pkg.reference} · ${pkg.manufacturerPartNumber ?? "external bench supply"}`);
    const dimensions = pkg.bodyMm ? ` · ${Number(pkg.bodyMm.width).toFixed(2)} × ${Number(pkg.bodyMm.height).toFixed(2)} mm` : " · off-board source";
    bodies.push(`<g class="breadboard-package breadboard-assembly-package ${pkg.kind}" data-instance-id="${esc(pkg.instanceId)}" data-library-id="${esc(component.libraryId)}" role="group" aria-label="${label}"><title>${label}${dimensions}${pkg.sourceUrl ? ` · ${esc(pkg.sourceUrl)}` : ""}</title><g transform="translate(${cx} ${cy})">${packageBody(pkg, packageScaleX, packageScaleY)}<text class="breadboard-assembly-reference" x="0" y="${-h / 2 - 3}">${esc(pkg.reference)}</text></g></g>`);
    for (const hole of unusedTerminalHoles(pkg)) {
      const point = breadboardHolePoint(hole);
      if (point) bodies.push(`<circle class="breadboard-terminal-screw" cx="${point.x}" cy="${point.y}" r="2.5"><title>${esc(pkg.reference)} unused terminal at ${esc(hole)}</title></circle>`);
    }
    for (const pin of pkg.pins) {
      const endpoint = `${pkg.instanceId}:${pin.pin}`;
      const hole = normalizeBreadboardHole(project.breadboard?.pinHoles?.[endpoint]);
      if (!hole || !Array.isArray(pin.offsetMm)) continue;
      const start = { x: cx + pin.offsetMm[0] * packageScaleX, y: cy + pin.offsetMm[1] * packageScaleY };
      const end = breadboardHolePoint(hole);
      const net = netByEndpoint.get(endpoint);
      const lift = Math.max(12, Math.min(34, Math.abs(end.x - start.x) * .07));
      const title = pin.connection === "pigtail" ? `Belden 8530 22 AWG pigtail · ${component.reference}.${pin.pin} to ${hole}` : `${component.reference}.${pin.pin} direct lead to ${hole}`;
      paths.push(`<path class="breadboard-assembly-lead ${net && /^(gnd|ground|0)$/i.test(net) ? "net-ground" : net === "VIN" ? "net-power" : "net-signal"}" d="M${start.x} ${start.y} C${start.x} ${start.y - lift}, ${end.x} ${end.y - lift}, ${end.x} ${end.y}" data-endpoint="${esc(endpoint)}" data-hole="${esc(hole)}"><title>${esc(title)}</title></path>`);
    }
  }
  return `<g class="breadboard-assembly-leads">${paths.join("")}</g><g class="breadboard-assembly-bodies">${bodies.join("")}</g>`;
}
