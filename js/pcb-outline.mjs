const EPS = 1e-9;
const samePoint = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= EPS;

function pointOnSegment(point, a, b) {
  const cross = (point[0] - a[0]) * (b[1] - a[1]) - (point[1] - a[1]) * (b[0] - a[0]);
  if (Math.abs(cross) > EPS) return false;
  return point[0] >= Math.min(a[0], b[0]) - EPS && point[0] <= Math.max(a[0], b[0]) + EPS &&
    point[1] >= Math.min(a[1], b[1]) - EPS && point[1] <= Math.max(a[1], b[1]) + EPS;
}

function orient(a, b, c) {
  const value = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  return Math.abs(value) <= EPS ? 0 : Math.sign(value);
}

function segmentsIntersect(a, b, c, d) {
  const abC = orient(a, b, c), abD = orient(a, b, d), cdA = orient(c, d, a), cdB = orient(c, d, b);
  if (abC !== abD && cdA !== cdB) return true;
  return (!abC && pointOnSegment(c, a, b)) || (!abD && pointOnSegment(d, a, b)) ||
    (!cdA && pointOnSegment(a, c, d)) || (!cdB && pointOnSegment(b, c, d));
}

function pointSegmentDistance(point, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared ? Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / lengthSquared)) : 0;
  return Math.hypot(point[0] - (a[0] + t * dx), point[1] - (a[1] + t * dy));
}

function segmentDistance(a, b, c, d) {
  if (segmentsIntersect(a, b, c, d)) return 0;
  return Math.min(pointSegmentDistance(a, c, d), pointSegmentDistance(b, c, d), pointSegmentDistance(c, a, b), pointSegmentDistance(d, a, b));
}

function pointInPolygon(point, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[j], b = points[i];
    if (pointOnSegment(point, a, b)) return true;
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

function segmentIntersectsOpenBox(a, b, left, top, right, bottom) {
  const inset = Math.min(EPS * 4, Math.max(0, right - left) / 4, Math.max(0, bottom - top) / 4);
  left += inset; top += inset; right -= inset; bottom -= inset;
  let t0 = 0, t1 = 1;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const [p, q] of [[-dx, a[0] - left], [dx, right - a[0]], [-dy, a[1] - top], [dy, bottom - a[1]]]) {
    if (Math.abs(p) <= EPS) { if (q < 0) return false; continue; }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
    if (t0 > t1) return false;
  }
  if (t1 - t0 <= EPS) return false;
  const t = (t0 + t1) / 2, x = a[0] + dx * t, y = a[1] + dy * t;
  return x > left && x < right && y > top && y < bottom;
}

export function boardOutlineDefinitionErrors(board) {
  const outline = board?.outline;
  if (outline === undefined || outline === "rectangle" || outline === "rectangular UNO R3 shield template") return [];
  if (!outline || typeof outline !== "object" || outline.type !== "polygon") return ["Board outline must be rectangular or a simple polygon."];
  const points = outline.pointsMm;
  if (!Array.isArray(points) || points.length < 3 || points.length > 256 || points.some((point) => !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite))) return ["Polygon outlines need 3–256 finite [x, y] millimetre vertices."];
  if (points.some((point) => point[0] < -EPS || point[1] < -EPS || point[0] > board.widthMm + EPS || point[1] > board.heightMm + EPS)) return ["Polygon outline vertices must stay within the board dimensions."];
  if (points.some((point, index) => samePoint(point, points[(index + 1) % points.length]) || points.some((other, otherIndex) => otherIndex < index && samePoint(point, other)))) return ["Polygon outline vertices must be distinct and non-repeating."];
  const area = points.reduce((sum, point, index) => { const next = points[(index + 1) % points.length]; return sum + point[0] * next[1] - next[0] * point[1]; }, 0) / 2;
  if (Math.abs(area) <= EPS) return ["Polygon outline must enclose a nonzero area."];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    const previous = points[(i + points.length - 1) % points.length];
    const intoPrevious = [previous[0] - a[0], previous[1] - a[1]], intoNext = [b[0] - a[0], b[1] - a[1]];
    if (Math.abs(orient(previous, a, b)) === 0 && intoPrevious[0] * intoNext[0] + intoPrevious[1] * intoNext[1] > EPS) return ["Polygon outline must not double back along an edge."];
    for (let j = i + 1; j < points.length; j++) {
      if (j === i || j === (i + 1) % points.length || (j + 1) % points.length === i) continue;
      if (segmentsIntersect(a, b, points[j], points[(j + 1) % points.length])) return ["Polygon outline edges must not cross or touch non-adjacent edges."];
    }
  }
  const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
  if (Math.abs(Math.min(...xs)) > EPS || Math.abs(Math.min(...ys)) > EPS || Math.abs(Math.max(...xs) - board.widthMm) > EPS || Math.abs(Math.max(...ys) - board.heightMm) > EPS) return ["Polygon outline bounds must match the declared board width and height."];
  return [];
}

