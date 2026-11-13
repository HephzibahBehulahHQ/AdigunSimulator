const xml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
})[char]);

export function renderPartSymbol(record) {
  const entries = Object.entries(record.symbolPinMap).sort(([a], [b]) => Number(a) - Number(b));
  const split = Math.ceil(entries.length / 2);
  const left = entries.slice(0, split);
  const right = entries.slice(split).reverse();
  const rows = Math.max(left.length, right.length);
  const height = Math.max(180, rows * 30 + 96);
  const bodyTop = 48;
  const bodyBottom = height - 42;
  const rowY = (index) => bodyTop + 24 + index * 30;
  const pin = (entry, side, index) => {
    const [number, name] = entry;
    const y = rowY(index);
    const isLeft = side === "left";
    const x1 = isLeft ? 18 : 282;
    const x2 = isLeft ? 84 : 348;
    const labelX = isLeft ? 22 : 344;
    const anchor = isLeft ? "start" : "end";
    const numberX = isLeft ? 78 : 288;
    return `<g data-pin="${xml(number)}" data-electrical-type="${xml(record.pinElectricalTypes?.[number] ?? "passive")}"><path d="M${x1} ${y}H${x2}"/><text x="${labelX}" y="${y - 3}" text-anchor="${anchor}" data-pin-label-for="${xml(number)}">${xml(name)}</text><text x="${numberX}" y="${y + 11}" text-anchor="${isLeft ? "end" : "start"}" class="pin-number">${xml(number)}</text></g>`;
  };
  const pins = [...left.map((entry, index) => pin(entry, "left", index)), ...right.map((entry, index) => pin(entry, "right", index))].join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 366 ${height}" role="img" aria-labelledby="title description" data-license="CC0-1.0">\n<title id="title">${xml(record.manufacturerPartNumber)} pin-map symbol</title>\n<desc id="description">Generic connection-block schematic symbol. Pin labels and numbers are transcribed from the linked manufacturer evidence; this drawing is original and does not imply a device simulation model.</desc>\n<style>text{font:12px Arial,sans-serif;fill:#111}path{stroke:#111;stroke-width:2;fill:none}.body{fill:#fff;stroke:#111;stroke-width:2}.heading{font-weight:bold;font-size:14px}.sub{font-size:11px}.pin-number{font-size:10px}</style>\n${pins}\n<rect class="body" x="88" y="${bodyTop}" width="190" height="${bodyBottom - bodyTop}" rx="3"/>\n<text class="heading" x="183" y="${bodyTop + 28}" text-anchor="middle">${xml(record.manufacturerPartNumber)}</text>\n<text class="sub" x="183" y="${bodyTop + 46}" text-anchor="middle">${xml(record.type)}</text>\n<text class="sub" x="183" y="${bodyTop + 62}" text-anchor="middle">${xml(record.packageEvidence.package)}</text>\n</svg>\n`;
}
