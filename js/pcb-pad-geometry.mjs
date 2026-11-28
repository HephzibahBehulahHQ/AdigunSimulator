const finitePositive = value => Number.isFinite(value) && value > 0;
const touching = (a, b) =>
  Math.abs(a.dxMm - b.dxMm) <= (a.widthMm + b.widthMm) / 2 + 1e-9 &&
  Math.abs(a.dyMm - b.dyMm) <= (a.heightMm + b.heightMm) / 2 + 1e-9;

export function validCompositePad(pad) {
  const rects = pad?.copperRects;
  if (!Array.isArray(rects) || rects.length < 2 || rects.length > 8 ||
      !rects.every(rect => rect && Number.isFinite(rect.dxMm) && Number.isFinite(rect.dyMm) &&
        finitePositive(rect.widthMm) && finitePositive(rect.heightMm))) return false;
  // The logical routing anchor must be inside copper, and every segment must be joined.
  const joined = new Set(rects.filter(rect => touching(rect, { dxMm: 0, dyMm: 0, widthMm: 0, heightMm: 0 })));
  for (const rect of joined) {
    for (const other of rects) if (touching(rect, other)) joined.add(other);
  }
  return joined.size === rects.length;
}
