import assert from 'node:assert/strict';
import test from 'node:test';
import { printSceneExtent } from '../js/editor-menu-tools.mjs';

test('print extent includes schematic placements beyond the 680 by 300 canvas', () => {
  const scene = {
    querySelectorAll() {
      return [
        { offsetLeft: 938, offsetTop: 322, offsetWidth: 92, offsetHeight: 72 },
        { offsetLeft: 702, offsetTop: 381, offsetWidth: 56, offsetHeight: 71 }
      ];
    }
  };
  assert.deepEqual(printSceneExtent(scene), { width: 1030, height: 452 });
});

test('print extent keeps compact views at their native design size', () => {
  const scene = { querySelectorAll: () => [{ offsetLeft: 200, offsetTop: 100, offsetWidth: 56, offsetHeight: 58 }] };
  assert.deepEqual(printSceneExtent(scene), { width: 680, height: 300 });
});
