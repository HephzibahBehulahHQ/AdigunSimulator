import { schematicGeometry, schematicPinPoint } from "./schematic-pin-layout.mjs";

export function schematicObstacle(component) {
  const { width, height, rotation } = schematicGeometry(component), [x, y] = component.position.schematic;
  const angle = rotation * Math.PI / 180;
  const w = Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
  const h = Math.abs(height * Math.cos(angle)) + Math.abs(width * Math.sin(angle));
  return { id: component.instanceId, left: x + width / 2 - w / 2 - 8, right: x + width / 2 + w / 2 + 8, top: y + height / 2 - h / 2 - 19, bottom: y + height / 2 + h / 2 + 24 };
}
export function segmentClearsBoxes(a, b, boxes) {
  const epsilon = .001;
  return boxes.every(box => a.x === b.x
    ? !(a.x > box.left + epsilon && a.x < box.right - epsilon && Math.max(a.y, b.y) > box.top + epsilon && Math.min(a.y, b.y) < box.bottom - epsilon)
    : a.y === b.y && !(a.y > box.top + epsilon && a.y < box.bottom - epsilon && Math.max(a.x, b.x) > box.left + epsilon && Math.min(a.x, b.x) < box.right - epsilon));
}
const clean = value => Math.round(value * 1000) / 1000;
const pointKey = point => `${point.x},${point.y}`;
function escapePort(point, box, clearance = 8) {
  const side = point.side ?? "left";
  return { x: clean(side === "left" ? box.left - clearance : side === "right" ? box.right + clearance : point.x), y: clean(side === "top" ? box.top - clearance : side === "bottom" ? box.bottom + clearance : point.y) };
}
function compact(points) {
  const result = [];
  for (const point of points) {
    if (result.length && pointKey(result.at(-1)) === pointKey(point)) continue;
    if (result.length >= 2) {
      const a = result.at(-2), b = result.at(-1);
      if ((a.x === b.x && b.x === point.x) || (a.y === b.y && b.y === point.y)) result.pop();
    }
    result.push(point);
  }
  return result;
}
/** Orthogonal visibility routing around symbol AND label bounds. No invented electrical connection on failure. */
export function routeSchematicConnection(components, partFor, first, second, previous = [], preference = null) {
  const byId = new Map(components.map(component => [component.instanceId, component]));
  const endpoint = text => {
    const [id, ...pin] = text.split(":"), component = byId.get(id);
    if (!component) return null;
    const point = schematicPinPoint(component, partFor(component.libraryId)?.pins ?? [], pin.join(":"));
    return point ? { ...point, x: clean(point.x), y: clean(point.y), id } : null;
  };
  const a = endpoint(first), b = endpoint(second);
  if (!a || !b) return null;
  const boxes = components.map(schematicObstacle), boxA = boxes.find(box => box.id === a.id), boxB = boxes.find(box => box.id === b.id);
  const start = [8, 0].map(clearance => escapePort(a, boxA, clearance)).find(point => segmentClearsBoxes(a, point, boxes.filter(box => box.id !== a.id)));
  const end = [8, 0].map(clearance => escapePort(b, boxB, clearance)).find(point => segmentClearsBoxes(point, b, boxes.filter(box => box.id !== b.id)));
  if (!start || !end) return null;
  const xs = [...new Set([start.x, end.x, 8, 672, ...boxes.flatMap(box => [box.left - 8, box.right + 8, box.left - 16, box.right + 16])].map(clean))].sort((a,b)=>a-b);
  const ys = [...new Set([start.y, end.y, 8, 292, ...boxes.flatMap(box => [box.top - 8, box.bottom + 8, box.top - 16, box.bottom + 16])].map(clean))].sort((a,b)=>a-b);
  const startKey = `${xs.indexOf(start.x)}:${ys.indexOf(start.y)}:start`, open = [{ x: xs.indexOf(start.x), y: ys.indexOf(start.y), direction: "start", cost: 0, key: startKey }];
  const costs = new Map([[startKey, 0]]), parents = new Map(), points = new Map([[startKey,start]]);
  const heuristic = point => Math.abs(point.x-end.x)+Math.abs(point.y-end.y);
  let finalKey;
  let visited = 0;
  while (open.length && visited++ < 50000) {
    open.sort((a,b)=>a.score-b.score);
    const current = open.shift(), point = {x:xs[current.x],y:ys[current.y]};
    if (current.cost !== costs.get(current.key)) continue;
    if (point.x === end.x && point.y === end.y) { finalKey=current.key; break; }
    for (const [dx,dy,direction] of [[1,0,"h"],[-1,0,"h"],[0,1,"v"],[0,-1,"v"]]) {
      const x=current.x+dx,y=current.y+dy;
      if (x<0 || y<0 || x>=xs.length || y>=ys.length) continue;
      const next={x:xs[x],y:ys[y]};
      if (!segmentClearsBoxes(point,next,boxes)) continue;
      const overlap = previous.some(route => route.some((p,i)=>i && ((p.x===route[i-1].x && point.x===next.x && p.x===point.x && Math.min(p.y,route[i-1].y)<Math.max(point.y,next.y) && Math.max(p.y,route[i-1].y)>Math.min(point.y,next.y)) || (i && p.y===route[i-1].y && point.y===next.y && p.y===point.y && Math.min(p.x,route[i-1].x)<Math.max(point.x,next.x) && Math.max(p.x,route[i-1].x)>Math.min(point.x,next.x)))));
      const wrongSide = direction === "h" && ((preference === "bottom" && next.y < Math.max(a.y,b.y)) || (preference === "top" && next.y > Math.min(a.y,b.y)));
      const cost=current.cost+Math.abs(next.x-point.x)+Math.abs(next.y-point.y)+(current.direction!=="start" && direction!==current.direction?18:0)+(overlap?120:0)+(wrongSide?90:0);
      const key=`${x}:${y}:${direction}`;
      if (cost >= (costs.get(key)??Infinity)) continue;
      costs.set(key,cost); parents.set(key,current.key); points.set(key,next); open.push({x,y,direction,cost,key,score:cost+heuristic(next)});
    }
  }
  if (!finalKey) return null;
  const route=[];
  for (let key=finalKey;key;key=parents.get(key)) route.unshift(points.get(key));
  return compact([{x:a.x,y:a.y},...route,{x:b.x,y:b.y}]);
}
export const schematicRoutePath = points => points.map((point,index)=>`${index?"L":"M"}${clean(point.x)} ${clean(point.y)}`).join(" ");