export function boardOutlinePoints(board) {
  if (board?.outline?.type === "polygon") return board.outline.pointsMm;
  if (board?.outline !== undefined && !["rectangle", "rectangular UNO R3 shield template"].includes(board.outline)) return [];
  if (!Number.isFinite(board?.widthMm) || !Number.isFinite(board?.heightMm)) return [];
  return [[0, 0], [board.widthMm, 0], [board.widthMm, board.heightMm], [0, board.heightMm]];
}

function polygon(board) {
  return board?.outline?.type === "polygon" && boardOutlineDefinitionErrors(board).length === 0 ? board.outline.pointsMm : null;
}

export function boardOutlineContainsBox(board, x, y, halfWidth, halfHeight) {
  if (![x, y, halfWidth, halfHeight].every(Number.isFinite) || halfWidth < 0 || halfHeight < 0) return false;
  if (board?.outline !== undefined && !["rectangle", "rectangular UNO R3 shield template"].includes(board.outline) && board.outline?.type !== "polygon") return false;
  const points = polygon(board);
  if (!points) return x - halfWidth >= -EPS && y - halfHeight >= -EPS && x + halfWidth <= board?.widthMm + EPS && y + halfHeight <= board?.heightMm + EPS;
  const corners = [[x - halfWidth, y - halfHeight], [x + halfWidth, y - halfHeight], [x + halfWidth, y + halfHeight], [x - halfWidth, y + halfHeight]];
  if (!corners.every((point) => pointInPolygon(point, points))) return false;
  if (halfWidth <= EPS || halfHeight <= EPS) return true;
  const left = x - halfWidth, right = x + halfWidth, top = y - halfHeight, bottom = y + halfHeight;
  return !points.some((a, index) => segmentIntersectsOpenBox(a, points[(index + 1) % points.length], left, top, right, bottom));
}

export function boardOutlineContainsCircle(board, x, y, radius) {
  if (![x, y, radius].every(Number.isFinite) || radius < 0) return false;
  const points = polygon(board);
  if (!points) return boardOutlineContainsBox(board, x, y, radius, radius);
  if (!pointInPolygon([x, y], points)) return false;
  return points.every((a, index) => pointSegmentDistance([x, y], a, points[(index + 1) % points.length]) + EPS >= radius);
}

export function boardOutlineContainsSegment(board, start, end, radius) {
  if (!Array.isArray(start) || !Array.isArray(end) || start.length !== 2 || end.length !== 2 || ![...start, ...end, radius].every(Number.isFinite) || radius < 0) return false;
  const points = polygon(board);
  if (!points) return boardOutlineContainsBox(board, start[0], start[1], radius, radius) && boardOutlineContainsBox(board, end[0], end[1], radius, radius);
  if (!pointInPolygon(start, points) || !pointInPolygon(end, points) || !pointInPolygon([(start[0] + end[0]) / 2, (start[1] + end[1]) / 2], points)) return false;
  return points.every((a, index) => segmentDistance(start, end, a, points[(index + 1) % points.length]) + EPS >= radius);
}
