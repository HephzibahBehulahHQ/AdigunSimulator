import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { findLibraryPart } from '../js/core.mjs';
import { netEdges } from '../js/net-edges.mjs';
import { routeSchematicConnection, schematicObstacle } from '../js/schematic-routing.mjs';

const example = new URL('../examples/101-buck-converter-baseline.adigun.json', import.meta.url);
const partPins = {
  'active.lm2596-adjustable': ['VIN', 'SW', 'GND', 'FB', 'ONOFF'],
  'output.buck-converter-report': ['VOUT', 'GND'],
  'connector.buck-output-2': ['VOUT', 'GND'],
  'ground.signal': ['0']
};
const partFor = id => findLibraryPart(id) ?? (partPins[id] ? { pins: partPins[id] } : null);

test('Example 101 schematic fits its canvas, has no symbol overlaps, and routes every net edge', async () => {
  const project = JSON.parse(await readFile(example, 'utf8'));
  assert.equal(project.components.find(component => component.reference === 'U1')?.value, 'LM2596T-ADJ/NOPB');
  assert.equal(project.components.find(component => component.reference === 'J2')?.value, '5.76 V DC');
  const boxes = project.components.map(component => ({ reference: component.reference, ...schematicObstacle(component) }));

  for (const box of boxes) {
    assert.ok(box.left >= 0 && box.top >= 0, `${box.reference} starts outside the schematic canvas`);
    assert.ok(box.right <= 680 && box.bottom <= 300, `${box.reference} extends outside the schematic canvas`);
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const overlaps = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      assert.equal(overlaps, false, `${a.reference} overlaps ${b.reference}`);
    }
  }

  const previous = [];
  for (const net of project.nets) {
    for (const [first, second] of netEdges(net)) {
      const preference = /^(gnd|ground|0)$/i.test(net.id) ? 'bottom'
        : /^(vcc|vdd|vin|power)$/i.test(net.id) ? 'top' : null;
      const route = routeSchematicConnection(
        project.components, partFor, first, second,
        previous.filter(item => item.netId !== net.id).map(item => item.points.map(([x, y]) => ({ x, y }))),
        preference
      );
      assert.ok(route, `${net.id}: ${first} → ${second} is blocked`);
      previous.push({ netId: net.id, points: route.map(point => [point.x, point.y]) });
    }
  }
});
